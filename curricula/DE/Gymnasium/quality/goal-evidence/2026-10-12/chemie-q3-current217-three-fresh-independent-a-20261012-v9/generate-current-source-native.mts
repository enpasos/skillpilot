import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const repo=process.cwd();
const out=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-current217-three-fresh-independent-a-20261012-v9');
const prep=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9');
const {buildGoalDescriptionRolloutSubsetModel}=await import(pathToFileURL(resolve(repo,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
const {parseAndValidateGoalBookModel}=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href);
const {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest}=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookRenderer.ts')).href);
const base=parseAndValidateGoalBookModel(JSON.parse(await readFile(resolve(prep,'native/current382.source-review.normal-model.json'),'utf8')));
const selected=new Set(['81373fb7-2a4a-5b2c-acd0-b4e775acaa65','8be14f15-2258-58e6-ae4e-38953f5d0570','c8844ac6-c414-5a0e-9fcd-7d0a82177d09','f0939f88-a6af-5334-ac4d-5d54732af25a','fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef','6966df95-f125-5ecc-af8e-0442545d9f17']);
const goalIds=base.pages.filter(p=>selected.has(p.goalId)).map(p=>p.goalId);
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base,goalIds,bookId:'chemie-q3-current217-independent-a-source-context-six-v9',title:'Chemie – aktueller Quellenkontext der drei Ziele und drei Nachbarziele'});
await writeFile(resolve(out,'native/current-source-six.normal-subset-model.json'),JSON.stringify(model,null,2)+'\n');
for(const p of model.pages){if(!p.visualization)continue;const relative='.'+p.visualization.url;let source=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-live-context-author-20261012-v7/native-public',relative);try{await access(source);}catch{source=resolve(repo,'app/public',relative);}const target=resolve(out,'native-public',relative);await mkdir(resolve(target,'..'),{recursive:true});await copyFile(source,target);}
const options={feedbackBaseUrl:'https://skillpilot.com/lernziel-feedback',publicRoot:resolve(out,'native-public')};
for(const [ext,writer] of [['html',writeGoalBookHtml],['pdf',writeGoalBookPdf]]){const p=resolve(out,'native/current-source-six.book.'+ext);const m=await writer(model,p,options);await writeGoalBookRenderManifest(m,p+'.render-manifest.json');}
const {chromium}=await import(pathToFileURL(resolve(repo,'app/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:1300},deviceScaleFactor:1});
await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='goal-review.invalid')return route.abort();if(url.pathname==='/book.html')return route.fulfill({body:await readFile(resolve(out,'native/current-source-six.book.html')),contentType:'text/html'});if(url.pathname.startsWith('/assets/goal-visualizations/'))return route.fulfill({body:await readFile(resolve(options.publicRoot,'.'+url.pathname)),contentType:url.pathname.endsWith('.jpg')?'image/jpeg':'image/png'});return route.abort();});
await page.goto('https://goal-review.invalid/book.html');await page.evaluate(()=>document.fonts.ready);for(const id of goalIds){const el=page.locator('#goal-'+id);await el.screenshot({path:resolve(out,'native/'+id+'.current-source-native-html.png')});}await browser.close();
console.log(JSON.stringify({normalModelParsed:true,normalSubsetBuilt:true,normalHtmlAndPdfRendered:true,goalIds,subsetDigest:model.digest}));
