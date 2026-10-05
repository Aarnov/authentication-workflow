import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize the Google Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL as string // Must match Google Cloud Console exactly
);

// Step 1: Send the Google Login URL to the frontend
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile', 
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  res.json({ url });
};

// Step 2: Handle the redirect from Google
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Authorization code missing' });
    return;
  }

  try {
    // Exchange the code for tokens
    const { tokens } = await client.getToken(code);
    
    // Verify the ID token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google payload');
    }

    const { email, sub: googleId, name } = payload;

    // Find or create the user in our database
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // New user from Google
      user = await prisma.user.create({
        data: { email, name, googleId },
      });
    } else if (!user.googleId) {
      // Existing user (registered with password), linking Google account
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    // Generate our system's JWT
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

    // Set the HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect the user back to the React dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};