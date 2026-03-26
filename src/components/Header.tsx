import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clearViewerAccess, getDefaultRoute, getViewerAccess } from '../lib/access';

export default function Header() {
  const navigate = useNavigate();
  const access = getViewerAccess();
  const homePath = access ? getDefaultRoute(access) : '/';

  return (
    <header className="w-full py-6 px-4 md:px-8 animate-fade-in-up z-50 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link
          to={homePath}
          className="text-4xl md:text-5xl vinabrain-logo drop-shadow-md hover:scale-105 transition-transform duration-300"
        >
          VINABRAIN
        </Link>

        {access && (
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {access.role === 'manager' ? 'Quản lý' : 'Học viên'}
              </div>
              <div className="text-sm font-semibold text-slate-700">{access.email}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearViewerAccess();
                navigate('/');
              }}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đổi email
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
