import {PendingCardPlay} from '../../../../common';
import '../card/Card.css'; // Import the shared card styles
import './PendingPlayStack.css';

interface PendingPlayStackProps {
  pendingPlay: PendingCardPlay;
}

export default function PendingPlayStack({pendingPlay}: PendingPlayStackProps) {
  // Use the first card (the target) or fallback if empty (shouldn't happen)
  const targetCard = pendingPlay.card;
  const isNoped = pendingPlay.isNoped;

  const cardImage = `/assets/cards/${targetCard.name}/${targetCard.index}.png`;

  return (
    <div className="pending-stack-container">
      <div
        className="pile"
        style={{
          backgroundImage: `url(${cardImage})`,
        }}
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
