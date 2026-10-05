import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Use the same transport configuration we set up for OTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// PUBLIC ROUTES (Forgot Password)
// ==========================================

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      res.json({ message: 'If an account exists, a reset link has been transmitted.' });
      return;
    }

    // Generate a secure 32-byte token and hash it for storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await argon2.hash(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute validity

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token: hashedToken, expiresAt },
      create: { userId: user.id, token: hashedToken, expiresAt },
    });

    // Build the frontend URL with the raw token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"System Auth" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'System Password Reset Request',
      text: `A password reset was requested for your identifier. Access this secure link to initialize a new password:\n\n${resetLink}\n\nThis link expires in 15 minutes.`,
    });

    res.json({ message: 'If an account exists, a reset link has been transmitted.' });
  } catch (error) {
    console.error('Password Reset Request Error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { passwordResetToken: true },
    });

    if (!user || !user.passwordResetToken) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    if (user.passwordResetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { userId: user.id } });
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    // Verify the raw token from the URL against the hash in the DB
    const isValid = await argon2.verify(user.passwordResetToken.token, token);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid reset token' });
      return;
    }

    const hashedPassword = await argon2.hash(newPassword);

    // Run both database updates in a transaction to guarantee atomicity
    await prisma.$transaction([
      prisma.passwordCredential.upsert({
        where: { userId: user.id },
        update: { hashedPassword: hashedPassword },
        create: { userId: user.id, hashedPassword: hashedPassword },
      }),
      prisma.passwordResetToken.delete({ where: { userId: user.id } })
    ]);

    res.json({ message: 'Password has been successfully reinitialized' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ==========================================
// PROTECTED ROUTE (Requires active session)
// ==========================================

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).userId;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new passwords are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passwordCredential: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Edge case: User signed up via Google or Email OTP and has no password yet
    if (!user.passwordCredential) {
      res.status(400).json({ error: 'No password set for this account. Use the forgot password flow if needed.' });
      return;
    }

    const isCurrentValid = await argon2.verify(user.passwordCredential.hashedPassword, currentPassword);
    if (!isCurrentValid) {
      res.status(400).json({ error: 'Current password verification failed' });
      return;
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.passwordCredential.update({
      where: { userId },
      data: { hashedPassword: hashedPassword },
    });

    res.json({ message: 'Password successfully updated' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};