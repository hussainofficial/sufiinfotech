const API_URL = import.meta.env.VITE_API_URL || '/api';
const ORIGIN = API_URL.replace(/\/api\/?$/, '');

// Backend returns file paths like "/uploads/xyz.pdf". In dev those resolve via
// the Vite proxy (ORIGIN is ''); in production the backend lives on a different
// domain than the frontend, so we need to prefix it explicitly.
export function fileUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${ORIGIN}${path}`;
}
