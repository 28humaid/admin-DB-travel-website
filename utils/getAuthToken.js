export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const name = 'next-auth.session-token';
  const secureName = '__Secure-next-auth.session-token';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name || key === secureName) {
      return decodeURIComponent(value);  // Raw JWT string
    }
  }

  return null;
}