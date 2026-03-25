import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database';
import { env } from '../lib/env';
import { slugify } from '../lib/utils';

type Game = Database['public']['Tables']['games']['Row'];
type Question = Database['public']['Tables']['game_questions']['Row'];

export type GameQuestionDraft = {
  question_text: string;
  question_type?: string;
  options?: string[] | null;
  correct_answer?: string | null;
  is_required?: boolean;
};

export type CreateGamePayload = {
  title: string;
  slug?: string;
  short_description: string;
  instructions: string;
  duration_seconds: number;
  is_active?: boolean;
  questions: GameQuestionDraft[];
};

const isDemo = env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
const DEMO_GAMES_KEY = 'demo_custom_games';
const DEMO_QUESTIONS_KEY = 'demo_custom_questions';

const now = () => new Date().toISOString();
const canUseStorage = typeof window !== 'undefined';

const CANONICAL_GAME_COPY: Record<
  string,
  Pick<Game, 'title' | 'short_description' | 'instructions' | 'duration_seconds'>
> = {
  'gamification-01': {
    title: 'Gamification 01 - Tương tác lấy ý kiến',
    short_description:
      'Hoạt động giúp học viên chia sẻ cảm nhận về thay đổi tại cửa hàng, điểm yếu trải nghiệm khách hàng và hành động cần làm ngay sau khóa học.',
    instructions:
      '• Đọc kỹ 3 câu hỏi trước khi trả lời\n• Bạn có 180 giây để hoàn thành\n• Hệ thống sẽ tự động nộp bài khi hết giờ',
    duration_seconds: 180,
  },
  'gamification-02': {
    title: 'Gamification 02 - Bản đồ hành động của CHT trong giai đoạn mới',
    short_description:
      'Quiz tương tác về các hành vi quản lý đúng/sai trong giao việc, kiểm tra, họp, báo cáo, xử lý sai lệch và ra quyết định tại hiện trường.',
    instructions:
      '• Đọc kỹ từng tình huống\n• Chọn 1 đáp án đúng nhất\n• Hoàn thành trong 300 giây',
    duration_seconds: 300,
  },
  'gamification-03': {
    title: 'Gamification 03 - Điểm chạm nào quyết định niềm tin?',
    short_description:
      'Học viên xếp hạng các điểm chạm theo mức độ ảnh hưởng tới niềm tin khách hàng trên nền tảng web.',
    instructions:
      '• Sắp xếp các điểm chạm theo thứ tự ảnh hưởng giảm dần\n• Dùng nút Lên/Xuống để đổi vị trí\n• Hoàn thành trong 180 giây',
    duration_seconds: 180,
  },
};

