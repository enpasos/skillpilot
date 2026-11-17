import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {isExactSourceExaminationCollection as exact,isCanonicalPhysicsThematicBoard as theme} from './final-helper.ts'
const root='/home/enpasos/projects/skillpilot/',base=root+'tmp/pipeline/laender-stufen/gesamt/review/measurement-board-v4/'
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const raw=JSON.parse(readFileSync(root+'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','utf8'))
const catalog=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const leaves=(id:string):string[]=>catalog.get(id).contains.length?catalog.get(id).contains.flatMap(leaves):[id]
const expected=new Set(leaves('61684ca7-b725-534f-944b-c7645cea1792'))
const structure=(id:string,children:any[])=>({kind:'structure',id,label:id,children})
const source={compositionViewId:'native-physics',compositionNodeId:'final-assessment-collection'}
const view={viewId:source.compositionViewId,landscapeId:raw.landscapeId,scope:{schoolForm:'Gymnasium',stage:'SekII',courseProfile:'GK'},rootNodes:[structure(source.compositionNodeId,[{kind:'canonicalSubtree',goalId:'61684ca7-b725-534f-944b-c7645cea1792'}])]}
const cases:any[]=[]
function test(name:string,want:boolean,run:()=>boolean){let actual:any;try{actual=run()}catch(e){actual='throws:'+String(e)}cases.push({name,expected:want,actual,pass:want===actual})}
const clone=()=>structuredClone(view)
test('exact canonical GK collection without abitur ID substring',true,()=>exact(source,[view],expected,catalog))
const lk=clone();lk.rootNodes[0].children=[{kind:'canonicalSubtree',goalId:'79028c45-90ae-57eb-8016-f5a96af18fa2'}];test('exact canonical LK collection',true,()=>exact(source,[lk],new Set(leaves('79028c45-90ae-57eb-8016-f5a96af18fa2')),catalog))
test('missing source view',false,()=>exact(source,[],expected,catalog))
test('ambiguous source view',false,()=>exact(source,[view,clone()],expected,catalog))
for(const field of ['compositionViewId','compositionNodeId']as const)test('unresolved '+field,false,()=>exact({...source,[field]:null},[view],expected,catalog))
const ambiguous=clone();ambiguous.rootNodes.push(structuredClone(ambiguous.rootNodes[0]));test('ambiguous node identity',false,()=>exact(source,[ambiguous],expected,catalog))
const missing=clone();missing.rootNodes[0].children=[...expected].slice(1).map(goalId=>({kind:'goalEntry',goalId}));test('missing exam atom',false,()=>exact(source,[missing],expected,catalog))
const extra=clone();extra.rootNodes[0].children.push({kind:'goalEntry',goalId:leaves('79028c45-90ae-57eb-8016-f5a96af18fa2').find(id=>!expected.has(id))!});test('extra exam atom',false,()=>exact(source,[extra],expected,catalog))
const nonExam=clone();nonExam.rootNodes[0].children.push({kind:'goalEntry',goalId:'628928a6-4f48-54dc-952d-dec0e69dc856'});const nc=new Map(catalog);nc.set('628928a6-4f48-54dc-952d-dec0e69dc856',{type:'atomic',nodeKind:'tutor',contains:[]});test('non-exam content',false,()=>exact(source,[nonExam],expected,nc))
const unknown=clone();unknown.rootNodes[0].children.push({kind:'goalEntry',goalId:'unknown'});test('unknown canonical reference',false,()=>exact(source,[unknown],expected,catalog))
const excluded=clone();excluded.rootNodes[0].children[0].projectionRole='prerequisiteOnly';test('scope exclusion does not prove exam',false,()=>exact(source,[excluded],expected,catalog))
const opaque=clone();opaque.rootNodes[0].children[0].kind='goalEntry';test('opaque cluster goalEntry does not expand to visible exam atoms',false,()=>exact(source,[opaque],expected,catalog))
const cycle=new Map(catalog);cycle.set('61684ca7-b725-534f-944b-c7645cea1792',{type:'cluster',contains:['61684ca7-b725-534f-944b-c7645cea1792']});test('canonical contains cycle',false,()=>exact(source,[view],expected,cycle))
const context={authorization:'national-canonical-no-Land-plan-or-duration-claim',scope:{schoolForm:'Gymnasium',stage:'SekI'}}
const thematic={viewId:'de-de-gym-seki-physics',landscapeId:raw.landscapeId,scope:{schoolForm:'Gymnasium',stage:'SekI'},rootNodes:[structure('physics-root',[structure('physics-seki',[structure('physics-seki-light',[])])])]}
const binding={unitEntryVerified:true,stageSourceCompositionNodeId:'physics-seki',sourceUnitNodes:[{subjectId:raw.landscapeId,compositionViewId:thematic.viewId,compositionNodeId:'physics-seki-light'}]}
const call=(c:any=context,v:any=thematic,s=raw.landscapeId,stage='sek1',level=1,b:any=binding)=>theme(c,v,s,stage,level,raw.landscapeId,b)
test('canonical Physics thematic contents',true,()=>call())
test('foreign Land context',false,()=>call({...context,scope:{...context.scope,jurisdiction:'DE-BW'}}))
test('foreign Land view',false,()=>call(context,{...thematic,scope:{...thematic.scope,jurisdiction:'DE-BW'}}))
test('wrong subject',false,()=>call(context,thematic,'math'))
test('wrong stage',false,()=>call(context,thematic,raw.landscapeId,'sek2'))
for(const level of [0,2])test('wrong level '+level,false,()=>call(context,thematic,raw.landscapeId,'sek1',level))
test('unresolved source identity',false,()=>call(context,{...thematic,viewId:'invented-unselected-view'}))
test('missing actual source node',false,()=>call(context,{...thematic,rootNodes:[]}))
test('unreviewed duration',false,()=>call({...context,scope:{...context.scope,durationModel:'G8'}}))
test('missing unitEntryIds binding',false,()=>call(context,thematic,raw.landscapeId,'sek1',1,{...binding,unitEntryVerified:false}))
test('wrong source stage node',false,()=>call(context,thematic,raw.landscapeId,'sek1',1,{...binding,stageSourceCompositionNodeId:'physics-q1'}))
test('missing preview source',false,()=>call(context,thematic,raw.landscapeId,'sek1',1,{...binding,sourceUnitNodes:[]}))
test('ambiguous preview source',false,()=>call(context,thematic,raw.landscapeId,'sek1',1,{...binding,sourceUnitNodes:[...binding.sourceUnitNodes,...binding.sourceUnitNodes]}))
for(const field of ['subjectId','compositionViewId','compositionNodeId'])test('wrong preview source '+field,false,()=>call(context,thematic,raw.landscapeId,'sek1',1,{...binding,sourceUnitNodes:[{...binding.sourceUnitNodes[0],[field]:'wrong'}]}))
const duplicateTopic=structuredClone(thematic);duplicateTopic.rootNodes[0].children[0].children.push(structuredClone(duplicateTopic.rootNodes[0].children[0].children[0]));test('ambiguous actual thematic source',false,()=>call(context,duplicateTopic))
const nested=structuredClone(thematic);nested.rootNodes[0].children[0].children=[structure('another-topic',nested.rootNodes[0].children[0].children)];test('source is not an immediate theme child',false,()=>call(context,nested))
for(const ids of [['de-de-gym-physics-gk','de-de-gym-physics-lk'],['de-de-gym-physics-lk','de-de-gym-physics-gk']]){const v={...thematic,viewId:'merged:'+ids.join('+')};test('consistent GK/LK '+ids[0],true,()=>call(context,v,raw.landscapeId,'sek1',1,{...binding,sourceUnitNodes:[{...binding.sourceUnitNodes[0],compositionViewId:v.viewId}]}))}
for(const ids of [['de-de-gym-physics-gk','de-de-gym-physics-gk'],['de-de-gym-physics-gk','de-de-gym-sekii-physics-lk'],['de-de-gym-physics-gk','foreign-view']]){const v={...thematic,viewId:'merged:'+ids.join('+')};test('invalid merged identity '+ids.join('+'),false,()=>call(context,v,raw.landscapeId,'sek1',1,{...binding,sourceUnitNodes:[{...binding.sourceUnitNodes[0],compositionViewId:v.viewId}]}))}
const report={at:new Date().toISOString(),status:cases.every(c=>c.pass)?'PASS':'FAIL',pins:{helper:hash(base+'final-helper.ts'),main:hash(base+'final-main.mts')},cases,scope:'Independent first-pass audit predicate mutations. Does not alter product projection or E2/E3.'}
writeFileSync(base+'final-review.actual.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,total:cases.length,failed:cases.filter(c=>!c.pass)},null,2))
