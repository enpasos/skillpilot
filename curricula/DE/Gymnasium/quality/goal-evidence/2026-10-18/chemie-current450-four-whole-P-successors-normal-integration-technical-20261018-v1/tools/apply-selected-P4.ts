// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-four-whole-P-successors-normal-integration-technical-20261018-v1/'
const J=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const H=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:H(b),bytes:b.length}}
const verify=(p:any)=>assert.deepEqual(pin(p.path),p)
function selection(paths:string[]){
 const rows=new Map<string,any>()
 for(const p of paths){const c=J(p),rs=readFileSync(c.reviewPath,'utf8').split('\n').filter(s=>s.trim()).map(JSON.parse);assert.deepEqual(rs.map(r=>r.goalId),c.scope.goalIds);for(const r of rs){assert(!rows.has(r.goalId));rows.set(r.goalId,r)}}
 return rows
}
function main(){
 assert.deepEqual(process.argv.slice(2),['--apply-root-authorized'])
 assert(!existsSync(O+'RECEIPT.actual-four-whole-P-normal-activation.json'))
 const plan=J(O+'PLAN.selected-four-current-whole-P-owners.normal-activation.json');verify(plan.centralBefore)
 for(const x of plan.allOldSelectedOwnerAndAfterInputPins){verify(x.config);verify(x.review)}
 for(const x of plan.protectedNonPFiles)verify(x)
 const path=plan.centralBefore.path,beforeBytes=readFileSync(path),raw=beforeBytes.toString('utf8'),before=JSON.parse(raw),si=plan.subjectIndex
 assert.equal(before.subjects[si].subject,'chemie');assert.deepEqual(before.subjects[si].positiveEvidenceConfigPaths,plan.beforePArray)
 const old=selection(plan.beforePArray),candidate=selection(plan.afterPArray),targets=new Set<string>(plan.targetIds)
 assert.equal(old.size,450);assert.equal(candidate.size,450);for(const[gid,r]of old){assert(candidate.has(gid));if(!targets.has(gid))assert.deepEqual(candidate.get(gid),r)}
 assert.equal([...old.keys()].filter(gid=>!targets.has(gid)).length,446)
 for(const m of plan.moves){assert.deepEqual(J(m.newConfig.path).scope.goalIds,[m.goalId]);assert.equal(J(m.residualConfig.path).scope.goalIds.length,m.retainedResidualRowCount)}
 const subjectAt=raw.search(/"subject"\s*:\s*"chemie"/);assert(subjectAt>=0)
 const keyAt=raw.indexOf('"positiveEvidenceConfigPaths"',subjectAt),start=raw.indexOf('[',keyAt);assert(start>keyAt)
 let end=-1,level=0,inString=false,escaped=false
 for(let i=start;i<raw.length;i++){const ch=raw[i];if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue}if(ch==='"')inString=true;else if(ch==='[')level++;else if(ch===']'&&--level===0){end=i+1;break}}
 assert(end>start);assert.deepEqual(JSON.parse(raw.slice(start,end)),plan.beforePArray)
 const indent=raw.slice(raw.lastIndexOf('\n',keyAt)+1,keyAt),replacement='[\n'+plan.afterPArray.map((p:string)=>indent+'  '+JSON.stringify(p)).join(',\n')+'\n'+indent+']'
 const afterRaw=raw.slice(0,start)+replacement+raw.slice(end),after=JSON.parse(afterRaw)
 const beforeOther=structuredClone(before),afterOther=structuredClone(after);delete beforeOther.subjects[si].positiveEvidenceConfigPaths;delete afterOther.subjects[si].positiveEvidenceConfigPaths;assert.deepEqual(afterOther,beforeOther)
 assert.deepEqual(after.subjects[si].positiveEvidenceConfigPaths,plan.afterPArray)
 mkdirSync(O+'history',{recursive:true});const history=O+'history/central.before-P4-exact.json';assert(!existsSync(history));writeFileSync(history,beforeBytes)
 const stockChecks:any[]=[]
 try{
  // Replace only the actual Chemistry P-array byte span. All surrounding bytes stay literal.
  writeFileSync(path,afterRaw)
  const actual=J(path);assert.deepEqual(actual,after)
  for(const m of plan.moves)for(const configPath of[m.newConfig.path,m.residualConfig.path]){const out=reviewPositiveGoalEvidenceConfig(configPath);assert.deepEqual(out.errors,[]);stockChecks.push({configPath,goalIds:out.config.scope.goalIds,counts:out.counts,errors:out.errors})}
  for(const x of plan.protectedNonPFiles)verify(x)
  for(const x of plan.allOldSelectedOwnerAndAfterInputPins){verify(x.config);verify(x.review)}
  const finalRows=selection(actual.subjects[si].positiveEvidenceConfigPaths);assert.equal(finalRows.size,450);for(const[gid,r]of old)if(!targets.has(gid))assert.deepEqual(finalRows.get(gid),r)
 }catch(error){writeFileSync(path,beforeBytes);throw error}
 const chem=after.subjects[si],receipt={role:'ACTUAL_ROOT_AUTHORIZED_FOUR_WHOLE_P_ONLY_NORMAL_ACTIVATION',atUTC:new Date().toISOString(),plan:pin(O+'PLAN.selected-four-current-whole-P-owners.normal-activation.json'),actualScienceAndMaterials:plan.scienceBasis,centralBefore:plan.centralBefore,exactBeforeArchive:pin(history),normalCentralAfter:pin(path),normalWrittenPaths:[path],arrayOnlyBytePatch:{beforeArraySpanSHA256:H(raw.slice(start,end)),afterArraySpanSHA256:H(replacement),allPrefixAndSuffixBytesExact:true,outsideArrayBytesSHA256:H(raw.slice(0,start)+raw.slice(end))},configCounts:[plan.beforePArray.length,plan.afterPArray.length],uniqueOrdinaryPGoals:450,changedWholeProfileBodies:4,unchangedOther446WholeNativeRowsExact:true,actualStockChangedAndResidualChecks:stockChecks,normalDIndexes:chem.resolutionIndexPaths.length,normalDEdges:chem.resolutionSupersessions.length,normalDWithdrawals:chem.resolutionWithdrawals.length,allNonPAndOtherFourSubjectObjectsExact:true,allProtectedNonPFilesExact:true,allSealedNativeOldAndNewFilesExact:true,sourceMappingCanonicalViewQaWrites:0,APCompilerBuildRuns:0,newScientificVotes:0,newDDecisions:0,humanApprovalOrTrial:false,actualLearnerPerformance:false,noWholeM7OrFullCentralPassClaim:true}
 writeFileSync(O+'RECEIPT.actual-four-whole-P-normal-activation.json',JSON.stringify(receipt,null,2)+'\n')
 console.log(JSON.stringify({status:'DONE',normalCentralAfter:receipt.normalCentralAfter,receipt:pin(O+'RECEIPT.actual-four-whole-P-normal-activation.json'),stockChecks:stockChecks.length,configs:[134,138],uniqueGoals:450,other446WholeRecordsExact:true,D:[receipt.normalDIndexes,receipt.normalDEdges,receipt.normalDWithdrawals]},null,2))
}
main()
