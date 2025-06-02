import React, { MouseEvent, useEffect, useState } from 'react';
import { useChangePasswordApi } from '../../../api/api-hooks/useAuthApi';
import { customToast } from '../../../toast-config/customToast';
import Input from '../../../components/BasicComponents/Input';
import Button from '../../../components/BasicComponents/Button';

// Type definitions for the component props
interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange?: (oldPassword: string, newPassword: string) => Promise<void>;
}

// Form data interface
interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Error state interface  
interface Errors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onPasswordChange }) => {
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Errors>({
    oldPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {mutate:changePassword , isSuccess:passwordChangeSuccess, isError ,error} = useChangePasswordApi()

  useEffect(()=>{
    if(passwordChangeSuccess){
      customToast.success("Password changed successfully")
      onClose();
      setIsSubmitting(false);
    }
  },[passwordChangeSuccess])

  useEffect(()=>{
    if(isError){
      customToast.error((error as any)?.response.data.message);
    }
  },[isError])

  // Password requirements component
  const PasswordRequirements: React.FC = () => {
    const password = formData.newPassword || '';
    const hasMinLength = password.length >= 8;
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    
    return (
      <div className="text-xs text-gray-600 mt-1 mb-1">
        <p className="font-medium mb-1">Password requirements:</p>
        <ul className="space-y-1 pl-4">
          <li className={hasMinLength ? "text-green-600" : "text-gray-500"}>
            ✓ Minimum 8 characters
          </li>
          <li className={hasDigit ? "text-green-600" : "text-gray-500"}>
            ✓ At least one number  
          </li>
          <li className={hasSpecialChar ? "text-green-600" : "text-gray-500"}>
            ✓ At least one special character
          </li>
          <li className={hasUppercase ? "text-green-600" : "text-gray-500"}>
            ✓ At least one uppercase letter
          </li>
        </ul>
      </div>
    );
  };

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

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'confirmPassword' && value !== formData.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (field === 'confirmPassword' && value === formData.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    if (field === 'newPassword') {
      const validationResult = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        newPassword: validationResult === true ? undefined : validationResult,
        confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match' : undefined
      }));
    }
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Final validation
    const newError = validatePassword(formData.newPassword);
    
    if (newError !== true) {
      setErrors(prev => ({ ...prev, newPassword: newError }));
      setIsSubmitting(false);
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.oldPassword) {
      setErrors(prev => ({ ...prev, oldPassword: 'Old password is required' }));
      setIsSubmitting(false);
      return;
    }
    
      changePassword(formData)
      // onPasswordChange(formData.oldPassword, formData.newPassword);
      
      // setErrors(prev => ({ ...prev, oldPassword: 'Incorrect old password' }));
      
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-xs transition-opacity" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-fadeIn">
          {/* Gradient Background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 opacity-50" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Change Password
              </h3>
              <p className="text-sm text-gray-600">
                Enter your current password and create a new one
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Old Password */}
              <Input
                type="password"
                label="Current Password"
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={(value) => handleChange('oldPassword', value)}
                error={errors.oldPassword}
                fullWidth
                theme={['purple-600', 'white']}
                validation={{
                  required: true,
                  errorMessages: {
                    required: 'Current password is required'
                  }
                }}
              />

              {/* New Password */}
              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(value) => handleChange('newPassword', value)}
                error={errors.newPassword}
                fullWidth
                theme={['purple-600', 'white']}
                validation={{
                  required: true,
                  errorMessages: {
                    required: 'Current password is required'
                  }
                }}
              />
              
              {/* Password Requirements */}
              <PasswordRequirements />

              {/* Confirm Password */}
              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(value) => handleChange('confirmPassword', value)}
                error={errors.confirmPassword}
                fullWidth
                theme={['purple-600', 'white']}
                validation={{
                  required: true,
                  errorMessages: {
                    required: 'Current password is required'
                  }
                }}
              />

              {isError && 
                <p className='text-lg text-cb-red font-medium'>{(error as any)?.response?.data?.message || "Some Error Occured"}</p>
              }

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  // theme={['gray-700', 'white']}
                  onClick={onClose}
                  disabled={isSubmitting}
                  animation="fade"
                >
                  Cancel
                </Button>

                <Button
                  variant="solid"
                  // theme={['purple-600', 'white']}
                  // type="submit"
                  onClick={(e:any) => { handleSubmit(e); }}
                  isLoading={isSubmitting}
                  className='hover:scale-95'
                  // disabled={isSubmitting}
                  // animation="scale"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>

          {/* Custom Animation Styles */}
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out forwards;
            }
            
            @media (max-width: 640px) {
              .relative.w-full.max-w-md {
                margin: 0;
                min-height: 100vh;
                max-width: 100%;
                border-radius: 0;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;