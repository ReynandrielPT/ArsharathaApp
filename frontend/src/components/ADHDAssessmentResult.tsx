import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toggleADHDMode } from "../services/assessmentService";
import "../styles/result.css";
import { useSettings } from "../contexts/SettingsContext";

const AssessmentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEnabling, setIsEnabling] = useState(false);
  const { setAdhdMode, setAdhdStatus } = useSettings();
  
  const { 
    adhdDetected = false, 
    totalScore = 0, 
    partAScore = 0, 
    partBScore = 0, 
    partASymptomCount = 0, 
    partBSymptomCount = 0,
    submissionSuccess = false,
    submissionError = false
  } = location.state || {};

  const handleEnableAdhdMode = async () => {
    if (isEnabling) return;
    
    setIsEnabling(true);
    try {
      await toggleADHDMode(true);
      setAdhdMode(true);
      setAdhdStatus(true);
      alert(
        "ADHD Mode has been enabled! You will be redirected to the homepage."
      );
      navigate("/app");
    } catch (error) {
      console.error("Failed to enable ADHD mode:", error);
      alert("Failed to enable ADHD mode. Please try again later.");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="result-page-background">
      <div className="result-card">
        <h1>Your Assessment Result</h1>
        
        {/* Submission Status Indicator */}
        {submissionSuccess && (
          <div className="submission-status success">
            ✅ Assessment results saved successfully
          </div>
        )}
        {submissionError && (
          <div className="submission-status error">
            ⚠️ Failed to save assessment results. Your results are displayed below but may not be saved.
          </div>
        )}
        
        {adhdDetected ? (
          <div>
            <h3 className="adhd-detected">Patterns Consistent with ADHD Detected</h3>
            <p>
              Based on your responses, you show patterns that are consistent
              with ADHD characteristics. This assessment detected <strong>{partASymptomCount >= 5 ? 'significant' : 'some'} inattention symptoms</strong> 
              {partASymptomCount >= 5 && partBSymptomCount >= 5 ? ' and ' : partBSymptomCount >= 5 ? ' and ' : ' but '} 
              <strong>{partBSymptomCount >= 5 ? 'significant' : 'minimal'} hyperactivity-impulsivity symptoms</strong>.
            </p>
            
            <div className="score-summary">
              <h4>Assessment Summary</h4>
              <div className="score-details">
                <div className="score-item">
                  <span>Part A (Inattention):</span>
                  <span>{partASymptomCount}/9 significant symptoms</span>
                </div>
                <div className="score-item">
                  <span>Part B (Hyperactivity-Impulsivity):</span>
                  <span>{partBSymptomCount}/9 significant symptoms</span>
                </div>
                <div className="score-item total">
                  <span>Total Score:</span>
                  <span>{totalScore}/72 points</span>
                </div>
              </div>
            </div>
            
            <div className="adhd-features">
              <h4>ADHD Mode Features</h4>
              <ul>
                <li>Bionic Reading for improved text processing</li>
                <li>Reduced visual distractions and clutter</li>
                <li>Enhanced focus indicators and progress tracking</li>
                <li>Customizable interface for better concentration</li>
                <li>Break reminders and attention management tools</li>
              </ul>
            </div>

            <div className="highlight-box">
              <p>
                <strong>Note:</strong> This is <strong>not a medical diagnosis</strong>. A threshold of 5 or more symptoms 
                in either category suggests patterns consistent with ADHD. Please consult with a healthcare professional 
                for proper evaluation and diagnosis.
              </p>
            </div>
            
            <div className="button-group">
              <button 
                onClick={handleEnableAdhdMode} 
                className="primary-button"
                disabled={isEnabling}
              >
                {isEnabling ? '⏳ Enabling...' : '🧠 Activate ADHD Mode'}
              </button>
              <button onClick={handleContinue} className="secondary-button">
                Continue Without
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="no-adhd">Assessment Complete - Thank You!</h3>
            <p>
              Based on your responses, you do not show patterns typically
              associated with ADHD characteristics that meet the clinical threshold. 
              You had <strong>{partASymptomCount} inattention symptoms</strong> and <strong>{partBSymptomCount} hyperactivity-impulsivity symptoms</strong> 
              (threshold: 5 or more in either category).
            </p>
            
            <div className="score-summary">
              <h4>Assessment Summary</h4>
              <div className="score-details">
                <div className="score-item">
                  <span>Part A (Inattention):</span>
                  <span>{partASymptomCount}/9 significant symptoms</span>
                </div>
                <div className="score-item">
                  <span>Part B (Hyperactivity-Impulsivity):</span>
                  <span>{partBSymptomCount}/9 significant symptoms</span>
                </div>
                <div className="score-item total">
                  <span>Total Score:</span>
                  <span>{totalScore}/72 points</span>
                </div>
              </div>
            </div>
            
            <div className="highlight-box">
              <p>
                <strong>Remember:</strong> This assessment is based on the ASRS-v1.1 Symptom Checklist and is for informational purposes only. 
                If you have concerns about ADHD or attention difficulties, please consult 
                with a healthcare professional for proper evaluation.
              </p>
            </div>
            
            <div className="button-group">
              <button onClick={handleContinue} className="primary-button">
                🚀 Continue to Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResultPage;