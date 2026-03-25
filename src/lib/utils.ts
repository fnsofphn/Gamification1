import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const COPY_MAP: Record<string, string> = {
  'Khi giao viec cho nhan vien moi, CHT nen lam gi?':
    'Khi giao việc cho nhân sự mới trong ca cao điểm, CHT nên làm gì để vừa bảo đảm tốc độ vận hành vừa giảm rủi ro sai sót?',
  'Trong qua trinh kiem tra cua hang, phat hien nhan vien lam sai quy trinh.':
    'Trong quá trình kiểm tra, CHT phát hiện một nhân viên lâu năm bỏ qua bước xác nhận cuối vì cho rằng “đã quen việc”. Cách xử lý nào phù hợp nhất?',
  'To chuc hop giao ca hang ngay nen tap trung vao dieu gi?':
    'Một buổi họp giao ca 10 phút nên được tổ chức thế nào để vừa bám mục tiêu doanh thu vừa xử lý ngay rủi ro vận hành?',
  'Bao cao doanh thu cuoi ngay khong khop voi thuc te.':
    'Cuối ngày, doanh thu hệ thống lệch nhẹ so với thực tế nhưng chưa xác định được nguyên nhân. CHT nên xử lý thế nào?',
  'Khi phat hien sai lech hang hoa trong kho, hanh dong phu hop la gi?':
    'Khi phát hiện sai lệch tồn kho lặp lại nhiều lần trong tuần, đâu là hướng xử lý hiệu quả nhất của CHT?',
  'Khi co khach hang khieu nai gay gat tai hien truong, CHT nen lam gi?':
    'Khi khách hàng khiếu nại gay gắt tại hiện trường và khu vực đang đông khách, CHT nên ưu tiên hành động nào trước?',
  'Mot nhan vien gioi co dau hieu chan nan, giam hieu suat.':
    'Một nhân sự giỏi bắt đầu giảm hiệu suất sau nhiều tuần tăng ca. CHT nên tiếp cận theo cách nào để vừa giữ người vừa giữ chuẩn công việc?',
  'Cua hang dang dong khach, khu vuc thu ngan qua tai.':
    'Trong khung giờ cao điểm, khu vực thanh toán ùn tắc và khách bắt đầu sốt ruột. Quyết định nào của CHT là phù hợp nhất?',
  'A. Chi giao viec va yeu cau hoan thanh dung han':
    'A. Chỉ giao đầu việc và yêu cầu hoàn thành đúng hạn để nhân sự tự xoay xở',
  'B. Giao viec, huong dan chi tiet, dat deadline va kiem tra tien do':
    'B. Giao việc rõ mục tiêu, nêu tiêu chuẩn hoàn thành, chốt mốc kiểm tra và theo sát giai đoạn đầu',
  'C. De nhan vien tu tim hieu va lam theo cach cua ho':
    'C. Cho nhân sự tự quan sát đồng đội rồi làm theo để tăng tính chủ động',
  'A. Quat mang nhan vien ngay truoc mat khach hang':
    'A. Nhắc lỗi ngay tại quầy để răn đe và tránh lặp lại trong ca',
  'B. Ghi nhan loi, goi rieng nhan vien ra nhac nho va huong dan lai quy trinh':
    'B. Tách tình huống khỏi mặt khách, yêu cầu làm đúng lại ngay và hướng dẫn lại nguyên tắc sau ca',
  'C. Bo qua vi luc do dang dong khach':
    'C. Tạm bỏ qua vì nhân sự đã có kinh nghiệm và cửa hàng đang bận',
  'A. Chi trich ca nhan lam chua tot':
    'A. Đi thẳng vào truy lỗi từng cá nhân để tạo áp lực hoàn thành',
  'B. Danh gia nhanh ket qua hom qua, pho bien muc tieu hom nay va dong vien tinh than':
    'B. Chốt nhanh kết quả ca trước, nhắc 1-2 ưu tiên trọng tâm, phân vai rõ và lưu ý điểm rủi ro cần kiểm soát',
  'C. Bo qua hop giao ca neu dang ban':
    'C. Bỏ họp nếu cửa hàng đông để dành toàn bộ thời gian cho bán hàng',
  'A. Tu sua so lieu cho khop roi nop':
    'A. Chủ động điều chỉnh số liệu cho khớp rồi báo cáo sau',
  'B. Ra soat lai chung tu, tim nguyen nhan va bao cao trung thuc':
    'B. Khóa tạm báo cáo, rà soát nguồn phát sinh, ghi nhận giả thiết nguyên nhân và báo cáo trung thực theo hiện trạng',
  'C. De cuoi tuan xu ly mot lan':
    'C. Gộp lại đến cuối tuần xử lý để đỡ ảnh hưởng vận hành trong ngày',
  'A. Che giau so lieu de tranh bi phat':
    'A. Giữ nguyên số liệu cũ để tránh làm lớn vấn đề',
  'B. Lap bien ban, tim nguyen nhan va de xuat giai phap phong ngua':
    'B. Lập biên bản, phân loại nguyên nhân gốc và đưa ra biện pháp ngăn tái diễn theo ca/người/quy trình',
  'C. Do loi ngay cho ca truoc':
    'C. Quy trách nhiệm ngay cho ca trước để chốt nhanh báo cáo',
  'A. Tranh cai de bao ve cua hang':
    'A. Giải thích ngay cho khách hiểu rằng cửa hàng làm đúng quy định',
  'B. Lang nghe, xin loi, lam diu tinh hinh roi xu ly theo chinh sach':
    'B. Ổn định cảm xúc khách trước, xin lỗi về trải nghiệm, rồi xử lý theo đúng chính sách và thẩm quyền',
  'C. Day trach nhiem cho nhan vien':
    'C. Chuyển khách sang cho nhân viên liên quan tự giải quyết',
  'A. Mac ke, ai khong lam duoc thi nghi':
    'A. Tăng giám sát và chờ xem nhân sự có tự cải thiện không',
  'B. Gap rieng 1-1 de tim hieu kho khan va ho tro kip thoi':
    'B. Gặp 1-1, tìm nguyên nhân gốc, thống nhất hỗ trợ ngắn hạn và kỳ vọng hiệu suất rõ ràng',
  'C. Phe binh truoc toan cua hang':
    'C. Nhắc trước tập thể để nhân sự tự điều chỉnh thái độ',
  'A. Chi nhac nhan vien lam nhanh hon':
    'A. Liên tục thúc tốc độ xử lý tại quầy để giải tỏa áp lực',
  'B. Truc tiep ho tro hoac dieu phoi them nguoi sang ho tro':
    'B. Điều phối lại nhân sự tức thời, trực tiếp hỗ trợ nút nghẽn và cập nhật thứ tự ưu tiên phục vụ',
  'C. Roi quay de lam viec khac':
    'C. Giữ nguyên phân công để tránh xáo trộn vận hành',
  'Cua hang dang thay doi manh nhat o diem nao?': 'Cửa hàng đang thay đổi mạnh nhất ở điểm nào?',
  'Diem yeu lon nhat hien nay trong trai nghiem khach hang la gi?':
    'Điểm yếu lớn nhất hiện nay trong trải nghiệm khách hàng là gì?',
  'Dieu gi can lam ngay sau khoa hoc?': 'Điều gì cần làm ngay sau khóa học?',
  'Sap xep cac diem cham sau theo muc do anh huong toi niem tin khach hang quan trong nhat o tren cung:':
    'Sắp xếp các điểm chạm sau theo mức độ ảnh hưởng tới niềm tin khách hàng (quan trọng nhất ở trên cùng):',
  'Don tiep khach hang': 'Đón tiếp khách hàng',
  'Thao tac bom hang': 'Thao tác bơm hàng',
  'Minh bach thong tin': 'Minh bạch thông tin',
  'Thanh toan nhanh chong chinh xac': 'Thanh toán nhanh chóng, chính xác',
  'Xu ly khieu nai thac mac': 'Xử lý khiếu nại, thắc mắc',
  'Ve sinh khu vuc cua hang': 'Vệ sinh khu vực cửa hàng',
  'An toan phong chong chay no': 'An toàn phòng chống cháy nổ',
  'Thai do nhan vien': 'Thái độ nhân viên',
};

export function normalizeVietnameseCopy(text: string) {
  return COPY_MAP[text] || text;
}

export function formatAnswerText(answer: string) {
  try {
    const parsed = JSON.parse(answer);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => `${index + 1}. ${normalizeVietnameseCopy(String(item))}`).join('\n');
    }
  } catch {
    // Ignore non-JSON answers.
  }

  return normalizeVietnameseCopy(answer);
}
