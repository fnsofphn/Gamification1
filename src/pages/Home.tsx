import { FormEvent, useEffect, useState } from 'react';
import { Mail, ArrowRight, User, Building2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDefaultRoute, getViewerAccess, setViewerAccess } from '../lib/access';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    const access = getViewerAccess();
    if (access) {
      navigate(getDefaultRoute(access), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !isValidEmail(email)) {
      setError('Vui lòng nhập đúng định dạng email.');
      return;
    }

    if (!displayName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    const access = setViewerAccess({
      email,
      displayName,
      unitName,
    });
    const nextPath = location.state?.from || getDefaultRoute(access);
    navigate(nextPath, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="card-3d w-full max-w-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm leading-tight">
            Vinabrain Gamification
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed font-medium">
            Xin chào! Mời bạn nhập thông tin để tham gia tương tác!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Email
            </span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white/80 px-4 shadow-inner">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                placeholder="name@example.com"
                className="w-full bg-transparent px-3 py-4 text-base font-medium text-slate-800 outline-none"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Họ và tên
            </span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white/80 px-4 shadow-inner">
              <User className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Nhập họ và tên"
                className="w-full bg-transparent px-3 py-4 text-base font-medium text-slate-800 outline-none"
                autoComplete="name"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Đơn vị
            </span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white/80 px-4 shadow-inner">
              <Building2 className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={unitName}
                onChange={(event) => setUnitName(event.target.value)}
                placeholder="Nhập đơn vị hoặc cửa hàng"
                className="w-full bg-transparent px-3 py-4 text-base font-medium text-slate-800 outline-none"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-3d-orange w-full py-4 text-lg">
            Tiếp tục
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
