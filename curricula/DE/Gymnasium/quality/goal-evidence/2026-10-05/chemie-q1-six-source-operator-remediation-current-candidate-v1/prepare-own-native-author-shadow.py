#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded physical future author tree; no operative mutations or approvals."""
from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, subprocess
OWN=Path(__file__).resolve().parent
ROOT=OWN.parents[6]
REL=OWN.relative_to(ROOT)
ISO=ROOT/'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
ATLAS='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
BASE_SHA='0fd3c538b5b554606ea8b073fa8c4cd3e27c376599cc416f0e8d2452b70be3be'
NEW='0d59b62e-d3f9-5969-b961-0c5e26316c04'
PARENT='47a40c98-ab20-5246-85e3-3abe5a9e95ed'
TITLECOMPANION='70b34ae7-4481-590c-9a02-516464750832'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def dump(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert sha(ROOT/CAN)==BASE_SHA
changes=read(OWN/'six-explicit-scientific-field-deltas.candidate.json')
proposal=read(OWN/'seventh-lk-paraben-use.scope-proposal.json')
selected={x['goalId'] for x in changes['rows']}|{NEW,TITLECOMPANION}
base=read(ROOT/CAN);future=copy.deepcopy(base);goals={g['id']:g for g in future['goals']}
for row in changes['rows']:
 assert goals[row['goalId']]==row['before']
 for field in row['changedFields']:goals[row['goalId']][field]=copy.deepcopy(row['afterScientificText'][field])
assert NEW not in goals
new=copy.deepcopy(proposal['newGoal']);future['goals'].append(new);goals[NEW]=new
par=goals[PARENT];oldchildren=list(par['contains']);insert=oldchildren.index('d3cd250f-5221-589d-aa1c-44a4692d1acb')+1
par['contains'].insert(insert,NEW);assert par['weight']==len(oldchildren)==5;par['weight']=6
copied={};links=[]
def physical(source,rel):
 source=Path(source);target=ISO/rel;target.parent.mkdir(parents=True,exist_ok=True)
 assert not target.is_symlink()
 subprocess.run(['cp','--reflink=auto','--',str(source),str(target)],check=True)
 assert source.stat().st_ino!=target.stat().st_ino and sha(source)==sha(target)
 copied[str(rel)]={'path':str(rel),'sourcePath':str(source),'sha256':sha(source),'bytes':source.stat().st_size,'activeBaselineSHA256':sha(ROOT/rel) if (ROOT/rel).is_file() else None}
def paths(v):
 if isinstance(v,dict):
  for x in v.values():yield from paths(x)
 elif isinstance(v,list):
  for x in v:yield from paths(x)
 elif isinstance(v,str) and v.startswith(('curricula/','app/scripts/config/','contracts/','docs/')):yield v
def closure(seeds):
 seen=set();pending=list(seeds)
 while pending:
  rel=str(pending.pop())
  if rel in seen:continue
  seen.add(rel);source=ROOT/rel
  if not source.is_file():continue
  # PDFs are optional immutable native-cache inputs; needed originals are
  # physically copied below, unrelated snapshots remain read-only links.
  if source.suffix.lower()=='.pdf':
   t=ISO/rel;t.parent.mkdir(parents=True,exist_ok=True)
   if not t.exists():t.symlink_to(source);links.append({'path':rel,'source':str(source),'sha256':sha(source),'use':'unchanged original-source byte verification only'})
  else:
   physical(source,rel)
   if source.suffix=='.json':pending.extend(paths(read(source)))
for top in ['app/scripts','app/src','scripts','contracts']:
 for source in sorted((ROOT/top).rglob('*')):
  if source.is_file():physical(source,source.relative_to(ROOT))
for source in sorted((ROOT/'docs').rglob('*')):
 if source.is_file() and source.suffix in ['.json','.md','.yaml','.yml','.ts']:physical(source,source.relative_to(ROOT))
for rel in ['AGENTS.md','LICENSING.md','LICENSE','app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json']:
 if (ROOT/rel).is_file():physical(ROOT/rel,rel)
nd=ISO/'app/node_modules'
if not nd.exists():nd.symlink_to(ROOT/'app/node_modules',target_is_directory=True)
assert nd.is_symlink()
closure([CAN,SEM,QA,ATLAS,'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json'])
for rel in ['curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf','curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf','curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf']:
 t=ISO/rel
 if t.is_symlink():t.unlink()
 physical(ROOT/rel,rel)

# New HE mapping file replaces only the demonstrably mismatched Paraben-use
# component; every other current mapping and decision is preserved exactly.
atlas=read(ISO/ATLAS)
oldmap=next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p)
mapping=read(ISO/oldmap);oldmapping=copy.deepcopy(mapping)
sid='he-chem-sekii-q1-5-b05-a01-e1183390'
oldm=[r for r in mapping['mappings'] if r['legacyGoalId']==sid]
oldd=next(r for r in mapping['decisions'] if r['sourceGoalId']==sid)
assert len(oldm)==1 and oldm[0]['canonicalGoalId']=='d3cd250f-5221-589d-aa1c-44a4692d1acb'
newm=[dict(oldm[0],canonicalGoalId=NEW,matchType='exact')]
newd=dict(oldd,canonicalGoalIds=[NEW],reviewedAt='2026-10-05',reviewer='informed source/operator author; independent review pending',rationale='Inactive author proposal after actual complete current HE page40 reading: the LK source clause requires use of specified p-hydroxybenzoic-acid esters. The new LK-only use-evaluation atom covers this component; quantitative analyte determination is separate and is not passed as the use operator. No new GK or non-HE obligation is claimed. Independent source/applicability and semantic reviews are pending.')
pos=next(i for i,r in enumerate(mapping['mappings']) if r['legacyGoalId']==sid)
mapping['mappings'][pos:pos+1]=newm
pos=next(i for i,r in enumerate(mapping['decisions']) if r['sourceGoalId']==sid);mapping['decisions'][pos]=newd
assert [r for r in mapping['mappings'] if r['legacyGoalId']!=sid]==[r for r in oldmapping['mappings'] if r['legacyGoalId']!=sid]
assert [r for r in mapping['decisions'] if r['sourceGoalId']!=sid]==[r for r in oldmapping['decisions'] if r['sourceGoalId']!=sid]
mapping['reviewId']='hessen-chemistry-upper-secondary-q1-paraben-use-author-proposal-20261005-v1'
newmap='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.q1-paraben-use-author-proposal-20261005-v1.review.json'
dump(ISO/newmap,mapping)
atlas['mappingPaths']=[newmap if p==oldmap else p for p in atlas['mappingPaths']]
assert atlas['expectedCurricularAtomicGoalCount']==358;atlas['expectedCurricularAtomicGoalCount']=359
dump(ISO/ATLAS,atlas)
dump(OWN/'single-whole-source-group.actual-before-after.candidate.json',{'authority':'inactive source/operator author proposal; independent source review pending','beforeMappingPath':oldmap,'beforeMappingSHA256':sha(ROOT/oldmap),'futureMappingPath':newmap,'sourceGoalId':sid,'beforeMappings':oldm,'beforeDecision':oldd,'afterMappings':newm,'afterDecision':newd,'allOtherCurrentMappingAndDecisionRowsExact':True,'newIndependentSourceApproval':False,'activeWrites':0})

