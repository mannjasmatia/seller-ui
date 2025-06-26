import { ReactElement, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, Navigate } from "react-router-dom"
import { useVerifyTokensApi } from "./api/api-hooks/useAuthApi"
import { setLanguage } from "./store/languageSlice"
import { resetAuthState, setIsLoggedIn } from "./store/userSlice"
import Login from "./pages/login/Login"
import PublicRoutes from "./routes/PublicRoutes"
import PrivateRoutes from "./routes/PrivateRoutes"
import Dashboard from "./pages/dashboard/Dashboard"
import Signup from "./pages/signup/Signup"
import ProductsList from "./pages/products/ProductsList"
import AddProduct from "./pages/add-product/AddProduct"
import EditProduct from "./pages/edit-product/EditProduct"

interface Route {
  path: string
  element: ReactElement
}
const availableLanguages = ["en","hi", "fr", "zh-CN", "pa", "es", "ar", "tl", "it", "de", "yue"]

const publicRoutes: Route[] = [
  {path:"/login", element:<Login/>},
  {path:"/signup", element:<Signup/>},
]

const privateRoutes: Route[] = [
  {path:"/dashboard", element:<Dashboard/>},
  { path: "/products", element: <ProductsList /> },
  { path: "/products/add/:step", element: <AddProduct /> },
  { path: "/products/edit/:productId/:step", element: <EditProduct /> },
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
  const isLoggedIn = useSelector((state:any) => state.user.isLoggedIn);
  
  // Setup API verification
  const {
    isLoading: isVerifying,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyTokensApi();
  
  // Set language from URL parameter
  useEffect(() => {
    if (lang && availableLanguages.includes(lang)) {
      dispatch(setLanguage(lang));
      localStorage.setItem("lang", lang);
    }
  }, [lang, dispatch]);
  
  // Handle authentication state changes
  useEffect(() => {

    if (isVerifySuccess) {
      // Successful token verification - user is authenticated
      console.log("Token verification successful, setting user as logged in");
      dispatch(setIsLoggedIn(true));
      // dispatch(setUser(verifyData.data.response));
    } else if (isVerifyError) {
      // Token verification failed - user is not authenticated
      console.log("Token verification failed, setting user as logged out");
      dispatch(resetAuthState());
    }
  }, [isVerifySuccess, isVerifyError]);

  // Show loading screen while verifying tokens on initial load
  if (isVerifying) {
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
      {/* Public routes - only show when user is NOT logged in */}
      {!isLoggedIn && publicRoutes.map((route, index) => (
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

      {/* Private routes - only show when user IS logged in */}
      {isLoggedIn && privateRoutes.map((route, index) => (
        <Route 
          key={index + publicRoutes.length} 
          path={route.path} 
          element={
            <PrivateRoutes>
              {route.element}
            </PrivateRoutes>
          } 
        />
      ))}

      {/* Default redirect based on authentication status */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={`/${currentLang}/${isLoggedIn ? 'dashboard' : 'login'}`} 
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
