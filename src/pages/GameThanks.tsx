import { Link } from 'react-router-dom';
import { CheckCircle, Home, Award, Sparkles } from 'lucide-react';

export default function GameThanks() {
  const score = sessionStorage.getItem('last_score');
  const total = sessionStorage.getItem('last_total');
  const analysisRaw = sessionStorage.getItem('last_analysis');
  const analysis = analysisRaw ? JSON.parse(analysisRaw) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="card-3d p-10 md:p-16 text-center max-w-2xl w-full">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 mb-8 shadow-inner border border-green-100">
          <CheckCircle className="w-12 h-12" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 drop-shadow-sm">Cảm ơn bạn!</h1>
        <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">
          Câu trả lời của bạn đã được ghi nhận. Dữ liệu vừa nộp đã sẵn sàng cho phần tổng hợp và phân tích.
        </p>

        {score !== null && total !== null && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 mb-8 shadow-inner">
            <div className="flex items-center justify-center text-orange-600 mb-2">
              <Award className="w-8 h-8 mr-2" />
              <span className="text-xl font-bold uppercase tracking-wide">Điểm của bạn</span>
            </div>
            <div className="text-5xl font-extrabold text-orange-700 drop-shadow-sm">
              {score} <span className="text-3xl text-orange-500">/ {total}</span>
            </div>
          </div>
        )}

        {analysis && (
          <div className="text-left bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mb-8 shadow-inner">
            <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
              <Sparkles className="w-5 h-5" />
              Gemini phân tích nhanh bài làm của bạn
            </div>
            <p className="text-slate-700 font-medium leading-relaxed mb-4">{analysis.summary}</p>
            {analysis.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.keywords.map((keyword: string) => (
                  <span key={keyword} className="px-3 py-1 rounded-full bg-white text-blue-700 text-sm font-semibold border border-blue-200">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            {analysis.recommendations?.length > 0 && (
              <div className="space-y-2">
                {analysis.recommendations.map((recommendation: string) => (
                  <div key={recommendation} className="text-sm text-slate-700 font-medium">
                    • {recommendation}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Link to="/" className="btn-3d-blue w-full py-4 text-lg">
          <Home className="mr-2 w-6 h-6" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
