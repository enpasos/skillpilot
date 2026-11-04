import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const O=path.dirname(fileURLToPath(import.meta.url));
const R=path.resolve(O,'../../..');
const I=path.join(path.dirname(O),'cone-asymptotic-complex-four-whole-forms-20261104-v1');
const req=createRequire(path.join(R,'app/package.json'));
const {chromium}=req('playwright');
const React=req('react');
const {renderToStaticMarkup}=req('react-dom/server');
const {default:Markdown}=await import(req.resolve('react-markdown'));
const {default:gfm}=await import(req.resolve('remark-gfm'));
const {default:math}=await import(req.resolve('remark-math'));
const {default:katex}=await import(req.resolve('rehype-katex'));
const css=await fs.readFile(req.resolve('katex/dist/katex.min.css'),'utf8');
const handoff=JSON.parse(await fs.readFile(path.join(I,'content-review-handoff.json')));
const fig=JSON.parse(await fs.readFile(path.join(I,'solution-figure-boundary.json')));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1180,height:900},deviceScaleFactor:1});
await page.route('**/*', async route=>{
 const u=new URL(route.request().url());
 if(u.pathname===fig.runtimeUrl) return route.fulfill({body:await fs.readFile(path.join(I,fig.sourcePng)),contentType:'image/png'});
 if(u.pathname.startsWith('/fonts/'))return route.fulfill({body:await fs.readFile(path.join(R,'app/node_modules/katex/dist',u.pathname)),contentType:'font/woff2'});
 return route.abort();
});
await fs.mkdir(path.join(O,'rendered'),{recursive:true});
const results=[];
for(const f of handoff.forms){
 const d=JSON.parse(await fs.readFile(path.join(I,f.goalId,'whole-form-content.draft.json')));
 for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn']){
  const s=d.examDataContent[field];
  const html=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},s));
  const doc=`<!doctype html><html><head><base href="https://review.invalid/"><meta charset="utf-8"><style>${css}</style><style>body{font:18px/1.48 Arial,sans-serif;color:#172033;margin:28px auto;max-width:1040px;padding:0 25px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aab4c4;padding:8px;text-align:left}.katex-display{overflow-x:auto;padding:5px 0}img{max-width:100%;height:auto}h1{font-size:27px}</style></head><body>${html}</body></html>`;
  await page.setContent(doc,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({math:document.querySelectorAll('.katex').length,errors:document.querySelectorAll('.katex-error').length,images:[...document.images].map(i=>({src:i.getAttribute('src'),complete:i.complete,width:i.naturalWidth,height:i.naturalHeight})),width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
  if(metrics.errors)throw new Error('Math error');
  if(metrics.images.some(i=>!i.complete||!i.width))throw new Error('Image failed');
  const filename=`${f.key}-${field}.png`;
  await page.screenshot({path:path.join(O,'rendered',filename),fullPage:true});
  await fs.writeFile(path.join(O,'rendered',filename.replace('.png','.html')),doc);
  results.push({goalId:f.goalId,field,sourceSha256:crypto.createHash('sha256').update(s).digest('hex'),screenshot:'rendered/'+filename,...metrics});
 }
}
await browser.close();
await fs.writeFile(path.join(O,'independent-rendering.json'),JSON.stringify({status:'LOCAL_BROWSER_RENDER_ONLY_PENDING_VISUAL_REVIEW',scope:'Exact frozen examDataContent fields; only local fixture supplies future solution PNG; no public asset write or host acceptance',results},null,2)+'\n');
console.log(JSON.stringify({fields:results.length,math:results.reduce((n,x)=>n+x.math,0),errors:results.reduce((n,x)=>n+x.errors,0),screenshots:results.length}));
