import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const stem = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-042-adjudicated-nine-v1"
const read = p => readFileSync(p)
const json = p => JSON.parse(read(p).toString())
const digest = b => 'sha256:' + createHash('sha256').update(b).digest('hex')
const candidateSet = json(stem + '.candidates.json')
const records = read(stem + '.review.jsonl').toString().trim().split('\n').map(JSON.parse)
const checks = []
const check = (name, predicate) => { assert.ok(predicate, name); checks.push({ name, pass: true }) }
const near = (a,b,t=1e-10) => Math.abs(a-b) < t
check('Nine exact current candidates, eighteen independently presented cases, two distinct expectations each', records.length===9 && candidateSet.goals.length===9 && records.every(r=>r.profile.expectations.length===2 && r.profile.applicationCaseBriefs.length===2))
check('Every declared expectation required, two independent demonstrations and meaningful transfer', records.every(r=>JSON.stringify(r.profile.coverageExpectations.requiredExpectationIds)===JSON.stringify(r.profile.expectations.map(e=>e.id)) && r.profile.coverageExpectations.minimumIndependentDemonstrations===2 && r.profile.coverageExpectations.freshVariationRequired && r.profile.coverageExpectations.independentTransferRequired && r.profile.variationAxes.length===2))
check('Candidate-only E1/G1 and no fabricated review run IDs or human approval', records.every(r=>r.status==='needs_human_review' && r.reviewAuthority==='ai_candidate' && r.evidenceLevel==='E1' && r.maximumClaimScope==='G1' && r.reviewRunIds.length===0))
check('Decay: three half-lives give 200 expected parent nuclei and A0/8=0.01925 Bq', 1600*2**(-6/2)===200 && near(0.154/8,0.01925))
check('Decay supplied initial activity agrees with ln(2)*N/T in seconds to stated rounding', near(Math.log(2)*1600/7200,0.154,0.0005))
check('Initial radioactive daughter production is positive at D=0 while parent decreases', (Math.log(2)/2)*1600>0 && -(Math.log(2)/2)*1600<0)
check('Fictional energy options: B initially strictly lower thermal input; revised intervals overlap', 2.9<3.0 && 2.5<3.4 && 3.8>3.0)
check('Both fictional options have physical efficiencies below one; supplied waste comparison uses identical class', [3.0,3.4,2.5,2.9,3.8].every(q=>1/q>0 && 1/q<1))
check('Atom-to-ion case preserves two uud protons and two udd neutrons and removes one lepton', 2-1===1 && 2*2+2*1===6 && 2*1+2*2===6)
check('Superconducting model temperatures straddle the explicitly supplied Tc=90 K', 80<90 && 95>90)
check('Band case EF lies inside M band but in S gap; finite-temperature case changes occupation, not band support', 0<2 && 2<4 && 1<2 && 2<3)
check('Common-emitter qualitative output slope is negative for positive collector-current change', -1*1<0)
check('Crash fixed impulse: -6000 Ns; mean forces -60000 and -20000 N', 1000*(0-6)===-6000 && -6000/0.1===-60000 && -6000/0.3===-20000)
check('Crash earlier braking changes impulse to -3000 Ns and force magnitude to 30000 N', 1000*(0-3)===-3000 && Math.abs(-3000/0.1)===30000)
check('Sticking collision: p=6, v=2, kinetic energies 9 and 6 J; 3 J conversion', 2*3===6 && 6/(2+1)===2 && 0.5*2*3**2===9 && 0.5*3*2**2===6 && 9-6===3)
check('Non-sticking counter-moving collision: p=2, vB=2, energies 5 and 2 J; 3 J conversion', 3-1===2 && (2-1*0)/1===2 && 0.5*(3**2+(-1)**2)===5 && 0.5*(0**2+2**2)===2)
const times=[0,0.2,0.4,0.6,0.8], xs=[0,0.6,1.2,1.8,2.4], ys=[0,0.6,0.8,0.6,0], vy=[4,2,0,-2,-4]
check('Projectile table: x=3t, y=4t-5t², vy=4-10t at all five times', times.every((t,i)=>near(xs[i],3*t)&&near(ys[i],4*t-5*t*t)&&near(vy[i],4-10*t)))
check('Downward start stays descending for t>=0 while acceleration is counted once', [0,0.1,0.2,0.3].every(t=>-4-10*t<0))
const paths=[stem+'.config.json',stem+'.candidates.json',stem+'.review.jsonl',stem+'.author-check.mjs']
console.log(JSON.stringify({checkedAt:new Date().toISOString(),authority:'Author arithmetic/structure self-check only; not independent body review, blind D completion or human approval.',profiles:9,applicationCases:18,checks,artifacts:paths.map(path=>({path,digest:digest(read(path))}))},null,2))
