from pathlib import Path
import json,hashlib,datetime,subprocess
from pypdf import PdfReader
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1'
O.mkdir(exist_ok=False)
for n in ['history','candidates','checks','source-notes']: (O/n).mkdir()
TMP=Path('/tmp/skillpilot-dd543-primary-pages');TMP.mkdir(exist_ok=True)
def dig(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,o):(O/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
DD='dd38e0c5-d77b-5893-815c-548ea2a84429';P='543bf91f-f6c6-5b1b-ba9e-43de321d8c7f';V='776457c2-8bb3-53b9-838b-a028319175fb';PAY='a5009946-62bb-5e6a-8c92-732d02e8fd70';DEV='da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0';STRUCT='f1f73ebe-286a-52e8-a2e1-4383ece6e9ec';F08='f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96';F036='036ea7f9-2a33-502f-8729-983fa8054694'
CAN=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';b=CAN.read_bytes();d=json.loads(b);gs={g['id']:g for g in d['goals']};(O/'history/canonical.actual-base.exact.json').write_bytes(b)
for gid in [DD,P,V,PAY,DEV,STRUCT,F08,F036]:save(f'history/{gid}.whole-current-goal.exact.json',gs[gid])
priorDD=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-working-time-participation-AUTHOR-INERT-round-b-v1';priorP=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-543b-poverty-development-AUTHOR-INERT-round-b-v1'
(O/'history/sealed-dd38-retained-goal.exact.json').write_bytes((priorDD/'candidates/retained-dd38.whole-goal.candidate.json').read_bytes());(O/'history/sealed-dd38-retained-positive.exact.json').write_bytes((priorDD/'candidates/retained-dd38.positive-profile.candidate.json').read_bytes());(O/'history/sealed-543b-da734-goals.exact.json').write_bytes((priorP/'whole-goal.candidates.INERT.json').read_bytes());(O/'history/sealed-543b-da734-positive.exact.jsonl').write_bytes((priorP/'positive.profiles.INERT.jsonl').read_bytes())
AGG=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-last-source-composite-native-scope-and-followers-technical-independent-a-INERT-v21/whole336.original685-cases-only-thirty-three-native-goal-and-input-fingerprints.jsonl'
for line in AGG.read_bytes().splitlines(keepends=True):
 rr=json.loads(line)
 if rr['goalId'] in [DD,P,V,PAY,DEV,STRUCT]:(O/f'history/{rr["goalId"]}.whole-current-positive.exact.jsonl').write_bytes(line)
sources=[]; pdfs={}; count=0
for mp in sorted((R/'curricula/DE/Gymnasium/mapping').rglob('*.json')):
 try:m=json.loads(mp.read_text())
 except:continue
 if not isinstance(m,dict) or not m.get('sourceExtractionPath'):continue
 hits=[x for x in m.get('mappings',[]) if x.get('canonicalGoalId') in [DD,P]]
 if not hits:continue
 ep=R/m['sourceExtractionPath'];e=json.loads(ep.read_text()); rows={x['id']:x for x in e['sourceGoals']};selectedids={x['legacyGoalId'] for x in hits};selectedrows=[rows[x] for x in rows if x in selectedids]
 rel=str(mp.relative_to(R));seq=f'{len(sources)+1:02d}'
 save(f'history/source-{seq}.selected-whole-original-rows.exact-objects.json',selectedrows)
 selectedrelations=[x for x in m['mappings'] if x.get('legacyGoalId') in selectedids]
 save(f'history/source-{seq}.whole-original-row-union-relations.exact-objects.json',selectedrelations)
 save(f'history/source-{seq}.whole-selected-passages.exact-objects.json',[x for x in e['passages'] if x.get('id',x.get('passageId')) in {r['passageId'] for r in selectedrows}])
 doc=e['sourceDocument'];path=doc.get('path');primary=R/path if path else None
 item={'id':seq,'jurisdiction':e['jurisdiction'],'stage':e['stage'],'mappingPath':rel,'mappingDigest':dig(mp.read_bytes()),'sourceExtractionPath':str(ep.relative_to(R)),'sourceExtractionDigest':dig(ep.read_bytes()),'primaryUrl':doc.get('url'),'primaryRepositoryPath':path,'selectedOriginalGoalIds':sorted({x['canonicalGoalId'] for x in hits}),'selectedSourceGoalIds':sorted(selectedids),'selectedRowCount':len(selectedrows),'wholeOriginalSourceRowsPreserved':True,'currentSourceTextIsPrimaryProof':False}
 if primary and primary.is_file():
  item['actualPrimaryFileDigest']=dig(primary.read_bytes());key=dig(primary.read_bytes()).split(':')[1][:12]
  if key not in pdfs:
   reader=PdfReader(primary);pages=[p.extract_text() or '' for p in reader.pages];pdfs[key]={'path':str(primary.relative_to(R)),'digest':item['actualPrimaryFileDigest'],'pageCount':len(pages),'scratchPagesKey':key,'url':doc.get('url')};(TMP/f'{key}.pages.json').write_text(json.dumps(pages,ensure_ascii=False));(TMP/f'{key}.txt').write_text('\n\f\n'.join(f'PDF_PAGE {i+1}\n{p}' for i,p in enumerate(pages)))
  item['primaryPageCount']=pdfs[key]['pageCount'];item['primaryScratchKey']=key
 sources.append(item);count+=len(selectedrows)
save('source-notes/selected-original-source-inputs.actual.json',{'readPreparationAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'status':'read_preparation_not_source_approval','mappingSourceSets':sources,'actualLocalPrimaryFiles':list(pdfs.values()),'selectedSourceRowCount':count,'sourceRowsAreHistoricalInputsOnly':True,'fullThirdPartyNormTextExportedIntoNewPacket':False,'otherOwnedGoalMutations':['1826 not owned','7c121b84 not owned'],'scope':'Only olddd38/543b source relations and two own follow-onPractice candidates; unrelated union targets retained unchanged.'})
save('generation-metadata.actual.json',{'provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed','task':'INERT source/course and wholePractice author after immutable dd38/543b/EU handoffs; no independent review of own drafts'})
print(json.dumps({'out':str(O.relative_to(R)),'mappingSourceSets':len(sources),'selectedSourceRows':count,'localPrimaryFiles':len(pdfs),'scratchPrimaryPages':str(TMP)}))
