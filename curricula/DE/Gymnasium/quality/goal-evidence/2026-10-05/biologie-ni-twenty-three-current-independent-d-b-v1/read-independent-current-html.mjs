// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {createHash} from 'node:crypto';

const repo = process.cwd();
const own = resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-twenty-three-current-independent-d-b-v1');
const author = resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-ten-current-native-author-candidate-v2');
const iso = resolve(repo,'tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root');
const sha = b => createHash('sha256').update(b).digest('hex');
const browser = await chromium.launch({headless:true});
const books = [];
for (const [label, bookName] of [['d18','native-eighteen-current49-all-images-finalbook'],['d5','native-existing-five-current49-bindings-finalbook']]) {
  const html = resolve(author,bookName,'bundle/book.html');
  const input = JSON.parse(readFileSync(resolve(author,bookName,'round-b/description-review-input.json')));
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
  await page.goto('http://root-independent-ni-b.local/book.html',{waitUntil:'networkidle'});
  const sections = await page.locator('.goal-page').evaluateAll(es => es.map(e => ({
    goalId:e.dataset.goalId,wholeInnerText:e.innerText,
    images:Array.from(e.querySelectorAll('img')).map(i=>({source:i.getAttribute('src'),alt:i.getAttribute('alt'),complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}))
  })));
  if(JSON.stringify(input.goals.map(g=>g.goalId))!==JSON.stringify(sections.map(s=>s.goalId))) throw Error('Exact current NI goal order mismatch');
  if(sections.some(s=>s.images.length!==1||s.images.some(i=>!i.complete||!i.naturalWidth))||failures.length) throw Error('Incomplete NI HTML/image load');
  const screenshots=[];
  for(const section of sections){
    const path=resolve(own,'actual-independent-html-views',label+'-'+section.goalId+'.actual-loaded-html.png');
    mkdirSync(dirname(path),{recursive:true});
    await page.locator('#goal-'+section.goalId).screenshot({path});
    screenshots.push({goalId:section.goalId,path,sha256:sha(readFileSync(path))});
  }
  await page.close();
  books.push({label,bookName,actualHTML:html,htmlSHA256:sha(readFileSync(html)),actualGoalSections:sections,requests,screenshots,failures});
  writeFileSync(resolve(own,label+'.actual-loaded-html.whole-sections.actual.txt'),sections.map(s=>s.goalId+'\n'+s.wholeInnerText).join('\n\n')+'\n');
}
await browser.close();
writeFileSync(resolve(own,'actual-independent-current-html.receipt.json'),JSON.stringify({completedUTC:new Date().toISOString(),reviewer:'/root independent D-B',authorRole:false,individualOtherReviewerScientificJudgementsConsulted:false,books,humanApproval:false,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({books:books.length,actualGoalSections:books.flatMap(b=>b.actualGoalSections).length,loadedImages:books.flatMap(b=>b.actualGoalSections.flatMap(s=>s.images)).length,failures:books.flatMap(b=>b.failures),activeWrites:0}));
