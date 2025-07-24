
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AssessmentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adhdDetected } = location.state || { adhdDetected: false };

  const handleEnableAdhdMode = () => {
    // Mocking API call
    console.log('Enabling ADHD mode...');
    // fetch('/api/v1/users/toggle-adhd-mode', { method: 'POST', body: JSON.stringify({ enable: true }) });
    alert('ADHD Mode has been enabled! You will be redirected to the homepage.');
    navigate('/');
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div>
      <h1>Your Assessment Result</h1>
      {adhdDetected ? (
        <div>
          <h3>Based on your answers, you show some patterns consistent with ADHD.</h3>
          <p>
            ADHD (Attention-Deficit/Hyperactivity Disorder) is a neurodevelopmental disorder that affects executive functions of the brain, leading to difficulties in focusing attention, controlling impulses, and regulating activity levels. This is not a reflection of your intelligence or capability.
          </p>
          <p>
            We provide an "ADHD Mode" that can help you focus better through features like Bionic Reading and display adjustments. Would you like to activate it?
          </p>
          <button onClick={handleEnableAdhdMode}>Activate ADHD Mode</button>
          <button onClick={handleContinue} style={{ marginLeft: '10px' }}>Continue Without ADHD Mode</button>
        </div>
      ) : (
        <div>
          <h3>Thank You!</h3>
          <p>Thank you for taking the time to complete the assessment. Based on your answers, you do not show strong patterns associated with ADHD.</p>
          <button onClick={handleContinue}>Continue to Application</button>
        </div>
      )}
    </div>
  );
};

export default AssessmentResultPage;
