import { useRef, useState, useCallback } from 'react';
import { Pile } from './Pile';
import { useGame } from '../../../../context/GameContext';
import { useAnimationNode } from '../../../../context/AnimationContext';
import { useResponsive } from '../../../../context/ResponsiveContext';
import { DISCARD } from '../../../../../common/constants/piles';
import CardPreview from '../../CardPreview';

export function DiscardPile() {
  const game = useGame();
  const { isMobile } = useResponsive();
  const discardPileAnimRef = useAnimationNode(DISCARD);

  const [isDiscardPileSelected, setIsDiscardPileSelected] = useState(false);
  const discardPileRef = useRef<HTMLDivElement>(null);

  const setDiscardRef = useCallback((node: HTMLDivElement | null) => {
    if (discardPileRef) {
      (discardPileRef as any).current = node;
    }
    discardPileAnimRef(node);
  }, [discardPileAnimRef]);

  const pendingCard = game.piles.pendingCard;
  const isNoped = pendingCard?.isNoped ?? false;
  const discardCard = pendingCard ? pendingCard.card : game.piles.discardPile.topCard;
  
  // Use card from pending state if present, otherwise use the top of the discard pile
  const displayImage = pendingCard 
    ? game.getCardTexture(pendingCard.card) 
    : game.getDiscardCardTexture();

  return (
    <div style={{ position: 'relative' }}>
      <Pile
        ref={setDiscardRef}
        className={`discard-pile ${!discardCard ? 'empty' : ''}`}
        image={discardCard ? displayImage : undefined}
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
        cardImage={displayImage}
        anchorRef={discardPileRef}
        isVisible={isDiscardPileSelected && !!discardCard}
        onClose={() => setIsDiscardPileSelected(false)}
      />

      {pendingCard && (
        <>
          {/*Only show when at least one nope card been played*/}
          {pendingCard.nopeCount > 0 && (
            <div className={`status-badge ${isNoped ? 'noped' : 'active'}`}>
              {isNoped ? 'Noped' : 'Un-Noped'}
            </div>
          )}

          {/* Nope Button */}
          {game.selfPlayer?.canNope && (
            <button 
              className="nope-button-inline"
              onClick={() => game.playNope()}
            >
              {isNoped ? 'Un-Nope!' : 'NOPE!'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

