"""Own informed scientific amendment, saved before stock record serialization."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1'
SELECTOR = SOURCE / 'pages-final-eight/NEUTRAL.final-eight-actual-current-pages-profiles-nineteen-cases.selector.json'
FIRST = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-eight-current-pages-fresh-independent-b-20261015-v1/FIRST.scientific-eight.actual-read-and-sight.json'

def pin(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

assert pin(FIRST)['sha256'] == 'sha256:c607f22a39001624df73deaf9238ece501a7a43138518d8f9f660fd39702e59c'
assert pin(SELECTOR)['sha256'] == 'sha256:7cadf5c75169f78a6db17fa333c79df78cedf80a400d136f00c925aba53fa922'
first = json.loads(FIRST.read_text())
old = {r['goalId']: r for r in first['decisions']}
selected = json.loads(SELECTOR.read_text())
assert pin(ROOT / selected['finalSealPath'])['sha256'] == 'sha256:84e01b1084805c31db915f352fa14f6d31aef82b98042fffd6eab4fe241a0e56'

notes = {
 '1d2e7b80-653d-57b8-a284-8ede5a353b73': (
  'Die ganze Beschreibung ist unverändert und bleibt KEEP. Im aktuellen ganzen Profil und den drei ganzen Fallobjekten ist der strukturbezogene Maltose-/Disaccharidtransfer weiterhin Pflicht; die Fructose-/Enediolvertiefung ist ausdrücklich auf die tatsächlich einschlägige Kursroute begrenzt. Durchführung und Kontrollen bleiben erforderlich; eine bloße Planung oder Sollfarben genügen nicht. Das neue Material verbietet eine zusätzliche feste Laufquote nach vollständiger Evidenz. Dies beseitigt keine fachliche Anforderung, sondern bindet sie korrekt an die Quellroute. Auf der wirklich gesehenen finalen Seite 3 steht der Nachfolger96 nun als interner Link; das Bausteinmodell und der ganze Zieltext sind erhalten. Mein ursprünglicher eigenständiger Profilhinweis bleibt: essentialUnderstanding/aspect-1 („Ausführen, kontrollieren und strukturell erklären“) und aspect-2 („Grenze ... prüfen“) sind Handlungsanweisungen. Die darin verstandene Beziehung zwischen anomerer Verknüpfung, Carbonylzugang und Reduktionsvermögen sollte im positiven Verständnisfeld selbst benannt werden. Das ist eine Profilrevision, kein Grund für eine weitere Änderung der klaren Beschreibung.',
  'revise',
  'Seite3 tatsächlich gesehen: Glucose/Saccharose, Bausteinmodell, ganzer kontrollierter Nachweistext und interner Nachfolger96; neuer BookDigest im Fußbereich.'),
 'e9d34f34-2a43-5cc7-bcca-1d08e057531d': (
  'Die ganze Beschreibung bleibt unverändert KEEP. Der frühere Profilbefund wurde am tatsächlichen Inhalt geprüft: Im neuen zweiten Fall sowie der zugehörigen Erwartung wird jetzt Protonierung anhand gegebener pKa-Werte, Ladungsbilanz und Protonenaufnahme/-abgabe verlangt; Elektrophorese ist ausdrücklich nur eine gesonderte freiwillige Anwendung. Die beiden ganzen Rubriken begründen keine zusätzliche Labordurchführung. Der Transfer an eine weitere ionisierbare Restgruppe bleibt erforderlich; dominante Form ist nicht exklusive Spezies. Damit ist mein ursprünglicher Übergriff in das Elektrophoreseziel behoben und die aktuelle Empfehlung none vertretbar. Die echte finale Seite4 zeigt unveränderte Glycinformen und beide direkten fachlichen Nachfolger nun als interne Links. Die pH2-Abbildung wird weiter als vereinfachte dominante Form im Kontext der vollständigen Metadaten gelesen.',
  'none',
  'Seite4 tatsächlich gesehen: pH2/6/12, Zwitterion und +1/0/−1; vollständige Beschreibung und interne Links zu b47/ffec; neuer Modellfußtext.'),
 '96d33fb6-ed14-50ab-b5c7-5ce0559d518a': (
  'Mein ursprüngliches REVISE wird nach tatsächlicher Nachprüfung zu KEEP: Beide aktuellen Beschreibungssprachen verlangen ausgewählte Nachweise, Durchführung/Auswertung und ausdrücklich ihre unterschiedliche analytische Aussagekraft anhand von Molekülstruktur und Enzymwirkung. Damit scheitert das ursprüngliche Gegenbeispiel, allein mit einem positiven Benedict-Fructosebefund das Gesamtziel zu schließen. Die chemisch verschiedenen Nachweisfragen bleiben sichtbar, ohne alle benannten Methoden zwingend vorzuschreiben. Die echte finale Seite5 bindet den direkten Vorgänger1d2 intern ein. In der neuen, tatsächlich gesehenen Bildfassung steht beim blauen Negativbefund „nicht nachgewiesen“; die alte absolute Abwesenheitsbehauptung ist entfernt. Die ganzen drei aktuellen Fälle/Rubriken unterscheiden Kontrollbefunde, Reduktionsvermögen und GOD-Selektivität; im Hydrolysefall ist Planung ausdrücklich kein Durchführungsbeleg. Das ganze fachliche Profil ist identisch zum zuvor selbst gelesenen Inhalt und trägt nun die präzisierte Beschreibung: keine weitere Profiländerung für diesen Befund empfohlen. Native-/Profilhashes und Fußtextänderung sind ausschließlich technische neue Bindungen.',
  'none',
  'Seite5 tatsächlich gesehen: neue volle Nachweisbeschreibung, Cu-Test/GOD gegenübergestellt und negative Kupfercaption „nicht nachgewiesen“; keine eingefügte Messung.'),
 'b47d542d-c2d7-5554-95dc-10b47ab622ab': (
  'Die Beschreibung bleibt KEEP; die ganzen fachlichen Profilinhalte sind exakt identisch zu meinem zuerst gelesenen Profil. Die aktuelle tatsächliche Seite6 und beide ganzen Fälle bestätigen die frühere Grenze: gleiche Amino-/Carboxylgrundgruppen, verschiedene Reste und bedingte Eigenschaftserklärung. Der Glutaminsäurevergleich enthält weiterhin ausdrücklich fiktive qualitative Feststoffbeobachtungen und Modell-pKa-Werte; dominante Spezies, Gemisch, Gitter-/Gegenionen-/Ionenstärkeeinflüsse sind begrenzt. Er ist keine reale Löslichkeitsmessung. Mein ursprünglicher Profilhinweis wird nicht aus neuen P-Metadaten als erledigt behandelt: Die essentialUnderstanding-Felder „Beobachtete Eigenschaft ... erklären“ und „pH-Variation ... deuten“ benennen weiterhin vor allem Tätigkeiten. Die konkrete verstandene Beziehung zwischen Restfunktionalität, Protonierung und Wasserwechselwirkungen sollte dort positiv ausformuliert werden. Deshalb evidenceProfileRecommendation=revise, während der präzise Zieltext bleibt.',
  'revise',
  'Seite6 tatsächlich gesehen: Alanin/Serin bei pH7 mit gemeinsamen geladenen Gruppen, unverändertes Bild und vollständiger Text; Säure-Base-Voraussetzung jetzt interner Link.'),
 'ffec1761-c954-5b5d-a0cf-4c8367f91705': (
  'Die frühere klare Nomenklaturbeschreibung und ihre DE/EN-Parität sind unverändert, daher weiterhin KEEP. Die ganzen fachlichen Profilinhalte wurden exakt gegen meinen eigenen FIRST verglichen und sind identisch. Beide ganzen aktuellen Fälle samt vollständiger gemeinsamer Rubrik verlangen regelbezogene Benennung, Zählrichtung und veränderte Konnektivität; die Trivialnamen des Bilds genügen nicht. Es werden keine Stereokonfiguration oder zusätzliche Restklassifikation importiert. Auf der tatsächlichen finalen Seite7 bleiben C1/C2, beide vollständigen vereinfachten Strukturen und die Beschreibung lesbar; die Voraussetzung ist jetzt ein interner Link. Die neue Seitenbindung beruht auf dieser tatsächlichen Sichtung und der begrenzten technischen Kontextprüfung, nicht auf einer behaupteten neuen fachlichen Entdeckung.',
  'none',
  'Seite7 tatsächlich gesehen: Glycin/Alanin mit Carboxyl-C1 und Amino-C2, ganzer Text und interne Säure-Base-Voraussetzung; geänderter Fußhash.'),
 '0b5342b9-512d-573f-90d5-7522aee35efa': (
  'Mein ursprüngliches REVISE wird nach Lesen der wirklichen aktuellen DE/EN-Felder zu KEEP: Der englische Beschreibungstext verwendet nun „intestinal absorption“ und auch der englische Titel wurde konsistent berichtigt. Die deutsche Beschreibung, der Kompetenzumfang und die Graphbeziehungen sind identisch. Diese begrenzte Wortkorrektur beseitigt meinen belegten terminologischen Befund ohne zusätzliche Diagnose- oder Therapiekompetenz. Das jetzt tatsächlich gebundene ganze Profil war zuvor null; es unterscheidet Lactosehydrolyse und nachgeschaltete Darmaufnahme mit einem frischen Transportfall. Die zwei ganzen ursprünglichen Fälle und ihre gemeinsame Rubrik wurden erneut als vollständige aktuelle Materialien geprüft. Die reale finale Seite8 behält die Lactaseillustration und die ganze Beschreibung. Das Profil unterstützt den chemischen Mechanismenvergleich und behauptet weder echte Probandenbefunde noch individuelle Diagnosen; die frühere create-Empfehlung ist damit durch einen tatsächlichen vollständigen Profilinhalt abgedeckt.',
  'none',
  'Seite8 tatsächlich gesehen: unveränderte Lactase-/Lactose-Gegenüberstellung und ganze DE-Beschreibung. Die EN-Korrektur wurde am ganzen aktuellen JSON geprüft, da das PDF diese Sprache nicht druckt.'),
 'f4d5a02d-711b-5a6b-a41d-971359c1f64d': (
  'Die Beschreibung bleibt wie im eigenen FIRST KEEP. Der neue vollständige gebundene Profilinhalt ersetzt das zuvor tatsächliche Profilnull; er enthält die drei ganzen Fälle einschließlich des schon selbst gelesenen expliziten Referenz-Einheitenfalls. Die jetzigen ganzen Fälle/Rubriken wurden erneut geprüft: +6/(2·0,05)=+60; im explizit fiktiven Vergleich +5,3/(1·0,100)=+53 mit hier allein winkelbedingter Unsicherheit±1. Spezifische Referenzdrehungen sind keine beobachteten Winkel. Der Vergleich ist ausdrücklich auf zwei Kandidaten unter passenden Bedingungen beschränkt; Drehung null beziehungsweise Vorzeichen erzwingen weder Stoffidentität noch D/L-Zuordnung. Die neue Profilbindung ist deshalb inhaltlich nachvollziehbar; die frühere create-Empfehlung ist erledigt, ohne eine reale Messung oder einen P-Gateabschluss daraus zu behaupten. Die tatsächlich gesehene finale Seite9 zeigt weiterhin nur einen schematischen Aufbau und eine gedrehte Ebene.',
  'none',
  'Seite9 tatsächlich gesehen: unveränderter schematischer Lichtweg und Drehungsskizze, ganzer Beschreibungstext, drei externe Voraussetzungen, neuer Modellfußtext.'),
 '0773a104-aaeb-5e96-a615-2a2bec3eb096': (
  'Die ganze Beschreibung und die vollständige fachliche Profilwissenschaft sind gegenüber dem eigenen FIRST identisch, daher weiterhin KEEP mit Empfehlung none. Beide ganzen aktuellen Tensidfälle samt Kriterienrubriken wurden geprüft: Strukturwahl hängt von den angegebenen Temperatur-, Härte- und Dosierungsbedingungen sowie getrennten Fett-/Schaumzielen ab; die Modellwerte sind keine Produktspezifikationen oder Umweltfreigaben. Frischer Transfer ändert Temperatur oder Zielgewichtung. Auf der tatsächlichen finalen Seite10 sind beide Strukturmodelle weiter gleichwertig angeordnet; die offene Strukturwahl und die Bedingungen bleiben erkennbar. Die frühere kleine englische Satzabstandsstelle „objectives,and“ bleibt ein nicht inhaltlicher Redaktionshinweis. Neuer BookDigest und Feedbackbezug begründen allein keinen neuen wissenschaftlichen Befund.',
  'none',
  'Seite10 tatsächlich gesehen: Temperatur/Härte/Dosis, zwei gleichwertige Tensidmodelle, Fettentfernung und Schaum getrennt; ganze Beschreibung und neue Fußbindung.')
}

records = []
for entry in selected['actualPagesAndHashes']:
    gid = entry['goalId']
    for field in ['actualWholeGoalAndPageInput','actualPagePng120dpi','actualWholePageText']:
        assert pin(ROOT / entry[field]['path']) == entry[field]
    page = json.loads((ROOT / entry['actualWholeGoalAndPageInput']['path']).read_text())
    goal = page['actualStockDescriptionReviewInputGoal']
    profile = goal['reviewContext']['evidenceProfile']['profile']
    priorprofile = old[gid]['currentStockInputGoal']['reviewContext']['evidenceProfile']
    priorprofile = priorprofile['profile'] if priorprofile else None
    rationale, recommendation, observation = notes[gid]
    understanding = dict(old[gid]['understandingEvidence'])
    if gid.startswith('1d2e7b80'):
        understanding['essentialUnderstandingDe'] = 'Ein zugängliches anomeres Zentrum ermöglicht bei geeigneten Kohlenhydraten den Zugang zu reduzierenden Carbonylformen; die Bindung beider anomeren Zentren erklärt unbehandelte Saccharose als nicht reduzierend. Der kontrollierte Kupfernachweis erfasst Reduktionsvermögen unter seinen Bedingungen und keine eindeutige Glucoseidentität.'
        understanding['essentialUnderstandingEn'] = 'An accessible anomeric centre allows suitable carbohydrates to access reducing carbonyl forms; linkage of both anomeric centres explains untreated sucrose as nonreducing. The controlled copper assay detects reducing behaviour under its conditions rather than unique glucose identity.'
        understanding['transferExpectationDe'] = 'Bei frisch vorgelegter Maltose oder einem passenden unbekannten Disaccharid erklärt die lernende Person den veränderten Befund durch freie beziehungsweise verknüpfte anomere Zentren. Eine zusätzliche Fructose-/Enediolbegründung ist nur in der ausdrücklich einschlägigen Vertiefungsroute Pflicht; die geforderte tatsächliche Untersuchung und unabhängige Strukturbegründung bleiben erhalten.'
        understanding['transferExpectationEn'] = 'For freshly presented maltose or a suitable unfamiliar disaccharide, the learner explains the changed result through free or linked anomeric centres. An additional fructose/enediol explanation is compulsory only in the explicitly relevant extension route; actual investigation and independent structural reasoning remain required.'
    if gid.startswith('e9d34f34'):
        understanding['transferExpectationDe'] = 'Bei einer frisch vorgelegten einfachen Aminosäure mit zusätzlicher ionisierbarer Gruppe zählt die lernende Person anhand gegebener pKa-Werte alle relevanten Ladungen und begründet die überwiegende Form sowie mögliche Speziesgemische. Elektrophorese ist dafür keine zusätzliche Abschlussbedingung.'
        understanding['transferExpectationEn'] = 'For a freshly presented simple amino acid with an additional ionisable group, the learner uses supplied pKa values to account for all relevant charges and justify the predominant form and possible mixtures. Electrophoresis is not an additional completion requirement.'
    records.append({
        'goalId': gid, 'priorOwnDecision': old[gid]['decision'], 'decision': 'keep',
        'priorOwnEvidenceProfileRecommendation': old[gid]['evidenceProfileRecommendation'],
        'evidenceProfileRecommendation': recommendation, 'rationale': rationale,
        'understandingEvidence': understanding, 'actualViewImageCompleted': True,
        'actualPageObservation': observation,
        'currentText': {k:goal[k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'currentCanonicalContext': goal['canonicalContext'],
        'canonicalContextIdenticalToOwnFirst': goal['canonicalContext'] == old[gid]['currentStockInputGoal']['canonicalContext'],
        'currentWholeScientificProfile': profile,
        'scientificProfileIdenticalToOwnFirst': profile == priorprofile,
        'actualPageBinding': entry,
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
        'profileAuthority': 'needs_human_review'
    })

caseindex = json.loads((ROOT / selected['wholeNineteenCurrentCaseMaterialAndRubricBindings']['path']).read_text())
doc = {
    'schemaVersion': 1,
    'role': 'Own informed scientific D8 followup B, actually completed and secured before stock record serialization',
    'securedAtUtc': datetime.now(timezone.utc).isoformat(),
    'ownOriginalFirst': pin(FIRST), 'finalNeutralSelector': pin(SELECTOR),
    'finalNeutralPageSeal': pin(ROOT / selected['finalSealPath']),
    'actualCurrentCanonical': selected['canonical'],
    'actualCurrentBookModel': selected['actualBookModel'],
    'actualCurrentBookPdf': selected['actualBookPdf'],
    'actualCurrentRoundBInput': selected['roundBInput'],
    'actualCurrentRoundBCampaign': selected['roundBCampaign'],
    'wholeCaseBindings': {key:selected[key] for key in ['wholeNineteenCurrentCaseMaterialAndRubricBindings','wholeSixTargetFourteenCases','wholeNeighborFiveCorrectedCasesAndRubrics']},
    'caseCountsActuallyChecked': caseindex['caseCountByGoalId'],
    'wholeCasesAndWholeAvailableRubricsChecked': 19,
    'viewImageCallsActuallyCompleted': 8,
    'independence': 'Only own original FIRST and neutral complete current goals/pages/scientific profile contents/cases/materials/rubrics were read. No peer D, synthesis, triage or positive P/A/V review decisions were opened. Profile metadata verdicts/reasons were excluded from scientific reading.',
    'campaignProvenanceDisclosure': 'The supplied byte-exact current technical round-B campaign labels reviewPass first_pass and its IDs contain first-pass-b. This execution is an informed followup to this reviewer\u0027s own preserved FIRST, not a new independent blind scientific vote. Existing campaign bytes/IDs will be referenced unchanged as requested; this amendment and each record disclose the actual method.',
    'technicalChangesOnly': 'All eight footer model hashes and feedback model references changed; graph links became internal where both goals now share the Native8 book. Those changes do not replace actual sighting or create scientific approval.',
    'authorityLimits': 'candidate/ai_candidate; profiles remain needs_human_review. No real learner work, laboratory execution, measured data, HumanApproval, HumanTrial, publication, runtime or central maturity closure is asserted.',
    'decisions': records
}
OUT.mkdir(parents=True, exist_ok=True)
target = OUT / 'FOLLOWUP.scientific-eight.before-stock.json'
with target.open('x') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2); f.write('\n')
assert len(json.loads(target.read_text())['decisions']) == 8
seal = {'schemaVersion':1,'role':'Own scientific amendment saved before any stock D records', 'scientificFollowup':pin(target),'originalOwnFirstUnchanged':pin(FIRST),'createdAtUtc':datetime.now(timezone.utc).isoformat()}
with (OUT/'SEAL.scientific-before-stock.json').open('x') as f:
    json.dump(seal,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps(seal,ensure_ascii=False))
