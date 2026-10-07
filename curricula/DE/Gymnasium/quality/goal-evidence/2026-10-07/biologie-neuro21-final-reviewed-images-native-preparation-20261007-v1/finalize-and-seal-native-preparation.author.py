# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
NATIVE = OUT / 'isolated-repository'

def bind(p):
    p = p.resolve()
    data = p.read_bytes()
    return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}

def read(p):
    return json.loads(p.read_text())

def write(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

def checked(b):
    expected={'path':b['path'],'sha256':b['sha256'].removeprefix('sha256:'),'bytes':b['bytes']}
    actual=bind(ROOT/b['path'])
    assert actual == expected, b['path']
    return actual

external={}
for manifest,name in [(read(OUT/'external-declared-inputs.before-native-model.author.json'),'inputBindings'),
                       (read(OUT/'native-full390-subsets-P-and-current-AM-preparation.actual.author.receipt.json'),'inputs')]:
    for b in manifest[name]:
        actual=checked(b)
        if not (ROOT/b['path']).is_relative_to(OUT):
            external[b['path']]=actual
pair=read(OUT/'inputs/current21-paired-visual-selection.exact.json')
imports=read(OUT/'native-isolation-and-imports.actual.author.receipt.json')
ids=[r['goalId'] for r in imports['selectedImages']]
selection={r['goalId']:r for r in pair['entries']}
for r in imports['selectedImages']:
    assert r['selectedUnchangedOriginalAsset'] == selection[r['goalId']]['asset']
    for name in ['selectedUnchangedOriginalAsset','actualFinalGenerationPrompt']:
        b=r[name]; external[b['path']]=checked(b)
    for name in ['reviewA','reviewB']:
        b=selection[r['goalId']][name];external[b['path']]=checked(b)
source_witnesses=read(OUT/'inputs/selected21-source-witness-effective-bindings.exact.json')
assert source_witnesses['allOriginalWholeSourceAndScopeHOLDsPreserved'] is True
for row in source_witnesses['records']:
    assert row['wholeSourceApproval'] is False
    for item in row['exactEffectiveBindings']:
        b=item['binding'];external[b['path']]=checked(b)
    b=row.get('actualRetainedDocumentBinding')
    if b:
        external[b['path']]=checked(b)

render_records=[]
expected_assets={r['selectedUnchangedOriginalAsset']['sha256']:r for r in imports['selectedImages']}
for name,size in [('twenty',20),('one',1)]:
    bundle=OUT/f'native-final-{name}'
    model=read(bundle/'book-model.json')
    assert len(model['pages'])==size
    for fmt in ['html','pdf']:
        manifest=read(bundle/f'book.{fmt}.render-manifest.json')
        assert manifest['goalPageCount']==size and manifest['frontMatterPageCount']==2
        assert manifest['physicalPageCount']==size+2 and len(manifest['assets'])==size
        assert manifest['modelDigest']==model['digest']
        urls=set()
        for asset in manifest['assets']:
            digest=asset['sourceSha256'].removeprefix('sha256:')
            assert digest in expected_assets
            r=expected_assets[digest]
            goal_id=r['goalId']
            url='/assets/goal-visualizations/biologie/'+goal_id+'/'+goal_id+'.png'
            assert asset['publicPath']==url
            assert bind(NATIVE/('app/public'+url))['sha256']==digest
            urls.add(url)
        assert urls=={p['visualization']['url'] for p in model['pages']}
        render_records.append({'subset':name,'format':fmt,'artifact':bind(bundle/f'book.{fmt}'),
                               'manifest':bind(bundle/f'book.{fmt}.render-manifest.json'),
                               'model':bind(bundle/'book-model.json'),'modelDigest':model['digest'],
                               'actualGoalPages':size,'actualPhysicalPages':size+2,
                               'allSourceAssetHashesMatchExactPairedSelection':True,
                               'allRenderedDerivativeHashesDeclaredByNativeManifest':True})

diff390=read(OUT/'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json')
diff472=read(OUT/'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json')
assert len(diff390['rows'])==390 and len(diff472['rows'])==472
assert len(diff390['actualPriorToFinalChangedPageIds'])==21
assert len(diff390['actualCurrentToFinalChangedPageIds'])==22
assert diff390['protected74WholeGoalsPagesContextsAndImagesExact'] is True
assert all(r['priorVsFinalWholeSourceExact'] for r in diff472['rows'])
assert len([r for r in diff472['rows'] if not r['selected21'] and r['currentVsFinalWholeGoalExact']])==451
assert all((ROOT/b['path']).is_relative_to(OUT) for b in [bind(p) for p in OUT.rglob('*') if p.is_file()])

git_refs=subprocess.run(['git','rev-parse','HEAD','refs/heads/main'],cwd=ROOT,capture_output=True,text=True,check=True).stdout.splitlines()
assert len(git_refs)==2 and git_refs[0]==git_refs[1]=='4600693fd163e9519d5eb21c3c4e7008d39d12d6'
active_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert bind(active_path)['sha256']=='244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1'
assert read(active_path)==read(OUT/'inputs/current472.active-baseline.exact.json')

main_raw_path=OUT/'final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json'
main_raw=read(main_raw_path)
main_raw['actualFinalNativeRenderedArtifacts']=render_records
main_raw['privatePublicRootForNativeHtmlAndPdf']=(NATIVE/'app/public').relative_to(ROOT).as_posix()
main_raw['actualRenderFormatsAndSourceAssetChecksComplete']=True
main_raw['nativeDOrPScientificCampaignResultsCreated']=False
main_raw['actualNativeSubsetDInputsAreReviewInputsNotVerdicts']=True
main_raw['nativeFull390ModelSuccessfulBuildCount']=1
main_raw['authorSpotLayoutViews']={
    'reviewAuthority':'author spot layout only; no independent approval',
    'actuallyViewedWith':'view_image detail original',
    'pages':[bind(OUT/'author-layout'/n) for n in ['ce19.actual-native-pdf-physical3.png','080b.actual-native-pdf-physical22.png','c05.actual-native-pdf-physical3.png']],
    'observationsDe':'Die drei tatsächlich gerasterten nativen PDF-Seiten zeigen das passende Bild zusammen mit aktuellem Zieltext. Die Struktur-, Tiermodell- und Hormonabbildungen laden, ihre großen Beschriftungen bleiben sichtbar. Das ist eine Autoren-Layoutstichprobe, keine unabhängige Prüfung aller21 finalen Seiten.'}
write(main_raw_path,main_raw)

write(OUT/'final-native-artifacts-and-neutral-review-routing.author.json',{
    'role':'technical AUTHOR routing; complete artifacts, no new scientific review',
    'mainNeutralRaw':bind(main_raw_path),
    'nativeArtifacts':render_records,
    'isolatedNativeRoot':NATIVE.relative_to(ROOT).as_posix(),
    'rendererPublicRoot':(NATIVE/'app/public').relative_to(ROOT).as_posix(),
    'nativeFull390Config':bind(NATIVE/'config/full-final390.book.config.json'),
    'nativeFull390Model':bind(NATIVE/'outputs/full-final390.book-model.json'),
    'nativeBuildApi':'loadGoalBookBuildInputs(configPath, isolatedRepositoryRoot)',
    'positiveTechnicalCandidateConfig':bind(OUT/'candidate-scaffolds/positive21.final-image-candidate.config.json'),
    'positiveTechnicalCandidateRecords':bind(OUT/'candidate-scaffolds/positive21.final-image-candidate.records.jsonl'),
    'currentAM390ExactTechnicalContinuity':bind(OUT/'current390-AM-content-decisions-exact-technical-fingerprint-recalculation.author.json'),
    'whole472Comparison':bind(OUT/'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json'),
    'whole390Comparison':bind(OUT/'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json'),
    'bindingReviewScopeDe':'Zwei unabhängige Reviewer prüfen die neuen tatsächlichen21 Bild-/Seiten-/Kontextbindungen, vollständige DE/EN-Ziele und aktuellen P-Profile/Fälle gegen die bisherigen fachlichen Entscheidungen. Sie bewerten den bekannten unveränderten949-Kontextdelta und die74 geschützten Bindungen anhand des technischen Ganzvergleichs. Frühere D/P-Urteile werden nicht vom Autor auf neue Fingerprints kopiert.',
    'nativeCampaigns':'No new D/P scientific campaign verdicts or run manifests are authored. Complete nativeSubsetDInput/context fingerprints and native ai_candidate P records are neutral binding-review inputs.',
    'pdfPhysicalPageRouting':'twenty goal pages3-22; one goal page3',
    'unchangedSourceHOLDs':bind(OUT/'inputs/source-HOLDs.exact.json'),
    'wholeSourceCoverageGranted':False,'countrySourceAtlasRebuilt':False,
    'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False})

write(OUT/'actual-input-and-main-drift-verification.author.json',{
    'role':'final technical input/active-baseline guard only',
    'verifiedAt':datetime.now(timezone.utc).isoformat(),'head':git_refs[0],'main':git_refs[1],
    'activeCanonicalBinding':bind(active_path),'activeWholeCanonicalExactToInitialSnapshot':True,
    'allDeclaredExternalInputBytesMatchExpected':True,'protected74WholeGoalPageContextImageExact':True,
    'sourceWitnessesRetainWholeSourceApprovalFalse':True,'sourceHOLDsExact':True,
    'all21NativeHtmlAndPdfAssetSourcesExactToPairedSelection':True,
    'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False})

(OUT/'README.md').write_text('''# Biologie Neuro21: endgültige Bilder, isolierte native Vorbereitung

Die tatsächlichen nativen HTML/PDF-Artefakte für **20 + 1 Ziele** sind fertig. Sie enthalten alle21 exakt ausgewählten Originalbilder aus der separat versiegelten gepaarten visuellen Entscheidung. Die PDFs haben physisch22 beziehungsweise3 Seiten; Lernzielseiten liegen auf den physischen Seiten3–22 beziehungsweise3. Vier native Render-Manifeste binden die Original-SHA-256 und die tatsächlichen HTML-/PDF-Derivate.

Das vollständige native390er Modell wurde einmal erfolgreich mit95 tatsächlichen Bild-Assets gebaut:74 bytegenau übernommene vorhandene Bilder und21 neue Kandidaten. Der neue Kandidat enthält472 ganze Ziele. Gegen die vorherige Stage02 ändern sich ausschließlich die21 primären Bildressourcen und21 daraus folgende Seiten-/Kontextbindungen. Gegen die aktive Basis ändern sich22 Seiten; das bekannte zusätzliche Prerequisite-Label-/Kontextdelta bei9499943f ist erhalten. Alle451 Ziele außerhalb des21er-Scopes bleiben als ganze Objekte zur aktiven Basis exakt. Alle74 geschützten Ziele, Seiten, D-Kontexte und Bildbindungen sind exakt.

Die drei unveränderten nativen Visualisierungshelfer liegen als bytegenaue physische Kopien unter `isolated-repository/scripts`. Ihr physischer ROOT_DIR retargetet alle Prepare-/Import-Ausgaben ausschließlich in diesen privaten Root. Die21 Prepare- und21 Importaufrufe sind tatsächlich ausgeführt. Source-, Frontend- und Backend-Kopien entsprechen jeweils exakt dem ausgewählten Original. Native Produktions-URLs `/assets/goal-visualizations/biologie/...` bleiben erhalten. Der Renderer verwendete nativ `--public-root` für den privaten Frontend-Assetroot. Es wurden keine aktiven Kopien geschrieben und keine Helfer, Validatoren oder Ausnahmeregeln geändert.

`final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json` und `final-native-artifacts-and-neutral-review-routing.author.json` liefern den vollständigen neutralen Eingang für zwei gezielte unabhängige Bindungsreviews. Ganze aktuelle/Stage02/endgültige Ziele, echte native ganze und20+1 abgeleitete Seiten/D-Kontexte, Quellen-Witnesses, Bildautor-Routen und aktuelle vollständige P-Profile stehen darin. Der Ganzvergleich aller390 Seiten und472 Ziele liegt separat vor. Ein neues D/P-Wissenschaftsurteil oder Reviewrun wurde nicht vom Autor erzeugt.

Die native P-Materialisierung erstellt21 **ai_candidate / needs_human_review**-Scaffolds mit leeren Reviewrun-IDs. Die inneren20 bisherigen Profile bleiben exakt; nur080b wird durch das vollständige aktuelle v4-Profil ersetzt. Die historischen P-Records und Materialien bleiben bytegenau als Eingänge erhalten. Das bestehende native P-Konfigurationsfeld `reviewedResourceTypes` bleibt leer; tatsächliche Bild-SHA-Bindungen stehen gesondert in nativen Seiten und Render-Manifests. Diese Vorbereitung ersetzt keine neue unabhängige Bild-/Seiten-/Kontext-Bindungsentscheidung.

Die tatsächlich aktuellen unabhängigen A/M390-Records bleiben als ganze Dateien exakt. Ihre780 nativen semantischen Fingerprint-Inputs wurden technisch nachgerechnet und stimmen weiterhin; alle acht Memory-View-Scopes bleiben erhalten. Das ist keine neue fachliche A/M-Freigabe. Ganze SourceHOLDs,189 Länder-Ziel-Paare und alle begrenzten Quellenrollen bleiben unverändert; keine bisherige `wholeSourceApproval=false` wird in eine pauschale Quellenfreigabe umgewandelt.

Zwei tatsächliche vorbereitende Fehler bleiben dokumentiert: zuerst fehlte der native `sha256:`-Präfix in21 eigenen QA-Scaffold-Digests; anschließend behandelte die eigene technische Assertion das vorhandene Label `KEEP_after_targeted_regeneration` fälschlich wie ein anderes Urteil. Beide Fehler wurden nur in eigenen Dateien korrigiert, bevor ein Modell entstanden war. Der dritte Aufruf lieferte das einzige erfolgreich gebaute Endmodell. HTML und PDF wurden je20/1 einmal erfolgreich erzeugt. Native Quellen und Validatoren blieben unverändert.

Die tatsächlichen PDF-Seiten ce19/080b/c05 wurden mit `pdftoppm` gerastert und mit `view_image` als Autoren-Layoutstichprobe gesehen. Keine unabhängige Prüfung aller21 Seiten, App-/Host-Abnahme oder menschliche Freigabe wird daraus abgeleitet.

Lokaler HEAD und main:4600693fd163e9519d5eb21c3c4e7008d39d12d6. Aktive Biologie-Datei unverändert:244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1. Alle deklarierten Eingangsbytes werden im finalen Seal erneut verifiziert. Kein globaler Build/Test, Generator, aktive Canon/QA/Registry-Writes oder historische Dossieränderung. Human Approval/Trial:false. Neue strenge Abschlüsse und Nettozuwachs:0.

Eigene technische Skripte:Apache-2.0. Eigene didaktische Texte/Bilder behalten CC-BY-4.0; amtliche und externe Originale behalten ihre jeweiligen Rechte. Die Vorbereitung erzeugt keine zusätzliche Rechtefreigabe.
''')

for b in external.values():
    checked(b)
payload_paths=sorted(p for p in OUT.rglob('*') if p.is_file() and p.name!='final-native-preparation.author.freeze.json')
freeze={'role':'final inert native technical author preparation freeze; no new scientific approvals',
        'sealedAt':datetime.now(timezone.utc).isoformat(),'declaredInputs':sorted(external.values(),key=lambda b:b['path']),
        'ownPayloads':[bind(p) for p in payload_paths],'ownPayloadCount':len(payload_paths),
        'exactSelectedImages':[{k:e[k] for k in ['goalId','asset','pairedVisualDecision']} for e in pair['entries']],
        'nativeFinalArtifacts':render_records,'successfulFull390NativeModelBuilds':1,
        'protected74Exact':True,'unselected451WholeGoalsExact':True,'wholeSourceHOLDsExact':True,
        'current080bV4ProfileBodyExact':True,'currentAM390WholeDecisionsExact':True,
        'humanApproval':False,'humanTrial':False,'newStrictCompletion':0,'netStrictGain':0,
        'activeWrites':False,'independentFinalBindingReviewPending':True,'freezeFileSelfExcluded':True}
freeze_path=OUT/'final-native-preparation.author.freeze.json'
write(freeze_path,freeze)
for b in freeze['declaredInputs']+freeze['ownPayloads']:
    checked(b)
assert len([p for p in OUT.rglob('*') if p.is_file()])==freeze['ownPayloadCount']+1
print(json.dumps({'freeze':bind(freeze_path),'neutralFinalInput':bind(main_raw_path),
                  'declaredInputCount':len(external),'payloadCount':len(payload_paths),'nativeArtifacts':render_records,
                  'protected74Exact':True,'activeWrites':False,'netStrictGain':0},ensure_ascii=False,indent=2))
