import React from 'react';
import GSAPButton from '@/components/GSAPButton';
import { CheckCircle, XCircle, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CustomToastContentProps {
  id: string | number;
  type: 'success' | 'error';
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
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
    toast.dismiss(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center w-full max-w-md border border-gray-200">
      <div className={`p-4 rounded-full bg-${type === 'success' ? 'green' : 'red'}-50 mb-4`}>
        <Icon className={`h-12 w-12 ${iconColorClass}`} />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <GSAPButton
        variant={buttonVariant}
        onClick={handleButtonClick}
        className="w-full py-3 text-base font-semibold rounded-xl"
      >
        {buttonText || defaultButtonText}
      </GSAPButton>
    </div>
  );
};

export default CustomToastContent;