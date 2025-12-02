import './Card.css';
import back from '/assets/cards/back/0.png';
import { CSSProperties } from 'react';
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
  return (
    <div
      className="card"
      style={{
        backgroundImage: `url(${card ? `/assets/cards/${card.name}/${card.index}.png` : back})`,
        position: 'absolute',
        '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
        transformOrigin: 'center 200%',
        zIndex: count - index,
      } as CSSProperties}
    />
  );
}

