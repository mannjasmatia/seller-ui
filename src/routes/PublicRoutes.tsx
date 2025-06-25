import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const PublicRoutes = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const { lang } = useParams();
 
  // If the user is logged in, redirect to the dashboard
  useEffect(() => {
    if (isLoggedIn) {
      const preferredLang = lang || localStorage.getItem("lang") || "en";
      console.log("User is logged in, redirecting to dashboard");
      navigate(`/${preferredLang}/dashboard`, { replace: true });
    }
  }, [isLoggedIn, navigate, lang]);

  // Don't render anything if user is logged in (will redirect)
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="public-routes">
      {children}
    </div>
  );
}

export default PublicRoutes;