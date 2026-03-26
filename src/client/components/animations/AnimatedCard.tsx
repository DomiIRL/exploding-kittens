import { useEffect, useRef, useState } from 'react';
import { CardAnimation } from './AnimationManager';
import { TheGameClient } from '../../entities/game-client';
import { useAnimationState } from '../../context/AnimationContext';

export function AnimatedCard({ animation }: { animation: CardAnimation }) {
  const { getNode } = useAnimationState();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fromEl = getNode(animation.fromId);
    const toEl = getNode(animation.toId);

    if (!fromEl || !toEl || !cardRef.current) {
      console.warn(`Card Animation Failed!
fromId (${animation.fromId}):`, fromEl, `
toId (${animation.toId}):`, toEl, `
cardRef:`, cardRef.current);
      return;
    }

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    // Determine target width to use for size transitioning
    const getTargetWidth = (el: HTMLElement, rect: DOMRect) => {
      // If it's explicitly a card or a pile, it has valid dimensions
      if (el.classList.contains('pile') || el.classList.contains('card')) {
        return el.offsetWidth || rect.width;
      }
      // If targeting a badge/generic element, assume standard player card size
      const sampleCard = document.querySelector('.card:not(.pile):not(.animated-card)') as HTMLElement;
      return sampleCard ? sampleCard.offsetWidth : 80;
    };

    const fromWidth = getTargetWidth(fromEl, fromRect);
    const toWidth = getTargetWidth(toEl, toRect);

    // Apply strictly to the DOM Ref instead of triggering standard React renders mid-animation

    // 1. Set initial geometry
    cardRef.current.style.transition = 'none';
    cardRef.current.style.left = `${fromRect.left + fromRect.width / 2}px`;
    cardRef.current.style.top = `${fromRect.top + fromRect.height / 2}px`;
    cardRef.current.style.width = `${fromWidth}px`;
    cardRef.current.style.backgroundImage = `url(${TheGameClient.getCardTexture(animation.card as any)})`;
    
    // Unhide securely
    setIsVisible(true);

    // 2. Play transition explicitly targeting 'to' rect in next animation frames
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = `all ${animation.durationMs}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
        cardRef.current.style.left = `${toRect.left + toRect.width / 2}px`;
        cardRef.current.style.top = `${toRect.top + toRect.height / 2}px`;
        cardRef.current.style.width = `${toWidth}px`;
      });
      return () => cancelAnimationFrame(frame2);
    });

    return () => cancelAnimationFrame(frame1);
  }, [animation, getNode]);

  return (
    <div 
      ref={cardRef}
      className={`animated-card card ${isVisible ? '' : 'hidden'}`} 
      style={{
        position: 'fixed',
        transform: 'translate(-50%, -50%) scale(1)',
        zIndex: 65,
        pointerEvents: 'none',
        display: isVisible ? 'flex' : 'none'
      }}
    />
  );
}
