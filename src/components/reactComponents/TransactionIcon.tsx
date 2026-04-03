import React from 'react';
import { 
  Award, 
  Folder, 
  Building2, 
  Bell, 
  Car, 
  FileText, 
  User,
  RotateCw
} from 'lucide-react';

interface TransactionIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const TransactionIcon: React.FC<TransactionIconProps> = ({ 
  icon, 
  size = 16, 
  className = '' 
}) => {
  const iconProps = { 
    size, 
    className: `text-current ${className}` 
  };

  const icons: Record<string, React.ReactNode> = {
    trophy: <Award {...iconProps} />,
    folder: <Folder {...iconProps} />,
    bank: <Building2 {...iconProps} />,
    bell: <Bell {...iconProps} />,
    car: <Car {...iconProps} />,
    document: <FileText {...iconProps} />,
    user: <User {...iconProps} />,
    refresh: <RotateCw {...iconProps} />,
  };

  return <>{icons[icon] || icons.document}</>;
};
