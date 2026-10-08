#!/usr/bin/env python3
"""Apache-2.0 serializer; own didactic review content CC-BY-4.0.
No generation, canonical writes, QA-ledger mutation or human approval.
"""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json
from PIL import Image

P=Path(__file__).resolve().parent
A=P.parent/'wirtschaft-q1-nine-image-author-20261008-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def new(p,o):
 if p.exists():raise RuntimeError('Preserve history '+str(p))
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')

# Actual observations at native size and separately at 360 and 680 px.
# Motif, fachliche interpretation, actor perspective and truthful alt text.
NOTES={
'8c4d53d1-2617-5e5d-9234-f12d19e38322':[
'Kommission links, Parlament oben mittig, Rat unten mittig; zwei Vorschlagspfeile verzweigen und zwei Zustimmungspfade laufen zu einem Dokument zusammen. Drei Institutionen und beide Pfeilrelationen bleiben bei 360 px klar erkennbar; die drei erforderlichen Labels bleiben lesbar. Keine lesepflichtige Kleinschrift.',
'Schematischer Einstieg in das ordentliche Gesetzgebungsverfahren: Kommission initiiert, Parlament und Rat sind Mitgesetzgeber. Rat ist durch national unterschiedlich markierte Mitglieder als Ministerrat plausibel und nicht als Europäischer Rat mit Regierungschefs bezeichnet. Die vereinfachte Einigungsrelation enthält keine falsche Alleinentscheidung der Kommission und muss nicht alle Lesungen darstellen.',
'Kommissionsperson hält das Dokument zum Präsentieren nach außen und liest nicht eine verkehrt zugewandte Textseite. Dokumentlinien sind grafische Platzhalter ohne lesepflichtigen Text; Ratspapiere sind leer. Kein orientierungsabhängiger Mess- oder Heftinhalt.',
'Eine Kommissionsvertreterin präsentiert einen Vorschlag. Pfeile führen zu Parlament und Rat und von beiden zu einem gemeinsamen Dokument; im Rat sitzen Vertreter mit unterschiedlich farbigen Länderabzeichen.'
],
'79edbe3a-7557-5b3b-a0f2-c31f45b6dad7':[
'Drei große Kreise Kommune, Staat und EU sind über einem gemeinsamen Fluss angeordnet. Lokale Müllaufnahme, nationale Kartenbesprechung und EU-Besprechung sind bei 360 px jeweils unterscheidbar; Fluss, gestrichelte Grenze und gemeinsame räumliche Reichweite bleiben sichtbar.',
'Mehrebenenbearbeitung eines grenzüberschreitenden Umweltproblems, ohne eine automatische Zuständigkeit des höchsten Kreises zu behaupten. Die Kreise sind nebeneinander statt als Befehlsrangfolge geordnet. Subsidiarität bleibt eine zu begründende Frage geeigneter Reichweite in nicht ausschließlicher Zuständigkeit; das Bild behauptet keine konkrete Rechtszuweisung.',
'Beide Laptops zeigen ihre Rückseiten zum Publikum und können von den handelnden Personen betrachtet werden. Die Flusskarte enthält keine Richtungsschrift. Personen reinigen den sichtbaren Uferbereich plausibel.',
'Kommune, Staat und EU erscheinen in drei großen Kreisen an einem gemeinsamen Fluss. Links sammeln Menschen Abfall, in den anderen Kreisen besprechen Gruppen den Fluss und seine grenzüberschreitende Lage.'
],
'ab556d14-b0c0-5630-8ee3-f07877fa28bd':[
'Wahlurne, Unterschriftentafel und Gesprächskreis sind drei große unterscheidbare Motive. Ihre Pfeile zum EU-Gebäude bleiben auch bei 360 px sichtbar; Unterschriftslinien enthalten keine zu lesenden Namen.',
'Die drei Motive stehen für Beteiligung und institutionellen Zugang. Kein Pfeil führt zu einem Gesetzestext, keine Petition wird als automatisch verbindlicher Rechtsakt dargestellt und keine Beteiligungsroute ersetzt die notwendige Bewertung ihrer Reichweite.',
'Die unterschreibende Person steht vor derselben Tafelseite, die auch das Publikum sieht, mit Rücken/Seite zum Publikum; ihre Hand erreicht diese Seite korrekt. Wahlzettel ist leer. Gesprächsteilnehmende schauen zueinander.',
'Drei Beteiligungswege führen bildlich zu einem EU-Gebäude: ein Wahlzettel wird in eine Urne gesteckt, eine Person unterschreibt eine öffentliche Tafel und eine vielfältige Gruppe diskutiert miteinander.'
],
'96c2c114-8474-5e4c-bfcf-c9e526c8c9ad':[
'Drei große Motive zeigen Landwirtschaft, Fluss/Umwelt und Containerhandel. Ein verbindender Weg mit kommunaler Gruppe, staatlichem Gebäude und EU-Gebäude bleibt bei 360 px erkennbar; Nebendetails im Hintergrund sind fachlich nicht lesepflichtig.',
'Die drei Politikfelder sind mit öffentlicher Koordination auf mehreren Ebenen verbunden. Handelsbarriere ist geöffnet, keine konkrete Binnenzollpflicht oder ausschließliche Zuständigkeit aller Ebenen wird beschriftet. Es ist ein didaktischer Überblick, keine Karte geltender Kompetenzen.',
'Die Person im Vordergrund hält einen weitgehend textfreien Notizblock; kein falsch ausgerichteter Diagramminhalt. Blick und Zeigegeste richten sich auf die gemeinsamen Politikmotive.',
'Menschen betrachten die Motive Landwirtschaft, Flussumwelt und Containerhandel. Ein gemeinsamer Weg verbindet eine örtliche Gruppe, ein staatliches Gebäude und ein EU-Gebäude.'
],
'1c0d950c-c618-583f-bfa7-be1d4e3578b6':[
'Gespräch an großem rundem Tisch; Fabrik-, Blatt- und Arbeitshandschuhblasen bleiben bei 360 px als drei unterschiedliche Interessen erkennbar. Dokumente sind leer, die EU-Kennzeichnung ist groß; kleine Gläser und Ordner sind Dekoration.',
'Wirtschaft, Umwelt/Bürgerschaft und Beschäftigte tragen Anliegen in einer EU-bezogenen Besprechung vor. Offen dargestellter Zugang illustriert Interessenvertretung, garantiert aber weder gleichen realen Einfluss noch transparente Praxis jedes Lobbying. Keine Bestechung oder pauschale Korruptionsmarkierung.',
'Leere Karten werden als Vorschläge präsentiert und haben keinen falsch lesbaren Text. Laptoprückseite zeigt zum Publikum, sein Bildschirm richtet sich zu den zuständigen Personen am rechten Tischrand. Kein rückwärts benutztes Instrument.',
'Vertreter mit Fabrik-, Blatt- und Arbeitshandschuhsymbolen besprechen ihre Anliegen mit zwei Personen an einem runden Tisch. Leere Vorschlagskarten, ein offenes Fenster und ein EU-Gebäude prägen die Szene.'
],
'a307a7f1-9f14-50e5-b7ba-1e70c8465ee7':[
'Zwei Haushaltsszenen, Münzpfeile zum öffentlichen Gebäude und nachdenkliche Werkstattperson mit Beschäftigungs-/Investitionssymbolen sind bei 360 px erkennbar. Steuern steht groß am Gebäude; die Gesundheits-, Bildungs- und Grünflächensymbole sind ohne Text identifizierbar.',
'Haushaltsressourcen und Finanzierung öffentlicher Aufgaben werden mit einer offenen Unternehmerentscheidung verbunden. Die Sparschweine dienen als Ressourcensymbole, kein bestimmter Steuertatbestand ist behauptet. Die Gedankenblase zeigt eine mögliche Anreizfrage und keinen garantierten Zusammenhang zwischen Steueränderung und Beschäftigung oder Automatisierung. Beträge und tatsächliche Steuerquoten fehlen bewusst.',
'Laptop ist zur Werkstattperson ausgerichtet; Publikum sieht seine Rückseite. Kleine Unterlage enthält keine gerichtete Fachschrift. Gedankenblasen sind Begriffsillustrationen und werden nicht als ausgeführte Investition missverstanden.',
'Zwei Haushalte sind durch Münzpfeile mit einem Gebäude für öffentliche Aufgaben verbunden. Rechts wägt eine Person in einer Werkstatt Beschäftigung und eine technische Investition ab.'
],
'a17899b9-f872-5236-a329-ec1a33d427a3':[
'Vier nachdenkliche Gruppen mit Haushalt, höherem Ressourcenbestand, Unternehmen und öffentlichen Leistungen sind bei 360 px erkennbar. Münzen, Haus, Fabrik und Schule bleiben differenzierbar; keine Namen oder Kleinslogans erforderlich. Die Zentralwaage trägt Ressourcen gegenüber öffentlicher Versorgung.',
'Die Szene gibt unterschiedliche Interessen und Zielkonflikte zur Analyse frei. Sie behauptet keine real geltende Steuerreform und keinen richtigen Kompromiss. Höhere Ressourcen sind durch größere Münz-/Haussymbole sichtbar; die Gruppen werden nicht als korrupte oder moralisch minderwertige Akteure markiert.',
'Die Person rechts schreibt auf eine textfreie Unterlage vor sich; keine widersprüchliche Leserichtung. Das gemeinsame zentrale Reformblatt ist ein Schema auf einem Rundtisch, keine nachweisbar verkehrt gelesene persönliche Notiz. Laptop zeigt Rückseite zum Publikum.',
'Vier Personen diskutieren eine Steuerreform am runden Tisch. Gedankenblasen zeigen verschiedene Haushaltsressourcen, Unternehmensinteressen und öffentliche Leistungen; eine Waage stellt Finanzierung und Versorgung gegenüber.'
],
'51bcbc9e-7a1c-5caa-9766-9ab97fa72f04':[
'Zwei klar getrennte Hälften Direkt und Indirekt. Links Einkommensumschlag und Münzpfeil zur Staatskasse; rechts Einkauf beim Händler und Münzpfeil vom Geschäft zur Staatskasse. Beide Wege sowie Labels bleiben bei 360 px deutlich.',
'Schematischer Vergleich von direkter Steuer auf Einkommen und indirektem Steuerweg beim Kauf. Keine Prozentzahlen oder pauschale Behauptung endgültiger ökonomischer Steuerlast. Der Einkommensumschlag illustriert die Bezugsgröße; tatsächliche Lohnsteuer kann durch Arbeitgeber abgeführt werden, daher ist dies keine technische Anleitung zum konkreten Abführungsweg.',
'Verkäufer nutzt Bildschirm zur eigenen Seite; Publikum sieht die Rückseite. Umschlag und Geldscheine haben keinen zu lesenden Text. Käuferin reicht Zahlung plausibel über den Tresen.',
'Unter Direkt führt ein Münzpfeil von einer Person mit Einkommensumschlag zur Staatskasse. Unter Indirekt bezahlt eine Kundin im Geschäft, von dem ein weiterer Münzpfeil zur Staatskasse führt.'
],
'72bde56f-a752-5bc7-8472-24272c6075a0':[
'Drei große Karten Gleichheit, Leistungsfähigkeit und Nutzen sowie eine Waage sind bei 360 px lesbar. Die Darstellungsqualität und freundliche Comicgestaltung sind brauchbar; der Befund ist fachlich und bleibt auch in 680-px- und Originalansicht bestehen.',
'REJECT: Gleichheit zeigt zwei unterschiedliche Personen mit gleichen Münzstapeln, ohne sichtbar vergleichbare wirtschaftliche Situationen als Voraussetzung zu binden. Dadurch kann gleiche absolute Steuerzahlung für beliebige Personen als Gleichheitsprinzip gelesen werden. Leistungsfähigkeit zeigt nur einen kleineren und größeren Stapel und trennt die wirtschaftliche Bezugsgröße nicht von einem davon abhängigen Steuerbeitrag. Das ist eine fachlich wichtige Relation, keine bloße fehlende Vollabdeckung: Gleichbehandlung vergleichbarer Fälle muss erkennbar und Einkommen/Ressource von Beitrag unterscheidbar sein.',
'Die leere Waage dient als Abwägungssymbol, kein berechneter Kräftevergleich. Die Person rechts hält einen geschlossenen Block; kein falsch ausgerichteter aktiver Leseinhalt. Keine actor-reading-Korrektur erforderlich.',
'Zwei Personen betrachten eine Waage und drei Karten. Gleichheit zeigt zwei gleiche Münzstapel, Leistungsfähigkeit zwei unterschiedlich große Stapel, Nutzen öffentliche Gebäude und einen Münzstapel.'
]
}

