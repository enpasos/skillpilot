import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {goalMatchesFilter} from '../../../../../../../app/src/utils/goalFilters.ts'
const here=path.dirname(fileURLToPath(import.meta.url))
const root=path.resolve(here,'../../../../../../..')
const candidatePath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-materials-and-one-existing-current-account-tag-proposal.DRAFT.readable-and-platform-country-author-successor-v2.json'
const beforePath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/two-existing-GK-motivation-actual-prerequisite-content-remedy-author-v1/whole-CAN485-only-two-existing-actual-prerequisite-corrections.inert.author-v13.json'
const read=(p:string)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))
const sha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')
const bytesGuard=sha(candidatePath)
if(bytesGuard!=='21c805434845f7b0eaf3477d848b15bada1f9677e5cb0e967eb967106127e64c') throw Error('original V2 candidate changed')
const candidate=read(candidatePath)
const before=read(beforePath)
const goalById=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const rows=candidate.materials.slice(4,8).map((g:any)=>{
 const current=goalById.get(g.id)
 const ordinary=g.examData.coveredGoalIds.map((id:string)=>goalById.get(id))
 if(ordinary.some((v:any)=>!v)) throw Error('missing ordinary contract')
 const prereq=g.requires.map((id:string)=>goalById.get(id))
 const row={id:g.id,currentExistingGoal:Boolean(current),candidateGK:goalMatchesFilter(g,'GK'),candidateLK:goalMatchesFilter(g,'LK'),ordinaryGK:ordinary.map((v:any)=>({id:v.id,GK:goalMatchesFilter(v,'GK')})),directPrerequisitesGK:prereq.map((v:any)=>({id:v.id,GK:goalMatchesFilter(v,'GK')})),directRequiresExactlyCovered:JSON.stringify(g.requires)===JSON.stringify(g.examData.coveredGoalIds),existingBodyExactExceptTags:current?JSON.stringify({...g,tags:current.tags})===JSON.stringify(current):null,existingExamDataExact:current?JSON.stringify(g.examData)===JSON.stringify(current.examData):null}
 if(!row.candidateGK || row.ordinaryGK.some((v:any)=>!v.GK) || row.directPrerequisitesGK.some((v:any)=>!v.GK) || !row.directRequiresExactlyCovered) throw Error('bounded course contract failure '+g.id)
 if(current && (!row.existingBodyExactExceptTags || !row.existingExamDataExact)) throw Error('existing material drift')
 return row
})
if(sha(candidatePath)!==bytesGuard) throw Error('whole candidate changed during probe')
const out={role:'actual narrow native current goalMatchesFilter check; not full compiled role or route approval',candidatePath,candidateSHA256:bytesGuard,beforePath,beforeSHA256:sha(beforePath),goalFilterImplementation:'app/src/utils/goalFilters.ts',goalFilterImplementationSHA256:sha('app/src/utils/goalFilters.ts'),rows,errors:0,newOrdinaryGoalIds:0,allCountryCompulsoryClaim:false,fullSourceCourseOrRouteApproval:false,actualInputGuardPassed:true}
fs.writeFileSync(path.join(here,'actual-narrow-native-four-GK-filter-and-direct-contract-check.result.json'),JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify(out,null,2))

