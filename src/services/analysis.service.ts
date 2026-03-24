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

function parseJsonResponse(text: string): AnalysisResult {
  const parsed = JSON.parse(cleanJsonText(text));

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
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
  if (!geminiClient) {
    throw new Error('Gemini API chưa được cấu hình. Hãy thêm VITE_GEMINI_API_KEY vào biến môi trường deploy.');
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
    return Boolean(geminiClient);
  },

  getConfigurationMessage() {
    if (geminiClient) return null;
    return 'Chưa có Gemini API key. Hãy thêm VITE_GEMINI_API_KEY để bật chức năng phân tích AI.';
  },

  async analyzeSubmission(gameId: string, sessionId: string, answers: AnswerForAnalysis[]) {
    if (answers.length === 0) {
      return null;
    }

    const prompt = `
Bạn là trợ lý phân tích phản hồi đào tạo bằng tiếng Việt.
Hãy đọc câu trả lời của 1 học viên và trả về JSON hợp lệ theo cấu trúc:
{
  "summary": "Tóm tắt ngắn gọn trong 2-3 câu",
  "keywords": ["chủ đề 1", "chủ đề 2", "chủ đề 3"],
  "recommendations": ["hành động 1", "hành động 2"]
}

Yêu cầu:
- Viết tiếng Việt rõ ràng, súc tích.
- Bám sát nội dung học viên nhập.
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
