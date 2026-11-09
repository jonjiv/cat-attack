// Full screen where the browser allows it. iPhones don't; there the game uses "Add to Home Screen".
// Browsers only accept these calls right after a click or a finger lifting.
const root = document.documentElement;
const enter = root.requestFullscreen || root.webkitRequestFullscreen;
const exit = document.exitFullscreen || document.webkitExitFullscreen;

export const canGoFullscreen = !!enter;

export function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function enterFullscreen() {
  if (!enter || isFullscreen()) return;
  const result = enter.call(root);
  if (result && result.catch) result.catch(() => {}); // refused: just stay in the browser window
}

export function toggleFullscreen() {
  if (isFullscreen()) exit.call(document);
  else enterFullscreen();
}
