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

export function formatAnswerText(answer: string) {
  try {
    const parsed = JSON.parse(answer);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => `${index + 1}. ${String(item)}`).join('\n');
    }
  } catch {
    // Ignore non-JSON answers.
  }

  return answer;
}
