import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { PROFILE, SIGNED_IN, renderWithAuth } from '../../test/renderWithAuth';
import type { LocalRecord } from '../records/localRecords';
import { AccountPrompts } from './AccountPrompts';

const newcomer = {
  ...PROFILE,
  username: 'jugador_ab12cd34',
  hasChosenUsername: false,
};
const offer: LocalRecord[] = [
  {
    topic: 'integral',
    subtopic: 'todos',
    game: 'memory',
    difficulty: 'Normal',
    score: 400,
    date: 'x',
  },
  {
    topic: 'integral',
    subtopic: 'todos',
    game: 'bomb',
    difficulty: 'Normal',
    score: 100,
    date: 'x',
  },
];

describe('Aviso para elegir apodo', () => {
  it('aparece si la persona con sesión aún no eligió', () => {
    renderWithAuth(<AccountPrompts />, { ...SIGNED_IN, profile: newcomer });
    expect(
      screen.getByRole('dialog', { name: 'Elige tu apodo' })
    ).toHaveTextContent('No se muestra tu nombre real ni tu correo');
  });

  it('no aparece si ya eligió, si es invitado o mientras se carga el perfil', () => {
    const a = renderWithAuth(<AccountPrompts />, SIGNED_IN);
    expect(screen.queryByRole('dialog')).toBeNull();
    a.unmount();
    const b = renderWithAuth(<AccountPrompts />);
    expect(screen.queryByRole('dialog')).toBeNull();
    b.unmount();
    renderWithAuth(<AccountPrompts />, { ...SIGNED_IN, profile: null });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('guarda el apodo elegido', async () => {
    const chooseUsername = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      profile: newcomer,
      chooseUsername,
    });
    fireEvent.change(screen.getByLabelText('Apodo'), {
      target: { value: 'Ana_M' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar apodo' }));
    await waitFor(() => expect(chooseUsername).toHaveBeenCalledWith('Ana_M'));
  });

  it('se puede posponer ("Más tarde") y también con Esc', () => {
    const dismissUsernamePrompt = vi.fn();
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      profile: newcomer,
      dismissUsernamePrompt,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }));
    expect(dismissUsernamePrompt).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(dismissUsernamePrompt).toHaveBeenCalledTimes(2);
  });

  it('una vez pospuesto no vuelve a molestar en esa visita', () => {
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      profile: newcomer,
      usernamePromptDismissed: true,
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Aviso de récords del dispositivo', () => {
  it('pregunta antes de agregarlos y advierte de las computadoras compartidas', () => {
    renderWithAuth(<AccountPrompts />, { ...SIGNED_IN, guestOffer: offer });
    const dialog = screen.getByRole('dialog', {
      name: 'Récords de este dispositivo',
    });
    expect(dialog).toHaveTextContent('2 récords guardados');
    expect(dialog).toHaveTextContent('computadora compartida');
  });

  it('acepta o rechaza', async () => {
    const acceptGuestOffer = vi.fn().mockResolvedValue(undefined);
    const declineGuestOffer = vi.fn();
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      guestOffer: offer,
      acceptGuestOffer,
      declineGuestOffer,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
    expect(declineGuestOffer).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, agregarlos' }));
    await waitFor(() => expect(acceptGuestOffer).toHaveBeenCalledTimes(1));
  });

  it('si falla al agregarlos lo dice y deja reintentar', async () => {
    const acceptGuestOffer = vi
      .fn()
      .mockRejectedValue(new Error('Failed to fetch'));
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      guestOffer: offer,
      acceptGuestOffer,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sí, agregarlos' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sin conexión a internet.'
    );
    expect(
      screen.getByRole('button', { name: 'Sí, agregarlos' })
    ).toBeEnabled();
  });

  it('primero se pide el apodo y solo después la oferta', () => {
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      profile: newcomer,
      guestOffer: offer,
    });
    expect(
      screen.getByRole('dialog', { name: 'Elige tu apodo' })
    ).toBeInTheDocument();
  });

  it('con una sola dice "récord" en singular', () => {
    renderWithAuth(<AccountPrompts />, {
      ...SIGNED_IN,
      guestOffer: [offer[0]],
    });
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '1 récord guardado aquí'
    );
  });
});
