import { useState } from 'react';
import type { Room, RoomInput, MoveInInput } from '../services/roomService';

interface RoomFormModalProps {
  room?: Room | null;
  onClose: () => void;
  onSubmit: (data: RoomInput) => Promise<void>;
  onMoveIn: (data: MoveInInput) => Promise<void>;
}

function RoomFormModal({ room, onClose, onSubmit, onMoveIn }: RoomFormModalProps) {
  const isEditMode = !!room;
  const wasOccupiedBefore = room?.status === 'Occupied';

  const [formData, setFormData] = useState<RoomInput>({
    roomnumber: room?.roomnumber || '',
    roomtype: room?.roomtype || 'Standard',
    price: room ? Number(room.price) : 0,
    status: room?.status || 'Available',
  });

  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showTenantFields =
    formData.status === 'Occupied' && !wasOccupiedBefore;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomnumber.trim()) {
      setError('សូមបញ្ចូលលេខបន្ទប់');
      return;
    }
    if (formData.price <= 0) {
      setError('សូមបញ្ចូលតម្លៃត្រឹមត្រូវ');
      return;
    }

    if (showTenantFields) {
      if (!tenantName.trim()) {
        setError('សូមបញ្ចូលឈ្មោះអ្នកជួល');
        return;
      }
      if (!tenantPhone.trim()) {
        setError('សូមបញ្ចូលលេខទូរស័ព្ទអ្នកជួល');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      if (showTenantFields) {
        await onMoveIn({
          roomnumber: formData.roomnumber,
          roomtype: formData.roomtype,
          price: formData.price,
          tenantname: tenantName,
          tenantphone: tenantPhone,
          deposit,
          startdate: startDate,
        });
      } else {
        await onSubmit(formData);
      }

      onClose();
    } catch (err) {
      setError(
        isEditMode ? 'មិនអាចកែប្រែបន្ទប់បានទេ' : 'មិនអាចបន្ថែមបន្ទប់បានទេ'
      );
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
            {isEditMode ? 'កែប្រែបន្ទប់' : 'បន្ថែមបន្ទប់ថ្មី'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              លេខបន្ទប់ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="roomnumber"
              value={formData.roomnumber}
              onChange={handleChange}
              placeholder="ឧ. B04"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ប្រភេទបន្ទប់
            </label>
            <select
              name="roomtype"
              value={formData.roomtype}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">ធម្មតា (Standard)</option>
              <option value="VIP">VIP</option>
              <option value="2 បន្ទប់">2 បន្ទប់</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              តម្លៃជួល ($/ខែ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="80"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ស្ថានភាព
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Available">ទំនេរ</option>
              <option value="Occupied">មានអ្នកជួល</option>
            </select>
          </div>

          {showTenantFields && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-blue-700">
                📋 ព័ត៌មានអ្នកជួលថ្មី
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ឈ្មោះអ្នកជួល <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="ឧ. ចាន់ ដារ៉ា"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  placeholder="012 345 678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ប្រាក់កក់ ($)
                </label>
                <input
                  type="number"
                  value={deposit || ''}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ថ្ងៃចូលនៅ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

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
              {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoomFormModal;