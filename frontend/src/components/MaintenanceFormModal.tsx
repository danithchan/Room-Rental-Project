import { useEffect, useState } from 'react';
import type { MaintenanceInput } from '../services/maintenanceService';
import { getRooms, type Room } from '../services/roomService';

interface MaintenanceFormModalProps {
  onClose: () => void;
  onSubmit: (data: MaintenanceInput) => Promise<void>;
}

function MaintenanceFormModal({ onClose, onSubmit }: MaintenanceFormModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [formData, setFormData] = useState<MaintenanceInput>({
    description: '',
    reportdate: new Date().toISOString().split('T')[0],
    cost: undefined,
    status: 'Pending',
    roomid: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, roomid: data[0].roomid }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roomid' ? Number(value) : name === 'cost' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      setError('សូមបញ្ចូលលម្អិតការខូចខាត');
      return;
    }
    if (!formData.roomid) {
      setError('សូមជ្រើសរើសបន្ទប់');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError('មិនអាចរាយការណ៍ការខូចខាតបានទេ');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">រាយការណ៍ការខូចខាត</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loadingRooms ? (
          <p className="text-gray-500 text-center py-6">កំពុងផ្ទុកទិន្នន័យ...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ជ្រើសរើសបន្ទប់ <span className="text-red-500">*</span>
              </label>
              <select
                name="roomid"
                value={formData.roomid}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rooms.map((r) => (
                  <option key={r.roomid} value={r.roomid}>
                    បន្ទប់ {r.roomnumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                លម្អិតការខូចខាត <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="ឧ. អំពូលភ្លើងបែក"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ថ្ងៃរាយការណ៍</label>
              <input
                type="date"
                name="reportdate"
                value={formData.reportdate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ថ្លៃជួសជុល ($) — អាចទុកចំហ
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost ?? ''}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ស្ថានភាព</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">កំពុងរង់ចាំ</option>
                <option value="InProgress">កំពុងជួសជុល</option>
                <option value="Done">រួចរាល់</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-sm bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-sm bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                {submitting ? 'កំពុងរក្សាទុក...' : 'រាយការណ៍'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default MaintenanceFormModal;