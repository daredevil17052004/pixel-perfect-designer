import { useState, useCallback, useEffect } from 'react';

export interface LayerItem {
  element: HTMLElement;
  name: string;
  zIndex: number;
  visible: boolean;
  id: string;
}

export function useLayers(iframeDoc: Document | null) {
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const getElementName = useCallback((element: HTMLElement): string => {
    // Try to get a meaningful name for the element
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      const firstClass = element.className.split(' ')[0];
      if (firstClass) return `.${firstClass}`;
    }
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim().slice(0, 20);
    if (textContent) return `${tagName}: "${textContent}${textContent.length >= 20 ? '...' : ''}"`;
    return tagName;
  }, []);

  const refreshLayers = useCallback(() => {
    if (!iframeDoc) {
      setLayers([]);
      return;
    }

    const container = iframeDoc.querySelector('.poster-container') || iframeDoc.body;
    const elements = Array.from(container.children) as HTMLElement[];
    
    const layerItems: LayerItem[] = elements
      .filter(el => {
        // Filter out script, style, and other non-visual elements
        const tag = el.tagName.toLowerCase();
        return !['script', 'style', 'link', 'meta', 'noscript'].includes(tag);
      })
      .map((element, index) => {
        const style = iframeDoc.defaultView?.getComputedStyle(element);
        const zIndex = parseInt(style?.zIndex || '0', 10) || index;
        const visibility = style?.visibility !== 'hidden' && style?.display !== 'none';
        
        return {
          element,
          name: getElementName(element),
          zIndex,
          visible: visibility,
          id: element.dataset.layerId || `layer-${index}-${Date.now()}`,
        };
      });

    // Assign unique IDs if not present
    layerItems.forEach(layer => {
      if (!layer.element.dataset.layerId) {
        layer.element.dataset.layerId = layer.id;
      }
    });

    setLayers(layerItems);
  }, [iframeDoc, getElementName]);

  // Auto-refresh layers when document changes
  useEffect(() => {
    refreshLayers();

    if (!iframeDoc) return;

    // Set up mutation observer to track DOM changes
    const observer = new MutationObserver(() => {
      refreshLayers();
    });

    observer.observe(iframeDoc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => observer.disconnect();
  }, [iframeDoc, refreshLayers]);

  const moveLayerUp = useCallback((element: HTMLElement) => {
    if (!iframeDoc) return;
    const style = iframeDoc.defaultView?.getComputedStyle(element);
    const currentZ = parseInt(style?.zIndex || '0', 10) || 0;
    element.style.zIndex = String(currentZ + 1);
    refreshLayers();
  }, [iframeDoc, refreshLayers]);

  const moveLayerDown = useCallback((element: HTMLElement) => {
    if (!iframeDoc) return;
    const style = iframeDoc.defaultView?.getComputedStyle(element);
    const currentZ = parseInt(style?.zIndex || '0', 10) || 0;
    element.style.zIndex = String(Math.max(0, currentZ - 1));
    refreshLayers();
  }, [iframeDoc, refreshLayers]);

  const toggleVisibility = useCallback((element: HTMLElement) => {
    const currentDisplay = element.style.display;
    element.style.display = currentDisplay === 'none' ? '' : 'none';
    refreshLayers();
  }, [refreshLayers]);

  const deleteLayer = useCallback((element: HTMLElement) => {
    element.remove();
    refreshLayers();
  }, [refreshLayers]);

  const reorderLayers = useCallback((newLayers: LayerItem[]) => {
    // Update z-indices based on new order
    newLayers.forEach((layer, index) => {
      layer.element.style.zIndex = String(newLayers.length - index);
    });
    refreshLayers();
  }, [refreshLayers]);

  return {
    layers,
    refreshLayers,
    moveLayerUp,
    moveLayerDown,
    toggleVisibility,
    deleteLayer,
    reorderLayers,
  };
}
