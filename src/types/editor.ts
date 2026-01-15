export interface DesignTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
}

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectedElement {
  element: HTMLElement;
  bounds: ElementBounds;
  computedStyles: CSSStyleDeclaration;
  tagName: string;
  isTextElement: boolean;
  isImageElement: boolean;
}

export interface EditorState {
  zoom: number;
  selectedElement: SelectedElement | null;
  isEditing: boolean;
  htmlContent: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface StyleProperty {
  label: string;
  property: string;
  type: 'color' | 'text' | 'number' | 'select' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FontOption {
  name: string;
  family: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Roboto', family: "'Roboto', sans-serif" },
  { name: 'Open Sans', family: "'Open Sans', sans-serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Anton', family: "'Anton', sans-serif" },
  { name: 'Oswald', family: "'Oswald', sans-serif" },
  { name: 'Shrikhand', family: "'Shrikhand', serif" },
  { name: 'Alfa Slab One', family: "'Alfa Slab One', serif" },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif" },
  { name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
];

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'retro-poster',
    name: 'Retro Poster',
    path: '/templates/retro-poster-design.html',
  },
  {
    id: 'cup-namade',
    name: 'Sports Poster',
    path: '/templates/ae-saal-cup-namade-poster.html',
  },
  {
    id: 'illuminate',
    name: 'Movie Poster',
    path: '/templates/illuminate-your-world-poster.html',
  },
];
