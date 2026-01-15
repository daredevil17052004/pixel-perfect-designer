import { ZoomIn, ZoomOut, Maximize, Hand, MousePointer2, Type, Image, Square, Circle, Minus, Undo2, Redo2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EditorTool } from '@/types/editor';

interface EditorToolbarProps {
  zoom: number;
  activeTool: EditorTool;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToolChange: (tool: EditorTool) => void;
}

export function EditorToolbar({ zoom, activeTool, onZoomIn, onZoomOut, onZoomFit, onToolChange }: EditorToolbarProps) {
  const ToolButton = ({ tool, icon: Icon, label, shortcut }: { tool: EditorTool; icon: React.ElementType; label: string; shortcut: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={activeTool === tool ? 'default' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onToolChange(tool)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label} ({shortcut})</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-1">
        <ToolButton tool="select" icon={MousePointer2} label="Select" shortcut="V" />
        <ToolButton tool="pan" icon={Hand} label="Pan" shortcut="H" />

        <Separator orientation="vertical" className="mx-2 h-6" />
        
        <ToolButton tool="text" icon={Type} label="Add Text" shortcut="T" />
        <ToolButton tool="rectangle" icon={Square} label="Rectangle" shortcut="R" />
        <ToolButton tool="circle" icon={Circle} label="Circle" shortcut="C" />
        <ToolButton tool="line" icon={Minus} label="Line" shortcut="L" />
        
        <Separator orientation="vertical" className="mx-2 h-6" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <div className="flex items-center gap-1 bg-secondary/50 rounded-md px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomOut}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (-)</TooltipContent>
          </Tooltip>
          
          <span className="text-xs font-medium w-12 text-center text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomIn}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (+)</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomFit}>
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to Screen</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="sm" className="h-8 gap-2">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Design</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
