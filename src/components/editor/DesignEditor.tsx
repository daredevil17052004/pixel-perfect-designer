// import { useState, useCallback, useEffect, useRef } from 'react';
// import { EditorToolbar } from './EditorToolbar';
// import { TemplateSidebar } from './TemplateSidebar';
// import { Canvas, CanvasRef } from './Canvas';
// import { PropertiesPanel } from './PropertiesPanel';
// import { AiChatPanel } from './AiChatPanel';
// import { ActivityBar, SidebarTab } from './ActivityBar';
// import { ElementsPanel } from './ElementsPanel';
// import { AssetsPanel } from './AssetsPanel';
// import { useEditorState } from '@/hooks/useEditorState';
// import { useExport } from '@/hooks/useExport';
// import { DesignTemplate, EditorTool } from '@/types/editor';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable";

// export function DesignEditor() {
//   const {
//     state,
//     setZoom,
//     zoomIn,
//     zoomOut,
//     setActiveTool,
//     selectElement,
//     updateSelectedBounds,
//     startEditing,
//     stopEditing,
//     setIsDragging,
//     setHtmlContent,
//     updateElementStyle,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//     addToHistory
//   } = useEditorState();

//   const { exportAsPng, exportAsHtml } = useExport();
//   const canvasRef = useRef<CanvasRef>(null);
//   const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
//   const [activeLeftTab, setActiveLeftTab] = useState<SidebarTab>('templates');

//   useEffect(() => {
//     if (state.selectedElement && activeLeftTab !== 'properties') {
//       setActiveLeftTab('properties');
//     }
//   }, [state.selectedElement]);

//   const handleSelectTemplate = useCallback(async (template: DesignTemplate) => {
//     try {
//       setSelectedTemplateId(template.id);
//       const response = await fetch(template.path);
//       const html = await response.text();
//       setHtmlContent(html);
//     } catch (error) {
//       console.error('Failed to load template:', error);
//     }
//   }, [setHtmlContent]);

//   const handleUploadHtml = useCallback((content: string) => {
//     setSelectedTemplateId(undefined);
//     setHtmlContent(content);
//   }, [setHtmlContent]);

//   const saveCurrentState = useCallback(() => {
//     if (canvasRef.current) {
//       const html = canvasRef.current.getHtmlContent();
//       addToHistory(html);
//     }
//   }, [addToHistory]);

//   const handleExportPng = useCallback(() => {
//     const iframe = canvasRef.current?.getIframe();
//     exportAsPng(iframe);
//   }, [exportAsPng]);

//   const handleExportHtml = useCallback(() => {
//     const iframe = canvasRef.current?.getIframe();
//     exportAsHtml(iframe);
//   }, [exportAsHtml]);

//   const handleZoomFit = useCallback(() => {
//     setZoom(0.5);
//   }, [setZoom]);

//   const handleToolChange = useCallback((tool: EditorTool) => {
//     setActiveTool(tool);
//   }, [setActiveTool]);

//   const handleAddText = useCallback(() => {
//     canvasRef.current?.addElement('text');
//     setActiveLeftTab('properties');
//     setActiveTool('select');
//   }, [setActiveTool]);

//   const handleAddShape = useCallback((type: 'rectangle' | 'circle' | 'line') => {
//     canvasRef.current?.addElement(type);
//     setActiveLeftTab('properties');
//     setActiveTool('select');
//   }, [setActiveTool]);

//   const handleAddImage = useCallback((url: string) => {
//     canvasRef.current?.addElement('image', url);
//     setActiveTool('select');
//   }, [setActiveTool]);

//   const handleZIndexChange = useCallback((action: 'front' | 'back' | 'forward' | 'backward') => {
//     canvasRef.current?.changeZIndex(action);
//   }, []);

//   const handleStyleChange = useCallback((property: string, value: string) => {
//     updateElementStyle(property, value);
//     saveCurrentState();
//   }, [updateElementStyle, saveCurrentState]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (state.isEditing) return;
      
//       if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
//         e.preventDefault();
//         if (e.shiftKey) {
//           if (canRedo) redo();
//         } else {
//           if (canUndo) undo();
//         }
//       }

