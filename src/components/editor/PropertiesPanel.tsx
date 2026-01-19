import { useState, useEffect } from 'react';
import { Type, Palette, Box, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectedElement, FONT_OPTIONS } from '@/types/editor';

interface PropertiesPanelProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
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

export function PropertiesPanel({ selectedElement, onStyleChange }: PropertiesPanelProps) {
  const [styles, setStyles] = useState({
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    padding: 0,
    borderRadius: 0,
  });

  useEffect(() => {
    if (selectedElement?.computedStyles) {
      const cs = selectedElement.computedStyles;
      setStyles({
        fontSize: parseSize(cs.fontSize),
        fontWeight: cs.fontWeight,
        fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        color: parseColorToHex(cs.color),
        backgroundColor: cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : parseColorToHex(cs.backgroundColor),
        textAlign: cs.textAlign,
        lineHeight: parseFloat(cs.lineHeight) / parseSize(cs.fontSize) || 1.5,
        letterSpacing: parseSize(cs.letterSpacing),
        padding: parseSize(cs.padding),
        borderRadius: parseSize(cs.borderRadius),
      });
    }
  }, [selectedElement]);

  const handleChange = (property: string, value: string | number, cssProperty?: string) => {
    setStyles(prev => ({ ...prev, [property]: value }));
    const cssProp = cssProperty || property.replace(/([A-Z])/g, '-$1').toLowerCase();
    onStyleChange(cssProp, String(value));
  };

  if (!selectedElement) {
    return (
      <div className="w-72 bg-card border-l border-border flex flex-col h-full">
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

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Properties</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            &lt;{selectedElement.tagName}&gt;
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
            {/* Colors */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Colors</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Fill</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      style={{ backgroundColor: styles.backgroundColor }}
                    />
                    <Input
                      type="color"
                      value={styles.backgroundColor}
                      onChange={(e) => handleChange('backgroundColor', e.target.value, 'background-color')}
                      className="w-full h-8 p-0.5"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Text</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      style={{ backgroundColor: styles.color }}
                    />
                    <Input
                      type="color"
                      value={styles.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-full h-8 p-0.5"
                    />
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
                  onValueChange={([v]) => handleChange('borderRadius', `${v}px`, 'border-radius')}
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
                  onValueChange={([v]) => handleChange('padding', `${v}px`)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="p-4 space-y-4 mt-0">
            {selectedElement.isTextElement && (
              <>
                {/* Font Family */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Font</Label>
                  <Select
                    value={styles.fontFamily}
                    onValueChange={(v) => {
                      const font = FONT_OPTIONS.find(f => f.name === v);
                      if (font) handleChange('fontFamily', font.family, 'font-family');
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

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <Input
                      type="number"
                      value={styles.fontSize}
                      onChange={(e) => handleChange('fontSize', `${e.target.value}px`, 'font-size')}
                      className="h-9"
                      min={8}
                      max={200}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Weight</Label>
                    <Select
                      value={styles.fontWeight}
                      onValueChange={(v) => handleChange('fontWeight', v, 'font-weight')}
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

                {/* Text Formatting */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-8 mx-1" />
                    <Button 
                      variant={styles.textAlign === 'left' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChange('textAlign', 'left', 'text-align')}
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'center' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChange('textAlign', 'center', 'text-align')}
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'right' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChange('textAlign', 'right', 'text-align')}
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant={styles.textAlign === 'justify' ? 'secondary' : 'outline'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChange('textAlign', 'justify', 'text-align')}
                    >
                      <AlignJustify className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Line Height */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Line Height</Label>
                    <span className="text-xs text-muted-foreground">{styles.lineHeight.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[styles.lineHeight * 100]}
                    onValueChange={([v]) => handleChange('lineHeight', (v / 100).toFixed(2), 'line-height')}
                    min={80}
                    max={300}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Letter Spacing</Label>
                    <span className="text-xs text-muted-foreground">{styles.letterSpacing}px</span>
                  </div>
                  <Slider
                    value={[styles.letterSpacing + 10]}
                    onValueChange={([v]) => handleChange('letterSpacing', `${v - 10}px`, 'letter-spacing')}
                    min={0}
                    max={30}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="layout" className="p-4 space-y-4 mt-0">
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
