#!/usr/bin/env python3
"""Materialize local B007 author drafts; this does not write active curriculum."""
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
from fractions import Fraction

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent
ROOT = Path(__file__).resolve().parents[8]
INPUTS = [PARENT / 'three-current-goals-and-source-inputs.actual.json',
          PARENT / 'seven-routines.de-en.author-candidate.json']
proposals = json.loads(INPUTS[1].read_text())
prototypes = {p['localKey']: p for p in proposals['prototypes']}
cases = []

def bi(de, en):
    return {'de': de, 'en': en}

def add(key, local, title, material, task, answer, criteria, transfer, limits, calculations=None, simulator=None):
    p = prototypes[key]
    item = {
        'caseLocalKey': local, 'routineLocalKey': key,
        'candidateGoalId': p['id'], 'currentOriginGoalId': p['splitFromCurrentGoalId'],
        'title': title,
        'recordStatus': 'ai_candidate', 'validationStatus': 'needs_human_review',
        'evidenceLevel': 'E1', 'generalizationLevel': 'G1',
        'syntheticMaterial': True, 'actualLearnerPerformanceRecorded': False,
        'humanApproval': False, 'humanTrial': False,
        'nativeProfileBound': False, 'independentReviewStatus': 'pending',
        'candidateSourceGoalIds': p['candidatePrimarySourceGoalIds'],
        'sourceClearance': 'candidate source references only; no nationwide exact-coverage approval',
        'essentialUnderstanding': bi(
            p['positiveUnderstandingAuthorCandidate']['essentialUnderstandingDe'],
            p['positiveUnderstandingAuthorCandidate']['essentialUnderstandingEn']),
        'material': material, 'learnerTask': task,
        'expectedResponseOrSolution': answer,
        'assessmentCriteria': [
            {'criterionLocalKey': f'{local}-criterion-{n+1}', 'required': True,
             'text': bi(de, en), 'binding': 'same routine essential understanding'}
            for n, (de, en) in enumerate(criteria)],
        'transferOrCountercase': transfer,
        'materialAndSourceLimitations': limits,
    }
    if calculations is not None:
        item['calculationAudit'] = calculations
    if simulator is not None:
        item['boundSimulatorSpecification'] = simulator
    cases.append(item)

add('label', 'label-same-exclamation-different-warning',
    bi('Gleiches Piktogramm, verschiedene Warnungen', 'Same pictogram, different warnings'),
    bi([
        'Zwei fiktive Unterrichtsetiketten, keine vollständigen Produktetiketten: A zeigt das rote Rauten-Piktogramm mit Ausrufezeichen und H315. B zeigt dieselbe Raute mit Ausrufezeichen und H319.',
        'Bereitgestellte Nachschlagetabelle: H315 = reizt die Haut; H319 = verursacht starke Augenreizung. Die Stoffe werden nicht ausgegeben und nicht verwendet.',
        'Auf einem dritten Etikettenauszug C ist das Ausrufezeichen sichtbar; der Warnhinweis ist verdeckt. Es liegen keine weiteren Angaben zu C vor.'
    ], [
        'Two fictional teaching labels, not complete product labels: A shows the red-diamond exclamation-mark pictogram with H315. B shows the same exclamation-mark diamond with H319.',
        'Supplied lookup table: H315 = causes skin irritation; H319 = causes serious eye irritation. No substances are supplied or used.',
        'A third label excerpt C shows the exclamation mark but its hazard statement is covered. No other details about C are provided.'
    ]),
    bi('Deute A und B mithilfe der Tabelle. Begründe, warum das gleiche Piktogramm keine identische konkrete Gefahr beweist. Welche Angabe musst du für C aus der bereitgestellten vollständigen Stoffinformation anfordern?',
       'Interpret A and B using the table. Explain why the same pictogram does not establish the same specific hazard. Which detail must you request for C from the supplied complete substance information?'),
    bi('A warnt vor Hautreizung, B vor starker Augenreizung. Das Piktogramm allein unterscheidet diese konkreten Warnungen nicht. Für C benötige ich den zugehörigen Warnhinweis beziehungsweise seinen H-Code und die eindeutige Zuordnung zur Stoffinformation; aus dem Ausrufezeichen allein entscheide ich nicht zwischen Haut und Augen.',
       'A warns of skin irritation; B warns of serious eye irritation. The pictogram alone does not distinguish these specific warnings. For C I need the associated hazard statement or H-code and its unambiguous substance-information entry; the exclamation mark alone does not decide between skin and eye hazards.'),
    [
        ('A und B werden anhand ihrer unterschiedlichen Hinweise richtig gedeutet.', 'A and B are correctly interpreted from their different statements.'),
        ('Die Antwort verknüpft Symbol und konkreten Hinweis, statt alle Ausrufezeichen gleichzusetzen.', 'The answer connects symbol and specific statement rather than treating all exclamation marks identically.'),
        ('Bei C wird der fehlende Warnhinweis gezielt angefordert; eine konkrete Gefahr wird nicht erfunden.', 'For C the missing hazard statement is requested; a specific hazard is not invented.')
    ],
    bi({'task': 'Neues Etikett D: Ausrufezeichen und H335. Nachschlageeintrag: Kann die Atemwege reizen. Deute D und vergleiche es mit B.',
        'expected': 'D betrifft die Atemwege, B die Augen. Das gemeinsame Symbol erlaubt nicht, D nur als Augenwarnung zu lesen.'},
       {'task': 'New label D: exclamation mark and H335. Lookup entry: may cause respiratory irritation. Interpret D and compare it with B.',
        'expected': 'D concerns the respiratory tract, B the eyes. Their shared symbol does not make D an eye-only warning.'}),
    bi('Nur die vorgelegten Kennzeichnungsausschnitte werden geprüft. Kein vollständiger CLP-Klassifizierungsentscheid, kein Umgang und keine Entsorgung; das Material behauptet keine echte Produkteinstufung.',
       'Assessment covers only supplied label excerpts. It is not a complete CLP classification, handling or disposal decision, and claims no actual product classification.'))

add('label', 'label-flame-and-bounded-lookup',
    bi('Flamme und gezieltes Nachschlagen', 'Flame and targeted lookup'),
    bi([
        'Fiktive Unterrichtsetiketten: L zeigt Flamme und H225; F zeigt Flamme und H228. In einem dritten Auszug M stehen Flamme und H226; dessen Klartext fehlt.',
        'Bereitgestellte Tabelle: H225 = Flüssigkeit und Dampf sind leicht entzündbar; H228 = entzündbarer Feststoff; H226 = Flüssigkeit und Dampf sind entzündbar.',
        'Diese Auszüge enthalten keine Angaben zur Entsorgung oder vollständigen Arbeitsfreigabe. Es wird keine reale Tätigkeit durchgeführt.'
    ], [
        'Fictional teaching labels: L shows flame and H225; F shows flame and H228. A third excerpt M shows flame and H226 but omits its statement text.',
        'Supplied table: H225 = highly flammable liquid and vapour; H228 = flammable solid; H226 = flammable liquid and vapour.',
        'These excerpts provide no disposal information or complete permission to work. No real activity is performed.'
    ]),
    bi('Deute L und F und ergänze für M den fehlenden Klartext aus der Tabelle. Begründe an L und F, welche konkreten Informationen erst der Warnhinweis liefert. Beurteile die Behauptung: „Die Flamme beweist, dass jeder dieser Stoffe ein flüssiger Alkohol ist.“',
       'Interpret L and F and look up the missing statement for M. Use L and F to explain which specifics come from the statement. Assess the claim: “The flame proves that each substance is a liquid alcohol.”'),
    bi('L warnt vor einer leicht entzündbaren Flüssigkeit und ihrem Dampf; F vor einem entzündbaren Feststoff. Für M lautet der Tabelleneintrag: Flüssigkeit und Dampf sind entzündbar. Die Flamme kennzeichnet die Brennbarkeitsgefahr in diesen Auszügen; weder genaue Stoffidentität noch gleicher Aggregatzustand ergeben sich allein daraus. Die Alkoholbehauptung ist unbegründet.',
       'L warns of a highly flammable liquid and its vapour; F of a flammable solid. The table supplies “flammable liquid and vapour” for M. The flame denotes the flammability hazard in these excerpts; exact identity and matching physical state do not follow from it alone. The alcohol claim is unsupported.'),
    [
        ('Die unterschiedlichen Angaben zu Flüssigkeit/Dampf und Feststoff werden richtig zugeordnet.', 'Liquid/vapour and solid statements are assigned correctly.'),
        ('M wird aus der konkret bereitgestellten Tabelle ergänzt.', 'M is completed from the specific supplied table.'),
        ('Die Stoffidentität wird nicht aus dem Piktogramm abgeleitet.', 'Substance identity is not inferred from the pictogram.')
    ],
    bi({'task': 'Ein weiterer Flammen-Auszug hat keinen lesbaren H-Code. Darfst du ihn mit H225 ergänzen, weil L dasselbe Symbol trägt?',
        'expected': 'Nein. Ich benötige den zum neuen Stoff gehörenden Warnhinweis; gleiche Symbole rechtfertigen keine Übernahme.'},
       {'task': 'Another flame excerpt has no readable H-code. May you fill it with H225 because L has the same symbol?',
        'expected': 'No. I need that substance’s own statement; matching symbols do not justify copying the statement.'}),
    bi('Das Nachschlagen bleibt auf die mitgelieferte Tabelle begrenzt. GHS-Feinheiten außerhalb dieser Auszüge, Feuerbekämpfung und vollständige Risikobeurteilung werden nicht geprüft.',
       'Lookup is limited to the supplied table. GHS details beyond these excerpts, firefighting and full risk assessment are not assessed.'))

