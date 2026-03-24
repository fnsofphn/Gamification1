import { supabase } from '../lib/supabase/client';
import { env } from '../lib/env';

const isDemo = env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
const DEMO_SESSIONS_KEY = 'demo_game_sessions';
const DEMO_PARTICIPANTS_KEY = 'demo_participants';
const canUseStorage = typeof window !== 'undefined';

const MOCK_SUBMISSIONS = [
  {
    id: '1',
    game_id: '11111111-1111-1111-1111-111111111111',
    started_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    status: 'completed',
    score: null,
    games: { title: 'Gamification 01 - Tương tác lấy ý kiến' },
    participants: { display_name: 'Nguyễn Văn A', unit_name: 'CH Quận 1' },
    game_answers: [
      {
        question_id: 'q1',
        answer_text: 'Cửa hàng thay đổi mạnh ở tốc độ phục vụ và bố trí quầy kệ.',
        game_questions: { question_text: 'Cửa hàng đang thay đổi mạnh nhất ở điểm nào?', question_order: 1 },
      },
      {
        question_id: 'q2',
        answer_text: 'Giờ cao điểm vẫn để khách chờ lâu ở khâu thanh toán.',
        game_questions: {
          question_text: 'Điểm yếu lớn nhất hiện nay trong trải nghiệm khách hàng là gì?',
          question_order: 2,
        },
      },
      {
        question_id: 'q3',
        answer_text: 'Cần chốt ngay checklist phục vụ và nhắc lại chuẩn chào hỏi.',
        game_questions: { question_text: 'Điều gì cần làm ngay sau khóa học?', question_order: 3 },
      },
    ],
  },
  {
    id: '2',
    game_id: '11111111-1111-1111-1111-111111111111',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    submitted_at: new Date(Date.now() - 3500000).toISOString(),
    status: 'completed',
    score: null,
    games: { title: 'Gamification 01 - Tương tác lấy ý kiến' },
    participants: { display_name: 'Trần Thị B', unit_name: 'CH Quận 3' },
    game_answers: [
      {
        question_id: 'q1',
        answer_text: 'Không gian sạch hơn và nhân viên chủ động tư vấn hơn.',
        game_questions: { question_text: 'Cửa hàng đang thay đổi mạnh nhất ở điểm nào?', question_order: 1 },
      },
      {
        question_id: 'q2',
        answer_text: 'Chưa tư vấn rõ khuyến mãi, khách phải hỏi lại nhiều lần.',
        game_questions: {
          question_text: 'Điểm yếu lớn nhất hiện nay trong trải nghiệm khách hàng là gì?',
          question_order: 2,
        },
      },
      {
        question_id: 'q3',
        answer_text: 'Cần luyện lại kịch bản tư vấn và phân vai giờ đông khách.',
        game_questions: { question_text: 'Điều gì cần làm ngay sau khóa học?', question_order: 3 },
      },
    ],
  },
];

function getDemoEnrichedSessions() {
  if (!canUseStorage) return [];

  const sessions = JSON.parse(window.localStorage.getItem(DEMO_SESSIONS_KEY) || '[]');
  const participants = JSON.parse(window.localStorage.getItem(DEMO_PARTICIPANTS_KEY) || '[]');
  const participantMap = new Map(participants.map((participant: any) => [participant.id, participant]));

  return sessions.map((session: any) => ({
    ...session,
    participants: participantMap.get(session.participant_id) || null,
    games: session.games || { title: 'Game demo' },
    game_answers: (session.game_answers || []).map((answer: any) => ({
      ...answer,
      game_questions: answer.game_questions || null,
    })),
  }));
}

export const submissionsService = {
  async createSession(gameId: string, participantId: string, timeLimitSeconds: number) {
    if (isDemo) {
      const session = {
        id: `demo-session-${Date.now()}`,
        game_id: gameId,
        participant_id: participantId,
        status: 'playing',
        time_limit_seconds: timeLimitSeconds,
        started_at: new Date().toISOString(),
        submitted_at: null,
      };
      if (canUseStorage) {
        const sessions = JSON.parse(window.localStorage.getItem(DEMO_SESSIONS_KEY) || '[]');
        window.localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify([session, ...sessions]));
      }
      return session;
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: gameId,
        participant_id: participantId,
        status: 'playing',
        time_limit_seconds: timeLimitSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitAnswers(
    sessionId: string,
    answers: { question_id: string; answer_text: string; is_correct?: boolean | null }[],
    status: 'completed' | 'timeout',
    score?: number | null
  ) {
    if (isDemo) {
      if (canUseStorage) {
        const sessions = JSON.parse(window.localStorage.getItem(DEMO_SESSIONS_KEY) || '[]');
        const updatedSessions = sessions.map((session: any) =>
          session.id === sessionId
            ? {
                ...session,
                status,
                score: score ?? null,
                submitted_at: new Date().toISOString(),
                game_answers: answers,
              }
            : session
        );
        window.localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(updatedSessions));
      }
      return;
    }

    const { error: sessionError } = await supabase
      .from('game_sessions')
      .update({
        status,
        score: score ?? null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (sessionError) throw sessionError;

    if (answers.length === 0) return;

    const { error: answersError } = await supabase.from('game_answers').insert(
      answers.map((answer) => ({
        session_id: sessionId,
        question_id: answer.question_id,
        answer_text: answer.answer_text,
        is_correct: answer.is_correct ?? null,
      }))
    );

    if (answersError) throw answersError;
  },

  async getDashboardStats() {
    if (isDemo) {
      const sessions = canUseStorage
        ? JSON.parse(window.localStorage.getItem(DEMO_SESSIONS_KEY) || '[]')
        : [];
      const participants = new Set(sessions.map((session: any) => session.participant_id));
      return {
        totalParticipants: 17 + participants.size,
        totalSubmissions: 14 + sessions.filter((session: any) => session.status === 'completed').length,
        activeGames: 3,
      };
    }

    const { count: totalParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });
    const { count: totalSubmissions } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    const { count: activeGames } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return {
      totalParticipants: totalParticipants || 0,
      totalSubmissions: totalSubmissions || 0,
      activeGames: activeGames || 0,
    };
  },

  async getRecentSubmissions() {
    if (isDemo) {
      return [...getDemoEnrichedSessions(), ...MOCK_SUBMISSIONS];
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .select(
        `
        id,
        game_id,
        started_at,
        submitted_at,
        status,
        score,
        games ( title ),
        participants ( display_name, unit_name )
      `
      )
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  async getGameSubmissions(gameId: string) {
    if (isDemo) {
      return [...getDemoEnrichedSessions(), ...MOCK_SUBMISSIONS].filter(
        (submission) => submission.game_id === gameId && submission.status === 'completed'
      );
    }

    const { data, error } = await supabase
      .from('game_sessions')
      .select(
        `
        id,
        game_id,
        started_at,
        submitted_at,
        status,
        score,
        participants ( display_name, unit_name ),
        game_answers (
          question_id,
          answer_text,
          is_correct,
          game_questions ( question_text, question_order )
        )
      `
      )
      .eq('game_id', gameId)
      .eq('status', 'completed')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
