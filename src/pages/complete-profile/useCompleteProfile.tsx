import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import { setIsLoggedIn, setUser } from '../../store/userSlice';
import { customToast } from '../../toast-config/customToast';
import { ValidationOptions } from '../../components/BasicComponents/types';
import { InputType } from '../../components/BasicComponents/Input';
import { useUpdateProfileApi } from '../../api/api-hooks/useProfileApi';
import { useFetchAllCategoriesApi } from '../../api/api-hooks/useCategoryApi';
import { State } from 'country-state-city';

interface FormState {
  fullName: string;
  businessType: string;
  categories: string[];
  businessNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface UploadedFile {
  file: File;
  preview: string;
}

interface Province {
  label: string;
  value: string;
}

interface BusinessType {
  _id: string;
  name: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

const useCompleteProfile = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Form state
  const [formState, setFormState] = useState<FormState>({
    fullName: '',
    businessType: '',
    categories: [],
    businessNumber: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // API hooks
  const { mutate: updateProfile, isPending, isError, error, isSuccess } = useUpdateProfileApi();

  // Canadian provinces
  const provinces: Province[] = State.getStatesOfCountry('CA').map(state => ({
    value: state.isoCode,
    label: state.name,
  }));

  // Input field configurations
  const inputFields = [
    {
      name: 'fullName',
      type: 'text' as InputType,
      label: 'Full Name',
      placeholder: 'Enter your full name',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        errorMessages: {
          required: 'Full name is required',
          minLength: 'Full name must be at least 2 characters',
          maxLength: 'Full name cannot exceed 50 characters',
          pattern: 'Full name can only contain letters and spaces'
        }
      } as ValidationOptions
    },
    {
      name: 'businessNumber',
      type: 'text' as InputType,
      label: 'Business Number',
      placeholder: 'Enter your business registration number',
      validation: {
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
      } as ValidationOptions
    },
    {
      name: 'street',
      type: 'text' as InputType,
      label: 'Street Address',
      placeholder: 'Enter your street address',
      validation: {
        required: true,
        minLength: 5,
        maxLength: 100,
        errorMessages: {
          required: 'Street address is required',
          minLength: 'Street address must be at least 5 characters',
          maxLength: 'Street address cannot exceed 100 characters'
        }
      } as ValidationOptions
    },
    {
      name: 'zip',
      type: 'text' as InputType,
      label: 'Postal Code',
      placeholder: 'Enter your postal code (e.g., 380013, to be changed in canadian code later)',
      validation: {
        required: true,
        pattern: /^\d{6}$/,
        errorMessages: {
          required: 'Postal code is required',
          pattern: 'Please enter a valid 6 digit code'
          // pattern: 'Please enter a valid Canadian postal code (e.g., K1A 0A6)'
        }
      } as ValidationOptions
    },
  ];

  const handleCategoryChange = (categories:string[])=>{
    setFormState((prev) => ({
      ...prev,
      categories,
    }));

    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  }

  const handleBusinessTypeChange = (businessType:string)=>{
    setFormState((prev) => ({
      ...prev,
      businessType,
    }));

    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        businessType: ''
      }));
    }
  }

  // Handle form input changes
  const handleChange = (value: any, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (event) {
      const { name } = event.target;
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
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
      setUploadedFiles([{ file, preview }]);
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    inputFields.forEach(field => {
      const value = formState[field.name as keyof FormState];
      const validation = field.validation;

      if (!validation) return;

      // Required validation
      if (validation.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = validation.errorMessages?.required || `${field.label} is required`;
          return;
        }
      }

      // Skip other validations if empty and not required
      if (!value && !validation.required) return;

      // String validations
      if (typeof value === 'string' && value.trim()) {
        // MinLength validation
        if (validation.minLength && value.length < validation.minLength) {
          newErrors[field.name] = validation.errorMessages?.minLength || 
            `${field.label} must be at least ${validation.minLength} characters`;
          return;
        }

        // MaxLength validation
        if (validation.maxLength && value.length > validation.maxLength) {
          newErrors[field.name] = validation.errorMessages?.maxLength || 
            `${field.label} cannot exceed ${validation.maxLength} characters`;
          return;
        }

        // Pattern validation
        if (validation.pattern && !validation.pattern.test(value)) {
          newErrors[field.name] = validation.errorMessages?.pattern || 
            `${field.label} format is invalid`;
          return;
        }
      }
    });

    if(!formState.businessType){
        newErrors['businessType'] = "Business type is required"
    }

    if(!formState.categories || formState.categories.length===0){
        newErrors['categories'] = "Select atleast 1 category"
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        console.log("ERRORS : +++++ > ",errors)
      customToast.error('Please fix the form errors before submitting');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    
    // Add form fields
    Object.entries(formState).forEach(([key, value]) => {
      if (key === 'categories' && Array.isArray(value)) {
        value.forEach(categoryId => {
          formData.append('categories[]', categoryId);
        });
      } else {
        formData.append(key, value as string);
      }
    });

    // Add logo file if uploaded
    if (uploadedFiles.length > 0) {
      formData.append('files', uploadedFiles[0].file);
    }

    updateProfile(formData);
  };

  // Handle successful profile update
  useEffect(() => {
    if (isSuccess) {
      customToast.success('Profile completed successfully! Please wait for admin verification.');
      
      // Update user info with isProfileComplete: true
      const updatedUserInfo = {
        ...userInfo,
        isProfileComplete: true,
        isVerified: false // Will be set to true after admin verification
      };
      
      dispatch(setUser(updatedUserInfo));
      
      // Navigate to verification pending page
      const preferredLang = lang || localStorage.getItem("lang") || "en";
      navigate(`/${preferredLang}/verification-pending`, { replace: true });
    }
  }, [isSuccess, userInfo, dispatch, lang, navigate]);

  // Handle postal code formatting
  useEffect(() => {
    if (formState.zip) {
      // Auto-format postal code
      const formatted = formState.zip.toUpperCase().replace(/\s/g, '');
      if (formatted.length === 6) {
        const formattedZip = `${formatted.slice(0, 3)} ${formatted.slice(3)}`;
        if (formattedZip !== formState.zip) {
          setFormState(prev => ({ ...prev, zip: formattedZip }));
        }
      }
    }
  }, [formState.zip]);

  return {
    formState,
    errors,
    provinces,
    inputFields,
    uploadedFiles,
    handleChange,
    handleCategoryChange,
    handleBusinessTypeChange,
    handleSubmit,
    handleFileUpload,
    removeUploadedFile,
    isPending,
    isError,
    error,
  };
};

export default useCompleteProfile;