add('handling', 'handling-eye-splash-task',
    bi('Schutz vor Spritzkontakt begründen', 'Justify protection against splashes'),
    bi([
        'Papierfall: 5 mL einer fiktiven Prüflösung Q werden mit einem bereits freigegebenen Tropfgerät in ein standsicheres Gefäß übertragen. Q kann bei Spritzkontakt starke Augenreizung verursachen; Hautkontakt soll vermieden werden. Q ist unter den angegebenen Bedingungen nicht flüchtig. Es wird nichts praktisch durchgeführt.',
        'Örtliche Arbeitsanweisung Q-1 für genau diese Tätigkeit: dicht sitzende Schutzbrille und Laborkittel; von der Lehrkraft für Q benannte geeignete Handschuhe; Gefäß in einer Auffangschale; Tropfgerät nie auf Gesichtshöhe; Aufsicht vor Beginn. Bei Kontakt oder Verschütten stoppen und Lehrkraft informieren. Ein Wechsel der Tätigkeit benötigt neue Freigabe.',
        'Zur Wahl stehen: (a) Q-1 vollständig umsetzen; (b) nur Kittel, weil die Menge klein ist; (c) statt Brille eine beliebige Staubmaske. Die Handschuhauswahl ist vorgegeben, nicht selbst zu erraten.'
    ], [
        'Paper scenario: 5 mL of fictional test solution Q is transferred with an already permitted dropper into a stable vessel. Splash contact can cause serious eye irritation; skin contact is to be avoided. Q is nonvolatile under the stated conditions. No practical activity is performed.',
        'Local instruction Q-1 for this exact activity: close-fitting safety goggles and lab coat; suitable gloves specified for Q by the teacher; vessel in a spill tray; never hold the dropper at face level; supervision before starting. Stop and notify the teacher after contact or a spill. Changed activities need fresh permission.',
        'Options: (a) implement Q-1 fully; (b) coat only because the quantity is small; (c) use any dust mask in place of goggles. Glove selection is supplied rather than guessed.'
    ]),
    bi('Wähle eine Option und begründe die Maßnahmen mit Kontaktweg und Tätigkeit. Erkläre, warum die kleine Menge und eine Staubmaske die Schutzbrille nicht ersetzen. Entscheide nicht über Entsorgung.',
       'Choose an option and justify its precautions using the exposure route and activity. Explain why the small quantity and a dust mask do not replace goggles. Do not decide a waste route.'),
    bi('Ich wähle (a). Beim Tropfen können Spritzer das Auge treffen, daher die Schutzbrille. Kittel und die vorgeschriebenen Handschuhe begrenzen den möglichen Hautkontakt. Auffangschale, standsicheres Gefäß und niedrige Arbeitshöhe verringern Verschütten und Spritzkontakt. Eine kleine Menge kann trotzdem das Auge treffen. Eine Staubmaske schützt das Auge nicht. Die vorgegebene Tätigkeit beginnt nur mit Aufsicht.',
       'I choose (a). Dropping can splash into the eye, so goggles are needed. The coat and specified gloves limit potential skin contact. A spill tray, stable vessel and low working height reduce spilling and splash contact. Even a small quantity can reach the eye. A dust mask does not protect the eyes. This specified activity starts only with supervision.'),
    [
        ('Option (a) wird mit dem Spritzweg ins Auge begründet.', 'Option (a) is justified through the splash route to the eye.'),
        ('Mindestens eine weitere Q-1-Maßnahme wird mit einem konkreten Kontakt- oder Verschüttrisiko verbunden.', 'At least one further Q-1 precaution is linked to a specific contact or spill risk.'),
        ('Weder geringe Menge noch eine ungeeignete Ersatzmaßnahme rechtfertigen Weglassen der Brille.', 'Neither a small amount nor an unsuitable substitute justifies omitting goggles.')
    ],
    bi({'task': 'Geänderte Tätigkeit: Q soll mit einer Sprühdüse vernebelt werden. Q-1 beschreibt ausschließlich Tropfen. Reicht Q-1 als Erlaubnis?',
        'expected': 'Nein. Vernebeln schafft zusätzlich einen möglichen Einatemweg. Ich stoppe die Planung und lasse die neue Tätigkeit und passende Schutzmaßnahmen durch die Lehrkraft freigeben.'},
       {'task': 'Changed activity: Q is to be sprayed as a mist. Q-1 covers dropping only. Does Q-1 permit spraying?',
        'expected': 'No. Misting adds potential inhalation exposure. I stop the plan and ask the teacher to authorize the changed activity and its appropriate precautions.'}),
    bi('Fiktive vollständige Fallinformationen und örtliche Übungsanweisung; keine universelle Handschuh-, Masken- oder Abzugsregel und keine reale Freigabe.',
       'Fictional complete scenario data and local exercise instruction; no universal glove, mask or fume-hood rule and no actual work permission.'))

add('handling', 'handling-dust-versus-closed-vessel',
    bi('Kontaktweg bei derselben Substanz unterscheiden', 'Distinguish exposure routes for one substance'),
    bi([
        'Papierfall R: Ein fiktives Pulver reizt bei Einatmen den Atemtrakt; die Freigabeinformationen nennen außerdem zu vermeidenden Augen- und Hautkontakt.',
        'Tätigkeit 1: ein dicht verschlossenes, unbeschädigtes Probengefäß aufrecht in einer Transportwanne versetzen. Örtliche Anweisung R-T: Brille und Kittel; Gefäß geschlossen halten; unbeschädigten Verschluss prüfen; Aufsicht. Kein Öffnen beim Transport.',
        'Tätigkeit 2: eine kleine Portion offen abwiegen. Örtliche Anweisung R-W: ausschließlich an der geprüften Absaugstation unter Aufsicht; Brille, Kittel und die für R vorgegebenen Handschuhe; langsam portionieren, Staubaufwirbeln vermeiden; keine improvisierte Atemschutzmaske als Ersatz. Die Absaugstation ist heute gesperrt.'
    ], [
        'Paper scenario R: a fictional powder irritates the respiratory tract if inhaled; supplied safety data also require avoiding eye and skin contact.',
        'Activity 1: move an intact tightly closed sample vessel upright in a transport tray. Local R-T instruction: goggles and coat; keep it closed; inspect the intact closure; supervision. Do not open during transport.',
        'Activity 2: openly weigh a small portion. Local R-W instruction: only at the checked extraction station under supervision; goggles, coat and specified gloves for R; portion slowly and avoid raising dust; no improvised respirator as a substitute. The extraction station is unavailable today.'
    ]),
    bi('Begründe für beide Tätigkeiten die vorgegebene Schutzentscheidung. Was darf unter diesen Fallbedingungen stattfinden, und welcher Arbeitsschritt muss warten? Erkläre den Unterschied mit dem Einatemweg.',
       'Justify the specified precaution decision for both activities. What may proceed under these conditions, and which step must wait? Explain the difference using inhalation exposure.'),
    bi('Der beaufsichtigte Transport kann nach R-T mit geprüftem dichtem Verschluss, Wanne, Brille und Kittel stattfinden; das Gefäß wird nicht geöffnet. Beim offenen Abwiegen kann Staub in die Atemluft gelangen. Weil R-W die geprüfte Absaugstation verlangt und diese fehlt, wird nicht abgewogen. Eine improvisierte Maske oder die kleine Menge hebt die örtliche Vorgabe nicht auf. Der verschlossene Transport rechtfertigt keine Freigabe zum Öffnen.',
       'Supervised transport may proceed under R-T with its checked tight closure, tray, goggles and coat; the vessel stays closed. Open weighing can release inhalable dust. R-W requires the checked extraction station, so unavailable extraction means no weighing. An improvised mask or small quantity does not override the local instruction. Closed transport does not authorize opening.'),
    [
        ('Geschlossener Transport und offenes Abwiegen werden anhand der unterschiedlichen Exposition getrennt.', 'Closed transport and open weighing are distinguished through their different exposures.'),
        ('Die vorgeschriebenen Schutzmaßnahmen werden tätigkeitsbezogen begründet.', 'Specified precautions are justified for the particular activity.'),
        ('Offenes Abwiegen bleibt bei fehlender vorgeschriebener Absaugung ausgesetzt.', 'Open weighing is withheld when its required extraction is unavailable.')
    ],
    bi({'task': 'Beim Transport wird ein lockerer Verschluss bemerkt. Ist die zuvor begründete Transportentscheidung noch gültig?',
        'expected': 'Nein. Die Bedingung „dicht und unbeschädigt“ fehlt. Ich setze den Transport aus und informiere die Lehrkraft; ich öffne oder repariere das Gefäß nicht eigenständig.'},
       {'task': 'A loose closure is noticed during transport. Is the previous transport decision still valid?',
        'expected': 'No. The “tight and intact” condition is absent. I suspend transport and notify the teacher; I do not independently open or repair the vessel.'}),
    bi('Die Schutzentscheidung folgt den ausdrücklich gelieferten R-T/R-W-Regeln. Reale Gefahrstoffbeurteilung und geeignete persönliche Schutzausrüstung bleiben Aufgabe der örtlichen Verantwortlichen.',
       'The decision follows the explicitly supplied R-T/R-W rules. Actual risk assessment and PPE suitability remain the responsibility of local supervisors.'))

add('disposal', 'disposal-identified-local-streams',
    bi('Bekannte Reste nach örtlichen Regeln zuordnen', 'Assign identified residues under local rules'),
    bi([
        'Nur für diesen Papierfall gilt die örtliche Sammelanweisung W-1: W-A nimmt ausschließlich wässrige Kochsalz- oder Zuckerlösungen ohne weitere Zusätze auf; W-B nimmt eindeutig identifizierte wässrige Reste mit Kupferverbindungen auf; W-C nimmt eindeutig identifizierte ethanolhaltige Ethanol-Wasser-Reste ohne Metallzusätze auf. Unbekannte oder gemischte Zusammensetzungen: geschlossen getrennt bereitstellen und die Lehrkraft entscheiden lassen. Keine dieser Kategorien erlaubt Ausgussentsorgung oder Zusammenmischen verschiedener Sammelströme.',
        'Rest A: 15 mL Kochsalzlösung in Wasser, dokumentiert ohne weitere Zusätze. Rest B: 10 mL wässriger Rest aus dem Kupfer-Versuch, Kupferverbindung dokumentiert, kein organisches Lösungsmittel. Rest C: 8 mL ethanolreicher Ethanol-Wasser-Rest, dokumentiert ohne Metallzusätze. Die Gefäße sind identifiziert; tatsächliches Umfüllen übernimmt die Lehrkraft.'
    ], [
        'For this paper scenario only, local W-1 collection rules apply: W-A accepts only aqueous table-salt or sugar solutions without other additives; W-B accepts identified aqueous residues containing copper compounds; W-C accepts identified ethanol-containing ethanol-water residues without metal additives. Unknown or mixed compositions are kept closed and separate for the teacher’s decision. None of these categories permits drain disposal or mixing collection streams.',
        'Residue A: 15 mL table-salt solution in water, documented without other additives. B: 10 mL aqueous residue from the copper experiment, copper compound documented and no organic solvent. C: 8 mL ethanol-rich ethanol-water residue, documented without metal additives. Vessels are identified; the teacher performs any actual transfer.'
    ]),
    bi('Ordne A, B und C den vorgesehenen Sammelwegen zu. Nenne für jeden Rest die entscheidende Materialangabe und Regel. Widerlege „A ist klar, also darf es in den Ausguss“ anhand von W-1.',
       'Assign A, B and C to their specified streams. Name the decisive material detail and rule for each. Use W-1 to refute “A is clear, so it can go down the drain.”'),
    bi('A gehört zu W-A, weil nur Kochsalz und Wasser dokumentiert sind. B gehört wegen der Kupferverbindung in der wässrigen Zusammensetzung zu W-B. C gehört wegen des identifizierten ethanolhaltigen Ethanol-Wasser-Rests ohne Metalle zu W-C. Klarheit ist kein Freigabekriterium; W-1 gibt keine Ausgussentsorgung frei. Die verschiedenen Reste werden nicht zusammengeschüttet.',
       'A belongs in W-A because only table salt and water are documented. B belongs in W-B because the aqueous residue contains a copper compound. C belongs in W-C because it is an identified ethanol-containing ethanol-water residue without metals. Clarity is not a permission criterion; W-1 permits no drain disposal. The different residues are not combined.'),
    [
        ('Alle drei Wege werden mit dokumentierter Zusammensetzung und der jeweils passenden W-1-Regel begründet.', 'All three routes are justified using documented composition and the corresponding W-1 rule.'),
        ('Das Aussehen wird nicht als Entsorgungserlaubnis behandelt.', 'Appearance is not treated as disposal permission.'),
        ('Es werden weder Ausgussentsorgung noch eigenständiges Zusammenmischen vorgeschlagen.', 'Neither drain disposal nor independent combining is proposed.')
    ],
    bi({'task': 'A wurde später zum Spülen eines Gefäßes mit Kupferrest verwendet. Die Zusatzmenge ist bekannt als Kupferverbindung; kein Ethanol kam hinzu. Welcher Weg gilt nach W-1?',
        'expected': 'W-B. Die nun dokumentierte Kupferverunreinigung verändert die Zusammensetzung und damit die einschlägige Regel, auch wenn der Rest weiterhin klar erscheint.'},
       {'task': 'A was later used to rinse a vessel containing copper residue. The added material is identified as a copper compound; no ethanol was added. Which W-1 route applies?',
        'expected': 'W-B. Documented copper contamination changes composition and the applicable rule even if the residue still looks clear.'}),
    bi('W-1 ist eine synthetische lokale Unterrichtsregel, keine übertragbare deutsche Entsorgungstabelle. Auswahlkompetenz wird geprüft; realer Transport und reale Abfallbehandlung werden nicht freigegeben.',
       'W-1 is a synthetic local teaching rule, not a transferable German waste table. Route selection is assessed; actual transport and waste treatment are not authorized.'))

