import { useEffect, useState } from 'react';
import { Plus, Calendar, Wallet, Trash2 } from 'lucide-react';
import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  type Maintenance,
  type MaintenanceInput,
} from '../services/maintenanceService';
import MaintenanceFormModal from '../components/MaintenanceFormModal';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    Pending: { label: 'កំពុងរង់ចាំ', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    InProgress: { label: 'កំពុងជួសជុល', className: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' },
    Done: { label: 'រួចរាល់', className: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
  };
  const { label, className } = config[status] || config.Pending;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${className}`}>
      {label}
    </span>
  );
}

interface MaintenanceCardProps {
  item: Maintenance;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

function MaintenanceCard({ item, onStatusChange, onDelete }: MaintenanceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">បន្ទប់ {item.roomnumber}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(item.reportdate).toLocaleDateString('en-GB')}
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet size={14} />
          {item.cost ? `$${item.cost}` : 'មិនទាន់កំណត់ថ្លៃ'}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        {item.status !== 'Done' && (
          <button
            onClick={() =>
              onStatusChange(
                item.maintenanceid,
                item.status === 'Pending' ? 'InProgress' : 'Done'
              )
            }
            className="flex-1 text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 py-2 rounded-lg font-medium"
          >
            {item.status === 'Pending' ? 'ចាប់ផ្តើមជួសជុល' : 'បានជួសជុលរួច'}
          </button>
        )}
        <button
          onClick={() => onDelete(item.maintenanceid)}
          className="text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg font-medium"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function Maintenance() {
  const [items, setItems] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMaintenance();
      setItems(data);
    } catch (err) {
      setError('មិនអាចទាញទិន្នន័យបានទេ។ សូមពិនិត្យ Backend Server។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const handleCreate = async (data: MaintenanceInput) => {
    const newItem = await createMaintenance(data);
    setItems((prev) => [...prev, newItem]);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await updateMaintenance(id, { status });
      setItems((prev) =>
        prev.map((item) => (item.maintenanceid === updated.maintenanceid ? updated : item))
      );
    } catch (err) {
      alert('មិនអាចកែប្រែបានទេ');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបការជួសជុលនេះមែនទេ?')) return;
    try {
      await deleteMaintenance(id);
      setItems((prev) => prev.filter((item) => item.maintenanceid !== id));
    } catch (err) {
      alert('មិនអាចលុបបានទេ');
      console.error(err);
    }
  };

  const pendingCount = items.filter((m) => m.status !== 'Done').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">ការជួសជុល</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? 'កំពុងផ្ទុកទិន្នន័យ...' : `មាន ${pendingCount} ការជួសជុលកំពុងរង់ចាំ ឬកំពុងដំណើរការ`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={16} />
          រាយការណ៍ការខូចខាត
        </button>
      </div>

      {loading && <p className="text-gray-500 dark:text-gray-400 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">មិនទាន់មានការជួសជុលនៅឡើយទេ</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <MaintenanceCard
              key={item.maintenanceid}
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <MaintenanceFormModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

export default Maintenance;