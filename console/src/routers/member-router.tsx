import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

const MemberRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  return isAuthenticated ? children : <Navigate to="/sign-in" />;
};

export default MemberRoute;
