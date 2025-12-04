import './Card.css';
import back from '/assets/cards/back/0.jpg';
import {CSSProperties, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Card as CardType, NotPlayable} from "../../../../common";

interface CardProps {
  card: CardType | null;
  index: number;
  count: number;
  angle: number;
  offsetX: number;
  offsetY: number;
  moves?: any;
  isClickable?: boolean;
}

export default function Card({
                               card,
                               index,
                               count,
                               angle,
                               offsetX,
                               offsetY,
                               moves,
                               isClickable,
                             }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOnLeft, setShowOnLeft] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardImage = card ? `/assets/cards/${card.name}/${card.index}.png` : back;

  useEffect(() => {
    if (isHovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportWidth = window.innerWidth;

      // Calculate if there's enough space to show preview on the right
      // Preview width is approximately 40 scale units = 40vw (in worst case)
      const previewWidth = Math.min(40 * (viewportWidth / 100), 40 * (window.innerHeight / 100));
      const tableRadius = Math.min(45 * (viewportWidth / 100), 45 * (window.innerHeight / 100));
      const rightEdgeOfTable = viewportCenterX + tableRadius;
      const spaceOnRight = viewportWidth - rightEdgeOfTable;

      // Show on left only if: opponent card and not enough space on right
      const notEnoughSpaceOnRight = spaceOnRight < (previewWidth + 20); // 20px padding
      const isOnRightSide = cardCenterX > viewportCenterX;

      setShowOnLeft(isOnRightSide && notEnoughSpaceOnRight);
    }
  }, [isHovered]);

  const handleClick = () => {
    if (isClickable && moves) {
      try {
        moves.playCard(index);
      } catch (error) {
        if (error instanceof NotPlayable) {
          console.log('Card not playable');
        } else {
          console.error('Unexpected error playing card:', error);
        }
      }
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`card ${isClickable ? 'clickable' : ''}`}
        style={{
          backgroundImage: `url(${cardImage})`,
          position: 'absolute',
          '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
          transformOrigin: 'center 200%',
          zIndex: count - index,
        } as CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />
      {isHovered && card && createPortal(
        <div className={`card-preview-overlay ${showOnLeft ? 'show-left' : 'show-right'}`}>
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

