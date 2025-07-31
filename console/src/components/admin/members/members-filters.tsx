import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCw, Loader2 } from "lucide-react";
import { RoleMember } from "@/types/enums/enum";
import type { SearchMembersParams } from "@/hooks/members/use-search-members-params";

interface MembersFiltersProps {
  searchParams: SearchMembersParams;
  onFilterChange: (key: string, value: any) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
}

export function MembersFilters({
  searchParams,
  onFilterChange,
  onRefresh,
  isLoading,
  isRefreshing,
}: MembersFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm theo tên, email..."
          className="w-full pl-8"
          value={searchParams.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <div className="w-[calc(50%-0.25rem)] md:w-[180px]">
          <Select
            value={searchParams.roleMember || "all"}
            onValueChange={(value) =>
              onFilterChange("roleMember", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value={RoleMember.ADMIN}>Quản trị viên</SelectItem>
              <SelectItem value={RoleMember.USER}>Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[calc(50%-0.25rem)] md:w-[180px]">
          <Select
            value={searchParams.isBanned ?? "all"}
            onValueChange={(value) =>
              onFilterChange("isBanned", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="false">Đang hoạt động</SelectItem>
              <SelectItem value="true">Bị cấm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        className="md:ml-auto"
        disabled={isLoading || isRefreshing}
      >
        {isLoading || isRefreshing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RotateCw className="h-4 w-4 mr-2" />
        )}
        Làm mới
      </Button>
    </div>
  );
}
