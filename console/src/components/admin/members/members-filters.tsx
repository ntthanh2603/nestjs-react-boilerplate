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
          placeholder="Search by name, email..."
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
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value={RoleMember.ADMIN}>Admin</SelectItem>
              <SelectItem value={RoleMember.USER}>User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[calc(50%-0.25rem)] md:w-[180px]">
          <Select
            value={
              searchParams.isBanned === undefined
                ? "all"
                : searchParams.isBanned
                ? "banned"
                : "active"
            }
            onValueChange={(value) => {
              if (value === "all") {
                onFilterChange("isBanned", undefined);
              } else {
                onFilterChange("isBanned", value === "banned");
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto">
          <Button
            variant="outline"
            className="w-full md:w-auto gap-2"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
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
        Refresh
      </Button>
    </div>
  );
}
