import { FormEvent, useEffect, useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDefaultRoute, getViewerAccess, setViewerAccess } from '../lib/access';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const access = getViewerAccess();
    if (access) {
      navigate(getDefaultRoute(access), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Vui lòng nhập email để tiếp tục.');
      return;
    }

    const access = setViewerAccess(email);
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
            Nhập email để vào đúng giao diện sử dụng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Email truy cập
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

        <div className="mt-6 rounded-2xl bg-slate-50/80 px-5 py-4 text-sm font-medium leading-relaxed text-slate-600">
          Email <strong>daotao@peopleone.com.vn</strong> sẽ vào giao diện quản lý. Các email khác sẽ vào giao diện học viên.
        </div>
      </div>
    </div>
  );
}
