import { Router } from 'express';
import { 
  submitAssessment, 
  getAssessmentStatus, 
  toggleADHDMode, 
  checkAssessmentRequired 
} from '../controllers/assessmentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/assessment/submit
 * @desc    Submit ADHD assessment results
 * @access  Private (requires authentication)
 * @body    {
 *            responses: number[], // Array of 18 responses (0-4)
 *            adhdDetected: boolean,
 *            totalScore: number,
 *            partAScore: number,
 *            partBScore: number,
 *            partASymptomCount: number,
 *            partBSymptomCount: number
 *          }
 */
router.post('/submit', authMiddleware, submitAssessment);

/**
 * @route   GET /api/assessment/status
 * @desc    Get user's current assessment status
 * @access  Private (requires authentication)
 * @returns {
 *            assessmentStatus: {
 *              hasCompletedAssessment: boolean,
 *              isADHD: boolean,
 *              adhdMode: boolean,
 *              lastAssessmentDate: Date
 *            }
 *          }
 */
router.get('/status', authMiddleware, getAssessmentStatus);

/**
 * @route   PUT /api/assessment/adhd-mode
 * @desc    Toggle ADHD mode for user
 * @access  Private (requires authentication)
 * @body    { enabled: boolean }
 */
router.put('/adhd-mode', authMiddleware, toggleADHDMode);

/**
 * @route   GET /api/assessment/check-required
 * @desc    Check if assessment is required for user
 * @access  Private (requires authentication)
 * @returns {
 *            assessmentRequired: boolean,
 *            hasCompletedAssessment: boolean,
 *            lastAssessmentDate: Date
 *          }
 */
router.get('/check-required', authMiddleware, checkAssessmentRequired);

export default router;
