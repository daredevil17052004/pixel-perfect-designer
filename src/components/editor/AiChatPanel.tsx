import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Upload, Image, FileImage, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectedElement } from '@/types/editor';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface AiChatPanelProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
  onZIndexChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  onPosterGenerated?: (imageUrl: string) => void;
}

export function AiChatPanel({ selectedElement, onStyleChange, onZIndexChange, onPosterGenerated }: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome! Upload a reference image and logo, then describe your poster to generate amazing designs.'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state for poster generation
  const [refImage, setRefImage] = useState<File | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [posterPrompt, setPosterPrompt] = useState('');
  const [visualPrompt, setVisualPrompt] = useState('');
  const [brandingPrompt, setBrandingPrompt] = useState('');

  const refInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRefImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearRefImage = () => {
    setRefImage(null);
    setRefImagePreview(null);
    if (refInputRef.current) refInputRef.current.value = '';
  };

  const clearLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleGeneratePoster = async () => {
    if (!refImage || !logo) {
      toast.error('Please upload both a reference image and a logo');
      return;
    }

    if (!brandingPrompt.trim()) {
      toast.error('Please enter a branding/logo position prompt');
      return;
    }

    setIsGenerating(true);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Generate poster:\n• Prompt: ${posterPrompt || 'Not specified'}\n• Visual Style: ${visualPrompt || 'Not specified'}\n• Logo Position: ${brandingPrompt}`
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const formData = new FormData();
      formData.append('prompt', posterPrompt);
      formData.append('style_prompt', visualPrompt);
      formData.append('ref', refImage);
      formData.append('logo', logo);
      formData.append('branding_prompt', brandingPrompt);

      const apiKey = import.meta.env.VITE_POSTER_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://srvr.creo-dev.onesol.in/generate', {
        method: 'POST',
        headers: {
          'x-user-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || `API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      // Extract image URL from response (handle different response formats)
      let imageUrl: string | null = null;
      if (typeof result === 'string') {
        imageUrl = result;
      } else if (result?.image_url) {
        imageUrl = result.image_url;
      } else if (result?.url) {
        imageUrl = result.url;
      } else if (result?.data?.url) {
        imageUrl = result.data.url;
      } else if (result?.output) {
        imageUrl = result.output;
      }
      
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }
      
      // Add assistant response with generated image
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s your generated poster! Click to add it to your canvas.',
        imageUrl: imageUrl
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Automatically add to canvas
      if (onPosterGenerated) {
        onPosterGenerated(imageUrl);
      }

      toast.success('Poster generated successfully!');

      // Clear form after successful generation
      setPosterPrompt('');
      setVisualPrompt('');
      setBrandingPrompt('');

    } catch (error) {
      console.error('Error generating poster:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, there was an error generating your poster: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to generate poster');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full bg-card flex flex-col h-full border-l border-border">
      <div className="p-4 border-b border-border flex items-center gap-2 bg-muted/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Poster Generator</h3>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {/* Chat Messages */}
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
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Generated poster" 
                    className="mt-2 rounded-md max-w-full cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onPosterGenerated?.(message.imageUrl!)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Poster Generation Form */}
      <div className="p-4 border-t border-border bg-background space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Reference Image Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Reference Image *</Label>
            <input
              type="file"
              ref={refInputRef}
              accept="image/*"
              onChange={handleRefImageChange}
              className="hidden"
            />
            {refImagePreview ? (
              <div className="relative group">
                <img 
                  src={refImagePreview} 
                  alt="Reference" 
                  className="w-full h-20 object-cover rounded-md border border-border"
                />
                <button
                  onClick={clearRefImage}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-20 flex flex-col gap-1"
                onClick={() => refInputRef.current?.click()}
              >
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload Reference</span>
              </Button>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Logo *</Label>
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoPreview ? (
              <div className="relative group">
                <img 
                  src={logoPreview} 
                  alt="Logo" 
                  className="w-full h-20 object-contain rounded-md border border-border bg-muted/30"
                />
                <button
                  onClick={clearLogo}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-20 flex flex-col gap-1"
                onClick={() => logoInputRef.current?.click()}
              >
                <FileImage className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload Logo</span>
              </Button>
            )}
          </div>
        </div>

        {/* Poster Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Poster Prompt</Label>
          <Textarea
            value={posterPrompt}
            onChange={(e) => setPosterPrompt(e.target.value)}
            placeholder="Describe your poster concept..."
            className="min-h-[60px] text-sm resize-none"
          />
        </div>

        {/* Visual Style Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Visual Style Prompt</Label>
          <Input
            value={visualPrompt}
            onChange={(e) => setVisualPrompt(e.target.value)}
            placeholder="e.g., minimalist, vibrant, retro..."
            className="text-sm"
          />
        </div>

        {/* Branding/Logo Position Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Logo Position Prompt *</Label>
          <Input
            value={brandingPrompt}
            onChange={(e) => setBrandingPrompt(e.target.value)}
            placeholder="e.g., bottom right corner, centered at top..."
            className="text-sm"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGeneratePoster}
          disabled={isGenerating || !refImage || !logo || !brandingPrompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Poster
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
