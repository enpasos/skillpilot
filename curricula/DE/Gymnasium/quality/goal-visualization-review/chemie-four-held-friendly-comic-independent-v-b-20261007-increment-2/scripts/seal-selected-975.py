# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import hashlib,json,datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent.parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-four-evidenced-friendly-comic-author-20261007-v1'
DP=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-fresh-blind-independent-a-20261007-v1'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
P3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'
GID='9751b6d8-cde3-527b-b37c-babb6cee79d2'
EXPECTED='c7b2901be218ef1c44479e3ed323f3d11ccc999568b5ac1ea874a6d1bdf762e7'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def logical(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def load(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p)}
def put(n,o):
 p=OUT/n;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
metaPath=AUTHOR/'inputs/whole-four-current-and-science-candidate-goals.json'
meta=next(g for g in load(metaPath)['goals'] if g['goalId']==GID)
canonPath=V2/'candidate/canonical.whole-current-plus-targeted-corrections.json'
goal=next(g for g in load(canonPath)['goals'] if g['id']==GID)
assert meta['wholeScienceCandidateGoal']==goal
assert meta['wholeActiveGoal']!=goal
casePath=P3/'candidate/complete34-bilingual-material-cases.author-v3.json'
cases=[c for c in load(casePath)['cases'] if c['goalId']==GID]
assert len(cases)==2
sciencePath=DP/'p17-current34-cases68-language-items.independent-a.first-pass.json'
science=next(s for s in load(sciencePath)['scientificFindings'] if s['goalId']==GID)
previous={(b['caseId'],b['language']):b['bodySha256'].removeprefix('sha256:') for b in science['caseLanguageBindings']}
caseBindings=[]
for c in cases:
 for lang in ['de','en']:
  body={'material':c['material'][lang],'taskDemand':c['taskDemand'][lang],'expectedPerformance':c['expectedPerformance'][lang],'boundary':c['specificBoundaryOrCounterexample'][lang]}
  h=logical(body);assert previous[(c['caseId'],lang)]==h
  caseBindings.append({'caseId':c['caseId'],'language':lang,'bodySha256':h,'matchesOwnSealedDPSciReview':True})
