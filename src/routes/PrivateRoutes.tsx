import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { RootState } from "../store/appStore";

const PrivateRoutes = ({ children }: { children: React.ReactNode }) => {
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    const userInfo = useSelector((state: RootState) => state.user.userInfo);
    const navigate = useNavigate();
    const location = useLocation();
    const { lang } = useParams();
    
    const preferredLang = lang || localStorage.getItem("lang") || "en";
    
    // Redirect if user is not properly authenticated or verified
    useEffect(() => {
        if (!userInfo) {
            console.log("No user info, redirecting to login");
            const currentPath = location.pathname.split('/').slice(2).join('/');
            const redirectParam = currentPath ? `?redirectUrl=/${currentPath}` : '';
            navigate(`/${preferredLang}/login${redirectParam}`, { replace: true });
            return;
        }

        if (!userInfo.isProfileComplete) {
            console.log("Profile incomplete, redirecting to complete-profile");
            navigate(`/${preferredLang}/complete-profile`, { replace: true });
            return;
        }

        if (!userInfo.isVerified) {
            console.log("Profile not verified, redirecting to verification-pending");
            navigate(`/${preferredLang}/verification-pending`, { replace: true });
            return;
        }

        if (!isLoggedIn) {
            console.log("User not logged in, redirecting to login");
            const currentPath = location.pathname.split('/').slice(2).join('/');
            const redirectParam = currentPath ? `?redirectUrl=/${currentPath}` : '';
            navigate(`/${preferredLang}/login${redirectParam}`, { replace: true });
            return;
        }
    }, [userInfo, isLoggedIn, navigate, location.pathname, preferredLang]);

    // Handle sidebar navigation
    const handleSidebarItemClick = (item: any) => {
        const routeMap: { [key: string]: string } = {
            'dashboard': `/${preferredLang}/dashboard`,
            'inbox': `/${preferredLang}/inbox`,
            'inquiry': `/${preferredLang}/inquiry`,
            'products': `/${preferredLang}/products`,
            'orders': `/${preferredLang}/orders`,
        };
        
        if (routeMap[item.id]) {
            navigate(routeMap[item.id]);
        }
    };

    // Don't render anything if user doesn't meet requirements (will redirect)
    if (!userInfo || !userInfo.isProfileComplete || !userInfo.isVerified || !isLoggedIn) {
        return null;
    }

    // If the user is fully authenticated and verified, render the layout
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Fixed Header */}
            <Header />
            
            {/* Main Layout with Fixed Sidebar and Scrollable Content */}
            <div className="flex flex-1 pt-20"> {/* pt-20 accounts for header height */}
                {/* Fixed Sidebar */}
                <Sidebar onItemClick={handleSidebarItemClick} />
                
                {/* Scrollable Main Content Area */}
                <main className="flex-1 h-[90dvh] bg-white overflow-y-auto lg:pl-16 transition-all duration-300 ease-in-out">
                    <div className="p-1 sm:p-2 lg:p-3">
                        <div className="p-6 bg-gray-50 rounded-2xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PrivateRoutes;