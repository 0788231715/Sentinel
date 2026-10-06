import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('sentinel.theme', theme);
}

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>(
    localStorage.getItem('sentinel.theme') === 'light' ? 'light' : 'dark',
  );
  useEffect(() => applyTheme(theme), [theme]);
  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  };
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Settings</h1><p className="text-slate-400">Preferences are stored in this browser.</p></header>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold">Appearance</h2><label className="mt-4 block text-sm">Theme<select value={theme} onChange={(event) => setTheme(event.target.value as Theme)} className="ml-3 rounded border border-slate-700 bg-slate-950 px-3 py-2"><option value="dark">Dark</option><option value="light">Light</option></select></label></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold">Language</h2><label className="mt-4 block text-sm">Interface language<select value={i18n.language.slice(0, 2)} onChange={(event) => changeLanguage(event.target.value)} className="ml-3 rounded border border-slate-700 bg-slate-950 px-3 py-2">{[['en', 'English'], ['rw', 'Kinyarwanda'], ['fr', 'French'], ['es', 'Spanish'], ['sw', 'Kiswahili']].map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label></section>
      <p className="text-sm text-slate-500">Notification delivery, map layers, account security, and server-managed preferences are not configured.</p>
    </div>
  );
}
