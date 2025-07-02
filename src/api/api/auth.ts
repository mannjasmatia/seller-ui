import { useRef } from "react"
import { SignupStep1Data, SignupStep2Data } from "../../pages/signup/types.signup"
import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"


export const verifyTokens = () =>{
    // const verificationCount = useRef(0);
    // verificationCount.current+=1;
    // console.log("Calling VerifyTokens, count : ", verificationCount.current)
    return ApiService({
        method: 'GET',
        endpoint:apiPaths.auth.verifyTokens,
    })
}

export const login = (data:any) =>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.login,
        data
    })
}

export const verifyOtp = (phoneNumber:string)=>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.verifyOtp,
        data:{phoneNumber}
    })
}

export const signup = (data:any)=>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.signup,
        data
    })
}

export const logout = ()=>{
    return ApiService({
        method: 'DELETE',
        endpoint:apiPaths.auth.logout,
    })
}

export const sendEmailVerificationLink = (email:string)=>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.emailVerificationLink,
        data:{
            email
        }
    })
}

export const verifyEmail = (token:string)=>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.verifyEmail,
        data:{
            token
        }
    })
}

export const changePassword = (data: {oldPassword:string, newPassword:string, confirmPassword:string})=>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.changePassword,
        data
    })
}

// New signup flow APIs
export const sendEmailVerification = (data: SignupStep1Data) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.auth.sendEmailVerification,
        data
    })
}

export const verifyEmailOtp = (data: { sessionToken: string, otp: string }) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.auth.verifyEmailOtp,
        data
    })
}

export const sendPhoneVerification = (data: SignupStep2Data & { sessionToken: string }) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.auth.sendPhoneVerification,
        data
    })
}

export const verifyPhoneOtp = (data: { sessionToken: string, otp: string }) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.auth.verifyPhoneOtp,
        data
    })
}