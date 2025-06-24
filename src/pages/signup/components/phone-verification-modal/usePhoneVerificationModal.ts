// src/modals/phone-verification/usePhoneVerificationModal.ts

import { useState, useEffect } from 'react';
import { useVerifyPhoneOtpApi } from '../../../../api/api-hooks/useAuthApi';

const OTP_EXPIRY_TIME = 120; // 2 minutes

interface UsePhoneVerificationModalProps {
  sessionToken: string;
  onSuccess: () => void;
  onResend: () => void;
}

const usePhoneVerificationModal = ({
  sessionToken,
  onSuccess,
  onResend
}: UsePhoneVerificationModalProps) => {
  const [expiryTime, setExpiryTime] = useState<number>(OTP_EXPIRY_TIME);

  const {
    mutate: verifyPhoneOtp,
    isPending: isVerifyPending,
    isError: isVerifyError,
    error: verifyError,
    isSuccess: isVerifySuccess
  } = useVerifyPhoneOtpApi();

  // Handle successful phone OTP verification
  useEffect(() => {
    if (isVerifySuccess) {
      onSuccess();
    }
  }, [isVerifySuccess, onSuccess]);

  // Handle phone OTP verification
  const handleVerifyPhoneOtp = (otp: string) => {
    verifyPhoneOtp({
      sessionToken,
      otp
    });
  };

  // Handle resend phone OTP
  const handleResendPhoneOtp = () => {
    setExpiryTime(OTP_EXPIRY_TIME);
    onResend();
  };

  return {
    handleVerifyPhoneOtp,
    handleResendPhoneOtp,
    isVerifyPending,
    isVerifyError,
    verifyError,
    expiryTime
  };
};

export default usePhoneVerificationModal;