# SPDX-License-Identifier: Apache-2.0
"""Record an actual blind raster/page review while retaining genuine earlier science."""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
own = Path(__file__).resolve().parent
source = root / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2'
author = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1'
prior = author.parent / 'biologie-human20-current391-independent-a-20261007-v1'
native = author / 'native-raster-candidate/twenty'
def read(path): return json.loads(path.read_text())
def lines(path): return [json.loads(line) for line in path.read_text().splitlines()]
def sha(path): return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()
def binding(path):
    return {'path': str(path.relative_to(root)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

# Substantive observations made after actually viewing all20 full rasters,
# all40 actual Chromium captures, and all20 actual native PDF page captures.
# These are visual/changed-binding findings, not a restart of whole-case science.
OBSERVATIONS = [
    'Haut, Mund und Darm sind richtig als unterschiedliche Mikroorganismen-Kontexte verbunden; diverse Bewohner und bedingt schädliche Keime sind getrennt schematisiert. Keine Sterilitätsgarantie, keine Medikamenten-/Patientenvorgabe. Große Organorte und die drei Lupen bleiben bei360/680 erkennbar.',
    'Bakterielle Teilung steht einer Virusvermehrung in einer Wirtszelle gegenüber. Händewaschen und Kontaktübertragung sind als Schutz-/Übertragungsbezug erkennbar; Antibiotika sind bei Bakterien, nicht Viren eingeordnet. Das Symbol ist keine garantierte Therapie jeder Bakterieninfektion; diese Grenze bleibt in den validen P-Fällen. Hauptvergleich und Beschriftungen bei360/680 lesbar.',
    'Hautbarriere und phagozytierende unspezifische Abwehr sind von Antikörperbezug und T-Zell-Reaktion gegen eine infizierte Körperzelle getrennt. Pollen, sensibilisierte Abwehrzelle und ausgeschüttete Mediatorpunkte bilden eine allergische Fehlreaktion ab. Keine Verwechslung mit absichtlicher Erregerabwehr. Drei große Bereiche bei360/680 erhalten.',
    'Aktiver Antigenreiz löst eigene Zell-/Antikörperantwort und Gedächtniszellen aus; passive fertige Antikörper neutralisieren, klingen ab und erzeugen kein eigenes dargestelltes Gedächtnis. Pfeile/Spritzen sind schlüssig, ohne Dosis oder individuelle Impfempfehlung. Aktiv/Passiv und die kontrastierenden Abläufe bei360/680 klar.',
    'Vorhandene resistente rote Bakterien sind schon vor Antibiotikawirkung vorhanden. Empfindliche Bewohner verblassen, resistente überleben und vermehren sich; zugleich wird die Vielfalt der Gemeinschaft verändert. Kein Mensch wird als resistent erklärt und keine ausschließliche Neubildung von Resistenz behauptet. Hauptablauf bei360/680 klar; kurze Zusatzlabels sind bei360 klein, aber identifizierbar und kein langer Pflichttext.',
    'Zwei vereinfachte Zuckerringe enthalten je einen Ring-Sauerstoff und einen glycosidischen Sauerstoff zwischen den Ringen. Das Fettmotiv zeigt Glycerin mit drei estergebundenen Ketten. Die Peptidhauptkette folgt N-C(R)-C(=O) mit verschiedenen R-Gruppen. Jede der drei roten Carbonyl-O-Bindungen besitzt im unveränderten Originalpixel-Ausschnitt tatsächlich zwei parallele schwarze Striche; keine Bildkorrektur erforderlich. Drei molekulare Motive bei360/680 unterscheidbar; bei360 steht die Motivzuordnung im Vordergrund, nicht vollständiges Ablesen jeder Bindung.',
    'Vielfältige pflanzliche Nahrung, Proteinquelle, Öl/Nüsse und Wasser werden mit sitzendem Lernen und aktiver Bewegung verbunden. Kein exakter universal gültiger Tagesplan, kein Heilsversprechen und keine Gleichsetzung eines Lebensmittels mit nur einem Nährstoff. Die schreibende Person blickt sinnvoll auf ihr Heft; keine rückwärts lesbare Pflichtschrift. Alltag/Vielfalt bei360/680 klar.',
    'Drei gebundene gelbe Substratbausteine werden am komplementären Enzymmotiv gespalten und als drei Produkte freigesetzt; das Enzym bleibt erhalten. Die Energiekurven besitzen gleichen Ausgangs-/Endzustand und eine niedrigere blaue Barriere, kein geänderter Reaktionsenergiegewinn. Der rote Pfeil zwischen Maxima zeigt deren Differenz und ist nicht als gesamte rote Aktivierungsenergie beschriftet. Abläufe/Kurven bei360/680 erkennbar.',
    'Magen- und Darmumgebung sowie verschiedene Enzymmotive zeigen angepasste Bedingungen; normale Umsetzung wird von starkem Hitzeeinfluss mit Formverlust und blockierter Bindung getrennt. Kein universell immer steigender Temperatureffekt. Große passende/Hitze-Kontraste und Organorte bei360/680 klar.',
    'Nahrungsweg geht über Mund/Speiseröhre/Magen zum Darm; enzymatische Motive stehen bei Kohlenhydrat-, Protein- und Fettbeispielen. Protein-Kette wird in einzelne Bausteine zerlegt; Galle aus Leber/Gallenblase emulgiert die Fettphase, bevor Pankreas-/Enzymbezug folgt. Symbolische Größen sind keine exakten chemischen Stoffbilanzen. Hauptweg und drei Abbaugruppen bei360/680 erkennbar.',
    'Zotten und Mikrovilli vergrößern die Oberfläche; dünnes Epithel trennt Lumen von Gefäßen. Kleine violette Nährstoffbausteine gehen zum Blut, grüne Fetttransportmotive getrennt zur zentralen Lymphe. Die schematischen Symbole behaupten keinen vollständig detaillierten Chylomikron-/Estermechanismus. Kompartimente und gerichtete Aufnahme bei360/680 erkennbar.',
    'O2 geht vom Alveolenraum über die dünne Grenzfläche ins Blut; CO2 geht zurück in die Alveole. Im Gewebe sind beide Richtungen umgekehrt. Das Gewebe-Inset besitzt keinen Alveolenraum. Formeln, Pfeile und der dünne Austauschweg bleiben bei360/680 erkennbar; keine Verwechslung von Diffusion und Pumpen.',
    'Geschlossenes Herzsymbol verbindet den blauen Rückweg Körper-Herz-Lunge mit dem roten Weg Lunge-Herz-Körper. Durchgehende Pfeile stimmen auf beiden Kreisläufen. Innenkammern werden bewusst nicht behauptet; äußere Stoffpunkte sind schematischer Austausch, keine genaue Gefäßanatomie. Die zwei Schleifen und Lunge/Herz/Körper bei360/680 klar.',
    'Rauchfreiheit, Bewegung, vielfältige Nahrung und Ruhe stehen allgemeiner Vorsorge gegenüber; ärztliches Gespräch zeigt Behandlungsmöglichkeiten mit Medikamenten-/Inhalations-/Bewegungssymbolen. Kein bestimmtes Präparat, Dosis oder garantierter Therapieerfolg. Das Tablet wird der angesprochenen Person gezeigt; keine falsche Heft-Leserichtung. Große Vorsorge/Behandlung-Gruppen bei360/680 klar.',
    'Glucose und O2 stehen als Ausgangsstoffe, CO2 und H2O als Produkte; Wärmepfeile zeigen Energieabgabe. ATP/ADP-Zyklus koppelt Glucoseoxidation an Muskelarbeit. Die Zell-/Mitochondriendarstellung ist ein Summenprozess und behauptet keine vollständige Glykolyse-Lokalisation; grünen Organellpunkten sind keine Chloroplastenbeschriftungen zugeordnet. Hauptpfeile/Formeln bei360/680 klar.',
    'Aerober Weg nutzt O2, ergibt CO2/H2O und das größere ATP-Symbol; anaerober menschlicher Weg ergibt Lactat und das kleinere ATP-Symbol im Zellplasma. Keine anaerobe CO2-Abgabe und kein Wechsel auf alkoholische Gärung. Symbolanzahl ist keine exakte stöchiometrische ATP-Bilanz; die erhaltenen P-Fälle liefern deren begrenzte Stoff-/Energievergleiche. Beide Wege bei360/680 klar.',
    'Rind und Hund zeigen unterschiedliches Gebiss-/Verdauungssystem. Rind-Lupe zeigt sichtbare untere Schneidezähne unter einer zahnlosen oberen Weichgewebe-/Zahnplattenregion, keine oberen Schneidezähne. Mikrobengemeinschaft in großem Vormagen hilft Pflanzenverdauung; Hund hat einfacheren Magen und Fang-/Schneidezähne. Schematische Darmwege sind gerichtet und bei360/680 erkennbar.',
    'Knochen, Gelenk und antagonistische Armmuskeln zeigen Beugung mit kurzem gewölbtem Beuger und längerem Gegenspieler. Alltagsfolge Sitzen-Bewegungspause-Gehen begründet Haltungsvariation; keine Diagnose oder spezifische medizinische Übungsvorgabe. Die am Laptop sitzende Person blickt in die richtige Bildschirmrichtung. Großes Gelenk und Alltagsfolge bei360/680 klar.',
    'Vielfältige Lebensmittel werden mit Mund-Speiseröhre-Magen-Dünndarm verbunden. Zotten-Inset zeigt gerichtete Aufnahme kleiner symbolischer Nährstoffbausteine aus dem Darmlumen ins Blut. Keine Resorption von ganzen Mahlzeiten oder Behauptung einer genauen Lipidtransportchemie. Große Ernährungs-/Verdauungsbereiche und Pfeile bei360/680 erkennbar.',
    'Atmungslupe zeigt O2 von der Alveole ins Blut und CO2 aus dem Blut in die Alveole. Hauptgefäße führen sauerstoffreicheres Blut zu Körperzellen und sauerstoffärmeres zurück zum Herzen; kein Pfeil kehrt diesen Weg um. Rauchfreiheit ist als allgemeiner Gesundheitsbezug dargestellt. Atmung/Kreislauf/rauchfrei und Richtungen bei360/680 klar.',
]
assert len(OBSERVATIONS) == 20
input_seal = read(source / 'final-human20-raster-native-author-input.freeze.json')
for b in input_seal['frozenFiles']:
    assert binding(root / b['path']) == b
entry = read(source / 'neutral-final-human20-raster-native-review.entry.json')
images = read(source / 'selected-twenty-author-images.exact.json')['images']
assert [g['ordinal'] for g in images] == list(range(1,21))
canon = read(root / entry['sourceCurrentCanonical']['path'])
candidate = read(root / entry['futureInertCanonical']['path'])
current = {g['id']:g for g in canon['goals']}
future = {g['id']:g for g in candidate['goals']}
old_science = read(prior / 'first-twenty-whole-goals-forty-cases-source-P-science.actual.json')
old_science_rows = {g['goalId']:g for g in old_science['records']}
old_v2 = read(prior / 'targeted-v2-five-whole-case-P20-science-resolution.independent-a.actual.json')
assert old_v2['currentWholeCasePScientificVerdict'] == 'PASS20_E1_G1_after_targeted_resolution'
for seal_name in ['first-twenty-whole-science.freeze.json','targeted-v2-science-resolution.independent-a.freeze.json','portable-science-commit-checkpoint.freeze.json']:
    for b in read(prior / seal_name)['frozenFiles']:
        assert binding(root / b['path']) == b
materials = read(root / entry['wholeMaterials']['path'])
previous_p = {g['goalId']:g for g in lines(author / 'science-correction-v2/P20.current-text-preimage.author-targeted-v2.review.jsonl')}
final_p = {g['goalId']:g for g in lines(root / entry['wholeCurrentP20']['path'])}
model = read(root / entry['actualNativeBookModel']['path'])
model_pages = {g['goalId']:g for g in model['pages']}
physical = {g['goalId']:g for g in entry['physicalGoalPages']}
assert len(model_pages) == len(final_p) == len(physical) == 20
pdf_text = subprocess.check_output(['pdftotext','-layout',str(root / entry['actualPortableNativePdf']['path']),'-'],text=True)
pdf_text_path = own / 'actual-native-pdf-full-text.independent-a.txt'
if pdf_text_path.exists():
    assert pdf_text_path.read_text() == pdf_text
else:
    with pdf_text_path.open('x') as stream:stream.write(pdf_text)
pages = pdf_text.split('\f')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+','',s)
assert len([p for p in pages if p.strip()]) == 22

retained_am = []
for gate,path in [('A','semantic-atomicity/canonical-biology-full.review.jsonl'),('M','memory-card-review/canonical-biology-full.review.jsonl')]:
    live = {g['goalId']:g for g in lines(root / 'curricula/DE/Gymnasium/quality' / path)}
    rows = lines(author / f'retained-current-AM/{gate}20.exact.rows.jsonl')
    assert len(rows) == 20
    assert all(g == live[g['goalId']] for g in rows)
    retained_am.append({'gate':gate,'exactCurrentRows':20,'newScienceReviews':0,'inScopeNewCards':0})

visual_records = []
for r,observation in zip(images,OBSERVATIONS):
    gid=r['goalId'];c=current[gid];f=future[gid];old=old_science_rows[gid]
    allowed=copy.deepcopy(c);allowed['resourceLinks']=f['resourceLinks'];assert allowed == f
    assert c['title'] == old['wholeTitleDe'] and c['description'] == old['wholeDescriptionDe']
    assert final_p[gid]['profile'] == previous_p[gid]['profile']
    assert all(final_p[gid][k] == previous_p[gid][k] for k in ['status','reviewAuthority','evidenceLevel','maximumClaimScope','dissent'])
    page=model_pages[gid];native_page=physical[gid];ptext=pages[native_page['physicalPage']-1]
    assert norm(page['description']) in norm(ptext) and norm(page['title']) in norm(ptext)
    assert re.search(r'Lernziel-ID\s+'+re.escape(gid),ptext)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}',ptext)) == 1
    assert page['title'] == c['title'] and page['description'] == c['description']
    assert page['visualization']['originalDigest'] == 'sha256:'+r['sha256']
    assert page['visualization']['altText'] == r['altDe']
    assert set(g['goalId'] for g in page['requires']+page['externalPrerequisites']) == set(c['requires'])
    captures=read(root / entry['actualImageWidthCaptures'][gid])
    assert captures['sourcePath'] == r['path'] and captures['sourceSha256'] == r['sha256']
    assert [a['width'] for a in captures['captures']] == [360,680]
    assert all(a['measured']['objectFit']=='contain' and a['measured']['renderedWidth']==a['width'] for a in captures['captures'])
    visual_records.append({'goalId':gid,'ordinal':r['ordinal'],'machineCandidateDecision':'KEEP','scientificAndVisualVerdict':'PASS',
      'actualObservedFullRaster':binding(root / r['path']),'actualObservedChromiumCaptures':[binding(root / a['path']) for a in captures['captures']],
      'actualObservedNativePdfPage':native_page,'substantiveActualObservationsDe':observation,
      'nativePageObservation':'Viewed the complete actual PDF page: selected image, whole current description, title/ID, breadcrumbs, applicability, direct prerequisite/successor links and footer fit without clipping or text-image collision. Page context remains the same reviewed source scope.',
      'provenance':{'provider':r['provider'],'servingModel':r['servingModel'],'prompt':binding(root / r['promptPath']),'actualToolReceipt':binding(root / r['toolProvenancePath'])},
      'imageAndAltCorrespond':True,'formatDecision':'KEEP actual friendly comic PNG landscape about16:9; retained candidates are not redesigned solely for generator/format.',
      'humanApproval':False,'deviceAcceptanceClaim':False,'actual360680Scope':'Actual Chromium image-element sizing, not physical-device or full-app acceptance.'})
write(own / 'actual-twenty-V-first-independent-a.verdicts.json',{'schemaVersion':1,'artifactKind':'actual20-frozen-raster-native-page-independent-A-first-verdicts',
 'recordedAt':datetime.now(timezone.utc).isoformat(),'actualAgent':'/root/flora_fauna_independent_a','records':visual_records,
 'peerReviewReadBeforeThisFirstSeal':False,'candidateV20Pass':20,'keep':20,'reject':0,'hold':0,'findings':[],
 'actualReadCounts':{'fullSelectedRaster':20,'chromium360':20,'chromium680':20,'completePhysicalNativeGoalPages':20},
 'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write(own / 'actual-current-D-P-context-source-retention.independent-a.receipt.json',{
 'schemaVersion':1,'artifactKind':'actual-current-human20-final-bindings-retaining-genuine-science',
 'retainedGenuinePriorScientificSeals':[binding(prior / n) for n in ['first-twenty-whole-science.freeze.json','targeted-v2-science-resolution.independent-a.freeze.json','portable-science-commit-checkpoint.freeze.json']],
 'priorIndependentReviewAuthor':'/root/b008_placements_author_resume','currentChangedBindingReviewer':'/root/flora_fauna_independent_a',
 'priorScientificHistory':'First pass had17 P PASS and3 real holds. Genuine targeted v2 rechecks resolved those plus a disclosed peer-reported English-negation defect, yielding20 scoped E1/G1 PASS; do not rewrite first-pass history.',
 'currentWholeGoalBodiesUnchanged':20,'operativePWholeProfilesUnchangedFromActuallyReviewedV2':20,
 'sourceProvenanceSourceRefPrerequisitesApplicabilityAndCanonContextUnchanged':20,
 'candidateGoalOnlyChangedField':'resourceLinks','actualNativeWholeGoalPageTextAndIDVerified':20,
 'retainedAM':retained_am,'allCountrySourceClosureClaim':False,
 'candidateCurrentP20ScientificVerdict':'PASS_E1_G1_with_actual_new_raster_compatibility_checked',
 'nativeBookPPanel':'Native review-only model intentionally has null evidenceReview; P20 is separately supplied exact whole input, not falsely displayed on the PDF.',
 'PStatus':'needs_human_review','reviewAuthority':'ai_candidate','activeWrites':0,'strictGainClaimed':0,'humanApproval':False})

campaign=read(native / 'round-a/description-review-campaign.json')
actual=read(native / 'round-a/description-review-input.json')
batch=campaign['batches'][0]
run_id='biologie-human20-final-raster-native-independent-a-20261007-v1'
output=own / 'round-a/results';output.mkdir(parents=True,exist_ok=True)
records=[]
obs_by_id={r['goalId']:r for r in visual_records}
for g in actual['goals']:
    gid=g['goalId'];p=final_p[gid]['profile'];e=p['expectations'];first=e[0];last=e[-1]
    assert g['currentDescriptionDe']==current[gid]['description']
    evidence={}
    for lang,suffix in [('de','De'),('en','En')]:
        evidence['essentialUnderstanding'+suffix]=' '.join(x['essentialUnderstanding'+suffix] for x in e)
        evidence['observablePerformance'+suffix]=first['observablePerformance'+suffix]
        evidence['transferExpectation'+suffix]=last['observablePerformance'+suffix]
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
     'recordId':run_id+'.'+gid,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
     'bundleFingerprint':actual['bundleFingerprint'],'bookDigest':actual['bookDigest'],
     **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
     'decision':'keep','understandingEvidence':evidence,
     'rationale':'Gültige echte frühere unabhängige A-Prüfung der ganzen DE/EN-Ziele,40 Fälle und originalen begrenzten Curricula erhalten, einschließlich echter v2-Befundauflösung. Die sechs positiven Verständnis-/Leistungsfelder werden aus dem exakt unverändert wissenschaftlich geprüften P-Profil übernommen, nicht als neu erfundene Lernendenleistung oder Wiederholung historischer Science ausgegeben. Jetzt aktuelle ganze native Buchseite und neue Quellen-/Kontext-/Rasterbindung tatsächlich geprüft. '+obs_by_id[gid]['substantiveActualObservationsDe']+' Quellenumfang und Vorbedingungen unverändert; kein Länder-Gesamtnachweis, keine menschliche Freigabe.',
     'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
records_path=output / (batch['batchId']+'.records.jsonl')
with records_path.open('x') as stream:
    for row in records:stream.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n')
bundle=read(native / 'round-a/review-bundle-manifest.json')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
 'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':actual['bundleFingerprint'],'bookDigest':actual['bookDigest'],
 'provider':'OpenAI','model':'Codex independent A; exact serving revision not exposed','role':'subject_reviewer',
 'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent20 raster/page recheck retaining genuine prior A science; exact serving sampling params unavailable').hexdigest(),
 'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
 'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
 'startedAt':datetime.fromtimestamp((own / 'inspection-only-protein-original-pixel-crop.png').stat().st_mtime,timezone.utc).isoformat(),'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':sha(records_path),
 'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(output / (batch['batchId']+'.run.json'),run)
