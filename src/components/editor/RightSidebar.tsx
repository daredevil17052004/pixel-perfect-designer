import { useState } from 'react';
import { MessageSquare, Layers, Send, ChevronUp, ChevronDown, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LayerItem {
  element: HTMLElement;
  name: string;
  zIndex: number;
  visible: boolean;
  id: string;
}

interface RightSidebarProps {
  layers: LayerItem[];
  selectedElementId: string | null;
  onSelectLayer: (element: HTMLElement) => void;
  onDeleteLayer: (element: HTMLElement) => void;
  onToggleVisibility: (element: HTMLElement) => void;
  onMoveLayerUp: (element: HTMLElement) => void;
  onMoveLayerDown: (element: HTMLElement) => void;
  onReorderLayers: (layers: LayerItem[]) => void;
}

type RightTab = 'ai' | 'layers';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function RightSidebar({
  layers,
  selectedElementId,
  onSelectLayer,
  onDeleteLayer,
  onToggleVisibility,
  onMoveLayerUp,
  onMoveLayerDown,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<RightTab>('ai');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI design assistant. I can help you with design suggestions, color palettes, typography choices, and more. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('color')) {
      return "For a modern look, I'd suggest using a primary color like #6366F1 (indigo) with complementary accents. Would you like me to generate a complete color palette?";
    }
    if (lowerInput.includes('font') || lowerInput.includes('typography')) {
      return "I recommend pairing a bold display font like 'Bebas Neue' for headings with 'Inter' for body text. This creates great visual hierarchy!";
    }
    if (lowerInput.includes('layout')) {
      return "For better visual flow, try aligning elements to a grid and maintaining consistent spacing. Would you like specific suggestions for your current design?";
    }
    return "I can help you with colors, typography, layout suggestions, and design improvements. What aspect would you like to work on?";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const tabs = [
    { id: 'ai' as const, icon: MessageSquare, label: 'AI Agent' },
    { id: 'layers' as const, icon: Layers, label: 'Layers' },
  ];

  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-full">
      {/* Content Panel */}
      <div className="w-72 bg-background border-l border-border flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm transition-colors",
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-primary bg-muted/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'ai' && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI for help..."
                    className="flex-1 bg-muted/50"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'layers' && (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-1">
                {sortedLayers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No layers yet</p>
                    <p className="text-xs mt-1">Add elements to your design</p>
                  </div>
                ) : (
                  sortedLayers.map((layer, index) => (
                    <div
                      key={layer.id}
                      onClick={() => onSelectLayer(layer.element)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group",
                        selectedElementId === layer.id
                          ? "bg-primary/20 text-foreground"
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground w-6">
                          {layer.zIndex}
                        </span>
                        <span className="text-sm truncate">{layer.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayerUp(layer.element);
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayerDown(layer.element);
                          }}
                          disabled={index === sortedLayers.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(layer.element);
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLayer(layer.element);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
