// Render the unmodified actual GoalCard through its real ReactMarkdown pipeline.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root='/home/enpasos/projects/skillpilot';
const req=createRequire(root+'/app/package.json');
const out=path.dirname(new URL(import.meta.url).pathname);
const {build}=await import(req.resolve('esbuild'));
const {chromium}=(await import(req.resolve('playwright'))).default;
const entry=`
import React from '${root}/app/node_modules/react/index.js';
import {renderToStaticMarkup} from '${root}/app/node_modules/react-dom/server.node.js';
import {GoalCard} from '${root}/app/src/components/GoalCard.tsx';
import {LanguageProvider} from '${root}/app/src/contexts/LanguageContext.tsx';
import fs from 'node:fs';
globalThis.localStorage={getItem:()=>null,setItem:()=>{throw new Error('SSR probe must not write storage')}};
const exams=JSON.parse(fs.readFileSync(${JSON.stringify(out+'/native-examData.json')},'utf8'));
const cases=JSON.parse(fs.readFileSync(${JSON.stringify(out+'/casebank.json')},'utf8'));
function render(id,data){
 // Presentation clone ONLY: omit draft status to exercise GoalCard's existing display guard.
 // The pinned material file and all real outcomes stay draft/unmodified.
 const preview={...data};delete preview.reviewStatus;
 const goal={id,title:id,type:'atomic',contains:[],requires:[],tags:[],weight:1,examData:preview};
 return renderToStaticMarkup(<LanguageProvider><GoalCard goal={goal} masteryValue={1} showLearnerTools={false} readOnly /></LanguageProvider>);
}
const full=Object.fromEntries(Object.entries(exams).map(([id,data])=>[id,render(id,data)]));
const snippets=Object.fromEntries(['C-T07','C-T20'].map(id=>[id,render(id,{taskContent:'Lokale Darstellungsprobe',solutionContent:cases[id].solution})]));
fs.writeFileSync(${JSON.stringify(out+'/goalcard-ssr-ram.json')},JSON.stringify({full,snippets}));
`;
const entryPath=out+'/goalcard-probe-entry.tsx';fs.writeFileSync(entryPath,entry);
await build({entryPoints:[entryPath],outfile:out+'/goalcard-probe.cjs',platform:'node',format:'cjs',bundle:true,nodePaths:[root+'/app/node_modules'],define:{'import.meta.env':'{}'},logLevel:'silent'});
execFileSync(process.execPath,[out+'/goalcard-probe.cjs'],{encoding:'utf8'});
const ssr=JSON.parse(fs.readFileSync(out+'/goalcard-ssr-ram.json','utf8'));
const cases=JSON.parse(fs.readFileSync(out+'/casebank.json','utf8'));
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1100,height:900}});const observations=[];
for(const [caseId,html]of Object.entries(ssr.snippets)){
 await page.setContent('<style>body{font-family:Arial,sans-serif;font-size:16px;margin:24px;max-width:1000px}pre{overflow:auto;background:#f1f5f9;padding:16px}p{line-height:1.5}</style>'+html);
 const observation=await page.evaluate(()=>({code:[...document.querySelectorAll('pre code')].map(c=>({text:c.textContent,language:c.className,whiteSpace:getComputedStyle(c.parentElement).whiteSpace})),paragraphs:[...document.querySelectorAll('p')].map(p=>p.textContent),bodyText:document.body.innerText}));
 const expected=cases[caseId].solution.split('```python\n')[1].split('\n```')[0]+'\n';
 if(observation.code.length!==1||observation.code[0].text!==expected)throw new Error('Code/indentation mismatch '+caseId);
 if(!['pre','pre-wrap','break-spaces'].includes(observation.code[0].whiteSpace))throw new Error('Whitespace collapsed '+caseId);
 if(observation.code[0].text.includes(caseId==='C-T07'?'Bei30:':'execute bindet'))throw new Error('Prose entered code '+caseId);
 observations.push({caseId,...observation,exactCodeAndIndentation:true});
 await page.screenshot({path:out+'/'+caseId.toLowerCase()+'-goalcard.png',fullPage:true});
}
for(const [examId,html]of Object.entries(ssr.full)){
 await page.setContent(html);
 const full=await page.evaluate(()=>({codeBlocks:document.querySelectorAll('pre code').length,scripts:document.querySelectorAll('script').length,forms:document.querySelectorAll('form').length,bodyText:document.body.innerText}));
 if(full.scripts||full.forms)throw new Error('Unescaped raw HTML in '+examId);
 observations.push({examId,codeBlocks:full.codeBlocks,rawHtmlRemainsText:true});
}
await browser.close();
const hashes=Object.fromEntries(['app/src/components/GoalCard.tsx','app/src/contexts/LanguageContext.tsx','app/src/hooks/useRuntimeCurriculumCatalog.ts'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
fs.writeFileSync(out+'/render-checks.json',JSON.stringify({method:'Actual unmodified GoalCard + LanguageProvider rendered via React SSR,then Chromium DOM and visual probe;real GoalCard Markdown dependencies bundled from repository',displayGuard:'Only isolated in-memory presentation clones omit reviewStatus to exercise existing render guard;all pinned inputs stay draft;synthetic mastery prop is a renderer probe,not a learner result',componentHashes:hashes,observations,limits:'Not a running full application,production service,learner attempt or client-host acceptance.'},null,2)+'\n');
console.log(JSON.stringify({status:'pass',actualGoalCard:true,exactPythonSnippets:2,fullAssemblies:5}));
