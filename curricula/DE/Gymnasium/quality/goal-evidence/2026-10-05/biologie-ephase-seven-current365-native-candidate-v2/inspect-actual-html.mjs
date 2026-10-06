// SPDX-License-Identifier: Apache-2.0
import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../../');
const html=readFileSync(resolve(own,'native-finalbook/bundle/book.html'),'utf8');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1100,height:1000}});
await page.route('http://e7-current365.local/**',async route=>{const u=new URL(route.request().url());if(u.pathname==='/book.html')return route.fulfill({contentType:'text/html',body:html});if(u.pathname.startsWith('/assets/'))return route.fulfill({contentType:'image/png',body:readFileSync(resolve(root,'app/public'+u.pathname))});return route.abort();});
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://e7-current365.local/book.html',{waitUntil:'networkidle'});
const rows=await page.locator('article.goal-page').evaluateAll(nodes=>nodes.map(el=>({goalId:el.getAttribute('data-goal-id'),actualDOMText:el.innerText,images:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),alt:img.getAttribute('alt'),complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight})),rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}})));
assert.equal(rows.length,7);assert.deepEqual(errors,[]);assert.ok(rows.every(r=>r.images.length===1&&r.images.every(i=>i.complete&&i.naturalWidth>0)));
mkdirSync(resolve(own,'actual-current-page-views'),{recursive:true});for(let n=0;n<rows.length;n++)await page.locator('article.goal-page').nth(n).screenshot({path:resolve(own,'actual-current-page-views',`${rows[n].goalId}.actual-loaded-html.png`)});
writeFileSync(resolve(own,'actual-loaded-current365-html.receipt.json'),JSON.stringify({status:'Actual Chromium DOM and loaded PNGs, technical comparison only',browserVersion:browser.version(),htmlPath:'native-finalbook/bundle/book.html',rows,pageErrors:errors,newScienceApprovalClaimed:false,humanApproval:false,humanTrial:false,activeWrites:0},null,2)+'\n');await browser.close();console.log(JSON.stringify({actualLoadedGoalArticles:rows.length,loadedImages:7,pageErrors:0}));
