import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, PlayCircle, BarChart2 } from 'lucide-react';
import { gamesService } from '../services/games.service';
import { Database } from '../types/database';

type Game = Database['public']['Tables']['games']['Row'];

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGame() {
      if (!slug) return;
      try {
        const data = await gamesService.getGameBySlug(slug);
        setGame(data);
      } catch (error) {
        console.error('Failed to load game:', error);
        navigate('/games');
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [slug, navigate]);

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-blue-600 font-bold text-xl">Đang tải game...</div>;
  }

  if (!game) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <Link to="/games" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="mr-2 w-4 h-4" />
        Quay lại thư viện
      </Link>

      <div className="card-3d p-8 md:p-12">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-6 shadow-inner">
          <Clock className="w-4 h-4 mr-2" />
          Thời gian: {Math.floor(game.duration_seconds / 60)} phút
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 leading-tight drop-shadow-sm">
          {game.title}
        </h1>
        <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">{game.short_description}</p>

        <div className="bg-blue-50/60 border border-blue-100/50 p-6 rounded-2xl mb-10 shadow-inner">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Hướng dẫn tham gia</h3>
          <div className="whitespace-pre-wrap text-blue-800/80 font-medium leading-relaxed">
            {game.instructions}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          <Link to={`/games/${game.slug}/join`} className="btn-3d-orange flex-1 py-4 text-lg">
            Bắt đầu ngay
            <PlayCircle className="ml-2 w-6 h-6" />
          </Link>

          <Link to={`/games/${game.slug}/results`} className="btn-3d-blue flex-1 py-4 text-lg">
            Xem kết quả và export
            <BarChart2 className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