add('disposal', 'disposal-missing-identity-hold',
    bi('Bei fehlender Zusammensetzung offenlassen', 'Withhold routing when composition is missing'),
    bi([
        'Örtliche Papierfall-Regel W-2: S-1 nimmt eindeutig identifizierte wässrige Salz- oder Zuckerlösungen ohne sonstige Bestandteile; S-2 nimmt identifizierte wässrige Kupferreste; U bedeutet kein Sammelweg entschieden: Gefäß geschlossen, getrennt und standsicher belassen, Zuordnung durch Lehrkraft. S-1/S-2 dürfen nicht vermischt werden; eine Ausgussfreigabe ist nicht enthalten.',
        'Gefäß X: 20 mL klare Flüssigkeit, Etikett „Versuchsrest“, Versuchszuteilung verloren. Gefäß Y: 20 mL klare Zuckerlösung, Chargenprotokoll nennt ausschließlich Zucker und Wasser. Nur Y hat einen vollständigen Zusammensetzungsnachweis. Geruchstests, Probieren und Reaktionen zur Identifikation sind ausgeschlossen.'
    ], [
        'Local paper-scenario W-2 rules: S-1 accepts identified aqueous salt or sugar solutions without other constituents; S-2 accepts identified aqueous copper residues; U means no collection route decided: keep the vessel closed, separate and stable for the teacher to identify the route. S-1/S-2 must not be combined; no drain permission is included.',
        'Vessel X: 20 mL clear liquid labelled “experiment residue”, with its experiment assignment lost. Y: 20 mL clear sugar solution; its batch record lists sugar and water only. Only Y has a complete composition record. Smelling, tasting and identification reactions are excluded.'
    ]),
    bi('Entscheide nach W-2 für X und Y. Fordere für X genau die Informationen an, die eine Zuordnung ermöglichen, und erkläre, warum gleiches Aussehen keine gleiche Zuordnung begründet.',
       'Decide under W-2 for X and Y. Request the specific information needed to route X, and explain why matching appearance does not establish matching routes.'),
    bi('Y ist nach S-1 zuzuordnen, weil Zucker und Wasser ohne Zusätze nachgewiesen sind. Für X bleibt die Entscheidung U: geschlossen und getrennt bei der Lehrkraft belassen. Ich benötige Versuchszuteilung oder ein verlässliches Stoff-/Chargenprotokoll mit allen Bestandteilen und Verunreinigungen sowie die Bestätigung, dass eine W-2-Kategorie passt. Klarheit sagt nichts Verlässliches über diese Zusammensetzung.',
       'Y is assigned to S-1 because sugar and water without additives are documented. X remains at U: closed and separate for the teacher. I need an experiment assignment or reliable substance/batch record covering all constituents and contamination, plus confirmation that a W-2 category applies. Clarity does not reliably identify that composition.'),
    [
        ('Y wird nach der belegten Zusammensetzung S-1 zugeordnet.', 'Y is assigned to S-1 using its documented composition.'),
        ('X bleibt ohne erratenen oder allgemeinen Entsorgungsweg.', 'X is left without a guessed or generic disposal route.'),
        ('Die Informationsanforderung betrifft Identität/Zusammensetzung/Verunreinigung und die lokale Kategorie.', 'Requested information covers identity/composition/contamination and the local category.')
    ],
    bi({'task': 'Ein zuverlässiges Protokoll identifiziert X als wässrigen Kupferrest ohne weitere Zusätze. Aktualisiere ausschließlich diese Zuordnung.',
        'expected': 'X kann nun nach S-2 zugeordnet werden. Die neue verlässliche Zusammensetzungsangabe ermöglicht die Entscheidung; die Klarheit war dafür nicht ausschlaggebend.'},
       {'task': 'A reliable record identifies X as aqueous copper residue without other additives. Update only that assignment.',
        'expected': 'X can now be assigned to S-2. Newly reliable composition data enable the decision; clarity was not the deciding factor.'}),
    bi('Keine reale unbekannte Probe wird untersucht; fehlende Informationen sind absichtlich Teil des Papierfalls. U ist Zurückstellung und kein Stoff-Sammelbehälter.',
       'No actual unknown sample is investigated; missing information is deliberate in the paper scenario. U means withholding a decision, not a substance collection container.'))

add('preparation', 'preparation-salt-water-performed-log',
    bi('Kochsalzlösung mit Durchführung und Protokoll', 'Prepare salt solution with execution and a log'),
    bi([
        'Ausschließlich beaufsichtigter Unterricht oder der unten beschriebene Handlungssimulator: Lehrkraft gibt Kochsalz, Wasser, ein sauberes Becherglas, sauberen Rührstab und eine Waage frei. Brille und Kittel nach örtlicher Anweisung; nichts probieren; keine Stoffsubstitution, kein Erhitzen. Material: 2,0 g Kochsalz und 48,0 g Wasser bei Raumtemperatur, ausreichende Löslichkeit unter diesen bereitgestellten Bedingungen.',
        'Arbeitsanweisung P-1: Aufsicht/Materialfreigabe prüfen; trockenes Becherglas auf Waage tarieren; 48,0 g Wasser einwiegen; 2,0 g Salz separat abwiegen und vollständig portionsweise zugeben; mit dem Rührstab rühren, bis keine Kristalle mehr zu sehen sind; mit Inhalt und Datum beschriften. Bei verbleibenden Kristallen oder verschüttetem Material stoppen und Lehrkraft fragen, keine Nachdosierung erraten.',
        'Protokollvorlage: Schrittfolge; angezeigte Wasser-/Salzmassen; keine sichtbaren Kristalle/keine getrennte Phase ja oder nein; Abweichungen; Beschriftung. Die Beobachtung wird von der Aufsicht oder Simulatorrückmeldung bestätigt. Das Protokoll enthält keine Personendaten.'
    ], [
        'Supervised classroom activity or the action simulator specified below only: the teacher permits table salt, water, a clean beaker, clean stirring rod and balance. Goggles and coat per local instruction; no tasting, substitutions or heating. Materials: 2.0 g salt and 48.0 g water at room temperature, with sufficient solubility under the supplied conditions.',
        'Instruction P-1: check supervision/material permission; tare the dry beaker on the balance; weigh in 48.0 g water; separately weigh 2.0 g salt and add all of it in portions; stir until no crystals remain visible; label with contents and date. Stop and ask the teacher after persistent crystals or spilling; do not guess replacement doses.',
        'Log template: step sequence; displayed water/salt masses; no visible crystals/no separate phase yes or no; deviations; label. The supervisor or simulator feedback confirms observations. The log contains no personal data.'
    ]),
    bi('Führe P-1 unter Aufsicht aus oder führe die Simulatoraktionen tatsächlich in der angegebenen Reihenfolge aus. Gib das ausgefüllte Ausführungsprotokoll ab. Eine geplante Schrittfolge oder die Aussage „Salz löst sich“ reicht ohne Durchführung beziehungsweise Simulatorlog nicht aus.',
       'Execute P-1 under supervision or actually issue the simulator actions in sequence. Submit the completed execution log. A planned sequence or “salt dissolves” without execution or a simulator log is insufficient.'),
    bi('Erwartetes erfolgreiches Protokoll: Freigabe geprüft; trockenes Gefäß tariert; 48,0 g Wasser angezeigt; separat 2,0 g Salz abgewogen und vollständig zugegeben; gerührt; Rückmeldung/Beobachtung: keine sichtbaren Kristalle, einheitliche Flüssigkeit ohne getrennte Phase; mit Kochsalzlösung und Datum beschriftet; keine Abweichung. Das ist eine hergestellte Lösung im begrenzten Fall, keine allgemeine Behauptung über beliebige Salz-/Lösungsmittelkombinationen.',
       'Expected successful log: permission checked; dry vessel tared; 48.0 g water displayed; 2.0 g salt weighed separately and added completely; stirred; feedback/observation: no visible crystals, uniform liquid without a separate phase; labelled salt solution and date; no deviation. This documents preparation in the bounded case, not a claim about arbitrary salt/solvent combinations.'),
    [
        ('Ein tatsächliches betreutes Ausführungsprotokoll oder vollständiger Simulatoraktionslog liegt vor; eine Erklärung allein genügt nicht.', 'There is an actual supervised execution log or complete simulator action log; an explanation alone does not suffice.'),
        ('Freigabe, Tarieren, getrenntes korrektes Abmessen, vollständige Zugabe und Rühren sind dokumentiert.', 'Permission, taring, separate correct measuring, complete addition and stirring are documented.'),
        ('Die bestätigte Endbeobachtung zeigt keine Kristalle/abgetrennte Phase; die Beschriftung stimmt mit dem Inhalt überein.', 'Confirmed final observation shows no crystals/separate phase; the label matches the contents.'),
        ('Abweichungen werden offen protokolliert und lösen Rückfrage statt eigenständiger Mengenänderung aus.', 'Deviations are recorded and lead to asking the supervisor rather than independently changing quantities.')
    ],
    bi({'task': 'Beim Hinzufügen fällt ein Teil des abgewogenen Salzes außerhalb des Gefäßes. Ist ein unverändertes Erfolgsprotokoll zulässig?',
        'expected': 'Nein. Die vollständige Zugabe ist nicht nachgewiesen. Abweichung protokollieren und nach P-1 stoppen/Lehrkraft fragen; keine frei erfundene Ersatzmenge zugeben.'},
       {'task': 'Some weighed salt falls outside the vessel during addition. Is an unchanged success log valid?',
        'expected': 'No. Complete addition is not established. Log the deviation and stop/ask the teacher under P-1; do not invent a replacement dose.'}),
    bi('Keine tatsächliche Lernendenleistung wird mit diesem Autorenmuster behauptet. Die praktische Variante benötigt örtliche Freigabe und Aufsicht; der gebundene Simulator ist ein hier spezifiziertes moderiertes Verfahren, keine vorhandene oder getestete App.',
       'This author example claims no actual learner performance. The practical variant needs local permission and supervision; the bound simulator is a facilitator-mediated procedure specified here, not an existing or tested app.'),
    simulator={
        'kind': 'facilitator-mediated deterministic action protocol; no existing app claimed',
        'actionVocabulary': ['check_permission', 'tare_empty_beaker', 'weigh_water_48g', 'weigh_salt_2g_separately', 'add_all_salt', 'stir', 'inspect', 'label_salt_solution_date'],
        'stateRules': bi([
            'Start: keine Mengen im Gefäß; Freigabe nicht geprüft. Der Moderator verarbeitet jede eingereichte Aktion einzeln und protokolliert Aktion und Rückmeldung.',
            'Nur check_permission → tare_empty_beaker → weigh_water_48g → weigh_salt_2g_separately → add_all_salt erzeugt den zulässigen Ansatz. Mengenrückmeldung: Wasser 48,0 g, Salz 2,0 g. Vor stir: sichtbare Salzkristalle.',
            'stir nach vollständiger Zugabe meldet keine sichtbaren Kristalle und eine einheitliche Phase; inspect gibt diese Beobachtung aus. label_salt_solution_date danach schließt ab. Falsche Reihenfolge, anderes Material oder Mengenverlust: STOP; keinen Erfolgslog ausgeben.'
        ], [
            'Start: no quantities in the vessel; permission unchecked. The facilitator processes each submitted action individually and logs action and feedback.',
            'Only check_permission → tare_empty_beaker → weigh_water_48g → weigh_salt_2g_separately → add_all_salt produces the permitted batch. Quantity feedback: water 48.0 g, salt 2.0 g. Before stir: visible salt crystals.',
            'After complete addition, stir reports no visible crystals and a uniform phase; inspect returns that observation. label_salt_solution_date then closes the run. Wrong order, other material or quantity loss: STOP; no success log.'
        ]),
        'requiredEvidence': 'ordered action-feedback log, measured quantities, final inspection and label; hypothetical supplied expected log is not learner evidence'
    })

