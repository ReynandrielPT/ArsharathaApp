import { Router, Response } from 'express';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { Session } from '../models/Session';
import { Message } from '../models/Message';

const router = Router();

// All routes in this file are protected and require authentication.
router.use(authMiddleware);

/**
 * @route   GET /api/sessions
 * @desc    Get a list of all sessions for the logged-in user.
 * @access  Private
 */
router.get('/', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a single session and its messages by ID.
 * @access  Private
 */
router.get('/:id', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const session = await Session.findOne({ _id: id, userId: req.userId });
    if (!session) {
      res.status(404).json({ message: 'Session not found or access denied.' });
      return;
    }

    const messages = await Message.find({ sessionId: id }).populate('fileIds', 'originalFilename').sort({ createdAt: 1 });
    
    res.json({ session, messages });

  } catch (error) {
    console.error('Error fetching messages for session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   PUT /api/sessions/:id/canvas
 * @desc    Save the current state of the canvas for a session.
 * @access  Private
 */
router.put('/:id/canvas', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { canvasState } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { canvasState } },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ message: 'Session not found or access denied.' });
      return;
    }

    res.json({ message: 'Canvas state saved successfully.', session });
  } catch (error) {
    console.error('Error saving canvas state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;