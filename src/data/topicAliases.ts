export const TOPIC_ALIASES: Record<string, string> = {
  "Anatomia e Fisiologia": "Anatomia",
  "Area critica, urgenza e shock": "Area Critica",
  "Infermieristica area critica": "Area Critica",
  "Emergenza": "Area Critica",
  "Clinica chirurgica": "Chirurgica",
  "Deontologia ed Etica": "Deontologia",
  "Farmaci ad alto rischio e sicurezza terapeutica": "Farmacologia",
  "Geriatria e rischio cadute": "Geriatria",
  "Igiene e Prevenzione": "Igiene",
  "Infezioni": "Igiene",
  "Infermieristica clinica": "Infermieristica",
  "Infermieristica generale": "Infermieristica",
  "Tecniche infermieristiche": "Infermieristica",
  "Medicina interna generale": "Internistica",
  "Clinica": "Internistica",
  "Endocrinologia": "Internistica",
  "Nefrologia": "Internistica",
  "Diagnostica": "Infermieristica",
  "Legislazione sanitaria": "Legislazione",
  "Logica e cultura generale": "Logica",
  "Cardiologia": "Respiratorio e Cardiovascolare",
  "Clinica respiratoria e cardiovascolare": "Respiratorio e Cardiovascolare",
  "Respiratorio": "Respiratorio e Cardiovascolare",
  "Sicurezza sul Lavoro": "Sicurezza",
};

export function canonicalTopic(topic: string): string {
  return TOPIC_ALIASES[topic] ?? topic;
}
