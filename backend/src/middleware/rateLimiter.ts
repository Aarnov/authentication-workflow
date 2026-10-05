import rateLimit from 'express-rate-limit';

// 1. Global API Limiter (Standard traffic)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Auth Limiter (Protects against brute-forcing passwords & TOTP/OTP codes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed/successful login attempts per 15 minutes
  message: { error: 'Too many authentication attempts. System locked for 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Email Spam Limiter (Protects your SMTP server from being abused)
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 emails sent per hour per IP
  message: { error: 'Too many email requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});