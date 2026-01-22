import { ElementBounds } from '@/types/editor';
import { useCallback, useEffect, useState } from 'react';

interface ResizeState {
  isResizing: boolean;
  handle: string | null;
  startX: number;
  startY: number;
  startBounds: ElementBounds;
}

interface SelectionOverlayProps {
  bounds: ElementBounds;
  zoom: number;
  onResize?: (newBounds: ElementBounds, handle: string) => void;
  onResizeEnd?: () => void;
}

export function SelectionOverlay({ bounds, zoom, onResize, onResizeEnd }: SelectionOverlayProps) {
  const handleSize = 10;
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startBounds: bounds,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setResizeState({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startBounds: { ...bounds },
    });
  }, [bounds]);

  useEffect(() => {
    if (!resizeState.isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeState.startX) / zoom;
      const deltaY = (e.clientY - resizeState.startY) / zoom;
      const { startBounds, handle } = resizeState;

      let newBounds = { ...startBounds };

      switch (handle) {
        case 'top-left':
          newBounds.x = startBounds.x + deltaX;
          newBounds.y = startBounds.y + deltaY;
          newBounds.width = Math.max(20, startBounds.width - deltaX);
          newBounds.height = Math.max(20, startBounds.height - deltaY);
          break;
        case 'top-right':
          newBounds.y = startBounds.y + deltaY;
          newBounds.width = Math.max(20, startBounds.width + deltaX);
          newBounds.height = Math.max(20, startBounds.height - deltaY);
          break;
        case 'bottom-left':
          newBounds.x = startBounds.x + deltaX;
          newBounds.width = Math.max(20, startBounds.width - deltaX);
          newBounds.height = Math.max(20, startBounds.height + deltaY);
          break;
        case 'bottom-right':
          newBounds.width = Math.max(20, startBounds.width + deltaX);
          newBounds.height = Math.max(20, startBounds.height + deltaY);
          break;
        case 'top':
          newBounds.y = startBounds.y + deltaY;
          newBounds.height = Math.max(20, startBounds.height - deltaY);
          break;
        case 'bottom':
          newBounds.height = Math.max(20, startBounds.height + deltaY);
          break;
        case 'left':
          newBounds.x = startBounds.x + deltaX;
          newBounds.width = Math.max(20, startBounds.width - deltaX);
          break;
        case 'right':
          newBounds.width = Math.max(20, startBounds.width + deltaX);
          break;
      }

      onResize?.(newBounds, handle!);
    };

    const handleMouseUp = () => {
      setResizeState(prev => ({ ...prev, isResizing: false, handle: null }));
      onResizeEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, zoom, onResize, onResizeEnd]);

  const cornerHandles = [
    { pos: 'top-left', style: { top: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nwse-resize' },
    { pos: 'top-right', style: { top: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nesw-resize' },
    { pos: 'bottom-left', style: { bottom: -handleSize / 2, left: -handleSize / 2 }, cursor: 'nesw-resize' },
    { pos: 'bottom-right', style: { bottom: -handleSize / 2, right: -handleSize / 2 }, cursor: 'nwse-resize' },
  ];

  const edgeHandles = [
    { pos: 'top', style: { top: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { pos: 'bottom', style: { bottom: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { pos: 'left', style: { left: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { pos: 'right', style: { right: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  ];

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
      {cornerHandles.map(({ pos, style, cursor }) => (
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
          onMouseDown={(e) => handleMouseDown(e, pos)}
        />
      ))}

      {/* Edge handles */}
      {edgeHandles.map(({ pos, style, cursor }) => (
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
          onMouseDown={(e) => handleMouseDown(e, pos)}
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
