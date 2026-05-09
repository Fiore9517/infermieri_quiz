const STORAGE_KEY = "quiz_question_history";
const RECENT_SESSION_KEY = "quiz_recent_question_ids";

export interface QuestionHistory {
  [questionId: string]: number;
}

export function getQuestionHistory(): QuestionHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markQuestionsAsSeen(ids: string[]) {
  const history = getQuestionHistory();
  ids.forEach((id) => {
    history[id] = (history[id] || 0) + 1;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(ids));
}

export function resetQuestionHistory() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(RECENT_SESSION_KEY);
}

export function smartShuffle<T extends { id: string }>(
  questions: T[],
  count: number
): T[] {
  const history = getQuestionHistory();
  const recentIds = getRecentQuestionIds();
  const nonRecentQuestions = questions.filter((q) => !recentIds.has(q.id));
  const pool = nonRecentQuestions.length >= count ? nonRecentQuestions : questions;

  return pool
    .map((q) => ({
      q,
      seen: history[q.id] || 0,
      rand: Math.random(),
    }))
    .sort((a, b) => a.seen - b.seen || a.rand - b.rand)
    .slice(0, count)
    .map((x) => x.q);
}

function getRecentQuestionIds(): Set<string> {
  try {
    const raw = localStorage.getItem(RECENT_SESSION_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}
