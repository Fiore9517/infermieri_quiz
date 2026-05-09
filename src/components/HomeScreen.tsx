// src/components/HomeScreen.tsx
import { useState } from "react";
import { countCritical } from "../logic/criticalStorage";
import { ALL_QUESTIONS } from "../data/allQuestions";

const TOTAL = ALL_QUESTIONS.length;
const TOPICS = Array.from(new Set(ALL_QUESTIONS.map((q) => q.topic))).sort();

export type QuizConfig = {
  topic?: string;
  count: number;
  fromIndex: number;
  toIndex: number;
  random: boolean;
};
type HomeScreenProps = {
  onStartQuiz: (config: QuizConfig) => void;
  onStartCritical: () => void;
  onAuth: () => void;
};

export function HomeScreen({
  onStartQuiz,
  onStartCritical,
  onAuth,
}: HomeScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [fromIndex, setFromIndex] = useState(1);
  const [toIndex, setToIndex] = useState(TOTAL);
  const [count, setCount] = useState(Math.min(30, TOTAL));
  const [random, setRandom] = useState(true);
  const criticalCount = countCritical();

  const maxCount = selectedTopic
    ? ALL_QUESTIONS.filter((q) => q.topic === selectedTopic).length
    : toIndex - fromIndex + 1;

  function handleStart() {
    const safeCount = Math.min(Math.max(1, count), maxCount);
    onStartQuiz({
      topic: selectedTopic || undefined,
      count: safeCount,
      fromIndex: fromIndex - 1, // converti in indice 0-based
      toIndex: toIndex - 1,
      random,
    });
  }

  return (
    <div className="app-root">
      <div className="card">
        <h1>Preparazione Infermieristica</h1>
        <p>Configura il tuo quiz e allenati per il concorso.</p>

        {/* MATERIA */}
        <div className="topic-section">
          <label>Materia:</label>
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setFromIndex(1);
              setToIndex(TOTAL);
            }}
          >
            <option value="">-- Quiz misto (tutte le materie) --</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={onAuth}>
          Login / Registrazione
        </button>

        {/* INTERVALLO — solo se quiz misto */}
        {!selectedTopic && (
          <div className="topic-section">
            <label>Intervallo domande (su {TOTAL} totali):</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="number"
                min={1}
                max={TOTAL - 1}
                value={fromIndex}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), toIndex - 1);
                  setFromIndex(Math.max(1, val));
                }}
                style={{ width: "80px", padding: "0.3rem", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb" }}
              />
              <span>→</span>
              <input
                type="number"
                min={fromIndex + 1}
                max={TOTAL}
                value={toIndex}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), fromIndex + 1);
                  setToIndex(Math.min(TOTAL, val));
                }}
                style={{ width: "80px", padding: "0.3rem", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb" }}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: "0.25rem 0 0" }}>
              Disponibili: {toIndex - fromIndex + 1} domande
            </p>
          </div>
        )}

        {/* NUMERO DOMANDE */}
        <div className="topic-section">
          <label>Numero di domande (max {maxCount}):</label>
          <input
            type="number"
            min={1}
            max={maxCount}
            value={count}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxCount);
              setCount(Math.max(1, val));
            }}
            style={{ width: "80px", padding: "0.3rem", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb" }}
          />
        </div>

        {/* ORDINE */}
        <div className="topic-section">
          <label>Ordine domande:</label>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="order"
                checked={random}
                onChange={() => setRandom(true)}
              />
              Casuale
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="order"
                checked={!random}
                onChange={() => setRandom(false)}
              />
              Sequenziale
            </label>
          </div>
        </div>

        {/* AVVIA */}
        <button className="btn-primary" onClick={handleStart}>
          Avvia Quiz
        </button>

        {/* AREA CRITICA */}
        <div className="critical-box">
          <p>
            🔴 Area Critica:{" "}
            <strong>{criticalCount}</strong>{" "}
            {criticalCount === 1 ? "domanda" : "domande"} da rivedere
          </p>
          <button className="btn-critical" onClick={onStartCritical}>
            Allenati sull&apos;Area Critica
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: "0.8rem", color: "#6b7280" }}>
          Suggerimento: usa i quiz misti per simulare il concorso e l&apos;Area Critica
          per ripassare gli errori.
        </p>
      </div>
    </div>
  );
}
