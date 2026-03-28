import React, { forwardRef } from 'react';
import '../../player/card/Card.css';

interface PileProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  image?: string;
  children?: React.ReactNode;
}

export const Pile = forwardRef<HTMLDivElement, PileProps>(
  ({ className = '', image, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pile ${className}`}
        style={{
          ...style,
          backgroundImage: image ? `url(${image})` : 'none',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

