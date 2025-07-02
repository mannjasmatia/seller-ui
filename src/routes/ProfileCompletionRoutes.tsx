import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { RootState } from "../store/appStore";

/**
 * Route wrapper for users who need to complete their profile
 * This component handles routing for users who are logged in but haven't completed their profile
 */
const ProfileCompletionRoutes = ({ children }: { children: React.ReactNode }) => {
    const userInfo = useSelector((state: RootState) => state.user.userInfo);
    const navigate = useNavigate();
    const location = useLocation();
    const { lang } = useParams();
    
    const preferredLang = lang || localStorage.getItem("lang") || "en";
    
    useEffect(() => {
        if (userInfo) {
            const currentPath = location.pathname;
            const isCompleteProfilePath = currentPath.includes('/complete-profile');
            const isVerificationPendingPath = currentPath.includes('/verification-pending');
            
            // If profile is not complete, redirect to complete-profile
            if (!userInfo.isProfileComplete && !isCompleteProfilePath) {
                console.log("Profile incomplete, redirecting to complete-profile");
                navigate(`/${preferredLang}/complete-profile`, { replace: true });
                return;
            }
            
            // If profile is complete but not verified, redirect to verification-pending
            if (userInfo.isProfileComplete && !userInfo.isVerified && !isVerificationPendingPath) {
                console.log("Profile complete but not verified, redirecting to verification-pending");
                navigate(`/${preferredLang}/verification-pending`, { replace: true });
                return;
            }
            
            // If both profile is complete and verified, redirect to dashboard
            if (userInfo.isProfileComplete && userInfo.isVerified && 
                (isCompleteProfilePath || isVerificationPendingPath)) {
                console.log("Profile complete and verified, redirecting to dashboard");
                navigate(`/${preferredLang}/dashboard`, { replace: true });
                return;
            }
        }
    }, [userInfo, navigate, location.pathname, preferredLang]);

    // Don't render children if we're in the middle of a redirect
    if (userInfo) {
        const currentPath = location.pathname;
        const isCompleteProfilePath = currentPath.includes('/complete-profile');
        const isVerificationPendingPath = currentPath.includes('/verification-pending');
        
        // Show loading while redirecting
        if (!userInfo.isProfileComplete && !isCompleteProfilePath) {
            return (
                <div className="flex justify-center items-center h-screen w-screen bg-white">
                    <img src="/logo.png" alt="Loading..." className="h-20 animate-pulse" />
                </div>
            );
        }
        
        if (userInfo.isProfileComplete && !userInfo.isVerified && !isVerificationPendingPath) {
            return (
                <div className="flex justify-center items-center h-screen w-screen bg-white">
                    <img src="/logo.png" alt="Loading..." className="h-20 animate-pulse" />
                </div>
            );
        }
        
        if (userInfo.isProfileComplete && userInfo.isVerified && 
            (isCompleteProfilePath || isVerificationPendingPath)) {
            return (
                <div className="flex justify-center items-center h-screen w-screen bg-white">
                    <img src="/logo.png" alt="Loading..." className="h-20 animate-pulse" />
                </div>
            );
        }
    }

    return (
        <div className="profile-completion-routes">
            {children}
        </div>
    );
};

export default ProfileCompletionRoutes;