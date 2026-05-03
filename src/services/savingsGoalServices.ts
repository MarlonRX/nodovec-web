import { getFetch, postFetch, putFetch, deleteFetch } from './fetchTypes';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
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

export interface SingleGoalResponse {
  response: boolean;
  message: string;
  data: SavingsGoal;
}

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

export const getGoals = async (params?: {
  page?: number;
  page_size?: number;
  status?: 'active' | 'completed' | 'all';
}): Promise<PaginatedResponse<SavingsGoal>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<SavingsGoal>> = await getFetch('goals', params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to fetch savings goals',
        data: { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    };
  }
};

export const getGoal = async (uuid: string): Promise<SingleGoalResponse> => {
  try {
    const response: AxiosResponse<SingleGoalResponse> = await getFetch(`goals/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to fetch savings goal',
        data: null as unknown as SavingsGoal,
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as SavingsGoal,
    };
  }
};

export const createGoal = async (data: CreateSavingsGoal): Promise<SingleGoalResponse> => {
  try {
    const response: AxiosResponse<SingleGoalResponse> = await postFetch('goals', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to create savings goal',
        data: null as unknown as SavingsGoal,
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as SavingsGoal,
    };
  }
};

export const updateGoal = async (uuid: string, data: UpdateSavingsGoal): Promise<SingleGoalResponse> => {
  try {
    const response: AxiosResponse<SingleGoalResponse> = await putFetch(`goals/${uuid}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to update savings goal',
        data: null as unknown as SavingsGoal,
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as SavingsGoal,
    };
  }
};

export const deleteGoal = async (uuid: string) => {
  try {
    const response: AxiosResponse = await deleteFetch(`goals/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to delete savings goal',
      };
    }
    return { response: false, message: 'An unexpected error occurred' };
  }
};

export const contributeToGoal = async (uuid: string, data: ContributeToGoal): Promise<ContributeResponse> => {
  try {
    const response: AxiosResponse<ContributeResponse> = await postFetch(`goals/${uuid}/contribute`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to add contribution',
        data: null as unknown as ContributeResponse['data'],
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as ContributeResponse['data'],
    };
  }
};

export const updateContribution = async (
  goalUuid: string,
  contributionUuid: string,
  data: { amount: number; note?: string | null }
): Promise<SingleGoalResponse> => {
  try {
    const response: AxiosResponse<SingleGoalResponse> = await putFetch(
      `goals/${goalUuid}/contributions/${contributionUuid}`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to update contribution',
        data: null as unknown as SavingsGoal,
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as SavingsGoal,
    };
  }
};

export const deleteContribution = async (
  goalUuid: string,
  contributionUuid: string
): Promise<SingleGoalResponse> => {
  try {
    const response: AxiosResponse<SingleGoalResponse> = await deleteFetch(
      `goals/${goalUuid}/contributions/${contributionUuid}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to delete contribution',
        data: null as unknown as SavingsGoal,
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as SavingsGoal,
    };
  }
};

export const getGoalProgress = async (uuid: string): Promise<ProgressResponse> => {
  try {
    const response: AxiosResponse<ProgressResponse> = await getFetch(`goals/${uuid}/progress`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to fetch progress',
        data: null as unknown as ProgressResponse['data'],
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: null as unknown as ProgressResponse['data'],
    };
  }
};