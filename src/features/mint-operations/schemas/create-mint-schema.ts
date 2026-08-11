import * as z from "zod"; 

export const createMintSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/, "Enter a valid card number"),
  expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Enter a valid month (MM)"),
  expYear: z.string().regex(/^\d{2}$/, "Enter a valid year (YY)"),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter a valid CVC"),
  cardHolder: z.string().min(1, "Cardholder name is required"),
  // Not in cents
  amount: z.number().int().min(1500, "Amount must be greater than 1500"),
  installments: z.number().int().min(1).optional(),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid wallet address"),
});

export type CreateMintInput = z.infer<typeof createMintSchema>;
