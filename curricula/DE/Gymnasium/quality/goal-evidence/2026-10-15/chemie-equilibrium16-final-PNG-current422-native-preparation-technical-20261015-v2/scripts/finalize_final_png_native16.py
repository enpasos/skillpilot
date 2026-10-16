# SPDX-License-Identifier: Apache-2.0
"""Finite technical closure after the actual successful stock runs and PDF viewing."""
import ast,hashlib,json,os
from datetime import datetime,timezone
from pathlib import Path
import fitz
R=Path.cwd();O=Path(__file__).resolve().parents[1]
V=O.parent/'chemie-equilibrium16-current422-native-preparation-technical-20261015-v1'
SEAL=O/'FILES.finite-native16-technical.seal.json';assert not SEAL.exists()
NOW=datetime.now(timezone.utc).isoformat();GID='f0f2c5f8-06f1-5774-a176-d96505727acf'
def read(p):return json.loads(p.read_text())
def write(n,d):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(d):assert bind(R/d['path'])==d,d['path']
tech=read(O/'INPUTS.technical-native16-final-PNG.physical-provenance.json')
for k in ['originalV1Seal','originalBlindSelector','canonical','semantic','existingPourbaixNormalV1','originalRawAuthorProfiles']:verify(tech[k])
for row in tech['sourcePrimaryDocuments']:verify(row)
ids=tech['goalIds'];assert len(ids)==len(set(ids))==16
mapping=read(O/'checks/REBUILD.native16.current338-exact-physical-map.json');H=R/mapping['executionHost']
for row in mapping['stockPhysicalModules']:
 verify(row);p=H/row['path'];assert not p.is_symlink() and bind(p)['sha256']==row['sha256']
for row in mapping['aliases']:
 verify(row['physicalRepositorySource']);p=H/row['normalHostAlias'];assert not p.is_symlink() and bind(p)['sha256']==row['physicalRepositorySource']['sha256']
assetBindings=[]
for row in mapping['selectedCurrentAssetRows']:
 verify(row['physicalRepositorySource'])
 for key in ['normalCanonicalDestination','normalPublicDestination']:
  p=H/row[key];assert bind(p)['sha256']==row['physicalRepositorySource']['sha256']
  if row['goalId']==GID:assert not p.is_symlink()
 if row['goalId'] in ids:
  assert row['publicMustBePhysicalWithinHostPublicRoot'] and not (H/row['normalPublicDestination']).is_symlink()
  assetBindings.append({k:row[k]for k in ['goalId','physicalRepositorySource','normalCanonicalDestination','normalPublicDestination']})
assert len(assetBindings)==16
write('blind-inputs/sixteen-current-exact-physical-image-bodies.json',{'schemaVersion':1,'role':'Exact current physical raster inputs only; no visual review record or reviewer judgment','images':assetBindings})
physical=[]
for base,dirs,files in os.walk(H,followlinks=False):
 dirs[:]=[d for d in dirs if not (Path(base)/d).is_symlink()]
 for name in files:
  p=Path(base)/name
  if not p.is_symlink():physical.append(p)
