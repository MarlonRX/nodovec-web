export interface FinancingCard {
  uuid: string;
  name: string;
  last_four: string;
  bank: string;
}

export interface Financing {
  uuid: string;
  type: 'loan' | 'card_purchase';
  name: string;
  description?: string | null;
  principal_amount: number | string;
  annual_interest_rate: number | string;
  calculation_method: string;
  payment_frequency: 'weekly' | 'biweekly' | 'monthly';
  installments: number;
  first_payment_date: string;
  currency: string;
  category?: string | null;
  observations?: string | null;
  current_installment: number;
  generate_transactions: boolean;
  status: string;
  monthly_payment?: number;
  card?: FinancingCard | null;
}
