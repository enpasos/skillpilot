# SPDX-License-Identifier: Apache-2.0
"""Whole current mappings/extractions and preserved bounded source/course holds."""
from pathlib import Path
from copy import deepcopy
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence')
OLD=B/'2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1';P=B/'2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1';D=R/P
assert not (D/'author.final.freeze.json').exists()
def ref(p):
 p=Path(p);bb=(R/p).read_bytes();assert not (R/p).is_symlink();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(bb).hexdigest(),'bytes':len(bb)}
def read(p):return json.loads((R/p).read_text())
def put(p,x):
 f=D/p;f.parent.mkdir(parents=True,exist_ok=True);bb=x if isinstance(x,bytes)else(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 if f.exists():assert f.read_bytes()==bb,p
 else:f.write_bytes(bb)
 return ref(P/p)
def exact(s,d):
 b=ref(s);o=put(d,(R/s).read_bytes());assert b['sha256']==o['sha256'];return {'original':b,'ownExactCopy':o}
ap=Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');a=read(ap);atlas=exact(ap,Path('source/current-source-atlas-inputs.exact.json'));files=[]
for i,mp in enumerate(a['mappingPaths']):
 m=read(mp);ep=m['sourceExtractionPath'];e=read(ep)
 mc=exact(mp,Path('source/current-whole-mappings')/f'{i+1:02d}-{Path(mp).name}');ec=exact(ep,Path('source/current-whole-extractions')/f'{i+1:02d}-{Path(ep).name}')
 files.append({'wholeCurrentMapping':mc,'wholeCurrentExtraction':ec,
               'wholeCurrentSourceDutyCount':len(e['sourceGoals']),'wholeCurrentMappingPartnerEdgeCount':len(m['mappings']),
               'currentMappingStatusAsActuallyRecorded':m.get('status'),'currentSourceDocument':e.get('sourceDocument'),
               'wholeCurrentUnresolvedOrUnmappedRowsPreserved':True,'wholeIndependentSourceReviewClaimed':False})
refs=[]
paths=[
 ('source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json','whole35-original-source-view-operator-partners.exact.json'),
 ('source-view-remediation-author-v2/whole-eight-original-primary-pages.portable-neutral-input.json','whole-eight-original-primary-pages.exact.json'),
 ('source-view-remediation-author-v3/whole-original-primary-source-pages-and-secondary-partner.author-reading.input.json','whole-original-primary-and-secondary-source-partners.exact.json'),
 ('source-view-remediation-author-v4/three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json','whole-three-current-secondary-source-companions-RP-v4.exact.json'),
 ('source-view-remediation-author-v2/all-twenty-two-current-held-view-node-whole-source-and-operator-remediation-plan.json','whole22-held-source-view-operator-remediation-plan.exact.json'),
 ('twenty-two-bounded-source-routes-author-v2/whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json','whole22-original-source-route-operator-partner.exact.json'),
 ('twenty-two-bounded-source-routes-author-v2/all-eighteen-whole-original-current-and-prospective-partners.neutral-input.json','whole18-original-source-partners.exact.json'),
 ('source-union-diagnosis-after-reviewedSL/neutral-current354-of395-exact-source-routes-diagnosis.entry.json','historical-source354-of395-unaltered-route-diagnosis.entry.exact.json'),
 ('source-union-diagnosis-after-reviewedSL/actual-forty-one-missing-current-source-routes.neutral-diagnosis.json','whole41-historical-missing-source-routes.exact.json')]
for s,t in paths:refs.append(exact(OLD/s,Path('source/whole-current-and-preserved-source-contexts')/t))
put(Path('source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json'),{
 'schemaVersion':1,'role':'Whole current original mapping/extraction copies and previously reviewed bounded source-role materials; not global source or course clearance',
 'currentAtlasInputs':atlas,'wholeCurrentMappingExtractionPairs':files,'mappingPathCount':len(files),
 'wholeOldSourceOperatorContextBodies':refs,'originalWhole1646DutyInventory':ref(P/'inputs/whole-original1646-B008-source-duty-inventory.exact.json'),
 'actualExistingBoundedSourceModelAndRPv4Judgments':ref(P/'inputs/whole-source-model-v3-RP-v4-conservative-pair.exact.json'),
 'actualExistingWhole35SourceViewPair':ref(P/'inputs/whole35-source-view-conservative-pair.exact.json'),
 'wholeDutyAndPartnerCountsAreDiagnosticNotIndependentApproval':True,
 'wholeSource19CoursePlacementHoldsPreserved':['Whole Source19 still requires actual full source/course/partner review',
  'SL2026 original403 decisions and current cohort/stage/course obligations remain open where unproved',
  'TH GK/LK chromatography, ninhydrin and PET course demands are not inferred from generic process competence',
  'RP common primary/secondary/fuel-cell examples and mandatory LK additum are not approved by one secondary-cell partial case',
  'SN eA/LK-only operators and redox/current-source locators remain separately bound',
  'Eight prior protected material/context changes plus outside26 Redoxtitration EN fidelity need actual targeted review'],
 'pendingSourceContextOrCourseApproval':True,'currentNativeApproval':False,'activeWrites':[],'strictGain':0,'humanApproval':False})
print(json.dumps({'currentWholeMappingExtractionPairs':len(files),'wholeSourceDecisions':sum(x['wholeCurrentSourceDutyCount']for x in files),'wholePartnerEdges':sum(x['wholeCurrentMappingPartnerEdgeCount']for x in files),'wholePreservedContextInputs':len(refs),'sourceReviewClaimed':False,'activeWrites':0}))
