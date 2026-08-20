import { apiGet, apiPost, apiPut } from "./apiClient";
import type { ApiResponse } from "./types";

export type FinancingInput = {
  type: "loan" | "card_purchase";
  card_uuid?: string;
  name: string;
  description?: string;
  principal_amount: string;
  annual_interest_rate: string;
  calculation_method: "french" | "simple" | "fixed_principal";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  installments: number;
  first_payment_date: string;
  currency: string;
  category?: string | null;
  observations?: string | null;
  current_installment?: number;
  generate_transactions?: boolean;
};

export function previewFinancing(
  data: Pick<FinancingInput, "principal_amount" | "annual_interest_rate" | "calculation_method" | "payment_frequency" | "installments" | "first_payment_date">,
  token?: string | null,
): Promise<ApiResponse<any>> {
  return apiPost("financings/preview", data, { token });
}

export function createFinancing(data: FinancingInput, token?: string | null): Promise<ApiResponse<any>> {
  return apiPost("financings", data, { token });
}

export function getFinancings(token?: string | null): Promise<ApiResponse<any>> {
  return apiGet("financings", { params: { page_size: 100 }, token });
}

export function updateFinancingFull(uuid: string, data: FinancingInput, token?: string | null): Promise<ApiResponse<any>> {
  return apiPut(`financings/${uuid}`, data, { token });
}

export function getFinancingDetails(uuid: string, page?: number, pageSize?: number, token?: string | null): Promise<ApiResponse<any>> {
  const params: Record<string, unknown> = {};
  if (page !== undefined) params.page = page;
  if (pageSize !== undefined) params.page_size = pageSize;
  return apiGet(`financings/${uuid}`, { params, token });
}
