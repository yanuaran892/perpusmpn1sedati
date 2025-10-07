import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  showPasswordToggle?: boolean;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, type, icon: Icon, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev);
    };

    // Tentukan padding kanan berdasarkan keberadaan tombol toggle password
    // Jika ada toggle, beri pr-10. Jika tidak, beri pr-3 sebagai default padding kanan yang wajar.
    const rightPaddingClass = isPasswordType && showPasswordToggle ? 'pr-10' : 'pr-3'; 

    return (
      <div className="relative flex items-center">
        <Icon className="absolute left-3 h-4 w-4 text-gray-400" />
        <Input
          type={isPasswordType && showPasswordToggle && showPassword ? 'text' : type}
          // Pastikan pl-10 selalu diterapkan untuk ikon.
          // Gabungkan className dari props *setelah* padding dasar agar tidak menimpa.
          className={cn("pl-10", rightPaddingClass, className)}
          ref={ref}
          {...props}
        />
        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };