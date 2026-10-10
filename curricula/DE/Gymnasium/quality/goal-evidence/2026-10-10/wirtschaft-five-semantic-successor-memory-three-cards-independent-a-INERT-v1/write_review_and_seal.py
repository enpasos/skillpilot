import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
INPUT = BASE / 'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1'
OUT = BASE / 'wirtschaft-five-semantic-successor-memory-three-cards-independent-a-INERT-v1'
assert not (OUT / 'independent-review-seal.json').exists(), 'Immutable seal already exists'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def binding(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': digest(data), 'bytes': len(data)}


def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


goals = json.loads((INPUT / 'five-whole-current-semantic-destinations.READONLY.json').read_text())['goals']
decisions = json.loads((INPUT / 'five-goal-memory-decisions.no-native-fingerprints.AUTHOR-INERT.json').read_text())['decisions']
cards = json.loads((INPUT / 'three-whole-card-successors.AUTHOR-INERT.json').read_text())
goal_by_id = {g['id']: g for g in goals}
decision_by_id = {d['goalId']: d for d in decisions}
card_by_id = {c['id']: c for c in cards['replaced'] + cards['added']}
started = json.loads((OUT / 'inputs.before-guards.json').read_text())['capturedAt']
generation = binding(OUT / 'generation-metadata.json')

limits = {
    'independentOfRootMemoryAndCardAuthor': True,
    'priorOwnNAIRUGoalAndPAuthorship': True,
    'independentNAIRUGoalPScienceApproval': False,
    'blindNativeDescriptionReview': False,
    'rootAuthorObjectsModified': False,
    'activeWrites': 0,
    'humanApproval': False,
    'actualLearnerPerformance': False,
    'currentM6OrM7Approval': False,
    'native339MemoryRunPerformed': False,
    'native34ScopesRunPerformed': False,
    'newNativeAOrMFingerprintsClaimed': False,
    'sourceScopeAndCountryApproval': False,
    'legalAccuracyApproval': False,
    'newTaskCaseOrDemonstrationQuota': False,
    'wholeGoalAndProfileScientificRequalification': False,
}

reasons = [
    {
        'goalId': '7c72848d-8bc9-58e2-a690-fd17ac650a88',
        'verdict': 'KEEP',
        'memoryStatus': 'memory_required',
        'reasonDe': 'Die Entscheidung beschränkt den Abruf auf einen stabilen begrifflichen Modellanker. Modellabhängige Schätzung, Inflationsrate gegenüber Inflationsänderung und fehlendes politisches Soll gehören zusammen; Rechnen, Schätzrevision und begrenzte Interpretation verbleiben im Fallverständnis. Die alte Instrumentliste erfüllt diesen verengten Origin nicht. Die Memoryentscheidung ist inhaltlich tragfähig, ihre konkrete Nachfolgerkarte hat jedoch den unten getrennt ausgewiesenen Präzisionsmangel. Das ist keine erneute unabhängige Fachfreigabe meines eigenen Ziel-/P-Entwurfs.',
        'reasonEn': 'The decision limits retrieval to a stable conceptual model anchor. Model-dependent estimation, inflation versus its change and the absence of a policy target belong together; calculation, revised estimates and bounded interpretation remain case understanding. The old instrument list does not fit this narrowed origin. The memory choice is sound, but its proposed card has the separate precision defect below. This is not a new independent scientific approval of my own goal/profile authoring.',
        'understandingDe': 'Die geschätzte Schwelle bezeichnet im gegebenen Modell den Punkt Δπ=0: Die Inflationsrate bleibt konstant, auch wenn sie positiv ist. Sie ist weder jede Quote mit sinkender Inflation noch eine direkt beobachtete oder politisch wünschenswerte Quote.',
        'understandingEn': 'In the supplied model the estimated threshold is the point Δπ=0: inflation remains constant, including at positive rates. It is not every unemployment rate associated with falling inflation, nor a directly observed or desirable policy rate.',
        'observablePerformanceDe': 'Im gelieferten ersten Fall werden bei u=7 und u*=5 zunächst −0,6 Prozentpunkte und 1,8% Inflation erklärt; nach Revision auf u*=7 ergeben sich 0 Prozentpunkte und konstante 2,4%. Die Revision beweist keine neue reale Preisbeobachtung.',
        'observablePerformanceEn': 'In the supplied first case, u=7 and u*=5 imply −0.6 percentage points and inflation of 1.8%; revising u* to 7 gives zero change and constant 2.4% inflation. Revision alone proves no new observed price outcome.',
        'transferDe': 'Beim gelieferten Schätzbereich 4–6 mit u=5 sind −0,4/0/+0,4 Prozentpunkte möglich. Der Abrufanker ersetzt die Begründung dieser verschiedenen bedingten Vorzeichen und des geänderten Bereichs 5–6 nicht.',
        'transferEn': 'With observed u=5 and a supplied 4–6 estimate range, −0.4/0/+0.4 percentage points are possible. The recall anchor does not replace reasoning about these conditional signs or the revised 5–6 range.',
        'counterexampleDe': 'Bei u=7 und u*=5 sinkt die Inflationsrate von 2,4 auf 1,8: Sie beschleunigt nicht, aber die beobachtete Quote 7 ist nicht die geschätzte Schwelle 5. Deshalb genügt „nicht beschleunigt“ als alleinige Kartendefinition nicht.',
        'counterexampleEn': 'At u=7 and u*=5, inflation falls from 2.4 to 1.8: it does not accelerate, yet observed unemployment of 7 is not the estimated threshold of 5. Therefore “does not accelerate” alone is insufficient as a card definition.',
        'linkedCardVerdict': 'REVISE',
    },
    {
        'goalId': '1826fe19-4d06-5183-9b41-9121ae1cc219',
        'verdict': 'KEEP',
        'memoryStatus': 'memory_required',
        'reasonDe': 'Der neue Origin ist genau der Marktmachtmechanismus. Ein kurzer Begriff von Marktmacht samt Grenze des Anbieterzählens trägt die Fallarbeit; die bisherige Liste verschiedener Marktversagenstypen überschreitet diesen Origin. Die Entscheidung verlangt weder eine auswendig gelernte Preis-/Mengenfolge noch die vollständige Ursachenanalyse als fertigen Merksatz.',
        'reasonEn': 'The new origin is specifically the market-power mechanism. A short definition and the limits of supplier counting support the cases; the old list of distinct market-failure types exceeds this origin. The decision does not require memorising universal price/output effects or a complete causal analysis.',
        'understandingDe': 'Tatsächliche Macht beruht auf konkretem Handlungsspielraum, fehlendem Ausweichen und Zugang; mögliche Ineffizienz ergibt sich erst zusammen mit Nachfrage, Kosten und wirksamen Regeln.',
        'understandingEn': 'Actual power depends on concrete discretion, alternatives and entry; possible inefficiency depends additionally on demand, costs and binding rules.',
        'observablePerformanceDe': 'Im gelieferten Optionsfall ist Preis60/Menge40 mit Gewinn1.600 unter den drei gegebenen Optionen gewählt. Höherer Preis und niedrigere Menge gegenüber20/100 werden über Macht und Eintrittssperre erklärt, ohne ein allgemeines Optimum oder eine genaue Wohlfahrtszahl zu behaupten.',
        'observablePerformanceEn': 'In the supplied option case, price60/output40 with profit1,600 is chosen among the three given options. Higher price and lower output than20/100 are explained through power and blocked entry without claiming a general optimum or exact welfare loss.',
        'transferDe': 'Bei der gelieferten Fähre verändert die tatsächlich durchgesetzte5/50-Lizenz den Wahlraum trotz eines Betreibers und gesperrten Eintritts. Begriffsabruf allein liefert diese regelabhängige Erklärung nicht.',
        'transferEn': 'In the ferry case, an actually enforced5/50 licence changes the feasible choices despite one operator and blocked entry. Definition recall alone does not establish this rule-dependent explanation.',
        'counterexampleDe': 'Ein einziger Betreiber kann im gegebenen Lizenzfall dieselbe5/50-Versorgung wie die Wettbewerbsreferenz erbringen. „Ein Anbieter bedeutet immer höherer Preis und geringere Menge“ wäre daher falsch; die Nachfolgerkarte behauptet es nicht.',
        'counterexampleEn': 'One operator can deliver the same5/50 service as the competitive reference under the supplied licence. “One supplier always means higher prices and lower output” would be false; the successor card makes no such claim.',
        'linkedCardVerdict': 'KEEP',
    },
    {
        'goalId': 'a2fa1186-df35-5954-a9a9-e311a55e218f',
        'verdict': 'KEEP',
        'memoryStatus': 'no_memory_needed',
        'reasonDe': 'Die beiden ganzen Fälle liefern Wissen, Nutzen/Kosten, gemeinsame Bewertung und Teilnahmegrenzen. Der lernzielgerechte Nachweis liegt in der vorvertraglichen Auswahlkette und deren Bedingungsänderung. Es gibt keine unausgesprochene Abrufpflicht für feste Zahlen, Formel, Artikel oder Typenliste. no_memory_needed verneint eine gesonderte harte SRS-Pflicht, nicht das notwendige Verständnis von Information und Anreizen.',
        'reasonEn': 'Both complete cases supply knowledge, values/costs, pooled valuation and participation limits. Appropriate evidence explains pre-contract selection and a changed causal condition. There is no implicit recall obligation for fixed numbers, formulas, articles or a types list. no_memory_needed rejects a separate hard SRS requirement, not the necessary understanding of information and incentives.',
        'understandingDe': 'Ungleiches vorvertragliches Wissen kann über gemeinsame Bewertung gute Anbieter oder günstige Risiken verdrängen. Der konkrete Informations-/Teilnahmekanal muss gegeben sein; ungleiches Wissen allein genügt nicht.',
        'understandingEn': 'Unequal pre-contract knowledge can displace high-quality providers or low-risk clients through pooled valuation. The specific information/participation channel must be established; unequal knowledge alone is insufficient.',
        'observablePerformanceDe': 'Beim Reparaturfall liegt80 unter dem Mindestpreis90 für dauerhafte Reparatur, aber über20 für kurze Reparatur. Der mögliche Ausstieg der guten Anbieter und der Verlust eines120/90-vorteilhaften Geschäfts werden erklärt; überprüfbare Qualität bearbeitet genau die Informationsursache.',
        'observablePerformanceEn': 'In the repair case,80 is below the90 minimum for lasting repairs but above20 for brief repairs. The learner explains possible good-provider exit and loss of a beneficial120/90 trade; verifiable quality addresses the information cause.',
        'transferDe': 'Beim Versicherungsfall führt die gemeinsame Prämie300 gegenüber Zahlungsgrenze160 zum möglichen Ausstieg niedriger Risiken;500-Kosten der verbleibenden Gruppe werden von dem ausdrücklich nicht gegebenen nachvertraglichen Verhaltenswechsel getrennt.',
        'transferEn': 'In the insurance case, a pooled premium300 above a160 payment limit can cause low-risk exit; the remaining group’s500 costs are distinguished from a post-contract behavioural change that is explicitly absent.',
        'counterexampleDe': 'Mit glaubwürdig überprüfbaren Risiken passen100/500-Prämien zu den gelieferten Grenzen160/560. Das bloße Schlagwort Informationsasymmetrie oder eine memorierte Untergangserzählung erklärt diese geänderte Bedingung nicht.',
        'counterexampleEn': 'With credibly verified risks,100/500 premiums fit the supplied160/560 limits. Merely recalling an information-asymmetry label or a collapse narrative does not explain this changed condition.',
        'linkedCardVerdict': None,
    },
    {
        'goalId': 'df17fd21-e9b7-598f-970e-8f541d059694',
        'verdict': 'KEEP',
        'memoryStatus': 'memory_required',
        'reasonDe': 'Nicht-Rivalität und Nicht-Ausschließbarkeit sind zwei kurze, stabile und für die Abgrenzung notwendige Grundbegriffe. Die neue Karte bindet genau diesen ordentlichen Origin; sie speichert keine garantierte Unterbereitstellung und ersetzt nicht die Erklärung einzelner Beitragsanreize aus Falldaten.',
        'reasonEn': 'Non-rivalry and non-excludability are two compact, stable concepts needed for the distinction. The new card has this precise ordinary origin; it memorises no guaranteed underprovision and does not replace explanation of individual contribution incentives from case facts.',
        'understandingDe': 'Zusätzliche Nutzung vermindert bei Nicht-Rivalität andere Nutzung nicht; Nichtzahlende können bei Nicht-Ausschließbarkeit nicht wirksam ausgeschlossen werden. Bei freiwilliger einzelner Finanzierung können private Beitragsanreize vom Gesamtnutzen abweichen.',
        'understandingEn': 'With non-rivalry, additional use does not diminish others’ use; with non-excludability, non-payers cannot effectively be excluded. Under voluntary individual funding, private contribution incentives can differ from aggregate benefit.',
        'observablePerformanceDe': 'Im Warnsignalfall werden die expliziten Empfangs-/Zugangsbedingungen mit36×40=1.440 gegenüber Kosten1.200 verbunden: Positiver Gesamtnutzen garantiert nicht, dass freiwillige Beiträge die Kosten decken.',
        'observablePerformanceEn': 'The warning case connects explicit reception/access properties with36×40=1,440 and cost1,200: positive total value does not guarantee sufficient voluntary contributions.',
        'transferDe': 'Die frei kopierbare Übersicht wird unter den gelieferten Nutzungsbedingungen von zehn knappen bezahlten Fahrradplätzen getrennt. Nachbarschaftlicher Zweck allein bestimmt den Gütertyp nicht.',
        'transferEn': 'The freely copied map is distinguished from ten scarce paid bicycle spaces using the supplied use conditions. A neighbourhood purpose alone does not determine the goods type.',
        'counterexampleDe': 'Die möglichen Beiträge zur500-Kosten-Übersicht könnten insgesamt500 erreichen; Unterbereitstellung ist nicht zwingend. Die rivalen, reservierungspflichtigen Plätze besitzen den gegebenen Nicht-Ausschließbarkeitsmechanismus nicht. Beides passt zum vorsichtigen Kartensatz „können ... begünstigen; ... nicht erzwingen“.',
        'counterexampleEn': 'Contributions towards the map’s500 cost could total500, so underprovision is not inevitable. Rival reservation-only spaces lack the specified non-excludability mechanism. Both fit the card’s conditional statement that the properties can encourage rather than force these outcomes.',
        'linkedCardVerdict': 'KEEP',
    },
    {
        'goalId': '5aaf5abf-5e70-57c6-b030-1d08a35d17b8',
        'verdict': 'KEEP',
        'memoryStatus': 'no_memory_needed',
        'reasonDe': 'Beide aktuellen ganzen Fallbriefe verweisen tatsächlich auf die bereitgestellte bilinguale Art4–6-Unterrichtsregel; die ganze Regelkarte erklärt ausdrücklich ihre Materialfunktion ohne Auswendigpflicht. Nachweis sind fallbezogene Subsumtion, Stufentrennung, Verhältnismäßigkeit und Zahlungsbeziehungen. Normtext, Artikelnummern und Fristen zusätzlich auswendig zu fordern, würde diese Kompetenz unautorisiert erweitern. Die Rechtsquellenrichtigkeit wird durch dieses Memoryurteil nicht freigegeben.',
        'reasonEn': 'Both current complete briefs actually refer to the supplied bilingual Article4–6 teaching rule; the complete rule card expressly defines its material role without memorisation. Evidence concerns case application, procedural distinctions, proportionality and payment relationships. Requiring additional unaided recall of wording, article numbers and deadlines would extend the competence without authority. This memory judgment does not approve legal-source accuracy.',
        'understandingDe': 'Die Person entnimmt der gegebenen Regel erforderlichen Haushaltsbezug, Verfahrensstufen und begrenzte Wirkung. Die Bezeichnung Regelkarte macht dieses mitgelieferte Material nicht zu einem SRS-Deck.',
        'understandingEn': 'The learner obtains the required budget connection, procedural stages and bounded effects from the supplied rule. Calling it a rule card does not make this case material an SRS deck.',
        'observablePerformanceDe': 'Im gelieferten40/60-Fall werden belegtes Risiko und noch nicht angenommener Vorschlag von einem später tatsächlich angenommenen begrenzten Schritt getrennt. Die Anwendung auf Begünstigtenpflichten nutzt die gegebene Regel und die unveränderte Beschlussklausel.',
        'observablePerformanceEn': 'In the supplied40/60 case, supported risk and a not-yet-adopted proposal are distinguished from a subsequently adopted targeted measure. Application to beneficiary obligations uses the given rule and decision clause.',
        'transferDe': 'Im zweiten Fall ändert der neue Prüfbericht den Haushaltsbefund. Die jetzt beginnende Unterrichtung ist weiterhin kein Ratsbeschluss; die gleiche mitgelieferte Regel wird auf neue urteilsrelevante Daten angewandt.',
        'transferEn': 'In the second case a new audit report changes the budget finding. The resulting notification remains distinct from a Council decision; the same supplied rule is applied to changed decision-relevant facts.',
        'counterexampleDe': 'Eine Person könnte Artikel und Fristen auswendig nennen, aber allein aus hohen Schulden die Aussetzung aller Zahlungen ableiten oder einen Vorschlag als Beschluss behandeln. Das würde den gelieferten Fallvertrag verfehlen; zusätzlicher Abruf behebt diesen Anwendungsfehler nicht.',
        'counterexampleEn': 'Someone could recall articles and deadlines yet infer suspension of every payment from high debt alone or treat a proposal as an adopted decision. This fails the supplied case contract; additional recall does not repair the application error.',
        'linkedCardVerdict': None,
    },
]

for r in reasons:
    r['wholeGoalContractObserved'] = goal_by_id[r['goalId']]
    r['wholeRootMemoryDecisionObserved'] = decision_by_id[r['goalId']]
    r['reviewAuthority'] = 'ai_candidate'
    r['status'] = 'needs_human_review'
    r['evidenceLevel'] = 'E1'
    r['maximumClaimScope'] = 'G1'

write('five-individual-memory-decisions.independent-review.json', {
    'role': 'INDEPENDENT_OF_ROOT_MEMORY_AUTHOR_FIVE_INDIVIDUAL_MEMORY_CONTENT_JUDGMENTS',
    'completedAt': now(), 'status': 'INERT_AI_REVIEW_COMPLETED',
    'verdictCounts': {'KEEP': 5, 'REVISE': 0}, 'decisions': reasons,
    'limits': limits,
    'integrationCondition': 'NAIRU successor card precision must be remedied and independently checked; no native A/M339/34scope binding yet.',
})

card_reviews = [
    {
        'cardId': 'economics-macro-labor-market', 'verdict': 'REVISE',
        'deckId': 'de_gymnasium_economics_macro_money_policy',
        'findingId': 'NAIRU-CARD-THRESHOLD-CONSTANT-INFLATION-01',
        'findingField': 'back',
        'necessityDe': 'Ein kompakter Schwellenbegriff ist für die neue NAIRU-Kompetenz ein passender enger Abrufanker. Die alte arbeitsmarktpolitische Instrumentliste passt weder als NAIRU-Definition noch als Beleg für die neuen Modellfälle.',
        'necessityEn': 'A compact threshold concept is an appropriate narrow recall anchor for the new NAIRU competence. The old labour-policy instrument list is neither a NAIRU definition nor evidence for the new model cases.',
        'originAndDeckDe': 'Der alleinige7c-Origin und das Makro-/Geldpolitikdeck passen. ID, Origin, Kategorie und Tags werden gezielt erhalten; das ursprüngliche ganze Deck bleibt als exakte History erhalten. Daraus folgt keine Gültigkeit alter Karten- oder Ziel-Fingerprints für die neue Bedeutung.',
        'originAndDeckEn': 'The sole7c origin and macro/money-policy deck fit. ID, origin, category and tags are retained; the original entire deck remains exact history. This does not make old card or goal fingerprints valid for changed content.',
        'reasonDe': 'Die Rückseite definiert die NAIRU als Quote, bei der die Inflationsrate „nicht beschleunigt“. Diese Bedingung schließt im gelieferten Modell auch fallende Inflation oberhalb der Schwelle ein und bestimmt deshalb den Schwellenpunkt nicht eindeutig. Modellabhängige Schätzung, Annahmen, Abgrenzung von null Inflation und politischem Soll sind richtig, ersetzen aber das fehlende Δπ=0/konstante Inflationsrate nicht.',
        'reasonEn': 'The back defines the NAIRU as unemployment at which inflation “does not accelerate”. In the supplied model this also includes falling inflation above the threshold, so it does not uniquely identify the threshold point. Model-dependent estimation, assumptions, and distinctions from zero inflation and a policy target are correct but do not replace the missing Δπ=0/constant inflation criterion.',
        'counterexampleDe': 'Der ganze gelieferte Fall verwendet Δπ=−0,3(u−u*) mit u=7 und u*=5: Δπ=−0,6, Inflationsrate2,4→1,8. Die Rate beschleunigt nicht, dennoch ist7 nicht die geschätzte NAIRU5. Bei u=u* ergibt sich dagegen Δπ=0.',
        'counterexampleEn': 'The complete supplied case uses Δπ=−0.3(u−u*) with u=7 and u*=5: Δπ=−0.6, inflation2.4→1.8. Inflation does not accelerate, yet7 is not the estimated NAIRU5. At u=u*, by contrast, Δπ=0.',
        'requiredRemedyDe': 'Nur die Definition auf den Punkt mit unter den Modellannahmen konstanter Inflationsrate beziehungsweise Δπ=0 präzisieren. Schätz-/Modellvorbehalt, kein Nullinflations- oder politisches Sollversprechen beibehalten. Nicht selbst geändert; Root muss einen separaten additiven Nachfolger autorieren.',
        'requiredRemedyEn': 'Clarify the definition as the point with constant inflation, or Δπ=0, under model assumptions. Retain estimation/model qualifications and the absence of zero-inflation or policy-target promises. Not changed by this reviewer; Root must author a separate additive successor.',
        'externalPrimarySupport': [
            'https://www.federalreserve.gov/boarddocs/testimony/1997/19970723.htm',
            'https://www.frbsf.org/research-and-insights/publications/economic-letter/1997/11/nairu-is-it-useful-for-monetary-policy/',
        ],
    },
    {
        'cardId': 'economics-market-failure-types', 'verdict': 'KEEP',
        'deckId': 'de_gymnasium_economics_market_order_policy',
        'findingId': None,
        'necessityDe': 'Die kurze Bedeutung von Marktmacht und der Fehlerschutz vor bloßem Anbieterzählen bilden einen passenden harten Anker. Ein kompletter Kausalablauf, eine Mechanismentypenliste oder ein allgemeiner Ineffizienzschluss sind nicht auswendig nötig.',
        'necessityEn': 'The short meaning of market power and protection against supplier-count inference form an appropriate hard anchor. A full causal narrative, mechanisms list or universal inefficiency conclusion is not required recall.',
        'originAndDeckDe': 'Der alleinige1826-Origin ist jetzt konkret auf Marktmacht begrenzt, das Marktordnungsdeck passt. Die alte Mehrmechanismenliste wird fachlich ersetzt, nicht lediglich mit neuem Hash beibehalten. Andere Karten und Origins bleiben mechanisch exakt.',
        'originAndDeckEn': 'The sole1826 origin is now specifically limited to market power and the market-order deck fits. The old multi-mechanism list is substantively replaced rather than retained with a new hash. Other cards and origins remain mechanically exact.',
        'reasonDe': 'Die ganze Rückseite lässt Preis-/Mengen-/Effizienzfolgen von Ausweichmöglichkeiten, Zugang und weiteren Bedingungen abhängen. Sie spricht von Handlungsspielraum statt eines zwingenden Monopolergebnisses und bleibt damit bei den Bedingungen beider echten Fälle.',
        'reasonEn': 'The entire back makes price/output/efficiency effects depend on alternatives, access and further conditions. It describes discretion rather than an inevitable monopoly outcome and fits both actual supplied cases.',
        'counterexampleDe': 'Die durchgesetzte Fährenlizenz erzwingt im gegebenen Fall5/50 trotz eines Betreibers und gleicht damit die Wettbewerbsreferenz an. Dieser konkrete Gegenfall widerlegt einen unbedingten Anbieterzahl-Schluss, den die Karte ausdrücklich vermeidet.',
        'counterexampleEn': 'The enforced ferry licence stipulates5/50 despite one operator, matching the competitive reference. This concrete counterexample defeats an unconditional supplier-count conclusion that the card expressly avoids.',
    },
    {
        'cardId': 'economics-market-public-goods-conditions', 'verdict': 'KEEP',
        'deckId': 'de_gymnasium_economics_market_order_policy',
        'findingId': None,
        'necessityDe': 'Eine einzelne Karte für die zwei kurzen Gütereigenschaften ist ein angemessener enger Anker; zwei separate Karten oder eine ganze gespeicherte Falllösung sind nicht notwendig.',
        'necessityEn': 'One card for the two compact goods properties is an appropriate narrow anchor; two separate cards or a memorised full case solution are unnecessary.',
        'originAndDeckDe': 'Der neue eindeutige Karten-ID und alleinigePUB-Origin df17 passen zum Marktordnungsdeck. Der Origin ist ein ganzer ordentlicher Atomkandidat, kein Cluster, Erinnerungsziel oder früherer breiter Marktversagens-Origin. Seine stabile aktive technische Einbindung bleibt Folgearbeit.',
        'originAndDeckEn': 'The new unique card ID and solePUB origin df17 fit the market-order deck. The origin is a complete ordinary atomic candidate, not a cluster, memory goal or former broad market-failure origin. Stable active technical binding remains follow-up work.',
        'reasonDe': 'Die beiden Definitionen treffen Nutzung und Zugang statt öffentlichen Zweck. Der Folgesatz begrenzt sich auf mögliche Begünstigung von Trittbrettfahren und Unterbereitstellung bei freiwilliger Finanzierung; er macht keine zwingende Folge oder staatliche Finanzierungspflicht zum Abrufgegenstand.',
        'reasonEn': 'Both definitions address use and access rather than public purpose. The final sentence limits itself to possible encouragement of free-riding and underprovision under voluntary funding; it requires no inevitable outcome or mandatory state financing.',
        'counterexampleDe': 'Positiver Gesamtnutzen kann mit ausreichenden freiwilligen Beiträgen einhergehen, sodass Unterbereitstellung nicht zwangsläufig ist. Zugleich sind die gegebenen zehn bezahlten Reservierungsplätze trotz Nachbarschaftszweck rival und ausschließbar. Die Karte lässt beide Abgrenzungen zu.',
        'counterexampleEn': 'Positive total benefit can coexist with sufficient voluntary contributions, so underprovision is not inevitable. The supplied ten paid reserved spaces remain rival and excludable despite their neighbourhood purpose. The card supports both distinctions.',
    },
]

for r in card_reviews:
    r['wholeCardObserved'] = card_by_id[r['cardId']]
    r['reviewAuthority'] = 'ai_candidate'
    r['status'] = 'needs_human_review'
    r['evidenceLevel'] = 'E1'
    r['maximumClaimScope'] = 'G1'

write('three-whole-cards.independent-review.json', {
    'role': 'THREE_WHOLE_ROOT_AUTHORED_CARD_CONTENT_NECESSITY_ORIGIN_REVIEWS',
    'completedAt': now(), 'status': 'INERT_AI_REVIEW_COMPLETED',
    'verdictCounts': {'KEEP': 2, 'REVISE': 1}, 'cards': card_reviews,
    'limits': limits,
})

additional = json.loads((OUT / 'additional-whole-material-inputs.before-guards.json').read_text())['artifacts']
actual_read = []
for item in additional:
    path = Path(item['path'])
    if path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            obj = json.loads(line)
            if obj['goalId'] not in goal_by_id:
                continue
            profile = obj['profile']
            actual_read.append({
                'path': str(path), 'wholeFileSha256': item['sha256'],
                'goalId': obj['goalId'], 'wholeProfileRead': True,
                'allExpectationsAndCoverageAndVariationAxesRead': True,
                'applicationCaseBriefs': [{'id': c['id'], 'wholeDEAndENTaskExpectedPerformanceUnderstandingRead': True} for c in profile['applicationCaseBriefs']],
                'observedProfileFingerprint': obj['profileFingerprint'],
                'observedGoalFingerprint': obj['goalFingerprint'],
                'observedReviewInputFingerprint': obj['reviewInputFingerprint'],
                'observedStatus': obj['status'], 'observedReviewAuthority': obj['reviewAuthority'],
                'observedEvidenceLevel': obj['evidenceLevel'], 'observedMaximumClaimScope': obj['maximumClaimScope'],
                'fingerprintsAreInputObservationsNotNewStableMemoryQualifications': True,
                'ownPriorAuthoredGoalAndProfile': obj['goalId'].startswith('7c72848d'),
                'reviewUseOnly': 'Memory/card fit and absence of an unaided recall obligation; no new whole-goal/P scientific qualification.',
            })
    else:
        actual_read.append({'path': str(path), 'wholeFileSha256': item['sha256'], 'wholeBilingualSuppliedRuleCardRead': True, 'observedRole': 'case material, not SRS', 'legalAccuracyApproval': False})
assert len([x for x in actual_read if 'goalId' in x]) == 5
assert sum(len(x.get('applicationCaseBriefs', [])) for x in actual_read) == 10
write('actual-whole-material-read-and-role-boundaries.receipt.json', {
    'completedAt': now(), 'role': 'ACTUAL_WHOLE_FIVE_PROFILE_TEN_BILINGUAL_CASE_MATERIAL_READ',
    'fiveWholeDEENTargetContractsRead': True, 'fiveWholeMemoryDecisionsRead': True,
    'threeWholeSuccessorCardsRead': True, 'twoWholeOriginalCardsRead': True,
    'wholeProfileCount': 5, 'bilingualCaseCount': 10, 'inputs': actual_read,
    'unchanged20CardContentClaim': 'Whole JSON object bytes mechanically compared; no fresh substantive reading or reapproval of unchanged cards claimed.',
    'limits': limits,
})

write('NAIRU-precision-primary-source-observations.json', {
    'observedAt': now(), 'method': 'Official primary pages actually opened with the web tool; no full article copied.',
    'observations': [
        {
            'url': 'https://www.federalreserve.gov/boarddocs/testimony/1997/19970723.htm',
            'title': 'Governor Laurence H. Meyer, Conduct of monetary policy, 23 July 1997',
            'support': 'The explanation identifies a threshold associated with a constant inflation rate; constant inflation need not equal zero. It also distinguishes theoretical threshold and uncertain estimation.',
            'usedFor': 'Precision of the Root-authored compact card, not new source-scope or own-goal scientific approval.',
        },
        {
            'url': 'https://www.frbsf.org/research-and-insights/publications/economic-letter/1997/11/nairu-is-it-useful-for-monetary-policy/',
            'title': 'John Judd, NAIRU: Is It Useful for Monetary Policy?, 21 November 1997',
            'support': 'The model discussion separates rising inflation below the threshold and falling inflation above it, and explains estimation uncertainty and model limitations.',
            'usedFor': 'Counterexample to defining the threshold only by absence of accelerating inflation.',
        },
    ],
    'externalMaterialIsNotRepositoryOwnContentOrRelicensed': True,
})

code_binding = binding(Path('app/scripts/memoryCardReview.ts'))
write('mechanical-method-code-input-binding.json', {
    'capturedAt': now(), 'artifacts': [code_binding],
    'readScope': 'Existing types and per-record shape validation only; no native whole memory run invoked.',
    'exportCardDeckSchema': 'contracts/curriculum-package/v1/card-deck.schema.json was read; it describes a separate closed export format, not these observed legacy runtime decks. No inappropriate export-schema pass claimed.',
})

all_bindings = json.loads((OUT / 'inputs.before-guards.json').read_text())['artifacts'] + additional + [code_binding]
unique = {x['path']: x for x in all_bindings}
guards = []
for item in sorted(unique.values(), key=lambda x: x['path']):
    end = binding(Path(item['path']))
    ok = end == item
    guards.append({'path': item['path'], 'before': item, 'end': end, 'unchanged': ok})
assert all(x['unchanged'] for x in guards), 'An input changed during independent review'
write('all-actual-input-artifacts.end-guards.json', {
    'completedAt': now(), 'artifactCount': len(guards), 'allUnchanged': True, 'artifacts': guards,
})

(OUT / 'INDEPENDENT-REVIEW.md').write_text('''# Getrennte unabhängige INERT-Memory-/Kartenrezension

Fünf individuelle Memoryentscheidungen: **5 KEEP**. Drei ganze Root-Karten: **2 KEEP, 1 REVISE**. Das Paket ist wegen der NAIRU-Kartenrückseite noch nicht vollständig zur technischen Folgequalifikation geschlossen.

Der konkrete Befund betrifft nur die Definition auf `economics-macro-labor-market`: „nicht beschleunigt“ umfasst im gelieferten Modell auch sinkende Inflation oberhalb der geschätzten Schwelle. Bei u=7, u*=5 und Δπ=−0,3(u−u*) beträgt Δπ=−0,6 Prozentpunkte; die Inflationsrate sinkt von2,4 auf1,8%, obwohl7 nicht die Schwelle5 ist. Am Schwellenpunkt bleibt die Inflationsrate unter den Modellannahmen konstant, Δπ=0. Geschätzter Parameter, Modellvorbehalt, keine Nullinflations- und keine politische Sollbehauptung sind ansonsten passend. Die Präzisierung wird nicht von mir in Root-Autorenobjekten vorgenommen.

Die konstante Inflationsrate am Schwellenpunkt wird in der tatsächlich gelesenen [Meyer-Erklärung der Federal Reserve](https://www.federalreserve.gov/boarddocs/testimony/1997/19970723.htm) beschrieben. Die ebenfalls gelesene [FRBSF-Modellerklärung](https://www.frbsf.org/research-and-insights/publications/economic-letter/1997/11/nairu-is-it-useful-for-monetary-policy/) unterscheidet sinkende Inflation oberhalb und steigende Inflation unterhalb der Schwelle. Diese Quellen dienen nur der Kartenpräzision; sie qualifizieren weder Länder-Scope noch mein eigenes NAIRU-Ziel/P erneut unabhängig.

Marktmacht: Der kurze Anker zu tatsächlichem Handlungsspielraum und zur Grenze bloßen Anbieterzählens passt zu beiden ganzen Fällen. Insbesondere erzwingt der einzelne Fährenbetreiber bei wirksamer5/50-Lizenz keine zusätzliche Preis-/Mengenbeschränkung. PUB: Die einzelne neue Karte bindet Nicht-Rivalität/Nicht-Ausschließbarkeit an tatsächliche Nutzung/Zugang und lässt freiwillige Finanzierung sowie mögliche Trittbrettfolgen bedingt. INFO benötigt die erklärte vorvertragliche Auswahlkette, keine feste Abrufliste. Die EU-Kompetenz verwendet die ganze mitgelieferte bilinguale Unterrichtsregel als Fallmaterial; Artikel-/Fristenabruf ist keine zusätzliche SRS-Pflicht. Eigenständige Gründe, Sollleistungen, Transfer und Gegenbeispiele stehen jeweils in den fünf Einzelurteilen.

Die fünf ganzen DE/EN-Zielverträge, fünf P-Profile mit zehn ganzen bilingualen Fällen, beide alten ganzen Karten, alle drei Nachfolgerkarten und die ganze mitgelieferte EU-Regelkarte wurden tatsächlich gelesen. Die übrigen20 Karten der beiden betroffenen Decks sind als ganze JSON-Objektbytes, mit Origins und bestehendem kept-Status, mechanisch exakt erhalten; ihre Inhalte wurden nicht erneut fachlich freigegeben. Deckmetadaten und alte Reihenfolge bleiben gleich, die zwei Ersatzkarten ändern ausschließlich front/back, die neue PUB-Karte ist genau einmal angehängt. Aktive Canon-/Runtime-Decks entsprechen weiterhin bytegenau den historischen BEFORE-Dateien.

Unabhängigkeit gilt gegenüber Root als Memory-/Kartenautor. Ich habe den NAIRU-Ziel-/P-Kandidaten selbst verfasst; diese Rezension ist ausdrücklich keine neue unabhängige NAIRU-Ziel/P-Fachfreigabe, kein blindes D-Votum und keine Source-/Scope-/Rechtsfreigabe. Alle E1/G1/ai_candidate/needs_human_review-Angaben bleiben wahr. ActiveWrites=0; nativeA/M339,34Scopechecks, neue stabile Fingerprints und M6/M7-Freigabe wurden nicht behauptet. Nach einem separaten additiven Root-Nachfolger ist nur der konkrete Kartenbefund erneut zu schließen; diese versiegelte Rezension bleibt unverändert.
''')

write('independent-memory-card-review.receipt.json', {
    'role': 'INDEPENDENT_FIVE_MEMORY_THREE_CARD_ROOT_AUTHOR_REVIEW_INERT',
    'reviewer': '/root/economics_final56_current_round_a',
    'status': 'COMPLETED_WITH_ONE_OPEN_PRECISE_CARD_REVISE',
    'startedAt': started, 'completedAt': now(),
    'generationParametersFingerprint': generation['sha256'],
    'actualGenerationMetadataArtifact': generation,
    'rootAuthorReceiptBinding': binding(INPUT / 'actual-SEALED-unreviewed-five-decisions-three-cards.AUTHOR-INERT.receipt.json'),
    'memoryVerdicts': {'KEEP': 5, 'REVISE': 0},
    'wholeCardVerdicts': {'KEEP': 2, 'REVISE': 1},
    'openFindingIds': ['NAIRU-CARD-THRESHOLD-CONSTANT-INFLATION-01'],
    'unchangedCardCountMechanicalOnly': 20,
    'actualWholeProfileCountRead': 5, 'actualWholeBilingualCaseCountRead': 10,
    'inputArtifactCount': len(guards), 'allInputEndGuardsExact': True,
    'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'humanReviewStatus': 'needs_human_review',
    'limits': limits,
    'next': 'Root-authored additive single-string precision remedy, then separate targeted independent closure review; stable whole-source/scope native qualifications remain separate.',
})

files = sorted(p for p in OUT.rglob('*') if p.is_file() and p.name != 'independent-review-seal.json')
artifacts = [binding(p) for p in files]
output_digest = digest((json.dumps(artifacts, ensure_ascii=False, separators=(',', ':')) + '\n').encode())
write('independent-review-seal.json', {
    'role': 'IMMUTABLE_COMPLETED_INDEPENDENT_MEMORY_CARD_REVIEW_WITH_OPEN_REVISE',
    'sealedAt': now(), 'artifactCount': len(artifacts), 'artifacts': artifacts,
    'outputDigest': output_digest, 'artifactListDigestEncoding': 'UTF-8 compact JSON artifact list plus one LF, list ordered by full path',
    'allInputEndGuardsExact': True, 'activeWrites': 0,
    'rootCandidateObjectsModified': False, 'humanApproval': False, 'currentM6OrM7Approval': False,
})
print(json.dumps({'folder': str(OUT), 'artifactCount': len(artifacts), 'inputEndGuards': len(guards), 'memoryKEEP': 5, 'cardKEEP': 2, 'cardREVISE': 1, 'unchangedCardsMechanical': 20, 'sealSha256': binding(OUT / 'independent-review-seal.json')['sha256'], 'outputDigest': output_digest}, ensure_ascii=False))
