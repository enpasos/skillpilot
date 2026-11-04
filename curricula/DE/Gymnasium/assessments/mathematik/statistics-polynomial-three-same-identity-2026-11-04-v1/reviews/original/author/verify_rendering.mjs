// Exact proposed fields through the application's real Markdown/math stack;
// a bounded local Chromium fixture also loads the real task image URL.
import {createRequire}from'node:module';
import {readFile,writeFile,mkdir}from'node:fs/promises';
import {fileURLToPath}from'node:url';
import path from'node:path';
import crypto from'node:crypto';
import http from'node:http';
import assert from'node:assert/strict';
const H=path.dirname(fileURLToPath(import.meta.url)),R=path.resolve(H,'../../..');
const req=createRequire(path.join(R,'app/package.json'));
const {default:React}=await import(req.resolve('react'));
const {renderToStaticMarkup}=await import(req.resolve('react-dom/server'));
const {default:ReactMarkdown}=await import(req.resolve('react-markdown'));
const {default:remarkGfm}=await import(req.resolve('remark-gfm'));
const {default:remarkMath}=await import(req.resolve('remark-math'));
const {default:rehypeKatex}=await import(req.resolve('rehype-katex'));
const {chromium}=req('playwright');
const pack=JSON.parse(await readFile(path.join(H,'author-package.json'),'utf8'));
const graph=JSON.parse(await readFile(path.join(H,'task-graph-delivery-proposal.json'),'utf8'));
const rows=[],htmlPaths=[];await mkdir(path.join(H,'public/previews'),{recursive:true});
for(const form of pack.forms){
 const id=form.goalId,g=JSON.parse(await readFile(path.join(H,id,'proposed-whole-goal.draft.json'),'utf8')),sections=[];
 for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn']){
  const source=g.examData[field],rendered=renderToStaticMarkup(React.createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:source}));
  const errors=[...rendered.matchAll(/class="katex-error"/g)].length,maths=[...rendered.matchAll(/class="katex"/g)].length;
  assert.equal(errors,0,`${id}/${field}`);assert(maths>0,`${id}/${field} lacks math`);
  if(id===graph.goalId&&field.startsWith('task'))assert(rendered.includes(`src="${graph.runtimeUrl}"`));
  rows.push({goalId:id,field,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),katexExpressions:maths,katexErrors:errors,markdownImageCount:[...rendered.matchAll(/<img /g)].length});
  sections.push(`<section id="${field}"><h2>${field}</h2>${rendered}</section>`);
 }
 const rel=`previews/${id}.html`;htmlPaths.push({goalId:id,url:'/'+rel});
 await writeFile(path.join(H,'public',rel),`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${g.title}</title><link rel="stylesheet" href="/_katex/katex.min.css"><style>body{font:17px/1.55 system-ui;max-width:920px;margin:2rem auto;padding:0 1rem;color:#172033}section{border-top:2px solid #cad3e3;margin-top:3rem;padding-top:1rem}.katex-display{overflow-x:auto;padding:.5rem 0}table{border-collapse:collapse}td,th{border:1px solid #b7c1d0;padding:.5rem;vertical-align:top}img{display:block;max-width:100%;height:auto;width:780px}h1{font-size:1.8rem}</style><body><h1>${g.title}</h1>${sections.join('\n')}</body></html>\n`);
}
const katexDir=path.dirname(req.resolve('katex/dist/katex.min.css'));
const requests=[];
const server=http.createServer(async(q,res)=>{
 try{
  const url=new URL(q.url,'http://127.0.0.1').pathname;
  let base=url.startsWith('/_katex/')?katexDir:path.join(H,'public'),relative=url.startsWith('/_katex/')?url.slice('/_katex/'.length):url.slice(1);
  let file=path.resolve(base,relative);assert(file.startsWith(base+path.sep));
  const bytes=await readFile(file),ext=path.extname(file),mime={'.png':'image/png','.html':'text/html; charset=utf-8','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'}[ext]??'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime});res.end(bytes);
  if(url===graph.runtimeUrl)requests.push({runtimeUrl:url,status:200,mime,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }catch(e){res.writeHead(404);res.end('missing');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const browserRows=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1100,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const view of htmlPaths){
  await page.goto(`http://127.0.0.1:${server.address().port}${view.url}`,{waitUntil:'networkidle'});
  const actual=await page.evaluate(async()=>{await document.fonts.ready;return {sections:document.querySelectorAll('section').length,katexErrors:document.querySelectorAll('.katex-error').length,images:[...document.images].map(i=>({src:new URL(i.src).pathname,complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,renderWidth:i.getBoundingClientRect().width,renderHeight:i.getBoundingClientRect().height}))};});
  assert.equal(actual.sections,4);assert.equal(actual.katexErrors,0);
  for(const img of actual.images){assert(img.complete&&img.naturalWidth===1280&&img.renderWidth>0);assert.equal(img.src,graph.runtimeUrl);}
  browserRows.push({goalId:view.goalId,...actual});
  if(view.goalId===graph.goalId){
   await page.locator('#taskContent img').screenshot({path:path.join(H,graph.goalId,'task-image.actual-browser.png')});
   await page.locator('#taskContent').screenshot({path:path.join(H,graph.goalId,'task-de.actual-browser.png')});
  }
 }
 assert.equal(errors.length,0);assert.equal(requests.length,1); // browser cache may reuse the image for both languages
 assert.equal(requests[0].sha256,graph.pngSha256);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
const report={status:'PASS_LOCAL_ACTUAL_MARKDOWN_KATEX_AND_CHROMIUM_IMAGE_FIXTURE_NOT_HOST_ACCEPTANCE',fields:rows,fieldCount:rows.length,katexExpressionCount:rows.reduce((n,r)=>n+r.katexExpressions,0),katexErrorCount:0,browserRows,actualLocalImageRequests:requests,imageAssetIsInsideTask:true,renderer:'Actual ReactMarkdown + remarkGfm + remarkMath + rehypeKatex; local Chromium, no application/runtime changes',limits:'Private fixture verifies exact Markdown and image bytes load at the authored URL. Production deployment, integrated backend cockpit and provider host acceptance remain separate.'};
await writeFile(path.join(H,'author-rendering-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS_LOCAL_RENDERING',fields:rows.length,katexExpressions:report.katexExpressionCount,katexErrors:0,localImageRequests:requests.length}));
