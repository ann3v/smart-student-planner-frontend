import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { User } from '../models';
import { AUTH, ERRORS } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

const {
  CODE_TTL_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
  MAX_VERIFY_ATTEMPTS,
  MIN_PASSWORD_LENGTH,
  JWT_EXPIRY,
} = AUTH;

const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const buildTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  const transporter = buildTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  await transporter.sendMail({
    from,
    to,
    subject: 'Your verification code',
    text: `Your verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
  });
};

// ==================== REGISTER ====================

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Registration failed' });
      return;
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name: name || null,
      isVerified: false,
      failedLoginAttempts: 0,
      failedVerificationAttempts: 0,
    });

    const code = generateVerificationCode();
    const verificationCodeHash = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    user.verificationCodeHash = verificationCodeHash;
    user.verificationExpiresAt = expires;
    await user.save();

    try {
      await sendVerificationEmail(email, code);
    } catch (mailErr) {
      console.error('Failed to send verification email:', (mailErr as Error).message);
    }

    res.status(201).json({
      message: 'Verification code sent. Please verify to complete registration.',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', (error as Error).message);
    res.status(500).json({ error: ERRORS.GENERIC });
  }
};

// ==================== LOGIN ====================

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });
      return;
    }

    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const minutesRemaining = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 60000
      );
      res.status(429).json({
        error: `Account temporarily locked. Try again in ${minutesRemaining} minute(s).`,
        lockedUntil: user.lockoutUntil,
      });
      return;
    }

    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: { failedLoginAttempts: number; lockoutUntil?: Date } = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
      }

      await user.update(updates);
      res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        error: 'Account not verified. Check your email for the code.',
        requiresVerification: true,
      });
      return;
    }

    await user.update({ failedLoginAttempts: 0, lockoutUntil: null });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error('Login error:', (error as Error).message);
    res.status(500).json({ error: ERRORS.GENERIC });
  }
};

// ==================== VERIFY CODE ====================

const verifyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({ error: 'Invalid verification code format' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Verification failed' });
      return;
    }

    if (user.lockoutUntil && new Date(user.lockoutUntil) < new Date()) {
      await user.update({ lockoutUntil: null, failedVerificationAttempts: 0 });
    }

    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const minutesRemaining = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 60000
      );
      res.status(429).json({
        error: `Too many verification attempts. Try again in ${minutesRemaining} minute(s).`,
      });
      return;
    }

    if (!user.verificationCodeHash || !user.verificationExpiresAt) {
      res.status(400).json({ error: 'No verification code found. Please register again.' });
      return;
    }

    if (new Date(user.verificationExpiresAt) < new Date()) {
      res.status(400).json({ error: 'Verification code expired. Please register again.' });
      return;
    }

    const isMatch = await bcrypt.compare(code, user.verificationCodeHash);
    if (!isMatch) {
      const failedAttempts = (user.failedVerificationAttempts || 0) + 1;
      const updates: { failedVerificationAttempts: number; lockoutUntil?: Date } = { failedVerificationAttempts: failedAttempts };

      if (failedAttempts >= MAX_VERIFY_ATTEMPTS) {
        updates.lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
      }

      await user.update(updates);
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    user.isVerified = true;
    user.verificationCodeHash = null;
    user.verificationExpiresAt = null;
    user.failedVerificationAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      message: 'Account verified successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error('Verification error:', (error as Error).message);
    res.status(500).json({ error: ERRORS.GENERIC });
  }
};

// ==================== GET PROFILE ====================

const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      name: req.user!.name,
    },
  });
};

export { register, login, getProfile, verifyCode };
