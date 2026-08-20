import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import { isDemoMode } from '@/lib/demoUtils';
import { DEMO_SAVINGS_GOAL } from '@/data/demoData';
import type { ApiResponse } from './types';
import type {
  SavingsGoal,
  CreateSavingsGoal,
  UpdateSavingsGoal,
  ContributeToGoal,
} from '../types/savingsGoalInterfaces';

export interface PaginatedResponse<T> {
  response: boolean;
  message: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type SingleGoalResponse = ApiResponse<SavingsGoal>;

export interface ContributeResponse {
  response: boolean;
  message: string;
  data: {
    contribution: {
      uuid: string;
      amount: number;
      note: string | null;
      created_at: string;
    };
    goal: SavingsGoal;
    just_completed: boolean;
  };
}

export interface ProgressResponse {
  response: boolean;
  message: string;
  data: {
    goal: SavingsGoal;
    stats: {
      total_contributions: number;
      total_amount: number;
      monthly_average: number;
      required_monthly: number;
    };
    projection: {
      will_reach_goal: boolean;
      projected_amount: number;
      monthly_average: number;
      required_monthly: number;
      months_remaining: number | null;
    } | null;
    contributions_by_month: Record<string, number>;
  };
}

export const getGoals = (
  params?: { page?: number; page_size?: number; status?: 'active' | 'completed' | 'all' },
  token?: string | null,
): Promise<PaginatedResponse<SavingsGoal>> => {
  if (isDemoMode()) {
    return Promise.resolve({
      response: true,
      message: 'Goals fetched (Demo Mode)',
      data: {
        data: [DEMO_SAVINGS_GOAL],
        current_page: 1,
        last_page: 1,
        per_page: params?.page_size ?? 5,
        total: 1,
      },
    });
  }
  return apiGet<PaginatedResponse<SavingsGoal>['data']>('goals', { params, token }) as Promise<PaginatedResponse<SavingsGoal>>;
};

export const createGoal = (data: CreateSavingsGoal, token?: string | null): Promise<SingleGoalResponse> =>
  apiPost<SavingsGoal>('goals', data, { token });

export const updateGoal = (uuid: string, data: UpdateSavingsGoal, token?: string | null): Promise<SingleGoalResponse> =>
  apiPut<SavingsGoal>(`goals/${uuid}`, data, { token });

export const deleteGoal = (uuid: string, token?: string | null): Promise<ApiResponse<null>> =>
  apiDelete(`goals/${uuid}`, { token });

export const contributeToGoal = (uuid: string, data: ContributeToGoal, token?: string | null): Promise<ContributeResponse> =>
  apiPost<ContributeResponse['data']>(`goals/${uuid}/contribute`, data, { token }) as Promise<ContributeResponse>;

export const updateContribution = (
  goalUuid: string,
  contributionUuid: string,
  data: { amount: number; note?: string | null },
  token?: string | null,
): Promise<SingleGoalResponse> =>
  apiPut<SavingsGoal>(`goals/${goalUuid}/contributions/${contributionUuid}`, data, { token });

export const deleteContribution = (
  goalUuid: string,
  contributionUuid: string,
  token?: string | null,
): Promise<SingleGoalResponse> =>
  apiDelete<SavingsGoal>(`goals/${goalUuid}/contributions/${contributionUuid}`, { token });
