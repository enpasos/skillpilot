// Reuse the established read-only real-generator harness; add exact 4a2 refs
// to its placement-identity assertion and execute only the relevant RP writer.
import fs from 'node:fs'
const file='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1/test-view-generator-replay.mjs'
let s=fs.readFileSync(file,'utf8')
for(const [from,to]of [["for(const state of ['Bb','Hh','Rp','Sn','Sl','Th'])","for(const state of ['Rp'])"],["const ownWrapper=","ids.add('4a2bf015-052b-4af0-aed7-324259fa1a8a')\nconst ownWrapper="],["scope:'B034 exact explicit references, other generated nodes unchanged, native CPV and honest current-target drift diagnostic; not a whole-generator source-coverage or global M6 approval'","scope:'Traffic consolidation: actual RP generator replay preserves every current exact 4a2 stage/ref/role plus prior B034 refs; native compiler checks and honest unrelated target drift diagnostic, no global M6 claim'"]]){if(!s.includes(from))throw Error('Harness seam changed');s=s.replace(from,to)}
await import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'))
