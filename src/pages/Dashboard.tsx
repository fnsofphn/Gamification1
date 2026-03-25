import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Gamepad2, FileText, ArrowLeft, PlusSquare } from 'lucide-react';
import { submissionsService } from '../services/submissions.service';
import { gamesService } from '../services/games.service';
import { slugify } from '../lib/utils';

const initialForm = {
  title: '',
  slug: '',
  shortDescription: '',
  instructions: '',
  durationSeconds: '180',
  questions: '',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalParticipants: 0, totalSubmissions: 0, activeGames: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    Promise.all([submissionsService.getDashboardStats(), submissionsService.getRecentSubmissions()])
      .then(([statsData, recentData]) => {
        setStats(statsData);
        setRecent(recentData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateGame = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const createdGame = await gamesService.createGame({
        title: form.title,
        slug: form.slug || slugify(form.title),
        short_description: form.shortDescription,
        instructions: form.instructions,
        duration_seconds: Number(form.durationSeconds),
        questions: form.questions
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((question) => ({
            question_text: question,
            question_type: 'textarea',
            is_required: true,
          })),
      });

      alert('Đã tạo game.');
      setForm(initialForm);
      navigate(`/games/${createdGame.slug}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Không thể tạo game.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-blue-600 font-bold text-xl">
        Đang tải quản trị...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Về trang chủ
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 drop-shadow-sm">
            Quản trị
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card-3d p-8 flex items-center">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-2xl shadow-inner mr-6 border border-blue-50">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Game</p>
            <p className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{stats.activeGames}</p>
          </div>
        </div>

        <div className="card-3d p-8 flex items-center">
          <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 rounded-2xl shadow-inner mr-6 border border-orange-50">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Người chơi</p>
            <p className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{stats.totalParticipants}</p>
          </div>
        </div>

        <div className="card-3d p-8 flex items-center">
          <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-2xl shadow-inner mr-6 border border-green-50">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Bài nộp</p>
            <p className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{stats.totalSubmissions}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
        <div className="card-3d p-8">
          <div className="flex items-center gap-3 mb-6">
            <PlusSquare className="w-6 h-6 text-orange-700" />
            <h2 className="text-2xl font-extrabold text-slate-800">Thêm game</h2>
          </div>
          <form onSubmit={handleCreateGame} className="space-y-5">
            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                  slug: previous.slug ? previous.slug : slugify(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
              placeholder="Tên game"
              required
            />
            <input
              type="text"
              value={form.slug}
              onChange={(event) => setForm((previous) => ({ ...previous, slug: slugify(event.target.value) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
              placeholder="Slug"
              required
            />
            <textarea
              rows={3}
              value={form.shortDescription}
              onChange={(event) => setForm((previous) => ({ ...previous, shortDescription: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
              placeholder="Mô tả ngắn"
              required
            />
            <textarea
              rows={4}
              value={form.instructions}
              onChange={(event) => setForm((previous) => ({ ...previous, instructions: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
              placeholder="Hướng dẫn"
              required
            />
            <input
              type="number"
              min="30"
              step="30"
              value={form.durationSeconds}
              onChange={(event) => setForm((previous) => ({ ...previous, durationSeconds: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
              placeholder="Thời gian (giây)"
              required
            />
            <textarea
              rows={7}
              value={form.questions}
              onChange={(event) => setForm((previous) => ({ ...previous, questions: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
              placeholder="Mỗi dòng là một câu hỏi"
              required
            />
            <button type="submit" disabled={saving} className="btn-3d-orange w-full py-4 text-lg disabled:opacity-60">
              {saving ? 'Đang tạo...' : 'Tạo game'}
            </button>
          </form>
        </div>

        <div className="card-3d p-8">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-8 drop-shadow-sm">Hoạt động gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200/60">
                  <th className="pb-4 font-bold text-slate-500 uppercase tracking-wider text-sm">Thời gian</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase tracking-wider text-sm">Người chơi</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase tracking-wider text-sm">Đơn vị</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase tracking-wider text-sm">Game</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase tracking-wider text-sm">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recent.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 font-medium text-slate-600">{new Date(submission.started_at).toLocaleString()}</td>
                    <td className="py-5 font-extrabold text-slate-800">{submission.participants?.display_name || '-'}</td>
                    <td className="py-5 text-slate-600">
                      {submission.participants?.unit_name ? (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                          {submission.participants.unit_name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-5 font-bold text-blue-700">{submission.games?.title || '-'}</td>
                    <td className="py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                          submission.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : submission.status === 'timeout'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-bold text-base">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
