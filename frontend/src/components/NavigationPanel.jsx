import React, { useState } from "react";
import { useNavigationStore } from "../services/store";
import { FiVolume2, FiSkipBack, FiSkipForward, FiX } from "react-icons/fi";
import "../styles/NavigationPanel.css";

const NavigationPanel = ({ route }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { stopNavigation } = useNavigationStore();
  const directions = route?.directions || [];

  const speakDirection = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleSpeak = () => {
    if (directions[currentStep]) {
      speakDirection(directions[currentStep].instruction);
    }
  };

  const handleNext = () => {
    if (currentStep < directions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speakDirection(directions[nextStep]?.instruction);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const previousStep = currentStep - 1;
      setCurrentStep(previousStep);
      speakDirection(directions[previousStep]?.instruction);
    }
  };

  const currentDirection = directions[currentStep];

  return (
    <div className="nav-card">
      <div className="nav-header">
        <h3 className="nav-title">Navigation</h3>
        <button onClick={stopNavigation} className="nav-close">
          <FiX size={20} />
        </button>
      </div>

      <div className="nav-current">
        <p className="nav-instruction">{currentDirection?.instruction}</p>
        <p className="nav-step">Step {directions.length ? currentStep + 1 : 0} of {directions.length}</p>
      </div>

      <div className="nav-info">
        <p className="nav-info-text">Total Distance: {Math.round(route?.totalDistance || 0)} m</p>
        <p className="nav-info-text">Est. Time: {Math.max(1, Math.ceil((route?.estimatedTime || 0) / 60))} min</p>
      </div>

      <div className="nav-controls">
        <button onClick={handlePrevious} disabled={currentStep === 0} className="nav-btn"><FiSkipBack /></button>
        <button onClick={handleSpeak} className="nav-btn btn-speak"><FiVolume2 /> Speak</button>
        <button onClick={handleNext} disabled={currentStep === directions.length - 1} className="nav-btn"><FiSkipForward /></button>
      </div>

      <div className="nav-list">
        {directions.map((dir, idx) => (
          <div key={idx} onClick={() => setCurrentStep(idx)} className={`nav-item ${idx === currentStep ? "nav-item-active" : ""}`}>
            <p className="nav-item-text">{idx + 1}. {dir.instruction}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationPanel;
