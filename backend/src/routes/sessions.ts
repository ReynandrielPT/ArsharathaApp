import { Router, Response } from 'express';
import { firebaseAuthMiddleware, IAuthRequest } from '../middleware/firebaseAuth';
import { Session } from '../models/Session';
import { Message } from '../models/Message';

const router = Router();

router.use(firebaseAuthMiddleware);

router.get('/', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ userId: req.user?.uid }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const session = await Session.findOne({ _id: id, userId: req.user?.uid });
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

router.put('/:id/canvas', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { canvasState } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: id, userId: req.user?.uid },
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
