import type { Sidebar } from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: {
    navMain: NavItem[];
    navSecondary: NavItem[];
  };
}
