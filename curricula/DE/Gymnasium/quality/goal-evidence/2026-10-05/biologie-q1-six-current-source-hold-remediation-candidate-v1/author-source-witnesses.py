#!/usr/bin/env python3
"""Record actually inspected bounded primary passages and exact source routes."""
import copy
import hashlib
import json
import pathlib
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
NOW = datetime.now(timezone.utc).isoformat()
def read(p): return json.loads((ROOT / p).read_text())
def digest(p): return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
def bind(p): return {'path': str(p), 'sha256': digest(p)}
def write(n, x): (OUT / n).write_text(json.dumps(x, ensure_ascii=False, indent=2)+'\n')
inputs = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
maps = {p:read(p) for p in inputs['mappingPaths']}
documents = [
 ('DE-MV','curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf', [(17,13,'Bakterien – kleine Zellen'),(33,29,'Zellarten')]),
 ('DE-NW','curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf', [(35,35,'den Bau und die Vermehrung')]),
 ('DE-SH','curricula/DE/Gymnasium/input/SH/Fachanforderungen_Biologie_Sekundarstufe_2023_barrierearm.pdf', [(23,21,'Sek. I – SF4'),(24,22,'Sek. I – R3'),(32,30,'Kompartimentierung')]),
 ('DE-SN','curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf', [(30,18,'Anwenden der Erschließungsfelder')]),
 ('DE-ST','curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf', [(30,30,'Aufbau, Ernährungsweisen'),(31,31,'Bakterien- und Hefezelle')]),
 ('DE-TH','curricula/DE/Gymnasium/input/TH/LP_GY_Biologie_2024.pdf', [(21,15,'Bakterien')]),
]
proofs=[]
for jurisdiction,pdf,pages in documents:
    sections=[]
    for pdf_page, printed, keyword in pages:
        text = subprocess.run(['pdftotext','-layout','-f',str(pdf_page),'-l',str(pdf_page),str(ROOT/pdf),'-'],capture_output=True,text=True,check=True).stdout
        pos=text.index(keyword)
        excerpt=text[max(0,pos-80):pos+1200].strip()
        sections.append({'pdfPageOneBased':pdf_page,'printedPage':printed,'actualRetainedPrimaryPassageRead':True,
                         'quotedSelectedPassage':excerpt,'fullOriginalDocumentNotCopied':True})
    proofs.append({'jurisdiction':jurisdiction,'retainedOfficialPdf':bind(pdf),'liveDownloadClaim':False,'passages':sections})

gid='5b2571d9-f079-52b2-b21b-8f389c7409f4'
local=[]
for mp,x in maps.items():
    for row in x['mappings']:
        if row['canonicalGoalId'] != gid or '/DE-HE/' in mp:continue
        extraction=read(x['sourceExtractionPath']);sg=next(g for g in extraction['sourceGoals'] if g['id']==row['legacyGoalId'])
        state=next(s for s in ['DE-MV','DE-NW','DE-SH','DE-SN','DE-ST','DE-TH'] if '/'+s+'/' in mp)
        local.append({'jurisdiction':state,'currentMappingInput':bind(mp),'sourceExtractionInput':bind(x['sourceExtractionPath']),
                      'sourceGoal':sg,'unchangedMappingIdentity':row,
                      'newStructuralScopeVerdict':'supported_partial_source_component_after_independent_review',
                      'wholeUmbrellaSourceGoalCovered':False,
                      'preservation':('The inspected TH p15 bacterial clause compares cells and does not require reproduction; do not invent binary fission for this clause.' if state=='DE-TH' else
                                      'Preserve required reproduction through a separately reviewed simple binary-fission component; chemistry of replication and mandatory PCR/protein synthesis are not prerequisites for the supplied process schema.'),
                      'bindingKindTruth': 'Existing '+row['matchType']+' label is retained as routing provenance, not relabelled retrospectively or treated as whole-clause scientific approval.'})

repro=[]
for state, match in [('DE-MV','j7-mikroorganismen'),('DE-NW','if7-10'),('DE-SH','-r-03-'),('DE-SN','k7-bakterien'),('DE-ST','sj78-zellen')]:
    mp=next(p for p in maps if '/'+state+'/' in p)
    ext=read(maps[mp]['sourceExtractionPath']);sg=next(g for g in ext['sourceGoals'] if match in g['id'])
    repro.append({'jurisdiction':state,'sourceGoalId':sg['id'],'sourceExtractionInput':bind(maps[mp]['sourceExtractionPath']),
                  'mappingInput':bind(mp),'sourceGoal':sg,'candidateKey':'bacterial-binary-fission','canonicalGoalId':None,'matchType':'partial',
                  'wholeSourceCompetenceCovered':False,
                  'boundary': 'Only the schema-level bacterial reproduction process; no viral reproduction, eukaryotic mitosis, culture-growth graph, exponential population competence, nutrition/metabolism, medical assessment or complete biotechnology competence.'})
