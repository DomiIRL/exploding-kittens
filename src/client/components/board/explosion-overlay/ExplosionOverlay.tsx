import './ExplosionOverlay.css';
import {useEffect, useState} from 'react';

export type ExplosionEvent = 'exploding' | 'defused' | null;

interface ExplosionOverlayProps {
  event: ExplosionEvent;
  playerName: string;
  isSelf: boolean;
  onComplete: () => void;
}

export default function ExplosionOverlay({event, playerName, isSelf, onComplete}: ExplosionOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event || !isVisible) return null;

  return (
    <div className={`explosion-overlay ${event} ${isVisible ? 'visible' : ''}`}>
      <div className="explosion-content">
        {event === 'exploding' && (
          <>
            <div className="explosion-icon">💥</div>
            <div className="explosion-title">BOOM!</div>
            <div className="explosion-subtitle">
              {isSelf ? 'You drew an Exploding Kitten!' : `${playerName} drew an Exploding Kitten!`}
            </div>
          </>
        )}
        {event === 'defused' && (
          <>
            <div className="explosion-icon">🛡️</div>
            <div className="explosion-title">DEFUSED!</div>
            <div className="explosion-subtitle">
              {isSelf ? 'You used a Defuse card!' : `${playerName} used a Defuse card!`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

