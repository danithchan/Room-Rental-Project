import api from './api';

export interface Contract {
  contractid: number;
  startdate: string;
  enddate: string | null;
  deposit: string;
  status: string;
  roomid: number;
  tenantid: number;
  roomnumber: string;
  tenantname: string;
  tenant?: {
    tenantid: number;
    fullname: string;
    phone: string;
  };
  room?: {
    roomid: number;
    roomnumber: string;
    price: string;
  };
}

export interface ContractInput {
  startdate: string;
  enddate?: string;
  deposit: number;
  status: string;
  roomid: number;
  tenantid: number;
}

export const getContracts = async (): Promise<Contract[]> => {
  const response = await api.get<Contract[]>('/contracts');
  return response.data;
};

export const getContractByRoomId = async (roomId: number): Promise<Contract | null> => {
  const contracts = await getContracts();
  const activeContract = contracts.find(
    (c) => c.roomid === roomId && c.status === 'Active'
  );
  return activeContract || null;
};

export const createContract = async (data: ContractInput): Promise<Contract> => {
  const response = await api.post<Contract>('/contracts', data);
  return response.data;
};

export const updateContract = async (
  id: number,
  data: Partial<ContractInput>
): Promise<Contract> => {
  const response = await api.put<Contract>(`/contracts/${id}`, data);
  return response.data;
};

export const deleteContract = async (id: number): Promise<void> => {
  await api.delete(`/contracts/${id}`);
};