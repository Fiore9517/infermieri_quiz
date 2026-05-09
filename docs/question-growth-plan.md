# Piano crescita banca domande

Obiettivo: arrivare a 5000 domande uniche, senza duplicati e senza contenuti clinici non revisionati.

## Stato attuale

- Domande uniche attuali: 7745
- Obiettivo: 5000
- Da aggiungere: 0
- Materie canoniche: 16

## Materie finali

- Anatomia
- Area Critica
- Chirurgica
- Deontologia
- Farmacologia
- Geriatria
- Igiene
- Infermieristica
- Internistica
- Legislazione
- Logica
- Neurologia
- Pediatria e ostetricia di base
- Psichiatria e comunicazione
- Respiratorio e Cardiovascolare
- Sicurezza

## Regole qualità

- Ogni domanda deve avere testo diverso dalle domande già presenti.
- Ogni domanda deve avere quattro opzioni, salvo casi già compatibili con il tipo `Question`.
- Ogni risposta corretta deve essere verificabile.
- Le domande cliniche vanno aggiunte a lotti e revisionate prima dell'uso reale.
- Le fonti istituzionali o manualistiche vanno preferite per linee guida, sicurezza, farmaci e procedure.

## Distribuzione consigliata

Usare:

```bash
npm run questions:quota
```

Il comando ricalcola le quote dopo ogni lotto aggiunto.
