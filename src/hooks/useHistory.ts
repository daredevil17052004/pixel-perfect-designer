import { useState, useCallback, useRef } from 'react';

interface HistoryState {
  htmlContent: string;
  timestamp: number;
}

const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const pushState = useCallback((htmlContent: string) => {
    // Don't push if this is triggered by undo/redo
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Don't push if content is same as current
      if (newHistory.length > 0 && newHistory[newHistory.length - 1].htmlContent === htmlContent) {
        return prev;
      }

      // Add new state
      const updated = [...newHistory, { htmlContent, timestamp: Date.now() }];
      
      // Limit history size
      if (updated.length > MAX_HISTORY) {
        return updated.slice(-MAX_HISTORY);
      }
      
      return updated;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentIndex]);

  const undo = useCallback((): string | null => {
    if (currentIndex <= 0) return null;
    
    isUndoRedoRef.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.htmlContent || null;
  }, [currentIndex, history]);

  const redo = useCallback((): string | null => {
    if (currentIndex >= history.length - 1) return null;
    
    isUndoRedoRef.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.htmlContent || null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const captureState = useCallback((iframeDoc: Document | null): string | null => {
    if (!iframeDoc) return null;
    
    // Remove editor styles before capturing
    const editorStyle = iframeDoc.getElementById('editor-styles');
    const editorStyleContent = editorStyle?.textContent || '';
    if (editorStyle) editorStyle.remove();
    
    const html = iframeDoc.documentElement.outerHTML;
    
    // Restore editor styles
    if (editorStyleContent) {
      const newStyle = iframeDoc.createElement('style');
      newStyle.id = 'editor-styles';
      newStyle.textContent = editorStyleContent;
      iframeDoc.head.appendChild(newStyle);
    }
    
    return html;
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    captureState,
  };
}
