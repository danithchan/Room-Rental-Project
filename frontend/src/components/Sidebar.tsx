import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Wallet,
  Wrench,
  FileText,
  LogOut,
  Home,
  User,
  X,
} from 'lucide-react';
import { getCurrentAdmin, logout, getAvatarUrl } from '../services/authService';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const mainItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  { name: 'បន្ទប់', path: '/rooms', icon: <DoorOpen size={18} /> },
  { name: 'អ្នកជួល', path: '/tenants', icon: <Users size={18} /> },
];

const financeItems: NavItem[] = [
  { name: 'ការទូទាត់', path: '/invoices', icon: <Wallet size={18} /> },
  { name: 'ការជួសជុល', path: '/maintenance', icon: <Wrench size={18} /> },
];

const settingsItems: NavItem[] = [
  { name: 'កិច្ចសន្យា', path: '/contracts', icon: <FileText size={18} /> },
  { name: 'ប្រវត្តិរូប', path: '/profile', icon: <User size={18} /> },
];

function NavSection({ title, items, onNavigate }: { title: string; items: NavItem[]; onNavigate: () => void }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink-400 text-white'
                  : 'text-black dark:text-gray-200 hover:bg-pink-200 dark:hover:bg-gray-700'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!admin?.adminid) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/${admin.adminid}`)
      .then((r) => r.json())
      .then((data) => {
        setAvatarUrl(getAvatarUrl(data.avatarurl));
      })
      .catch(() => {});
  }, [admin?.adminid]);

  const handleLogout = () => {
    if (!confirm('តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) return;
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-pink-100 dark:bg-gray-800 border-r border-pink-100 dark:border-gray-700 flex flex-col text-black dark:text-white transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
      <div className="px-6 py-5 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-400 flex items-center justify-center text-white shrink-0">
            <Home size={20} />
          </div>
          <div>
            <p className="text-black dark:text-white font-semibold text-sm">RoomRent Manager</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-pink-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="បិទ Sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavSection title="មូលដ្ឋាន" items={mainItems} onNavigate={onClose} />
        <NavSection title="ហិរញ្ញវត្ថុ" items={financeItems} onNavigate={onClose} />
        <NavSection title="ផ្សេងៗ" items={settingsItems} onNavigate={onClose} />
      </nav>

      <div className="px-6 py-4 border-t border-pink-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={admin?.fullname || 'Admin'}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-pink-300 flex items-center justify-center text-white font-medium text-sm shrink-0">
              {admin?.fullname?.[0] || 'A'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {admin?.fullname || 'Admin'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {admin?.username || '-'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm bg-pink-200 dark:bg-gray-700 hover:bg-pink-300 dark:hover:bg-gray-600 text-black dark:text-white py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut size={16} />
          ចាកចេញ
        </button>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;