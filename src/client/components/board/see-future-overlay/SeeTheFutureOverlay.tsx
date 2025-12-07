import './SeeTheFutureOverlay.css';
import {Card} from '../../../../common';

interface SeeTheFutureOverlayProps {
  cards: Card[];
  onClose: () => void;
}

export default function SeeTheFutureOverlay({ cards, onClose }: SeeTheFutureOverlayProps) {
  return (
    <div className="see-future-overlay">
      <div className="see-future-content">
        <h2 className="see-future-title">The Future</h2>
        <div className="see-future-description">
          These are the next cards to be drawn from left to right:
        </div>
        <div className="see-future-cards">
          {cards.map((card, index) => (
            <div key={index} className="see-future-card-wrapper">
              <div className="see-future-card-position">#{index + 1}</div>
              <div
                className="see-future-card"
                style={{
                  backgroundImage: `url(/assets/cards/${card.name}/${card.index}.png)`,
                }}
              />
            </div>
          ))}
        </div>
        <button className="see-future-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

