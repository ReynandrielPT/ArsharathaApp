import { useLocation, useNavigate } from "react-router-dom";
import "../AssessmentResultPage.css";

const AssessmentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adhdDetected } = location.state || { adhdDetected: false };

  const handleEnableAdhdMode = () => {
    console.log("Enabling ADHD mode...");
    alert(
      "ADHD Mode has been enabled! You will be redirected to the homepage."
    );
    navigate("/");
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="result-page-background">
      <div className="result-card">
        <h1>Your Assessment Result</h1>
        {adhdDetected ? (
          <div>
            <h3>Patterns Consistent with ADHD Detected</h3>
            <p>
              Based on your answers, you show some patterns that are consistent
              with ADHD. This is not a diagnosis, but an indication that you may
              benefit from tools designed to aid focus.
            </p>
            <p>
              Our application offers an "ADHD Mode" with features like Bionic
              Reading and display adjustments to help create a more focused
              experience.
            </p>
            <div className="button-group">
              <button onClick={handleEnableAdhdMode} className="primary-button">
                Activate ADHD Mode
              </button>
              <button onClick={handleContinue} className="secondary-button">
                Continue Without
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3>Thank You for Completing the Assessment</h3>
            <p>
              Based on your answers, you do not show strong patterns typically
              associated with ADHD. Thank you for taking the time to complete
              the self-assessment.
            </p>
            <div className="button-group">
              <button onClick={handleContinue} className="primary-button">
                Continue to Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResultPage;
