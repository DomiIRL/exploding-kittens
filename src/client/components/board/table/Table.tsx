import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {useEffect, useState, useRef} from "react";
import {GameContext} from "../../../types/component-props";
import {ICard, canPlayerNope} from '../../../../common';
import PendingPlayStack from './PendingPlayStack';
import TurnBadge from '../turn-badge/TurnBadge';

// Import CSS for card preview to be modular
import '../card/Card.css';
import HoverCardPreview from '../card/HoverCardPreview';
import {useResponsive} from "../../../context/ResponsiveContext.tsx";

interface TableProps {
  gameContext: GameContext;
  playerHand?: ICard[];
}

export default function Table({gameContext, playerHand = []}: TableProps) {

  const { isMobile } = useResponsive();

  const {G, moves, ctx} = gameContext;
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastDrawPileLength, setLastDrawPileLength] = useState(G.client.drawPileLength);
  const [lastDiscardPileLength, setLastDiscardPileLength] = useState(G.piles.discardPile.length);
  const [isHoveringDrawPile, setIsHoveringDrawPile] = useState(false);
  const [isDiscardPileSelected, setIsDiscardPileSelected] = useState(false);
  const discardPileRef = useRef<HTMLDivElement>(null);

  const discardCard = G.piles.discardPile[G.piles.discardPile.length - 1];
  const discardImage = discardCard ? `/assets/cards/${discardCard.name}/${discardCard.index}.png` : "None";

  // Check for Nope card in hand
  const nopeCardIndex = playerHand.findIndex(c => c.name === 'nope');
  
  const canNope = canPlayerNope(G, gameContext.playerID, playerHand);

  const handlePlayNope = () => {
    if (nopeCardIndex !== -1 && moves.playNowCard) {
       moves.playNowCard(nopeCardIndex);
    }
  };

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
    const discardChanged = G.piles.discardPile.length > lastDiscardPileLength;
    
    // Check if we just finished a pending play that was a Shuffle and NOT noped
    const resolvedShuffle = wasPending && 
                            !wasPending.isNoped && 
                            wasPending.card.name === 'shuffle';

    const lastCard = G.piles.discardPile[G.piles.discardPile.length - 1];
    
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
        setLastDiscardPileLength(G.piles.discardPile.length);
    }
  }, [G.piles.discardPile.length, lastDiscardPileLength, G.piles.discardPile, G.pendingCardPlay]);

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

  const turnsRemaining = (G.turnsRemaining || 1) - 1;
  const isCurrentPlayer = ctx.currentPlayer === (gameContext.playerID || '');

  const isNoped = G.pendingCardPlay?.isNoped ?? false;

  return (
    <div className="table">
      <div 
        className={`table-center ${G.pendingCardPlay ? 'has-pending-play' : ''} ${isNoped ? 'is-noped' : ''}`}
        style={{
          '--timer-deg': `${degrees}deg`,
          '--timer-opacity': G.pendingCardPlay ? 1 : 0
        } as any}
      >
        <div className="table-timer-overlay" />
        <div className="center-stack">
          {/* Turns remaining badge (for attack) */}
          <TurnBadge turnsRemaining={turnsRemaining} isCurrentPlayer={isCurrentPlayer} />

          {/* Nope Button moved to PendingPlayStack */}

          <div className="card-piles">
            {!G.pendingCardPlay && (
              <>
                <div
                  ref={discardPileRef}
                  className={`pile discard-pile ${!discardCard ? 'empty' : ''}`}
                  style={{backgroundImage: discardCard ? `url(${discardImage})` : 'none'}}
                  data-animation-id="discard-pile"
                  onMouseEnter={() => {
                    if (!isMobile) setIsDiscardPileSelected(true);
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) setIsDiscardPileSelected(false);
                  }}
                  onClick={() => {
                    if (isMobile) setIsDiscardPileSelected(true);
                  }}
                />
                <HoverCardPreview 
                  cardImage={discardImage}
                  anchorRef={discardPileRef}
                  isVisible={isDiscardPileSelected && !!discardCard}
                  onClose={() => setIsDiscardPileSelected(false)}
                />
              </>
            )}
            
            {G.pendingCardPlay && (
               /* Replaces discard pile */
               <PendingPlayStack 
                 pendingPlay={G.pendingCardPlay!}
                 canNope={canNope}
                 onNope={handlePlayNope}
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
