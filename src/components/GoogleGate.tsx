import React, { useEffect, useState } from 'react';
import { isGoogleLoggedIn, saveGoogleSession } from '../store/googleAuth';

const ZEBRA_STRIP: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 8px, #18181b 8px, #18181b 16px)',
};

const LOGO_URL = '/assets/imgs/Zebra logo (1).png';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.46H12v4.66h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.83z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.25 0 5.97-1.08 7.96-2.92l-3.88-3.01c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.79-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.27 14.26A7.24 7.24 0 0 1 4.85 12c0-.79.14-1.56.4-2.26v-3.11H1.27A12 12 0 0 0 0 12c0 1.94.47 3.77 1.27 5.4l4-3.14z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.78c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.96 11.96 0 0 0 12 0C7.55 0 3.66 2.23 1.27 5.6l4 3.14c.94-2.85 3.6-4.96 6.73-4.96z"
      fill="#EA4335"
    />
  </svg>
);

const GoogleGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean>(() => isGoogleLoggedIn());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gd = params.get('gd');
    const gdError = params.get('gd_error');
    if (gdError) {
      setError(
        gdError === 'noconfig'
          ? 'La connexion Google n\u2019est pas encore configurée. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans le fichier .env puis relancez le serveur.'
          : 'Connexion Google impossible. Veuillez réessayer.'
      );
    }
    if (gd) {
      saveGoogleSession(gd);
      setAuthed(true);
    }
    if (gd || gdError) {
      params.delete('gd');
      params.delete('gd_error');
      const qs = params.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
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
          Connectez-vous avec Google pour accéder à la boutique.
        </p>

        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 bg-white text-zinc-900 hover:bg-zinc-200 transition-colors rounded-xl px-6 py-3.5 text-sm font-semibold cursor-pointer shadow-lg"
        >
          <GoogleIcon />
          Continuer avec Google
        </a>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-4 text-left">
            {error}
          </div>
        )}

        <p className="text-[11px] text-zinc-600 mt-6">
          Connexion sécurisée via votre compte Google.
        </p>
      </div>
    </div>
  );
};

export default GoogleGate;