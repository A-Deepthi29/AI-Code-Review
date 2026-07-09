import { Outlet, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Review New Code', path: '/dashboard', icon: '💻' },
    { name: 'Review History', path: '/dashboard/history', icon: '📜' },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h1 className="font-bold text-lg bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AI Code Reviewer
            </h1>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* USER UTILITY PROFILE BLOCK */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              D
            </div>
            <span className="text-sm font-medium text-slate-300">Deepthi</span>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Log Out">
            🚪
          </button>
        </div>
      </aside>

      {/* DYNAMIC VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            {location.pathname === '/dashboard/history' ? 'Review History Log' : 'Workspace / Code Submission'}
          </h2>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono">
            v1.0.0-dev
          </span>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}