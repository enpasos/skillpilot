// SPDX-License-Identifier: Apache-2.0
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root = process.cwd()
const {measurePhysicsArrowRoutes,routeEvidenceDirectory} = await import(pathToFileURL(resolve(root,'scripts/physics_arrow_route_validation.ts')).href)
const output = process.argv.find(s => s.startsWith('--output='))?.slice('--output='.length)
if (!output || existsSync(output)) throw Error('Choose a fresh --output path; retained evidence is immutable')
const report = measurePhysicsArrowRoutes(root)
const paths = ['scripts/generate_physics_arrow_places.py','scripts/generate_laender_physics_stage_views.py','scripts/generate_hessen_physics_stage_views.py','scripts/generate_laender_physics_stage_views.sources.json','scripts/physics_arrow_route_validation.ts',`${routeEvidenceDirectory}/source-decisions.actual.json`,'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',...['canonical','composition-views/physik'].flatMap(dir => readdirSync(resolve(root,'curricula/DE/Gymnasium',dir)).filter(n => n.endsWith('.json')).map(n => `curricula/DE/Gymnasium/${dir}/${n}`))]
const bindings = paths.map(path => ({path,sha256:createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')}))
writeFileSync(output,JSON.stringify({...report,bindings},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(report.counts))
if (report.counts.views !== 90 || report.violations.length) throw Error(JSON.stringify(report.violations))
