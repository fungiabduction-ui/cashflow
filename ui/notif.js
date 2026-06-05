export function sN(msg, err = false) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = 'notif show' + (err ? ' err' : '');
  clearTimeout(window._nt);
  window._nt = setTimeout(() => el.classList.remove('show'), 3000);
}
