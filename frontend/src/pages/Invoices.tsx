import { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import {
  getInvoices,
  createInvoice,
  markAsPaid,
  deleteInvoice,
  type Invoice,
  type InvoiceInput,
} from '../services/invoiceService';
import InvoiceFormModal from '../components/InvoiceFormModal';

const WATER_PRICE = 0.5;
const ELECTRIC_PRICE = 0.15;

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === 'Paid';
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-md ${
        isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {isPaid ? 'បានបង់' : 'ជំពាក់'}
    </span>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError('មិនអាចទាញទិន្នន័យវិក្កយបត្របានទេ។ សូមពិនិត្យ Backend Server។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleCreate = async (data: InvoiceInput) => {
    const newInvoice = await createInvoice(data);
    setInvoices((prev) => [...prev, newInvoice]);
  };

  const handleMarkPaid = async (id: number) => {
    try {
      const updated = await markAsPaid(id);
      setInvoices((prev) =>
        prev.map((inv) => (inv.invoiceid === updated.invoiceid ? updated : inv))
      );
    } catch (err) {
      alert('មិនអាចធ្វើបានទេ');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបវិក្កយបត្រនេះមែនទេ?')) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.invoiceid !== id));
    } catch (err) {
      alert('មិនអាចលុបបានទេ');
      console.error(err);
    }
  };

  const totalUnpaid = invoices
    .filter((i) => i.paymentstatus === 'Unpaid')
    .reduce((sum, i) => sum + Number(i.totalamount), 0);
  const totalPaid = invoices
    .filter((i) => i.paymentstatus === 'Paid')
    .reduce((sum, i) => sum + Number(i.totalamount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">វិក្កយបត្រ</h1>
          <p className="text-gray-500 mt-1">គ្រប់គ្រងវិក្កយបត្រទឹក-ភ្លើងប្រចាំខែ</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          បង្កើតវិក្កយបត្រថ្មី
        </button>
      </div>

      {loading && <p className="text-gray-500 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">វិក្កយបត្រសរុប</p>
              <p className="text-2xl font-semibold text-gray-800">{invoices.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">បានបង់</p>
              <p className="text-2xl font-semibold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">ជំពាក់</p>
              <p className="text-2xl font-semibold text-red-600">${totalUnpaid.toFixed(2)}</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-10">មិនទាន់មានវិក្កយបត្រនៅឡើយទេ</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-medium text-gray-500">អ្នកជួល</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">បន្ទប់</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">ថ្ងៃខែ</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">ទឹក (Unit)</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">ភ្លើង (Unit)</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">សរុប</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">ស្ថានភាព</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceid} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{inv.tenantname}</td>
                      <td className="px-5 py-3.5 text-gray-600">{inv.roomnumber}</td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(inv.invoicedate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {inv.newwatermeter - inv.oldwatermeter}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {inv.newelectricmeter - inv.oldelectricmeter}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">${inv.totalamount}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.paymentstatus} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {inv.paymentstatus === 'Unpaid' && (
                            <button
                              onClick={() => handleMarkPaid(inv.invoiceid)}
                              className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md font-medium"
                            >
                              <CheckCircle2 size={13} />
                              បានបង់
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(inv.invoiceid)}
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

          <p className="text-xs text-gray-400 mt-3">
            * តម្លៃទឹក ${WATER_PRICE}/Unit · តម្លៃភ្លើង ${ELECTRIC_PRICE}/Unit
          </p>
        </>
      )}

      {showModal && (
        <InvoiceFormModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

export default Invoices;