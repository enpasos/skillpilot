# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016';L=T/'chemie-shared640-recycling-native-author-capsule-L6-v1';O=T/'BB-BE-four-crossstage-prerequisite-source-author-successor-v1'
def read(p):return json.loads(p.read_text())
def fp(v):return 'sha256:'+hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def put(n,v):
 with (O/n).open('x') as f:json.dump(v,f,ensure_ascii=False,separators=(',',':'));f.write('\n')
s=read(O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json');cp=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';assert pin(cp)==s['actualCanonical'];ops=[]
for row in s['fourViews']:
 n=row['view'].replace('.view.json','');b=read(O/f'BEFORE.{n}.whole-view.json');a=read(O/f'AFTER.{n}.whole-view.AUTHOR.inactive.json');rel='curricula/DE/Gymnasium/composition-views/chemie/'+row['view'];assert b==read(L/rel)
 ops.append({'operation':'replace-whole-composition-view-if-exact','targetPath':rel,'expectedCurrentFileSha256':pin(L/rel)['sha256'],'expectedCurrentWholeObjectFingerprint':fp(b),'before':b,'after':a,'expectedAddedEffectiveTargetGoalIds':row['proposedAddedTargetIds'],'sourceBinding':{'scienceFirst':pin(O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json'),'sourceRows':row['sourceRows']}})
failed=O/'CAS.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.AUTHOR.inactive.json'
try:read(failed);raise AssertionError('Expected original interrupted serialization to be incomplete')
except json.JSONDecodeError:pass
put('RECEIPT.failed-final-CAS-serialization.ENOSPC.history.json',{'role':'Truthful technical failed attempt, original partial bytes preserved','failedPartialFile':pin(failed),'cause':'ENOSPC while serializing final CAS, after both FIRST science files and all eight complete whole-view before/after files. No target file or L6/R changed. No schema/closure final receipt existed yet.','replacementCompleteFile':'CAS.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.COMPLETE.AUTHOR.inactive.json','notForConsumption':str(failed.relative_to(R))})
put('CAS.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.COMPLETE.AUTHOR.inactive.json',{'role':'Inactive AUTHOR proposal, not applied and pending independent review','canonicalBinding':pin(cp),'guardRule':'File SHA plus entire before object must match. Preserve current accepted LK11-target references. Four views only; do not overwrite from older d389 views.','scienceFirst':pin(O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json'),'operations':ops,'sourceMappingOperations':[],'canonicalGoalOperations':[],'normalWrites':0,'newIndependentVotes':0,'M7Claim':False})
print(json.dumps({'completeCAS':pin(O/'CAS.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.COMPLETE.AUTHOR.inactive.json'),'operations':len(ops)}))
