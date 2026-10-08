import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

root = Path('/home/enpasos/projects/skillpilot')
q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
author = q / 'biologie-he9-nineteen-current391-science-author-root-v1'
own = q / 'biologie-he9-nineteen-science-first-independent-b-20261008-v1'
now = datetime.now(timezone.utc).isoformat()
def read(p): return json.loads((root/p).read_text())
def digest(p):
    b=(root/p).read_bytes()
    return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,obj):
    p=root/own/name
    assert not p.exists(), f'append-only destination exists: {p}'
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
freeze=read(author/'nineteen-whole-science-native-P19-author-input.first.freeze.json')
inputs=[]
for x in freeze['files']:
    observed=digest(Path(x['path']))
    assert observed==x, x['path']
    inputs.append(observed)
af=digest(author/'nineteen-whole-science-native-P19-author-input.first.freeze.json')
assert af['sha256']=='aa6e241a08ed75a0656aca63369e58e9eabb0361f85013439a12175528beb168'
am=author/'retained-AM-technical-independent-a/completed-retained-A19-M25-cards17-views8.independent-a.exact.freeze.json'
amf=read(am)
assert digest(am)['sha256']=='28e033f0ed4ae1f6ca2ecf8ec325bb35ef222d95454ecfa5bab0c26a651081c7'
for x in amf['files']: assert digest(Path(x['path']))==x
write('exact-author-and-retained-AM-input-verification.actual.json',dict(checkedAt=now,authorFreeze=af,authorFiles=inputs,retainedTechnicalFreeze=digest(am),retainedTechnicalFilesVerified=len(amf['files']),newAMScientificJudgments=0,retainedTerminalChecks=amf['terminalNativeChecks'],retainedA19=19,retainedMemoryRequired2=2,retainedMDependencyClosure25=25,cards17=17,views8=8,sciencePeerARead=False,activeWrites=0))
goals=read(author/'current19-whole-DEEN-goals.actual.json')['goals']
cases=read(author/'nineteen-whole-goals-thirty-eight-complete-DEEN-cases.author.json')['goals']
candidates=read(author/'P19.current-text-preimage.author.candidates.json')['goals']
rows=[json.loads(x) for x in (root/author/'P19.current-text-preimage.author.review.jsonl').read_text().splitlines()]
live={g['id']:g for g in read(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))['goals']}
bindings=[]
for g,c,p,r in zip(goals,cases,candidates,rows):
    assert g['id']==c['goalId']==p['goalId']==r['goalId']
    assert live[g['id']]==g
    assert p['profile']==r['profile']
    profile=p['profile']
    for cc,brief in zip(c['cases'],profile['applicationCaseBriefs']):
        assert cc['id']==brief['id']
        for lang,cap in [('de','De'),('en','En')]:
            assert brief['taskDemand'+cap]==cc['material'][lang]+' '+cc['task'][lang]
            assert brief['expectedPerformance'+cap]==cc['modelAnswer'][lang]
            assert brief['understandingFocus'+cap]==' '.join(x['essentialUnderstanding'+cap] for x in profile['expectations'])
    for lang,cap,joiner in [('de','De',' Gegenüberstellung mit: '),('en','En',' Contrasted with: ')]:
        assert profile['variationAxes'][0]['text'+cap]==joiner.join(x['material'][lang] for x in c['cases'])
    assert profile['coverageExpectations']['requiredExpectationIds']==[x['id'] for x in profile['expectations']]
    bindings.append(dict(ordinal=c['ordinal'],goalId=g['id'],wholeLiveGoalExact=True,completeDEENCases=[x['id'] for x in c['cases']],wholeAuthorNativeProfileExact=True,materialTaskModelAndFocusExact=True,variationWholeMaterialsExact=True,goalFingerprint=r['goalFingerprint'],reviewInputFingerprint=r['reviewInputFingerprint'],profileFingerprint=r['profileFingerprint']))
write('nineteen-whole-goal-case-profile-bindings.actual.json',dict(checkedAt=now,count=19,completeDEENCaseCount=38,bindings=bindings,method='Exact duplicate-field verification supports the separately performed substantive reading; hashes are not science judgments.'))

