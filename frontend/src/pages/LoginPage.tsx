import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Unable to sign in. Check your credentials and try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-7 flex items-center gap-3">
          <Shield className="text-blue-400" size={28} />
          <div>
            <h1 className="text-xl font-bold">SentinelNet</h1>
            <p className="text-xs text-slate-400">Operator sign in</p>
          </div>
        </div>
        <label className="mb-4 block text-sm text-slate-300">
          Email
          <input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
        </label>
        <label className="mb-5 block text-sm text-slate-300">
          Password
          <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
        </label>
        {submitError ? <p role="alert" className="mb-4 text-sm text-red-300">{submitError}</p> : null}
        <button disabled={loading} type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && !submitError ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      </form>
    </main>
  );
}
