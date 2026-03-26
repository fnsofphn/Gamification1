import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RequireAccess from './components/RequireAccess';
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import GameJoin from './pages/GameJoin';
import GamePlay from './pages/GamePlay';
import GameThanks from './pages/GameThanks';
import GameResults from './pages/GameResults';
import Dashboard from './pages/Dashboard';
import { env } from './lib/env';

const isDemo = env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

export default function App() {
  return (
    <Router>
      {isDemo && (
        <div className="bg-orange-100 text-orange-800 px-4 py-2 text-sm text-center font-medium">
          Đang chạy ở chế độ demo. Bạn có thể xem giao diện, tạo game thử và lưu tạm trên trình duyệt.
          Để đồng bộ dữ liệu thật, hãy kết nối Supabase và Gemini bằng biến môi trường.
        </div>
      )}
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<RequireAccess />}>
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GameDetail />} />
          <Route path="/games/:slug/join" element={<GameJoin />} />
          <Route path="/games/:slug/play" element={<GamePlay />} />
          <Route path="/games/:slug/thanks" element={<GameThanks />} />
        </Route>
        <Route element={<RequireAccess role="manager" />}>
          <Route path="/games/:slug/results" element={<GameResults />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
