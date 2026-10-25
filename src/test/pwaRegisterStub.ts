// Sustituto de `virtual:pwa-register/react` para las pruebas (el real solo existe al compilar).
type Flag = [boolean, (value: boolean) => void];

export function useRegisterSW(): {
  needRefresh: Flag;
  offlineReady: Flag;
  updateServiceWorker: (reload?: boolean) => Promise<void>;
} {
  return {
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: async () => undefined,
  };
}
