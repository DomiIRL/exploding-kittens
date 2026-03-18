import {PendingCardPlay} from '../../../../common';
import '../card/Card.css'; // Import the shared card styles
import './PendingPlayStack.css';
import {useRef, useState} from 'react';
import HoverCardPreview from '../card/HoverCardPreview';

interface PendingPlayStackProps {
  pendingPlay: PendingCardPlay;
}

export default function PendingPlayStack({pendingPlay}: PendingPlayStackProps) {
  const targetCard = pendingPlay.card;
  const isNoped = pendingPlay.isNoped;
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
      
      <HoverCardPreview 
        cardImage={cardImage} 
        anchorRef={pileRef} 
        isVisible={isHovered} 
      />

      {/*Only show when at least one nope card been played*/}
      {pendingPlay.nopeCount > 0 && (
        <div className={`status-badge ${isNoped ? 'noped' : 'active'}`}>
          {isNoped ? 'Noped' : 'Un-Noped'}
        </div>
      )}
    </div>
  );
}