pconfig=read(author / 'P20.current-text-preimage.author.config.json')
pconfig['reviewId']=next(iter(final_p.values()))['reviewId']
pconfig['landscapePath']=entry['futureInertCanonical']['path']
pconfig['semanticKindLedgerPath']=str((author / 'candidate/semantic-kinds.current474-twenty-raster-inert.json').relative_to(root))
pconfig['reviewPath']=entry['wholeCurrentP20']['path']
pconfig['scope']['label']='Independent A exact final20 new-raster bindings; unchanged genuine scientific P20 retained'
write(own / 'P20.exact-final-inert.native.config.json',pconfig)
write(own / 'P20.exact-final-author-input.binding.json',{'path':entry['wholeCurrentP20']['path'],'sha256':entry['wholeCurrentP20']['sha256'],'independentScientificBasis':'actual-current-D-P-context-source-retention.independent-a.receipt.json','newProfileScientificAuthorship':False,'reviewAuthority':'ai_candidate','status':'needs_human_review'})
files=[f for f in own.rglob('*') if f.is_file()]
write(own / 'first-final-D-P-V20.independent-a.freeze.json',{'schemaVersion':1,'artifactKind':'independent-A-human20-first-final-actual-DPV-freeze',
 'recordedAt':datetime.now(timezone.utc).isoformat(),'exactAuthorInputSeal':binding(source / 'final-human20-raster-native-author-input.freeze.json'),
 'frozenFiles':[binding(f) for f in sorted(files)],'peerReviewReadBeforeSeal':False,
 'currentD20KEEP':20,'currentP20ScopedSciencePASS':20,'actualCandidateV20PASS':20,'openFindings':[],
 'noActiveIntegrationPerformed':True,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False,
 'nativeSchemaValidation':'pending separate actual targeted checker receipt; not claimed by this first seal'})
print('Sealed actual independent first D20KEEP/P20retained-science-PASS/V20KEEP with exact20 rasters/40 width captures/20 physical pages; no peer read,active write or human approval.')
