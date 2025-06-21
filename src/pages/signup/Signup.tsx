import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import useSignup from './useSignup';
import { useSelector } from 'react-redux';
import VerifyOtpModal from '../../modals/verify-otp/VerifyOtpModal';

const Signup=() => {
  const language = useSelector((state: any) => state.language?.value)['auth']['signup'];

  const {
    formState,
    formFields,
    handleChange,
    handleSignup,
    errors,
    isPending,
    isError,
    error,
    showVerifyOtpModal,
    setShowVerifyOtpModal,
    handleLoginClick,

    // For verify otp modal
    handleVerifyOtp,
    isVerifyOtpPending,
    isVerifyOtpError,
    verifyOtpError,
    handleResendOtp,
    expiryTime,

  } = useSignup();
  
  if (!open) return null;

  // Password requirements component
  const PasswordRequirements = () => {
    const password = formState.password || '';
    const hasMinLength = password.length >= 8;
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    
    return (
      <div className="text-xs text-gray-600 mt-1 mb-1">
        <p className="font-medium mb-1">{language['passwordRequirements']['title']}</p>
        <ul className="space-y-1 pl-4">
          <li className={hasMinLength ? "text-green-600" : "text-gray-500"}>
            {language['passwordRequirements']['minLength']}
          </li>
          <li className={hasDigit ? "text-green-600" : "text-gray-500"}>
            {language['passwordRequirements']['oneNumber']}
          </li>
          <li className={hasSpecialChar ? "text-green-600" : "text-gray-500"}>
            {language['passwordRequirements']['oneSpecial']}
          </li>
          <li className={hasUppercase ? "text-green-600" : "text-gray-500"}>
            {language['passwordRequirements']['oneUppercase']}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-transparent bg-opacity-10 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div 
        className="relative bg-gray-200 rounded-lg shadow-xl w-full max-w-md mx-4 transition-transform duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="p-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Canadian Bazaar" className="h-10" />
          </div>
          
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{language['welcomeBuyers']}</h2>
            <p className="text-gray-600 mt-1">
              {language['createAccount']}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div 
                  key={field.name} 
                  className={`${field.gridCols === 'full' ? 'col-span-2' : ''}`}
                >
                  {field.component ? (
                    <>
                      {field.component}
                      {errors[field.name] && (
                        <p className="mt-1 text-xs text-cb-red">{errors[field.name]}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <Input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formState[field.name]}
                        onChange={handleChange}
                        fullWidth
                        options={field.options}
                        validation={field.validation}
                        error={errors[field.name]}
                      />
                      {field.name === 'password' && formState.password && (
                        <PasswordRequirements />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Canada notice */}
            <div className="text-center text-sm text-gray-600 mt-2 bg-blue-50 p-2 rounded-full flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cb-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{language['canadaOnly']}</span>
            </div>
            
            {/* Terms and Privacy Policy */}
            <div className="text-center text-xs text-gray-600 mt-4">
              {language['termsAndPrivacy']}
            </div>
            
            {/* Signup Button */}
            <div className="mt-6">
              <Button
                type="button"
                onClick={handleSignup}
                fullWidth
                size="lg"
                theme={['cb-red', 'white']}
                isLoading={isPending}
              >
                {language['verifyPhone']}
              </Button>
            </div>
            {isError && (
              <p className="mt-2 text-sm text-red-600 w-full text-center">
              {(error as any)?.response?.data?.message ?? language['error']}
              </p>
            )}
          </form>
          
          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {language['alreadyHaveAccount']}{' '}
              <button
                type="button"
                onClick={handleLoginClick}
                className="text-cb-red hover:underline font-medium"
              >
                {language['login']}
              </button>
            </p>
          </div>
        </div>
      </div>
      {
        showVerifyOtpModal && 
        <VerifyOtpModal
          open={showVerifyOtpModal}
          onClose={()=>setShowVerifyOtpModal(false)}
          title={language['verifyOtp']['title']}
          description={`${language['verifyOtp']['description']} ${formState?.phoneNumber}`}
          otpLength={6}
          handleVerifyOtpClick={handleVerifyOtp}
          isLoading={isVerifyOtpPending}
          isError={isVerifyOtpError}
          apiError={verifyOtpError}
          expiryTime={expiryTime}
          handleResendOtp={handleResendOtp}
          />
      }
    </div>
  );
};

export default Signup;