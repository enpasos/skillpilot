const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const author = path.resolve(__dirname, '../biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2');
const ids = ['485ef1c3-8997-52b7-91f5-b1ddf179013d', '11675f1a-5de2-5926-be78-1e8275f19f5b', 'e70d8a85-2dea-5165-919b-200fee9f4db4'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'actual-browser'), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const rows = [];
  for (const id of ids) {
    const sourcePath = path.join(author, 'selected-existing-images', id + '.png');
    const bytes = fs.readFileSync(sourcePath);
    for (const width of [360, 680]) {
      await page.setViewportSize({ width, height: 600 });
      await page.setContent('<style>html,body{margin:0}img{display:block;width:100%;max-height:448px;object-fit:contain}</style><img src="data:image/png;base64,' + bytes.toString('base64') + '">');
      await page.locator('img').evaluate(async img => { await img.decode(); });
      const geometry = await page.locator('img').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height }));
      const screenshotPath = path.join(__dirname, 'actual-browser', `${id}-${width}.png`);
      await page.locator('img').screenshot({ path: screenshotPath });
      rows.push({ goalId: id, sourcePath, sourceSha256: sha(bytes), width, geometry, screenshotPath, screenshotSha256: sha(fs.readFileSync(screenshotPath)) });
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'actual-browser', 'capture.receipt.json'), JSON.stringify({ reviewer: '/root/bio_two_current_fresh_blind_b', rows }, null, 2) + '\n');
})().catch(error => { process.stderr.write(String(error)); process.exit(1); });
