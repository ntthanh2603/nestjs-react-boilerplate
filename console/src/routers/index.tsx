import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/routers/not-found";
import SignIn from "@/pages/common/sign-in";
import LayoutAdmin from "@/components/admin/layouts/layout-admin";
import AdminRoute from "@/routers/admin-router";
import AddAdminPage from "@/pages/admin/add-admin";
import DashboardAdmin from "@/pages/admin/dashboard-admin";
import AddOwnerPage from "@/pages/admin/add-owner";
import MembersPage from "@/pages/admin/members";
import LogsPage from "@/pages/common/logs";
import GuestRoute from "@/routers/guest-route";

export const router = createBrowserRouter([
  {
    path: "",
    element: (
      <GuestRoute>
        <div></div>
      </GuestRoute>
    ),
    children: [
      {
        path: "logs",
        element: <LogsPage />,
      },
    ],
  },

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
        path: "add-admin",
        element: <AddAdminPage />,
      },
      {
        path: "add-owner",
        element: <AddOwnerPage />,
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
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
