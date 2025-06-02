import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setIsAuthModalOpen, setIsLoggedIn } from "../../store/userSlice"
import Login from "./Login/Login"
import Signup from "./Signup/Signup"
import VerifyOtpModal from "./VerifyOtp/VerifyOtpModal"
import { RootState } from "../../store/appStore"
import { customToast } from "../../toast-config/customToast"

type AuthModal = "login" | "signup" | "forgotPassword" | "verifyOtp" 

const AuthModal = ()=>{
    // const isAuthModalOpen = useSelector((state:RootState)=>state.user.isAuthModalOpen)
    const isAuthModalOpen = true;
    const language = useSelector((state: RootState) => state.language?.value)['authModal'];
    const dispatch = useDispatch()
    const [selectedModal,setSelectedModal]= useState<AuthModal>('login')
    
    const handleClose = ()=>{
        setSelectedModal('login')
        dispatch(setIsAuthModalOpen(false))
    }
    
    const handleSuccessfullLogin=()=>{
        dispatch(setIsLoggedIn(true))
        handleClose()
    }

    const handleNavigateToSignupClick = ()=>{
        setSelectedModal("signup")
    }

    const handleNavigateToLoginClick = ()=>{
        setSelectedModal("login")
    }

    const handleSuccessfullSignupClick =()=>{
        customToast.success(language.signupSuccess)
        setSelectedModal("login")
    }

    const handleForgotPasswordClick =()=>{
        setSelectedModal("verifyOtp")
    }

    if(!isAuthModalOpen) return null;

    switch(selectedModal){
        case "login":
            return (
            <Login 
                open={isAuthModalOpen}
                onClose={handleClose}
                handleSuccessfullLogin={handleSuccessfullLogin}
                handleSignupClick={handleNavigateToSignupClick}
            />
            )
        case "signup":
            return(
                <Signup
                    open={isAuthModalOpen}
                    onClose={handleClose}
                    handleLoginClick={handleNavigateToLoginClick}
                    handleSuccesfullSignup={handleSuccessfullSignupClick}
                />
            )
        default: return null
    }
}

export default AuthModal;