const CANONICAL_QUESTIONS_BY_SLUG: Record<string, Question[]> = {
  'gamification-01': [
    {
      id: 'q1',
      game_id: '11111111-1111-1111-1111-111111111111',
      question_order: 1,
      question_text: 'Cửa hàng đang thay đổi mạnh nhất ở điểm nào?',
      question_type: 'textarea',
      options: null,
      correct_answer: null,
      is_required: true,
      created_at: now(),
    },
    {
      id: 'q2',
      game_id: '11111111-1111-1111-1111-111111111111',
      question_order: 2,
      question_text: 'Điểm yếu lớn nhất hiện nay trong trải nghiệm khách hàng là gì?',
      question_type: 'textarea',
      options: null,
      correct_answer: null,
      is_required: true,
      created_at: now(),
    },
    {
      id: 'q3',
      game_id: '11111111-1111-1111-1111-111111111111',
      question_order: 3,
      question_text: 'Điều gì cần làm ngay sau khóa học?',
      question_type: 'textarea',
      options: null,
      correct_answer: null,
      is_required: true,
      created_at: now(),
    },
  ],
  'gamification-02': [
    {
      id: 'g2q1',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 1,
      question_text: 'Khi giao việc cho nhân viên mới, CHT nên làm gì?',
      question_type: 'multiple_choice',
      options: [
        'A. Chỉ giao việc và yêu cầu hoàn thành đúng hạn',
        'B. Giao việc, hướng dẫn chi tiết, đặt deadline và kiểm tra tiến độ',
        'C. Để nhân viên tự tìm hiểu và làm theo cách của họ',
      ],
      correct_answer: 'B. Giao việc, hướng dẫn chi tiết, đặt deadline và kiểm tra tiến độ',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q2',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 2,
      question_text: 'Trong quá trình kiểm tra cửa hàng, phát hiện nhân viên làm sai quy trình.',
      question_type: 'multiple_choice',
      options: [
        'A. Quát mắng nhân viên ngay trước mặt khách hàng',
        'B. Ghi nhận lỗi, gọi riêng nhân viên ra nhắc nhở và hướng dẫn lại quy trình',
        'C. Bỏ qua vì lúc đó đang đông khách',
      ],
      correct_answer: 'B. Ghi nhận lỗi, gọi riêng nhân viên ra nhắc nhở và hướng dẫn lại quy trình',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q3',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 3,
      question_text: 'Tổ chức họp giao ca hàng ngày nên tập trung vào điều gì?',
      question_type: 'multiple_choice',
      options: [
        'A. Chỉ trích cá nhân làm chưa tốt',
        'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần',
        'C. Bỏ qua họp giao ca nếu đang bận',
      ],
      correct_answer:
        'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q4',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 4,
      question_text: 'Báo cáo doanh thu cuối ngày không khớp với thực tế.',
      question_type: 'multiple_choice',
      options: [
        'A. Tự sửa số liệu cho khớp rồi nộp',
        'B. Rà soát lại chứng từ, tìm nguyên nhân và báo cáo trung thực',
        'C. Để cuối tuần xử lý một lần',
      ],
      correct_answer: 'B. Rà soát lại chứng từ, tìm nguyên nhân và báo cáo trung thực',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q5',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 5,
      question_text: 'Khi phát hiện sai lệch hàng hóa trong kho, hành động phù hợp là gì?',
      question_type: 'multiple_choice',
      options: [
        'A. Che giấu số liệu để tránh bị phạt',
        'B. Lập biên bản, tìm nguyên nhân và đề xuất giải pháp phòng ngừa',
        'C. Đổ lỗi ngay cho ca trước',
      ],
      correct_answer: 'B. Lập biên bản, tìm nguyên nhân và đề xuất giải pháp phòng ngừa',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q6',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 6,
      question_text: 'Khi có khách hàng khiếu nại gay gắt tại hiện trường, CHT nên làm gì?',
      question_type: 'multiple_choice',
      options: [
        'A. Tranh cãi để bảo vệ cửa hàng',
        'B. Lắng nghe, xin lỗi, làm dịu tình hình rồi xử lý theo chính sách',
        'C. Đẩy trách nhiệm cho nhân viên',
      ],
      correct_answer: 'B. Lắng nghe, xin lỗi, làm dịu tình hình rồi xử lý theo chính sách',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q7',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 7,
      question_text: 'Một nhân viên giỏi có dấu hiệu chán nản, giảm hiệu suất.',
      question_type: 'multiple_choice',
      options: [
        'A. Mặc kệ, ai không làm được thì nghỉ',
        'B. Gặp riêng 1-1 để tìm hiểu khó khăn và hỗ trợ kịp thời',
        'C. Phê bình trước toàn cửa hàng',
      ],
      correct_answer: 'B. Gặp riêng 1-1 để tìm hiểu khó khăn và hỗ trợ kịp thời',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q8',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 8,
      question_text: 'Cửa hàng đang đông khách, khu vực thu ngân quá tải.',
      question_type: 'multiple_choice',
      options: [
        'A. Chỉ nhắc nhân viên làm nhanh hơn',
        'B. Trực tiếp hỗ trợ hoặc điều phối thêm người sang hỗ trợ',
        'C. Rời quầy để làm việc khác',
      ],
      correct_answer: 'B. Trực tiếp hỗ trợ hoặc điều phối thêm người sang hỗ trợ',
      is_required: true,
      created_at: now(),
    },
  ],
  'gamification-03': [
    {
      id: 'g3q1',
      game_id: '33333333-3333-3333-3333-333333333333',
      question_order: 1,
      question_text:
        'Sắp xếp các điểm chạm sau theo mức độ ảnh hưởng tới niềm tin khách hàng (quan trọng nhất ở trên cùng):',
      question_type: 'ranking',
      options: [
        'Đón tiếp khách hàng',
        'Thao tác bơm hàng',
        'Minh bạch thông tin',
        'Thanh toán nhanh chóng, chính xác',
        'Xử lý khiếu nại, thắc mắc',
        'Vệ sinh khu vực cửa hàng',
        'An toàn phòng chống cháy nổ',
        'Thái độ nhân viên',
      ],
      correct_answer: null,
      is_required: true,
      created_at: now(),
    },
  ],
};

