import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  PROFILE,
  SIGNED_IN,
  SIGNED_OUT,
  renderWithAuth,
} from '../test/renderWithAuth';
import { AccountPage } from './AccountPage';

describe('Cuenta: sin nube', () => {
  it('explica que es modo invitado y no ofrece iniciar sesión', () => {
    renderWithAuth(<AccountPage />);
    expect(screen.getByText(/Modo invitado/)).toBeInTheDocument();
    expect(screen.getByText(/no tiene la nube conectada/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar sesión/ })).toBeNull();
  });
});

describe('Cuenta: sin sesión', () => {
  it('ofrece iniciar sesión con Google y llama a la acción', () => {
    const signInWithGoogle = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPage />, { ...SIGNED_OUT, signInWithGoogle });
    fireEvent.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con Google \(@upq\.edu\.mx\)/,
      })
    );
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('si no se puede abrir Google muestra el error', async () => {
    const signInWithGoogle = vi
      .fn()
      .mockRejectedValue(new Error('Failed to fetch'));
    renderWithAuth(<AccountPage />, { ...SIGNED_OUT, signInWithGoogle });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sin conexión a internet.'
    );
  });

  it('muestra el aviso de una cuenta rechazada y se puede cerrar', () => {
    const dismissNotice = vi.fn();
    renderWithAuth(<AccountPage />, {
      ...SIGNED_OUT,
      notice: 'Solo se permiten cuentas institucionales (@upq.edu.mx).',
      dismissNotice,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'cuentas institucionales'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(dismissNotice).toHaveBeenCalled();
  });

  it('mientras comprueba la sesión no ofrece nada', () => {
    renderWithAuth(<AccountPage />, { enabled: true, status: 'loading' });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Comprobando tu sesión'
    );
    expect(screen.queryByRole('button', { name: /Iniciar sesión/ })).toBeNull();
  });
});

describe('Cuenta: con sesión', () => {
  const base = {
    ...SIGNED_IN,
    refreshProfile: vi.fn().mockResolvedValue(undefined),
  };

  it('muestra el apodo y las estadísticas, y nunca el correo', () => {
    renderWithAuth(<AccountPage />, base);
    expect(screen.getByText('Ana_M')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/@/); // sin correos; solo la nota "@upq.edu.mx" no aparece aquí
  });

  it('actualiza los contadores al abrir la pantalla', () => {
    const refreshProfile = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPage />, { ...base, refreshProfile });
    expect(refreshProfile).toHaveBeenCalled();
  });

  it('cambiar el apodo: valida, guarda y cierra el formulario', async () => {
    const chooseUsername = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPage />, { ...base, chooseUsername });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar apodo' }));
    const input = screen.getByLabelText('Apodo');
    expect(input).toHaveValue('Ana_M');

    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar apodo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Apodo no válido'
    );
    expect(chooseUsername).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '  Ana_Nueva ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar apodo' }));
    await waitFor(() =>
      expect(chooseUsername).toHaveBeenCalledWith('Ana_Nueva')
    );
    await waitFor(() => expect(screen.queryByLabelText('Apodo')).toBeNull());
  });

  it('si el apodo ya está en uso lo dice con claridad', async () => {
    const chooseUsername = vi
      .fn()
      .mockRejectedValue(new Error('username_taken'));
    renderWithAuth(<AccountPage />, { ...base, chooseUsername });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar apodo' }));
    fireEvent.change(screen.getByLabelText('Apodo'), {
      target: { value: 'Beto.2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar apodo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ese apodo ya está en uso'
    );
  });

  it('sin apodo elegido muestra el formulario de una vez', () => {
    renderWithAuth(<AccountPage />, {
      ...base,
      profile: {
        ...PROFILE,
        username: 'jugador_ab12cd34',
        hasChosenUsername: false,
      },
    });
    expect(screen.getByText(/no apareces en el ranking/)).toBeInTheDocument();
    expect(screen.getByLabelText('Apodo')).toHaveValue('');
  });

  it('cerrar sesión', () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPage />, { ...base, signOut });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(signOut).toHaveBeenCalled();
  });

  it('borrar el progreso pide confirmación y se puede cancelar', async () => {
    const clearProgress = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<AccountPage />, { ...base, clearProgress });
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi progreso' }));
    expect(
      screen.getByRole('dialog', { name: /Borrar tu progreso/ })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(clearProgress).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi progreso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar todo' }));
    await waitFor(() => expect(clearProgress).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('borrar la cuenta pide confirmación y avisa si falla', async () => {
    const deleteAccount = vi
      .fn()
      .mockRejectedValue(new Error('Failed to fetch'));
    renderWithAuth(<AccountPage />, { ...base, deleteAccount });
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta' }));
    expect(
      screen.getByRole('dialog', { name: /Borrar tu cuenta/ })
    ).toHaveTextContent('No se puede deshacer');
    fireEvent.click(
      screen.getByRole('button', { name: 'Sí, borrar mi cuenta' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sin conexión a internet.'
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // sigue abierto para reintentar
  });
});
