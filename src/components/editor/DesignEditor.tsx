import { useState, useCallback, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { TemplateSidebar } from './TemplateSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditorState } from '@/hooks/useEditorState';
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

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const handleSelectTemplate = useCallback(async (template: DesignTemplate) => {
    try {
      setSelectedTemplateId(template.id);
      const response = await fetch(template.path);
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }, [setHtmlContent]);

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
  }, [zoomIn, zoomOut, handleZoomFit, selectElement, setActiveTool, state.isEditing]);

  return (
    <div className="h-screen w-full flex flex-col bg-background dark">
      <EditorToolbar
        zoom={state.zoom}
        activeTool={state.activeTool}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomFit={handleZoomFit}
        onToolChange={handleToolChange}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <TemplateSidebar
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />
        
        <Canvas
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
          onStyleChange={updateElementStyle}
        />
      </div>
    </div>
  );
}
