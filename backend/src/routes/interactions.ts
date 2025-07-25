import { Router } from 'express';
import { firebaseAuthMiddleware, IAuthRequest } from '../middleware/firebaseAuth';
import { LearningService } from '../services/learningService';

const router = Router();

// Use Firebase auth middleware for all routes
router.use(firebaseAuthMiddleware);

/**
 * POST /api/interactions/validate-kinesthetic
 * Validate kinesthetic drag-and-drop answers
 */
router.post('/validate-kinesthetic', async (req: IAuthRequest, res) => {
  try {
    const { sessionId, elementId, coordinates } = req.body;

    if (!sessionId || !elementId || !coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
      return res.status(400).json({ 
        message: 'Missing required fields: sessionId, elementId, coordinates {x, y}' 
      });
    }

    const result = await LearningService.validateKinestheticAnswer(
      sessionId, 
      elementId, 
      coordinates
    );

    res.json(result);
  } catch (error) {
    console.error('Error validating kinesthetic answer:', error);
    res.status(500).json({ 
      message: 'Failed to validate kinesthetic answer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/interactions/track
 * Track user interaction for adaptive learning
 */
router.post('/track', async (req: IAuthRequest, res) => {
  try {
    const { mode, isNegativeResponse } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!mode || !['V', 'A', 'R', 'K'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Invalid mode. Must be one of: V, A, R, K' 
      });
    }

    if (typeof isNegativeResponse !== 'boolean') {
      return res.status(400).json({ 
        message: 'isNegativeResponse must be a boolean' 
      });
    }

    await LearningService.trackInteraction(userId, mode, isNegativeResponse);
    
    res.json({ message: 'Interaction tracked successfully' });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ 
      message: 'Failed to track interaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/interactions/performance
 * Get user performance statistics
 */
router.get('/performance', async (req: IAuthRequest, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const stats = await LearningService.getUserPerformanceStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({ 
      message: 'Failed to get performance statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/interactions/mode-suggestion/:mode
 * Get mode switch suggestion based on current mode and performance
 */
router.get('/mode-suggestion/:mode', async (req: IAuthRequest, res) => {
  try {
    const userId = req.user?.uid;
    const currentMode = req.params.mode as 'V' | 'A' | 'R' | 'K';

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!['V', 'A', 'R', 'K'].includes(currentMode)) {
      return res.status(400).json({ 
        message: 'Invalid mode. Must be one of: V, A, R, K' 
      });
    }

    const suggestion = await LearningService.analyzeModeSwitch(userId, currentMode);
    
    res.json(suggestion);
  } catch (error) {
    console.error('Error getting mode suggestion:', error);
    res.status(500).json({ 
      message: 'Failed to get mode suggestion',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;