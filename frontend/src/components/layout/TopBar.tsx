import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell, Globe, Moon, Sun, LogOut } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';
import { useAuthStore } from '../../store/authStore';
import { useDataSpaceStore, type DataSpace } from '../../store/dataSpaceStore';
import { operationsService, type SearchResult } from '../../services/api/operations.service';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { t, i18n } = useTranslation();
  const { health } = useSystemStore();
  const { user, logout } = useAuthStore();
  const { space, setSpace } = useDataSpaceStore();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('sentinel.theme') === 'light' ? 'light' : 'dark',
  );
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const statusColor = health?.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500';

  const switchSpace = (nextSpace: DataSpace) => {
    if (nextSpace === space) return;
    setSpace(nextSpace);
    window.location.reload();
  };
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('sentinel.theme', nextTheme);
  };

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void operationsService.search(term).then((results) => {
        if (active) {
          setSearchResults(results);
          setSearchError(null);
        }
      }).catch((error: unknown) => {
        if (active) {
          setSearchError(error instanceof Error ? error.message : 'Search failed');
        }
      });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchResults([]);
              setSearchError(null);
            }}
            aria-label={t('common.search')}
            placeholder={t('common.search')} 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          {(search.trim().length >= 2) && <div role="listbox" aria-label="Search results" className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
            {searchError ? <p role="alert" className="p-3 text-xs text-red-300">{searchError}</p> : searchResults.length === 0 ? <p className="p-3 text-xs text-slate-400">No matching records.</p> : searchResults.map((result) => <button key={`${result.type}-${result.id}`} role="option" type="button" onClick={() => { navigate(result.href); setSearch(''); }} className="block w-full border-b border-slate-800 p-3 text-left hover:bg-slate-800"><span className="text-[10px] font-bold text-blue-300">{result.type}</span><span className="block truncate text-sm">{result.title}</span><span className="block truncate text-xs text-slate-500">{result.detail}</span></button>)}
          </div>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-1" aria-label="Data space">
          <button
            type="button"
            aria-pressed={space === 'simulation'}
            onClick={() => switchSpace('simulation')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              space === 'simulation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Simulation
          </button>
          <button
            type="button"
            aria-pressed={space === 'real'}
            onClick={() => switchSpace('real')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              space === 'real' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Real Devices
          </button>
        </div>
        {space === 'real' && (
          <span className="hidden xl:inline text-[10px] text-amber-300">
            Awaiting verified hardware data
          </span>
        )}

        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 mr-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">System {health?.status || 'UNKNOWN'}</span>
        </div>

        <button type="button" aria-label="Open alerts" onClick={() => navigate('/alerts')} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={18} />
        </button>

        <div className="relative group">
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1">
            <Globe size={18} />
            <span className="text-xs font-medium uppercase">{i18n.language}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block w-32">
            {['en', 'rw', 'fr', 'es', 'sw'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button type="button" aria-label="Toggle color theme" onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          title={`Sign out${user ? ` ${user.email}` : ''}`}
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
