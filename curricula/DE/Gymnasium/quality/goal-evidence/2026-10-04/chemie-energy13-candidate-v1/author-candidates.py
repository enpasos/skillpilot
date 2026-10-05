"""Author inactive Chemistry candidates; never write active curriculum or ledgers."""
import json
import hashlib
import pathlib
import datetime
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
landscape = json.loads((ROOT / CANONICAL).read_text())
goal_by_id = {goal['id']: goal for goal in landscape['goals']}
prefixes = '2be9e61a 8ceb1749 8ece9beb b95cdf98 a0e8f0f2 8b98d8ba 4928d5d1 3e433dae 4663fd80 3c9bfa10 27e4fe9b b759d50d 6b82f80e'.split()
ids = [next(g for g in goal_by_id if g.startswith(prefix + '-')) for prefix in prefixes]
authored_at = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')

def expectation(id, understanding_de, understanding_en, performance_de, performance_en):
    return dict(id=id, essentialUnderstandingDe=understanding_de, essentialUnderstandingEn=understanding_en,
                observablePerformanceDe=performance_de, observablePerformanceEn=performance_en)

def axis(id, de, en):
    return dict(id=id, textDe=de, textEn=en)

def case(id, task_de, task_en, expected_de, expected_en, focus_de, focus_en):
    return dict(id=id, taskDemandDe=task_de, taskDemandEn=task_en,
                expectedPerformanceDe=expected_de, expectedPerformanceEn=expected_en,
                understandingFocusDe=focus_de, understandingFocusEn=focus_en)

profiles = {}

profiles['2be9e61a'] = ('modeling', [
    expectation('deposit-extraction-dependence',
        'Erdöl und Erdgas entstehen über geologische Zeiträume; technisch erschließbare Lagerstätten sind begrenzt. Poröses Speichergestein unter einer abdichtenden Schicht und gering durchlässiges Gestein verlangen unterschiedliche Förderverfahren. Fördertechnik verändert konkrete Umweltpfade; ungleiche Verteilung erzeugt Lieferabhängigkeiten.',
        'Oil and gas form over geological timescales; technically recoverable deposits are finite. Porous reservoir rock beneath a seal and low-permeability rock call for different extraction methods. Extraction technology changes specific environmental pathways; uneven distribution creates supply dependence.',
        'Die lernende Person verbindet in einem neuen Lagerstättenprofil Gesteinseigenschaften und Förderverfahren, erklärt einen konkreten Umweltpfad und leitet aus begrenzten Reserven sowie einer Lieferkarte eine begründete Abhängigkeit ab.',
        'For a fresh deposit profile, the learner relates rock properties to extraction methods, explains a specific environmental pathway and derives a justified dependence from finite reserves and a supply map.')
], [
    axis('permeability', 'Poröses Speichergestein und gering durchlässiges Schiefergestein werden gegenübergestellt.', 'Porous reservoir rock is contrasted with low-permeability shale.'),
    axis('supply-boundary', 'Eine regionale Förderung und eine von wenigen Importwegen abhängige Versorgung werden verglichen.', 'Local extraction is compared with supply dependent on a small number of import routes.')
], [
    case('offshore-reservoir-and-imports',
        'Ein didaktisches Dossier zeigt ein poröses Speichergestein unter dichtem Deckgestein, ein Offshore-Bohrvorhaben und eine fiktive Lieferkarte: 70 % des Bedarfs kommen über einen Importweg. Erkläre Lagerung und Förderung, einen möglichen Verschmutzungspfad und die Folgen einer Unterbrechung; beurteile die Aussage „Neue Bohrungen machen Erdöl unbegrenzt“.',
        'A teaching dossier shows porous reservoir rock below a seal, a proposed offshore well and a fictional supply map: 70% of demand comes through one import route. Explain storage and extraction, one possible pollution pathway and the effects of a disruption; assess “new wells make oil unlimited”.',
        'Die lernende Person beschreibt Öl/Gas in Gesteinsporen unter einer abdichtenden Schicht, Förderung über eine Bohrung und z. B. eine Leckage ins Meer. Sie unterscheidet Vorrat und Förderraten, widerlegt Unbegrenztheit und begründet die Lieferabhängigkeit mit dem 70-%-Anteil statt mit einer pauschalen politischen Behauptung.',
        'The learner describes oil/gas in rock pores beneath a seal, extraction through a well and, for example, leakage into the sea. They distinguish reserves from extraction rates, reject unlimited supply and explain dependence using the 70% share rather than an unsupported political claim.',
        'Gesteinsmodell, Förderrisiko und Lieferabhängigkeit werden kausal verbunden.',
        'The rock model, extraction risk and supply dependence are connected causally.'),
    case('tight-gas-and-local-supply',
        'Ein unabhängiger Fall zeigt gering durchlässiges gasführendes Gestein, eine geplante hydraulische Stimulation und bereitgestellte Angaben zu Wasserbedarf, Bohrlochabdichtung und begrenztem förderbarem Vorrat. Prüfe „eigene Gasförderung beseitigt jede Abhängigkeit und ist ohne Wasserrisiko“; erläutere eine passende Risikominderung und ihre Grenze.',
        'An independent case shows low-permeability gas-bearing rock, planned hydraulic stimulation and supplied information on water demand, well sealing and finite recoverable reserves. Assess “domestic gas extraction removes all dependence and has no water risk”; explain one suitable risk control and its limit.',
        'Die lernende Person erklärt, dass erzeugte Risse die Durchlässigkeit erhöhen, und trennt Wasserbedarf sowie mögliche Undichtigkeiten von einer unvermeidlichen Grundwasservergiftung. Sie begründet Überwachung/Abdichtung, erkennt verbleibende Unsicherheit und unterscheidet verringerte Importabhängigkeit von endlichem Vorrat und neuer Technik-/Lieferabhängigkeit.',
        'The learner explains that induced fractures increase permeability and separates water demand and possible leaks from claims of inevitable groundwater poisoning. They justify monitoring/sealing, recognize residual uncertainty and distinguish reduced import dependence from finite reserves and new technology/supply dependencies.',
        'Eine veränderte Lagerstätte verlangt eine neue technische und geopolitische Begründung.',
        'A changed deposit requires fresh technical and geopolitical reasoning.')
])

profiles['8ceb1749'] = ('concept', [
    expectation('refinery-separation-versus-conversion',
        'Fraktionierte Destillation trennt ein Gemisch anhand unterschiedlicher Siedebereiche ohne die Kohlenwasserstoffmoleküle umzubauen. Cracken spaltet längere Kohlenwasserstoffe zu kleineren Molekülen; es ist eine chemische Umwandlung mit anderer Produktverteilung. Ein Raffinerieprozess muss deshalb Stoffidentität und Nachfrage gemeinsam berücksichtigen.',
        'Fractional distillation separates a mixture by different boiling ranges without changing hydrocarbon molecules. Cracking splits longer hydrocarbons into smaller molecules; it is a chemical transformation with a different product distribution. Refinery reasoning must therefore consider both substance identity and demand.',
        'Die lernende Person begründet aus Siedebereichs- und Produktdaten, wann getrennt oder chemisch umgewandelt wird, ordnet typische leichte/schwere Produkte zu und bilanziert ein einfaches Crackbeispiel.',
        'Using boiling-range and product data, the learner explains when separation or chemical conversion is required, assigns typical light/heavy products and balances a simple cracking example.')
], [
    axis('molecular-identity', 'Nachweis unveränderter Moleküle wird mit neu entstandenen kleineren Molekülen verglichen.', 'Evidence of unchanged molecules is contrasted with newly formed smaller molecules.'),
    axis('product-demand', 'Rohölzusammensetzung und Nachfrage nach leichten Produkten ändern sich unabhängig.', 'Crude-oil composition and demand for light products change independently.')
], [
    case('fraction-column-shortage',
        'Eine Modell-Raffinerie erhält ein Gemisch aus Pentan (Siedepunkt 36 °C), Octan (126 °C) und Dodecan (216 °C). Erkläre die Reihenfolge von Kondensation und Entnahme beim Abkühlen aufsteigender Dämpfe. Die Nachfrage nach leichten Produkten ist höher als deren Anteil im Rohöl: Kann mehrfaches Destillieren zusätzliche Pentanmoleküle erzeugen?',
        'A model refinery receives pentane (boiling point 36 °C), octane (126 °C) and dodecane (216 °C). Explain condensation and withdrawal as rising vapours cool. Demand for light products exceeds their share in crude oil: can repeated distillation create additional pentane molecules?',
        'Die lernende Person ordnet das höher siedende Dodecan dem heißeren unteren Bereich und Pentan dem kühleren oberen Bereich zu. Sie benennt die physikalische Stofftrennung und erklärt, dass Wiederholung vorhandene Stoffe besser trennt, aber keine neuen Pentanmoleküle erzeugt; zur veränderten Produktverteilung ist chemische Umwandlung nötig.',
        'The learner assigns higher-boiling dodecane to the hotter lower region and pentane to the cooler upper region. They identify physical separation and explain that repetition can improve separation but cannot create pentane molecules; a changed product distribution requires chemical conversion.',
        'Siedebereiche erklären Trennung und deren Grenze.',
        'Boiling ranges explain separation and its limit.'),
    case('fresh-cracking-analysis',
        'In einem neuen Papierfall wird Decan thermisch gecrackt; die vereinfachte Produktanalyse nennt Octan und Ethen. Formuliere eine ausgeglichene Gleichung, erkläre, warum diese Analyse nicht nur Destillation zeigt, und wähle anschließend einen Schritt zur Trennung des Produktgemisches. Keine praktische Erhitzung.',
        'In a fresh paper case decane is thermally cracked; a simplified product analysis identifies octane and ethene. Write a balanced equation, explain why this is not merely distillation and then choose a step to separate the product mixture. No heating is performed.',
        'Die lernende Person stellt C10H22 → C8H18 + C2H4 dar, erhält C- und H-Atome und begründet das Entstehen neuer Moleküle durch Bindungsänderung. Sie erkennt Destillation als nachfolgenden Trennschritt unterschiedlicher Siedebereiche und schreibt dem Cracken keine vollständige Verbrennung zu.',
        'The learner writes C10H22 → C8H18 + C2H4, conserves C and H atoms and explains that new molecules require bond changes. They identify distillation as a subsequent separation using different boiling ranges and do not confuse cracking with complete combustion.',
        'Stoffanalyse unterscheidet molekulare Umwandlung vom nachfolgenden Trennen.',
        'Product analysis distinguishes molecular conversion from subsequent separation.')
])

