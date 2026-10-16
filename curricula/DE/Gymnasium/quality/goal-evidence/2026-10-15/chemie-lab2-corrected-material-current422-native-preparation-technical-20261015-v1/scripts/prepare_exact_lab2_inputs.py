# SPDX-License-Identifier: Apache-2.0
"""Finite exact material transport and sparse host map; no scientific decision."""
import copy,hashlib,json,re
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
BASE=E+'chemie-current422-source3-lab1-bounded-inactive-integration-technical-20261015-v1'
COR=E+'chemie-lab15-two-material-corrections-author-root-20261015-v1'
PUR=E+'chemie-lab15-preparation-purity-whole-author-20261015-v1'
ORIG=E+'chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1'
IDS=['62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2','e7c3d20e-4b13-560b-b8ee-c5abca8cc624']
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return REL+'/'+p
def exactcopy(source,target):
 (OWN/target).write_bytes((ROOT/source).read_bytes());assert (OWN/target).read_bytes()==(ROOT/source).read_bytes()
 return {'source':bind(source),'copy':bind(REL+'/'+target)}
base=read(BASE+'/INPUTS.final-current422.physical-exact-selector.json')
cor=read(COR+'/NEUTRAL.bounded-two-material-successor-author.json');pur=read(PUR+'/NEUTRAL.final-finite-author-resume.json')
can=read(base['wholeCanonical']['path']);G={g['id']:g for g in can['goals']}
whole=[G[i] for i in IDS]
assert whole[0]==next(g for g in read(cor['twoWholeGoals']['path'])['goals'] if g['id']==IDS[0]) if isinstance(read(cor['twoWholeGoals']['path']),dict) else True
pg=read(pur['wholeGoal']['path']);assert pg==whole[1] or pg.get('goal')==whole[1]
dump('candidate/two-whole-current422-goals.exact.json',{'source':base['wholeCanonical'],'goals':whole,'canonicalDeltas':[]})
c62=[r for r in read(cor['successorCases']['path'])['cases'] if r['goalId']==IDS[0]]
ce7=read(pur['completeCases']['path'])['cases'];assert len(c62)==len(ce7)==2
dump('materials/four-whole-DE-EN-cases.exact-source-objects.json',{
 'schemaVersion':1,'contentLicense':'CC-BY-4.0','authority':'Exact transport of sealed own author materials, not independent assessment approval',
 'source62b':cor['successorCases'],'sourceE7':pur['completeCases'],'cases':c62+ce7,
 'wholeCaseObjectsExact':True,'caseIds':[c['caseId'] for c in c62+ce7],'newScientificVotes':0})
copies=[exactcopy(pur['completeCases']['path'],'materials/e7-two-complete-cases.original-container.exact.json'),
 exactcopy(pur['mandatoryTechnicianAndBlankRecord']['path'],'materials/future-own-preparation-purity-record.blank.exact.json'),
 exactcopy(pur['wholeBYSourceDuties']['path'],'sources/BY.BcP12-13.whole-duty-context.exact.json'),
 exactcopy(pur['primaryMethodsAndAdaptations']['path'],'sources/PRIMARY.RSC.methods-and-adaptations.exact.json'),
 exactcopy(ORIG+'/source-context/selected-source-cells-and-parent-passages.exact.json','sources/all-original-selected-source-cells-and-parent-passages.exact.json'),
 exactcopy('curricula/DE/Gymnasium/input/BY/gymnasium/Biologisch-chemisches_Praktikum.json','sources/BY.Biologisch-chemisches_Praktikum.complete.exact.json'),
 exactcopy('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGISCH_CHEMISCHES_PRAKTIKUM_GYMNASIUM_LEHRPLANPLUS.source-extraction.json','sources/BY.BcP.complete-source-extraction.exact.json')]
