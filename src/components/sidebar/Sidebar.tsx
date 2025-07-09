import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  Bell, 
  CheckCircle, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import { useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number | string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}

const defaultItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    // isActive: true
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    // badge: 3
  },
  {
    id: 'inquiry',
    label: 'Inquiry',
    icon: FileText,
    // badge: 12
  },
  {
    id: 'products',
    label: 'Products',
    icon: Bell
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: CheckCircle,
    // badge: 5
  },
  {
    id: 'global-quote',
    label: 'Global Quote',
    icon: Inbox,
    // badge: "99+"
  }
];

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const Sidebar: React.FC<SidebarProps> = ({ 
  items = defaultItems, 
  onItemClick,
  className = ''
}) => {

  const location = useLocation();
  const currentLocation = location.pathname.split('/').slice(-1)[0]

  const [activeItem, setActiveItem] = useState<string>(
    items.find(item => item.isActive )?.id || items[0]?.id || ''
  );

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  useEffect(()=>{
    setActiveItem(currentLocation)
  },[currentLocation])

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    setIsHovered(false)
    setIsMobileOpen(false);
    onItemClick?.(item);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // On desktop: collapsed by default, expand on hover
  // On mobile: normal full-width behavior
  const shouldShowExpanded = isHovered || isMobileOpen;
  const sidebarWidth = shouldShowExpanded ? 'w-64 lg:w-64 xl:w-72' : 'w-64 lg:w-16';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-cb-red text-white rounded-lg shadow-lg hover:bg-cb-red/90 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-transparent bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed positioning */}
      <div 
        className={`
          fixed top-0 left-0 z-40 h-screen pt-20
          ${sidebarWidth}
          bg-white
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full flex flex-col shadow-2xl rounded-r-2xl overflow-hidden">
          {/* Navigation Items */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-4">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`
                        w-full flex items-center px-4 py-3 rounded-lg
                        text-left transition-all duration-200 ease-in-out
                        group hover:shadow-sm relative
                        ${isActive 
                          ? 'bg-cb-red text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-cb-red'
                        }
                        ${!shouldShowExpanded ? 'justify-center' : 'justify-between'}
                      `}
                      title={!shouldShowExpanded ? item.label : undefined}
                    >
                      <div className={`flex items-center ${shouldShowExpanded ? 'space-x-3' : ''}`}>
                        <div className="relative">
                          <Icon 
                            size={20} 
                            className={`
                              transition-colors duration-200
                              ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-cb-red'}
                            `}
                          />
                          {/* Badge for collapsed state */}
                          {!shouldShowExpanded && item.badge && (
                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-cb-red text-white min-w-[18px] h-[18px] flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        
                        {shouldShowExpanded && (
                          <span className="font-medium text-sm lg:text-base whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </div>
                      
                      {shouldShowExpanded && (
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <span className={`
                              px-2 py-1 text-xs font-semibold rounded-full
                              ${isActive 
                                ? 'bg-white text-cb-red' 
                                : 'bg-cb-red text-white'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                          
                          <ChevronRight 
                            size={16} 
                            className={`
                              transition-all duration-200
                              ${isActive 
                                ? 'text-white transform rotate-90' 
                                : 'text-gray-400 group-hover:text-cb-red group-hover:translate-x-1'
                              }
                            `}
                          />
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {shouldShowExpanded && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-cb-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {String(userInfo?.companyName)?.toUpperCase().charAt(0) || '-'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userInfo?.companyName ?? "Seller"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userInfo?.email ?? "seller@canadianbazaar.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Footer - Just Avatar */}
          {!shouldShowExpanded && (
            <div className="p-4 border-t border-gray-100 bg-white flex justify-center">
              <div className="w-8 h-8 bg-cb-red rounded-full flex items-center justify-center">
                 <span className="text-white text-sm font-semibold">
                    {String(userInfo?.companyName)?.toUpperCase().charAt(0) || '-'}
                  </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;