# Explicit honest provenance for old enrichment atoms: retain their historical
# lineage, do not relabel an authored transfer as a literal official bullet.
source_bindings={
 '057a6826-f599-53b1-bdd1-5a83037a1494':('curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_CHEMIE_SEKII_MSS_2022.source-extraction.json','rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-005-7618f43f','authored_comparative_transfer_of_optional_RP_derivative_examples_not_literal_HE_compulsory_clause',40),
 '39c85aa0-b01f-56ec-a148-b8009bf650f5':('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json','he-chem-sekii-q1-3-b04-a01-d23d5886','authored_intramolecular_transfer_of_ester_formation_with_hydroxy_acid_context_not_literal_lactone_stability_clause',39),
 'd742ecb0-0795-5446-a95d-9503d4618475':('curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json','bb-chemistry-sekii-rlp-3-1-6-inhalte-003-0504d3ec','authored_LK_controlled_CMC_performance_extension_of_unspecified_course_E_phase_choice_context_not_HE_compulsory_LK_clause',24),
 'd76b80a2-5156-54f4-b3a1-546beddf0e14':('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json','he-chem-sekii-q1-5-b03-a01-25f09a02','material_bounded_operationalization_of_sorbic_addition_GK_and_LK_only',40),
 'd3cd250f-5221-589d-aa1c-44a4692d1acb':('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json','he-chem-sekii-q1-5-b04-a01-6d016bf3','LK_ascorbic_quantitative_source_component_plus_existing_authored_paraben_analyte_case_not_source_use_operator',40),
 '10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5':('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json','he-chem-sekii-q1-5-b02-a01-bd10754f','authored_LK_redox_evaluation_transfer_of_qualitative_antioxidant_context_not_claim_of_own_actual_experiment',40)}
