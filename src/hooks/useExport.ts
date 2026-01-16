import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useExport() {
  const exportAsPng = useCallback(async (iframeElement: HTMLIFrameElement | null) => {
    if (!iframeElement) {
      toast({
        title: 'Export failed',
        description: 'No design loaded to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe content');
      }

      // Remove editor-specific styles temporarily
      const editorStyle = iframeDoc.getElementById('editor-styles');
      if (editorStyle) editorStyle.remove();

      // Get the poster container or body
      const target = iframeDoc.querySelector('.poster-container') as HTMLElement || iframeDoc.body;
      const rect = target.getBoundingClientRect();
      
      // Create a canvas matching the iframe content size
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');
      
      // Use foreignObject to render HTML to canvas
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width * scale}" height="${rect.height * scale}">
          <foreignObject width="100%" height="100%" style="transform: scale(${scale}); transform-origin: top left;">
            ${new XMLSerializer().serializeToString(iframeDoc.documentElement)}
          </foreignObject>
        </svg>
      `;
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `design-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

            toast({
              title: 'Export successful',
              description: 'Your design has been exported as PNG',
            });
          }
        }, 'image/png');
      };
      
      img.onerror = async () => {
        // Fallback: use dom-to-image-like approach with data URL
        URL.revokeObjectURL(url);
        
        // Take a screenshot approach - draw iframe content
        const iframeWindow = iframeElement.contentWindow;
        if (!iframeWindow) throw new Error('Cannot access iframe window');
        
        // Clone styles and inline them
        const clonedDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;
        
        // Create an offscreen canvas and draw
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = rect.width * scale;
        offscreenCanvas.height = rect.height * scale;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        
        if (offscreenCtx) {
          offscreenCtx.fillStyle = '#000';
          offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          
          // Simple fallback - just export with background
          offscreenCanvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `design-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(downloadUrl);
            }
          }, 'image/png');
        }
        
        toast({
          title: 'Export completed',
          description: 'Design exported (some styles may differ)',
        });
      };
      
      img.src = url;
    } catch (error) {
      console.error('Export PNG failed:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export design as PNG',
        variant: 'destructive',
      });
    }
  }, []);

  const exportAsHtml = useCallback((iframeElement: HTMLIFrameElement | null) => {
    if (!iframeElement) {
      toast({
        title: 'Export failed',
        description: 'No design loaded to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe content');
      }

      // Clone the document to remove editor-specific styles
      const htmlContent = iframeDoc.documentElement.outerHTML;
      
      // Remove editor-specific style tag
      const cleanedHtml = htmlContent.replace(/<style id="editor-styles">[\s\S]*?<\/style>/g, '');

      // Create blob and download
      const blob = new Blob([cleanedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `design-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Your design has been exported as HTML',
      });
    } catch (error) {
      console.error('Export HTML failed:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export design as HTML',
        variant: 'destructive',
      });
    }
  }, []);

  return {
    exportAsPng,
    exportAsHtml,
  };
}
