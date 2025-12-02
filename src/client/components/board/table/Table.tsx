import back from '/assets/cards/back/0.png';
import './Table.css';

export default function Table() {
  return (
    <div className="table">
      <div className="table-center">
        <div className="card-piles">
          <div
            className="pile discard-pile empty"
            style={{ background: `#222` }}
          />
          <div
            className="pile draw-pile"
            style={{ backgroundImage: `url(${back})` }}
          />
        </div>
      </div>
    </div>
  );
}

