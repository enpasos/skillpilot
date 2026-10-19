// Apache-2.0. Technical execution of exact unchanged production function bodies.
// This module exposes no source review, content approval or normal write.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emptyGoalVisualizationAiReview, normalizeGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel'
export { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
export {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
export { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../')
const require = createRequire(resolve(root,'app/package.json'))
const ts = require('typescript')
export const productionBodies: {path:string; name:string; exactSource:string}[] = []

function expose(path:string,names:string[],dependencies:Record<string,unknown>={}) {
  const source = readFileSync(resolve(root,path),'utf8')
  const tree=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS)
  const statements=names.map(name=>{
    const node=tree.statements.find((n:any)=>ts.isFunctionDeclaration(n)&&n.name?.text===name
      || ts.isVariableStatement(n)&&n.declarationList.declarations.some((d:any)=>d.name?.text===name))
    if(!node) throw new Error(`Missing original production declaration ${path}:${name}`)
    const text=node.getText(tree)
    productionBodies.push({path,name,exactSource:text})
    return text
  })
  const compiled=ts.transpileModule(statements.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
  const args={createHash,...dependencies}
  return new Function(...Object.keys(args),compiled+'\nreturn {'+names.join(',')+'};')(...Object.values(args))
}

export const A=expose('app/scripts/semanticAtomicityReview.ts',[
  'normalizeText','stableJson','getSemanticPayload','fingerprintGoal','isLeaf',
  'isSemanticAtomicityRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds',
])
export const M=expose('app/scripts/memoryCardReview.ts',[
  'normalizeText','stableJson','fingerprintGoal','isLeaf','isMemoryGoal',
  'isReviewRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds',
])
export const V=expose('app/scripts/generateGoalVisualizationQaLedgers.ts',[
  'normalizeText','normalizeYesNo','createDefaultRecord','normalizeExistingRecord',
],{emptyGoalVisualizationAiReview,normalizeGoalVisualizationAiReview})
