export async function loadConfig() {
    try {
      const res = await fetch('/config.json', { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('config.json fetch failed → folosesc fallback', e);
    }
    return { API_BASE: '/api' };
  }
  