"""Apache-2.0. Bounded declared-input extraction; own teaching candidates CC-BY-4.0."""
from pathlib import Path
import json,hashlib,datetime,copy,shutil
R=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=E/'chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1';CLAIM=E/'chemie-current402-all182-open-claims-root-20261012-v2/claims/carbonyl-pharmacy-15.current402.claim.config.json';CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');SRC=Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');REC=Path('app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json')
h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rd=lambda p:json.loads(p.read_text())
def wr(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert not (O/'FINAL.author15-candidate.freeze.json').exists(), 'Sealed packet must stay immutable'
ids=rd(CLAIM)['goalIds'];assert len(ids)==15;assert h(CAN)=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960';can=rd(CAN);byid={g['id']:g for g in can['goals']};parent={}
for g in can['goals']:
 for child in g.get('contains',[]):parent.setdefault(child,[]).append(g['id'])
context=set(ids)
def ancestors(id):
 for p in parent.get(id,[]):
  if p not in context:context.add(p);ancestors(p)
for id in ids:ancestors(id);context.update(byid[id].get('requires',[]))
bindings=[dict(path=str(p),sha256=h(p))for p in [CAN,SEM,QA,REG,CLAIM,SRC,REC]]
wr(O/'author/current15.base-goal-tuples.json',dict(schemaVersion=1,license='CC-BY-4.0',createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),goalIds=ids,canonicalBinding=bindings[0],claimBinding=bindings[4],currentStrictComplete=231,currentCurricularAtomic=402,goals=[byid[id]for id in ids],unchangedParentAndPrerequisiteContext=[byid[id]for id in sorted(context-set(ids))],canonicalOrGraphChanges=[]))
sem=rd(SEM);dec={d['goalId']:d for d in sem['decisions']};wr(O/'author/current15.semantic-decisions.exact.json',dict(schemaVersion=1,sourceBinding=bindings[1],decisions=[dec[id]for id in ids],claims='Exact current authoritative semantic kinds; no new atomicity decision.'))
subject=next(s for s in rd(REG)['subjects']if s['subject']=='chemie');mcpath=Path(subject['memoryReviewConfigPath']);mc=rd(mcpath);mpath=Path(mc['reviewPath']);raw={json.loads(l)['goalId']:l for l in mpath.read_text().splitlines()if l.strip()};O.joinpath('author/current15.memory.raw-exact-retained.jsonl').write_text('\n'.join(raw[id]for id in ids)+'\n');wr(O/'author/current15.memory-retention.bindings.json',dict(schemaVersion=1,inputConfig=dict(path=str(mcpath),sha256=h(mcpath)),inputReview=dict(path=str(mpath),sha256=h(mpath)),goalIds=ids,rawRowsRetainedExactly=True,newMemoryVotes=0))
qa={q['goalId']:q for q in rd(QA)['records']};vr=[]
for id in ids:
 q=qa[id];p=Path(q['publicAssetPath']) if q.get('publicAssetPath') else None; binding=dict(path=str(p),sha256=h(p)) if p and p.is_file() else None; vr.append(dict(goalId=id,currentQaRecord=q,publicBytesBinding=binding,authorDecision='Retain current bytes; missing V stays hold; no new sight/approval claimed',actualAuthorSightPerformed=False,newVVotes=0))
wr(O/'author/current15.existing-V-bindings.keep.json',dict(schemaVersion=1,goalIds=ids,records=vr,sourceBinding=bindings[2],assetChanges=[]))
receipt=rd(REC);selected=[w for w in receipt['witnessGroups']if set(ids)&set(w['goalIds'])];inputs=receipt['inputBindings'];used=sorted({w[k]for w in selected for k in ['mappingInput','extractionInput']});cache={}
for i in used:
 b=inputs[i];p=Path(b['path']);assert h(p)==b['sha256'],('source receipt stale',str(p));cache[i]=rd(p)
