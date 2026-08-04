// Ejemplos de uso de los servicios con Axios
// Este archivo muestra cómo utilizar los servicios en componentes de Astro

import { 
  loginUser, 
  getAllRol, 
  getAllTransactions, 
  createTransaction, 
  getAllCategories, 
  getFetch
} from '../services';

// Ejemplo 1: Login de usuario
export async function handleUserLogin(email: string, password: string) {
  const response = await loginUser({ email, password });
  
  if (response.res) {
    console.log('Login exitoso:', response.data);
    // El token ya se guardó automáticamente en localStorage
    return response.data;
  } else {
    console.error('Error en login:', response.message);
    throw new Error(response.message);
  }
}

// Ejemplo 2: Obtener todos los roles (exactamente como pediste)
export const fetchAllRoles = async () => {
  try {
    return await getFetch(`rol/getAll`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

// Ejemplo 3: Obtener transacciones con filtros
export async function loadTransactions(filters?: {
  type?: 'income' | 'expense';
  page?: number;
  per_page?: number;
}) {
  const response = await getAllTransactions(filters);
  
  if (response.res) {
    console.log('Transacciones cargadas:', response.data);
    return response.data;
  } else {
    console.error('Error al cargar transacciones:', response.message);
    return null;
  }
}

// Ejemplo 4: Crear nueva transacción
export async function addNewTransaction(transactionData: {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category_id?: number;
}) {
  const response = await createTransaction(transactionData);
  
  if (response.res) {
    console.log('Transacción creada:', response.data);
    return response.data;
  } else {
    console.error('Error al crear transacción:', response.message);
    // Mostrar errores específicos si existen
    if (response.errors) {
      Object.entries(response.errors).forEach(([field, messages]) => {
        console.error(`Error en ${field}:`, messages.join(', '));
      });
    }
    throw new Error(response.message);
  }
}

// Ejemplo 5: Cargar categorías para un select
export async function loadCategoriesForSelect() {
  const response = await getAllCategories();
  
  if (response.res && response.data) {
    // Transformar datos para usar en un select
    return response.data.map(category => ({
      value: category.id,
      label: category.name,
      type: category.type,
      color: category.color
    }));
  } else {
    console.error('Error al cargar categorías:', response.message);
    return [];
  }
}

// Ejemplo 6: Función helper para manejar errores globalmente
export function handleServiceError(error: any, context: string = 'Operación') {
  console.error(`Error en ${context}:`, error);
  
  // Aquí puedes agregar lógica para mostrar toasts, notificaciones, etc.
  if (typeof window !== 'undefined') {
    // Ejemplo con alert (en producción usarías una librería de notificaciones)
    alert(`${context} falló: ${error.message || 'Error desconocido'}`);
  }
}

// Ejemplo 7: Hook personalizado para autenticación (si usas React/Vue)
export function useAuth() {
  return {
    async login(email: string, password: string) {
      try {
        const response = await loginUser({ email, password });
        if (!response.res) {
          throw new Error(response.message);
        }
        return response.data;
      } catch (error) {
        handleServiceError(error, 'Login');
        throw error;
      }
    },

    async logout() {
      try {
        await logoutUser();
        // Redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (error) {
        handleServiceError(error, 'Logout');
      }
    },

    isLoggedIn() {
      return isAuthenticated();
    },

    getCurrentUser() {
      return getCurrentUser();
    }
  };
}

// Ejemplo 8: Función para validar respuesta de API
export function validateApiResponse<T>(response: any): response is { res: true; data: T } {
  return response && response.res === true && response.data !== undefined;
}

// Ejemplo 9: Función para cargar datos iniciales del dashboard
export async function loadDashboardData() {
  try {
    // Cargar múltiples datos en paralelo
    const [transactionsResponse, categoriesResponse, userResponse] = await Promise.all([
      getAllTransactions({ per_page: 10 }),
      getAllCategories(),
      getUserProfile()
    ]);

    const dashboardData = {
      transactions: validateApiResponse(transactionsResponse) ? transactionsResponse.data : [],
      categories: validateApiResponse(categoriesResponse) ? categoriesResponse.data : [],
      user: validateApiResponse(userResponse) ? userResponse.data : null
    };

    return dashboardData;
  } catch (error) {
    handleServiceError(error, 'Carga del dashboard');
    return {
      transactions: [],
      categories: [],
      user: null
    };
  }
}

// Ejemplo de uso en un componente Astro:
/*
---
// En un archivo .astro
import { loadDashboardData } from '../utils/service-examples';

const dashboardData = await loadDashboardData();
---

<div>
  <h1>Bienvenido, {dashboardData.user?.name}</h1>
  <p>Tienes {dashboardData.transactions.length} transacciones</p>
</div>
*/
