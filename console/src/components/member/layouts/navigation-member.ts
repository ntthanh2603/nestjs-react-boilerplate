import { Home, LifeBuoy, Send, History } from "lucide-react";

export const navigationMemberData = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/dashboard-member",
      icon: Home,
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
      url: "/logs",
      icon: History,
    },
  ],
};
