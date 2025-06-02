export interface VerifyOtpModalProps {
  /** Controls whether the modal is shown or hidden */
  open: boolean;
  /** Modal title text */
  title: string;
  /** Modal description text */
  description: string;
  /** Number of OTP input fields (typically 4-6) */
  otpLength: number;
  /** Function to call when modal is closed */
  onClose: () => void;
  /** Function to handle OTP verification with the entered code */
  handleVerifyOtpClick: (otp:string) => void;
  /** Optional timer in seconds (0 for no timer) */
  expiryTime?: number;
  /** Optional function to handle resend OTP */
  handleResendOtp?: () => void;

  isLoading?: boolean;
  isError?: boolean;
  apiError?: any;
}