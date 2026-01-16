import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpToLine, 
  ArrowDownToLine,
  Paintbrush,
  Trash2,
  Copy,
  Clipboard
} from 'lucide-react';
import { ReactNode } from 'react';

interface ElementContextMenuProps {
  children: ReactNode;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSetTransparency: (opacity: number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  disabled?: boolean;
}

const TRANSPARENCY_OPTIONS = [
  { label: '100% (Opaque)', value: 1 },
  { label: '90%', value: 0.9 },
  { label: '75%', value: 0.75 },
  { label: '50%', value: 0.5 },
  { label: '25%', value: 0.25 },
  { label: '10%', value: 0.1 },
  { label: '0% (Transparent)', value: 0 },
];

export function ElementContextMenu({
  children,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onSetTransparency,
  onDelete,
  onDuplicate,
  disabled = false,
}: ElementContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={disabled}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-card border-border">
        <ContextMenuItem 
          onClick={onBringToFront}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowUpToLine className="h-4 w-4" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onBringForward}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
          Bring Forward
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onSendBackward}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowDown className="h-4 w-4" />
          Send Backward
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onSendToBack}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Send to Back
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
            <Paintbrush className="h-4 w-4" />
            Transparency
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-card border-border">
            {TRANSPARENCY_OPTIONS.map((option) => (
              <ContextMenuItem
                key={option.value}
                onClick={() => onSetTransparency(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={onDuplicate}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={onDelete}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}