//       if (e.key === '+' || e.key === '=') {
//         if (e.ctrlKey || e.metaKey) {
//           e.preventDefault();
//           zoomIn();
//         }
//       } else if (e.key === '-') {
//         if (e.ctrlKey || e.metaKey) {
//           e.preventDefault();
//           zoomOut();
//         }
//       } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
//         e.preventDefault();
//         handleZoomFit();
//       } else if (e.key === 'Escape') {
//         selectElement(null);
//         setActiveTool('select');
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [zoomIn, zoomOut, handleZoomFit, selectElement, setActiveTool, state.isEditing, undo, redo, canUndo, canRedo]);

//   return (
//     <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
//       <div className="h-14 border-b flex-none z-50 bg-background">
//         <EditorToolbar
//           zoom={state.zoom}
//           activeTool={state.activeTool}
//           onZoomIn={zoomIn}
//           onZoomOut={zoomOut}
//           onToolChange={handleToolChange}
//           onUploadHtml={handleUploadHtml}
//           onExportPng={handleExportPng}
//           onExportHtml={handleExportHtml}
//           onZoomFit={handleZoomFit}
//           canUndo={canUndo}
//           canRedo={canRedo}
//           onUndo={undo}
//           onRedo={redo}
//         />
//       </div>
      
//       <div className="flex-1 flex overflow-hidden relative">
//         <ActivityBar 
//           activeTab={activeLeftTab} 
//           onTabChange={setActiveLeftTab} 
//         />

//         <ResizablePanelGroup direction="horizontal" className="h-full w-full">
//           {activeLeftTab && (
//             <>
//               <ResizablePanel 
//                 defaultSize={20} 
//                 minSize={15} 
//                 maxSize={30} 
//                 className="bg-background border-r flex flex-col"
//               >
//                 {activeLeftTab === 'templates' && (
//                   <TemplateSidebar
//                     onSelectTemplate={handleSelectTemplate}
//                     selectedTemplateId={selectedTemplateId}
//                   />
//                 )}
//                 {activeLeftTab === 'elements' && (
//                   <ElementsPanel 
//                     onAddText={handleAddText}
//                     onAddShape={handleAddShape}
//                   />
//                 )}
//                 {activeLeftTab === 'assets' && (
//                   <AssetsPanel 
//                     onAddImage={handleAddImage}
//                   />
//                 )}
//                 {activeLeftTab === 'properties' && (
//                   <PropertiesPanel
//                     selectedElement={state.selectedElement}
//                     onStyleChange={handleStyleChange}
//                     onZIndexChange={handleZIndexChange}
//                   />
//                 )}
//                 {activeLeftTab === 'layers' && (
//                   <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
//                     <div className="mb-2 opacity-20">📚</div>
//                     Layers panel coming soon
//                   </div>
//                 )}
//                 {activeLeftTab === 'settings' && (
//                   <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
//                     <div className="mb-2 opacity-20">⚙️</div>
//                     Settings panel coming soon
//                   </div>
//                 )}
//               </ResizablePanel>
//               <ResizableHandle withHandle />
//             </>
//           )}
          
//           <ResizablePanel defaultSize={activeLeftTab ? 55 : 75} minSize={30}>
//             <div className="h-full w-full bg-secondary/20 relative flex flex-col overflow-hidden">
//                <Canvas
//                 ref={canvasRef}
//                 htmlContent={state.htmlContent}
//                 zoom={state.zoom}
//                 activeTool={state.activeTool}
//                 selectedElement={state.selectedElement}
//                 isEditing={state.isEditing}
//                 onSelectElement={selectElement}
//                 onUpdateBounds={updateSelectedBounds}
//                 onStartEditing={startEditing}
//                 onStopEditing={stopEditing}
//                 onSetDragging={setIsDragging}
//                 onContentChange={addToHistory}
//               />
//             </div>
//           </ResizablePanel>
          
//           <ResizableHandle withHandle />

//           <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-background border-l">
//             <AiChatPanel />
//           </ResizablePanel>
          
//         </ResizablePanelGroup>
//       </div>
//     </div>
//   );
// }

