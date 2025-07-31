import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { RoleMember } from "@/types/enums/enum";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  return isAuthenticated &&
    authService.getCurrentMember()?.roleMember === RoleMember.ADMIN ? (
    children
  ) : (
    <Navigate to="/sign-in" />
  );
};

export default AdminRoute;