add('preparation', 'preparation-bound-phase-solvent-transfer',
    bi('Gebundene Simulation mit anderen Ausgangsphasen', 'Bound simulation with different starting phases'),
    bi([
        'Ausschließlich virtuelle, moderierte Module P-2; keine realen Stoffe oder Gase. Je Modul liegt eine eigene freigegebene Simulationsanweisung vor. Es geht um ihr Ausführen, nicht um Herleiten der Löslichkeit oder Berechnen eines Anteils.',
        'Modul L: flüssiges Glycerol in Wasser. select_L → check_permission → load_water_18mL → dose_glycerol_2mL → mix_L → inspect → label_L. Vor mix_L zeigt das Modell Schlieren; danach eine einheitliche Phase.',
        'Modul S: fester Modellstoff S in einem ethanolischen Lösungsmittel. select_S → check_permission → load_ethanol_solvent_10mL → dose_S_0_01g → mix_S → inspect → label_S. Materialdaten erklären diese kleine Modellmenge als vollständig löslich. Vor mix_S sind Partikel sichtbar; danach eine einheitlich gefärbte Phase ohne Partikel.',
        'Modul G: gasförmiges CO2 in Wasser bei 20 °C Modelltemperatur und konstantem CO2-Modellpartialdruck von 1 bar. select_G → check_permission → load_water_20mL → contact_CO2_model_aliquot → mix_G → wait_G → inspect → label_G. Das feste Modellaliquot von 0,010 g liegt innerhalb der bereitgestellten Modell-Aufnahmekapazität von 0,030 g. Beide Werte sind Simulatordaten, keine Messwertbehauptung. Beim Kontakt erscheinen Blasen, nach mix_G/wait_G meldet das Modell „Aliquot aufgenommen, eine Flüssigkeitsphase, keine sichtbaren Blasen“. Temperatur/Druck werden nicht geändert.',
        'Jedes Modul startet leer. Der Moderator gibt nur nach zulässigen Aktionen die genannten Beobachtungen aus. Falsches Lösungsmittel, falsche Dosierung oder vertauschte Reihenfolge ergibt STOP und Neustart des betreffenden Moduls. Freie Chemikalienwahl und reale Gasapparaturen sind ausgeschlossen.'
    ], [
        'Virtual facilitator-mediated P-2 modules only; no real substances or gases. Each module provides its own permitted simulation instruction. The assessment concerns executing it, not deriving solubility or calculating a fraction.',
        'Module L: liquid glycerol in water. select_L → check_permission → load_water_18mL → dose_glycerol_2mL → mix_L → inspect → label_L. Before mix_L the model shows streaks; afterwards a uniform phase.',
        'Module S: solid model substance S in an ethanolic solvent. select_S → check_permission → load_ethanol_solvent_10mL → dose_S_0_01g → mix_S → inspect → label_S. Supplied material data state that this small model quantity dissolves completely. Before mix_S particles are visible; afterwards a uniformly coloured phase without particles.',
        'Module G: gaseous CO2 in water at model temperature 20 °C and constant CO2 model partial pressure of 1 bar. select_G → check_permission → load_water_20mL → contact_CO2_model_aliquot → mix_G → wait_G → inspect → label_G. The fixed 0.010 g model aliquot lies within the supplied 0.030 g model absorption capacity. Both values are simulator data, not claimed measurements. Contact displays bubbles; after mix_G/wait_G the model reports “aliquot absorbed, one liquid phase, no visible bubbles”. Temperature/pressure remain fixed.',
        'Each module starts empty. The facilitator returns the stated observations only after allowed actions. Wrong solvent, wrong dose or changed ordering gives STOP and a restart of that module. Free choice of chemicals and actual gas apparatus are excluded.'
    ]),
    bi('Führe die angegebenen Aktionen für L, S und G im moderierten Simulator aus und gib für jedes Modul den vollständigen Aktions-/Rückmeldungslog mit Endbeobachtung und Beschriftung ab. Benenne die jeweils andere Ausgangsphase und das vorgegebene Lösungsmittel. Ersetze keinen Log durch die bloße Behauptung „das ist löslich“.',
       'Execute the specified L, S and G actions in the facilitator-mediated simulator and submit each complete action/feedback log, final observation and label. Identify each changed starting phase and specified solvent. Do not replace a log with the assertion “it is soluble.”'),
    bi('Erwartet werden drei getrennte Logs mit jeweils geprüftem Modul/Freigabe, dem modulspezifischen Lösungsmittel und der vorgeschriebenen Zugabe. L dokumentiert flüssigen Ausgangsstoff in Wasser, danach keine Schlieren; S festen Ausgangsstoff im ethanolischen Lösungsmittel, danach keine Partikel; G gasförmigen Ausgangsstoff in Wasser unter festgehaltenen Modellbedingungen, Kontakt/Mischen/Warten und bestätigte Aufnahme. Alle enden mit inspect und richtiger Beschriftung. Die L-Mengen und Mischhandlung dürfen nicht ungeprüft auf S oder G übertragen werden.',
       'Three separate logs are expected, each with module/permission checked, its specific solvent and prescribed addition. L records a liquid starting substance in water followed by no streaks; S a solid in ethanolic solvent followed by no particles; G a gas in water under fixed model conditions, contact/mixing/waiting and confirmed absorption. Each ends with inspect and its correct label. L’s quantities and mixing action cannot be copied to S or G without using that module’s instruction.'),
    [
        ('Für alle drei Module sind eingereichte Aktionen mit vom Moderator erzeugten Rückmeldungen vollständig vorhanden.', 'All three modules have complete submitted actions and facilitator-generated feedback.'),
        ('Jedes Modul verwendet seine eigene Lösungsmittel-/Zugabeanweisung; fremde Mengen werden nicht übernommen.', 'Each module uses its own solvent/addition instruction; unrelated quantities are not copied.'),
        ('Die vorgeschriebene Endkontrolle und Beschriftung sind nach der Homogenitätsrückmeldung dokumentiert.', 'Required final inspection and labelling are logged after the uniformity feedback.'),
        ('Die Leistung wird als begrenzte Simulation eingeordnet, ohne reale praktische Durchführung oder allgemeine Stoffverträglichkeit zu behaupten.', 'Performance is described as a bounded simulation without claiming real practical execution or universal compatibility.')
    ],
    bi({'task': 'In S wählst du versehentlich Wasser statt des freigegebenen ethanolischen Lösungsmittels. Darfst du den erfolgreichen S-Endbefund aus der Vorlage übernehmen?',
        'expected': 'Nein. Der Moderator meldet STOP; diese Durchführung entspricht nicht der S-Anweisung. Das S-Modul muss mit dessen eigener freigegebener Anleitung neu gestartet werden. Über Löslichkeit in Wasser folgt aus dem vorgegebenen S-Endbefund nichts.'},
       {'task': 'In S you accidentally choose water instead of its permitted ethanolic solvent. May you copy the successful S endpoint from the example?',
        'expected': 'No. The facilitator returns STOP; the run violates the S instruction. Restart S with its own permitted instruction. Its supplied successful endpoint says nothing about solubility in water.'}),
    bi('Der Simulator prüft eine geführte Handlungsroutine in ausgewählten Feststoff-, Flüssigkeits- und Gasfällen mit Wasser beziehungsweise ethanolischem Lösungsmittel. Er beweist keine reale Laborkompetenz und keine vollständige nationale Quellenabdeckung. Benzin und beliebige weitere Lösungsmittel werden nicht simuliert. Die Modellwerte sind keine realen Löslichkeitsmessungen.',
       'The simulator assesses a guided action routine for selected solid, liquid and gas cases with water or ethanolic solvent. It proves neither actual laboratory competence nor complete nationwide source coverage. Petrol and arbitrary additional solvents are not simulated. Model values are not actual solubility measurements.'),
    simulator={
        'kind': 'facilitator-mediated deterministic state protocol; no existing app claimed',
        'runScope': ['L: liquid/water', 'S: solid/ethanolic solvent', 'G: gas/water'],
        'allowedSequences': {
            'L': ['select_L', 'check_permission', 'load_water_18mL', 'dose_glycerol_2mL', 'mix_L', 'inspect', 'label_L'],
            'S': ['select_S', 'check_permission', 'load_ethanol_solvent_10mL', 'dose_S_0_01g', 'mix_S', 'inspect', 'label_S'],
            'G': ['select_G', 'check_permission', 'load_water_20mL', 'contact_CO2_model_aliquot', 'mix_G', 'wait_G', 'inspect', 'label_G']},
        'transitionRule': 'Each action requires all previous actions of the selected sequence in order. Wrong action enters STOP; only restart_selected_module returns to its empty start. Feedback observations are the specific module states supplied in material.',
        'terminalRule': 'Success requires the full matching sequence and its final uniformity observation; each facilitator log contains action, feedback and ordered step number.',
        'noActualExperimentOrLearnerResultClaimed': True
    })

