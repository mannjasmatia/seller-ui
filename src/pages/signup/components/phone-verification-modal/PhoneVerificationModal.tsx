// src/modals/phone-verification/PhoneVerificationModal.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { PhoneVerificationModalProps } from '../../types.signup';
import usePhoneVerificationModal from './usePhoneVerificationModal';
import VerifyOtpModal from '../../../../modals/verify-otp/VerifyOtpModal';

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  open,
  onClose,
  phoneNumber,
  sessionToken,
  onSuccess,
  onResend
}) => {
  const language = useSelector((state: any) => state.language?.value)['auth']['verifyOtp'];

  const {
    handleVerifyPhoneOtp,
    handleResendPhoneOtp,
    isVerifyPending,
    isVerifyError,
    verifyError,
    expiryTime
  } = usePhoneVerificationModal({
    sessionToken,
    onSuccess,
    onResend
  });

  return (
    <VerifyOtpModal
      open={open}
      onClose={onClose}
      title={language.phoneTitle}
      description={`${language.phoneDescription} ${phoneNumber}`}
      otpLength={4}
      handleVerifyOtpClick={handleVerifyPhoneOtp}
      isLoading={isVerifyPending}
      isError={isVerifyError}
      apiError={verifyError}
      expiryTime={expiryTime}
      handleResendOtp={handleResendPhoneOtp}
    />
  );
};

export default PhoneVerificationModal;