import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

const PrivateRoutes = ({ children }: { children: React.ReactNode }) => {
    console.log("PrivateRoutes rendered");
    const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);
    const navigate = useNavigate();
    const location = useLocation();
    const { lang } = useParams();
    const currentPath = location.pathname.split('/').slice(3).join('/');
    const preferredLang = localStorage.getItem("lang") || lang || "en";
    
    // If the user is not logged in, redirect to the login page
    useEffect(() => {
        if (!isLoggedIn) {
            console.log("User is not logged in, redirecting to login page");
            navigate(`/${preferredLang}/login?redirect=${currentPath}`, { replace: true });
        }
    }, [isLoggedIn]);

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
                <main className="flex-1 h-[90dvh] bg-white lg:ml-64 xl:ml-72 overflow-y-auto">
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