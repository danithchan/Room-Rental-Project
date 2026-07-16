import { useEffect, useState } from 'react';
import type { InvoiceInput } from '../services/invoiceService';
import { getContracts, type Contract } from '../services/contractService';

interface InvoiceFormModalProps {
  onClose: () => void;
  onSubmit: (data: InvoiceInput) => Promise<void>;
}

const WATER_PRICE = 0.5;
const ELECTRIC_PRICE = 0.15;

function InvoiceFormModal({ onClose, onSubmit }: InvoiceFormModalProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const [formData, setFormData] = useState<InvoiceInput>({
    invoicedate: new Date().toISOString().split('T')[0],
    contractid: 0,
    oldwatermeter: 0,
    newwatermeter: 0,
    oldelectricmeter: 0,
    newelectricmeter: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const data = await getContracts();
        const activeOnly = data.filter((c) => c.status === 'Active');
        setContracts(activeOnly);
        if (activeOnly.length > 0) {
          setFormData((prev) => ({ ...prev, contractid: activeOnly[0].contractid }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContracts(false);
      }
    };
    loadContracts();
  }, []);

  const selectedContract = contracts.find((c) => c.contractid === formData.contractid);
  const roomPrice = selectedContract?.room?.price ? Number(selectedContract.room.price) : 0;
  const waterUsage = Math.max(0, formData.newwatermeter - formData.oldwatermeter);
  const electricUsage = Math.max(0, formData.newelectricmeter - formData.oldelectricmeter);
  const estimatedTotal = roomPrice + waterUsage * WATER_PRICE + electricUsage * ELECTRIC_PRICE;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'contractid' ? Number(value) : name === 'invoicedate' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contractid) {
      setError('សូមជ្រើសរើសកិច្ចសន្យា');
      return;
    }
    if (formData.newwatermeter < formData.oldwatermeter) {
      setError('លេខកុងទ័រទឹកថ្មីត្រូវធំជាងចាស់');
      return;
    }
    if (formData.newelectricmeter < formData.oldelectricmeter) {
      setError('លេខកុងទ័រភ្លើងថ្មីត្រូវធំជាងចាស់');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError('មិនអាចបង្កើតវិក្កយបត្របានទេ');
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
          <h2 className="text-lg font-semibold text-gray-800">បង្កើតវិក្កយបត្រថ្មី</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loadingContracts ? (
          <p className="text-gray-500 text-center py-6">កំពុងផ្ទុកទិន្នន័យ...</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            មិនទាន់មានកិច្ចសន្យាដែលកំពុង Active ទេ
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ជ្រើសរើសកិច្ចសន្យា <span className="text-red-500">*</span>
              </label>
              <select
                name="contractid"
                value={formData.contractid}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contracts.map((c) => (
                  <option key={c.contractid} value={c.contractid}>
                    {c.tenantname} — បន្ទប់ {c.roomnumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ថ្ងៃខែ</label>
              <input
                type="date"
                name="invoicedate"
                value={formData.invoicedate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  លេខទឹកចាស់
                </label>
                <input
                  type="number"
                  name="oldwatermeter"
                  value={formData.oldwatermeter}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  លេខទឹកថ្មី
                </label>
                <input
                  type="number"
                  name="newwatermeter"
                  value={formData.newwatermeter}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  លេខភ្លើងចាស់
                </label>
                <input
                  type="number"
                  name="oldelectricmeter"
                  value={formData.oldelectricmeter}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  លេខភ្លើងថ្មី
                </label>
                <input
                  type="number"
                  name="newelectricmeter"
                  value={formData.newelectricmeter}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>តម្លៃបន្ទប់</span>
                <span>${roomPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>ទឹក ({waterUsage} Unit × ${WATER_PRICE})</span>
                <span>${(waterUsage * WATER_PRICE).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>ភ្លើង ({electricUsage} Unit × ${ELECTRIC_PRICE})</span>
                <span>${(electricUsage * ELECTRIC_PRICE).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-700 border-t border-blue-200 pt-2">
                <span>សរុប</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
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
                {submitting ? 'កំពុងរក្សាទុក...' : 'បង្កើតវិក្កយបត្រ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default InvoiceFormModal;