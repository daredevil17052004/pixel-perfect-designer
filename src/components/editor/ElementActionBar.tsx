import { ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface ElementActionBarProps {
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ElementActionBar({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDelete,
  onDuplicate,
}: ElementActionBarProps) {
  return (
    <div className="flex items-center gap-1 p-2 bg-card border border-border rounded-lg shadow-lg">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBringToFront}>
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bring to Front</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBringForward}>
            <ArrowUp className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bring Forward</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSendBackward}>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Send Backward</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSendToBack}>
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Send to Back</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Duplicate</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
}
