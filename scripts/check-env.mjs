const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Variabili ambiente mancanti: ${missing.join(", ")}`);
  console.error("Configurarle su Vercel per Production e Preview, poi rieseguire il deploy.");
  process.exit(1);
}

console.log("Variabili ambiente Supabase presenti.");
