import { Link } from 'react-router-dom';
import { PlayCircle, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in-up">
      <div className="text-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
          Nền tảng gamification lấy ý kiến và tổng hợp phản hồi sau đào tạo
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm leading-tight">
          Xây thư viện game, thu ý kiến học viên, phân tích bằng AI và export dữ liệu ngay trên web
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
          Học viên chỉ cần vào link, chọn game, nhập tên, chơi trong thời gian giới hạn và nộp bài.
          Quản trị viên có thể xem tổng hợp ý kiến, gọi Gemini để phân tích chủ đề nổi bật và xuất dữ
          liệu từ từng game.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <Link to="/games" className="btn-3d-orange px-8 py-4 text-lg w-full sm:w-auto">
            <PlayCircle className="mr-2 w-6 h-6" />
            Tham gia game
          </Link>
          <Link to="/dashboard" className="btn-3d-blue px-8 py-4 text-lg w-full sm:w-auto">
            <LayoutDashboard className="mr-2 w-6 h-6" />
            Quản trị game
          </Link>
        </div>
      </div>
    </div>
  );
}
