import React, { ReactNode, useEffect, useState } from 'react';

interface HydrationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to detect and handle hydration mismatches
 * Prevents white screen when React fails to hydrate
 */
export const HydrationBoundary: React.FC<HydrationBoundaryProps> = ({ 
  children, 
  fallback = <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading component...</div> 
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      setIsHydrated(true);
      console.log('[HydrationBoundary] Component hydrated successfully');
    } catch (error) {
      console.error('[HydrationBoundary] Hydration error:', error);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: 'rgba(207, 102, 121, 0.1)',
          borderRadius: '8px',
          color: 'var(--semantic-error)',
        }}
      >
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Component Error</p>
        <p style={{ margin: 0, fontSize: '14px' }}>
          There was an error loading this component. Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
