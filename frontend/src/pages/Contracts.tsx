import { useEffect, useState } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
import {
  getContracts,
  deleteContract,
  updateContract,
  type Contract,
} from '../services/contractService';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    Active: { label: 'កំពុងដំណើរការ', className: 'bg-green-100 text-green-700' },
    Expiring: { label: 'ជិតផុតកំណត់', className: 'bg-amber-100 text-amber-700' },
    Ended: { label: 'ផុតកំណត់', className: 'bg-gray-100 text-gray-600' },
  };
  const { label, className } = config[status] || config.Ended;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${className}`}>
      {label}
    </span>
  );
}

function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContracts();
      setContracts(data);
    } catch (err) {
      setError('មិនអាចទាញទិន្នន័យកិច្ចសន្យាបានទេ។ សូមពិនិត្យ Backend Server។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleEnd = async (contract: Contract) => {
    if (!confirm(`តើអ្នកប្រាកដជាចង់បញ្ចប់កិច្ចសន្យានេះមែនទេ?`)) return;
    try {
      const updated = await updateContract(contract.contractid, {
        startdate: contract.startdate,
        enddate: contract.enddate || undefined,
        deposit: Number(contract.deposit),
        status: 'Ended',
      });
      setContracts((prev) =>
        prev.map((c) => (c.contractid === updated.contractid ? updated : c))
      );
    } catch (err) {
      alert('មិនអាចបញ្ចប់កិច្ចសន្យាបានទេ');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបកិច្ចសន្យានេះមែនទេ?')) return;
    try {
      await deleteContract(id);
      setContracts((prev) => prev.filter((c) => c.contractid !== id));
    } catch (err) {
      alert('មិនអាចលុបបានទេ');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">កិច្ចសន្យាជួល</h1>
          <p className="text-gray-500 mt-1">គ្រប់គ្រងកិច្ចសន្យាជួលរបស់អ្នកនៅទីនេះ</p>
        </div>
      </div>

      {loading && <p className="text-gray-500 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && contracts.length === 0 && (
        <p className="text-gray-500 text-center py-10">មិនទាន់មានកិច្ចសន្យានៅឡើយទេ</p>
      )}

      {!loading && !error && contracts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-500">អ្នកជួល</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">បន្ទប់</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">ថ្ងៃចាប់ផ្តើម</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">ថ្ងៃបញ្ចប់</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">ប្រាក់កក់</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">ស្ថានភាព</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.contractid} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.tenantname}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.roomnumber}</td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(c.startdate)}</td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(c.enddate)}</td>
                  <td className="px-5 py-3.5 text-gray-600">${c.deposit}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {c.status === 'Active' && (
                        <button
                          onClick={() => handleEnd(c)}
                          className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md font-medium"
                        >
                          <CheckCircle2 size={13} />
                          បញ្ចប់
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.contractid)}
                        className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md font-medium"
                      >
                        <Trash2 size={13} />
                        លុប
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Contracts;