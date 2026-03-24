import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, PlayCircle } from 'lucide-react';
import { gamesService } from '../services/games.service';
import { participantsService } from '../services/participants.service';
import { submissionsService } from '../services/submissions.service';

export default function GameJoin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    gamesService.getGameBySlug(slug).then(setGame).catch(() => navigate('/games'));
    sessionStorage.removeItem('last_score');
    sessionStorage.removeItem('last_total');
    sessionStorage.removeItem('last_analysis');
  }, [slug, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || !game) return;

    setLoading(true);

    try {
      const participant: any = await participantsService.createParticipant(displayName.trim(), unitName.trim());
      const session: any = await submissionsService.createSession(game.id, participant.id, game.duration_seconds);

      sessionStorage.setItem('current_session_id', session.id);
      sessionStorage.setItem('current_game_id', game.id);
      sessionStorage.setItem('current_player_name', participant.display_name);

      navigate(`/games/${game.slug}/play`);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (!game) return null;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <Link to={`/games/${game.slug}`} className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="mr-2 w-4 h-4" />
        Quay lại
      </Link>

      <div className="card-3d p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">Nhập thông tin để chơi</h1>
          <p className="text-slate-600 font-medium">
            Người chơi cần nhập tên trước khi bắt đầu. Hệ thống sẽ lưu dữ liệu bài làm vào Supabase.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800 shadow-inner"
                placeholder="Nhập họ tên của bạn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Đơn vị / Cửa hàng</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={unitName}
                onChange={(event) => setUnitName(event.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800 shadow-inner"
                placeholder="Nhập tên đơn vị nếu cần"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="btn-3d-orange w-full py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang vào game...' : 'Bắt đầu chơi'}
            {!loading && <PlayCircle className="ml-2 w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  );
}
