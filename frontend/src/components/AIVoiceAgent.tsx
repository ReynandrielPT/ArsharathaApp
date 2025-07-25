import React, { useEffect, useState } from 'react';

/**
 * Props for the AIVoiceAgent component.
 */
interface AIVoiceAgentProps {
  /** Determines if the agent is currently speaking, which controls the animation. */
  isActive: boolean;
}

/**
 * A visual component representing the AI Voice Agent.
 * It displays a dynamic, animated orb with a sound wave visualizer that reacts
 * to whether the AI is currently speaking.
 */
const AIVoiceAgent: React.FC<AIVoiceAgentProps> = ({ isActive }) => {
  // State to control the animation frame for the wave effect.
  const [animationFrame, setAnimationFrame] = useState(0);

  /**
   * Effect hook to run the animation loop only when the agent is active.
   * It updates the animation frame at a set interval to create a continuous wave.
   */
  useEffect(() => {
    if (!isActive) return; // Only run animation if the agent is active.

    const interval = setInterval(() => {
      // Increment the animation frame to create a continuous wave effect.
      // The modulo operator ensures the frame loops from 0 to 99.
      setAnimationFrame(prev => (prev + 1) % 100);
    }, 50); // Update every 50 milliseconds.

    // Cleanup function to clear the interval when the component unmounts or isActive changes to false.
    return () => clearInterval(interval);
  }, [isActive]); // Dependency array: re-run effect when isActive changes.

  /**
   * Generates the height points for the sound wave visualizer bars.
   * The heights are based on a sine wave to create a smooth, natural-looking animation.
   * @returns {number[]} An array of numbers representing the height of each bar.
   */
  const generateWavePoints = () => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      // Calculate amplitude based on isActive state and sine wave for animation.
      const amplitude = isActive ? 15 + Math.sin(animationFrame * 0.1 + i) * 10 : 5;
      // Ensure a minimum height for the bars even when idle.
      const height = Math.max(5, amplitude);
      points.push(height);
    }
    return points;
  };

  // Generate the wave points for the current animation frame.
  const wavePoints = generateWavePoints();

  return (
    <div className="absolute bottom-6 right-6 z-10"> {/* Positioning for the AI Voice Agent component. */}
      <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30' // Active state styling.
          : 'bg-gradient-to-r from-slate-400 to-slate-500 shadow-md' // Idle state styling.
      }`}>
        {/* A glowing ring that pulses when the agent is active, indicating activity. */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isActive 
            ? 'ring-4 ring-blue-300 ring-opacity-30 animate-pulse' // Pulsing ring when active.
            : 'ring-0' // No ring when idle.
        }`} />
        
        {/* The core audio visualizer made of animated bars. */}
        <div className="flex items-center justify-center gap-1 h-8">
          {wavePoints.map((height, index) => (
            <div
              key={index} // Unique key for each bar.
              className={`w-1 bg-white rounded-full transition-all duration-75 ${
                isActive ? 'animate-pulse' : '' // Apply pulse animation when active.
              }`}
              style={{ 
                height: `${height}px`,
                animationDelay: `${index * 50}ms` // Stagger the animation for a wave effect across bars.
              }}
            />
          ))}
        </div>
        
        {/* A simple pulsing dot to indicate the agent is idle but ready. */}
        {!isActive && (
          <div className="absolute w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
        )}
      </div>
    </div>
  );
};

export default AIVoiceAgent;