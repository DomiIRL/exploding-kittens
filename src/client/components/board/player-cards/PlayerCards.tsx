import Card from '../card/Card';
import PlayerRenderState from "../../../model/PlayerState";
import {AnimationCallbacks, PlayerInteractionHandlers} from "../../../types/component-props";
import {useState} from 'react';
import '../card/Card.css'; // Ensure Card CSS is available for reusing styles if needed
import { useResponsive } from '../../../context/ResponsiveContext';
import HoverCardPreview from '../card/HoverCardPreview';

interface PlayerCardsProps {
  playerState: PlayerRenderState;
  moves?: any;
  playerID: string;
  isChoosingCardToGive: boolean;
  isInNowCardStage: boolean;
  animationCallbacks: AnimationCallbacks;
  interactionHandlers: PlayerInteractionHandlers;
}

export default function PlayerCards({
  playerState,
  moves,
  isChoosingCardToGive,
  isInNowCardStage,
  interactionHandlers
}: PlayerCardsProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const {onCardGive} = interactionHandlers;
  const {isSelfSpectator, isSelf, isTurn, handCount, hand} = playerState;
  const fanSpread = isSelfSpectator || isSelf ? Math.min(handCount * 6, 60) : Math.min(handCount * 4, 40);
  const angleStep = handCount > 1 ? fanSpread / (handCount - 1) : 0;
  const baseOffset = handCount > 1 ? -fanSpread / 2 : 0;
  const spreadDistance = isSelf ? 15 : isSelfSpectator ? 10 : 5;
  const canPlay = (isSelf && (isTurn || isInNowCardStage)) || isChoosingCardToGive;
  
  const { isMobile } = useResponsive();

  const handleCardSelect = (serverIndex: number) => {
    if (selectedCardIndex === serverIndex) {
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(serverIndex);
    }
  };

  const handleAction = () => {
    if (selectedCardIndex === null) return;

    if (isChoosingCardToGive && onCardGive) {
      onCardGive(selectedCardIndex);
    } else if (isSelf && (isTurn || isInNowCardStage)) {
      if (isInNowCardStage && moves.playNowCard) {
        moves.playNowCard(selectedCardIndex);
      } else if (moves.playCard) {
        moves.playCard(selectedCardIndex);
      }
    }

    setSelectedCardIndex(null);
  };

  const isSelectedCardValid = hand && hand.some(c => c.serverIndex === selectedCardIndex);
  const showOverlay = selectedCardIndex !== null && isSelectedCardValid && isMobile;

  // Prepare card image URL for mobile preview
  const selectedCard = showOverlay && hand ? hand.find(c => c.serverIndex === selectedCardIndex) : null;
  const selectedCardImage = selectedCard ? `/assets/cards/${selectedCard.name}/${selectedCard.index}.png` : '';


  return (
    <div className="player-cards">
      {Array(handCount).fill(null).map((_, i) => {
        const angle = baseOffset + (angleStep * i);
        const offsetX = (i - (handCount - 1) / 2) * spreadDistance;
        const offsetY = Math.abs(angle) * 0.3;

        const card = hand && hand.length > 0 ? hand[i] : null;
        const serverIndex = card?.serverIndex ?? i;

        return (
          <Card
            card={card}
            key={i}
            index={i}
            count={playerState.handCount}
            angle={angle}
            offsetX={offsetX}
            offsetY={offsetY}
            moves={moves}
            isClickable={canPlay}
            isSelected={selectedCardIndex === serverIndex}
            isChoosingCardToGive={isChoosingCardToGive}
            isInNowCardStage={isInNowCardStage}
            onCardGive={onCardGive}
            onSelect={isMobile ? handleCardSelect : undefined}
          />
        );
      })}

      {/* Mobile Card Preview Panel */}
      {showOverlay && isMobile && selectedCardImage && (
        <HoverCardPreview 
          cardImage={selectedCardImage}
          isVisible={true}
          isMobile={true}
          canPlay={canPlay}
          actionLabel={isChoosingCardToGive ? "Give This Card" : "Play Card"}
          onAction={handleAction}
          onClose={() => setSelectedCardIndex(null)}
        />
      )}
    </div>
  );
}
