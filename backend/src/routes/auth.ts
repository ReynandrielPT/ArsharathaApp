import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user.
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ message: 'Username is already taken.' });
      return;
    }

    if (username.length > 15) {
        res.status(400).json({ message: 'Username cannot exceed 15 characters.'});
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user and returns a JWT.
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required.' });
    return;
  }

  if (username.length > 15) {
    res.status(400).json({ message: 'Username cannot exceed 15 characters.'});
    return;
  }

  try {
    // Find user by username and include password for comparison
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Create and sign JWT
    const payload = { userId: user._id };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    // Send token and user data to client
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        hasCompletedAssessment: user.hasCompletedAssessment,
        isADHD: user.isADHD,
        adhdMode: user.adhdMode,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
