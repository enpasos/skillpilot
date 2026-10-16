// SPDX-License-Identifier: Apache-2.0
// Uses unchanged production functions; creates author records, never review votes.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

async function main() {
  const repo = process.cwd()
  const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const load = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
  const ownLoad = (p: string) => JSON.parse(readFileSync(resolve(own, p), 'utf8'))
  const hash = (b: string | Buffer) => `sha256:${createHash('sha256').update(b).digest('hex')}`
  const write = (p: string, x: unknown) => writeFileSync(resolve(own,p), JSON.stringify(x,null,2)+'\n')
  const helperPath = 'app/scripts/positiveGoalEvidenceProfileModel.ts'
  const helper = await import(pathToFileURL(resolve(repo,helperPath)).href)
  const req = createRequire(resolve(repo,'app/package.json'))
  const Ajv2020 = req('ajv/dist/2020').default
  const addFormats = req('ajv-formats')
  const ajv = new Ajv2020({allErrors:true,strict:false})
  addFormats(ajv)
  const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
  const validate = ajv.compile(load(schemaPath))
  const selector = ownLoad('INPUTS.physical-exact-selector.json')
  const canonical = load(selector.currentCanonical.path)
  const sem = load(selector.semanticLedger.path)
  const kind = new Map(sem.decisions.map((x:any)=>[x.goalId,x.semanticKind]))
  const gs = new Map(canonical.goals.map((x:any)=>[x.id,x]))
  const designs = ownLoad('candidate/fifteen-profile-designs.author.json')
  const casesPath = relative(repo,resolve(own,'materials/thirty-complete-DE-EN-cases.author.json')).replaceAll('\\','/')
  const casesHash = hash(readFileSync(resolve(repo,casesPath)))
  const cases = ownLoad('materials/thirty-complete-DE-EN-cases.author.json').cases
  const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
  const criteriaHash = hash(readFileSync(resolve(repo,criteriaPath)))
  const recordResults:any[]=[]
  const resources:any[]=[]
  const records=designs.map((d:any,i:number)=>{
    const g:any = gs.get(d.goalId)
    const digests:Record<string,string>={}
    for(const link of g.resourceLinks??[]) {
      if(link.type!=='goal-visualization')continue
      const p='app/public'+link.url
      const b=readFileSync(resolve(repo,p))
      digests[link.url]=hash(b)
      resources.push({goalId:g.id,url:link.url,path:p,sha256:hash(b),bytes:b.length,
        handling:'byte-binding-only-no-new-V-vote'})
    }
    const cc=cases.filter((x:any)=>x.goalId===g.id)
    const profile={archetype:d.archetype,expectations:d.expectations,
      coverageExpectations:{requiredExpectationIds:d.expectations.map((x:any)=>x.id),
        alternativeExpectationGroups:[],minimumIndependentDemonstrations:2,
        freshVariationRequired:true,independentTransferRequired:true},
      variationAxes:d.variationAxes,
      applicationCaseBriefs:cc.map((c:any)=>({id:c.caseId,
        taskDemandDe:`Vollständige eigene Materialien, Protokoll und Daten: ${casesPath} #${c.caseId}. ${c.actualTask.de}`,
        taskDemandEn:`Complete original materials, protocol and data: ${casesPath} #${c.caseId}. ${c.actualTask.en}`,
        expectedPerformanceDe:c.expectedReasoningAndSolution.de,
        expectedPerformanceEn:c.expectedReasoningAndSolution.en,
        understandingFocusDe:`Gebundenes Fallmaterial ${casesHash}. ${c.freshIndependentTransfer.de}`,
        understandingFocusEn:`Bound case material ${casesHash}. ${c.freshIndependentTransfer.en}`,
      }))}
    const record={
      $schema:helper.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,
      reviewId:`chemie-lab15-whole-author-20261015-${String(i+1).padStart(2,'0')}`,
      goalFingerprintRuleVersion:helper.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
      profileRuleVersion:helper.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
      reviewCriteriaFingerprint:criteriaHash,landscapeId:canonical.landscapeId,goalId:g.id,
      goalFingerprint:helper.fingerprintGoalForPositiveEvidence(g,kind.get(g.id)),
      reviewInputFingerprint:helper.fingerprintPositiveGoalEvidenceReviewInput(g,criteriaHash,digests,kind.get(g.id)),
      profileFingerprint:helper.fingerprintPositiveGoalEvidenceProfile(profile),
      status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:'2026-10-15T00:00:00.000Z',
      reviewer:'codex-chemie-laboratory-communication15-author',
      reason:`Unreviewed author design E0/G0. Two complete bilingual cases and120 rubric rows across15 goals. Exact material ${casesHash}. No independent D/P/A/M/V vote, learner execution or human approval. Legacy status name is preserved by the production schema; it does not create a human prerequisite for machine M7.`,
      evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],
      dissent:['Source/course/view/acquisition holds remain separate and open; canonical applicability is not source or course clearance. Practical source operators require future actual observable performance; blank observation fields are intentional and no prior learner trial is required for machine M7.'],
      profile,
    }
    const schemaOK=validate(record)
    const semanticErrors=helper.validatePositiveGoalEvidenceRecordSemantics(record,g,digests,kind.get(g.id))
    recordResults.push({goalId:g.id,schemaOK,schemaErrors:schemaOK?[]:structuredClone(validate.errors),
      productionHelperSemanticErrors:semanticErrors,rawStatus:record.status,evidenceLevel:'E0',maximumClaimScope:'G0'})
    return record
  })
  writeFileSync(resolve(own,'candidate/fifteen-profiles.raw-E0G0.author.jsonl'),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
  write('source-context/existing-fifteen-image-byte-bindings.no-new-V.json',resources)
  const errors=recordResults.filter(x=>!x.schemaOK||x.productionHelperSemanticErrors.length)
  write('checks/production-profile-helper.actual.json',{
    command:'app/node_modules/.bin/tsx '+relative(repo,fileURLToPath(import.meta.url)),
    productionHelper:{path:helperPath,sha256:hash(readFileSync(resolve(repo,helperPath)))},
    schema:{path:schemaPath,sha256:hash(readFileSync(resolve(repo,schemaPath)))},
    criteria:{path:criteriaPath,sha256:criteriaHash},cases:{path:casesPath,sha256:casesHash},
    recordCount:records.length,passingRecords:records.length-errors.length,results:recordResults,
    independentApprovals:0,netNewStrictClosures:0,pass:errors.length===0,
  })
  console.log(JSON.stringify({rawProfiles:records.length,passingRecords:records.length-errors.length,
    status:'E0/G0 author-design only',errors}))
  if(errors.length)process.exitCode=1
}
main().catch(error=>{console.error(error);process.exitCode=1})