notes=[
('Hornhaut, Irisöffnung, Linse, Glaskörper, Netzhaut und Sehnerv sind räumlich korrekt; der zweite Fall korrigiert Iris/Netzhaut sowie Pupille als Öffnung statt Gewebescheibe.','Ein zulässiger Augenweg der Quelle Auge ODER Ohr; kein zusätzliches Ohr-Bauziel verlangt.'),
('Lichtbrechung und Signalumwandlung sind getrennt; kleineres Irisloch ersetzt nicht Akkommodation. Nahsehen erhöht Linsenkrümmung; umgekehrtes Netzhautbild bedeutet kein inneres Schirmsehen.','Schirm- und Augenmodellgrenzen sind ausdrücklich Bestandteil der eigenen Erklärung.'),
('Sensorische und motorische Richtungen sowie chemische Synapsen sind korrekt. Rückenmarkverschaltung und bewusste Ampelentscheidung bieten sachhaltig verschiedene Verarbeitungskontexte.','Der schematische lokale Reflexweg ist keine allgemeine automatische Antwort auf jede Berührung.'),
('UV-Fenster einer angegebenen Bienenart und 25-kHz-Hundemodell vergleichen Rezeptorbereiche. Beide Modellantworten unterscheiden Wahrnehmungsinformation von subjektivem Erleben oder pauschal besserem Sinn.','Schematische Bereiche sind keine Messdaten und keine universelle Aussage über Insekten oder Hunde.'),
('Lärm betrifft Innenohr-Haarzellen, UV die Augen und Alkohol zentrale Verarbeitung. Zweiter Fall erklärt eine Störung trotz äußerlich unversehrter Sinnesstrukturen mit dem gesamten Reizweg.','Schutzbegründung ohne eigene schädigende Versuche, Arzneianweisung oder harmlosen Drogenwert.'),
('Ausstrich und Zentrifugation stellen Erythrozyten, Leukozyten, Thrombozyten und Plasma korrekt dar. Antikoaguliertes Blut liefert Plasma statt Serum; reife menschliche Erythrozyten sind kernlos.','Kein echter Blutbefund und keine vollständige Leukozytendifferenzierung oder Diagnose.'),
('Fall1 erklärt Hämoglobintransport, Thrombozytenpfropf/Fibrin und Zell-/Antikörperabwehr korrekt. In Fall2 fehlt für Modell A eine ausdrückliche Abwesenheit der Leukozyten; die Modellantwort folgert dennoch eine unvollständige zelluläre Abwehr wegen fehlender Leukozyten.','Die Materialliste A enthält Plasma und Erythrozyten und schließt nur Thrombozyten/Gerinnungsproteine ausdrücklich aus. Entweder A ausdrücklich als ausschließlich diese Komponenten bzw. ohne Leukozyten definieren oder die Abwehrfolgerung konditional formulieren. Kein Ganzzieltextfehler.'),
('AB0-Antigene und Anti-B des A-Empfängers sind korrekt. Anti-A/Anti-D-Agglutination bestimmt A RhD-positiv. Anti-D ist nicht angeboren bei allen RhD-negativen Personen.','Erythrozytenkonzentrat statt Vollblut oder Plasma; Modell ist keine klinische Verträglichkeitsfreigabe.'),
('Phagozyten, spezifische Lymphozyten, Antikörper und Gedächtnis werden korrekt getrennt. Transplantatoberflächen können spezifische Abstoßung auslösen; Immunsuppression erklärt den Infektions-Zielkonflikt.','Organ ist kein Erreger; keine selbständige Medikamentenänderung oder universelle Immunitätsgarantie.'),
('HIV-Infektion und fortgeschrittenes AIDS sind korrekt getrennt; ART hemmt Vermehrung. Der zweite Fall begrenzt U=U ausdrücklich auf sexuelle Übertragung bei anhaltend nicht nachweisbarer Viruslast.','Gewöhnlicher Alltagskontakt überträgt nicht; kein Risiko aus Gruppenzugehörigkeit, keine Heilungsbehauptung.'),
('FSH/Follikel, Estradiol/Schleimhaut, LH/Ovulation und Progesteron/Gelbkörper sind fachlich stimmig. Pubertätsachse wirkt über Zielrezeptoren und lässt individuelle Verläufe zu.','Keine universelle 28-Tage-Regel oder persönliche Vorhersage; Hormone bestimmen nicht alle sozialen Entwicklungen.'),
('Kondom-Barriere und kombinierte Pille mit hauptsächlicher Ovulationshemmung sind korrekt unterschieden. Familienplanungsfall bewertet mehrere Fürsorge-/Gesundheits-/Zeit-/Unterstützungskriterien.','Schwangerschafts- und Infektionsschutz getrennt; keine absolute Wirksamkeit, persönliche Eignung oder reine Wohlstandsdefinition.'),
('Beide nicht expliziten Erwachsenen-Vignetten erlauben begründeten Perspektivwechsel. Aktuelle freiwillige Zustimmung, Grenzen, Privatsphäre und Nichtabwertung sind klar getrennt.','Keine persönliche Offenlegung nötig; soziale Norm ist kein biologischer oder ethischer Zwang. Keine Gesetzesberatung behauptet.'),
('TSH stimuliert Schilddrüsen-Thyroxin, Thyroxin hemmt TSH: kleiner Abfall vermindert Hemmung. Zweite Skizze mit zwei positiven Wirkungen ist korrekt als verstärkend unterschieden.','HE9.3 ist fakultativer Regelkreisinhalt. Vereinfachung ohne Hypothalamus/offene Zeitverzögerung, nicht jedes endokrine Ereignis negativ rückgekoppelt.'),
('2n=4/6-Modelle unterscheiden Replikation von Chromosomenzahl; MeioseI trennt Homologe, II Schwesterchromatiden, Mitose erhält Satz. Eizellbildung ausdrücklich nicht vier gleichwertige Eizellen.','Vereinfachte Teilungsmodelle ohne behauptete Beobachtung oder vollständige Oogenese.'),
('Aa×aa liefert erwartete Hälfte; AA×aa und folgende Aa×Aa ergeben 1:2:1 sowie 3:1. Dominanz ist heterozygote Ausprägung und keine Häufigkeits-/Wertbehauptung.','Synthetische Pflanze mit vollständiger Dominanz; historisches Zungenrollen wird nicht als bewiesener Mendelfall übernommen; kleine Nachkommenzahlen nicht garantiert.'),
('Rezessiver Stammbaum erzwingt Aa-Eltern/aa-Kind und lässt AA oder Aa beim unauffälligen Kind offen. Dominanter Dd×dd-Stammbaum folgert Genotypen und 50% unter ausdrücklich gegebenen Annahmen.','Wahrscheinlichkeiten pro Befruchtung, nicht garantierte nächste Schwangerschaft oder individuelle Diagnose/Würde.'),
('Gruppe21 mit drei Kopien ergibt 47,XX,+21. Zweiter Fall zählt 45 mit einem X und 46 trotz kleiner DNA-Änderung; Trisomie, Monosomie und Auflösungsgrenze sind korrekt getrennt.','Karyogramm sagt nicht alle Sequenzänderungen, Fähigkeiten oder Lebensverläufe voraus; keine echte Diagnose.'),
('Gentest, somatische Genkopie-Therapie und DNA-Klonierung haben verschiedene Ziele. Rekombinante Insulinproduktion über intronfreie DNA/Vektor/Produktionszellen ist keine Genübertragung in den Proteinempfänger.','Grundprinzipien statt Labor-/Therapieprotokoll; ausgewählte DNA statt Klonierung der gesamten Spenderperson.')]
verdicts=[]
for i,(g,c,p,r,note) in enumerate(zip(goals,cases,candidates,rows,notes),1):
    science='HOLD' if i==7 else 'KEEP'
    verdicts.append(dict(ordinal=i,goalId=g['id'],wholeGoalDEENVerdict='KEEP',wholeCaseAndProfileVerdict=science,sourceSection='HE9.1' if i<=5 else 'HE9.2' if i<=10 else 'HE9.3' if i<=14 else 'HE9.4',actualWholeDescriptionRead=True,actualCompleteDEENCasesRead=[x['id'] for x in c['cases']],actualWholePositiveProfileRead=True,substantiveObservationDe=note[0],scopeAndLimitDe=note[1],bilingualSemanticParity=True,materialAuthority='own synthetic cases; no learner data',retainedAMScientificJudgment='not re-reviewed',finalNativeD='pending actual final images/pages/campaign',finalV='pending actual final full PNG/360/680/PDF',fingerprints=bindings[i-1],humanApproval=False))
    r['reviewId']='biologie-he9-nineteen-science-first-independent-b-20261008-v1'
    r['reviewedAt']=now
    r['reviewer']='OpenAI Codex independent B, conversation /root/human20_technical; no HE9 author work and no peer science output read'
    r['reason']=science+' Science-first: '+note[0]+' '+note[1]+' Finale native D/V-Prüfung ausstehend.'
    r['dissent'].append('Eigenes unabhängiges B-Ersturteil '+science+'; finaler Raster-/PDF-Input noch offen. Mindestens zwei Demonstrationen sind Evidenzanforderung, keine Quote zusätzlicher Aufgaben nach nachgewiesener Meisterschaft.')
    assert r['profile']==p['profile']
