from pathlib import Path
from datetime import datetime, timezone
import json, hashlib

REPO = Path('/home/enpasos/projects/skillpilot')
E15 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
OWN = Path(__file__).resolve().parent
V3 = E15 / 'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'
C = E15 / 'chemie-energy20-final-current422-native-fresh-independent-c-20261015-v1'
B = E15 / 'chemie-energy20-successor-current422-native-fresh-independent-b-20261015-v1'
goals = {g['id']: g for g in json.loads((V3 / 'candidate/twenty-whole-current560-goals.exact.json').read_text())['goals']}
peer = json.loads((C / 'FIRST.original-independent-scientific-judgments20.json').read_text())
peer_seven = [r for r in peer['decisions'] if r['decision'] == 'revise']
assert len(peer_seven) == 7


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def judgment(ordinal, disposition, wording_gap, substantive_gap, rationale, context, sources, after=None):
    c = next(r for r in peer_seven if r['ordinal'] == ordinal)
    g = goals[c['goalId']]
    current = {'descriptionDe': g['description'], 'descriptionEn': g['descriptionEn']}
    return {
        'ordinal': ordinal, 'goalId': g['id'], 'title': g['title'],
        'cFindingAndProposal': c,
        'informedResolution': disposition,
        'explicitLocalWordingGap': wording_gap,
        'missingScientificRequirementAfterWholeContextRead': substantive_gap,
        'before': current, 'recommendedAfter': after or current,
        'descriptionChangeRecommended': after is not None,
        'ownScientificReason': rationale,
        'existingPositiveEvidenceAndContext': context,
        'sourceBasis': sources,
        'universalNationalOrWholeCourseClearance': False,
        'newDVote': False,
    }


