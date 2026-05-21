import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { MobileNav } from '../MobileNav/MobileNav';
import { Aurora } from '../Aurora/Aurora';

export function AppLayout() {
  return (
    <div className="h-screen flex bg-background overflow-hidden relative isolate">
      <Aurora />

      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-60 relative z-[1]">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