profiles['8ece9beb'] = ('data', [
    expectation('combustion-common-comparison-basis',
        'Vollständige Kohlenwasserstoffverbrennung liefert CO2 und Wasser; Stoffmengenkoeffizienten unterscheiden sich mit der Zusammensetzung. Energieangaben pro Mol, pro Masse oder pro nutzbarer Energie beantworten verschiedene Fragen. Eine Rangfolge ist nur mit benannter Bezugsmenge, Wirkungsgrad und Systemgrenze sinnvoll.',
        'Complete hydrocarbon combustion yields CO2 and water; stoichiometric coefficients depend on composition. Energy per mole, per mass or per useful energy answers different questions. A ranking requires a stated reference amount, efficiency and system boundary.',
        'Die lernende Person vergleicht ausgeglichene Verbrennungsreaktionen sowie Kennzahlen auf einer gemeinsamen Basis, erklärt eine geänderte Rangfolge und benennt die Grenze der Aussage.',
        'The learner compares balanced combustion reactions and indicators on a common basis, explains a changed ranking and states the claim’s boundary.')
], [
    axis('reference-amount', 'Gleiche Stoffmenge wird mit gleicher Masse oder nutzbarer Wärme kontrastiert.', 'Equal amount of substance is contrasted with equal mass or useful heat.'),
    axis('system-boundary', 'Ideale vollständige Verbrennung wird von Nutzungswirkungsgrad und vorgelagerten Emissionen abgegrenzt.', 'Ideal complete combustion is distinguished from use efficiency and upstream emissions.')
], [
    case('methane-propane-per-mole-and-mass',
        'Für vollständige Verbrennung werden positive freigesetzte Energiemengen bei gleicher Produktphase angegeben: Methan 890 kJ/mol, Propan 2220 kJ/mol; molare Massen 16 und 44 g/mol. Vergleiche Reaktionen und Energie pro Mol sowie pro Gramm. Bewerte „Propan ist immer der energiereichere Brennstoff“.',
        'For complete combustion, positive released-energy amounts at the same product phase are supplied: methane 890 kJ/mol, propane 2220 kJ/mol; molar masses 16 and 44 g/mol. Compare equations and energy per mole and per gram. Assess “propane is always the more energy-rich fuel”.',
        'Die lernende Person formuliert CH4 + 2 O2 → CO2 + 2 H2O und C3H8 + 5 O2 → 3 CO2 + 4 H2O. Sie findet 55,6 gegenüber 50,5 kJ/g, erkennt die umgekehrte Rangfolge auf Massenbasis und erklärt, dass die pro-Mol-Werte verschieden große Moleküle zählen. Der Schluss gilt für die vorgegebene vollständige Verbrennung und Produktphase.',
        'The learner writes CH4 + 2 O2 → CO2 + 2 H2O and C3H8 + 5 O2 → 3 CO2 + 4 H2O. They obtain 55.6 versus 50.5 kJ/g, recognize the reversed mass-based ranking and explain that per-mole values count molecules of different sizes. The conclusion applies to the supplied complete-combustion conditions and product phase.',
        'Eine Bezugsgrößenänderung verändert die fachliche Aussage.',
        'Changing the reference basis changes the scientific conclusion.'),
    case('fresh-useful-heat-comparison',
        'Zwei neue Modellheizungen sollen je 1000 kJ Nutzwärme liefern. Methan: 890 kJ/mol bei 80 % Nutzungswirkungsgrad; Propan: 2220 kJ/mol bei 95 %. Mit CO2 = 44 g/mol vergleiche Brennstoffbedarf und direkte CO2-Masse pro gleicher Nutzwärme. Erkläre, welche zusätzliche Information für eine Klimabilanz fehlt.',
        'Two fresh model heaters must each deliver 1000 kJ of useful heat. Methane: 890 kJ/mol at 80% efficiency; propane: 2220 kJ/mol at 95%. With CO2 = 44 g/mol, compare fuel demand and direct CO2 mass for the same useful heat. Explain what additional information is needed for a climate assessment.',
        'Die lernende Person erhält etwa 1,404 mol CH4 und 61,8 g CO2 sowie 0,474 mol C3H8 und 62,6 g CO2. Sie erklärt die Nähe der Werte aus stöchiometrischem CO2-Ausstoß und unterschiedlichem Wirkungsgrad; sie fordert z. B. Förder-/Transportemissionen und Methanverluste, statt direkte CO2-Werte als vollständige Klimabilanz auszugeben.',
        'The learner obtains about 1.404 mol CH4 and 61.8 g CO2 versus 0.474 mol C3H8 and 62.6 g CO2. They explain the close values through stoichiometric CO2 production and different efficiency; they request extraction/transport emissions and methane losses instead of treating direct CO2 as the full climate footprint.',
        'Die Nutzung verändert den Vergleich; die Systemgrenze begrenzt das Urteil.',
        'Use conditions change the comparison; the system boundary limits the judgment.')
])

profiles['b95cdf98'] = ('modeling', [
    expectation('petroleum-application-impact',
        'Erdöl liefert sowohl Brennstoffe als auch stoffliche Grundprodukte. Die Funktion eines Produkts erklärt seinen Nutzen; Verbrennung, Verluste und Entsorgung erzeugen unterschiedliche Umweltfolgen. Eine begründete Einschätzung verbindet Verwendung und konkrete Folgen ohne alle Erdölprodukte gleichzusetzen.',
        'Petroleum supplies both fuels and material feedstocks. Product function explains utility; combustion, losses and disposal create different environmental consequences. A justified assessment connects use with specific consequences without treating all petroleum products alike.',
        'Die lernende Person ordnet neue Produkte ihrer Verwendung zu und schätzt je einen begründeten Nutzen, einen Umweltpfad und eine situationsgerechte Begrenzung ab.',
        'The learner assigns fresh products to uses and assesses a justified benefit, an environmental pathway and a suitable limitation for each situation.')
], [
    axis('material-versus-fuel', 'Brennstoff und langlebiger Werkstoff werden nach ihrer tatsächlichen Nutzung verglichen.', 'Fuel and durable material are compared according to actual use.'),
    axis('release-route', 'Verbrennungsemissionen werden von Stoffverlusten in Wasser oder Boden unterschieden.', 'Combustion emissions are distinguished from material losses to water or soil.')
], [
    case('fuel-and-petroleum-plastic',
        'Ordne Diesel im Bus und einen wiederverwendeten Kunststoffbehälter aus Erdölgrundstoffen ihren Einsatzbereichen zu. Ein Kurzdatensatz nennt CO2 bei der Dieselverbrennung und Kunststoffabfall bei schlechter Entsorgung. Beurteile Nutzen und je eine Umweltfolge; prüfe „Jedes Erdölprodukt wird bei seiner Nutzung verbrannt“.',
        'Assign diesel in a bus and a reused plastic container made from petroleum feedstocks to their uses. A short dataset reports CO2 from diesel combustion and plastic waste from poor disposal. Assess benefits and one environmental consequence each; test “every petroleum product is burned during use”.',
        'Die lernende Person unterscheidet Energiebereitstellung von stofflicher Nutzung, verbindet Diesel mit direkter CO2-Freisetzung und den Behälter mit Nutzungsdauer/Abfallpfad. Sie erklärt den Nutzen Transport bzw. wiederholte Aufbewahrung und widerlegt die Gleichsetzung; sie behauptet keine vollständige Ökobilanz aus diesen Einzelangaben.',
        'The learner distinguishes energy use from material use, links diesel to direct CO2 release and the container to lifetime/waste pathways. They explain transport and repeated storage benefits and reject the conflation, without claiming a complete lifecycle assessment from these few data.',
        'Zwei Nutzungsformen begründen unterschiedliche Umweltpfade.',
        'Two forms of use explain different environmental pathways.'),
    case('fresh-lubricant-and-road-surface',
        'Ein unabhängiger Fall betrifft Schmieröl in einer Maschine und Bitumen in einer Straße. Erkläre die Verwendung, vergleiche anhand bereitgestellter Angaben Abrieb, Ölleckage und lange Nutzungsdauer und begründe eine Maßnahme. Prüfe, ob allein „nicht verbrannt“ genügt, beide Produkte als umweltfolgenfrei einzustufen.',
        'An independent case concerns lubricating oil in a machine and bitumen in a road. Explain their uses, compare supplied information on abrasion, oil leakage and long service life, and justify one measure. Decide whether “not burned” alone makes both environmentally harmless.',
        'Die lernende Person ordnet Reibungsminderung/Schutz bzw. Bindung des Straßenmaterials zu, verknüpft Leckage mit Boden-/Wasserbelastung und Abrieb mit Stoffeintrag. Sie begründet z. B. Leckagekontrolle und sachgerechte Altölerfassung, erkennt den Nutzen langer Lebensdauer und verlangt zusätzliche Herstellungs-/Entsorgungsdaten für ein Gesamturteil.',
        'The learner identifies friction reduction/protection and binding road material, links leaks to soil/water pollution and abrasion to material release. They justify leak control and proper used-oil collection, recognize long service life and request production/disposal data for an overall judgment.',
        'Eine neue Verwendung verhindert die pauschale Brennstoffschablone.',
        'A fresh use prevents a blanket fuel-based explanation.')
])