pr62=[b for b in (ROOT/cor['twoRawProfiles']['path']).read_bytes().splitlines(keepends=True) if json.loads(b)['goalId']==IDS[0]]
pre7=(ROOT/pur['newRawProfile']['path']).read_bytes().splitlines(keepends=True);assert len(pr62)==len(pre7)==1
raw=pr62+pre7;assert [json.loads(b)['goalId'] for b in raw]==IDS and all(json.loads(b)['evidenceLevel']=='E0' for b in raw)
(OWN/'candidate/two-raw-profiles.E0-G0.exact-original-lines.jsonl').write_bytes(b''.join(raw))
profilePath=REL+'/candidate/two-raw-profiles.E0-G0.exact-original-lines.jsonl'
dump('checks/EXACT.whole-cases-raw-profiles-and-source-copy-CAS.json',{'role':'Transport, not a source/P/D/A/M/V judgment',
 'caseSources':[cor['successorCases'],pur['completeCases']],'wholeCaseIds':[r['caseId'] for r in c62+ce7],
 'caseObjectEquality':[r in read(cor['successorCases']['path'])['cases'] if r['goalId']==IDS[0] else r in ce7 for r in c62+ce7],
 'rawProfileSources':[cor['twoRawProfiles'],pur['newRawProfile']],'rawProfileTarget':bind(profilePath),'allSelectedOriginalLineBytesExact':True,
 'wholeSourceAndMaterialCopies':copies,'wholeCanonicalUnchanged':base['wholeCanonical'],'newScientificVotes':0,'existingHoldsUnchanged':True})

# Technical reuse-eligibility checks use exact original A/M records and current QA, never new votes.
s=read(base['centralConfig']['path'])['subjects'][0];a_cfg=[]
for path in s['semanticAtomicityConfigPaths']:
 cfg=read(path);rawa=[b for b in (ROOT/cfg['reviewPath']).read_bytes().splitlines(keepends=True) if json.loads(b)['goalId'] in IDS]
 if rawa:
  assert len(rawa)==2 and not a_cfg
  rp=REL+'/candidate/A2.original-existing-lines.for-eligibility-only.jsonl';(ROOT/rp).write_bytes(b''.join(rawa));n=copy.deepcopy(cfg);n['reviewPath']=rp;n['scope']={'label':'Exact two existing records for technical reuse eligibility only','leafGoalIds':IDS};dump('config/A2.existing-eligibility-only.config.json',n);a_cfg.append({'originalConfig':bind(path),'originalRecords':bind(cfg['reviewPath']),'selectedRecords':bind(rp)})
assert len(a_cfg)==1
mc=read(s['memoryReviewConfigPath']);rm=[b for b in (ROOT/mc['reviewPath']).read_bytes().splitlines(keepends=True) if json.loads(b)['goalId'] in IDS];assert len(rm)==2
rp=REL+'/candidate/M2.original-existing-lines.for-eligibility-only.jsonl';(ROOT/rp).write_bytes(b''.join(rm));mn=copy.deepcopy(mc);mn['reviewPath']=rp;mn['scope']={'label':'Exact two existing M records for reuse eligibility, not a new course decision','leafGoalIds':IDS};mn['reportPath']=REL+'/checks/M2.no-report-written-in-check-mode.md';dump('config/M2.existing-eligibility-only.config.json',mn)
dump('checks/A-M.original-exact-reuse-inputs.json',{'A':a_cfg,'M':{'originalConfig':bind(s['memoryReviewConfigPath']),'originalRecords':bind(mc['reviewPath']),'selectedRecords':bind(rp)},'newGateJudgments':0})

# Current422 full in-memory base, but only two native goal pages are rendered.
book={'schemaVersion':1,'bookId':'chemie-lab2-corrected-current422-full-context-20261015-v1','title':'Chemie – vollständiger aktueller Kontext für zwei korrigierte Labormaterialien',
 'landscapePath':s['landscapePath'],'compositionViewPath':'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json',
 'semanticKindLedgerPath':s['semanticKindLedgerPath'],'goalVisualizationQaPath':s['visualizationQaPath'],'publicationMode':'review',
 'atlasBaseUrl':'https://skillpilot.com/lernzielbuch','evidenceReviewPaths':[profilePath],
 'outputPath':REL+'/candidate/full422-in-memory-only.model.not-materialized.json'}
