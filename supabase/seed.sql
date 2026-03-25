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
    ('gamification-02', 1, 'Trong giờ cao điểm, nhân sự mới vừa gây ra 1 lỗi nhỏ (đã xử lý xong). Nếu tiếp tục giao việc có thể tăng rủi ro, nhưng thiếu người thì tốc độ sẽ giảm. CHT nên làm gì?', 'multiple_choice', array['A. Rút nhân sự mới ra khỏi line chính để tránh rủi ro', 'B. Tiếp tục giao việc nhưng giảm độ khó và theo sát trực tiếp', 'C. Giữ nguyên phân công để không làm gián đoạn vận hành', 'D. Chuyển nhân sự sang quan sát để học thêm'], 'B. Tiếp tục giao việc nhưng giảm độ khó và theo sát trực tiếp', true),
    ('gamification-02', 2, 'Một nhân sự giỏi vừa bỏ qua quy trình, nhưng chính họ đang là người xử lý nhanh nhất giúp giảm ùn tắc. CHT nên xử lý thế nào ngay lúc đó?', 'multiple_choice', array['A. Dừng ngay để yêu cầu làm đúng quy trình', 'B. Cho phép linh hoạt tạm thời, xử lý sau ca', 'C. Nhắc nhanh tại chỗ nhưng không gián đoạn công việc', 'D. Bỏ qua hoàn toàn vì đang cần tốc độ'], 'C. Nhắc nhanh tại chỗ nhưng không gián đoạn công việc', true),
    ('gamification-02', 3, 'Team vừa trải qua ca trước rất căng, nhiều lỗi nhỏ nhưng chưa kịp tổng kết. CHT nên tổ chức họp giao ca thế nào?', 'multiple_choice', array['A. Đi sâu phân tích lỗi để tránh lặp lại', 'B. Bỏ họp để team nghỉ', 'C. Chốt nhanh mục tiêu + cảnh báo rủi ro chính, để phân tích sau', 'D. Nhắc chung chung để tiết kiệm thời gian'], 'C. Chốt nhanh mục tiêu + cảnh báo rủi ro chính, để phân tích sau', true),
    ('gamification-02', 4, 'Sai lệch số liệu mỗi ngày rất nhỏ, nhưng đã lặp lại 4 ngày liên tiếp. CHT nên ưu tiên gì?', 'multiple_choice', array['A. Chưa xử lý vì giá trị nhỏ', 'B. Xử lý ngay từng ngày riêng lẻ', 'C. Dừng lại tìm pattern và nguyên nhân hệ thống', 'D. Giao cho từng ca tự giải trình'], 'C. Dừng lại tìm pattern và nguyên nhân hệ thống', true),
    ('gamification-02', 5, 'Đã kiểm tra nhiều lần nhưng vẫn không tìm ra nguyên nhân lệch tồn. CHT nên làm gì tiếp theo?', 'multiple_choice', array['A. Kiểm lại toàn bộ từ đầu', 'B. Gán trách nhiệm cho người quản kho', 'C. Thiết lập checkpoint kiểm soát mới trong quy trình', 'D. Chờ phát sinh thêm để dễ tìm lỗi'], 'C. Thiết lập checkpoint kiểm soát mới trong quy trình', true),
    ('gamification-02', 6, 'Khách hiểu sai chính sách và phản ứng mạnh, nếu giải thích ngay dễ leo thang. CHT nên làm gì trước?', 'multiple_choice', array['A. Giải thích đúng - sai ngay', 'B. Xin lỗi về trải nghiệm trước khi nói đúng - sai', 'C. Gọi quản lý cấp cao', 'D. Tránh tranh luận và cho qua'], 'B. Xin lỗi về trải nghiệm trước khi nói đúng - sai', true),
    ('gamification-02', 7, 'Nhân sự giỏi bắt đầu tự rút gọn quy trình để làm nhanh hơn, chưa gây lỗi nhưng tiềm ẩn rủi ro. CHT nên làm gì?', 'multiple_choice', array['A. Chờ có lỗi rồi xử lý', 'B. Cấm ngay lập tức', 'C. Trao đổi để chuẩn hóa lại cách làm nhanh nhưng vẫn đúng', 'D. Cho phép vì hiệu suất đang cao'], 'C. Trao đổi để chuẩn hóa lại cách làm nhanh nhưng vẫn đúng', true),
    ('gamification-02', 8, 'Khu thanh toán nghẽn nhưng chỉ xảy ra trong 15 phút cao điểm, sau đó tự hết. CHT nên đánh giá thế nào?', 'multiple_choice', array['A. Không cần xử lý vì đã hết', 'B. Tăng nhân sự cố định cho khu này', 'C. Xem lại phân bổ theo khung giờ cao điểm', 'D. Đánh giá nhân sự yếu'], 'C. Xem lại phân bổ theo khung giờ cao điểm', true),
    ('gamification-03', 1, 'Sắp xếp các điểm chạm sau theo mức độ ảnh hưởng tới niềm tin khách hàng (quan trọng nhất ở trên cùng):', 'ranking', array['Đón tiếp khách hàng', 'Thao tác bơm hàng', 'Minh bạch thông tin', 'Thanh toán nhanh chóng, chính xác', 'Xử lý khiếu nại, thắc mắc', 'Vệ sinh khu vực cửa hàng', 'An toàn phòng chống cháy nổ', 'Thái độ nhân viên'], null::text, true)
) as q(slug, question_order, question_text, question_type, options, correct_answer, is_required)
  on g.slug = q.slug;

