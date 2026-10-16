// SPDX-License-Identifier: Apache-2.0
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
let repo=__dirname;while(!fs.existsSync(path.join(repo,'AGENTS.md'))){const parent=path.dirname(repo);if(parent===repo)throw new Error('repository marker not found');repo=parent;}
const {chromium}=require(path.join(repo,'app/node_modules/playwright'));
const evidence = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-carbonyl-two-final-context-independent-V-20261015-v1';
const out = path.join(repo, evidence, 'browser');
if(fs.existsSync(path.join(repo,evidence,'FIRST.actual-two-final-V-decisions.seal.json')))throw new Error('Review evidence is sealed; use a separate private reproduction copy.');
fs.mkdirSync(out, {recursive:true});
const sources = {"f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528.original": "curricula/DE/Gymnasium/visualizations/chemie/f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528/f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528.jpg", "f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528.final": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1/candidate/visualizations/chemie/f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528/f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528.png", "6d3a2bad-8c67-5964-a720-375f138adaba.original": "curricula/DE/Gymnasium/visualizations/chemie/6d3a2bad-8c67-5964-a720-375f138adaba/6d3a2bad-8c67-5964-a720-375f138adaba.jpg", "6d3a2bad-8c67-5964-a720-375f138adaba.final": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1/candidate/visualizations/chemie/6d3a2bad-8c67-5964-a720-375f138adaba/6d3a2bad-8c67-5964-a720-375f138adaba.png"};
const goals = {"f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528": {"title": "Schmerzmittelwirkstoffe chemisch einordnen", "description": "Die lernende Person kann Zusammensetzung, Konsum und Anwendung frei verkäuflicher Schmerzmittel recherchieren, Wirkstoff-Moleküle wie Acetylsalicylsäure, Ibuprofen und Paracetamol anhand chemischer Strukturmerkmale einordnen und die Anwendung der Schmerzmittel anhand der recherchierten Informationen zur Chemie der Wirkstoffe bewerten.", "altText": "Als ein Beispiel steht links die Acetylsalicylsäure (ASS) mit einem Benzolring und zwei benachbarten Substituenten. Die direkt am Ring gebundene Carboxylgruppe ist als Carbonsäure markiert; die Gruppe Ring–O–C(=O)–CH₃ als Ester. Rechts stehen ein Quellenbuch mit Lupe und eine Waage mit den gleichwertigen Schalen Nutzen und Risiken. Recherche und chemische Einordnung unterstützen das Abwägen; Informationen sind kein eigener Waagengegenpol. Das Bild zeigt weder alle Schmerzmittel noch eine klinische Empfehlung; Wirkungen und Risiken lassen sich nicht allein aus einer einzelnen funktionellen Gruppe bestimmen."}, "6d3a2bad-8c67-5964-a720-375f138adaba": {"title": "Carbonylreaktivität bewerten", "description": "Die lernende Person kann die unterschiedliche Reaktivität vergleichbarer Aldehyde und Ketone bei der nucleophilen Addition unter gleichen Reaktionsbedingungen anhand elektronischer und sterischer Einflüsse mechanistisch begründen.", "altText": "Zwei große Formeln zeigen Ethanal CH₃–C(=O)–H und Propanon CH₃–C(=O)–CH₃. Bei beiden weist ein blauer Nu⁻-Angriffspfeil zum Carbonyl-C. „Gleiche Bedingungen“ begrenzt den Vergleich; links stehen weniger +I und weniger Abschirmung, rechts mehr +I und mehr Abschirmung. „Tendenz, keine Immer-Regel“ schließt eine universelle Rangfolge aller Aldehyde und Ketone aus. Die Pfeile zeigen schematisch die Angriffsrichtung, keine vollständige Elektronenpaar- oder Produktdarstellung."}};
const hash = b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const bindings={};for(const [name,p] of Object.entries(sources)){const b=fs.readFileSync(path.join(repo,p));bindings[name]={path:p,sha256:hash(b),bytes:b.length};}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const records=[];
 for(const width of [360,680]){
  for(const [source,rel] of Object.entries(sources)){
   for(const layout of ['exact-image-width','GoalCard-p5-viewport']){
    const exact=layout==='exact-image-width'; const goal=goals[source.split('.')[0]];
    const page=await browser.newPage({viewport:{width:exact?width+2:width,height:800},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('http://image-review.local/asset',route=>route.fulfill({status:200,contentType:rel.endsWith('.png')?'image/png':'image/jpeg',body:fs.readFileSync(path.join(repo,rel))}));
    const html=`<!doctype html><html lang="de"><meta charset="utf-8"><style>
      *{box-sizing:border-box} html{font-size:16px;background:white} body{margin:0;font-family:Arial,sans-serif}
      .card{width:100%;border:1px solid #cbd5e1;border-radius:24px;padding:20px;background:#fff}
      h2{font-size:24px;line-height:1.25;margin:0;font-weight:600}
      figure{margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff}
      img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}
      .exact{width:${width+2}px} .exact figure{margin:0}
      </style><body><main class="${exact?'exact':'card'}">${exact?'':`<h2>${goal.title}</h2>`}<figure><img src="http://image-review.local/asset" alt="${goal.altText}"></figure>${exact?'':`<p>${goal.description}</p>`}</main></body></html>`;
    const fixtureName=`${source}.${width}.${layout}.html`;fs.writeFileSync(path.join(out,fixtureName),html+'\n');
    await page.setContent(html);await page.locator('img').evaluate(img=>img.decode());
    const metrics=await page.locator('img').evaluate(img=>{
      const b=img.getBoundingClientRect(),s=getComputedStyle(img);
      return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,elementWidth:b.width,elementHeight:b.height,objectFit:s.objectFit,maxHeight:s.maxHeight,height:s.height,complete:img.complete};
    });
    const screenshotName=`${source}.${width}.${layout}.png`;
    await page.locator('main').screenshot({path:path.join(out,screenshotName),animations:'disabled'});
    const raw=fs.readFileSync(path.join(out,screenshotName));
    records.push({source,requestedCSSWidth:width,layout,viewport:page.viewportSize(),metrics,screenshot:{path:`${evidence}/browser/${screenshotName}`,bytes:raw.length,sha256:hash(raw)},fixture:{path:`${evidence}/browser/${fixtureName}`,sha256:hash(Buffer.from(html+'\n'))},pageErrors:errors});
    await page.close();
   }
  }
 }
 const result={schemaVersion:1,role:'Independent actual Chromium rendering of both originals and final PNGs in bounded final text/ALT context; faithful GoalCard CSS fragment, not full app acceptance',observedAtUTC:new Date().toISOString(),browserVersion:browser.version(),deviceScaleFactor:1,zoom:1,sourceBindings:bindings,goalCardSourcePath:'app/src/components/GoalCard.tsx',goalCardImageClass:'block h-auto max-h-[28rem] w-full object-contain',goalCardContainerClass:'border rounded-3xl p-5',records,newVBindings:0,humanApproval:false,humanTrial:false};
 fs.writeFileSync(path.join(out,'RECEIPT.actual-Chromium-responsive-rendering.json'),JSON.stringify(result,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({browserVersion:result.browserVersion,records:records.map(r=>({source:r.source,width:r.requestedCSSWidth,layout:r.layout,metrics:r.metrics,screenshot:r.screenshot.path}))},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
