import { ElementBounds } from '@/types/editor';

interface SelectionOverlayProps {
  bounds: ElementBounds;
  zoom: number;
}

export function SelectionOverlay({ bounds }: SelectionOverlayProps) {
  const handleSize = 8;

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
      <div className="absolute inset-0 border-2 border-[hsl(210,100%,50%)] rounded-sm" />
      
      {/* Corner handles */}
      {[
        { pos: 'top-left', style: { top: -handleSize / 2, left: -handleSize / 2 } },
        { pos: 'top-right', style: { top: -handleSize / 2, right: -handleSize / 2 } },
        { pos: 'bottom-left', style: { bottom: -handleSize / 2, left: -handleSize / 2 } },
        { pos: 'bottom-right', style: { bottom: -handleSize / 2, right: -handleSize / 2 } },
      ].map(({ pos, style }) => (
        <div
          key={pos}
          className="absolute w-2 h-2 bg-[hsl(210,100%,50%)] border border-[hsl(0,0%,100%)] rounded-sm pointer-events-auto cursor-nwse-resize"
          style={style}
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
          className="absolute w-2 h-2 bg-[hsl(210,100%,50%)] border border-[hsl(0,0%,100%)] rounded-sm pointer-events-auto"
          style={{ ...style, cursor }}
        />
      ))}

      {/* Size indicator */}
      <div 
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-[hsl(210,100%,50%)] text-[hsl(0,0%,100%)] text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono"
      >
        {Math.round(bounds.width)} × {Math.round(bounds.height)}
      </div>
    </div>
  );
}
