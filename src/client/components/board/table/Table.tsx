import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {GameState} from "../../../../common";

export default function Table({ G, moves }: { G: GameState, moves: any }) {

  const discardCard = G.discardPile[G.discardPile.length - 1];
  const discardImage = discardCard ? `/assets/cards/${discardCard.name}/${discardCard.index}.png` : "None";

  return (
    <div className="table">
      <div className="table-center">
        <div className="card-piles">
          <div
            className="pile discard-pile empty"
            style={{ backgroundImage: `url(${discardImage})` }}
          />
          <div
            className="pile draw-pile"
            style={{ backgroundImage: `url(${back})` }}
            onClick={() => moves.drawCard()}
          />
        </div>
      </div>
    </div>
  );
}

