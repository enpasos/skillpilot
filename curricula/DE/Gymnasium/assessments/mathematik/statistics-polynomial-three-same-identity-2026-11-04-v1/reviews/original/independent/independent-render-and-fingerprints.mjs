import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import assert from 'node:assert/strict';
const out=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(out,'../../..');
const pack=path.resolve(out,'../statistics-polynomial-transform-four-whole-forms-20261104-v1');
const req=createRequire(path.join(root,'app/package.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const load=async f=>JSON.parse(await readFile(f,'utf8'));
const ts=req('typescript');
const expected=await load(path.join(pack,'author-am-context-check.json'));
const rows=(await load(path.join(pack,'current-eight-registered-am-rows.json'))).rows;
const probes=await load(path.join(out,'independent-probes.json'));
const realFunctions=[];
await mkdir(path.join(out,'inputs'),{recursive:true});
for(const binding of expected.executedActualFingerprintSources){
 const source=await readFile(path.join(root,binding.path),'utf8');
 assert.equal(hash(source),binding.sha256,'Actual fingerprint source changed since freeze');
 await writeFile(path.join(out,'inputs',path.basename(binding.path)),source);
 const end=binding.lane==='semantic-atomicity'?'function isLeaf(':'function fingerprintMemoryCard(';
 const selected=source.slice(source.indexOf('function normalizeText('),source.indexOf(end));
 const compiled=ts.transpileModule(selected+'\nthis.fp=fingerprintGoal;',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const context={createHash};vm.createContext(context);vm.runInContext(compiled,context);
 const comparisons=[];
 for(const row of rows.filter(r=>r.lane===binding.lane)){
  const before=await load(path.join(pack,row.wholeCurrentRow.goalId,'current-whole-goal.json'));
  const after=await load(path.join(pack,row.wholeCurrentRow.goalId,'proposed-whole-goal.draft.json'));
  const current=context.fp(before,row.wholeCurrentRow.ruleVersion),candidate=context.fp(after,row.wholeCurrentRow.ruleVersion);
  const independently=probes.amOriginalAndConditionalFingerprints.find(r=>r.goalId===before.id&&r.lane===binding.lane);
  assert.equal(current,row.wholeCurrentRow.fingerprint);assert.equal(current,independently.originalFingerprint);assert.equal(candidate,independently.hypotheticalCandidateFingerprint);
  comparisons.push({goalId:before.id,originalFingerprint:current,candidateFingerprint:candidate,agreesWithIndependentPython:true});
 }
 realFunctions.push({lane:binding.lane,path:binding.path,sha256:hash(source),selectedSourceSha256:hash(selected),comparisons});
}
const {default:React}=await import(req.resolve('react'));
const {renderToStaticMarkup}=await import(req.resolve('react-dom/server'));
const {default:ReactMarkdown}=await import(req.resolve('react-markdown'));
const {default:remarkGfm}=await import(req.resolve('remark-gfm'));
const {default:remarkMath}=await import(req.resolve('remark-math'));
const {default:rehypeKatex}=await import(req.resolve('rehype-katex'));
const {chromium}=req('playwright');
const handoff=await load(path.join(pack,'content-review-handoff.json'));
const pages=new Map();const fields=[];
for(const form of handoff.forms){
 const goal=await load(path.join(pack,form.goalId,'proposed-whole-goal.draft.json'));
 let page='<!doctype html><html><meta charset="utf-8"><link rel="stylesheet" href="/katex.css"><style>body{max-width:900px;margin:auto;font:18px/1.5 sans-serif}img{width:780px;max-width:100%;height:auto}.katex-display{overflow:auto}</style>';
 for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn']){
  const source=goal.examData[field];
  const html=renderToStaticMarkup(React.createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:source}));
  const count=(html.match(/class="katex"/g)||[]).length;
  assert(!html.includes('class="katex-error"'));assert(count>0);
  fields.push({goalId:goal.id,field,sha256:hash(source),katexExpressions:count,errors:0});
  page+=`<section id="${field}">${html}</section>`;
 }
 pages.set('/'+goal.id,page+'</html>');
}
const pngUrl='/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png';
const png=await readFile(path.join(pack,'6a4716bd-8038-46bb-b647-0db4a254fee7/assets/polynomial-graph-v1.png'));
const cssPath=req.resolve('katex/dist/katex.min.css'),fontsDir=path.join(path.dirname(cssPath),'fonts');
const assetRequests=[];
const server=http.createServer(async(q,res)=>{
 try{
  const url=new URL(q.url,'http://127.0.0.1').pathname;
  if(pages.has(url)){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(pages.get(url));return;}
  if(url===pngUrl){res.setHeader('Content-Type','image/png');res.end(png);assetRequests.push({url,sha256:hash(png),bytes:png.length});return;}
  if(url==='/katex.css'){res.setHeader('Content-Type','text/css');res.end(await readFile(cssPath));return;}
  if(url.startsWith('/fonts/')&&!url.includes('..')){res.end(await readFile(path.join(fontsDir,path.basename(url))));return;}
  res.writeHead(404);res.end();
 }catch(e){res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const browserResults=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1100,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const form of handoff.forms){
  await page.goto(`http://127.0.0.1:${server.address().port}/${form.goalId}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const actual=await page.evaluate(()=>({sections:document.querySelectorAll('section').length,errors:document.querySelectorAll('.katex-error').length,images:[...document.images].map(i=>({complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,width:i.getBoundingClientRect().width}))}));
  assert.equal(actual.sections,4);assert.equal(actual.errors,0);
  for(const im of actual.images){assert(im.complete);assert.equal(im.naturalWidth,1280);assert(im.width>0);}
  browserResults.push({goalId:form.goalId,...actual});
  if(form.key==='graph-inference')await page.locator('#taskContent img').screenshot({path:path.join(out,'independent-graph-browser.png')});
 }
 assert.equal(errors.length,0);assert(assetRequests.length>=1);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
const report={status:'PASS_REVIEWER_EXECUTED_LOCAL_CHECKS',realFingerprintFunctionChecks:realFunctions,renderedFields:fields,fieldCount:fields.length,katexExpressions:fields.reduce((a,f)=>a+f.katexExpressions,0),browserResults,assetRequests,scope:'Local exact Markdown and PNG plus actual fingerprint functions. No provider acceptance, runtime role, registered ledger mutation, or deployment.'};
await writeFile(path.join(out,'independent-render-and-fingerprints.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',fields:report.fieldCount,katexExpressions:report.katexExpressions,actualAmComparisons:realFunctions.reduce((a,f)=>a+f.comparisons.length,0)}));
