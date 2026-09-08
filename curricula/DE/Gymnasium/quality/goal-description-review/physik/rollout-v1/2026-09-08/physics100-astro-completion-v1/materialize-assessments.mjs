// Package materials only; explicit apply_patch edits, no canonical or registry writes.
import {readFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {newAssessments,packagePath,renderAssessmentMaterial} from './assessment-drafts.mjs'
import {additionalTerminalTasks} from './additional-terminal-tasks.mjs'
const decisions=JSON.parse(readFileSync(packagePath+'/current-assessment-decisions.json','utf8'))
const old='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-assessment-debt-proposals-v1/authoring-input.json'
const d=JSON.parse(readFileSync(old,'utf8')).drafts.find(g=>g.goalId.startsWith('335a'))
const goals=[...structuredClone(newAssessments),...structuredClone(additionalTerminalTasks),{...structuredClone(d),id:d.goalId}]
let patch='*** Begin Patch\n'
const receipts=[]
for(const goal of goals){
  const e=goal.examData,body={requires:goal.requires,taskContent:e.taskContent,taskContentEn:e.taskContentEn,solutionContent:e.solutionContent,solutionContentEn:e.solutionContentEn,scoring:e.scoring}
  const hash='sha256:'+createHash('sha256').update(JSON.stringify(body)).digest('hex')
  const decision=decisions.decisions.find(d=>d.goalId===goal.id)
  if(!decision||hash!==decision.contentSha256)throw Error('Body hash mismatch '+goal.id)
  e.reviewStatus=decision.releaseStatus
  const path=goal.id.startsWith('335a')?packagePath+'/assessments/335a.md':e.sourceArtifactPath
  const after=renderAssessmentMaterial(goal)
  if(existsSync(path)){
    const before=readFileSync(path,'utf8')
    if(before!==after){
      const permittedNewTerminal=additionalTerminalTasks.some(g=>g.id===goal.id)
      if(before.replace('Status: needs_review.','Status: released.')!==after&&!(permittedNewTerminal&&before.replace('Status: needs_review.','Status: released.').replace(/\s/g,'')===after.replace(/\s/g,'')))throw Error('Existing task body differs; explicit review needed '+path)
      patch+='*** Update File: '+path+'\n@@\n'+before.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n'+after.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n'
    }
  }
  else patch+='*** Add File: '+path+'\n'+after.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n'
  receipts.push({goalId:goal.id,path,bodySha256:hash,reviewStatus:e.reviewStatus,covered:goal.requires,points:e.scoring.maxPoints})
}
const path=packagePath+'/assessments.md'
const text='# B040 – konkret bereitgestellte Aufgaben\n\nAlle elf vollständigen DE/EN-Aufgaben enthalten Material, Lösung und BE-Rubrik. Neun neue Endpunkte prüfen je genau ein Atom, der kohärente Exoplaneten-Endpunkt drei und335a zwei. Der konkrete Freigabestand steht je Aufgabe und ist in current-assessment-decisions.json inhaltsgebunden. Freigaben sind ausdrücklich autorisierte KI-Autoren-/Gegenprüfungsentscheidungen, keine menschliche QA und kein D/P-Abschluss.\n\n'+receipts.map(r=>`- [${r.goalId}](assessments/${r.path.split('/').at(-1)}): ${r.points} BE, ${r.reviewStatus}; tatsächliche Ziele ${r.covered.join(', ')}.`).join('\n')+'\n\n335a: d=20pc; L=3,8295847566×10^27 W; L-Grenzen 3,5406663800×10^27 bis4,1553654043×10^27 W. z=0,00700898979/0,01401797958/0,02102696937; H≈70,0899 km s⁻¹ Mpc⁻¹. Der Zahlenbeleg ist kein Zusatzclaim für die außerhalb der zwei Ziele liegenden Verfahren.\n\n4a58 bleibt außerhalb dieser vollständigen Aufgabenprüfung: Nur die drei in Fachcluster konvertierten Astro-Altclaims entfallen, alle übrigen historischen Claims bleiben ausdrücklich ungeprüft erhalten.\n'
if(existsSync(path)){const before=readFileSync(path,'utf8');if(before!==text)patch+='*** Update File: '+path+'\n@@\n'+before.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n'+text.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n'}
else patch+='*** Add File: '+path+'\n'+text.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n'
patch+='*** End Patch\n'
console.log(patch)
