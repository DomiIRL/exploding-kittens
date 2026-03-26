import { useEffect, useState } from 'react';
import { CardAnimation } from './AnimationManager';
import { TheGameClient } from '../../entities/game-client';

export function AnimatedCard({ animation }: { animation: CardAnimation }) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fromEl = document.querySelector(`[data-animation-id="${animation.fromId}"]`);
    const toEl = document.querySelector(`[data-animation-id="${animation.toId}"]`);

    if (!fromEl || !toEl) {
      console.warn(`Card Animation Failed: Could not find elements [${animation.fromId}] -> [${animation.toId}]`);
      return;
    }

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    // Initialize Card Style Position Based on 'From' Rect Position
    const initialStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${fromRect.left + fromRect.width / 2}px`,
      top: `${fromRect.top + fromRect.height / 2}px`,
      backgroundImage: `url(${TheGameClient.getCardTexture(animation.card as any)})`,
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'none',
      zIndex: 9999,
      pointerEvents: 'none', // Cards moving shouldn't receive pointer events
    };

    setStyle(initialStyle);
    setIsVisible(true);

    // Apply specific CSS transition smoothly to target coordinate 'to' rect
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setStyle(prev => ({
          ...prev,
          left: `${toRect.left + toRect.width / 2}px`,
          top: `${toRect.top + toRect.height / 2}px`,
          transition: `all ${animation.durationMs}ms cubic-bezier(0.25, 0.8, 0.25, 1)`, // Smooth Ease out cubic bezier
        }));
      });
      return () => cancelAnimationFrame(frame2);
    });

    return () => cancelAnimationFrame(frame1);
  }, [animation]);

  if (!isVisible) return null;

  return <div style={style} className="animated-card card" />;
}
