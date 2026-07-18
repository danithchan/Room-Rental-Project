import { useRef, useState } from 'react';
import { Pencil, Users, Trash2, Camera, Home, Plus } from 'lucide-react';
import {
  getRooms,
  deleteRoom,
  createRoom,
  updateRoom,
  moveInRoom,
  uploadRoomImage,
  getImageUrl,
  type Room,
  type RoomInput,
  type MoveInInput,
} from '../services/roomService';
import RoomFormModal from '../components/RoomFormModal';
import RoomTenantModal from '../components/RoomTenantModal';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

function StatusBadge({ status }: { status: string }) {
  const isAvailable = status === 'Available';
  return (
    <span
      className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-md ${
        isAvailable
          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
      }`}
    >
      {isAvailable ? 'ទំនេរ' : 'មានអ្នកជួល'}
    </span>
  );
}

interface RoomCardProps {
  room: Room;
  onDelete: (id: number) => void;
  onEdit: (room: Room) => void;
  onViewTenant: (room: Room) => void;
  onUploadImage: (room: Room) => void;
}

function RoomCard({ room, onDelete, onEdit, onViewTenant, onUploadImage }: RoomCardProps) {
  const imageUrl = getImageUrl(room.imageurl);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1">
      <div
        className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer group"
        onClick={() => onUploadImage(room)}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={room.roomnumber} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <Home size={40} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
          <span className="text-white text-sm opacity-0 group-hover:opacity-100 font-medium flex items-center gap-1.5">
            <Camera size={16} />
            ប្តូររូបភាព
          </span>
        </div>
        <StatusBadge status={room.status} />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 dark:text-white">បន្ទប់ {room.roomnumber}</h3>
          <span className="font-semibold text-blue-600 dark:text-blue-400">${room.price}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{room.roomtype || 'មិនកំណត់'}</p>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(room)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 py-2 rounded-lg font-medium"
          >
            <Pencil size={14} />
            កែប្រែ
          </button>
          <button
            onClick={() => onViewTenant(room)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 py-2 rounded-lg font-medium"
          >
            <Users size={14} />
            អ្នកជួល
          </button>
          <button
            onClick={() => onDelete(room.roomid)}
            className="text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg font-medium"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [tenantModalRoom, setTenantModalRoom] = useState<Room | null>(null);

  const [uploadingRoomId, setUploadingRoomId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRooms = async () => {
    try {
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError('មិនអាចទាញទិន្នន័យបន្ទប់បានទេ។ សូមពិនិត្យ Backend Server។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(loadRooms, 15000);

  const handleDelete = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបបន្ទប់នេះមែនទេ?')) return;
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.roomid !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'មិនអាចលុបបន្ទប់បានទេ');
      console.error(err);
    }
  };

  const handleFormSubmit = async (data: RoomInput) => {
    if (editingRoom) {
      const updated = await updateRoom(editingRoom.roomid, data);
      setRooms((prev) =>
        prev.map((r) => (r.roomid === updated.roomid ? updated : r))
      );
    } else {
      const newRoom = await createRoom(data);
      setRooms((prev) => [...prev, newRoom]);
    }
  };

  const handleMoveIn = async (data: MoveInInput) => {
    if (!editingRoom) return;
    const result = await moveInRoom(editingRoom.roomid, data);
    setRooms((prev) =>
      prev.map((r) => (r.roomid === result.room.roomid ? result.room : r))
    );
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setShowFormModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingRoom(null);
  };

  const handleUploadClick = (room: Room) => {
    setUploadingRoomId(room.roomid);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingRoomId) return;

    try {
      const updated = await uploadRoomImage(uploadingRoomId, file);
      setRooms((prev) =>
        prev.map((r) => (r.roomid === updated.roomid ? updated : r))
      );
    } catch (err) {
      alert('មិនអាច Upload រូបភាពបានទេ។ ត្រូវប្រាកដថាជា JPG/PNG/WebP មិនលើស 5MB');
      console.error(err);
    } finally {
      setUploadingRoomId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">គ្រប់គ្រងបន្ទប់</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">គ្រប់គ្រងបន្ទប់ជួលរបស់អ្នកនៅទីនេះ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={16} />
          បន្ថែមបន្ទប់ថ្មី
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">មិនទាន់មានបន្ទប់នៅឡើយទេ</p>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <RoomCard
              key={room.roomid}
              room={room}
              onDelete={handleDelete}
              onEdit={openEditModal}
              onViewTenant={setTenantModalRoom}
              onUploadImage={handleUploadClick}
            />
          ))}
        </div>
      )}

      {showFormModal && (
        <RoomFormModal
          room={editingRoom}
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          onMoveIn={handleMoveIn}
        />
      )}

      {tenantModalRoom && (
        <RoomTenantModal
          room={tenantModalRoom}
          onClose={() => setTenantModalRoom(null)}
        />
      )}
    </div>
  );
}

export default Rooms;