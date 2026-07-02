import { useEffect, useState } from 'react';
import type { Room } from '../services/roomService';
import { getContractByRoomId, type Contract } from '../services/contractService';

interface RoomTenantModalProps {
  room: Room;
  onClose: () => void;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB'); // DD/MM/YYYY
}

function RoomTenantModal({ room, onClose }: RoomTenantModalProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContract = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getContractByRoomId(room.roomid);
        setContract(data);
      } catch (err) {
        setError('មិនអាចទាញទិន្នន័យកិច្ចសន្យាបានទេ');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [room.roomid]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            អ្នកជួល — បន្ទប់ {room.roomnumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {loading && (
          <p className="text-gray-500 text-center py-8">កំពុងផ្ទុកទិន្នន័យ...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && !contract && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🔓</p>
            <p className="text-gray-500">បន្ទប់នេះមិនទាន់មានអ្នកជួលទេ</p>
          </div>
        )}

        {!loading && !error && contract && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">ឈ្មោះ</span>
              <span className="text-sm font-medium text-gray-800">
                {contract.tenantname}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">ទូរស័ព្ទ</span>
              <span className="text-sm font-medium text-gray-800">
                {contract.tenant?.phone || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">ប្រាក់កក់</span>
              <span className="text-sm font-medium text-gray-800">
                ${contract.deposit}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">ថ្ងៃចូលនៅ</span>
              <span className="text-sm font-medium text-gray-800">
                {formatDate(contract.startdate)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">ថ្ងៃផុតកំណត់</span>
              <span className="text-sm font-medium text-gray-800">
                {formatDate(contract.enddate)}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 text-sm bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium"
        >
          បិទ
        </button>
      </div>
    </div>
  );
}

export default RoomTenantModal;