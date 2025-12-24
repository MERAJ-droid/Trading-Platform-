import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/database';
import { RegisterSchema, LoginSchema } from '@repo/shared';
import { encrypt } from '../utils/encryption';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    // Encrypt Binance keys
    const binanceApiKeyEnc = encrypt(data.binanceApiKey);
    const binanceSecretEnc = encrypt(data.binanceSecretKey);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        binanceApiKeyEnc,
        binanceSecretEnc,
      },
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const data = LoginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message || 'Login failed' });
  }
});
