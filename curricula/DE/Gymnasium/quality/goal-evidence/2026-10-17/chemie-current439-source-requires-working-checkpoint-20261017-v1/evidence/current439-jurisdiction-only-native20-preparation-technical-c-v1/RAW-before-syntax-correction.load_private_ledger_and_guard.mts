import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const O=dirname(fileURLToPath(import.meta.url)),C=resolve(O,'capsule'),h=JSON.parse(readFileSync(resolve(O,'HANDOFF.private-administrative-ledger-20-and-future-union.json'),'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const native=await import('/mnt/e/skillpilot-chemie-L7-20261017/current439-jurisdiction-only-native20-preparation-technical-c-v1/capsule/app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const loaded=await native.loadGoalDescriptionRolloutInFlightLedger()
const claims=new Map<string,string>();for(const b of loaded.activeBatches)for(const id of b.config.goalIds){assert(!claims.has(id));claims.set(id,b.configPath)}
assert.equal(loaded.activeBatches.length,16);assert.equal(claims.size,182)
for(const id of h.newNative20GoalIds)assert.equal(claims.get(id),resolve(C,h.newBatchConfigPath))
for(const p of h.immutableSourcePins)assert.equal(hash(p.path),p.sha256.replace(/^sha256:/,''))
for(const old of h.source15OriginalConfigs)assert.equal(hash(old.originalPin.path),old.originalPin.sha256)
assert.equal(hash(h.beforeLedgerPin.path),h.beforeLedgerPin.sha256)
for(const old of h.changedOldClaimScopes)assert(!existsSync(resolve(h.immutableSourcePins[0].path.split('/curricula/')[0],old.oldOutputDirectory))))
const result={schemaVersion:1,role:'Actual stock private-ledger loader plus stronger global duplicate/selected-claim and source byte guard',atUTC:new Date().toISOString(),stockModule:resolve(C,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),ledgerPath:loaded.ledgerPath,ledgerSha256:createHash('sha256').update(loaded.ledgerBytes).digest('hex'),activeConfigs:loaded.activeBatches.length,totalClaims:claims.size,globalDuplicateClaims:0,selected20ClaimedExactlyOnceByNewConfig:true,allOriginal15AndLedgerUnchanged:true,immutableCanonicalPSEMModelBaseAssetPinsUnchanged:true,QAHash:hash(resolve(C,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')),matchingOldMaterializationsAbsent:true,activeClaims:[...claims].map(([goalId,configPath])=>({goalId,configPath})),prepareExecutions:0,newScientificVotes:0}
assert.equal(result.QAHash,'bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f')
const out=resolve(O,'GUARD.actual-private-stock-ledger-and-global-ownership.before-prepare.json');assert(!existsSync(out));writeFileSync(out,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({activeConfigs:16,totalClaims:182,globalDuplicateClaims:0,allSourceGuardsPass:true,QAHash:result.QAHash}))
