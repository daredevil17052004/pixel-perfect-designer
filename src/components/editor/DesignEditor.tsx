import { useState, useCallback, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { TemplateSidebar } from './TemplateSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditorState } from '@/hooks/useEditorState';
import { DesignTemplate } from '@/types/editor';

export function DesignEditor() {
  const {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    selectElement,
    startEditing,
    stopEditing,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, handleZoomFit, selectElement]);

  return (
    <div className="h-screen w-full flex flex-col bg-background dark">
      <EditorToolbar
        zoom={state.zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomFit={handleZoomFit}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <TemplateSidebar
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />
        
        <Canvas
          htmlContent={state.htmlContent}
          zoom={state.zoom}
          selectedElement={state.selectedElement}
          isEditing={state.isEditing}
          onSelectElement={selectElement}
          onStartEditing={startEditing}
          onStopEditing={stopEditing}
        />
        
        <PropertiesPanel
          selectedElement={state.selectedElement}
          onStyleChange={updateElementStyle}
        />
      </div>
    </div>
  );
}
