import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, LucideIcon } from 'lucide-react';
import { toast } from 'sonner'; // Import toast untuk menutup notifikasi

interface CustomToastContentProps {
  id: string | number; // ID notifikasi untuk menutupnya
  type: 'success' | 'error';
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void; // Aksi kustom opsional untuk tombol
}

const CustomToastContent: React.FC<CustomToastContentProps> = ({
  id,
  type,
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  const Icon: LucideIcon = type === 'success' ? CheckCircle : XCircle;
  const iconColorClass = type === 'success' ? 'text-accent' : 'text-destructive';
  const buttonVariant = type === 'success' ? 'default' : 'destructive';
  const defaultButtonText = type === 'success' ? 'Lanjutkan' : 'Coba Lagi';

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    toast.dismiss(id); // Selalu tutup notifikasi saat tombol diklik
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 flex flex-col items-center text-center w-full">
      <Icon className={`h-20 w-20 mb-6 ${iconColorClass}`} />
      <h3 className="text-3xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-lg text-muted-foreground mb-8">{description}</p>
      <Button
        variant={buttonVariant}
        onClick={handleButtonClick}
        className="w-full py-4 text-xl font-semibold"
      >
        {buttonText || defaultButtonText}
      </Button>
    </div>
  );
};

export default CustomToastContent;