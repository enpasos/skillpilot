// Native metadata synchronization only; not a new image/content approval.
import fs from 'node:fs'
import Module,{createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
const root=process.cwd(),file='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',native=root+'/app/scripts/generateGoalVisualizationQaLedgers.ts',require=createRequire(root+'/app/package.json'),ts=require('typescript'),goalId='49872cc0-401f-5464-9235-4763df4db5cf',hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
let source=fs.readFileSync(native,'utf8');if(!source.endsWith('\nmain()\n'))throw Error('Native entrypoint changed');source=source.slice(0,-'main()\n'.length).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(native).href))+'\nexport {buildLedgers,serializeLedger};\n'
const m=new Module(native);m.filename=native;m.paths=Module._nodeModulePaths(root+'/app/scripts');m._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,native)
const before=fs.readFileSync(file,'utf8'),current=JSON.parse(before),generated=JSON.parse(m.exports.serializeLedger(m.exports.buildLedgers(new Set(['physik']))[0])),own=current.records.find(r=>r.goalId===goalId),next=generated.records.find(r=>r.goalId===goalId)
const changedFields=Object.keys({...own,...next}).filter(k=>JSON.stringify(own[k])!==JSON.stringify(next[k]));if(JSON.stringify(changedFields)!==JSON.stringify(['description']))throw Error('Expected only own descriptive metadata, got '+JSON.stringify(changedFields))
own.description=next.description;const after=JSON.stringify(current,null,2)+'\n',diff=spawnSync('diff',['-u',file,'-'],{input:after,encoding:'utf8'});if(diff.status!==1)throw Error('Expected one metadata diff')
const receipt={schemaVersion:1,status:'native-metadata-only-splice',goalId,changedFields,imageBytesChanged:0,newImageApprovals:0,otherQaRecordsChanged:0,humanApproval:false,beforeSha256:hash(before),afterSha256:hash(after),assetSha256:own.assetSha256,nativeGeneratedOtherRowsEqual:current.records.filter(r=>r.goalId!==goalId).every(r=>JSON.stringify(r)===JSON.stringify(generated.records.find(n=>n.goalId===r.goalId)))}
const output='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1/cluster-qa-metadata-receipt-a-20260908.json';if(fs.existsSync(output))throw Error('No replay')
console.log(['*** Begin Patch','*** Update File: '+file,...diff.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s),'*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch'].join('\n'))
