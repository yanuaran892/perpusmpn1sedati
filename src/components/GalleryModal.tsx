import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle: string;
  imageDescription: string;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle,
  imageDescription,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">{imageTitle}</DialogTitle>
          <DialogDescription className="text-gray-700 text-base">{imageDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt={imageTitle}
              className="max-w-full h-auto object-contain rounded-lg"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">Klik di luar gambar atau tekan Esc untuk menutup.</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;