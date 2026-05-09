import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalTopic } from "./topic-aliases.mjs";

const target = Number(process.argv[2] ?? 5000);
const dataDir = join(process.cwd(), "src", "data");
const files = readdirSync(dataDir)
  .filter((file) => /^questions-.+\.ts$/.test(file))
  .sort();

function normalize(text) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const seenTexts = new Set();
const topicCounts = new Map();

for (const file of files) {
  const content = readFileSync(join(dataDir, file), "utf8");
  const blocks = content.match(/\{\s*id:\s*"[\s\S]*?\n\s*\}/g) ?? [];

  for (const block of blocks) {
    const topic = canonicalTopic(
      block.match(/topic:\s*"([^"]+)"/)?.[1] ?? "Senza materia"
    );
    const text = block.match(/text:\s*"([^"]+)"/)?.[1] ?? "";
    const textKey = normalize(text);
    if (!textKey || seenTexts.has(textKey)) continue;

    seenTexts.add(textKey);
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  }
}

const topics = [...topicCounts.keys()].sort((a, b) => a.localeCompare(b));
const missing = Math.max(target - seenTexts.size, 0);
const additions = new Map(topics.map((topic) => [topic, 0]));

for (let i = 0; i < missing; i += 1) {
  const topic = topics
    .slice()
    .sort((a, b) => {
      const totalA = topicCounts.get(a) + additions.get(a);
      const totalB = topicCounts.get(b) + additions.get(b);
      return totalA - totalB || a.localeCompare(b);
    })[0];
  additions.set(topic, additions.get(topic) + 1);
}

console.log(`Domande uniche attuali: ${seenTexts.size}`);
console.log(`Obiettivo: ${target}`);
console.log(`Da aggiungere: ${missing}`);
console.log(`Materie rilevate: ${topics.length}`);
console.log("");
console.log("Materia | attuali | da aggiungere | finale stimato");
console.log("--- | ---: | ---: | ---:");

for (const topic of topics) {
  const current = topicCounts.get(topic);
  const add = additions.get(topic);
  console.log(`${topic} | ${current} | ${add} | ${current + add}`);
}
