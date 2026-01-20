// import { useState } from 'react';
// import { Send, Bot, User, Sparkles } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
// }

// export function AiChatPanel() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       role: 'assistant',
//       content: 'Hi! I can help you design your poster. Try asking me to "Generate a modern color palette" or "Suggest a headline".'
//     }
//   ]);

//   const handleSend = () => {
//     if (!input.trim()) return;

//     const newMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: input
//     };

//     setMessages(prev => [...prev, newMessage]);
//     setInput('');

//     // Mock AI response
//     setTimeout(() => {
//       setMessages(prev => [...prev, {
//         id: (Date.now() + 1).toString(),
//         role: 'assistant',
//         content: `I received your request: "${newMessage.content}". I'm currently a demo, but soon I'll be able to execute design changes directly!`
//       }]);
//     }, 1000);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <div className="w-full bg-card border-l border-border flex flex-col h-full">
//       <div className="p-4 border-b border-border flex items-center gap-2">
//         <Sparkles className="h-4 w-4 text-primary" />
//         <h3 className="font-semibold text-sm">AI Assistant</h3>
//       </div>

//       <ScrollArea className="flex-1 p-4">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex gap-3 ${
//                 message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
//               }`}
//             >
//               <Avatar className="h-8 w-8 border">
//                 {message.role === 'assistant' ? (
//                   <>
//                     <AvatarImage src="/bot-avatar.png" />
//                     <AvatarFallback className="bg-primary text-primary-foreground">
//                       <Bot className="h-4 w-4" />
//                     </AvatarFallback>
//                   </>
//                 ) : (
//                   <>
//                     <AvatarImage src="/user-avatar.png" />
//                     <AvatarFallback className="bg-muted">
//                       <User className="h-4 w-4" />
//                     </AvatarFallback>
//                   </>
//                 )}
//               </Avatar>
              
//               <div
//                 className={`rounded-lg p-3 text-sm max-w-[80%] ${
//                   message.role === 'user'
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted text-muted-foreground'
//                 }`}
//               >
//                 {message.content}
//               </div>
//             </div>
//           ))}
//         </div>
//       </ScrollArea>

//       <div className="p-4 border-t border-border">
//         <form 
//           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
//           className="flex gap-2"
//         >
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask AI for help..."
//             className="flex-1"
//           />
//           <Button type="submit" size="icon" disabled={!input.trim()}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SelectedElement } from '@/types/editor';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatPanelProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
  onZIndexChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

export function AiChatPanel({ selectedElement, onStyleChange, onZIndexChange }: AiChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'I can help you edit! Try "Set opacity to 50%" or "Bring to front".'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // --- Transparency / Opacity ---
    const opacityMatch = lowerText.match(/(?:opacity|transparency)\s*(?:is|to)?\s*(\d+)%?/);
    if (opacityMatch) {
      if (!selectedElement) return "Please select an element first.";
      const value = parseInt(opacityMatch[1], 10);
      const opacity = Math.max(0, Math.min(100, value)) / 100;
      onStyleChange('opacity', String(opacity));
      return `Set opacity to ${value}%.`;
    }

    // --- Z-Index / Layering ---
    if (lowerText.includes('front')) {
      if (!selectedElement) return "Please select an element first.";
      onZIndexChange('front');
      return "Brought element to the front.";
    }
    if (lowerText.includes('back')) {
      if (!selectedElement) return "Please select an element first.";
      onZIndexChange('back');
      return "Sent element to the back.";
    }
    if (lowerText.includes('forward')) {
      if (!selectedElement) return "Please select an element first.";
      onZIndexChange('forward');
      return "Moved element forward.";
    }
    if (lowerText.includes('backward')) {
      if (!selectedElement) return "Please select an element first.";
      onZIndexChange('backward');
      return "Moved element backward.";
    }

    // --- Colors ---
    const colorMatch = lowerText.match(/(?:change|set)?\s*(?:color|fill|background)\s*(?:to)?\s*([a-z]+|#[0-9a-f]{6})/);
    if (colorMatch) {
        if (!selectedElement) return "Please select an element first.";
        const color = colorMatch[1];
        // Simple heuristic: if it's text, change color, else background
        if (selectedElement.isTextElement) {
            onStyleChange('color', color);
        } else {
            onStyleChange('background-color', color);
        }
        return `Changed color to ${color}.`;
    }

    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Process logic
    const actionResult = processCommand(input);

    setTimeout(() => {
      let responseContent = '';
      
      if (actionResult) {
        responseContent = actionResult;
      } else {
        // Fallback for unknown commands
        if (!selectedElement) {
            responseContent = "I can't perform that action right now. Try selecting an element and asking to change its opacity or position.";
        } else {
            responseContent = `I received your request: "${input}". I'm learning new commands every day!`;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent
      }]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-card flex flex-col h-full border-l border-border">
      <div className="p-4 border-b border-border flex items-center gap-2 bg-muted/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Designer</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="h-8 w-8 border shrink-0">
                {message.role === 'assistant' ? (
                  <>
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <div
                className={`rounded-lg p-3 text-sm max-w-[85%] shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground border border-border'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background">
        <div className="relative">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Make it 50% transparent..."
                className="pr-10"
            />
            <Button 
                size="icon" 
                variant="ghost"
                className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-primary"
                onClick={handleSend}
                disabled={!input.trim()}
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['Opacity 50%', 'Bring to front', 'Send to back'].map(cmd => (
                <button 
                    key={cmd}
                    onClick={() => setInput(cmd)}
                    className="text-[10px] bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                    {cmd}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}