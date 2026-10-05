"""Serialize reviewer A's independently formulated decisions; no input mutation."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-current-independent-d-a-v1'
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1/native-finalbook'
ROUND = BASE / 'round-a'
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
batch_id = campaign['batches'][0]['batchId']
batch = [json.loads(line) for line in (ROUND / 'batches' / f'{batch_id}.input.jsonl').read_text().splitlines()]
run_id = 'chemie-b014-five-current-independent-d-a-20261005-v1'

# This prose was formulated by reviewer A from the frozen current native input,
# own actual PDF views, raw prospective relations and official primary sources.
# No author verdict, historical D/P conclusion or reviewer B record was read.
reviews = [
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Oxidation und Reduktion sind gekoppelte Elektronenabgabe und Elektronenaufnahme. Der Elektronendonator wird oxidiert und wirkt als Reduktionsmittel; der Elektronenakzeptor wird reduziert und wirkt als Oxidationsmittel. Die Bezeichnungen beziehen sich auf die Funktion eines Stoffes in der betrachteten Reaktion.',
            'essentialUnderstandingEn': 'Oxidation and reduction are coupled electron loss and electron gain. The electron donor is oxidized and acts as the reducing agent; the electron acceptor is reduced and acts as the oxidizing agent. These names refer to the function of a substance in the reaction being considered.',
            'observablePerformanceDe': 'Die lernende Person erläutert beispielsweise anhand der Reaktion von Zink mit Kupfer(II)-Ionen, welche Teilchen Elektronen abgeben oder aufnehmen, und begründet daran beide Stoffrollen. Sie verbindet die sichtbare Metallabscheidung mit der Teilchendeutung und erklärt, weshalb das Reduktionsmittel selbst oxidiert wird.',
            'observablePerformanceEn': 'Using, for example, zinc reacting with copper(II) ions, the learner explains which particles lose or gain electrons and justifies both substance roles. They connect the visible metal deposition to the particle interpretation and explain why the reducing agent itself is oxidized.',
            'transferExpectationDe': 'Bei einer anders dargestellten geeigneten Reaktion, etwa einer vorgegebenen Elektronenübertragung zwischen Magnesium und Sauerstoff oder einer anderen Metall-Ionen-Kombination, leitet die lernende Person Donator, Akzeptor und die beiden Stoffrollen aus der Elektronenübertragung ab und erläutert die Zuordnung.',
            'transferExpectationEn': 'For a suitable reaction shown in a different representation, such as a supplied electron transfer between magnesium and oxygen or another metal-ion combination, the learner derives the donor, acceptor and both substance roles from the electron transfer and explains the assignments.'
        },
        'rationale': 'KEEP: Ein zusammenhängendes, prüfbares Verständnis der Elektronenübertragung trägt alle drei Operatoren. DE und EN sind gleichwertig; AB2 passt zum begründeten Zuordnen. Hessen KC 2024, erhaltene amtliche Fassung Stand 01.08.2025, E.1 S.35, verlangt den erweiterten Redoxbegriff. Die live amtliche Fassung Stand 21.04.2026 enthält dieselben relevanten E.1-Klauseln auf S.35; die ältere 2024-Datei führt sie auf S.33. Bayern C9.6 bestätigt die Elektronenabgabe/-aufnahme bei Metall-Metallsalz-Reaktionen. Die separate Hessen-Klausel zum Aufstellen mit Oxidationszahlen ist im zukünftigen Mapping dem passenden Ziel221 zugeordnet und wird hier nicht als bloße Begriffskenntnis vereinnahmt. Aktuelle PDF-/HTML-Seite, Bild und Alttext zeigen korrekte Rollen für Zn und Cu2+. Die direkte Orientierungsvoraussetzung ist für diesen begrifflichen Einstieg vertretbar; die experimentelle Redoxreihe folgt diesem Ziel. Keine neue Beschreibung erforderlich.',
        'recommendation': 'create'
    },
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Eine Metallabscheidung zeigt bei einer geeigneten Metall-Metallsalz-Kombination eine Elektronenübertragung und damit eine relative Donatorstärke der Metalle beziehungsweise Akzeptorstärke ihrer Ionen. Vergleichbare Messungen einfacher galvanischer Zellen liefern weitere Hinweise auf die Reihenfolge. Eine verkürzte Redoxreihe ordnet die untersuchten Paare und ist an die angegebenen Versuchsbedingungen gebunden.',
            'essentialUnderstandingEn': 'In a suitable metal-metal-salt combination, metal deposition shows electron transfer and hence the relative donor strength of the metals or acceptor strength of their ions. Comparable measurements of simple galvanic cells provide further evidence for the ordering. A shortened redox series orders the investigated pairs and is tied to the stated experimental conditions.',
            'observablePerformanceDe': 'Aus vorgegebenen oder dokumentierten Abscheidungsbeobachtungen und unter vergleichbaren Bedingungen erhaltenen Zellmessungen konstruiert die lernende Person eine begründete Reihenfolge, bezeichnet jedes Paar als Metall/Metallion und weist Donator und Akzeptor der jeweils betrachteten Reaktion zu. Sie stimmt die Richtung der Elektronenübertragung mit der Messpolung ab und erklärt, welche Beobachtung jede Ordnungsbeziehung trägt.',
            'observablePerformanceEn': 'From supplied or documented deposition observations and cell measurements obtained under comparable conditions, the learner constructs a justified ordering, identifies each metal/metal-ion pair and assigns the donor and acceptor in each reaction being considered. They reconcile the electron-transfer direction with the measurement polarity and explain which observation supports each ordering relation.',
            'transferExpectationDe': 'Für eine neue Zusammenstellung von Metall-Ionen-Paaren oder nach Vertauschen der Messanschlüsse rekonstruiert die lernende Person die Ordnung aus den gegebenen Daten. Sie begründet die erwartete Richtung einer weiteren geeigneten Abscheidungsreaktion und erkennt, wenn die Daten oder die Vergleichbarkeit der Bedingungen für eine eindeutige Ordnung nicht ausreichen.',
            'transferExpectationEn': 'For a new set of metal-ion pairs or after the measurement leads are exchanged, the learner reconstructs the ordering from the given data. They justify the expected direction of another suitable deposition reaction and recognize when the data or comparability of the conditions do not support a unique ordering.'
        },
        'rationale': 'KEEP: Experimentelle Befunde zu einer verkürzten Ordnung zusammenzuführen ist eine einzelne AB2-Kompetenz. DE/EN erhalten Abscheidungen, Zellmessungen und Paarzuordnung. Hessen E.1 S.35 nennt das Ableiten einer verkürzten Metallredoxreihe aus Metallabscheidungen samt Donator-/Akzeptor-Paaren; Messungen einfacher Zellen liefern fachlich passende zusätzliche Daten, ohne die vollständige Theorie der Standardpotenziale zum Gegenstand dieses Ziels zu machen. Bayern C9.6 trägt die Metall-Metallsalz-Teilchendeutung. Die aktuelle Grafik zeigt Cu-Abscheidung auf Zn, Ag-Abscheidung auf Cu und einen konsistent gepolten Zn/Cu-Messfall; die qualitative Donatorordnung ist korrekt. Der Text verlangt keine selbständige Planung eines bereits vollständig verstandenen galvanischen Elements: bereitgestellte Messfälle sind möglich. Daher ist die direkte Voraussetzung04 mit ausdrücklichem Donator-/Akzeptor-Verständnis sachgerecht, während das ausführliche Ziel zum Aufbau/Funktionsprinzip galvanischer Elemente anschließend folgt. Die entfernte Voraussetzung bcf ist für diese E-Kompetenz keine zusätzliche notwendige Schranke. Geeignete vergleichbare Bedingungen gehören ins Evidenzprofil; kein Beschreibungsumbau nötig.',
        'recommendation': 'create'
    },
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Die äußere Spannungsquelle erzwingt einen Redoxvorgang. Kationen können zur negativen Kathode und Anionen zur positiven Anode wandern; Reduktion erfolgt an der Kathode und Oxidation an der Anode. Die tatsächlichen Produkte hängen von Elektrolyt, Elektroden und Bedingungen ab. Bei geeignet durchgeführter Elektrolyse einer wässrigen Kupfer(II)-chloridlösung werden Cu2+-Ionen zu Kupfer reduziert und Chlorid-Ionen zu Chlor oxidiert; die gekoppelte Elektronenbilanz erklärt das Stoffmengenverhältnis.',
            'essentialUnderstandingEn': 'The external voltage source forces a redox process. Cations can migrate towards the negative cathode and anions towards the positive anode; reduction occurs at the cathode and oxidation at the anode. The actual products depend on the electrolyte, electrodes and conditions. In suitably conducted electrolysis of aqueous copper(II) chloride, Cu2+ ions are reduced to copper and chloride ions are oxidized to chlorine; the coupled electron balance explains the amount ratio.',
            'observablePerformanceDe': 'Die lernende Person deutet beobachtete Produktbildung und Ionenwanderung an einem geeigneten Elektrolyseaufbau, formuliert die zugehörigen Elektrodenreaktionen und begründet das Produktverhältnis durch gleiche abgegebene und aufgenommene Elektronenzahlen. Für den geeigneten wässrigen CuCl2-Fall erklärt sie Cu:Cl2 = 1:1 und vergleicht Energiezufuhr, Elektrodenrollen und Reaktionsrichtung mit einem galvanischen Element. Sie unterscheidet den wässrigen Fall von der dargestellten NaCl-Schmelze.',
            'observablePerformanceEn': 'The learner interprets observed product formation and ion migration in a suitable electrolysis setup, formulates the corresponding electrode reactions and justifies the product ratio through equal numbers of electrons lost and gained. For the suitable aqueous CuCl2 case, they explain Cu:Cl2 = 1:1 and compare the energy input, electrode roles and reaction direction with a galvanic cell. They distinguish the aqueous case from the illustrated NaCl melt.',
            'transferExpectationDe': 'An einem veränderten, ausreichend beschriebenen Elektrolysebeispiel leitet die lernende Person Ionenbewegung, Elektrodenreaktionen und Produktverhältnis aus den angegebenen Bedingungen ab. Beim Wechsel von einer Schmelze zu einer wässrigen Lösung berücksichtigt sie Wasser und mögliche konkurrierende Elektrodenreaktionen, statt das Schmelzprodukt ungeprüft zu übertragen.',
            'transferExpectationEn': 'In a changed electrolysis example described in sufficient detail, the learner derives ion movement, electrode reactions and the product ratio from the stated conditions. When moving from a melt to an aqueous solution, they take water and possible competing electrode reactions into account instead of transferring the melt products without checking.'
        },
        'rationale': 'KEEP: Die zentrale Kompetenz erklärt einen Elektrolyseprozess über Teilchen, Elektrodenreaktionen und Elektronenbilanz; Produktverhältnisse und Vergleich sind daran gebundene Verständnisleistungen. DE/EN verlangen denselben ausdrücklich wässrigen CuCl2-Fall. Hessen E.1 S.35 fordert Elektrolyse an einem Beispiel, Q3.3 nennt die Kupfer(II)-chloridlösung; die Formulierung hält das konkrete Quellenbeispiel im kanonischen Ziel sichtbar. Die direkten Voraussetzungen zu einfachen Elektrolysen und galvanischen Elementen liefern passende Grundlagen, der Folgepunkt zu Entladen/Laden ist sinnvoll. Die aktuelle Grafik bezeichnet NaCl ausdrücklich als Schmelze und zeigt die korrekten Halbgleichungen und Na:Cl2 = 2:1; sie behauptet keine Natriumabscheidung aus Wasser. Die andere Bildsubstanz ergänzt den geforderten wässrigen Fall. Im Evidenzprofil müssen geeignete Elektroden und Bedingungen, Cu:Cl2 = 1:1 sowie Wasser als möglicher Reaktionspartner begründet werden. Diese Differenzierungen konkretisieren den fachlichen Kern, ohne den Lernzieltext mit Versuchsdetails zu überladen. Keine stoffübergreifende Wiederaufladbarkeit wird aus dem NaCl-Bild behauptet.',
        'recommendation': 'create'
    },
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'In einer dafür geeigneten reversibel arbeitenden Zelle liefert der freiwillige Redoxvorgang beim Entladen elektrische Energie; zum Laden wird elektrische Energie zugeführt und die chemische Umsetzung in Gegenrichtung erzwungen. Die Fähigkeit zum Wiederaufladen hängt vom Zelltyp und geeigneten Betriebsbedingungen ab. Leer beziehungsweise geladen beschreibt einen nutzbaren Ladezustand, nicht die Abwesenheit beziehungsweise das bloße Einfüllen von Stoff oder Elektronen.',
            'essentialUnderstandingEn': 'In a suitable reversibly operating cell, the spontaneous redox process during discharge supplies electrical energy; charging requires electrical energy and forces the chemical conversion in the opposite direction. The ability to recharge depends on the cell type and suitable operating conditions. Empty or charged describes a usable state of charge, not the absence of material or the simple filling of a container with material or electrons.',
            'observablePerformanceDe': 'Die lernende Person vergleicht Entladen und Laden derselben geeigneten Zelle anhand eines vorgegebenen Modells: Sie erläutert Energiefluss und Umkehr der beteiligten Oxidations-/Reduktionsvorgänge. Sie übersetzt eine Alltagsaussage wie der Akku ist leer in einen fachlichen Ladezustand und begründet, weshalb daraus weder vollständiger Stoffverbrauch noch die Wiederaufladbarkeit einer beliebigen Batterie folgt.',
            'observablePerformanceEn': 'Using a supplied model, the learner compares discharge and charge of the same suitable cell and explains the energy flow and reversal of the participating oxidation and reduction processes. They translate an everyday statement such as the rechargeable cell is empty into a scientific state of charge and justify why it implies neither complete material consumption nor the rechargeability of an arbitrary battery.',
            'transferExpectationDe': 'Bei einer neuen geeigneten Geräte- oder Zellbeschreibung entscheidet die lernende Person anhand der Angaben, ob Entladen oder Laden beschrieben wird, und erläutert die chemische und energetische Richtung. Sie beurteilt eine veränderte Alltagsbehauptung zu Batterie oder Akku mit Bezug auf Zelltyp, Nutzbarkeit und Voraussetzungen des reversiblen Betriebs.',
            'transferExpectationEn': 'For a new suitable device or cell description, the learner uses the supplied information to decide whether discharge or charge is being described and explains the chemical and energy-flow directions. They assess a changed everyday claim about a battery or rechargeable cell with reference to cell type, usability and the conditions for reversible operation.'
        },
        'rationale': 'KEEP: Die begriffene Reversibilität einer geeigneten elektrochemischen Zelle trägt sowohl den Vergleich als auch das fachliche Beurteilen der Alltagsformulierungen. Das ist ein zusammenhängendes Sek-I-AB2-Ziel mit identischer DE/EN-Begrenzung auf geeigneten reversiblen Betrieb. Der live amtliche LehrplanPLUS Bayern C9.6 nennt ausdrücklich das Ableiten der Umkehrbarkeit aus freiwilligen/erzwungenen Reaktionen und das Beurteilen leerer Batterien beziehungsweise geladener Akkus. Die aktuelle Beschreibung behauptet keine allgemeine Umkehrbarkeit beliebiger Redoxreaktionen oder Wiederaufladbarkeit sämtlicher Batterien. Die Voraussetzungen galvanische Elemente und Elektrolyse decken die beiden Vergleichsseiten. Die aktuelle Akku-Grafik zeigt passenden Energiefluss, konsistente Ladekabelpolung und die Einschränkung nicht jede Batterie ist wiederaufladbar; Alttext und Text bleiben kohärent. Eine thermodynamische Rechnung oder detaillierte kommerzielle Zellchemie ist für den hier angelegten qualitativen Vergleich nicht erforderlich. Das noch fehlende positive Evidenzprofil soll genau diesen Vergleich an einer veränderten geeigneten Zelle sichtbar machen.',
        'recommendation': 'create'
    },
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Eine geeignete Maßlösung bekannter Konzentration reagiert in einem durch die Reaktionsgleichung bestimmten Stoffmengenverhältnis mit der Probe. Das verbrauchte Volumen erlaubt damit die Probenkonzentration zu bestimmen. Der Indikator muss mit seinem Umschlagsbereich zum maßgeblichen Bereich der Titration passen; der beobachtete Umschlag ist eine Näherung an den Äquivalenzpunkt und kann Messabweichungen verursachen.',
            'essentialUnderstandingEn': 'A suitable standard solution of known concentration reacts with the sample in an amount ratio determined by the reaction equation. Its consumed volume therefore allows the sample concentration to be determined. The indicator transition range must fit the relevant region of the titration; the observed colour change approximates the equivalence point and can introduce measurement deviations.',
            'observablePerformanceDe': 'Die lernende Person legt Probe, Probenvolumen, geeignete Maßlösung, Apparatur und begründeten Indikator fest, führt die Titration mit Durchmischung und kontrollierter Zugabe nahe dem Umschlag durch und dokumentiert Anfangs- und Endvolumen. Sie ermittelt den Verbrauch, verwendet die Reaktionsstöchiometrie zur Konzentrationsberechnung und begründet die Plausibilität des Ergebnisses sowie den Einfluss eines erkennbaren Endpunkt- oder Volumenfehlers.',
            'observablePerformanceEn': 'The learner specifies the sample, sample volume, suitable standard solution, apparatus and justified indicator, carries out the titration with mixing and controlled addition near the endpoint, and records the initial and final volumes. They determine the consumed volume, use the reaction stoichiometry to calculate the concentration and justify the plausibility of the result and the effect of an identifiable endpoint or volume error.',
            'transferExpectationDe': 'Bei geändertem Probenvolumen, anderer Maßlösungskonzentration oder einem geeigneten anderen Säure-Base-Reaktionsverhältnis passt die lernende Person den Plan und die Auswertung an. Für vorgegebene passende pH-Verläufe und Indikatorbereiche begründet sie die Auswahl und erklärt, wie ein zu spät erkannter Umschlag die berechnete Probenkonzentration beeinflusst.',
            'transferExpectationEn': 'When the sample volume, standard-solution concentration or a suitable acid-base reaction ratio changes, the learner adapts the plan and analysis. Given suitable pH trajectories and indicator ranges, they justify the selection and explain how recognizing the endpoint too late affects the calculated sample concentration.'
        },
        'rationale': 'KEEP: Planung, Durchführung und stöchiometrische Auswertung gehören zu derselben quantitativen Titrationskompetenz; die Beschreibung macht die Konzentrationsbestimmung jetzt ausdrücklich prüfbar. DE/EN sind deckungsgleich. Hessen E.2 S.35 verlangt HCl/NaOH-Titration mit Umschlagspunkt und Berechnung der Probenkonzentration; die erhaltene 2025- und live 2026-Fassung haben dieselbe relevante Klausel. Das zukünftige Zuordnen dieser vollständigen Klausel zu026 ist gegenüber der früheren Verteilung auf bloße Lösungskonzentration und Kurvendeutung sachlich passend. LehrplanPLUS Bayern C13.3 grundlegend bestätigt quantitative Titrationsplanung/-durchführung/-dokumentation; Kurveninterpretation und charakteristische Punkte stehen daneben als eigene Kompetenz und werden hier nicht vollständig mitgeprüft. Bremens erhaltene amtliche Fassung 2022, S.23, führt Konzentrationsbestimmung bei pH-Titrationen im grundlegenden Abschnitt; der amtliche Live-Link ist derzeit404, weshalb kein aktueller Live-Byte-Nachweis behauptet wird. Die direkte Voraussetzung zu Stoffmenge/Konzentration/starkem pH genügt bei geeigneten Beispielen; Apparatur, Volumenaufnahme und Umschlagsbild sind konsistent. Endpunkt/Äquivalenzpunkt und Reaktionsverhältnis müssen im positiven Profil erläutert werden; eine neue Beschreibung ist nicht erforderlich.',
        'recommendation': 'create'
    },
    {
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Bei einer einfachen geeigneten Metall-Nichtmetall-Reaktion sind Oxidation und Reduktion gekoppelte Veränderungen der beteiligten Stoffe beziehungsweise Teilchen. Im beibehaltenen Magnesium-Sauerstoff-Beispiel erklärt die Elektronenabgabe des Metalls und Elektronenaufnahme des Nichtmetalls die Ionenbildung und das gemeinsame Reaktionsprodukt.',
            'essentialUnderstandingEn': 'In a simple suitable metal-non-metal reaction, oxidation and reduction are coupled changes in the participating substances or particles. In the retained magnesium-oxygen example, electron loss by the metal and electron gain by the non-metal explain ion formation and the joint reaction product.',
            'observablePerformanceDe': 'Die lernende Person deutet das unveränderte einfache Reaktionsbeispiel, ordnet die gekoppelten Oxidations- und Reduktionsvorgänge den beteiligten Teilchen zu und verbindet die Stoffbeobachtung mit dem vorgegebenen Teilchenmodell. Die auf der Seite erhaltene Anschlusskompetenz zu Redoxgleichungen mit Oxidationszahlen bleibt ein gesondertes Ziel.',
            'observablePerformanceEn': 'The learner interprets the unchanged simple reaction example, assigns the coupled oxidation and reduction processes to the participating particles and connects the substance observation with the supplied particle model. The retained successor competence for redox equations using oxidation numbers remains a separate goal.',
            'transferExpectationDe': 'In einer anderen einfachen, ausreichend beschriebenen Metall-Nichtmetall-Reaktion oder einer geänderten Darstellung erläutert die lernende Person dieselbe Kopplung der Vorgänge aus den gegebenen Stoff- und Teilcheninformationen. Die entfernte Rückreferenz zur E-Phasen-Redoxreihe verändert diesen Sek-I-Verständniskern nicht.',
            'transferExpectationEn': 'In another simple metal-non-metal reaction described in sufficient detail, or in a changed representation, the learner explains the same coupling of processes using the supplied substance and particle information. Removing the reverse reference to the E-phase redox series does not change this lower-secondary understanding core.'
        },
        'rationale': 'KEEP nur für die beauftragte aktuelle Kontextbindung: Eigenständig berechneter Vergleich der rohen Vorher-/Nachher-Objekte zeigt identischen ganzen Zieltext in DE/EN, identischen direkten kanonischen Kontext, identische Quellenprovenienz und Bildverknüpfungen. Im bisherigen Ein-Ziel-Buchumfang ändern sich ausschließlich externalReverseRequires und der dadurch abgeleitete Seitenfingerabdruck: Der Rückverweis auf16 entfällt,221 bleibt. Das jetzige Sechs-Ziel-Buch besitzt den separat gebundenen aktuellen Seitenfingerabdruck dieses Records. Fachlich ist das Entfernen stimmig, weil16 jetzt direkt04 voraussetzt und dort das benötigte Elektronen-Donator-/Akzeptor-Verständnis ausdrücklich angelegt ist. Das vorhandene Sek-I-Ziel und sein Weg von Reaktionsdeutung zu Redoxgleichungen bleiben intakt. Die aktuell tatsächlich betrachtete Mg/O2-Seite zeigt unveränderte korrekte Gleichungen und Ionenbildung. Dieser Record formuliert den bestehenden positiven Kern für die aktuelle Seite und bestätigt die gezielte Bindung; er ist kein neuer vollständiger historischer Whole-goal-Review und ändert keine erhaltene wissenschaftliche Autorität oder Evidenzprofile. Das außerhalb des Batches bestehende Whole-goal-Evidenzprofil wird deshalb nicht zur Neuanlage vorgeschlagen.',
        'recommendation': 'none'
    }
]

records = []
for row, review in zip(batch, reviews, strict=True):
    g = row['goal']
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f"{run_id}.{g['goalId']}",
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': row['bundleFingerprint'],
        'bookDigest': row['bookDigest'],
        **{key: g[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': review['understandingEvidence'],
        'rationale': review['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': review['recommendation'],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate'
    }
    records.append(record)

results = ROUND / 'results'
results.mkdir(exist_ok=True)
record_path = results / f'{batch_id}.records.jsonl'
run_path = results / f'{batch_id}.run.json'
assert not record_path.exists(), 'Refuse to overwrite any existing reviewer record'
assert not run_path.exists(), 'Refuse to overwrite any existing reviewer run'
record_bytes = ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records).encode()
record_path.write_bytes(record_bytes)
(OWN / 'description-review.records.jsonl').write_bytes(record_bytes)
parameters = {
    'workflow': 'independent Codex subject review with actual local primary-source reads, official network fetches and six individual PDF image views',
    'samplingParameters': 'not exposed by the agent runtime; no numeric temperature or seed asserted',
    'scope': 'five full current D decisions plus one targeted existing context-binding decision',
    'peerBlind': True
}
parameter_bytes = (json.dumps(parameters, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()
(OWN / 'generation-parameters.json').write_bytes(parameter_bytes)
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch_id,
    'batchInputFingerprint': campaign['batches'][0]['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': 'GPT-6 Codex; runtime does not expose a more specific model version',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(parameter_bytes).hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': campaign['batches'][0]['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': campaign['batches'][0]['batchInputFingerprint']}],
    'startedAt': '2026-10-05T12:23:07Z',
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': 'sha256:' + hashlib.sha256(record_bytes).hexdigest(),
    'toolchainVersion': 'skillpilot-native-description-review-v2'
}
run_bytes = (json.dumps(run, ensure_ascii=False, indent=2) + '\n').encode()
run_path.write_bytes(run_bytes)
(OWN / 'description-review.run.json').write_bytes(run_bytes)
print(json.dumps({'recordCount': len(records), 'decisions': [r['decision'] for r in records], 'recordPath': str(record_path.relative_to(ROOT)), 'recordsSHA256': run['outputDigest'], 'runSHA256': 'sha256:' + hashlib.sha256(run_bytes).hexdigest()}, ensure_ascii=False))
