import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { RoleMember } from "@/types/enums/enum";
import { Link } from "react-router-dom";

const NotFound = () => {
  const member = authService.getCurrentMember();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-center">404</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Trang bạn tìm kiếm không tồn tại.
        </p>
        <div className="flex justify-center">
          <Button>
            <Link to={member?.roleMember === RoleMember.ADMIN ? "/admin" : "/"}>
              Trở về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
