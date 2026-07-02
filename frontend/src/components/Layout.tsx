import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;