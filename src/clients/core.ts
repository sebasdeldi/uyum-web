import axios from "axios";
import type {
  InitiateMintPayload,
  LoginPayload,
  LoginResponse,
  MeResponse,
  MintOperationResponse,
  Paginated,
  PaginationQuery,
  RegisterPayload,
  RegisterResponse,
} from "./payloads";
import { useAuthStore } from "../store/auth-store";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith("/auth");
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthEndpoint
    ) {
      useAuthStore.getState().clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export async function register(
  data: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    data,
  );
  return response.data;
}

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>("/users/me");
  return response.data;
}

export async function createMintOperation(
  data: InitiateMintPayload,
): Promise<MintOperationResponse> {
  const response = await apiClient.post<MintOperationResponse>(
    "/mint-operations",
    data,
  );
  return response.data;
}

export async function getMintOperations(
  query: PaginationQuery = {},
): Promise<Paginated<MintOperationResponse>> {
  const response = await apiClient.get<Paginated<MintOperationResponse>>(
    "/mint-operations",
    { params: query },
  );
  return response.data;
}

export async function getMintOperation(
  id: string,
): Promise<MintOperationResponse> {
  const response = await apiClient.get<MintOperationResponse>(
    `/mint-operations/${id}`,
  );
  return response.data;
}
