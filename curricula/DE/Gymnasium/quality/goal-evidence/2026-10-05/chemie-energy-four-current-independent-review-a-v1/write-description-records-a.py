# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from pathlib import Path

batch = Path('curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-011-four-revisions-current-4-v1')
campaign = json.loads((batch / 'round-a/description-review-campaign.json').read_text())
inputs = json.loads((batch / 'round-a/description-review-input.json').read_text())
run_id = 'chemie-energy-four-current-20261005-independent-a'

authored = [
    {
        'essentialUnderstandingDe': 'Verbrennungsreaktionen verschiedener Kohlenwasserstoffe müssen stofflich korrekt verglichen werden. Energetische Kennzahlen beziehen sich auf eine festgelegte Stoffportion und vergleichbare Bedingungen; die größere Zahl allein entscheidet nicht über den Nutzen im jeweiligen Einsatz.',
        'essentialUnderstandingEn': 'Combustion reactions of different hydrocarbons must be compared with chemically correct substance relations. Energy figures refer to a specified amount and comparable conditions; the larger number alone does not determine their usefulness in a particular application.',
        'observablePerformanceDe': 'Die lernende Person stellt für neue Kohlenwasserstoffe die vollständige Verbrennung dar, begründet eine gemeinsame Massen-, Stoffmengen- oder Nutzenergiebasis und erklärt eine daraus gewonnene Rangfolge mit ihren Bedingungen.',
        'observablePerformanceEn': 'The learner represents complete combustion for fresh hydrocarbons, justifies a shared mass, amount-of-substance or useful-energy basis and explains the resulting ranking and its conditions.',
        'transferExpectationDe': 'Bei einem frischen Wechsel von gleicher Brennstoffmasse zu einem gegebenen Nutzwärmebedarf oder geänderten Verlusten prüft die lernende Person selbstständig, ob die ursprüngliche Rangfolge noch für die Nutzung gilt.',
        'transferExpectationEn': 'When a fresh case changes from equal fuel mass to a specified useful-heat demand or different losses, the learner independently checks whether the original ranking still applies to the intended use.',
        'rationale': 'KEEP: DE und EN verlangen denselben kohärenten stofflich-energetischen Vergleich einschließlich gemeinsamer Bezugsbasis und begründeter Nutzungseinordnung. Das entspricht dem aktuellen und retained HE-E.4-Vergleichsauftrag ohne importierte Ökobilanz- oder Reaktionsmechanismuskompetenz. Die Darstellung von CH4/C3H8 und der Brennwertvergleich bei flüssigem Produktwasser sind stimmig; Produktbilder sind keine stöchiometrische Gleichung und Ablesen vorgegebener Balken ist keine unabhängige Verständnisleistung. Die raw all-state applicability und diese vierseitige Prüfsicht bestätigen keine vollständige landesspezifische Runtime-Projektion. Der vorgelagerte Fraktionierungs-/Crackenkontext bleibt separat, ohne fachliche Wiederfreigabe dieses Nachbarziels.',
    },
    {
        'essentialUnderstandingDe': 'Die Verwendung wichtiger Erdölprodukte verbindet ihre Funktion in Alltag oder Technik mit Nutzen und konkreten möglichen Umweltfolgen. Eine begründete Bewertung unterscheidet belegte Sachinformationen, betrachtete Bedingungen und die verwendeten Kriterien.',
        'essentialUnderstandingEn': 'Uses of important petroleum products connect their everyday or technical function with benefits and specific possible environmental consequences. A reasoned assessment distinguishes supported facts, relevant conditions and the criteria used.',
        'observablePerformanceDe': 'Die lernende Person ordnet neue Produktbeispiele begründet Einsatzbereichen zu und entwickelt anhand gegebener Funktions- und Umweltinformationen eine eigene Abwägung, die tatsächlichen Nutzen und Folgen zusammenführt.',
        'observablePerformanceEn': 'The learner assigns fresh product examples to applications with reasons and develops an independent assessment from supplied functional and environmental information, connecting actual benefits with consequences.',
        'transferExpectationDe': 'Für einen frischen Wechsel der Anwendung oder Nutzungsdauer überprüft die lernende Person, wie sich die begründete Abwägung etwa zwischen langlebigem Bauteil und kurzlebiger Verpackung verändert und welche fehlenden Daten eine eindeutige Bewertung begrenzen.',
        'transferExpectationEn': 'For a fresh change of application or service life, the learner checks how the reasoned assessment changes, for example between a durable component and short-lived packaging, and identifies missing data that limit an unequivocal judgement.',
        'rationale': 'KEEP: Die DE/EN-Formulierungen erhalten sowohl die Nutzen-/Bedeutungsbewertung als auch die ökologische Konsequenzabwägung der tatsächlich gelesenen BY-C9-NTG.5.5- und C10.3.5-Klausel. Zuordnung dient der einen begründeten Produktbewertung und ist hier kein unabhängiges zweites Routineziel. Der Sek-I-Umfang verlangt keine vollständige Lebenszyklusanalyse, quantitative Klima-Rangliste oder pauschale Gesundheitsbehauptung. Das vorhandene Übersichtsmotiv kann bleiben; seine Symbole sind Beispiele von Anwendungen und Folgen, keine Datenbasis oder fertig begründete Freigabe. Die fachlichen Voraussetzungen und Rohstoffe bewertende Nachbarziele werden nur als Kontext gelesen, nicht neu freigegeben.',
    },
    {
        'essentialUnderstandingDe': 'Die Systemgrenze legt Stoff- und Energieaustausch fest. Wärme und Arbeit übertragen Energie; U und H sind Zustandsgrößen, ΔU und ΔH ihre Änderungen. Bei einem geschlossenen Modell mit ausschließlich Volumenarbeit unterscheiden starres Volumen und konstanter ausgeglichener Druck die zur Wärme passende Änderung.',
        'essentialUnderstandingEn': 'The system boundary determines exchange of matter and energy. Heat and work transfer energy; U and H are state functions and ΔU and ΔH their changes. In a closed model with only pressure-volume work, rigid volume and constant mechanically balanced pressure determine which change corresponds to heat.',
        'observablePerformanceDe': 'Die lernende Person grenzt in einem neuen Reaktionsbeispiel das System ab, begründet mögliche Austauschformen und erklärt anhand von Wärme und Volumenarbeit, warum die Wärme unter den festgelegten Bedingungen ΔU beziehungsweise ΔH entspricht.',
        'observablePerformanceEn': 'The learner defines the system in a fresh reaction example, justifies its possible exchanges and uses heat and pressure-volume work to explain why heat corresponds to ΔU or ΔH under the specified conditions.',
        'transferExpectationDe': 'In einem frischen Wechsel zwischen starrem Gefäß und beweglichem Kolben oder einem begründeten Systemgrenzenwechsel erklärt die lernende Person selbstständig, welche Austausch- und Wärmezuordnung gilt und warum eine bloße Temperatur- oder Q-Bezeichnung nicht ausreicht.',
        'transferExpectationEn': 'For a fresh change between a rigid vessel and a movable piston or a justified change of system boundary, the learner independently explains the valid exchange and heat relation and why a temperature value or a Q label alone is insufficient.',
        'rationale': 'KEEP: Beide Sprachen erhalten die aktuelle BY-C12-GA/EA.5.3-Systemkompetenz und unterscheiden ausdrücklich Energie-/Enthalpieänderungen statt Zustandsgrößen mit Reaktionsgrößen gleichzusetzen. Systemklassifikation und Wärmearbeitsunterscheidung bilden einen integrierten Energieaustauschbegriff; ein Wording-Split ist nicht erforderlich. Die Beschreibung fordert keine universelle Gleichsetzung jeder Wärme mit ΔH und keinen isolierten Energieaustausch. Die tatsächlich betrachtete vorhandene Grafik ist ein begrenztes Modell ausschließlich mit Volumenarbeit: starres Volumen links, konstanter mechanisch ausgeglichener Druck rechts, signierte Arbeit bei Expansion. Zusätzliche Arbeitsformen werden nicht durch die Bildformeln abgedeckt. Ein umfassender Hauptsatz-Rechenkurs bleibt im benachbarten Ziel.',
    },
    {
        'essentialUnderstandingDe': 'Das Lösen von Bindungen erfordert Energie, ihre Bildung setzt Energie frei. Die Bilanz und die verglichenen Zustandsbedingungen bestimmen das relative Enthalpieniveau von Edukten und Produkten; stärker gebundene Produkte sind nicht einfach energiereicher. Mittlere Gas-Bindungsenergien liefern nur eine gekennzeichnete Näherung.',
        'essentialUnderstandingEn': 'Breaking bonds requires energy and forming them releases energy. The balance and the compared state conditions determine relative reactant and product enthalpy levels; more strongly bound products are not simply more energy-rich. Mean gas-phase bond energies provide only a labelled approximation.',
        'observablePerformanceDe': 'Die lernende Person begründet in einem neuen vergleichbaren Reaktionsbeispiel die Richtung einer gegebenen oder gemessenen Enthalpieänderung durch die veränderten Bindungsverhältnisse und zeichnet selbstständig die relativen Edukt-/Produktniveaus mit Energiefluss.',
        'observablePerformanceEn': 'For a fresh comparable reaction example, the learner justifies the direction of a supplied or measured enthalpy change through altered bonding and independently represents relative reactant/product levels and energy flow.',
        'transferExpectationDe': 'Bei einer frischen Umkehr der Bindungsbilanz oder einer Änderung von Phase beziehungsweise Zustandsbedingungen erklärt die lernende Person die neue relative Einordnung und grenzt eine Gas-Bindungsenergienäherung von einem tatsächlichen Messwert ab.',
        'transferExpectationEn': 'For a fresh reversal of the bonding balance or a change of phase or state conditions, the learner explains the new relative ranking and distinguishes a gas-phase bond-energy approximation from an actual measurement.',
        'rationale': 'KEEP: Die äquivalenten DE/EN-Texte erhalten den qualitativen BY-C12-GA/EA.5.4-Auftrag und beziehen energiereich/energiearm ausdrücklich auf die verglichenen Edukt-/Produktsysteme. Bindungsverhältnisse begründen diese relative Einordnung als ein zusammenhängendes Verständnisziel. Keine allgemeine exakte Bindungssummenformel, separate Bildungsenthalpienrechnung, Aktivierungsbarriere oder Katalysekompetenz wird importiert. Die tatsächlich geprüfte neue Grafik zeigt korrekte Bindungsenergieflussrichtungen und relative Exo-/Endoniveaus; Gas-Modell/Näherung ist sichtbar und die anonymen Gefäße behaupten keine konkrete stoffliche Reaktionsidentität. Der Zahlen- und Quellenumfang muss im gesonderten aktuellen P-Nachweis begrenzt bleiben.',
    },
]

records = []
for index, (goal, authored_record) in enumerate(zip(inputs['goals'], authored), 1):
    evidence = {k: authored_record[k] for k in authored_record if k != 'rationale'}
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{run_id}.goal-{index:03d}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': evidence,
        'rationale': authored_record['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(record)

result_dir = batch / 'round-a/results'
result_dir.mkdir(exist_ok=True)
result = result_dir / 'description-records.jsonl'
assert not result.exists(), 'Do not overwrite historical review records'
result.write_text(''.join(json.dumps(record, ensure_ascii=False) + '\n' for record in records))
print(json.dumps({'runId': run_id, 'recordsPath': str(result), 'sha256': hashlib.sha256(result.read_bytes()).hexdigest(), 'records': len(records)}))
