import { Navigate, Outlet } from 'react-router-dom';
export function AdminProtectedRoute() {
  const isAdmin = !!localStorage.getItem('ssrms_admin'); // 💡 កែត្រង់នេះ
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
export function TenantProtectedRoute() {
  const isTenant = !!localStorage.getItem('ssrms_tenant_token');
  
  if (!isTenant) {
    return <Navigate to="/tenant/login" replace />;
  }
  return <Outlet />;
}
export function AdminPublicRoute() {
  if (localStorage.getItem('ssrms_admin')) { // 💡 កែត្រង់នេះ
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
export function TenantPublicRoute() {
  if (localStorage.getItem('ssrms_tenant_token')) {
    return <Navigate to="/tenant" replace />;
  }
  return <Outlet />;
}