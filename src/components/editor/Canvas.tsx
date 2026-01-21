// import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
// import { SelectedElement, EditorTool, DragState } from '@/types/editor';
// import { SelectionOverlay } from './SelectionOverlay';
// import { ElementContextMenu } from './ElementContextMenu';

// interface CanvasProps {
//   htmlContent: string;
//   zoom: number;
//   activeTool: EditorTool;
//   selectedElement: SelectedElement | null;
//   isEditing: boolean;
//   onSelectElement: (element: HTMLElement | null, iframeDoc?: Document) => void;
//   onUpdateBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
//   onStartEditing: () => void;
//   onStopEditing: () => void;
//   onSetDragging: (isDragging: boolean) => void;
// }

// export interface CanvasRef {
//   getIframe: () => HTMLIFrameElement | null;
//   addElement: (type: 'text' | 'rectangle' | 'circle' | 'line') => void;
//   changeZIndex: (action: 'front' | 'back' | 'forward' | 'backward') => void;
// }

// export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas({
//   htmlContent,
//   zoom,
//   activeTool,
//   selectedElement,
//   isEditing,
//   onSelectElement,
//   onUpdateBounds,
//   onStartEditing,
//   onStopEditing,
//   onSetDragging,
// }, ref) {
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
//   const [iframeSize, setIframeSize] = useState({ width: 600, height: 750 });
//   const [dragState, setDragState] = useState<DragState>({
//     isDragging: false,
//     startX: 0,
//     startY: 0,
//     elementStartX: 0,
//     elementStartY: 0,
//   });

//   // Helper to change Z-Index robustly
//   const executeChangeZIndex = useCallback((action: 'front' | 'back' | 'forward' | 'backward') => {
//     if (!selectedElement?.element || !iframeDoc) return;
//     const el = selectedElement.element;
    
//     // 1. Get the computed style (handles cases where z-index is defined in CSS classes)
//     const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
//     const zIndexStr = computedStyle?.zIndex;
    
//     // 2. Parse current Z-index (default to 0 if auto or invalid)
//     let currentZ = 0;
//     if (zIndexStr && zIndexStr !== 'auto') {
//       const parsed = parseInt(zIndexStr, 10);
//       if (!isNaN(parsed)) currentZ = parsed;
//     }

//     // 3. Ensure element is positioned (z-index is ignored on static elements)
//     if (computedStyle?.position === 'static') {
//       el.style.position = 'relative';
//     }

//     // 4. Calculate new Z-index
//     let newZ = currentZ;

//     // Helper to find max Z in container to jump to front
//     const getSiblingZIndices = () => {
//       if (!el.parentNode) return [0];
//       return Array.from(el.parentNode.children).map(child => {
//         const style = iframeDoc.defaultView?.getComputedStyle(child as Element);
//         const z = style?.zIndex;
//         return (z && z !== 'auto' && !isNaN(parseInt(z))) ? parseInt(z) : 0;
//       });
//     };

//     switch (action) {
//       case 'front': {
//         const maxZ = Math.max(...getSiblingZIndices());
//         newZ = maxZ + 1;
//         break;
//       }
//       case 'back': {
//         const minZ = Math.min(...getSiblingZIndices());
//         newZ = minZ - 1; 
//         break;
//       }
//       case 'forward':
//         newZ = currentZ + 1;
//         break;
//       case 'backward':
//         newZ = currentZ - 1;
//         break;
//     }

//     // 5. Apply style
//     el.style.zIndex = String(newZ);

//     // 6. Refresh selection to update properties panel
//     onSelectElement(el, iframeDoc);

//   }, [selectedElement, iframeDoc, onSelectElement]);

//   useImperativeHandle(ref, () => ({
//     getIframe: () => iframeRef.current,
//     addElement: (type) => {
//       if (!iframeDoc) return;
//       const { width, height } = iframeSize;
//       const x = width / 2 - 50; 
//       const y = height / 2 - 50;
      
//       if (type === 'text') {
//         const textEl = iframeDoc.createElement('div');
//         textEl.textContent = 'Double-click to edit';
//         textEl.style.cssText = `
//           position: absolute;
//           left: ${x}px;
//           top: ${y}px;
//           font-size: 24px;
//           font-family: 'Inter', sans-serif;
//           color: #000000;
//           padding: 8px 16px;
//           cursor: move;
//           user-select: none;
//           z-index: 100;
//           white-space: nowrap;
//         `;
//         textEl.setAttribute('data-editable', 'true');
//         textEl.setAttribute('data-type', 'text');
        