profiles['a0e8f0f2'] = ('modeling', [
    expectation('renewable-feedstock-sustainability',
        'Fossile Rohstoffe sind auf menschlichen Zeitskalen begrenzt; nachwachsende Rohstoffe benötigen Zeit, Fläche und weitere Ressourcen. Energie- und stoffliche Nutzung erfüllen verschiedene Zwecke. Nachhaltigkeit ist ein begründeter Vergleich von Klima-, Ressourcen- und sozialen Folgen über eine benannte Systemgrenze; nachwachsend bedeutet nicht automatisch folgenfrei.',
        'Fossil feedstocks are finite on human timescales; renewable feedstocks require time, land and other resources. Energy and material uses serve different purposes. Sustainability compares climate, resource and social consequences within a stated system boundary; renewable does not automatically mean impact-free.',
        'Die lernende Person recherchiert überprüfbare Angaben zu einem fossilen und einem nachwachsenden Rohstoff, ordnet Energie- oder Grundstoffnutzung zu und formuliert ein kriterienbezogenes Urteil mit Datenlücke.',
        'The learner retrieves verifiable information about a fossil and a renewable feedstock, distinguishes energy or material use and gives a criterion-based judgment identifying a data gap.')
], [
    axis('feedstock-role', 'Energieträger und Grundstoff werden jeweils auf denselben Nutzungszweck bezogen.', 'Energy-carrier and feedstock comparisons each use the same service.'),
    axis('production-conditions', 'Reststoffnutzung wird mit gezieltem Anbau und möglicher Flächenkonkurrenz kontrastiert.', 'Residue use is contrasted with dedicated cultivation and possible land competition.')
], [
    case('fossil-and-biomass-heat-research',
        'Recherchiere in zwei zugänglichen fachlichen Quellen Angaben zu fossilem Heizöl und Holz als Energieträgern für dieselbe Nutzwärme. Notiere Urheber, Datum und benutzte Aussage. Vergleiche anhand bereitgestellter bzw. recherchierter Angaben Vorrat/Nachwachsen, Verbrennung, Bereitstellung und Flächennutzung; begründe ein bedingtes Nachhaltigkeitsurteil.',
        'Using two accessible scientific sources, retrieve information about fossil heating oil and wood for the same useful heat. Record author, date and the statement used. Compare reserves/regrowth, combustion, supply and land use with supplied or retrieved information; justify a conditional sustainability judgment.',
        'Die lernende Person belegt zwei Angaben, berücksichtigt die Nutzwärme als gemeinsame Basis und unterscheidet fossilen Kohlenstoff von einem nur bei gesicherter Regeneration langfristig geschlossenen Biomassekreislauf. Sie berücksichtigt Bereitstellung und Fläche und knüpft ihr Urteil an z. B. Herkunft, Regenerationsrate und Wirkungsgrad; sie setzt „nachwachsend“ nicht mit „CO2-frei bei Verbrennung“ gleich.',
        'The learner documents two facts, uses useful heat as the common basis and distinguishes fossil carbon from a biomass cycle that closes over time only with assured regeneration. They consider supply and land use and condition their judgment on provenance, regrowth rate and efficiency; they do not call renewable combustion CO2-free.',
        'Recherchierte Daten tragen ein bedingtes Urteil zur Energieverwendung.',
        'Retrieved evidence supports a conditional judgment about energy use.'),
    case('fresh-material-feedstock-research',
        'Untersuche unabhängig einen Kunststoffgrundstoff aus Erdöl und einen Grundstoff aus nachwachsender Biomasse für gleichwertige Verpackungsfunktion. Suche je eine belegbare Angabe zu Rohstoffherkunft und Herstellungsaufwand; ein Modell-Dossier liefert Lebensdauer, Wasserbedarf und Entsorgungsoptionen. Begründe eine Entscheidung und einen fehlenden Vergleichswert.',
        'Independently investigate petroleum- and biomass-derived polymer feedstocks for an equivalent packaging function. Retrieve one documented fact each on provenance and production effort; a model dossier supplies lifetime, water demand and end-of-life options. Justify a choice and one missing comparative datum.',
        'Die lernende Person erkennt stoffliche statt energetische Nutzung und vergleicht gleichwertige Funktion, Herstellungsaufwand, Nutzungsdauer sowie Entsorgung. Sie nennt Ressourcen-/Flächenkonkurrenz und z. B. belastbare Lebenszyklusdaten als Lücke; sie leitet weder biologische Abbaubarkeit noch Recyclingfähigkeit allein aus biologischer Herkunft ab.',
        'The learner identifies material rather than energy use and compares equivalent function, production effort, lifetime and end of life. They identify resource/land competition and robust lifecycle data as a gap; they infer neither biodegradability nor recyclability from biological origin alone.',
        'Grundstoffnutzung verlangt neue Kriterien statt eines Brennstoffurteils.',
        'Material use requires fresh criteria rather than reusing a fuel judgment.')
])

profiles['8b98d8ba'] = ('data', [
    expectation('resource-measures-with-traceable-sources',
        'Aus begrenzten organischen Rohstoffen folgen unterschiedliche Maßnahmen: Bedarf senken, Nutzungsdauer erhöhen, Stoffkreisläufe verbessern und geeignete alternative Rohstoff-/Energiequellen erschließen. Eine tragfähige Ableitung benötigt Quellen mit prüfbarer Urheberschaft, nachvollziehbarer Methode und erkennbaren Interessen; fremde Aussagen und wörtliche Zitate sind kenntlich zu machen.',
        'Finite organic resources motivate different measures: reduce demand, extend use, improve material cycles and develop suitable alternative feedstock/energy sources. A defensible proposal needs sources with identifiable authorship, transparent methods and interests; borrowed claims and verbatim quotations must be identified.',
        'Die lernende Person recherchiert zwei unterscheidbare Quellen, prüft Urheberschaft und Aussagegrenzen, leitet eine Einspar- und eine Alternativmaßnahme aus konkreten Befunden ab und kennzeichnet Quellen und ein Zitat korrekt.',
        'The learner retrieves two distinct sources, checks authorship and claim boundaries, derives one conservation and one alternative-resource measure from concrete findings and marks references and a quotation correctly.')
], [
    axis('demand-versus-substitution', 'Einsparung desselben Rohstoffs und Ersatz durch eine andere Quelle müssen getrennt begründet werden.', 'Conserving the same resource and substituting another source require separate reasoning.'),
    axis('source-interest', 'Transparent dokumentierte Daten werden mit Werbung und unprüfbarer Wiederholung verglichen.', 'Transparently documented data are compared with advertising and unverifiable repetition.')
], [
    case('mobility-resource-measures',
        'Erstelle eine kurze quellenbelegte Empfehlung zur Verringerung fossiler Kraftstoffabhängigkeit im Verkehr. Recherchiere eine institutionelle oder wissenschaftliche Datenquelle und eine Quelle mit erkennbarer wirtschaftlicher Interessenlage. Prüfe Autor/Methode/Datum; leite aus den Befunden eine Einsparmaßnahme und eine alternative Energiequelle ab. Kennzeichne eine kurze tatsächlich übernommene Passage als Zitat.',
        'Write a short sourced recommendation to reduce dependence on fossil transport fuels. Retrieve an institutional/scientific data source and a source with identifiable commercial interests. Check author/method/date; derive a conservation measure and an alternative energy source from the findings. Mark one brief passage actually borrowed as a quotation.',
        'Die lernende Person verbindet z. B. vermiedene Fahrleistung oder effizientere gemeinsame Mobilität mit sinkendem Kraftstoffbedarf und eine geeignete Alternative mit ihrer Bereitstellung. Sie belegt die Verbindung zu den Quellen, benennt wirtschaftliche Interessen ohne die Quelle pauschal zu verwerfen und unterscheidet Einsparung vom Wechsel der Energiequelle; Zitat und eigene Schlussfolgerung bleiben erkennbar.',
        'The learner relates avoided travel or efficient shared mobility to reduced fuel demand and a suitable alternative to its supply requirements. They trace each connection to sources, identify commercial interests without blanket dismissal and distinguish conservation from switching energy sources; quotation and original conclusion remain distinguishable.',
        'Quellenbewertung und Maßnahmen bilden eine nachvollziehbare Argumentkette.',
        'Source appraisal and measures form a traceable reasoning chain.'),
    case('fresh-polymer-feedstock-claim',
        'Ein neues didaktisches Dossier stellt eine Herstelleranzeige „100 % nachwachsend löst jeden Rohstoffmangel“ einer transparenten Untersuchung mit Herkunft, Stichprobe und Flächenbedarf gegenüber. Ermittle die Urheber, suche eine überprüfbare ergänzende Quelle und formuliere Einsparung plus Alternative für organische Werkstoffrohstoffe; kennzeichne das Werbezitat und begrenze dein Urteil.',
        'A fresh teaching dossier contrasts a manufacturer’s claim “100% renewable solves every feedstock shortage” with a transparent study documenting provenance, sample and land use. Identify authors, retrieve a verifiable additional source and propose conservation plus an alternative for organic material feedstocks; mark the advertising quote and limit your conclusion.',
        'Die lernende Person erkennt den unbelegten Absolutanspruch, prüft die Untersuchung auf Methode und Übertragbarkeit und nennt nachvollziehbare Belege. Sie leitet z. B. längere Nutzung/Wiederverwendung sowie geeignete sekundäre oder nachwachsende Rohstoffe ab, berücksichtigt Qualitäts-/Flächengrenzen und gibt die Urheber der fremden Aussagen sichtbar an.',
        'The learner identifies the unsupported absolute claim, checks the study’s method and applicability and provides traceable evidence. They propose longer use/reuse and suitable secondary or renewable feedstocks, account for quality/land constraints and visibly attribute borrowed statements.',
        'Stoffliche Nutzung und ein absoluter Quellenanspruch verlangen unabhängigen Transfer.',
        'Material use and an absolute source claim require independent transfer.')
])

