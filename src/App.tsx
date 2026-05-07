// App.tsx
import React, { useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { QuizSession } from "./components/QuizSession"; // lo useremo dopo
import { CriticalArea } from "./components/CriticalArea";

type Mode =
  | { type: "HOME" }
  | { type: "QUIZ"; topic?: string }
  | { type: "CRITICAL" };

export function App() {
  const [mode, setMode] = useState<Mode>({ type: "HOME" });

  if (mode.type === "HOME") {
    return (
      <HomeScreen
        onStartQuiz={() => setMode({ type: "QUIZ" })}
        onStartCritical={() => setMode({ type: "CRITICAL" })}
        onStartTopicQuiz={(topic) => setMode({ type: "QUIZ", topic })}
      />
    );
  }

  if (mode.type === "CRITICAL") {
    return (
      <CriticalArea
        onExit={() => setMode({ type: "HOME" })}
      />
    );
  }

  // QUIZ (per ora ignoriamo il topic, lo useremo nello step dopo)
 if (mode.type === "QUIZ") {
  return (
    <QuizSession
      topic={mode.topic}        // <- NUOVO: può essere undefined (quiz misto)
      onExit={() => setMode({ type: "HOME" })}
    />
  );
}

  return null;
}