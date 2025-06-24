import React, { ReactNode, forwardRef, useState, useEffect } from 'react';
import { SizeVariant, ThemeColors, ValidationOptions, SelectOption } from './types';

/**
 * Input type options
 */
export type InputType = 
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

/**
 * Input props interface
 */
export interface InputProps {
  /** Input ID */
  id?: string;
  
  /** Input name */
  name?: string;
  
  /** Input label */
  label?: string;
  
  /** Input type */
  type?: InputType;
  
  /** Input placeholder */
  placeholder?: string;
  
  /** Input value */
  value?: any;
  
  /** Default input value */
  defaultValue?: any;
  
  /** Input is disabled */
  disabled?: boolean;
  
  /** Input is read only */
  readOnly?: boolean;
  
  /** Input validation rules */
  validation?: ValidationOptions;
  
  /** Callback for value changes */
  onChange?: (value: any, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /** Callback for focus event */
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /** Callback for blur event */
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /** Input size */
  size?: SizeVariant;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Left icon */
  leftIcon?: ReactNode;
  
  /** Right icon */
  rightIcon?: ReactNode;
  
  /** Hint text displayed below the input */
  hint?: string;
  
  /** Error message */
  error?: string;
  
  /** Theme colors [primary, secondary] */
  theme?: ThemeColors;
  
  /** Options for select, checkbox, and radio inputs */
  options?: SelectOption[];
  
  /** Allow multiple selections (for select, checkbox) */
  multiple?: boolean;
  
  /** Number of rows for textarea */
  rows?: number;
  
  /** Max file size in bytes (for file inputs) */
  maxFileSize?: number;
  
  /** Accepted file types (for file inputs) */
  accept?: string;
  
  /** Auto focus on input */
  autoFocus?: boolean;
  
  /** Auto complete value */
  autoComplete?: string;
  
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Dynamic Input Component
 * 
 * @example
 * // Basic text input
 * <Input label="Username" name="username" onChange={(value) => console.log(value)} />
 * 
 * @example
 * // Input with validation
 * <Input 
 *   label="Age" 
 *   type="number" 
 *   validation={{
 *     required: true,
 *     min: 18,
 *     errorMessages: {
 *       required: "Age is required",
 *       min: "You must be at least 18 years old"
 *     }
 *   }}
 * />
 * 
 * @example
 * // Select input with options
 * <Input 
 *   type="select" 
 *   label="Country" 
 *   options={[
 *     { label: "USA", value: "usa" },
 *     { label: "Canada", value: "canada" },
 *   ]}
 * />
 */
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
  (
    {
      id,
      name,
      label,
      type = 'text',
      placeholder,
      value,
      defaultValue,
      disabled = false,
      readOnly = false,
      validation,
      onChange,
      onFocus,
      onBlur,
      size = 'md',
      className = '',
      leftIcon,
      rightIcon,
      hint,
      error,
      theme = ['cb-red', 'white'],
      options = [],
      multiple = false,
      rows = 3,
      maxFileSize,
      accept,
      autoFocus = false,
      autoComplete,
      fullWidth = false,
    }: InputProps,
    ref
  ) => {
    // Generate a random ID if none provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine primary and secondary colors
    const [primary, secondary] = theme;
    
    // State for internal value management
    const [internalValue, setInternalValue] = useState<any>(value || defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>(error);
    const [touched, setTouched] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    // Update internal value when prop value changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);
    
    // Update internal error when prop error changes
    useEffect(() => {
      setInternalError(error);
    }, [error]);

    // Toggle password visibility
    const togglePasswordVisibility = (e:any) => {
      e.preventDefault();
      setPasswordVisible(!passwordVisible);
    };
    
    // Validate the input value
    const validateInput = (val: any): string | undefined => {
      if (!validation) return undefined;
      
      const { required, min, max, minLength, maxLength, pattern, custom, errorMessages = {} } = validation;
      
      // Required validation
      if (required && (!val || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0))) {
        return errorMessages.required || 'This field is required';
      }
      
      // Skip other validations if empty and not required
      if (!val && !required) return undefined;
      
      // Number validations
      if (typeof val === 'number' || type === 'number') {
        const numVal = typeof val === 'number' ? val : Number(val);
        
        // Min validation
        if (min !== undefined && numVal < min) {
          return errorMessages.min || `Value must be at least ${min}`;
        }
        
        // Max validation
        if (max !== undefined && numVal > max) {
          return errorMessages.max || `Value must be at most ${max}`;
        }
      }
      
      // String validations
      if (typeof val === 'string') {
        // MinLength validation
        if (minLength !== undefined && val.length < minLength) {
          return errorMessages.minLength || `Must be at least ${minLength} characters`;
        }
        
        // MaxLength validation
        if (maxLength !== undefined && val.length > maxLength) {
          return errorMessages.maxLength || `Must be at most ${maxLength} characters`;
        }
        
        // Pattern validation
        if (pattern && !pattern.test(val)) {
          return errorMessages.pattern || 'Invalid format';
        }
      }
      
      // Custom validation
      if (custom && typeof custom === 'function') {
        const customResult = custom(val);
        if (customResult === false) {
          return errorMessages.custom || 'Invalid value';
        }
        if (typeof customResult === 'string') {
          return customResult;
        }
      }
      
      return undefined;
    };
    
    // Handle value change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let newValue: any;
      
      // Handle different input types
      if (type === 'checkbox') {
        if (multiple && options.length > 0) {
          // For multi-select checkboxes with options
          const checkboxValue = e.target.value;
          const isChecked = (e.target as HTMLInputElement).checked;
          
          newValue = Array.isArray(internalValue) ? [...internalValue] : [];
          
          if (isChecked && !newValue.includes(checkboxValue)) {
            newValue.push(checkboxValue);
          } else if (!isChecked && newValue.includes(checkboxValue)) {
            newValue = newValue.filter((v: string) => v !== checkboxValue);
          }
        } else {
          // For single checkbox
          newValue = (e.target as HTMLInputElement).checked;
        }
      } else if (type === 'select' && multiple) {
        // For multi-select dropdown
        const selectElement = e.target as HTMLSelectElement;
        newValue = Array.from(selectElement.selectedOptions).map(option => option.value);
      } else if (type === 'number') {
        // For number inputs
        newValue = e.target.value === '' ? '' : Number(e.target.value);
      } else if (type === 'file') {
        // For file inputs
        const fileInput = e.target as HTMLInputElement;
        newValue = fileInput.files;
        
        // Validate file size if maxFileSize is provided
        if (maxFileSize && fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          if (file.size > maxFileSize) {
            setInternalError(`File size exceeds the maximum allowed size (${Math.round(maxFileSize / 1024 / 1024)}MB)`);
            return;
          }
        }
      } else {
        // For all other inputs
        newValue = e.target.value;
      }
      
      // Set internal value
      setInternalValue(newValue);
      
      // Validate and set error
      if (touched) {
        const validationError = validateInput(newValue);
        setInternalError(validationError);
      }
      
      // Call onChange callback
      if (onChange) {
        onChange(newValue, e);
      }
    };
    
    // Handle focus event
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };
    
