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

const MOCK_GAME: Game = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'gamification-01',
  title: 'Gamification 01 - Tương tác lấy ý kiến',
  short_description:
    'Hoạt động giúp học viên chia sẻ cảm nhận về thay đổi tại cửa hàng, điểm yếu trải nghiệm khách hàng và hành động cần làm ngay sau khóa học.',
  instructions:
    '• Đọc kỹ 3 câu hỏi trước khi trả lời\n• Bạn có 180 giây để hoàn thành\n• Hệ thống sẽ tự động nộp bài khi hết giờ',
  duration_seconds: 180,
  is_active: true,
  created_at: now(),
};

const MOCK_GAME_2: Game = {
  id: '22222222-2222-2222-2222-222222222222',
  slug: 'gamification-02',
  title: 'Gamification 02 - Bản đồ hành động của CHT trong giai đoạn mới',
  short_description:
    'Quiz tương tác về các hành vi quản lý đúng/sai trong giao việc, kiểm tra, họp, báo cáo, xử lý sai lệch và ra quyết định tại hiện trường.',
  instructions:
    '• Đọc kỹ từng tình huống\n• Chọn 1 đáp án đúng nhất\n• Hoàn thành trong 300 giây',
  duration_seconds: 300,
  is_active: true,
  created_at: now(),
};

const MOCK_GAME_3: Game = {
  id: '33333333-3333-3333-3333-333333333333',
  slug: 'gamification-03',
  title: 'Gamification 03 - Điểm chạm nào quyết định niềm tin?',
  short_description:
    'Học viên xếp hạng các điểm chạm theo mức độ ảnh hưởng tới niềm tin khách hàng trên nền tảng web.',
  instructions:
    '• Sắp xếp các điểm chạm theo thứ tự quan trọng giảm dần\n• Dùng nút Lên/Xuống để đổi vị trí\n• Hoàn thành trong 180 giây',
  duration_seconds: 180,
  is_active: true,
  created_at: now(),
};

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    game_id: MOCK_GAME.id,
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
    game_id: MOCK_GAME.id,
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
    game_id: MOCK_GAME.id,
    question_order: 3,
    question_text: 'Điều gì cần làm ngay sau khóa học?',
    question_type: 'textarea',
    options: null,
    correct_answer: null,
    is_required: true,
    created_at: now(),
  },
];

const MOCK_QUESTIONS_2: Question[] = [
  {
    id: 'g2q1',
    game_id: MOCK_GAME_2.id,
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
    game_id: MOCK_GAME_2.id,
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
    game_id: MOCK_GAME_2.id,
    question_order: 3,
    question_text: 'Tổ chức họp giao ca hàng ngày nên tập trung vào điều gì?',
    question_type: 'multiple_choice',
    options: [
      'A. Chỉ trích cá nhân làm chưa tốt ngày hôm qua',
      'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần',
      'C. Bỏ qua họp giao ca nếu thấy không cần thiết',
    ],
    correct_answer:
      'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần',
    is_required: true,
    created_at: now(),
  },
];

const MOCK_QUESTIONS_3: Question[] = [
  {
    id: 'g3q1',
    game_id: MOCK_GAME_3.id,
    question_order: 1,
    question_text:
      'Sắp xếp các điểm chạm sau theo mức độ ảnh hưởng tới niềm tin khách hàng (quan trọng nhất ở trên cùng):',
    question_type: 'ranking',
    options: [
      'Minh bạch thông tin',
      'Thái độ nhân viên',
      'Thao tác bơm hàng',
      'An toàn phòng chống cháy nổ',
      'Xử lý khiếu nại, thắc mắc',
      'Thanh toán nhanh chóng, chính xác',
      'Đón tiếp khách hàng',
      'Vệ sinh khu vực cửa hàng',
    ],
    correct_answer: null,
    is_required: true,
    created_at: now(),
  },
];

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
    if (isDemo) return [...getDemoCustomGames(), ...MOCK_GAMES];

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Game[];
  },

  async getGameBySlug(slug: string) {
    if (isDemo) {
      const game = [...getDemoCustomGames(), ...MOCK_GAMES].find((item) => item.slug === slug);
      if (!game) throw new Error('Game not found');
      return game;
    }

    const { data, error } = await supabase.from('games').select('*').eq('slug', slug).single();

    if (error) throw error;
    return data as Game;
  },

  async getGameQuestions(gameId: string) {
    if (isDemo) {
      const customQuestions = getDemoCustomQuestions();
      if (customQuestions[gameId]) return customQuestions[gameId];
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
    return data as Question[];
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
