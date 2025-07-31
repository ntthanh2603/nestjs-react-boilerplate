import { useMembers } from "@/hooks/members/use-members";
import { useSearchMembersParams } from "@/hooks/members/use-search-members-params";
import { MembersFilters } from "@/components/admin/members/members-filters";
import { MembersTable } from "@/components/admin/members/members-table";
import { MembersPagination } from "@/components/admin/members/members-pagination";
import { MembersErrorBoundary } from "@/components/admin/members/members-error-boundary";
import type { RoleMember } from "@/types/enums/enum";

function MembersPage() {
  const [searchParams, setSearchParams] = useSearchMembersParams();

  // Use members hook
  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    toggleMemberBan,
    updateMemberRole,
    handleRefresh,
  } = useMembers(searchParams);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setSearchParams({
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  // Handle pagination
  const handlePagination = (page: number) => {
    setSearchParams({
      page,
    });
  };

  // Handle toggle ban
  const handleToggleBan = (memberId: string, isBanned: boolean) => {
    toggleMemberBan({ memberId, isBanned });
  };

  // Handle update role
  const handleUpdateRole = (memberId: string, newRole: RoleMember) => {
    updateMemberRole({ memberId, role: newRole });
  };

  return (
    <div className="pr-3 pl-3 space-y-4">
      {/* Filters */}
      <MembersFilters
        searchParams={searchParams}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isRefreshing={isRefetching}
      />

      {/* Table */}
      <MembersTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        searchParams={searchParams}
        onToggleBan={handleToggleBan}
        onUpdateRole={handleUpdateRole}
      />

      {/* Pagination */}
      <MembersPagination
        data={data}
        searchParams={searchParams}
        onPagination={handlePagination}
      />
    </div>
  );
}

// Main export component with Error Boundary
const MembersPageWithErrorBoundary = () => (
  <MembersErrorBoundary>
    <MembersPage />
  </MembersErrorBoundary>
);

export default MembersPageWithErrorBoundary;