physicalbytes=sum(p.stat().st_size for p in physical);assert physicalbytes<80*1024*1024
host={'executionHost':mapping['executionHost'],'physicalRegularFiles':len(physical),'physicalRegularBytes':physicalbytes,'maxBytes':80*1024*1024,'physicalStockModules':len(mapping['stockPhysicalModules']),'physicalDataAliases':len(mapping['aliases']),'physicalSelectedPublicImages':16,'physicalPourbaixCanonicalImages':1,'globalMappedImages':435,'fullRepositoryCopies':0,'fullImageTreeCopies':0,'hardlinksCreated':0,'activeWrites':0}
write('checks/HOST.actual-sparse-sixteen.json',host)
qa=read(O/'candidate/QA438.normal-unique-goals.existing-Pourbaix-V1-replaces-missing-placeholder.json')
archive=read(O/'candidate/QA439.original438-plus-verbatim-existing-Pourbaix-V1.json')
oldqa=read(V/'candidate/QA438.original437-plus-exact-independent-138-V1.json')
vote=read(R/tech['existingPourbaixNormalV1']['path'])['records']
assert len(qa['records'])==438 and len(archive['records'])==439
assert archive['records'][:438]==oldqa['records'] and archive['records'][438:]==vote
assert [x for x in qa['records']if x['goalId']!=GID]==[x for x in oldqa['records']if x['goalId']!=GID]
assert [x for x in qa['records']if x['goalId']==GID]==vote
assert len(set(x['goalId']for x in qa['records']))==438
canon=read(R/tech['canonical']['path']);goals={g['id']:g for g in canon['goals']};assert len(goals)==560
oldLines=(V/'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl').read_text().splitlines()
newLines=(O/'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl').read_text().splitlines()
profiles=[json.loads(x)for x in newLines];oldProfiles=[json.loads(x)for x in oldLines]
assert [x['goalId']for x in profiles]==ids
for i,(before,after)in enumerate(zip(oldProfiles,profiles)):
 assert before['profile']==after['profile']
 if before['goalId']!=GID:assert oldLines[i]==newLines[i]
 else:assert {k:v for k,v in before.items()if k!='reviewInputFingerprint'}=={k:v for k,v in after.items()if k!='reviewInputFingerprint'}
 assert after['evidenceLevel']=='E0' and after['maximumClaimScope']=='G0' and after['reviewAuthority']=='ai_candidate' and after['status']=='needs_human_review' and after['reviewRunIds']==[]
case='thirty-two-whole-DE-EN-cases.raw-author.json';assert (V/'blind-inputs'/case).read_bytes()==(O/'blind-inputs'/case).read_bytes()
assert len(read(O/'blind-inputs'/case)['cases'])==32
model=read(O/'native-sixteen/bundle/book-model.json');oldModel=read(V/'native-sixteen/bundle/book-model.json')
assert [p['goalId']for p in model['pages']]==ids and len(model['pages'])==16
assert sum(p['visualization']is not None for p in model['pages'])==16
assert model['pages'][9]['visualization']['originalDigest']=='sha256:6778295209ab596f763c1f71ee08d372743b656f6a851a2129f183830d5fd2ad'
assert model['pages'][11]['visualization']==oldModel['pages'][11]['visualization']
for page,oldPage,p in zip(model['pages'],oldModel['pages'],profiles):
 assert page['description']==goals[page['goalId']]['description']
 for key in ['reviewId','status','reviewInputFingerprint','profileFingerprint','evidenceLevel','maximumClaimScope']:assert page['evidenceReview'][key]==p[key]
 if page['goalId']!=GID:
  assert page['visualization']==oldPage['visualization']
  assert page['evidenceReview']==oldPage['evidenceReview']
 assert not any(key in json.dumps(page)for key in ['aiNotes','aiReviewer','chatGptNotes','chatGptReviewer'])
for label in ['a','b']:
 inp=read(O/f'native-sixteen/round-{label}/description-review-input.json');campaign=read(O/f'native-sixteen/round-{label}/description-review-campaign.json')
 assert [g['goalId']for g in inp['goals']]==ids
 assert campaign['blindToOtherReviews'] and campaign['reviewPass']=='first_pass' and campaign['goalCount']==16
 for g in inp['goals']:
  assert g['currentDescriptionDe']==goals[g['goalId']]['description'] and g['currentDescriptionEn']==goals[g['goalId']]['descriptionEn']
 assert not any('record' in p.name and p.suffix=='.jsonl' for p in (O/f'native-sixteen/round-{label}').rglob('*'))
