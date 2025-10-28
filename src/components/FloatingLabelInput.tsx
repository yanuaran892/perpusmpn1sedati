import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, type, label, icon: Icon, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev);
    };

    // Calculate padding-left for icon
    const plClass = Icon ? "pl-10" : "pl-0";
    // Calculate padding-right for password toggle
    const prClass = isPasswordType && showPasswordToggle ? "pr-10" : "pr-0";

    return (
      <div className={cn("relative pt-8 w-full", className)}> {/* Increased padding-top for label to float above */}
        {Icon && (
          <Icon className="absolute left-3 top-[23px] h-5 w-5 text-gray-500 peer-focus:text-accent peer-not-placeholder-shown:text-accent transition-colors duration-300" />
        )}
        <input
          id={props.id || label.toLowerCase().replace(/\s/g, '-')}
          type={isPasswordType && showPasswordToggle && showPassword ? 'text' : type}
          ref={ref}
          className={cn(
            "peer w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-accent block py-2 px-0 text-lg text-foreground focus:outline-none transition-all duration-300", // py-2 for 7px padding, text-foreground for dark text
            plClass,
            prClass,
            "focus:pb-1.5 focus:font-bold focus:border-b-3" // Simulate border-width 3px and font-bold on focus
          )}
          {...props}
          placeholder=" " // Crucial for peer-not-placeholder-shown
        />
        <label
          htmlFor={props.id || label.toLowerCase().replace(/\s/g, '-')}
          className={cn(
            "absolute left-0 text-lg text-gray-500 pointer-events-none transition-all duration-300",
            Icon && "left-10",
            "top-[14px]" // Position the label container to align with input text
          )}
        >
          {label.split('').map((char, index) => (
            <span
              key={index}
              style={{ transitionDelay: `${index * 50}ms` }}
              className="inline-block min-w-[5px] transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)
                         peer-focus:transform peer-focus:-translate-y-8 peer-focus:text-base peer-focus:text-accent
                         peer-not-placeholder-shown:transform peer-not-placeholder-shown:-translate-y-8 peer-not-placeholder-shown:text-base peer-not-placeholder-shown:text-accent"
            >
              {char}
            </span>
          ))}
        </label>
        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-[23px] text-gray-500 hover:text-accent transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };