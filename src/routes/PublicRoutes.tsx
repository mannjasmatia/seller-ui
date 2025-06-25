import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";


const PublicRoutes = ({ children,isVerifying }: { children: React.ReactNode, isVerifying : boolean }) => {
  const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const {lang} = useParams();
 
  // If the user is logged in, redirect to the dashboard or home page
  useEffect(() => {
  if (isLoggedIn) {
    // Redirect to the dashboard or home page
    const redirectUrl = `/${lang || localStorage.getItem("lang") || "en"}/`;
    navigate(redirectUrl, { replace: true });
  }
  },[isLoggedIn]);

  return (
    <div className="public-routes">
      {children}
    </div>
  );
}

export default PublicRoutes;