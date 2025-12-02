import './Card.css';
import back from '/assets/cards/back/0.jpg';
import { CSSProperties, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card as CardType } from "../../../../common";

interface CardProps {
  card: CardType | null;
  index: number;
  count: number;
  angle: number;
  offsetX: number;
  offsetY: number;
}

export default function Card({ card, index, count, angle, offsetX, offsetY,  }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardImage = card ? `/assets/cards/${card.name}/${card.index}.png` : back;

  return (
    <>
      <div
        className="card"
        style={{
          backgroundImage: `url(${cardImage})`,
          position: 'absolute',
          '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
          transformOrigin: 'center 200%',
          zIndex: count - index,
        } as CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {isHovered && card && createPortal(
        <div className="card-preview-overlay">
          <div
            className="card-preview"
            style={{
              backgroundImage: `url(${cardImage})`,
            } as CSSProperties}
          />
        </div>,
        document.body
      )}
    </>
  );
}

