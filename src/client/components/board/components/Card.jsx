import React from 'react';
import back from '/assets/cards/back/1.png';
import front from '/assets/cards/exploding_kitten/1.png';

export default function Card({ index, count, angle, offsetX, offsetY, isCurrentPlayer }) {
  return (
      <div
          className="card"
          style={{
            backgroundImage: `url(${isCurrentPlayer ? front : back})`,
            position: 'absolute',
            '--base-transform': `translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)`,
            '--card-index': index,
            '--total-cards': count,
            transformOrigin: 'center 200%',
            zIndex: count - index,
          }}
      />
  );
}
