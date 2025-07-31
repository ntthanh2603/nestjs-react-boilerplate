"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ProfileLayout } from "@/components/common/profile/profile-layout";
import { AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import ThemeModeSwitcher from "@/components/ui/theme-mode-switcher";

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const member = authService.getCurrentMember();

  const onLogout = async () => {
    try {
      await authService.signOut();
      navigate("/sign-in");
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", {
        style: {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
        icon: "❌",
      });
    } finally {
      authService.clearAuthData();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={member?.image?.url || ""}
                  alt={member?.fullName}
                />
                <AvatarFallback>{getInitials(member?.fullName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{member?.fullName}</span>
                <span className="truncate text-xs">{member?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={member?.image?.url || ""}
                    alt={member?.fullName}
                  />
                  <AvatarFallback>
                    {getInitials(member?.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {member?.fullName}
                  </span>
                  <span className="truncate text-xs">{member?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <BadgeCheck />
                Tài khoản
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="px-2 py-1.5 cursor-default ">
                  <ThemeModeSwitcher />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onLogout()}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Profile Modal */}
      {showProfile && member && (
        <ProfileLayout member={member} onClose={() => setShowProfile(false)} />
      )}
    </SidebarMenu>
  );
}
