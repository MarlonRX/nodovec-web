import React, { useState, useRef } from 'react';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  className?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Delete',
  rightLabel = 'Edit',
  leftColor = 'var(--semantic-error)',
  rightColor = 'var(--accent-primary)',
  className = '',
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    const maxOffset = 80;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setOffsetX(clampedOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    const threshold = 60;

    if (diff < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (diff > threshold && onSwipeRight) {
      onSwipeRight();
    }
    setOffsetX(0);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onSwipeLeft && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
          style={{
            width: Math.abs(offsetX) + 'px',
            backgroundColor: offsetX < 0 ? leftColor : 'transparent',
            opacity: offsetX < 0 ? Math.min(1, Math.abs(offsetX) / 60) : 0,
          }}
        >
          <span
            className="text-white text-sm font-medium transform"
            style={{
              transform: offsetX < -30 ? 'scale(1)' : 'scale(0.8)',
              opacity: offsetX < -30 ? 1 : 0.5,
            }}
          >
            {leftLabel}
          </span>
        </div>
      )}
      {onSwipeRight && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-start pl-4"
          style={{
            width: Math.abs(offsetX) + 'px',
            backgroundColor: offsetX > 0 ? rightColor : 'transparent',
            opacity: offsetX > 0 ? Math.min(1, Math.abs(offsetX) / 60) : 0,
          }}
        >
          <span
            className="text-white text-sm font-medium transform"
            style={{
              transform: offsetX > 30 ? 'scale(1)' : 'scale(0.8)',
              opacity: offsetX > 30 ? 1 : 0.5,
            }}
          >
            {rightLabel}
          </span>
        </div>
      )}
      <div
        className="relative bg-[var(--bg-surface)] transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};