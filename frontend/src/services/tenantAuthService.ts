import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/tenant-auth`;

const TENANT_KEY = 'ssrms_tenant';
const TENANT_TOKEN_KEY = 'ssrms_tenant_token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TENANT_TOKEN_KEY);

    if (token) {
     config.headers.Authorization = `Bearer ${token}`;
      // If your backend expects Bearer token, use:
      // config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically logout if token is expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      localStorage.removeItem(TENANT_KEY);
      localStorage.removeItem(TENANT_TOKEN_KEY);

      window.location.href = '/tenant/login';
    }

    return Promise.reject(error);
  }
);

export interface TenantInvoice {
  invoiceid: number;
  invoicedate: string;
  oldwatermeter: number;
  newwatermeter: number;
  oldelectricmeter: number;
  newelectricmeter: number;
  totalamount: string;
  paymentstatus: string;
}

export interface TenantContract {
  contractid: number;
  startdate: string;
  enddate: string | null;
  deposit: string;
  status: string;
  roomid: number;
  roomnumber: string;
  room?: {
    roomtype: string | null;
    price: string;
  };
  invoices: TenantInvoice[];
}

export interface TenantProfile {
  tenantid: number;
  fullname: string;
  phone: string;
  username: string;
  contracts: TenantContract[];
}

export interface LoginInput {
  username: string;
  password: string;
}

export const tenantLogin = async (data: LoginInput) => {
  const response = await api.post<{ token: string; tenant: any }>(
    '/login',
    data
  );

  localStorage.setItem(TENANT_KEY, JSON.stringify(response.data.tenant));
  localStorage.setItem(TENANT_TOKEN_KEY, response.data.token);

  return response.data.tenant;
};

export const tenantLogout = () => {
  localStorage.removeItem(TENANT_KEY);
  localStorage.removeItem(TENANT_TOKEN_KEY);

  window.location.href = '/tenant/login';
};

export const getCurrentTenant = () => {
  const stored = localStorage.getItem(TENANT_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isTenantLoggedIn = (): boolean => {
  return !!localStorage.getItem(TENANT_TOKEN_KEY);
};

export const fetchTenantProfile = async (): Promise<TenantProfile> => {
  const response = await api.get<TenantProfile>('/me');
  return response.data;
};

export const reportMaintenance = async (
  description: string,
  roomid: number
) => {
  const response = await api.post('/maintenance', {
    description,
    roomid,
  });

  return response.data;
};