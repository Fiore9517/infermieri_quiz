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

const questions = [];

for (const file of files) {
  const content = readFileSync(join(dataDir, file), "utf8");
  const blocks = content.match(/\{\s*id:\s*"[\s\S]*?\n\s*\}/g) ?? [];

  for (const block of blocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1] ?? "";
    const topic = canonicalTopic(block.match(/topic:\s*"([^"]+)"/)?.[1] ?? "");
    const text = block.match(/text:\s*"([^"]+)"/)?.[1] ?? "";
    if (id && text) questions.push({ file, id, topic, text });
  }
}

const byText = new Map();
const byId = new Map();

for (const question of questions) {
  const textKey = normalize(question.text);
  byText.set(textKey, [...(byText.get(textKey) ?? []), question]);
  byId.set(question.id, [...(byId.get(question.id) ?? []), question]);
}

const duplicateTexts = [...byText.entries()]
  .filter(([, values]) => values.length > 1)
  .sort((a, b) => b[1].length - a[1].length);
const duplicateIds = [...byId.entries()]
  .filter(([, values]) => values.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Record totali: ${questions.length}`);
console.log(`Domande uniche per testo: ${byText.size}`);
console.log(`ID unici: ${byId.size}`);
console.log(`Obiettivo: ${target}`);
console.log(`Mancano: ${Math.max(target - byText.size, 0)}`);
console.log(`Gruppi con testo duplicato: ${duplicateTexts.length}`);
console.log(`Gruppi con ID duplicato: ${duplicateIds.length}`);

if (duplicateTexts.length > 0) {
  console.log("\nPrime repliche per testo:");
  for (const [text, values] of duplicateTexts.slice(0, 10)) {
    const locations = values
      .slice(0, 4)
      .map((question) => `${question.file}:${question.id}`)
      .join(", ");
    console.log(`- ${values.length}x "${text}" (${locations})`);
  }
}
