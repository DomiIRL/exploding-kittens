import './CardAnimation.css';
import React, {useEffect, useState} from 'react';
import {Card} from '../../../../common';

export interface CardAnimationData {
  id: string;
  card: Card | null; // null means face-down
  from: { x: number; y: number };
  to: { x: number; y: number };
  duration: number;
  delay?: number;
}

interface CardAnimationProps {
  animation: CardAnimationData;
  onComplete: (id: string) => void;
}

export default function CardAnimation({animation, onComplete}: CardAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardImage = animation.card
    ? `/assets/cards/${animation.card.name}/${animation.card.index}.png`
    : '/assets/cards/back/0.jpg';

  useEffect(() => {
    // Start animation immediately
    setIsVisible(true);

    // Complete animation after duration
    const completeTimer = setTimeout(() => {
      onComplete(animation.id);
    }, animation.duration + (animation.delay || 0));

    return () => {
      clearTimeout(completeTimer);
    };
  }, [animation, onComplete]);

  return (
    <div
      className={`flying-card ${isVisible ? 'flying' : ''}`}
      style={{
        backgroundImage: `url(${cardImage})`,
        left: `${animation.from.x}px`,
        top: `${animation.from.y}px`,
        '--from-x': `0px`,
        '--from-y': `0px`,
        '--to-x': `${animation.to.x - animation.from.x}px`,
        '--to-y': `${animation.to.y - animation.from.y}px`,
        '--duration': `${animation.duration}ms`,
      } as React.CSSProperties}
    />
  );
}

