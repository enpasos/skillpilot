// Apache-2.0. Exact production release-field helper only; no full CQR run.
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
const R=fileURLToPath(new URL('../../../../../../../',import.meta.url)),O=fileURLToPath(new URL('./',import.meta.url))
const require=createRequire(R+'app/package.json'),ts=require('typescript'),sourcePath='app/scripts/generateCurriculumQualityStatus.ts',source=readFileSync(R+sourcePath,'utf8')
const functionBodies=['stringArray','examReleaseCoverageIssues'].map(name=>{const start=source.indexOf('\nfunction '+name+'('),end=source.indexOf('\nfunction ',start+1);if(start<0||end<0)throw Error('Missing production function '+name);return{name,source:source.substring(start+1,end)}})
const js=ts.transpileModule(functionBodies.map(f=>f.source).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,check=new Function(js+'\nreturn examReleaseCoverageIssues;')()
const input=JSON.parse(readFileSync(O+'INPUTS.two-current-whole-assessments-and-four-carriers.json','utf8'))
const records=input.wholeAssessmentGoals.map(goal=>{const current=check(goal),released=structuredClone(goal);released.examData.reviewStatus='released';const proposed=check(released);if(current.length!==1||current[0]!=='reviewStatus is not released'||proposed.length)throw Error('Unexpected scoped release-field result');return{goalId:goal.id,actualCurrentReviewStatus:goal.examData.reviewStatus,currentScopedReleaseCoverageIssues:current,metadataOnlyReleasedCloneIssues:proposed,normalFileWrite:false}})
console.log(JSON.stringify({role:'Actual unchanged stock examReleaseCoverageIssues helper on exactly two whole designs, in-memory released clones only; not full CQR203 or route/runtime acceptance',sourcePath,functionBodies,records},null,2))
