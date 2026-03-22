import './Card.css';
import back from '/assets/cards/back/0.jpg';
import {CSSProperties, useRef, useState} from 'react';
import HoverCardPreview from './HoverCardPreview';
import {useResponsive} from "../../../context/ResponsiveContext.tsx";
import {useGame} from "../../../context/GameContext.tsx";
import {Player} from "../../../../common";
import {CardWithServerIndex} from "../player-cards/PlayerCards.tsx";

interface CardProps {
  owner: Player,
  card: CardWithServerIndex | null;
  index: number;
  angle: number;
  offsetX: number;
  offsetY: number;
}

export default function Card({
                               owner,
                               card,
                               index,
                               angle,
                               offsetX,
                               offsetY,
                             }: CardProps) {

  const game = useGame();
  const { isMobile } = useResponsive();

  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardImage = card ? `/assets/cards/${card.name}/${card.index}.png` : back;

  const couldBePlayed = game.isSelf(owner) && game.isSelfCurrentPlayer;

  const handleAction = () => {
    if (!card) {
      return;
    }
    game.selectCard(card.serverIndex);
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
        className={`card ${isHovered ? 'selected' : ''}`}
        style={{
          backgroundImage: `url(${cardImage})`,
          position: 'absolute',
          '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
          transformOrigin: 'center 200%',
          zIndex: owner.cardCount - index,
        } as CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />
      <HoverCardPreview 
        cardImage={cardImage} 
        anchorRef={cardRef} 
        isVisible={(isMobile ? isSelected : isHovered) && !!card}
        actionLabel={game.canGiveCard() ? "Give This Card" : "Play Card"}
        canPlay={couldBePlayed}
        onAction={() => {
          setIsSelected(false);
          handleAction();
        }}
        onClose={() => setIsSelected(false)}
      />
    </>
  );
}
