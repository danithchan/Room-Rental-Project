import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, ArrowLeft } from 'lucide-react';
import api from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [adminId, setAdminId] = useState<number | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const handleVerifyUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('សូមបញ្ចូល Username');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post<{ message: string; adminid: number }>(
        '/admin/forgot-password',
        { username }
      );
      setAdminId(response.data.adminid);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'រកមិនឃើញ Username នេះទេ');
    } finally {
      setSubmitting(false);
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('សូមបញ្ចូលគ្រប់ Field');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password មិនត្រូវគ្នា');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/reset-password', { adminid: adminId, newPassword });
      setSuccess('កំណត់ Password ថ្មីជោគជ័យ! សូម Login ឡើងវិញ');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'មិនអាចកំណត់ Password ថ្មីបានទេ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-linear-to-b from-sky-200 via-sky-100 to-pink-300">
      <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl" />
      <div className="absolute top-24 left-32 w-24 h-12 bg-white/30 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-16 w-40 h-20 bg-white/30 rounded-full blur-xl" />
      <div className="absolute bottom-32 right-40 w-24 h-12 bg-white/40 rounded-full blur-xl" />
      <div className="absolute top-1/3 right-10 w-28 h-14 bg-white/20 rounded-full blur-xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-linear-to-b from-sky-100 to-pink-300 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center text-black mb-3">
            <KeyRound size={26} />
          </div>
          <h1 className="text-2xl font-bold text-black">ភ្លេចពាក្យសម្ងាត់</h1>
          <p className="text-sm text-black mt-1 text-center">
            {step === 1
              ? 'សូមបញ្ចូល Username ដើម្បីបញ្ជាក់គណនី'
              : 'សូមកំណត់ Password ថ្មីរបស់អ្នក'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-white border border-red-300/40 rounded-xl p-3 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 text-white border border-green-300/40 rounded-xl p-3 text-sm mb-4 text-center">
            {success}
          </div>
        )}

        {step === 1 && !success && (
          <form onSubmit={handleVerifyUsername} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoFocus
                className="w-full bg-black/15 text-black placeholder-black/70 rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:bg-white/25 transition-colors"
              />
              <KeyRound
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'បន្ត'}
            </button>
          </form>
        )}

        {step === 2 && !success && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password ថ្មី"
                autoFocus
                className="w-full bg-black/15 text-black placeholder-black/70 rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:bg-white/25 transition-colors"
              />
              <Lock
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="បញ្ជាក់ Password ថ្មី"
                className="w-full bg-black/15 text-black placeholder-black/70 rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:bg-white/25 transition-colors"
              />
              <Lock
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? 'កំពុងកំណត់...' : 'កំណត់ Password ថ្មី'}
            </button>
          </form>
        )}

        <Link
          to="/login"
          style={{
            textDecoration: 'none',
            color: '#333',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '18px',
          }}
        >
          <ArrowLeft size={14} />
          ត្រលប់ទៅ Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;