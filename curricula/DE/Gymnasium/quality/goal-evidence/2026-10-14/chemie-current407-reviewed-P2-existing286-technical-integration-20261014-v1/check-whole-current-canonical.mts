// Apache-2.0. Pure stock canonical validation; no source or state mutation.
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
const R='/home/enpasos/projects/skillpilot',O=R+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-reviewed-P2-existing286-technical-integration-20261014-v1'
const path=R+'/tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const raw=readFileSync(path),landscape=JSON.parse(raw.toString()),issues=validateCanonicalLandscape(normalizeCanonicalLandscape(landscape)),errors=issues.filter(x=>x.severity==='error')
writeFileSync(O+'/checks/STOCK.whole-actual533-canonical-pure-validation.actual.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),path,sha256:'sha256:'+createHash('sha256').update(raw).digest('hex'),rawNodes:landscape.goals.length,stockFunction:'validateCanonicalLandscape(normalizeCanonicalLandscape)',errors,allIssues:issues,noWritesToHost:true},null,2)+'\n')
if(errors.length)throw new Error(JSON.stringify(errors))
console.log(JSON.stringify({rawNodes:landscape.goals.length,errors:errors.length}))