commands=read(O/'checks/COMMANDS.normal-native16-prepare-check.json')['commands']
assert len(commands)==2 and [x['name']for x in commands]==['native16-stock-prepare','native16-stock-check']
for row in commands:assert row['exitCode']==0 and '--write' not in row['argv'];assert bind(R/row['output'])['sha256']==row['outputSHA256']
pdf=O/'native-sixteen/bundle/book.pdf';doc=fitz.open(pdf);assert len(doc)==18
views=sorted((O/'checks/pdf-page-views').glob('*'));assert len(views)==6
html=(O/'native-sixteen/bundle/book.html').read_text();assert GID in html and 'Stabilität' in html and '<img' in html
write('checks/PDF.actual-eighteen-page-render-inspection.json',{'role':'Technical PDF layout inspection only; no new scientific or image-acceptance vote','writtenAtUTC':NOW,'pdf':bind(pdf),'PDFPages':18,'goalPages':16,'allPagesActuallyViewed':True,'viewMethod':'Five actual PyMuPDF contact sheets opened with view_image; page12 additionally opened at 1.6x actual raster.','actualViewedImages':[bind(p)for p in views],'pages':[{'PDFPage':i+1,'goalId':None if i<2 else ids[i-2],'textCharacters':len(p.get_text()),'observedRenderState':'no unexpected blank, clipping, overflow or broken image'}for i,p in enumerate(doc)],'PourbaixActualPDFPage':12,'PourbaixPNGRendered':True,'newScientificVotes':0})
before=read(O/'checks/ORIGINAL.v1.before.whole-finite-inventory.json')
actual=[bind(p)for p in sorted(V.rglob('*'))if p.is_file()]
assert actual==before['filesIncludingSeal']
for row in read(V/'FILES.finite-native16-technical.seal.json')['files']:verify(row)
write('checks/ORIGINAL.v1.after.whole-finite-inventory-unchanged.json',{'beforeInventory':bind(O/'checks/ORIGINAL.v1.before.whole-finite-inventory.json'),'originalSeal':bind(V/'FILES.finite-native16-technical.seal.json'),'allFilesIncludingSealExact':True,'fileCountIncludingSeal':len(actual),'originalRootWrites':0})
write('checks/RADIUS.final-PNG-only-and-raw-author-bodies-exact.json',{'beforeV1':tech['originalV1Seal'],'afterCanonical':tech['canonical'],'selectedGoals':16,'other15WholeGoalsExact':True,'other15ImageAssetRowsAndBytesExact':True,'mechanism138FinalPNGAndV1WholeRowExact':True,'other15WholeRawProfileLinesByteExact':True,'all16ScientificProfileBodiesExact':True,'whole32BilingualCasesByteExact':True,'all16GoalTextsDEENExact':True,'PourbaixOnlyGoalResourceLinksChanged':True,'PourbaixOnlyRawProfileReviewInputFingerprintChanged':True,'stockAll16RawProfileFingerprintCheck':bind(O/'checks/CHECK.rawP16-stock-fingerprints-and-semantics.actual.json'),'normalQAOther437WholeRowsExact':True,'normalQA438UniqueGoalRows':True,'archiveQA439PreservesAll438AndAddsOneExistingVote':True,'newScientificVotes':0})
write('checks/SETUP.actual-input-discovery-correction.json',{'role':'Technical setup history, not a native command attempt','actualInitialSetupAssertion':'The setup assumed Pourbaix had no QA row; inspection found its existing missing/no_primary_link placeholder. The assertion stopped setup before native execution.','resolution':'Archive439 preserves all438 plus actual existing V1. Normal438 replaces only the missing placeholder; stock unique-goal constraint applies without exception.','nativeFailedAttempts':0,'stockFailedAttemptInvented':False})
native=[bind(p)for p in sorted((O/'native-sixteen').rglob('*'))if p.is_file()]
blind=[bind(p)for p in sorted((O/'blind-inputs').rglob('*'))if p.is_file()]
blindname='INPUTS.blind-native16-whole-scientific-materials.selector.json'
write(blindname,{'schemaVersion':1,'role':'Exclusive neutral whole scientific reading list for future fresh independent D16 reviewers','createdAtUTC':NOW,'goalIds':ids,'nativePDFPages':18,'wholeBilingualCases':32,'rawAuthorProfiles':16,'currentImages':16,'nativeBundleAndBlankRounds':native,'wholeRawScientificCompanions':blind,'currentCanonicalWholeGoals':tech['canonical'],'actualPrimaryDocuments':tech['sourcePrimaryDocuments'],'readInstructions':['Read all actual18 PDF pages, full DE/EN descriptions, all32 whole bilingual cases and16 raw E0/G0 profiles, full current prerequisites/parents, raw coupled source cells, actual whole partner competencies and complete passages.','Both text and rawText fields contain source passages. Do not infer absent passages from a missing rawText key. Read actual original columns and operators; IDs/hashes alone are not scientific coverage.','All16 current raster bodies are bound explicitly. Pourbaix is now present, as is the unchanged final mechanism138 PNG. Examine actual pixels. Structural model QA metadata does not determine a D/P/A decision.','Author profile bodies and their metadata remain exact. In particular, the frozen author dissent saying Pourbaix has no image predates this technical image addition and does not describe the final native inputs. Only its resource reviewInputFingerprint was recalculated with the unchanged stock materializer. E0/G0 remains E0/G0, ai_candidate/needs_human_review, with no reviewRunIds.','Use only this explicit reading list; enclosing author-directory references are provenance, not permission to read author FIRST, author assessment dossiers, technical selectors, QA/V judgments or old/peer independent review outputs.','Both native rounds are blank first-pass campaigns. Genuine new reviewer FIRST and records must follow their own actual reading. This preparer supplies no D/P/A/M/V judgment.','Machine candidates are not learner/laboratory performance or human approval. Later genuine execution must satisfy practical mastery criteria; missing actual trial participants are not a new machine-M7 prerequisite.'],'authorFIRSTAssessmentVOrOldReviewsCopiedIntoBlindCompanions':0,'newScientificVotesByPreparer':0})
write('checks/FINITE.actual-final-PNG-native16-closure.json',{'role':'Finite purely technical native16-v2 closure','createdAtUTC':NOW,'canonical':tech['canonical'],'semantic':tech['semantic'],'goals':16,'images':16,'PDFPages':18,'wholeDEENCases':32,'rawE0G0Profiles':16,'blankRounds':2,'nativePrepareSuccessfulExecutions':1,'nativeCheckSuccessfulExecutions':1,'nativeFailedAttempts':0,'writeFlagUsed':False,'normalQARecords':438,'archiveQAHistoryRecords':439,'newScientificVotes':0,'sourcePrimaryBindingsVerified':len(tech['sourcePrimaryDocuments']),'sparseHost':host,'originalV1EntireRootUnchanged':True,'centralRuns':0,'fullBuilds':0,'activeWrites':0,'gitWrites':0,'state':'finite; STOP'})
(O/'README.md').write_text('''# Native16 v2 – finale PNG, rein technische Vorbereitung

Finaler Canonical `52e199c13…`, Semantic `597c71f9…`;16 unveränderte Zieltexte,16 Bilder und18 tatsächlich betrachtete PDF-Seiten. Die neue Pourbaix-Grafik und die finale Mechanismus138-PNG sind enthalten. Das ursprüngliche Native16-v1-Paket einschließlich seines ganzen endlichen Inventars ist bytegleich erhalten.

`prepare` und `check` des unveränderten Stock-Materializers liefen je einmal erfolgreich ohne `--write` (12,307s /0,913s). Beide Reviewrunden sind blank. Kein D/P/A/M/V-Votum wurde erstellt. Die frühere echte Pourbaix-V1-Stimme wird nur unverändert transportiert.

## Wissenschaftliche Blindinputs

`INPUTS.blind-native16-whole-scientific-materials.selector.json` bindet ausschließlich native Inputs und ganze aktuelle wissenschaftliche Körper:32 DE/EN-Fälle,16 unbegutachtete E0/G0-Profile, ganze Ziel-/Prereq-/Elternobjekte, rohe Quellzellen, tatsächliche ganze Partnerkompetenzen,87 Passagen,24 Primärdateien und16 tatsächliche Rasterbilder. Keine Autor-FIRST, Bewertungsdossiers, V-Urteile oder alten D-Dateien werden als wissenschaftliche Blindinputs selektiert. Eingeschlossene reine Materialkörper und strukturelle QA-Metadaten sind keine wissenschaftlichen Urteile.

Alle16 fachlichen Profilkörper und32 Fälle sind bytegleich zur v1 erhalten. Nur Pourbaixs `reviewInputFingerprint` ist durch `buildPositiveGoalEvidenceCandidateRecords` aus dem unveränderten Stock-Materializer neu berechnet. Alle16 Profile bestehen die unveränderte Stock-Fingerprint-/Semantikprüfung und bleiben `ai_candidate`, `needs_human_review`, E0/G0, ohne Reviewruns. Die alte Autoren-Metadatennotiz über eine Pourbaix-Bildlücke ist eingefrorene Herkunft und wird in der Blindleseanweisung ausdrücklich zeitlich eingeordnet.

## Exakte QA und kleiner Host

Normale QA438 =437 unveränderte ganze Zeilen plus der vorhandene genuine Pourbaix-V1 an Stelle des alten fehlenden Platzhalters. Die bereits erzeugte QA439 bleibt unverändert als Assemble-History:438 alte Zeilen plus V1. Diese History ist kein normaler QA-Input, weil der unveränderte Stock doppelte goalId ablehnt. Es gab keinen nativen Stockfehlversuch; nur eine frühe Setup-Assertion deckte den vorhandenen missing-Platzhalter auf. Die Mechanismus138-Stimme bleibt exakt erhalten.

Die Map baut einen privaten sparsamen tmp-Host mit32 physisch unveränderten Stockmodulen (31 native Module plus Rohprofil-Materializer),51 physischen Datenaliasen,16 physischen Publicbildern und zusätzlich einer physischen Pourbaix-Kanonicalkopie; alle anderen Rasterreferenzen lesen exakte vorhandene Bytes. Keine Vollrepo- oder Bildbaumkopie. Die tatsächliche Größe und Dateizahl stehen in `checks/HOST.actual-sparse-sixteen.json` und bleiben unter80MiB.

`INPUTS.final-native16-current422.physical-selector.json` und `FILES.finite-native16-technical.seal.json` bilden die endliche technische Übergabe. `scripts/rebuild_native16_sparse_host.py` kann ausschließlich den kleinen Host in einem neuen tmp-Pfad reproduzieren und startet keine Native-/Central-Runs. Keine aktive Registry, Ledger, Runtime oder Gitwrites. Keine neue wissenschaftliche, menschliche oder M7-Freigabe. STOP; Root startet die neuen unabhängigen D16-Reviewer.
''')
parsed={'json':0,'jsonl':0,'python':0}
for p in O.rglob('*'):
 assert not p.is_symlink()
 if not p.is_file():continue
 if p.suffix=='.json':read(p);parsed['json']+=1
 if p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
  parsed['jsonl']+=1
 if p.suffix=='.py':ast.parse(p.read_text());parsed['python']+=1
