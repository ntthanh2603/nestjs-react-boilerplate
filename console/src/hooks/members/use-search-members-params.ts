import { useState, useEffect } from "react";
import { z } from "zod";
import { RoleMember } from "@/types/enums/enum";

// Search params schema
const searchMembersSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(10),
  search: z.string().optional(),
  roleMember: z.nativeEnum(RoleMember).optional(),
  isBanned: z.string().optional(),
});

export type SearchMembersParams = z.infer<typeof searchMembersSchema>;

export const useSearchMembersParams = () => {
  const [searchParams, setSearchParamsState] = useState<SearchMembersParams>(
    () => {
      const urlParams = new URLSearchParams(window.location.search);

      return searchMembersSchema.parse({
        page: Number(urlParams.get("page")) || 1,
        limit: Number(urlParams.get("limit")) || 10,
        search: urlParams.get("search") || undefined,
        roleMember: (urlParams.get("roleMember") as RoleMember) || undefined,
        isBanned: urlParams.get("isBanned") || undefined,
      });
    }
  );

  const setSearchParams = (newParams: Partial<SearchMembersParams>) => {
    const updatedParams = { ...searchParams, ...newParams };
    setSearchParamsState(updatedParams);

    // Update URL
    const urlParams = new URLSearchParams();
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        urlParams.set(key, String(value));
      }
    });

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const newParams = searchMembersSchema.parse({
        page: Number(urlParams.get("page")) || 1,
        limit: Number(urlParams.get("limit")) || 10,
        search: urlParams.get("search") || undefined,
        roleMember: (urlParams.get("roleMember") as RoleMember) || undefined,
        isBanned: urlParams.get("isBanned") || undefined,
      });
      setSearchParamsState(newParams);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [searchParams, setSearchParams] as const;
};
