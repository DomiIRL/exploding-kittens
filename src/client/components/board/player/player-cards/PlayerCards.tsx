import Card from '../card/Card.tsx';
import '../card/Card.css';
import {ICard, Player, sortCards} from "../../../../../common";
import {useGame} from "../../../../context/GameContext.tsx";

export interface CardWithServerIndex extends ICard {
  serverIndex: number;
}

interface PlayerCardsProps {
  player: Player;
}

export default function PlayerCards({
  player
}: PlayerCardsProps) {
  const game = useGame();

  const cardCount = player.cardCount;
  const fanSpread = game.isSpectator || game.isSelf(player) ? Math.min(cardCount * 6, 60) : Math.min(cardCount * 4, 40);
  const angleStep = cardCount > 1 ? fanSpread / (cardCount - 1) : 0;
  const baseOffset = cardCount > 1 ? -fanSpread / 2 : 0;
  const spreadDistance = game.isSelf(player) ? 25 : game.isSpectator ? 10 : 5;

  const cardsWithIndices: CardWithServerIndex[] = player.hand.map((card, index) => ({
    ...card,
    serverIndex: index
  }));
  const hand = sortCards(cardsWithIndices) as CardWithServerIndex[];

  return (
    <div className="player-cards">
      {Array(cardCount).fill(null).map((_, i) => {
        const angle = baseOffset + (angleStep * i);
        const offsetX = (i - (cardCount - 1) / 2) * spreadDistance;
        const offsetY = Math.abs(angle) * 0.3;

        const card = hand && hand.length > 0 ? hand[i] : null;

        return (
          <Card
            owner={player}
            card={card}
            key={i}
            index={i}
            angle={angle}
            offsetX={offsetX}
            offsetY={offsetY}
          />
        );
      })}
    </div>
  );
}
