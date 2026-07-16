import api from './api';

export interface Room {
  roomid: number;
  roomnumber: string;
  roomtype: string | null;
  price: string;
  status: string;
  adminid: number;
  imageurl: string | null;
}
export interface RoomInput {
  roomnumber: string;
  roomtype: string;
  price: number;
  status: string;
}

export interface MoveInInput {
  roomnumber: string;
  roomtype: string;
  price: number;
  tenantname: string;
  tenantphone: string;
  deposit: number;
  startdate: string;
}
const BACKEND_URL = import.meta.env.VITE_API_URL;
export const getImageUrl = (imageurl: string | null): string | null => {
  if (!imageurl) return null;
  return `${BACKEND_URL}${imageurl}`;
};

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>('/rooms');
  return response.data;
};

export const getRoomById = async (id: number): Promise<Room> => {
  const response = await api.get<Room>(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: RoomInput): Promise<Room> => {
  const response = await api.post<Room>('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: number, data: RoomInput): Promise<Room> => {
  const response = await api.put<Room>(`/rooms/${id}`, data);
  return response.data;
};

export const moveInRoom = async (id: number, data: MoveInInput) => {
  const response = await api.put(`/rooms/${id}/move-in`, data);
  return response.data;
};

// Upload រូបភាពសម្រាប់ Room
export const uploadRoomImage = async (id: number, file: File): Promise<Room> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<Room>(`/rooms/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};