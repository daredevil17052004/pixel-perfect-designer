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

export type EditorTool = 'select' | 'pan' | 'text' | 'rectangle' | 'circle' | 'line';

export interface EditorState {
  zoom: number;
  selectedElement: SelectedElement | null;
  isEditing: boolean;
  isDragging: boolean;
  htmlContent: string;
  canvasWidth: number;
  canvasHeight: number;
  activeTool: EditorTool;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
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
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'Lato', family: "'Lato', sans-serif" },
  { name: 'Poppins', family: "'Poppins', sans-serif" },
  { name: 'Raleway', family: "'Raleway', sans-serif" },
  { name: 'Merriweather', family: "'Merriweather', serif" },
  { name: 'Source Sans Pro', family: "'Source Sans Pro', sans-serif" },
  { name: 'Ubuntu', family: "'Ubuntu', sans-serif" },
  { name: 'Nunito', family: "'Nunito', sans-serif" },
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
  { name: 'Lobster', family: "'Lobster', cursive" },
  { name: 'Caveat', family: "'Caveat', cursive" },
  { name: 'Comfortaa', family: "'Comfortaa', cursive" },
  { name: 'Righteous', family: "'Righteous', cursive" },
  { name: 'Josefin Sans', family: "'Josefin Sans', sans-serif" },
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

export interface ShapeConfig {
  type: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
}
