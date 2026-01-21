import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { SelectedElement, EditorTool, DragState, ElementBounds } from '@/types/editor';
import { SelectionOverlay } from './SelectionOverlay';
import { ElementContextMenu } from './ElementContextMenu';

interface CanvasProps {
  htmlContent: string;
  zoom: number;
  activeTool: EditorTool;
  selectedElement: SelectedElement | null;
  isEditing: boolean;
  onSelectElement: (element: HTMLElement | null, iframeDoc?: Document) => void;
  onUpdateBounds: (bounds: ElementBounds) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onSetDragging: (isDragging: boolean) => void;
  onContentChange: (content: string) => void;
}

export interface CanvasRef {
  getIframe: () => HTMLIFrameElement | null;
  getHtmlContent: () => string;
  addElement: (type: 'text' | 'rectangle' | 'circle' | 'line' | 'image', payload?: string) => void;
  changeZIndex: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

const CANVAS_SIZE = 1080;

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
  onContentChange,
}, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  
  // Pan state for infinite canvas
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });
  const [isResizing, setIsResizing] = useState(false);

  const getHtmlContent = useCallback(() => {
    return iframeDoc?.documentElement?.outerHTML || '';
  }, [iframeDoc]);

  // Calculate selection overlay bounds relative to viewport
  const getOverlayBounds = useCallback(() => {
    if (!selectedElement?.element || !workspaceRef.current) return null;
    
    const elementRect = selectedElement.element.getBoundingClientRect();
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    
    return {
      x: elementRect.left - workspaceRect.left,
      y: elementRect.top - workspaceRect.top,
      width: elementRect.width,
      height: elementRect.height,
    };
  }, [selectedElement]);

  // Handle element resize from SelectionOverlay
  const handleResize = useCallback((newBounds: ElementBounds, handle: string) => {
    if (!selectedElement?.element || !iframeDoc || !iframeRef.current) return;
    
    setIsResizing(true);
    const el = selectedElement.element;
    const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
    
    if (computedStyle?.position === 'static') {
      el.style.position = 'absolute';
    }

    const iframeRect = iframeRef.current.getBoundingClientRect();
    const workspaceRect = workspaceRef.current?.getBoundingClientRect();
    if (!workspaceRect) return;

    // Convert overlay bounds to iframe coordinates
    const overlayToIframeX = (x: number) => (x + workspaceRect.left - iframeRect.left) / zoom;
    const overlayToIframeY = (y: number) => (y + workspaceRect.top - iframeRect.top) / zoom;

    if (handle.includes('left') || handle === 'left') {
      el.style.left = `${overlayToIframeX(newBounds.x)}px`;
    }
    if (handle.includes('top') || handle === 'top') {
      el.style.top = `${overlayToIframeY(newBounds.y)}px`;
    }

    el.style.width = `${newBounds.width / zoom}px`;
    el.style.height = `${newBounds.height / zoom}px`;
    
    onUpdateBounds(newBounds);
  }, [selectedElement, iframeDoc, zoom, onUpdateBounds]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    onContentChange(getHtmlContent());
    if (selectedElement?.element) {
      const rect = selectedElement.element.getBoundingClientRect();
      const workspaceRect = workspaceRef.current?.getBoundingClientRect();
      if (workspaceRect) {
        onUpdateBounds({
          x: rect.left - workspaceRect.left,
          y: rect.top - workspaceRect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, [selectedElement, onContentChange, getHtmlContent, onUpdateBounds]);

  const executeChangeZIndex = useCallback((action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedElement?.element || !iframeDoc) return;
    const el = selectedElement.element;
    
    const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
    const zIndexStr = computedStyle?.zIndex;
    
    let currentZ = 0;
    if (zIndexStr && zIndexStr !== 'auto') {
      const parsed = parseInt(zIndexStr, 10);
      if (!isNaN(parsed)) currentZ = parsed;
    }

    if (computedStyle?.position === 'static') {
      el.style.position = 'relative';
    }

    const getSiblingZIndices = () => {
      if (!el.parentNode) return [0];
      return Array.from(el.parentNode.children).map(child => {
        const style = iframeDoc.defaultView?.getComputedStyle(child as Element);
        const z = style?.zIndex;
        return (z && z !== 'auto' && !isNaN(parseInt(z))) ? parseInt(z) : 0;
      });
    };

    let newZ = currentZ;
    switch (action) {
      case 'front': {
        const maxZ = Math.max(...getSiblingZIndices());
        newZ = maxZ + 1;
        break;
      }
      case 'back': {
        const minZ = Math.min(...getSiblingZIndices());
        newZ = minZ - 1; 
        break;
      }
      case 'forward':
        newZ = currentZ + 1;
        break;
      case 'backward':
        newZ = currentZ - 1;
        break;
    }

    el.style.zIndex = String(newZ);
    onSelectElement(el, iframeDoc);
    onContentChange(getHtmlContent());
  }, [selectedElement, iframeDoc, onSelectElement, onContentChange, getHtmlContent]);

  useImperativeHandle(ref, () => ({
    getIframe: () => iframeRef.current,
    getHtmlContent,
    addElement: (type, payload) => {
      if (!iframeDoc) return;
      const x = CANVAS_SIZE / 2 - 50; 
      const y = CANVAS_SIZE / 2 - 50;
      
      let newElement: HTMLElement;

      if (type === 'text') {
        const textEl = iframeDoc.createElement('div');
        textEl.textContent = 'Double-click to edit';
        textEl.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          font-size: 24px;
          font-family: 'Inter', sans-serif;
          color: #000000;
          padding: 8px 16px;
          cursor: move;
          user-select: none;
          z-index: 100;
          white-space: nowrap;
        `;
        textEl.setAttribute('data-editable', 'true');
        textEl.setAttribute('data-type', 'text');
        newElement = textEl;
      } else if (type === 'image' && payload) {
        const imgEl = iframeDoc.createElement('img');
        imgEl.src = payload;
        imgEl.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 200px;
          height: auto;
          cursor: move;
          user-select: none;
          z-index: 99;
        `;
        imgEl.setAttribute('data-type', 'image');
        newElement = imgEl;
      } else {
        const shapeEl = iframeDoc.createElement('div');
        const baseStyles = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          cursor: move;
          user-select: none;
          z-index: 99;
        `;
        
        if (type === 'rectangle') {
          shapeEl.style.cssText = baseStyles + `width: 150px; height: 100px; background-color: #8b5cf6;`;
        } else if (type === 'circle') {
          shapeEl.style.cssText = baseStyles + `width: 120px; height: 120px; background-color: #14b8a6; border-radius: 50%;`;
        } else if (type === 'line') {
          shapeEl.style.cssText = baseStyles + `width: 200px; height: 4px; background-color: #000000; transform-origin: left center;`;
        }
        
        shapeEl.setAttribute('data-shape', type);
        newElement = shapeEl;
      }
      
      const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
      container.appendChild(newElement);
      onSelectElement(newElement, iframeDoc);
      onContentChange(getHtmlContent());
    },
    changeZIndex: executeChangeZIndex
  }));

  // Initialize HTML content
  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setIframeDoc(doc);
  }, [htmlContent]);

  // Pan with space+drag or middle mouse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isEditing) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditing]);

  // Handle workspace panning
  const handleWorkspaceMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button or space+left click
    if (e.button === 1 || (spacePressed && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [spacePressed, panOffset]);

  const handleWorkspaceMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleWorkspaceMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Event Listeners for iframe
  useEffect(() => {
    if (!iframeDoc) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (spacePressed) return; // Don't select while panning
      
      const target = e.target as HTMLElement;
      if (activeTool === 'select' && target !== iframeDoc.body && target !== iframeDoc.documentElement) {
        const computedStyle = iframeDoc.defaultView?.getComputedStyle(target);
        if (computedStyle?.position === 'static') {
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
      
      selectedElement.element.style.left = `${dragState.elementStartX + deltaX}px`;
      selectedElement.element.style.top = `${dragState.elementStartY + deltaY}px`;
      
      // Update bounds for overlay
      const rect = selectedElement.element.getBoundingClientRect();
      const workspaceRect = workspaceRef.current?.getBoundingClientRect();
      if (workspaceRect) {
        onUpdateBounds({
          x: rect.left - workspaceRect.left,
          y: rect.top - workspaceRect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState(prev => ({ ...prev, isDragging: false }));
        onSetDragging(false);
        onContentChange(getHtmlContent());
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (activeTool !== 'select' || spacePressed) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target === iframeDoc.body || target === iframeDoc.documentElement) {
        onSelectElement(null);
      } else if (!dragState.isDragging) {
        onSelectElement(target, iframeDoc);
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const isText = target.getAttribute('data-type') === 'text' || (!target.getAttribute('data-shape') && !target.getAttribute('data-type') && target.textContent);
      
      if (selectedElement?.element === target && isText && target.tagName !== 'IMG') {
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
        onContentChange(getHtmlContent());
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        const target = e.target as HTMLElement;
        target.contentEditable = 'false';
        onStopEditing();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !isEditing) {
        selectedElement.element.remove();
        onSelectElement(null);
        onContentChange(getHtmlContent());
      }
    };

    iframeDoc.addEventListener('mousedown', handleMouseDown);
    iframeDoc.addEventListener('mousemove', handleMouseMove);
    iframeDoc.addEventListener('mouseup', handleMouseUp);
    iframeDoc.addEventListener('click', handleClick);
    iframeDoc.addEventListener('dblclick', handleDoubleClick);
    iframeDoc.addEventListener('blur', handleBlur, true);
    iframeDoc.addEventListener('keydown', handleKeyDown);

    const style = iframeDoc.createElement('style');
    style.id = 'editor-styles';
    style.textContent = `
      * { cursor: ${spacePressed ? 'grab' : activeTool === 'select' ? 'default' : 'default'} !important; }
      *[data-shape]:hover, *[data-type="text"]:hover, img:hover { outline: 2px dashed #8b5cf6 !important; }
      .selected { outline: 2px solid #8b5cf6 !important; }
    `;
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
  }, [iframeDoc, selectedElement, isEditing, activeTool, dragState, zoom, spacePressed, onSelectElement, onUpdateBounds, onStartEditing, onStopEditing, onSetDragging, onContentChange, getHtmlContent]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current && !spacePressed) {
      onSelectElement(null);
    }
  }, [onSelectElement, spacePressed]);

  const overlayBounds = getOverlayBounds();

  return (
    <ElementContextMenu
      onBringToFront={() => executeChangeZIndex('front')}
      onSendToBack={() => executeChangeZIndex('back')}
      onBringForward={() => executeChangeZIndex('forward')}
      onSendBackward={() => executeChangeZIndex('backward')}
      onSetTransparency={(o) => {
        if (selectedElement) {
          selectedElement.element.style.opacity = String(o);
          onContentChange(getHtmlContent());
        }
      }}
      onDelete={() => { 
        selectedElement?.element.remove(); 
        onSelectElement(null);
        onContentChange(getHtmlContent());
      }}
      onDuplicate={() => {
        if (!selectedElement?.element || !iframeDoc) return;
        const clone = selectedElement.element.cloneNode(true) as HTMLElement;
        clone.style.left = `${parseFloat(clone.style.left || '0') + 20}px`;
        clone.style.top = `${parseFloat(clone.style.top || '0') + 20}px`;
        iframeDoc.querySelector('.poster-container')?.appendChild(clone);
        onSelectElement(clone, iframeDoc);
        onContentChange(getHtmlContent());
      }}
      disabled={!selectedElement}
    >
      {/* Fullscreen workspace container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ 
          backgroundColor: 'hsl(var(--muted) / 0.3)',
          cursor: isPanning ? 'grabbing' : spacePressed ? 'grab' : 'default',
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleWorkspaceMouseDown}
        onMouseMove={handleWorkspaceMouseMove}
        onMouseUp={handleWorkspaceMouseUp}
        onMouseLeave={handleWorkspaceMouseUp}
      >
        {/* Infinite grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        />

        {/* Workspace with pan/zoom transforms */}
        <div
          ref={workspaceRef}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) translate(-50%, -50%) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning || dragState.isDragging || isResizing ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {htmlContent ? (
            <>
              {/* Canvas shadow/backdrop */}
              <div
                className="absolute rounded-lg"
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <iframe
                ref={iframeRef}
                className="border-0 block rounded-lg"
                style={{ 
                  width: CANVAS_SIZE, 
                  height: CANVAS_SIZE, 
                  pointerEvents: spacePressed ? 'none' : 'auto',
                  backgroundColor: 'white',
                }}
                title="Design Canvas"
              />
            </>
          ) : (
            <div 
              className="bg-card flex flex-col items-center justify-center text-muted-foreground rounded-lg border border-border"
              style={{
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="text-6xl mb-4 grayscale opacity-50">📄</div>
              <div className="text-lg font-medium mb-2 text-foreground">No design loaded</div>
              <div className="text-sm">Select a template or generate a poster</div>
              <div className="text-xs text-muted-foreground mt-2">1080 × 1080</div>
            </div>
          )}
        </div>

        {/* Selection overlay - positioned relative to workspace */}
        {selectedElement && !isEditing && overlayBounds && (
          <SelectionOverlay 
            bounds={overlayBounds} 
            zoom={zoom} 
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground border border-border">
          {Math.round(zoom * 100)}% · Hold Space to pan
        </div>
      </div>
    </ElementContextMenu>
  );
});
