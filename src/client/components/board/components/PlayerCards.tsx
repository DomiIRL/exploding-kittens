import Card from './Card';

interface PlayerCardsProps {
  count: number;
  isCurrentPlayer: boolean;
}

export default function PlayerCards({ count, isCurrentPlayer }: PlayerCardsProps) {
  const fanSpread = Math.min(count * 4, 40);
  const angleStep = count > 1 ? fanSpread / (count - 1) : 0;
  const baseOffset = -fanSpread / 2;
  const spreadDistance = 15;

  return (
    <div className="player-cards">
      {Array(count).fill(null).map((_, i) => {
        const angle = baseOffset + (angleStep * i);
        const offsetX = (i - (count - 1) / 2) * spreadDistance;
        const offsetY = Math.abs(angle) * 0.3;
        return (
          <Card
            key={i}
            index={i}
            count={count}
            angle={angle}
            offsetX={offsetX}
            offsetY={offsetY}
            isCurrentPlayer={isCurrentPlayer}
          />
        );
      })}
    </div>
  );
}

