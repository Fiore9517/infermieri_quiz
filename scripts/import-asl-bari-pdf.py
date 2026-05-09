from pathlib import Path
import re
import sys

from pypdf import PdfReader


DEFAULT_INPUT = Path(r"C:\Users\fiore\Downloads\BANCA_DATI_SCRITTA_INFERMIERI.pdf")
DEFAULT_OUTPUT = Path("src/data/questions-asl-bari-scritta.ts")


TOPIC_KEYWORDS = [
    ("Legislazione", ["legge", "d.m.", "decreto", "art.", "251/2000", "42/1999", "739", "contratto", "obblighi"]),
    ("Deontologia", ["deontologico", "etica", "etico", "responsabilita", "responsabilità", "contenzione", "non maleficenza"]),
    ("Farmacologia", ["farmaco", "farmaci", "antibiot", "antiblast", "sedativi", "terapia", "radioisotopi", "somministrazione"]),
    ("Igiene", ["infezion", "cdc", "batter", "steril", "disinfe", "antisett", "cateter", "colonizzazione", "ospedaliere"]),
    ("Chirurgica", ["chirurg", "operator", "ustion", "ferita", "incisione", "anestesia", "drenaggio", "posizionamento"]),
    ("Area Critica", ["shock", "rcp", "anafilassi", "emergenza", "urgenza", "deficit di polso", "compressioni toraciche"]),
    ("Respiratorio e Cardiovascolare", ["respir", "polso", "cardiac", "toracic", "bronchi", "ventilaz", "ossigen"]),
    ("Pediatria e ostetricia di base", ["neonato", "neonat", "allattamento", "colostro", "latte materno", "pediatr", "gravid"]),
    ("Geriatria", ["anzian", "cadut", "demenza", "geriatr"]),
    ("Psichiatria e comunicazione", ["relazione", "comunic", "speranza", "psich", "ansia", "depressione"]),
    ("Neurologia", ["neurolog", "nervo", "nervose", "coscienza", "coma", "ictus"]),
    ("Anatomia", ["cellul", "atomo", "protoni", "anatomia", "tessuti", "epiteliali", "lisosoma", "acidi nucleici"]),
    ("Sicurezza", ["sicurezza", "rischio", "ago", "reincapucciare", "smaltimento"]),
    ("Infermieristica", ["infermier", "assistenza", "assistenziale", "paziente", "mobilizzazione", "sondino"]),
    ("Internistica", ["cirrosi", "epatica", "diabete", "creatinina", "elettroliti", "magnesio"]),
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
    text = re.sub(r"(?m)^(?:ASL BARI - )?INFERMIERI\s*$", "", text)
    text = re.sub(r"(?m)^(?:ASL BARI - INFERMIERI\s+)?Pagina\s+\d+\s*$", "", text)
    text = re.sub(r"(?m)^Pagina\s+\d+\s*$", "", text)

    starts = list(re.finditer(r"(?m)^(\d+)\)\s+", text))
    questions = []

    for index, match in enumerate(starts):
        start = match.start()
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[start:end].strip()
        parsed = re.match(
            r"(?s)^(\d+)\)\s*(.*?)\nA\)\s*(.*?)\nB\)\s*(.*?)\nC\)\s*(.*)$",
            block,
        )
        if not parsed:
            raise ValueError(f"Impossibile leggere la domanda {match.group(1)}")

        number = int(parsed.group(1))
        question_text = clean_text(parsed.group(2))
        option_a = clean_text(parsed.group(3))
        option_b = clean_text(parsed.group(4))
        option_c = clean_text(parsed.group(5))
        options = [option_a, option_b, option_c]

        questions.append(
            {
                "id": f"asl-ba-scritta-{number:03d}",
                "topic": classify_topic(question_text, options),
                "text": question_text,
                "A": option_a,
                "B": option_b,
                "C": option_c,
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
    }},
    correct: "A",
    explanation: "Risposta corretta indicata dalla banca dati ufficiale.",
  }}'''
        )

    output = '''import type { Question } from "../types";

// Banca dati prova scritta infermieri ASL Bari.
// Nel PDF sorgente la risposta corretta e indicata come opzione A; il quiz mescola le opzioni in sessione.
export const ASL_BARI_SCRITTA_QUESTIONS: Question[] = [
'''
    output += ",\n".join(items)
    output += "\n];\n"
    output_path.write_text(output, encoding="utf-8")


def main():
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    questions = extract_questions(input_path)
    write_questions(questions, output_path)
    print(f"Importate {len(questions)} domande in {output_path}")


if __name__ == "__main__":
    main()
