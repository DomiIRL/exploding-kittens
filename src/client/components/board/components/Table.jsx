import React from 'react';
import back from '/assets/cards/back/1.png';
import front from '/assets/cards/exploding_kitten/1.png';

export default function Table() {
  return (
      <div className="table">
        <div className="table-center">
          <div className="card-piles">
            <div
                className="pile discard-pile"
                style={{ backgroundImage: `url(${front})` }}
            />
            <div
                className="pile draw-pile"
                style={{ backgroundImage: `url(${back})` }}
            />
          </div>
        </div>
      </div>
  );
}
