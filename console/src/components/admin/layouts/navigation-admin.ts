import {
  Home,
  ShoppingCart,
  Users,
  MapPinned,
  LifeBuoy,
  Send,
  History,
  Mails,
} from "lucide-react";

export const navigationAdminData = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/admin/dashboard-admin",
      icon: Home,
    },
    {
      title: "Quản lý cửa hàng",
      url: "#",
      icon: ShoppingCart,
      isActive: true,
      items: [
        {
          title: "Thêm cửa hàng",
          url: "/admin/add-store",
        },
        {
          title: "Danh sách cửa hàng",
          url: "/admin/stores",
        },
        {
          title: "Danh sách chi nhánh",
          url: "/admin/branches",
        },
      ],
    },
    {
      title: "Quản lý thành viên",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Thêm admin",
          url: "/admin/add-admin",
        },
        {
          title: "Thêm chủ cửa hàng",
          url: "/admin/add-owner",
        },
        {
          title: "Danh sách thành viên",
          url: "/admin/members",
        },
      ],
    },
    {
      title: "Quản lý dịch vụ",
      url: "/admin/services",
      icon: MapPinned,
      isActive: true,
    },
    {
      title: "Quản lý phản hồi",
      url: "/admin/feedbacks-manager",
      icon: Mails,
      isActive: true,
    },
  ],
  navSecondary: [
    {
      title: "Hỗ trợ",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Phản hồi",
      url: "/admin/feedbacks",
      icon: Send,
    },
    {
      title: "Lịch sử thao tác",
      url: "/admin/logs",
      icon: History,
    },
  ],
};