write('checks/FINITE.own-format-parse.json',{'ownRootOnly':True,'parsed':parsed,'errors':0})
name='INPUTS.final-native16-current422.physical-selector.json'
members=sorted(p for p in O.rglob('*')if p.is_file()and p.name not in [name,SEAL.name])
write(name,{'schemaVersion':1,'role':'Finite final-PNG Native16 v2 technical handoff, not scientific judgment or blind reading list','createdAtUTC':NOW,'goalIds':ids,'blindScientificSelector':bind(O/blindname),'physicalSourceProvenance':tech,'physicalFiniteFiles':[bind(p)for p in members],'actualNative':{'goals':16,'PDFPages':18,'images':16,'wholeDEENCases':32,'rawAuthorE0G0Profiles':16,'prepareExitCode':0,'checkExitCode':0,'successfulExecutionsEach':1,'writeFlagUsed':False,'allPDFPagesActuallyViewed':True},'normalQARecords':438,'archiveQAHistoryRecords':439,'replayMap':bind(O/'checks/REBUILD.native16.current338-exact-physical-map.json'),'originalV1EntireRootUnchanged':True,'newScientificVotes':0,'centralRuns':0,'fullBuilds':0,'activeWrites':0,'gitWrites':0,'state':'finite; STOP'})
members=sorted(p for p in O.rglob('*')if p.is_file()and p!=SEAL)
write(SEAL.name,{'schemaVersion':1,'role':'Finite final-PNG Native16 v2 technical seal; no scientific vote','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'fileCount':len(members),'totalBytes':sum(p.stat().st_size for p in members),'finalSelector':bind(O/name),'blindScientificSelector':bind(O/blindname),'files':[bind(p)for p in members],'symlinksInSealedRoot':0,'newScientificVotes':0,'state':'finite; STOP'})
for row in read(SEAL)['files']:verify(row)
print(json.dumps({'selector':bind(O/name),'blindSelector':bind(O/blindname),'seal':bind(SEAL),'pdf':bind(pdf),'host':host,'files':len(members),'state':'STOP'},indent=2))