provenance=[]
for gid,(src,sid,role,page) in source_bindings.items():
 sg=next(g for g in read(ROOT/src)['sourceGoals'] if g['id']==sid)
 ext=goals[gid].setdefault('extendedData',{});historical=copy.deepcopy(ext.get('provenance'))
 ext['provenance']={'historicalProvenance':historical,'sourceExtractionPath':src,'sourceExtractionSHA256':'sha256:'+sha(ROOT/src),'sourceGoalId':sid,'sourceSpan':sg['sourceSpan'],'actualOriginalPDFPhysicalPage':page,'sourceBindingRole':role,'sourceBindingStatus':'informed_author_candidate_independent_review_pending','sourceBindingReviewPath':str(REL/'source-operator-scope-and-originals.author-candidate.json')}
 provenance.append({'goalId':gid,'sourceGoal':sg,'beforeProvenance':historical,'afterProvenance':copy.deepcopy(ext['provenance']),'literalFullSourceWidthClaimed':False})
dump(OWN/'source-operator-scope-and-originals.author-candidate.json',{'authority':'informed author, not independent review','sourceBindingRows':provenance,'wholeCurrentApplicabilityAndTagsPreservedForExistingSix':True,'newParabenOnlyHE_LK':True,'allCurrentOfficialSourceUmbrellasRemainIntact':True,'universalHE_Lactone_Acyl_CMC_RedoxObligationClaimed':False,'actualLabExecutionClaimed':False,'humanApproval':False,'humanTrial':False,'activeWrites':0})
dump(ISO/CAN,future)

# All actual review assets are physical bytes; unrelated immutable media are
# read-only symlink inputs, not needless multi-gigabyte scratch duplicates.
for top in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
 for source in sorted((ROOT/top).rglob('*')):
  if not source.is_file():continue
  rel=source.relative_to(ROOT);t=ISO/rel;t.parent.mkdir(parents=True,exist_ok=True)
  if any(gid in source.parts for gid in selected):physical(source,rel)
  elif not t.exists():t.symlink_to(source);links.append({'path':str(rel),'source':str(source),'sha256':sha(source),'use':'unchanged media read-only input; never mutation target'})
for f in OWN.iterdir():
 if f.is_file():physical(f,REL/f.name)