jobs=json.loads((A/'jobs.author.json').read_text())
canpath=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
canon=json.loads(canpath.read_text());goals={g['id']:g for g in canon['goals']}
prep=Path(jobs[0]['nativePreparationReceipt']);pr=json.loads(prep.read_text())
for row in pr['actualCommands']:
 for item in row['actualMetadataAndPromptCopies']:
  assert 'sha256:'+sha(Path(item['path']))==item['sha256']
assert len(jobs)==len(NOTES)==9
completed=datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
new(P/'actual-current-nine-goals.snapshot.json',{'sourcePath':str(canpath),'sourceSha256':sha(canpath),'goals':[goals[j['goalId']] for j in jobs]})
receipts=[]
for j in jobs:
 gid=j['goalId'];asset=Path(j['candidatePath']);genpath=asset.parent/'generation.actual.json';gen=json.loads(genpath.read_text());prompt=asset.parent/'prompt.actual.txt'
 assert sha(asset)==gen['sha256']
 assert prompt.read_text().strip()==j['prompt']
 assert sha(Path(gen['sourceGeneratedPath']))==sha(asset)
 meta=prep.parent/gid/'metadata.json';md=json.loads(meta.read_text())
 assert md['skillpilotId']==gid and md['title']==goals[gid]['title'] and md['description']==goals[gid]['description']
 im=Image.open(asset);assert im.format=='PNG'
 reject=gid=='72bde56f-a752-5bc7-8472-24272c6075a0'
 inspections=[{'kind':'native-original','path':str(asset),'width':im.width,'height':im.height,'sha256':sha(asset),'actualViewImage':True}]
 for w in [360,680]:
  d=P/'inspection'/(gid+'.'+str(w)+'.png');di=Image.open(d);assert di.width==w
  inspections.append({'kind':'uncropped-inspection-derivative','path':str(d),'width':di.width,'height':di.height,'sha256':sha(d),'actualViewImage':True,'transformation':'Pillow LANCZOS proportional resize for actual visual review; no asset edit or new didactic generation'})
 note=NOTES[gid]
 r={'schemaVersion':1,'reviewId':'wirtschaft-q1-nine-independent-image-review-20261008-v1.'+gid,'reviewedAt':completed,'reviewer':{'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','agentIdentity':'/root/economics_layer_a','independentOfImageAuthor':True,'imageAuthor':'/root','authority':'ai_candidate'},'goalId':gid,'currentTitleDe':goals[gid]['title'],'currentDescriptionDe':goals[gid]['description'],'sourceGoalSnapshot':str(P/'actual-current-nine-goals.snapshot.json'),'candidatePath':str(asset),'assetSha256':sha(asset),'generationReceiptPath':str(genpath),'generationReceiptSha256':sha(genpath),'promptPath':str(prompt),'promptSha256':sha(prompt),'actualGenerator':gen['provider'],'generatorModelVersion':gen['modelVersion'],'beforeGenerationNativePreparationReceipt':str(prep),'beforeGenerationNativePreparationReceiptSha256':sha(prep),'inspections':inspections,'formatDecision':{'format':'PNG','nativeDimensions':[im.width,im.height],'ratio':im.width/im.height,'defaultNear16By9':True,'didacticAdvantage':'Uncropped landscape supports the large motifs side by side at phone width; no format exception needed.'},'actualMotifAndLegibility':note[0],'actualSubjectReview':note[1],'actualActorPerspectiveReview':note[2],'altTextCandidateFromActualMotif':note[3],'decision':'REJECT' if reject else 'KEEP','machineQaStatus':'rejected_regenerate' if reject else 'accepted_pilot','aiApproved':'no' if reject else 'yes','aiApprovedAssetSha256':None if reject else sha(asset),'openFindings':[{'findingId':'Q1-V-72-horizontal-comparability-and-base-contribution','status':'open','severity':'blocking-for-this-asset','finding':note[1]}] if reject else [],'humanApprovalClaimed':False,'learnerPerformanceClaimed':False,'liveWrites':0,'newStrictGoalClosures':0}
 path=P/gid/'independent-image-review.receipt.json';new(path,r)
 receipts.append({'goalId':gid,'receiptPath':str(path),'receiptSha256':sha(path),'candidatePath':str(asset),'assetSha256':sha(asset),'decision':r['decision']})