add('solubility', 'solubility-clear-saturated-countercase',
    bi('Eine klare Lösung kann gesättigt sein', 'A clear solution can be saturated'),
    bi([
        'Synthetische Gleichgewichtsdaten: Modellfeststoff T löst sich bei 20 °C in Wasser bis 24,0 g je 100,0 g Wasser. Diese Grenze gilt nur für T/Wasser/20 °C; hinreichend lange Mischzeit und Gleichgewicht sind ausdrücklich gegeben.',
        'Gefäß A enthält 40,0 g Wasser und vollständig gelöste 7,2 g T, keine Partikel. Gefäß B enthält 40,0 g Wasser und vollständig gelöste 9,6 g T, keine Partikel. Kein Lösungsmittelverlust. Es wird kein Versuch durchgeführt.'
    ], [
        'Synthetic equilibrium data: model solid T dissolves in water at 20 °C up to 24.0 g per 100.0 g water. This limit applies only to T/water/20 °C; sufficient mixing time and equilibrium are explicitly given.',
        'Vessel A contains 40.0 g water and 7.2 g fully dissolved T, with no particles. B contains 40.0 g water and 9.6 g fully dissolved T, with no particles. There is no solvent loss. No experiment is performed.'
    ]),
    bi('Bestimme für A und B die maximal lösbare Menge, begründe gesättigt/ungesättigt und berechne die zusätzlich lösbare Menge T. Beurteile „Ohne Bodensatz ist jede Lösung ungesättigt“.',
       'Determine the maximum dissolvable amount for A and B, justify saturated/unsaturated and calculate how much more T can dissolve. Assess “Every solution without residue is unsaturated.”'),
    bi('Für 40,0 g Wasser beträgt die Grenze 24,0 × 40,0/100,0 = 9,6 g T. A ist ungesättigt: noch 9,6 − 7,2 = 2,4 g können sich lösen. B ist bereits an der Grenze und damit gesättigt; zusätzlich 0 g. Dass B klar und ohne Bodensatz ist, ändert die Grenzmenge nicht. Die Behauptung ist falsch.',
       'For 40.0 g water the limit is 24.0 × 40.0/100.0 = 9.6 g T. A is unsaturated: another 9.6 − 7.2 = 2.4 g can dissolve. B is at the limit and saturated; another 0 g can dissolve. Its clear appearance without residue does not change the limiting amount. The claim is false.'),
    [
        ('Die Grenze wird auf die tatsächlich gegebene Wassermasse und Temperatur bezogen.', 'The limit is scaled to the actual supplied water mass and temperature.'),
        ('A und B werden anhand gelöster Menge versus Grenzmenge richtig eingeordnet.', 'A and B are classified using dissolved amount versus limiting amount.'),
        ('Sättigung ohne sichtbaren Bodensatz wird am B-Fall begründet.', 'Saturation without visible residue is justified using B.')
    ],
    bi({'task': 'Ein neues Gefäß C enthält 80,0 g Wasser und 9,6 g gelöstes T bei 20 °C. Welcher Zustand liegt vor und wie viel passt noch?',
        'expected': 'Grenze 19,2 g; C ist ungesättigt; weitere 9,6 g. Die gleiche gelöste Menge wie in B bedeutet bei doppelter Wassermasse nicht denselben Sättigungszustand.'},
       {'task': 'A new vessel C contains 80.0 g water and 9.6 g dissolved T at 20 °C. What is its state and remaining capacity?',
        'expected': 'Limit 19.2 g; C is unsaturated; capacity 9.6 g. The same dissolved amount as B does not imply the same saturation state with twice the water.'}),
    bi('T ist ein Modellstoff; Zahlen sind bereitgestellte Übungsdaten, keine behaupteten Messwerte eines realen Stoffes. Ein klarer Befund allein würde ohne diese Daten und Gleichgewichtsannahme nicht ausreichen.',
       'T is a model substance; numbers are supplied exercise data rather than claimed measurements of a real substance. Clarity alone without these data and equilibrium assumptions would be insufficient.'),
    calculations=[{'operation': '24*40/100', 'result': 9.6, 'unit': 'g dissolved T maximum'},
                  {'operation': '9.6-7.2', 'result': 2.4, 'unit': 'g additional T'},
                  {'operation': '24*80/100', 'result': 19.2, 'unit': 'g maximum in transfer'},
                  {'operation': '19.2-9.6', 'result': 9.6, 'unit': 'g transfer additional'}])

add('solubility', 'solubility-residue-water-and-temperature',
    bi('Bodensatz, mehr Wasser und andere Temperatur', 'Residue, added water and changed temperature'),
    bi([
        'Neue synthetische Gleichgewichtsdaten für Modellstoff U: bei 20 °C lösen sich höchstens 30,0 g U je 100,0 g Wasser. In 80,0 g Wasser wurden insgesamt 32,0 g U gegeben; nach ausreichendem Mischen sind Bodensatz und Lösung vorhanden. Keine Reaktion und kein Verlust.',
        'Änderung A: weitere 40,0 g Wasser werden bei unveränderten 20 °C zugegeben; erneut wird Gleichgewicht erreicht. Änderung B ist ein anderer neuer Fall: dieselbe Stoffkombination bei 40 °C, aber ohne gelieferte Löslichkeitsangabe für 40 °C.'
    ], [
        'New synthetic equilibrium data for model U: at 20 °C no more than 30.0 g U dissolves per 100.0 g water. A total of 32.0 g U was added to 80.0 g water; after sufficient mixing there is residue and solution. No reaction or loss.',
        'Change A: another 40.0 g water is added at unchanged 20 °C and equilibrium is reached again. Change B is a different new scenario: the same substance pair at 40 °C, without a supplied solubility value for 40 °C.'
    ]),
    bi('Bestimme zunächst gelöste Menge, Rest und Sättigung. Kann bloß längeres Rühren den Rest unter denselben Gleichgewichtsbedingungen vollständig lösen? Bestimme dann den Zustand nach Änderung A. Nenne für B die fehlende entscheidende Angabe.',
       'First determine dissolved amount, residue and saturation. Can simply stirring longer dissolve all residue under the same equilibrium conditions? Then determine the state after A and name the decisive missing value for B.'),
    bi('Zunächst sind maximal 30,0 × 80,0/100,0 = 24,0 g gelöst; 32,0 − 24,0 = 8,0 g bleiben als Rest. Die Flüssigkeitsphase ist gesättigt. Noch mehr Rühren ändert unter den ausdrücklich bereits erreichten Gleichgewichtsbedingungen die Grenze nicht. Nach A: 120,0 g Wasser, Grenze 36,0 g; alle 32,0 g lösen sich, 4,0 g zusätzliche Kapazität, ungesättigt. Für B brauche ich die Löslichkeit bei 40 °C; ich darf die 20-°C-Grenze weder unverändert übernehmen noch eine bestimmte Zunahme erraten.',
       'Initially at most 30.0 × 80.0/100.0 = 24.0 g is dissolved; 32.0 − 24.0 = 8.0 g remains. The liquid phase is saturated. More stirring does not change the limit under explicitly attained equilibrium conditions. After A: 120.0 g water, limit 36.0 g; all 32.0 g dissolves, with 4.0 g further capacity, so unsaturated. B requires solubility at 40 °C; I may neither reuse the 20 °C limit unchanged nor guess a particular increase.'),
    [
        ('Gelöste Stoffmenge und ungelöster Rest werden getrennt berechnet und richtig gedeutet.', 'Dissolved solute and undissolved residue are calculated separately and correctly interpreted.'),
        ('Rühren wird unter gegebenem Gleichgewicht nicht mit einer erhöhten Löslichkeitsgrenze gleichgesetzt.', 'Under supplied equilibrium, stirring is not equated with increasing the solubility limit.'),
        ('Nach Wasserzugabe wird die Grenzmenge mit 120,0 g Wasser neu bestimmt.', 'After water addition the limit is recomputed using 120.0 g water.'),
        ('Für 40 °C werden eigene Daten verlangt, statt eine unbelegte Temperaturregel anzuwenden.', 'For 40 °C separate data are requested instead of applying an unsupported temperature rule.')
    ],
    bi({'task': 'Bei 20 °C wurden nur 20,0 g U in 80,0 g Wasser gegeben. Ein Mitschüler behauptet: „Dieser Stoff macht immer Bodensatz.“ Begründe den neuen Fall.',
        'expected': 'Die Grenze bleibt 24,0 g; 20,0 g lösen sich unter den gegebenen Bedingungen vollständig, kein Rest, ungesättigt mit 4,0 g Kapazität. Der Rest im ersten Fall entstand aus der überschüssigen Menge.'},
       {'task': 'At 20 °C only 20.0 g U was added to 80.0 g water. A classmate claims “This substance always leaves residue.” Explain the new case.',
        'expected': 'The limit remains 24.0 g; 20.0 g dissolves completely under the given conditions, leaving no residue and an unsaturated solution with 4.0 g capacity. The initial residue came from excess quantity.'}),
    bi('Die Bedingungen „Gleichgewicht erreicht“ und „keine Reaktion/kein Verlust“ sind bereitgestellte Modellannahmen; kein universeller zeitlicher Ablauf und keine praktische Heizempfehlung.',
       '“Equilibrium attained” and “no reaction/loss” are supplied model assumptions; no universal timing claim or practical heating recommendation.'),
    calculations=[{'operation': '30*80/100', 'result': 24, 'unit': 'g initially dissolved'},
                  {'operation': '32-24', 'result': 8, 'unit': 'g initial residue'},
                  {'operation': '30*(80+40)/100', 'result': 36, 'unit': 'g maximum after water addition'},
                  {'operation': '36-32', 'result': 4, 'unit': 'g additional capacity after A'}])

