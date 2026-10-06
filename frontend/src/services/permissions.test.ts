import { describe, expect, it } from 'vitest';
import { canWriteMonitoring } from './permissions';

describe('canWriteMonitoring', () => {
  it.each(['operator', 'engineer', 'admin'])('allows %s writes', (role) => {
    expect(canWriteMonitoring(role)).toBe(true);
  });

  it.each(['viewer', 'analyst', undefined])('rejects %s writes', (role) => {
    expect(canWriteMonitoring(role)).toBe(false);
  });
});
