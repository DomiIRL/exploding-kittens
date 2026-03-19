import './Card.css';
import back from '/assets/cards/back/0.jpg';
import {CSSProperties, useRef, useState} from 'react';
import {CardWithServerIndex} from "../../../model/PlayerState";
import HoverCardPreview from './HoverCardPreview';
import {useResponsive} from "../../../context/ResponsiveContext.tsx";

interface CardProps {
  card: CardWithServerIndex | null;
  index: number;
  count: number;
  angle: number;
  offsetX: number;
  offsetY: number;
  moves?: any;
  isClickable?: boolean;
  isChoosingCardToGive?: boolean;
  isInNowCardStage?: boolean;
  onCardGive?: (cardIndex: number) => void;
}

export default function Card({
                               card,
                               index,
                               count,
                               angle,
                               offsetX,
                               offsetY,
                               moves,
                               isClickable,
                               isChoosingCardToGive = false,
                               isInNowCardStage = false,
                               onCardGive,
                             }: CardProps) {

  const { isMobile } = useResponsive();

  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardImage = card ? `/assets/cards/${card.name}/${card.index}.png` : back;

  const handleAction = () => {
    if (!card) return;

    const serverIndex = card.serverIndex ?? index;

    // If choosing a card to give (favor card flow)
    if (isChoosingCardToGive && onCardGive) {
      onCardGive(serverIndex);
      return;
    }

    // Otherwise, play the card (normal turn or now-card reaction stage)
    if (isClickable && moves) {
      try {
        if (isInNowCardStage && moves.playNowCard) {
          moves.playNowCard(serverIndex);
        } else {
          moves.playCard(serverIndex);
        }

        // Animation is now handled by useCardAnimations reacting to state changes
        // This ensures animation only plays if the move was valid and server accepted it
      } catch (error) {
        console.error('Unexpected error playing card:', error);
      }
    }
  }

  const handleClick = () => {
    if (isMobile) {
      setIsSelected(true)
      return;
    }

    handleAction();
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`card ${isClickable ? 'clickable' : ''} ${isHovered ? 'selected' : ''}`}
        style={{
          backgroundImage: `url(${cardImage})`,
          position: 'absolute',
          '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
          transformOrigin: 'center 200%',
          zIndex: count - index,
        } as CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />
      <HoverCardPreview 
        cardImage={cardImage} 
        anchorRef={cardRef} 
        isVisible={(isMobile ? isSelected : isHovered) && !!card}
        actionLabel={isChoosingCardToGive ? "Give This Card" : "Play Card"}
        canPlay={isClickable}
        onAction={() => {
          setIsSelected(false);
          handleAction();
        }}
        onClose={() => setIsSelected(false)}
      />
    </>
  );
}
