import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Gamepad2,
  FileText,
  ArrowLeft,
  PlusSquare,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { submissionsService } from '../services/submissions.service';
import { gamesService } from '../services/games.service';
import { slugify } from '../lib/utils';

type GameType = 'slido' | 'kahoot' | 'who_is_billionaire' | 'word_chain' | 'fill_in_blank';

type QuestionDraft = {
  prompt: string;
  optionsText: string;
  correctAnswer: string;
};

const gameTypeOptions: Array<{
  value: GameType;
  label: string;
  summary: string;
  questionType: 'textarea' | 'multiple_choice' | 'text';
}> = [
  {
    value: 'slido',
    label: 'Slido',
    summary: 'Thu thập ý kiến mở',
    questionType: 'textarea',
  },
  {
    value: 'kahoot',
    label: 'Kahoot',
    summary: 'Trắc nghiệm nhanh nhiều lựa chọn',
    questionType: 'multiple_choice',
  },
  {
    value: 'who_is_billionaire',
    label: 'Who is Billionaire',
    summary: 'Trắc nghiệm tình huống có đáp án đúng',
    questionType: 'multiple_choice',
  },
  {
    value: 'word_chain',
    label: 'Nối từ',
    summary: 'Nhập đáp án dạng từ hoặc cụm từ',
    questionType: 'text',
  },
  {
    value: 'fill_in_blank',
    label: 'Điền chỗ trống',
    summary: 'Điền đáp án ngắn vào ô trống',
    questionType: 'text',
  },
];

const createQuestionDraft = (): QuestionDraft => ({
  prompt: '',
  optionsText: '',
  correctAnswer: '',
});

const initialForm = {
  title: '',
  slug: '',
  shortDescription: '',
  instructions: '',
  durationSeconds: '180',
  gameType: 'slido' as GameType,
  questions: [createQuestionDraft()],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalParticipants: 0, totalSubmissions: 0, activeGames: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const selectedGameType = useMemo(
    () => gameTypeOptions.find((option) => option.value === form.gameType) || gameTypeOptions[0],
    [form.gameType]
  );

  async function loadDashboard() {
    const [statsData, recentData, gamesData] = await Promise.all([
      submissionsService.getDashboardStats(),
      submissionsService.getRecentSubmissions(),
      gamesService.getActiveGames(),
    ]);
    setStats(statsData);
    setRecent(recentData);
    setGames(gamesData);
  }

  useEffect(() => {
    void loadDashboard().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleCreateGame = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const questions = form.questions
        .map((question) => {
          const base = {
            question_text: question.prompt.trim(),
            question_type: selectedGameType.questionType,
            is_required: true,
          };

          if (selectedGameType.questionType === 'multiple_choice') {
            const options = question.optionsText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean);

            return {
              ...base,
              options,
              correct_answer: question.correctAnswer.trim(),
            };
          }

          if (selectedGameType.questionType === 'text') {
            return {
              ...base,
              correct_answer: question.correctAnswer.trim(),
            };
          }

          return base;
        })
        .filter((question) => question.question_text);

      const createdGame = await gamesService.createGame({
        title: form.title,
        slug: form.slug || slugify(form.title),
        short_description: form.shortDescription,
        instructions: form.instructions,
        duration_seconds: Number(form.durationSeconds),
        questions,
      });

      alert('Đã tạo game.');
      setForm(initialForm);
      await loadDashboard();
      navigate(`/games/${createdGame.slug}/results`);
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
        Đang tải quản lý...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Về màn hình truy cập
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 drop-shadow-sm">Quản lý</h1>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-3d-blue px-6 py-3.5 text-base disabled:opacity-60"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
        </button>
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 mb-8">
        <div className="card-3d p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            <h2 className="text-2xl font-extrabold text-slate-800">Kết quả theo game</h2>
          </div>
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{game.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">{game.short_description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/games/${game.slug}`} className="btn-3d-orange px-5 py-3 text-sm">
                    Xem game
                  </Link>
                  <Link to={`/games/${game.slug}/results`} className="btn-3d-blue px-5 py-3 text-sm">
                    Kết quả
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-3d p-8">
          <div className="flex items-center gap-3 mb-6">
            <PlusSquare className="w-6 h-6 text-orange-700" />
            <h2 className="text-2xl font-extrabold text-slate-800">Tạo game mới</h2>
          </div>
          <form onSubmit={handleCreateGame} className="space-y-5">
            <select
              value={form.gameType}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  gameType: event.target.value as GameType,
                  questions: [createQuestionDraft()],
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
            >
              {gameTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.summary}
                </option>
              ))}
            </select>

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
              rows={2}
              value={form.shortDescription}
              onChange={(event) => setForm((previous) => ({ ...previous, shortDescription: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
              placeholder="Mô tả ngắn"
              required
            />
            <textarea
              rows={3}
              value={form.instructions}
              onChange={(event) => setForm((previous) => ({ ...previous, instructions: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
              placeholder="Hướng dẫn tham gia"
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Bộ câu hỏi</div>
                  <div className="text-sm font-medium text-slate-600">{selectedGameType.summary}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      questions: [...previous.questions, createQuestionDraft()],
                    }))
                  }
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                >
                  Thêm câu hỏi
                </button>
              </div>

              {form.questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-700">Câu hỏi {index + 1}</div>
                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            questions: previous.questions.filter((_, questionIndex) => questionIndex !== index),
                          }))
                        }
                        className="text-sm font-bold text-red-600"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={question.prompt}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        questions: previous.questions.map((item, questionIndex) =>
                          questionIndex === index ? { ...item, prompt: event.target.value } : item
                        ),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
                    placeholder="Nhập nội dung câu hỏi"
                    required
                  />

                  {selectedGameType.questionType === 'multiple_choice' && (
                    <>
                      <textarea
                        rows={4}
                        value={question.optionsText}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            questions: previous.questions.map((item, questionIndex) =>
                              questionIndex === index ? { ...item, optionsText: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800 resize-none"
                        placeholder="Mỗi dòng là một phương án"
                        required
                      />
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            questions: previous.questions.map((item, questionIndex) =>
                              questionIndex === index ? { ...item, correctAnswer: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
                        placeholder="Đáp án đúng"
                        required
                      />
                    </>
                  )}

                  {selectedGameType.questionType === 'text' && (
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          questions: previous.questions.map((item, questionIndex) =>
                            questionIndex === index ? { ...item, correctAnswer: event.target.value } : item
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium text-slate-800"
                      placeholder="Đáp án đúng"
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-3d-orange w-full py-4 text-lg disabled:opacity-60">
              {saving ? 'Đang tạo...' : 'Tạo game'}
            </button>
          </form>
        </div>
      </div>

      <div className="card-3d p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-blue-700" />
          <h2 className="text-2xl font-extrabold text-slate-800">Hoạt động gần đây</h2>
        </div>
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
  );
}