# Actual importer results are candidates only. Existing historical assets are
# exported and removed only inside this own shadow if their format changes.
imports=[
 ('d742ecb0-0795-5446-a95d-9503d4618475',OWN/'image-candidates/d742-candidate-2.png',OWN/'d742-surface-foam-correction.followup-2.prompt.md','Drei comicartige Teilbilder eines kontrollierten Tensidvergleichs: Oberflächenspannung gegen eindeutig bezeichnete Konzentration mit CMC-Übergang, Messzylinder mit Schaumvolumen zwischen Flüssigkeits- und Schaumgrenze bei gleicher Zeit sowie Modellschmutz ohne und mit Tensid bei gleichen Vergleichsbedingungen. Die Kurve ist schematisch und keine eigene Messreihe.'),
 ('d3cd250f-5221-589d-aa1c-44a4692d1acb',OWN/'image-candidates/d3cd-candidate-1.png',OWN/'d3cd-calibration-correction.prompt.md','Comicartige Übersicht zur quantitativen Bestimmung von Ascorbinsäure und Parabenen: getrennte passende Methoden, kontrollierte Messungen, chromatographische Peaks über der Zeit und eine separate Kalibrierung über der Konzentration. Ein Gehalt wird im gültigen Arbeitsbereich mit Verdünnung und Verfahrensgrenzen bestimmt; die Skizze behauptet keine eigene Versuchsdurchführung.'),
 ('d76b80a2-5156-54f4-b3a1-546beddf0e14',OWN/'image-candidates/d76-candidate-1.png',OWN/'d76-sorbic-category-correction.prompt.md','Drei freundliche Vergleichsbereiche zu Sorbinsäure(E200): mögliche Hemmung von Mikroorganismen, kategoriespezifische Dosierung und günstigere Wirkung im sauren Bereich sowie die Prüfung datierter Lebensmittelregeln. Das pflanzliche Mousse ist ein begrenztes Verwendungsbeispiel, keine allgemeine Saftzulassung oder Sicherheitsgarantie.'),
 (NEW,OWN/'image-candidates/0d59-candidate-2.png',OWN/'paraben-use-new.followup-2.prompt.md','Comicartige Übersicht zur Verwendung von Parabenen: korrekte para-Hydroxybenzoesäureester-Struktur am Beispiel des Methylesters, schematischer Mikroorganismenvergleich bei gleicher Temperatur und gleichem pH sowie Dosierung, datierte produktbezogene Regeln und Nutzen-Risiko-Abwägung. Die Produktpackungen sind allgemeine Symbole, keine Rechtsfreigabe oder gemessene Wirksamkeit.'),
 ('10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5',ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-three-missing-image-candidate-20261005-v1/source/10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5/10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5.png',None,'Freundliches Redoxmodell: Ascorbinsäure gibt Elektronen an ein Oxidationsmittel ab und wird oxidiert; das Oxidationsmittel wird reduziert. Getrennte Mikroorganismen und die Beschriftung antioxidativ≠antimikrobiell zeigen die Grenze der Konservierungsaussage. Die Figuren sind keine Molekülstrukturformeln oder eigenen Messergebnisse.')]
imports_receipt=[];preserved=[]
for gid,image,prompt,alt in imports:
 for top in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
  d=ISO/top/gid
  if d.exists():
   for f in d.iterdir():
    if f.is_file() and f.suffix.lower() in ['.jpg','.jpeg']:
     assert not f.is_symlink();rel=f.relative_to(ISO);arc=OWN/'historical-preservation.before-shadow-import'/rel;arc.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,arc)
     preserved.append({'originalActivePath':str(rel),'historicalPreservedPath':str(arc.relative_to(ROOT)),'sha256':sha(f),'bytes':f.stat().st_size,'ownShadowOnlyRemoval':True});f.unlink()
 if prompt is None:
  prompt=OWN/'10f-existing-candidate-reconstruction.prompt.md'
  prompt.write_text('# Existing raster candidate retained\n\nFriendly abstract comic: ascorbic acid as electron donor is oxidised; the oxidising agent accepts electrons and is reduced. Separate microorganisms may remain. Large readable German caption: antioxidativ ≠ antimikrobiell. This is a conceptual reaction-role image, not an actual molecular structure or measured antimicrobial assay. Preserve the actual existing PNG bytes; this reconstruction description does not replace its historical generation provenance.\n')
 command=['node','scripts/import_goal_visualization.mjs',gid,str(image),'--landscape',CAN,'--subject','chemie','--provider','OpenAI ChatGPT/Codex image_gen','--review-status','pending-independent-actual-review','--alt-text',alt,'--prompt',str(prompt)]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=ISO,capture_output=True,text=True)
 stem=gid[:8]+'-native-import';(OWN/(stem+'.stdout.txt')).write_text(p.stdout);(OWN/(stem+'.stderr.txt')).write_text(p.stderr)
 imports_receipt.append({'goalId':gid,'command':command,'cwd':str(ISO),'startedAtUTC':started,'exitCode':p.returncode,'inputAssetPath':str(image),'sha256':sha(image),'authorAltTextCandidate':alt,'independentVApproval':False})
 assert p.returncode==0,p.stderr
