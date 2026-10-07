# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import hashlib, json, datetime

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent.parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-four-evidenced-friendly-comic-author-20261007-v1'
DP=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-fresh-blind-independent-a-20261007-v1'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
P3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'
IDS=['0bf26276-2780-506c-ac34-35dd44a29409','a44af1fa-5988-5b7d-b206-691c6bbf7dd4']

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def logical(o): return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def load(p): return json.loads(p.read_text())
def put(name,o):
    p=OUT/name; p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def binding(p): return {'path':str(p.relative_to(ROOT)),'sha256':sha(p)}

metaPath=AUTHOR/'inputs/whole-four-current-and-science-candidate-goals.json'
meta=load(metaPath)
canonPath=V2/'candidate/canonical.whole-current-plus-targeted-corrections.json'
canonical={g['id']:g for g in load(canonPath)['goals']}
casesPath=P3/'candidate/complete34-bilingual-material-cases.author-v3.json'
allCases=load(casesPath)['cases']
ownSciencePath=DP/'p17-current34-cases68-language-items.independent-a.first-pass.json'
ownScience={g['goalId']:g for g in load(ownSciencePath)['scientificFindings']}
witnessPath=V2/'candidate/bounded-primary-witnesses17.author.json'
witnesses=load(witnessPath)['rows']
contexts=[]
for gid in IDS:
    m=next(g for g in meta['goals'] if g['goalId']==gid)
    assert m['wholeScienceCandidateGoal']==canonical[gid]
    assert m['wholeActiveGoal']==canonical[gid]
    cs=[c for c in allCases if c['goalId']==gid]
    assert len(cs)==2
    prior={ (b['caseId'],b['language']):b['bodySha256'].removeprefix('sha256:') for b in ownScience[gid]['caseLanguageBindings'] }
    current=[]
    for c in cs:
        for lang in ['de','en']:
            body={'material':c['material'][lang],'taskDemand':c['taskDemand'][lang],'expectedPerformance':c['expectedPerformance'][lang],'boundary':c['specificBoundaryOrCounterexample'][lang]}
            h=logical(body)
            assert prior[(c['caseId'],lang)]==h
            current.append({'caseId':c['caseId'],'language':lang,'bodySha256':h,'exactlyMatchesOwnSealedDPSciReview':True})
    contexts.append({'goalId':gid,'wholeCurrentV2Goal':canonical[gid],'wholeCurrentV2GoalLogicalSha256':logical(canonical[gid]),'wholeActiveGoalEqualsCurrentV2':True,'boundedPrimaryWitnesses':next(w for w in witnesses if w['goalId']==gid),'completeTwoBilingualCases':cs,'ownSealedScientificFinding':ownScience[gid],'currentCaseBindings':current})
put('inputs/whole-two-current-context-and-exact-reused-science.json',{'documentType':'Current whole DE/EN goals, bounded source witnesses and unchanged image-independent P cases; exact own sealed science reused','goals':contexts,'sourceBindings':[binding(metaPath),binding(canonPath),binding(casesPath),binding(witnessPath),binding(ownSciencePath),binding(DP/'first-pass.final.freeze.json')],'wholeSourceClosure':False,'nationalSourceApproval':False})

browser=load(OUT/'receipts/own-isolated-browser.actual.json')
assert len(browser['records'])==4 and all(r['samePngBytesAsViewedAuthorScreenshot'] for r in browser['records'])
put('receipts/actual-viewed-images.json',{'documentType':'Actual independently viewed selected originals and browser widths','reviewer':'/root/chem17_fresh_blind_a','fullOriginalCount':2,'actual360Count':2,'actual680Count':2,'tool':'tools.view_image detail original','records':[{'goalId':gid,'fullOriginal':binding(OUT/'assets'/f'{gid}.png'),'actualWidths':[{'width':w,'screenshot':binding(OUT/'browser'/f'{gid}.{w}.png'),'personallyViewed':True} for w in [360,680]],'fullOriginalPersonallyViewed':True} for gid in IDS],'appAcceptance':False})

