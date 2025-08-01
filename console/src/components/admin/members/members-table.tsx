import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";
import { RoleMember } from "@/types/enums/enum";
import type { MembersResponse } from "@/hooks/members/use-members";
import type { SearchMembersParams } from "@/hooks/members/use-search-members-params";
import type { Member } from "@/types/interfaces/member.interface";

interface MembersTableProps {
  data?: MembersResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchParams: SearchMembersParams;
  onToggleBan: (memberId: string, isBanned: boolean) => void;
  onUpdateRole: (memberId: string, newRole: RoleMember) => void;
}

export function MembersTable({
  data,
  isLoading,
  isError,
  error,
  onToggleBan,
  onUpdateRole,
}: MembersTableProps) {
  // Table columns definition
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={member.image?.url}
                alt={member.fullName}
                className="rounded-full"
              />
              <AvatarFallback className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
                {getInitials(member.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{member.fullName}</span>
              <span className="text-muted-foreground text-sm">
                {member.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        const member = row.original;
        return <div>{member.phoneNumber || "-"}</div>;
      },
    },
    {
      accessorKey: "roleMember",
      header: "Role",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="capitalize">
            {member.roleMember === RoleMember.ADMIN ? "Admin" : "User"}
          </div>
        );
      },
    },
    {
      accessorKey: "isBanned",
      header: "Status",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center">
            <div
              className={`mr-2 h-2 w-2 rounded-full ${
                member.isBanned ? "bg-destructive" : "bg-success"
              }`}
            />
            <span>{member.isBanned ? "Banned" : "Active"}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onToggleBan(member.id, !member.isBanned)}
              >
                {member.isBanned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
              {member.roleMember !== RoleMember.ADMIN && (
                <DropdownMenuItem
                  onClick={() =>
                    onUpdateRole(
                      member.id,
                      member.roleMember === RoleMember.ADMIN
                        ? RoleMember.USER
                        : RoleMember.ADMIN
                    )
                  }
                >
                  {member.roleMember === RoleMember.ADMIN
                    ? "Set as User"
                    : "Set as Admin"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / data.limit) : 1,
    state: {
      pagination: {
        pageIndex: data ? data.page - 1 : 0,
        pageSize: data?.limit || 10,
      },
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-destructive"
              >
                Error loading members: {error?.message}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
