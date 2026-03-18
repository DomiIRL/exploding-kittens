import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {useEffect, useState} from "react";
import {GameContext} from "../../../types/component-props";

interface TableProps {
  gameContext: GameContext;
}

export default function Table({gameContext}: TableProps) {
  const {G, moves} = gameContext;
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastDrawPileLength, setLastDrawPileLength] = useState(G.client.drawPileLength);
  const [lastDiscardPileLength, setLastDiscardPileLength] = useState(G.discardPile.length);
  const [isHoveringDrawPile, setIsHoveringDrawPile] = useState(false);
  const [reactionTimeLeftMs, setReactionTimeLeftMs] = useState(0);

  const discardCard = G.discardPile[G.discardPile.length - 1];
  const discardImage = discardCard ? `/assets/cards/${discardCard.name}/${discardCard.index}.png` : "None";

  // Detect when a card is drawn
  useEffect(() => {
    if (G.client.drawPileLength< lastDrawPileLength) {
      setIsDrawing(true);
      setTimeout(() => setIsDrawing(false), 400);
    }
    setLastDrawPileLength(G.client.drawPileLength);
  }, [G.client.drawPileLength, lastDrawPileLength]);

  // Detect when a shuffle card is played
  useEffect(() => {
    const lastCard = G.discardPile[G.discardPile.length - 1];
    if (G.discardPile.length > lastDiscardPileLength && lastCard?.name === 'shuffle') {
      setIsShuffling(true);
      setTimeout(() => setIsShuffling(false), 800);
    }
    setLastDiscardPileLength(G.discardPile.length);
  }, [G.discardPile.length, lastDiscardPileLength, G.discardPile]);

  useEffect(() => {
    if (!G.pendingCardPlay) {
      setReactionTimeLeftMs(0);
      return;
    }

    const updateTimer = () => {
      const remainingMs = Math.max(0, G.pendingCardPlay!.expiresAtMs - Date.now());
      setReactionTimeLeftMs(remainingMs);
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(intervalId);
  }, [G.pendingCardPlay?.expiresAtMs]);

  const reactionTimeLeftSeconds = Math.max(0, (reactionTimeLeftMs / 1000)).toFixed(1);
  const nopeStatusText = (G.pendingCardPlay && G.pendingCardPlay.isNoped)
    ? 'Noped'
    : 'Not Noped';

  const handleDrawClick = () => {
    if (!isDrawing) {
      moves.drawCard();
    }
  };

  return (
    <div className="table">
      <div className="table-center">
        <div className="center-stack">
          <div className="card-piles">
            <div
              className={`pile discard-pile ${!discardCard ? 'empty' : ''}`}
              style={{backgroundImage: discardCard ? `url(${discardImage})` : 'none'}}
              data-animation-id="discard-pile"
            />
            <div
              className={`pile draw-pile ${isDrawing ? 'drawing' : ''} ${isShuffling ? 'shuffling' : ''}`}
              style={{backgroundImage: `url(${back})`}}
              onClick={handleDrawClick}
              onMouseEnter={() => setIsHoveringDrawPile(true)}
              onMouseLeave={() => setIsHoveringDrawPile(false)}
              data-animation-id="draw-pile"
            >
              {isHoveringDrawPile && G.client.drawPileLength > 0 && (
                <div className="card-counter">
                  {G.client.drawPileLength}
                </div>
              )}
            </div>
          </div>
          {G.pendingCardPlay && (
            <div className="reaction-window-indicator">
              Nope Timer {reactionTimeLeftSeconds}s -&gt; {nopeStatusText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

