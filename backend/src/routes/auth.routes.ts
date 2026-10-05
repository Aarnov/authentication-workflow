import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { getGoogleAuthUrl, googleCallback } from '../controllers/googleAuthController';
import { requestOtp, verifyOtp } from '../controllers/optController';
import { generateTotpSecret, verifyAndEnableTotp, loginWithTotp } from '../controllers/totpController';
import { requestPasswordReset, resetPassword, changePassword } from '../controllers/passwordController';
import { authLimiter, emailLimiter } from '../middleware/rateLimiter'; // <-- Import strict limiters
import { verifyEmail } from '../controllers/auth.controller';
import { disableTotp } from '../controllers/totpController';

const router = Router();

// Standard Auth
router.post('/register', authLimiter, register); // <-- Prevent mass account creation
router.post('/login', authLimiter, login); // <-- Prevent brute force password guessing
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

// Google OAuth routes (Relies on the global limiter in index.ts)
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);

// OTP routes
router.post('/otp/request', emailLimiter, requestOtp); // <-- Prevent email spamming
router.post('/otp/verify', authLimiter, verifyOtp); // <-- Prevent OTP code guessing

// TOTP routes
router.post('/totp/login', authLimiter, loginWithTotp); // <-- Prevent TOTP code guessing
router.post('/totp/generate', requireAuth, generateTotpSecret);
router.post('/totp/verify-setup', requireAuth, verifyAndEnableTotp);

// Password routes
router.post('/password/forgot', emailLimiter, requestPasswordReset); // <-- Prevent email spamming
router.post('/password/reset', authLimiter, resetPassword); // <-- Prevent reset token guessing
router.post('/password/change', requireAuth, changePassword);


router.post('/verify-email', verifyEmail);
router.post('/totp/disable', requireAuth, disableTotp);

export default router;