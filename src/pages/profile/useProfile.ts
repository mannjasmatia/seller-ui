import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import { customToast } from '../../toast-config/customToast';
import { ValidationOptions } from '../../components/BasicComponents/types';
import { InputType } from '../../components/BasicComponents/Input';
import { 
  useGetProfileApi, 
  useUpdateProfileApi 
} from '../../api/api-hooks/useProfileApi';
import { 
  useSendEmailVerificationApi, 
  useSendPhoneVerificationApi,
  useVerifyEmailOtpApi,
  useVerifyPhoneOtpApi
} from '../../api/api-hooks/useAuthApi';
import { State, City } from 'country-state-city';
import { ProfileFormState, UploadedFile } from './types.profile';

const useProfile = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
//   const language = useSelector((state: RootState) => state.language?.value)['profile'];

  // Form state
  const [formState, setFormState] = useState<ProfileFormState>({
    companyName: '',
    email: '',
    phone: '',
    businessType: '',
    categories: [],
    businessNumber: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    profilePic: null,
    avatar: null,
  });

  const [originalFormState, setOriginalFormState] = useState<ProfileFormState>({
    companyName: '',
    email: '',
    phone: '',
    businessType: '',
    categories: [],
    businessNumber: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    profilePic: null,
    avatar: null,
  });

  // UI States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [preview, setPreview] = useState<string>('/user_pfp.jpg');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  
  // OTP Modal States
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState<boolean>(false);
  const [isPhoneOtpModalOpen, setIsPhoneOtpModalOpen] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>('');
  const [tempPhoneNumber, setTempPhoneNumber] = useState<string>('');

  // Long press detection
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef<boolean>(false);

  // API Hooks
  const { data: profileData, isSuccess: profileSuccess, refetch: refetchProfile } = useGetProfileApi();
  const { mutate: updateProfile, isPending: isUpdating, isSuccess: updateSuccess, isError: updateError } = useUpdateProfileApi();
  const { mutate: sendEmailVerification, isPending: isSendingEmailOtp, isSuccess: emailOtpSent } = useSendEmailVerificationApi();
  const { mutate: sendPhoneVerification, isPending: isSendingPhoneOtp, isSuccess: phoneOtpSent } = useSendPhoneVerificationApi();
  const { mutate: verifyEmailOtp, isPending: isVerifyingEmailOtp, isSuccess: emailOtpVerified } = useVerifyEmailOtpApi();
  const { mutate: verifyPhoneOtp, isPending: isVerifyingPhoneOtp, isSuccess: phoneOtpVerified } = useVerifyPhoneOtpApi();

  // Canadian provinces
  const provinces = State.getStatesOfCountry('CA').map(state => ({
    value: state.isoCode,
    label: state.name,
  }));

  // Get cities for selected province
  const getCitiesForState = (stateCode: string) => {
    if (!stateCode) return [];
    return City.getCitiesOfState('CA', stateCode).map(city => ({
      value: city.name,
      label: city.name,
    }));
  };

  // Validation rules
  const validationRules: Record<string, ValidationOptions> = {
    companyName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      errorMessages: {
        required: 'Company name is required',
        minLength: 'Company name must be at least 2 characters',
        maxLength: 'Company name cannot exceed 50 characters',
        pattern: 'Company name can only contain letters and spaces'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessages: {
        required: 'Email is required',
        pattern: 'Please enter a valid email address'
      }
    },
    phoneNumber: {
      required: true,
      pattern: /^\+?[1-9]\d{1,14}$/,
      errorMessages: {
        required: 'Phone number is required',
        pattern: 'Please enter a valid phone number'
      }
    },
    businessType: {
      required: true,
      errorMessages: {
        required: 'Business type is required'
      }
    },
    categories: {
      required: true,
      errorMessages: {
        required: 'At least one category is required'
      }
    },
    businessNumber: {
      required: true,
      minLength: 5,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9]+$/,
      errorMessages: {
        required: 'Business number is required',
        minLength: 'Business number must be at least 5 characters',
        maxLength: 'Business number cannot exceed 20 characters',
        pattern: 'Business number can only contain letters and numbers'
      }
    },
    street: {
      required: true,
      minLength: 5,
      maxLength: 100,
      errorMessages: {
        required: 'Street address is required',
        minLength: 'Street address must be at least 5 characters',
        maxLength: 'Street address cannot exceed 100 characters'
      }
    },
    city: {
      required: true,
      errorMessages: {
        required: 'City is required'
      }
    },
    state: {
      required: true,
      errorMessages: {
        required: 'Province/Territory is required'
      }
    },
    zip: {
      required: true,
      pattern: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
      errorMessages: {
        required: 'Postal code is required',
        pattern: 'Please enter a valid Canadian postal code (e.g., K1A 0A6)'
      }
    },
  };

  // Load profile data
  useEffect(() => {
    if (profileSuccess && profileData) {
      const data = {
        companyName: profileData.companyName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        businessType: profileData.businessType || '',
        categories: profileData.categories || [],
        businessNumber: profileData.businessNumber || '',
        street: profileData.street || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zip: profileData.zip || '',
        profilePic: profileData.profilePic || null,
        avatar: profileData.avatar || null,
      };
      setFormState(data);
      setOriginalFormState(data);
      
      // Set preview image
      if (profileData.profilePic) {
        setPreview(`${import.meta.env.VITE_MEDIA_URL}/${profileData.profilePic}`);
      } else if (profileData.avatar) {
        setPreview(`/avatars/avatar-${profileData.avatar}.svg`);
      }
    }
  }, [profileSuccess, profileData]);

  // Handle successful update
  useEffect(() => {
    if (updateSuccess) {
      customToast.success('Profile updated successfully');
      setIsEditing(false);
      setOriginalFormState(formState);
      refetchProfile();
    }
  }, [updateSuccess]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      customToast.error('Failed to update profile');
    }
  }, [updateError]);

  // Handle email OTP sent
  useEffect(() => {
    if (emailOtpSent) {
      customToast.success('Verification code sent to your email');
      setIsEmailOtpModalOpen(true);
    }
  }, [emailOtpSent]);

  // Handle phone OTP sent
  useEffect(() => {
    if (phoneOtpSent) {
      customToast.success('Verification code sent to your phone');
      setIsPhoneOtpModalOpen(true);
    }
  }, [phoneOtpSent]);

  // Handle email OTP verified
  useEffect(() => {
    if (emailOtpVerified) {
      customToast.success('Email verified successfully');
      setIsEmailOtpModalOpen(false);
      handleSaveProfile();
    }
  }, [emailOtpVerified]);

  // Handle phone OTP verified
  useEffect(() => {
    if (phoneOtpVerified) {
      customToast.success('Phone number verified successfully');
      setIsPhoneOtpModalOpen(false);
      handleSaveProfile();
    }
  }, [phoneOtpVerified]);

  // Handle postal code formatting
  useEffect(() => {
    if (formState.zip) {
      const formatted = formState.zip.toUpperCase().replace(/\s/g, '');
      if (formatted.length === 6) {
        const formattedZip = `${formatted.slice(0, 3)} ${formatted.slice(3)}`;
        if (formattedZip !== formState.zip) {
          setFormState(prev => ({ ...prev, zip: formattedZip }));
        }
      }
    }
  }, [formState.zip]);

  // Handle form input changes
  const handleChange = (field: keyof ProfileFormState) => (value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear city when state changes
    if (field === 'state') {
      setFormState(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  // Handle category change
  const handleCategoryChange = (categories: string[]) => {
    setFormState(prev => ({
      ...prev,
      categories,
    }));

    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  };

  // Handle business type change
  const handleBusinessTypeChange = (businessType: string) => {
    setFormState(prev => ({
      ...prev,
      businessType,
    }));

    if (errors.businessType) {
      setErrors(prev => ({
        ...prev,
        businessType: ''
      }));
    }
  };

  // Handle state change
  const handleStateChange = (state: string) => {
    setFormState(prev => ({
      ...prev,
      state,
      city: '' // Clear city when state changes
    }));

    if (errors.state) {
      setErrors(prev => ({
        ...prev,
        state: ''
      }));
    }
  };

  // Handle city change
  const handleCityChange = (city: string) => {
    setFormState(prev => ({
      ...prev,
      city,
    }));

    if (errors.city) {
      setErrors(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      customToast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      customToast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreview(preview);
      setUploadedFiles([{ file, preview }]);
    };
    reader.readAsDataURL(file);

    setFormState(prev => ({
      ...prev,
      profilePic: file,
      avatar: null,
    }));
  };

  // Handle avatar selection
  const handleSelectAvatar = (avatarId: number) => {
    setFormState(prev => ({
      ...prev,
      profilePic: null,
      avatar: String(avatarId),
    }));
    setPreview(`/avatars/avatar-${avatarId}.svg`);
    setUploadedFiles([]);
  };

  // Handle long press for media modal
  const handleMouseDown = () => {
    isLongPress.current = false;
    longPressTimeout.current = setTimeout(() => {
      isLongPress.current = true;
      setIsMediaModalOpen(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    if (!isLongPress.current && isEditing) {
      // Short press in edit mode - show avatar modal
      setIsAvatarModalOpen(true);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(validationRules).forEach(([field, validation]) => {
      const value = formState[field as keyof ProfileFormState];

      // Required validation
      if (validation.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'string' && value.trim() === '')) {
          newErrors[field] = validation.errorMessages?.required || `${field} is required`;
          return;
        }
      }

      // Skip other validations if empty and not required
      if (!value && !validation.required) return;

      // String validations
      if (typeof value === 'string' && value.trim()) {
        // MinLength validation
        if (validation.minLength && value.length < validation.minLength) {
          newErrors[field] = validation.errorMessages?.minLength || 
            `${field} must be at least ${validation.minLength} characters`;
          return;
        }

        // MaxLength validation
        if (validation.maxLength && value.length > validation.maxLength) {
          newErrors[field] = validation.errorMessages?.maxLength || 
            `${field} cannot exceed ${validation.maxLength} characters`;
          return;
        }

        // Pattern validation
        if (validation.pattern && !validation.pattern.test(value)) {
          newErrors[field] = validation.errorMessages?.pattern || 
            `${field} format is invalid`;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setFormState(originalFormState);
    setErrors({});
    setUploadedFiles([]);
    
    // Reset preview
    if (originalFormState.profilePic) {
      setPreview(`${import.meta.env.VITE_MEDIA_URL}/${originalFormState.profilePic}`);
    } else if (originalFormState.avatar) {
      setPreview(`/avatars/avatar-${originalFormState.avatar}.svg`);
    } else {
      setPreview('/user_pfp.jpg');
    }
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) {
      customToast.error('Please fix the form errors before saving');
      return;
    }

    const emailChanged = formState.email !== originalFormState.email;
    const phoneChanged = formState.phone !== originalFormState.phone;

    if (emailChanged && phoneChanged) {
      customToast.error('Please change email and phone number separately');
      return;
    }

    // TODO : INTEGRATE WITH THEIR RESPECTIVE API'S AND ALSO HANDLE RESEND FUNCTIONALITY
    if (emailChanged) {
      setTempEmail(formState.email);
    //   sendEmailVerification({ email: formState.email });
    } else if (phoneChanged) {
      setTempPhoneNumber(formState.phone);
    //   sendPhoneVerification({ phoneNumber: formState.phoneNumber });
    } else {
      handleSaveProfile();
    }
  };

  // Handle save profile
  const handleSaveProfile = () => {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(formState).forEach(([key, value]) => {
      if (key === 'categories' && Array.isArray(value)) {
        value.forEach(categoryId => {
          formData.append('categories[]', categoryId);
        });
      } else if (key === 'profilePic' && value instanceof File) {
        formData.append('files', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    updateProfile(formData);
  };

  // Handle email OTP verification
  const handleEmailOtpVerification = (otp: string) => {
    verifyEmailOtp({ sessionToken, otp });
  };

  // Handle phone OTP verification
  const handlePhoneOtpVerification = (otp: string) => {
    verifyPhoneOtp({ sessionToken, otp });
  };

  // Handle email OTP resend
  const handleResendEmailOtp = () => {
    // sendEmailVerification({ email: tempEmail });
  };

  // Handle phone OTP resend
  const handleResendPhoneOtp = () => {
    // sendPhoneVerification({ phoneNumber: tempPhoneNumber });
  };

  return {
    // State
    formState,
    isEditing,
    errors,
    preview,
    provinces,
    
    // Modal states
    isAvatarModalOpen,
    isMediaModalOpen,
    isEmailOtpModalOpen,
    isPhoneOtpModalOpen,
    
    // Loading states
    isUpdating,
    isSendingEmailOtp,
    isSendingPhoneOtp,
    isVerifyingEmailOtp,
    isVerifyingPhoneOtp,
    
    // Handlers
    handleChange,
    handleCategoryChange,
    handleBusinessTypeChange,
    handleStateChange,
    handleCityChange,
    handleFileUpload,
    handleSelectAvatar,
    handleEdit,
    handleCancel,
    handleSave,
    handleMouseDown,
    handleMouseUp,
    handleEmailOtpVerification,
    handlePhoneOtpVerification,
    handleResendEmailOtp,
    handleResendPhoneOtp,
    
    // Utilities
    getCitiesForState,
    validationRules,
    
    // Modal handlers
    setIsAvatarModalOpen,
    setIsMediaModalOpen,
    setIsEmailOtpModalOpen,
    setIsPhoneOtpModalOpen,
    
    // Temp data
    tempEmail,
    tempPhoneNumber,
  };
};

export default useProfile;