import { useState, useCallback, useEffect, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { TemplateSidebar } from './TemplateSidebar';
import { Canvas, CanvasRef } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { AiChatPanel } from './AiChatPanel';
import { ActivityBar, SidebarTab } from './ActivityBar';
import { ElementsPanel } from './ElementsPanel';
import { AssetsPanel } from './AssetsPanel';
import { useEditorState } from '@/hooks/useEditorState';
import { useExport } from '@/hooks/useExport';
import { DesignTemplate, EditorTool } from '@/types/editor';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
    undo,
    redo,
    canUndo,
    canRedo,
    addToHistory
  } = useEditorState();

  const { exportAsPng, exportAsHtml } = useExport();
  const canvasRef = useRef<CanvasRef>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [activeLeftTab, setActiveLeftTab] = useState<SidebarTab>('templates');

  useEffect(() => {
    if (state.selectedElement && activeLeftTab !== 'properties') {
      setActiveLeftTab('properties');
    }
  }, [state.selectedElement]);

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

  const handleUploadHtml = useCallback((content: string) => {
    setSelectedTemplateId(undefined);
    setHtmlContent(content);
  }, [setHtmlContent]);

  const saveCurrentState = useCallback(() => {
    if (canvasRef.current) {
      const html = canvasRef.current.getHtmlContent();
      addToHistory(html);
    }
  }, [addToHistory]);

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

  const handleAddText = useCallback(() => {
    canvasRef.current?.addElement('text');
    setActiveLeftTab('properties');
    setActiveTool('select');
  }, [setActiveTool]);

  const handleAddShape = useCallback((type: 'rectangle' | 'circle' | 'line') => {
    canvasRef.current?.addElement(type);
    setActiveLeftTab('properties');
    setActiveTool('select');
  }, [setActiveTool]);

  const handleAddImage = useCallback((url: string) => {
    canvasRef.current?.addElement('image', url);
    setActiveTool('select');
  }, [setActiveTool]);

  const handleZIndexChange = useCallback((action: 'front' | 'back' | 'forward' | 'backward') => {
    canvasRef.current?.changeZIndex(action);
  }, []);

  const handleStyleChange = useCallback((property: string, value: string) => {
    updateElementStyle(property, value);
    saveCurrentState();
  }, [updateElementStyle, saveCurrentState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isEditing) return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, handleZoomFit, selectElement, setActiveTool, state.isEditing, undo, redo, canUndo, canRedo]);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <div className="h-14 border-b flex-none z-50 bg-background">
        <EditorToolbar
          zoom={state.zoom}
          activeTool={state.activeTool}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToolChange={handleToolChange}
          onUploadHtml={handleUploadHtml}
          onExportPng={handleExportPng}
          onExportHtml={handleExportHtml}
          onZoomFit={handleZoomFit}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden relative">
        <ActivityBar 
          activeTab={activeLeftTab} 
          onTabChange={setActiveLeftTab} 
        />

        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          {activeLeftTab && (
            <>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30} 
                className="bg-background border-r flex flex-col"
              >
                {activeLeftTab === 'templates' && (
                  <TemplateSidebar
                    onSelectTemplate={handleSelectTemplate}
                    onImportHtml={handleUploadHtml}
                    selectedTemplateId={selectedTemplateId}
                  />
                )}
                {activeLeftTab === 'elements' && (
                  <ElementsPanel 
                    onAddText={handleAddText}
                    onAddShape={handleAddShape}
                  />
                )}
                {activeLeftTab === 'assets' && (
                  <AssetsPanel 
                    onAddImage={handleAddImage}
                  />
                )}
                {activeLeftTab === 'properties' && (
                  <PropertiesPanel
                    selectedElement={state.selectedElement}
                    onStyleChange={handleStyleChange}
                    onZIndexChange={handleZIndexChange}
                  />
                )}
                {activeLeftTab === 'layers' && (
                  <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                    <div className="mb-2 opacity-20">📚</div>
                    Layers panel coming soon
                  </div>
                )}
                {activeLeftTab === 'settings' && (
                  <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                    <div className="mb-2 opacity-20">⚙️</div>
                    Settings panel coming soon
                  </div>
                )}
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          
          <ResizablePanel defaultSize={activeLeftTab ? 55 : 75} minSize={30}>
            <div className="h-full w-full bg-secondary/20 relative flex flex-col overflow-hidden">
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
                onContentChange={addToHistory}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-background border-l">
            <AiChatPanel 
              selectedElement={state.selectedElement}
              onStyleChange={handleStyleChange}
              onZIndexChange={handleZIndexChange}
            />
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </div>
    </div>
  );
}