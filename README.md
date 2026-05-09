# Infermieri Quiz

Applicazione React + TypeScript per la preparazione ai concorsi infermieristici. Include quiz per materia, sessioni miste, rotazione intelligente delle domande, Area Critica per ripassare gli errori e autenticazione con Supabase.

## Funzionalita

- Banca dati con oltre 7000 domande uniche dopo deduplica automatica.
- Quiz misto o filtrato per materia.
- Numero domande, intervallo e ordine configurabili.
- Opzioni di risposta mescolate automaticamente a ogni sessione.
- Area Critica con salvataggio locale delle domande sbagliate.
- Storico locale per ridurre la ripetizione delle stesse domande.
- Login e registrazione via Supabase Auth.
- Supporto PWA tramite `vite-plugin-pwa`.

## Stack

- React 19
- TypeScript
- Vite
- Supabase
- ESLint
- Vite PWA

## Setup Locale

Installa le dipendenze:

```bash
npm install
```

Crea un file `.env` nella root:

```env
VITE_SUPABASE_URL=https://TUO-PROGETTO.supabase.co
VITE_SUPABASE_ANON_KEY=LA_TUA_ANON_PUBLIC_KEY
```

Avvia il progetto:

```bash
npm run dev
```

Apri:

```text
http://localhost:5173
```

## Supabase Auth

Nel pannello Supabase:

- abilita `Authentication -> Providers -> Email`
- configura `Authentication -> URL Configuration`
- per sviluppo locale usa `http://localhost:5173`
- su Vercel usa il dominio di produzione come Site URL e Redirect URL

Non inserire mai la `service_role key` nel frontend.

## Deploy su Vercel

Impostazioni consigliate:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Variabili ambiente da aggiungere su Vercel:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Script

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run questions:audit
npm run questions:quota
```

## Gestione Banca Domande

Le domande sono raccolte in `src/data`. Il file `allQuestions.ts` aggrega tutte le banche dati e applica:

- normalizzazione delle materie
- deduplica per testo domanda
- inclusione delle banche dati importate

Comandi utili:

```bash
npm run questions:audit
npm run questions:quota
```

Per importare nuove domande da CSV, usa il modello:

```text
docs/questions-template.csv
```

e lo script:

```bash
npm run questions:import -- percorso/file.csv
```

## Note

Le risposte corrette delle banche dati ufficiali importate sono preservate secondo l'indicazione della fonte. Anche quando una banca dati indica la risposta corretta sempre come `A`, il quiz mescola le opzioni in fase di sessione.
