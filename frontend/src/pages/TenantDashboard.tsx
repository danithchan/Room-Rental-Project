import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Wrench, FileText, Wallet, QrCode, MessageSquare } from 'lucide-react'; // 💡 បន្ថែម MessageSquare Icon
import {
  fetchTenantProfile,
  tenantLogout,
  reportMaintenance,
  type TenantProfile,
} from '../services/tenantAuthService';
import myQrImage from '../assets/my QR/photo_2026-07-02_19-30-11.jpg';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    Active: { label: 'សកម្ម', className: 'bg-green-100 text-green-700' },
    Ended: { label: 'បានបញ្ចប់', className: 'bg-gray-100 text-gray-600' },
    Paid: { label: 'បានបង់', className: 'bg-green-100 text-green-700' },
    Unpaid: { label: 'ជំពាក់', className: 'bg-red-100 text-red-700' },
  };
  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${className}`}>
      {label}
    </span>
  );
}

function TenantDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [description, setDescription] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTenantProfile();
        setProfile(data);
      } catch (err) {
        setError('មិនអាចទាញព័ត៌មានបានទេ');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    if (!confirm('តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) return;
    tenantLogout();
    navigate('/tenant/login');
  };

  const activeContract = profile?.contracts?.find((c) => c.status === 'Active');
  const allInvoices = activeContract?.invoices || [];
  const unpaidTotal = allInvoices
    .filter((i) => i.paymentstatus === 'Unpaid')
    .reduce((sum, i) => sum + Number(i.totalamount), 0);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !activeContract) return;

    try {
      setReporting(true);
      await reportMaintenance(description, activeContract.roomid);
      setReportMsg('រាយការណ៍ជោគជ័យ! Admin នឹងពិនិត្យឆាប់ៗនេះ');
      setDescription('');
      setTimeout(() => {
        setShowReport(false);
        setReportMsg(null);
      }, 2000);
    } catch (err) {
      setReportMsg('មិនអាចរាយការណ៍បានទេ');
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  const handleOpenPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <p className="text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <p className="text-red-500">{error || 'មិនអាចទាញព័ត៌មានបានទេ'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-800">សួស្តី, {profile.fullname}</p>
            {activeContract && (
              <p className="text-sm text-gray-500 mt-0.5">
                បន្ទប់ {activeContract.roomnumber} · {activeContract.room?.roomtype || ''}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto shrink-0"
          >
            <LogOut size={14} />
            ចាកចេញ
          </button>
        </div>

        {!activeContract ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Home size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">អ្នកមិនមានកិច្ចសន្យាសកម្មនៅពេលនេះទេ</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">ស្ថានភាពកិច្ចសន្យា</p>
                <StatusBadge status={activeContract.status} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">ថ្ងៃផុតកំណត់</p>
                <p className="font-semibold text-gray-800">
                  {activeContract.enddate
                    ? new Date(activeContract.enddate).toLocaleDateString('en-GB')
                    : '-'}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">ជំពាក់សរុប</p>
                <p className="font-semibold text-red-600">${unpaidTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Wrench size={14} />
                រាយការណ៍ការខូចខាត
              </button>
              <a
                href={import.meta.env.VITE_TELEGRAM_ADMIN}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                <MessageSquare size={14} />
                ទាក់ទង Admin (Telegram)
              </a>
            </div>

            {/* Contract Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={16} />
                ព័ត៌មានកិច្ចសន្យា
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">ថ្ងៃចូលនៅ</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(activeContract.startdate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">ប្រាក់កក់</p>
                  <p className="text-gray-800 font-medium">${activeContract.deposit}</p>
                </div>
                <div>
                  <p className="text-gray-500">តម្លៃជួល</p>
                  <p className="text-gray-800 font-medium">${activeContract.room?.price || '-'}/ខែ</p>
                </div>
                <div>
                  <p className="text-gray-500">ប្រភេទបន្ទប់</p>
                  <p className="text-gray-800 font-medium">{activeContract.room?.roomtype || '-'}</p>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet size={16} />
                វិក្កយបត្ររបស់ខ្ញុំ
              </h2>
              {allInvoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">មិនទាន់មានវិក្កយបត្រទេ</p>
              ) : (
                <div className="space-y-3">
                  {allInvoices.map((inv) => (
                    <div
                      key={inv.invoiceid}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(inv.invoicedate).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-xs text-gray-500">
                          ទឹក {inv.newwatermeter - inv.oldwatermeter}U · ភ្លើង{' '}
                          {inv.newelectricmeter - inv.oldelectricmeter}U
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-medium text-gray-800">${inv.totalamount}</p>
                          <StatusBadge status={inv.paymentstatus} />
                        </div>
                        {inv.paymentstatus === 'Unpaid' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-md font-medium"
                          >
                            <QrCode size={13} />
                            បង់ប្រាក់
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Payment Modal */}
        {showPayment && selectedInvoice && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayment(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ស្កេនដើម្បីទូទាត់ប្រាក់</h2>
                <p className="text-xs text-gray-400">សូមស្កេនតាមរយៈ App ធនាគាររបស់អ្នក</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500">ទឹកប្រាក់ត្រូវបង់</p>
                <p className="text-xl font-bold text-gray-800 mt-0.5">${selectedInvoice.totalamount}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-dashed border-gray-200">
                <img
                  src={myQrImage}
                  alt="ABA KHQR"
                  className="w-40 h-44 object-contain bg-white p-2 rounded-lg shadow-xs"
                />
                <a
                  href={import.meta.env.VITE_ABA_PAY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors mt-4"
                >
                  📱 បើកកម្មវិធី ABA ដើម្បីទូទាត់ប្រាក់
                </a>
              </div>

              <div className="text-[11px] bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-100">
                <strong>បញ្ជាក់៖</strong> បន្ទាប់ពីវេរប្រាក់ជោគជ័យ សូមផ្ញើរូបភាពចុងសន្លឹកទៅកាន់ Admin តាម Telegram ដើម្បីឱ្យ Admin ធ្វើការ Approve ក្នុងប្រព័ន្ធ biographies ។
              </div>

              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="w-full text-sm bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg font-medium"
              >
                ខ្ញុំបានបង់ប្រាក់រួចរាល់
              </button>
            </div>
          </div>
        )}
        {showReport && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReport(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">រាយការណ៍ការខូចខាត</h2>

              {reportMsg && (
                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm mb-4">
                  {reportMsg}
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ឧ. អំពូលភ្លើងបែក"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReport(false)}
                    className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
                  >
                    {reporting ? 'កំពុងផ្ញើ...' : 'រាយការណ៍'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TenantDashboard;