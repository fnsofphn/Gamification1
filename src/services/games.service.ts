import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database';
import { env } from '../lib/env';
import { slugify } from '../lib/utils';

type Game = Database['public']['Tables']['games']['Row'];
type Question = Database['public']['Tables']['game_questions']['Row'];
type GameQuestion = Question & {
  answer_explanation?: string | null;
};

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
      'Loại game: Thu thập ý kiến • 3 câu hỏi',
    instructions:
      '• Đọc kỹ 3 câu hỏi trước khi trả lời\n• Bạn có 180 giây để hoàn thành\n• Hệ thống sẽ tự động nộp bài khi hết giờ',
    duration_seconds: 180,
  },
  'gamification-02': {
    title: 'Gamification 02 - Bản đồ hành động của CHT trong giai đoạn mới',
    short_description:
      'Loại game: Trắc nghiệm tình huống • 8 câu hỏi',
    instructions:
      '• Đọc kỹ từng tình huống\n• Chọn 1 đáp án đúng nhất\n• Hoàn thành trong 300 giây',
    duration_seconds: 300,
  },
  'gamification-03': {
    title: 'Gamification 03 - Điểm chạm nào quyết định niềm tin?',
    short_description:
      'Loại game: Xếp hạng ưu tiên • 1 câu hỏi',
    instructions:
      '• Sắp xếp các điểm chạm theo thứ tự ảnh hưởng giảm dần\n• Dùng nút Lên/Xuống để đổi vị trí\n• Hoàn thành trong 180 giây',
    duration_seconds: 180,
  },
};