sources=[
 {'url':'https://www.consilium.europa.eu/en/council-eu/decision-making/ordinary-legislative-procedure/','actualReading':'Whole current official page, especially proposal to both co-legislators and adoption of identical text by both. Independent image relation check; not a new whole legal-curriculum review.'},
 {'url':'https://european-union.europa.eu/institutions-law-budget/law/types-legislation_en','actualReading':'Whole official educational page: regulations/directives/decisions and nonbinding recommendations/opinions. No arbitrary participation route to automatically binding law.'},
 {'url':'https://eur-lex.europa.eu/eli/treaty/teu_2008/art_5/oj/eng','actualReading':'Article5 full actual text returned by web search, including conferral, subsidiarity in nonexclusive competence and proportionality. Subsequent web open encountered an anti-bot page, not falsely claimed as a successful new reading.'},
 {'url':'https://www.bundestag.de/resource/blob/579570/65c3ef67d78edfb875a30c9750371084/WD-4-129-18-pdf-data.pdf','actualReading':'Primary institutional authored WD4-3000-129/18 report dated13September2018, actual relevant printedpage5 and footnote3 read in full current PDF text. Its content states same contribution for everyone is not the equality rule and distinguishes horizontal equal ability/vertical different ability. Not a claim of a new court judgment or current detailed tax advice.'},
 {'path':'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf','actualReading':'Actual targeted printedpage41 covering Q1.4 andQ1.5 plus overviewpage31. Retained original curriculum, no historical review restart.'}
]
new(P/'actual-final-eight-KEEP-one-REJECT.receipt.json',{'schemaVersion':1,'reviewId':'wirtschaft-q1-nine-independent-image-review-20261008-v1','startedAt':'2026-10-08T07:27:53Z','completedAt':completed,'reviewerAgent':'/root/economics_layer_a','imageAuthorAgent':'/root','actualWholeCurrentGoalAndActualPromptsRead':9,'actualNativeImagesViewed':9,'actual360PxImagesViewed':9,'actual680PxImagesViewed':9,'generationMetadataHashesMatched':9,'sourceGeneratedBytesMatched':9,'nativePreparationArtifactHashesMatched':18,'sourceGoalMetadataTitleDescriptionMatched':9,'KEEP':8,'REJECT':1,'receipts':receipts,'actualPrimarySourcesRead':sources,'noCompleteFinalSelectionEmitted':'One genuinely unresolved asset finding; eight good candidates retained, no full9selection or integration approval.','newFachlicheImageCandidateApprovals':8,'restoredSourceBindingsClaimed':0,'newStrictGoalClosures':0,'liveChanges':0,'humanReleaseGate':'Separate, not claimed passed.'})
new(P/'minimal-one-image-correction.request.json',{'schemaVersion':1,'findingId':'Q1-V-72-horizontal-comparability-and-base-contribution','goalId':'72bde56f-a752-5bc7-8472-24272c6075a0','sourceAssetSha256':sha(Path(jobs[-1]['candidatePath'])),'preserveOtherEightCandidates':True,'reason':NOTES[jobs[-1]['goalId']][1],'primarySource':sources[3],'minimalCorrection':'Retain friendly comic style, landscape and large motives. Make horizontal comparability explicit: same represented economic situation -> same contribution, rather than two arbitrary people -> equal tax. Distinguish resource/income from contribution for ability to pay using separate visually identifiable base and payment objects with arrows, so more available means lead to greater contribution. No implied real tax rates or guaranteed uniquely fair rule. Can simplify to two large relational examples if three cards become crowded; entire goal does not require every principle in the image. Keep benefit motif only if clear at360px.','mustReinspectActualCorrectedAsset':['native-original','360px','680px','economic-base-to-contribution-relation','actor-perspective'],'generationOrCorrectionIsApproval':False,'originalReceiptAndRejectedAssetMustRemainUnchanged':True})
print(json.dumps({'completedAt':completed,'KEEP':8,'REJECT':1,'native360680ActuallyViewed':27,'summary':str(P/'actual-final-eight-KEEP-one-REJECT.receipt.json')},indent=2))
