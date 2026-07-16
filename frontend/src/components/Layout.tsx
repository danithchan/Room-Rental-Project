import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex bg-pink-0 min-h-screen">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-8 text-black">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;