add('mass_fraction', 'mass-fraction-total-mass-and-dilution',
    bi('Gesamtmasse statt Lösungsmittelmasse', 'Total mass rather than solvent mass'),
    bi([
        'Dokumentierter Modellansatz: 12,0 g Kochsalz und 108,0 g Wasser; das Salz ist vollständig gelöst. Kein Stoffverlust und keine Reaktion. Es wird ausschließlich gerechnet, nichts hergestellt.',
        'Vergleichsvorschlag aus einer fiktiven Lösung: „12,0/108,0 × 100 = 11,1 % Massenanteil.“ Anschließend werden 30,0 g Wasser ohne Verluste hinzugefügt.'
    ], [
        'Recorded model batch: 12.0 g table salt and 108.0 g water; all salt is dissolved. No loss or reaction. This is calculation only, with no preparation.',
        'A fictional proposed solution says “12.0/108.0 × 100 = 11.1% mass fraction.” Subsequently 30.0 g water is added without loss.'
    ]),
    bi('Berechne den Massenanteil des Salzes im ursprünglichen Ansatz und deute die Prozentangabe. Erkläre den Fehler im Vergleichsvorschlag. Bestimme den neuen Massenanteil nach Wasserzugabe.',
       'Calculate the salt mass fraction of the original batch and interpret the percentage. Explain the proposed solution’s mistake. Determine the new mass fraction after water addition.'),
    bi('Gesamtmasse = 12,0 + 108,0 = 120,0 g. w(Salz) = 12,0/120,0 = 0,100 = 10,0 %: In 100 g dieses Gemisches sind 10 g Salz enthalten. 12,0/108,0 ist das Salz/Wasser-Massenverhältnis, kein Anteil an der gesamten Lösung. Nach Zugabe: Gesamtmasse 150,0 g, Salz weiterhin 12,0 g; w = 12,0/150,0 = 0,080 = 8,0 %. Der Anteil sinkt durch die größere Gesamtmasse.',
       'Total mass = 12.0 + 108.0 = 120.0 g. w(salt) = 12.0/120.0 = 0.100 = 10.0%: 100 g of this mixture contains 10 g salt. 12.0/108.0 is a salt/water mass ratio, not a fraction of the whole solution. After addition: total mass 150.0 g, with salt still 12.0 g; w = 12.0/150.0 = 0.080 = 8.0%. The fraction decreases because total mass increases.'),
    [
        ('Im Nenner steht die Gesamtmasse einschließlich Salz.', 'The denominator includes the salt as part of total mass.'),
        ('0,100 beziehungsweise 10,0 % wird korrekt als dimensionsloser Massenanteil interpretiert.', '0.100 or 10.0% is correctly interpreted as a dimensionless mass fraction.'),
        ('Der falsche Nenner wird als Stoff/Lösungsmittel-Verhältnis erkannt und nach Wasserzugabe wird neu gerechnet.', 'The incorrect denominator is identified as a solute/solvent ratio, and the fraction is recomputed after water addition.')
    ],
    bi({'task': 'Ein zweiter Ansatz enthält 24,0 g Salz und 216,0 g Wasser, vollständig gelöst. Ist der Massenanteil wegen der doppelten Salzmasse doppelt so groß?',
        'expected': 'Nein. 24,0/(24,0 + 216,0) = 0,100 = 10,0 %. Beide Bestandteile wurden proportional verdoppelt.'},
       {'task': 'A second fully dissolved batch has 24.0 g salt and 216.0 g water. Is its mass fraction twice as large because salt mass doubled?',
        'expected': 'No. 24.0/(24.0 + 216.0) = 0.100 = 10.0%. Both constituents were doubled proportionally.'}),
    bi('Alle Massen und die vollständige Lösung sind bereitgestellt. Weder Herstellung noch Salzlöslichkeit müssen unabhängig bestimmt werden.',
       'All masses and complete dissolution are supplied. Neither preparation nor salt solubility must be independently established.'),
    calculations=[{'operation': '12/(12+108)', 'exactResult': '1/10', 'percent': 10},
                  {'operation': '12/108', 'exactResult': '1/9', 'percentRounded1dp': 11.1, 'interpretation': 'solute/solvent ratio, not mass fraction'},
                  {'operation': '12/(12+108+30)', 'exactResult': '2/25', 'percent': 8},
                  {'operation': '24/(24+216)', 'exactResult': '1/10', 'percent': 10}])

add('mass_fraction', 'mass-fraction-documented-solvent-loss',
    bi('Dokumentierter Wasserverlust verändert den Anteil', 'Documented water loss changes the fraction'),
    bi([
        'Bereitgestellter Messbericht, keine Durchführung: Eine Lösung besteht zunächst aus 25,0 g Zucker und 175,0 g Wasser. Später sind nach dokumentiertem ausschließlich Wasserverlust von 25,0 g weiterhin alle 25,0 g Zucker gelöst. Keine Reaktion, keine Spritzer, kein Zuckerverlust. Gesamtmasse nachher 175,0 g.',
        'Eine fiktive Antwort behauptet: „Der Massenanteil bleibt gleich, denn die Zuckermasse ist unverändert.“ Für ein anderes Gefäß wird lediglich eine Endgesamtmasse von 175,0 g genannt, ohne Auskunft über verlorene Bestandteile.'
    ], [
        'Supplied measurement record, not an experiment: initially a solution consists of 25.0 g sugar and 175.0 g water. After documented water-only loss of 25.0 g, all 25.0 g sugar remains dissolved. There is no reaction, splashing or sugar loss. Final total mass is 175.0 g.',
        'A fictional answer claims “The mass fraction is unchanged because sugar mass is unchanged.” Another vessel has only a reported final total mass of 175.0 g, without information about which constituents were lost.'
    ]),
    bi('Berechne und deute den Massenanteil vorher und nachher. Widerlege die Behauptung mithilfe des Nenners. Kannst du für das andere Gefäß allein aus der Endgesamtmasse denselben Zuckeranteil sichern?',
       'Calculate and interpret mass fraction before and after. Refute the claim using the denominator. Can the other vessel’s final total mass alone establish the same sugar fraction?'),
    bi('Vorher: Gesamtmasse 200,0 g; w = 25,0/200,0 = 0,125 = 12,5 %. Nachher: Wasser 150,0 g und Zucker 25,0 g; Gesamtmasse 175,0 g; w = 25,0/175,0 = 1/7 ≈ 0,142857 = 14,3 % gerundet. Die gleiche Zuckermasse macht bei kleinerem Gesamtmassennenner einen größeren Anteil. Das andere Gefäß benötigt eine belegte verbleibende Zuckermasse beziehungsweise einen vollständigen Verlustbericht; Endgesamtmasse allein genügt nicht.',
       'Initially: total mass 200.0 g; w = 25.0/200.0 = 0.125 = 12.5%. Afterwards: 150.0 g water and 25.0 g sugar; total mass 175.0 g; w = 25.0/175.0 = 1/7 ≈ 0.142857 = 14.3% rounded. The same sugar mass gives a larger fraction with a smaller total-mass denominator. The other vessel needs documented remaining sugar mass or a complete loss record; final total mass alone is insufficient.'),
    [
        ('Beide Gesamtmassen werden korrekt zusammengesetzt und als Nenner verwendet.', 'Both total masses are assembled correctly and used as denominators.'),
        ('12,5 % und gerundet 14,3 % werden berechnet und mit dem Wasserverlust erklärt.', '12.5% and rounded 14.3% are calculated and explained using water loss.'),
        ('Die unbekannte Restzusammensetzung des anderen Gefäßes wird nicht stillschweigend gleichgesetzt.', 'Unknown remaining composition of the other vessel is not silently equated.')
    ],
    bi({'task': 'Statt Wasserverlust werden zum ursprünglichen Ansatz weitere 50,0 g Wasser ohne Verlust hinzugefügt. Wie groß ist der Zuckeranteil?',
        'expected': '25,0/250,0 = 0,100 = 10,0 %. Derselbe Zähler erhält diesmal einen größeren Nenner, daher sinkt der Anteil.'},
       {'task': 'Instead of water loss, another 50.0 g water is added to the initial batch without loss. What is the sugar fraction?',
        'expected': '25.0/250.0 = 0.100 = 10.0%. The same numerator now has a larger denominator, so the fraction decreases.'}),
    bi('Wasserverlust ist eine Angabe im Bericht, keine Aufforderung zum Erhitzen. Erhalt des Zuckers und vollständige Lösung sind ausdrücklich gegeben und dürfen in unbekannten Fällen nicht unterstellt werden.',
       'Water loss is a record entry, not a request to heat. Sugar retention and complete dissolution are explicitly supplied and must not be assumed in unknown cases.'),
    calculations=[{'operation': '25/(25+175)', 'exactResult': '1/8', 'percent': 12.5},
                  {'operation': '25/(25+175-25)', 'exactResult': '1/7', 'percentRounded1dp': 14.3},
                  {'operation': '25/(25+175+50)', 'exactResult': '1/10', 'percent': 10}])

