// Apache-2.0. Rebuild the normal native subset from the frozen normal full402 model.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
async function main(){
 const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
 const normal=await import(pathToFileURL(resolve('app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
 const stable=await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href);
 const cfg=read(O+'/configs/native-D18.final-current231.batch.config.json'),base=read(O+'/models/whole402.current231-plus-author18.final-inputs.normal.json'),native=read(O+'/native-D18/bundle/book-model.json');
 const expected=normal.buildGoalDescriptionRolloutSubsetModel({baseModel:base,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title});
 const exact=stable.stableGoalBookJson(expected)===stable.stableGoalBookJson(native);if(!exact)throw new Error('Normal final18 subset differs from prepared native model');
 const rows=native.pages.map((p:any)=>{const old=base.pages.find((b:any)=>b.goalId===p.goalId);const changed=Object.keys(p).filter(k=>stable.stableGoalBookJson(p[k])!==stable.stableGoalBookJson(old[k]));const allowed=['pageFingerprint','pageNumber','navigationOrder','treeOrder','requires','reverseRequires','externalPrerequisites','externalReverseRequires'];if(changed.some(k=>!allowed.includes(k)))throw new Error('Scientific/native payload drift '+p.goalId);return{goalId:p.goalId,full402PageFingerprint:old.pageFingerprint,native18PageFingerprint:p.pageFingerprint,normalSubsetContextFieldsChanged:changed,allOtherPagePayloadFieldsExact:true}});
 const receipt={schemaVersion:1,checkedAtUTC:new Date().toISOString(),normalExportedFunction:'buildGoalDescriptionRolloutSubsetModel',modulePath:'app/scripts/materializeGoalDescriptionRolloutBatch.ts',moduleSha256:'sha256:'+createHash('sha256').update(readFileSync('app/scripts/materializeGoalDescriptionRolloutBatch.ts')).digest('hex'),normalFull402Digest:base.digest,native18Digest:native.digest,normalRegeneratedSubsetWholeModelExact:exact,all18ScientificPagePayloadsExact:rows.every((r:any)=>r.allOtherPagePayloadFieldsExact),subsetPages:rows,explanation:'Normal subset renumbers navigation/pages and externalizes references outside selected18, then recomputes page fingerprints. These native identities are retained for future review; they are not represented as equal to full402 page identities.',newScientificVotes:0};
 writeFileSync(O+'/checks/normal-final18-subset-regeneration-exact.actual.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({normalRegeneratedSubsetWholeModelExact:exact,native18Digest:native.digest,scientificPayloads18Exact:true}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
