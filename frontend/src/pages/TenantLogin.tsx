import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Home } from 'lucide-react';
import { tenantLogin } from '../services/tenantAuthService';

function TenantLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('សូមបញ្ចូល Username និង Password');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await tenantLogin({ username, password });
      navigate('/tenant');
    } catch (err) {
      setError('Username ឬ Password មិនត្រឹមត្រូវ');
      console.error(err);
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

      <div className="relative z-10 w-full max-w-sm bg-linear-to-b from-sky-100 to-pink-300 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center text-black mb-3">
            <Home size={26} />
          </div>
          <h1 className="text-2xl font-bold text-black">Tenant Login</h1>
          <p className="text-sm text-black mt-1">RoomRent Manager — អ្នកជួល</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-white border border-red-300/40 rounded-xl p-3 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              className="w-full bg-black/15 text-black placeholder-black/70 rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:bg-white/25 transition-colors"
            />
            <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70" />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/15 text-black placeholder-black/70 rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:bg-white/25 transition-colors"
            />
            <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50 mt-2"
          >
            {submitting ? 'កំពុងចូល...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TenantLogin;