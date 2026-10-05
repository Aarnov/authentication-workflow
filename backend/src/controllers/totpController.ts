import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const generateTotpSecret = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; 
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { totpCredential: true }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.totpCredential && user.totpCredential.verified) {
      res.status(400).json({ error: 'Authenticator is already enabled for this account.' });
      return;
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Auth Playground',
      label: user.email,
      secret
    });
    
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    await prisma.totpCredential.upsert({
      where: { userId },
      update: { secret, verified: false },
      create: { userId, secret, verified: false }
    });

    res.json({ qrCodeUrl, secret });
  } catch (error) {
    console.error('TOTP Generate Error:', error);
    res.status(500).json({ error: 'Failed to generate authenticator configuration' });
  }
};

export const verifyAndEnableTotp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { code } = req.body;

    const credential = await prisma.totpCredential.findUnique({ where: { userId } });
    
    if (!credential) {
      res.status(400).json({ error: 'TOTP setup not initialized' });
      return;
    }

    const result = await verify({ token: code, secret: credential.secret });
    
    if (!result.valid) {
      res.status(400).json({ error: 'Invalid authenticator code. Try again.' });
      return;
    }

    await prisma.totpCredential.update({
      where: { userId },
      data: { verified: true }
    });

    res.json({ message: 'Authenticator App successfully linked and enabled' });
  } catch (error) {
    console.error('TOTP Verify Error:', error);
    res.status(500).json({ error: 'Failed to enable authenticator' });
  }
};

export const disableTotp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    await prisma.totpCredential.delete({
      where: { userId },
    });

    res.status(200).json({ message: 'Authenticator session terminated successfully.' });
  } catch (error) {
    console.error('Disable TOTP Error:', error);
    res.status(500).json({ error: 'Failed to terminate authenticator' });
  }
};

export const loginWithTotp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and authorization code are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { totpCredential: true }
    });

    if (!user || !user.totpCredential || !user.totpCredential.verified) {
      res.status(400).json({ error: 'Authenticator App is not enabled for this identifier' });
      return;
    }

    const result = await verify({ token: code, secret: user.totpCredential.secret });
    
    if (!result.valid) {
      res.status(400).json({ error: 'Invalid authorization key' });
      return;
    }

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
    console.error('TOTP Login Error:', error);
    res.status(500).json({ error: 'Authentication protocol failed' });
  }
};