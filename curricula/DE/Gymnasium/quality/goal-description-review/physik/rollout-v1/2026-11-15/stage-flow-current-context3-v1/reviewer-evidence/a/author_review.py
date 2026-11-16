import json
from pathlib import Path

base = Path('tmp/physics-release809-20261115/three-native-d/round-a')
out = Path('tmp/physics-current3-blind-a-20261115')
campaign = json.loads((base / 'description-review-campaign.json').read_text())
rows = [json.loads(line) for line in (base / 'batches/independent-a.batch-001.input.jsonl').read_text().splitlines()]
run_id = 'physics-current3-blind-a-20261115'
reviews = [
    {
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Die angegebenen Ergebnisziffern behaupten eine Genauigkeit, die durch die Eingangsdaten gedeckt sein muss. Explizite Unsicherheiten begrenzen diese Aussage genauer als eine bloße Ziffernzählregel. Zusätzliche Rechenstellen in Zwischenwerten schützen das Endergebnis vor vermeidbaren Rundungsfehlern, schaffen aber keine zusätzliche Messinformation.',
            'essentialUnderstandingEn': 'The reported result digits make a precision claim that the input data must support. Explicit uncertainties constrain this claim more precisely than a simple digit-counting rule. Extra calculation digits in intermediate values protect the final result from avoidable rounding errors but do not create additional measurement information.',
            'observablePerformanceDe': 'Die lernende Person wählt in einer selbstständig bearbeiteten Rechnung die durch die vorgegebenen Messdaten oder Unsicherheiten gestützte Enddarstellung mit Einheit, begründet die letzte sinnvolle Stelle und verwirft überzählige Rechnerziffern. In einer mehrstufigen Rechnung führt sie Schutzstellen weiter und erklärt anhand eines Vergleichs, wie frühes Runden das Endergebnis verändern kann.',
            'observablePerformanceEn': 'In an independently solved calculation, the learner chooses a final representation with units supported by the supplied measurements or uncertainties, justifies the last meaningful digit, and rejects excessive calculator digits. In a multi-step calculation, the learner retains guard digits and explains through a comparison how early rounding can change the final result.',
            'transferExpectationDe': 'In einer unabhängig vorgelegten neuen Rechnung ist statt einer bloß aus der Schreibweise erschlossenen Genauigkeit eine ausdrückliche Ergebnisunsicherheit vorgegeben. Die lernende Person passt die letzte Ergebnisstelle an diese Unsicherheit an, auch wenn eine mechanische Anwendung der kleinsten Stellenzahl eine andere Rundung nahelegen würde, und führt die Zwischenwerte weiterhin ausreichend genau.',
            'transferExpectationEn': 'In an independently presented fresh calculation, an explicit result uncertainty is supplied instead of precision being inferred only from the written digits. The learner aligns the last reported digit with this uncertainty even when mechanically applying the smallest digit count would suggest a different rounding, while continuing to carry intermediate values with sufficient precision.'
        },
        'rationale': 'Die vorhandenen DE/EN-Texte verbinden bereits datenabhängige Endrundung, ausreichende Genauigkeit der Zwischenwerte und Vermeidung von Scheingenauigkeit. Das ist ein zusammenhängender Darstellungs- und Rechenkompetenzkern; eine längere Beschreibung oder Aufteilung würde hier keinen konkreten Mangel beheben. Die tatsächliche Lernzielseite 1 (PDF-Seite 3) zeigt sowohl die Bedeutung von Endnullen als auch die bei einer Addition maßgebliche Dezimalstelle. Das gelesene V2-Profil unterscheidet Messinformation von Rechnerstellen, priorisiert explizite Unsicherheiten und verlangt direkte sowie mehrstufige unabhängige Anwendung mit verändertem Genauigkeitskontext. Deshalb ist keine Profiländerung erforderlich. Die vorliegenden Titel der direkten Voraussetzungen stützen die lokale Einordnung; vollständige Lehrplanabbildung und reale Länder-/Stufenprojektionen sind damit nicht verifiziert.',
        'evidenceProfileRecommendation': 'none'
    },
    {
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Die mittlere Stromstärke bezeichnet die vorzeichenbehaftete Nettoladung, die einen gewählten Querschnitt innerhalb eines festgelegten Zeitintervalls passiert, geteilt durch dessen Dauer. Sie beschreibt weder die im Leiter gespeicherte Ladung noch ohne weitere Annahme den Strom zu jedem einzelnen Zeitpunkt. Bezugsrichtung und Intervall legen die Bedeutung des Ergebnisses fest; 1 A bedeutet 1 C/s.',
            'essentialUnderstandingEn': 'Average current is the signed net charge passing a chosen cross-section within a specified time interval divided by its duration. It describes neither charge stored in the conductor nor, without further assumptions, the current at every individual instant. The reference direction and interval determine the meaning of the result; 1 A means 1 C/s.',
            'observablePerformanceDe': 'Aus unabhängig vorgelegten Ladungs-Zeit-Angaben bestimmt die lernende Person die Nettoladungsänderung und die zugehörige Dauer für einen markierten Querschnitt, berechnet I = ΔQ/Δt mit passender Einheit und erklärt Vorzeichen sowie Zahlenwert als Ladungstransport pro Zeit. Sie begründet bei zwei Mittelungsintervallen, warum die Ergebnisse bei ungleichmäßigem Transport unterschiedlich sein können.',
            'observablePerformanceEn': 'From independently supplied charge-time information, the learner determines the net transferred charge and corresponding duration for a marked cross-section, calculates I = ΔQ/Δt with appropriate units, and explains the sign and value as charge transfer per time. For two averaging intervals, the learner explains why the results can differ when transfer is non-uniform.',
            'transferExpectationDe': 'Ein neuer Fall ersetzt gleichmäßigen Transport durch Pulse mit stromlosen Pausen bei gleicher Ladung pro Zyklus. Die lernende Person legt Puls- und Zyklusintervalle selbst passend fest, sagt deren unterschiedliche Mittelwerte voraus und begründet sie mit der einbezogenen Dauer. Wird die Bezugsrichtung umgekehrt, erklärt sie die Vorzeichenänderung bei unverändertem physikalischem Transport.',
            'transferExpectationEn': 'A fresh case replaces steady transfer with pulses separated by zero-current pauses while retaining the same charge per cycle. The learner selects appropriate pulse and cycle intervals, predicts their different average currents, and explains them using the included duration. If the reference direction is reversed, the learner explains the sign reversal while the physical transfer remains unchanged.'
        },
        'rationale': 'Die Beschreibung benennt ausdrücklich den Mittelwert, Netto-Ladung, festgelegten Querschnitt, Zeitintervall, Gleichung und Einheitenbedeutung. Die englische Fassung transportiert dieselben Aussagen. Deutung, Rechnung und Einheit sind Nachweise derselben physikalischen Größenbeziehung und kein Anlass zu split_review. Die tatsächliche Lernzielseite 2 (PDF-Seite 4) zeigt einen markierten Querschnitt und ein korrektes Beispiel 6 C / 3 s = 2 A; das Bild allein fordert keine eigenständige Leistung. Das aktuelle V2-Profil liefert diese mit Ladungs-Zeit-Daten, Vorzeichenbezug und geändertem Puls-/Pausenfall. Sein Intervall- und Umstellungsanspruch bleibt innerhalb des beschriebenen Kompetenzkerns. Keine konkrete Beschreibungskorrektur und keine Profiländerung nötig. Der bloße KC-sourceRef und rohe Anwendbarkeitsangaben belegen keine unabhängig geprüfte Quellenzuordnung oder wirksame Länderprojektion.',
        'evidenceProfileRecommendation': 'none'
    },
    {
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Im vorgegebenen einfachen Silizium-Bindungsmodell kann ein Donator nach Ionisation ein zusätzliches bewegliches Elektron und ein ortsfestes positives Ion liefern. Beim Akzeptor entstehen ein ortsfestes negatives Ion und ein positiv wirksames Loch als fehlendes Bindungselektron; dessen Bewegung entsteht durch nachrückende Elektronen. Die zusätzlichen beweglichen Träger erklären n- beziehungsweise p-Dotierung, während die Ladungsbilanz des gesamten Materials neutral bleibt.',
            'essentialUnderstandingEn': 'In the supplied simple silicon bond model, an ionized donor can provide an additional mobile electron and a fixed positive ion. An acceptor produces a fixed negative ion and a positively acting hole representing a missing bond electron; its motion arises from neighbouring electrons filling the vacancy. These additional mobile carriers explain n-type and p-type doping respectively, while the charge balance of the entire material remains neutral.',
            'observablePerformanceDe': 'Die lernende Person leitet aus einem eigenständig bearbeiteten, vollständig vorgegebenen Bindungsbild mit Vier-, Fünf- oder Drei-Außenelektronen die zusätzlichen Träger für n- und p-Dotierung ab. Sie kennzeichnet mobile und ortsfeste Anteile mit richtigem Ladungsvorzeichen, erklärt die Lochverschiebung durch ein nachrückendes Bindungselektron und bilanziert Träger und Dotierion zum insgesamt neutralen Material.',
            'observablePerformanceEn': 'Working independently from a fully supplied bond diagram with four, five, or three outer electrons, the learner derives the additional carriers for n-type and p-type doping. The learner labels mobile and fixed contributions with the correct charge signs, explains hole displacement through a neighbouring bond electron filling the vacancy, and balances carrier and dopant-ion charges for an overall neutral material.',
            'transferExpectationDe': 'In einem neuen p-dotierten Bindungsbild befindet sich die Fehlstelle an anderer Stelle und ein anders gerichtetes Nachbarelektron rückt nach. Die lernende Person sagt die neue Lochposition und die zur Elektronenbewegung entgegengesetzte Lochverschiebung voraus, hält das Akzeptorion ortsfest und negativ und begründet erneut die Neutralität, ohne ein Loch als wanderndes Proton oder materiellen Hohlraum zu deuten.',
            'transferExpectationEn': 'In a fresh p-type bond diagram, the vacancy occupies a different location and a neighbouring electron fills it from a different direction. The learner predicts the new hole location and its displacement opposite to the electron motion, keeps the acceptor ion fixed and negative, and again justifies neutrality without interpreting the hole as a moving proton or a material cavity.'
        },
        'rationale': 'Die vorhandenen Beschreibungen begrenzen das Ziel auf ein vorgegebenes einfaches Bindungsmodell und verknüpfen n-/p-Trägerentstehung, mobile gegenüber ortsfesten Beiträgen und Gesamtneutralität klar und bilingual gleichwertig. Diese Unterscheidungen sind für dieselbe Modellkompetenz nötig; Bandmodell, p-n-Übergang oder zusätzliche Chemiekenntnisse werden nicht eingeführt. Die tatsächliche Lernzielseite 3 (PDF-Seite 5) bezeichnet ihr Bild als Symbolbild nach Ionisation mit ausschließlich Dotierbeiträgen und zeigt beide Ladungspaare mit korrektem Vorzeichen sowie das Loch als fehlendes Bindungselektron. Das aktuelle V2-Profil verlangt hierzu eigene Ableitung, Neutralitätsbilanz und echte Lochbewegung im veränderten Bild statt Bildkopie. Daher keep und keine Profiländerung. Diese lokale Inhaltsprüfung beansprucht keine gesonderte offizielle Quellen- oder nationale Projektionsvalidierung.',
        'evidenceProfileRecommendation': 'none'
    }
]
records=[]
for i,(row,review) in enumerate(zip(rows,reviews),1):
    goal=row['goal']
    record={
        '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,
        'recordId':f'{run_id}.goal-{i:03}',
        'runId':run_id,
        'campaignId':campaign['campaignId'],
        'roundId':campaign['roundId'],
        'bundleFingerprint':row['bundleFingerprint'],
        'bookDigest':row['bookDigest'],
        **{key:goal[key] for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        **review,
        'evidenceProfileContract':'positive-understanding-evidence-v2',
        'recordStatus':'candidate',
        'reviewAuthority':'ai_candidate'
    }
    records.append(record)
(out/'review.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
print('Wrote',len(records),'records to',out/'review.jsonl')
