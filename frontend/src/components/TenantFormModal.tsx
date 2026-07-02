import { useState, useEffect } from 'react';
import type { Tenant, TenantInput } from '../services/tenantService';

interface TenantFormModalProps {
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (data: TenantInput) => Promise<void>;
}

function TenantFormModal({ tenant, onClose, onSubmit }: TenantFormModalProps) {
  const isEditMode = !!tenant;

  const [formData, setFormData] = useState<TenantInput>({
    fullname: tenant?.fullname || '',
    gender: tenant?.gender || 'M',
    phone: tenant?.phone || '',
    idcardnumber: tenant?.idcardnumber || '',
    address: tenant?.address || '',
    username: tenant?.username || '',
    password: '',                     
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setFormData({
      fullname: tenant?.fullname || '',
      gender: tenant?.gender || 'M',
      phone: tenant?.phone || '',
      idcardnumber: tenant?.idcardnumber || '',
      address: tenant?.address || '',
      username: tenant?.username || '',
      password: '',
    });
    setError(null);
  }, [tenant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const cleanFullname = formData.fullname.trim();
    const cleanPhone = formData.phone.trim();
    const cleanUsername = formData.username?.trim().toLowerCase() || ''; 
    if (!cleanFullname) {
      setError('សូមបញ្ចូលឈ្មោះអ្នកជួល');
      return;
    }
    if (!cleanPhone) {
      setError('សូមបញ្ចូលលេខទូរស័ព្ទ');
      return;
    }
    if (!cleanUsername) {
      setError('សូមបញ្ចូល Username សម្រាប់គណនីអ្នកជួល');
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError('Username អាចប្រើបានតែអក្សរ លេខ និងសញ្ញាដាច់ ( _ ) ប៉ុណ្ណោះ (មិនអនុញ្ញាតឱ្យដកឃ្លាឡើយ)');
      return;
    }

    if (!isEditMode && !formData.password?.trim()) {
      setError('សូមបញ្ចូល Password សម្រាប់គណនីអ្នកជួលថ្មី');
      return;
    }
    const finalData: TenantInput = {
      fullname: cleanFullname,
      gender: formData.gender,
      phone: cleanPhone,
      idcardnumber: formData.idcardnumber ? formData.idcardnumber.trim() : '',
      address: formData.address ? formData.address.trim() : '',
      username: cleanUsername,
      password: formData.password ? formData.password.trim() : '' 
    };
    if (formData.password?.trim()) {
      finalData.password = formData.password.trim();
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(finalData);
      onClose();
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      setError(serverError || (isEditMode ? 'មិនអាចកែប្រែបានទេ' : 'មិនអាចបន្ថែមបានទេ'));
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
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'កែប្រែព័ត៌មានអ្នកជួល' : 'បន្ថែមអ្នកជួលថ្មី'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
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
              ឈ្មោះពេញ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="ឧ. ចាន់ ដារ៉ា"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ភេទ</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="M">ប្រុស</option>
              <option value="F">ស្រី</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              placeholder="ឧ. chandara123"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? "ទុកទទេបើមិនចង់ប្តូរ" : "••••••••"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              លេខទូរស័ព្ទ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="012 345 678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              លេខអត្តសញ្ញាណប័ណ្ណ
            </label>
            <input
              type="text"
              name="idcardnumber"
              value={formData.idcardnumber}
              onChange={handleChange}
              placeholder="123456789"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">អាសយដ្ឋាន</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="ភ្នំពេញ"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TenantFormModal;