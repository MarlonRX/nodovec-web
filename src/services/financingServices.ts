import axios, { type AxiosResponse } from "axios";
import { getFetch, postFetch, putFetch } from "./fetchTypes";

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

export async function previewFinancing(data: Pick<FinancingInput, "principal_amount" | "annual_interest_rate" | "calculation_method" | "payment_frequency" | "installments" | "first_payment_date">) {
  try {
    const response: AxiosResponse = await postFetch("financings/preview", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to calculate financing" };
    return { response: false, message: "Unexpected error" };
  }
}

export async function createFinancing(data: FinancingInput) {
  try {
    const response: AxiosResponse = await postFetch("financings", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to create financing" };
    return { response: false, message: "Unexpected error" };
  }
}

export async function getFinancings() {
  try {
    const response: AxiosResponse = await getFetch("financings", { page_size: 100 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to fetch financings" };
    return { response: false, message: "Unexpected error" };
  }
}

async function updateFinancing(uuid: string, data: { current_installment: number }) {
  try {
    const response: AxiosResponse = await putFetch(`financings/${uuid}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to update financing" };
    return { response: false, message: "Unexpected error" };
  }
}

export async function updateFinancingFull(uuid: string, data: FinancingInput) {
  try {
    const response: AxiosResponse = await putFetch(`financings/${uuid}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to update financing" };
    return { response: false, message: "Unexpected error" };
  }
}

export async function getFinancingDetails(uuid: string, page?: number, pageSize?: number) {
  try {
    const params: Record<string, any> = {};
    if (page !== undefined) params.page = page;
    if (pageSize !== undefined) params.page_size = pageSize;
    
    const response: AxiosResponse = await getFetch(`financings/${uuid}`, Object.keys(params).length > 0 ? params : undefined);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || "Failed to fetch financing details" };
    return { response: false, message: "Unexpected error" };
  }
}
