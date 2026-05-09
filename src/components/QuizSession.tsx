// src/components/QuizSession.tsx
import { useState } from "react";
import { ALL_QUESTIONS } from "../data/allQuestions";
import { addWrongAnswers } from "../logic/criticalStorage";
import { shuffleOptions } from "../logic/quizUtils";
import { smartShuffle, markQuestionsAsSeen } from "../data/quizHistory";
import type { Question } from "../types";
import type { QuizConfig } from "./HomeScreen";

type QuizSessionProps = {
  onExit: () => void;
  config: QuizConfig;
};

type AnswerMap = Record<string, "A" | "B" | "C" | "D">;

type ShuffledQuestion = {
  question: Question;
  shuffledOptions: { key: "A" | "B" | "C" | "D"; label: string }[];
  newCorrect: "A" | "B" | "C" | "D";
};

export function QuizSession({ onExit, config }: QuizSessionProps) {
  const buildSession = (): ShuffledQuestion[] => {
    const basePool = config.topic
      ? ALL_QUESTIONS.filter((q) => q.topic === config.topic)
      : ALL_QUESTIONS.slice(config.fromIndex, config.toIndex + 1);

    const safeCount = Math.min(Math.max(1, config.count), basePool.length);
    const picked = config.random
      ? smartShuffle(basePool, safeCount)
      : basePool.slice(0, safeCount);
    markQuestionsAsSeen(picked.map((q) => q.id));

    return picked.map((q) => {
      const { shuffledOptions, newCorrect } = shuffleOptions(q);
      return { question: q, shuffledOptions, newCorrect };
    });
  };

  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>(
    () => buildSession()
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const current = shuffledQuestions[currentIndex];

  const currentAnswer = answers[current.question.id] ?? null;
  const confirmed = currentAnswer !== null;
  const isCorrect = confirmed && currentAnswer === current.newCorrect;

  // ── CONFERMA RISPOSTA ───────────────────────────────────────
  function handleConfirm() {
    if (confirmed || !selectedOption) return;
    setAnswers((prev) => ({ ...prev, [current.question.id]: selectedOption }));
  }

  // ── AVANTI ─────────────────────────────────────────────────
  function handleNext() {
    if (!confirmed) {
      alert("Seleziona e conferma una risposta prima di continuare.");
      return;
    }
    if (currentIndex === shuffledQuestions.length - 1) {
      const wrongIds = shuffledQuestions
        .filter((sq) => answers[sq.question.id] !== sq.newCorrect)
        .map((sq) => sq.question.id);
      if (wrongIds.length > 0) addWrongAnswers(wrongIds);
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null); // reset selezione per la prossima domanda
    }
  }

  // ── INDIETRO ────────────────────────────────────────────────
  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedOption(null); // reset selezione
    }
  }

  // ── NUOVA SESSIONE ──────────────────────────────────────────
  function handleRestart() {
    setShuffledQuestions(buildSession());
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setIsFinished(false);
  }

  const correctCount = shuffledQuestions.filter(
    (sq) => answers[sq.question.id] === sq.newCorrect
  ).length;

  // ── SCHERMATA RISULTATO ─────────────────────────────────────
  if (isFinished) {
    const wrongCount = shuffledQuestions.length - correctCount;
    return (
      <div className="app-root">
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Risultato finale</h2>
          <p style={{ fontSize: "1.2rem" }}>
            ✅ <strong>{correctCount}</strong> corrette &nbsp;|&nbsp;
            ❌ <strong>{wrongCount}</strong> sbagliate su{" "}
            <strong>{shuffledQuestions.length}</strong>
          </p>
          {wrongCount > 0 && (
            <p style={{ color: "#f87171", marginTop: "0.75rem" }}>
              Le domande sbagliate sono state aggiunte alla tua{" "}
              <strong>Area Critica</strong>.
            </p>
          )}
          <button
            className="btn-primary"
            onClick={handleRestart}
            style={{ marginTop: "1rem" }}
          >
            Nuova sessione
          </button>
          <button className="btn-secondary" onClick={onExit}>
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  // ── SCHERMATA DOMANDA ───────────────────────────────────────
  return (
    <div className="app-root">
      <div className="card">
        {/* Header */}
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          Domanda {currentIndex + 1} / {shuffledQuestions.length} —{" "}
          <span style={{ color: "#38bdf8" }}>
            {config.topic ?? current.question.topic}
          </span>
        </p>

        {/* Testo domanda */}
        <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", lineHeight: 1.5 }}>
          {current.question.text}
        </h2>

        {/* Opzioni */}
        <div>
          {current.shuffledOptions.map(({ key, label }) => {
            const isSelected = confirmed
              ? currentAnswer === key
              : selectedOption === key;
            const isRightAnswer = confirmed && key === current.newCorrect;
            const isWrongSelected =
              confirmed && currentAnswer === key && key !== current.newCorrect;

            const optionClass = [
              "answer-option",
              isRightAnswer ? "correct" : "",
              isWrongSelected ? "wrong" : "",
              !confirmed && isSelected ? "selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <label
                key={key}
                className={optionClass}
                style={{ cursor: confirmed ? "default" : "pointer" }}
                onClick={() => !confirmed && setSelectedOption(key)}
              >
                <input
                  type="radio"
                  name="option"
                  value={key}
                  checked={isSelected}
                  onChange={() => {}}
                  disabled={confirmed}
                />
                <span>
                  {key}. {label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Spiegazione */}
        {confirmed && (
          <div className={`answer-explanation ${isCorrect ? "success" : "error"}`}>
            <strong>{isCorrect ? "✅ Risposta corretta!" : "❌ Risposta errata!"}</strong>
            {current.question.explanation && (
              <p style={{ marginTop: "0.4rem", marginBottom: 0 }}>
                {current.question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Navigazione */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* ← Precedente */}
          <button
            className="btn-secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          >
            ← Precedente
          </button>

          {/* Conferma / Domanda successiva */}
          {!confirmed ? (
            <button
              className="btn-primary"
              onClick={() => {
                if (!selectedOption) {
                  alert("Seleziona una risposta prima di confermare.");
                } else {
                  handleConfirm();
                }
              }}
            >
              Conferma risposta
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNext}>
              {currentIndex === shuffledQuestions.length - 1
                ? "Vedi risultato"
                : "Domanda successiva →"}
            </button>
          )}

          {/* Esci */}
          <button className="btn-secondary" onClick={onExit}>
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}
