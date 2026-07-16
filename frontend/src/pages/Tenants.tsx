import { useEffect, useState } from 'react';
import { Phone, IdCard, MapPin, Pencil, Trash2, Plus } from 'lucide-react';
import {
  getTenants,
  deleteTenant,
  createTenant,
  updateTenant,
  type Tenant,
  type TenantInput,
} from '../services/tenantService';
import TenantFormModal from '../components/TenantFormModal';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-medium text-sm shrink-0">
      {initials}
    </div>
  );
}

interface TenantCardProps {
  tenant: Tenant;
  onDelete: (id: number) => void;
  onEdit: (tenant: Tenant) => void;
}

function TenantCard({ tenant, onDelete, onEdit }: TenantCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={tenant.fullname} />
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">{tenant.fullname}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tenant.gender === 'M' ? 'ប្រុស' : tenant.gender === 'F' ? 'ស្រី' : '-'}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Phone size={14} /> ទូរស័ព្ទ
          </span>
          <span className="text-gray-800 dark:text-gray-200">{tenant.phone}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <IdCard size={14} /> អត្តសញ្ញាណប័ណ្ណ
          </span>
          <span className="text-gray-800 dark:text-gray-200">{tenant.idcardnumber || '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <MapPin size={14} /> អាសយដ្ឋាន
          </span>
          <span className="text-gray-800 dark:text-gray-200">{tenant.address || '-'}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(tenant)}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 py-2 rounded-lg font-medium"
        >
          <Pencil size={14} />
          កែប្រែ
        </button>
        <button
          onClick={() => onDelete(tenant.tenantid)}
          className="text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg font-medium"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      setError('មិនអាចទាញទិន្នន័យអ្នកជួលបានទេ។ សូមពិនិត្យ Backend Server។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបអ្នកជួលនេះមែនទេ?')) return;
    try {
      await deleteTenant(id);
      setTenants((prev) => prev.filter((t) => t.tenantid !== id));
    } catch (err) {
      alert('មិនអាចលុបបានទេ។ អ្នកជួលនេះអាចមានកិច្ចសន្យាភ្ជាប់ស្រាប់។');
      console.error(err);
    }
  };

  const handleFormSubmit = async (data: TenantInput) => {
    if (editingTenant) {
      const updated = await updateTenant(editingTenant.tenantid, data);
      setTenants((prev) =>
        prev.map((t) => (t.tenantid === updated.tenantid ? updated : t))
      );
    } else {
      const newTenant = await createTenant(data);
      setTenants((prev) => [...prev, newTenant]);
    }
  };

  const openAddModal = () => {
    setEditingTenant(null);
    setShowModal(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">គ្រប់គ្រងអ្នកជួល</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">គ្រប់គ្រងព័ត៌មានអ្នកជួលរបស់អ្នកនៅទីនេះ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          បន្ថែមអ្នកជួលថ្មី
        </button>
      </div>

      {loading && <p className="text-gray-500 dark:text-gray-400 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && tenants.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">មិនទាន់មានអ្នកជួលនៅឡើយទេ</p>
      )}

      {!loading && !error && tenants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.tenantid}
              tenant={tenant}
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TenantFormModal
          tenant={editingTenant}
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default Tenants;