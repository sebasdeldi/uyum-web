import { useForm } from "@tanstack/react-form";
import { registerSchema } from "../schemas/register-schema";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "../../../clients/core";
import axios from "axios";
import { useOnLoginSuccess } from "./useOnLoginSuccess";

export function useRegisterForm() {
  const onLoginSuccess = useOnLoginSuccess();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: onLoginSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (_data, variables) => {
      loginMutation.mutate(variables);
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: registerSchema, onMount: registerSchema },
    onSubmit: async ({ value }) => {
      registerMutation.mutate(value);
    },
  });

  function getRegisterErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Email already in use.";
    }
    return "Something went wrong. Please try again.";
  }

  return {
    form,
    isLoading: registerMutation.isPending,
    clearError: registerMutation.reset,
    errorMessage: getRegisterErrorMessage(registerMutation.error),
  };
}
