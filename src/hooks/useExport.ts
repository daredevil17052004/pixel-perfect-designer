import { useCallback } from 'react';
import html2canvas from 'html2canvas';
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

      // Get the poster container or body
      const target = iframeDoc.querySelector('.poster-container') as HTMLElement || iframeDoc.body;
      
      // Use html2canvas to capture the content
      const canvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `design-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: 'Export successful',
            description: 'Your design has been exported as PNG',
          });
        }
      }, 'image/png');
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
