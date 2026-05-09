import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

type AuthPageProps = {
  onExit: () => void;
};

export default function AuthPage({ onExit }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    alert(isRegister ? "Registrazione completata!" : "Login effettuato!");
    onExit();
  }

  return (
    <div className="auth-page">
      <h1>{isRegister ? "Registrati" : "Accedi"}</h1>

      {!isSupabaseConfigured && (
        <p>
          Login non configurato: aggiungi VITE_SUPABASE_URL e
          VITE_SUPABASE_ANON_KEY nelle variabili ambiente di Vercel.
        </p>
      )}

      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={!isSupabaseConfigured}>
          {isRegister ? "Crea account" : "Accedi"}
        </button>
      </form>

      <button type="button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister
          ? "Hai già un account? Accedi"
          : "Non hai un account? Registrati"}
      </button>

      <button type="button" onClick={onExit}>
        Torna alla home
      </button>
    </div>
  );
}
