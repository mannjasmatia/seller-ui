
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
  badge?: number;
}

export interface SidebarProps {
  items?: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}