profiles['4928d5d1'] = ('concept', [
    expectation('system-boundary-heat-work-state',
        'Offene Systeme tauschen Stoff und Energie, geschlossene Systeme Energie, aber keinen Stoff, isolierte Systeme beides nicht aus. Wärme und Arbeit sind Übertragungsformen; innere Energie U und Enthalpie H = U + pV sind Zustandsgrößen. Bei nur Volumenarbeit gilt ΔU = q + w mit w = −p_extΔV; q_p = ΔH bei konstantem Druck und q_V = ΔU bei konstantem Volumen unter passenden Randbedingungen.',
        'Open systems exchange matter and energy, closed systems energy but not matter, and isolated systems neither. Heat and work are transfer modes; internal energy U and enthalpy H = U + pV are state functions. With only pressure–volume work, ΔU = q + w and w = −p_extΔV; q_p = ΔH at constant pressure and q_V = ΔU at constant volume under the relevant conditions.',
        'Die lernende Person legt eine Systemgrenze fest, klassifiziert den Austausch und erläutert anhand eines Kolbens sowie eines starren Gefäßes, warum gemessene Wärme je nach Bedingung ΔH oder ΔU entspricht.',
        'The learner defines a system boundary, classifies exchange and uses a piston and a rigid vessel to explain why measured heat corresponds to ΔH or ΔU depending on conditions.')
], [
    axis('boundary', 'Offene, geschlossene und ideal isolierte Systeme haben verschiedene Austauschmöglichkeiten.', 'Open, closed and ideally isolated systems have different exchange possibilities.'),
    axis('mechanical-condition', 'Ein beweglicher Kolben bei konstantem Außendruck wird mit einem starren Gefäß verglichen.', 'A movable piston at constant external pressure is contrasted with a rigid vessel.')
], [
    case('closed-expanding-piston',
        'In einem geschlossenen Modell-Reaktionszylinder verschiebt sich der Kolben gegen konstanten Außendruck. Das System nimmt 500 J Wärme auf und leistet 200 J Volumenarbeit nach außen; andere Arbeit ist ausgeschlossen. Klassifiziere das System, bestimme ΔU und erkläre, welche Bedeutung die 500 J bei konstantem Druck für ΔH haben. Ist „geschlossen“ gleich „energieisoliert“?',
        'In a closed model reaction cylinder the piston moves against constant external pressure. The system absorbs 500 J of heat and does 200 J of pressure–volume work on its surroundings; other work is excluded. Classify the system, find ΔU and explain what the 500 J mean for ΔH at constant pressure. Does closed mean energy-isolated?',
        'Die lernende Person erkennt keinen Stoff-, aber Energieaustausch, setzt w = −200 J und erhält ΔU = +300 J. Bei konstantem Druck und ausschließlich Volumenarbeit ist ΔH = q_p = +500 J; sie erklärt die Differenz durch pV-Arbeit und verwirft die Gleichsetzung geschlossen/isoliert sowie Wärme als im System gespeicherte Zustandsgröße.',
        'The learner identifies energy exchange without matter exchange, uses w = −200 J and obtains ΔU = +300 J. At constant pressure with only pressure–volume work, ΔH = q_p = +500 J; they explain the difference through pV work and reject both closed = isolated and heat as a stored state function.',
        'Systemgrenze und Arbeitsvorzeichen begründen den Unterschied zwischen ΔU und ΔH.',
        'Boundary and work signs explain the difference between ΔU and ΔH.'),
    case('fresh-rigid-open-isolated-classification',
        'Ein unabhängiges Papierprotokoll zeigt dieselbe Reaktion in einem starren gasdichten Kalorimeter, einem offenen Becher und einer ideal wärme- und stoffisolierten Umhüllung. Beim starren Kalorimeter werden 800 J Wärme nach außen übertragen, ohne andere Arbeit. Klassifiziere alle drei Grenzen, deute ΔU dort und erkläre, warum daraus ohne Zusatzdaten nicht ΔH = −800 J folgt.',
        'An independent paper protocol shows the same reaction in a rigid gas-tight calorimeter, an open beaker and an ideal heat- and matter-isolated enclosure. The rigid calorimeter releases 800 J of heat with no other work. Classify all three boundaries, interpret ΔU there and explain why this alone does not establish ΔH = −800 J.',
        'Die lernende Person unterscheidet geschlossen/offen/isoliert, erhält im starren Fall w = 0 und ΔU = q_V = −800 J und nennt Δ(pV) als fehlenden Zusammenhang zu ΔH. Sie erklärt, dass bei der ideal isolierten Umhüllung die innere Energie des gewählten Gesamtsystems unverändert bleibt, obwohl innerhalb Reaktion und Temperaturänderung stattfinden können.',
        'The learner distinguishes closed/open/isolated, obtains w = 0 and ΔU = q_V = −800 J for the rigid case and identifies Δ(pV) as the missing link to ΔH. They explain that internal energy of the chosen ideal isolated total system stays constant even though reaction and temperature changes can occur internally.',
        'Eine neue Grenze verändert die zulässige thermodynamische Aussage.',
        'A fresh boundary changes the permissible thermodynamic claim.')
])

profiles['3e433dae'] = ('modeling', [
    expectation('bond-energy-balance-relative-state',
        'Bindungsspaltung benötigt Energie, Bindungsbildung setzt Energie frei. Die Reaktionsenthalpie ergibt sich näherungsweise aus dem Aufwand für gebrochene minus der Freisetzung durch gebildete Bindungen, bezogen auf eine ausgeglichene Reaktion. Energiereich/energiearm ist ein relativer Vergleich passend gewählter Systeme und Mengen; Phase und zwischenmolekulare Wechselwirkungen können zusätzlich beitragen.',
        'Breaking bonds requires energy and forming bonds releases energy. Reaction enthalpy is approximately the energy for broken bonds minus energy released by formed bonds, referenced to a balanced reaction. Energy-rich/energy-poor is relative to appropriately chosen systems and amounts; phase and intermolecular interactions may also contribute.',
        'Die lernende Person verbindet vorgegebene Reaktionsenthalpien mit Bindungsänderungen, erklärt ein Vorzeichen bzw. eine Differenz und ordnet Edukt-/Produktzustände relativ ein, ohne Bindungsbruch als Energiefreisetzung darzustellen.',
        'The learner relates supplied reaction enthalpies to bond changes, explains a sign or difference and compares reactant/product states relatively without treating bond cleavage as energy release.')
], [
    axis('bond-pattern', 'Reaktionen mit gleichem Wasserstoffanteil und unterschiedlichen Halogenen werden verglichen.', 'Reactions using the same amount of hydrogen and different halogens are compared.'),
    axis('product-phase', 'Gleiche kovalente Produktbindungen bei unterschiedlicher Wasserphase zeigen die Modellgrenze.', 'Identical covalent product bonds with different water phases reveal the model’s limit.')
], [
    case('hydrogen-halogen-energy-comparison',
        'Für H2(g) + Cl2(g) → 2 HCl(g) und H2(g) + Br2(g) → 2 HBr(g) liegen Reaktionsenthalpien ungefähr −183 und −103 kJ je Reaktion wie geschrieben vor. Mittlere Bindungsenergien in kJ/mol: H–H 436, Cl–Cl 243, Br–Br 193, H–Cl 431, H–Br 366. Begründe Unterschied und Vorzeichen, und ordne jeweils Edukte/Produkte relativ ein. Nur bereitgestellte Daten, keine Durchführung.',
        'For H2(g) + Cl2(g) → 2 HCl(g) and H2(g) + Br2(g) → 2 HBr(g), supplied reaction enthalpies are about −183 and −103 kJ per reaction as written. Mean bond energies in kJ/mol: H–H 436, Cl–Cl 243, Br–Br 193, H–Cl 431, H–Br 366. Explain the difference and signs and compare reactants/products relatively. Supplied data only; no experiment.',
        'Die lernende Person vergleicht 436 + 243 − 2·431 = −183 mit 436 + 193 − 2·366 = −103 kJ. Sie begründet den größeren Nettoenergiegewinn durch das gesamte Bindungsbudget, nicht durch ein einzelnes schwaches Eduktband, und ordnet die Produkte bei gleicher stöchiometrischer Basis tiefer als die jeweiligen Edukte ein.',
        'The learner compares 436 + 243 − 2·431 = −183 with 436 + 193 − 2·366 = −103 kJ. They explain the greater net release through the full bond-energy balance rather than one weak reactant bond and place products lower than their respective reactants on the same stoichiometric basis.',
        'Netto-Bindungsbilanz trägt die energetische Einordnung.',
        'The net bond balance supports the energy comparison.'),
    case('fresh-water-phase-model-limit',
        'Für H2(g) + 1/2 O2(g) → H2O werden bei gleicher Temperatur −241,8 kJ/mol für H2O(g) und −285,8 kJ/mol für H2O(l) angegeben. Beide Produkte haben O–H-Bindungen. Erkläre, weshalb die Daten trotzdem differieren, welcher Produktzustand relativ energieärmer ist und warum eine Tabelle mittlerer gasförmiger Bindungsenergien allein den Flüssigwert nicht liefern kann.',
        'For H2(g) + 1/2 O2(g) → H2O at the same temperature, values are −241.8 kJ/mol for H2O(g) and −285.8 kJ/mol for H2O(l). Both products have O–H bonds. Explain why values still differ, which product state has lower energy relative to the shared reactants and why average gas-phase bond energies alone cannot yield the liquid value.',
        'Die lernende Person erkennt die gemeinsame Eduktbasis und den um 44,0 kJ/mol tieferen flüssigen Produktzustand. Sie erklärt zusätzliche Stabilisierung durch zwischenmolekulare Wechselwirkungen/Kondensation, trennt diese von der O–H-Bildung und benennt fehlende Phaseninformation als Grenze des reinen Bindungsmodells.',
        'The learner recognizes the common reactant basis and the liquid product state lower by 44.0 kJ/mol. They explain extra stabilization through intermolecular interactions/condensation, distinguish it from O–H formation and identify missing phase information as a limit of the simple bond model.',
        'Geänderte Phase prüft Verständnis der Bindungsmodellgrenze.',
        'A changed phase probes understanding of the bond model’s boundary.')
])

