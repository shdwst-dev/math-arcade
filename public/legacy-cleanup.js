// Se carga dentro del service worker nuevo (importScripts). Si algún navegador todavía
// guarda la caché del service worker escrito a mano de v1 (math-arcade-v1, -v2…),
// se elimina para que no vuelva a servir archivos viejos.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => /^math-arcade-v\d+$/.test(name)).map((name) => caches.delete(name)))
      )
  );
});