rows = [
    judgment(1, 'existing_context_satisfies_no_text_change', False, False,
        'Die H2/O2-Identität ist im ganzen verbindlichen Kontext bereits eindeutig: das direkte Prärequisit b759 benennt sie in DE und EN, und sämtliche verpflichtenden e1-e3-Erwartungen werden durch die zwei H2/O2-Fälle konkretisiert. Der zweite Fall verlangt ausdrücklich den Vergleich mit dem sauren Modell; e3 fordert eine Einsatzentscheidung. Elektrodenreaktionen erläutern und Vor-/Nachteile diskutieren sind bereits beobachtbare Leistungen. C schlägt eine chemisch richtige Kurzpräzisierung vor, weist aber keinen fehlenden Operator, Brennstoffwechsel oder ungesicherten Einsatzbezug des aktuellen Kontexts nach. Eine neue Beschreibung ist hierfür nicht erforderlich.',
        ['b759: Elektrodenprozesse einer Wasserstoff-Sauerstoff-Brennstoffzelle, Reaktionsdarstellung und Einsatz als Energiewandler', 'Profil e1: saure/alkalische Teilgleichungen; e2: lokale Emission/Vorkette; e3: chemisch und infrastrukturell begründete Anwendung; alle drei erforderlich', '01a: PEM-H2/O2, eigenes Herleiten,495kWh/198kgCO2 pro100km, Nutzungschance und Infrastrukturgrenze', '01b: alkalische H2/O2-Zelle, andere Wasserbildungsstelle, Carbonathypothese und kontrollierter Vergleich'],
        ['HE vollständige Seiten49-51, insbesondere Q4.2 erster GK+LK-Bullet auf50', 'Vollständiges aktuelles Prärequisit b759; BW3.3.5(6)/3.4.7(15) und breite nationale Partner bleiben ungeklärt']),
    judgment(2, 'bounded_source_operator_correction_recommended', True, False,
        'C trifft einen konkreten Unterschied der ausdrücklichen Operatoren: BY verlangt Bauprinzip beschreiben, Funktionsweise und Energetik erläutern. Die aktuelle gemeinsame Reihung recherchieren/beschreiben sagt die Erklärungsanforderung für beide letztgenannten Gegenstände nicht klar. Das ist ein lokaler Beschreibungsfehler; die wissenschaftlichen Anforderungen fehlen dem Gesamtmaterial nicht, weil Profil e1 und die vollständigen Lösungen sie bereits fordern. Genau die Operatorverteilung wird korrigiert. Recherche, Einsatzbewertung, Quellenprüfung und Zitatkennzeichnung bleiben erhalten; keine zusätzliche Technik-, Versuchs- oder Kaufberatungspflicht.',
        ['02a trennt inneren Li+- und äußeren Elektronenweg, reversibles Laden und Entladen sowie324Wh unter Testbedingungen; eigenständige Quellenrecherche bleibt tatsächlich zukünftig erforderlich', '02b liefert Blei-Redoxbilanz und erzwungenes Laden,357±25,5Wh nach Wandler, Last-/Leistungsgrenzen und eigenen Quellenfund', 'Profil e1 fordert bereits erklären/rekonstruieren; e2 trennt Ladung,Energie,Leistung und Bedingungen; e3 verlangt eigenen Such-/Zitatnachweis', '02a Aufgabenverb Beschreibe/Describe soll in Erläutere/Explain geändert und in der gespiegelten applicationCaseBrief identisch nachgeführt werden'],
        ['BY vollständige verwandte Einheiten/Kindkörper, C12-GA.8.10, rawId6cb0d220; identischer EA-Auftrag C12-EA.8.13 ist in der Mappingzelle ausdrücklich mitgeführt'],
        {'descriptionDe': 'Die lernende Person kann zu alltagsrelevanten Sekundärzellen recherchieren, ihr Bauprinzip beschreiben, Funktionsweise und Energetik erläutern und Einsatzmöglichkeiten bewerten; dabei prüft sie Vertrauenswürdigkeit und Urheberschaft der Quellen und kennzeichnet Zitate.',
         'descriptionEn': 'The learner can research everyday secondary cells, describe their construction principle, explain their function and energetics, and evaluate possible uses, while checking source trustworthiness and authorship and marking quotations.'}),
    judgment(5, 'bounded_application_operator_clarification_recommended', True, False,
        'Die Funktionsweise ist im Gesamtpfad nicht verloren: das ganze Prärequisit6b82 erläutert Aufbau/Funktion bereits ausdrücklich, und05a/b sowie Profil e1/e3 verlangen die Erklärung im Fahrzeugkontext. C darf daraus keinen fehlenden gesamten Lehrplaninhalt ableiten. Die lokale Kurzfassung Aufbau bewerten lässt aber offen, dass hier eine anwendungsbezogene Funktionsbegründung und keine bloße Bauteilbewertung gemeint ist. Die vorgeschlagene explizite Funktionserklärung ist eine begrenzte Klarstellung bereits verlangter Leistung. Die getrennte Einsatzbewertung und der Fahrzeugkontext bleiben erhalten; allgemeine Mobilitäts-LCA verbleibt bei1873.',
        ['HE50 verlangt beim Elektrofahrzeugantrieb Aufbau/Funktionsprinzip;6b82 trägt die vereinfachte Basis und wird nicht neu erweitert', '05a fordert vollständige Lade-/Entladewege aus LiC6+FePO4→C6+LiFePO4, Separator und Schutz sowie333km/15kWh Reserve', '05b verlangt kinetische Betriebsgrenzen bei unveränderter Redoxbilanz und48kWh/200km ohne doppelten Alterungsabzug', 'Direkt betroffener Profil-/Rubrikbefund:05b e1 ist derzeit der Zahlenrechnung zugeordnet, während e2 die kinetische Erklärung enthält. Für die fachlichen e1/e2-Kriterien sind diese beiden Zuordnungen zu tauschen; Aufgaben, Daten, Lösungen, Transfer und Leistungsumfang bleiben identisch'],
        ['HE vollständige Seiten49-51, insbesondere50 zusätzlicher LK-Bullet Antrieb von Elektrofahrzeugen', 'Ganzes aktuelles Prärequisit6b82; keine automatische nationale LK-Pflicht aus allgemeinen Akkumappings'],
        {'descriptionDe': 'Die lernende Person kann Aufbau und Funktionsweise von Lithium-Ionen-Akkumulatoren erklären und ihren Einsatz in Elektrofahrzeugen bewerten.',
         'descriptionEn': 'The learner can explain the structure and function of lithium-ion batteries and evaluate their use in electric vehicles.'}),
    judgment(12, 'existing_context_satisfies_no_text_change', False, False,
        'Berechnen ist bereits eine beobachtbare Fachleistung. Ein bloßes Einsetzen erfüllt den ganzen aktuellen Nernst-Kontext nicht: erforderliches e1 verlangt eigenständiges Bilden des dimensionslosen Q aus Stöchiometrie, e2 Herleitung mit Vorzeichen/Annahmen und e3 die Erklärung der Q/n-Skalierung und Lastgrenze.12a fordert Richtung und Betrag ausdrücklich;12b verlangt die Erklärung von pH-Kürzung und Datenbedarf. Die von C gewünschte Aktivitätsbegründung ist somit nicht neu und auch nicht nur eine optionale Musterlösung. Eine korrekte kurze Beschreibung muss nicht jede bereits verpflichtende Begründungsrubrik wiederholen. Die präzise v3-ALT-/Kontextgrenze reversibel versus Lastverluste bleibt unverändert.',
        ['12a: Q=1/(aH2·sqrt(aO2)),E≈1,1894V, Richtung begründen, Q²/n4 invariant erklären', '12b: gemeinsame Referenz,-0,82824V/0,40076V, Zellspannung1,229V, Last0,75V nicht allein als pH interpretierbar', 'alle e1-e3 sowie frische Variation/Transfer sind erforderlich; falsche O2-Potenz wird aus Koeffizient/Elektronenzahl rekonstruiert'],
        ['HB vollständige Seite31: LK erklärt Konzentrationsabhängigkeit; Nernst als Fachbegriff und experimentelle Herleitung; Brennstoffzellen als Vertiefung', 'HB-Mappingtext auf Brennstoffzellen ist keine wortgetreue volle Brennstoffzellenpflicht; Quellenscope bleibt offen']),
    judgment(13, 'existing_context_satisfies_no_text_change', False, False,
        'Der Begriff Wirkungsgrad bezeichnet fachlich ein Verhältnis eines definierten Nutzoutputs zu einem Systeminput. Ein Vergleich unverträglicher Größen erfüllt die Kompetenz vergleichen nicht. Die konkrete Bindung ist außerdem längst verpflichtend: e1 nennt erklärte Grenze,13a fordert drei Nutzengrenzen,13b die15kWh-Radarbeitsnormierung und widerlegt die82%-Fehlbehauptung. C beschreibt einen sinnvollen Prüfmaßstab, aber keinen aktuellen Anforderungsverlust. Die Kurzbeschreibung wird nicht um die bereits verbindliche Definitions- und Bewertungsrubrik verlängert. Insbesondere wird kein neuer Umweltbewertungsoperator hinzugefügt.',
        ['13a:30/80/50% und60/85/70% für getrennte elektrische,nominelle und bedarfsbezogene Nutzgrenzen', '13b:82% Steckdose-Rad gegenüber32,8% Primär-Rad und25% Brennstoff-Rad; gleiche15kWh Radarbeit ist ausdrücklich verlangt', 'Profil e1 ist genau der von C beanspruchte Input-/Nutzoutput-/Systemrand, e3 verlangt gemeinsame Nutzfunktion und Grenzen; Transfer ändert Wärmebedarf bzw.PV-Konvention'],
        ['Vorliegende vollständige HE/BY-Energiekontexte stützen Energieumwandlung und Nutzung, nicht eine zusätzliche nationale Universalpflicht aus breiten Mappings', 'e64 als direkte Voraussetzung bleibt wegen GK/LK-Scope blockiert; diese Auflösung hebt den Hold nicht auf']),
    judgment(14, 'existing_context_satisfies_no_text_change', False, False,
        'Funktionale Einheit, Inventar und Systemrand sind nicht fehlend: sie stehen wörtlich in verpflichtendem e1 und werden in beiden vollständigen Fällen angewendet.14a nennt1MJ Brennstoffenergie und ausgeschlossene Wirkungskategorien;14b1kWh gespeicherte H2-LHV-Energie und tatsächlich ersetzte Wärme. e3 verbietet ausdrücklich, aus der vereinfachten Klimabilanz eine vollständige Umweltbewertung zu machen. Der bestehende Ausdruck vereinfachte Ökobilanzen mit erstellen/interpretieren trägt die begrenzte Modellkompetenz; die zusätzlichen Wörter von C präzisieren ein schon verbindlich bestimmtes Modell. Keine neue Wasser-/Biodiversitätsdatenmatrix, keine vorgetäuschte vollständige Mehrkategorien-LCA und kein neues Profil sind für diesen D-Befund erforderlich.',
        ['14a: getrennte biogene Aufnahme/Emission,40/120 gegen95gCO2e; gleiche Brennstoffenergie ist nicht automatisch gleicher Transportdienst', '14b:0,35kg brutto, unbelegte-0,40kg-Gutschrift versus belegte0,05kg und netto0,30kg; fehlende Strombereitstellungs-/Speicherverluste benennen', 'e1 deckt Bezugsgröße/Systemgrenze, e2 Doppelzählungsgrenze, e3 fehlende Umweltkategorien; Transfer verlangt geänderte Radarbeit bzw.ersetzte Wärmeroute'],
        ['HB ganze Seite32 spricht von Kohlenstoffdioxidbilanz und ökologischen/ökonomischen Treibstoffurteilen; nicht von einer wörtlich vollständigen Mehrkategorien-LCA', 'Breite Kunststoff-/Rohstoff-/Recyclingmappings bleiben Partner- und Quellenscope-Holds']),
    judgment(17, 'bounded_observable_operator_clarification_recommended', True, False,
        'Die aktuelle wissenschaftliche Beurteilungsleistung ist im Profil und in17a/b bereits vollständig vorhanden. C findet keine fehlende Aquatikprüfung: die korrigierte17b-Lösung benennt für beide Produkte fehlende Wirkungs- und Expositionsdaten. Der isolierte Kurzoperator reflektieren macht jedoch das hier beabsichtigte beobachtbare Abwägen weniger klar als Titel, e3 und Aufgaben. Die geringstmögliche Änderung benennt kriteriengestütztes Abwägen derselben drei Aspekte. Cs zusätzliche Festschreibung Herstellung und Verwendung ist sachlich plausibel, aber nicht nötig; sie wird nicht zu einem neuen vollständigen Lebensphasen-Prüfraster ausgeweitet.',
        ['17a fordert gleich saubere5kg-Wäsche,0,17/0,34kgCO2e, drei Perspektiven und gezielte fehlende Preis-/Sozialdaten', '17b verlangt Argumente beider Karten, drei offene Nachweise und eine ausdrücklich gewichtete Priorität; Abbau allein liefert weder aquatische Verträglichkeit noch Expositionsbeleg', 'e3 verlangt bereits transparente Gründe und Nichtwissen; Fälle/Profil brauchen deshalb keine neue wissenschaftliche Erwartung'],
        ['HE vollständige Seite49 verbindet fakultative Themenfelder mit Sach-/Bewertungskompetenz und Verbraucherauswahl;51 nennt drei Nachhaltigkeitsdimensionen,Rohstoffwahl,Waschgewohnheiten,Verbraucherverhalten', 'BY C10-NTG.4.8 ist ein Sek-I-Partner und beweist keine neue universelle obere LK-Pflicht'],
        {'descriptionDe': 'Die lernende Person kann ökologische, ökonomische und soziale Aspekte moderner Waschmittel anhand ausgewählter Kriterien abwägen.',
         'descriptionEn': 'The learner can weigh ecological, economic and social aspects of modern detergents using selected criteria.'}),
]

