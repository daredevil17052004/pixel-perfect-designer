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
      {/* Selection border - bright yellow for visibility */}
      <div 
        className="absolute inset-0 border-2 rounded-sm"
        style={{ 
          borderColor: 'hsl(45 100% 50%)',
          boxShadow: '0 0 0 1px rgba(255, 200, 0, 0.5), 0 0 12px rgba(255, 200, 0, 0.4)',
        }} 
      />
      
      {/* Corner handles */}
      {[
        { pos: 'top-left', style: { top: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nwse-resize' },
        { pos: 'top-right', style: { top: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nesw-resize' },
        { pos: 'bottom-left', style: { bottom: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nesw-resize' },
        { pos: 'bottom-right', style: { bottom: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nwse-resize' },
      ].map(({ pos, style, cursor }) => (
        <div
          key={pos}
          className="absolute rounded-sm pointer-events-auto"
          style={{ 
            ...style, 
            width: handleSize, 
            height: handleSize, 
            cursor,
            backgroundColor: 'hsl(45 100% 50%)',
            border: '2px solid hsl(45 100% 35%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
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
          className="absolute rounded-sm pointer-events-auto"
          style={{ 
            ...style, 
            width: handleSize, 
            height: handleSize, 
            cursor,
            backgroundColor: 'hsl(45 100% 50%)',
            border: '2px solid hsl(45 100% 35%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
        />
      ))}

      {/* Size indicator */}
      <div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-bold"
        style={{
          backgroundColor: 'hsl(45 100% 50%)',
          color: 'hsl(0 0% 10%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {Math.round(bounds.width)} × {Math.round(bounds.height)}
      </div>
    </div>
  );
}
