// import { useRef } from 'react';
// import { 
//   ZoomIn, ZoomOut, Hand, MousePointer2, 
//   Undo2, Redo2, Download, FileCode, Image as ImageIcon,
//   Layout, Upload
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { EditorTool } from '@/types/editor';

// interface EditorToolbarProps {
//   zoom: number;
//   activeTool: EditorTool;
//   onZoomIn: () => void;
//   onZoomOut: () => void;
//   onZoomFit: () => void;
//   onToolChange: (tool: EditorTool) => void;
//   onUploadHtml: (content: string) => void;
//   onExportPng: () => void;
//   onExportHtml: () => void;
// }

// export function EditorToolbar({ 
//   zoom, 
//   activeTool, 
//   onZoomIn, 
//   onZoomOut, 
//   onToolChange,
//   onUploadHtml,
//   onExportPng,
//   onExportHtml,
// }: EditorToolbarProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const ToolButton = ({ tool, icon: Icon, label, shortcut }: { tool: EditorTool; icon: React.ElementType; label: string; shortcut: string }) => (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <Button 
//           variant={activeTool === tool ? 'default' : 'ghost'} 
//           size="icon" 
//           className="h-8 w-8"
//           onClick={() => onToolChange(tool)}
//         >
//           <Icon className="h-4 w-4" />
//         </Button>
//       </TooltipTrigger>
//       <TooltipContent>{label} ({shortcut})</TooltipContent>
//     </Tooltip>
//   );

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type === 'text/html') {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const content = event.target?.result as string;
//         onUploadHtml(content);
//       };
//       reader.readAsText(file);
//     }
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="flex items-center justify-between h-full px-4 w-full">
//       {/* Left: Branding & Modes */}
//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2 font-bold text-lg mr-2 text-foreground">
//           <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
//             <Layout className="h-5 w-5" />
//           </div>
//           <span className="hidden md:inline-block">PixelPerfect</span>
//         </div>
        
//         <Separator orientation="vertical" className="h-6 mx-1" />
        
//         <div className="flex items-center gap-1">
//           <ToolButton tool="select" icon={MousePointer2} label="Select" shortcut="V" />
//           <ToolButton tool="pan" icon={Hand} label="Pan" shortcut="H" />
//         </div>
//       </div>

//       {/* Right: Actions & Zoom */}
//       <div className="flex items-center gap-3">
//         <div className="flex items-center gap-1 mr-2">
//            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
//              <Undo2 className="h-4 w-4" />
//            </Button>
//            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
//              <Redo2 className="h-4 w-4" />
//            </Button>
//         </div>

//         <Separator orientation="vertical" className="h-6" />

//         <div className="flex items-center gap-1 bg-secondary/50 rounded-md px-1 border border-border/50">
//           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomOut}>
//             <ZoomOut className="h-3.5 w-3.5" />
//           </Button>
//           <span className="text-xs font-medium w-10 text-center text-foreground tabular-nums">
//             {Math.round(zoom * 100)}%
//           </span>
//           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomIn}>
//             <ZoomIn className="h-3.5 w-3.5" />
//           </Button>
//         </div>

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="default" size="sm" className="h-8 gap-2 ml-2 shadow-sm">
//               <Download className="h-3.5 w-3.5" />
//               <span className="hidden lg:inline">Export</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem onClick={onExportPng} className="gap-2">
//               <ImageIcon className="h-4 w-4" />
//               Export as PNG
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={onExportHtml} className="gap-2">
//               <FileCode className="h-4 w-4" />
//               Export as HTML
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>

//         <Tooltip>
//           <TooltipTrigger asChild>
//             <Button 
//               variant="outline" 
//               size="icon" 
//               className="h-8 w-8"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <Upload className="h-4 w-4" />
//             </Button>
//           </TooltipTrigger>
//           <TooltipContent>Upload HTML</TooltipContent>
//         </Tooltip>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept=".html,.htm"
//           className="hidden"
//           onChange={handleFileUpload}
//         />
//       </div>
//     </div>
//   );
// }


import { useRef } from 'react';
import { 
  ZoomIn, ZoomOut, Hand, MousePointer2, 
  Undo2, Redo2, Download, FileCode, Image as ImageIcon,
  Layout, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditorTool } from '@/types/editor';

interface EditorToolbarProps {
  zoom: number;
  activeTool: EditorTool;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToolChange: (tool: EditorTool) => void;
  onUploadHtml: (content: string) => void;
  onExportPng: () => void;
  onExportHtml: () => void;
  // Undo/Redo Props
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function EditorToolbar({ 
  zoom, 
  activeTool, 
  onZoomIn, 
  onZoomOut, 
  onZoomFit, 
  onToolChange,
  onUploadHtml,
  onExportPng,
  onExportHtml,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ToolButton = ({ tool, icon: Icon, label, shortcut }: { tool: EditorTool; icon: React.ElementType; label: string; shortcut: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={activeTool === tool ? 'default' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onToolChange(tool)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label} ({shortcut})</TooltipContent>
    </Tooltip>
  );

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

  return (
    <div className="flex items-center justify-between h-full px-4 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-lg mr-2 text-foreground">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
            <Layout className="h-5 w-5" />
          </div>
          <span className="hidden md:inline-block">PixelPerfect</span>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <div className="flex items-center gap-1">
          <ToolButton tool="select" icon={MousePointer2} label="Select" shortcut="V" />
          <ToolButton tool="pan" icon={Hand} label="Pan" shortcut="H" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2">
           <Tooltip>
             <TooltipTrigger asChild>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-8 w-8 text-muted-foreground" 
                 disabled={!canUndo}
                 onClick={onUndo}
               >
                 <Undo2 className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent>Undo</TooltipContent>
           </Tooltip>

           <Tooltip>
             <TooltipTrigger asChild>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-8 w-8 text-muted-foreground" 
                 disabled={!canRedo}
                 onClick={onRedo}
               >
                 <Redo2 className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent>Redo</TooltipContent>
           </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 bg-secondary/50 rounded-md px-1 border border-border/50">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium w-10 text-center text-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="h-8 gap-2 ml-2 shadow-sm">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPng} className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportHtml} className="gap-2">
              <FileCode className="h-4 w-4" />
              Export as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload HTML</TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}