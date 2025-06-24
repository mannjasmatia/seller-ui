// types.sidebar.ts

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  isActive?: boolean;
}

export interface SidebarProps {
  items?: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}