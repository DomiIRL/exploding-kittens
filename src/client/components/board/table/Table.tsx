import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {useEffect, useState, useRef} from "react";
import {GameContext} from "../../../types/component-props";
import PendingPlayStack from './PendingPlayStack';

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
  const pendingCardRef = useRef(G.pendingCardPlay);
  useEffect(() => {
    // If there is an active pending play, do not trigger shuffle yet
    if (G.pendingCardPlay) {
      pendingCardRef.current = G.pendingCardPlay;
      return;
    }

    const wasPending = pendingCardRef.current;
    pendingCardRef.current = null;

    // Check if discard pile changed
    const discardChanged = G.discardPile.length > lastDiscardPileLength;
    
    // Check if we just finished a pending play that was a Shuffle and NOT noped
    const resolvedShuffle = wasPending && 
                            !wasPending.isNoped && 
                            wasPending.card.name === 'shuffle';

    const lastCard = G.discardPile[G.discardPile.length - 1];
    
    // Trigger if newly placed shuffle
    // OR if delayed resolution happened
    if ((discardChanged || resolvedShuffle) && lastCard?.name === 'shuffle') {
      // Double check it wasn't noped if it came from pending
      if (!(wasPending && wasPending.isNoped)) {
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 800);
      }
    }
    
    if (!G.pendingCardPlay) {
        setLastDiscardPileLength(G.discardPile.length);
    }
  }, [G.discardPile.length, lastDiscardPileLength, G.discardPile, G.pendingCardPlay]);

  const handleDrawClick = () => {
    if (!isDrawing) {
      moves.drawCard();
    }
  };

  // Timer calculation
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  useEffect(() => {
    if (!G.pendingCardPlay) {
      setTimeLeftMs(0);
      return;
    }
    const update = () => setTimeLeftMs(Math.max(0, G.pendingCardPlay!.expiresAtMs - Date.now()));
    update();
    const i = setInterval(update, 50);
    return () => clearInterval(i);
  }, [G.pendingCardPlay?.expiresAtMs, G.pendingCardPlay?.startedAtMs]);

  // Calculate generic progress 0-1
  const windowDuration = G.pendingCardPlay ? (G.pendingCardPlay.expiresAtMs - G.pendingCardPlay.startedAtMs) : 3000;
  const progressRatio = G.pendingCardPlay ? (timeLeftMs / windowDuration) : 0;
  const degrees = progressRatio * 360;

  return (
    <div className="table">
      <div 
        className={`table-center ${G.pendingCardPlay ? 'has-pending-play' : ''}`}
        style={{
          '--timer-deg': `${degrees}deg`,
          '--timer-opacity': G.pendingCardPlay ? 1 : 0
        } as any}
      >
        <div className="table-timer-overlay" />
        <div className="center-stack">
          <div className="card-piles">
            {!G.pendingCardPlay && (
              <div
                className={`pile discard-pile ${!discardCard ? 'empty' : ''}`}
                style={{backgroundImage: discardCard ? `url(${discardImage})` : 'none'}}
                data-animation-id="discard-pile"
              />
            )}
            
            {G.pendingCardPlay && (
               /* Replaces discard pile */
               <PendingPlayStack 
                 pendingPlay={G.pendingCardPlay!} 
               />
            )}

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
        </div>
      </div>
    </div>
  );
}