by_mp=next(p for p in maps if '/DE-BY/' in p)
by_ext=read(maps[by_mp]['sourceExtractionPath']);by_sg=next(g for g in by_ext['sourceGoals'] if g['id']=='dc5044f4-bf54-5642-8201-49dcf8dce9e1')
repro.append({'jurisdiction':'DE-BY','sourceGoalId':by_sg['id'],'sourceExtractionInput':bind(maps[by_mp]['sourceExtractionPath']),
              'mappingInput':bind(by_mp),'sourceGoal':by_sg,'candidateKey':'bacterial-binary-fission','canonicalGoalId':None,'matchType':'partial',
              'officialSection':'B9 2 Mikroorganismen in der Biotechnologie','sourceUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie',
              'wholeSourceCompetenceCovered':False,
              'boundary':'The actual source separately demands exponential population growth and survival stages; binary-fission schema covers only one reproductive component and does not close those other components.'})
write('bacterial-local-source-witnesses.candidates.json',{'schemaVersion':1,'createdAtUtc':NOW,'status':'inactive_author_source_candidate',
      'actualPrimaryWitnesses':proofs,'currentStructuralRelationshipsInspected':local,'candidateReproductionRelationships':repro,
      'ordinaryPrerequisiteCandidate':['5b2571d9-f079-52b2-b21b-8f389c7409f4','2d451684-6e53-565e-a987-f362da919d2c'],
      'independentSourceAndFrontierReview':'pending','claims':{'activeMappingsAdded':0,'currentGoalsClosed':0,'humanApproval':False}})

# Keep NI ownership separate. Exact current source rows and evidence are inputs,
# not a second remediation or a claim that an external candidate has passed.
ni_mp=next(p for p in maps if '/DE-NI/' in p)
ni_ids={'0daa79f6-8f61-5506-98f9-65db83062ba8','ffef97e3-12d6-5090-9816-46ab9e57fae2'}
write('ni-two-goal-integration-holds.json',{'createdAtUtc':NOW,'status':'current_source_hold_not_resolved_in_this_package',
      'mappingInput':bind(ni_mp),'sourceExtractionInput':bind(maps[ni_mp]['sourceExtractionPath']),
      'actualCurrentRows':[r for r in maps[ni_mp]['mappings'] if r['canonicalGoalId'] in ni_ids],
      'officialUrl':'https://cuvo.nibis.de/index.php?p=download&upload=18','actualOfficialPagesReadLive':[87,88,89,90],
      'primaryBoundary':'FW6 p87/88 postpones molecular DNA structure/replication/protein synthesis; FW7 p89 excludes molecular-genetic mutation analysis in SekI.',
      'separateOwner':'/root/bio_ni_independent_candidate_review',
      'candidateDependencies':['curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-ten-source-hold-remediation-candidate-v1/'],
      'adoptionGate':'Independent NI class6/class10 components, genomic-information and nonmolecular-variation preservation, source-specific views and actual effective prerequisite frontier must be proved before removing unsupported molecular rows. Neither NI candidate presence nor molecular PNG approval is this proof.',
      'activeNiWrites':False,'noClosureClaim':True})

# Preserve valid actual pixel reviews; this lane does not restart unchanged V QA.
v_paths=[
 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-four-new-independent-v-qa-20261005-v1/independent-v-qa.receipt.json',
 'curricula/DE/Gymnasium/quality/goal-visualization-review/protein-information-flow-independent-v-qa-b-20261005-v1/independent-v4-qa.receipt.json',
 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-two-companion-independent-v-qa-b-20261005-v1/completion-receipt.json']
v=[]
for vp in v_paths:
    x=read(vp)
    assets=[]
    if 'goals' in x:
        for g in x['goals']:assets.append({'goalId':g['goalId'],'path':g['candidateImagePath'],'sha256':g['assetSha256']})
    elif 'assetsActuallyViewed' in x:assets=x['assetsActuallyViewed']
    elif 'actualViewedFiles' in x:assets=x['actualViewedFiles']
    for a in assets:
        assert digest(a['path']) == a.get('sha256',a.get('digest'))
    v.append({'independentReviewReceipt':bind(vp),'actualCurrentAssetBindings':assets,
              'newOwnPixelReview':False,'operativeRegistration':False,'priorReviewReusedOnlyForUnchangedPixels':True})
write('retained-independent-visual-candidate-bindings.json',{'createdAtUtc':NOW,'status':'binding_verification_not_new_image_approval',
      'reviews':v,'noImageGeneratedOrReplaced':True,'requiredIntegration':'Use approved exact PNGs and scoped alt/context metadata via official import helper; perform current-binding V QA after actual integration. This lane grants no V or D/P authority.'})
print(json.dumps({'sourceWitnessPdfCount':len(proofs),'structuralMappingRows':len(local),'newUnmintedReproductionComponents':len(repro),'activeWrites':False}))
