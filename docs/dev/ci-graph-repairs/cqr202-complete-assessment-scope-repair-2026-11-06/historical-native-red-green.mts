// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import ts from '../../../../app/node_modules/typescript/lib/typescript.js'
import { deriveCurriculumMaturity, deriveScopeMaturity, discoverCurriculumAssessmentScope, evaluateCurriculumExamReadiness, evaluateExamTaskReadiness, evaluateGraphIntegrity } from '../../../../app/scripts/generateCurriculumQualityStatus.ts'
import { hasCompletePassingSkillGraphIntegrity } from '../../../../app/scripts/lib/skillGraphIntegrity.ts'
const base='5c9ff83586c407fd9189207c38238400c74bce51'
const original=execFileSync('git',['show',`${base}:app/scripts/generateCurriculumQualityStatus.ts`],{encoding:'utf8'})
const ast=ts.createSourceFile('historical-generator.ts',original,ts.ScriptTarget.Latest,true)
const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='deriveCurriculumMaturity')!
assert.ok(node)
const exactOldFunction=ts.transpileModule(node.getText(ast).replace(/^export /,''),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const oldDerive=new Function('hasCompletePassingSkillGraphIntegrity',`${exactOldFunction}; return deriveCurriculumMaturity;`)(hasCompletePassingSkillGraphIntegrity)
const infoRaw=readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json');
assert.equal(createHash('sha256').update(infoRaw).digest('hex'),'00bcdbaf0723441eea0e33dfef36c674ed865b61d7009705cd6c83241a897422');
const info=JSON.parse(infoRaw.toString('utf8'))
const actual=info.goals.find((g:any)=>g.id==='63509366-f5b2-58e5-9976-47df6f8c37e1')
assert.equal(evaluateExamTaskReadiness([actual]).status,'pass')
const owner='native-assessment-gap-fixture',root='00000000-0000-4000-8000-000000000001'
const good={...actual,requires:[],contains:[]}
const fixture=(goal:any,offered:boolean)=>({landscapeId:owner,title:'Native gap fixture',locale:'de',description:'Isolate the actual pre-fix maturity omission.',goals:[goal,{...good,id:root,examData:undefined,nodeKind:'tutor',tags:['root'],weight:1,contains:[goal.id],...(offered?{release:{examYear:2026,kind:'offer',status:'released',courseLevel:'GK'}}:{})}]})
const local=[...['CQR-101','CQR-102','CQR-103','CQR-104','CQR-201','CQR-203'].map(id=>({id,status:'pass',summary:'Isolated existing local requirement'})),evaluateExamTaskReadiness([actual])]
const scopes=[{scopeId:'native-gap',label:'Native gap',rules:local,maturity:deriveScopeMaturity(local),selectedAtomicGoals:1}]
const rows=[]
for(const [name,goal,offered] of [
 ['offered-solution-removed',{...good,examData:{...good.examData,solutionContent:''}},true],
 ['offered-payload-removed-assessment-tag-retained',{...good,examData:undefined},true],
 ['unoffered-retained-empty-definition',{...good,examData:{...good.examData,taskContent:''}},false],
 ['offered-complete-draft',{...good,examData:{...good.examData,reviewStatus:'draft'}},true],
] as const){
 const source=fixture(goal,offered)
 const graph=evaluateGraphIntegrity(source,[source]);assert.equal(graph.status,'pass')
 const expected=discoverCurriculumAssessmentScope(source,[])
 const rules=[graph,...['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302','CQR-303'].map(id=>({id,status:'pass',summary:'Isolated existing requirement'})),...evaluateCurriculumExamReadiness(source,[])]
 const before=oldDerive(rules,scopes,owner),after=deriveCurriculumMaturity(rules,scopes,owner,expected)
 assert.equal(before,'M7');assert.equal(after,'M3')
 rows.push({name,oldMaturity:before,newMaturity:after,globalChecks:rules.filter(r=>r.assessmentValidation).map(r=>({id:r.id,status:r.status,manifest:r.assessmentValidation}))})
}
console.log(JSON.stringify({base,oldFunctionExtractedByTypeScriptAst:true,actualHiddenOfferId:actual.id,rows},null,2))
