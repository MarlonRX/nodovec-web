// Servicios relacionados con categorías
import { getFetch, postFetch, putFetch, deleteFetch } from './fetchTypes';
import type { Category, CreateCategoryData } from '../types';

// SERVICIOS DE CATEGORÍAS

/**
 * Obtener todas las categorías
 */
export const getAllCategories = async () => {
  try {
    return await getFetch<Category[]>('categories/getAll');
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener categoría por ID
 */
export const getCategoryById = async (id: number) => {
  try {
    return await getFetch<Category>(`categories/getById/${id}`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Crear nueva categoría
 */
export const createCategory = async (categoryData: CreateCategoryData) => {
  try {
    return await postFetch<Category>('categories/create', categoryData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Actualizar categoría
 */
export const updateCategory = async (id: number, categoryData: Partial<CreateCategoryData>) => {
  try {
    return await putFetch<Category>(`categories/update/${id}`, categoryData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Eliminar categoría
 */
export const deleteCategory = async (id: number) => {
  try {
    return await deleteFetch(`categories/delete/${id}`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener categorías por tipo (income/expense/both)
 */
export const getCategoriesByType = async (type: 'income' | 'expense' | 'both') => {
  try {
    return await getFetch<Category[]>(`categories/getByType/${type}`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener categorías predeterminadas del sistema
 */
export const getDefaultCategories = async () => {
  try {
    return await getFetch<Category[]>('categories/getDefaults');
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener categorías del usuario
 */
export const getUserCategories = async () => {
  try {
    return await getFetch<Category[]>('categories/getUserCategories');
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener categorías más utilizadas
 */
export const getMostUsedCategories = async (limit: number = 10) => {
  try {
    return await getFetch<Category[]>('categories/getMostUsed', { limit });
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener estadísticas de categorías
 */
export const getCategoryStats = async (categoryId: number, period?: { from: string; to: string }) => {
  try {
    return await getFetch(`categories/stats/${categoryId}`, period);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Fusionar categorías (mover transacciones de una categoría a otra)
 */
export const mergeCategories = async (fromCategoryId: number, toCategoryId: number) => {
  try {
    return await postFetch('categories/merge', {
      from_category_id: fromCategoryId,
      to_category_id: toCategoryId
    });
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Cambiar orden de las categorías
 */
export const reorderCategories = async (categoryOrders: Array<{ id: number; order: number }>) => {
  try {
    return await putFetch('categories/reorder', { categories: categoryOrders });
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};
