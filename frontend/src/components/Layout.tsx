import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

function Layout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex bg-pink-0 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-8 text-black dark:text-white relative">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-8 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;