dump(OWN/'native-five-image-imports.actual.receipt.json',{'imports':imports_receipt,'generationIsNotApproval':True,'humanApproval':False,'humanTrial':False,'activeWrites':0})
dump(OWN/'historical-media-preservation.before-shadow-import.actual.json',{'files':preserved,'activeHistoricalBytesTouched':False,'onlyOwnShadowOldJPEGsRemoved':True,'activeWrites':0})

template=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-native-candidate-v4'
pcfg=read(template/'positive-evidence.config.json');pcfg.update(reviewId='chemie-q1-six-operator-plus-lk-proposal-p-author-20261005-v1',reviewPath=str(REL/'positive-evidence.validation-only.review.jsonl'))
pcfg['scope']={'label':'Seven unreviewed source/operator author P-v2 candidates; prospective377 only; E1/G1 needsHuman','goalIds':[r['goalId'] for r in read(OWN/'positive-evidence.candidates.json')['goals']]}
book=read(template/'book.config.json');book['outputPath']=str(REL/'prospective-full-base.book-model.json');book['evidenceReviewPaths']=[]
batch=read(template/'batch.config.json');batch.update(batchId='chemie-q1-six-operator-plus-lk-proposal-20261005-v1',bookId='de-gym-chemie-q1-six-operator-plus-lk-proposal-20261005-v1',title='Chemie Q1 – sechs Quellen-/Operatorenkandidaten, ein LK-Vorschlag und eine bestehende Kontextbindung',baseGoalBookConfigPath=str(REL/'book.config.json'),goalIds=pcfg['scope']['goalIds']+[TITLECOMPANION],outputDirectory=str(REL/'native-finalbook'))
for name,val in [('positive-evidence.config.json',pcfg),('book.config.json',book),('batch.config.json',batch)]:dump(ISO/REL/name,val);dump(OWN/name,val)
assert sha(ROOT/CAN)==BASE_SHA
dump(OWN/'current104-physical-author-shadow.actual.receipt.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baselineCanonicalSHA256':BASE_SHA,'ownIsolationRoot':str(ISO),'currentAtomicDenominator':376,'prospectiveAtomicDenominatorIfIndependentlyAccepted':377,'newLKProposal':NEW,'changedExistingScientificGoals':6,'targetedExistingContextCompanion':TITLECOMPANION,'newSourceSupportedAtlasCountProposal':359,'sourceSupportedAtlasBaselineCount':358,'unrelatedCanonicalGoalObjectsExact':all(g==next(x for x in base['goals'] if x['id']==g['id']) for g in read(ISO/CAN)['goals'] if g['id'] not in selected|{PARENT}),'copiedPhysicalInputs':list(copied.values()),'readOnlyLinks':links,'imageImportsAreUnapproved':True,'noFullHistoricalCanonicalOverlay':True,'humanApproval':False,'humanTrial':False,'activeWrites':0,'activeStrictDelta':0})
print(json.dumps({'status':'own future377 author tree ready; source/D/P/V/AM independent pending','physicalCopies':len(copied),'readOnlyLinks':len(links),'futureDGoals':8,'activeWrites':0}))
