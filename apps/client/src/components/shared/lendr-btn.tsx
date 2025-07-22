import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface LendrButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'icon' | 'lg' | 'sm';
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
  link?: string;
}

const LendrButton = forwardRef<HTMLButtonElement, LendrButtonProps>(
  ({ size = 'default', className = '', icon, variant = 'default', children, link, ...props }, ref) => {
    let style = '';

    switch (variant) {
      case 'default':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600
                    text-slate-950 border-0 shadow-2xl shadow-lendr-400/50 hover:shadow-lendr-400/70
                `;
        break;
      case 'destructive':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/50 hover:shadow-red-500/70
                `;
        break;
      case 'ghost':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    bg-transparent text-slate-950 border border-slate-200 shadow-none hover:bg-slate-100
                `;
        break;
      case 'link':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    text-blue-500 hover:text-blue-600 underline
                `;
        break;
      case 'outline':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    bg-transparent border border-lendr-400 text-lendr-400 hover:bg-lendr-400 hover:text-black
                `;
        break;
      case 'secondary':
        style = `
                    font-bold transition-all duration-300 rounded-xl
                    bg-gray-200 text-gray-800 hover:bg-gray-300
                `;
        break;
      default:
        style = '';
    }

    const buttonContent = (
      <motion.span className='flex items-center'>
        {children}
        {icon !== null && icon !== undefined && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className='ml-2'>
            {icon}
          </motion.div>
        )}
      </motion.span>
    );

    return (
      <motion.div
        whileHover={{ scale: 1.05, rotateX: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{ transformStyle: 'preserve-3d' }}>
        {link ? (
          <Button
            ref={ref}
            className={`${style} ${className}`}
            size={size}
            variant={variant}
            {...props}
            asChild>
            <Link href={link}>{buttonContent}</Link>
          </Button>
        ) : (
          <Button
            ref={ref}
            className={`${style} ${className}`}
            size={size}
            variant={variant}
            {...props}>
            {buttonContent}
          </Button>
        )}
      </motion.div>
    );
  },
);

LendrButton.displayName = 'LendrButton';

export default LendrButton;
