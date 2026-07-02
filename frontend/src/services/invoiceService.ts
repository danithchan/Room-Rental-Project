import api from './api';

export interface Invoice {
  invoiceid: number;
  invoicedate: string;
  oldwatermeter: number;
  newwatermeter: number;
  oldelectricmeter: number;
  newelectricmeter: number;
  totalamount: string;
  paymentstatus: string;
  contractid: number;
  roomnumber: string;
  tenantname: string;
}

export interface InvoiceInput {
  invoicedate: string;
  contractid: number;
  oldwatermeter: number;
  newwatermeter: number;
  oldelectricmeter: number;
  newelectricmeter: number;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get<Invoice[]>('/invoices');
  return response.data;
};

export const createInvoice = async (data: InvoiceInput): Promise<Invoice> => {
  const response = await api.post<Invoice>('/invoices', data);
  return response.data;
};

export const markAsPaid = async (id: number): Promise<Invoice> => {
  const response = await api.put<Invoice>(`/invoices/${id}`, {
    paymentstatus: 'Paid',
  });
  return response.data;
};

export const deleteInvoice = async (id: number): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};