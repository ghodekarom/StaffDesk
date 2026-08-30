import { renderHook, act } from '@testing-library/react';
import { useOfflineStatus } from '@/lib/use-offline-status';

describe('useOfflineStatus hook', () => {
  const originalOnLine = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
    });
  });

  it('returns false when online initially', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);
  });

  it('returns true when offline initially', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(true);
  });

  it('updates state reactively when offline and online window events fire', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(false);
  });
});
