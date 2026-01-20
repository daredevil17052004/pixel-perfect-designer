import { LayoutTemplate, SlidersHorizontal, Settings, Layers, Shapes, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type SidebarTab = 'templates' | 'elements' | 'assets' | 'properties' | 'layers' | 'settings' | null;

interface ActivityBarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

export function ActivityBar({ activeTab, onTabChange }: ActivityBarProps) {
  const handleTabClick = (tab: SidebarTab) => {
    if (activeTab === tab) {
      onTabChange(null);
    } else {
      onTabChange(tab);
    }
  };

  const SidebarButton = ({ tab, icon: Icon, label }: { tab: SidebarTab; icon: any; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={activeTab === tab ? "default" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-xl mb-2 transition-all duration-200 ${
            activeTab === tab 
              ? "bg-primary text-primary-foreground shadow-md scale-105" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          onClick={() => handleTabClick(tab)}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium" sideOffset={5}>
        {label}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 z-20 h-full shadow-sm">
      <div className="flex-1 flex flex-col items-center w-full gap-1">
        <SidebarButton tab="templates" icon={LayoutTemplate} label="Templates" />
        <SidebarButton tab="elements" icon={Shapes} label="Elements" />
        <SidebarButton tab="assets" icon={ImageIcon} label="Assets" />
        <SidebarButton tab="properties" icon={SlidersHorizontal} label="Properties" />
        <SidebarButton tab="layers" icon={Layers} label="Layers" />
      </div>

      <div className="flex flex-col items-center w-full gap-2 mt-auto">
        <Separator className="w-8 mb-2" />
        <SidebarButton tab="settings" icon={Settings} label="Settings" />
      </div>
    </div>
  );
}