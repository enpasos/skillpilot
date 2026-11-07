import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {summeAnfragen,neuerPlan} from '../informatics-e-minimal-material-design/materials/code-solution.mjs';
const own=fileURLToPath(new URL('.',import.meta.url));
const base=fileURLToPath(new URL('../informatics-e-minimal-material-design/',import.meta.url));
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const inventory=JSON.parse(readFileSync(base+'inventory.json'));
for(const f of inventory.files){assert.equal(digest(base+f.path),f.sha256);assert.equal(readFileSync(base+f.path).length,f.bytes);}
assert.equal(digest(base+'design-receipt.json'),'bb752c90759b2c7dd56b243e97ff895e5f450896ecd058cd09d4be8fa50ebca8');
assert.equal(digest(base+'inventory.json'),'da0abc2ff42044b23e6757aafe9dc4fe2948800f2fe591501febf699d2e34c19');
const result={kind:'Independent bounded material counterprobes; neither full CQR nor host/learner acceptance',materialReceipt:digest(base+'design-receipt.json'),inventoryFilesRehashed:inventory.files.length,freshCases:[],sequence:[],purity:[],browser:{}};
const cases=[['2, ',null], [',2',null], ['2,NaN',null], ['2,1e999',null], ['6,x',null], ['2,3,0',null], ['2e0,0b10',4], ['+2,02',4], ['3,1',4], ['0b10,0o1',3]];
for(const [input,sum] of cases){
 const p=neuerPlan(),actual=p.buche(input),expected=sum===null?'Ungültige Eingabe.':`Gebucht: ${sum}; frei: ${4-sum}`;
 assert.equal(actual,expected);assert.equal(p.belegt,sum===null?2:2+sum);assert.equal(typeof p.belegt,'number');assert.equal(summeAnfragen(input),sum);
 result.freshCases.push({input,expected,actual,end:p.belegt,pass:true});
}
const p=neuerPlan();
for(const [input,expected,end] of [['2','Gebucht: 2; frei: 2',4],['1,x','Ungültige Eingabe.',4],['1,2','Nicht genug Plätze.',4],['2','Gebucht: 2; frei: 0',6],['1','Nicht genug Plätze.',6]]){
 const initial=p.belegt,actual=p.buche(input);assert.equal(actual,expected);assert.equal(p.belegt,end);result.sequence.push({input,initial,expected,actual,end,pass:true});
}
for(const input of ['1,1','2,x']){const before=JSON.stringify(p),actual=summeAnfragen(input);assert.equal(JSON.stringify(p),before);result.purity.push({input,actual,stateUnchanged:true});}
const require=createRequire('/home/enpasos/projects/skillpilot/app/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:800,height:700}});
 const html=readFileSync(base+'materials/web-solution.html','utf8').replace('<link rel="stylesheet" href="web-solution.css">',`<style>${readFileSync(base+'materials/web-solution.css','utf8')}</style>`);
 await page.setContent(html);
 result.browser.geometry=await page.locator('main').evaluate(el=>({computedWidth:getComputedStyle(el).width,borderBoxWidth:el.getBoundingClientRect().width,paddingLeft:getComputedStyle(el).paddingLeft,paddingRight:getComputedStyle(el).paddingRight,boxSizing:getComputedStyle(el).boxSizing}));
 assert.equal(result.browser.geometry.computedWidth,'576px');assert.equal(result.browser.geometry.borderBoxWidth,608);
 await page.locator('#person').fill('Mia & Co');await page.locator('#termin').selectOption('fr');
 result.browser.serialization=await page.locator('form').evaluate(el=>({entries:[...new FormData(el).entries()],body:new URLSearchParams(new FormData(el)).toString(),labelMatch:el.querySelector('label').control===el.querySelector('input'),columns:getComputedStyle(el).gridTemplateColumns}));
 assert.equal(result.browser.serialization.body,'name=Mia+%26+Co&termin=fr');assert.equal(result.browser.serialization.labelMatch,true);
 result.browser.limits='One 800x700 local setContent check; submission/GUI execution evidence reused only from author receipt; no viewport, host or learner claim.';
}finally{await browser.close();}
writeFileSync(own+'independent-probe-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({inventoryFilesRehashed:result.inventoryFilesRehashed,freshCases:result.freshCases.length,sequentialCalls:result.sequence.length,pureFunctionCases:result.purity.length,geometry:result.browser.geometry,serialization:result.browser.serialization.body}));
