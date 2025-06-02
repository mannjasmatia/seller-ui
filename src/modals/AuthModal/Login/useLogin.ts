import { useEffect, useState } from "react";
import { LoginModalProps } from "../../../types/login";
import { useDispatch } from "react-redux";
import { setIsLoggedIn, setUser } from "../../../store/userSlice";
import { useLoginApi } from "../../../api/api-hooks/useAuthApi";
import { customToast } from "../../../toast-config/customToast";
import { InputType } from "../../../components/BasicComponents/Input";

const useLogin = ({ 
    open, 
    onClose,
    handleSignupClick,
    handleSuccessfullLogin
  } : LoginModalProps)=>{
    // Form state with initial values
      const [formState, setFormState] = useState({
        uid: '',
        password: '',
      });

      const dispatch = useDispatch()
      
      const [errors, setErrors] = useState<Record<string, string>>({});
      const { data:loginData, mutate: login,isPending, isError, error, isSuccess } = useLoginApi();
    
      useEffect(()=>{
        if(isSuccess){
          customToast.success("Logged in successfully")
          dispatch(setIsLoggedIn(true))
          dispatch(setUser(loginData?.data?.response))
          handleSuccessfullLogin()
        }
      },[isSuccess])
    
      useEffect(()=>{
        if(isError){
          console.log("error in api query while logging in : ", error)
        }
      },[isError])
    
      // Input field configurations
      const inputFields = [
        {
          name: 'uid',
          type: 'text' as InputType,
          placeholder: 'Phone number / Email ID / Member ID',
          validation: {
            required: true,
            errorMessages: {
              required: 'Please enter your phone number, email, or member ID'
            }
          }
        },
        {
          name: 'password',
          type: 'password' as InputType,
          placeholder: 'Password',
          validation: {
            required: true,
            errorMessages: {
              required: 'Password is required'
            }
          },
        }
      ];

      // Function to handle Login on enter 
      useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            handleLogin();
          }
      };
    
        window.addEventListener('keydown', handleKeyPress);
    
        return () => {
          window.removeEventListener('keydown', handleKeyPress);
        };
      }, [formState]);

    
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
        if (!event) return;
        const { name } = event.target;
        setFormState((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    
      // Validate the form
      const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formState.uid.trim()) {
          newErrors.uid = 'Please enter your phone number, email, or member ID';
        }
        
        if (!formState.password) {
          newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
    
      // Handle login
      const handleLogin = async () => {
        if (validateForm()) {
          // setIsLoading(true);
          login(formState)
        }
      }
      // Handle social login
      const handleSocialLogin = (provider: 'google' | 'facebook' | 'linkedin') => {
        console.log(`Logging in with ${provider}`);
        // Implement social login logic here
      };

      return{
        formState,
        setFormState,
        errors,
        setErrors,
        inputFields,
        handleChange,
        handleLogin,
        handleSocialLogin,
        isPending,
        isError,
        error,
        isSuccess
      }
}


export default useLogin;