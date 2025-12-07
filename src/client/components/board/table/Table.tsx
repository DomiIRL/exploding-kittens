import back from '/assets/cards/back/0.jpg';
import './Table.css';
import {GameState} from "../../../../common";
import {useEffect, useState} from "react";

export default function Table({G, moves}: { G: GameState, moves: any }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastDrawPileLength, setLastDrawPileLength] = useState(G.drawPile.length);
  const [lastDiscardPileLength, setLastDiscardPileLength] = useState(G.discardPile.length);

  const discardCard = G.discardPile[G.discardPile.length - 1];
  const discardImage = discardCard ? `/assets/cards/${discardCard.name}/${discardCard.index}.png` : "None";

  // Detect when a card is drawn
  useEffect(() => {
    if (G.drawPile.length < lastDrawPileLength) {
      setIsDrawing(true);
      setTimeout(() => setIsDrawing(false), 400);
    }
    setLastDrawPileLength(G.drawPile.length);
  }, [G.drawPile.length, lastDrawPileLength]);

  // Detect when a shuffle card is played
  useEffect(() => {
    const lastCard = G.discardPile[G.discardPile.length - 1];
    if (G.discardPile.length > lastDiscardPileLength && lastCard?.name === 'shuffle') {
      setIsShuffling(true);
      setTimeout(() => setIsShuffling(false), 800);
    }
    setLastDiscardPileLength(G.discardPile.length);
  }, [G.discardPile.length, lastDiscardPileLength, G.discardPile]);

  const handleDrawClick = () => {
    if (!isDrawing) {
      moves.drawCard();
    }
  };

  return (
    <div className="table">
      <div className="table-center">
        <div className="card-piles">
          <div
            className={`pile discard-pile ${!discardCard ? 'empty' : ''}`}
            style={{backgroundImage: discardCard ? `url(${discardImage})` : 'none'}}
            data-animation-id="discard-pile"
          />
          <div
            className={`pile draw-pile ${isDrawing ? 'drawing' : ''} ${isShuffling ? 'shuffling' : ''}`}
            style={{backgroundImage: `url(${back})`}}
            onClick={handleDrawClick}
            data-animation-id="draw-pile"
          />
        </div>
      </div>
    </div>
  );
}

