// src/types.ts
export type Question = {
  id: string;
  topic: string; // es: "Infermieristica generale"
  text: string;
  options: {
    A: string;
    B: string;
    C?: string;
    D?: string;
  };
  correct: "A" | "B" | "C" | "D";
  explanation?: string;
  difficulty?: 1 | 2 | 3;
};