import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { 
  AdminProtectedRoute, 
  TenantProtectedRoute, 
  AdminPublicRoute, 
  TenantPublicRoute 
} from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import Profile from "./pages/Profile";
import { Maintenance } from './pages/Maintenances';
import ForgotPassword from './components/ForgotPassword'; 
import TenantLogin from './pages/TenantLogin';
import TenantDashboard from './pages/TenantDashboard';

function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route element={<AdminPublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<TenantPublicRoute />}>
          <Route path="/tenant/login" element={<TenantLogin />} />
        </Route>
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="maintenance" element={<Maintenance/>} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route element={<TenantProtectedRoute />}>
          <Route path="/tenant" element={<TenantDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;