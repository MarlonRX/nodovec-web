import React from 'react';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Eye, 
  Lock, 
  Lightbulb, 
  Target, 
  Smartphone, 
  Shield,
  Gamepad2
} from 'lucide-react';

interface FeatureIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({ 
  icon, 
  size = 24, 
  className = '' 
}) => {
  const iconProps = { 
    size, 
    className: `text-current ${className}` 
  };

  const icons: Record<string, React.ReactNode> = {
    dashboard: <BarChart3 {...iconProps} />,
    transactions: <Wallet {...iconProps} />,
    analytics: <TrendingUp {...iconProps} />,
    preview: <Eye {...iconProps} />,
    security: <Lock {...iconProps} />,
    lightbulb: <Lightbulb {...iconProps} />,
    target: <Target {...iconProps} />,
    mobile: <Smartphone {...iconProps} />,
    secure: <Shield {...iconProps} />,
    demo: <Gamepad2 {...iconProps} />,
  };

  return <>{icons[icon] || icons.dashboard}</>;
};
