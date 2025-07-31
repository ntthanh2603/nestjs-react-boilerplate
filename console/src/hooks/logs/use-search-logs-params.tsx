import { useState, useCallback } from "react";
import { z } from "zod";

// Search params schema
const searchLogsSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(10),
  search: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILURE"]).optional(),
  date: z.string().optional(),
  sortBy: z.string().catch("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).catch("DESC"),
});

export type SearchLogsParams = z.infer<typeof searchLogsSchema>;

const parseUrlParams = (): SearchLogsParams => {
  const urlParams = new URLSearchParams(window.location.search);
  return searchLogsSchema.parse({
    page: Number(urlParams.get("page")) || 1,
    limit: Number(urlParams.get("limit")) || 10,
    search: urlParams.get("search") || undefined,
    status: (urlParams.get("status") as "SUCCESS" | "FAILURE") || undefined,
    date: urlParams.get("date") || undefined,
    sortBy: urlParams.get("sortBy") || "createdAt",
    sortOrder: (urlParams.get("sortOrder") as "ASC" | "DESC") || "DESC",
  });
};

export const useSearchLogsParams = () => {
  const [searchParams, setSearchParamsState] =
    useState<SearchLogsParams>(parseUrlParams);

  const setSearchParams = useCallback(
    (newParams: Partial<SearchLogsParams>) => {
      setSearchParamsState((currentParams) => {
        const updatedParams = { ...currentParams, ...newParams };

        // Update URL without causing re-render
        const urlParams = new URLSearchParams();
        Object.entries(updatedParams).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            urlParams.set(key, String(value));
          }
        });

        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, "", newUrl);

        return updatedParams;
      });
    },
    []
  );

  const updateFromUrl = useCallback(() => {
    setSearchParamsState(parseUrlParams());
  }, []);

  return [searchParams, setSearchParams, updateFromUrl] as const;
};
