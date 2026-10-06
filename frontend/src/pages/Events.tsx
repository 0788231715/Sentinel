import { useEffect, useMemo, useState } from 'react';
import { Clock3, ShieldAlert } from 'lucide-react';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { useEventStore } from '../store/eventStore';
import { eventService } from '../services/api/event.service';
import { useAuthStore } from '../store/authStore';
import { canWriteMonitoring } from '../services/permissions';

export default function Events() {
  const { events, loading, error, fetchEvents } = useEventStore();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [actionError, setActionError] = useState<string | null>(null);
  const filteredEvents = useMemo(() => events.filter((item) =>
    (severity === 'ALL' || item.severity === severity)
      && `${item.title} ${item.summary} ${item.source} ${item.location}`.toLowerCase().includes(query.toLowerCase()),
  ), [events, query, severity]);
  const updateStatus = async (id: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    setActionError(null);
    try {
      await eventService.updateEvent(id, { status });
      await fetchEvents();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not update event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Events</h1>
          <p className="text-slate-400">Operational signal log and event timeline</p>
        </div>
        <div className="flex gap-2">
          <input aria-label="Search events" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
          <select aria-label="Filter events by severity" value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option value="ALL">All severities</option>{['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      </div>

      {actionError && <div role="alert" className="rounded border border-red-700 p-3 text-sm text-red-200">{actionError}</div>}
      <SectionCard title="Event stream" subtitle="Latest security and infrastructure signals">
        <QueryNotice loading={loading} error={error} onRetry={() => void fetchEvents()} />
        {!loading && !error ? <div className="space-y-4">
          {filteredEvents.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No matching events.</p> : null}
          {filteredEvents.map((event) => {
            const severityTone =
              event.severity === 'CRITICAL' ? 'danger' :
              event.severity === 'HIGH' ? 'warning' :
              event.severity === 'MEDIUM' ? 'info' : 'neutral';

            return (
              <article key={event.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusPill tone={severityTone}>{event.severity}</StatusPill>
                      <span className="text-sm font-medium text-slate-200">{event.title}</span>
                    </div>
                    <p className="text-sm text-slate-400">{event.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 size={12} />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>Source: {event.source}</span>
                  <span>Location: {event.location}</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldAlert size={12} />
                    {event.status}
                  </span>
                </div>
                {canWriteMonitoring(user?.role) && event.status !== 'RESOLVED' && <div className="mt-4 flex gap-2">
                  {event.status === 'ACTIVE' && <button onClick={() => void updateStatus(event.id, 'ACKNOWLEDGED')} className="rounded border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">Acknowledge</button>}
                  <button onClick={() => void updateStatus(event.id, 'RESOLVED')} className="rounded border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">Resolve</button>
                </div>}
              </article>
            );
          })}
        </div> : null}
      </SectionCard>
    </div>
  );
}
