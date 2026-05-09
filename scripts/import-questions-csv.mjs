import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { canonicalTopic } from "./topic-aliases.mjs";

const [, , inputPath, outputPath = "src/data/questions-extra-5000.ts"] = process.argv;

if (!inputPath) {
  console.error("Uso: node scripts/import-questions-csv.mjs input.csv [output.ts]");
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const raw = readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean);
const headers = parseCsvLine(headerLine).map((header) => header.toLowerCase());
const required = ["id", "topic", "text", "a", "b", "c", "d", "correct", "explanation"];

for (const column of required) {
  if (!headers.includes(column)) {
    console.error(`Colonna mancante: ${column}`);
    process.exit(1);
  }
}

const rows = lines.map((line) => {
  const values = parseCsvLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
});

const questions = rows.map((row, index) => {
  const correct = row.correct.toUpperCase();
  if (!["A", "B", "C", "D"].includes(correct)) {
    throw new Error(`Risposta corretta non valida alla riga ${index + 2}: ${row.correct}`);
  }

  return {
    id: row.id,
    topic: canonicalTopic(row.topic),
    text: row.text,
    options: {
      A: row.a,
      B: row.b,
      C: row.c,
      D: row.d,
    },
    correct,
    explanation: row.explanation,
  };
});

const body = questions
  .map(
    (question) => `  {
    id: "${escapeString(question.id)}",
    topic: "${escapeString(question.topic)}",
    text: "${escapeString(question.text)}",
    options: {
      A: "${escapeString(question.options.A)}",
      B: "${escapeString(question.options.B)}",
      C: "${escapeString(question.options.C)}",
      D: "${escapeString(question.options.D)}",
    },
    correct: "${question.correct}",
    explanation: "${escapeString(question.explanation)}",
  }`
  )
  .join(",\n");

const sourceName = basename(inputPath);
const output = `import type { Question } from "../types";

// Importato da ${sourceName}. Revisionare le fonti prima dell'uso in produzione.
export const EXTRA_5000_QUESTIONS: Question[] = [
${body}
];
`;

writeFileSync(outputPath, output, "utf8");
console.log(`Importate ${questions.length} domande in ${outputPath}`);
