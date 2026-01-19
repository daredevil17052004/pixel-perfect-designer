import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm rounded-full px-2 py-1.5 border border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-full" 
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium w-14 text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-full" 
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
