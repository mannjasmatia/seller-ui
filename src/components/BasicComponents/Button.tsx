import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { SizeVariant, ThemeColors, AnimationType } from './types.ts';

/**
 * Button variants
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

/**
 * Button types
 */
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Button props interface
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, 'type' | 'onClick'> {
  /** Content to display inside the button */
  children: ReactNode;
  
  /** Button variant style */
  variant?: ButtonVariant;
  
  /** Size of the button */
  size?: SizeVariant;
  
  /** Is the button in a loading state */
  isLoading?: boolean;
  
  /** Is the button disabled */
  disabled?: boolean;
  
  /** Function called when button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Left icon */
  leftIcon?: ReactNode;
  
  /** Right icon */
  rightIcon?: ReactNode;
  
  /** Display as full width button */
  fullWidth?: boolean;
  
  /** Animation type */
  animation?: AnimationType;
  
  /** Theme colors [primary, secondary] */
  theme?: ThemeColors;
  
  /** Button or Link */
  as?: 'button' | 'link';
  
  /** Link URL (when as="link") */
  href?: string;
  
  /** Link target (when as="link") */
  target?: string;
  
  /** HTML button type (when as="button") */
  type?: ButtonType;

  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Dynamic Button Component
 * 
 * @example
 * // Basic usage
 * <Button onClick={() => console.log('Clicked!')}>Click Me</Button>
 * 
 * @example
 * // As a link
 * <Button as="link" href="https://example.com" target="_blank">Visit Site</Button>
 * 
 * @example
 * // With custom theme
 * <Button theme={['blue-500', 'white']}>Blue Button</Button>
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      isLoading = false,
      disabled = false,
      onClick,
      className = '',
      leftIcon,
      rightIcon,
      fullWidth = false,
      animation = 'none',
      theme = ['cb-red', 'white'],
      as = 'button',
      href = '',
      target = '',
      type = 'button',
      ariaLabel,
      ...props
    }: ButtonProps,
    ref
  ) => {
    // Determine primary and secondary colors
    const [primary, secondary] = theme;
    
    // Base classes that are common to all variants
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      relative overflow-hidden
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      ${fullWidth ? 'w-full' : ''}
    `;
    
    // Size classes
    const sizeClasses = {
      xs: 'text-xs px-2 py-1 rounded-full',
      sm: 'text-sm px-3 py-1 rounded-full',
      md: 'text-base px-4 py-1 rounded-full',
      lg: 'text-lg px-5 py-2 rounded-full',
      xl: 'text-xl px-6 py-2 rounded-full',
    }[size];
    
    // Variant classes
    const variantClasses = {
      solid: `bg-${primary} text-${secondary} hover:bg-${primary}/90 focus:ring-${primary}/50`,
      outline: `border border-${primary} text-${primary} hover:bg-${primary}/10 focus:ring-${primary}/30`,
      ghost: `text-${primary} hover:bg-${primary}/10 focus:ring-${primary}/30`,
      link: `text-${primary} hover:underline focus:ring-${primary}/30 py-0 px-1`,
    }[variant];
    
    // Animation classes
    const animationClasses = {
      none: '',
      fade: 'transition-opacity hover:opacity-90',
      scale: 'transition-transform hover:scale-105',
      slide: 'transition-transform hover:-translate-y-1',
      bounce: 'hover:animate-bounce',
    }[animation];
    
    // Combine all classes
    const buttonClasses = `
    ${baseClasses}
    ${sizeClasses}
    ${variantClasses}
    ${animationClasses}
    ${className}
    `;
    
    // Loading spinner
    const loadingSpinner = (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
    
    // Render as link
    if (as === 'link') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          className={buttonClasses}
          aria-label={ariaLabel}
          {...props}
          onClick={onClick as any}
        >
          {isLoading && loadingSpinner}
          {leftIcon && <span className="md:mr-1">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="md:ml-1">{rightIcon}</span>}
        </a>
      );
    }
    
    // Render as button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading && loadingSpinner}
        {leftIcon && <span className="md:mr-1">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="md:ml-1">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;