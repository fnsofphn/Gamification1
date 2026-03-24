# Gamification Web

Ung dung web de:

- Tao va quan ly nhieu game gamification trong thu vien
- Cho hoc vien nhap ten, vao game, tra loi cau hoi trong thoi gian gioi han
- Luu nguoi choi, phien choi, cau tra loi va phan tich AI vao Supabase
- Goi Gemini de phan tich tung bai lam va tong hop y kien theo game
- Export du lieu phan hoi sang CSV/XLSX

## Chay local

1. Cai dependency:
   `npm install`
2. Tao file `.env.local` tu `.env.example`
3. Dien `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`
4. Chay app:
   `npm run dev`

## Supabase

1. Chay SQL trong file [supabase/schema.sql](/E:/tool/github/Gamification1-main/supabase/schema.sql) de tao cac bang can thiet.
2. Chay tiep file [supabase/seed.sql](/E:/tool/github/Gamification1-main/supabase/seed.sql) de nap san Gamification 01, 02 va 03.