profiles['4663fd80'] = ('procedure', [
    expectation('formation-enthalpy-state-and-sign',
        'Die Standard-Reaktionsenthalpie ist die stöchiometrisch gewichtete Summe der Standard-Bildungsenthalpien der Produkte minus der Edukte. Stoffzustand, Koeffizient und Reaktionsrichtung sind entscheidend; Elemente haben nur im Standard-Referenzzustand Δ_fH° = 0. Das Vorzeichen zeigt Wärmeabgabe/-aufnahme bei konstantem Druck unter den genannten Bedingungen und sagt nichts allein über Geschwindigkeit aus.',
        'Standard reaction enthalpy is the stoichiometrically weighted sum of standard formation enthalpies of products minus reactants. State, coefficient and reaction direction matter; elements have Δ_fH° = 0 only in their standard reference states. The sign indicates heat release/uptake at constant pressure under the stated conditions, not reaction speed by itself.',
        'Die lernende Person berechnet und begründet eine Standard-Reaktionsenthalpie aus einer passenden Tabelle, prüft stöchiometrische Gewichtung und Phase und erläutert einen geänderten Wert nach Umkehr oder Zustandswechsel.',
        'The learner calculates and justifies a standard reaction enthalpy using a suitable table, checks stoichiometric weighting and phase and explains a changed value after reversal or a state change.')
], [
    axis('stoichiometry-and-direction', 'Stoffmengenkoeffizienten und Umkehr der Reaktionsgleichung verändern Betrag bzw. Vorzeichen.', 'Stoichiometric coefficients and reversal of the reaction change magnitude or sign.'),
    axis('standard-state', 'Fest, flüssig und gasförmig werden getrennt tabelliert; die Phase darf nicht stillschweigend wechseln.', 'Solid, liquid and gaseous states have separate table entries; phase cannot change silently.')
], [
    case('ammonia-formation-and-reversal',
        'Für N2(g) + 3 H2(g) → 2 NH3(g) liefert eine Tabelle Δ_fH° in kJ/mol: N2(g) 0, H2(g) 0, NH3(g) −46,1. Berechne Δ_rH° je Reaktion wie geschrieben und je Mol NH3; erkläre Vorzeichen und Wert für die umgekehrte Reaktion. Folgt daraus, dass die Hinreaktion sofort abläuft?',
        'For N2(g) + 3 H2(g) → 2 NH3(g), a table gives Δ_fH° in kJ/mol: N2(g) 0, H2(g) 0, NH3(g) −46.1. Calculate Δ_rH° per reaction as written and per mole NH3; explain the sign and reversed-reaction value. Does this show the forward reaction occurs immediately?',
        'Die lernende Person gewichtet NH3 mit 2, erhält −92,2 kJ je Reaktion bzw. −46,1 kJ/mol NH3 und für 2 NH3 → N2 + 3 H2 +92,2 kJ. Sie erklärt exotherm/endotherm durch Systemwärme und grenzt Kinetik/Aktivierungsbarriere vom Enthalpievorzeichen ab.',
        'The learner weights NH3 by 2, obtains −92.2 kJ per reaction or −46.1 kJ/mol NH3 and +92.2 kJ for 2 NH3 → N2 + 3 H2. They explain exothermic/endothermic through heat exchanged by the system and distinguish kinetics/activation barriers from the enthalpy sign.',
        'Reaktionsbezug und Vorzeichen werden begründet statt nur eingesetzt.',
        'Reaction basis and sign are explained rather than merely substituted.'),
    case('fresh-methane-product-phase',
        'Ein neuer Vergleich betrifft CH4(g) + 2 O2(g) → CO2(g) + 2 H2O. Tabellierte Δ_fH° in kJ/mol: CH4 −74,8; O2 0; CO2 −393,5; H2O(l) −285,8; H2O(g) −241,8. Berechne beide Produktphasenfälle, prüfe den Vorschlag „bei Wasser ist die Phase egal“ und deute die Differenz.',
        'A fresh comparison uses CH4(g) + 2 O2(g) → CO2(g) + 2 H2O. Tabulated Δ_fH° in kJ/mol: CH4 −74.8; O2 0; CO2 −393.5; H2O(l) −285.8; H2O(g) −241.8. Calculate both product-phase cases, assess “water’s phase does not matter” and interpret the difference.',
        'Die lernende Person erhält −890,3 kJ mit flüssigem bzw. −802,3 kJ mit gasförmigem Wasser. Sie erklärt die 88,0-kJ-Differenz als 2 mol Wasser mit zusätzlicher Kondensationswärme, hält die Atombilanz unverändert und erkennt beide Reaktionen als exotherm; sie vermischt die tabellierten Phasen nicht.',
        'The learner obtains −890.3 kJ with liquid and −802.3 kJ with gaseous water. They explain the 88.0-kJ difference as additional condensation heat for 2 mol of water, keep atom balance unchanged and classify both as exothermic without mixing table states.',
        'Ein echter Zustandswechsel prüft die Wahl der Tabelle und den Systembezug.',
        'A real state change probes table selection and system reasoning.')
])

profiles['3c9bfa10'] = ('data', [
    expectation('halogenated-use-release-source-judgment',
        'Halogenkohlenwasserstoffe unterscheiden sich nach Stoffstruktur, Nutzung und Freisetzungsfolgen. Auswirkungen auf Mensch und Umwelt hängen von Stoff und Exposition ab; ein HFKW ist nicht mit einem chlorhaltigen FCKW gleichzusetzen. Ein Urteil muss Nutzen und belegte Wirkung abwägen und Quellen, Interessen und Zitate nachvollziehbar ausweisen.',
        'Halogenated hydrocarbons differ in structure, use and release consequences. Human and environmental impacts depend on the substance and exposure; an HFC cannot be equated with a chlorine-containing CFC. Judgment must weigh benefits and documented effects and make sources, interests and quotations traceable.',
        'Die lernende Person recherchiert eine konkrete Nutzung, prüft Herkunft und Aussagegrenze der Informationen und begründet ein stoffbezogenes Urteil mit menschlichem und ökologischem Wirkungspfad sowie sauberer Quellen-/Zitatkennzeichnung.',
        'The learner retrieves a concrete use, checks provenance and the limits of information and justifies a substance-specific judgment identifying human and environmental pathways with clear references and quotation marks.')
], [
    axis('substance-and-mechanism', 'Chlorhaltige FCKW und HFKW ohne Chlor werden anhand vorgegebener Wirkungsinformationen unterschieden.', 'Chlorine-containing CFCs and chlorine-free HFCs are distinguished using supplied effect information.'),
    axis('exposure-and-source', 'Geschlossene technische Nutzung und Freisetzung sowie Werbung und transparente Fachquelle werden kontrastiert.', 'Closed technical use and release, and advertising and transparent scientific sources, are contrasted.')
], [
    case('cfc-refrigerant-source-dossier',
        'Recherchiere anhand einer zugänglichen fachlichen Quelle eine frühere technische Nutzung eines chlorhaltigen FCKW als Kältemittel. Ein didaktisches Dossier liefert dessen Ozonwirkung und mögliche Exposition bei Freisetzung; ein Herstellertext betont nur den Kühlungsnutzen. Prüfe Urheber, Aktualität und Zweck, belege die benutzten Angaben und kennzeichne ein kurzes tatsächlich entnommenes Zitat. Begründe eine Handhabungs-/Entsorgungsempfehlung aus Nutzen und Risiken; keine reale Stoffhandlung.',
        'Using an accessible scientific source, research a former technical use of a chlorine-containing CFC refrigerant. A teaching dossier supplies ozone effects and possible release exposure; a manufacturer’s text stresses only cooling benefits. Check author, currency and purpose, cite facts used and mark one brief actually copied quotation. Derive a handling/disposal recommendation from benefits and risks; no real substance handling.',
        'Die lernende Person ordnet Kälteerzeugung als Nutzen zu und verbindet Freisetzung, chlorhaltige Zersetzungsprodukte und Ozonabbau mit einer Umwelt-/Gesundheitsfolge laut Dossier. Sie berücksichtigt den angegebenen Expositionspfad, begründet Erfassung durch zuständige Fachleute, erkennt die einseitige Herstellerdarstellung und macht Quellen sowie Zitat kenntlich; sie erfindet keine aktuelle Rechtslage.',
        'The learner identifies refrigeration benefits and, using the dossier, links release and chlorine-containing breakdown products to ozone depletion and environmental/health consequences. They consider the stated exposure pathway, justify recovery by qualified personnel, recognize one-sided marketing and clearly cite sources and quotation; they invent no current legal rule.',
        'Belegte Stoffwirkung und Quellenzweck tragen eine technische Empfehlung.',
        'Documented substance effects and source purpose support a technical recommendation.'),
    case('fresh-hfc-no-ozone-shortcut',
        'In einem unabhängigen Fall beschreibt ein fiktiver Werbetext ein HFKW ohne Chlor als „umweltneutral, weil ozonfreundlich“. Bereitgestellte fachliche Informationen nennen fehlenden chlorbedingten Ozonabbau, Treibhauswirkung, Kühlungsfunktion und Risiken bei großer Freisetzung. Suche eine überprüfbare ergänzende Quelle, prüfe Urheberschaft und begründe eine Abwägung; kennzeichne das Werbezitat.',
        'In an independent case a fictional advert calls a chlorine-free HFC “environmentally neutral because ozone-friendly”. Supplied scientific information identifies no chlorine-mediated ozone depletion, greenhouse effects, cooling function and risks from major release. Retrieve a verifiable additional source, check authorship and justify a trade-off; mark the advertising quotation.',
        'Die lernende Person trennt Ozon- von Klimawirkung, bindet die Wirkung an das konkrete HFKW statt an alle Halogenverbindungen und berücksichtigt Nutzen sowie Exposition aus dem Fall. Sie verwirft den Schluss „kein Ozonabbau = keinerlei Umweltwirkung“, dokumentiert die ergänzende Quelle und begründet dichte Systeme/Rückgewinnung, ohne eine reale Freisetzung vorzunehmen.',
        'The learner separates ozone from climate effects, attributes the effect to the specified HFC rather than all halogen compounds and weighs the case’s utility and exposure. They reject “no ozone depletion = no environmental effects”, document the additional source and justify closed systems/recovery without performing a release.',
        'Eine neue Stoffklasse verhindert die unzulässige Übertragung eines Wirkungspfads.',
        'A fresh substance class prevents an invalid transfer of one effect mechanism.')
])

