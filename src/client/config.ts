export const SERVER_PORT = 51399;
// In production the game server also serves this client, so the API is on the page's own origin.
export const SERVER_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`
  : window.location.origin);
export const GAME_NAME = 'Exploding-Kittens';
