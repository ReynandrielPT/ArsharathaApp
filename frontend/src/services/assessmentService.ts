const API_BASE = 'https://vika-ai.xyz/api'; // Adjust based on your backend URL

export interface AssessmentSubmission {
  responses: number[];
  adhdDetected: boolean;
  totalScore: number;
  partAScore: number;
  partBScore: number;
  partASymptomCount: number;
  partBSymptomCount: number;
}

export interface AssessmentStatus {
  hasCompletedAssessment: boolean;
  isADHD: boolean;
  adhdMode: boolean;
  lastAssessmentDate?: string;
}

export interface AssessmentResult {
  adhdDetected: boolean;
  totalScore: number;
  partAScore: number;
  partBScore: number;
  partASymptomCount: number;
  partBSymptomCount: number;
}

/**
 * Get authentication token for API requests
 */
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }
  return token;
};

/**
 * Submit ADHD assessment results to backend
 */
export const submitAssessment = async (assessmentData: AssessmentSubmission): Promise<{
  success: boolean;
  user: any;
  assessmentResult: AssessmentResult;
}> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}/assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assessmentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit assessment');
    }

    return data;
  } catch (error) {
    console.error('Assessment submission error:', error);
    throw error;
  }
};

/**
 * Get user's current assessment status
 */
export const getAssessmentStatus = async (): Promise<AssessmentStatus> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}/assessment/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get assessment status');
    }

    return data.assessmentStatus;
  } catch (error) {
    console.error('Get assessment status error:', error);
    throw error;
  }
};

/**
 * Toggle ADHD mode for user
 */
export const toggleADHDMode = async (enabled: boolean): Promise<boolean> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}/assessment/adhd-mode`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle ADHD mode');
    }

    return data.adhdMode;
  } catch (error) {
    console.error('Toggle ADHD mode error:', error);
    throw error;
  }
};

/**
 * Check if assessment is required for user
 */
export const checkAssessmentRequired = async (): Promise<{
  assessmentRequired: boolean;
  hasCompletedAssessment: boolean;
  lastAssessmentDate?: string;
}> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}/assessment/check-required`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to check assessment requirement');
    }

    return {
      assessmentRequired: data.assessmentRequired,
      hasCompletedAssessment: data.hasCompletedAssessment,
      lastAssessmentDate: data.lastAssessmentDate,
    };
  } catch (error) {
    console.error('Check assessment required error:', error);
    throw error;
  }
};
