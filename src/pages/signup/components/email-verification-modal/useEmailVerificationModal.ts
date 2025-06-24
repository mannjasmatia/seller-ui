// src/modals/email-verification/useEmailVerificationModal.ts

import { useState, useEffect } from 'react';
import { useVerifyEmailOtpApi } from '../../../../api/api-hooks/useAuthApi';

const OTP_EXPIRY_TIME = 300; // 5 minutes

interface UseEmailVerificationModalProps {
  sessionToken: string;
  onSuccess: (sessionToken: string) => void;
  onResend: () => void;
}

const useEmailVerificationModal = ({
  sessionToken,
  onSuccess,
  onResend
}: UseEmailVerificationModalProps) => {
  const [expiryTime, setExpiryTime] = useState<number>(OTP_EXPIRY_TIME);

  const {
    mutate: verifyEmailOtp,
    isPending: isVerifyPending,
    isError: isVerifyError,
    error: verifyError,
    isSuccess: isVerifySuccess,
    data: verifyData
  } = useVerifyEmailOtpApi();

  // Handle successful email OTP verification
  useEffect(() => {
    if (isVerifySuccess && verifyData?.data?.response) {
      const { sessionToken: newSessionToken } = verifyData.data.response;
      onSuccess(newSessionToken);
    }
  }, [isVerifySuccess, verifyData, onSuccess]);

  // Handle email OTP verification
  const handleVerifyEmailOtp = (otp: string) => {
    verifyEmailOtp({
      sessionToken,
      otp
    });
  };

  // Handle resend email OTP
  const handleResendEmailOtp = () => {
    setExpiryTime(OTP_EXPIRY_TIME);
    onResend();
  };

  return {
    handleVerifyEmailOtp,
    handleResendEmailOtp,
    isVerifyPending,
    isVerifyError,
    verifyError,
    expiryTime
  };
};

export default useEmailVerificationModal;