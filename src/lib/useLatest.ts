import { useEffect, useRef } from 'react';

/** Mantiene en una ref el último valor recibido, para usarlo dentro de efectos sin reiniciarlos. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
