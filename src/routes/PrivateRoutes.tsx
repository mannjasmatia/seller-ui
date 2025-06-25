import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { RootState } from "../store/appStore";

const PrivateRoutes = ({ children }: { children: React.ReactNode }) => {
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    const navigate = useNavigate();
    const location = useLocation();
    const { lang } = useParams();
    
    const preferredLang = lang || localStorage.getItem("lang") || "en";
    
    // If the user is not logged in, redirect to the login page
    useEffect(() => {
        if (!isLoggedIn) {
            console.log("User is not logged in, redirecting to login page");
            const currentPath = location.pathname.split('/').slice(2).join('/');
            const redirectParam = currentPath ? `?redirectUrl=/${currentPath}` : '';
            navigate(`/${preferredLang}/login${redirectParam}`, { replace: true });
        }
    }, [isLoggedIn, navigate, location.pathname, preferredLang]);

    // Handle sidebar navigation
    const handleSidebarItemClick = (item: any) => {
        const routeMap: { [key: string]: string } = {
            'dashboard': `/${preferredLang}/dashboard`,
            'inbox': `/${preferredLang}/inbox`,
            'inquires': `/${preferredLang}/inquires`,
            'products': `/${preferredLang}/products`,
            'accepted-orders': `/${preferredLang}/accepted-orders`,
        };
        
        if (routeMap[item.id]) {
            navigate(routeMap[item.id]);
        }
    };

    // Don't render anything if user is not logged in (will redirect)
    if (!isLoggedIn) {
        return null;
    }

    // If the user is logged in, render the layout
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Fixed Header */}
            <Header />
            
            {/* Main Layout with Fixed Sidebar and Scrollable Content */}
            <div className="flex flex-1 pt-20"> {/* pt-20 accounts for header height */}
                {/* Fixed Sidebar */}
                <Sidebar onItemClick={handleSidebarItemClick} />
                
                {/* Scrollable Main Content Area */}
                <main className="flex-1 h-[90dvh] bg-white overflow-y-auto lg:ml-16 transition-all duration-300 ease-in-out">
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