function normalizeGameCopy(game: Game): Game {
  const canonical = CANONICAL_GAME_COPY[game.slug];
  return canonical ? { ...game, ...canonical } : game;
}

function normalizeQuestionsForGame(slug: string, questions: Question[]): Question[] {
  const canonicalQuestions = CANONICAL_QUESTIONS_BY_SLUG[slug];
  if (!canonicalQuestions) return questions;

  const canonicalByOrder = new Map(
    canonicalQuestions.map((question) => [question.question_order, question])
  );

  return questions.map((question) => {
    const canonical = canonicalByOrder.get(question.question_order);
    return canonical
      ? {
          ...question,
          question_text: canonical.question_text,
          options: canonical.options,
          correct_answer: canonical.correct_answer,
          question_type: canonical.question_type,
          is_required: canonical.is_required,
        }
      : question;
  });
}

const MOCK_GAME = normalizeGameCopy({
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'gamification-01',
  title: 'Gamification 01 - Tương tác lấy ý kiến',
  short_description: CANONICAL_GAME_COPY['gamification-01'].short_description,
  instructions: CANONICAL_GAME_COPY['gamification-01'].instructions,
  duration_seconds: 180,
  is_active: true,
  created_at: now(),
});

const MOCK_GAME_2 = normalizeGameCopy({
  id: '22222222-2222-2222-2222-222222222222',
  slug: 'gamification-02',
  title: 'Gamification 02 - Bản đồ hành động của CHT trong giai đoạn mới',
  short_description: CANONICAL_GAME_COPY['gamification-02'].short_description,
  instructions: CANONICAL_GAME_COPY['gamification-02'].instructions,
  duration_seconds: 300,
  is_active: true,
  created_at: now(),
});

const MOCK_GAME_3 = normalizeGameCopy({
  id: '33333333-3333-3333-3333-333333333333',
  slug: 'gamification-03',
  title: 'Gamification 03 - Điểm chạm nào quyết định niềm tin?',
  short_description: CANONICAL_GAME_COPY['gamification-03'].short_description,
  instructions: CANONICAL_GAME_COPY['gamification-03'].instructions,
  duration_seconds: 180,
  is_active: true,
  created_at: now(),
});

const MOCK_QUESTIONS = normalizeQuestionsForGame(
  'gamification-01',
  CANONICAL_QUESTIONS_BY_SLUG['gamification-01']
);
const MOCK_QUESTIONS_2 = normalizeQuestionsForGame(
  'gamification-02',
  CANONICAL_QUESTIONS_BY_SLUG['gamification-02']
);
const MOCK_QUESTIONS_3 = normalizeQuestionsForGame(
  'gamification-03',
  CANONICAL_QUESTIONS_BY_SLUG['gamification-03']
);

const MOCK_GAMES = [MOCK_GAME, MOCK_GAME_2, MOCK_GAME_3];

function getDemoCustomGames(): Game[] {
  if (!canUseStorage) return [];

  try {
    return JSON.parse(window.localStorage.getItem(DEMO_GAMES_KEY) || '[]');
  } catch {
    return [];
  }
}

