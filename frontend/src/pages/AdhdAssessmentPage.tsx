import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../AdhdAssessmentPage.css"; // Import the new stylesheet

const questions = [
  // Part A: Inattention
  "How often do you fail to give close attention to details or make careless mistakes in your work or other activities?",
  "How often do you have difficulty sustaining your attention in tasks or leisure activities (e.g., remaining focused during lectures, conversations, or lengthy reading)?",
  "How often do you not seem to listen when spoken to directly (e.g., your mind seems elsewhere, even in the absence of any obvious distraction)?",
  "How often do you not follow through on instructions and fail to finish schoolwork, chores, or duties in the workplace (e.g., you start tasks but quickly lose focus and are easily sidetracked)?",
  "How often do you have difficulty organizing tasks and activities (e.g., difficulty managing sequential tasks; difficulty keeping materials and belongings in order; messy, disorganized work; poor time management; failing to meet deadlines)?",
  "How often do you avoid, dislike, or are you reluctant to engage in tasks that require sustained mental effort (e.g., preparing reports, completing forms, reviewing lengthy papers)?",
  "How often do you lose things necessary for tasks or activities (e.g., school materials, pencils, books, tools, wallets, keys, paperwork, eyeglasses, mobile telephones)?",
  "How often are you easily distracted by extraneous stimuli (e.g., for adults, this may include unrelated thoughts)?",
  "How often are you forgetful in daily activities (e.g., doing chores, running errands, returning calls, paying bills, keeping appointments)?",
  // Part B: Hyperactivity-Impulsivity
  "How often do you fidget with or tap your hands or feet, or squirm in your seat?",
  "How often do you leave your seat in situations when remaining seated is expected (e.g., in the office or other workplace, or in meetings)?",
  "How often do you feel restless?",
  "How often are you unable to play or engage in leisure activities quietly?",
  'How often are you "on the go," acting as if "driven by a motor" (e.g., you are unable to be or uncomfortable being still for an extended time, as in restaurants or meetings)?',
  "How often do you talk excessively?",
  "How often do you blurt out an answer before a question has been completed (e.g., completing people's sentences; cannot wait for your turn in conversation)?",
  "How often do you have difficulty waiting your turn (e.g., while waiting in line)?",
  "How often do you interrupt or intrude on others (e.g., butt into conversations, games, or activities; may start using other people's things without asking)?",
];

const AdhdAssessmentPage = () => {
  const [answers, setAnswers] = useState<number[]>(Array(18).fill(-1));
  const navigate = useNavigate();

  const handleAnswerChange = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const answeredQuestions = useMemo(
    () => answers.filter((a) => a !== -1).length,
    [answers]
  );
  const progress = (answeredQuestions / questions.length) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (answeredQuestions < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const partAAnswers = answers.slice(0, 9);
    const partBAnswers = answers.slice(9, 18);

    const partASymptomCount = partAAnswers.filter(
      (answer) => answer >= 3
    ).length;
    const partBSymptomCount = partBAnswers.filter(
      (answer) => answer >= 3
    ).length;

    const adhdDetected = partASymptomCount >= 5 || partBSymptomCount >= 5;

    const totalScore = answers.reduce((acc, val) => acc + val, 0);
    const partAScore = partAAnswers.reduce((acc, val) => acc + val, 0);
    const partBScore = partBAnswers.reduce((acc, val) => acc + val, 0);

    const mockResponse = {
      adhdDetected: adhdDetected,
      totalScore: totalScore,
      partAScore: partAScore,
      partBScore: partBScore,
      partASymptomCount: partASymptomCount,
      partBSymptomCount: partBSymptomCount,
    };

    navigate("/assessment/result", { state: mockResponse });
  };

  const responseOptions = [
    "Never",
    "Rarely",
    "Sometimes",
    "Often",
    "Very Often",
  ];

  return (
    <div className="assessment-page-background">
      <div className="assessment-container">
        <div className="assessment-card">
          <div className="assessment-header">
            <h1>ADHD Self-Assessment</h1>
            <p>Based on the ASRS-v1.1 Symptom Checklist</p>
          </div>
          <div className="instructions-box">
            <p>
              <strong>Instructions:</strong> Over the past 6 months, how often
              have you been bothered by the following problems? Please respond
              to each item.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <h3 className="part-header">Part A: Inattention</h3>
            {questions.slice(0, 9).map((q, index) => (
              <div key={index} className="question-block">
                <p>
                  {index + 1}. {q}
                </p>
                <div className="radio-group">
                  {responseOptions.map((label, value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={value}
                        checked={answers[index] === value}
                        onChange={() => handleAnswerChange(index, value)}
                      />
                      <span className="radio-custom"></span>
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <h3 className="part-header">Part B: Hyperactivity-Impulsivity</h3>
            {questions.slice(9, 18).map((q, index) => (
              <div key={index + 9} className="question-block">
                <p>
                  {index + 10}. {q}
                </p>
                <div className="radio-group">
                  {responseOptions.map((label, value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`question-${index + 9}`}
                        value={value}
                        checked={answers[index + 9] === value}
                        onChange={() => handleAnswerChange(index + 9, value)}
                      />
                      <span className="radio-custom"></span>
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={answeredQuestions < questions.length}
            >
              Submit Assessment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AdhdAssessmentPage;
