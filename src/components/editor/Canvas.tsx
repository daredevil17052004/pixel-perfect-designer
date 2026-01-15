import { useRef, useEffect, useState, useCallback } from 'react';
import { SelectedElement } from '@/types/editor';
import { SelectionOverlay } from './SelectionOverlay';

interface CanvasProps {
  htmlContent: string;
  zoom: number;
  selectedElement: SelectedElement | null;
  isEditing: boolean;
  onSelectElement: (element: HTMLElement | null, iframeDoc?: Document) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
}

export function Canvas({
  htmlContent,
  zoom,
  selectedElement,
  isEditing,
  onSelectElement,
  onStartEditing,
  onStopEditing,
}: CanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [iframeSize, setIframeSize] = useState({ width: 600, height: 750 });

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

  // Add interaction handlers to iframe
  useEffect(() => {
    if (!iframeDoc) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target === iframeDoc.body || target === iframeDoc.documentElement) {
        onSelectElement(null);
        return;
      }
      
      onSelectElement(target, iframeDoc);
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

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target !== iframeDoc.body && target !== iframeDoc.documentElement) {
        setHoveredElement(target);
      }
    };

    const handleMouseOut = () => {
      setHoveredElement(null);
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
    };

    iframeDoc.addEventListener('click', handleClick);
    iframeDoc.addEventListener('dblclick', handleDoubleClick);
    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('mouseout', handleMouseOut);
    iframeDoc.addEventListener('blur', handleBlur, true);
    iframeDoc.addEventListener('keydown', handleKeyDown);

    // Add cursor style
    const style = iframeDoc.createElement('style');
    style.textContent = `
      * { cursor: default !important; }
      *:hover { outline: 1px dashed rgba(59, 130, 246, 0.5) !important; outline-offset: -1px !important; }
      [contenteditable="true"] { cursor: text !important; outline: 2px solid #3b82f6 !important; }
    `;
    iframeDoc.head.appendChild(style);

    return () => {
      iframeDoc.removeEventListener('click', handleClick);
      iframeDoc.removeEventListener('dblclick', handleDoubleClick);
      iframeDoc.removeEventListener('mouseover', handleMouseOver);
      iframeDoc.removeEventListener('mouseout', handleMouseOut);
      iframeDoc.removeEventListener('blur', handleBlur, true);
      iframeDoc.removeEventListener('keydown', handleKeyDown);
    };
  }, [iframeDoc, selectedElement, isEditing, onSelectElement, onStartEditing, onStopEditing]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-auto bg-[hsl(220,13%,6%)] flex items-center justify-center p-8"
      style={{ 
        backgroundImage: `
          radial-gradient(circle at 1px 1px, hsl(220 13% 15%) 1px, transparent 0)
        `,
        backgroundSize: '24px 24px',
      }}
      onClick={handleCanvasClick}
    >
      <div 
        className="relative bg-transparent shadow-2xl rounded-lg overflow-hidden"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
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
              <SelectionOverlay 
                bounds={selectedElement.bounds}
                zoom={zoom}
              />
            )}
          </>
        ) : (
          <div className="w-[600px] h-[750px] bg-card flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-6xl mb-4">📄</div>
            <div className="text-lg font-medium mb-2">No design loaded</div>
            <div className="text-sm">Select a template from the sidebar to start editing</div>
          </div>
        )}
      </div>
    </div>
  );
}
