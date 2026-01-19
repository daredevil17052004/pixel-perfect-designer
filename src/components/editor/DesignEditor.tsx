import { useState, useCallback, useEffect, useRef } from 'react';
import { EditorHeader } from './EditorHeader';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Canvas, CanvasRef } from './Canvas';
import { ZoomControls } from './ZoomControls';
import { useEditorState } from '@/hooks/useEditorState';
import { useExport } from '@/hooks/useExport';
import { useHistory } from '@/hooks/useHistory';
import { useLayers } from '@/hooks/useLayers';
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
  const [projectName, setProjectName] = useState('Untitled Design');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  
  const { 
    layers, 
    refreshLayers, 
    moveLayerUp, 
    moveLayerDown, 
    toggleVisibility, 
    deleteLayer,
    reorderLayers 
  } = useLayers(iframeDoc);

  // Get iframe document when canvas is ready
  const handleIframeReady = useCallback((doc: Document | null) => {
    setIframeDoc(doc);
  }, []);

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
      if (state.isEditing) return;
      
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

  const handleSelectLayer = useCallback((element: HTMLElement) => {
    selectElement(element, iframeDoc || undefined);
  }, [selectElement, iframeDoc]);

  const handleDeleteLayer = useCallback((element: HTMLElement) => {
    deleteLayer(element);
    if (state.selectedElement?.element === element) {
      selectElement(null);
    }
  }, [deleteLayer, selectElement, state.selectedElement]);

  const selectedElementId = state.selectedElement?.element?.dataset?.layerId || null;

  return (
    <div className="h-screen w-full flex flex-col bg-background dark">
      <EditorHeader
        projectName={projectName}
        onProjectNameChange={setProjectName}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPng={handleExportPng}
        onShare={() => {}}
        onImportHtml={handleUploadHtml}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar
          selectedElement={state.selectedElement}
          onStyleChange={handleStyleChange}
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
          onUploadHtml={handleUploadHtml}
        />
        
        <div className="flex-1 flex flex-col relative">
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
            onIframeReady={handleIframeReady}
          />
          
          <ZoomControls
            zoom={state.zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        </div>

        <RightSidebar
          layers={layers}
          selectedElementId={selectedElementId}
          onSelectLayer={handleSelectLayer}
          onDeleteLayer={handleDeleteLayer}
          onToggleVisibility={toggleVisibility}
          onMoveLayerUp={moveLayerUp}
          onMoveLayerDown={moveLayerDown}
          onReorderLayers={reorderLayers}
        />
      </div>
    </div>
  );
}
