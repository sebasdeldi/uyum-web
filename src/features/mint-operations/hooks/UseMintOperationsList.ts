import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMintOperations } from "../../../clients/core";

const PAGE_SIZE = 20;

export function useMintOperationsList() {
  const [page, setPage] = useState(1);

  const mintOperationsQuery = useQuery({
    queryKey: ["mint-operations", { page, limit: PAGE_SIZE }],
    queryFn: () => getMintOperations({ page, limit: PAGE_SIZE }),
  });

  return {
    mintOperations: mintOperationsQuery.data?.data ?? [],
    total: mintOperationsQuery.data?.total ?? 0,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    isLoading: mintOperationsQuery.isPending,
  };
}
