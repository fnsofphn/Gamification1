insert into public.games (slug, title, short_description, instructions, duration_seconds, is_active)
values
  (
    'gamification-01',
    'Gamification 01 - Tuong tac lay y kien',
    'Hoat dong giup hoc vien chia se cam nhan ve thay doi tai cua hang, diem yeu trai nghiem khach hang va hanh dong can lam ngay sau khoa hoc.',
    'Doc ky cau hoi truoc khi tra loi
Ban co 180 giay de hoan thanh
He thong se tu dong nop bai khi het gio',
    180,
    true
  ),
  (
    'gamification-02',
    'Gamification 02 - Ban do hanh dong cua CHT trong giai doan moi',
    'Quiz tuong tac ve cac hanh vi quan ly dung sai trong giao viec, kiem tra, hop, bao cao, xu ly sai lech va ra quyet dinh tai hien truong.',
    'Doc ky tung tinh huong
Chon 1 dap an dung nhat
Hoan thanh trong 300 giay',
    300,
    true
  ),
  (
    'gamification-03',
    'Gamification 03 - Diem cham nao quyet dinh niem tin?',
    'Hoc vien xep hang cac diem cham theo muc do anh huong toi niem tin khach hang tren nen tang web.',
    'Sap xep cac diem cham tu quan trong nhat den it quan trong hon
Dung nut Len Xuong de thay doi vi tri
Hoan thanh trong 180 giay',
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
    ('gamification-01', 1, 'Cua hang dang thay doi manh nhat o diem nao?', 'textarea', null::text[], null::text, true),
    ('gamification-01', 2, 'Diem yeu lon nhat hien nay trong trai nghiem khach hang la gi?', 'textarea', null::text[], null::text, true),
    ('gamification-01', 3, 'Dieu gi can lam ngay sau khoa hoc?', 'textarea', null::text[], null::text, true),
    ('gamification-02', 1, 'Khi giao viec cho nhan vien moi, CHT nen lam gi?', 'multiple_choice', array['A. Chi giao viec va yeu cau hoan thanh dung han', 'B. Giao viec, huong dan chi tiet, dat deadline va kiem tra tien do', 'C. De nhan vien tu tim hieu va lam theo cach cua ho'], 'B. Giao viec, huong dan chi tiet, dat deadline va kiem tra tien do', true),
    ('gamification-02', 2, 'Trong qua trinh kiem tra cua hang, phat hien nhan vien lam sai quy trinh.', 'multiple_choice', array['A. Quat mang nhan vien ngay truoc mat khach hang', 'B. Ghi nhan loi, goi rieng nhan vien ra nhac nho va huong dan lai quy trinh', 'C. Bo qua vi luc do dang dong khach'], 'B. Ghi nhan loi, goi rieng nhan vien ra nhac nho va huong dan lai quy trinh', true),
    ('gamification-02', 3, 'To chuc hop giao ca hang ngay nen tap trung vao dieu gi?', 'multiple_choice', array['A. Chi trich ca nhan lam chua tot', 'B. Danh gia nhanh ket qua hom qua, pho bien muc tieu hom nay va dong vien tinh than', 'C. Bo qua hop giao ca neu dang ban'], 'B. Danh gia nhanh ket qua hom qua, pho bien muc tieu hom nay va dong vien tinh than', true),
    ('gamification-02', 4, 'Bao cao doanh thu cuoi ngay khong khop voi thuc te.', 'multiple_choice', array['A. Tu sua so lieu cho khop roi nop', 'B. Ra soat lai chung tu, tim nguyen nhan va bao cao trung thuc', 'C. De cuoi tuan xu ly mot lan'], 'B. Ra soat lai chung tu, tim nguyen nhan va bao cao trung thuc', true),
    ('gamification-02', 5, 'Khi phat hien sai lech hang hoa trong kho, hanh dong phu hop la gi?', 'multiple_choice', array['A. Che giau so lieu de tranh bi phat', 'B. Lap bien ban, tim nguyen nhan va de xuat giai phap phong ngua', 'C. Do loi ngay cho ca truoc'], 'B. Lap bien ban, tim nguyen nhan va de xuat giai phap phong ngua', true),
    ('gamification-02', 6, 'Khi co khach hang khieu nai gay gat tai hien truong, CHT nen lam gi?', 'multiple_choice', array['A. Tranh cai de bao ve cua hang', 'B. Lang nghe, xin loi, lam diu tinh hinh roi xu ly theo chinh sach', 'C. Day trach nhiem cho nhan vien'], 'B. Lang nghe, xin loi, lam diu tinh hinh roi xu ly theo chinh sach', true),
    ('gamification-02', 7, 'Mot nhan vien gioi co dau hieu chan nan, giam hieu suat.', 'multiple_choice', array['A. Mac ke, ai khong lam duoc thi nghi', 'B. Gap rieng 1-1 de tim hieu kho khan va ho tro kip thoi', 'C. Phe binh truoc toan cua hang'], 'B. Gap rieng 1-1 de tim hieu kho khan va ho tro kip thoi', true),
    ('gamification-02', 8, 'Cua hang dang dong khach, khu vuc thu ngan qua tai.', 'multiple_choice', array['A. Chi nhac nhan vien lam nhanh hon', 'B. Truc tiep ho tro hoac dieu phoi them nguoi sang ho tro', 'C. Roi quay de lam viec khac'], 'B. Truc tiep ho tro hoac dieu phoi them nguoi sang ho tro', true),
    ('gamification-03', 1, 'Sap xep cac diem cham sau theo muc do anh huong toi niem tin khach hang quan trong nhat o tren cung:', 'ranking', array['Don tiep khach hang', 'Thao tac bom hang', 'Minh bach thong tin', 'Thanh toan nhanh chong chinh xac', 'Xu ly khieu nai thac mac', 'Ve sinh khu vuc cua hang', 'An toan phong chong chay no', 'Thai do nhan vien'], null::text, true)
) as q(slug, question_order, question_text, question_type, options, correct_answer, is_required)
  on g.slug = q.slug;
