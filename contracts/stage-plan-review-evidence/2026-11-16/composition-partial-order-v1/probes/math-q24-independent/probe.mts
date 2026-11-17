import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
const root='/home/enpasos/projects/skillpilot/'
const read=(p)=>JSON.parse(readFileSync(root+p,'utf8'))
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const viewPath='curricula/DE/Gymnasium/composition-views/mathematik/de-bb-gk.view.json'
const landscape=normalizeCanonicalLandscape(read(canonicalPath))
const goalById=new Map(landscape.goals.map(g=>[g.id,g]))
const statisticsSourceIds = ['65cacc1f-e961-5e47-b8fa-764c40c129a7', 'd5054d79-6483-5d8a-a33b-b074f1cd5904']
assert.deepEqual(statisticsSourceIds.map(id => goalById.get(id)?.title),
  ['Q3.5 Statistik: Kenngrößen', 'Q3.5 Statistik: Datenanalyse und Modellvergleich'])

function check(view,name='actual BB view'){
  const expectedSourceWarnings = view.scope.stage === 'SekI' ? []
    : view.scope.jurisdiction === 'DE-BB' ? statisticsSourceIds.slice(0, 1)
      : view.scope.jurisdiction === 'DE-NI' ? statisticsSourceIds.slice(1)
        : !view.scope.jurisdiction || view.scope.jurisdiction === 'DE-NW' ? statisticsSourceIds : []
  assert.deepEqual(compileCompositionView(view, landscape).findings
    .map(({ code, severity, goalId }) => ({ code, severity, goalId }))
    .sort((a, b) => (a.goalId ?? '').localeCompare(b.goalId ?? '')),
  expectedSourceWarnings.map(goalId => ({ code: 'CPV-102', severity: 'warning', goalId }))
    .sort((a, b) => a.goalId.localeCompare(b.goalId)), `${name}: unexpected composition finding`)

}
const current=normalizeCompositionView(read(viewPath))
const results=[]
const pass=(name,fn)=>{fn();results.push({name,status:'PASS'})}
const reject=(name,fn)=>{assert.throws(fn);results.push({name,status:'REJECTED_AS_EXPECTED'})}
pass('actual known title warning accepted',()=>check(current))
const reversed=structuredClone(current);reversed.rootNodes.reverse()
pass('array order is not the diagnostic contract',()=>check(reversed))
const unknown=structuredClone(current);unknown.rootNodes.push({kind:'goalEntry',goalId:'00000000-0000-4000-8000-000000000000'})
reject('real unresolved goal reference still fails',()=>check(unknown))
const duplicate=structuredClone(current);duplicate.rootNodes.push({kind:'goalEntry',goalId:statisticsSourceIds[0]})
reject('duplicate known warning is not silently accepted',()=>check(duplicate))
const unexpected=structuredClone(current);unexpected.rootNodes.push({kind:'goalEntry',goalId:statisticsSourceIds[1]})
reject('other known statistics title in wrong jurisdiction fails',()=>check(unexpected))
const missing=structuredClone(current)
function remove(nodes){return nodes.filter(n=>n.goalId!==statisticsSourceIds[0]).map(n=>n.children?{...n,children:remove(n.children)}:n)}
missing.rootNodes=remove(missing.rootNodes)
reject('missing expected canonical warning fails',()=>check(missing))
const other=landscape.goals.find(g=>g.contains.length===0&&!statisticsSourceIds.includes(g.id))
const otherTitle=other.title;other.title='Q3.5 Unexpected extra title'
const extra=structuredClone(current);extra.rootNodes.push({kind:'goalEntry',goalId:other.id})
reject('extra CPV102 for another goal fails',()=>check(extra))
other.title=otherTitle
function checkFindings(view,findings,name="diagnostic mutation"){
  const expectedSourceWarnings = view.scope.stage === 'SekI' ? []
    : view.scope.jurisdiction === 'DE-BB' ? statisticsSourceIds.slice(0, 1)
      : view.scope.jurisdiction === 'DE-NI' ? statisticsSourceIds.slice(1)
        : !view.scope.jurisdiction || view.scope.jurisdiction === 'DE-NW' ? statisticsSourceIds : []
  assert.deepEqual(findings
    .map(({ code, severity, goalId }) => ({ code, severity, goalId }))
    .sort((a, b) => (a.goalId ?? '').localeCompare(b.goalId ?? '')),
  expectedSourceWarnings.map(goalId => ({ code: 'CPV-102', severity: 'warning', goalId }))
    .sort((a, b) => a.goalId.localeCompare(b.goalId)), `${name}: unexpected composition finding`)
}
const real=compileCompositionView(current,landscape).findings
reject('known goal error cannot pass as warning',()=>checkFindings(current,real.map(f=>({...f,severity:'error'}))))
reject('another diagnostic code cannot pass as CPV102',()=>checkFindings(current,real.map(f=>({...f,code:'CPV-002'}))))
const hash=p=>createHash('sha256').update(readFileSync(root+p)).digest('hex')
const result={status:'PASS',results,reviewedTestSha256:hash('app/scripts/testHessenMathQ24Q25Scope.ts'),inputPins:{[canonicalPath]:hash(canonicalPath),[viewPath]:hash(viewPath)},limits:'Focused independent actual compiler mutations plus exact diagnostic predicate; full 100-view suite was executed separately by Root. No live source edits.'}
writeFileSync(new URL('./review.actual.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
