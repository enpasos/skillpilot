// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const repo=process.cwd(),own=resolve(process.argv[2]),read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const req=createRequire(resolve(repo,'app/package.json')),Ajv=req('ajv/dist/2020.js').default,addFormats=req('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const fix=read(resolve(own,'checks/CORRECTION.closed-positive-config-lowercase-technical-review-id.json'))
const cfg=read(fix.correctedConfig.path),vCfg=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')),vRec=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
assert.ok(vCfg(cfg),ajv.errorsText(vCfg.errors))
const rows=readFileSync(resolve(repo,cfg.reviewPath),'utf8').trim().split('\n').map((x:string)=>JSON.parse(x))
assert.equal(rows.length,5);for(const r of rows)assert.ok(vRec(r),r.goalId+': '+ajv.errorsText(vRec.errors))
const out=resolve(own,'checks/PREFLIGHT.closed-actual-P5-config-and-five-record-schemas.PASS.json');assert.ok(!existsSync(out));writeFileSync(out,JSON.stringify({schemaVersion:1,actualConfigSchema:'PASS',actualRecordSchemas:5,normalRunClaims:0,newScienceVotes:0},null,2)+'\n');console.log(JSON.stringify({closedConfig:'PASS',closedRecords:5,runClaims:0}))
