import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = dirname(fileURLToPath(import.meta.url));
const root = resolve(base, '../../../../../..');
const read = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const scope = JSON.parse(readFileSync(resolve(base, 'scope.candidate.json'), 'utf8'));
const candidates = JSON.parse(readFileSync(resolve(base, 'positive-evidence.candidates.json'), 'utf8'));
const images = JSON.parse(readFileSync(resolve(base, 'visualization.candidate-review.json'), 'utf8'));
const landscape = read(scope.landscapePath);
const byId = new Map(landscape.goals.map(g => [g.id, g]));
const kinds = new Map(read(scope.semanticKindLedgerPath).decisions.map(d => [d.goalId, d]));
assert.equal(candidates.goals.length, 20);
assert.equal(new Set(candidates.goals.map(g => g.goalId)).size, 20);
assert.equal(images.goals.length, 20);
for (const [i, g] of scope.goals.entries()) {
  assert.equal(candidates.goals[i].goalId, g.goalId);
  assert.equal(hash(JSON.stringify(byId.get(g.goalId))), g.goalSnapshotSha256, 'canonical snapshot: ' + g.goalId);
  assert.equal(hash(readFileSync(resolve(root, g.assetPath))), g.assetSha256, 'raster bytes: ' + g.goalId);
  assert.equal(kinds.get(g.goalId).semanticKind, 'curricularAtomic');
  assert.equal(kinds.get(g.goalId).decisionStatus, 'authoritative');
  assert.equal(candidates.goals[i].profile.applicationCaseBriefs.length, 2);
  assert.equal(images.goals[i].inspected, true);
}
const registry = read(scope.registryPath).subjects.find(s => s.subject === 'mathematik');
const registeredD = new Set(registry.resolutionIndexPaths.flatMap(p => read(p).batchGoalIds));
const registeredP = new Set(registry.positiveEvidenceConfigPaths.flatMap(p => read(p).scope.goalIds));
const reservations = read(scope.inFlightLedgerPath).activeBatchConfigPaths.map(path => ({ path, ids: read(path).goalIds }));
const expectedReservation = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/m7-statistics-next20-v1.config.json';
for (const g of scope.goals) {
  assert.equal(registeredD.has(g.goalId), false, 'no registered D: ' + g.goalId);
  assert.equal(registeredP.has(g.goalId), false, 'no registered P: ' + g.goalId);
  assert.deepEqual(reservations.filter(r => r.ids.includes(g.goalId)).map(r => r.path), [expectedReservation]);
}
const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' != ' + expected);
const choose = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c *= (n - i + 1) / i; return c; };
const pmf = (n, p, k) => choose(n, k) * p ** k * (1 - p) ** (n - k);
const prob = (n, p, lo, hi) => { let s = 0; for (let k = lo; k <= hi; k++) s += pmf(n, p, k); return s; };
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const variance = xs => mean(xs.map(x => (x - mean(xs)) ** 2));
const median = xs => { const ys = [...xs].sort((a,b) => a-b); return (ys[Math.floor((ys.length-1)/2)] + ys[Math.floor(ys.length/2)]) / 2; };
const interval = (p,n,c) => [p-c*Math.sqrt(p*(1-p)/n),p+c*Math.sqrt(p*(1-p)/n)];
const score = (h,n,c) => {const a=n+c*c,b=-(2*n*h+c*c),d=b*b-4*a*n*h*h;return [(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)];};
const pair = (a,b,t=1e-7) => {close(a[0],b[0],t);close(a[1],b[1],t);};
const results = [];
const run = (g,c,fn) => { fn(); results.push({goalId:candidates.goals[g-1].goalId,caseId:candidates.goals[g-1].profile.applicationCaseBriefs[c-1].id,result:'passed',meaning:'Arithmetic or finite logical consistency only; not learner evidence or independent approval'}); };
run(1,1,()=>close(prob(10,.5,9,10),11/1024));
run(1,2,()=>close(prob(10,.9,0,6),.0127951984));
run(2,1,()=>{assert.ok(.81>.8 && .03<.04);});
run(2,2,()=>{close(1-.8,.2);assert.ok(1-.81<.2);assert.ok(.4!==.5 && .6!==.5);});
run(3,1,()=>close(34/40,.85));
run(3,2,()=>{assert.equal(50-47,3);close(3/50,.06);close(47/50,.94);close(1-.04,.96);});
run(4,1,()=>{close(prob(20,.5,15,20),.0206947327);close(prob(20,.5,14,20),.0576591492);assert.ok(prob(20,.5,15,20)<=.05 && prob(20,.5,14,20)>.05);});
run(4,2,()=>{close(prob(12,.5,0,2),79/4096);close(prob(12,.5,0,3),299/4096);close(prob(12,.5,0,2)+prob(12,.5,10,12),158/4096);});
run(5,1,()=>{close(prob(10,.5,8,10),.0546875);close(prob(10,.8,0,7),.3222004736);});
run(5,2,()=>{close(prob(12,.75,0,6),.0544022322);close(prob(12,.4,7,12),.1582122926);close(prob(12,.4,7,12),1-prob(12,.4,0,6));});
run(6,1,()=>{assert.ok(.01<=.02);assert.ok(!(.06<=.02));});
run(6,2,()=>{assert.ok(.05>=.02);assert.ok(!(.005>=.02));});
run(7,1,()=>{assert.ok(6>=5);close(6/20,.3);});
run(7,2,()=>assert.ok(7>5));
run(8,1,()=>{const ps=[0,.2,.5,.8,1],es=[0,.0272,.3125,.8192,1];ps.forEach((p,i)=>{close(4*p**3-3*p**4,es[i]);close(prob(4,p,3,4),es[i]);});});
run(8,2,()=>{close(prob(4,.5,2,4),.6875);close(prob(4,.8,2,4),.9728);close(prob(10,.5,7,10),.171875);close(prob(10,.8,7,10),.8791261184);});
run(9,1,()=>{close(prob(20,.8,14,20),.9133075);close(prob(20,.8,15,20),.8042078);assert.ok(prob(20,.5,14,20)>.05 && prob(20,.5,14,20)<.06);});
run(9,2,()=>{close(.5*10*.01+.5*100*.3,15.05);close(.5*10*.04+.5*100*.08,4.2);close(.5*1000*.01+.5*10*.3,6.5);close(.5*1000*.04+.5*10*.08,20.4);});
run(10,1,()=>pair(interval(.4,400,1.96),[.351990,.448010],1e-6));
run(10,2,()=>{pair(interval(.4,1600,1.96),[.375995,.424005],1e-6);pair(interval(.01,20,1.96),[-.03361,.05361],1e-5);});
run(11,1,()=>{pair(score(.6,100,1.96),[.5020008,.6906003]);pair(interval(.6,100,1.96),[.50398,.69602]);});
run(11,2,()=>{pair(score(.1,100,1.96),[.0552285,.1743673]);pair(interval(.1,100,1.96),[.0412,.1588]);});
run(12,1,()=>{close(200*.95,190);close(187/200,.935);});
run(12,2,()=>{assert.ok(.42<.58);close((.42+.58)/2,.5);});
run(13,1,()=>{pair(score(.5,100,1.96),[.404,.596],.0005);pair(score(.5,400,1.96),[.451,.549],.0005);});
run(13,2,()=>{pair(score(.5,100,2.58),[.375,.625],.0005);pair(score(.6,100,1.96),[.502,.691],.0005);assert.ok(score(.6,100,1.96)[0]>.5);});
run(14,1,()=>{assert.equal(Math.ceil(1.96**2/(4*.03**2)),1068);assert.equal(Math.ceil(1.96**2/(4*.015**2)),4269);});
run(14,2,()=>{assert.equal(Math.ceil(1.96**2*.09/.03**2),385);assert.equal(258**2,4*3**2*1849);close(2.58**2/(4*.03**2),1849);});
run(15,1,()=>{close(mean([2,3,3,4,18]),6);close(mean([2,3,3,4,38]),10);close(median([2,3,3,4,18]),3);close(median([2,3,3,4,38]),3);});
run(15,2,()=>{assert.equal(8+5+3,16);assert.ok(8>5 && 8>3);});
run(16,1,()=>{close(mean([8,10,10,12]),10);close(variance([8,10,10,12]),2);close(mean([6,10,10,14]),10);close(variance([6,10,10,14]),8);});
run(16,2,()=>{const ys=[8,10,10,12].map(x=>2*x+5);assert.deepEqual(ys,[21,25,25,29]);close(mean(ys),25);close(variance(ys),8);});
run(17,1,()=>{close((51+2*25)/100,1.01);close((51+4*25)/100-1.01**2,.4899);[0,1,2].forEach((k,i)=>close(100*pmf(2,.5,k),[25,50,25][i]));});
run(17,2,()=>{close((10+2*45)/100,1);close((10+4*45)/100-1,.9);});
run(18,1,()=>assert.equal(11+9,20));
run(18,2,()=>{assert.equal(15*2,30);assert.equal(3+2,5);assert.equal(new Set(['RR','RB','BR','BB']).size,4);});
run(19,1,()=>{const raw=['Bus','Fahrrad','Bus','Fuß','Auto','Bus','Fahrrad','Fuß','Bus','Fahrrad','Bus','Auto','Fahrrad','Bus','Fuß','Fahrrad','Bus','Fuß','Fahrrad','Bus'];assert.deepEqual(['Bus','Fahrrad','Fuß','Auto'].map(x=>raw.filter(y=>x===y).length),[8,6,4,2]);});
run(19,2,()=>{const xs=[1,2,2,3,4,5,6,6,7,8,9,11];assert.deepEqual([0,4,8].map(lo=>xs.filter(x=>x>=lo && x<lo+4).length),[4,5,3]);});
run(20,1,()=>{const a=[48,50,50,52],b=[47,49,51,53];close(mean(a),50);close(mean(b),50);close(median(a),50);close(median(b),50);close(variance(a),2);close(variance(b),5);assert.equal(Math.max(...a)-Math.min(...a),4);assert.equal(Math.max(...b)-Math.min(...b),6);});
run(20,2,()=>{const xs=[0,0,0,1,1,1,1,2,2,2];close(mean(xs),1);close(median(xs),1);close(variance(xs),.6);close(Math.sqrt(variance(xs)),.774596669);});
console.log(JSON.stringify({
  actualCheckedAt:new Date().toISOString(),
  verificationScope:'Only these 20 candidates, current canonical/asset bindings, direct registry membership and 40 case-specific arithmetic/logical checks; no full QS, no learner execution or approval.',
  unchangedGoalSnapshots:20,unchangedRasterAssets:20,currentCurricularAtomic:20,
  unregisteredDescriptionGoals:20,unregisteredPositiveEvidenceGoals:20,
  soleInFlightReservation:expectedReservation,
  checkedCases:results.length,caseChecks:results,
  currentRegistrySha256:hash(readFileSync(resolve(root,scope.registryPath))),
  currentInFlightSha256:hash(readFileSync(resolve(root,scope.inFlightLedgerPath)))
},null,2));
