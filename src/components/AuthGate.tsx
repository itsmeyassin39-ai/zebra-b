import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { isSessionValid, login, getRememberedEmail } from '../store/auth';

const ZEBRA_STRIP: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 8px, #18181b 8px, #18181b 16px)',
};

const LOGO_URL = '/assets/imgs/Zebra logo (1).png';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean>(() => isSessionValid());
  const [email, setEmail] = useState(() => getRememberedEmail());
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password, remember);
      setAuthed(true);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Impossible de joindre le serveur. Vérifiez qu'il est démarré.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background zebra accent */}
      <div className="absolute top-0 inset-x-0 h-3 opacity-70" style={ZEBRA_STRIP} />
      <div className="absolute bottom-0 inset-x-0 h-3 opacity-70" style={ZEBRA_STRIP} />

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-700/60 rounded-3xl shadow-2xl p-8 sm:p-10 text-center relative animate-in zoom-in-95 duration-200">
        {LOGO_URL && (
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white mx-auto mb-6 flex items-center justify-center">
            <img src={LOGO_URL} alt="Zebra Bags" className="w-full h-full object-contain p-2" />
          </div>
        )}

        <h1 className="font-display text-2xl font-extrabold tracking-tight">Zebra Bags</h1>
        <p className="text-zinc-400 text-sm mt-1 mb-8">
          Espace gestion — identifiez-vous pour accéder au tableau de bord.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-white w-4 h-4"
            />
            Rester connecté sur cet appareil
          </label>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-widest cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-zinc-600 mt-6">
          Zone privée — accès limité aux membres autorisés.
        </p>
      </div>
    </div>
  );
};

export default AuthGate;