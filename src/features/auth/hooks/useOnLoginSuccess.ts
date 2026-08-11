import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../../store/auth-store";
import type { LoginResponse } from "../../../clients/payloads";

export function useOnLoginSuccess() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  return (data: LoginResponse) => {
    setToken(data.authToken);
    navigate({ to: "/mint-operations" });
  };
}
