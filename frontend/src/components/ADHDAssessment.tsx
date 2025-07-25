import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAssessment } from '../services/assessmentService';
import "../styles/assessment-styles.css";

interface Question {
  id: number;
  text: string;
  category: 'inattention' | 'hyperactivity-impulsivity';
}

const questions: Question[] = [
  // Part A: Inattention (9 questions)
  { id: 1, text: "How often do you fail to give close attention to details or make careless mistakes in your work or other activities?", category: 'inattention' },
  { id: 2, text: "How often do you have difficulty sustaining your attention in tasks or leisure activities (e.g., remaining focused during lectures, conversations, or lengthy reading)?", category: 'inattention' },
  { id: 3, text: "How often do you not seem to listen when spoken to directly (e.g., your mind seems elsewhere, even in the absence of any obvious distraction)?", category: 'inattention' },
  { id: 4, text: "How often do you not follow through on instructions and fail to finish schoolwork, chores, or duties in the workplace (e.g., you start tasks but quickly lose focus and are easily sidetracked)?", category: 'inattention' },
  { id: 5, text: "How often do you have difficulty organizing tasks and activities (e.g., difficulty managing sequential tasks; difficulty keeping materials and belongings in order; messy, disorganized work; poor time management; failing to meet deadlines)?", category: 'inattention' },
  { id: 6, text: "How often do you avoid, dislike, or are you reluctant to engage in tasks that require sustained mental effort (e.g., preparing reports, completing forms, reviewing lengthy papers)?", category: 'inattention' },
  { id: 7, text: "How often do you lose things necessary for tasks or activities (e.g., school materials, pencils, books, tools, wallets, keys, paperwork, eyeglasses, mobile telephones)?", category: 'inattention' },
  { id: 8, text: "How often are you easily distracted by extraneous stimuli (e.g., for adults, this may include unrelated thoughts)?", category: 'inattention' },
  { id: 9, text: "How often are you forgetful in daily activities (e.g., doing chores, running errands, returning calls, paying bills, keeping appointments)?", category: 'inattention' },
  // Part B: Hyperactivity-Impulsivity (9 questions)
  { id: 10, text: "How often do you fidget with or tap your hands or feet, or squirm in your seat?", category: 'hyperactivity-impulsivity' },
  { id: 11, text: "How often do you leave your seat in situations when remaining seated is expected (e.g., in the office or other workplace, or in meetings)?", category: 'hyperactivity-impulsivity' },
  { id: 12, text: "How often do you feel restless?", category: 'hyperactivity-impulsivity' },
  { id: 13, text: "How often are you unable to play or engage in leisure activities quietly?", category: 'hyperactivity-impulsivity' },
  { id: 14, text: 'How often are you "on the go," acting as if "driven by a motor" (e.g., you are unable to be or uncomfortable being still for an extended time, as in restaurants or meetings)?', category: 'hyperactivity-impulsivity' },
  { id: 15, text: "How often do you talk excessively?", category: 'hyperactivity-impulsivity' },
  { id: 16, text: "How often do you blurt out an answer before a question has been completed (e.g., completing people's sentences; cannot wait for your turn in conversation)?", category: 'hyperactivity-impulsivity' },
  { id: 17, text: "How often do you have difficulty waiting your turn (e.g., while waiting in line)?", category: 'hyperactivity-impulsivity' },
  { id: 18, text: "How often do you interrupt or intrude on others (e.g., butt into conversations, games, or activities; may start using other people's things without asking)?", category: 'hyperactivity-impulsivity' },
];

const ADHDAssessment: React.FC = () => {
  const [responses, setResponses] = useState<number[]>(Array(18).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  const handleResponse = (questionIndex: number, score: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = score;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    const answeredQuestions = responses.filter((a) => a !== -1).length;
    if (answeredQuestions < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const partAAnswers = responses.slice(0, 9);
    const partBAnswers = responses.slice(9, 18);
    const partASymptomCount = partAAnswers.filter((answer) => answer >= 3).length;
    const partBSymptomCount = partBAnswers.filter((answer) => answer >= 3).length;

    const adhdDetected = partASymptomCount >= 5 || partBSymptomCount >= 5;

    const totalScore = responses.reduce((acc, val) => acc + val, 0);
    const partAScore = partAAnswers.reduce((acc, val) => acc + val, 0);
    const partBScore = partBAnswers.reduce((acc, val) => acc + val, 0);

    try {
      const result = await submitAssessment({
        responses,
        adhdDetected,
        totalScore,
        partAScore,
        partBScore,
        partASymptomCount,
        partBSymptomCount,
      });

      navigate('/assessment-result', { 
        state: { 
          adhdDetected,
          totalScore,
          partAScore,
          partBScore,
          partASymptomCount,
          partBSymptomCount,
          submissionSuccess: result.success,
        } 
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      navigate('/assessment-result', { 
        state: { 
          adhdDetected,
          totalScore,
          partAScore,
          partBScore,
          partASymptomCount,
          partBSymptomCount,
          submissionError: true,
        } 
      });
    }
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = responses[currentQuestion] !== -1; 
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="assessment-background">
      <div className="assessment-container">
        <div className="assessment-header">
          <h1>ADHD Self-Assessment</h1>
          <p>Based on the ASRS-v1.1 Symptom Checklist. Over the past 6 months, how often have you been bothered by the following problems?</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{currentQuestion + 1} of {questions.length}</span>
        </div>

        <div className="question-card">
          <div className="question-category">
            <span className={`category-badge ${currentQ.category}`}>
              {currentQ.category === 'inattention' ? 'Part A: Inattention' : 'Part B: Hyperactivity-Impulsivity'}
            </span>
          </div>
          
          <h2>{currentQ.text}</h2>
          
          <div className="response-options">
            {[
              { value: 0, label: "Never", color: "#10b981" },
              { value: 1, label: "Rarely", color: "#3b82f6" },
              { value: 2, label: "Sometimes", color: "#f59e0b" },
              { value: 3, label: "Often", color: "#ef4444" },
              { value: 4, label: "Very Often", color: "#dc2626" }
            ].map((option) => (
              <button
                key={option.value}
                className={`response-button ${responses[currentQuestion] === option.value ? 'selected' : ''}`}
                onClick={() => handleResponse(currentQuestion, option.value)}
                style={{ 
                  '--button-color': option.color,
                  backgroundColor: responses[currentQuestion] === option.value ? option.color : 'transparent',
                  borderColor: option.color,
                  color: responses[currentQuestion] === option.value ? 'white' : option.color
                } as React.CSSProperties}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button 
            onClick={prevQuestion} 
            disabled={currentQuestion === 0}
            className="nav-button secondary"
          >
            ← Previous
          </button>
          
          <button 
            onClick={nextQuestion} 
            disabled={!isAnswered}
            className="nav-button primary"
          >
            {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next →'}
          </button>
        </div>

        <div className="disclaimer">
          <p>
            <strong>Disclaimer:</strong> This self-assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ADHDAssessment;
