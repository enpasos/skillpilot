// From the pinned checkout with app/node_modules/.bin/tsx. Edits only in-memory copies.
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const git=(...args:string[])=>execFileSync('git',args,{encoding:'utf8'})
const head=git('rev-parse','HEAD').trim()
if(!head.startsWith('a88f17523b')) throw Error('Run on reviewed commit')
const {readCompositionChildOrder}=await import(pathToFileURL(join(process.cwd(),'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const path='curricula/DE/Gymnasium/composition-views/physik/de-he-gk-g9.view.json'
const file=JSON.parse(git('show',head+':'+path))
const find=(nodes:any[]):any=>nodes.flatMap(n=>[n,...(n.children?find(n.children):[])])
const node=find(file.rootNodes).find((n:any)=>n.id==='physics-e2-newton-and-conservation')
const ids=node.children.filter((c:any)=>c.kind==='structure').map((c:any)=>c.id)
const after=node.childOrder.after
const extra={unit:'physics-e2-momentum',after:'physics-e2-force-mass-acceleration'}
const result=[['as-reviewed',after],['missing-energy-demand',after.filter((p:any)=>p.unit!=='physics-e2-energy')],['add-transitively-redundant', [...after,extra]]].map(([id,pairs])=>{
  try {readCompositionChildOrder({after:pairs}, ids);return {id,accepted:true}}
  catch(e) {return {id,accepted:false,reason:String(e)}}
})
console.log(JSON.stringify({head,path,invoked:'readCompositionChildOrder called by compileCompositionView CPV-010',result},null,2))
