import React from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className,
  showText = false,
  size = 'md'
}) => {
  const { connectionStatus } = useAppData();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          text: 'Connected',
          pulse: false
        };
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          text: 'Connecting...',
          pulse: true
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: 'Connection Error',
          pulse: false
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: 'Disconnected',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        className
      )}
      title={`Realtime connection: ${config.text}`}
    >
      <div className={cn(
        'rounded-full p-1.5 transition-colors duration-200',
        config.bgColor
      )}>
        <Icon 
          className={cn(
            sizeClasses[size],
            config.color,
            config.pulse && 'animate-spin'
          )}
        />
      </div>
      
      {showText && (
        <span className={cn(
          'font-medium transition-colors duration-200',
          config.color,
          textSizeClasses[size]
        )}>
          {config.text}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus; 