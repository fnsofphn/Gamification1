import { Link } from 'react-router-dom';
import { PlayCircle, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in-up">
      <div className="text-center max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm leading-tight">
          Nền tảng gamification
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
          Thu thập ý kiến, tổng hợp kết quả và phân tích bằng AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <Link to="/games" className="btn-3d-orange px-8 py-4 text-lg w-full sm:w-auto">
            <PlayCircle className="mr-2 w-6 h-6" />
            Thư viện game
          </Link>
          <Link to="/dashboard" className="btn-3d-blue px-8 py-4 text-lg w-full sm:w-auto">
            <LayoutDashboard className="mr-2 w-6 h-6" />
            Quản trị
          </Link>
        </div>
      </div>
    </div>
  );
}
