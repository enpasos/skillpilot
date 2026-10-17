import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const O=dirname(fileURLToPath(import.meta.url)),C=resolve(O,'capsule'),h=JSON.parse(readFileSync(resolve(O,'HANDOFF.private-mixed18-and-guarded-root18-CAS.json'),'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const native=await import('/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1/capsule/app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const loaded=await native.loadGoalDescriptionRolloutInFlightLedger()
const claims=new Map<string,string>();for(const b of loaded.activeBatches)for(const id of b.config.goalIds){assert(!claims.has(id));claims.set(id,b.configPath)}
assert.equal(loaded.activeBatches.length,h.currentActiveConfigCount);assert.equal(claims.size,h.currentTotalClaims)
for(const id of h.newNative18GoalIds)assert.equal(claims.get(id),resolve(C,h.newBatchConfigPath))
for(const p of h.immutableSourcePins)assert.equal(hash(p.path),p.sha256.replace(/^sha256:/,''))
for(const old of h.source18OriginalConfigs)assert.equal(hash(old.originalPin.path),old.originalPin.sha256)
assert.equal(hash(h.beforeLedgerPin.path),h.beforeLedgerPin.sha256)
// Historical output existence is preserved; only actual current writers could block the dependent prepare.
const result={schemaVersion:1,role:'Actual stock private-ledger loader plus stronger global duplicate/selected-claim and source byte guard',atUTC:new Date().toISOString(),stockModule:resolve(C,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),ledgerPath:loaded.ledgerPath,ledgerSha256:createHash('sha256').update(loaded.ledgerBytes).digest('hex'),activeConfigs:loaded.activeBatches.length,totalClaims:claims.size,globalDuplicateClaims:0,selected18ClaimedExactlyOnceByNewConfig:true,allOriginal18AndLedgerUnchanged:true,immutableCanonicalPSEMModelBaseAssetPinsUnchanged:true,QAHash:hash(resolve(C,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')),historicalOutputExistencePreserved:true,activeClaims:[...claims].map(([goalId,configPath])=>({goalId,configPath})),prepareExecutions:0,newScientificVotes:0}
assert.equal(result.QAHash,'bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f')
const out=resolve(O,'GUARD.actual-private-stock-ledger-and-global-ownership.before-prepare.json');assert(!existsSync(out));writeFileSync(out,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({activeConfigs:loaded.activeBatches.length,totalClaims:claims.size,globalDuplicateClaims:0,allSourceGuardsPass:true,QAHash:result.QAHash}))
