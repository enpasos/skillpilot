import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { checkSkillGraphIntegrity } from '../../../../app/scripts/lib/skillGraphIntegrity'
const out = dirname(fileURLToPath(import.meta.url)), root = resolve(out, '../../../..')
const owner = '51b60137-46e8-5498-973e-ea38bb32f327'
const load = (path: string) => JSON.parse(readFileSync(resolve(root,path),'utf8'))
const catalogPins:any[]=[]
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const catalog = readdirSync(resolve(root,'curricula/DE/Gymnasium/canonical')).filter(f=>f.endsWith('.json')&&!/_deck/i.test(f)).sort().map(f=>{
  const sourceFile=`curricula/DE/Gymnasium/canonical/${f}`, bytes=readFileSync(resolve(root,sourceFile)), value=JSON.parse(bytes.toString('utf8'))
  catalogPins.push({path:sourceFile,sha256:hash(bytes)})
  return {landscapeId:value.landscapeId,sourceFile,goals:value.goals}
})
const definitions=JSON.parse(gunzipSync(readFileSync(resolve(out,'definitions-and-bijection.json.gz'))).toString('utf8'))
const fields=JSON.parse(gunzipSync(readFileSync(resolve(out,'active-reference-pointers.json.gz'))).toString('utf8'))
function projected(families: string[]) {
  const selected=new Set(definitions.filter((d:any)=>families.includes(d.family)).map((d:any)=>d.sourceGoalId))
  const copy=structuredClone(catalog)
  for(const entry of copy) for(const field of fields.filter((f:any)=>f.path===entry.sourceFile&&selected.has(f.before.split(':').at(-1)))) {
    const parts=field.pointer.slice(1).split('/').map((s:string)=>s.replace(/~1/g,'/').replace(/~0/g,'~'))
    let container:any=entry
    for(const p of parts.slice(0,-1)) container=container[p]
    if(container[parts.at(-1)!]!==field.before) throw Error('Pointer input drift')
    container[parts.at(-1)!]=field.after
  }
  return copy
}
const reverse = new Map(definitions.map((d:any)=>[d.targetGoalId,d.sourceGoalId]))
const restore = (value:any):any => typeof value==='string' ? [...reverse].reduce((s,[to,from])=>s.replaceAll(to as string,from as string),value) : Array.isArray(value)?value.map(restore):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restore(v)])):value
const before=checkSkillGraphIntegrity(catalog,[owner])
const signature=(report:any)=>JSON.stringify(report.findings.filter((f:any)=>f.ruleId!=='G01a').map(restore).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))
const sum=(r:any)=>({ok:r.ok,checks:r.checks,metrics:r.metrics,findingsByCode:Object.fromEntries([...new Set(r.findings.map((f:any)=>f.code))].map(code=>[code,r.findings.filter((f:any)=>f.code===code).length]))})
const results:any={before:sum(before),cases:{},negativeControls:{},sourceAProbeExecuted:false,runtimeApplied:false}
for(const [name,families] of Object.entries({'BY-PuG11-52':['BY-PuG11-52'],'BY-PuG11-13-151':['BY-PuG11-52','BY-PuG12-55','BY-PuG13-44'],'all-PoWi-157':['memory-6','BY-PuG11-52','BY-PuG12-55','BY-PuG13-44']})) {
  const after=checkSkillGraphIntegrity(projected(families),[owner])
  const equal=signature(before)===signature(after)
  if(!equal) throw Error(`Non-G01a finding semantics changed for ${name}`)
  results.cases[name]={...sum(after),nonG01aFindingSemanticsUnchanged:true}
}
for(const [name,endpoint] of Object.entries({'foreign-owner':'deadbeef-dead-4bee-8fed-0123456789ab:'+definitions[0].sourceGoalId,'unknown-valid-uuid':'deadbeef-dead-4bee-8fed-0123456789ab'})) {
  const copy=structuredClone(catalog), subject=copy.find(c=>c.landscapeId===owner)!
  subject.goals[0].requires=[endpoint]
  const actual=checkSkillGraphIntegrity(copy,[owner]);const rejected=actual.findings.some(f=>f.code==='MISSING_REFERENCE'&&f.goalId===subject.goals[0].id)
  if(!rejected) throw Error(`Native resolver accepted ${name}`)
  results.negativeControls[name]={rejected,matchingFindings:actual.findings.filter(f=>f.code==='MISSING_REFERENCE'&&f.goalId===subject.goals[0].id)}
}
results.nativeCheckerSha256=createHash('sha256').update(readFileSync(resolve(root,'app/scripts/lib/skillGraphIntegrity.ts'))).digest('hex')
results.catalogPins=catalogPins
for(const pin of catalogPins) if(hash(readFileSync(resolve(root,pin.path)))!==pin.sha256) throw Error('Active catalog changed during native observation')
if(catalogPins.find(p=>p.path.endsWith('CANONICAL_POLITIKWIRTSCHAFT.de.json')).sha256!=='dc148f0be7b3156c2014ca1b23137273ce62b9bd44b34ffb28ff43957c224896') throw Error('PoWi source drift')
writeFileSync(resolve(out,'native-check.json'),JSON.stringify(results,null,2)+'\n')
console.log(JSON.stringify({before:results.before.findingsByCode,cases:Object.fromEntries(Object.entries(results.cases).map(([k,v]:any)=>[k,v.findingsByCode])),negativeControls:results.negativeControls},null,2))
