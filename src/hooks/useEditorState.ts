import { useState, useCallback } from 'react';
import { EditorState, SelectedElement, ElementBounds, EditorTool } from '@/types/editor';

const initialState: EditorState = {
  zoom: 0.5,
  selectedElement: null,
  isEditing: false,
  isDragging: false,
  htmlContent: '',
  canvasWidth: 600,
  canvasHeight: 750,
  activeTool: 'select',
};

export function useEditorState() {
  const [state, setState] = useState<EditorState>(initialState);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(2, zoom)) }));
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.min(2, prev.zoom + 0.1) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom - 0.1) }));
  }, []);

  const setActiveTool = useCallback((tool: EditorTool) => {
    setState(prev => ({ ...prev, activeTool: tool, selectedElement: tool !== 'select' ? null : prev.selectedElement }));
  }, []);

  const selectElement = useCallback((element: HTMLElement | null, iframeDoc?: Document) => {
    if (!element || !iframeDoc) {
      setState(prev => ({ ...prev, selectedElement: null, isEditing: false }));
      return;
    }

    const rect = element.getBoundingClientRect();
    const bounds: ElementBounds = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };

    const computedStyles = iframeDoc.defaultView?.getComputedStyle(element) || window.getComputedStyle(element);
    const tagName = element.tagName.toLowerCase();
    const isTextElement = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'li', 'td', 'th', 'label', 'button'].includes(tagName);
    const isImageElement = tagName === 'img' || (tagName === 'div' && computedStyles.backgroundImage !== 'none');

    const selected: SelectedElement = {
      element,
      bounds,
      computedStyles,
      tagName,
      isTextElement,
      isImageElement,
    };

    setState(prev => ({ ...prev, selectedElement: selected, isEditing: false }));
  }, []);

  const updateSelectedBounds = useCallback((bounds: ElementBounds) => {
    setState(prev => ({
      ...prev,
      selectedElement: prev.selectedElement ? { ...prev.selectedElement, bounds } : null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedElement: null, isEditing: false }));
  }, []);

  const startEditing = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: true }));
  }, []);

  const stopEditing = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: false }));
  }, []);

  const setIsDragging = useCallback((isDragging: boolean) => {
    setState(prev => ({ ...prev, isDragging }));
  }, []);

  const setHtmlContent = useCallback((content: string) => {
    setState(prev => ({ ...prev, htmlContent: content, selectedElement: null }));
  }, []);

  const setCanvasSize = useCallback((width: number, height: number) => {
    setState(prev => ({ ...prev, canvasWidth: width, canvasHeight: height }));
  }, []);

  const updateElementStyle = useCallback((property: string, value: string) => {
    if (state.selectedElement?.element) {
      state.selectedElement.element.style.setProperty(property, value);
      // Force re-read computed styles
      const iframeDoc = state.selectedElement.element.ownerDocument;
      const computedStyles = iframeDoc?.defaultView?.getComputedStyle(state.selectedElement.element) || window.getComputedStyle(state.selectedElement.element);
      setState(prev => ({
        ...prev,
        selectedElement: prev.selectedElement ? { ...prev.selectedElement, computedStyles } : null,
      }));
    }
  }, [state.selectedElement]);

  return {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    setActiveTool,
    selectElement,
    updateSelectedBounds,
    clearSelection,
    startEditing,
    stopEditing,
    setIsDragging,
    setHtmlContent,
    setCanvasSize,
    updateElementStyle,
  };
}
