export interface BuyerSignupModalProps {
  open: boolean;
  onClose: () => void;
  handleLoginClick: () => void;
  handleSuccesfullSignup: () => void;
}

// Define field configuration type
export interface FormField {
  name: string;
  type: InputType;
  placeholder: string;
  validation?: ValidationOptions;
  options?: SelectOption[];
  gridCols: 'full' | 'half';
  component?: React.ReactNode;
}