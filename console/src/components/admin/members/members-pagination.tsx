import { Button } from "@/components/ui/button";
import type { MembersResponse } from "@/hooks/members/use-members";
import type { SearchMembersParams } from "@/hooks/members/use-search-members-params";

interface MembersPaginationProps {
  data?: MembersResponse;
  searchParams: SearchMembersParams;
  onPagination: (page: number) => void;
}

export function MembersPagination({
  data,
  searchParams,
  onPagination,
}: MembersPaginationProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Hiển thị{" "}
        <span className="font-medium">
          {(searchParams.page - 1) * searchParams.limit + 1}
        </span>{" "}
        đến{" "}
        <span className="font-medium">
          {Math.min(searchParams.page * searchParams.limit, data?.total || 0)}
        </span>{" "}
        trong tổng số <span className="font-medium">{data?.total || 0}</span>{" "}
        thành viên
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPagination(searchParams.page - 1)}
          disabled={searchParams.page <= 1}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPagination(searchParams.page + 1)}
          disabled={
            !data ||
            searchParams.page * searchParams.limit >= (data?.total || 0)
          }
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
}
