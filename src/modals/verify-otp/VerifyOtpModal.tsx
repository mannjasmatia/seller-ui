import Button from '../../components/BasicComponents/Button';
import { VerifyOtpModalProps } from '../../types/verifyOtpModal';
import useVerifyOtpModal from './useVerifyOtpModal';
import { useSelector } from 'react-redux';

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({
  open,
  title,
  description,
  otpLength = 6,
  onClose,
  handleVerifyOtpClick,
  expiryTime = 0,
  handleResendOtp,
  isLoading = false,
  isError = false,
  apiError = null,
}) => {
  const language = useSelector((state: any) => state.language?.value)['auth']['verifyOtp'];

  const {
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

  } = useVerifyOtpModal({
    open,
    title,
    description,
    otpLength,
    onClose,
    handleVerifyOtpClick,
    expiryTime,
    handleResendOtp,
  });

  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-transparent bg-opacity-10 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transition-transform duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header icon */}
        {/* <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-cb-red bg-opacity-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cb-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div> */}
        
        {/* Title and description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        
        {/* OTP input fields */}
        <div className="flex justify-center space-x-3 mb-6">
          {Array.from({ length: otpLength }, (_, index) => (
            <div key={index} className="w-12 h-14 relative">
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={otpValues[index]}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={() => handleFocus(index)}
                onPaste={e => handlePaste(e, index)}
                maxLength={1}
                className={`w-full h-full text-center text-xl font-bold rounded-lg border-2 focus:outline-none focus:ring-2 transition-all
                  ${activeInput === index ? 'border-cb-red ring-cb-red ring-opacity-30' : 'border-gray-200'}
                  ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-opacity-30' : ''}
                `}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              
              {/* Bottom border animation */}
              <div className={`absolute bottom-0 left-0 w-full h-[3px] rounded-full transition-all duration-300 
                ${activeInput === index ? 'bg-cb-red scale-x-100' : 'bg-gray-200 scale-x-0'}`}
              />
            </div>
          ))}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-center text-red-500 mb-4 animate-shake">
            <p>{error}</p>
          </div>
        )}

        {isError && (
            <p className="mt-2 text-sm text-red-600 w-full text-center">
            {(apiError as any)?.respone?.data?.message ?? language['invalidOtp']}
            </p>
        )}
        
        {/* Timer display */}
        {expiryTime > 0 && (
          <div className="text-center mb-4">
            <p className="text-gray-600">
              {timeLeft > 0 ? (
                <>{language['codeExpiresIn']} <span className="font-medium text-cb-red">{formatTime(timeLeft)}</span></>
              ) : (
                <span className="text-gray-500">{language['codeExpired']}</span>
              )}
            </p>
          </div>
        )}
        
        {/* Verify button */}
        <Button
            onClick={handleVerify}
            disabled={isLoading || otpValues.some(v => v === '') || (expiryTime > 0 && timeLeft <= 0)}
            variant="solid"
            size="lg"
            fullWidth
            theme={['cb-red', 'white']}
            isLoading={isLoading}
            >
            {isLoading ? language['verifying'] : language['verifyOtp']}
        </Button>
        
        {/* Resend code */}
        {handleResendOtp && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {language['didntReceiveCode']}{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 && expiryTime > 0 || resendOtpCount.current > MAX_RESEND_OTP_COUNT}
                className={`font-medium transition-colors ${
                  timeLeft > 0 && expiryTime > 0 || resendOtpCount.current > MAX_RESEND_OTP_COUNT
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-cb-red hover:underline'
                }`}
              >
                {language['resendCode']}
              </button>
            </p>
          </div>
        )}
        
        {/* Security note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {language['securityNote']}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpModal;