import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-slate-800 py-3 px-6 text-[10px] text-slate-500 bg-slate-900/30 flex justify-between">
          <span>SentinelNet Platform &copy; 2026 | Enterprise Control System</span>
          <span className="font-mono">VER-1.0.0-PROTOTYPE</span>
        </footer>
      </div>
    </div>
  );
}
