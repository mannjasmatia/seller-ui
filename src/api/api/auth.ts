import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"

export const verifyTokens = () =>{
    console.log("Calling VerifyTokens")
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