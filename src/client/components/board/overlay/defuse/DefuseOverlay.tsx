import { useState, useRef, useEffect } from 'react';
import './DefuseOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { DEFUSE_EXPLODING_KITTEN } from '../../../../../common/constants/stages';

export default function DefuseOverlay() {
  const game = useGame();
  
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const cardAmount = game.piles.drawPile.size;
  const isDefusing = game.selfPlayer?.isInStage(DEFUSE_EXPLODING_KITTEN);

  // Set initial random position when entering the defuse stage
  useEffect(() => {
    if (isDefusing) {
      const min = Math.ceil(cardAmount * 0.25);
      const max = Math.floor(cardAmount * 0.75);
      
      if (max >= min) {
        const range = max - min + 1;
        setInsertIndex(min + Math.floor(Math.random() * range));
      } else {
        setInsertIndex(Math.floor(Math.random() * (cardAmount + 1)));
      }
    } else {
      setInsertIndex(null);
    }
  }, [isDefusing]);

  const handleDefuse = () => {
    if (insertIndex !== null) {
      game.playDefuse(insertIndex);
    }
  };

  const updatePosition = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    
    // Calculate percentage based on Y position (Top = 0, Bottom = 1)
    const relativeY = clientY - rect.top;
    let percentage = relativeY / rect.height;
    
    // Clamp between 0 and 1
    percentage = Math.max(0, Math.min(1, percentage));
    
    // Map to card index
    const newIndex = Math.round(percentage * cardAmount);
    setInsertIndex(newIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientY);
  };

  // Add a handler for the thumb itself to start dragging
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the track's handler from firing
    setIsDragging(true);
    updatePosition(e.clientY);
  };
  
  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e.touches[0].clientY);
  };

  // Global event listeners for dragging outside the element
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updatePosition(e.clientY);
      }
    };
    
    const handleUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
         e.preventDefault(); // Prevent scrolling while dragging
         updatePosition(e.touches[0].clientY);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, cardAmount]);

  if (!isDefusing) {
      return null;
  }

  const currentIdx = insertIndex ?? 0;
  const percentage = cardAmount > 0 ? (currentIdx / cardAmount) * 100 : 0;

  return (
    <div className="defuse-overlay">
      <div className="defuse-content">
        <h2>Defuse Protocol</h2>
        <p>Select insertion depth for the Exploding Kitten.</p>
        
        <div className="defuse-interface">
            <div className="depth-markers">
                <div className="marker-label top">Top Deck</div>
                <div className="marker-label mid">
                    <div className="marker-line"></div>
                </div>
                <div className="marker-label bottom">Bottom</div>
            </div>

            <div 
              className="depth-track-container"
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
                <div className="depth-track-rail"></div>
                
                {/* The "Thumb" / Card Indicator */}
                <div 
                  className={`card-thumb ${isDragging ? 'dragging' : ''}`} 
                  style={{ top: `${percentage}%` }}
                  onMouseDown={handleThumbMouseDown}
                  onTouchStart={handleThumbTouchStart}
                >
                    <div className="thumb-graphic">
                        <img src="/assets/cards/exploding_kitten/0.png" alt="Kitten" />
                    </div>
                    <div className="thumb-arrow"></div>
                    
                    {/* Tooltip moves with the thumb */}
                    <div className="thumb-tooltip">
                        <span className="tooltip-value">
                            {currentIdx === 0 ? "Top Card" : 
                             currentIdx === cardAmount ? "Bottom" : 
                             `${currentIdx} Deep`}
                         </span>
                    </div>
                </div>
            </div>
            
            <div className="info-panel">
               {/* Could add risk visualizer here later */}
               {currentIdx === 0 && <div className="risk-badge high">EXPLODE!</div>}
               {currentIdx > 0 && currentIdx < cardAmount && <div className="risk-badge medium">Hidden</div>}
               {currentIdx === cardAmount && <div className="risk-badge low">Lame</div>}
            </div>
        </div>

        <button className="defuse-confirm-btn btn btn-primary" onClick={handleDefuse}>
          Confirm Insertion
        </button>
      </div>
    </div>
  );
}
