// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {createHash} from 'node:crypto';

const repo = process.cwd();
const own = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-eight-current-independent-d-b-v1');
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1';
const iso = resolve(repo, 'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1');
const html = resolve(iso, author, 'native-finalbook-v2/bundle/book.html');
const input = JSON.parse(readFileSync(resolve(repo, author, 'native-finalbook-v2/round-b/description-review-input.json')));
const sha = b => createHash('sha256').update(b).digest('hex');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1150,height:1600},deviceScaleFactor:1});
const requests = [], failures = [];
page.on('pageerror', e => failures.push(String(e)));
await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  const path = url.pathname === '/book.html' ? html : url.pathname.startsWith('/assets/') ? resolve(iso,'app/public',url.pathname.slice(1)) : null;
  if (!path) { await route.abort(); return; }
  const bytes = readFileSync(path);
  requests.push({request:url.pathname,actualFile:path,sha256:sha(bytes),bytes:bytes.length});
  await route.fulfill({body:bytes,contentType:path.endsWith('.html')?'text/html':path.endsWith('.png')?'image/png':'image/jpeg'});
});
await page.goto('http://root-independent-b.local/book.html',{waitUntil:'networkidle'});
const sections = await page.locator('.goal-page').evaluateAll(es => es.map(e => ({
  goalId:e.dataset.goalId, wholeInnerText:e.innerText,
  images:Array.from(e.querySelectorAll('img')).map(i => ({source:i.getAttribute('src'),alt:i.getAttribute('alt'),complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}))
})));
const expected = input.goals.map(g=>g.goalId);
if(JSON.stringify(expected)!==JSON.stringify(sections.map(s=>s.goalId))) throw Error('Actual DOM goal order does not match exact current D input');
if(sections.some(s=>s.images.length!==1||s.images.some(i=>!i.complete||i.naturalWidth===0))||failures.length) throw Error('Incomplete current HTML/image load');
const screenshots=[];
for(const section of sections){
  const path=resolve(own,'actual-independent-html-views',section.goalId+'.actual-loaded-html.png');
  mkdirSync(dirname(path),{recursive:true});
  await page.locator('#goal-'+section.goalId).screenshot({path});
  screenshots.push({goalId:section.goalId,path,sha256:sha(readFileSync(path))});
}
await browser.close();
const receipt={completedUtc:new Date().toISOString(),reviewer:'/root independent D-B',authorRole:false,otherReviewerJudgementsConsulted:false,actualHTML:html,htmlSHA256:sha(readFileSync(html)),actualGoalSections:sections,requests,screenshots,failures,activeWrites:0,humanApproval:false};
writeFileSync(resolve(own,'actual-current-loaded-html.receipt.json'),JSON.stringify(receipt,null,2)+'\n');
writeFileSync(resolve(own,'actual-current-loaded-html.whole-sections.actual.txt'),sections.map(s=>s.goalId+'\n'+s.wholeInnerText).join('\n\n')+'\n');
console.log(JSON.stringify({goalSections:sections.length,loadedImages:sections.flatMap(s=>s.images).length,htmlSHA256:receipt.htmlSHA256,failures,activeWrites:0}));
