import React, { useEffect, useState, useRef, useCallback } from 'react';

interface AnimatedProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animate?: boolean;
}

const AnimatedProgressCircle: React.FC<AnimatedProgressCircleProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = 'var(--accent-primary)',
  backgroundColor = 'var(--border-secondary)',
  showPercentage = true,
  animate = true,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(animate ? 0 : percentage);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(animate ? 0 : percentage);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (!animate) {
      setDisplayPercentage(percentage);
      startValueRef.current = percentage;
      return;
    }

    const duration = 2500;
    const startTime = Date.now();
    const startValue = startValueRef.current;
    const endValue = Math.min(percentage, 100);

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (endValue - startValue) * easeOut;

      setDisplayPercentage(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      } else {
        startValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, animate]);

  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  const getProgressColor = useCallback(() => {
    if (displayPercentage >= 100) return 'var(--semantic-success, #10B981)';
    if (displayPercentage >= 80) return 'var(--semantic-warning, #84CC16)';
    if (displayPercentage >= 50) return 'var(--semantic-warning, #F59E0B)';
    return color;
  }, [displayPercentage, color]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke 0.3s ease',
          }}
        />
      </svg>
      {showPercentage && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: getProgressColor() }}
        >
          <span className="text-2xl font-bold">
            {Math.round(displayPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressCircle;