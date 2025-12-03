import './DeadOverlay.css';

export default function DeadOverlay() {
  return (
    <div className="dead-overlay">
      <div className="dead-overlay-content">
        <h1 className="dead-overlay-title">
          <span className="dead-overlay-icon">💥</span>
          You exploded
        </h1>
      </div>
    </div>
  );
}

