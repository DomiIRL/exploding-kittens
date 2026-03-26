import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {useEffect, useState, useRef, useCallback} from "react";
import PendingPlayStack from './pending/PendingPlayStack.tsx';
import TurnBadge from './turn-badge/TurnBadge';
import '../player/card/Card.css';
import CardPreview from '../CardPreview.tsx';
import {useResponsive} from "../../../context/ResponsiveContext.tsx";
import {NAME_SHUFFLE} from "../../../../common/constants/cards.ts";
import {useGame} from "../../../context/GameContext.tsx";
import {useAnimationNode} from "../../../context/AnimationContext.tsx";

export default function Table() {
  const game = useGame()
  const { isMobile } = useResponsive();

  const discardPileAnimRef = useAnimationNode('discard-pile');
  const drawPileAnimRef = useAnimationNode('draw-pile');

  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastDrawPileSize, setLastDrawPileSize] = useState(game.piles.drawPile.size);
  const [lastDiscardPileSize, setLastDiscardPileSize] = useState(game.piles.discardPile.size);
  const [isHoveringDrawPile, setIsHoveringDrawPile] = useState(false);
  const [isDiscardPileSelected, setIsDiscardPileSelected] = useState(false);
  const discardPileRef = useRef<HTMLDivElement>(null);

  const setDiscardRef = useCallback((node: HTMLDivElement | null) => {
    if (discardPileRef) {
      (discardPileRef as any).current = node;
    }
    discardPileAnimRef(node);
  }, [discardPileAnimRef]);

  const discardCard = game.piles.discardPile.topCard;

  // Detect when a card is drawn
  useEffect(() => {
    if (game.piles.drawPile.size < lastDrawPileSize) {
      setIsDrawing(true);
      setTimeout(() => setIsDrawing(false), 400);
    }
    setLastDrawPileSize(game.piles.drawPile.size);
  }, [game.piles.drawPile.size, lastDrawPileSize]);

  // Detect when a shuffle card is played
  const pendingCardRef = useRef(game.piles.pendingCard);
  useEffect(() => {
    // If there is an active pending play, do not trigger shuffle yet
    if (game.piles.pendingCard) {
      pendingCardRef.current = game.piles.pendingCard;
      return;
    }

    const wasPending = pendingCardRef.current;
    pendingCardRef.current = null;

    // Check if discard pile changed
    const discardChanged = game.piles.discardPile.size > lastDiscardPileSize;
    
    // Check if we just finished a pending play that was a Shuffle and NOT noped
    const resolvedShuffle = wasPending && 
                            !wasPending.isNoped && 
                            wasPending.card.name === NAME_SHUFFLE;

    const lastCard = game.piles.discardPile.topCard;
    
    // Trigger if newly placed shuffle
    if ((discardChanged || resolvedShuffle) && lastCard?.name === NAME_SHUFFLE) {
      // Double check it wasn't noped if it came from pending
      if (!(wasPending && wasPending.isNoped)) {
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 800);
      }
    }
    
    if (!game.piles.pendingCard) {
        setLastDiscardPileSize(game.piles.discardPile.size);
    }
  }, [game.piles.discardPile.size, lastDiscardPileSize, game.piles.discardPile, game.piles.pendingCard]);

  const handleDrawClick = () => {
    // wait for previous draw animation to finish before allowing another draw
    if (!isDrawing) {
      game.playDrawCard();
    }
  };

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
            {!game.piles.pendingCard && (
              <>
                <div
                  ref={setDiscardRef}
                  className={`pile discard-pile ${!discardCard ? 'empty' : ''}`}
                  style={{backgroundImage: discardCard ? `url(${game.getDiscardCardTexture()})` : 'none'}}
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
                <CardPreview
                  cardImage={game.getDiscardCardTexture()}
                  anchorRef={discardPileRef}
                  isVisible={isDiscardPileSelected && !!discardCard}
                  onClose={() => setIsDiscardPileSelected(false)}
                />
              </>
            )}
            
            {game.piles.pendingCard && (
               <PendingPlayStack />
            )}

            <div
              ref={drawPileAnimRef}
              className={`pile draw-pile ${isDrawing ? 'drawing' : ''} ${isShuffling ? 'shuffling' : ''}`}
              style={{backgroundImage: `url(${back})`}}
              onClick={handleDrawClick}
              onMouseEnter={() => setIsHoveringDrawPile(true)}
              onMouseLeave={() => setIsHoveringDrawPile(false)}
            >
              {isHoveringDrawPile && game.piles.drawPile.size > 0 && (
                <div className="card-counter">
                  {game.piles.drawPile.size}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
