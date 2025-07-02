import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../store/appStore";

const PublicRoutes = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const { lang } = useParams();
 
  // If the user has userInfo (authenticated), redirect based on profile status
  useEffect(() => {
    if (userInfo) {
      const preferredLang = lang || localStorage.getItem("lang") || "en";
      
      if (!userInfo.isProfileComplete) {
        console.log("User authenticated but profile incomplete, redirecting to complete-profile");
        navigate(`/${preferredLang}/complete-profile`, { replace: true });
      } else if (!userInfo.isVerified) {
        console.log("User profile complete but not verified, redirecting to verification-pending");
        navigate(`/${preferredLang}/verification-pending`, { replace: true });
      } else if (isLoggedIn) {
        console.log("User is fully logged in, redirecting to dashboard");
        navigate(`/${preferredLang}/dashboard`, { replace: true });
      }
    }
  }, [userInfo, isLoggedIn, navigate, lang]);

  // Don't render anything if user has userInfo (will redirect)
  if (userInfo) {
    return null;
  }

  return (
    <div className="public-routes">
      {children}
    </div>
  );
}

export default PublicRoutes;