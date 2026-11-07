// Uses the exact Markdown plugin combination from GoalCard.tsx; no app mutation.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root='/home/enpasos/projects/skillpilot';
const req=createRequire(root+'/app/package.json');
const React=(await import(req.resolve('react'))).default;
const {renderToStaticMarkup}=await import(req.resolve('react-dom/server'));
const Markdown=(await import(req.resolve('react-markdown'))).default;
const gfm=(await import(req.resolve('remark-gfm'))).default;
const math=(await import(req.resolve('remark-math'))).default;
const katex=(await import(req.resolve('rehype-katex'))).default;
const {chromium}=(await import(req.resolve('playwright'))).default;
const out=path.dirname(new URL(import.meta.url).pathname);
const material=root+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate/materials';
const exams=JSON.parse(fs.readFileSync(material+'/native-examData.json','utf8'));
const render=children=>renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},children));
const records=[];const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1000,height:800}});
for (const [id,e] of Object.entries(exams)) {
 const task=render(e.taskContent), solution=render(e.solutionContent);
 await page.setContent('<style>body{font-family:Arial;font-size:16px;max-width:900px;margin:24px}pre{white-space:pre-wrap}p{line-height:1.5}</style><main>'+task+solution+'</main>');
 const dom=await page.evaluate(()=>({h2:[...document.querySelectorAll('h2')].map(x=>x.textContent),scripts:document.querySelectorAll('script').length,forms:document.querySelectorAll('form').length,codeBlocks:document.querySelectorAll('pre code').length,bodyText:document.body.innerText}));
 const title=id.startsWith('269')?'Magazin <offen>':id.startsWith('ca2')?'Finale <offen>':'Archiv <offen>';
 records.push({examId:id,taskHeadings:dom.h2.filter(t=>!t.includes('Musterlösung')).length,codeBlocks:dom.codeBlocks,rawHtmlIsDisplayedAsText:dom.forms===0&&dom.scripts===0,angleTitleRetained:dom.bodyText.includes(title)});
 if(id.startsWith('6ebc')) {
  for (const task of ['C-T07','C-T20']) {
  const snippet=e.solutionContent.split('## '+task+' – Musterlösung')[1].split('\n## ')[0];
  await page.setContent('<style>body{font-family:Arial;font-size:16px;width:900px;margin:24px}p{line-height:1.5}</style><h2>'+task+' in the actual Markdown pipeline</h2>'+render(snippet));
  const observation=await page.evaluate(()=>({text:document.body.innerText,codeBlocks:document.querySelectorAll('pre code').length,paragraphs:[...document.querySelectorAll('p')].map(x=>x.innerText)}));
  records.push({case:task,...observation});
  if(task==='C-T07')await page.screenshot({path:out+'/c-t07-render.png',fullPage:true});
  }
 }
}
await browser.close();fs.writeFileSync(out+'/render-observations.json',JSON.stringify({method:'ReactMarkdown + remarkGfm + remarkMath + rehypeKatex; Chromium; material unmodified',records,limits:'Exact Markdown pipeline with minimal readability CSS, not mounted GoalCard or whole application/host acceptance.'},null,2)+'\n');
console.log(JSON.stringify(records.map(x=>x.case?{case:x.case,codeBlocks:x.codeBlocks,paragraph:x.paragraphs[0]}:x),null,2));
