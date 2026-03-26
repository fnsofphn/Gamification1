import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, PlayCircle } from 'lucide-react';
import { gamesService } from '../services/games.service';
import { participantsService } from '../services/participants.service';
import { submissionsService } from '../services/submissions.service';
import { getViewerAccess } from '../lib/access';

export default function GameJoin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(false);
  const access = getViewerAccess();
  const isManager = access?.role === 'manager';

  useEffect(() => {
    if (!slug) return;

    gamesService
      .getGameBySlug(slug)
      .then((loadedGame) => {
        setGame(loadedGame);

        if (access?.displayName) {
          setDisplayName(access.displayName);
          setUnitName(access.unitName || '');
        }
      })
      .catch(() => navigate('/games'));

    sessionStorage.removeItem('last_score');
    sessionStorage.removeItem('last_total');
    sessionStorage.removeItem('last_analysis');
  }, [slug, navigate, access]);

  useEffect(() => {
    if (!game || isManager || !access?.displayName || loading) return;

    void startGameSession(access.displayName, access.unitName || '');
  }, [game, isManager, access, loading]);

  async function startGameSession(name: string, unit: string) {
    if (!game) return;

    setLoading(true);

    try {
      const participant: any = await participantsService.createParticipant(name.trim(), unit.trim());
      const session: any = await submissionsService.createSession(game.id, participant.id, game.duration_seconds);

      sessionStorage.setItem('current_session_id', session.id);
      sessionStorage.setItem('current_game_id', game.id);
      sessionStorage.setItem('current_player_name', participant.display_name);

      navigate(`/games/${game.slug}/play`);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || !game) return;
    await startGameSession(displayName, unitName);
  };

  if (!game) return null;

  if (!isManager && access?.displayName) {
    return (
      <div className="max-w-xl mx-auto p-4 md:p-8 animate-fade-in-up">
        <div className="card-3d p-8 md:p-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-4 drop-shadow-sm">Chuẩn bị vào game</h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            Đang dùng thông tin của bạn để bắt đầu trò chơi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <Link
        to={`/games/${game.slug}`}
        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        Quay lại
      </Link>

      <div className="card-3d p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">Thông tin người chơi</h1>
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
                placeholder="Nhập họ và tên"
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
                placeholder="Nhập đơn vị"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="btn-3d-orange w-full py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang vào game...' : 'Bắt đầu'}
            {!loading && <PlayCircle className="ml-2 w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  );
}
