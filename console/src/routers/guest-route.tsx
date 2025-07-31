import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  return !isAuthenticated ? children : <Navigate to="/" />;
};

export default GuestRoute;