//         const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
//         container.appendChild(textEl);
//         onSelectElement(textEl, iframeDoc);
//       } else {
//         const shapeEl = iframeDoc.createElement('div');
//         const baseStyles = `
//           position: absolute;
//           left: ${x}px;
//           top: ${y}px;
//           cursor: move;
//           user-select: none;
//           z-index: 99;
//         `;
        
//         if (type === 'rectangle') {
//           shapeEl.style.cssText = baseStyles + `width: 150px; height: 100px; background-color: #8b5cf6;`;
//         } else if (type === 'circle') {
//           shapeEl.style.cssText = baseStyles + `width: 120px; height: 120px; background-color: #14b8a6; border-radius: 50%;`;
//         } else if (type === 'line') {
//           shapeEl.style.cssText = baseStyles + `width: 200px; height: 4px; background-color: #000000; transform-origin: left center;`;
//         }
        
//         shapeEl.setAttribute('data-shape', type);
//         const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
//         container.appendChild(shapeEl);
//         onSelectElement(shapeEl, iframeDoc);
//       }
//     },
//     changeZIndex: executeChangeZIndex
//   }));

//   // Load HTML content into iframe
//   useEffect(() => {
//     if (!iframeRef.current || !htmlContent) return;

//     const iframe = iframeRef.current;
//     const doc = iframe.contentDocument || iframe.contentWindow?.document;
//     if (!doc) return;

//     doc.open();
//     doc.write(htmlContent);
//     doc.close();

//     setIframeDoc(doc);

//     // Calculate canvas size based on content
//     setTimeout(() => {
//       const body = doc.body;
//       const posterContainer = doc.querySelector('.poster-container');
//       if (posterContainer) {
//         const rect = posterContainer.getBoundingClientRect();
//         setIframeSize({
//           width: Math.max(rect.width, 400),
//           height: Math.max(rect.height, 500),
//         });
//       } else if (body) {
//         setIframeSize({
//           width: Math.max(body.scrollWidth, 400),
//           height: Math.max(body.scrollHeight, 500),
//         });
//       }
//     }, 100);
//   }, [htmlContent]);

//   // Add interaction handlers to iframe
//   useEffect(() => {
//     if (!iframeDoc) return;

//     const handleMouseDown = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
      
//       // Select mode - start drag
//       if (activeTool === 'select' && target !== iframeDoc.body && target !== iframeDoc.documentElement) {
//         const computedStyle = iframeDoc.defaultView?.getComputedStyle(target);
//         const position = computedStyle?.position;
        
//         // Make element draggable if it's not already positioned
//         if (position === 'static') {
//           const rect = target.getBoundingClientRect();
//           target.style.position = 'relative';
//           target.style.left = '0px';
//           target.style.top = '0px';
//         }
        
//         const currentLeft = parseFloat(target.style.left) || 0;
//         const currentTop = parseFloat(target.style.top) || 0;
        
//         setDragState({
//           isDragging: true,
//           startX: e.clientX / zoom,
//           startY: e.clientY / zoom,
//           elementStartX: currentLeft,
//           elementStartY: currentTop,
//         });
        
//         onSetDragging(true);
//         onSelectElement(target, iframeDoc);
//         e.preventDefault();
//       }
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       if (!dragState.isDragging || !selectedElement?.element) return;
      
//       const deltaX = (e.clientX / zoom) - dragState.startX;
//       const deltaY = (e.clientY / zoom) - dragState.startY;
      
//       const newLeft = dragState.elementStartX + deltaX;
//       const newTop = dragState.elementStartY + deltaY;
      
//       selectedElement.element.style.left = `${newLeft}px`;
//       selectedElement.element.style.top = `${newTop}px`;
      
//       // Update bounds for overlay
//       const rect = selectedElement.element.getBoundingClientRect();
//       onUpdateBounds({
//         x: rect.left,
//         y: rect.top,
//         width: rect.width,
//         height: rect.height,
//       });
//     };

//     const handleMouseUp = () => {
//       if (dragState.isDragging) {
//         setDragState(prev => ({ ...prev, isDragging: false }));
//         onSetDragging(false);
//       }
//     };

//     const handleClick = (e: MouseEvent) => {
//       if (activeTool !== 'select') return;
      
//       e.preventDefault();
//       e.stopPropagation();
      
//       const target = e.target as HTMLElement;
//       if (target === iframeDoc.body || target === iframeDoc.documentElement) {
//         onSelectElement(null);
//         return;
//       }
      
//       if (!dragState.isDragging) {
//         onSelectElement(target, iframeDoc);
//       }
//     };

//     const handleDoubleClick = (e: MouseEvent) => {
//       e.preventDefault();
//       const target = e.target as HTMLElement;
//       const isText = target.getAttribute('data-type') === 'text' || (!target.getAttribute('data-shape') && target.textContent);
      
