import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Con `globals: true` Testing Library ya limpia solo, pero así no depende de eso.
afterEach(() => cleanup());
