import { useState, useCallback, useEffect, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { TemplateSidebar } from './TemplateSidebar';
import { Canvas, CanvasRef } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditorState } from '@/hooks/useEditorState';
import { useExport } from '@/hooks/useExport';
import { useHistory } from '@/hooks/useHistory';
import { DesignTemplate, EditorTool } from '@/types/editor';

export function DesignEditor() {
  const {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    setActiveTool,
    selectElement,
    updateSelectedBounds,
    startEditing,
    stopEditing,
    setIsDragging,
    setHtmlContent,
    updateElementStyle,
  } = useEditorState();

  const { exportAsPng, exportAsHtml } = useExport();
  const { pushState, undo, redo, canUndo, canRedo, captureState } = useHistory();
  const canvasRef = useRef<CanvasRef>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save state for undo/redo when content changes
  const saveCurrentState = useCallback(() => {
    const iframe = canvasRef.current?.getIframe();
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const html = captureState(iframeDoc || null);
    if (html) {
      pushState(html);
    }
  }, [captureState, pushState]);

  // Debounced save after style changes
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveCurrentState, 500);
  }, [saveCurrentState]);

  const handleStyleChange = useCallback((property: string, value: string) => {
    updateElementStyle(property, value);
    debouncedSave();
  }, [updateElementStyle, debouncedSave]);

  const handleSelectTemplate = useCallback(async (template: DesignTemplate) => {
    try {
      setSelectedTemplateId(template.id);
      const response = await fetch(template.path);
      const html = await response.text();
      setHtmlContent(html);
      // Save initial state for undo
      setTimeout(() => {
        saveCurrentState();
      }, 200);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }, [setHtmlContent, saveCurrentState]);

  const handleUploadHtml = useCallback((content: string) => {
    setSelectedTemplateId(undefined);
    setHtmlContent(content);
    // Save initial state for undo
    setTimeout(() => {
      saveCurrentState();
    }, 200);
  }, [setHtmlContent, saveCurrentState]);

  const handleUndo = useCallback(() => {
    const html = undo();
    if (html) {
      setHtmlContent(html);
    }
  }, [undo, setHtmlContent]);

  const handleRedo = useCallback(() => {
    const html = redo();
    if (html) {
      setHtmlContent(html);
    }
  }, [redo, setHtmlContent]);

  const handleExportPng = useCallback(() => {
    const iframe = canvasRef.current?.getIframe();
    exportAsPng(iframe);
  }, [exportAsPng]);

  const handleExportHtml = useCallback(() => {
    const iframe = canvasRef.current?.getIframe();
    exportAsHtml(iframe);
  }, [exportAsHtml]);

  const handleZoomFit = useCallback(() => {
    setZoom(0.5);
  }, [setZoom]);

  const handleToolChange = useCallback((tool: EditorTool) => {
    setActiveTool(tool);
  }, [setActiveTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when editing text
      if (state.isEditing) return;
      
      // Undo/Redo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === '+' || e.key === '=') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomIn();
        }
      } else if (e.key === '-') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomOut();
        }
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomFit();
      } else if (e.key === 'Escape') {
        selectElement(null);
        setActiveTool('select');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('pan');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
      } else if (e.key === 'r' || e.key === 'R') {
        setActiveTool('rectangle');
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveTool('circle');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool('line');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, handleZoomFit, selectElement, setActiveTool, state.isEditing, handleUndo, handleRedo]);

  return (
    <div className="h-screen w-full flex flex-col bg-background dark">
      <EditorToolbar
        zoom={state.zoom}
        activeTool={state.activeTool}
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomFit={handleZoomFit}
        onToolChange={handleToolChange}
        onUploadHtml={handleUploadHtml}
        onExportPng={handleExportPng}
        onExportHtml={handleExportHtml}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <TemplateSidebar
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />
        
        <Canvas
          ref={canvasRef}
          htmlContent={state.htmlContent}
          zoom={state.zoom}
          activeTool={state.activeTool}
          selectedElement={state.selectedElement}
          isEditing={state.isEditing}
          onSelectElement={selectElement}
          onUpdateBounds={updateSelectedBounds}
          onStartEditing={startEditing}
          onStopEditing={stopEditing}
          onSetDragging={setIsDragging}
        />
        
        <PropertiesPanel
          selectedElement={state.selectedElement}
          onStyleChange={handleStyleChange}
        />
      </div>
    </div>
  );
}
