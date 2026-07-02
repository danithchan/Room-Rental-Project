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
} from 'lucide-react';
import { getCurrentAdmin, logout } from '../services/authService';

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

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
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

function Sidebar() {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const handleLogout = () => {
    if (!confirm('តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) return;
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-slate-800 flex flex-col">
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <Home size={20} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">RoomRent Manager</p>
          <p className="text-gray-400 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavSection title="មូលដ្ឋាន" items={mainItems} />
        <NavSection title="ហិរញ្ញវត្ថុ" items={financeItems} />
        <NavSection title="ផ្សេងៗ" items={settingsItems} />
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
            {admin?.fullname?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {admin?.fullname || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {admin?.username || '-'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg font-medium"
        >
          <LogOut size={16} />
          ចាកចេញ
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;