import { beforeEach, describe, expect, it } from 'vitest';
import { useDataSpaceStore } from './dataSpaceStore';

describe('data-space selection', () => {
  beforeEach(() => {
    localStorage.clear();
    useDataSpaceStore.setState({ space: 'simulation' });
  });

  it('persists the selected operating space', () => {
    useDataSpaceStore.getState().setSpace('real');
    expect(useDataSpaceStore.getState().space).toBe('real');
    expect(localStorage.getItem('sentinel.dataSpace')).toBe('real');
  });
});
