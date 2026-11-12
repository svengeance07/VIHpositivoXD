#!/usr/bin/env node
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist', 'vih-positivo-xd', 'browser');
const OUTPUT_DIR = path.join(ROOT_DIR, '.visual-review', 'captures');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const ROUTES = [
  { name: '01-inicio', path: '/' },
  { name: '02-login-paso1', path: '/login' },
  { name: '03-consulta-ciudadana', path: '/consulta' },
  { name: '04-master-panel', path: '/master' },
  { name: '05-master-control-vacunas', path: '/master/vacunas' },
  { name: '06-master-personal', path: '/master/personal' },
  { name: '07-srs-panel', path: '/SRS' },
  { name: '08-ps-panel', path: '/PS' },
];

function ensureBuildExists() {
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.log('⚡ Dist folder not found or incomplete. Running production build...');
    execSync('pnpm build', { cwd: ROOT_DIR, stdio: 'inherit' });
  }
}

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startStaticSpaServer(port) {
  const server = http.createServer((req, res) => {
    const cleanUrl = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, cleanUrl);

    // If request has no extension or doesn't exist, fallback to index.html (SPA routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.message);
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`🌐 Static SPA preview server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const targetRoute = args.find((a) => a.startsWith('--route='))?.split('=')[1];
  const targetViewport = args.find((a) => a.startsWith('--viewport='))?.split('=')[1];

  ensureBuildExists();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let port = 4210;
  let server = null;
  const is4200Open = await isPortOpen(4200);

  if (is4200Open) {
    port = 4200;
    console.log(`📡 Detected active server on http://127.0.0.1:4200. Reusing...`);
  } else {
    server = await startStaticSpaServer(port);
  }

  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🚀 Launching Playwright Chromium for visual review...`);

  const browser = await chromium.launch({
    headless: true,
  });

  const routesToCapture = targetRoute
    ? [{ name: targetRoute.replace(/[^a-zA-Z0-9_-]/g, '_'), path: targetRoute }]
    : ROUTES;

  const viewportsToCapture = targetViewport
    ? { [targetViewport]: VIEWPORTS[targetViewport] || { width: 1440, height: 900 } }
    : { desktop: VIEWPORTS.desktop, mobile: VIEWPORTS.mobile };

  const summary = [];

  try {
    for (const [vpName, vpSize] of Object.entries(viewportsToCapture)) {
      console.log(
        `\n📱 Capturing Viewport: ${vpName.toUpperCase()} (${vpSize.width}x${vpSize.height})`,
      );

      const context = await browser.newContext({
        viewport: vpSize,
        colorScheme: 'dark',
        deviceScaleFactor: 2, // HiDPI / Retina sharpness
      });

      const page = await context.newPage();

      for (const route of routesToCapture) {
        const fullUrl = `${baseUrl}#${route.path}`; // Or direct path
        const directUrl = `${baseUrl}${route.path}`;
        process.stdout.write(`  📸 Route "${route.path}" ... `);

        await page.goto(directUrl, { waitUntil: 'networkidle', timeout: 15000 });

        // Wait for fonts to fully render
        await page.evaluate(() => document.fonts.ready);

        // Freeze animations & transitions for 100% deterministic visual review
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              caret-color: transparent !important;
            }
          `,
        });

        // Short stabilization pause
        await page.waitForTimeout(300);

        const filename = `${route.name}-${vpName}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        await page.screenshot({
          path: filepath,
          fullPage: true,
        });

        const stat = fs.statSync(filepath);
        console.log(`Saved: ${filename} (${Math.round(stat.size / 1024)} KB)`);

        summary.push({
          route: route.path,
          name: route.name,
          viewport: vpName,
          filename,
          filepath,
          sizeKb: Math.round(stat.size / 1024),
        });
      }

      await context.close();
    }

    // Generate HTML visual gallery for quick human/browser inspection
    const htmlReport = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Visual Review Report - Sistema V</title>
  <style>
    body { background: #000000; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem; }
    h1 { font-size: 1.5rem; border-bottom: 1px solid #27272a; padding-bottom: 0.75rem; color: #fafafa; }
    p.lead { color: #a1a1aa; font-size: 0.88rem; }
    .grid { display: grid; gap: 2rem; margin-top: 2rem; }
    .card { background: #09090b; border: 1px solid #27272a; border-radius: 8px; overflow: hidden; }
    .card-header { padding: 0.75rem 1rem; border-bottom: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center; }
    .card-header strong { font-size: 0.9rem; color: #fafafa; }
    .badge { background: #18181b; border: 1px solid #3f3f46; color: #a1a1aa; font-family: monospace; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .img-wrap { padding: 1rem; background: #050507; overflow-x: auto; text-align: center; }
    img { max-width: 100%; height: auto; border: 1px solid #27272a; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <h1>Visual Review - Galería de Capturas</h1>
  <p class="lead">Generado el ${new Date().toLocaleString()} · ${summary.length} capturas en Obsidian Dark Mode</p>
  <div class="grid">
    ${summary
      .map(
        (s) => `
      <div class="card">
        <div class="card-header">
          <strong>${s.name} (${s.route})</strong>
          <span class="badge">${s.viewport} · ${s.sizeKb} KB</span>
        </div>
        <div class="img-wrap">
          <img src="${s.filename}" alt="${s.name}" loading="lazy">
        </div>
      </div>
    `,
      )
      .join('\n')}
  </div>
</body>
</html>
    `.trim();

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlReport);
    console.log(`\n✨ Visual review complete!`);
    console.log(`📂 Output directory: ${OUTPUT_DIR}`);
    console.log(`🌐 Gallery view: ${path.join(OUTPUT_DIR, 'index.html')}`);
  } finally {
    await browser.close();
    if (server) {
      server.close();
      console.log('🛑 Preview server closed.');
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Visual review failed:', err);
  process.exit(1);
});
