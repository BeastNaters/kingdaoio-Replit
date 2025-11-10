import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/40',
      textColor: 'text-destructive',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/40',
      textColor: 'text-green-400',
    },
    info: {
      icon: Info,
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/40',
      textColor: 'text-accent',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor } = config[type];

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-4 flex items-center gap-3`}
      data-testid={`alert-${type}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${textColor}`} />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0 h-8 w-8"
          data-testid="button-close-alert"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
