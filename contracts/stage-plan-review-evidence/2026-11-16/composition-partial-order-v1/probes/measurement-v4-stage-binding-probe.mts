import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const root='/home/enpasos/projects/skillpilot/',base=root+'tmp/pipeline/laender-stufen/gesamt/review/measurement-board-v4/'
const main=readFileSync(base+'stage-final-main.mts','utf8'),v3=readFileSync(root+'tmp/pipeline/laender-stufen/gesamt/measure-actual-v3.mts','utf8')
const kernel=(s:string)=>s.slice(s.indexOf('        const childOf ='),s.indexOf('        const kinds:'))
assert.equal(kernel(main),kernel(v3),'The E2/E3 semantic kernel must stay byte-identical')
const expr=/const dedicatedExaminationBoard = ([\s\S]*?)\n        const canonicalThematicBoard/.exec(main)![1]
const decide=new Function('input',`const {level,stageKey,unitEntryVerified,sourceIdentityVerified,unitKids,atoms,canonicalExamAtom,subjectId,PHYSICS,physicsCanonicalCollectionComplete,exactPhysicsExamSource}=input;return (${expr});`)
const baseCase={level:1,stageKey:'sek2',unitEntryVerified:true,sourceIdentityVerified:true,unitKids:[],atoms:['exam'],canonicalExamAtom:()=>true,subjectId:'physics',PHYSICS:'physics',physicsCanonicalCollectionComplete:true,exactPhysicsExamSource:true}
const cases:any[]=[]
function test(name:string,expected:boolean,patch:any){const actual=decide({...baseCase,...patch});cases.push({name,expected,actual});assert.equal(actual,expected,name)}
test('genuine complete Physics SekII examination',true,{})
test('SekI never receives Abitur allowance',false,{stageKey:'sek1'})
test('undefined stage never receives Abitur allowance',false,{stageKey:undefined})
for(const level of [0,2])test('wrong level '+level,false,{level})
test('missing actual unit binding',false,{unitEntryVerified:false})
test('wrong source identity',false,{sourceIdentityVerified:false})
test('ambiguous subunits',false,{unitKids:['another-unit']})
test('empty collection',false,{atoms:[]})
test('non-examination content',false,{canonicalExamAtom:()=>false})
test('incomplete actual course collection',false,{physicsCanonicalCollectionComplete:false})
test('legacy-looking unit key cannot bypass invalid actual source',false,{exactPhysicsExamSource:false})
test('valid legacy Math branch remains supported',true,{subjectId:'math',physicsCanonicalCollectionComplete:false,exactPhysicsExamSource:false})

const stageBlock=/const stageSourceGoals = ([\s\S]*?)\n      const boards:/.exec(main)![0].replace(/\n      const boards:$/, '')
const stageTrace=new Function('unitPreview','index','subjectId','views','stageKey',stageBlock+';return stageSource;')
const sourceId='actual-source-stage-goal',physics='physics',viewId='de-de-gym-seki-physics'
const sourceGoal={id:sourceId,landscapeId:physics,extendedData:{compositionViewId:viewId,compositionNodeId:'physics-seki'}}
const preview=new Map([[sourceId,{key:'sek1'}]])
const sourceIndex=new Map([[sourceId,sourceGoal]])
const stageCases:any[]=[]
function stageCase(name:string,expected:any,units:any=preview,index:any=sourceIndex,subject=physics,selectedView=viewId,key='sek1'){
 const actual=stageTrace({units},index,subject,[{viewId:'math'},{viewId:selectedView}],key);stageCases.push({name,expected,actual});assert.equal(actual,expected,name)
}
stageCase('synthetic product stage ID absent from goal index still binds actual source stage','physics-seki')
stageCase('missing source preview',null,new Map())
stageCase('preview source missing in index',null,preview,new Map())
stageCase('wrong subject source',null,preview,new Map([[sourceId,{...sourceGoal,landscapeId:'math'}]]))
stageCase('wrong selected source view',null,preview,sourceIndex,physics,'foreign-view')
stageCase('wrong stage key',null,preview,sourceIndex,physics,viewId,'sek2')
stageCase('source without compositionNodeId',null,preview,new Map([[sourceId,{...sourceGoal,extendedData:{compositionViewId:viewId}}]]))
stageCase('ambiguous source stage goals',null,new Map([...preview,['another',{key:'sek1'}]]),new Map([...sourceIndex,['another',{...sourceGoal,id:'another'}]]))
stageCase('foreign subject stage cannot create ambiguity','physics-seki',new Map([...preview,['math-stage',{key:'sek1'}]]),new Map([...sourceIndex,['math-stage',{...sourceGoal,landscapeId:'math'}]]))

const h=(s:string)=>createHash('sha256').update(s).digest('hex')
const report={at:new Date().toISOString(),status:'PASS',v4MainSha256:h(main),v3MainSha256:h(v3),E2E3KernelByteIdentical:true,kernelSha256:h(kernel(main)),productionPredicateExtracted:true,cases,stageSourceTraceCases:stageCases,scope:'Independent evaluation of the actual final-main predicate; complements 38 helper mutations. No product/runtime/model changes.'}
writeFileSync(base+'main-stage-final-review.actual.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,cases:cases.length,stageSourceTraceCases:stageCases.length,E2E3KernelByteIdentical:true,main:report.v4MainSha256}))
