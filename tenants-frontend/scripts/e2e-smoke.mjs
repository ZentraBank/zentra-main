const baseUrl = (process.env.E2E_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const tenantSlug = process.env.E2E_TENANT_SLUG || 'zentra-bank';
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

if (!email || !password) {
  console.error('Missing E2E_EMAIL or E2E_PASSWORD.');
  process.exit(1);
}

let accessToken = '';
let cookie = '';

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Tenant-Slug', tenantSlug);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (cookie) headers.set('Cookie', cookie);

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: 'manual' });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const message = body?.message || `${response.status} ${response.statusText}`;
    throw new Error(`${options.method || 'GET'} ${path}: ${message}`);
  }
  return body;
}

function pass(label, detail = '') {
  console.log(`✓ ${label}${detail ? ` — ${detail}` : ''}`);
}

try {
  const tenant = await request('/tenants/current');
  pass('Tenant resolution', tenant?.data?.slug || tenantSlug);

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  accessToken = login?.data?.accessToken || '';
  if (!accessToken) throw new Error('Login response did not contain an access token');
  pass('Login', login?.data?.user?.email || email);

  const me = await request('/auth/me');
  pass('Authenticated session', me?.data?.full_name || me?.data?.email);

  const accounts = await request('/accounts/me');
  pass('Accounts', `${accounts?.data?.length ?? 0} returned`);

  const transfers = await request('/transfers/me?page=1&pageSize=20');
  pass('Transfers', `${transfers?.data?.length ?? 0} returned`);

  const beneficiaries = await request('/beneficiaries/me?page=1&pageSize=20&favouritesOnly=false');
  pass('Beneficiaries', `${beneficiaries?.data?.length ?? 0} returned`);

  const notifications = await request('/notifications/me?page=1&pageSize=20&unreadOnly=false&includeArchived=false');
  pass('Notifications', `${notifications?.data?.length ?? 0} returned`);

  const unread = await request('/notifications/me/unread-count');
  pass('Unread notification count', String(unread?.data?.count ?? 0));

  accessToken = '';
  const refreshed = await request('/auth/refresh', { method: 'POST', body: '{}' });
  accessToken = refreshed?.data?.accessToken || '';
  if (!accessToken) throw new Error('Refresh response did not contain an access token');
  pass('Refresh-token cookie flow');

  await request('/auth/logout', { method: 'POST', body: '{}' });
  pass('Logout');
  console.log('\nRead-only end-to-end smoke test passed.');
} catch (error) {
  console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
