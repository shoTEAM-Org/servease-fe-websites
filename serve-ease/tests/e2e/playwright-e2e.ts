import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

type RouteCheck = {
  path: string;
  markers: string[];
};

const ROUTES: RouteCheck[] = [
  { path: '/login', markers: ['Provider Login', 'Manage Bookings'] },
  { path: '/provider/dashboard', markers: ['Quick Actions', 'Upcoming Bookings'] },
  { path: '/provider/bookings', markers: ['Bookings & Requests'] },
  { path: '/provider/calendar', markers: ['Calendar', 'Manage your bookings'] },
  { path: '/provider/messages', markers: ['Messages'] },
  { path: '/provider/earningsdashboard', markers: ['Earnings Dashboard'] },
];

function isProtectedPreview(status: number | undefined, text: string): boolean {
  if (status === 401 || status === 403) return true;

  const normalized = text.toLowerCase();
  return (
    normalized.includes('authentication required') ||
    normalized.includes('access denied') ||
    normalized.includes('vercel authentication') ||
    normalized.includes('password required')
  );
}

function resolveBrowser(name: string): BrowserName {
  return name === 'firefox' || name === 'webkit' ? name : 'chromium';
}

function launchBrowser(name: BrowserName): Promise<Browser> {
  switch (name) {
    case 'firefox':
      return firefox.launch({ headless: true });
    case 'webkit':
      return webkit.launch({ headless: true });
    default:
      return chromium.launch({ headless: true });
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // server is not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for server at ${url}`);
}

async function assertRoute(page: Page, baseUrl: string, route: RouteCheck) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${route.path}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(750);

  const status = response?.status();
  const text = (await page.textContent('body')) || '';
  if (!status || status >= 400) {
    throw new Error(`${route.path} returned status ${status ?? 'unknown'}`);
  }
  if (text.includes('Page not found')) {
    throw new Error(`${route.path} rendered the not-found page`);
  }
  for (const marker of route.markers) {
    if (!text.includes(marker)) {
      throw new Error(`${route.path} missing expected marker: ${marker}`);
    }
  }
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error(
      `${route.path} had browser errors: ${[...consoleErrors, ...pageErrors].join(' | ')}`,
    );
  }
}

function stopApp(app: ReturnType<typeof spawn> | null) {
  if (!app?.pid) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(app.pid), '/T', '/F'], {
      shell: true,
      stdio: 'ignore',
    });
    return;
  }
  app.kill('SIGTERM');
}

async function main() {
  const port = process.env.PORT || '4173';
  const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;
  const browserName = resolveBrowser(process.env.E2E_BROWSER || 'chromium');
  const isExternalTarget = Boolean(process.env.E2E_BASE_URL);
  const waitTimeoutMs = isExternalTarget ? 120_000 : 45_000;

  const app = isExternalTarget
    ? null
    : spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', port], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: process.env,
      });

  try {
    await waitForServer(baseUrl, waitTimeoutMs);

    const browser = await launchBrowser(browserName);
    try {
      const page = await browser.newPage();
      const firstResponse = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      const firstText = (await page.textContent('body')) || '';
      if (isExternalTarget && isProtectedPreview(firstResponse?.status(), firstText)) {
        console.log(
          `Provider web smoke reached protected preview on ${browserName} (status: ${
            firstResponse?.status() ?? 'unknown'
          })`,
        );
        return;
      }

      for (const route of ROUTES) {
        await assertRoute(page, baseUrl, route);
      }
    } finally {
      await browser.close();
    }

    console.log(`Provider web smoke passed on ${browserName}`);
  } finally {
    stopApp(app);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
