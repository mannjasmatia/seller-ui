// src/types/signup.ts

export interface SignupStep1Data {
  companyName: string;
  email: string;
}

export interface SignupStep2Data {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface SignupFormData extends SignupStep1Data, SignupStep2Data {
  sessionToken?: string;
}

export interface SignupResponse {
  sessionToken: string;
  step: 'email_verification' | 'phone_verification';
  email?: string;
  phoneNumber?: string;
}

export interface VerifyOtpResponse {
  step: 'phone_verification' | 'completed';
  sessionToken: string;
}

export interface SignupPageProps {
  handleLoginClick?: () => void;
  handleSuccessfulSignup?: () => void;
}

export interface EmailVerificationModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  sessionToken: string;
  onSuccess: (sessionToken: string) => void;
  onResend: () => void;
}

export interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  phoneNumber: string;
  sessionToken: string;
  onSuccess: () => void;
  onResend: () => void;
}