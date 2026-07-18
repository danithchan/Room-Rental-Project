import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

function Layout() {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-pink-0 dark:bg-gray-900 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 text-black dark:text-white relative">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition"
            aria-label="បើក Sidebar"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <button
          onClick={toggleTheme}
          className="hidden lg:block absolute top-4 right-8 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;