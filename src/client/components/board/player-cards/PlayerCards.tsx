import Card from '../card/Card';
import PlayerRenderState from "../../../model/PlayerState.ts";

interface PlayerCardsProps {
  playerState: PlayerRenderState;
}

export default function PlayerCards({ playerState }: PlayerCardsProps) {
  const { isSelfSpectator, isSelf, handCount, hand } = playerState;
  const fanSpread = isSelfSpectator || isSelf ? Math.min(handCount * 6, 60) : Math.min(handCount * 4, 40);
  const angleStep = handCount > 1 ? fanSpread / (handCount - 1) : 0;
  const baseOffset = -fanSpread / 2;
  const spreadDistance = isSelf ? 15 : isSelfSpectator ? 10 : 5;

  return (
      <div className="player-cards">
        {Array(handCount).fill(null).map((_, i) => {
          const angle = baseOffset + (angleStep * i);
          const offsetX = (i - (handCount - 1) / 2) * spreadDistance;
          const offsetY = Math.abs(angle) * 0.3;

          const card = hand && hand.length > 0 ? hand[i] : null;

          return (
              <Card
                  card={card}
                  key={i}
                  index={i}
                  count={playerState.handCount}
                  angle={angle}
                  offsetX={offsetX}
                  offsetY={offsetY}
              />
          );
        })}
      </div>
  );
}