routePath=V2/'candidate/two-bounded-direct-source-routes.author.json'
route=next(r for r in load(routePath)['routes'] if r['goalId']==GID)
primaryPath=ROOT/route['primaryText']['path']
assert sha(primaryPath)==route['primaryText']['sha256']
literal=route['literalWitness'];assert literal in primaryPath.read_text()
put('inputs/whole975-current-v2-and-exact-reused-science.json',{'documentType':'Whole DE/EN corrected science candidate, current active difference, bounded exact BY route and unchanged image-independent P cases','wholeCurrentV2Goal':goal,'wholeCurrentV2GoalLogicalSha256':logical(goal),'wholeUnchangedActiveGoal':meta['wholeActiveGoal'],'activeDiffersFromCurrentScienceCandidate':True,'boundedDirectSourceRoute':route,'literalPrimaryTextMatchVerified':True,'wholeOriginalSourceApproval':False,'nationalSourceClosure':False,'completeTwoBilingualCases':cases,'caseBindings':caseBindings,'ownSealedDPSciFinding':science,'sourceBindings':[bind(p) for p in [metaPath,canonPath,casePath,sciencePath,routePath,primaryPath,DP/'first-pass.final.freeze.json',DP/'source-inspection/bounded-current-source-routes.independent-a.json']]})
browser=load(OUT/'receipts/own-isolated-browser.actual.json')
assert len(browser['records'])==2 and all(r['samePngBytesAsViewedAuthorScreenshot'] for r in browser['records'])
assert sha(OUT/'assets'/f'{GID}.png')==EXPECTED
put('receipts/actual-viewed-images.json',{'documentType':'Actually viewed selected975 attempt3 full PNG and actual widths','goalId':GID,'tool':'tools.view_image detail original','fullOriginal':bind(OUT/'assets'/f'{GID}.png'),'fullOriginalPersonallyViewed':True,'actualWidths':[{'width':w,'screenshot':bind(OUT/'browser'/f'{GID}.{w}.png'),'personallyViewed':True} for w in [360,680]],'isolatedDisplayOnly':True,'appAcceptance':False})
genPath=AUTHOR/'receipts/9751b6d8.attempt-3.actual-generation.json'
gen=load(genPath)
put('receipts/selected-generation-metadata.only.json',{'source':bind(genPath),'onlyProviderAndReferenceFieldsReadByReviewer':{k:gen.get(k) for k in ['goalId','provider','actualModelVersion','promptPath','referenced_image_paths','transparent_background','activeImport']},'historicalAuthorChangeBasisNotRead':True})
record={'goalId':GID,'reviewRole':'Independent visual reviewer B, not image author','reviewer':'/root/chem17_fresh_blind_a','selectedAttempt':'attempt-3 only','assetSha256':EXPECTED,'assetFormat':'PNG','naturalDimensions':{'width':1672,'height':941},'aspectRatio':1672/941,'wholeCurrentV2GoalLogicalSha256':logical(goal),'verdict':'KEEP','scientificVerdict':'KEEP','readability360Verdict':'KEEP','readability680Verdict':'KEEP','scientificFindings':[
 'Die obere Gleichung NH3 + H2O ⇌ NH4+ + OH− ist stofflich und elektrisch ausgeglichen. Das Gegenspfeilpaar kennzeichnet die Umkehrbarkeit eines ausgewählten Protonenübergangs.',
 'Links lautet die Zusatzreaktion NH3 + H3O+ → NH4+ + H2O. Protonenaufnahme durch NH3 und mehr NH4+ sind korrekt. Die roten NH4+-Teilchen sind dort tatsächlich in der Mehrheit.',
 'Rechts lautet die Zusatzreaktion NH4+ + OH− → NH3 + H2O. Protonenabgabe durch NH4+ und mehr NH3 sind korrekt. Die blauen NH3-Teilchen sind dort tatsächlich in der Mehrheit. OH−-Zugabe wird hier nicht als allgemeine Regel für jede Säure-Base-Reaktion behauptet.',
 'Links wie rechts sind acht N-haltige Teilchen mit je einem N dargestellt. Die Mengen sind schematische verschiedene Anteile; kein exaktes Gleichgewicht, keine Ladungsbilanz einer vollständigen realen Lösung, kein End-pH und keine gleichen Hin/Rückgeschwindigkeiten werden daraus abgeleitet. Nicht gezeichnete Zuschauerionen sind kein behaupteter Versuchsbestandteil.',
 'Das Bild passt zur korrigierten whole-v2-Formulierung Umkehrbarkeit von Protonenübergängen und unmittelbar zum vorgegebenen zweiten P-Modellfall. Das gekoppelte CO2-Modell des ersten P-Falls bleibt eigenständiges Transfermaterial. Ein Bildbefund ist keine Quellenfreigabe oder Leistungsbeobachtung.'
 ],'readabilityFindings':[
 'Bei tatsächlichen 360 Pixeln kann ich die obere Gesamtgleichung, H3O+ dazu, OH− dazu, mehr NH4+, mehr NH3 und beide unteren Zusatzgleichungen einschließlich Ladungen lesen. Diese erforderlichen Angaben sind ohne Vergrößerung vorhanden.',
 'Einzelne Teilchenbeschriftungen sind die kleinsten Texte im 360-Pixel-Bild. Die beiden farblich getrennten Mehrheiten bleiben erkennbar; dieselben Formeln stehen zusätzlich gut lesbar in den großen Überschriften, Mehr-Angaben und Reaktionsgleichungen. Die mechanistische Unterscheidung hängt nicht vom Erraten einer einzelnen kleinen Kugelbeschriftung ab.',
 'Bei 680 Pixeln sind auch die Teilchenbeschriftungen klar; Original und beide Breiten zeigen die ganze Zeichnung ohne Abschneiden. Eigene isolierte Screens sind bytegleich zu den tatsächlich gesichteten Autorenansichten.'
 ],'styleAndAgeFit':'Freundliche, klare Comic-Bechermodelle in zwei farblich getrennten Reaktionsrichtungen; Sek-I-orientiert. Kein belegter Fehler erfordert eine weitere Stiländerung.','suggestedAltText':'Umkehrbarer Protonenübergang NH3 und Wasser zu NH4+ und OH−. Säurezugabe protoniert NH3 und erhöht den NH4+-Anteil; OH− nimmt NH4+ ein Proton ab und erhöht den NH3-Anteil. Beide zugehörigen Reaktionsgleichungen sind gezeigt.','copyrightObservation':'Keine sichtbare Marke, identifizierbare Person oder erkennbare geschützte Figur; keine rechtliche oder Redistributionsfreigabe.','generationMetadata':bind(OUT/'receipts/selected-generation-metadata.only.json'),'promptBinding':bind(AUTHOR/'prompts/9751b6d8.attempt-3.actual-imagegen.prompt.txt'),'orientationOnly':True,'learnerPerformanceEvidence':False,'machineCandidateReviewOnly':True,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0}
