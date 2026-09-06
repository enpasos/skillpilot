import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { fingerprintPositiveGoalEvidenceProfile } from '../../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { parseAndValidateGoalBookModel, loadGoalBookBuildInputs } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../../app/scripts/positiveGoalEvidenceReview'

// Read-only helper. JSON is printed; persistence is exclusively by apply_patch.
const root = fileURLToPath(new URL('../../../../../../../../../', import.meta.url))
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-037-biophysics-methods-pv-mechanics-20-v1'
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-037a-biophysics-methods-pv-mechanics-19-v1'
const heldPath = base + '/positive-author-unbound-2825b528-draft.json'
const read = (p: string) => readFileSync(resolve(root,p))
const json = (p: string) => JSON.parse(read(p).toString())
const hash = (bytes: Buffer|string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const checks: Array<{label:string,actual:unknown,expected:unknown}> = []
const brief = (v:unknown) => JSON.stringify(v).length>300 ? {jsonSha256:hash(JSON.stringify(v))} : v
const eq = (label:string,a:unknown,b:unknown) => { assert.deepEqual(a,b,label); checks.push({label,actual:brief(a),expected:brief(b)}) }
const near = (label:string,a:number,b:number) => {assert.ok(Math.abs(a-b)<=(b===0?1e-12:1e-10*Math.abs(b)),label+': '+a+' != '+b); checks.push({label,actual:a,expected:b})}
const vector = (label:string,a:number[],b:number[]) => {eq(label+' length',a.length,b.length);a.forEach((x,i)=>near(label+' ['+i+']',x,b[i]))}
const collision = (label:string,m:number[],u:number[],v:number[],elastic:boolean) => {
  const p = (w:number[]) => w.reduce((s,x,i)=>s+m[i]*x,0)
  const k = (w:number[]) => w.reduce((s,x,i)=>s+0.5*m[i]*x*x,0)
  near(label+' momentum',p(u),p(v))
  if(elastic) {near(label+' kinetic energy',k(u),k(v));near(label+' relative velocity',u[0]-u[1],-(v[0]-v[1]));assert.ok(v[0]<v[1],label+' separating')}
  return {p:p(u),before:k(u),after:k(v)}
}
async function main() {
const set = json(prefix+'.candidates.json')
const held = json(heldPath)
const assigned = json(base+'.config.json').goalIds
const all = [held.goals[0],...set.goals]
eq('exact original20 order',all.map((x:any)=>x.goalId),assigned)
eq('bundled19 excludes held',set.goals.length,19)
eq('held count',held.goals.length,1)
eq('held identity',held.goals[0].goalId,'2825b528-00ee-52d0-870e-686890cb1195')
const schema = json('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const ajv = new Ajv2020({allErrors:true,strict:true})
addFormats(ajv)
const validateProfile = ajv.compile({$schema:schema.$schema,$defs:schema.$defs,$ref:'#/$defs/profile'})
const profileReceipts = all.map((g:any)=>{
  assert.ok(validateProfile(g.profile),g.goalId+': '+ajv.errorsText(validateProfile.errors))
  const p=g.profile
  eq(g.goalId+' E/G',[g.evidenceLevel,g.maximumClaimScope],['E1','G1'])
  eq(g.goalId+' cases',p.applicationCaseBriefs.length,2)
  eq(g.goalId+' demonstrations',p.coverageExpectations.minimumIndependentDemonstrations,2)
  eq(g.goalId+' fresh/independent',[p.coverageExpectations.freshVariationRequired,p.coverageExpectations.independentTransferRequired],[true,true])
  const ids=p.expectations.map((e:any)=>e.id)
  eq(g.goalId+' coverage',p.coverageExpectations.requiredExpectationIds,ids)
  for(const collection of [p.expectations,p.variationAxes,p.applicationCaseBriefs]) assert.equal(new Set(collection.map((x:any)=>x.id)).size,collection.length)
  return {goalId:g.goalId,archetype:p.archetype,caseIds:p.applicationCaseBriefs.map((x:any)=>x.id),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p),held:g.goalId===assigned[0]}
})
// Independent arithmetic from specified task inputs, not parsing expected prose.
const numericalStart=checks.length
near('neuron recording speed',.03/(.0016-.001),50)
near('neuron differential stimulation speed',(.10-.04)/(.003-.002),60)
near('layer field A',.080/8e-9,1e7);near('layer field B',.050/5e-9,1e7)
near('wire field A',2e-7*1e-6/1e-3,2e-10);near('wire field B',2e-7*2e-6/.0005,8e-10)
near('flux change A',.002*1e-4,2e-7);near('voltage A',.002*1e-4/.010,20e-6)
near('flux change B',.001*1e-4,1e-7);near('mean voltage B',.001*1e-4/.020,5e-6)
vector('periods',[15,15.2,14.8].map(t=>t/10),[1.50,1.52,1.48])
near('mean period',(15+15.2+14.8)/30,1.50);near('observed half range',(1.52-1.48)/2,.02)
near('observed full range',1.52-1.48,.04)
vector('resistances',[1/.1,2/.2,3/.29],[10,10,10.344827586206897])
near('lighting ratio',40/8,5);near('pump partial efficiency',9/12,.75);near('pump transfers',12-9,3)
vector('cone addition',[0+0,1+3,4+2],[0,4,6]);eq('reduced receiver equality',[1,4],[1,4])
eq('day eye selection',[4>=2,4>=6],[true,false]);eq('night eye selection',[8>=12,8>=7],[false,true]);eq('underwater resolution',.5>=.3,true)
near('cooling temperature change',60-45,15);near('lamp power',3*.2,.6)
vector('lighting energies',[6*4,10*4],[24,40]);near('saving',40-24,16);eq('day irrigation enough',60>=40,true)
near('installation increase',25-10,15);near('support percentage points',70-45,25)
near('headphone relative energy A',1*2,2);near('headphone relative energy B',2*1,2);near('half-time exposure',1*1,1)
const U=[0,.2,.4,.5,.6]
vector('PV high power mW',U.map((u,i)=>u*[100,98,90,70,0][i]),[0,19.6,36,35,0])
vector('PV low power mW',U.map((u,i)=>u*[50,48,40,20,0][i]),[0,9.6,16,10,0])
vector('PV fine high mW',[.3*80,.4*65,.5*50],[24,26,25])
vector('PV fine low mW',[.3*40,.4*31,.5*22],[12,12.4,11])
const interval=(u:number,i:number)=>[(u-.01)*(i-5),(u+.01)*(i+5)]
vector('PV interval1',interval(.3,80),[21.75,26.35]);vector('PV interval2',interval(.4,65),[23.4,28.7]);vector('PV interval3',interval(.5,50),[22.05,28.05])
const lows=[interval(.3,40),interval(.4,31),interval(.5,22)]
eq('PV low intervals overlap',Math.max(...lows.map(x=>x[0]))<Math.min(...lows.map(x=>x[1])),true)
near('PV converter loss',500-450,50);near('PV export',450-300,150);near('island hours',24/6,4)
near('spring constant',.4/.02,20);near('spring force',-20*.03,-.6)
near('static extension',1/50,.02);vector('net vertical forces',[1-50*(.02+.01),1-50*(.02-.01)],[-.5,.5])
eq('nonlinear ratios differ',(-50-1000*.01**2)!==(-50-1000*.10**2),true)
// Current reversal flips the sign of I x B; changing only load does not change imposed field/current polarity.
vector('motor force reversal',[1,-1].map(i=>-i),[-1,1])
const simple=collision('simple elastic',[.5,.5],[2,0],[0,2],true);near('simple K',simple.before,1)
const sticky=collision('sticking counter-motion',[1,1],[2,-2],[0,0],false);near('sticking internal increase',sticky.before-sticky.after,4)
const rebound=collision('unequal elastic',[1,2],[3,0],[-1,2],true);near('unequal K',rebound.before,4.5);near('unequal shared K',.5*3*1**2,1.5)
const approach=collision('moving equal masses',[.5,.5],[2,-1],[-1,2],true);near('moving K',approach.before,1.25)
near('shared alternative K',.5*(.5+.5)*.5**2,.125);near('alternative internal increase',1.25-.125,1.125)
near('COM speed A',(2*3+1*0)/3,2);vector('COM A initial',[3-2,0-2],[1,-2]);vector('COM A final lab',[-1+2,2+2],[1,4])
const ca=collision('COM A lab',[2,1],[3,0],[1,4],true);near('COM A lab K',ca.before,9)
const cas=collision('COM A centre',[2,1],[1,-2],[-1,2],true);near('COM A centre K',cas.before,3)
near('COM speed B',(1*2+2*(-1))/3,0)
const cb=collision('COM B L',[1,2],[2,-1],[-2,1],true);near('COM B K',cb.before,3)
vector('Lprime initial',[2-3,-1-3],[-1,-4]);vector('Lprime final',[-2-3,1-3],[-5,-2])
const cbp=collision('COM B Lprime',[1,2],[-1,-4],[-5,-2],true);near('Lprime p',cbp.p,-9);near('Lprime K',cbp.before,16.5)
near('spring total energy',.5*20*.1**2,.1);near('spring displaced potential',.5*20*.06**2,.036);near('spring displaced kinetic',.1-.036,.064)
near('spring speed square centre',2*.1/.5,.4);near('spring speed square displaced',2*.064/.5,.256)
near('pendulum total energy',.2*10*.05,.1);near('pendulum potential',.2*10*.02,.04);near('pendulum kinetic',.1-.04,.06)
near('pendulum bottom speed',Math.sqrt(2*.1/.2),1);near('pendulum intermediate speed squared',2*.06/.2,.6)
eq('decay magnitudes', [4,-3.2,2.6,-2.1].map(Math.abs),[4,3.2,2.6,2.1])
eq('strictly shrinking envelope',[4,3.2,2.6,2.1].every((x,i,a)=>i===0||x<a[i-1]),true)

const numericalDomainAssertions=checks.length-numericalStart
const model = parseAndValidateGoalBookModel(json(base+'/bundle/book-model.json'))
const manifest = json(base+'/bundle/manifest.json')
const pages = read(base+'/bundle/review-input.jsonl').toString().trim().split('\n').map(x=>JSON.parse(x))
eq('original model digest',model.digest,manifest.bookModelDigest)
eq('original page IDs',pages.map((p:any)=>p.page.goalId),assigned)
for(const page of pages) {eq(page.page.goalId+' page exact original',page.page,model.pages.find(p=>p.goalId===page.page.goalId));eq(page.page.goalId+' original book digest',page.bookDigest,model.digest)}
for(const role of ['book_model','review_input_jsonl']) {const a=manifest.artifacts.find((a:any)=>a.role===role);eq(role+' bytes hash',hash(read(base+'/bundle/'+a.path)),a.digest)}
const landscape = json(model.source.landscapePath)
const goalMap = new Map(landscape.goals.map((g:any)=>[g.id,g]))
const currentText = all.map((g:any)=>{
  const now:any=goalMap.get(g.goalId), original:any=pages.find((p:any)=>p.page.goalId===g.goalId).page
  eq(g.goalId+' DE title unchanged',now.title,original.title)
  eq(g.goalId+' DE description unchanged',now.description,original.description)
  return {goalId:g.goalId,titleDe:now.title,titleEn:now.titleEn,descriptionDe:now.description,descriptionEn:now.descriptionEn,requires:now.requires}
})
const result:any = {
  checkedAt:new Date().toISOString(),mode:'unbound-candidate-schema-and-domain-check',
  status:'PASS',scope19:set.goals.map((g:any)=>g.goalId),heldGoalId:held.goals[0].goalId,
  assertions:checks.length,numericalDomainAssertions,checks,profiles:profileReceipts,
  inputBindings:{originalBookModelDigest:model.digest,originalBundleFingerprint:manifest.bundleFingerprint,originalModelByteSha256:hash(read(base+'/bundle/book-model.json')),originalInputJsonlSha256:hash(read(base+'/bundle/review-input.jsonl')),currentCanonicalByteSha256:hash(read(model.source.landscapePath)),candidate19Sha256:hash(read(prefix+'.candidates.json')),heldDraftSha256:hash(read(heldPath)),authoringPromptSha256:hash(read('curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md')),profileCriteriaSha256:hash(read('curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md'))},
  currentText,
  claims:{actualLearnerPerformance:false,actualExperimentPerformed:false,humanApproval:false,sourceApproval:false,imageApproval:false,reviewRunIds:[],materialized:false},
}
if(process.argv.includes('--bind-ready')) {
  result.mode='current-binding-schema-domain-and-native-review-check'
  const config=json(prefix+'.config.json')
  const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:set})
  const part=process.argv.find(arg=>arg.startsWith('--records='))
  if(part) {const [from,to]=part.slice('--records='.length).split(':').map(Number);console.log(JSON.stringify({reviewText:records.slice(from,to).map(r=>JSON.stringify(r)).join('\n')+'\n'}));return}
  for(const r of records) {eq(r.goalId+' authority',[r.status,r.reviewAuthority,r.evidenceLevel,r.maximumClaimScope],['needs_human_review','ai_candidate','E1','G1']);eq(r.goalId+' no run claims',r.reviewRunIds,[])}
  const native=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-physics-national-atlas.json')
  result.currentNativeBookModelDigest=native.model.digest
  result.currentNativeSourceDigest=native.model.source.landscapeDigest
  result.reviewText=records.map(r=>JSON.stringify(r)).join('\n')+'\n'
  result.reviewSha256=hash(result.reviewText)
  result.currentProfileBindings=records.map(r=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint}))
  if(existsSync(resolve(root,config.reviewPath))) {
    eq('materialized exact bytes',read(config.reviewPath).toString(),result.reviewText)
    const review=reviewPositiveGoalEvidenceConfig(prefix+'.config.json')
    eq('native review issues',review.errors,[])
    result.nativeReview={counts:review.counts,recordCount:review.records.length,errors:review.errors}
    result.claims.materialized=true
  }
  result.assertions=checks.length
}
delete result.reviewText
console.log(JSON.stringify(result,null,2))
}
void main()
