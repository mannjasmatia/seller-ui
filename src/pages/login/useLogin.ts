import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoginApi } from "../../api/api-hooks/useAuthApi";
import { customToast } from "../../toast-config/customToast";
import { setIsLoggedIn, setUser } from "../../store/userSlice";
import { InputType } from "../../components/BasicComponents/Input";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LoginResponse } from "./types.login";

const useLogin = ()=>{
    // Form state with initial values
      const [formState, setFormState] = useState({
        uid: '',
        password: '',
      });

      const {lang} = useParams();
      const dispatch = useDispatch()
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const redirectUrl = searchParams.get('redirectUrl') || '/';
      
      const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);
      
      const [errors, setErrors] = useState<Record<string, string>>({});
      const { data:loginData, mutate: login,isPending, isError, error, isSuccess } = useLoginApi();
    
      useEffect(() => {
    if (isSuccess && loginData?.data?.response) {
      const userData = loginData.data.response as LoginResponse;
      
      customToast.success("Logged in successfully");
      dispatch(setUser(userData));
      
      console.log("Login successful, user data:", userData);
      
      const preferredLang = lang || localStorage.getItem("lang") || "en";
      
      // Check profile completion status
      if (!userData?.isProfileComplete) {
        console.log("Profile incomplete, redirecting to complete-profile");
        navigate(`/${preferredLang}/complete-profile`, { replace: true });
      } else if (!userData?.isVerified) {
        console.log("Profile complete but not verified, redirecting to verification-pending");
        navigate(`/${preferredLang}/verification-pending`, { replace: true });
      } else {
        console.log("Profile complete and verified, setting logged in and redirecting");
        dispatch(setIsLoggedIn(true));
        const finalRedirectUrl = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
        navigate(`/${preferredLang}${finalRedirectUrl}`, { replace: true });
      }
    }
  }, [isSuccess, loginData, dispatch, lang, navigate, redirectUrl]);
    
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
          const isEmail = formState.uid.includes('@');
          // setIsLoading(true);
          if(isEmail){
            login({email:formState.uid,password:formState.password})
          }else{
            login({phoneNumber:formState.uid,password:formState.password})
          }
        }
      }
      // Handle social login
      const handleSocialLogin = (provider: 'google' | 'facebook' | 'linkedin') => {
        // Implement social login logic here
      };

      const handleSignupClick = () => {
        navigate(`/${lang}/signup` , {replace:true});
      };

      return{
        formState,
        setFormState,
        errors,
        setErrors,
        inputFields,
        handleChange,
        handleLogin,
        handleSignupClick,
        handleSocialLogin,
        isPending,
        isError,
        error,
        isSuccess,
        isLoggedIn
      }
}


export default useLogin;