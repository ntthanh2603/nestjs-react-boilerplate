import { Home, Users, LifeBuoy, Send, History } from "lucide-react";

export const navigationAdminData = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/admin/dashboard-admin",
      icon: Home,
    },
    // {
    //   title: "Quản lý thành viên",
    //   url: "#",
    //   icon: Users,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Danh sách thành viên",
    //       url: "/admin/members",
    //     },
    //   ],
    // },
    {
      title: "Quản lý thành viên",
      url: "/admin/members",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Hỗ trợ",
      url: "https://www.facebook.com/ntthanh2603",
      icon: LifeBuoy,
    },
    {
      title: "Phản hồi",
      url: "https://www.facebook.com/ntthanh2603",
      icon: Send,
    },
    {
      title: "Lịch sử thao tác",
      url: "/admin/logs",
      icon: History,
    },
  ],
};