add('volume_fraction', 'volume-fraction-input-sum-and-scaling',
    bi('Volumenanteil aus Eingangsvolumina', 'Volume fraction from input volumes'),
    bi([
        'Virtuelle mischbare Flüssigkeiten A und B werden bei derselben angegebenen Temperatur separat vor dem Mischen gemessen: A = 25,0 mL, B = 75,0 mL. Diese Modellmischung ist volumenadditiv: Endvolumen = 100,0 mL. Keine praktische Durchführung.',
        'Gesucht ist ausdrücklich der Volumenanteil φ von A nach der Bezugsgröße Summe der Bestandteilsvolumina vor dem Mischen. Vergleichsansätze: A = 10,0 mL und B = 30,0 mL; weiterer neuer Ansatz A = 20,0 mL und B = 30,0 mL, ebenfalls bei gleicher Temperatur.'
    ], [
        'Virtual miscible liquids A and B are separately measured before mixing at the same specified temperature: A = 25.0 mL, B = 75.0 mL. This model mixture has additive volumes: final volume = 100.0 mL. No practical activity.',
        'The requested quantity is explicitly A’s volume fraction φ using the sum of constituent volumes before mixing. Comparison batch: A = 10.0 mL, B = 30.0 mL; a further new batch: A = 20.0 mL, B = 30.0 mL, also at the same temperature.'
    ]),
    bi('Berechne und deute φ(A) im ersten Ansatz. Prüfe, ob der kleinere Vergleichsansatz denselben Anteil hat. Benenne den Nenner ausdrücklich als Eingangsvolumensumme, auch wenn er hier mit dem Endvolumen übereinstimmt.',
       'Calculate and interpret φ(A) for the first batch. Check whether the smaller comparison batch has the same fraction. Explicitly identify the denominator as the sum of input volumes, even though it equals final volume here.'),
    bi('φ(A) = 25,0/(25,0 + 75,0) = 0,250 = 25,0 %. A macht ein Viertel der Summe der getrennt gemessenen Eingangsvolumina aus. Beim kleineren Ansatz: 10,0/(10,0 + 30,0) = 0,250 = 25,0 %. Die Gesamtmenge ist kleiner, das Mischungsverhältnis gleich. Der Nenner ist in beiden Fällen die Eingangsvolumensumme; das gleiche Endvolumen im additiven Modell ist keine allgemeine Regel.',
       'φ(A) = 25.0/(25.0 + 75.0) = 0.250 = 25.0%. A accounts for one quarter of the sum of separately measured input volumes. The smaller batch gives 10.0/(10.0 + 30.0) = 0.250 = 25.0%. Total quantity is smaller but the mixing ratio is the same. Both denominators are sums of input volumes; matching final volume in this additive model is not a universal rule.'),
    [
        ('Die Summe beider Eingangsvolumina steht im Nenner.', 'The denominator is the sum of both input volumes.'),
        ('25,0 % wird als Anteil an dieser Summe gedeutet, ohne daraus einen Massenanteil zu machen.', '25.0% is interpreted as a fraction of that sum without treating it as a mass fraction.'),
        ('Proportionale Verkleinerung wird von geändertem Mischungsverhältnis unterschieden.', 'Proportional scaling is distinguished from a changed mixing ratio.')
    ],
    bi({'task': 'Berechne den neuen Anteil bei 20,0 mL A und 30,0 mL B. Darf der Anteil wegen gleicher Stoffe 25,0 % bleiben?',
        'expected': '20,0/(20,0 + 30,0) = 0,400 = 40,0 %. Nein, das Verhältnis der Eingangsvolumina hat sich geändert.'},
       {'task': 'Compute the new fraction with 20.0 mL A and 30.0 mL B. May it stay at 25.0% because the liquids are the same?',
        'expected': '20.0/(20.0 + 30.0) = 0.400 = 40.0%. No, the input-volume ratio has changed.'}),
    bi('Volumenadditivität ist ausdrücklich nur für den ersten Modellfall angegeben. Die Daten enthalten keine Dichten und erlauben keine Massenanteilsrechnung oder unbekannte Endvolumenvorhersage.',
       'Volume additivity is explicitly supplied only for the initial model case. No densities are supplied, so data do not support mass-fraction calculations or unknown final-volume predictions.'),
    calculations=[{'operation': '25/(25+75)', 'exactResult': '1/4', 'percent': 25},
                  {'operation': '10/(10+30)', 'exactResult': '1/4', 'percent': 25},
                  {'operation': '20/(20+30)', 'exactResult': '2/5', 'percent': 40}])

add('volume_fraction', 'volume-fraction-contraction-no-denominator-swap',
    bi('Kontraktion ändert die Bezugsgröße nicht', 'Contraction does not change the reference quantity'),
    bi([
        'Synthetischer Messbericht für eine virtuelle Ethanol-Wasser-Mischung bei gleicher Temperatur: vor dem Mischen separat 40,0 mL Ethanol und 60,0 mL Wasser; nach dem Mischen gemessenes Endvolumen 96,0 mL. Diese Zahlen sind Modellmaterial, keine allgemein gültigen Messwerte.',
        'Gesucht ist ausdrücklich φ(Ethanol) nach IUPAC-Bezugsgröße: Volumen des Bestandteils vor dem Mischen geteilt durch die Summe aller Bestandteilsvolumina vor dem Mischen. Eine fiktive Lösung setzt stattdessen 40,0/96,0 ein.',
        'Ein frischer anderer Modellbericht nennt vor dem Mischen 30,0 mL Ethanol und 70,0 mL Wasser, Endvolumen 97,0 mL. Keine praktische Herstellung.'
    ], [
        'Synthetic measurement record for a virtual ethanol-water mixture at the same temperature: separately measured before mixing, 40.0 mL ethanol and 60.0 mL water; measured final volume 96.0 mL. These are model data, not universal measured values.',
        'The requested quantity is explicitly φ(ethanol) using the IUPAC reference: constituent volume before mixing divided by the sum of all constituent volumes before mixing. A fictional solution instead uses 40.0/96.0.',
        'A fresh different model record has 30.0 mL ethanol and 70.0 mL water before mixing, with final volume 97.0 mL. No practical preparation.'
    ]),
    bi('Berechne φ(Ethanol) für den ersten Bericht. Erkläre, warum das gemessene Endvolumen von 96,0 mL nicht der Nenner dieser gesuchten Größe ist. Rechne den fiktiven Vorschlag aus und benenne seine abweichende Bezugsgröße, ohne ihn als Volumenanteil zu akzeptieren.',
       'Calculate φ(ethanol) for the first record. Explain why measured final volume 96.0 mL is not this quantity’s denominator. Evaluate the fictional calculation and identify its different reference without accepting it as the requested volume fraction.'),
    bi('φ(Ethanol) = 40,0/(40,0 + 60,0) = 0,400 = 40,0 %. Der Nenner 100,0 mL ist die Summe der Eingangsvolumina. 40,0/96,0 ≈ 0,416667 = 41,7 % vergleicht das Ethanol-Eingangsvolumen mit dem Endvolumen der Mischung und ist eine andere Verhältnisgröße. Kontraktion rechtfertigt keinen Austausch der ausdrücklich gesuchten Bezugsgröße. Aus φ folgt auch nicht, dass Ethanol im fertigen Gemisch einen abgetrennten 40,0-mL-Bereich belegt.',
       'φ(ethanol) = 40.0/(40.0 + 60.0) = 0.400 = 40.0%. The 100.0 mL denominator is the sum of input volumes. 40.0/96.0 ≈ 0.416667 = 41.7% compares ethanol input volume with final mixture volume and is a different ratio. Contraction does not justify replacing the explicitly requested reference. Nor does φ imply that ethanol occupies a separate 40.0 mL region within the mixed liquid.'),
    [
        ('40,0 % wird mit Eingangsvolumensumme 100,0 mL berechnet.', '40.0% is calculated using the 100.0 mL sum of input volumes.'),
        ('Eingangsvolumensumme und gemessenes Endvolumen werden begrifflich unterschieden.', 'The sum of input volumes and measured final volume are distinguished conceptually.'),
        ('41,7 % wird als andere Bezugsgröße erkannt und nicht als gesuchtes φ ausgegeben.', '41.7% is recognized as using another reference and is not reported as the requested φ.'),
        ('Der Anteil wird nicht als abgetrennter Teilraum im homogenen Gemisch missverstanden.', 'The fraction is not mistaken for a separate region within the homogeneous mixture.')
    ],
    bi({'task': 'Berechne φ(Ethanol) im frischen Bericht mit 30,0 mL und 70,0 mL Eingangsvolumina sowie 97,0 mL Endvolumen.',
        'expected': '30,0/(30,0 + 70,0) = 0,300 = 30,0 %. Die neuen Eingangsvolumina ändern den Anteil; 97,0 mL bleibt auch hier eine andere Bezugsgröße.'},
       {'task': 'Calculate φ(ethanol) for the fresh record with 30.0 mL and 70.0 mL input volumes and 97.0 mL final volume.',
        'expected': '30.0/(30.0 + 70.0) = 0.300 = 30.0%. Changed input volumes change the fraction; 97.0 mL remains a different reference.'}),
    bi('Dieser Fall prüft die ausdrücklich definierte Volumenanteilsgröße. Andere gebräuchliche Konzentrationsangaben mit Endvolumen müssen ihre Bezugsgröße gesondert ausweisen. Keine Vorhersage realer Kontraktionswerte, keine allgemeine Ethanol-Verwendungserlaubnis.',
       'The case assesses the explicitly defined volume fraction. Other concentration conventions using final volume must state their own reference separately. No prediction of actual contraction values or general permission to use ethanol is given.'),
    calculations=[{'operation': '40/(40+60)', 'exactResult': '2/5', 'percent': 40},
                  {'operation': '40/96', 'exactResult': '5/12', 'percentRounded1dp': 41.7, 'interpretation': 'different ratio to final volume, not requested volume fraction'},
                  {'operation': '30/(30+70)', 'exactResult': '3/10', 'percent': 30}])

