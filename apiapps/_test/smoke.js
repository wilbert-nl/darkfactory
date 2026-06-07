// Usage: npx playwright test apiapps/_test/smoke.js --project=chromium -- --file=<path-to-index.html>
// Or:    node apiapps/_test/smoke.js <path-to-index.html>
//
// Standalone Playwright smoke test for a single-file HTML app.
// Pass the absolute path to index.html as the first CLI argument.
// Exit 0 = pass, exit 1 = fail.

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node smoke.js <absolute-path-to-index.html>');
    process.exit(1);
  }

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  const url = `file://${abs}`;
  const errors = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', err => errors.push(`JS error: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console error: ${msg.text()}`);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000); // let any sync JS run

    const checks = [];

    // 1. Title not empty
    const title = await page.title();
    checks.push({ name: 'Has title', pass: title.length > 0, detail: title });

    // 2. Has a visible header or h1
    const hasHeader = await page.locator('header, h1, h2').first().isVisible().catch(() => false);
    checks.push({ name: 'Has header/h1', pass: hasHeader });

    // 3. Body has meaningful content (more than 200 chars of text)
    const bodyText = await page.locator('body').innerText().catch(() => '');
    checks.push({ name: 'Has body text', pass: bodyText.trim().length > 100, detail: `${bodyText.trim().length} chars` });

    // 4. Not stuck on "Loading" with no other content
    const stuckLoading = bodyText.trim().toLowerCase() === 'loading...' ||
                         bodyText.trim().toLowerCase() === 'loading countries…';
    checks.push({ name: 'Not stuck loading', pass: !stuckLoading });

    // 5. No uncaught JS errors
    checks.push({ name: 'No JS errors', pass: errors.length === 0, detail: errors.join('; ') || 'none' });

    // Report
    let allPass = true;
    console.log(`\nSmoke test: ${path.basename(path.dirname(abs))}`);
    console.log(`URL: ${url}\n`);
    for (const c of checks) {
      const icon = c.pass ? '✅' : '❌';
      console.log(`  ${icon} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
      if (!c.pass) allPass = false;
    }
    console.log('');

    await browser.close();
    process.exit(allPass ? 0 : 1);
  } catch (e) {
    await browser.close();
    console.error(`Fatal: ${e.message}`);
    process.exit(1);
  }
})();
