import { INFERMIERISTICA_QUESTIONS } from "./questions-infermieristica";
import { LEGISLAZIONE_QUESTIONS } from "./questions-legislazione";
import { ANATOMIA_QUESTIONS } from "./questions-anatomia";
import { DEONTOLOGIA_QUESTIONS } from "./questions-deontologia";
import { IGIENE_QUESTIONS } from "./questions-igiene";
import { FARMACOLOGIA_QUESTIONS } from "./questions-farmacologia";
import { SICUREZZA_QUESTIONS } from "./questions-sicurezza";
import { RESP_CARDIO_QUESTIONS } from "./questions-resp-cardio";
import { AREA_CRITICA_QUESTIONS } from "./questions-area-critica";
import {INTERNISTICA_QUESTIONS} from "./questions-internistica";
import {GERIATRIA_QUESTIONS} from "./questions-geriatria";
import { CHIRURGICA_QUESTIONS } from "./questions-chirurgica";
import {LOGICA_CULTURA_QUESTIONS} from "./questions-logica-cultura";
import {NEUROLOGIA_QUESTIONS} from "./questions-neurologia";
import {PSICHIATRIA_QUESTIONS} from "./questions-psichiatria";
import {SICUREZZA_FARMACI_QUESTIONS} from "./questions-sicurezza-farmaci";
import {PEDIATRIA_OSTETRICIA_QUESTIONS} from "./questions-pediatria-ostetricia";
import {BANCADATIX_QUESTIONS} from "./questions-bancadatix";
import type { Question } from "../types";


export const ALL_QUESTIONS: Question[] = [
  ...INFERMIERISTICA_QUESTIONS,
  ...LEGISLAZIONE_QUESTIONS,
  ...ANATOMIA_QUESTIONS,
  ...DEONTOLOGIA_QUESTIONS,
  ...IGIENE_QUESTIONS,
  ...FARMACOLOGIA_QUESTIONS,
  ...SICUREZZA_QUESTIONS,
  ...RESP_CARDIO_QUESTIONS,
  ...AREA_CRITICA_QUESTIONS,
  ...INTERNISTICA_QUESTIONS,
  ...GERIATRIA_QUESTIONS,
  ...CHIRURGICA_QUESTIONS,
  ...LOGICA_CULTURA_QUESTIONS,
  ...NEUROLOGIA_QUESTIONS,
  ...PSICHIATRIA_QUESTIONS,
  ...SICUREZZA_FARMACI_QUESTIONS,
  ...PEDIATRIA_OSTETRICIA_QUESTIONS,
  ...BANCADATIX_QUESTIONS,
];
