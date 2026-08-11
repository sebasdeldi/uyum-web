import { useMutation } from "@tanstack/react-query";
import { createMintOperation } from "../../../clients/core";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  createMintSchema,
  type CreateMintInput,
} from "../schemas/create-mint-schema";
import axios from "axios";

export function useCreateMintForm() {
  const navigate = useNavigate();

  const createMintMutation = useMutation({
    mutationFn: createMintOperation,
    onSuccess: (data) => {
      navigate({ to: "/mint-operation/$id", params: { id: data.id } });
    },
  });

  async function createMint(input: CreateMintInput) {
    const { amount, address, ...rest } = input;
    createMintMutation.mutate({
      ...rest,
      address: address as `0x${string}`,
      amountInCents: amount * 100,
    });
  }

  const form = useForm({
    defaultValues: {
      number: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      cardHolder: "",
      amount: 0,
      address: "",
    },

    validators: {
      onSubmit: createMintSchema,
      onChange: createMintSchema,
    },
    onSubmit: async ({ value }) => {
      createMint(value);
    },
  });

  function getLoginErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return "Unauthorized.";
    }
    return "Something went wrong. Please try again.";
  }

  return {
    form,
    isLoading: createMintMutation.isPending,
    errorMessage: getLoginErrorMessage(createMintMutation.error),
    clearError: createMintMutation.reset,
  };
}
