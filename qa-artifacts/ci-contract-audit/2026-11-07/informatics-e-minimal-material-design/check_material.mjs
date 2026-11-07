import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {summeAnfragen,neuerPlan} from './materials/code-solution.mjs';
import {neuerPlan as broken} from './materials/code-broken.mjs';
const P=fileURLToPath(new URL('.',import.meta.url));
const result={kind:'Author material consistency and actual local execution; not independent subject approval',normal:[],counterexamples:[],trace:[],browser:{}};
const tests=[
 ['2,1','Gebucht: 3; frei: 1',5],['4','Gebucht: 4; frei: 0',6],['5','Nicht genug Plätze.',2],
 ['1','Gebucht: 1; frei: 3',3],['6','Nicht genug Plätze.',2],['2,3','Nicht genug Plätze.',2],
 ['2,x','Ungültige Eingabe.',2],['2,,1','Ungültige Eingabe.',2],['','Ungültige Eingabe.',2],
 ['   ','Ungültige Eingabe.',2],['0','Ungültige Eingabe.',2],['7','Ungültige Eingabe.',2],
 ['1.5','Ungültige Eingabe.',2],['Infinity','Ungültige Eingabe.',2],[' 2 , 1 ','Gebucht: 3; frei: 1',5],
 ['2e0','Gebucht: 2; frei: 2',4],['0x2','Gebucht: 2; frei: 2',4],['-1','Ungültige Eingabe.',2]];
for(const [input,output,end] of tests){
 const p=neuerPlan(); const actual=p.buche(input);
 assert.equal(actual,output);assert.equal(p.belegt,end);assert.equal(typeof p.belegt,'number');
 result.normal.push({initial:2,input,expected:{output,end},actual:{output:actual,end:p.belegt},pass:true});
}
const sequential=neuerPlan();
for(const [input,expected,end] of [['2,1','Gebucht: 3; frei: 1',5],['1','Gebucht: 1; frei: 0',6],['1','Nicht genug Plätze.',6]]){
 const initial=sequential.belegt,actual=sequential.buche(input);assert.equal(actual,expected);assert.equal(sequential.belegt,end);
 result.normal.push({kind:'sequential',initial,input,expected:{output:expected,end},actual:{output:actual,end:sequential.belegt},pass:true});
}
for(const input of ['2,1','4','2']){
 const b=broken(),f=neuerPlan();const before=b.buche(input),after=f.buche(input);
 assert(before!==after||b.belegt!==f.belegt);
 result.counterexamples.push({kind:'actual-original-code',input,before:{output:before,state:b.belegt,type:typeof b.belegt},after:{output:after,state:f.belegt,type:typeof f.belegt}});
}
let summe=0;for(const teil of '2,1'.split(',')){const n=Number(teil);summe=summe+teil;result.trace.push({teil,n,summe,type:typeof summe});}
assert.deepEqual(result.trace.map(x=>x.summe),['02','021']);
const source=readFileSync(P+'materials/code-solution.mjs','utf8');
for(const [name,from,to,input] of [
 ['string-addition','summe += n;','summe += teil;','2,1'],
 ['boundary','summe > this.kapazitaet','summe >= this.kapazitaet','4'],
 ['state-overwrite','this.belegt += summe;','this.belegt = summe;','2']]){
 assert(source.includes(from));const mod=await import('data:text/javascript;base64,'+Buffer.from(source.replace(from,to)).toString('base64'));
 const p=mod.neuerPlan(),actual=p.buche(input),f=neuerPlan(),expected=f.buche(input);
 assert(actual!==expected||p.belegt!==f.belegt||typeof p.belegt!=='number');
 result.counterexamples.push({kind:'isolated-code-mutant',name,input,actual,state:p.belegt,rejected:true});
}
assert.equal(summeAnfragen('2,1'),3);assert.equal(summeAnfragen('2,,1'),null);
const require=createRequire('/home/enpasos/projects/skillpilot/app/package.json');
const {chromium}=require('playwright');let received=null;
const server=createServer(async(req,res)=>{
 if(req.method==='POST'&&req.url==='/anmeldung'){
  let body='';for await(const b of req)body+=b;received={method:req.method,contentType:req.headers['content-type'],body};
  res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('Anfrage empfangen');return;
 }
 const key=req.url?.slice(1);
 if(!['web-solution.html','web-solution.css','code-solution.html','code-solution.mjs'].includes(key)){res.writeHead(404);res.end();return;}
 const mime=key.endsWith('.css')?'text/css':key.endsWith('.mjs')?'text/javascript':'text/html';
 res.writeHead(200,{'Content-Type':mime+'; charset=utf-8'});res.end(readFileSync(P+'materials/'+key));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:800,height:700}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/web-solution.html');
 await page.locator('#person').fill('Lea');await page.locator('#termin').selectOption('fr');
 const form=await page.locator('form').evaluate(el=>({method:el.method,entries:[...new FormData(el).entries()],display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns,children:[...el.children].map(c=>c.tagName)}));
 assert.equal(form.method,'post');assert.deepEqual(form.entries,[['name','Lea'],['termin','fr']]);assert.equal(form.display,'grid');assert.equal(form.columns.trim().split(/\s+/).length,1);
 await Promise.all([page.waitForURL(base+'/anmeldung'),page.locator('button').click()]);
 assert.deepEqual(received,{method:'POST',contentType:'application/x-www-form-urlencoded',body:'name=Lea&termin=fr'});
 result.browser.form={form,actualRequest:received,pass:true};
 const ui=[];await page.goto(base+'/code-solution.html');
 for(const [input,expected] of [['2,1','Gebucht: 3; frei: 1'],['1','Gebucht: 1; frei: 0'],['1','Nicht genug Plätze.'],['','Ungültige Eingabe.']]){
  await page.locator('#gruppen').fill(input);await page.locator('#buchen').click();
  const actual=await page.locator('#antwort').textContent();assert.equal(actual,expected);ui.push({input,expected,actual});
 }
 assert.deepEqual(errors,[]);result.browser.gui={sequence:ui,pageErrors:errors,pass:true};
 result.browser.limit='Actual local Chromium at800x700 for functional execution only; no host/mobile/visualization QA or learner trial.';
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
writeFileSync(P+'material-check-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({normalCases:result.normal.length,originalCounterexamples:3,isolatedCodeMutants:3,browserForm:true,browserGui:true}));