profiles['27e4fe9b'] = ('concept', [
    expectation('lead-battery-reversible-conversion',
        'Beim Entladen eines Blei-Akkumulators wird Pb oxidiert und PbO2 reduziert; beide Elektroden bilden in Schwefelsäure PbSO4. Elektronen fließen im äußeren Stromkreis, der Elektrolyt ermöglicht den inneren Ladungsausgleich. Laden erfordert elektrische Energie und kehrt die Gesamtumsetzung zurück; hohe Masse, begrenzte Zyklen und Blei-/Säurehandhabung begrenzen den Speicher.',
        'On discharging a lead–acid battery, Pb is oxidized and PbO2 is reduced; both electrodes form PbSO4 in sulfuric acid. Electrons flow through the external circuit and the electrolyte provides internal charge balance. Charging requires electrical energy and reverses the overall conversion; high mass, finite cycles and lead/acid handling constrain the store.',
        'Die lernende Person erläutert einen neuen Lade-/Entladefall mithilfe von Elektrodenstoffen und Ladungswegen, deutet eine Konzentrationsänderung und begründet eine geeignete oder ungeeignete Nutzung.',
        'The learner explains a fresh charge/discharge case through electrode materials and charge pathways, interprets a concentration change and justifies a suitable or unsuitable use.')
], [
    axis('operating-direction', 'Entladen als galvanischer Betrieb wird mit erzwungenem Laden verglichen.', 'Galvanic discharge is compared with externally driven charging.'),
    axis('use-demand', 'Kurzzeitig hoher Starterstrom wird mit einem gewichtsbegrenzten mobilen Speicher verglichen.', 'Brief high starter current is contrasted with a weight-limited mobile store.')
], [
    case('starter-discharge-acid-data',
        'Ein bereitgestelltes Modell eines Fahrzeug-Blei-Akkus zeigt Pb, PbO2 und Schwefelsäure vor dem Start sowie PbSO4 an beiden Elektroden und geringere Säuredichte nach mehreren Starts. Erkläre Strom-/Ladungswege und Stoffänderungen, begründe die Wiederaufladbarkeit und einen Nutzen als Starterakku. Kein realer Akku wird geöffnet.',
        'A supplied vehicle lead–acid model shows Pb, PbO2 and sulfuric acid before starting, then PbSO4 at both electrodes and lower acid density after several starts. Explain current/charge pathways and material changes, justify rechargeability and one benefit as a starter battery. No real battery is opened.',
        'Die lernende Person erklärt Oxidation von Pb und Reduktion von PbO2, elektronischen Außenweg und ionischen Innenweg. Sie deutet die Gesamtreaktion Pb + PbO2 + 2 H2SO4 → 2 PbSO4 + 2 H2O qualitativ mit Säureverbrauch, erklärt Wiederherstellung durch elektrische Ladeenergie und verbindet hohen kurzzeitigen Strom mit dem Einsatz; Masse/Umgang bleiben Grenzen.',
        'The learner explains Pb oxidation and PbO2 reduction, the external electron route and internal ionic route. They interpret Pb + PbO2 + 2 H2SO4 → 2 PbSO4 + 2 H2O qualitatively as acid consumption, explain restoration using charging energy and relate brief high current to the application while retaining mass/handling limits.',
        'Stoff- und Ladungsänderungen erklären die Speicherfunktion.',
        'Material and charge changes explain energy storage.'),
    case('fresh-charging-and-portable-choice',
        'Ein neuer Papierfall zeigt einen weit entladenen Blei-Akku, ein geeignetes Ladegerät und eine leichte tragbare Anwendung. Prüfe „Ein Ladegerät ersetzt nur verlorene Elektronen; die Elektroden bleiben unverändert“ und „derselbe Akku ist wegen seiner Wiederaufladbarkeit für jede mobile Anwendung optimal“. Beschreibe die qualitative Stoffumkehr und eine Grenze; keine praktische Ladung.',
        'A fresh paper case shows a discharged lead–acid battery, a suitable charger and a lightweight portable application. Assess “charging only replaces lost electrons; electrodes remain unchanged” and “rechargeability makes this battery optimal for every mobile use”. Describe qualitative material reversal and one limitation; no charging is performed.',
        'Die lernende Person erklärt, dass externe Energie PbSO4 wieder in die geladenen Elektrodenzustände umsetzt und die Säurezusammensetzung verändert; Elektronen werden nicht als verbrauchte Vorratsladung aufgefüllt. Sie begründet die Massengrenze für den tragbaren Einsatz und benennt sachgerechten Umgang/Entsorgung wegen Blei und Säure.',
        'The learner explains that external energy converts PbSO4 back into charged electrode states and changes acid composition; electrons are not replenished as a consumed stock. They justify the weight limit for portable use and identify proper handling/disposal because of lead and acid.',
        'Laden und ein geänderter Einsatz prüfen reversible Stoffumwandlung und Grenzen.',
        'Charging and a changed use probe reversible conversion and limitations.')
])

profiles['b759d50d'] = ('concept', [
    expectation('fuel-cell-electrodes-and-storage-role',
        'In einer Wasserstoff-Sauerstoff-Brennstoffzelle wird Wasserstoff oxidiert und Sauerstoff reduziert; die Gesamtreaktion 2 H2 + O2 → 2 H2O liefert elektrische Energie und Wärme. Im PEM-Modell gelangen Elektronen über den Außenkreis und Protonen durch die Membran. Die Zelle ist ein Energiewandler; gespeicherter Wasserstoff trägt die chemische Energie und muss zuvor mit Energieaufwand hergestellt werden.',
        'In a hydrogen–oxygen fuel cell hydrogen is oxidized and oxygen reduced; the overall reaction 2 H2 + O2 → 2 H2O supplies electrical energy and heat. In the PEM model electrons travel through the external circuit and protons through the membrane. The cell is an energy converter; stored hydrogen carries chemical energy and must first be produced using energy.',
        'Die lernende Person stellt Elektroden-/Gesamtreaktion geeignet dar, erklärt getrennte Ladungswege und unterscheidet im neuen Anwendungssystem Wasserstoffspeicher, Umwandler und Energiezufuhr bei der Herstellung.',
        'The learner represents electrode/overall reactions appropriately, explains separate charge pathways and distinguishes hydrogen storage, conversion and production energy in a fresh application system.')
], [
    axis('charge-route', 'Elektronischer Außenweg und protonischer Membranweg werden mit einem fehlerhaften Kurzschlussmodell kontrastiert.', 'The external electron route and protonic membrane route are contrasted with an erroneous short-circuit model.'),
    axis('system-role', 'Brennstoffzufuhr im Betrieb wird von vorgelagerter Wasserstoffherstellung und Speicherung unterschieden.', 'Fuel supply during operation is distinguished from upstream hydrogen production and storage.')
], [
    case('pem-device-and-reaction-balancing',
        'Erstelle ohne Vorlage ein einfaches PEM-Modell mit H2-Zufuhr an der Anode, O2-Zufuhr an der Kathode und Lampe im äußeren Kreis. Beschreibe Oxidation/Reduktion, ergänze H2 → 2 H+ + 2 e− und O2 + 4 H+ + 4 e− → 2 H2O zur gemeinsamen Elektronenbilanz und Gesamtreaktion. Warum dürfen die Elektronen nicht durch die Membran zur Kathode abkürzen?',
        'Without a template, construct a simple PEM model with H2 supplied at the anode, O2 at the cathode and a lamp in the external circuit. Explain oxidation/reduction, align H2 → 2 H+ + 2 e− and O2 + 4 H+ + 4 e− → 2 H2O to a common electron balance and derive the overall reaction. Why must electrons not bypass the lamp through the membrane?',
        'Die lernende Person verdoppelt die Anodenreaktion, erhält 2 H2 + O2 → 2 H2O und erklärt H+-Transport durch PEM sowie e−-Fluss von Anode über Lampe zur Kathode. Sie bezeichnet Wasserstoff als Elektronendonator und Sauerstoff als Akzeptor und erkennt, dass ein elektronisch leitender Membranweg den nutzbaren Außenstrom kurzschließen würde.',
        'The learner doubles the anode reaction, obtains 2 H2 + O2 → 2 H2O and explains H+ transport through the PEM and electron flow from anode through the lamp to cathode. They identify hydrogen as donor and oxygen as acceptor and explain that an electronically conducting membrane would bypass the useful external circuit.',
        'Bilanz und getrennte Ladungswege erklären den Umwandler.',
        'Balance and separate charge routes explain the converter.'),
    case('fresh-hydrogen-chain-not-a-battery',
        'Ein unabhängiges Systemdiagramm nennt Solarstrom → Elektrolyseur → H2-Tank → Brennstoffzelle → Verbraucher. Vergleiche es mit einem Akku: Wo befindet sich der gespeicherte chemische Energieträger, welcher Schritt verlangt zuvor elektrische Energie und was passiert beim Stoppen der H2-Zufuhr? Prüfe „Die Brennstoffzelle ist selbst der Wasserstoffspeicher und erzeugt Energie ohne vorherigen Aufwand“.',
        'An independent system diagram shows solar electricity → electrolyser → H2 tank → fuel cell → consumer. Compare it with a battery: where is the stored chemical energy carrier, which prior step requires electricity and what happens when H2 supply stops? Assess “the fuel cell itself stores hydrogen and creates energy without prior input”.',
        'Die lernende Person ordnet Herstellung, Tank und Umwandlung korrekt zu, erklärt die endotherme/energiebedürftige Wasserspaltung und Rückumwandlung mit Verlusten. Sie sagt, dass ohne Nachlieferung die Brennstoffreaktion nach Verbrauch der verbliebenen Gase stoppt; sie unterscheidet die externe Brennstoffversorgung vom im Akku enthaltenen regenerierbaren Reaktionssystem und behauptet keine freie Energieerzeugung.',
        'The learner correctly assigns production, tank and conversion, explains energy-requiring water splitting and subsequent conversion with losses. They state that without resupply fuel-cell reaction stops after residual gases are consumed; they distinguish external fuel supply from a battery’s contained regenerable reaction system and claim no free energy creation.',
        'Eine neue Systemgrenze trennt Speicher, Energieträger und Umwandler.',
        'A fresh system boundary separates storage, energy carrier and conversion.')
])

