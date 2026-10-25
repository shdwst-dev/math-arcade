import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
// Fuentes propias (sin depender de Google Fonts): así también cargan sin conexión.
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import 'katex/dist/katex.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
