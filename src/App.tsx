import { ReactElement, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, Navigate } from "react-router-dom"
import { useVerifyTokensApi } from "./api/api-hooks/useAuthApi"
import { setLanguage } from "./store/languageSlice"
import { resetAuthState, setIsLoggedIn, setUser } from "./store/userSlice"
import Login from "./pages/login/Login"
import PublicRoutes from "./routes/PublicRoutes"
import PrivateRoutes from "./routes/PrivateRoutes"
import ProfileCompletionRoutes from "./routes/ProfileCompletionRoutes"
import Dashboard from "./pages/dashboard/Dashboard"
import Signup from "./pages/signup/Signup"
import CompleteProfile from "./pages/complete-profile/CompleteProfile"
import ProductsList from "./pages/products/ProductsList"
import AddProduct from "./pages/add-product/AddProduct"
import EditProduct from "./pages/edit-product/EditProduct"
import { RootState } from "./store/appStore"
import VerificationPending from "./pages/ verification-pending/VerificationPending"
import { LoginResponse } from "./pages/login/types.login"
import Profile from "./pages/profile/Profile"
import Inquiry from "./pages/inquires/Inquiry"
import Inbox from "./pages/inbox/Inbox"
import Orders from "./pages/orders/Orders"

interface Route {
  path: string
  element: ReactElement
}

const availableLanguages = ["en", "hi", "fr", "zh-CN", "pa", "es", "ar", "tl", "it", "de", "yue"]

const publicRoutes: Route[] = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]

const profileCompletionRoutes: Route[] = [
  { path: "/complete-profile", element: <CompleteProfile /> },
  { path: "/verification-pending", element: <VerificationPending /> },
]

const privateRoutes: Route[] = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/products", element: <ProductsList /> },
  { path: "/products/add/:step", element: <AddProduct /> },
  { path: "/products/edit/:productId/:step", element: <EditProduct /> },
  { path: "/profile", element: <Profile /> },
  { path: "/inquiry", element: <Inquiry /> },
  { path: "/inbox", element: <Inbox /> },
  { path: "/orders", element: <Orders /> },
]

// Helper to get the current language from localStorage or default to "en"
function getCurrentLanguage() {
  const storedLang = localStorage.getItem("lang");
  return storedLang && availableLanguages.includes(storedLang) ? storedLang : "en";
}

// Loading component
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen w-screen bg-white">
    <img src="/logo.png" alt="Loading..." className="h-20 animate-pulse" />
  </div>
);

// Main app wrapper to handle authentication state
function AppContent() {
  const { lang } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  
  // Setup API verification
  const {
    data: verifyData,
    isLoading: isVerifying,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
  } = useVerifyTokensApi();
  
  // Set language from URL parameter
  useEffect(() => {
    if (lang && availableLanguages.includes(lang)) {
      dispatch(setLanguage(lang));
      localStorage.setItem("lang", lang);
    }
  }, [lang, dispatch]);

  // Storing the last page rendered in localstorage to help redirect back to it again and also if user revisits the website
  // useEffect(()=>{
  //   const lastVisitedPath = location.pathname.split('/').slice(-1)[0]
  //   //i am not using last visited path anywhere
  //   localStorage.setItem("lastVisitedPath",lastVisitedPath)
  // },[location.pathname])
  
  // Handle authentication state changes
  useEffect(() => {
    if (isVerifySuccess && verifyData?.data?.response) {
      const userData = verifyData.data.response?.user as LoginResponse;
      console.log("Token verification successful, user data:", userData);

      if(userInfo !== userData){
        console.log("User info changed , syncing ... ")
        dispatch(setUser(userData));
      }
      
      // Only set isLoggedIn to true if profile is complete AND verified
      if (userData.isProfileComplete && userData.isVerified) {
        dispatch(setIsLoggedIn(true));
      }
    } else if (isVerifyError) {
      console.log("Token verification failed, setting user as logged out");
      dispatch(resetAuthState());
    }
  }, [isVerifySuccess, isVerifyError, verifyData, dispatch]);

  // Show loading screen while verifying tokens on initial load
  if (isVerifying || (!isVerifying && isLoggedIn && !userInfo)) {
    console.log("Verifying tokens...");
    return <LoadingScreen />;
  }

  // Handle invalid language in URL
  if (lang && !availableLanguages.includes(lang)) {
    const preferredLang = getCurrentLanguage();
    const currentPath = location.pathname.split('/').slice(2).join('/');
    return <Navigate to={`/${preferredLang}/${currentPath}`} replace />;
  }

  // Ensure we have a valid language
  const currentLang = lang || getCurrentLanguage();

  return (
    <Routes>
      {/* Public routes - show when user is NOT logged in and has no userInfo */}
      {!userInfo && publicRoutes.map((route, index) => (
        <Route 
          key={index} 
          path={route.path} 
          element={
            <PublicRoutes>
              {route.element}
            </PublicRoutes>
          } 
        />
      ))}

      {/* Profile completion routes - show when user has userInfo but profile is incomplete or unverified */}
      {userInfo && (!userInfo.isProfileComplete || !userInfo.isVerified) && 
        profileCompletionRoutes.map((route, index) => (
          <Route 
            key={index + publicRoutes.length} 
            path={route.path} 
            element={
              <ProfileCompletionRoutes>
                {route.element}
              </ProfileCompletionRoutes>
            } 
          />
        ))
      }

      {/* Private routes - show when user is fully logged in (profile complete AND verified) */}
      {isLoggedIn && userInfo?.isProfileComplete && userInfo?.isVerified && 
        privateRoutes.map((route, index) => (
          <Route 
            key={index + publicRoutes.length + profileCompletionRoutes.length} 
            path={route.path} 
            element={
              <PrivateRoutes>
                {route.element}
              </PrivateRoutes>
            } 
          />
        ))
      }

      {/* Default redirect based on user state */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              !userInfo 
                ? `/${currentLang}/login`
                : !userInfo.isProfileComplete 
                  ? `/${currentLang}/complete-profile`
                  : !userInfo.isVerified 
                    ? `/${currentLang}/verification-pending`
                    : `/${currentLang}/${"dashboard"}`
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to the preferred language */}
        <Route path="/" element={<Navigate to={`/${getCurrentLanguage()}/`} />} />
        
        {/* Main language routes */}
        <Route path="/:lang/*" element={<AppContent />} />
        
        {/* Capture all other routes and redirect to preferred language */}
        <Route path="*" element={<Navigate to={`/${getCurrentLanguage()}/`} />} />
      </Routes>
    </Router>
  );
}

export default App