rows=[];partners=[];passages=[];docs={}
for ei,gid in sorted({(w['extractionInput'],w['sourceGoalId'])for w in selected}):
 x=cache[ei];sg=next(g for g in x['sourceGoals']if g['id']==gid);pid=sg.get('passageId')or sg.get('sourcePassageKey')or sg.get('sourceSpan',{}).get('passageId');pp=[p for p in x.get('passages',[])if pid and(p.get('id')==pid or p.get('key')==pid)];rows.append(dict(extractionPath=inputs[ei]['path'],extractionSha256=inputs[ei]['sha256'],jurisdiction=x.get('jurisdiction'),sourceGoal=sg,sourcePassages=pp));docs[inputs[ei]['path']]=dict(sourceDocument=x.get('sourceDocument'),sourceDocuments=x.get('sourceDocuments',[]))
for mi,gid in sorted({(w['mappingInput'],w['sourceGoalId'])for w in selected}):
 x=cache[mi];maps=[m for m in x.get('mappings',[])if m.get('legacyGoalId')==gid or m.get('sourceGoalId')==gid];decision=[d for d in x.get('decisions',[])if d.get('legacyGoalId')==gid or d.get('sourceGoalId')==gid or d.get('decisionId')==gid];targets=set()
 for m in maps:
  if m.get('canonicalGoalId'):targets.add(m['canonicalGoalId'])
  targets.update(m.get('canonicalGoalIds',[]));targets.update(m.get('reviewedCanonicalGoalIds',[]))
 for d in decision:targets.update(d.get('canonicalGoalIds',[]));targets.update(d.get('reviewedCanonicalGoalIds',[]));targets.update(d.get('reviewedTargetGoalIds',[]))
 partners.append(dict(mappingPath=inputs[mi]['path'],mappingSha256=inputs[mi]['sha256'],sourceGoalId=gid,mappings=maps,decisions=decision,wholeCanonicalPartnerTargets=[byid[t]for t in sorted(targets)if t in byid],unknownPartnerTargetIds=[t for t in targets if t not in byid]))
# Retain full partner tuples once, avoiding hundreds of duplicated broad context copies.
wholePartners={};exactPassages={}
for row in partners:
 row['wholeCanonicalPartnerTargetIds']=[g['id']for g in row['wholeCanonicalPartnerTargets']]
 for g in row.pop('wholeCanonicalPartnerTargets'):wholePartners[g['id']]=g
for row in rows:
 row['sourcePassageRefs']=[]
 for passage in row.pop('sourcePassages'):
  key=row['extractionPath']+'#'+str(passage.get('id')or passage.get('key'));exactPassages[key]=passage;row['sourcePassageRefs'].append(key)
wr(O/'author/current15.literal-source-witness-inventory.json',dict(schemaVersion=1,kind='Bounded exact selected15 current32 source witnesses and whole mapping partner targets',inputBindings=bindings,sourceReceiptInputBindings=[inputs[i]for i in used],goalIds=ids,witnessGroups=selected,wholeSourceGoalRowsAndPassages=rows,wholeSelectedMappingDecisionsAndPartnerTargets=partners,sourceDocumentMetadataByExtractionPath=docs,deduplicatedWholeCanonicalPartnerTargets=list(wholePartners.values()),deduplicatedExactSourcePassages=exactPassages,materializationNote='Whole goal/source/partner content retained once; joins are exact current canonical/source hashes, not scientific approval.',counts=dict(selected15=15,declaredMappingInputs=len(rd(SRC)['mappingPaths']),selectedWitnessGroups=len(selected),sourceRows=len(rows),mappingDecisions=len(partners)),claims=dict(newSourceReview=False,inheritedApplicabilityNotNormativeCoverage=True,mappingDirectRelationDoesNotProveWholeScientificOrPracticalCoverage=True,broaderSharedRowsRequirePartnerTargets=True,sourceRowsAndMappingDecisionsUnchanged=True)))
wr(O/'author/current15.input-CAS.before-authoring.json',dict(schemaVersion=1,inputBindings=bindings,sourceInputsUnchanged=True,currentCanonicalSHA=h(CAN),newScience=0,activeWrites=False))
if Path(__file__).resolve() != (O/'author/prepare-inputs.py').resolve():shutil.copyfile(Path(__file__),O/'author/prepare-inputs.py')
print(json.dumps(dict(outputRoot=str(O),goals=15,sourceRows=len(rows),mappingDecisions=len(partners),witnessGroups=len(selected),newScience=0)))
