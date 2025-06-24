// src/pages/signup/Signup.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import useSignup from './useSignup';
import { SignupPageProps } from './types.signup';
import EmailVerificationModal from './components/email-verification-modal/EmailVerificationModal';
import PhoneVerificationModal from './components/phone-verification-modal/PhoneVerificationModal';


const Signup: React.FC<SignupPageProps> = ({
  handleLoginClick,
  handleSuccessfulSignup
} = {}) => {
  const language = useSelector((state: RootState) => state.language?.value).auth.signup;

  const {
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
    
    // Utilities
    getPasswordRequirements,
    
    // Modal handlers
    setShowEmailVerificationModal,
    setShowPhoneVerificationModal,
    setWasEmailModalForcedClose,
    setWasPhoneModalForcedClose 
  } = useSignup({
    handleLoginClick,
    handleSuccessfulSignup
  });

  if (!open) return null;

  // Password requirements component
  const PasswordRequirements = () => {
    const requirements = getPasswordRequirements();

    return (
      <div className="text-xs text-gray-600 mt-1 mb-1">
        <p className="font-medium mb-1">{language.passwordRequirements.title}</p>
        <ul className="space-y-1 pl-4">
          <li className={requirements.hasMinLength ? "text-green-600" : "text-gray-500"}>
            {language.passwordRequirements.minLength}
          </li>
          <li className={requirements.hasDigit ? "text-green-600" : "text-gray-500"}>
            {language.passwordRequirements.oneNumber}
          </li>
          <li className={requirements.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
            {language.passwordRequirements.oneSpecial}
          </li>
          <li className={requirements.hasUppercase ? "text-green-600" : "text-gray-500"}>
            {language.passwordRequirements.oneUppercase}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-transparent bg-opacity-10 backdrop-blur-sm transition-opacity animate-fadeIn">
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transition-transform duration-300 animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Canadian Bazaar" className="h-10" />
            </div>
            
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{language.title}</h2>
              <p className="text-gray-600 mt-1">{language.subtitle}</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'step1' ? 'bg-cb-red text-white' : 'bg-green-500 text-white'
                }`}>
                  {currentStep === 'step1' ? '1' : '✓'}
                </div>
                <div className={`w-16 h-1 ${currentStep === 'step2' ? 'bg-cb-red' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'step2' ? 'bg-cb-red text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Company & Email */}
            {currentStep === 'step1' && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{language.step1Title}</h3>
                </div>
                
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <Input
                    type="text"
                    name="companyName"
                    placeholder={language.companyNamePlaceholder}
                    value={step1Data.companyName}
                    onChange={handleStep1Change}
                    fullWidth
                    error={errors.companyName}
                  />
                  
                  <Input
                    type="email"
                    name="email"
                    placeholder={language.emailPlaceholder}
                    value={step1Data.email}
                    onChange={handleStep1Change}
                    fullWidth
                    error={errors.email}
                  />
                  
                  {/* Submit Button */}
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={handleStep1Submit}
                      fullWidth
                      size="lg"
                      theme={['cb-red', 'white']}
                      isLoading={isStep1Pending}
                    >
                      {language.sendVerification}
                    </Button>
                  </div>
                  
                  {isStep1Error && (
                    <p className="mt-2 text-sm text-red-600 w-full text-center">
                      {(step1Error as any)?.response?.data?.message ?? language.errors.genericError}
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* Step 2: Phone & Password */}
            {currentStep === 'step2' && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{language.step2Title}</h3>
                </div>
                
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {/* Phone Number Input */}
                  <div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-gray-500">
                        <span className="text-sm">+1</span>
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder={language.phoneNumberPlaceholder}
                        value={step2Data.phoneNumber}
                        onChange={(e) => handleStep2Change(e.target.value, e)}
                        className="block rounded-full border bg-white transition-all duration-200 placeholder:text-gray-400 text-base px-4 py-1 pl-12 w-full border-gray-300 focus:border-cb-red focus:ring-cb-red/30 focus:outline-none focus:ring-2"
                        maxLength={10}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-cb-red">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      name="password"
                      placeholder={language.passwordPlaceholder}
                      value={step2Data.password}
                      onChange={handleStep2Change}
                      fullWidth
                      error={errors.password}
                    />
                    {step2Data.password && <PasswordRequirements />}
                  </div>
                  
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder={language.confirmPasswordPlaceholder}
                    value={step2Data.confirmPassword}
                    onChange={handleStep2Change}
                    fullWidth
                    error={errors.confirmPassword}
                  />
                  
                  {/* Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      onClick={handleBackToStep1}
                      variant="outline"
                      size="lg"
                      theme={['cb-red', 'white']}
                      className="flex-1"
                    >
                      {language.backToStep1}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleStep2Submit}
                      size="lg"
                      theme={['cb-red', 'white']}
                      isLoading={isStep2Pending}
                      className="flex-1"
                    >
                      {language.completeSignup}
                    </Button>
                  </div>
                  
                  {isStep2Error && (
                    <p className="mt-2 text-sm text-red-600 w-full text-center">
                      {(step2Error as any)?.response?.data?.message ?? language.errors.genericError}
                    </p>
                  )}
                </form>
              </div>
            )}
            
            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                {language.alreadyHaveAccount}{' '}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="text-cb-red hover:underline font-medium"
                >
                  {language.login}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Email Verification Modal */}
        {showEmailVerificationModal && (
          <EmailVerificationModal
            open={showEmailVerificationModal}
            onClose={() => {setWasEmailModalForcedClose(true);setShowEmailVerificationModal(false)}}
            email={step1Data.email}
            sessionToken={sessionToken}
            onSuccess={handleEmailVerificationSuccess}
            onResend={handleResendEmailVerification}
          />
        )}

        {/* Phone Verification Modal */}
        {showPhoneVerificationModal && (
          <PhoneVerificationModal
            open={showPhoneVerificationModal}
            onClose={() => {setWasPhoneModalForcedClose(true);setShowPhoneVerificationModal(false)}}
            phoneNumber={`+1${step2Data.phoneNumber}`}
            sessionToken={sessionToken}
            onSuccess={handlePhoneVerificationSuccess}
            onResend={handleResendPhoneVerification}
          />
        )}
      </div>
    </>
  );
};

export default Signup;