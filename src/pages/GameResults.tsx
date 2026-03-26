import { useMemo, useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  RotateCw,
} from 'lucide-react';
import { gamesService } from '../services/games.service';
import { submissionsService } from '../services/submissions.service';
import { exportService } from '../services/export.service';
import { analysisService } from '../services/analysis.service';
import { formatAnswerText, normalizeVietnameseCopy } from '../lib/utils';

type QuestionSummary = {
  question: string;
  answers: string[];
};

export default function GameResults() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadData = useCallback(async () => {
    if (!slug) return;

    try {
      const gameData = await gamesService.getGameBySlug(slug);
      setGame(gameData);
      const questionData = await gamesService.getGameQuestions(gameData.id);
      setQuestions(questionData);

      const submissionsData = await submissionsService.getGameSubmissions(gameData.id);
      setSubmissions(submissionsData);

      const latestAnalysis = await analysisService.getLatestGameSummary(gameData.id);
      setAnalysis(latestAnalysis);
    } catch (error) {
      console.error('Failed to load results:', error);
      navigate('/games');
    }
  }, [slug, navigate]);

  useEffect(() => {
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  const groupedByQuestion = useMemo(() => {
    const questionMap = new Map<string, QuestionSummary>();

    submissions.forEach((submission) => {
      (submission.game_answers || []).forEach((answer: any) => {
        const question = normalizeVietnameseCopy(
          answer.game_questions?.question_text || `Câu hỏi ${answer.question_id}`
        );
        if (!questionMap.has(question)) {
          questionMap.set(question, { question, answers: [] });
        }
        questionMap.get(question)?.answers.push(formatAnswerText(answer.answer_text));
      });
    });

    return Array.from(questionMap.values());
  }, [submissions]);

  const questionMeta = useMemo(() => {
    const meta = new Map<string, any>();
    questions.forEach((question) => {
      meta.set(question.id, question);
    });
    return meta;
  }, [questions]);

  const handleRunAnalysis = async () => {
    if (!game || submissions.length === 0) return;

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      const payload = submissions.flatMap((submission) =>
        (submission.game_answers || []).map((answer: any) => ({
          question: normalizeVietnameseCopy(
            answer.game_questions?.question_text || `Câu hỏi ${answer.question_id}`
          ),
          answer: `${submission.participants?.display_name || 'Ẩn danh'}: ${formatAnswerText(answer.answer_text)}`,
        }))
      );

      const result = await analysisService.summarizeGameFeedback(game.id, payload);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Không thể phân tích dữ liệu.';
      setAnalysisError(message);
      alert(message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClearResults = async () => {
    if (!game) return;

    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa toàn bộ kết quả và phân tích AI của game này không? Thao tác này dùng để bắt đầu lượt chơi mới cho lớp tiếp theo.'
    );

    if (!confirmed) return;

    setClearing(true);

    try {
      await submissionsService.clearGameResults(game.id);
      await analysisService.clearGameAnalyses(game.id);
      setSubmissions([]);
      setAnalysis(null);
      setAnalysisError(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Không thể làm mới kết quả của game này.');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-blue-600 font-bold text-xl">
        Đang tải kết quả...
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <Link
            to={`/games/${slug}`}
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Quay lại
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 drop-shadow-sm">Kết quả</h1>
          <p className="text-lg text-slate-600 mt-3 font-medium">
            <span className="text-blue-700">{game.title}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-3d-blue px-6 py-3.5 text-base disabled:opacity-60"
          >
            <RotateCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang làm mới...' : 'Làm mới'}
          </button>
          <button
            onClick={handleClearResults}
            disabled={clearing}
            className="btn-3d-orange px-6 py-3.5 text-base disabled:opacity-60"
          >
            <RotateCw className={`w-5 h-5 mr-2 ${clearing ? 'animate-spin' : ''}`} />
            {clearing ? 'Đang xóa kết quả...' : 'Làm mới kết quả'}
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={analysisLoading || submissions.length === 0}
            className="btn-3d-blue px-6 py-3.5 text-base disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {analysisLoading ? 'Đang phân tích...' : 'Phân tích AI'}
          </button>
          <button
            onClick={() => exportService.exportSubmissionsToExcel(game.id, game.slug)}
            className="btn-3d-orange px-6 py-3.5 text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8 mb-8">
        <div className="card-3d p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            <h2 className="text-2xl font-extrabold text-slate-800">Tổng hợp theo câu hỏi</h2>
          </div>
          {groupedByQuestion.length === 0 ? (
            <div className="text-slate-500 font-medium">Chưa có dữ liệu.</div>
          ) : (
            <div className="space-y-6">
              {groupedByQuestion.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{item.question}</h3>
                  <div className="space-y-3">
                    {item.answers.map((answer, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-slate-700 font-medium whitespace-pre-wrap"
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card-3d p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-5">Phân tích AI</h2>
            {analysisError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {analysisError}
              </div>
            )}
            {!analysis ? (
              <p className="text-slate-600 font-medium leading-relaxed">Chưa có bản phân tích.</p>
            ) : (
              <div className="space-y-5">
                <p className="text-slate-700 font-medium leading-relaxed">{analysis.summary}</p>
                {analysis.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword: string) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-semibold text-blue-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                {analysis.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    {analysis.recommendations.map((recommendation: string) => (
                      <div
                        key={recommendation}
                        className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        {recommendation}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-3d p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-5">Bài làm</h2>
            <div className="text-sm text-slate-600 font-medium">
              Tổng số lượt hoàn thành: <strong>{submissions.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {submissions.length === 0 ? (
          <div className="card-3d p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Chưa có dữ liệu</h3>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="card-3d p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-2xl shadow-inner border border-blue-50">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">
                      {submission.participants?.display_name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1.5 flex items-center flex-wrap gap-2">
                      {submission.participants?.unit_name && (
                        <span className="text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-md border border-orange-200/50 shadow-sm">
                          {submission.participants.unit_name}
                        </span>
                      )}
                      <span className="text-slate-400">•</span>
                      <span>
                        {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '-'}
                      </span>
                    </p>
                  </div>
                </div>
                {submission.score !== undefined && submission.score !== null && (
                  <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-center shadow-inner">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-0.5">Điểm</p>
                    <p className="text-2xl font-extrabold text-orange-700">{submission.score}</p>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {(submission.game_answers || []).map((answer: any, index: number) => {
                  const displayAnswer = formatAnswerText(answer.answer_text);
                  const isCorrect = answer.is_correct;
                  const question = questionMeta.get(answer.question_id);
                  const correctAnswer = question?.correct_answer
                    ? normalizeVietnameseCopy(question.correct_answer)
                    : null;
                  const answerExplanation = question?.answer_explanation || null;

                  return (
                    <div
                      key={index}
                      className={`bg-slate-50/80 border rounded-2xl p-5 shadow-inner ${
                        isCorrect === true
                          ? 'border-green-300 bg-green-50/30'
                          : isCorrect === false
                            ? 'border-red-300 bg-red-50/30'
                            : 'border-slate-100'
                      }`}
                    >
                      <p className="text-sm font-bold text-blue-800 mb-3 flex items-start">
                        <span className="mr-2 mt-0.5 text-orange-500">Q:</span>
                        {normalizeVietnameseCopy(
                          answer.game_questions?.question_text || `Câu hỏi ${answer.question_id}`
                        )}
                      </p>
                      <div className="flex items-start">
                        <div
                          className={`flex-1 text-slate-700 whitespace-pre-wrap font-medium leading-relaxed pl-6 border-l-2 ${
                            isCorrect === true
                              ? 'border-green-500'
                              : isCorrect === false
                                ? 'border-red-500'
                                : 'border-orange-400'
                          }`}
                        >
                          {displayAnswer}
                        </div>
                        {isCorrect === true && (
                          <CheckCircle2 className="w-6 h-6 text-green-500 ml-4 flex-shrink-0" />
                        )}
                        {isCorrect === false && (
                          <XCircle className="w-6 h-6 text-red-500 ml-4 flex-shrink-0" />
                        )}
                      </div>
                      {correctAnswer && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                          <div className="text-sm font-bold text-blue-800">Đáp án đúng</div>
                          <div className="mt-1 text-sm font-medium text-slate-700">{correctAnswer}</div>
                          {answerExplanation && (
                            <div className="mt-3 border-t border-blue-100 pt-3">
                              <div className="text-sm font-bold text-blue-800">Giải thích</div>
                              <div className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
                                {answerExplanation}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
