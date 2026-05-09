import { useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import type { QuizConfig } from "./components/HomeScreen";
import { QuizSession } from "./components/QuizSession";
import { CriticalArea } from "./components/CriticalArea";
import AuthPage from "./pages/AuthPage";

type Mode =
  | { type: "HOME" }
  | { type: "QUIZ"; config: QuizConfig }
  | { type: "CRITICAL" }
  | { type: "AUTH" };

export function App() {
  const [mode, setMode] = useState<Mode>({ type: "HOME" });

  if (mode.type === "HOME") {
    return (
      <HomeScreen
        onStartQuiz={(config) => setMode({ type: "QUIZ", config })}
        onStartCritical={() => setMode({ type: "CRITICAL" })}
        onAuth={() => setMode({ type: "AUTH" })}
      />
    );
  }

  if (mode.type === "AUTH") {
    return <AuthPage onExit={() => setMode({ type: "HOME" })} />;
  }

  if (mode.type === "CRITICAL") {
    return <CriticalArea onExit={() => setMode({ type: "HOME" })} />;
  }

  return (
    <QuizSession
      config={mode.config}
      onExit={() => setMode({ type: "HOME" })}
    />
  );
}
