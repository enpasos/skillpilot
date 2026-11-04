import{createRequire}from'node:module';import{resolve,dirname}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const H=dirname(fileURLToPath(import.meta.url));const req=createRequire(resolve('app/package.json'));const React=req('react');const{renderToStaticMarkup}=req('react-dom/server');
const{default:Markdown}=await import(pathToFileURL(req.resolve('react-markdown')));const{default:gfm}=await import(pathToFileURL(req.resolve('remark-gfm')));const{default:math}=await import(pathToFileURL(req.resolve('remark-math')));const{default:katex}=await import(pathToFileURL(req.resolve('rehype-katex')));const{chromium}=req('playwright');
const browser=await chromium.launch({headless:true});const rows=[];
for(const lang of['de','en']){
 const task=readFileSync(resolve(H,'d668c22d-caeb-5e91-8980-721c931a2bcf',`task.${lang}.md`),'utf8');const expected=task.match(/```text\n([\s\S]*?)```/)[1];
 const markup=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},task));assert(markup.includes('<pre><code class="language-text">'));
 const html='<!doctype html><html lang="'+lang+'"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:16px;font:14px/1.5 system-ui;color:#172435;max-width:880px}pre{font:14px/1.5 ui-monospace,monospace;white-space:pre;background:#f1f5f9;padding:12px;overflow:auto;border:1px solid #cbd5e1;border-radius:6px}h1{font-size:22px}p{margin:12px 0}strong{font-weight:700}</style>'+markup+'</html>';
 writeFileSync(resolve(H,`diagram-render.${lang}.html`),html);
 for(const width of[360,960]){
  const page=await browser.newPage({viewport:{width,height:1100}});await page.setContent(html);
  const facts=await page.locator('pre').evaluate(e=>({text:e.textContent,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,whiteSpace:getComputedStyle(e).whiteSpace,fontFamily:getComputedStyle(e).fontFamily}));assert.equal(facts.text,expected);assert.equal(facts.whiteSpace,'pre');assert(facts.scrollWidth<=facts.clientWidth,'diagram overflow');
  const image=`diagram-render.${lang}.${width}.png`;await page.locator('pre').screenshot({path:resolve(H,image)});rows.push({language:lang,viewportWidth:width,embeddedTaskDiagramTextPreserved:true,...facts,screenshot:image});await page.close();
 }
}
await browser.close();
writeFileSync(resolve(H,'author-embedded-diagram-render-check.json'),JSON.stringify({status:'LOCAL_MARKDOWN_RENDER_CHECK_PASS_NOT_REAL_HOST_ACCEPTANCE',actualAppReader:'app/src/components/GoalCard.tsx',actualAppReaderSha256:createHash('sha256').update(readFileSync('app/src/components/GoalCard.tsx')).digest('hex'),pipeline:'Same ReactMarkdown + remarkGfm + remarkMath + rehypeKatex used by current GoalCard exam task renderer; minimal readable monospace fixture, no application or runtime changes.',diagramIsInActualTaskStrings:true,noExternalAssetOrImageDependency:true,rows},null,2)+'\n');console.log(JSON.stringify({status:'PASS',actualEmbeddedDiagramsRendered:rows.length,widths:[360,960]}));
