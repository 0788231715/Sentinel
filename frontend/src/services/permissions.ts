export type SentinelRole = 'viewer' | 'analyst' | 'operator' | 'engineer' | 'admin';

export function canWriteMonitoring(role: string | undefined): boolean {
  return role === 'operator' || role === 'engineer' || role === 'admin';
}
