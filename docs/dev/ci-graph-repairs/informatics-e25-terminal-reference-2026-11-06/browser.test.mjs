import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(resolve('app/node_modules/playwright/index.mjs')).href);
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run']});
const rows=[];const external=[];
try {
 for(const width of [320,767,768,1024]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route(/^https?:\/\//,route=>{external.push(route.request().url());return route.abort();});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('./solution.html', import.meta.url).href);
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
   columns:getComputedStyle(document.querySelector('.cards')).gridTemplateColumns.split(/\s+/).length,
   tops:[...document.querySelectorAll('.card')].map(x=>Math.round(x.getBoundingClientRect().top)),
   semantic:[...document.querySelectorAll('header,nav,main,section,article,footer')].length}));
  assert(layout.scroll<=width);assert.equal(layout.columns,width<768?1:3);
  if(width<768)assert(layout.tops[0]<layout.tops[1]&&layout.tops[1]<layout.tops[2]);
  else assert(layout.tops.every(x=>x===layout.tops[0]));
  await page.fill('#name','Jana Jung');await page.fill('#email','jana@example.test');await page.selectOption('#course','robotik');
  await page.fill('#places','2');await page.check('#testdata');await page.click('button');
  assert.equal(await page.locator('[data-free-for="robotik"]').innerText(),'1');
  const success=await page.locator('#status').innerText();assert.match(success,/6,00 EUR; noch 1 frei/);
  await page.click('button');assert.equal(await page.locator('[data-free-for="robotik"]').innerText(),'1');
  assert.match(await page.locator('#status').innerText(),/Nicht genügend Plätze/);
  await page.fill('#places','1');await page.click('button');assert.equal(await page.locator('[data-free-for="robotik"]').innerText(),'0');
  const finalStatus=await page.locator('#status').innerText();assert.match(finalStatus,/3,00 EUR; noch 0 frei/);
  await page.selectOption('#course','laser');await page.fill('#places','4');await page.click('button');
  const discountStatus=await page.locator('#status').innerText();assert.match(discountStatus,/10,00 EUR; noch 0 frei/);
  assert.equal(await page.locator('[data-free-for="laser"]').innerText(),'0');
  assert.equal(errors.length,0);assert.match(page.url(),/^file:/);
  if(width===320||width===1024)await page.screenshot({path:fileURLToPath(new URL(`./browser-${width}.png`, import.meta.url)),fullPage:true});
  rows.push({width,layout,firstSuccess:success,finalStatus,discountStatus,scriptErrors:errors,localFileUrlPreserved:true});
  await context.close();
 }
 assert.equal(external.length,0);
 const result={status:'PASS-owned-local-Chromium-reference-only',browserVersion:browser.version(),rows,externalHttpRequests:external,
   boundary:'Observed only this self-contained local model at 320/767/768/1024 pixels. No production host, deployment, cross-browser, accessibility-user or didactic acceptance.'};
 writeFileSync(new URL('./browser-results.json', import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
} finally {await browser.close();}
