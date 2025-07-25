import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extends the base Express Request interface to include an optional `userId`.
 * This allows downstream handlers to access the authenticated user's ID.
 */
export interface IAuthRequest extends Request {
  userId?: string;
  body: any;
}

/**
 * Express middleware to authenticate requests using a JSON Web Token (JWT).
 * It verifies the token from the Authorization header and attaches the user ID to the request object.
 * 
 * @param {IAuthRequest} req - The Express request object, extended with `userId`.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // 1. Check for the Authorization header and Bearer scheme.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  // 2. Extract the token from the header.
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is not defined.');
    res.status(500).json({ message: 'Server configuration error.' });
    return;
  }

  try {
    // 3. Verify the token using the secret.
    const decoded = jwt.verify(token, secret) as { userId: string };
    // 4. Attach the decoded userId to the request object for use in protected routes.
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // If verification fails, the token is invalid.
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};
