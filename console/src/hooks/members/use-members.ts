import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/services/apis/axios-client";
import { customToast } from "@/lib/toast";
import { RoleMember } from "@/types/enums/enum";

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleMember: RoleMember;
  isBanned: boolean;
  createdAt: string;
  image?: {
    id: string;
    url: string;
  };
}

export interface MembersResponse {
  data: Member[];
  total: number;
  page: number;
  limit: number;
}

export interface MemberSearchParams {
  page: number;
  limit: number;
  search?: string;
  roleMember?: RoleMember;
  isBanned?: string;
}

// API functions
async function fetchMembers(
  params: MemberSearchParams
): Promise<MembersResponse> {
  const queryParams = {
    ...params,
    isBanned: params.isBanned ? params.isBanned === "true" : undefined,
  };

  const response = await axiosInstance.get("members/search", {
    params: queryParams,
  });

  if (!response.data) {
    throw new Error("Failed to fetch members");
  }

  return response.data;
}

async function toggleMemberBanStatus(memberId: string, isBanned: boolean) {
  const response = await axiosInstance.patch("members/ban", {
    isBanned: !isBanned,
    memberId,
  });
  return response.data;
}

async function updateMemberRole(memberId: string, role: RoleMember) {
  const response = await axiosInstance.patch("members/role", {
    memberId,
    roleMember: role,
  });
  return response.data;
}

export function useMembers(searchParams: MemberSearchParams) {
  const queryClient = useQueryClient();

  // Fetch members query
  const membersQuery = useQuery<MembersResponse>({
    queryKey: ["members", searchParams],
    queryFn: () => fetchMembers(searchParams),
  });

  // Toggle ban status mutation
  const toggleBanMutation = useMutation({
    mutationFn: ({
      memberId,
      isBanned,
    }: {
      memberId: string;
      isBanned: boolean;
    }) => toggleMemberBanStatus(memberId, isBanned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      customToast.success("Cập nhật trạng thái thành viên thành công!");
    },
    onError: () => {
      customToast.error("Cập nhật trạng thái thành viên thất bại");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: RoleMember }) =>
      updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      customToast.success("Cập nhật quyền thành viên thành công!");
    },
    onError: () => {
      customToast.error("Cập nhật quyền thành viên thất bại");
    },
  });

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await membersQuery.refetch();
    } catch (error) {
      customToast.error("Lỗi khi tải lại dữ liệu");
    }
  };

  return {
    // Query data
    data: membersQuery.data,
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    isRefetching: membersQuery.isRefetching,
    refetch: membersQuery.refetch,

    // Actions
    toggleMemberBan: toggleBanMutation.mutate,
    updateMemberRole: updateRoleMutation.mutate,
    handleRefresh,

    // Loading states
    isTogglingBan: toggleBanMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