dump('config/whole422.normal-stock-base.config.json',book)
batch={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,
 'batchId':'chemie-lab2-corrected-material-current422-native-20261015-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-lab2-corrected-material-current422-native-20261015-v1',
 'title':'Chemie – zwei unveränderte Lernziele mit korrigierten vollständigen Labormaterialien','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json',
 'goalIds':IDS,'outputDirectory':REL+'/native-two','feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
 'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
 'criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
dump('config/native2.normal-prepare-only.config.json',batch)
mapping=read(base['physicalMap']['path']);mapping['executionHost']='tmp/chemie-m7-resumed-20261015/lab2-corrected-current422-native-host-v1';mapping['buildReceiptPath']='checks/REBUILD.actual-lab2-native-host.json'
mapping['role']='Targeted D2 native preparation only, no full central report/build'
for r in mapping['selectedCurrentAssetRows']:r['publicMustBePhysicalWithinHostPublicRoot']=r['goalId'] in IDS
mapping['physicalPublicSelectedCount']=2
# Include the actual rendering/batch module closure physically; all other inputs immutable aliases.
modules={};todo=[ROOT/p for p in ['app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts','app/scripts/reportGoalVisualizationRolloutStatus.ts']]
while todo:
 p=todo.pop();rel=p.relative_to(ROOT).as_posix()
 if rel in modules:continue
 modules[rel]=bind(rel)
 for target in re.findall(r"(?:\bfrom\s*|\bimport\s*)['\"](\.{1,2}/[^'\"]+)['\"]",p.read_text()):
  raw=(p.parent/target).resolve();candidates=[raw,Path(str(raw)+'.ts'),Path(str(raw)+'.tsx'),Path(str(raw)+'.mjs'),raw/'index.ts'];found=next((x for x in candidates if x.is_file()),None);assert found,(p,target);todo.append(found)
mapping['stockPhysicalModules']=[modules[p] for p in sorted(modules)];dump('checks/REBUILD.current422-lab2-native.physical-map.json',mapping)
dump('INPUTS.preparation.physical-exact.json',{'schemaVersion':1,'role':'Exact corrected author inputs and current whole422, no peer verdicts',
 'scopeGoalIds':IDS,'current319Selector':bind(BASE+'/INPUTS.final-current422.physical-exact-selector.json'),
 'wholeCanonical':base['wholeCanonical'],'semanticCompanion':base['semanticCompanion'],'QA':base['normalQa'],
 'corrected62bAuthor':bind(COR+'/NEUTRAL.bounded-two-material-successor-author.json'),'correctedE7Author':bind(PUR+'/NEUTRAL.final-finite-author-resume.json'),
 'sourceSeals':[bind(COR+'/FILES.finite-author-successor.seal.json'),bind(PUR+'/FILES.finite-own-author-artifacts.seal.json')],
 'wholeFourCases':bind(REL+'/materials/four-whole-DE-EN-cases.exact-source-objects.json'),'wholeRawProfiles':bind(profilePath),
 'wholeContextSources':[r['copy'] for r in copies],'nativeConfig':bind(REL+'/config/native2.normal-prepare-only.config.json'),
 'physicalMap':bind(REL+'/checks/REBUILD.current422-lab2-native.physical-map.json'),'newScientificVotes':0,'newStrictClosures':0,'canonicalDeltas':[]})
print(json.dumps({'scope':IDS,'wholeCases':len(c62+ce7),'rawProfiles':2,'fullBcPSourceCopiedExact':True,'normalAliases':len(mapping['aliases']),'selectedImageAliases':len(mapping['selectedCurrentAssetRows']),'physicalPublicImages':2,'stockModules':len(modules),'nativeGoals':2,'canonicalDeltas':0,'newVotes':0}))
