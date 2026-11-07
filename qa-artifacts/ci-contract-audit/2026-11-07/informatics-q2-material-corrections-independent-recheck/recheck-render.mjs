import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire}from'node:module';import {execFileSync}from'node:child_process';import crypto from'node:crypto';
const root='/home/enpasos/projects/skillpilot',out=path.dirname(new URL(import.meta.url).pathname),input=root+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-material-review-corrections';
const req=createRequire(root+'/app/package.json');const {build}=await import(req.resolve('esbuild'));const{chromium}=(await import(req.resolve('playwright'))).default;
const ram=fs.mkdtempSync('/dev/shm/info-recheck-render-');
try {
 const src=`import React from '${root}/app/node_modules/react/index.js';import{renderToStaticMarkup}from'${root}/app/node_modules/react-dom/server.node.js';import{GoalCard}from'${root}/app/src/components/GoalCard.tsx';import{LanguageProvider}from'${root}/app/src/contexts/LanguageContext.tsx';import fs from'node:fs';
 globalThis.localStorage={getItem:()=>null,setItem:()=>{throw Error('No storage writes');}};
 const data=JSON.parse(fs.readFileSync('${input}/native-examData.json','utf8'));const result={};
 for(const[id,exam]of Object.entries(data)){const display={...exam};delete display.reviewStatus;const goal={id,title:'Independent material rendering',type:'atomic',contains:[],requires:[],tags:[],weight:1,examData:display};result[id]=renderToStaticMarkup(<LanguageProvider><GoalCard goal={goal} masteryValue={1} showLearnerTools={false} readOnly/></LanguageProvider>);}
 fs.writeFileSync('${ram}/rendered.json',JSON.stringify(result));`;
 fs.writeFileSync(ram+'/entry.tsx',src);await build({entryPoints:[ram+'/entry.tsx'],outfile:ram+'/render.cjs',bundle:true,platform:'node',format:'cjs',nodePaths:[root+'/app/node_modules'],define:{'import.meta.env':'{}'},logLevel:'silent'});execFileSync(process.execPath,[ram+'/render.cjs']);
 const rendered=JSON.parse(fs.readFileSync(ram+'/rendered.json','utf8'));const cases=JSON.parse(fs.readFileSync(input+'/casebank.json','utf8'));const observations=[];const browser=await chromium.launch({headless:true});
 try {const page=await browser.newPage({viewport:{width:1050,height:800}});
 for(const[id,body]of Object.entries(rendered)){
  await page.setContent('<style>body{font:16px Arial;margin:20px;max-width:1000px}pre{background:#f1f5f9;padding:12px;overflow:auto}</style>'+body);
  const r=await page.evaluate(()=>{const sections={};for(const h of document.querySelectorAll('h2')){const m=h.textContent.match(/^(C-T07|C-T20) – Musterlösung/);if(!m)continue;let e=h.nextElementSibling,nodes=[];while(e&&e.tagName!=='H2'){nodes.push(e);e=e.nextElementSibling;}sections[m[1]]=nodes.flatMap(x=>[...x.querySelectorAll('code')]).map(c=>({text:c.textContent,whiteSpace:getComputedStyle(c.parentElement).whiteSpace}));}return{sections,forms:document.querySelectorAll('form').length,scripts:document.querySelectorAll('script').length,headings:[...document.querySelectorAll('h2')].map(x=>x.textContent)};});
  for(const[task,code]of Object.entries(r.sections)){const expected=cases[task].solution.split('```python\n')[1].split('\n```')[0]+'\n';if(code.length!==1||code[0].text!==expected||code[0].whiteSpace!=='pre')throw Error('Code mismatch '+id+' '+task);}
  if(r.forms||r.scripts)throw Error('Unexpected executable HTML');observations.push({examId:id,...r});
  if(id.startsWith('6ebc')){const h=page.getByRole('heading',{name:'C-T07 – Musterlösung',exact:true});await h.scrollIntoViewIfNeeded();await page.screenshot({path:out+'/independent-goalcard-code.png'});fs.writeFileSync(out+'/rendered-python.json',JSON.stringify(Object.fromEntries(Object.entries(r.sections).map(([k,v])=>[k,v[0].text])),null,2)+'\n');}
 }
 } finally{await browser.close();}
 const pins=Object.fromEntries(['app/src/components/GoalCard.tsx','app/src/contexts/LanguageContext.tsx'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));fs.writeFileSync(out+'/render-observations.json',JSON.stringify({method:'Independently bundled actual unmodified GoalCard + LanguageProvider; Chromium DOM from all five full assemblies',displayOnly:'In-memory clones omit draft guard and use synthetic mastery solely to display solution; no payload or learner state writes',componentPins:pins,observations},null,2)+'\n');console.log(JSON.stringify({fullAssemblies:observations.length,pythonOccurrences:observations.reduce((s,r)=>s+Object.keys(r.sections).length,0)}));
}finally{fs.rmSync(ram,{recursive:true,force:true});}
