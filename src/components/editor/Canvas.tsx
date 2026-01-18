import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { SelectedElement, EditorTool, DragState } from '@/types/editor';
import { SelectionOverlay } from './SelectionOverlay';
import { ElementContextMenu } from './ElementContextMenu';
import { ElementActionBar } from './ElementActionBar';

interface CanvasProps {
  htmlContent: string;
  zoom: number;
  activeTool: EditorTool;
  selectedElement: SelectedElement | null;
  isEditing: boolean;
  onSelectElement: (element: HTMLElement | null, iframeDoc?: Document) => void;
  onUpdateBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onSetDragging: (isDragging: boolean) => void;
}

export interface CanvasRef {
  getIframe: () => HTMLIFrameElement | null;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas({
  htmlContent,
  zoom,
  activeTool,
  selectedElement,
  isEditing,
  onSelectElement,
  onUpdateBounds,
  onStartEditing,
  onStopEditing,
  onSetDragging,
}, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  const [iframeSize, setIframeSize] = useState({ width: 600, height: 750 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    getIframe: () => iframeRef.current,
  }));

  // Load HTML content into iframe
  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setIframeDoc(doc);

    // Calculate canvas size based on content
    setTimeout(() => {
      const body = doc.body;
      const posterContainer = doc.querySelector('.poster-container');
      if (posterContainer) {
        const rect = posterContainer.getBoundingClientRect();
        setIframeSize({
          width: Math.max(rect.width, 400),
          height: Math.max(rect.height, 500),
        });
      } else if (body) {
        setIframeSize({
          width: Math.max(body.scrollWidth, 400),
          height: Math.max(body.scrollHeight, 500),
        });
      }
    }, 100);
  }, [htmlContent]);

  // Handle adding new elements
  const addTextElement = useCallback((x: number, y: number) => {
    if (!iframeDoc) return;
    
    const textEl = iframeDoc.createElement('div');
    textEl.textContent = 'Double-click to edit';
    textEl.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: 24px;
      font-family: 'Inter', sans-serif;
      color: #ffffff;
      padding: 8px 16px;
      cursor: move;
      user-select: none;
      z-index: 100;
    `;
    textEl.setAttribute('data-editable', 'true');
    
    const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
    container.appendChild(textEl);
    onSelectElement(textEl, iframeDoc);
  }, [iframeDoc, onSelectElement]);

  const addShapeElement = useCallback((x: number, y: number, shape: 'rectangle' | 'circle' | 'line') => {
    if (!iframeDoc) return;
    
    const shapeEl = iframeDoc.createElement('div');
    const baseStyles = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      cursor: move;
      user-select: none;
      z-index: 99;
    `;
    
    switch (shape) {
      case 'rectangle':
        shapeEl.style.cssText = baseStyles + `
          width: 150px;
          height: 100px;
          background-color: rgba(139, 92, 246, 0.8);
          border: 2px solid #a78bfa;
          border-radius: 8px;
        `;
        break;
      case 'circle':
        shapeEl.style.cssText = baseStyles + `
          width: 120px;
          height: 120px;
          background-color: rgba(20, 184, 166, 0.8);
          border: 2px solid #2dd4bf;
          border-radius: 50%;
        `;
        break;
      case 'line':
        shapeEl.style.cssText = baseStyles + `
          width: 200px;
          height: 4px;
          background-color: #f472b6;
          transform-origin: left center;
        `;
        break;
    }
    
    shapeEl.setAttribute('data-shape', shape);
    
    const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
    container.appendChild(shapeEl);
    onSelectElement(shapeEl, iframeDoc);
  }, [iframeDoc, onSelectElement]);

  // Add interaction handlers to iframe
  useEffect(() => {
    if (!iframeDoc) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle tool-based actions
      if (activeTool === 'text') {
        e.preventDefault();
        const rect = (iframeDoc.querySelector('.poster-container') || iframeDoc.body).getBoundingClientRect();
        addTextElement(e.clientX - rect.left, e.clientY - rect.top);
        return;
      }
      
      if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line') {
        e.preventDefault();
        const rect = (iframeDoc.querySelector('.poster-container') || iframeDoc.body).getBoundingClientRect();
        addShapeElement(e.clientX - rect.left, e.clientY - rect.top, activeTool);
        return;
      }

      // Select mode - start drag
      if (activeTool === 'select' && target !== iframeDoc.body && target !== iframeDoc.documentElement) {
        const computedStyle = iframeDoc.defaultView?.getComputedStyle(target);
        const position = computedStyle?.position;
        
        // Make element draggable if it's not already positioned
        if (position === 'static') {
          const rect = target.getBoundingClientRect();
          target.style.position = 'relative';
          target.style.left = '0px';
          target.style.top = '0px';
        }
        
        const currentLeft = parseFloat(target.style.left) || 0;
        const currentTop = parseFloat(target.style.top) || 0;
        
        setDragState({
          isDragging: true,
          startX: e.clientX / zoom,
          startY: e.clientY / zoom,
          elementStartX: currentLeft,
          elementStartY: currentTop,
        });
        
        onSetDragging(true);
        onSelectElement(target, iframeDoc);
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !selectedElement?.element) return;
      
      const deltaX = (e.clientX / zoom) - dragState.startX;
      const deltaY = (e.clientY / zoom) - dragState.startY;
      
      const newLeft = dragState.elementStartX + deltaX;
      const newTop = dragState.elementStartY + deltaY;
      
      selectedElement.element.style.left = `${newLeft}px`;
      selectedElement.element.style.top = `${newTop}px`;
      
      // Update bounds for overlay
      const rect = selectedElement.element.getBoundingClientRect();
      onUpdateBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState(prev => ({ ...prev, isDragging: false }));
        onSetDragging(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (activeTool !== 'select') return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target === iframeDoc.body || target === iframeDoc.documentElement) {
        onSelectElement(null);
        return;
      }
      
      if (!dragState.isDragging) {
        onSelectElement(target, iframeDoc);
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (selectedElement?.element === target && selectedElement.isTextElement) {
        target.contentEditable = 'true';
        target.focus();
        onStartEditing();
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.contentEditable === 'true') {
        target.contentEditable = 'false';
        onStopEditing();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        const target = e.target as HTMLElement;
        target.contentEditable = 'false';
        onStopEditing();
      }
      
      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !isEditing) {
        selectedElement.element.remove();
        onSelectElement(null);
      }
    };

    iframeDoc.addEventListener('mousedown', handleMouseDown);
    iframeDoc.addEventListener('mousemove', handleMouseMove);
    iframeDoc.addEventListener('mouseup', handleMouseUp);
    iframeDoc.addEventListener('click', handleClick);
    iframeDoc.addEventListener('dblclick', handleDoubleClick);
    iframeDoc.addEventListener('blur', handleBlur, true);
    iframeDoc.addEventListener('keydown', handleKeyDown);

    // Add cursor style based on tool
    const style = iframeDoc.createElement('style');
    style.id = 'editor-styles';
    const cursorStyle = activeTool === 'select' ? 'move' : activeTool === 'pan' ? 'grab' : 'crosshair';
    style.textContent = `
      * { cursor: ${cursorStyle} !important; }
      *:hover { outline: 2px dashed rgba(139, 92, 246, 0.6) !important; outline-offset: 2px !important; }
      [contenteditable="true"] { cursor: text !important; outline: 2px solid #8b5cf6 !important; }
    `;
    
    // Remove old style if exists
    const oldStyle = iframeDoc.getElementById('editor-styles');
    if (oldStyle) oldStyle.remove();
    iframeDoc.head.appendChild(style);

    return () => {
      iframeDoc.removeEventListener('mousedown', handleMouseDown);
      iframeDoc.removeEventListener('mousemove', handleMouseMove);
      iframeDoc.removeEventListener('mouseup', handleMouseUp);
      iframeDoc.removeEventListener('click', handleClick);
      iframeDoc.removeEventListener('dblclick', handleDoubleClick);
      iframeDoc.removeEventListener('blur', handleBlur, true);
      iframeDoc.removeEventListener('keydown', handleKeyDown);
    };
  }, [iframeDoc, selectedElement, isEditing, activeTool, dragState, zoom, onSelectElement, onUpdateBounds, onStartEditing, onStopEditing, onSetDragging, addTextElement, addShapeElement]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  // Context menu actions
  const handleBringToFront = useCallback(() => {
    if (!selectedElement?.element) return;
    selectedElement.element.style.zIndex = '9999';
  }, [selectedElement]);

  const handleSendToBack = useCallback(() => {
    if (!selectedElement?.element) return;
    selectedElement.element.style.zIndex = '1';
  }, [selectedElement]);

  const handleBringForward = useCallback(() => {
    if (!selectedElement?.element) return;
    const currentZ = parseInt(selectedElement.element.style.zIndex || '1', 10);
    selectedElement.element.style.zIndex = String(currentZ + 1);
  }, [selectedElement]);

  const handleSendBackward = useCallback(() => {
    if (!selectedElement?.element) return;
    const currentZ = parseInt(selectedElement.element.style.zIndex || '1', 10);
    selectedElement.element.style.zIndex = String(Math.max(1, currentZ - 1));
  }, [selectedElement]);

  const handleSetTransparency = useCallback((opacity: number) => {
    if (!selectedElement?.element) return;
    selectedElement.element.style.opacity = String(opacity);
  }, [selectedElement]);

  const handleDeleteElement = useCallback(() => {
    if (!selectedElement?.element) return;
    selectedElement.element.remove();
    onSelectElement(null);
  }, [selectedElement, onSelectElement]);

  const handleDuplicateElement = useCallback(() => {
    if (!selectedElement?.element || !iframeDoc) return;
    const clone = selectedElement.element.cloneNode(true) as HTMLElement;
    // Offset the clone
    const currentLeft = parseFloat(clone.style.left || '0');
    const currentTop = parseFloat(clone.style.top || '0');
    clone.style.left = `${currentLeft + 20}px`;
    clone.style.top = `${currentTop + 20}px`;
    
    const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
    container.appendChild(clone);
    onSelectElement(clone, iframeDoc);
  }, [selectedElement, iframeDoc, onSelectElement]);

  return (
    <ElementContextMenu
      onBringToFront={handleBringToFront}
      onSendToBack={handleSendToBack}
      onBringForward={handleBringForward}
      onSendBackward={handleSendBackward}
      onSetTransparency={handleSetTransparency}
      onDelete={handleDeleteElement}
      onDuplicate={handleDuplicateElement}
      disabled={!selectedElement}
    >
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-8"
        style={{ 
          backgroundColor: 'hsl(240 10% 4%)',
          backgroundImage: `
            radial-gradient(circle at 1px 1px, hsl(240 10% 12%) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
        }}
        onClick={handleCanvasClick}
      >
        <div 
          className="relative bg-transparent shadow-2xl rounded-lg overflow-hidden"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragState.isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {htmlContent ? (
            <>
              <iframe
                ref={iframeRef}
                className="border-0 block"
                style={{
                  width: iframeSize.width,
                  height: iframeSize.height,
                  pointerEvents: 'auto',
                }}
                title="Design Canvas"
              />
              {selectedElement && !isEditing && (
                <>
                  <SelectionOverlay 
                    bounds={selectedElement.bounds}
                    zoom={zoom}
                  />
                  <div 
                    className="absolute z-50"
                    style={{
                      left: selectedElement.bounds.x,
                      top: selectedElement.bounds.y + selectedElement.bounds.height + 8,
                    }}
                  >
                    <ElementActionBar
                      onBringToFront={handleBringToFront}
                      onSendToBack={handleSendToBack}
                      onBringForward={handleBringForward}
                      onSendBackward={handleSendBackward}
                      onDelete={handleDeleteElement}
                      onDuplicate={handleDuplicateElement}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-[600px] h-[750px] bg-card flex flex-col items-center justify-center text-muted-foreground rounded-lg border border-border">
              <div className="text-6xl mb-4">📄</div>
              <div className="text-lg font-medium mb-2 text-foreground">No design loaded</div>
              <div className="text-sm">Select a template from the sidebar to start editing</div>
            </div>
          )}
        </div>
      </div>
    </ElementContextMenu>
  );
});
