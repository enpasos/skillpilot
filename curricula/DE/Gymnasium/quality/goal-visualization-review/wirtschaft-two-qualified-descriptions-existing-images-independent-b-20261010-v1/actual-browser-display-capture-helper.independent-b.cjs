const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const root = '/home/enpasos/projects/skillpilot';
const out = path.join(root, 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-two-qualified-descriptions-existing-images-independent-b-20261010-v1');
const ids = ['04809186-3f65-579d-b300-af9ed3e100c1', '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644'];
fs.mkdirSync(out, { recursive: true });
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
(async () => {
  const executablePath = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const rows = [];
  for (const id of ids) {
    const asset = `app/public/assets/goal-visualizations/wirtschaftswissenschaften/${id}/${id}.png`;
    const bytes = fs.readFileSync(path.join(root, asset));
    for (const width of [360, 680]) {
      const context = await browser.newContext({ viewport: { width, height: 500 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.setContent(`<html><head><style>html,body{margin:0;padding:0;font-size:16px;background:#fff}figure{margin:0;width:${width}px}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style></head><body><figure><img id="review-image" src="data:image/png;base64,${bytes.toString('base64')}" /></figure></body></html>`);
      await page.locator('#review-image').evaluate(img => img.decode());
      const metrics = await page.locator('#review-image').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, actualCssWidth: img.getBoundingClientRect().width, actualCssHeight: img.getBoundingClientRect().height, objectFit: getComputedStyle(img).objectFit, maxHeight: getComputedStyle(img).maxHeight, deviceScaleFactor: devicePixelRatio, complete: img.complete }));
      if (metrics.actualCssWidth !== width || metrics.actualCssHeight > 448 || !metrics.complete || metrics.naturalWidth !== 1672 || metrics.naturalHeight !== 941) throw new Error('Unexpected native responsive image dimensions');
      const name = `${id}.actual-browser-${width}px.png`;
      const target = path.join(out, name);
      if (fs.existsSync(target)) throw new Error('Review screenshot already exists; preserve history');
      await page.locator('#review-image').screenshot({ path: target });
      const shot = fs.readFileSync(target);
      rows.push({ goalId: id, sourceAssetPath: asset, sourceAssetSHA256: sha(bytes), viewport: { width, height: 500 }, metrics, screenshot: { path: path.relative(root, target), sha256: sha(shot), bytes: shot.length }, actualBrowserScreenshot: true, sourceImageOrCodeEdited: false });
      await context.close();
    }
  }
  const result = { type: 'actual-existing-PNG-responsive-review-display-captures-not-new-goal-images', browser: { executablePath, version: browser.version() }, playwrightVersion: require('/home/enpasos/projects/skillpilot/app/node_modules/playwright/package.json').version, sourceCSSContract: 'GoalCard block h-auto max-h-[28rem] w-full object-contain; exact relevant display rules reproduced for bounded static image inspection only', screenshots: rows, privateLocalDataOnly: true, realHostOrEntireAppAcceptanceClaimed: false, newImagesGenerated: 0, sourceAssetsEdited: 0 };
  await browser.close();
  const target = path.join(out, 'actual-two-existing-images-browser360-680-rendered-metrics.command-result.json');
  if (fs.existsSync(target)) throw new Error('Existing command result must remain immutable');
  fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ outputPath: target, screenshots: rows.map(r => r.screenshot.path), browser: result.browser, sourceAssetsEdited: 0 }) + '\n');
})().catch(e => { process.stderr.write(e.stack + '\n'); process.exitCode = 1; });
