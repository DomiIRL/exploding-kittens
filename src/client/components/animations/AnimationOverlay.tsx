import { useEffect, useState } from 'react';
import { CardAnimation, animationManager } from './AnimationManager';
import { AnimatedCard } from './AnimatedCard';
import './AnimationOverlay.css';
import '../board/player/card/Card.css';

export function AnimationOverlay() {
  const [animations, setAnimations] = useState<CardAnimation[]>([]);

  useEffect(() => {
    const unsubscribe = animationManager.subscribe(newAnimations => {
      setAnimations(newAnimations);
    });
    return () => unsubscribe();
  }, []);

  if (animations.length === 0) return null;

  return (
    <>
      <div className="animation-interaction-blocker" />
      {animations.map(anim => <AnimatedCard key={anim.id} animation={anim} />)}
    </>
  );
}
