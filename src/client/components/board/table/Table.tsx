import back from '/assets/cards/back/0.jpg';
import './Table.css';

export default function Table({ moves }: { moves: any }) {
  return (
    <div className="table">
      <div className="table-center">
        <div className="card-piles">
          <div
            className="pile discard-pile empty"
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

