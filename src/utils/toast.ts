import { toast } from "sonner";
import CustomToastContent from '@/components/CustomToastContent'; // Import komponen baru

export const showSuccess = (message: string, title: string = 'NICE!', buttonText?: string, onButtonClick?: () => void) => {
  toast.custom((t) => (
    <CustomToastContent
      id={t}
      type="success"
      title={title}
      description={message}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
    />
  ));
};

export const showError = (message: string, title: string = 'Whoops!', buttonText?: string, onButtonClick?: () => void) => {
  toast.custom((t) => (
    <CustomToastContent
      id={t}
      type="error"
      title={title}
      description={message}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
    />
  ));
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};