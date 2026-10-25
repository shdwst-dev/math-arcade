import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { UpdatePrompt } from './UpdatePrompt';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}));

function setupSw(
  initial: { needRefresh?: boolean; offlineReady?: boolean } = {}
) {
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  let capturedOptions: Parameters<typeof useRegisterSW>[0];

  vi.mocked(useRegisterSW).mockImplementation((options) => {
    capturedOptions = options;
    const [needRefresh, setNeedRefresh] = useState(
      Boolean(initial.needRefresh)
    );
    const [offlineReady, setOfflineReady] = useState(
      Boolean(initial.offlineReady)
    );
    return {
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [offlineReady, setOfflineReady],
      updateServiceWorker,
    };
  });

  render(<UpdatePrompt />);
  return { updateServiceWorker, getOptions: () => capturedOptions };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('<UpdatePrompt>', () => {
  it('no muestra nada cuando no hay versión nueva ni aviso sin conexión', () => {
    setupSw();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('avisa cuando la app queda lista para jugar sin conexión y se cierra con Entendido', () => {
    setupSw({ offlineReady: true });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Listo: ya puedes jugar sin conexión.'
    );
    expect(screen.queryByRole('button', { name: 'Actualizar' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('con versión nueva permite actualizar o posponer sin recargar a media partida', () => {
    const { updateServiceWorker } = setupSw({ needRefresh: true });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Hay una nueva versión de Math Arcade.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'Después' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('programa una revisión periódica del service worker cada hora', () => {
    vi.useFakeTimers();
    const { getOptions } = setupSw();
    const update = vi.fn().mockResolvedValue(undefined);
    getOptions()?.onRegisteredSW?.('/sw.js', {
      update,
    } as unknown as ServiceWorkerRegistration);

    act(() => vi.advanceTimersByTime(60 * 60 * 1000));
    expect(update).toHaveBeenCalledTimes(1);
  });
});
