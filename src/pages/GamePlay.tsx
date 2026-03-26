import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { gamesService } from '../services/games.service';
import { submissionsService } from '../services/submissions.service';
import { analysisService } from '../services/analysis.service';

export default function GamePlay() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'saving' | 'analyzing' | null>(null);
  const [submitProgress, setSubmitProgress] = useState(0);

  const sessionId = sessionStorage.getItem('current_session_id');
  const currentGameId = sessionStorage.getItem('current_game_id');

  const submitGame = useCallback(
    async (status: 'completed' | 'timeout') => {
      if (!sessionId || !game || isSubmitting) return;

      setIsSubmitting(true);
      setSubmitStage('saving');

      try {
        let score = 0;
        let hasScoring = false;

        const formattedAnswers = questions
          .map((question) => {
            const answerText = answers[question.id] || '';
            if (!answerText.trim()) return null;

            let is_correct = null;
            if (question.question_type === 'multiple_choice' && question.correct_answer) {
              hasScoring = true;
              is_correct = answerText === question.correct_answer;
              if (is_correct) score += 1;
            }

            return {
              question_id: question.id,
              answer_text: answerText,
              is_correct,
              game_questions: {
                question_text: question.question_text,
                question_order: question.question_order,
              },
            };
          })
          .filter(Boolean) as any[];

        const unansweredRequired = questions.some(
          (question) => question.is_required && !(answers[question.id] || '').trim()
        );

        if (status === 'completed' && unansweredRequired) {
          alert('Vui lòng hoàn thành các câu hỏi bắt buộc trước khi nộp.');
          setIsSubmitting(false);
          setSubmitStage(null);
          return;
        }

        const finalScore = hasScoring ? score : null;
        const totalScorable = hasScoring
          ? questions.filter(
              (question) => question.question_type === 'multiple_choice' && question.correct_answer
            ).length
          : null;

        if (hasScoring) {
          sessionStorage.setItem('last_score', String(score));
          sessionStorage.setItem('last_total', String(totalScorable));
        } else {
          sessionStorage.removeItem('last_score');
          sessionStorage.removeItem('last_total');
        }
        sessionStorage.setItem('last_has_scoring', hasScoring ? 'true' : 'false');

        await submissionsService.submitAnswers(sessionId, formattedAnswers, status, finalScore);
        setSubmitStage('analyzing');

        const analysis = await analysisService.analyzeSubmission(
          currentGameId || game.id,
          sessionId,
          formattedAnswers.map((answer) => ({
            question: answer.game_questions.question_text,
            answer: answer.answer_text,
          }))
        );

        if (analysis) {
          sessionStorage.setItem('last_analysis', JSON.stringify(analysis));
        } else {
          sessionStorage.removeItem('last_analysis');
        }

        navigate(`/games/${slug}/thanks`);
      } catch (error) {
        console.error('Submit error:', error);
        alert('Có lỗi khi nộp bài.');
        setIsSubmitting(false);
        setSubmitStage(null);
      }
    },
    [answers, currentGameId, game, isSubmitting, navigate, questions, sessionId, slug]
  );

  useEffect(() => {
    if (!sessionId) {
      navigate(`/games/${slug}/join`);
      return;
    }

    async function loadGame() {
      try {
        const gameData = await gamesService.getGameBySlug(slug!);
        setGame(gameData);
        setTimeLeft(gameData.duration_seconds);

        const questionData = await gamesService.getGameQuestions(gameData.id);
        setQuestions(questionData);

        const initialAnswers: Record<string, string> = {};
        questionData.forEach((question: any) => {
          if (question.question_type === 'ranking' && question.options) {
            initialAnswers[question.id] = JSON.stringify(question.options);
          }
        });
        if (Object.keys(initialAnswers).length > 0) {
          setAnswers((previous) => ({ ...previous, ...initialAnswers }));
        }
      } catch {
        navigate('/games');
      }
    }

    loadGame();
  }, [slug, sessionId, navigate]);

  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;
    if (timeLeft <= 0) {
      submitGame('timeout');
      return;
    }

    const timer = setInterval(() => setTimeLeft((current) => (current !== null ? current - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, submitGame]);

  useEffect(() => {
    if (!isSubmitting) {
      setSubmitProgress(0);
      return;
    }

    const durationMs = 7000;
    const start = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
      setSubmitProgress(Math.round(eased * 100));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isSubmitting]);

  if (!game || timeLeft === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-blue-600 font-bold text-xl">
        Đang tải game...
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((game.duration_seconds - timeLeft) / game.duration_seconds) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="card-3d w-full max-w-2xl overflow-hidden p-0">
            <div className="h-2.5 w-full bg-slate-100">
              <div
                className="result-progress-bar h-full"
                style={{ width: `${submitProgress}%` }}
              />
            </div>

            <div className="p-8 md:p-10">
              <div className="transition-all duration-500 ease-out">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">
                  {submitStage === 'analyzing' ? 'Phân tích AI' : 'Đang xử lý'}
                </div>
                <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-800 opacity-100 translate-y-0 transition-all duration-500 ease-out">
                  {submitStage === 'analyzing' ? 'Đang phân tích kết quả của bạn' : 'Đang ghi nhận bài làm của bạn'}
                </h2>
                <p className="mt-3 text-base font-medium leading-relaxed text-slate-600 opacity-100 translate-y-0 transition-all duration-500 ease-out">
                  Hệ thống đang tổng hợp dữ liệu để chuẩn bị hiển thị kết quả và gợi ý phù hợp cho bạn.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
                  <div className="skeleton-shimmer mx-auto h-28 w-28 rounded-full" />
                  <div className="mt-6 space-y-3">
                    <div className="skeleton-shimmer h-4 rounded-full" />
                    <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
                    <div className="skeleton-shimmer h-4 w-2/3 rounded-full" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                    <div className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                      Nhận xét nổi bật
                    </div>
                    <div className="space-y-3">
                      <div className="skeleton-shimmer h-4 rounded-full" />
                      <div className="skeleton-shimmer h-4 w-11/12 rounded-full" />
                      <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                    <div className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                      Gợi ý tiếp theo
                    </div>
                    <div className="space-y-3">
                      <div className="skeleton-shimmer h-4 rounded-full" />
                      <div className="skeleton-shimmer h-4 w-10/12 rounded-full" />
                      <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-3d p-6 mb-8 sticky top-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm">{game.title}</h1>
        </div>
        <div
          className={`flex items-center px-6 py-3 rounded-2xl font-extrabold text-2xl shadow-inner border ${
            timeLeft <= 30
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
              : 'bg-orange-50 text-orange-600 border-orange-200'
          }`}
        >
          <Clock className="w-6 h-6 mr-3" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-slate-200/50 rounded-full h-3 mb-10 overflow-hidden shadow-inner border border-slate-200">
        <div
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-8 mb-12">
        {questions.map((question, index) => (
          <div key={question.id} className="card-3d p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-start leading-relaxed">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold mr-3 mt-0.5 shadow-md">
                {index + 1}
              </span>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </h3>

            {question.question_type === 'ranking' && question.options ? (
              <div className="space-y-3">
                {(() => {
                  const currentRanking: string[] = answers[question.id]
                    ? JSON.parse(answers[question.id])
                    : question.options;
                  return currentRanking.map((item, itemIndex) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (itemIndex > 0) {
                              const next = [...currentRanking];
                              [next[itemIndex - 1], next[itemIndex]] = [
                                next[itemIndex],
                                next[itemIndex - 1],
                              ];
                              setAnswers((previous) => ({
                                ...previous,
                                [question.id]: JSON.stringify(next),
                              }));
                            }
                          }}
                          disabled={itemIndex === 0}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (itemIndex < currentRanking.length - 1) {
                              const next = [...currentRanking];
                              [next[itemIndex + 1], next[itemIndex]] = [
                                next[itemIndex],
                                next[itemIndex + 1],
                              ];
                              setAnswers((previous) => ({
                                ...previous,
                                [question.id]: JSON.stringify(next),
                              }));
                            }
                          }}
                          disabled={itemIndex === currentRanking.length - 1}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex-1 font-medium text-slate-700 text-lg flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-4 flex-shrink-0">
                          {itemIndex + 1}
                        </span>
                        {item}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : question.question_type === 'multiple_choice' && question.options ? (
              <div className="space-y-3">
                {question.options.map((option: string, optionIndex: number) => {
                  const isSelected = answers[question.id] === option;
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option }))}
                      className={`w-full text-left p-4 rounded-xl border transition-all font-medium flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 ml-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : question.question_type === 'textarea' ? (
              <textarea
                rows={4}
                value={answers[question.id] || ''}
                onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-medium text-slate-800 shadow-inner"
                placeholder="Nhập câu trả lời"
              />
            ) : (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800 shadow-inner"
                placeholder="Nhập câu trả lời"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-12">
        <button
          onClick={() => submitGame('completed')}
          disabled={isSubmitting}
          className="btn-3d-orange px-12 py-4 text-xl w-full md:w-auto"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Hoàn thành'}
          {!isSubmitting && <Send className="ml-3 w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