profiles['6b82f80e'] = ('modeling', [
    expectation('lithium-ion-host-ion-electron-path',
        'Ein vereinfachter Lithium-Ionen-Akku enthält zwei lithiumaufnehmende Elektroden, ionenleitenden Elektrolyten und einen elektronisch trennenden Separator. Beim Entladen verändern sich die Lithiumbelegung und Oxidationszustände; Li+-Ionen bewegen sich im Inneren, Elektronen über den äußeren Verbraucher. Laden kehrt die Vorgänge mit Energiezufuhr um; diese Speicherbauart ist keine beliebig oft oder unter beliebigen Bedingungen nutzbare Energiequelle.',
        'A simplified lithium-ion battery has two lithium-hosting electrodes, ion-conducting electrolyte and an electronically separating separator. Discharge changes lithium occupancy and oxidation states; Li+ ions travel internally and electrons through the external load. Charging reverses these processes using energy; this store is not an unlimited source under arbitrary conditions.',
        'Die lernende Person erklärt Aufbau, Lade-/Entladerichtung und getrennte Transportwege eines neuen vereinfachten Modells und begründet einen passenden Einsatz samt Grenze ohne metallisches Lithium als normalen Elektrodenbestandteil zu behaupten.',
        'The learner explains structure, charging/discharging direction and separate transport routes in a fresh simplified model and justifies a suitable use and limit without treating metallic lithium as a normal electrode component.')
], [
    axis('transport-direction', 'Entladung und externe Ladung kehren die Stofftransport- und Elektronenrichtung um.', 'Discharge and external charging reverse ion-transport and electron-flow directions.'),
    axis('separator-function', 'Ionischer Transport bei elektronischer Trennung wird mit einem inneren Kurzschluss kontrastiert.', 'Ionic transport with electronic separation is contrasted with an internal short circuit.')
], [
    case('simplified-graphite-host-discharge',
        'Ein bereitgestelltes vereinfachtes Modell zeigt vor dem Entladen eine lithiumreiche Graphitelektrode, eine lithiumärmere Metalloxid-Wirtselektrode und einen Separator. Erläutere, wie Li+ und Elektronen beim Anschluss einer Lampe gelangen, wie sich die Lithiumbelegung verändert und weshalb diese Bauart für mobile Geräte genutzt wird. Keine Gleichung einer nicht benannten Akkuchemie wird verlangt.',
        'A supplied simplified model shows a lithium-rich graphite electrode, a lithium-poorer metal-oxide host electrode and a separator before discharge. Explain Li+ and electron routes when a lamp is connected, the change in lithium occupancy and why this battery type is used in mobile devices. No equation for an unspecified cell chemistry is required.',
        'Die lernende Person beschreibt Lithiumabgabe/Deinterkalation an der Graphitelektrode und Aufnahme in den anderen Wirt, Li+-Transport durch Elektrolyt/Separator sowie e−-Transport durch die Lampe. Sie trennt Ionen und Elektronen, nennt Wiederaufladbarkeit und günstige Energie pro Masse als Nutzungsvorteile und vermeidet die Behauptung eines Vorrats freier Elektronen oder einer üblichen metallischen Lithiumfolie.',
        'The learner describes lithium release/deintercalation from graphite and uptake by the other host, Li+ transport through electrolyte/separator and electron transport through the lamp. They distinguish ions and electrons, identify rechargeability and favourable energy per mass as benefits and avoid claims of a stock of free electrons or a normal metallic-lithium foil.',
        'Bauteile und Transportwege begründen die mobile Speicherfunktion.',
        'Components and transport routes explain mobile storage.'),
    case('fresh-charge-and-separator-failure',
        'Unabhängig liegt ein neues Ladebild vor: Das Ladegerät stellt die lithiumreiche Graphitelektrode wieder her. Ein zweites Papiermodell ersetzt den Separator durch eine elektronisch leitende Brücke. Erkläre Ladungs-/Stoffrichtung und Energiezufuhr beim Laden, begründe die Funktion des Separators und nenne einen geeigneten Umgang bei beschädigtem realem Akku; es wird kein Akku geöffnet oder kurzgeschlossen.',
        'Independently, a fresh charging diagram shows a charger restoring lithium-rich graphite. A second paper model replaces the separator with an electronically conducting bridge. Explain charging directions and energy input, justify the separator’s function and identify appropriate handling of a damaged real battery; no battery is opened or short-circuited.',
        'Die lernende Person kehrt Lithiumionen- und Elektronentransport gegenüber dem Entladen um und nennt extern zugeführte Energie. Sie erkennt bei leitender Brücke inneren Kurzschluss und mögliche starke Erwärmung statt nützlichen Verbraucherflusses; einen beschädigten Akku verwendet oder manipuliert sie nicht und wendet sich an zuständige Aufsicht/Fachstelle. Sie knüpft Nutzung an geeignete Ladebedingungen und intakte Bauteile.',
        'The learner reverses lithium-ion and electron transport relative to discharge and identifies external energy input. They recognize an internal short circuit and possible substantial heating rather than useful external current; they do not use or tamper with a damaged battery and contact the responsible supervisor/qualified service. They condition use on suitable charging and intact components.',
        'Ladeumkehr und Fehlerfall prüfen die Funktion des Bauteilmodells.',
        'Charging reversal and a fault case probe the component model.')
])

revisions = {
    '2be9e61a': (
        'Die lernende Person kann Lagerstätten und Fördermethoden der Erdöl- und Erdgasgewinnung erläutern und dabei die begrenzte Verfügbarkeit, ökologische Risiken und geopolitische Abhängigkeiten begründet einordnen.',
        'The learner can explain deposits and methods of petroleum and natural gas extraction and give a reasoned account of finite availability, ecological risks and geopolitical dependencies.',
        'HE E.4#B01A01 enthält ausdrücklich begrenzte Ressource und geopolitische Aspekte; das aktuell als exact zugeordnete Ziel nennt beide nicht. Die begründete Förderungseinordnung bleibt eine zusammenhängende Routine; kein neues Nebenlernziel und kein Ersatz durch bloßes Risikobenennen.'),
    'b759d50d': (
        'Die lernende Person kann die Vorgänge an den Elektroden einer Wasserstoff-Sauerstoff-Brennstoffzelle beschreiben, die ablaufenden Reaktionen geeignet darstellen und ihren Einsatz als Energiewandler mit Wasserstoff als gespeichertem Energieträger erläutern.',
        'The learner can describe the electrode processes in a hydrogen–oxygen fuel cell, represent the chemical reactions appropriately and explain its use as an energy converter with hydrogen as the stored energy carrier.',
        'Die Brennstoffzelle ist kein Energiespeicher; HE E.5#B01A01 benennt Wasserstoff als Energiespeicher. BY C10-HG_SG_MUG_WWG_SWG.5.7 verlangt zusätzlich geeignete Reaktionsdarstellung, die im aktuellen EN-Text fehlt. Herstellung durch Elektrolyse ist im HE-Bullet nur partial an dieses Ziel gebunden und zusätzlich an das bestehende Elektrolyseziel; keine neue Elektrolysekompetenz wird in diesen Atom eingefügt.')
}

