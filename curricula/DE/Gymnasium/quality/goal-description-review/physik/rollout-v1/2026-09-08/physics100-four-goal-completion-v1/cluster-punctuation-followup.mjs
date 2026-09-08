import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {paths,ids} from './authoring-spec.mjs'
const root=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1',hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(root+'/app/scripts/goalBookModel.ts'))
const c=JSON.parse(fs.readFileSync(paths.canonical,'utf8')),k=JSON.parse(fs.readFileSync(paths.kinds,'utf8')),g=c.goals.find(g=>g.id===ids.nuclear),d=k.decisions.find(d=>d.goalId===ids.nuclear)
if(g.type!=='cluster'||d.semanticKind!=='curricularArea'||d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(g)||!g.description.includes('Ruhemassendifferenzen die Funktionsdeutung'))throw Error('Exact current cluster/lease mismatch')
const beforeDescription=g.description,beforeFingerprint=d.sourceFingerprint;g.description=g.description.replace('Ruhemassendifferenzen die Funktionsdeutung','Ruhemassendifferenzen, die Funktionsdeutung');d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
const spec=base+'/authoring-spec.mjs',oldSpec=fs.readFileSync(spec,'utf8'),oldLine="nc.description=nc.description.replace('sowie die Beurteilung','die Funktionsdeutung eines thermischen Kernreaktors sowie die Beurteilung')",newLine="nc.description=nc.description.replace(' sowie die Beurteilung',', die Funktionsdeutung eines thermischen Kernreaktors sowie die Beurteilung')"
if(!oldSpec.includes(oldLine))throw Error('Exact current authoring expression changed')
const edits=[[paths.canonical,JSON.stringify(c,null,2)+'\n'],[paths.kinds,JSON.stringify(k,null,2)+'\n'],[spec,oldSpec.replace(oldLine,newLine)]]
const receipt={schemaVersion:1,status:'applied-via-exact-punctuation-patch',humanApproval:false,goalId:g.id,beforeDescription,afterDescription:g.description,beforeFingerprint,afterFingerprint:d.sourceFingerprint,ordinaryGoalChanges:0,semanticChanges:0,files:edits.map(([file,after])=>({file,beforeSha256:hash(fs.readFileSync(file)),afterSha256:hash(after)}))}
const patch=['*** Begin Patch'];for(const[file,after]of edits){const diff=spawnSync('diff',['-u',file,'-'],{input:after,encoding:'utf8',maxBuffer:5000000});if(diff.status!==1)throw Error('Expected exact edit');patch.push('*** Update File: '+file,...diff.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}const out=base+'/cluster-punctuation-receipt-a-20260908.json';if(fs.existsSync(out))throw Error('No replay');patch.push('*** Add File: '+out,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch');console.log(patch.join('\n'))
