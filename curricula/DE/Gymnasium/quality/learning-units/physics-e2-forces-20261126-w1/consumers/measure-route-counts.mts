// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const [repository,outputArg]=process.argv.slice(2)
if(!repository||!outputArg)throw Error('Usage: measure-route-counts.mts <repository> <fresh-output>')
const root=path.resolve(repository),output=path.resolve(outputArg)
assert(!fs.existsSync(output),'Retained evidence may not be overwritten')
const digest=(p:string)=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')
const read=(p:string)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))
const predecessorPath='curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/consumers/cqr104-route-counts.actual.json'
assert.equal(digest(predecessorPath),'d43cd7162459b934c4be717df8911be68c80cd1d14fad0475b5983ac17d9d9f5')
const predecessor=read(predecessorPath)
const canonicalRoot='curricula/DE/Gymnasium/canonical',viewRoot='curricula/DE/Gymnasium/composition-views/physik'
const canonicalPaths=fs.readdirSync(path.join(root,canonicalRoot)).filter(p=>p.endsWith('.json')).sort().map(p=>canonicalRoot+'/'+p)
const viewPaths=fs.readdirSync(path.join(root,viewRoot)).filter(p=>p.endsWith('.json')).sort().map(p=>viewRoot+'/'+p)
const inputs=[...canonicalPaths,...viewPaths,'app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts'].map(p=>({path:p,sha256:digest(p)}))
const load=async(p:string)=>import(pathToFileURL(path.join(root,p)).href)
const {buildApplicabilityCompilation}=await load('app/scripts/applicabilityCompiler.ts')
const {createRouteProfiles,evaluateRouteProfile}=await load('app/scripts/generateCurriculumQualityStatus.ts')
const catalog=canonicalPaths.map(file=>({file:path.join(root,file),landscape:read(file)}))
const physics=catalog.find(c=>c.landscape.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')!.landscape
const compilation=buildApplicabilityCompilation(catalog)
const scopes=createRouteProfiles(root).filter(p=>p.landscapeId===physics.landscapeId).map(profile=>evaluateRouteProfile(physics,profile,compilation,catalog.map(c=>c.landscape)))
const lower=scopes.find(s=>s.scopeId==='canonical-physics-sek1')!.rules.find(r=>r.id==='CQR-104')!
assert.equal(lower.status,'pass',JSON.stringify(lower.details))
for(const pin of inputs)assert.equal(digest(pin.path),pin.sha256,'Concurrent input change '+pin.path)
const report={schemaVersion:1,contract:'physics-e2-forces-route-consumer-successor-v1',measuredAt:new Date().toISOString(),method:'Native createRouteProfiles and evaluateRouteProfile on the active full canonical catalog and all current Physics views; no release substitution, no gate changes.',predecessor:{path:predecessorPath,sha256:digest(predecessorPath)},metricsBefore:predecessor.metricsAfter,metricsAfter:lower.metrics,lowerRule:lower,scopes:scopes.map(s=>({scopeId:s.scopeId,rules:s.rules.filter(r=>['CQR-101','CQR-102','CQR-104','CQR-203'].includes(r.id))})),inputs}
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({lower:lower.status,metrics:lower.metrics,upperRelease:report.scopes.find(s=>s.scopeId==='canonical-physics-sek2')?.rules.find(r=>r.id==='CQR-203')}))
