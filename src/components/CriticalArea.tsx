// src/components/CriticalArea.tsx
import { useState } from "react";
import { ALL_QUESTIONS } from "../data/allQuestions";
import {
  loadCritical,
  markCorrectInCritical,
  addWrongAnswers,
  type CriticalMap,
} from "../logic/criticalStorage";
import { shuffleOptions } from "../logic/quizUtils";
import type { Question } from "../types";

type CriticalAreaProps = {
  onExit: () => void;
};

type ShuffledQuestion = {
  question: Question;
  shuffledOptions: { key: "A" | "B" | "C" | "D"; label: string }[];
  newCorrect: "A" | "B" | "C" | "D";
};

export function CriticalArea({ onExit }: CriticalAreaProps) {
  const [initialMap] = useState<CriticalMap>(() => loadCritical());
  const [questions] = useState<ShuffledQuestion[]>(() => {
    const ids = Object.keys(loadCritical());
    return ALL_QUESTIONS
      .filter((q) => ids.includes(q.id))
      .sort((a, b) => (initialMap[b.id]?.errors ?? 0) - (initialMap[a.id]?.errors ?? 0))
      .map((q) => {
        const { shuffledOptions, newCorrect } = shuffleOptions(q);
        return { question: q, shuffledOptions, newCorrect };
      });
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  // --- Area critica vuota ---
  if (questions.length === 0) {
    return (
      <div className="app-root">
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</p>
          <h2>Area Critica vuota!</h2>
          <p>Nessuna domanda da ripassare. Ottimo lavoro!</p>
          <button className="btn-primary" onClick={onExit} style={{ marginTop: "1rem" }}>
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  // --- Schermata risultato ---
  if (isFinished) {
    return (
      <div className="app-root">
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Area Critica — Risultato</h2>
          <p style={{ fontSize: "1.2rem" }}>
            ✅ <strong>{score.correct}</strong> corrette &nbsp;|&nbsp;
            ❌ <strong>{score.wrong}</strong> sbagliate su{" "}
            <strong>{questions.length}</strong>
          </p>
          <p style={{ marginTop: "0.75rem", color: "#9ca3af", fontSize: "0.9rem" }}>
            Le domande corrette hanno ridotto il loro contatore di errori.
          </p>
          <button className="btn-primary" onClick={onExit} style={{ marginTop: "1rem" }}>
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const isCorrect = confirmed && selectedOption === current.newCorrect;

  function handleConfirm() {
    if (!selectedOption) {
      alert("Seleziona una risposta prima di continuare.");
      return;
    }
    setConfirmed(true);
    if (selectedOption === current.newCorrect) {
      markCorrectInCritical(current.question.id);
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      addWrongAnswers([current.question.id]);
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  }

  function handleNext() {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setConfirmed(false);
    }
  }

  return (
    <div className="app-root">
      <div className="card">
        {/* Header */}
        <p style={{ color: "#f87171", fontWeight: "bold", marginBottom: "4px" }}>
          🔴 Area Critica
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          Domanda {currentIndex + 1} / {questions.length} —{" "}
          <span style={{ color: "#38bdf8" }}>{current.question.topic}</span>
          {" "}·{" "}
          <span style={{ color: "#f87171" }}>
            {initialMap[current.question.id]?.errors ?? 0} errori
          </span>
        </p>

        <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", lineHeight: 1.5 }}>
          {current.question.text}
        </h2>

        {/* Opzioni risposta */}
        <div>
          {current.shuffledOptions.map(({ key, label }) => {
            const isSelected = selectedOption === key;
            const isRightAnswer = confirmed && key === current.newCorrect;
            const isWrongSelected = confirmed && isSelected && key !== current.newCorrect;

            const optionClass = [
              "answer-option",
              isRightAnswer ? "correct" : "",
              isWrongSelected ? "wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <label
                key={key}
                className={optionClass}
                style={{ cursor: confirmed ? "default" : "pointer" }}
              >
                <input
                  type="radio"
                  name="option"
                  value={key}
                  checked={isSelected}
                  onChange={() => !confirmed && setSelectedOption(key)}
                  disabled={confirmed}
                />
                <span>{key}. {label}</span>
              </label>
            );
          })}
        </div>

        {/* Box spiegazione */}
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

        {/* Bottoni navigazione */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          {!confirmed ? (
            <button className="btn-critical" onClick={handleConfirm}>
              Conferma risposta
            </button>
          ) : (
            <button className="btn-critical" onClick={handleNext}>
              {currentIndex === questions.length - 1 ? "Vedi risultato" : "Domanda successiva →"}
            </button>
          )}
          <button className="btn-secondary" onClick={onExit}>
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}