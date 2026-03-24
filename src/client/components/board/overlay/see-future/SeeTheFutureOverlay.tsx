import './SeeTheFutureOverlay.css';
import {useGame} from "../../../../context/GameContext.tsx";
import {VIEWING_FUTURE} from "../../../../../common/constants/stages.ts";
import {Card} from "../../../../../common/entities/card.ts";
import {TheGameClient} from "../../../../entities/game-client.ts";

export default function SeeTheFutureOverlay() {
  const game = useGame();

  if (!game.selfPlayer?.isInStage(VIEWING_FUTURE)) {
    return null;
  }

  // Get the top cards from the draw pile that are visible
  const cards: Card[] = game.piles.drawPile.allCards;

  if (!cards || cards.length === 0) {
    console.error("No cards available to see in the future! This shouldn't happen.");
    return null;
  }

  const handleFutureClose = () => {
    if (game.moves.closeFutureView) {
      game.moves.closeFutureView();
    }
  }

  return (
    <div className="see-future-overlay">
      <div className="see-future-content">
        <h2 className="see-future-title">The Future</h2>
        <div className="see-future-description">
          These are the next cards to be drawn from left to right:
        </div>
        <div className="see-future-cards">
          {cards.map((card, index) => (
            <div key={index} className="see-future-card-wrapper">
              <div className="see-future-card-position">#{index + 1}</div>
              <div
                className="see-future-card"
                style={{
                  backgroundImage: `url(${TheGameClient.getCardTexture(card)})`,
                }}
              />
            </div>
          ))}
        </div>
        <button className="see-future-close-btn" onClick={handleFutureClose}>
          Close
        </button>
      </div>
    </div>
  );
}