write('nineteen-whole-science-first-verdicts.independent-b.first.json',dict(artifactKind='actual-independent-whole19-source38case-positive-profile-science-first-review',reviewedAt=now,reviewer='/root/human20_technical',sourceAndWholeGoalKeep=19,caseProfileKeep=18,caseProfileHold=1,verdicts=verdicts,sciencePeerARead=False,sciencePeerFindingsDiscussedBeforeSeal=False,profileBodyChanges=0,activeWrites=0,strictGainClaimed=0,humanApproval=False))
rp=root/own/'P19.current-text-independent-b.review.jsonl';assert not rp.exists();rp.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in rows))
config=read(author/'P19.current-text-preimage.author.config.json')
config['reviewId']=rows[0]['reviewId'];config['reviewPath']=str(own/'P19.current-text-independent-b.review.jsonl')
write('P19.current-text-independent-b.config.json',config)
source=Path('tmp/biologie-flora-final-b-20261008-source/g9-biologie.pdf')
assert digest(source)['sha256']=='93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
write('whole-primary-source-and-targeted-fact-reading.independent-b.actual.json',dict(readAt=now,wholeSource=dict(url='https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',localRehydratableCache=digest(source),physicalPagesReadCompletely=[23,24,25,26,27],printedPages=[22,23,24,25,26],fullTextRedistributed=False),independentlyOpenedInstitutionalFactPages=[dict(url=u,selectedScientificTopic=t) for u,t in [
('https://www.who.int/en/news-room/fact-sheets/detail/hiv-aids','HIV/AIDS and precisely sexual U=U on sustained undetectable therapy'),
('https://www.blood.co.uk/why-give-blood/demand-for-different-blood-types/the-rh-system/','RhD/alloimmunization'),
('https://www.blood.co.uk/why-give-blood/blood-types/','ABO red-cell antigens and plasma antibodies'),
('https://www.who.int/news-room/fact-sheets/detail/oral-contraceptives','Combined vs progestin-only pill, no STI protection'),
('https://www.genome.gov/about-genomics/fact-sheets/Chromosome-Abnormalities-Fact-Sheet','Numerical/structural distinction, selected trisomy21/monosomy, division; historical unrelated broad claims not adopted'),
('https://www.genome.gov/about-genomics/fact-sheets/Cloning-Fact-Sheet','Selected gene/DNA cloning vs whole organism cloning; unrelated historical research-status claims not adopted')]],sourceLimits=['Auge ODER Ohr: Augenweg gewählt, keine universelle Pflichtdeckung beider','HE9.3 fakultativer Regelkreis, keine Pflicht aus Beispiel','Historische Zungenrollen-Vereinfachung nicht als gesichertes menschliches Mendelmerkmal übernommen','SourceRef/raw applicability no all-country or all-view source approval'],actualReading='Direct independent full source-page and complete case/profile reading; mechanical duplicate bindings are supporting checks only.'))
print(json.dumps(dict(authorFilesVerified=len(inputs),retainedTechnicalFilesVerified=len(amf['files']),wholeGoals19=19,fullCases38=38,profileKeep18=18,profileHold1=1,activeWrites=0)))
