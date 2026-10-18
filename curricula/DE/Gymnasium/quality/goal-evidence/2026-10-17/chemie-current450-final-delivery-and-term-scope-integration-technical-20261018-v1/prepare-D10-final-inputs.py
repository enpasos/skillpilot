#!/usr/bin/env python3
"""Apache-2.0. Prepare exact final D10 inputs only; never render or review."""
import hashlib,json
from pathlib import Path
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
HERE=N/'chemie-current450-final-delivery-and-term-scope-integration-technical-20261018-v1'
O=N/'chemie-current442-normal-integration-20261017-v1'
OUT=O/'D-corrected450-final-native'
C=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
S=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
R=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
Q=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,obj):
 p=OUT/name
 with p.open('x') as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
 return p
assert (HERE/'RECEIPT.actual-normal-AMP450-DONE.json').exists(),'Actual final native AMP required'
c=read(C);s=read(S);r=read(R);chem=next(x for x in r['subjects'] if x['subject']=='chemie')
assert len(chem['resolutionIndexPaths'])==126 and len(chem['resolutionSupersessions'])==553
ordinary=[d['goalId'] for d in s['decisions'] if d['semanticKind']=='curricularAtomic' and d['decisionStatus']=='authoritative']
assert len(ordinary)==450
author=read(N/'chemie-current447-final-four-scope-corrections-author-20261018-v3/AUTHOR.complete-eight-profiles-three-goals-and-operative-materials.pending.json')
ids=[x['goalId'] for x in author['records']];assert len(ids)==len(set(ids))==10
combined=HERE/'P450.complete-native.current-normal.review.jsonl'
actual={}
for cp in chem['positiveEvidenceConfigPaths']:
 cfg=read(cp)
 for line in Path(cfg['reviewPath']).read_text().splitlines():
  row=json.loads(line);assert row['goalId'] not in actual;actual[row['goalId']]=row
bound={json.loads(l)['goalId']:json.loads(l) for l in combined.read_text().splitlines() if l.strip()}
assert actual==bound and len(actual)==450
OUT.mkdir(parents=True,exist_ok=True)
view=write('BASE450.full-current-ordinary.review.view.json',dict(viewFormatVersion=1,viewId='chemie-current450-complete-canonical-review-base',landscapeId=c['landscapeId'],scope=dict(schoolForm='Gymnasium',stage='CrossStage'),rootNodes=[dict(kind='structure',id='technical-complete450-review',label='Vollständige technische Review-Basis (450 Kompetenzen)',children=[dict(kind='goalEntry',goalId=g,projectionRole='target') for g in sorted(ordinary)])]))
cfg=write('BASE450.full-current-positive.review.config.json',dict(schemaVersion=1,bookId='chemie-current450-final-native-description-review-base',title='Chemie: vollständige aktuelle Review-Basis 450',landscapePath=str(C),compositionViewPath=str(view),semanticKindLedgerPath=str(S),goalVisualizationQaPath=str(Q),publicationMode='review',evidenceReviewPaths=[str(combined)],outputPath=str(OUT/'base-model/chemie-current450.full-current-positive.review.book-model.json')))
gid=write('GOAL_IDS.final450.actual10.json',ids)
measurement=write('MEASUREMENT.finite-final10-current-inputs.technical.json',dict(ordinaryDenominator=450,goalCount=10,goalIds=ids,method='Exact author-v3 ten-record roster authorized for final native D, actual current native P equality checked for all450; no fresh D science or repeated163/33 diagnostics.',canonical=pin(C),semantic=pin(S),normalRegistry=pin(R),actualWholeNativeP=pin(combined),oldD126and553Retained=True,currentWholeBindings=[dict(goalId=g,wholeGoalSHA256=hashlib.sha256(json.dumps(next(x for x in c['goals'] if x['id']==g),sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),wholeProfileSHA256=hashlib.sha256(json.dumps(actual[g]['profile'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()) for g in ids],newReviewVotes=0))
index=N/'chemie-current450-final-ten-neutral-materials-20261018-v1/INDEX.actual-whole-materials-and-primary-pages.review-only.json'
assert pin(index)['sha256']=='dc3f58e845f76ac80664e85f2bac5fd11d1310779879ccc0ed1b4a66606c0508'
plan=write('FINAL-GENERATOR-INPUTS.actual-current450.json',dict(subject='chemie',finalScopeApplied=True,canonical=pin(C),semanticKinds=pin(S),normalRegistry=pin(R),finalScopeReceipt=pin(HERE/'RECEIPT.core450-and-single-AP.actual.json'),finalApplicabilityMeasurement=pin(measurement),existingD65Science=pin(O/'PROVENANCE.D65-current-field-existing-paired-science.json'),existingD65ScienceSeal=pin(O/'SEAL.D65-current-field-existing-paired-science.json'),goalIdsFile=pin(gid),baseGoalBookConfig=pin(cfg),outputRoot=str(OUT),additionalInputGuards=[pin(Q),pin(HERE/'RECEIPT.actual-normal-AMP450-DONE.json'),pin(combined),pin(index)]))
(OUT/'README.md').write_text('Finale technische D10-Eingabe: vollständige450-Basis und exakt aktuelle450-P-Auswahl, ein begrenzter10er-Batch. Keine D-Urteile oder Modelle/PDFs durch diese Vorbereitung. D126/553 unverändert. Die historische existingD65Science-Pflicht ist nur ein technischer Guard.\n\nRoot führt den vorhandenen Generator aus:\n\n```sh\nnode --import ./app/node_modules/tsx/dist/loader.mjs '+str(O/'D-final-native-adapter/native-d-final-input-generator.mjs')+' --final-plan '+str(plan)+' --execute\n```\n\nDanach native adapter prepare und tatsächlich zwei frische fork-none Reviewer; keine alten/Autorenurteile an Reviewer. Neutralmaterialindex: '+str(index)+'\n')
receipt=write('RECEIPT.final450-D10-inputs-prepared-no-render.json',dict(canonical=pin(C),semantic=pin(S),registry=pin(R),QA=pin(Q),baseConfig=pin(cfg),baseView=pin(view),wholeP=pin(combined),goalIds=pin(gid),generatorPlan=pin(plan),neutralMaterialIndex=pin(index),ordinary=450,goalCount=10,renderInvocations=0,bookModelsBuilt=0,scientificReviewsCreated=0,normalWrites=0))
print(json.dumps(dict(receipt=pin(receipt),plan=pin(plan),base=pin(cfg),goalIds=pin(gid)),indent=2))
