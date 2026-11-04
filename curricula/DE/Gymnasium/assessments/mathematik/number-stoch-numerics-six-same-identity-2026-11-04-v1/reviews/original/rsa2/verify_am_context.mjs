// Read-only reproduction of the existing A/M fingerprint payload and current
// semantic-kind function. Produces evidence, never a post-form review decision.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const norm=value=>String(value??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const stable=value=>Array.isArray(value)?`[${value.map(stable).join(',')}]`:value&&typeof value==='object'?`{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>`${JSON.stringify(key)}:${stable(v)}`).join(',')}}`:JSON.stringify(value);
const fingerprint=(goal,ruleVersion)=>'sha256:'+crypto.createHash('sha256').update(stable({ruleVersion,goalId:goal.id,shortKey:goal.shortKey??'',title:norm(goal.title),titleEn:norm(goal.titleEn),description:norm(goal.description),descriptionEn:norm(goal.descriptionEn),phase:norm(goal.dimensionTags?.phase),area:norm(goal.dimensionTags?.area),topicCode:norm(goal.dimensionTags?.topicCode),nodeKind:norm(goal.nodeKind)})).digest('hex');
const context=JSON.parse(await readFile(path.join(here,'current-four-registered-am-rows.json'),'utf8'));
const ledgerPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';
const ledgerBytes=await readFile(path.join(root,ledgerPath));
const ledger=JSON.parse(ledgerBytes);
const records=[];
for(const row of context.rows){
 const id=row.wholeCurrentRow.goalId;
 const before=JSON.parse(await readFile(path.join(here,id,'current-whole-goal.json'),'utf8'));
 const after=JSON.parse(await readFile(path.join(here,id,'proposed-whole-goal.draft.json'),'utf8'));
 const current=fingerprint(before,row.wholeCurrentRow.ruleVersion);
 if(current!==row.wholeCurrentRow.fingerprint)throw new Error(`Stale current ${row.lane} row for ${id}`);
 const proposed=fingerprint(after,row.wholeCurrentRow.ruleVersion);
 if(proposed===current)throw new Error('Expected nodeKind change to need genuine revalidation');
 const kind=ledger.decisions.find(d=>d.goalId===id);
 if(kind?.semanticKind!=='curricularAtomic')throw new Error('Curricular identity not preserved');
 records.push({goalId:id,lane:row.lane,currentRegisteredRowFingerprintMatches:true,currentFingerprint:current,proposedFingerprint:proposed,proposedFingerprintStatus:'CALCULATED_FOR_REVIEW_ONLY_NOT_A_NEW_REVIEW_ROW',currentStatus:row.wholeCurrentRow.status,wholeCurrentSemanticKindDecision:kind,independentRevalidation:'PENDING'});
}
const report={status:'PASS_CURRENT_REGISTERED_FINGERPRINTS_POST_FORM_DECISIONS_PENDING',records,semanticKindLedger:{path:ledgerPath,sha256:crypto.createHash('sha256').update(ledgerBytes).digest('hex'),counts:ledger.counts},rootOrLedgerWrites:false};
await writeFile(path.join(here,'author-am-context-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS_CURRENT_CONTEXT',registeredRows:records.length,pendingIndependentPostFormDecisions:records.length}));
