import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const directory='/dev/shm/curriculum-ci-parallel-core-candidate-20261107'
const testSource=readFileSync(`${directory}/candidate-root/scripts/plugin_ci_workflows.test.mjs`,'utf8')
const suffix=testSource.slice(testSource.indexOf('// Proposal: append to scripts/plugin_ci_workflows.test.mjs'))
assert.ok(suffix.startsWith('// Proposal: append'))
const definitions=suffix.slice(suffix.indexOf('function curriculumDagJob'),suffix.indexOf('\ntest('))
const mutationTest=suffix.slice(suffix.indexOf("test('Curriculum final gate wiring rejects skip paths, lost dependencies and detached integration', () => {"))
const start=mutationTest.indexOf('() => {\n')+'() => {\n'.length
const prelude=mutationTest.slice(start,mutationTest.indexOf('\n  for (const [name, mutant] of mutations)'))
assert.ok(prelude.includes('const mutations = ['))
const helpers=new Function('assert',`${definitions}\nreturn {validate: assertCurriculumFinalGate, mutations: (ci) => {${prelude}; return mutations;}}`)(assert)
const ci=readFileSync(`${directory}/candidate-root/.github/workflows/ci.yml`,'utf8')
helpers.validate(ci)
const mutations=helpers.mutations(ci)
assert.equal(mutations.length,19)
const rows=[]
for(const [name,mutant] of mutations){
 assert.notEqual(mutant,ci,name)
 let rejection
 try {helpers.validate(mutant)} catch(error){rejection=error}
 assert.ok(rejection,name)
 rows.push({name,changedWorkflow:true,rejected:true,mutantSha256:createHash('sha256').update(mutant).digest('hex'),rejectionType:rejection.name,rejectionMessage:rejection.message})
}
writeFileSync(`${directory}/dag-artifact-mutations.json`,JSON.stringify({method:'Unmodified validator definitions and exact 19 mutation expressions extracted from the candidate normal Node test file; evaluate YAML strings only',extractedDefinitionsSha256:createHash('sha256').update(definitions).digest('hex'),extractedMutationExpressionsSha256:createHash('sha256').update(prelude).digest('hex'),caseCount:rows.length,rejectedCases:rows.length,sourceACommandsExecuted:false,workflowCommandsExecuted:false,cases:rows},null,2)+'\n')
console.log(JSON.stringify({caseCount:rows.length,rejectedCases:rows.length,sourceACommandsExecuted:false}))