records=[
 {'goalId':IDS[0],'assetSha256':'e4890ddda700dbd6c7d36304c719555cbe05c6d2d4273902ea032a0594a06ae9','selectedAttempt':'selected current 0bf candidate','verdict':'KEEP','scientificVerdict':'KEEP','readability360Verdict':'KEEP','readability680Verdict':'KEEP','scientificFindings':[
  'Die pH-Skala enthält 0 bis 14 vollständig, in richtiger Reihenfolge; neutral ist bei 7 markiert. Die drei Pfeilspitzen treffen genau pH 2, 7 und 10.',
  'Zitronensaft pH 2, Wasser pH 7 und Seifenlösung pH 10 sind plausible schematische Alltagsbeispiele. Die Zeichnung behauptet keine genaue Analyse einer konkreten Produktprobe oder temperaturunabhängige Universalwerte.',
  'Zahnschmelz, Lebensraum und Hautschutz bilden die Folgenbereiche des aktuellen Ziels ab. Die Warnsymbole sind Themenhinweise; es wird kein stofflicher Mechanismus oder universeller Schädigungsgrenzwert gezeigt. Insbesondere wird pH 7 nicht ausdrücklich als Schädigung des Lebensraums bezeichnet.',
  'Das Bild kann die pH-Orientierung unterstützen. Folgen einzelner Änderungen, Pufferkapazität, Stoffidentität, Neutralisationsbedarf und die im P-Material gegebenen Modellgrenzen müssen im Unterricht beziehungsweise im Material bearbeitet werden.'
 ],'readabilityFindings':[
  'Im tatsächlich gerenderten 360-Pixel-Bild sind alle drei Stoffnamen und pH-Werte, Skalenwerte und unteren Bereichsnamen lesbar. Die Pfeile und ihre Ziele sind unterscheidbar; nichts ist abgeschnitten.',
  'Bei 680 Pixeln sind dieselben Angaben klar lesbar. Sämtliche Bildbereiche bleiben sichtbar; kein anderer Ausschnitt wurde geprüft.'
 ],'styleAndAgeFit':'Freundliche, einfache Comicdarstellung mit klarer Skala und vertrauten Gegenständen; für das Sek-I-Ziel geeignet. Kein nachgewiesener Fehler fordert eine Stiländerung.','suggestedAltText':'pH-Skala von 0 bis 14 mit Zitronensaft bei 2, Wasser bei 7 und Seifenlösung bei 10; darunter Zahnschmelz, Lebensraum und Hautschutz als Bereiche für pH-Folgen.'},
 {'goalId':IDS[1],'assetSha256':'f9d8e3cbf1401f05fa587d1c9adab2c010034ab1d27832464fbb5392f31101ad','selectedAttempt':'selected a44 attempt-2 only','verdict':'KEEP','scientificVerdict':'KEEP','readability360Verdict':'KEEP','readability680Verdict':'KEEP','scientificFindings':[
  'Na+, K+ und Cu2+ stehen über tatsächlichen Brennerflammen; die gelbe, violette und blaugrüne Flammenfarbe ist als ausgewählter Nachweis fachlich passend. Die Farben sind keine Darstellung farbiger Salzlösungen.',
  'Der Chlorid-Nachweis zeigt HNO3 vor AgNO3 und einen weißen AgCl-Niederschlag im Reagenzglas. Ionladung, Summenformeln, Reagenzienreihenfolge und Niederschlagsfarbe sind korrekt. Die Bildfolge ergänzt die schematische Nachweisidee, ohne einen vollständigen Laborablauf zu behaupten.',
  'Der Na+/Cl−-Vergleich 1:1 ist ausdrücklich einem Reinsalz zugeordnet und führt zur ladungsneutralen Formel NaCl. Der groß sichtbare Satz Gemisch: Ionen ≠ Salzpaare verhindert die unzulässige Rückzuordnung nachgewiesener Ionen zu ursprünglichen Salzpaaren.',
  'Das breite ganze Ziel umfasst auch Gemische, saure/basische Lösungen und Produktinformationen. Diese Orientierung zeigt ausgewählte Nachweise und deren Kompositionsgrenze; sie ersetzt die Kontrollen, gegebenen pH-Befunde und offenen Alternativen in den unveränderten P-Fällen nicht.'
 ],'readabilityFindings':[
  'Bei tatsächlichen 360 Pixeln kann ich Na+, K+, Cu2+, HNO3 dann AgNO3, Cl−, AgCl (weiß), Reinsalz, Na+:Cl− = 1:1 und NaCl lesen. Die Mischungseinschränkung ist deutlich sichtbar. Kein erforderliches Label muss aus einer vergrößerten Ansicht erraten werden.',
  'Bei 680 Pixeln sind Ladungen, Indexzahlen, Nachweisreihenfolge und die Grenzen sehr klar. Die vollständige Zeichnung ist sichtbar; keine Verkürzung oder CSS-Ausnahme.'
 ],'styleAndAgeFit':'Freundliche Comicdarstellung mit drei klaren Teilbereichen. Die Großbeschriftung unterstützt das Sek-I-Ziel; kein belegter Fehler verlangt weitere Änderungen.','suggestedAltText':'Ionennachweise durch gelbe Natrium-, violette Kalium- und blaugrüne Kupferflammen; Chlorid ergibt nach Salpetersäure und Silbernitrat weißes AgCl. Für reines NaCl gilt Na+:Cl− eins zu eins; Ionen eines Gemischs beweisen keine Salzpaare.'}
]
for r in records:
    r.update({'reviewer':'/root/chem17_fresh_blind_a','reviewRole':'independent visual reviewer B; not image author','assetFormat':'PNG','naturalDimensions':{'width':1672,'height':941},'aspectRatio':1672/941,'wholeGoalLogicalSha256':next(c['wholeCurrentV2GoalLogicalSha256'] for c in contexts if c['goalId']==r['goalId']),'provider':'OpenAI / ChatGPT-Codex built-in image_gen (actual author receipt)','actualModelVersion':None,'promptBinding':binding(AUTHOR/'prompts'/('0bf26276.actual-imagegen.prompt.txt' if r['goalId']==IDS[0] else 'a44af1fa.attempt-2.actual-imagegen.prompt.txt')),'generationReceiptBinding':binding(AUTHOR/'receipts'/('0bf26276.actual-generation.json' if r['goalId']==IDS[0] else 'a44af1fa.attempt-2.actual-generation.json')),'copyrightObservation':'No visible third-party logo, personal data or identifiable protected character; this observation is no legal or redistribution clearance.','orientationOnly':True,'learnerPerformanceEvidence':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0,'machineCandidateReviewOnly':True})