//       if (selectedElement?.element === target && isText) {
//         target.contentEditable = 'true';
//         target.focus();
//         onStartEditing();
//       }
//     };

//     const handleBlur = (e: FocusEvent) => {
//       const target = e.target as HTMLElement;
//       if (target.contentEditable === 'true') {
//         target.contentEditable = 'false';
//         onStopEditing();
//       }
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isEditing) {
//         const target = e.target as HTMLElement;
//         target.contentEditable = 'false';
//         onStopEditing();
//       }
      
//       if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !isEditing) {
//         selectedElement.element.remove();
//         onSelectElement(null);
//       }
//     };

//     iframeDoc.addEventListener('mousedown', handleMouseDown);
//     iframeDoc.addEventListener('mousemove', handleMouseMove);
//     iframeDoc.addEventListener('mouseup', handleMouseUp);
//     iframeDoc.addEventListener('click', handleClick);
//     iframeDoc.addEventListener('dblclick', handleDoubleClick);
//     iframeDoc.addEventListener('blur', handleBlur, true);
//     iframeDoc.addEventListener('keydown', handleKeyDown);

//     const style = iframeDoc.createElement('style');
//     style.id = 'editor-styles';
//     style.textContent = `
//       * { cursor: ${activeTool === 'select' ? 'default' : activeTool === 'pan' ? 'grab' : 'default'} !important; }
//       *[data-shape]:hover, *[data-type="text"]:hover { outline: 2px dashed #8b5cf6 !important; }
//       .selected { outline: 2px solid #8b5cf6 !important; }
//     `;
//     const oldStyle = iframeDoc.getElementById('editor-styles');
//     if (oldStyle) oldStyle.remove();
//     iframeDoc.head.appendChild(style);

//     return () => {
//       iframeDoc.removeEventListener('mousedown', handleMouseDown);
//       iframeDoc.removeEventListener('mousemove', handleMouseMove);
//       iframeDoc.removeEventListener('mouseup', handleMouseUp);
//       iframeDoc.removeEventListener('click', handleClick);
//       iframeDoc.removeEventListener('dblclick', handleDoubleClick);
//       iframeDoc.removeEventListener('blur', handleBlur, true);
//       iframeDoc.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [iframeDoc, selectedElement, isEditing, activeTool, dragState, zoom, onSelectElement, onUpdateBounds, onStartEditing, onStopEditing, onSetDragging]);

//   const handleCanvasClick = useCallback((e: React.MouseEvent) => {
//     if (e.target === containerRef.current) {
//       onSelectElement(null);
//     }
//   }, [onSelectElement]);

//   return (
//     <ElementContextMenu
//       onBringToFront={() => executeChangeZIndex('front')}
//       onSendToBack={() => executeChangeZIndex('back')}
//       onBringForward={() => executeChangeZIndex('forward')}
//       onSendBackward={() => executeChangeZIndex('backward')}
//       onSetTransparency={(o) => selectedElement && (selectedElement.element.style.opacity = String(o))}
//       onDelete={() => { selectedElement?.element.remove(); onSelectElement(null); }}
//       onDuplicate={() => {
//         if (!selectedElement?.element || !iframeDoc) return;
//         const clone = selectedElement.element.cloneNode(true) as HTMLElement;
//         clone.style.left = `${parseFloat(clone.style.left || '0') + 20}px`;
//         clone.style.top = `${parseFloat(clone.style.top || '0') + 20}px`;
//         iframeDoc.querySelector('.poster-container')?.appendChild(clone);
//         onSelectElement(clone, iframeDoc);
//       }}
//       disabled={!selectedElement}
//     >
//       <div 
//         ref={containerRef}
//         className="flex-1 overflow-auto flex items-center justify-center p-8"
//         style={{ 
//           backgroundColor: 'hsl(var(--background))',
//           backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.2) 1px, transparent 0)`,
//           backgroundSize: '20px 20px',
//         }}
//         onClick={handleCanvasClick}
//       >
//         <div 
//           className="relative bg-transparent shadow-2xl rounded-lg overflow-hidden"
//           style={{
//             transform: `scale(${zoom})`,
//             transformOrigin: 'center center',
//             transition: dragState.isDragging ? 'none' : 'transform 0.2s ease-out',
//           }}
//         >
//           {htmlContent ? (
//             <>
//               <iframe
//                 ref={iframeRef}
//                 className="border-0 block"
//                 style={{ width: iframeSize.width, height: iframeSize.height, pointerEvents: 'auto' }}
//                 title="Design Canvas"
//               />
//               {selectedElement && !isEditing && (
//                 <SelectionOverlay bounds={selectedElement.bounds} zoom={zoom} />
//               )}
//             </>
//           ) : (
//             <div className="w-[600px] h-[750px] bg-card flex flex-col items-center justify-center text-muted-foreground rounded-lg border border-border shadow-sm">
//               <div className="text-6xl mb-4 grayscale opacity-50">📄</div>
//               <div className="text-lg font-medium mb-2 text-foreground">No design loaded</div>
//               <div className="text-sm">Select a template to start</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </ElementContextMenu>
//   );
// });


import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { SelectedElement, EditorTool, DragState } from '@/types/editor';
import { SelectionOverlay } from './SelectionOverlay';
import { ElementContextMenu } from './ElementContextMenu';

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
  onContentChange: (content: string) => void;
}

