const STORAGE_KEY = "quiz_question_history";

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
}

export function resetQuestionHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function smartShuffle<T extends { id: string }>(
  questions: T[],
  count: number
): T[] {
  const history = getQuestionHistory();
  const weighted = questions.map((q) => ({
    q,
    weight: 1 / ((history[q.id] || 0) + 1),
    rand: Math.random(),
  }));
  weighted.sort((a, b) => b.weight * b.rand - a.weight * a.rand);
  return weighted.slice(0, count).map((x) => x.q);
}