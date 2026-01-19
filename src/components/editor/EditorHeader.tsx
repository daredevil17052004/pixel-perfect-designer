import { Undo2, Redo2, Download, Share2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditorHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPng: () => void;
  onShare: () => void;
}

export function EditorHeader({
  projectName,
  onProjectNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPng,
  onShare,
}: EditorHeaderProps) {
  return (
    <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-lg">Creo</span>
          <span className="text-xs text-muted-foreground">Your design partner</span>
        </div>
        
        <Input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-40 h-8 bg-muted/30 border-border text-sm"
        />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onExportPng}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          size="sm"
          className="h-8 gap-2"
          onClick={onShare}
        >
          Share
        </Button>
      </div>
    </div>
  );
}
