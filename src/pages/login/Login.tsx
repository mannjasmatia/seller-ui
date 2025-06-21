import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LoginModalProps } from '../../types/login';
import useLogin from './useLogin';
import Input from '../../components/BasicComponents/Input';
import Button from '../../components/BasicComponents/Button';

const Login = () => {
  const language = useSelector((state: any) => state.language?.value)['auth']['login'];

  const {
    formState,
    errors,
    inputFields,
    handleChange,
    handleLogin,
    handleSignupClick,
    handleSocialLogin,
    isPending,
    isError,
    error,
    isLoggedIn,
  }=useLogin();

  if (isLoggedIn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-transparent bg-opacity-10 backdrop-blur-sm transition-opacity ">
      <div 
        className="bg-gray-200 rounded-lg shadow-xl w-full max-w-md mx-4 "
        onClick={(e) => e.stopPropagation()}
        // style={{ animation: !isLoggedIn ? 'slideIn 0.5s forwards' : 'none' }}
      >
        {/* <style>
          {`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(-100%);
          }
        }
          `}
        </style> */}

        <div className="p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Canadian Bazaar" className="h-10" />
          </div>
          
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{language['welcomeBack']}</h2>
            <p className="text-gray-600 mt-1">
              {language['loginAgain']}
            </p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {inputFields.map((field) => (
              <Input
                key={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formState[field.name as keyof typeof formState]}
                onChange={handleChange}
                fullWidth
                validation={field.validation}
                error={errors[field.name]}
              />
            ))}
            
            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-cb-red"
              >
                {language['forgotPassword']}
              </button>
            </div>
            
            {/* Social Login Options */}
            <div className="mt-6">
              <p className="text-center text-sm mb-2">{language['orContinueWith']}</p>
              <div className="flex justify-center space-x-4">
                <button 
                  type="button" 
                  onClick={() => handleSocialLogin('google')}
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSocialLogin('facebook')}
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSocialLogin('linkedin')}
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Terms and Privacy Policy */}
            <div className="text-center text-xs text-gray-600 mt-4">
              {language['termsAndPrivacy']}
            </div>
            
            {/* Login Button */}
            <div className="mt-6">
              <Button
                type="button"
                onClick={handleLogin}
                fullWidth
                size="lg"
                theme={['cb-red', 'white']}
                isLoading={isPending}
              >
                {isPending ? language['loggingIn'] : language['login']}
              </Button>
            </div>
            {isError && (
              <p className="mt-2 text-sm text-red-600 w-full text-center">
              {(error as any)?.response?.data?.message ?? language['error']}
              </p>
            )}
          </form>
          
          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {language['dontHaveAccount']}{' '}
              <button
                type="button"
                onClick={handleSignupClick}
                className="text-cb-red hover:underline font-medium"
              >
                {language['signUp']}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;