import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

// Technical HTML capture only. PDF capture and actual visual review are separate.
const req = createRequire(resolve('app/package.json'));
const { chromium } = req('playwright');
const root = process.cwd();
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-root-normal-final-integration-20261011-v1';
const load = async path => JSON.parse(await readFile(path, 'utf8'));
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const fileBinding = async path => {
  const bytes = await readFile(path);
  return { path, bytes: bytes.length, sha256: sha(bytes) };
};
const checkPath = base + '/complete6-current-final-page-bindings.actual.json';
const htmlPath = base + '/native/current-source382.html';
const manifestPath = base + '/native/current-source382.html.render-manifest.json';
const check = await load(checkPath);
if (check.rows.length !== 6 || new Set(check.rows.map(row => row.goalId)).size !== 6) {
  throw Error('Checker must bind exactly forty distinct whole goal articles.');
}
const originalBytes = await readFile(htmlPath);
const expectedHtml = check.inputs.find(input => input.path === htmlPath);
if (!expectedHtml || expectedHtml.sha256 !== sha(originalBytes) || expectedHtml.bytes !== originalBytes.length) {
  throw Error('Complete original HTML differs from the checker binding.');
}
const originalHtml = originalBytes.toString('utf8');
const manifest = await load(manifestPath);
if (manifest.artifactSha256 !== sha(originalBytes)) throw Error('HTML renderer manifest artifact binding differs.');
const articles = new Map();
const articlePattern = /<article\b[^>]*data-goal-id="([^"]+)"[^>]*>[\s\S]*?<\/article>/g;
for (const match of originalHtml.matchAll(articlePattern)) {
  if (articles.has(match[1])) throw Error('Duplicate original article ' + match[1]);
  articles.set(match[1], match[0]);
}
if (articles.size !== 382) throw Error('Original document must retain the complete382 article source.');
const originalStyles = [...originalHtml.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(match => match[0]);
const extensionMime = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.css': 'text/css', '.js': 'application/javascript',
};
const byteMime = (bytes, path) => {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  return extensionMime[extname(path)] ?? 'application/octet-stream';
};
await mkdir(base + '/captures/html', { recursive: true });
await mkdir(base + '/html-diagnostics', { recursive: true });
const rows = [];
const diagnostics = [];
const browser = await chromium.launch({ headless: true });
let failure = null;
try {
  for (const row of check.rows) {
    const article = articles.get(row.goalId);
    if (!article) throw Error('Missing original whole article ' + row.goalId);
    const manifestPage = manifest.pages.find(page => page.goalId === row.goalId);
    if (!manifestPage || manifestPage.pageNumber !== row.pageNumber || manifestPage.goalFingerprint !== row.goalFingerprint || manifestPage.pageFingerprint !== row.pageFingerprint) {
      throw Error('Whole article/model/renderer/checker binding differs for ' + row.goalId);
    }
    // Keep the entire original document, styles and complete selected article byte-for-byte;
    // omit all other article elements. Only one image-bearing article is live at a time.
    const html = originalHtml.replace(articlePattern, (body, goalId) => goalId === row.goalId ? body : '');
    const selectedArticles = [...html.matchAll(articlePattern)];
    const selectedStyles = [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(match => match[0]);
    if (selectedArticles.length !== 1 || selectedArticles[0][0] !== article || JSON.stringify(selectedStyles) !== JSON.stringify(originalStyles)) {
      throw Error('Whole original article or CSS changed for ' + row.goalId);
    }
    const context = await browser.newContext({ viewport: { width: 1100, height: 1500 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const routes = [];
    const requestFailures = [];
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), resourceType: request.resourceType(), error: request.failure()?.errorText }));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'http://goal-book.local') {
        routes.push({ url: url.href, action: 'abortExternal' });
        await route.abort();
        return;
      }
      if (url.pathname === '/') {
        await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', headers: { 'cache-control': 'no-store' }, body: html });
        return;
      }
      const publicRoot = resolve(root, 'app/public');
      const path = resolve(publicRoot, decodeURIComponent(url.pathname.slice(1)));
      if (!path.startsWith(publicRoot + '/')) {
        routes.push({ url: url.href, action: 'abortOutsidePublic' });
        await route.abort();
        return;
      }
      try {
        const bytes = await readFile(path);
        const contentType = byteMime(bytes, path);
        const expected = manifest.assets.find(asset => asset.publicPath === url.pathname);
        const bound = expected && expected.sourceSha256 === sha(bytes);
        routes.push({ url: url.href, path: path.slice(root.length + 1), action: 'fulfill', contentType, bytes: bytes.length, sourceSha256: sha(bytes), originalRendererAssetBindingExact: Boolean(bound) });
        if (route.request().resourceType() === 'image' && !bound) {
          routes.at(-1).action = 'abortAssetBindingMismatch';
          await route.abort();
          return;
        }
        await route.fulfill({ status: 200, contentType, headers: { 'cache-control': 'no-store' }, body: bytes });
      } catch (error) {
        routes.push({ url: url.href, path: path.slice(root.length + 1), action: 'abortReadOrRouteFailure', errorCode: error.code ?? error.name });
        await route.abort();
      }
    });
    let images = [];
    try {
      await page.emulateMedia({ media: 'print' });
      await page.goto('http://goal-book.local/', { waitUntil: 'networkidle', timeout: 30000 });
      images = await page.evaluate(async () => {
        await document.fonts.ready;
        const results = [];
        for (const image of document.images) {
          let decodeError = null;
          try { await image.decode(); }
          catch (error) { decodeError = { name: error.name, message: error.message }; }
          results.push({ goalId: image.closest('article')?.dataset.goalId, src: image.getAttribute('src'), currentSrc: image.currentSrc, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete, decodeError });
        }
        return results;
      });
      diagnostics.push({ goalId: row.goalId, images, routes, requestFailures });
      // Diagnostic collection does not excuse a failure. Never capture missing or undecodable goal images.
      if (images.length !== 1 || images.some(image => image.goalId !== row.goalId || image.decodeError || !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)) {
        throw Error('Goal image failed strict isolated decoding for ' + row.goalId);
      }
      if (requestFailures.length || routes.some(route => route.action !== 'fulfill')) throw Error('Resource route failed for ' + row.goalId);
      const locator = page.locator('article[data-goal-id="' + row.goalId + '"]');
      if (await locator.count() !== 1) throw Error('Missing whole selected article ' + row.goalId);
      const metadata = await locator.evaluate(element => ({ goalId: element.dataset.goalId, pageNumber: Number(element.dataset.pageNumber), wholeTextLength: element.innerText.length, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight, bounds: { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height } }));
      if (metadata.pageNumber !== row.pageNumber || metadata.wholeTextLength === 0) throw Error('Original whole article metadata differs for ' + row.goalId);
      const path = base + '/captures/html/' + row.goalId + '.png';
      await locator.screenshot({ path });
      rows.push({ ...row, htmlCapture: await fileBinding(path), originalWholeArticleSha256: sha(article), originalStyleBlocksSha256: sha(originalStyles.join('\n')), isolatedDocumentSha256: sha(html), wholeOriginalArticleExact: true, originalCSSExact: true, browserMetadata: metadata, decodedImages: images });
      if (rows.length % 10 === 0) console.log('Captured ' + rows.length + '/6 complete HTML articles.');
    } catch (error) {
      if (!diagnostics.some(diagnostic => diagnostic.goalId === row.goalId)) diagnostics.push({ goalId: row.goalId, images, routes, requestFailures });
      throw error;
    } finally {
      // A fresh context per article releases page/cache ownership and bounds live decode memory.
      await context.close();
    }
  }
} catch (error) {
  failure = { name: error.name, message: error.message };
} finally {
  await browser.close();
  await writeFile(base + '/html-diagnostics/isolated6-routing-and-decode.actual.json', JSON.stringify({ createdAtUTC: new Date().toISOString(), liveImageBearingArticlesAtOnce: 1, maximumBrowserContextsAtOnce: 1, rows: diagnostics, completeCaptureCount: rows.length, failure, failedImagesSkipped: false }, null, 2) + '\n');
}
if (failure) throw Error(failure.message);
if (rows.length !== 6) throw Error('Expected forty actual complete HTML screenshots.');
await writeFile(base + '/complete6-current-html-capture-bindings.actual.json', JSON.stringify({ createdAtUTC: new Date().toISOString(), role: 'Actual complete HTML article screenshots only; no visual/scientific approval', inputs: [await fileBinding(checkPath), await fileBinding(htmlPath), await fileBinding(manifestPath)], selectedPageCount: 6, rows, htmlMedia: 'print', viewport: { width: 1100, height: 1500 }, deviceScaleFactor: 1, htmlCaptureScope: 'One complete original article per isolated original document; all original CSS and that article body byte-exact. Other articles omitted to bound decoded-image memory. Full382 manifest/text validation remains separate.', liveImageBearingArticlesAtOnce: 1, maximumBrowserContextsAtOnce: 1, all6GoalImagesDecoded: true, routeOrRequestFailures: 0, PDFWritten: false, scientificOrVisualApproval: false, actualPixelInspectionStillRequired: true, strictGain: 0, humanApproved: 0 }, null, 2) + '\n');
console.log('Captured6 complete HTML articles; all6 goal images decoded and bound. Actual viewing remains separate.');
