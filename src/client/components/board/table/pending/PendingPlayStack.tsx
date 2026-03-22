import '../../player/card/Card.css';
import './PendingPlayStack.css';
import {useRef, useState} from 'react';
import CardPreview from '../../CardPreview.tsx';
import {useGame} from "../../../../context/GameContext.tsx";

export default function PendingPlayStack() {
  const game = useGame();

  const pendingCard = game.piles.pendingCard;
  if (!pendingCard) return null;

  const targetCard = pendingCard.card;
  const isNoped = pendingCard.isNoped;
  const [isHovered, setIsHovered] = useState(false);
  const pileRef = useRef<HTMLDivElement>(null);

  const cardImage = `/assets/cards/${targetCard.name}/${targetCard.index}.png`;

  return (
    <div className="pending-stack-container">
      <div
        ref={pileRef}
        className="pile"
        style={{
          backgroundImage: `url(${cardImage})`,
        }}
        data-animation-id="discard-pile"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      <CardPreview
        cardImage={cardImage} 
        anchorRef={pileRef} 
        isVisible={isHovered} 
      />

      {/*Only show when at least one nope card been played*/}
      {pendingCard.nopeCount > 0 && (
        <div className={`status-badge ${isNoped ? 'noped' : 'active'}`}>
          {isNoped ? 'Noped' : 'Un-Noped'}
        </div>
      )}

      {/* Nope Button */}
      {game.selfPlayer?.canNope && (
        <button 
          className="nope-button-inline"
          onClick={() => game.playNope()}
        >
          {isNoped ? 'Un-Nope!' : 'NOPE!'}
        </button>
      )}
    </div>
  );
}
