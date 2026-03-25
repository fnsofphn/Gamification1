insert into public.games (slug, title, short_description, instructions, duration_seconds, is_active)
values
  (
    'gamification-01',
    'Gamification 01 - Tương tác lấy ý kiến',
    'Hoạt động giúp học viên chia sẻ cảm nhận về thay đổi tại cửa hàng, điểm yếu trải nghiệm khách hàng và hành động cần làm ngay sau khóa học.',
    '• Đọc kỹ câu hỏi trước khi trả lời
• Bạn có 180 giây để hoàn thành
• Hệ thống sẽ tự động nộp bài khi hết giờ',
    180,
    true
  ),
  (
    'gamification-02',
    'Gamification 02 - Bản đồ hành động của CHT trong giai đoạn mới',
    'Quiz tương tác về các hành vi quản lý đúng/sai trong giao việc, kiểm tra, họp, báo cáo, xử lý sai lệch và ra quyết định tại hiện trường.',
    '• Đọc kỹ từng tình huống
• Chọn 1 đáp án đúng nhất
• Hoàn thành trong 300 giây',
    300,
    true
  ),
  (
    'gamification-03',
    'Gamification 03 - Điểm chạm nào quyết định niềm tin?',
    'Học viên xếp hạng các điểm chạm theo mức độ ảnh hưởng tới niềm tin khách hàng trên nền tảng web.',
    '• Sắp xếp các điểm chạm từ quan trọng nhất đến ít quan trọng hơn
• Dùng nút Lên/Xuống để thay đổi vị trí
• Hoàn thành trong 180 giây',
    180,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  instructions = excluded.instructions,
  duration_seconds = excluded.duration_seconds,
  is_active = excluded.is_active;

delete from public.game_questions
where game_id in (
  select id from public.games
  where slug in ('gamification-01', 'gamification-02', 'gamification-03')
);

insert into public.game_questions (game_id, question_order, question_text, question_type, options, correct_answer, is_required)
select g.id, q.question_order, q.question_text, q.question_type, q.options, q.correct_answer, q.is_required
from public.games g
join (
  values
    ('gamification-01', 1, 'Cửa hàng đang thay đổi mạnh nhất ở điểm nào?', 'textarea', null::text[], null::text, true),
    ('gamification-01', 2, 'Điểm yếu lớn nhất hiện nay trong trải nghiệm khách hàng là gì?', 'textarea', null::text[], null::text, true),
    ('gamification-01', 3, 'Điều gì cần làm ngay sau khóa học?', 'textarea', null::text[], null::text, true),
    ('gamification-02', 1, 'Khi giao việc cho nhân viên mới, CHT nên làm gì?', 'multiple_choice', array['A. Chỉ giao việc và yêu cầu hoàn thành đúng hạn', 'B. Giao việc, hướng dẫn chi tiết, đặt deadline và kiểm tra tiến độ', 'C. Để nhân viên tự tìm hiểu và làm theo cách của họ'], 'B. Giao việc, hướng dẫn chi tiết, đặt deadline và kiểm tra tiến độ', true),
    ('gamification-02', 2, 'Trong quá trình kiểm tra cửa hàng, phát hiện nhân viên làm sai quy trình.', 'multiple_choice', array['A. Quát mắng nhân viên ngay trước mặt khách hàng', 'B. Ghi nhận lỗi, gọi riêng nhân viên ra nhắc nhở và hướng dẫn lại quy trình', 'C. Bỏ qua vì lúc đó đang đông khách'], 'B. Ghi nhận lỗi, gọi riêng nhân viên ra nhắc nhở và hướng dẫn lại quy trình', true),
    ('gamification-02', 3, 'Tổ chức họp giao ca hàng ngày nên tập trung vào điều gì?', 'multiple_choice', array['A. Chỉ trích cá nhân làm chưa tốt', 'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần', 'C. Bỏ qua họp giao ca nếu đang bận'], 'B. Đánh giá nhanh kết quả hôm qua, phổ biến mục tiêu hôm nay và động viên tinh thần', true),
    ('gamification-02', 4, 'Báo cáo doanh thu cuối ngày không khớp với thực tế.', 'multiple_choice', array['A. Tự sửa số liệu cho khớp rồi nộp', 'B. Rà soát lại chứng từ, tìm nguyên nhân và báo cáo trung thực', 'C. Để cuối tuần xử lý một lần'], 'B. Rà soát lại chứng từ, tìm nguyên nhân và báo cáo trung thực', true),
    ('gamification-02', 5, 'Khi phát hiện sai lệch hàng hóa trong kho, hành động phù hợp là gì?', 'multiple_choice', array['A. Che giấu số liệu để tránh bị phạt', 'B. Lập biên bản, tìm nguyên nhân và đề xuất giải pháp phòng ngừa', 'C. Đổ lỗi ngay cho ca trước'], 'B. Lập biên bản, tìm nguyên nhân và đề xuất giải pháp phòng ngừa', true),
    ('gamification-02', 6, 'Khi có khách hàng khiếu nại gay gắt tại hiện trường, CHT nên làm gì?', 'multiple_choice', array['A. Tranh cãi để bảo vệ cửa hàng', 'B. Lắng nghe, xin lỗi, làm dịu tình hình rồi xử lý theo chính sách', 'C. Đẩy trách nhiệm cho nhân viên'], 'B. Lắng nghe, xin lỗi, làm dịu tình hình rồi xử lý theo chính sách', true),
    ('gamification-02', 7, 'Một nhân viên giỏi có dấu hiệu chán nản, giảm hiệu suất.', 'multiple_choice', array['A. Mặc kệ, ai không làm được thì nghỉ', 'B. Gặp riêng 1-1 để tìm hiểu khó khăn và hỗ trợ kịp thời', 'C. Phê bình trước toàn cửa hàng'], 'B. Gặp riêng 1-1 để tìm hiểu khó khăn và hỗ trợ kịp thời', true),
    ('gamification-02', 8, 'Cửa hàng đang đông khách, khu vực thu ngân quá tải.', 'multiple_choice', array['A. Chỉ nhắc nhân viên làm nhanh hơn', 'B. Trực tiếp hỗ trợ hoặc điều phối thêm người sang hỗ trợ', 'C. Rời quầy để làm việc khác'], 'B. Trực tiếp hỗ trợ hoặc điều phối thêm người sang hỗ trợ', true),
    ('gamification-03', 1, 'Sắp xếp các điểm chạm sau theo mức độ ảnh hưởng tới niềm tin khách hàng (quan trọng nhất ở trên cùng):', 'ranking', array['Đón tiếp khách hàng', 'Thao tác bơm hàng', 'Minh bạch thông tin', 'Thanh toán nhanh chóng, chính xác', 'Xử lý khiếu nại, thắc mắc', 'Vệ sinh khu vực cửa hàng', 'An toàn phòng chống cháy nổ', 'Thái độ nhân viên'], null::text, true)
) as q(slug, question_order, question_text, question_type, options, correct_answer, is_required)
  on g.slug = q.slug;
