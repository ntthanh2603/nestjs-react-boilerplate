import { Home, Users, LifeBuoy, Send, History } from "lucide-react";

export const navigationAdminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard-admin",
      icon: Home,
    },

    {
      title: "User Management",
      url: "/admin/members",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "https://www.facebook.com/ntthanh2603",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "https://www.facebook.com/ntthanh2603",
      icon: Send,
    },
    {
      title: "Operation History",
      url: "/admin/logs",
      icon: History,
    },
  ],
};
