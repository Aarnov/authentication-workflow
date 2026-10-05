import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { globalLimiter } from './middleware/rateLimiter'; // <-- Import global limiter

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for rate limiting if hosted on Render, Vercel, Nginx, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Apply global rate limiter to all incoming requests
app.use(globalLimiter); 

// Mount Routes
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});