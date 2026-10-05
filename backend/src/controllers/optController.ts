import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configure Nodemailer transporter. 
// For local development, Mailtrap.io or an App Password for Gmail is highly recommended.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    // Find existing user or create a new passwordless user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Generate a cryptographically secure 6-digit code
    const plainOtp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP (treat it just like a password)
    const hashedOtp = await argon2.hash(plainOtp);

    // Set expiration window (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert ensures any old/expired OTP for this user is overwritten
    await prisma.otp.upsert({
      where: { userId: user.id },
      update: { code: hashedOtp, expiresAt },
      create: { userId: user.id, code: hashedOtp, expiresAt },
    });

    // Send the plaintext code via email
await transporter.sendMail({
      from: `"System Auth" <${process.env.SMTP_USER}>`, // <--- Updated to match Gmail
      to: email,
      subject: 'System Authentication Protocol',
      text: `Your requested authorization key is: ${plainOtp}\n\nThis key will expire in 10 minutes.`,
    });

    res.json({ message: 'Authorization key transmitted' });
  } catch (error) {
    console.error('OTP Request Error:', error);
    res.status(500).json({ error: 'Failed to initialize OTP sequence' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ error: 'Email and authorization key are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otp: true },
    });

    if (!user || !user.otp) {
      res.status(400).json({ error: 'No active OTP session found for this identifier' });
      return;
    }

    // Check temporal validity
    if (user.otp.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { userId: user.id } });
      res.status(400).json({ error: 'Authorization key has expired' });
      return;
    }

    // Verify cryptographic hash
    const isValid = await argon2.verify(user.otp.code, code);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid authorization key' });
      return;
    }

    // Code is valid - destroy it to prevent replay attacks
    await prisma.otp.delete({ where: { userId: user.id } });

    // Issue JWT Session Cookie
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ error: 'Authentication protocol failed' });
  }
};