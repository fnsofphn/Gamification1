import { geminiClient } from '../lib/gemini';
import { env } from '../lib/env';
import { supabase } from '../lib/supabase/client';

type AnswerForAnalysis = {
  question: string;
  answer: string;
};

type AnalysisResult = {
  summary: string;
  keywords: string[];
  recommendations: string[];
  raw_json: unknown;
};

const isDemo = env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

function cleanJsonText(text: string) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function softenAnalysisLanguage(text: string) {
  return text
    .replace(/\bcủa học viên\b/gi, 'của bạn')
    .replace(/\bhọc viên đã\b/gi, 'bạn đã')
    .replace(/\bngười học\b/gi, 'bạn')
    .replace(/\bhọc viên\b/gi, 'bạn');
}

function parseJsonResponse(text: string): AnalysisResult {
  const parsed = JSON.parse(cleanJsonText(text));

  return {
    summary: softenAnalysisLanguage(typeof parsed.summary === 'string' ? parsed.summary : ''),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((item) => softenAnalysisLanguage(String(item)))
      : [],
    raw_json: parsed,
  };
}

async function saveAnalysis(params: {
  gameId: string;
  sessionId?: string | null;
  analysisType: 'submission' | 'game_summary';
  analysis: AnalysisResult;
}) {
  if (isDemo) return;

  await supabase.from('game_ai_analyses').insert({
    game_id: params.gameId,
    session_id: params.sessionId ?? null,
    analysis_type: params.analysisType,
    summary: params.analysis.summary,
    keywords: params.analysis.keywords,
    recommendations: params.analysis.recommendations,
    raw_json: params.analysis.raw_json as any,
  });
}

async function generateStructuredAnalysis(prompt: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const payload = await response.json();
      if (!payload?.text) {
        throw new Error('Gemini API returned an empty response.');
      }
      return parseJsonResponse(payload.text);
    }

    if (response.status !== 404) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Gemini server analysis failed.');
    }
  } catch (error) {
    if (!geminiClient) {
      throw error instanceof Error
        ? error
        : new Error('Gemini API chưa được cấu hình trên server hoặc frontend.');
    }
  }

  if (!geminiClient) {
    throw new Error(
      'Gemini API chưa được cấu hình. Trên Vercel hãy thêm GEMINI_API_KEY, hoặc khi chạy local hãy thêm VITE_GEMINI_API_KEY.'
    );
  }

  const response = await geminiClient.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Gemini không trả về nội dung phân tích.');
  }

  return parseJsonResponse(resultText);
}

export const analysisService = {
  isConfigured() {
    return true;
  },

  getConfigurationMessage() {
    return 'Nếu đang deploy trên Vercel, hãy thêm GEMINI_API_KEY. Nếu đang chạy local, hãy thêm VITE_GEMINI_API_KEY.';
  },

  async analyzeSubmission(gameId: string, sessionId: string, answers: AnswerForAnalysis[]) {
    if (answers.length === 0) {
      return null;
    }

    const prompt = `
Bạn là trợ lý phân tích phản hồi đào tạo bằng tiếng Việt.
Hãy đọc câu trả lời của 1 người chơi và trả về JSON hợp lệ theo cấu trúc:
{
  "summary": "Tóm tắt ngắn gọn trong 2-3 câu",
  "keywords": ["chủ đề 1", "chủ đề 2", "chủ đề 3"],
  "recommendations": ["hành động 1", "hành động 2"]
}

Yêu cầu:
- Viết tiếng Việt rõ ràng, súc tích.
- Dùng đại từ "bạn" thay cho "học viên" hoặc "người học".
- Bám sát nội dung người chơi nhập.
- Không thêm markdown, không thêm giải thích ngoài JSON.

Dữ liệu đầu vào:
${answers.map((item, index) => `${index + 1}. ${item.question}\nTrả lời: ${item.answer}`).join('\n\n')}
    `.trim();

    try {
      const analysis = await generateStructuredAnalysis(prompt);
      await saveAnalysis({
        gameId,
        sessionId,
        analysisType: 'submission',
        analysis,
      });

      return analysis;
    } catch (error) {
      console.error('AI submission analysis failed:', error);
      throw error;
    }
  },

  async summarizeGameFeedback(gameId: string, answers: AnswerForAnalysis[]) {
    if (answers.length === 0) {
      return null;
    }

    const prompt = `
Bạn là trợ lý tổng hợp phản hồi cho một game lấy ý kiến.
Hãy phân tích toàn bộ ý kiến và trả về JSON hợp lệ theo cấu trúc:
{
  "summary": "Tổng hợp chung 3-4 câu về bức tranh nổi bật",
  "keywords": ["cụm chủ đề 1", "cụm chủ đề 2", "cụm chủ đề 3", "cụm chủ đề 4"],
  "recommendations": ["việc nên làm ngay", "việc nên ưu tiên tiếp theo", "việc cần theo dõi"]
}

Yêu cầu:
- Viết bằng tiếng Việt.
- Dùng đại từ "bạn" nếu cần nhắc đến người trả lời.
- Nhóm ý kiến tương đồng thành các chủ đề rõ ràng.
- Chỉ trả về JSON, không markdown.

Dữ liệu phản hồi:
${answers.map((item, index) => `${index + 1}. ${item.question}\nÝ kiến: ${item.answer}`).join('\n\n')}
    `.trim();

    try {
      const analysis = await generateStructuredAnalysis(prompt);
      await saveAnalysis({
        gameId,
        sessionId: null,
        analysisType: 'game_summary',
        analysis,
      });

      return analysis;
    } catch (error) {
      console.error('AI game summary analysis failed:', error);
      throw error;
    }
  },

  async getLatestGameSummary(gameId: string) {
    if (isDemo) return null;

    const { data, error } = await supabase
      .from('game_ai_analyses')
      .select('*')
      .eq('game_id', gameId)
      .eq('analysis_type', 'game_summary')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