const CANONICAL_QUESTIONS_BY_SLUG: Record<string, GameQuestion[]> = {
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
      question_text:
        'Khi giao việc cho nhân sự mới trong ca cao điểm, CHT nên làm gì để vừa bảo đảm tốc độ vận hành vừa giảm rủi ro sai sót?',
      question_type: 'multiple_choice',
      options: [
        'A. Chỉ giao đầu việc và yêu cầu hoàn thành đúng hạn để nhân sự tự xoay xở',
        'B. Giao việc rõ mục tiêu, nêu tiêu chuẩn hoàn thành, chốt mốc kiểm tra và theo sát giai đoạn đầu',
        'C. Cho nhân sự tự quan sát đồng đội rồi làm theo để tăng tính chủ động',
      ],
      correct_answer:
        'B. Giao việc rõ mục tiêu, nêu tiêu chuẩn hoàn thành, chốt mốc kiểm tra và theo sát giai đoạn đầu',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q2',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 2,
      question_text:
        'Trong quá trình kiểm tra, CHT phát hiện một nhân viên lâu năm bỏ qua bước xác nhận cuối vì cho rằng “đã quen việc”. Cách xử lý nào phù hợp nhất?',
      question_type: 'multiple_choice',
      options: [
        'A. Nhắc lỗi ngay tại quầy để răn đe và tránh lặp lại trong ca',
        'B. Tách tình huống khỏi mặt khách, yêu cầu làm đúng lại ngay và hướng dẫn lại nguyên tắc sau ca',
        'C. Tạm bỏ qua vì nhân sự đã có kinh nghiệm và cửa hàng đang bận',
      ],
      correct_answer:
        'B. Tách tình huống khỏi mặt khách, yêu cầu làm đúng lại ngay và hướng dẫn lại nguyên tắc sau ca',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q3',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 3,
      question_text:
        'Một buổi họp giao ca 10 phút nên được tổ chức thế nào để vừa bám mục tiêu doanh thu vừa xử lý ngay rủi ro vận hành?',
      question_type: 'multiple_choice',
      options: [
        'A. Đi thẳng vào truy lỗi từng cá nhân để tạo áp lực hoàn thành',
        'B. Chốt nhanh kết quả ca trước, nhắc 1-2 ưu tiên trọng tâm, phân vai rõ và lưu ý điểm rủi ro cần kiểm soát',
        'C. Bỏ họp nếu cửa hàng đông để dành toàn bộ thời gian cho bán hàng',
      ],
      correct_answer:
        'B. Chốt nhanh kết quả ca trước, nhắc 1-2 ưu tiên trọng tâm, phân vai rõ và lưu ý điểm rủi ro cần kiểm soát',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q4',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 4,
      question_text:
        'Cuối ngày, doanh thu hệ thống lệch nhẹ so với thực tế nhưng chưa xác định được nguyên nhân. CHT nên xử lý thế nào?',
      question_type: 'multiple_choice',
      options: [
        'A. Chủ động điều chỉnh số liệu cho khớp rồi báo cáo sau',
        'B. Khóa tạm báo cáo, rà soát nguồn phát sinh, ghi nhận giả thiết nguyên nhân và báo cáo trung thực theo hiện trạng',
        'C. Gộp lại đến cuối tuần xử lý để đỡ ảnh hưởng vận hành trong ngày',
      ],
      correct_answer:
        'B. Khóa tạm báo cáo, rà soát nguồn phát sinh, ghi nhận giả thiết nguyên nhân và báo cáo trung thực theo hiện trạng',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q5',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 5,
      question_text:
        'Khi phát hiện sai lệch tồn kho lặp lại nhiều lần trong tuần, đâu là hướng xử lý hiệu quả nhất của CHT?',
      question_type: 'multiple_choice',
      options: [
        'A. Giữ nguyên số liệu cũ để tránh làm lớn vấn đề',
        'B. Lập biên bản, phân loại nguyên nhân gốc và đưa ra biện pháp ngăn tái diễn theo ca/người/quy trình',
        'C. Quy trách nhiệm ngay cho ca trước để chốt nhanh báo cáo',
      ],
      correct_answer:
        'B. Lập biên bản, phân loại nguyên nhân gốc và đưa ra biện pháp ngăn tái diễn theo ca/người/quy trình',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q6',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 6,
      question_text:
        'Khi khách hàng khiếu nại gay gắt tại hiện trường và khu vực đang đông khách, CHT nên ưu tiên hành động nào trước?',
      question_type: 'multiple_choice',
      options: [
        'A. Giải thích ngay cho khách hiểu rằng cửa hàng làm đúng quy định',
        'B. Ổn định cảm xúc khách trước, xin lỗi về trải nghiệm, rồi xử lý theo đúng chính sách và thẩm quyền',
        'C. Chuyển khách sang cho nhân viên liên quan tự giải quyết',
      ],
      correct_answer:
        'B. Ổn định cảm xúc khách trước, xin lỗi về trải nghiệm, rồi xử lý theo đúng chính sách và thẩm quyền',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q7',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 7,
      question_text:
        'Một nhân sự giỏi bắt đầu giảm hiệu suất sau nhiều tuần tăng ca. CHT nên tiếp cận theo cách nào để vừa giữ người vừa giữ chuẩn công việc?',
      question_type: 'multiple_choice',
      options: [
        'A. Tăng giám sát và chờ xem nhân sự có tự cải thiện không',
        'B. Gặp 1-1, tìm nguyên nhân gốc, thống nhất hỗ trợ ngắn hạn và kỳ vọng hiệu suất rõ ràng',
        'C. Nhắc trước tập thể để nhân sự tự điều chỉnh thái độ',
      ],
      correct_answer:
        'B. Gặp 1-1, tìm nguyên nhân gốc, thống nhất hỗ trợ ngắn hạn và kỳ vọng hiệu suất rõ ràng',
      is_required: true,
      created_at: now(),
    },
    {
      id: 'g2q8',
      game_id: '22222222-2222-2222-2222-222222222222',
      question_order: 8,
      question_text:
        'Trong khung giờ cao điểm, khu vực thanh toán ùn tắc và khách bắt đầu sốt ruột. Quyết định nào của CHT là phù hợp nhất?',
      question_type: 'multiple_choice',
      options: [
        'A. Liên tục thúc tốc độ xử lý tại quầy để giải tỏa áp lực',
        'B. Điều phối lại nhân sự tức thời, trực tiếp hỗ trợ nút nghẽn và cập nhật thứ tự ưu tiên phục vụ',
        'C. Giữ nguyên phân công để tránh xáo trộn vận hành',
      ],
      correct_answer:
        'B. Điều phối lại nhân sự tức thời, trực tiếp hỗ trợ nút nghẽn và cập nhật thứ tự ưu tiên phục vụ',
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

const GAMIFICATION_02_REFINED_QUESTIONS: GameQuestion[] = [
  {
    id: 'g2q1',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 1,
    question_text:
      'Trong giờ cao điểm, nhân sự mới vừa gây ra 1 lỗi nhỏ (đã xử lý xong). Nếu tiếp tục giao việc có thể tăng rủi ro, nhưng thiếu người thì tốc độ sẽ giảm. CHT nên làm gì?',
    question_type: 'multiple_choice',
    options: [
      'A. Rút nhân sự mới ra khỏi line chính để tránh rủi ro',
      'B. Tiếp tục giao việc nhưng giảm độ khó và theo sát trực tiếp',
      'C. Giữ nguyên phân công để không làm gián đoạn vận hành',
      'D. Chuyển nhân sự sang quan sát để học thêm',
    ],
    correct_answer: 'B. Tiếp tục giao việc nhưng giảm độ khó và theo sát trực tiếp',
    answer_explanation:
      'Vì không nên “loại khỏi trận” làm giảm tốc độ, nhưng cũng không thể thả nổi. Cách đúng là giảm rủi ro mà vẫn giữ được nhịp vận hành.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q2',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 2,
    question_text:
      'Một nhân sự giỏi vừa bỏ qua quy trình, nhưng chính họ đang là người xử lý nhanh nhất giúp giảm ùn tắc. CHT nên xử lý thế nào ngay lúc đó?',
    question_type: 'multiple_choice',
    options: [
      'A. Dừng ngay để yêu cầu làm đúng quy trình',
      'B. Cho phép linh hoạt tạm thời, xử lý sau ca',
      'C. Nhắc nhanh tại chỗ nhưng không gián đoạn công việc',
      'D. Bỏ qua hoàn toàn vì đang cần tốc độ',
    ],
    correct_answer: 'C. Nhắc nhanh tại chỗ nhưng không gián đoạn công việc',
    answer_explanation:
      'Vì cần giữ flow vận hành nhưng không buông chuẩn. Nhắc ngay để hiệu chỉnh hành vi, nhưng tránh tạo ra một cú phanh gấp giữa ca.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q3',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 3,
    question_text:
      'Team vừa trải qua ca trước rất căng, nhiều lỗi nhỏ nhưng chưa kịp tổng kết. CHT nên tổ chức họp giao ca thế nào?',
    question_type: 'multiple_choice',
    options: [
      'A. Đi sâu phân tích lỗi để tránh lặp lại',
      'B. Bỏ họp để team nghỉ',
      'C. Chốt nhanh mục tiêu + cảnh báo rủi ro chính, để phân tích sau',
      'D. Nhắc chung chung để tiết kiệm thời gian',
    ],
    correct_answer: 'C. Chốt nhanh mục tiêu + cảnh báo rủi ro chính, để phân tích sau',
    answer_explanation:
      'Vì ở thời điểm này điều quan trọng là điều hướng đội ngũ và giữ nhịp ca mới, không phải mổ xẻ chi tiết ngay lập tức.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q4',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 4,
    question_text:
      'Sai lệch số liệu mỗi ngày rất nhỏ, nhưng đã lặp lại 4 ngày liên tiếp. CHT nên ưu tiên gì?',
    question_type: 'multiple_choice',
    options: [
      'A. Chưa xử lý vì giá trị nhỏ',
      'B. Xử lý ngay từng ngày riêng lẻ',
      'C. Dừng lại tìm pattern và nguyên nhân hệ thống',
      'D. Giao cho từng ca tự giải trình',
    ],
    correct_answer: 'C. Dừng lại tìm pattern và nguyên nhân hệ thống',
    answer_explanation:
      'Vì đây không còn là lỗi đơn lẻ nữa. Khi sai lệch lặp lại nhiều ngày, cần nhìn nó như một tín hiệu của lỗi hệ thống.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q5',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 5,
    question_text:
      'Đã kiểm tra nhiều lần nhưng vẫn không tìm ra nguyên nhân lệch tồn. CHT nên làm gì tiếp theo?',
    question_type: 'multiple_choice',
    options: [
      'A. Kiểm lại toàn bộ từ đầu',
      'B. Gán trách nhiệm cho người quản kho',
      'C. Thiết lập checkpoint kiểm soát mới trong quy trình',
      'D. Chờ phát sinh thêm để dễ tìm lỗi',
    ],
    correct_answer: 'C. Thiết lập checkpoint kiểm soát mới trong quy trình',
    answer_explanation:
      'Vì khi chưa thấy lỗi, việc cần làm không phải đoán tiếp mà là tạo cơ chế kiểm soát để lỗi buộc phải lộ ra.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q6',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 6,
    question_text:
      'Khách hiểu sai chính sách và phản ứng mạnh, nếu giải thích ngay dễ leo thang. CHT nên làm gì trước?',
    question_type: 'multiple_choice',
    options: [
      'A. Giải thích đúng - sai ngay',
      'B. Xin lỗi về trải nghiệm trước khi nói đúng - sai',
      'C. Gọi quản lý cấp cao',
      'D. Tránh tranh luận và cho qua',
    ],
    correct_answer: 'B. Xin lỗi về trải nghiệm trước khi nói đúng - sai',
    answer_explanation:
      'Vì trong thời điểm căng thẳng, cảm xúc luôn đi trước lý lẽ. Hạ nhiệt cảm xúc trước sẽ tạo điều kiện để khách lắng nghe phần chính sách sau đó.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q7',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 7,
    question_text:
      'Nhân sự giỏi bắt đầu tự rút gọn quy trình để làm nhanh hơn, chưa gây lỗi nhưng tiềm ẩn rủi ro. CHT nên làm gì?',
    question_type: 'multiple_choice',
    options: [
      'A. Chờ có lỗi rồi xử lý',
      'B. Cấm ngay lập tức',
      'C. Trao đổi để chuẩn hóa lại cách làm nhanh nhưng vẫn đúng',
      'D. Cho phép vì hiệu suất đang cao',
    ],
    correct_answer: 'C. Trao đổi để chuẩn hóa lại cách làm nhanh nhưng vẫn đúng',
    answer_explanation:
      'Vì không nên dập tắt sự chủ động, nhưng cũng không để một thói quen nhanh mà sai biến thành chuẩn ngầm. Cần chuẩn hóa nó thành cách làm đúng.',
    is_required: true,
    created_at: now(),
  },
  {
    id: 'g2q8',
    game_id: '22222222-2222-2222-2222-222222222222',
    question_order: 8,
    question_text:
      'Khu thanh toán nghẽn nhưng chỉ xảy ra trong 15 phút cao điểm, sau đó tự hết. CHT nên đánh giá thế nào?',
    question_type: 'multiple_choice',
    options: [
      'A. Không cần xử lý vì đã hết',
      'B. Tăng nhân sự cố định cho khu này',
      'C. Xem lại phân bổ theo khung giờ cao điểm',
      'D. Đánh giá nhân sự yếu',
    ],
    correct_answer: 'C. Xem lại phân bổ theo khung giờ cao điểm',
    answer_explanation:
      'Vì đây là bài toán phân bổ nguồn lực theo thời điểm, không phải lỗi cá nhân hay lý do để tăng người cố định cho cả ngày.',
    is_required: true,
    created_at: now(),
  },
];

function normalizeGameCopy(game: Game): Game {
  const canonical = CANONICAL_GAME_COPY[game.slug];
  return canonical ? { ...game, ...canonical } : game;
}

function normalizeQuestionsForGame(slug: string, questions: Question[]): Question[] {
  const canonicalQuestions =
    slug === 'gamification-02' ? GAMIFICATION_02_REFINED_QUESTIONS : CANONICAL_QUESTIONS_BY_SLUG[slug];
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
          answer_explanation: canonical.answer_explanation ?? null,
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

