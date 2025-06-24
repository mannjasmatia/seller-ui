// src/modals/email-verification/EmailVerificationModal.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { EmailVerificationModalProps } from '../../types.signup';
import useEmailVerificationModal from './useEmailVerificationModal';
import VerifyOtpModal from '../../../../modals/verify-otp/VerifyOtpModal';

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  open,
  onClose,
  email,
  sessionToken,
  onSuccess,
  onResend
}) => {
  const language = useSelector((state: any) => state.language?.value)['auth']['verifyOtp'];

  const {
    handleVerifyEmailOtp,
    handleResendEmailOtp,
    isVerifyPending,
    isVerifyError,
    verifyError,
    expiryTime
  } = useEmailVerificationModal({
    sessionToken,
    onSuccess,
    onResend
  });

  return (
    <VerifyOtpModal
      open={open}
      onClose={onClose}
      title={language.emailTitle}
      description={`${language.emailDescription} ${email}`}
      otpLength={4}
      handleVerifyOtpClick={handleVerifyEmailOtp}
      isLoading={isVerifyPending}
      isError={isVerifyError}
      apiError={verifyError}
      expiryTime={expiryTime}
      handleResendOtp={handleResendEmailOtp}
    />
  );
};

export default EmailVerificationModal;