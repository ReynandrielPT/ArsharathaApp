import React, { useEffect, useState } from 'react';

interface AIVoiceAgentProps {
  isActive: boolean;
}

const AIVoiceAgent: React.FC<AIVoiceAgentProps> = ({ isActive }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  const generateWavePoints = () => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      const amplitude = isActive ? 15 + Math.sin(animationFrame * 0.1 + i) * 10 : 5;
      const height = Math.max(5, amplitude);
      points.push(height);
    }
    return points;
  };

  const wavePoints = generateWavePoints();

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30'
          : 'bg-gradient-to-r from-slate-400 to-slate-500 shadow-md'
      }`}>
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isActive 
            ? 'ring-4 ring-blue-300 ring-opacity-30 animate-pulse'
            : 'ring-0'
        }`} />
        
        <div className="flex items-center justify-center gap-1 h-8">
          {wavePoints.map((height, index) => (
            <div
              key={index}
              className={`w-1 bg-white rounded-full transition-all duration-75 ${
                isActive ? 'animate-pulse' : ''
              }`}
              style={{ 
                height: `${height}px`,
                animationDelay: `${index * 50}ms`
              }}
            />
          ))}
        </div>
        
        {!isActive && (
          <div className="absolute w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
        )}
      </div>
    </div>
  );
};

export default AIVoiceAgent;