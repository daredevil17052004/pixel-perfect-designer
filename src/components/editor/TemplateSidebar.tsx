// import { FileText, Plus, FolderOpen, Layout } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import { DESIGN_TEMPLATES, DesignTemplate } from '@/types/editor';

// interface TemplateSidebarProps {
//   onSelectTemplate: (template: DesignTemplate) => void;
//   selectedTemplateId?: string;
// }

// export function TemplateSidebar({ onSelectTemplate, selectedTemplateId }: TemplateSidebarProps) {
//   // Changed w-64 to w-full to fit the parent container
//   return (
//     <div className="w-full bg-card flex flex-col h-full">
//       <div className="p-4 border-b border-border">
//         <div className="flex items-center gap-2 mb-3">
//           <Layout className="h-5 w-5 text-primary" />
//           <span className="font-semibold">DesignFlow</span>
//         </div>
//         <Button variant="outline" size="sm" className="w-full gap-2">
//           <Plus className="h-4 w-4" />
//           New Design
//         </Button>
//       </div>

//       <ScrollArea className="flex-1">
//         <div className="p-4">
//           <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
//             <FolderOpen className="h-3.5 w-3.5" />
//             Templates
//           </div>
          
//           <div className="space-y-2">
//             {DESIGN_TEMPLATES.map((template) => (
//               <button
//                 key={template.id}
//                 onClick={() => onSelectTemplate(template)}
//                 className={`w-full p-3 rounded-lg border text-left transition-all duration-200 group ${
//                   selectedTemplateId === template.id
//                     ? 'border-primary bg-primary/10'
//                     : 'border-border hover:border-primary/50 hover:bg-secondary/50'
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-md flex-shrink-0 ${
//                     selectedTemplateId === template.id
//                       ? 'bg-primary text-primary-foreground'
//                       : 'bg-secondary text-secondary-foreground group-hover:bg-primary/20 group-hover:text-primary'
//                   }`}>
//                     <FileText className="h-4 w-4" />
//                   </div>
//                   <div className="min-w-0">
//                     <div className="font-medium text-sm text-foreground truncate">{template.name}</div>
//                     <div className="text-xs text-muted-foreground">HTML Template</div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <Separator className="mx-4" />

//         <div className="p-4">
//           <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
//             Recent
//           </div>
//           <div className="text-xs text-muted-foreground text-center py-4">
//             No recent designs
//           </div>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }


import { useRef } from 'react';
import { FileText, Plus, FolderOpen, Layout, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DESIGN_TEMPLATES, DesignTemplate } from '@/types/editor';

// Corrected Interface to include onImportHtml
interface TemplateSidebarProps {
  onSelectTemplate: (template: DesignTemplate) => void;
  onImportHtml: (content: string) => void;
  selectedTemplateId?: string;
}

export function TemplateSidebar({ onSelectTemplate, onImportHtml, selectedTemplateId }: TemplateSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImportHtml(content);
      };
      reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-5 w-5 text-primary" />
          <span className="font-semibold">DesignFlow</span>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
            <Button 
                variant="default" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            <FolderOpen className="h-3.5 w-3.5" />
            Templates
          </div>
          
          <div className="space-y-2">
            {DESIGN_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`w-full p-3 rounded-lg border text-left transition-all duration-200 group ${
                  selectedTemplateId === template.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md flex-shrink-0 ${
                    selectedTemplateId === template.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{template.name}</div>
                    <div className="text-xs text-muted-foreground">HTML Template</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Separator className="mx-4" />

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Recent
          </div>
          <div className="text-xs text-muted-foreground text-center py-4">
            No recent designs
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}