reasons = {
    '2be9e61a': 'Geologische Förderbedingungen, endlicher Vorrat, Umweltpfade und geopolitische Abhängigkeit werden in zwei unterschiedlichen Lagerstättenfällen gemeinsam begründet.',
    '8ceb1749': 'Eine qualitative Raffinerieroutine kontrastiert physikalische Trennung und chemische Umwandlung; die aktuelle gültige Atomaritätsentscheidung wird erhalten.',
    '8ece9beb': 'Brennstoffvergleich verlangt ausgeglichene Reaktionen, gemeinsame Bezugsbasis, Nutzungswirkungsgrad und explizite Systemgrenze; die zweite Aufgabe verändert die Vergleichsfrage chemisch und funktional.',
    'b95cdf98': 'Erdölprodukte werden funktionsbezogen und mit unterschiedlichen Umweltpfaden beurteilt; Fälle bleiben für den belegten bayerischen Sek-I-Ursprung zugänglich.',
    'a0e8f0f2': 'Die originale Recherche-/Bewertungskompetenz zu Energie- und Grundstoffnutzung bleibt vollständig erhalten; beide Fälle erfordern tatsächlich auffindbare Quellen und ein bedingtes Nachhaltigkeitsurteil.',
    '8b98d8ba': 'Originaler Maßnahmen-/Quellenauftrag wird durch Recherche, Urheberprüfung, Einsparung, Alternative und sichtbare Quellen-/Zitatkennzeichnung konkret überprüfbar.',
    '4928d5d1': 'Systemgrenzen, Wärme/Arbeit und U/H werden als zusammenhängende thermodynamische Erklärung geprüft; Vorzeichen, mechanische Bedingungen und Modellgrenzen sind explizit.',
    '3e433dae': 'Vorgegebene Enthalpiedifferenzen werden bindungsbezogen begründet; Phasenvariation prüft, dass reine kovalente Bindungswerte nicht alle Beiträge erklären.',
    '4663fd80': 'Der Originalauftrag wird einschließlich chemischer Gleichung, Koeffizienten, Zuständen und exo/endothermer Deutung erhalten; unabhängige Variation ändert Produktphase.',
    '3c9bfa10': 'Recherche, Quellenprüfung und Abwägung von Nutzen, menschlichem sowie ökologischem Wirkungspfad werden stoffbezogen geprüft; keine pauschale FCKW-Schablone oder aktuelle Rechtsbehauptung.',
    '27e4fe9b': 'Qualitative Blei-/Bleiverbindungsumsetzung, Ladungswege, Laden und Nutzung werden auf bereitgestellte Modelle gestützt; keine gefährliche reale Akkuhandlung.',
    'b759d50d': 'Elektroden-/Gesamtreaktion, Protonen-/Elektronenweg und Speicher-/Umwandlerunterscheidung sind konkrete positive Erwartungen; das bestehende fehlerhafte Bild ist keine Aufgabenvorlage und keine neue Freigabe.',
    '6b82f80e': 'Vereinfachte Wirtsmaterial-/Transportmodelle bleiben auf sourcegemäßem Abstraktionsniveau; Ladeumkehr und Separatorfehler prüfen Transfer ohne unzulässige generische Akkuformel.'
}

candidates = []
decisions = []
for id in ids:
    goal = goal_by_id[id]
    prefix = id[:8]
    archetype, expectations, axes, cases = profiles[prefix]
    profile = dict(archetype=archetype, expectations=expectations,
                   coverageExpectations=dict(requiredExpectationIds=[e['id'] for e in expectations],
                                             alternativeExpectationGroups=[], minimumIndependentDemonstrations=2,
                                             freshVariationRequired=True, independentTransferRequired=True),
                   variationAxes=axes, applicationCaseBriefs=cases)
    candidates.append(dict(goalId=id, reason=reasons[prefix] + ' Inaktiver KI-Kandidat: needs_human_review, E1/G1; keine menschliche Freigabe oder Lernendenbewährung.',
                           evidenceLevel='E1', maximumClaimScope='G1', dissent=[], profile=profile))
    rev = revisions.get(prefix)
    decisions.append(dict(goalId=id, currentTitleDe=goal['title'], currentTitleEn=goal.get('titleEn'),
                          currentDescriptionDe=goal['description'], currentDescriptionEn=goal['descriptionEn'],
                          decision='REVISE_CANDIDATE' if rev else 'KEEP_CANDIDATE',
                          proposedTitleDe=goal['title'], proposedTitleEn=goal.get('titleEn'),
                          proposedDescriptionDe=rev[0] if rev else goal['description'],
                          proposedDescriptionEn=rev[1] if rev else goal['descriptionEn'],
                          rationale=rev[2] if rev else reasons[prefix],
                          requires=[dict(goalId=p, title=goal_by_id[p]['title'], description=goal_by_id[p]['description']) for p in goal.get('requires',[])],
                          parents=[dict(goalId=p['id'], title=p['title']) for p in landscape['goals'] if id in p.get('contains',[])],
                          sourceProvenance=goal.get('extendedData',{}).get('provenance',{}),
                          independentDescriptionReviews='pending-two-independent-rounds',
                          positiveEvidenceReview='candidate-awaiting-independent-substantive-qa',
                          activeRegistration=False))

def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def current_v1_fingerprint(goal, rule):
    # Read-only parity with the published A/M V1 payload; never new approval.
    def norm(value):
        return ' '.join(unicodedata.normalize('NFKC', str(value or '')).split())
    dimension = goal.get('dimensionTags', {})
    payload = dict(ruleVersion=rule, goalId=goal['id'], shortKey=goal.get('shortKey',''),
                   title=norm(goal.get('title')), titleEn=norm(goal.get('titleEn')),
                   description=norm(goal.get('description')), descriptionEn=norm(goal.get('descriptionEn')),
                   phase=norm(dimension.get('phase')), area=norm(dimension.get('area')),
                   topicCode=norm(dimension.get('topicCode')), nodeKind=norm(goal.get('nodeKind')))
    return 'sha256:' + hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True,
                                               separators=(',', ':')).encode()).hexdigest()

write('positive-evidence.candidates.json', dict(schemaVersion=1,
      authoringContract='positive-understanding-evidence-candidates-v1',
      reviewId='chemie-energy13-candidate-v1', reviewedAt=authored_at,
      reviewer='codex-chem-energy13-author', goals=candidates))
write('description-decisions.candidates.json', dict(schemaVersion=1, authoringStatus='inactive-unreviewed-candidates',
      authoredAt=authored_at, landscapePath=CANONICAL, goals=decisions))

# Store exact source bindings as evidence of inspection, never as new approvals.
source_bundles = []
for state, source_path, review_path in [
    ('HE', 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json',
     'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'),
    ('BY', 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
     'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json')]:
    src = json.loads((ROOT / source_path).read_text())
    mapped = json.loads((ROOT / review_path).read_text())
    sg = {g['id']:g for g in src['sourceGoals']}
    passages = {p['id']:p for p in src['passages']}
    for row in mapped['mappings']:
        if row['canonicalGoalId'] not in ids:
            continue
        g = sg[row['legacyGoalId']]
        source_bundles.append(dict(goalId=row['canonicalGoalId'], state=state,
                                   sourceExtractionPath=source_path, mappingReviewPath=review_path,
                                   mapping=row, sourceGoal=g,
                                   passage=passages.get(g.get('passageId')),
                                   inspectedAs='primary-origin-source-window', newApproval=False))
all_mappings = {id:[] for id in ids}
for path in sorted((ROOT / 'curricula/DE/Gymnasium/mapping').rglob('*.json')):
    if path.name.endswith('.review.json'):
        continue
    obj = json.loads(path.read_text())
    for row in obj.get('mappings',[]):
        if row.get('canonicalGoalId') in all_mappings:
            all_mappings[row['canonicalGoalId']].append(dict(path=str(path.relative_to(ROOT)), mapping=row))
write('source-bindings.snapshot.json', dict(schemaVersion=1, inspectedAt=authored_at,
      note='Primary HE/BY source windows were read in the local official PDF/extraction and structured curriculum. Remaining mapping references are traced, not newly approved; exact/partial scope is preserved. Canonical E grouping does not move BY C9/C10/C12 source competences into Hessian E scope.',
      primarySourceWindows=source_bundles, currentMappingReferences=all_mappings))

qa = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').read_text())
qa_by_id = {r['goalId']:r for r in qa['records']}
memory_config_path = 'curricula/DE/Gymnasium/quality/memory-card-review/2026-10-01/chemie-b009-three-current-v3/config.json'
memory_cfg = json.loads((ROOT / memory_config_path).read_text())
memory_records = [json.loads(line) for line in (ROOT / memory_cfg['reviewPath']).read_text().splitlines() if line]
mem_by_id = {r['goalId']:r for r in memory_records}
atomic_by_id = {}
for path in ['curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-ephase-fossil-fuels.review.jsonl',
             'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-ephase-mobile-energy-converters.review.jsonl']:
    for line in (ROOT / path).read_text().splitlines():
        r = json.loads(line)
        atomic_by_id[r['goalId']] = dict(path=path, record=r)
states = []
for id in ids:
    g = goal_by_id[id]
    link = next((r for r in g.get('resourceLinks',[]) if r['type']=='goal-visualization'), None)
    asset = ROOT / 'app/public' / link['url'].lstrip('/') if link else None
    digest = 'sha256:' + hashlib.sha256(asset.read_bytes()).hexdigest() if asset and asset.exists() else None
    atomic = {**atomic_by_id[id], 'currentFingerprintMatches': atomic_by_id[id]['record']['fingerprint'] == current_v1_fingerprint(g, atomic_by_id[id]['record']['ruleVersion'])}
    memory = dict(configPath=memory_config_path, record=mem_by_id[id],
                  currentFingerprintMatches=mem_by_id[id]['fingerprint'] == current_v1_fingerprint(g, mem_by_id[id]['ruleVersion']))
    states.append(dict(goalId=id, atomicity=atomic, memory=memory,
                       visualization=dict(qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',
                                          record=qa_by_id.get(id), actualAssetSha256=digest,
                                          bindingMatchesCurrentAsset=bool(digest) and qa_by_id.get(id,{}).get('assetSha256')==digest,
                                          candidateAction='HOLD_MISSING_IMAGE_OR_BINDING' if not digest else
                                                          ('HOLD_CONCRETE_IMAGE_FAULT' if id.startswith('b759d50d') else
                                                          ('KEEP_SUBJECT_TO_TARGETED_BINDING_REVIEW' if id.startswith('2be9e61a') else 'KEEP_EXISTING_VALID_RECORD_NO_REREVIEW')),
                                          newApproval=False),
                       affectedByProposedTextChange=id[:8] in revisions,
                       integrationRequirement='Targeted fresh D/P/A/M/source/context/image binding review after any adopted text change; no mechanical hash-only approval.' if id[:8] in revisions else
                                              'Preserve current valid A/M/V; targeted D/P independent QA only, and review shared context bindings only if affected by another adopted text change.'))
write('existing-gates.snapshot.json', dict(schemaVersion=1, inspectedAt=authored_at, scope=ids, activeRegistration=False, records=states))
print('Wrote thirteen inactive INNER profiles, eleven KEEP/two REVISE description candidates and exact source/gate snapshots.')
