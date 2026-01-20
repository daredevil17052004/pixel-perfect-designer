import { Type, Square, Circle, Minus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ElementsPanelProps {
  onAddText: () => void;
  onAddShape: (type: 'rectangle' | 'circle' | 'line') => void;
}

export function ElementsPanel({ onAddText, onAddShape }: ElementsPanelProps) {
  return (
    <div className="w-full bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Add Elements</h3>
      </div>

      <Tabs defaultValue="all" className="w-full flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
           <TabsList className="w-full grid grid-cols-2">
             <TabsTrigger value="all">All</TabsTrigger>
             <TabsTrigger value="shapes">Shapes</TabsTrigger>
           </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            
            <TabsContent value="all" className="mt-0 space-y-6">
               {/* Typography Section */}
               <div>
                  <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Typography
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-12 hover:border-primary hover:bg-secondary/50"
                    onClick={onAddText}
                  >
                    <div className="bg-primary/10 p-2 rounded text-primary">
                      <Type className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Add Heading</span>
                    </div>
                  </Button>
               </div>

               <Separator />

               {/* Shapes Section */}
               <div>
                  <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Basic Shapes
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-secondary/50" onClick={() => onAddShape('rectangle')}>
                      <Square className="h-6 w-6" />
                      <span className="text-xs">Rectangle</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-secondary/50" onClick={() => onAddShape('circle')}>
                      <Circle className="h-6 w-6" />
                      <span className="text-xs">Circle</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-secondary/50" onClick={() => onAddShape('line')}>
                      <Minus className="h-6 w-6" />
                      <span className="text-xs">Line</span>
                    </Button>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="shapes" className="mt-0">
               <div>
                  <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Shapes Library
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary" onClick={() => onAddShape('rectangle')}>
                      <div className="w-8 h-6 bg-current opacity-20 rounded-sm" />
                      <span className="text-xs">Rectangle</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary" onClick={() => onAddShape('circle')}>
                      <div className="w-8 h-8 bg-current opacity-20 rounded-full" />
                      <span className="text-xs">Circle</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary" onClick={() => onAddShape('line')}>
                      <div className="w-8 h-0.5 bg-current opacity-20" />
                      <span className="text-xs">Line</span>
                    </Button>
                  </div>
               </div>
            </TabsContent>

          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}