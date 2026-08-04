// Ejemplo de uso del servicio de API
// Este archivo muestra cómo utilizar el servicio de API en tu aplicación Astro

import { apiService } from '../services/api';

// Ejemplo de función para manejar login
export async function handleLogin(email: string, password: string) {
  try {
    const response = await apiService.login({ email, password });
    
    if (response.success) {
      console.log('Login exitoso:', response.data);
      // Redirigir al usuario o actualizar el estado de la aplicación
      window.location.href = '/dashboard';
    }
    
    return response;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

// Ejemplo de función para obtener datos del usuario
export async function getUserProfile() {
  try {
    const response = await apiService.getProfile();
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

// Ejemplo de función para manejar logout
export async function handleLogout() {
  try {
    await apiService.logout();
    // Redirigir al login
    window.location.href = '/login';
  } catch (error) {
    console.error('Error en logout:', error);
  }
}

// Ejemplo de función para hacer peticiones personalizadas
export async function getTransactions(page: number = 1, limit: number = 10) {
  try {
    const response = await apiService.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    throw error;
  }
}

// Ejemplo de función para crear una nueva transacción
export async function createTransaction(transactionData: {
  amount: number;
  description: string;
  category_id?: number;
  type: 'income' | 'expense';
}) {
  try {
    const response = await apiService.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear transacción:', error);
    throw error;
  }
}

// Ejemplo de función para actualizar una transacción
export async function updateTransaction(id: number, transactionData: any) {
  try {
    const response = await apiService.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    throw error;
  }
}

// Ejemplo de función para eliminar una transacción
export async function deleteTransaction(id: number) {
  try {
    const response = await apiService.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    throw error;
  }
}
