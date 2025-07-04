import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/appStore";
import { UserCircle2 } from "lucide-react";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const Header = () => {
    const navigate = useNavigate();
    const { lang } = useParams();
    const userInfo = useSelector((state: RootState) => state.user.userInfo);

    const handleLogoClick = () => {
        navigate(`/${lang}/dashboard`);
    }

    const handleProfileClick = ()=>{
        navigate(`/${lang}/profile`);
    }

    return (
        <header className="w-full flex flex-col sm:flex-row justify-between px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 items-center fixed top-0 z-50 shadow-sm">
            <img 
                onClick={handleLogoClick} 
                src="/logo.png" 
                alt="Canadian Bazaar" 
                className="h-8 sm:h-12 mb-3 sm:mb-0 cursor-pointer hover:opacity-80 transition-opacity" 
            />
            <div className="flex justify-center items-center gap-3 sm:gap-6">
                <div className="w-[1px] sm:w-[2px] h-[4em] bg-gray-600"></div>
                
                <div className="flex items-center">
                    {userInfo?.companyLogo ? (
                        <img 
                            src={`${MEDIA_URL}/${userInfo?.companyLogo}`} 
                            onClick={handleProfileClick}
                            crossOrigin="anonymous"
                            alt="Profile" 
                            className="w-8 sm:w-12 h-8 sm:h-12 rounded-full border-2 border-white cursor-pointer hover:border-gray-200 transition-colors" 
                        />
                    ) : (
                        <UserCircle2 onClick={handleProfileClick} className="w-8 sm:w-12 h-8 sm:h-12 text-white cursor-pointer hover:text-gray-200 transition-colors" />
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;