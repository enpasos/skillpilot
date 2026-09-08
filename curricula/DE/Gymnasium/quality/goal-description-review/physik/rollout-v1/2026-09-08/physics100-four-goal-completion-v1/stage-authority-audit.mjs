// Read-only native stage-authority diagnostic. The native validator source is unchanged.
import fs from 'node:fs'
import Module,{createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const native=process.cwd()+'/app/scripts/generateCurriculumQualityStatus.ts',require=createRequire(process.cwd()+'/app/package.json'),ts=require('typescript')
let source=fs.readFileSync(native,'utf8')
if(!source.endsWith('\nmain()\n'))throw Error('Native entrypoint changed; refuse diagnostic load')
source=source.slice(0,-'main()\n'.length).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(native).href))+'\nexport {collectRenderedAtomicGoalIdsFromCompositionView};\n'
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
const m=new Module(native);m.filename=native;m.paths=Module._nodeModulePaths(process.cwd()+'/app/scripts');m._compile(compiled,native)
const collect=m.exports.collectRenderedAtomicGoalIdsFromCompositionView,c=JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')),goals=new Map(c.goals.map(g=>[g.id,g]))
const out=[]
for(const state of ['bb','be','bw','by','hb','he','hh','mv','ni','nw','rp','sh','sl','sn','st','th']){
 const gk='curricula/DE/Gymnasium/composition-views/physik/de-'+state+'-gk.view.json',lk=gk.replace('-gk.','-lk.')
 if(!fs.existsSync(gk)||!fs.existsSync(lk))continue
 const row={jurisdiction:'DE-'+state.toUpperCase(),files:[gk,lk]}
 for(const [mode,support] of [['target',false],['visibleIncludingPrerequisiteOnly',true]]){
  const a=collect(c,process.cwd()+'/'+gk,['GK'],support,'SekI'),b=collect(c,process.cwd()+'/'+lk,['LK'],support,'SekI')
  const annotate=id=>({goalId:id,title:goals.get(id)?.title,kind:goals.get(id)?.examData?'assessment':'goal'})
  row[mode]={gkCount:a.size,lkCount:b.size,gkOnly:[...a].filter(id=>!b.has(id)).map(annotate),lkOnly:[...b].filter(id=>!a.has(id)).map(annotate)}
 }
 out.push(row)
}
console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),mode:'read-only-native-stage-authority-diagnostic',nativeSourceSha256:'sha256:'+createHash('sha256').update(fs.readFileSync(native)).digest('hex'),humanApproval:false,comparisons:out},null,2))

