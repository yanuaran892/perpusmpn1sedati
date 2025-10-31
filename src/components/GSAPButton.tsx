import React, { useRef, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import gsap from 'gsap';

interface GSAPButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const GSAPButton: React.FC<GSAPButtonProps> = ({ children, ...props }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (buttonElement) {
      // Optimize for animation performance
      gsap.set(buttonElement, { willChange: 'transform' });

      const handleMouseEnter = () => {
        gsap.to(buttonElement, {
          scale: 1.05, // Scale up slightly on hover
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(buttonElement, {
          scale: 1, // Scale back to original size
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      buttonElement.addEventListener('mouseenter', handleMouseEnter);
      buttonElement.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup event listeners on component unmount
      return () => {
        buttonElement.removeEventListener('mouseenter', handleMouseEnter);
        buttonElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <Button ref={buttonRef} {...props}>
      {children}
    </Button>
  );
};

export default GSAPButton;