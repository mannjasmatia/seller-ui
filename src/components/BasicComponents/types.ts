/**
 * Common types used across multiple components
 */

// Theme configuration type
export type ThemeColors = [string, string]; // Primary, Secondary

// Validation options
export interface ValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    custom?: string;
  };
}

// Size variants
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Common animation types
export type AnimationType = 'none' | 'fade' | 'scale' | 'slide' | 'bounce';

// Option type for select inputs
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// File type for media modal
export type FileType = 'image' | 'pdf' | 'video';

// Media file interface
export interface MediaFile {
  src: string;
  type: FileType;
  alt?: string;
  title?: string;
}