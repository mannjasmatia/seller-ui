// src/pages/signup/useSignup.ts

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useSendEmailVerificationApi, 
  useSendPhoneVerificationApi 
} from '../../api/api-hooks/useAuthApi';
import { SignupPageProps, SignupStep1Data, SignupStep2Data } from './types.signup';
import { customToast } from '../../toast-config/customToast';

type SignupStep = 'step1' | 'step2';

const useSignup = ({
  handleLoginClick,
  handleSuccessfulSignup
}: SignupPageProps = {}) => {
  const navigate = useNavigate();
  const { lang } = useParams();

  // Form states
  const [currentStep, setCurrentStep] = useState<SignupStep>('step1');
  const [step1Data, setStep1Data] = useState<SignupStep1Data>({
    companyName: '',
    email: ''
  });
  const [step2Data, setStep2Data] = useState<SignupStep2Data>({
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  // Session token from email verification
  const [sessionToken, setSessionToken] = useState<string>('');
  
  // Modal states
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [wasEmailModalForcedClose, setWasEmailModalForcedClose] = useState(false);
  const [wasPhoneModalForcedClose, setWasPhoneModalForcedClose] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const {
    mutate: sendEmailVerification,
    isPending: isStep1Pending,
    isError: isStep1Error,
    error: step1Error,
    isSuccess: isStep1Success,
    data: step1ApiData
  } = useSendEmailVerificationApi();

  const {
    mutate: sendPhoneVerification,
    isPending: isStep2Pending,
    isError: isStep2Error,
    error: step2Error,
    isSuccess: isStep2Success,
    data: step2ApiData
  } = useSendPhoneVerificationApi();

  // Handle successful email verification request
  useEffect(() => {
    if (!wasEmailModalForcedClose && isStep1Success && step1ApiData?.data?.response) {
      const { sessionToken, email } = step1ApiData.data.response;
      setSessionToken(sessionToken);
      setShowEmailVerificationModal(true);
      customToast.success('Verification code sent to your email');
    }
  }, [isStep1Success, step1Data]);

  // Handle successful phone verification request
  useEffect(() => {
    if (!wasPhoneModalForcedClose && isStep2Success && step2ApiData?.data?.response) {
      const { sessionToken: newSessionToken, phoneNumber } = step2ApiData.data.response;
      setSessionToken(newSessionToken);
      setShowPhoneVerificationModal(true);
      customToast.success('Verification code sent to your phone');
    }
  }, [isStep2Success, step2Data]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  // Validate password strength
  const validatePassword = (password: string): string | true => {
    const hasMinLength = password.length >= 8;
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    const hasUppercase = /[A-Z]/.test(password);

    if (!hasMinLength) return 'Password must be at least 8 characters';
    if (!hasDigit) return 'Password must contain at least one digit';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    if (!hasUppercase) return 'Password must contain at least one uppercase letter';

    return true;
  };

  // Validate step 1 form
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!step1Data.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!step1Data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(step1Data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2 form
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!step2Data.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(step2Data.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!step2Data.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(step2Data.password);
      if (passwordValidation !== true) {
        newErrors.password = passwordValidation;
      }
    }

    if (!step2Data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (step2Data.password !== step2Data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step 1 form changes
  const handleStep1Change = (value: any, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = event?.target.name || 'email';
    const fieldValue = event?.target.value || value;

    setStep1Data(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle step 2 form changes
  const handleStep2Change = (value: any, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = event?.target.name || 'phoneNumber';
    let fieldValue = event?.target.value || value;

    // For phone number, only allow digits
    if (name === 'phoneNumber') {
      fieldValue = fieldValue.replace(/\D/g, '');
    }

    setStep2Data(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle step 1 submission
  const handleStep1Submit = () => {
    if (validateStep1()) {
      setWasEmailModalForcedClose(false);
      sendEmailVerification(step1Data);
    }
  };

  // Handle step 2 submission
  const handleStep2Submit = () => {
    if (validateStep2()) {
      setWasPhoneModalForcedClose(false);
      sendPhoneVerification({
        ...step2Data,
        sessionToken
      });
    }
  };

  // Handle successful email verification
  const handleEmailVerificationSuccess = (newSessionToken: string) => {
    setSessionToken(newSessionToken);
    setShowEmailVerificationModal(false);
    setCurrentStep('step2');
    customToast.success('Email verified successfully');
  };

  // Handle successful phone verification
  const handlePhoneVerificationSuccess = () => {
    setShowPhoneVerificationModal(false);
    customToast.success('Account created successfully! Please sign in.');
    if (handleSuccessfulSignup) {
      handleSuccessfulSignup();
    } else {
      // Default behavior - navigate to login
      navigate(`/${lang}/login`);
    }
    // Reset form
    setCurrentStep('step1');
    setStep1Data({ companyName: '', email: '' });
    setStep2Data({ phoneNumber: '', password: '', confirmPassword: '' });
    setSessionToken('');
    setErrors({});
  };

  // Handle resend email verification
  const handleResendEmailVerification = () => {
    sendEmailVerification(step1Data);
  };

  // Handle resend phone verification
  const handleResendPhoneVerification = () => {
    sendPhoneVerification({
      ...step2Data,
      sessionToken
    });
  };

  // Handle back to step 1
  const handleBackToStep1 = () => {
    setCurrentStep('step1');
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    // Reset everything
    setCurrentStep('step1');
    setStep1Data({ companyName: '', email: '' });
    setStep2Data({ phoneNumber: '', password: '', confirmPassword: '' });
    setSessionToken('');
    setErrors({});
    setShowEmailVerificationModal(false);
    setShowPhoneVerificationModal(false);
    // Navigate to login page
    navigate(`/${lang}/login`);
  };

  // Password requirements check
  const getPasswordRequirements = () => {
    const password = step2Data.password || '';
    return {
      hasMinLength: password.length >= 8,
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
      hasUppercase: /[A-Z]/.test(password)
    };
  };

  return {
    // State
    currentStep,
    step1Data,
    step2Data,
    sessionToken,
    errors,
    showEmailVerificationModal,
    showPhoneVerificationModal,
    
    // API states
    isStep1Pending,
    isStep1Error,
    step1Error,
    isStep2Pending,
    isStep2Error,
    step2Error,
    
    // Handlers
    handleStep1Change,
    handleStep2Change,
    handleStep1Submit,
    handleStep2Submit,
    handleEmailVerificationSuccess,
    handlePhoneVerificationSuccess,
    handleResendEmailVerification,
    handleResendPhoneVerification,
    handleBackToStep1,
    handleClose,
    handleLoginClick: handleLoginClick || (() => navigate(`/${lang}/login`)),
    
    // Utilities
    getPasswordRequirements,
    
    // Modal handlers
    setShowEmailVerificationModal,
    setShowPhoneVerificationModal,
    setWasEmailModalForcedClose,
    setWasPhoneModalForcedClose 
  };
};

export default useSignup;