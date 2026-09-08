import fs from 'node:fs'
import Module,{createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {base,ids} from './authoring-spec.mjs'
const root=process.cwd(),file='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',native=root+'/app/scripts/generateGoalVisualizationQaLedgers.ts',require=createRequire(root+'/app/package.json'),ts=require('typescript'),hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
let s=fs.readFileSync(native,'utf8');if(!s.endsWith('\nmain()\n'))throw Error('Native entrypoint changed');s=s.slice(0,-'main()\n'.length).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(native).href))+'\nexport {buildLedgers,serializeLedger};\n'
const m=new Module(native);m.filename=native;m.paths=Module._nodeModulePaths(root+'/app/scripts');m._compile(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,native)
const before=fs.readFileSync(file,'utf8'),current=JSON.parse(before),generated=JSON.parse(m.exports.serializeLedger(m.exports.buildLedgers(new Set(['physik']))[0])),own=current.records.find(r=>r.goalId===ids.crash),next=generated.records.find(r=>r.goalId===ids.crash),fields=Object.keys({...own,...next}).filter(k=>JSON.stringify(own[k])!==JSON.stringify(next[k]))
if(JSON.stringify(fields)!=='["description"]')throw Error('Unexpected own QA metadata delta '+JSON.stringify(fields))
own.description=next.description;const after=JSON.stringify(current,null,2)+'\n',r=spawnSync('diff',['-u',file,'-'],{input:after,encoding:'utf8'});if(r.status!==1)throw Error('Expected own metadata diff')
const receipt={schemaVersion:1,status:'PASS',goalId:ids.crash,changedFields:fields,otherRecordsChanged:0,imageBytesChanged:0,newImageApprovals:0,humanApproval:false,beforeSha256:hash(before),afterSha256:hash(after),visualInspection:'Existing original 2752x1536 image personally inspected: 100000 N × 0.05 s and 25000 N × 0.20 s both 5000 Ns; correct mean-force comparison at fixed momentum change. No safety-distance claim. Existing image remains suited to narrowed goal.'},out=base+'/qa-metadata-receipt-a-20260908.json';if(fs.existsSync(out))throw Error('No replay');console.log(['*** Begin Patch','*** Update File: '+file,...r.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s),'*** Add File: '+out,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch'].join('\n'))
