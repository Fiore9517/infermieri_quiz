import type { Question } from "../types";
import { canonicalTopic } from "./topicAliases";

export function normalizeQuestionText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function uniqueQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();

  return questions.filter((question) => {
    const key = normalizeQuestionText(question.text);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeQuestionTopics(questions: Question[]): Question[] {
  return questions.map((question) => ({
    ...question,
    topic: canonicalTopic(question.topic),
  }));
}
