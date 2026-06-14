/**
 * Middleware para proteger rutas y manejar autenticación
 * Las rutas protegidas requieren token válido
 * Las rutas públicas pueden ser accedidas sin autenticación
 */
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = (context, next) => {
  // Obtener token del cookie
  const token = context.cookies.get("auth_token")?.value;

  // Rutas públicas que NO requieren autenticación
  const publicRoutes = ["/", "/login", "/register", "/demo", "/unauthorized"];
  
  // Rutas protegidas que SÍ requieren autenticación
  const protectedRoutes = ["/dashboard", "/transactions", "/cards", "/savings-goals", "/preferences"];

  const path = context.url.pathname;

  // Si intenta acceder a ruta protegida sin token -> redirigir a demo
  if (protectedRoutes.some(route => path.startsWith(route)) && !token) {
    return context.redirect("/demo");
  }

  // Si está en login/register/demo pero tiene token válido -> redirigir a dashboard
  if ((path === "/login" || path === "/register" || path === "/demo") && token) {
    return context.redirect("/dashboard");
  }

  // Si está en home (/)
  if (path === "/") {
    if (token) {
      return context.redirect("/dashboard");
    } else {
      return context.redirect("/demo");
    }
  }

  return next();
};