put('selected-two.independent-v-b.first-pass.json',{'documentType':'Actual independent V-B selected-two first pass, sealed increment 1','reviewer':'/root/chem17_fresh_blind_a','reviewedSelectedCount':2,'keep':2,'revise':0,'block':0,'records':records,'unreviewedOtherSelectedCandidates':'975 attempt-3 communicated during current work; will receive a separate subsequent sealed increment. c441 not yet supplied at this increment.','historicalAuthorFailedAttemptsCountAsSelected':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0})
put('first-pass-independence-and-limitations.actual.json',{'currentSelectedPeerVResultsReadBeforeSeal':False,'peerVOverviewRead':False,'actualExposureDisclosure':'After personally viewing both current full originals and all four actual author-width images and forming own substantive observations, I read the two actual author generation receipts to identify provider/model and references. The a44 attempt-2 author receipt includes one provenance sentence summarizing Root V-A on the preceding attempt-1 (science KEEP, center label at 360 REVISE). No Root V-A selected attempt-2 result or peer review file was read. That incidental old-attempt provenance is disclosed rather than claiming absolute blindness to all historical text.','ownDPSciReuse':'Exact unchanged two-goal current DE/EN P science from my previously sealed independent D/P review; all eight case-language bodies match its recorded hashes. Drawing independently inspected and provides no learner evidence.','sourceLimitations':'Only the bounded source witnesses and current exact contexts previously reviewed; no whole nationwide source closure.','displayLimitations':'Actual isolated Chromium image boxes at 360 and 680 with max-height 448px and object-fit contain; own captures exactly match author screenshot PNG bytes. These are not actual app/desktop/voice acceptance.','pendingOtherGoals':['9751b6d8-cde3-527b-b37c-babb6cee79d2','c441d9e8-d9d9-5e55-a189-a37345541321'],'activeWrites':False,'humanApproval':False,'humanTrial':False,'strictNetGain':0})

readme='''# Independent V-B first pass — two selected Chemistry candidates

CC-BY-4.0 for this own didactic review; scripts are Apache-2.0.

This immutable increment independently reviews selected 0bf and a44 attempt 2 only. Both receive **KEEP** after actually viewing full 1672×941 PNGs and 360/680 views. The browser source, actual geometry and selected asset SHA are bound. Own browser captures exactly match the viewed author screenshot bytes.

Whole current v2 DE/EN goals, bounded source witnesses and exact unchanged P cases are stored in `inputs/`. The P science reuse is from this reviewer's sealed D/P first pass; it is not visual performance proof. No current selected peer V report or overview was read before the seal. An incidental prior-attempt opinion in an author generation receipt is disclosed in `first-pass-independence-and-limitations.actual.json`.

The two remaining goals get later separate increments. Historical failed author attempts are not selected reviews. No active image import, canonical/QA change, global test, machine M7 credit, human approval, human trial or client acceptance is claimed.
'''
with (OUT/'README.md').open('x') as f: f.write(readme)
files=[{'path':str(p.relative_to(OUT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file()]
put('first-pass.final.freeze.json',{'documentType':'Independent V-B immutable selected-two first-pass seal','sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/chem17_fresh_blind_a','selectedCount':2,'verdicts':{'KEEP':2,'REVISE':0,'BLOCK':0},'currentSelectedPeerReportsReadBeforeSeal':False,'historicalExposureDisclosed':True,'files':files,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0})
print(json.dumps({'folder':str(OUT.relative_to(ROOT)),'sealSha256':sha(OUT/'first-pass.final.freeze.json'),'fileCount':len(files),'verdicts':{'KEEP':2,'REVISE':0,'BLOCK':0}}))
