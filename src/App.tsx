import { ReactElement, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, Navigate } from "react-router-dom"
import { useVerifyTokensApi } from "./api/api-hooks/useAuthApi"
import { setLanguage } from "./store/languageSlice"
import { setIsLoggedIn } from "./store/userSlice"
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

// Main app wrapper to handle authentication state
function AppContent() {
  const { lang } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const isLoggedIn = useSelector((state:any) => state.user.isLoggedIn);
  
  // Reference to track initial page load
  const isInitialMount = useRef(true);
  
  // Setup API verification with correct parameters
  const {
    isLoading: isVerifying,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
    error: verifyError
  } = useVerifyTokensApi(isInitialMount.current);
  
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
      dispatch(setIsLoggedIn(true));
    } else if (isVerifyError) {
      // Only show toast if we had previously been logged in
      if (isLoggedIn && !isInitialMount.current) {
        // customToast.error("Session expired, please login again");
      }
      dispatch(setIsLoggedIn(false));
    }
    
    // Update initial mount reference after first verification
    if (isInitialMount.current && (isVerifySuccess || isVerifyError)) {
      isInitialMount.current = false;
    }
  }, [isVerifySuccess, isVerifyError, dispatch, isLoggedIn]);

  // Show loading screen only on initial render
  if (isVerifying) {
    console.log("Verifying tokens...");
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <img src="/logo.png" alt="Loading..." className="h-20" />
      </div>
    );
  }

  // Handle invalid language in URL
  if (lang && !availableLanguages.includes(lang)) {
    const preferredLang = getCurrentLanguage();
    console.log("Preferred Language path name: ", location.pathname)
    
    const currentPath = location.pathname.split('/').slice(3).join('/');
    return <Navigate to={`/${preferredLang}/${currentPath}`} replace />;
  }

  return (
    <Routes>
      {/* Public routes */}
      {!isLoggedIn && publicRoutes.map((route, index) => (
        <Route 
          key={index} 
          path={route.path} 
          element={
              <PublicRoutes isVerifying={isVerifying}>
                {route.element}
              </PublicRoutes>
          } 
        />
      ))}

      {/* Private routes - conditionally render based on auth state */}
      {isLoggedIn && privateRoutes.map((route, index) => (
        <Route 
          key={index + publicRoutes.length} 
          path={route.path} 
          element={
            // isLoggedIn ? (
              <PrivateRoutes isVerifying={isVerifying}>
                {route.element}
              </PrivateRoutes>
            // ) : (
            //     <PublicRoutes>
            //       <Login />
            //     </PublicRoutes>
            // )
          } 
        />
      ))}

      {/* Redirect to the same language but with home route */}
      <Route path="*" element={<Navigate to={`/${lang || getCurrentLanguage()}/dashboard`} />} />
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
