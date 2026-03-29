import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Library, Loader2, Image as ImageIcon, Trash2, Check, Copy, Link as LinkIcon} from 'lucide-react';
import api from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MediaGallery({ onSelect }: { onSelect: (url: string) => void }) {
  const [images, setImages] = useState<{name: string, url: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/media');
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMedia();
  }, [isOpen]);

  const copyToClipboard = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't insert the image
    try {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        // Reset the "copied" icon after 2 seconds
        setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
        console.error("Failed to copy", err);
    }
    };

  const deleteMedia = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure? This will permanently delete the file from the server.")) return;

    try {
        await api.delete('/media', { data: { url } });
        // Refresh the list after deletion
        setImages(prev => prev.filter(img => img.url !== url));
    } catch (err) {
        alert("Could not delete image. It might still be in use.");
    }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Library className="h-4 w-4 mr-1" /> Media Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-600px">
        <DialogHeader>
          <DialogTitle>Your Uploaded Media</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-400px mt-4 pr-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No images found.</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img) => (
                <div 
                    key={img.url} 
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-gray-100 hover:border-blue-500"
                    onClick={() => {
                        onSelect(img.url);
                        setIsOpen(false);
                    }}
                    >
                    <img src={img.url} className="h-full w-full object-cover" />
                    
                    {/* Action Buttons Container (Top Right) */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        
                        {/* Copy Link Button */}
                        <button
                        onClick={(e) => copyToClipboard(img.url, e)}
                        className={`p-1.5 rounded-md transition-colors ${
                            copiedUrl === img.url 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                        }`}
                        title="Copy Image URL"
                        >
                        {copiedUrl === img.url ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                        onClick={(e) => deleteMedia(img.url, e)}
                        className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        title="Delete from server"
                        >
                        <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Selection Overlay */}
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-end p-2 transition-opacity pointer-events-none">
                        <span className="text-[10px] bg-white/90 px-1.5 py-0.5 rounded text-gray-700 font-bold truncate">
                        {img.name}
                        </span>
                    </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}