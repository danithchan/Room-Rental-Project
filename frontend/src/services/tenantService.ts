import api from './api';

export interface Tenant {
  tenantid: number;
  fullname: string;
  gender: string | null;
  phone: string;
  idcardnumber: string | null;
  address: string | null;
  username: string | null;
}

export interface TenantInput {
  fullname: string;
  gender: string;
  phone: string;
 idcardnumber?: string; 
  address?: string;
  username?: string; 
  password?: string;
}

export const getTenants = async (): Promise<Tenant[]> => {
  const response = await api.get<Tenant[]>('/tenants');
  return response.data;
};

export const getTenantById = async (id: number): Promise<Tenant> => {
  const response = await api.get<Tenant>(`/tenants/${id}`);
  return response.data;
};

export const createTenant = async (data: TenantInput): Promise<Tenant> => {
  const response = await api.post<Tenant>('/tenants', data);
  return response.data;
};

export const updateTenant = async (id: number, data: TenantInput): Promise<Tenant> => {
  const response = await api.put<Tenant>(`/tenants/${id}`, data);
  return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
  await api.delete(`/tenants/${id}`);
};