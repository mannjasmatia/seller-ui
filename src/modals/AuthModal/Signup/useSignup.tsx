import { BuyerSignupModalProps, FormField } from "../../../types/signup";
import { Country, State, City } from 'country-state-city';
import { isValidPhoneNumber, CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useEffect, useRef, useState } from "react";
import { SelectOption } from "../../../components/BasicComponents/types";
import { useSignupApi, useVerifyOtpApi } from "../../../api/api-hooks/useAuthApi";

const OTP_EXPIRY_TIME = 120; // 2 minutes

const useSignup =({
  open,
  onClose,
  handleLoginClick,
  handleSuccesfullSignup
} : BuyerSignupModalProps) => {
    // Get Canada states from the country-state-city library
      const canadaStates = State.getStatesOfCountry('CA').map(state => ({
        value: state.isoCode,
        label: state.name
      }));
    
      // State for selected province and cities
      const [selectedProvince, setSelectedProvince] = useState<string>('');
      const [cities, setCities] = useState<SelectOption[]>([]);
      const [phoneNumber, setPhoneNumber] = useState<string>('');
      const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
      const [expiryTime, setExpiryTime] = useState<number>(0);
      const { mutate:verifyOtp, isPending, isError, error, isSuccess } = useVerifyOtpApi();
      const { mutate:signup, isPending: isVerifyOtpPending , isError: isVerifyOtpError, error:verifyOtpError, isSuccess: verifyOtpSuccess } = useSignupApi();
    
      // Handle successful signup form filling and otp sending
      useEffect(()=>{
          if(isSuccess){
            setShowVerifyOtpModal(true)
            setExpiryTime(OTP_EXPIRY_TIME)
          }
        },[isSuccess])

        // handle signup along with otp verification
      useEffect(()=>{
          if(verifyOtpSuccess){
            handleSuccesfullSignup()
            setShowVerifyOtpModal(false)
          }
        },[verifyOtpSuccess])
    
      // Update cities when province changes
      useEffect(() => {
        if (selectedProvince) {
          const provinceCities = City.getCitiesOfState('CA', selectedProvince).map(city => ({
            value: city.name,
            label: city.name
          }));
          setCities(provinceCities);
        } else {
          setCities([]);
        }
      }, [selectedProvince]);
    
      // Password validation function
      const validatePassword = (password: string) => {
        // Check if password meets all criteria
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
    
      // Dynamic form fields configuration
      const formFields: FormField[] = [
        {
          name: 'fullName',
          type: 'text',
          placeholder: 'Full name :',
          validation: {
        required: true,
        custom: (value: string) => {
          if (!value.trim()) return 'Full Name Cannot Be Empty';
          if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name must contain only letters and spaces';
          return true;
        },
        errorMessages: {
          required: 'Full name is required'
        }
          },
          gridCols: 'full'
        },
        {
          name: 'phoneNumber',
          type: 'tel',
          placeholder: 'Phone number :',
          validation: {
        required: true,
        custom: (value: string) => {
          if (!value.trim()) return 'Phone Number Cannot Be Empty';
          if (!/^\d{10}$/.test(value)) return 'Phone Number is Invalid';
          return true;
        },
        errorMessages: {
          required: 'Phone number is required'
        }
          },
          gridCols: 'full',
          component: (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-gray-500">
            <span className="text-sm">+1</span>
          </div>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone number :"
            value={phoneNumber?.replace(/^\+1/, '') || ''} // Remove +1 from display if present
            onChange={(e) => {
          // Only allow digits
          const digits = e.target.value.replace(/\D/g, '');
          setPhoneNumber(`${digits}`);
          handleChange(`${digits}`);
            }}
            className="block rounded-full border bg-white transition-all duration-200 placeholder:text-gray-400 text-base px-4 py-1 pl-12 w-full border-gray-300 focus:border-cb-red focus:ring-cb-red/30 focus:outline-none focus:ring-2"
          />
        </div>
          )
        },
        {
          name: 'state',
          type: 'select',
          placeholder: 'Province/state :',
          options: canadaStates,
          validation: {
        required: true,
        custom: (value: string) => {
          if (!value.trim()) return 'State cannot be empty';
          return true;
        },
        errorMessages: {
          required: 'Province/state is required'
        }
          },
          gridCols: 'half'
        },
        {
          name: 'city',
          type: 'select',
          placeholder: 'City :',
          options: cities,
          validation: {
        required: true,
        custom: (value: string) => {
          if (!value.trim()) return 'City cannot be empty';
          return true;
        },
        errorMessages: {
          required: 'City is required'
        }
          },
          gridCols: 'half'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password :',
          validation: {
        required: true,
        custom: validatePassword,
        errorMessages: {
          required: 'Password is required'
        }
          },
          gridCols: 'half'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm password :',
          validation: {
        required: true,
        custom: (value: string) => {
          if (formState.password !== value) return 'Passwords do not match';
          return validatePassword(value);
        },
        errorMessages: {
          required: 'Confirm password is required'
        }
          },
          gridCols: 'half'
        },
      ];
    
      // Initial form state based on field definitions
      const initialFormState = formFields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
      }, {} as Record<string, string>);
    
      const [formState, setFormState] = useState(initialFormState);
      const [errors, setErrors] = useState<Record<string, string>>({});
    
      // Effect to handle modal open/close state
      // This effect adds a class to the body to prevent scrolling when the modal is open
      useEffect(() => {
        // Add no-scroll class to body when modal is open
        if (open) {
          document.body.classList.add('overflow-hidden');
        } else {
          document.body.classList.remove('overflow-hidden');
        }
        
        // Cleanup function to remove class when component unmounts
        return () => {
          document.body.classList.remove('overflow-hidden');
        };
      }, [open]);
    
      // Handle form input changes
      const handleChange = (value: any, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let name = '';
        
        if (event) {
          name = event.target.name;
        } else if (typeof value === 'object' && value.target) {
          name = value.target.name;
          value = value.target.value;
        } else {
          // For custom components like PhoneInput that don't provide event
          name = 'phoneNumber';
        }
        
        setFormState((prev) => ({
          ...prev,
          [name]: value,
        }));
        
        // If changing province, update selectedProvince state
        if (name === 'state') {
          setSelectedProvince(value);
          // Reset city when province changes
          setFormState(prev => ({
            ...prev,
            city: ''
          }));
        }
        
        // Clear error for this field when it's changed
        if (errors[name]) {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[name];
            return newErrors;
          });
        }
      };
    
      // Validate the form
      const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        formFields.forEach(field => {
          const { name, validation } = field;
          if (!validation) return;
          
          const value = formState[name];
          
          // Required validation
          if (validation.required && (!value || value.trim() === '')) {
            newErrors[name] = validation.errorMessages?.required || 'This field is required';
            return;
          }
          
          // Skip other validations if empty and not required
          if (!value && !validation.required) return;
          
          // Pattern validation
          if (validation.pattern && !validation.pattern.test(value)) {
            newErrors[name] = validation.errorMessages?.pattern || 'Invalid format';
            return;
          }
          
          // Special validation for password confirmation
          if (formState.password !== formState.confirmPassword && formState.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
    
          // Special validation for phone number validation , Disabled as of now for testing purpose
          // if(formState.phoneNumber){
          //   console.log("Phone Number : ",formState.phoneNumber)
          // const phoneNumber = `+1${formState.phoneNumber}`;
          //   if (!isValidPhoneNumber(phoneNumber, 'CA')) {
          //     newErrors.phoneNumber = 'Invalid phone number';
          //   }
          // }
          
          // MinLength validation
          if (validation.minLength !== undefined && value.length < validation.minLength) {
            newErrors[name] = validation.errorMessages?.minLength || `Must be at least ${validation.minLength} characters`;
            return;
          }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
    
      // Handle signup button click
      const handleSignup = () => {
        if (validateForm()) {
          verifyOtp(formState.phoneNumber)
        }
      };

      const handleVerifyOtp = (otp: string) => {
        signup({...formState, otp})
      }

      const handleResendOtp=()=>{
        verifyOtp(formState.phoneNumber)
      }

      return{
        formState,
        formFields,
        setFormState,
        handleChange,
        validateForm,
        handleSignup,
        errors,
        setSelectedProvince,
        setCities,
        setPhoneNumber,
        showVerifyOtpModal,
        setShowVerifyOtpModal,
        selectedProvince,
        cities,
        phoneNumber,
        isPending,
        isError,
        error,
        isSuccess,

        // For verify otp modal
        handleVerifyOtp,
        isVerifyOtpPending,
        isVerifyOtpError,
        verifyOtpError,
        handleResendOtp,
        expiryTime,
      }
    
}

export default useSignup;