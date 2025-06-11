"use client"
import React from 'react';
import P from '@/pp'

const Hello: React.FC = () => {
  const text = `
    Hello world from TSX
    This is a new line
    And another line here
    You can write anything
    On any line
    Without constraints
  `.trim();

  const words = text.split(/\s+/); // Split by any whitespace (spaces, newlines, tabs)

  return (<P>
    <div>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          {word}
          {index < words.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div></P>
  );
};

export default Hello;