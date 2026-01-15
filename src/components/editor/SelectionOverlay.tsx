import { ElementBounds } from '@/types/editor';

interface SelectionOverlayProps {
  bounds: ElementBounds;
  zoom: number;
}

export function SelectionOverlay({ bounds }: SelectionOverlayProps) {
  const handleSize = 10;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {/* Selection border */}
      <div className="absolute inset-0 border-2 border-[hsl(262,83%,58%)] rounded-sm" 
           style={{ boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.3)' }} />
      
      {/* Corner handles */}
      {[
        { pos: 'top-left', style: { top: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nwse-resize' },
        { pos: 'top-right', style: { top: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nesw-resize' },
        { pos: 'bottom-left', style: { bottom: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nesw-resize' },
        { pos: 'bottom-right', style: { bottom: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nwse-resize' },
      ].map(({ pos, style, cursor }) => (
        <div
          key={pos}
          className="absolute bg-[hsl(262,83%,58%)] border-2 border-[hsl(0,0%,100%)] rounded-sm pointer-events-auto shadow-md"
          style={{ ...style, width: handleSize, height: handleSize, cursor }}
        />
      ))}

      {/* Edge handles */}
      {[
        { pos: 'top', style: { top: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
        { pos: 'bottom', style: { bottom: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
        { pos: 'left', style: { left: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
        { pos: 'right', style: { right: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
      ].map(({ pos, style, cursor }) => (
        <div
          key={pos}
          className="absolute bg-[hsl(262,83%,58%)] border-2 border-[hsl(0,0%,100%)] rounded-sm pointer-events-auto shadow-md"
          style={{ ...style, width: handleSize, height: handleSize, cursor }}
        />
      ))}

      {/* Size indicator */}
      <div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[hsl(262,83%,58%)] text-[hsl(0,0%,100%)] text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-mono shadow-lg"
      >
        {Math.round(bounds.width)} × {Math.round(bounds.height)}
      </div>
    </div>
  );
}
