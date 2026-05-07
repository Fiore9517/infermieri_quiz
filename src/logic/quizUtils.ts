// src/logic/quizUtils.ts
import type { Question } from "../types";

/**
 * Mescola un array in modo casuale (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Estrae N domande casuali da una lista.
 */
export function pickRandomQuestions(
  questions: Question[],
  count: number = 30
): Question[] {
  const shuffled = shuffle(questions);
  return shuffled.slice(0, count);
}

/**
 * Rimescola le opzioni di una domanda e aggiorna la risposta corretta.
 * Restituisce la domanda con le opzioni in ordine casuale
 * e il nuovo tasto della risposta corretta (es. "A" → "C").
 */
export function shuffleOptions(question: Question): {
  shuffledOptions: { key: "A" | "B" | "C" | "D"; label: string }[];
  newCorrect: "A" | "B" | "C" | "D";
} {
  const keys = (["A", "B", "C", "D"] as const).filter(
    (k) => question.options[k] !== undefined && question.options[k] !== ""
  );

  const entries = keys.map((k) => ({
    key: k,
    label: question.options[k] as string,
    isCorrect: k === question.correct,
  }));

  const shuffled = shuffle(entries);

  const labels = (["A", "B", "C", "D"] as const).slice(0, shuffled.length);

  const shuffledOptions = shuffled.map((entry, i) => ({
    key: labels[i],
    label: entry.label,
  }));

  const correctIndex = shuffled.findIndex((e) => e.isCorrect);
  const newCorrect = labels[correctIndex];

  return { shuffledOptions, newCorrect };
}