cards = [
    {
        'cardLocalKey': 'mass_fraction_definition', 'cardId': None,
        'originGoalId': None, 'originRoutineLocalKey': 'mass_fraction',
        'primaryCardCandidate': True, 'activationStatus': 'not_active',
        'recordStatus': 'ai_candidate', 'validationStatus': 'needs_human_review',
        'independentCardReviewStatus': 'pending', 'actualVisibilityReviewStatus': 'pending',
        'humanApproval': False,
        'front': bi('Wie ist der Massenanteil wᵢ eines Bestandteils i definiert?',
                    'How is a constituent’s mass fraction wᵢ defined?'),
        'back': bi('wᵢ = mᵢ / Σmⱼ. Der Nenner ist die Gesamtmasse aller Bestandteile des Gemisches, einschließlich i. Der Anteil ist dimensionslos; Prozentangabe = 100 · wᵢ %.',
                   'wᵢ = mᵢ / Σmⱼ. The denominator is the total mass of all mixture constituents, including i. The fraction is dimensionless; percentage = 100 · wᵢ %.'),
        'narrowRecallRationale': bi('Eine kompakte Definition mit ihrer Bezugsgröße; Anwendungen, Herstellung und Löslichkeitsdaten gehören zu den Fällen, nicht auf diese Karte.',
                                   'One compact definition with its reference quantity; applications, preparation and solubility data belong in cases rather than on this card.'),
        'sourceReference': 'https://goldbook.iupac.org/terms/view/M03722',
        'deckId': None, 'memoryGoalIds': [], 'actualGoalBindingRequired': True,
        'existingCardsUnchanged': True
    },
    {
        'cardLocalKey': 'volume_fraction_definition', 'cardId': None,
        'originGoalId': None, 'originRoutineLocalKey': 'volume_fraction',
        'primaryCardCandidate': True, 'activationStatus': 'not_active',
        'recordStatus': 'ai_candidate', 'validationStatus': 'needs_human_review',
        'independentCardReviewStatus': 'pending', 'actualVisibilityReviewStatus': 'pending',
        'humanApproval': False,
        'front': bi('Wie ist der Volumenanteil φᵢ eines Bestandteils i definiert? Welche Volumina stehen im Nenner?',
                    'How is a constituent’s volume fraction φᵢ defined? Which volumes form its denominator?'),
        'back': bi('φᵢ = Vᵢ / ΣVⱼ mit den bei gleicher Temperatur vor dem Mischen bestimmten Bestandteilsvolumina. Der Nenner ist deren Summe, auch wenn das gemessene Endvolumen abweicht. Der Anteil ist dimensionslos; Prozentangabe = 100 · φᵢ %.',
                   'φᵢ = Vᵢ / ΣVⱼ using constituent volumes determined before mixing at the same temperature. Their sum is the denominator even if measured final volume differs. The fraction is dimensionless; percentage = 100 · φᵢ %.'),
        'narrowRecallRationale': bi('Eine kompakte Definition mit eindeutigem Volumenbezug. Kontraktionswerte und Laboranweisungen werden nicht memoriert.',
                                   'One compact definition with an unambiguous volume reference. Contraction values and laboratory instructions are not memorized.'),
        'sourceReference': 'https://goldbook.iupac.org/terms/view/V06643',
        'deckId': None, 'memoryGoalIds': [], 'actualGoalBindingRequired': True,
        'existingCardsUnchanged': True
    }
]

created = datetime.now(timezone.utc).isoformat()
input_refs = [{'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(),
               'bytes': p.stat().st_size} for p in INPUTS]
common = {
    'schemaVersion': 1, 'createdAtUTC': created,
    'author': 'Codex B007 materials author; no independent review by this author',
    'recordStatus': 'ai_candidate', 'validationStatus': 'needs_human_review',
    'humanApproval': False, 'humanTrial': False, 'activeWrites': False,
    'inputBindings': input_refs,
    'licenseExpression': 'CC-BY-4.0',
    'licenseScope': 'Own authored exercise/card text and arrangement only; linked official curricula and references retain their separate rights.',
    'attribution': 'SkillPilot, enpasos - Enterprise Patterns & Solutions GmbH; AI-authored synthetic candidate, 2026-10-06.'
}
case_doc = {**common, 'kind': 'B007 substantive bilingual case-material author candidates',
            'evidenceLevel': 'E1', 'generalizationLevel': 'G1',
            'routineCount': 7, 'caseCount': len(cases), 'cases': cases}
card_doc = {**common, 'kind': 'Two narrow bilingual primary-card author candidates',
            'cardCount': len(cards), 'cards': cards,
            'independentCardAndActualCompositionVisibilityReviewRequired': True,
            'noExistingDeckFilesChanged': True}
HERE.mkdir(parents=True, exist_ok=True)
for name, doc in [('cases.de-en.author-candidate.json', case_doc),
                  ('primary-cards.de-en.author-candidate.json', card_doc)]:
    (HERE / name).write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')

# Limited author consistency checks: shape/binding/arithmetic, not machine gate approvals.
assert len(cases) == 14 and len(cards) == 2
assert sorted(c['routineLocalKey'] for c in cases) == sorted(list(prototypes) * 2)
assert len({c['caseLocalKey'] for c in cases}) == 14
assert all(c['candidateGoalId'] is None for c in cases if c['routineLocalKey'] != 'label')
assert all(c['candidateGoalId'] == prototypes['label']['id'] for c in cases if c['routineLocalKey'] == 'label')
assert all(c['originGoalId'] is None and c['cardId'] is None for c in cards)
arithmetic = []
for case in cases:
    for calc in case.get('calculationAudit', []):
        # Expressions are controlled literal author calculations, not untrusted input.
        actual = eval(calc['operation'], {'__builtins__': {}}, {})
        if 'result' in calc:
            assert abs(actual - calc['result']) < 1e-10
        if 'exactResult' in calc:
            assert abs(actual - float(Fraction(calc['exactResult']))) < 1e-12
        if 'percent' in calc:
            assert abs(100 * actual - calc['percent']) < 1e-10
        if 'percentRounded1dp' in calc:
            assert round(100 * actual, 1) == calc['percentRounded1dp']
        arithmetic.append({'caseLocalKey': case['caseLocalKey'], **calc, 'authorCalculationCheck': 'passed'})
receipt = {**common, 'licenseExpression': 'Apache-2.0',
           'licenseScope': 'Technical author receipt; referenced educational text retains CC-BY-4.0 and third-party sources retain separate rights.',
           'kind': 'Author-only limited consistency and arithmetic receipt',
           'caseCount': len(cases), 'casesPerRoutine': {k: 2 for k in prototypes},
           'primaryCardCount': len(cards), 'checkedCalculations': arithmetic,
           'allCasesBilingual': True, 'allCasesHaveConcreteMaterialTaskAnswerCriteriaAndTransfer': True,
           'preparationRequiresExecutionOrBoundActionLog': True,
           'simulatorImplementation': 'specification only; no app or actual learner execution claimed',
           'sourceCoverageApproval': False, 'nativeGateApproval': False,
           'independentReviewApproval': False, 'newIdsAssigned': False,
           'existingCardsModified': False}
(HERE / 'author-consistency-and-arithmetic.actual.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')

report = '''# B007 authored cases and cards — author candidate only

Fourteen complete synthetic bilingual case objects cover the seven local routine proposals, two cases each. Exactly two narrow bilingual primary-card candidates cover mass_fraction and volume_fraction. All remain ai_candidate / needs_human_review; the case evidence levels are E1/G1. No new curriculum IDs, native evidence profiles, memory nodes, decks, active cards or approvals were assigned.

The cases include supplied material, a learner task, an expected response, essential-understanding criteria and a changed-input transfer or countercase. Expected responses are authored solutions, not observed learner evidence. No learner/session/private data is included.

Preparation requires actual supervised execution with a confirmed log or the specified facilitator-mediated action simulator. P-1 is a bounded salt/water routine. P-2 exercises the same instruction-following routine through selected liquid/water, solid/ethanolic-solvent and gas/water modules; each has its own fixed action sequence and feedback states. These are moderated simulator specifications, not implemented or tested applications. They do not establish actual laboratory competence. No practical gas, ethanol or petrol procedure is proposed. Petrol and arbitrary other solvents are outside these cases.

Handling and disposal remain distinct routines. Protection cases use explicit activity/exposure information and local rules. Waste decisions use supplied synthetic LOCAL rules; no generic drain permission is given. Unknown composition requires a held decision and the responsible teacher. Acid/base knowledge and activities are excluded from this B007 author package.

## Source boundaries

The supplied input snapshot contains the three original goals, 413 currently matching mapping/source rows and 62 input bindings. Those are retained inputs, not clearance. This material neither edits those inputs nor reviews the 403 originally retained source obligations or national exact coverage. The case sourceGoalIds are author references for later review, not source-to-new-goal approvals. No national applicability, stage, target-role or source mapping mutation is made.

The supplied Hessen extraction links the label, disposal and protection routines to separate 8.1#B07A01/A02/A03 aspects. Its 8.1#B05A01 row contains solutions/solubility plus BOTH mass and volume fractions. The official PDF, printed p. 11, confirms those obligations; p. 6 states that parenthesized examples are suggestions. They are not silently removed. Selected preparation examples and a model-solubility exercise do not by themselves settle complete original-row coverage. The NI extraction’s property-description row is an input reference, not proof of the full proposed saturation description or an approved NI grade-level projection.

Official Hessen source: https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf . The official PDF was available to this author through the browser. The Gold Book current term pages (M03722/V06643) and ECHA pictogram page returned access errors to this author; no successful page fetch is claimed. The IUPAC old mass-fraction entry was available in search output. The volume-fraction definition was explicitly supplied and independently checked by the root author; this author preserves that definition and its sum-of-input-volumes denominator. Links: https://goldbook.iupac.org/terms/view/M03722 and https://goldbook.iupac.org/terms/view/V06643 . Hazard-label code/text pairs are supplied teaching data; the materials claim no current legal classification of actual products. No external image or icon is copied.

## Arithmetic

The receipt lists author-checked literal calculations. Solubility: 24 × 40/100 = 9.6 g, capacity 2.4 g; doubled water gives 19.2 g capacity total. Second case: 24 g dissolved/8 g residue; after water addition maximum 36 g and spare capacity 4 g. Mass fractions: 10% → 8% after dilution; 12.5% → 14.3% after documented water-only loss. Volume fractions: 25%, proportional scaling 25%, changed ratio 40%; contraction case is 40/(40+60) = 40%, while 40/96 = 41.7% is explicitly a different ratio. Fresh contraction case remains 30/(30+70) = 30%.

Independent A/B semantic, source-boundary and case reviews remain pending. The two cards still require actual ordinary-goal IDs, deck/memory bindings, independent card review and real learner-facing composition visibility checks. The label routine’s existing cards remain untouched. No arithmetic receipt is a description, atomicity, memory, visualization or native M7 gate approval. No image or full build was produced.

Own authored learning content is CC-BY-4.0 under LICENSING.md; linked official curricula and references retain separate rights. The materializer and technical receipts are Apache-2.0 technical infrastructure; the content license in their shared metadata only describes the referenced own exercise/card text.
'''
(HERE / 'source-boundary-and-material-limitations.author.md').write_text(report)
artifacts = []
for name in ['materialize-author-materials.py', 'cases.de-en.author-candidate.json',
             'primary-cards.de-en.author-candidate.json', 'author-consistency-and-arithmetic.actual.json',
             'source-boundary-and-material-limitations.author.md']:
    p = HERE / name
    artifacts.append({'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size})
freeze = {'licenseExpression': 'Apache-2.0', 'schemaVersion': 1, 'createdAtUTC': created, 'kind': 'Actual byte freeze of author outputs and parent inputs',
          'reviewStatus': 'author candidate awaiting independent review', 'activeWrites': False,
          'humanApproval': False, 'inputBindings': input_refs, 'artifactBindings': artifacts,
          'caseCount': 14, 'routineCount': 7, 'primaryCardCount': 2}
(HERE / 'author-materials.final.freeze.json').write_text(json.dumps(freeze, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'caseCount': 14, 'routineCount': 7, 'primaryCardCount': 2,
                  'calculationCount': len(arithmetic), 'status': 'author-only checks passed',
                  'outputDirectory': str(HERE)}, ensure_ascii=False))