function getDemoCustomQuestions(): Record<string, Question[]> {
  if (!canUseStorage) return {};

  try {
    return JSON.parse(window.localStorage.getItem(DEMO_QUESTIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDemoCustomGames(games: Game[]) {
  if (!canUseStorage) return;
  window.localStorage.setItem(DEMO_GAMES_KEY, JSON.stringify(games));
}

function saveDemoCustomQuestions(questionMap: Record<string, Question[]>) {
  if (!canUseStorage) return;
  window.localStorage.setItem(DEMO_QUESTIONS_KEY, JSON.stringify(questionMap));
}

export const gamesService = {
  async getActiveGames() {
    if (isDemo) return [...getDemoCustomGames(), ...MOCK_GAMES].map(normalizeGameCopy);

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Game[]).map(normalizeGameCopy);
  },

  async getGameBySlug(slug: string) {
    if (isDemo) {
      const game = [...getDemoCustomGames(), ...MOCK_GAMES].find((item) => item.slug === slug);
      if (!game) throw new Error('Game not found');
      return normalizeGameCopy(game);
    }

    const { data, error } = await supabase.from('games').select('*').eq('slug', slug).single();

    if (error) throw error;
    return normalizeGameCopy(data as Game);
  },

  async getGameQuestions(gameId: string) {
    if (isDemo) {
      const customQuestions = getDemoCustomQuestions();
      if (customQuestions[gameId]) {
        const game = [...getDemoCustomGames(), ...MOCK_GAMES].find((item) => item.id === gameId);
        return game ? normalizeQuestionsForGame(game.slug, customQuestions[gameId]) : customQuestions[gameId];
      }
      if (gameId === MOCK_GAME.id) return MOCK_QUESTIONS;
      if (gameId === MOCK_GAME_2.id) return MOCK_QUESTIONS_2;
      if (gameId === MOCK_GAME_3.id) return MOCK_QUESTIONS_3;
      return [];
    }

    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_id', gameId)
      .order('question_order', { ascending: true });

    if (error) throw error;

    const { data: gameData } = await supabase
      .from('games')
      .select('slug')
      .eq('id', gameId)
      .maybeSingle();

    return gameData?.slug
      ? normalizeQuestionsForGame(gameData.slug, data as Question[])
      : (data as Question[]);
  },

  async createGame(payload: CreateGamePayload) {
    const normalizedSlug = slugify(payload.slug || payload.title);
    const questions = payload.questions
      .map((question) => ({
        question_text: question.question_text.trim(),
        question_type: question.question_type || 'textarea',
        options: question.options?.length ? question.options : null,
        correct_answer: question.correct_answer || null,
        is_required: question.is_required ?? true,
      }))
      .filter((question) => question.question_text);

    if (!payload.title.trim() || !normalizedSlug || questions.length === 0) {
      throw new Error('Thiếu thông tin game hoặc câu hỏi.');
    }

    if (isDemo) {
      const createdGame: Game = {
        id: `demo-game-${Date.now()}`,
        title: payload.title.trim(),
        slug: normalizedSlug,
        short_description: payload.short_description.trim(),
        instructions: payload.instructions.trim(),
        duration_seconds: payload.duration_seconds,
        is_active: payload.is_active ?? true,
        created_at: now(),
      };

      const createdQuestions: Question[] = questions.map((question, index) => ({
        id: `demo-question-${Date.now()}-${index + 1}`,
        game_id: createdGame.id,
        question_order: index + 1,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        correct_answer: question.correct_answer,
        is_required: question.is_required,
        created_at: now(),
      }));

      saveDemoCustomGames([createdGame, ...getDemoCustomGames()]);
      saveDemoCustomQuestions({
        ...getDemoCustomQuestions(),
        [createdGame.id]: createdQuestions,
      });

      return createdGame;
    }

    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (existingGame as { id: string } | null) {
      throw new Error('Slug đã tồn tại. Vui lòng đổi tên hoặc slug khác.');
    }

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        title: payload.title.trim(),
        slug: normalizedSlug,
        short_description: payload.short_description.trim(),
        instructions: payload.instructions.trim(),
        duration_seconds: payload.duration_seconds,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (gameError || !game) throw gameError || new Error('Không thể tạo game.');
    const createdGame = game as Game;

    const { error: questionError } = await supabase.from('game_questions').insert(
      questions.map((question, index) => ({
        game_id: createdGame.id,
        question_order: index + 1,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        correct_answer: question.correct_answer,
        is_required: question.is_required,
      }))
    );

    if (questionError) throw questionError;

    return createdGame;
  },
};
