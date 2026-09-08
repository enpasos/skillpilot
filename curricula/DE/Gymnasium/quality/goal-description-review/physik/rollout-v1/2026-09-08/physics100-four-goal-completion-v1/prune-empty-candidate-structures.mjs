// Repair only candidate after-values; never refresh a current field lease.
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
const p=new URL('./field-leased-plan.json',import.meta.url).pathname
const before=fs.readFileSync(p,'utf8'),plan=JSON.parse(before)
let removed=0
function clean(v){if(Array.isArray(v))return v.map(clean).filter(x=>x!==null);if(!v||typeof v!=='object')return v;for(const [k,x] of Object.entries(v))v[k]=clean(x);if(v.kind==='structure'&&v.children.length===0){removed++;return null}return v}
for(const op of plan.operations)if(op.kind==='json-field'&&op.after.state==='value'&&op.after.value?.kind==='structure'){op.after.value=clean(op.after.value);if(!op.after.value)op.after.value={kind:'canonicalSubtree',goalId:op.before.value.goalId,projectionRole:'prerequisiteOnly'}}
plan.candidateRevision={reason:'Native CPV-007: prune empty presentation structures after extracting the affected reused leaves; original before leases unchanged.',removedEmptyStructures:removed}
const next=JSON.stringify(plan,null,2)+'\n'
const d=spawnSync('diff',['-u',p,'-'],{input:next,encoding:'utf8',maxBuffer:4000000})
if(d.status!==1)throw Error('Expected candidate correction')
console.log('*** Begin Patch\n*** Update File: '+p+'\n'+d.stdout.trimEnd().split('\n').slice(2).map(x=>/^@@ .* @@/u.test(x)?'@@':x).join('\n')+'\n*** End Patch')
