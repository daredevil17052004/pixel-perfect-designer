import { FileText, Plus, FolderOpen, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DESIGN_TEMPLATES, DesignTemplate } from '@/types/editor';

interface TemplateSidebarProps {
  onSelectTemplate: (template: DesignTemplate) => void;
  selectedTemplateId?: string;
}

export function TemplateSidebar({ onSelectTemplate, selectedTemplateId }: TemplateSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-5 w-5 text-primary" />
          <span className="font-semibold">DesignFlow</span>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Design
        </Button>
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
