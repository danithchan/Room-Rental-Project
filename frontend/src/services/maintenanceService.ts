import api from './api';

export interface Maintenance {
  maintenanceid: number;
  description: string;
  reportdate: string;
  cost: string | null;
  status: string;
  roomid: number;
  roomnumber: string;
}

export interface MaintenanceInput {
  description: string;
  reportdate?: string;
  cost?: number;
  status: string;
  roomid: number;
}

export const getMaintenance = async (): Promise<Maintenance[]> => {
  const response = await api.get<Maintenance[]>('/maintenance');
  return response.data;
};

export const createMaintenance = async (data: MaintenanceInput): Promise<Maintenance> => {
  const response = await api.post<Maintenance>('/maintenance', data);
  return response.data;
};

export const updateMaintenance = async (
  id: number,
  data: Partial<MaintenanceInput>
): Promise<Maintenance> => {
  const response = await api.put<Maintenance>(`/maintenance/${id}`, data);
  return response.data;
};

export const deleteMaintenance = async (id: number): Promise<void> => {
  await api.delete(`/maintenance/${id}`);
};