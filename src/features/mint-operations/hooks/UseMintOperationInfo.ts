import { useQuery } from "@tanstack/react-query";
import { getMintOperation } from "../../../clients/core";

export function useMintOperationInfo(id: string) {
  const mintOperationQuery = useQuery({
    queryKey: ["mint-operation", id],
    queryFn: () => getMintOperation(id),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 1000 : false,
  });

  return {
    mintOperation: mintOperationQuery.data,
    isLoading: mintOperationQuery.isPending,
  };
}
