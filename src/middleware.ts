/**
 * Middleware para proteger rutas y manejar autenticación
 * Las rutas protegidas requieren token válido
 * Las rutas públicas pueden ser accedidas sin autenticación
 */
export const onRequest = (context, next) => {
  // Obtener token del cookie
  const token = context.cookies.get("auth_token")?.value;

  // Rutas públicas que NO requieren autenticación
  const publicRoutes = ["/", "/login", "/register", "/demo"];
  
  // Rutas protegidas que SÍ requieren autenticación
  const protectedRoutes = ["/dashboard", "/transactions"];

  const path = context.url.pathname;

  // Si intenta acceder a ruta protegida sin token -> redirigir a login
  // PERO permitir /dashboard en modo preview/desarrollo para testing
  if (protectedRoutes.some(route => path.startsWith(route)) && !token) {
    // Check if in preview/dev mode by looking at environment or referrer
    const allowPreviewMode = process.env.NODE_ENV !== "production";
    
    if (!allowPreviewMode) {
      return context.redirect("/login");
    }
    // In preview/dev, allow accessing dashboard for testing
  }

  // Si está en login/register/demo pero tiene token válido -> redirigir a dashboard
  if ((path === "/login" || path === "/register") && token) {
    return context.redirect("/dashboard");
  }

  // Si está en home (/) pero tiene token -> redirigir a dashboard
  if (path === "/" && token) {
    return context.redirect("/dashboard");
  }

  return next();
};