gid = 'ebfa2c18-0599-5282-bf7a-80c14d86331e'
alt_after = 'Didaktische Infografik zu drei Green-Chemistry-Kennzahlen. Links zeigt ein idealisiertes stöchiometrisches Synthesemodell mit 100 u Ausgangsstoffen, 80 u Zielprodukt und 20 u Nebenprodukt eine Atomökonomie von 80 %. Getrennte Prozessbeispiele zeigen den E-Faktor 200 kg Abfall / 10 kg Produkt = 20 und PMI (100 + 400 + 10) kg Input / 10 kg Produkt = 51. Atomökonomie bezieht sich auf die bilanzierte Synthese einer Komponente, nicht auf bloßes Mischen einer Formulierung. E-Faktor und PMI benötigen jeweils offengelegte Produkt- und Massenbilanzgrenzen; die gezeigten Zahlen sind keine gemeinsame Prozessbilanz.'
extra = {
    'ordinal': 8, 'goalId': gid, 'scope': 'additional current ALT/context finding only; outside the seven D wording findings',
    'informedResolution': 'necessary_current_alt_correction_plus_dated_context_no_image_byte_change',
    'beforeAltText': goals[gid]['resourceLinks'][0]['altText'], 'recommendedAfterAltText': alt_after,
    'ownScientificReason': 'Der ganze aktuelle v3-Alttext ordnet Atomökonomie weiterhin pauschal Formulierungen zu. Das widerspricht der bereits korrigierten aktuellen Beschreibung und dem expliziten Reaktions-/Mischungsunterschied in Profil e1 und20a/b. Der ALT-Fehler ist unabhängig davon echt, dass ein historischer Prompt alte Beschreibungstexte unverändert enthalten darf. Das tatsächliche JPG wurde erneut betrachtet: sein linkes100u/80u/20u-Modell kann als ideale stöchiometrische Synthese gelesen werden; es behauptet im Bild keine Atomökonomie bloßen Mischens. Die mittleren EF20- und rechten PMI51-Zahlen sind verschiedene Beispiele, keine identische Prozessbilanz; diese Kontextgrenze wird ausdrücklich benannt. Kein Bildbyteaustausch wird empfohlen und kein V-Urteil abgegeben.',
    'datedContextRequirements': ['historischen Prompt exakt erhalten und als historisch kennzeichnen', 'aktuelle Synthese-/Prozess-/Formulierungsgrenzen explizit benennen', 'AE80%,EF20 undPMI51 als getrennte Beispiele behandeln; aus diesen unterschiedlichen Daten kein PMI=E+1 über beide Bildspalten fordern', 'AE ist ideale stöchiometrische Größe und keine tatsächliche Ausbeute; ein grünes Symbol beweist keine vollständige Umweltverträglichkeit', 'neue Kontextfassung tatsächlich unabhängig prüfen; historische V-Zeile nicht als aktuelle Freigabe umetikettieren'],
    'sourceBasis': ['ganze aktuelle ebfa-Beschreibung,Profil e1-e3 und vollständige20a/b-Fälle', 'ACS Green Chemistry and Engineering Metrics, tatsächlich erneut geöffnet: Atom Economy ist reaktions-/synthesebezogen; mehrere Kennzahlen sind für ein umfassendes Urteil nötig;https://www.acs.org/green-chemistry-sustainability/research-innovation/engineerings-metrics.html'],
    'newDVote': False, 'newVVote': False,
}
now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
out = {
    'schemaVersion': 1,
    'role': 'Original informed scientific resolution proposal by earlier reviewer B after explicitly authorized exposure to C FIRST; no new blind or ordinary D vote',
    'writtenAt': now, 'firstObservedClockForThisSeparateTask': '2026-10-15T12:16:15Z',
    'blindToOtherRuns': False,
    'CFirstActuallyRead': {'path': str(C / 'FIRST.original-independent-scientific-judgments20.json'), 'sha256': sha(C / 'FIRST.original-independent-scientific-judgments20.json')},
    'formerBlindBFinalSealPreserved': {'path': str(B / 'FILES.finite-independent-b.seal.json'), 'sha256': sha(B / 'FILES.finite-independent-b.seal.json')},
    'classificationPolicy': 'Distinguish a local public operator ambiguity from a missing scientific requirement in the complete goal/prerequisite/profile/case context. Do not mistake every useful longer phrase for a required description edit.',
    'sevenFindings': rows,
    'eighthAltContextFinding': extra,
    'oneBoundedFutureAuthorBatch': {
        'recommendedDescriptionGoalIds': [r['goalId'] for r in rows if r['descriptionChangeRecommended']],
        'descriptionEdits': 3,
        'currentAltEdits': 'three matching current generic ALT descriptions for the changed goals plus the necessary ebfa scientific ALT correction',
        'caseEdits': '02a task wording describe→explain in DE/EN;05b e1/e2 rubric-assignment correction only; no new data,solutions,transfer or tasks',
        'profileEdits': 'mirror02a task in application brief; align05b e1/e2 positive-observable references and rubric copy; retain all expectations,coverage and future acquisition obligations',
        'historicalPromptEdits': 0, 'imageByteEdits': 0,
        'currentDatedContextNotes': 'three changed description/ALT contexts and ebfa ALT context',
        'futureReviewScope': 'Actual final changed contexts and affected records require scientific verification; these are proposals, not automatic renewed D/P/V/M acceptance. Existing unchanged records and rejected wording expansions do not become fresh votes.',
    },
    'holdsExplicitlyPreserved': ['e64 GK/LK course conflict','c21 independent-content atomicity','0773 exact-source/optional selection and absent image','all national source/course/partner/selection holds and56 empty rawText passages','six existing M text stales,with two additional text-stale contexts expected for7a5 and551 if the proposed descriptions are actually adopted'],
    'actualFutureResearchAndPracticalPerformanceStillRequired': True,
    'fabricatedLearnerOrLabExecutions': 0,
    'humanOrLabTrialAsMachineM7PrerequisiteIntroduced': False,
    'candidateWritten': False, 'frozenV3Changed': False,
    'newD': 0, 'newP': 0, 'newA': 0, 'newM': 0, 'newV': 0, 'newStrict': 0,
    'centralExecuted': False, 'activeIntegration': False, 'humanApproval': False, 'humanTrial': False, 'M7': False,
}
path = OWN / 'FIRST.original-informed-scientific-resolution-seven-plus-alt.json'
assert not path.exists()
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'writtenAt': now, 'path': str(path), 'sha256': sha(path), 'descriptionEditsRecommended': 3, 'alreadySatisfiedNoTextChange': 4, 'additionalAltFinding': 1}))