    // Handle blur event
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setIsFocused(false);
      setTouched(true);
      
      // Validate on blur
      if (validation) {
        const validationError = validateInput(internalValue);
        setInternalError(validationError);
      }
      
      if (onBlur) {
        onBlur(e);
      }
    };
    
    // Size classes for the input
    const sizeClasses = {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-1',
      lg: 'text-lg px-5 py-2',
      xl: 'text-xl px-6 py-2',
    }[size];
    
    // Base classes for all inputs
    const baseInputClasses = `
      block rounded-md border bg-white
      transition-all duration-200
      placeholder:text-gray-400
      ${sizeClasses}
      ${fullWidth ? 'w-full' : ''}
      ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
      ${readOnly ? 'cursor-default bg-gray-50' : ''}
      ${internalError ? `border-red-500 focus:border-red-500 focus:ring-red-500/30` : `border-gray-300 focus:border-${primary} focus:ring-${primary}/30`}
      ${isFocused ? `ring-2 ring-${primary}/20 border-${primary}` : ''}
      focus:outline-none focus:ring-2
    `;
    
    // Wrapper classes
    const wrapperClasses = `
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;
    
    // Label classes
    const labelClasses = `
      block text-sm font-medium text-gray-700 mb-1
    `;
    
    // Render label with required indicator if needed
    const renderLabel = () => {
      if (!label) return null;
      
      return (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      );
    };
    
    // Render error message
    const renderError = () => {
      if (!internalError) return null;
      
      return (
        <p className="mt-1 text-xs text-cb-red">{internalError}</p>
      );
    };
    
    // Render hint message
    const renderHint = () => {
      if (!hint || internalError) return null;
      
      return (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      );
    };
    
    // Input with icons wrapper
    const renderInputWithIcons = (inputElement: ReactNode) => {
      if (!leftIcon && !rightIcon) return inputElement;

      // Check if inputElement is a valid React element
        if (!React.isValidElement(inputElement)) {
            return inputElement;
        }

        // Define the extended props with correct typing
        type InputElementProps = React.ComponentPropsWithRef<'input' | 'select' | 'textarea'>;
        
        // Use type assertion to tell TypeScript this element accepts className
        const clonedElement = React.cloneElement(
            inputElement as React.ReactElement<InputElementProps>, 
            {
            className: `${(inputElement.props as InputElementProps).className || ''} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`
            }
        );
      
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          
          {clonedElement}

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      );
    };
    
    // Render different input types
    const renderInput = () => {
      const commonProps = {
        id: inputId,
        name,
        disabled,
        readOnly,
        autoFocus,
        autoComplete,
        onFocus: handleFocus,
        onBlur: handleBlur,
        'aria-invalid': !!internalError,
      };
      
      switch (type) {
        case 'textarea':
          return (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={`${baseInputClasses} rounded-md resize-y`}
              placeholder={placeholder}
              value={internalValue}
              onChange={handleChange}
              rows={rows}
              {...commonProps}
            />
          );
          
        case 'select':
          return (
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              className={baseInputClasses}
              value={internalValue}
              onChange={handleChange}
              multiple={multiple}
              {...commonProps}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          );
          
        case 'checkbox':
          if (options.length > 0 && multiple) {
            // Render multiple checkboxes for options
            return (
              <div className="space-y-2">
                {options.map((option) => {
                  const isChecked = Array.isArray(internalValue) && internalValue.includes(option.value.toString());
                  
                  return (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${inputId}-${option.value}`}
                        name={name}
                        value={option.value}
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled || option.disabled}
                        className={`h-4 w-4 rounded-full border-gray-300 text-${primary} focus:ring-${primary}/50`}
                      />
                      <label htmlFor={`${inputId}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            // Render single checkbox
            return (
              <div className="flex items-center">
                <input
                  ref={ref as React.Ref<HTMLInputElement>}
                  type="checkbox"
                  className={`h-4 w-4 rounded-full border-gray-300 text-${primary} focus:ring-${primary}/50`}
                  checked={!!internalValue}
                  onChange={handleChange}
                  {...commonProps}
                />
                {label && (
                  <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700">
                    {label}
                    {validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
              </div>
            );
          }
          
        case 'radio':
          return (
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${inputId}-${option.value}`}
                    name={name}
                    value={option.value}
                    checked={internalValue === option.value.toString()}
                    onChange={handleChange}
                    disabled={disabled || option.disabled}
                    className={`h-4 w-4 border-gray-300 text-${primary} focus:ring-${primary}/50`}
                  />
                  <label htmlFor={`${inputId}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
          
          case 'password':
            return (
              <div className="relative">
                <input
                  ref={ref as React.Ref<HTMLInputElement>}
                  type={passwordVisible ? 'text' : 'password'}
                  className={`${baseInputClasses} pr-10`}
                  placeholder={placeholder}
                  value={internalValue}
                  onChange={handleChange}
                  min={validation?.min}
                  max={validation?.max}
                  minLength={validation?.minLength}
                  maxLength={validation?.maxLength}
                  {...commonProps}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-600 focus:outline-none`}
                  onClick={togglePasswordVisibility}
                  disabled={disabled}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? (
                    // Eye-off SVG icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    // Eye SVG icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            );
          
        case 'file':
          return (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type="file"
              className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-${primary}/10 file:text-${primary} hover:file:bg-${primary}/20`}
              onChange={handleChange}
              accept={accept}
              multiple={multiple}
              {...commonProps}
            />
          );
          
        default:
          return (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              className={baseInputClasses}
              placeholder={placeholder}
              value={internalValue}
              onChange={handleChange}
              min={validation?.min}
              max={validation?.max}
              minLength={validation?.minLength}
              maxLength={validation?.maxLength}
              {...commonProps}
            />
          );
      }
    };
    
    // Skip label rendering for checkbox type
    const shouldRenderLabel = type !== 'checkbox' || (type === 'checkbox' && (options.length > 0 || !label));
    
    return (
      <div className={wrapperClasses}>
        {shouldRenderLabel && renderLabel()}
        {renderInputWithIcons(renderInput())}
        {renderError()}
        {renderHint()}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;