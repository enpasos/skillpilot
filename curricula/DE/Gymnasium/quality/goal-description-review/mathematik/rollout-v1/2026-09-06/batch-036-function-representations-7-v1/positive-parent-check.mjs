import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const candidatePath='curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-036-function-representations-7-v1.candidates.json';
const raw=readFileSync(candidatePath),digest=createHash('sha256').update(raw).digest('hex');
assert.equal(digest,'97045cccce01a74133186452883d358465deb9e6893f4e1f8f1939e81ed29d99');
const candidate=JSON.parse(raw);
assert.equal(candidate.goals.length,7);
const checks=[];
const equal=(id,actual,expected)=>{assert.ok(Math.abs(actual-expected)<1e-10,id);checks.push({id,actual,expected,pass:true});};
equal('read-lines-zero',-2+2,0);equal('read-lines-slope',(4-0)/(2-(-2)),1);equal('read-lines-intersection',1+2,3);
equal('sampled-volume-five',[6,10,10,4][2],10);equal('sampled-volume-max',Math.max(6,10,10,4),10);equal('sampled-volume-change',4-10,-6);
const f=x=>(x-1)**2-4;
for(const [x,y]of [[1,-4],[-1,0],[3,0],[0,-3],[-2,5],[4,5]])equal('quadratic-section-'+x,f(x),y);
for(const [x,y]of [[-4,-.5],[-2,-1],[-1,-2],[1,2],[2,1],[4,.5]])equal('restricted-reciprocal-'+x,2/x,y);
const q=x=>.75*(x-2)**2-3;
equal('parabolic-features-vertex',q(2),-3);equal('parabolic-features-zero0',q(0),0);equal('parabolic-features-zero4',q(4),0);
equal('affine-features-slope',(-1-5)/(2-(-1)),-2);equal('affine-features-intercept',5+2*(-1),3);equal('affine-features-zero',-2*1.5+3,0);
for(const [u,v,x,y]of [[-2,1,0,-1],[0,2,1,2],[4,-1,3,-7]]){equal('inner-factor-x-'+u,1+u/2,x);equal('inner-factor-y-'+u,3*v-4,y);}
for(const [u,v,x,y]of [[-2,0,-5,1],[0,4,-1,3],[2,2,3,2]]){equal('polygon-x-'+u,2*u-1,x);equal('polygon-y-'+u,.5*v+1,y);}
equal('affine-equation-slope',(7-1)/(1-(-2)),2);equal('affine-equation-intercept',1-2*(-2),5);
for(const [x,y]of [[-2,1],[1,7]])equal('affine-equation-point-'+x,2*x+5,y);
equal('vertex-equation-factor',(6+2)/(3-1)**2,2);
for(const [x,y]of [[1,-2],[3,6],[-1,6]])equal('vertex-equation-point-'+x,2*(x-1)**2-2,y);
for(const [x,y]of [[-1,-1],[1,5],[4,14],[2,8]])equal('affine-table-'+x,3*x+2,y);
for(const [x,y]of [[-1,3],[0,0],[1,-1],[2,0],[3,3],[.5,-.75]])equal('quadratic-rule-'+x,x*x-2*x,y);
equal('scaled-check-A-slope',(3-1)/4,.5);equal('scaled-check-B-slope',(3-1)/2,1);equal('scaled-check-f2',.5*2+1,2);
for(const x of [-1,0,1])equal('finite-samples-agreement-'+x,x*x,x**4);
equal('finite-samples-square-half',.5**2,.25);equal('finite-samples-fourth-half',.5**4,1/16);
const goalReviews=[
  ['cf4fe700-dec2-502f-888b-90acefa307bb','Skalenrichtige Graphinformation und diskrete Volumentabelle; keine unbegründeten Zwischenwerte.'],
  ['0272c501-2931-5e52-b62f-af068db63c44','Parabel und eingeschränkte reziproke Funktion: richtige Merkmale und getrennte Definitionsintervalle, ohne zusätzliche Kurvendiskussion.'],
  ['99bfb566-f875-5646-ac3e-05a039838c54','Termmerkmale statt vollständiger Gleichung; explizite Klassenangaben und korrekte verschobene Symmetrie.'],
  ['7ba19509-8ee6-50e0-a411-a371f05b1801','Reziproke innere Skalierung, äußere Skalierung und Verschiebungen; der zweite Fall nutzt eindeutig markierte Polygonzug-Korrespondenzen.'],
  ['1801c759-d92d-5bfb-a44f-cfd2455d207b','Zwei Gleichungsrekonstruktionen innerhalb ausdrücklich angegebener Klassen; Merkmale tragen Parameter, keine globale Eindeutigkeitsbehauptung ohne Annahmen.'],
  ['b04d65dc-1214-5323-89a7-317d6b099e1a','Beide Übertragungsrichtungen und alle drei Darstellungen; ungleiche Tabellenabstände sowie quadratische Struktur werden kontrolliert.'],
  ['42b57670-d2be-5da2-be2f-d58055901813','Skalenfehler und endliche Stützstellen: positive begründete Fehlerdiagnose, ein überprüfbares Gegenbeispiel statt pauschalem Defizitkatalog.']
].map(([goalId,rationaleDe])=>({goalId,rationaleDe,decision:'retain_author_profile',bilingualProfileFullyRead:true,sourceApprovalGranted:false}));
assert.deepEqual(candidate.goals.map(g=>g.goalId),goalReviews.map(g=>g.goalId));
for(const g of candidate.goals){assert.equal(g.evidenceLevel,'E1');assert.equal(g.maximumClaimScope,'G1');assert.equal(g.profile.applicationCaseBriefs.length,2);assert.equal(g.profile.coverageExpectations.minimumIndependentDemonstrations,2);}
console.log(JSON.stringify({schemaVersion:1,reviewedAt:new Date().toISOString(),reviewer:'codex-parent-independent-full-profile-counterreview',candidatePath,candidateSha256:'sha256:'+digest,profiles:7,applicationCases:14,authority:'ai_candidate',humanApprovalClaimed:false,canonicalDescriptionsChanged:0,imageAssetsChanged:0,goalReviews,numericAssertionCount:checks.length,checks,limits:'Numeric assertions supplement, not replace, the parent semantic DE/EN and scope review. No claim about actual learner mastery, normative source coverage, or human approval.'},null,2));
