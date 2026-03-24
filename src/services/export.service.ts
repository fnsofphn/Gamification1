import * as XLSX from 'xlsx';
import { submissionsService } from './submissions.service';
import { formatAnswerText } from '../lib/utils';

function buildRows(data: any[]) {
  return data.map((session: any) => {
    const row: Record<string, string | number> = {
      Game: session.games?.title || 'Unknown',
      Participant: session.participants?.display_name || 'Unknown',
      Unit: session.participants?.unit_name || '',
      StartedAt: new Date(session.started_at).toLocaleString(),
      SubmittedAt: session.submitted_at ? new Date(session.submitted_at).toLocaleString() : '',
      Status: session.status,
    };

    if (session.score !== null && session.score !== undefined) {
      row.Score = session.score;
    }

    const answers = [...(session.game_answers || [])].sort(
      (left, right) =>
        (left.game_questions?.question_order || 0) - (right.game_questions?.question_order || 0)
    );

    answers.forEach((answer: any) => {
      const questionText = answer.game_questions?.question_text || `Question ${answer.question_id}`;
      row[questionText] = formatAnswerText(answer.answer_text);
    });

    return row;
  });
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportService = {
  async exportSubmissionsToExcel(gameId?: string, gameSlug?: string) {
    const submissions = gameId
      ? await submissionsService.getGameSubmissions(gameId)
      : await submissionsService.getRecentSubmissions();

    const worksheet = XLSX.utils.json_to_sheet(buildRows(submissions));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    const filename = `${gameSlug || 'gamification'}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  },

  async exportSubmissionsToCSV(gameId?: string, gameSlug?: string) {
    const submissions = gameId
      ? await submissionsService.getGameSubmissions(gameId)
      : await submissionsService.getRecentSubmissions();

    const worksheet = XLSX.utils.json_to_sheet(buildRows(submissions));
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const filename = `${gameSlug || 'gamification'}-${new Date().toISOString().slice(0, 10)}.csv`;

    downloadBlob(csv, 'text/csv;charset=utf-8;', filename);
  },
};
