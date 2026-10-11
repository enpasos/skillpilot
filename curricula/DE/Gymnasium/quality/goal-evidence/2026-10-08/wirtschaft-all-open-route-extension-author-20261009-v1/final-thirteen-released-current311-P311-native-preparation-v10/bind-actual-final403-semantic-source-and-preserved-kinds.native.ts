import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const base=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10'
const B=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex')
const can=read(base+'/whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json')
const before=read(B+'/candidate-semantic-kinds.current311.inert.json')
const after=structuredClone(before)
const changes:any[]=[]
for(const goal of can.goals){
 let decision=after.decisions.find((d:any)=>d.goalId===goal.id)
 if(!decision){
  if(!(goal.examData||goal.id==='5317d078-413b-58bb-9262-d57387d51655'))throw Error('Unreviewed new ordinary semantic kind '+goal.id)
  decision={goalId:goal.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(goal),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'}
  after.decisions.push(decision)
  changes.push({goalId:goal.id,kind:'new-exact-independent-root-material-reviewed-practice-assessment-or-navigation',semanticKind:decision.semanticKind})
 }else{
  const fingerprint=fingerprintSemanticKindSourceGoal(goal)
  if(fingerprint!==decision.sourceFingerprint){changes.push({goalId:goal.id,kind:'actual-current-reviewed-field-binding',semanticKind:decision.semanticKind,before:decision.sourceFingerprint,after:fingerprint});decision.sourceFingerprint=fingerprint}
 }
}
after.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))
after.counts=Object.fromEntries(Object.keys(before.counts).filter(k=>k!=='total').map(k=>[k,after.decisions.filter((d:any)=>d.semanticKind===k).length]))
after.counts.total=after.decisions.length
if(after.counts.curricularAtomic!==311||after.counts.total!==403)throw Error('Semantic denominator changed')
writeFileSync(base+'/candidate-semantic-kinds.current403.inert.json',JSON.stringify(after,null,2)+'\n')
writeFileSync(base+'/actual-final403-preserved-kinds-and-current-source-binding.native.receipt.json',JSON.stringify({schemaVersion:1,kind:'actual-technical-semantic-source-binding-with-reviewed-field-basis',independentQualityApproval:false,liveWrites:[],newStrictClosures:0,sourceBWholeSHA256:sha(readFileSync(B+'/candidate-semantic-kinds.current311.inert.json')),counts:after.counts,changes,meaning:'Existing semantic kinds are retained exactly; new13 independentlyRoot-material-reviewed exam nodes and their prerequisite-free practice navigation use the established practiceAssessment kind. Source fingerprints are actual native derivatives of genuine accepted field changes, not new content reviews. Final D/central/human gates remain separate.'},null,2)+'\n')
console.log(JSON.stringify({counts:after.counts,changes:changes.map(x=>x.goalId)}))
