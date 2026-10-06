import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle ? <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
