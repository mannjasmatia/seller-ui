import { useEffect, useRef, useState } from "react";
import { VerifyOtpModalProps } from "../../types/verifyOtpModal";
import { useSelector } from 'react-redux';

const MAX_RESEND_OTP_COUNT = 3; // Maximum number of OTP resend attempts

const useVerifyOtpModal = ({
    open,
    otpLength = 6,
    onClose,
    handleVerifyOtpClick,
    expiryTime =0,
    handleResendOtp
  }: VerifyOtpModalProps) => {
      const language = useSelector((state: any) => state.language?.value)['auth']['verifyOtp'];

      // State for OTP digits
  const [otpValues, setOtpValues] = useState<string[]>(Array(otpLength).fill(''));
  const [activeInput, setActiveInput] = useState<number>(0);
  const resendOtpCount = useRef<number>(0);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(expiryTime);

  // Create refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Initialize input refs
  useEffect(() => {
    inputRefs.current = Array(otpLength).fill(null).map((_, i) => inputRefs.current[i] || null);
  }, [otpLength]);
  
  // Focus on the first input when modal opens
  useEffect(() => {
    if (open && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);
  
  // Handle countdown timer
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [open, timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reset modal state
  const resetModal = () => {
    setOtpValues(Array(otpLength).fill(''));
    setActiveInput(0);
    setError('');
    if (expiryTime && expiryTime > 0) setTimeLeft(expiryTime);
  };
  
  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const newOtpValues = [...otpValues];
    
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    // If pasting multiple digits
    if (value.length > 1) {
      // Distribute the pasted value across inputs
      const pastedValues = value.split('').slice(0, otpLength - index);
      
      pastedValues.forEach((digit, i) => {
        if (index + i < otpLength) {
          newOtpValues[index + i] = digit;
        }
      });
      
      setOtpValues(newOtpValues);
      
      // Focus on the next empty input or the last one
      const nextEmptyIndex = newOtpValues.findIndex(val => val === '');
      const newActiveInput = nextEmptyIndex !== -1 ? nextEmptyIndex : otpLength - 1;
      setActiveInput(newActiveInput);
      inputRefs.current[newActiveInput]?.focus();
      
      return;
    }
    
    // Handle single digit input
    newOtpValues[index] = value.substring(0, 1);
    setOtpValues(newOtpValues);
    
    // Clear error when user types
    if (error) setError('');
    
    // Move to next input if value is entered
    if (value && index < otpLength - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus to previous input on backspace
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    
    // Move focus on arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < otpLength - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle input focus
  const handleFocus = (index: number) => {
    setActiveInput(index);
  };
  
  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.match(/\d/g);
    
    if (!digits) return;
    
    const newOtpValues = [...otpValues];
    digits.forEach((digit, i) => {
      if (index + i < otpLength) {
        newOtpValues[index + i] = digit;
      }
    });
    
    setOtpValues(newOtpValues);
    
    const nextEmptyIndex = newOtpValues.findIndex(val => val === '');
    const newActiveInput = nextEmptyIndex !== -1 ? nextEmptyIndex : otpLength - 1;
    setActiveInput(newActiveInput);
    inputRefs.current[newActiveInput]?.focus();
  };
  
  // Handle verify button click
  const handleVerify = () => {
    const otp = otpValues.join('');
    
    if (otp.length !== otpLength) {
      setError(`Please enter all ${otpLength} digits`);
      return;
    }
    handleVerifyOtpClick(otp);
  };
  
  // Handle resend click
  const handleResend = () => {
    resendOtpCount.current += 1;

    if(resendOtpCount.current > MAX_RESEND_OTP_COUNT){
      setError(language['maxOtpExceeded']);
      return
    }
    
    resetModal();
    if (handleResendOtp) {
      handleResendOtp();
    }
  };

  return{
    otpValues,
    activeInput,
    error,
    timeLeft,
    formatTime,
    handleClose,
    handleChange,
    handleKeyDown,
    handleFocus,
    handlePaste,
    handleVerify,
    handleResend,
    inputRefs,
    resendOtpCount,
    MAX_RESEND_OTP_COUNT,
  }

}

export default useVerifyOtpModal;
