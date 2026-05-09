from pathlib import Path
import re
import sys

from pypdf import PdfReader


DEFAULT_INPUT = Path(r"C:\Users\fiore\Downloads\banca-dati-quiz-matera.pdf")
DEFAULT_OUTPUT = Path("src/data/questions-matera.ts")


TOPIC_KEYWORDS = [
    ("Legislazione", ["legge", "d.lgs", "decreto", "art.", "ccnl", "contratto", "pubbliche amministrazioni", "stato", "ministero", "ssn"]),
    ("Deontologia", ["deontologico", "etica", "responsabilita", "responsabilità", "comportamento", "interesse pubblico", "consenso"]),
    ("Farmacologia", ["farmaco", "farmaci", "antibiot", "antiblast", "sedativi", "terapia", "dose", "somministrazione", "insulina", "eparina"]),
    ("Igiene", ["infezion", "batter", "virus", "steril", "disinfe", "antisett", "cateter", "colonizzazione", "ospedaliere", "lavaggio"]),
    ("Chirurgica", ["chirurg", "operator", "ustion", "ferita", "incisione", "anestesia", "drenaggio", "sutura"]),
    ("Area Critica", ["shock", "rcp", "anafilassi", "emergenza", "urgenza", "triage", "arresto", "compressioni toraciche"]),
    ("Respiratorio e Cardiovascolare", ["respir", "polso", "cardiac", "toracic", "bronchi", "ventilaz", "ossigen", "ecg", "pressione arteriosa"]),
    ("Pediatria e ostetricia di base", ["bambino", "neonato", "neonat", "allattamento", "colostro", "latte materno", "pediatr", "gravid", "riflesso palmare"]),
    ("Geriatria", ["anzian", "cadut", "demenza", "geriatr", "alzheimer"]),
    ("Psichiatria e comunicazione", ["relazione", "comunic", "speranza", "psich", "ansia", "depressione", "aggressiv"]),
    ("Neurologia", ["neurolog", "nervo", "nervose", "coscienza", "coma", "ictus", "pupill"]),
    ("Anatomia", ["cellul", "atomo", "protoni", "anatomia", "tessuti", "epiteliali", "lisosoma", "eucarioti", "mole"]),
    ("Sicurezza", ["sicurezza", "rischio", "ago", "reincapucciare", "smaltimento", "dpi", "prevenzione"]),
    ("Logica", ["parola", "significato", "relazioni", "simulato", "libero", "individua", "sinonimo", "contrario", "sequenza"]),
    ("Infermieristica", ["infermier", "assistenza", "assistenziale", "paziente", "mobilizzazione", "sondino", "nursing"]),
    ("Internistica", ["cirrosi", "epatica", "diabete", "creatinina", "elettroliti", "magnesio", "rene", "fegato"]),
]


def strip_accents(value: str) -> str:
    translation = str.maketrans("àèéìòùÀÈÉÌÒÙ", "aeeiouAEEIOU")
    return value.translate(translation)


def classify_topic(text: str, options: list[str]) -> str:
    haystack = strip_accents(" ".join([text, *options]).lower())
    for topic, keywords in TOPIC_KEYWORDS:
        if any(strip_accents(keyword.lower()) in haystack for keyword in keywords):
            return topic
    return "Infermieristica"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def escape_ts(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def extract_questions(pdf_path: Path):
    reader = PdfReader(str(pdf_path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    text = re.sub(r"(?m)^ASM MATERA - INFERMIERI(?:\s+Pagina\s+\d+)?\s*$", "", text)
    text = re.sub(r"(?m)^N\.B\..*$", "", text)
    text = re.sub(r"(?m)^Pagina\s+\d+\s*$", "", text)

    starts = list(re.finditer(r"(?m)^(\d+)\)\s+", text))
    questions = []

    for index, match in enumerate(starts):
        start = match.start()
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[start:end].strip()
        block = re.sub(r"(?<=\S)\s*\n?M([BCD]\))", r" M\n\1", block)
        parsed = re.match(
            r"(?s)^(\d+)\)\s*(.*?)\nA\)\s*(.*?)\nB\)\s*(.*?)\nC\)\s*(.*?)\nD\)\s*(.*)$",
            block,
        )
        if not parsed:
            raise ValueError(f"Impossibile leggere la domanda {match.group(1)}: {block[:180]}")

        number = int(parsed.group(1))
        question_text = clean_text(parsed.group(2))
        option_a = clean_text(parsed.group(3))
        option_b = clean_text(parsed.group(4))
        option_c = clean_text(parsed.group(5))
        option_d = clean_text(parsed.group(6))
        options = [option_a, option_b, option_c, option_d]

        questions.append(
            {
                "id": f"matera-{number:04d}",
                "topic": classify_topic(question_text, options),
                "text": question_text,
                "A": option_a,
                "B": option_b,
                "C": option_c,
                "D": option_d,
            }
        )

    return questions


def write_questions(questions, output_path: Path):
    items = []
    for question in questions:
        items.append(
            f'''  {{
    id: "{question["id"]}",
    topic: "{escape_ts(question["topic"])}",
    text: "{escape_ts(question["text"])}",
    options: {{
      A: "{escape_ts(question["A"])}",
      B: "{escape_ts(question["B"])}",
      C: "{escape_ts(question["C"])}",
      D: "{escape_ts(question["D"])}",
    }},
    correct: "A",
    explanation: "Risposta corretta indicata dalla banca dati ufficiale.",
  }}'''
        )

    output = '''import type { Question } from "../types";

// Banca dati quiz ASM Matera infermieri.
// Nel PDF sorgente la risposta esatta e sempre l'opzione A; il quiz mescola le opzioni in sessione.
export const MATERA_QUESTIONS: Question[] = [
'''
    output += ",\n".join(items)
    output += "\n];\n"
    output_path.write_text(output, encoding="utf-8")


def main():
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    questions = extract_questions(input_path)
    if len(questions) != 5000:
        raise ValueError(f"Attese 5000 domande, estratte {len(questions)}")
    write_questions(questions, output_path)
    print(f"Importate {len(questions)} domande in {output_path}")


if __name__ == "__main__":
    main()
