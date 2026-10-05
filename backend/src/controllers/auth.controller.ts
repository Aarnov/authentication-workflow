import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Configure the email transporter (using your existing SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// NEW: Schema for the verification endpoint
const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1, "Verification token is required"),
});

// ==========================================
// CONTROLLERS
// ==========================================

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      include: { emailVerificationToken: true }
    });
    
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Check if they are still within the 5-minute window
      if (existingUser.emailVerificationToken && existingUser.emailVerificationToken.expiresAt > new Date()) {
        return res.status(400).json({ error: 'A verification link was recently sent. Please wait 5 minutes.' });
      }

      // Lazy Cleanup: 5 minutes passed. Delete ghost account to free up the email.
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await argon2.hash(password);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        isEmailVerified: false, // Start as unverified
        passwordCredential: { create: { hashedPassword } },
      },
    });

    // Generate 32-byte secure token and hash it for the DB
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await argon2.hash(rawToken);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry

    await prisma.emailVerificationToken.create({
      data: {
        userId: newUser.id,
        token: hashedToken,
        expiresAt
      }
    });

    // Send the email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"System Auth" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Network Identifier',
      text: `Your registration requires verification. Access this secure link within 5 minutes to activate your account:\n\n${verifyLink}\n\nIf you did not request this, ignore this transmission.`,
    });

    return res.status(201).json({ message: 'Registration initiated. A 5-minute verification link has been sent to your email.' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.flatten().fieldErrors });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// NEW: Verify the token from the email link
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, token } = verifyEmailSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailVerificationToken: true }
    });

    if (!user) return res.status(400).json({ error: 'Invalid verification request' });
    if (user.isEmailVerified) return res.status(200).json({ message: 'Account is already verified. You may log in.' });
    if (!user.emailVerificationToken) return res.status(400).json({ error: 'No verification token found' });

    if (user.emailVerificationToken.expiresAt < new Date()) {
      await prisma.user.delete({ where: { id: user.id } }); // Cleanup expired user
      return res.status(400).json({ error: 'Verification window expired. Your temporary account was purged. Please register again.' });
    }

    const isValid = await argon2.verify(user.emailVerificationToken.token, token);
    if (!isValid) return res.status(400).json({ error: 'Invalid verification signature' });

    // Success: Verify user and delete the temporary token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      }),
      prisma.emailVerificationToken.delete({
        where: { userId: user.id }
      })
    ]);

    // Issue JWT immediately so they are auto-logged in
    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Identity verified. Session initialized.', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.flatten().fieldErrors });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { passwordCredential: true },
    });

    if (!user || !user.passwordCredential) return res.status(401).json({ error: 'Invalid email or password' });

    // NEW GUARDRAIL: Block unverified users
    if (!user.isEmailVerified) return res.status(403).json({ error: 'Account not verified. Check your email for the activation link.' });

    const isPasswordValid = await argon2.verify(user.passwordCredential.hashedPassword, password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.flatten().fieldErrors});
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response): any => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        totpCredential: { select: { verified: true } } // <-- Include this
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};