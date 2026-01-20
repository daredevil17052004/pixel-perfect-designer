import { useState, useEffect } from 'react';
import { 
  Type, Palette, Box, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline,
  BringToFront, SendToBack, ArrowUp, ArrowDown,
  Percent
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectedElement, FONT_OPTIONS } from '@/types/editor';

interface PropertiesPanelProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
  onZIndexChange?: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

function parseColorToHex(color: string): string {
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]).toString(16).padStart(2, '0');
      const g = parseInt(match[1]).toString(16).padStart(2, '0');
      const b = parseInt(match[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return '#000000';
}

function parseSize(value: string): number {
  return parseFloat(value) || 0;
}

export function PropertiesPanel({ selectedElement, onStyleChange, onZIndexChange }: PropertiesPanelProps) {
  const [styles, setStyles] = useState({
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    padding: 0,
    borderRadius: 0,
    opacity: 1, // New state for opacity
  });

  useEffect(() => {
    if (selectedElement?.computedStyles) {
      const cs = selectedElement.computedStyles;
      setStyles({
        fontSize: parseSize(cs.fontSize),
        fontWeight: cs.fontWeight || '400',
        fontFamily: cs.fontFamily ? cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() : 'Inter',
        fontStyle: cs.fontStyle || 'normal',
        textDecoration: cs.textDecoration || 'none',
        color: parseColorToHex(cs.color),
        backgroundColor: cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : parseColorToHex(cs.backgroundColor),
        textAlign: cs.textAlign || 'left',
        lineHeight: cs.lineHeight === 'normal' ? 1.5 : (parseFloat(cs.lineHeight) / parseSize(cs.fontSize)) || 1.5,
        letterSpacing: parseSize(cs.letterSpacing),
        padding: parseSize(cs.padding),
        borderRadius: parseSize(cs.borderRadius),
        opacity: parseFloat(cs.opacity) || 1, // Parse opacity
      });
    }
  }, [selectedElement]);

  const handleStyleChange = (property: keyof typeof styles, value: any, cssValue: string, cssProperty?: string) => {
    setStyles(prev => ({ ...prev, [property]: value }));
    const cssProp = cssProperty || property.replace(/([A-Z])/g, '-$1').toLowerCase();
    onStyleChange(cssProp, cssValue);
  };

  const toggleBold = () => {
    const currentWeight = styles.fontWeight === 'bold' ? 700 : parseInt(String(styles.fontWeight));
    const isBold = !isNaN(currentWeight) && currentWeight >= 700;
    const newWeight = isBold ? '400' : '700';
    handleStyleChange('fontWeight', newWeight, newWeight, 'font-weight');
  };

  const toggleItalic = () => {
    const isItalic = styles.fontStyle === 'italic';
    const newStyle = isItalic ? 'normal' : 'italic';
    handleStyleChange('fontStyle', newStyle, newStyle, 'font-style');
  };

  const toggleUnderline = () => {
    const isUnderline = styles.textDecoration.includes('underline');
    const newDeco = isUnderline ? 'none' : 'underline';
    handleStyleChange('textDecoration', newDeco, newDeco, 'text-decoration');
  };

  if (!selectedElement) {
    return (
      <div className="w-full bg-card flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select an element to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const displayLineHeight = typeof styles.lineHeight === 'number' 
    ? styles.lineHeight.toFixed(2) 
    : parseFloat(String(styles.lineHeight)).toFixed(2) || '1.50';

  return (
    <div className="w-full bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Properties</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            &lt;{selectedElement.tagName.toLowerCase()}&gt;
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-4">
            <TabsTrigger value="style" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
              <Palette className="h-3.5 w-3.5" />
              Style
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
              <Type className="h-3.5 w-3.5" />
              Text
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
              <Layers className="h-3.5 w-3.5" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="p-4 space-y-4 mt-0">
            {/* Opacity Control - Available for ALL elements */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opacity</Label>
                <span className="text-xs text-muted-foreground">{Math.round(styles.opacity * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[styles.opacity * 100]}
                  onValueChange={([v]) => handleStyleChange('opacity', v / 100, String(v / 100), 'opacity')}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Colors */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Colors</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Fill</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border cursor-pointer shadow-sm"
                      style={{ backgroundColor: styles.backgroundColor }}
                      onClick={() => document.getElementById('fill-color-input')?.click()}
                    />
                    <div className="relative flex-1">
                      <Input
                        id="fill-color-input"
                        type="color"
                        value={styles.backgroundColor}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value, e.target.value, 'background-color')}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <Input 
                        value={styles.backgroundColor}
                        readOnly
                        className="w-full h-8 px-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Text/Border</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border cursor-pointer shadow-sm"
                      style={{ backgroundColor: styles.color }}
                      onClick={() => document.getElementById('text-color-input')?.click()}
                    />
                    <div className="relative flex-1">
                      <Input
                        id="text-color-input"
                        type="color"
                        value={styles.color}
                        onChange={(e) => handleStyleChange('color', e.target.value, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                       <Input 
                        value={styles.color}
                        readOnly
                        className="w-full h-8 px-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Border Radius */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Corners</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Border Radius</Label>
                  <span className="text-xs text-muted-foreground">{styles.borderRadius}px</span>
                </div>
                <Slider
                  value={[styles.borderRadius]}
                  onValueChange={([v]) => handleStyleChange('borderRadius', v, `${v}px`, 'border-radius')}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Padding */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Spacing</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Padding</Label>
                  <span className="text-xs text-muted-foreground">{styles.padding}px</span>
                </div>
                <Slider
                  value={[styles.padding]}
                  onValueChange={([v]) => handleStyleChange('padding', v, `${v}px`)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="p-4 space-y-4 mt-0">
            {selectedElement.isTextElement ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Font</Label>
                  <Select
                    value={styles.fontFamily}
                    onValueChange={(v) => {
                      const font = FONT_OPTIONS.find(f => f.name === v);
                      if (font) handleStyleChange('fontFamily', font.family, font.family, 'font-family');
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(font => (
                        <SelectItem key={font.name} value={font.name}>
                          <span style={{ fontFamily: font.family }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={styles.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value), `${e.target.value}px`, 'font-size')}
                        className="h-9"
                        min={8}
                        max={200}
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Weight</Label>
                    <Select
                      value={String(styles.fontWeight)}
                      onValueChange={(v) => handleStyleChange('fontWeight', v, v, 'font-weight')}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Regular</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                        <SelectItem value="800">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</Label>
                  <div className="flex gap-1">
                    <Button 
                      variant={(parseInt(String(styles.fontWeight)) >= 700 || styles.fontWeight === 'bold') ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={toggleBold}
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.fontStyle === 'italic' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={toggleItalic}
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textDecoration.includes('underline') ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={toggleUnderline}
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-8 mx-1" />
                    <Button 
                      variant={styles.textAlign === 'left' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleStyleChange('textAlign', 'left', 'left', 'text-align')}
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'center' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleStyleChange('textAlign', 'center', 'center', 'text-align')}
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'right' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleStyleChange('textAlign', 'right', 'right', 'text-align')}
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'justify' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleStyleChange('textAlign', 'justify', 'justify', 'text-align')}
                    >
                      <AlignJustify className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Line Height</Label>
                    <span className="text-xs text-muted-foreground">{displayLineHeight}</span>
                  </div>
                  <Slider
                    value={[typeof styles.lineHeight === 'number' ? styles.lineHeight * 100 : 150]}
                    onValueChange={([v]) => {
                      const newVal = parseFloat((v / 100).toFixed(2));
                      handleStyleChange('lineHeight', newVal, String(newVal), 'line-height');
                    }}
                    min={80}
                    max={300}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
               <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs text-center">
                 <Type className="h-8 w-8 mb-2 opacity-20" />
                 <p>Text properties are not available <br/>for this element.</p>
               </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="p-4 space-y-4 mt-0">
            {/* Layer Order Controls */}
            {onZIndexChange && (
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layer Order</Label>
                <div className="flex gap-2 justify-center bg-secondary/30 p-2 rounded-lg border border-border/50">
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZIndexChange('front')}>
                         <BringToFront className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>Bring to Front</TooltipContent>
                   </Tooltip>
                   
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZIndexChange('forward')}>
                         <ArrowUp className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>Bring Forward</TooltipContent>
                   </Tooltip>

                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZIndexChange('backward')}>
                         <ArrowDown className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>Send Backward</TooltipContent>
                   </Tooltip>

                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZIndexChange('back')}>
                         <SendToBack className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>Send to Back</TooltipContent>
                   </Tooltip>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">X</Label>
                  <Input type="number" value={Math.round(selectedElement.bounds.x)} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Y</Label>
                  <Input type="number" value={Math.round(selectedElement.bounds.y)} className="h-9" readOnly />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Input type="number" value={Math.round(selectedElement.bounds.width)} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Height</Label>
                  <Input type="number" value={Math.round(selectedElement.bounds.height)} className="h-9" readOnly />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}