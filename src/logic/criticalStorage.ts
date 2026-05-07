// src/logic/criticalStorage.ts

export type CriticalEntry = {
  errors: number;
  lastSeen: string;
};

export type CriticalMap = Record<string, CriticalEntry>;

const KEY = "critical_questions_v1";

export function loadCritical(): CriticalMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CriticalMap;
  } catch {
    return {};
  }
}

export function saveCritical(map: CriticalMap): void {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function addWrongAnswers(wrongIds: string[]): CriticalMap {
  const map = loadCritical();
  const now = new Date().toISOString();
  for (const id of wrongIds) {
    const current = map[id] ?? { errors: 0, lastSeen: now };
    map[id] = { errors: current.errors + 1, lastSeen: now };
  }
  saveCritical(map);
  return map;
}

export function markCorrectInCritical(id: string): CriticalMap {
  const map = loadCritical();
  if (!map[id]) return map;
  map[id].errors = Math.max(map[id].errors - 1, 0);
  if (map[id].errors === 0) delete map[id];
  saveCritical(map);
  return map;
}

export function countCritical(): number {
  return Object.keys(loadCritical()).length;
}