put('selected975.independent-v-b.first-pass.json',{'documentType':'Independent V-B actual selected975 attempt3 first pass, increment2','selectedCount':1,'KEEP':1,'REVISE':0,'BLOCK':0,'records':[record],'currentSelectedPeerReportsReadBeforeSeal':False,'peerVOverviewRead':False,'priorFailedAuthorAttemptsCountAsSelected':False,'pendingC441':True,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0})
put('first-pass-independence-and-limitations.actual.json',{'currentSelected975PeerVResultsReadBeforeSeal':False,'peerOverviewRead':False,'priorIncrement1HasSeparateHistoricalExposureDisclosure':True,'current975GenerationReceiptFieldRestriction':'Only provider/model/reference metadata was emitted; author-change-basis and historical opinions were not read.','scienceReuse':'Four unchanged DE/EN language bodies exactly match this reviewer own sealed D/P17 science. Whole current corrected DE/EN goal read anew.','sourceScope':'Literal C10-NTG.2.8 verified in frozen physical original text and own previous source review; no new whole-source or nationwide closure.','displayScope':'Own actual isolated Chromium views at 360/680, natural1672×941, max-height448px/object-fit contain. Byte-equal author screens. No real app/desktop/voice acceptance.','activeWrites':False,'humanApproval':False,'humanTrial':False,'strictNetGain':0})
with (OUT/'README.md').open('x') as f:f.write('# Independent V-B selected975 attempt3 — sealed increment 2\n\nOwn didactic review: CC-BY-4.0; scripts: Apache-2.0.\n\nSelected SHA `'+EXPECTED+'` receives **KEEP** for chemistry and actual 360/680 readability. The full current corrected DE/EN goal, bounded BY route and exact unchanged P science are bound in inputs. Full PNG and actual browser views were personally inspected. Current selected peer V reports were not read.\n\nThis increment is independent of the already sealed two-image increment. Prior author attempts are not selected reviews. c441 is pending. No active import, canonical/QA mutation, global run, M7 credit, human approval, human trial or host acceptance.\n')
files=[{'path':str(p.relative_to(OUT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file()]
put('first-pass.final.freeze.json',{'documentType':'Independent V-B immutable selected975 attempt3 first-pass seal','sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selectedCount':1,'verdicts':{'KEEP':1,'REVISE':0,'BLOCK':0},'currentSelectedPeerReportsReadBeforeSeal':False,'files':files,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0})
print(json.dumps({'folder':str(OUT.relative_to(ROOT)),'sealSha256':sha(OUT/'first-pass.final.freeze.json'),'fileCount':len(files),'verdict':'KEEP'}))
