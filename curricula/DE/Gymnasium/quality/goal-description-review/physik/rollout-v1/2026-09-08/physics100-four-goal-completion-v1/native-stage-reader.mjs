// Read-only access to the unchanged native stage selector; no native main/report writes.
import fs from 'node:fs'
import Module,{createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
const native=process.cwd()+'/app/scripts/generateCurriculumQualityStatus.ts',require=createRequire(process.cwd()+'/app/package.json'),ts=require('typescript')
let source=fs.readFileSync(native,'utf8')
if(!source.endsWith('\nmain()\n'))throw Error('Native entrypoint changed')
source=source.slice(0,-'main()\n'.length).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(native).href))+'\nexport {collectRenderedAtomicGoalIdsFromCompositionView};\n'
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
const m=new Module(native);m.filename=native;m.paths=Module._nodeModulePaths(process.cwd()+'/app/scripts');m._compile(compiled,native)
export const collectNativeStageGoals=m.exports.collectRenderedAtomicGoalIdsFromCompositionView
