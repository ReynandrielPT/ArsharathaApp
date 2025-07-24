import { Router } from 'express';
import { User } from '../models/User';
import { firebaseAuthMiddleware, IAuthRequest } from '../middleware/firebaseAuth';

const router = Router();

router.post('/', async (req, res) => {
  const { uid, email, fullName } = req.body;
  try {
    const newUser = new User({ uid, email, fullName });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create user profile.' });
  }
});

router.use(firebaseAuthMiddleware);

router.get('/profile', async (req: IAuthRequest, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

router.put('/settings', async (req: IAuthRequest, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { uid: req.user?.uid },
            { $set: { settings: req.body } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user.settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
