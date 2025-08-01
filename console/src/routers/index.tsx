import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/routers/not-found";
import SignIn from "@/pages/common/sign-in";
import SignUp from "@/pages/common/sign-up";
import LayoutAdmin from "@/components/admin/layouts/layout-admin";
import AdminRoute from "@/routers/admin-router";
import DashboardAdmin from "@/pages/admin/dashboard-admin";
import LogsPage from "@/pages/common/logs";
import MemberRoute from "./member-router";
import LayoutMember from "@/components/member/layouts/layout-member";
import DashboardMember from "@/pages/member/dashboard-member";
import MembersPage from "@/pages/admin/members";

export const router = createBrowserRouter([
  {
    path: "admin",
    element: (
      <AdminRoute>
        <LayoutAdmin />
      </AdminRoute>
    ),
    children: [
      {
        path: "dashboard-admin",
        element: <DashboardAdmin />,
      },
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
    ],
  },

  {
    path: "",
    element: (
      <MemberRoute>
        <LayoutMember />
      </MemberRoute>
    ),
    children: [
      {
        path: "dashboard-member",
        element: <DashboardMember />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
    ],
  },

  {
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "sign-up",
    element: <SignUp />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
