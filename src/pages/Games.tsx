import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, MessageSquareText } from 'lucide-react';
import { gamesService } from '../services/games.service';
import { Database } from '../types/database';

type Game = Database['public']['Tables']['games']['Row'];

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamesService
      .getActiveGames()
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-blue-600 font-bold text-xl">
        Đang tải thư viện game...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 drop-shadow-sm">
          Thư viện gamification
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Chọn một game để bắt đầu. Bạn có thể thêm thêm game mới trong khu vực quản trị.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div key={game.id} className="card-3d p-6 flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold shadow-inner">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {Math.floor(game.duration_seconds / 60)} phút
                </div>
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100/80 text-orange-700 text-xs font-bold shadow-inner">
                  <MessageSquareText className="w-3.5 h-3.5 mr-1.5" />
                  Thu thập ý kiến
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-3 line-clamp-2 leading-tight">
                {game.title}
              </h2>
              <p className="text-slate-600 text-sm mb-6 line-clamp-4 font-medium leading-relaxed">
                {game.short_description}
              </p>
            </div>
            <Link to={`/games/${game.slug}`} className="btn-3d-orange w-full py-3.5 mt-auto text-lg">
              <PlayCircle className="mr-2 w-5 h-5" />
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
