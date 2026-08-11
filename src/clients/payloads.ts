export type RegisterPayload = {
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterResponse = {
  id: number
  email: string
  createdAt: string
  updatedAt: string
}

export type LoginResponse = RegisterResponse & {
  authToken: string
}

// GET /users/me returns `new RegisterResponseDto(user)` server-side — the
// exact same DTO as register, not just a coincidentally matching shape.
export type MeResponse = RegisterResponse

export type PaymentTransactionResponse = {
  id: string
  userId: number
  mintOperationId?: string
  provider: string
  providerReference?: string
  amountInCents: number
  status: string
}

export type InitiateMintPayload = {
  number: string
  expMonth: string
  expYear: string
  cvc: string
  cardHolder: string
  amountInCents: number
  installments?: number
  address: `0x${string}`
}

export type MintOperationResponse = {
  userId: number
  id: string
  walletAddress: string
  fiatAmount: number
  tokenAmount: number
  status: string
  onchainTxHash?: string
  paymentTransaction?: PaymentTransactionResponse
}

export type PaginationQuery = {
  page?: number
  limit?: number
}

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}