export interface CanvasRef {
  getIframe: () => HTMLIFrameElement | null;
  getHtmlContent: () => string;
  addElement: (type: 'text' | 'rectangle' | 'circle' | 'line' | 'image', payload?: string) => void;
  changeZIndex: (action: 'front' | 'back' | 'forward' | 'backward') => void;
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
  onContentChange,
}, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  const [iframeSize] = useState({ width: 1080, height: 1080 });
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

  // Handle element resize from SelectionOverlay
  const handleResize = useCallback((newBounds: { x: number; y: number; width: number; height: number }, handle: string) => {
    if (!selectedElement?.element || !iframeDoc) return;
    
    setIsResizing(true);
    const el = selectedElement.element;
    const computedStyle = iframeDoc.defaultView?.getComputedStyle(el);
    
    // Make element positioned if static
    if (computedStyle?.position === 'static') {
      el.style.position = 'absolute';
    }

    // Get the initial element position in iframe coordinates
    const iframeRect = iframeRef.current?.getBoundingClientRect();
    if (!iframeRect) return;

    // Calculate new position relative to iframe
    const newLeft = (newBounds.x - iframeRect.left) / zoom;
    const newTop = (newBounds.y - iframeRect.top) / zoom;

    // Update position for handles that affect position
    if (handle.includes('left') || handle === 'left') {
      el.style.left = `${newLeft}px`;
    }
    if (handle.includes('top') || handle === 'top') {
      el.style.top = `${newTop}px`;
    }

    // Update size
    el.style.width = `${newBounds.width / zoom}px`;
    el.style.height = `${newBounds.height / zoom}px`;
    
    // Update bounds in state
    onUpdateBounds(newBounds);
  }, [selectedElement, iframeDoc, zoom, onUpdateBounds]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    onContentChange(getHtmlContent());
    // Re-select to update bounds
    if (selectedElement?.element && iframeDoc) {
      const rect = selectedElement.element.getBoundingClientRect();
      onUpdateBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [selectedElement, iframeDoc, onContentChange, getHtmlContent, onUpdateBounds]);

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
      const { width, height } = iframeSize;
      const x = width / 2 - 50; 
      const y = height / 2 - 50;
      
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

    // Canvas size is fixed at 1080x1080
  }, [htmlContent]);

  // Event Listeners
  useEffect(() => {
    if (!iframeDoc) return;

    const handleMouseDown = (e: MouseEvent) => {
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
        onContentChange(getHtmlContent());
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (activeTool !== 'select') return;
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
      // Allow editing text divs
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
      * { cursor: ${activeTool === 'select' ? 'default' : activeTool === 'pan' ? 'grab' : 'default'} !important; }
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
  }, [iframeDoc, selectedElement, isEditing, activeTool, dragState, zoom, onSelectElement, onUpdateBounds, onStartEditing, onStopEditing, onSetDragging, onContentChange, getHtmlContent]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

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
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-8"
        style={{ 
          backgroundColor: 'hsl(var(--background))',
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.2) 1px, transparent 0)`,
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
                style={{ width: iframeSize.width, height: iframeSize.height, pointerEvents: 'auto' }}
                title="Design Canvas"
              />
              {selectedElement && !isEditing && (
                <SelectionOverlay 
                  bounds={selectedElement.bounds} 
                  zoom={zoom} 
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                />
              )}
            </>
          ) : (
            <div className="w-[1080px] h-[1080px] bg-card flex flex-col items-center justify-center text-muted-foreground rounded-lg border border-border shadow-sm">
              <div className="text-6xl mb-4 grayscale opacity-50">📄</div>
              <div className="text-lg font-medium mb-2 text-foreground">No design loaded</div>
              <div className="text-sm">Select a template or generate a poster (1080×1080)</div>
            </div>
          )}
        </div>
      </div>
    </ElementContextMenu>
  );
});