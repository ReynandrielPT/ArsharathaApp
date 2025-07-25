import React from 'react';

export const bionicReading = (text: string) => {
  return text.split(' ').map((word, i) => {
    const half = Math.ceil(word.length / 2);
    const boldPart = word.slice(0, half);
    const normalPart = word.slice(half);
    return (
      <React.Fragment key={i}>
        <b>{boldPart}</b>{normalPart}{' '}
      </React.Fragment>
    );
  });
};