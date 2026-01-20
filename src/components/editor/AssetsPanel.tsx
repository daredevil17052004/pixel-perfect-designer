import { useState } from 'react';
import { Search, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// NOTE: In a production app, this should be in an environment variable
// For this demo, users would need to add their own key or we use a demo/placeholder
const UNSPLASH_ACCESS_KEY = 'GxaahkGB-aPYmdgIJw48eHpEDpD4Gzm16e8oP2uh5BQ'; 

interface AssetsPanelProps {
  onAddImage: (url: string) => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

export function AssetsPanel({ onAddImage }: AssetsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedImages(prev => [result, ...prev]);
          onAddImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const searchUnsplash = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Demo fallback if no key is provided (using Picsum for demo purposes if fetch fails)
      if (UNSPLASH_ACCESS_KEY === 'GxaahkGB-aPYmdgIJw48eHpEDpD4Gzm16e8oP2uh5BQ') {
         // Simulating API delay
         await new Promise(resolve => setTimeout(resolve, 800));
         // Mock data for demo
         const mockImages = Array.from({ length: 12 }).map((_, i) => ({
           id: `mock-${i}`,
           urls: {
             small: `https://picsum.photos/300/200?random=${i + Math.random()}`,
             regular: `https://picsum.photos/800/600?random=${i + Math.random()}`
           },
           alt_description: 'Demo Image',
           user: { name: 'Demo User' }
         }));
         setUnsplashImages(mockImages);
      } else {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?page=1&query=${searchQuery}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=20`
        );
        const data = await response.json();
        setUnsplashImages(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUnsplash();
    }
  };

  return (
    <div className="w-full bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Assets</h3>
      </div>

      <Tabs defaultValue="uploads" className="w-full flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
           <TabsList className="w-full grid grid-cols-2">
             <TabsTrigger value="uploads">Uploads</TabsTrigger>
             <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="uploads" className="flex-1 mt-0 h-full overflow-hidden flex flex-col">
           <div className="p-4 border-b">
             <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => document.getElementById('asset-upload')?.click()}>
               <Upload className="h-4 w-4" />
               Upload Image
             </Button>
             <input 
               id="asset-upload" 
               type="file" 
               accept="image/*" 
               className="hidden" 
               onChange={handleFileUpload}
             />
           </div>
           
           <ScrollArea className="flex-1">
             <div className="p-4 grid grid-cols-2 gap-2">
               {uploadedImages.map((src, idx) => (
                 <div 
                   key={idx} 
                   className="relative group aspect-square rounded-md overflow-hidden border border-border cursor-pointer bg-secondary/50"
                   onClick={() => onAddImage(src)}
                 >
                   <img src={src} alt="Upload" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-xs font-medium">Add</span>
                   </div>
                 </div>
               ))}
               {uploadedImages.length === 0 && (
                 <div className="col-span-2 py-8 text-center text-muted-foreground text-xs">
                   No uploads yet
                 </div>
               )}
             </div>
           </ScrollArea>
        </TabsContent>

        <TabsContent value="unsplash" className="flex-1 mt-0 h-full overflow-hidden flex flex-col">
           <div className="p-4 border-b space-y-2">
             <div className="flex gap-2">
               <Input 
                 placeholder="Search photos..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleKeyDown}
                 className="h-8"
               />
               <Button size="sm" className="h-8 w-8 p-0" onClick={searchUnsplash} disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
               </Button>
             </div>
             {UNSPLASH_ACCESS_KEY === 'GxaahkGB-aPYmdgIJw48eHpEDpD4Gzm16e8oP2uh5BQ' && (
                <div className="text-[10px] text-muted-foreground text-center bg-secondary/50 p-1 rounded">
                  Using demo mode. Add API Key to enable real search.
                </div>
             )}
           </div>

           <ScrollArea className="flex-1">
             <div className="p-4 grid grid-cols-2 gap-2">
               {unsplashImages.map((img) => (
                 <div 
                   key={img.id} 
                   className="relative group aspect-[4/3] rounded-md overflow-hidden border border-border cursor-pointer bg-secondary/50"
                   onClick={() => onAddImage(img.urls.regular)}
                 >
                   <img src={img.urls.small} alt={img.alt_description} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-xs font-medium">Add</span>
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white p-1 truncate opacity-0 group-hover:opacity-100">
                     by {img.user.name}
                   </div>
                 </div>
               ))}
               
               {unsplashImages.length === 0 && !loading && (
                 <div className="col-span-2 py-12 text-center text-muted-foreground text-xs flex flex-col items-center">
                   <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                   Search for high-quality photos
                 </div>
               )}
             </div>
           </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}