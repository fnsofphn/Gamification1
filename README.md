<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gamification Web

Ứng dụng web để:

- Tạo và quản lý nhiều game gamification trong thư viện
- Cho học viên nhập tên, vào game, trả lời câu hỏi trong thời gian giới hạn
- Lưu người chơi, phiên chơi, câu trả lời và phân tích AI vào Supabase
- Gọi Gemini để phân tích từng bài làm và tổng hợp ý kiến theo game
- Export dữ liệu phản hồi sang CSV/XLSX

## Chạy local

1. Cài dependency:
   `npm install`
2. Tạo file `.env.local` từ `.env.example`
3. Điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`
4. Chạy app:
   `npm run dev`

## Supabase

Chạy SQL trong file [supabase/schema.sql](/E:/tool/github/Gamification1-main/supabase/schema.sql) để tạo các bảng cần thiết.
