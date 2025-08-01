import { Home, LifeBuoy, Send, History } from "lucide-react";

export const navigationMemberData = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard-member",
      icon: Home,
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
      url: "/logs",
      icon: History,
    },
  ],
};
