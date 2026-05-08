// src/components/HomeScreen.tsx
import { useState } from "react";
import { countCritical } from "../logic/criticalStorage";
import { ALL_QUESTIONS } from "../data/allQuestions";

const TOPICS = Array.from(
  new Set(ALL_QUESTIONS.map((q) => q.topic))
).sort();

type HomeScreenProps = {
  onStartQuiz: () => void;
  onStartCritical: () => void;
  onStartTopicQuiz: (topic: string) => void; // NUOVA
};

export function HomeScreen({
    onStartQuiz, 
    onStartCritical,
    onStartTopicQuiz, 
 }: HomeScreenProps) {
  const criticalCount = countCritical();

  // Stato locale solo per la UI del selettore materia (per ora)
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  // TODO: in uno step successivo useremo questo per avviare un quiz filtrato
 const handleStartTopicQuiz = () => {
  if (!selectedTopic) return;
    onStartTopicQuiz(selectedTopic);
};

  return (
    <div className="app-root">
      <div className="card">
        <h1>Preparazione Infermieristica</h1>
        <p>Allenati con sessioni da 30 domande pensate per concorsi e pratica clinica.</p>

        <button className="btn-primary" onClick={onStartQuiz}>
          Inizia un quiz misto
        </button>

        {/* --- Selettore materia (per ora con opzioni fisse) --- */}
        <div className="topic-section">
          <label>Scegli una materia (in sviluppo):</label>
         <select
             value={selectedTopic}
               onChange={(e) => setSelectedTopic(e.target.value)}
>
             <option value="">-- Seleziona --</option>
              {TOPICS.map((topic) => (
             <option key={topic} value={topic}>
              {topic}
            </option>
    ))}
        </select>

          <button
            className="btn-secondary"
            disabled={!selectedTopic}
            onClick={handleStartTopicQuiz}
          >
            Quiz su materia selezionata
          </button>
        </div>

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