import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../../clients/core";
import { loginSchema } from "../schemas/login-schema";
import axios from "axios";
import { useOnLoginSuccess } from "./useOnLoginSuccess";

export function useLoginForm() {
  const onLoginSuccess = useOnLoginSuccess();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: onLoginSuccess,
  });

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema, onMount: loginSchema },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  function getLoginErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return "Invalid email or password.";
    }
    return "Something went wrong. Please try again.";
  }

  return {
    form,
    isLoading: loginMutation.isPending,
    errorMessage: getLoginErrorMessage(loginMutation.error),
    clearError: loginMutation.reset,
  };
}
