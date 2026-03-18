import {createPortal} from 'react-dom';
import {useEffect, useState, CSSProperties, RefObject} from 'react';
import './Card.css';

interface HoverCardPreviewProps {
  cardImage: string;
  anchorRef: RefObject<HTMLElement | null>;
  isVisible: boolean;
}

export default function HoverCardPreview({ cardImage, anchorRef, isVisible }: HoverCardPreviewProps) {
  const [showOnLeft, setShowOnLeft] = useState(false);

  useEffect(() => {
    if (isVisible && anchorRef.current) {
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
  }, [isVisible, anchorRef]);

  if (!isVisible) return null;

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
