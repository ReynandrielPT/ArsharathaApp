import React from 'react';

interface BionicReadingProps {
  text: string;
}

const BionicReading: React.FC<BionicReadingProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  const processWord = (word: string) => {
    const half = Math.ceil(word.length / 2);
    const boldPart = word.slice(0, half);
    const normalPart = word.slice(half);
    return (
      <span key={word + Math.random()}>
        <strong className="font-bold">{boldPart}</strong>{normalPart}
      </span>
    );
  };

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {text.split(/(\s+)/).map((segment, index) => {
        // Check if the segment is whitespace
        if (/^\s+$/.test(segment)) {
          return <span key={index}>{segment}</span>;
        }
        // Otherwise, it's a word to be processed
        return processWord(segment);
      })}
    </p>
  );
};

export default BionicReading;
