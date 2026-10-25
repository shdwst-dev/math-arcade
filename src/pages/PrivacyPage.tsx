import React from 'react';
import { Link } from 'react-router-dom';

// BORRADOR para revisar con el asesor / la UPQ antes del lanzamiento (ver docs/launch-checklist.md).
export const PrivacyPage: React.FC = () => (
  <article className="space-y-6">
    <h2 className="font-pixel text-lg text-yellow-400">AVISO DE PRIVACIDAD</h2>

    <p className="text-sm text-gray-300">
      Math Arcade es un proyecto de servicio social para practicar matemáticas.
      Esto es lo que guarda y lo que no.
    </p>

    <section className="space-y-2">
      <h3 className="font-bold text-yellow-300">
        Si juegas sin iniciar sesión
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
        <li>
          Tus récords se guardan solo en este dispositivo (en el almacenamiento
          del navegador).
        </li>
        <li>No se envía nada a ningún servidor.</li>
      </ul>
    </section>

    <section className="space-y-2">
      <h3 className="font-bold text-yellow-300">
        Si inicias sesión con tu cuenta @upq.edu.mx
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
        <li>
          <b>Tu correo institucional</b> se usa únicamente para iniciar sesión.
          No se muestra a nadie y no se copia a tu perfil.
        </li>
        <li>
          <b>Se guarda:</b> el apodo que elijas, tus récords por tema y juego,
          el historial de tus partidas (fecha, puntaje y si ganaste) y los
          contadores de partidas y victorias.
        </li>
        <li>
          <b>No se guarda:</b> tu nombre real, tu matrícula, tu foto ni tu
          ubicación.
        </li>
        <li>
          <b>Qué ven los demás:</b> los alumnos con sesión ven tu apodo y tu
          mejor puntaje en el ranking. Nada más. Si no eliges apodo, no apareces
          en el ranking.
        </li>
      </ul>
    </section>

    <section className="space-y-2">
      <h3 className="font-bold text-yellow-300">Dónde se guardan los datos</h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
        <li>
          El inicio de sesión lo hace Google, y la cuenta y los datos de juego
          se guardan en Supabase.
        </li>
        <li>El sitio se publica en Vercel.</li>
        <li>No usamos cookies de publicidad ni herramientas de analítica.</li>
      </ul>
    </section>

    <section className="space-y-2">
      <h3 className="font-bold text-yellow-300">Tus decisiones</h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
        <li>
          Puedes cambiar tu apodo, <b>borrar tu progreso</b> o{' '}
          <b>borrar tu cuenta</b> y todos tus datos cuando quieras, desde{' '}
          <Link to="/account" className="text-cyan-300 underline">
            Cuenta
          </Link>
          .
        </li>
        <li>
          Los récords guardados en este dispositivo se borran desde
          Estadísticas.
        </li>
      </ul>
    </section>

    <section className="space-y-2">
      <h3 className="font-bold text-yellow-300">Importante</h3>
      <p className="text-sm text-gray-300">
        Los puntajes se calculan en tu navegador, así que el ranking es solo
        para divertirse: no sirve para calificar.
      </p>
    </section>
  </article>
);
