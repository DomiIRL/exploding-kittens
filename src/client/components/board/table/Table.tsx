import {useEffect, useState} from "react";
import TurnBadge from './turn-badge/TurnBadge';
import {DrawPile} from './pile/DrawPile';
import {DiscardPile} from './pile/DiscardPile';
import {useGame} from "../../../context/GameContext.tsx";
import './Table.css';

export default function Table() {
  const game = useGame()

  // Timer calculation
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  useEffect(() => {
    if (!game.piles.pendingCard) {
      setTimeLeftMs(0);
      return;
    }
    const update = () => setTimeLeftMs(Math.max(0, game.piles.pendingCard!.expiresAtMs - Date.now()));
    update();
    const i = setInterval(update, 50);
    return () => clearInterval(i);
  }, [game.piles.pendingCard?.expiresAtMs, game.piles.pendingCard?.startedAtMs]);

  // Calculate generic progress 0-1
  const windowDuration = game.piles.pendingCard ? (game.piles.pendingCard.expiresAtMs - game.piles.pendingCard.startedAtMs) : 3000;
  const progressRatio = game.piles.pendingCard ? (timeLeftMs / windowDuration) : 0;
  const degrees = progressRatio * 360;


  const isNoped = game.piles.pendingCard?.isNoped ?? false;

  return (
    <div className="table">
      <div 
        className={`table-center ${game.piles.pendingCard ? 'has-pending-play' : ''} ${isNoped ? 'is-noped' : ''}`}
        style={{
          '--timer-deg': `${degrees}deg`,
          '--timer-opacity': game.piles.pendingCard ? 1 : 0
        } as any}
      >
        <div className="table-timer-overlay" />
        <div className="center-stack">
          <TurnBadge />

          <div className="card-piles">
            <DiscardPile />
            <DrawPile />
          </div>
        </div>
      </div>
    </div>
  );
}
