import { useState, useEffect, useRef } from 'react';
import { 
  Palette, Type, Layers, Box, Plus, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  Bold, Italic, Underline, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectedElement, FONT_OPTIONS, DesignTemplate, DESIGN_TEMPLATES } from '@/types/editor';
import { cn } from '@/lib/utils';

interface LeftSidebarProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
  onSelectTemplate: (template: DesignTemplate) => void;
  selectedTemplateId?: string;
  onUploadHtml: (content: string) => void;
}

type SidebarTab = 'design' | 'text' | 'assets';

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

export function LeftSidebar({ 
  selectedElement, 
  onStyleChange,
  onSelectTemplate,
  selectedTemplateId,
  onUploadHtml,
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [styles, setStyles] = useState({
    fontSize: 32,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'left',
    fontStyle: 'normal',
    textDecoration: 'none',
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
        fontStyle: cs.fontStyle || 'normal',
        textDecoration: cs.textDecorationLine || cs.textDecoration || 'none',
      });
    }
  }, [selectedElement]);

  const handleChange = (property: string, value: string | number, cssProperty?: string) => {
    setStyles(prev => ({ ...prev, [property]: value }));
    const cssProp = cssProperty || property.replace(/([A-Z])/g, '-$1').toLowerCase();
    onStyleChange(cssProp, String(value));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onUploadHtml(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'design' as const, icon: Palette, label: 'Design' },
    { id: 'text' as const, icon: Type, label: 'Text' },
    { id: 'assets' as const, icon: Box, label: 'Assets' },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96, 128];

  const colorPresets = [
    { color: '#EF4444', name: 'Red' },
    { color: '#14B8A6', name: 'Teal' },
  ];

  return (
    <div className="flex h-full">
      {/* Tab Navigation */}
      <div className="w-14 bg-muted/20 border-r border-border flex flex-col items-center py-2 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
              activeTab === tab.id 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="w-56 bg-background border-r border-border">
        <ScrollArea className="h-full">
          {activeTab === 'design' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Templates</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="space-y-2">
                  {DESIGN_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className={cn(
                        "w-full p-2 rounded-md border text-left text-sm transition-colors",
                        selectedTemplateId === template.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="p-4 space-y-4">
              {/* Text Styles */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Text Styles</Label>
                <div className="space-y-2">
                  <button className="w-full p-3 rounded-md bg-muted/30 text-left hover:bg-muted/50 transition-colors">
                    <span className="text-lg font-bold">Heading</span>
                  </button>
                  <button className="w-full p-3 rounded-md bg-muted/30 text-left hover:bg-muted/50 transition-colors">
                    <span className="text-base font-semibold">Subheading</span>
                  </button>
                  <button className="w-full p-3 rounded-md bg-muted/30 text-left hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Body text</span>
                  </button>
                </div>
              </div>

              {/* Bold, Italic, Underline */}
              <div className="flex gap-1">
                <Button
                  variant={styles.fontWeight === '700' || styles.fontWeight === 'bold' ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() => {
                    const isBold = styles.fontWeight === '700' || styles.fontWeight === 'bold';
                    handleChange('fontWeight', isBold ? '400' : '700', 'font-weight');
                  }}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={styles.fontStyle === 'italic' ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() => {
                    const isItalic = styles.fontStyle === 'italic';
                    handleChange('fontStyle', isItalic ? 'normal' : 'italic', 'font-style');
                  }}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={styles.textDecoration.includes('underline') ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() => {
                    const isUnderline = styles.textDecoration.includes('underline');
                    handleChange('textDecoration', isUnderline ? 'none' : 'underline', 'text-decoration');
                  }}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>

              {/* Font */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Font</Label>
                <div className="flex gap-2">
                  <Select
                    value={styles.fontFamily}
                    onValueChange={(v) => {
                      const font = FONT_OPTIONS.find(f => f.name === v);
                      if (font) handleChange('fontFamily', font.family, 'font-family');
                    }}
                  >
                    <SelectTrigger className="flex-1 h-9">
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
                  
                  <Select
                    value={String(styles.fontSize)}
                    onValueChange={(v) => handleChange('fontSize', `${v}px`, 'font-size')}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map(size => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-border hover:border-foreground transition-colors"
                    style={{ backgroundColor: preset.color }}
                    onClick={() => handleChange('color', preset.color)}
                    title={preset.name}
                  />
                ))}
                <button className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-foreground transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Align */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Align</Label>
                
                {/* Text Alignment */}
                <div className="flex gap-1">
                  <Button
                    variant={styles.textAlign === 'left' ? 'secondary' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleChange('textAlign', 'left', 'text-align')}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={styles.textAlign === 'center' ? 'secondary' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleChange('textAlign', 'center', 'text-align')}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={styles.textAlign === 'right' ? 'secondary' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleChange('textAlign', 'right', 'text-align')}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={styles.textAlign === 'justify' ? 'secondary' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleChange('textAlign', 'justify', 'text-align')}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                {/* Vertical Alignment */}
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignVerticalJustifyStart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignVerticalJustifyCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignVerticalJustifyEnd className="h-4 w-4" />
                  </Button>
                </div>

                {/* Horizontal Position */}
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignHorizontalJustifyStart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignHorizontalJustifyCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <AlignHorizontalJustifyEnd className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="p-4 space-y-4">
              <Label className="text-sm font-medium">Assets</Label>
              <div className="text-center text-muted-foreground py-8">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No assets uploaded</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
