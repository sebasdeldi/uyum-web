export const statusColor: Record<string, string> = {
  PENDING: "processing",
  COMPLETED: "success",
  FAILED: "error",
};

export const paymentStatusColor: Record<string, string> = {
  INITIATED: "processing",
  PENDING: "processing",
  APPROVED: "success",
  DECLINED: "error",
  VOIDED: "warning",
  ERROR: "error",
};
