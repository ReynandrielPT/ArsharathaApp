import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface IAuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const firebaseAuthMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};
