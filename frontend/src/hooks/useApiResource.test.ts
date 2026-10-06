import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApiResource } from './useApiResource';

describe('useApiResource', () => {
  it('loads a resource and supports retry', async () => {
    const load = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const { result } = renderHook(() => useApiResource(load));
    await waitFor(() => expect(result.current.data).toBe('first'));
    await act(async () => result.current.reload());
    expect(result.current.data).toBe('second');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('exposes request failures for page-level error handling', async () => {
    const load = vi.fn().mockRejectedValue(new Error('backend unavailable'));
    const { result } = renderHook(() => useApiResource(load));
    await waitFor(() => expect(result.current.error).toBe('backend unavailable'));
  });
});
