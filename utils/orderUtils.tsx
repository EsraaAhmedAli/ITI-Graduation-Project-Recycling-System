import api from "@/lib/axios";

export const normalizeStatus = (status: string): string => {
  const normalized = status.toLowerCase().trim();

  switch (normalized) {
    case "pending":
      return STATUS.PENDING;
    case "assigntocourier":
    case "assignedtocourier":
    case "assigned":
      return STATUS.ASSIGN_TO_COURIER;
    case "collected":
      return STATUS.COLLECTED;
    case "completed":
    case "complete":
      return STATUS.COMPLETED;
    case "cancelled":
    case "canceled":
      return STATUS.CANCELLED;
    default:
      return status;
  }
};

export const getAllowedStatusTransitions = (
  userRole: string
): Record<string, string[]> => {
  if (userRole === "buyer") {
    return {
      [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
      [STATUS.ASSIGN_TO_COURIER]: [STATUS.COMPLETED, STATUS.CANCELLED],
      [STATUS.COLLECTED]: [STATUS.COMPLETED],
      [STATUS.COMPLETED]: [],
      [STATUS.CANCELLED]: [],
    };
  } else {
    return {
      [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
      [STATUS.ASSIGN_TO_COURIER]: [STATUS.CANCELLED],
      [STATUS.COLLECTED]: [STATUS.COMPLETED],
      [STATUS.COMPLETED]: [],
      [STATUS.CANCELLED]: [],
    };
  }
};

export const fetchOrders = async (
  page: number,
  limit: number,
  userRole?: UserRole,
  locale?: string,
  filters?: Record<string, any>,
  search?: string
) => {
  const params: any = { page, limit };
  if (userRole) params.userRole = userRole;
  if (locale) params.lang = locale;
  if (filters?.status?.length) params.status = filters.status.join(",");
  if (filters?.date?.[0]) params.date = filters.date[0];
  if (search && search.trim()) params.search = search.trim();

  const { data } = await api.get("/admin/orders", { params });
  return data;
};
