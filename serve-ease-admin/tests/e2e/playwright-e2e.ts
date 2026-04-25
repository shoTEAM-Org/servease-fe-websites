import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

type RouteCheck = {
  authenticated?: boolean;
  path: string;
  markers: string[];
};

const ROUTES: RouteCheck[] = [
  { path: '/login', markers: ['Admin Portal', 'Sign in'] },
  { path: '/dashboard', authenticated: true, markers: ['Welcome back', 'Bookings Overview'] },
  {
    path: '/provider-applications',
    authenticated: true,
    markers: ['Pending Review', 'Applications processed'],
  },
  { path: '/bookings', authenticated: true, markers: ['All Bookings', 'Booking List'] },
  { path: '/support', authenticated: true, markers: ['Support Tickets'] },
  { path: '/finance', authenticated: true, markers: ['Finance & Settlements'] },
  { path: '/categories', authenticated: true, markers: ['Categories', 'Category List'] },
  { path: '/service-areas', authenticated: true, markers: ['Service Areas', 'Service Area List'] },
];

const ADMIN_FIXTURE = {
  id: 'ADM-E2E',
  name: 'E2E Admin',
  email: 'e2e-admin@servease.test',
  role: 'Super Admin',
};

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

async function newPage(browser: Browser, authenticated = false) {
  const page = await browser.newPage();
  if (authenticated) {
    await page.addInitScript((admin) => {
      window.localStorage.setItem('servease_admin', JSON.stringify(admin));
    }, ADMIN_FIXTURE);
  }
  return page;
}

async function assertRoute(browser: Browser, baseUrl: string, route: RouteCheck) {
  const page = await newPage(browser, Boolean(route.authenticated));
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
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
  } finally {
    await page.close();
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
  const port = process.env.PORT || '4174';
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
      const previewPage = await browser.newPage();
      const firstResponse = await previewPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      const firstText = (await previewPage.textContent('body')) || '';
      await previewPage.close();
      if (isExternalTarget && isProtectedPreview(firstResponse?.status(), firstText)) {
        console.log(
          `Admin web smoke reached protected preview on ${browserName} (status: ${
            firstResponse?.status() ?? 'unknown'
          })`,
        );
        return;
      }

      for (const route of ROUTES) {
        await assertRoute(browser, baseUrl, route);
      }
    } finally {
      await browser.close();
    }

    console.log(`Admin web smoke passed on ${browserName}`);
  } finally {
    stopApp(app);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
