# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from copy import deepcopy
from datetime import datetime,timezone
import json,hashlib
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;assert not(OWN/'author.final.freeze.json').exists()
V11=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-native-source-preparation-author-v11'
def read(p):return json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):b=p.read_bytes();return{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
guard=read(OWN/'current169-protected-guard-and-field-intents.author.json');candidate=read(OWN/'candidate/canonical.current503-source-routing.author-candidate.json');by={g['id']:g for g in candidate['goals']};split=set(guard['convertedSevenClusterIds']);families=set(guard['originalNineFamilies']);components=read(V11/'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json')['placements']
fresh=read(OWN/'fresh-fourteen-c12-ea-primary-components.author-input.json')['actualPrimaryComponents']
for item in fresh:
 placement=next(p for p in components if p['candidateKey']==item['candidateKey']);placement['primaryComponents'].append(item['freshEAPrimaryComponent'])
receiptPath=ROOT/'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json';receipt=read(receiptPath);snapshot=OWN/'inputs/source-projection.current.receipt.json.bin';snapshot.write_bytes(receiptPath.read_bytes());bindings=receipt['inputBindings'];groups=receipt['witnessGroups'];scopes={s['viewId']:s for s in receipt['scopes']}
views=read(OWN/'actual-current43-source-view-inputs-and-before-selection-native-findings.json')['sourceViews'];rows=[]
for vr in views:
 view=read(ROOT/vr['snapshotBinding']['path']);scope=scopes[view['viewId']];witnesses=[]
 for index in scope['witnessGroupRefs']:
  g=groups[index]
  for goalId in g['goalIds']:
   if goalId in families:witnesses.append({'mappingPath':bindings[g['mappingInput']]['path'],'sourceExtractionPath':bindings[g['extractionInput']]['path'],'sourceGoalId':g['sourceGoalId'],'mappedTargetGoalId':g['mappedTargetGoalId'],'goalId':goalId,'coverage':g['coverage'],'profileBasis':g['profileBasis']})
 choices={};selection=[]
 for family in families:
  children=by[family]['contains']if family in split else[family]
  eligible=[]
  for placement in components:
   if placement['nativeCandidateGoalId']not in children:continue
   for comp in placement['primaryComponents']:
    reason=None
    if comp['jurisdiction']!=scope['jurisdiction']:reason='Primary component belongs to another jurisdiction; no broad cross-state transfer.'
    elif comp['stage']!=scope['stage']:reason='Primary component belongs to another stage; no stage union.'
    elif 'compatibility profile GK'in comp['courseBoundedToActuallyReadPage']and scope['courseProfile']!='GK':reason='Actual C12-GA primary read is bounded to GK; deduplicated LK/C13 tags do not prove this course.'
    elif 'compatibility profile LK'in comp['courseBoundedToActuallyReadPage']and scope['courseProfile']!='LK':reason='Actual C12-EA primary read is bounded to LK; no automatic GA/C13 transfer.'
    matches=[w for w in witnesses if w['goalId']==family and w['sourceGoalId']==comp['originalSourceGoalId']and w['sourceExtractionPath']==comp['originalSourceExtractionBinding']['path']]
    if not matches and not reason:reason='Current scope has no exact source witness for this bounded component.'
    if reason:continue
    eligible.append(placement['nativeCandidateGoalId']);selection.append({'familyGoalId':family,'candidateKey':placement['candidateKey'],'newGoalId':placement['nativeCandidateGoalId'],'actualCurrentScopeWitnesses':matches,'exactPreviouslyReadPrimaryComponent':comp,'sourceOperatorContractDe':placement['sourceOperatorContractDe'],'claim':'author_candidate_partial_component_only','independentSourceReviewRequired':True,'wholeOriginalSourceDutyCleared':False})
  choices[family]=list(dict.fromkeys(eligible))
 changes=[];holds=[]
 def visit(nodes):
  out=[]
  for node in nodes:
   n=deepcopy(node)
   if n.get('goalId')in split and n.get('kind')=='goalEntry':
    picked=choices[n['goalId']]
    if picked:
     replacements=[{'kind':'goalEntry','goalId':id,**({'projectionRole':n['projectionRole']}if 'projectionRole'in n else{})}for id in picked]
     out.extend(replacements);changes.append({'beforeNode':n,'candidateNodes':replacements,'selectionRule':'Only actual matching current source-witness components of the same original family, jurisdiction, stage and actually read course; no inherited whole-cluster expansion.'});continue
    holds.append({'unchangedNode':n,'reason':'HOLD: no primary operator/stage/course component has yet been genuinely resolved for this source scope. Retain real CPV-009 rather than delete duties or map all children.'})
   if 'children'in n:n['children']=visit(n['children'])
   out.append(n)
  return out
 changed=deepcopy(view);changed['rootNodes']=visit(view['rootNodes']);outPath=OWN/'source-view-candidates'/(view['viewId']+'.partial-author-candidate.json');write(outPath,changed)
 rows.append({'viewId':view['viewId'],'scope':view['scope'],'currentInputBinding':vr['snapshotBinding'],'candidateBinding':bind(outPath),'actualExistingCPV009Count':len(vr['convertedClusterGoalEntryFindings']),'resolvedConvertedParentNodesAsAuthorCandidates':len(changes),'stillHeldConvertedParentNodes':len(holds),'declaredNodeChanges':changes,'heldOriginalNodes':holds,'partialComponentSelections':selection,'wholeOriginalSourceDutiesRemainOpen':True,'applicabilityOutsideBYNotInferred':True,'nativeProjectionApproval':False})
write(OWN/'actual-bounded-primary-witness-child-selections-and-remaining43-view-holds.author.json',{'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'Explicit inactive source placement proposals with whole original obligations retained','currentSourceReceipt':bind(receiptPath),'currentSourceReceiptFrozenInput':bind(snapshot),'all43AffectedCurrentViews':rows,'actualOriginalCPV009Total':141,'authorCandidatePartialReplacements':sum(r['resolvedConvertedParentNodesAsAuthorCandidates']for r in rows),'stillUnresolvedOriginalConvertedNodes':sum(r['stillHeldConvertedParentNodes']for r in rows),'national1646OriginalDutiesClosed':False,'unchangedSourceReviewStatuses':True,'blanketAllChildMappings':0,'strictGain':0,'activeWrites':0,'independentSourceApproval':False,'humanApproval':False})
print(json.dumps({'affected43':len(rows),'partialReplacementNodes':sum(r['resolvedConvertedParentNodesAsAuthorCandidates']for r in rows),'heldNodes':sum(r['stillHeldConvertedParentNodes']for r in rows),'changedViews':[(r['viewId'],r['resolvedConvertedParentNodesAsAuthorCandidates'],r['stillHeldConvertedParentNodes'])for r in rows if r['declaredNodeChanges']],'strictGain':0}))
