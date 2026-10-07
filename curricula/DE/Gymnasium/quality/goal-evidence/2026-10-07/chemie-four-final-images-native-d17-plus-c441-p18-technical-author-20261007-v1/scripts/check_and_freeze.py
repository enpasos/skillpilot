from pathlib import Path
from datetime import datetime,timezone
import json, hashlib, subprocess, sys, re
ROOT=Path('/home/enpasos/projects/skillpilot');BASE=Path(__file__).resolve().parent.parent;N=BASE/'native-root'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
V3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'
A=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-four-evidenced-friendly-comic-author-20261007-v1'
C=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-c441-gasfoermige-caption-targeted-author-20261007-v1'
PAIRED=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-native-paired-current-preparation-technical-20261007-v1'
FREEZE=BASE/'final-own-files-and-reused-inputs.freeze.json'
def read(p):return json.loads(p.read_text())
def write(p,j):p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def pin(p):
 d=p.read_bytes();j={'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
 if p.is_symlink():j.update({'kind':'read_only_existing_asset_symlink','symlinkTarget':str(p.resolve())})
 return j
def verify_manifest(p):
 j=read(p)
 for row in j.get('ownFiles',[]):
  q=ROOT/row['path'];assert hashlib.sha256(q.read_bytes()).hexdigest()==row['sha256'],q
 return pin(p)
if '--check' in sys.argv:
 j=read(FREEZE)
 for row in j['ownFiles']+j['reusedInputPins']:
  q=ROOT/row['path'];assert pin(q)['sha256']==row['sha256'],q
 print(json.dumps({'frozenOwnFilesVerified':len(j['ownFiles']),'reusedInputsVerified':len(j['reusedInputPins']),'freeze':pin(FREEZE)}));raise SystemExit()
if FREEZE.exists():raise SystemExit('Already sealed; read-only --check or new version only.')
plan=read(BASE/'native-import-plan.author.json')['imports'];selected={x['goalId']:x for x in plan}
before={x['id']:x for x in read(V2/'candidate/canonical.whole-current-plus-targeted-corrections.json')['goals']}
after={x['id']:x for x in read(N/'candidate/canonical.final-image-candidate.json')['goals']}
assert before.keys()==after.keys();canon_changes=[]
for gid in before:
 if before[gid]!=after[gid]:
  fields=[k for k in before[gid] if before[gid][k]!=after[gid].get(k)]
  assert gid in selected and fields==['resourceLinks'],(gid,fields)
  canon_changes.append({'goalId':gid,'changedFields':fields,'beforeResourceLinks':before[gid].get('resourceLinks',[]),'afterResourceLinks':after[gid].get('resourceLinks',[])})
assert len(canon_changes)==4
for gid,row in selected.items():
 for rel in [f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png',f'app/public/assets/goal-visualizations/chemie/{gid}/{gid}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{gid}/{gid}.png']:
  assert pin(N/rel)['sha256']==row['selectedSha256'],rel
 link=after[gid]['resourceLinks'][0]
 assert link['url'].endswith(f'/{gid}.png') and link['provider']=='OpenAI / ChatGPT-Codex built-in image_gen' and link['license']=='CC-BY-4.0' and link['reviewStatus']=='candidate'
oldD={x['goalId']:x for x in read(V2/'native-d-seventeen/round-a/description-review-input.json')['goals']}
newD={x['goalId']:x for x in read(N/'native-d-seventeen/round-a/description-review-input.json')['goals']}
oldPages={x['goalId']:x for x in read(V2/'native-d-seventeen/bundle/book-model.json')['pages']}
newPages={x['goalId']:x for x in read(N/'native-d-seventeen/bundle/book-model.json')['pages']}
retained=[];changed=[]
paired_input={x['goalId']:x for x in read(PAIRED/'native-d17/round-a/description-review-input.json')['goals']}
paired_index=read(PAIRED/'native-d17/resolution-index.json');paired_by={x['goalId']:x for x in paired_index['resolutions']}
for gid,row in newD.items():
 if gid not in selected:
  assert row==oldD[gid]==paired_input[gid]
  assert newPages[gid]['pageFingerprint']==oldPages[gid]['pageFingerprint']
  resolution=PAIRED/'native-d17'/paired_by[gid]['resolutionPath']
  retained.append({'goalId':gid,'wholeNativeDInputExact':True,'goalFingerprint':row['goalFingerprint'],'pageFingerprint':row['pageFingerprint'],'existingPairedNativeResolution':pin(resolution),'existingResolutionIndexEntryExact':paired_by[gid],'newAuthorJudgment':False})
 else:
  assert row['canonicalContext']==oldD[gid]['canonicalContext']
  for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint']:assert row[key]==oldD[gid][key]
  oldpage=oldD[gid]['reviewContext']['page'];newpage=row['reviewContext']['page']
  differences=[key for key in newpage if newpage[key]!=oldpage.get(key)]
  assert set(differences)<=set(['visualization','pageFingerprint'])
  changed.append({'goalId':gid,'oldPageFingerprint':oldD[gid]['pageFingerprint'],'newPageFingerprint':row['pageFingerprint'],'onlyReviewPageChangedFields':differences,'canonicalContextAndFullBilingualGoalExact':True,'physicalPDFPage':newPages[gid]['pageNumber']+2,'selectedAsset':pin(N/('app/public'+after[gid]['resourceLinks'][0]['url']))})
assert len(retained)==14 and len(changed)==3
c441='c441d9e8-d9d9-5e55-a189-a37345541321'
cD=read(N/'native-d-c441/round-a/description-review-input.json')['goals'][0]
for key,field in [('currentTitleDe','title'),('currentTitleEn','titleEn'),('currentDescriptionDe','description'),('currentDescriptionEn','descriptionEn')]:assert cD[key]==after[c441][field]
record_lines=[json.loads(x) for x in (N/'candidate/positive18.author-candidates.review.jsonl').read_text().splitlines()]
oldspec={x['goalId']:x for x in read(V3/'candidate/positive17.corrected-author-candidate-set.json')['goals']}
oldc=read(C/'current-c441-whole-positive-record.exact-original-line.jsonl')
assert len(record_lines)==18
for r in record_lines:
 source=oldc['profile'] if r['goalId']==c441 else oldspec[r['goalId']]['profile']
 assert r['profile']==source
 assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
nativebytes=read(BASE/'receipts/unchanged-native-tool-inputs-and-assets.json')
for row in nativebytes['nativeCopiedModulesAndContracts']:
 assert pin(N/row['path'])['sha256']==row['sha256'],row['path']
for row in nativebytes['existingAssetsReadOnlyAndExact']:
 assert pin(N/row['path'])['sha256']==row['sha256'],row['path']
for op in ['d17-prepare','dc441-prepare','d17-check','dc441-check','p18-materialize','p18-check']:assert read(BASE/f'receipts/{op}.call.json')['exitCode']==0
write(BASE/'four-final-new-d-inputs-plus-retained-fourteen-routes.technical.json',{'role':'Technical equality and routing only; independent verdicts are attributed to their existing frozen source and are not newly authored here','retained14':retained,'newThree17Inputs':changed,'newSeparateC441':{'goalId':c441,'wholeNativeDInput':cD,'actualPDFPage':3,'historicalDViewUnchanged':pin(N/'candidate/full378.c441-retained-context.view.json')},'existingPairedFreeze':pin(PAIRED/'technical-preparation.final.freeze.json'),'existingPairedIndex':pin(PAIRED/'native-d17/resolution-index.json'),'freshCampaignsHaveNoAuthorResults':True,'newStrictGain':0})
write(BASE/'exact-four-resource-only-canonical-differences.technical.json',{'role':'Technical resource metadata delta; full scientific goals unchanged','changes':canon_changes,'unchangedWholeOtherGoals':475})
write(BASE/'receipts/bounded-native-D18-P18-image-and-retention.check.json',{'role':'Technical integrity/layout only; no D/P science approval','nativeDPrepared':[17,1],'nativePCount':18,'nativeFormalChecksPassed':True,'retainedWholeDInputsAndPageFingerprints':14,'changedD17RasterInputs':3,'newC441Separate':1,'unchangedWholeScientificPProfiles':18,'exactFourSourcePublicBackendPNGTriples':True,'unchangedOther358AssetBindings':True,'candidatePAuthority':'ai_candidate','candidatePStatus':'needs_human_review','candidatePLevel':'E1/G1','humanApproval':False,'humanTrial':False,'strictNetGain':0,'actualFourPDFPagesSeenByAuthorForLayout':['0bf26276.physical-05.png','a44af1fa.physical-14.png','9751b6d8.physical-16.png','c441d9e8.physical-03.png'],'DEOnlyPDFAndFullDEENNativeInput':True,'threeSourceHoldsAndFourVisualApprovalsStillRequireTheirExistingGates':True,'initialFailedNativeCallsPreserved':'D digest must use sha256 prefix; initial P materialize lacked --write. Workflow inputs/invocation corrected, unchanged native production code.'})
reused=[V2/'final-own-files.freeze.json',V3/'final-own-files-and-reused-inputs.freeze.json',A/'final-own-files-and-reused-inputs.freeze.json',PAIRED/'technical-preparation.final.freeze.json',PAIRED/'native-d17/resolution-index.json',V2/'candidate/canonical.whole-current-plus-targeted-corrections.json',V2/'candidate/full378-context.view.json',V2/'candidate/positive-evidence17.author-candidate-set.json',V2/'native-d-seventeen/round-a/description-review-input.json',V2/'native-d-seventeen/bundle/book-model.json',V3/'candidate/positive17.corrected-author-candidate-set.json',V3/'candidate/complete34-bilingual-material-cases.author-v3.json',C/'current-c441-whole-positive-record.exact-original-line.jsonl',ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']
for p in [A/'final-own-files-and-reused-inputs.freeze.json',V2/'final-own-files.freeze.json',V3/'final-own-files-and-reused-inputs.freeze.json']:verify_manifest(p)
assert not subprocess.check_output(['git','diff','--name-only','--','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'],cwd=ROOT,text=True).strip()
readme='''# Finale vier PNGs – native D17+c441 / P18, technische Autorenvorbereitung

**AUTHOR / TECHNIK; inert; ai_candidate / needs_human_review; E1/G1; strict gain0.**

## Einstieg für die gezielte unabhängige Prüfung

- `native-root/native-d-seventeen/bundle/book.pdf`:19 physische Seiten. Neu zu prüfen sind nur0bf26276 (Lernzielseite3/physisch5), a44af1fa (12/14),9751b6d8 (14/16). `actual-final-d-pages/` enthält exakt diese neuen Rasterseiten.
- `native-root/native-d-c441/bundle/book.pdf`:3 physische Seiten, c441 auf Seite3. Nutzt die bisherige gültige private D-Kompositionssicht; die ganzen DE/EN-Ziele und fachlichen Kontexte bleiben erhalten.
- Beide nativen D-Batches haben frische `round-a/` und `round-b/`-Kampagnen mit vollständigen DE/EN-Titeln/Beschreibungen, Quellen-Provenienz, Kontext und Bildbindung. Die Kampagnen enthalten keine Ergebnisse dieses Autors.
- `four-final-new-d-inputs-plus-retained-fourteen-routes.technical.json` belegt14 exakt gleiche ganze D-Input-Objekte und pageFingerprints samt Routen zu den bisherigen versiegelten nativen14-Urteilen. Die gesamte Buch-/Bundle-Bindung ist neu; es wird keine alte Gesamtbundle-Gültigkeit behauptet. Die drei neuen D17-Seiten ändern nur `visualization` und `pageFingerprint` im Review-Kontext.
- `native-root/candidate/positive18.author-candidates.review.jsonl` und `native-root/configs/positive18.author-candidates.config.json`:17 Profile mit exakt v3-P580b und unveränderten16 anderen ganzen Profilen, dazu unveränderter bisheriger c441-Profilkörper. Vollständige34 DE/EN-Fälle stehen in `native-root/candidate/complete34-bilingual-material-cases.v3.exact.json`; c441 samt beiden vollständigen Aufgaben/Modellantworten/Grenzen in `whole-four-author-science-and-material.exact.json`.
- Die vier ausgewählten unveränderten PNGs, Promptfolgen, Originale, Fehlversuche und tatsächlichen360/680-Ansichten liegen im separat versiegelten `chemie-four-evidenced-friendly-comic-author-20261007-v1`. Dessen Freeze ist hier gepinnt.

## Was tatsächlich vorbereitet und geprüft wurde

Unveränderte native Produktions-CLI/API-Dateien und ihre Verträge wurden bytegleich nach `native-root/` kopiert. Damit können die bestehenden Root-basierten Asset-Loader lesen, ohne aktive Dateien zu schreiben. Die nativen Bildimporte liefen dort mit vorherigem dry-run; Source/Public/Backend tragen vier gleiche PNG-Kopien. Die479 ganzen v2-Ziele ändern sich ausschließlich in vier `resourceLinks` mit PNG-URL, OpenAI-Provider, CC-BY-4.0, fachlich begrenztem Alttext und offenem `candidate`-Status. Die übrigen475 ganzen Ziele bleiben gleich. Bestehende Provider-/Assethistorie und alle ungebrochenen Rasterbytes bleiben erhalten. Klassifikationen sind unverändert; der native semantische Quellenfingerprint ändert sich für kein Ziel.

Native D-prepare/check17 und1 sowie P-materialize/check18:PASS. P18:approved0, needs_human_review18, rejected0, reviewRunIds leer. Nur die vier neuen physischen PDF-Seiten wurden tatsächlich rasterisiert und für Layout/Bildbindung angesehen. Vollständige DE-Sätze sind sichtbar; EN ist im nativen vollständigen Review-Input, kein EN-PDF-Nachweis. Formales PASS und Autorenansicht sind keine eigene fachliche D/P/V-Freigabe.

Für native Vollkontext-Hashprüfung werden358 bisherige Assets bytegleich gelesen. Die14 gerenderten unveränderten Assets sind echte Kopien innerhalb des inert Public-Roots; nicht gerenderte übrige Assets sind nur unveränderte Dateisymlinks mit explizitem Ziel/Hash im Freeze. Der node_modules-Symlink verweist auf die vorhandene Installation. Es wurde nichts installiert und kein globaler Build gestartet. Alle native-Aufrufe und die ersten korrigierten Format-/CLI-Fehler sind in `receipts/` erhalten; die Produktionswerkzeuge wurden nicht angepasst.

## Grenzen und Rechte

Die drei ausgeschlossenen Quellen-HOLDs bleiben außerhalb P18/D18; begrenzte597-/975-Quellenrouten aus v2 werden nicht als breite neue Quellenfreigabe umgedeutet. Neue Bildbindungen brauchen die tatsächlichen nachfolgenden unabhängigen Urteile. Die14 unveränderten früheren D-Urteile werden nur mit exakt beibehaltenen Eingaben referenziert, nicht vom Autor neu vergeben. Keine aktive Canon/QA/Registry, Runtime, Veröffentlichung, menschliche Freigabe oder Human Trial. Nach der Freeze wird dieser Ordner nicht beschrieben.

Eigene didaktische Medien/Texte:CC-BY-4.0; technische Skripte/Verfahrensdokumentation:Apache-2.0 nach LICENSING.md. Fremdquellen behalten ihre Rechte und Provenienz.

Read-only Freeze-Prüfung: `python scripts/check_and_freeze.py --check` aus diesem Dossier oder mit vollständigem Scriptpfad. Native Checks laufen mit dem vorhandenen Repository-tsx aus `native-root/`: `app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config configs/native-d-seventeen.batch.config.json`, analog c441; `app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=configs/positive18.author-candidates.config.json`.
'''
(BASE/'README.md').write_text(readme)
own=[pin(p) for p in sorted(BASE.rglob('*')) if p.is_file()]
guards=[pin(p) for p in reused]
j={'role':'AUTHOR/technical frozen native preparation; no science self-approval','frozenAt':datetime.now(timezone.utc).isoformat(),'reviewAuthority':'ai_candidate','status':'needs_human_review','strictNetGain':0,'humanApproval':False,'humanTrial':False,'ownFiles':own,'ownFileCount':len(own),'ownBytesIncludingReadOnlyAssetSymlinkTargets':sum(x['bytes'] for x in own),'reusedInputPins':guards,'freezeExcludesOnlyItself':True,'nodeModulesDirectorySymlinkIsToolDependencyNotFrozenArtifact':str(N/'app/node_modules')}
write(FREEZE,j);print(json.dumps({'files':len(own),'reusedInputs':len(guards),'freeze':pin(FREEZE)},indent=2))
