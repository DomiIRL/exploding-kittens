import {createPortal} from 'react-dom';
import {useEffect, useState, CSSProperties, RefObject} from 'react';
import './player/card/Card.css';
import {useResponsive} from "../../context/ResponsiveContext.tsx";

interface HoverCardPreviewProps {
  // Common props
  cardImage: string;
  isVisible: boolean;
  
  // Desktop props
  anchorRef?: RefObject<HTMLElement | null>;

  // Mobile props
  isMobile?: boolean;
  canPlay?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export default function CardPreview({
  cardImage, 
  anchorRef, 
  isVisible,
  canPlay = false,
  actionLabel = "Play Card",
  onAction,
  onClose
}: HoverCardPreviewProps) {
  const { isMobile } = useResponsive();

  const [showOnLeft, setShowOnLeft] = useState(false);

  useEffect(() => {
    // Only calculate position for desktop
    if (isVisible && anchorRef?.current && !isMobile) {
      const rect = anchorRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportWidth = window.innerWidth;

      // Calculate if there's enough space to show preview on the right
      // Preview width is approximately 40 scale units = 40vw (in worst case)
      const previewWidth = Math.min(40 * (viewportWidth / 100), 40 * (window.innerHeight / 100));
      const tableRadius = Math.min(45 * (viewportWidth / 100), 45 * (window.innerHeight / 100));
      const rightEdgeOfTable = viewportCenterX + tableRadius;
      const spaceOnRight = viewportWidth - rightEdgeOfTable;

      // Show on left only if: opponent card and not enough space on right
      const notEnoughSpaceOnRight = spaceOnRight < (previewWidth + 20); // 20px padding
      const isOnRightSide = cardCenterX > viewportCenterX;

      setShowOnLeft(isOnRightSide && notEnoughSpaceOnRight);
    }
  }, [isVisible, anchorRef, isMobile]);

  if (!isVisible) return null;

  // Render Mobile Overlay
  if (isMobile) {
    return createPortal(
      <div 
        className="card-preview-mobile-overlay"
        onClick={(e) => {
         // Clicking background cancels
         e.stopPropagation();
         if (onClose) onClose();
      }}>
        
        <div 
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
          className="card-preview-mobile-content"
        >
           {/* Card Preview Image */}
           <div 
             className="card-preview-mobile-image card-preview"
             style={{
               backgroundImage: `url(${cardImage})`,
             }} 
           />

          <div className="card-preview-mobile-actions">
            {canPlay && onAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                className="card-preview-action-btn"
              >
                {actionLabel}
              </button>
            )}
            
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 if (onClose) onClose();
               }}
               className="card-preview-cancel-btn"
            >
              {canPlay ? "Cancel" : "Close"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Render Desktop Overlay
  return createPortal(
    <div className={`card-preview-overlay ${showOnLeft ? 'show-left' : 'show-right'}`}>
      <div
        className="card-preview"
        style={{
          backgroundImage: `url(${cardImage})`,
        } as CSSProperties}
      />
    </div>,
    document.body
  );
}
