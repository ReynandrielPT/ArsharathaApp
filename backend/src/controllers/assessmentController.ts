import { Response } from 'express';
import { User } from '../models/User';
import { IAuthRequest } from '../middleware/auth';

/**
 * Submit ADHD assessment results
 */
export const submitAssessment = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { 
      responses, 
      adhdDetected, 
      totalScore, 
      partAScore, 
      partBScore, 
      partASymptomCount, 
      partBSymptomCount 
    } = req.body;

    // Validate required fields
    if (!userId || !responses || adhdDetected === undefined) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required assessment data' 
      });
      return;
    }

    // Validate responses array
    if (!Array.isArray(responses) || responses.length !== 18) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid responses array. Must contain 18 responses.' 
      });
      return;
    }

    // Validate response values (should be 0-4)
    const validResponses = responses.every(response => 
      typeof response === 'number' && response >= 0 && response <= 4
    );

    if (!validResponses) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid response values. All responses must be between 0-4.' 
      });
      return;
    }

    // Update user with assessment results
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        hasCompletedAssessment: true,
        isADHD: adhdDetected,
        lastAssessmentDate: new Date(),
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        hasCompletedAssessment: updatedUser.hasCompletedAssessment,
        isADHD: updatedUser.isADHD,
        adhdMode: updatedUser.adhdMode,
        lastAssessmentDate: updatedUser.lastAssessmentDate,
      },
      assessmentResult: {
        adhdDetected,
        totalScore,
        partAScore,
        partBScore,
        partASymptomCount,
        partBSymptomCount,
      }
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Assessment submission failed' 
    });
  }
};

/**
 * Get user's current assessment status
 */
export const getAssessmentStatus = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      assessmentStatus: {
        hasCompletedAssessment: user.hasCompletedAssessment,
        isADHD: user.isADHD,
        adhdMode: user.adhdMode,
        lastAssessmentDate: user.lastAssessmentDate,
      }
    });

  } catch (error) {
    console.error('Get assessment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get assessment status' 
    });
  }
};

/**
 * Toggle ADHD mode for user
 */
export const toggleADHDMode = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid enabled value. Must be boolean.' 
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { adhdMode: enabled },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `ADHD mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      adhdMode: updatedUser.adhdMode
    });

  } catch (error) {
    console.error('Toggle ADHD mode error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle ADHD mode' 
    });
  }
};

/**
 * Check if assessment is required for user
 */
export const checkAssessmentRequired = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('hasCompletedAssessment lastAssessmentDate');
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      assessmentRequired: !user.hasCompletedAssessment,
      hasCompletedAssessment: user.hasCompletedAssessment,
      lastAssessmentDate: user.lastAssessmentDate
    });

  } catch (error) {
    console.error('Check assessment required error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check assessment requirement' 
    });
  }
};
