from pathlib import Path
import json,datetime,hashlib,subprocess
base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q4-twenty-seven-native-preparation-technical-20261008-v1')
# Fresh substantive independent judgments authored from all frozen pages, not generated from IDs or hashes.
data={
'f1f73ebe':[
'Sektoranteile, Produktivität und Verflechtungen von Landwirtschaft, Gewerbe und Dienstleistungen prägen unterschiedliche Wachstumspfade; ein Sektorwechsel allein belegt keine nachhaltige Entwicklung.',
'Sector shares, productivity and links between agriculture, industry and services shape different growth paths; a sector shift alone does not establish sustainable development.',
'Die Person analysiert vorgelegte Zeitreihen einer Entwicklungsökonomie, trennt Beschäftigungs- von Wertschöpfungsanteilen und erklärt einen plausiblen Wachstumspfad samt Datenbegrenzung.',
'The learner analyses supplied time series for a developing economy, separates employment from value-added shares and explains a plausible growth path with a data limitation.',
'Bei einer neuen Ökonomie mit wachsendem Dienstleistungsanteil, aber schwacher Produktivität, prüft sie neu, welche Strukturveränderungen den früheren Wachstumsschluss tragen.',
'For a new economy with a growing service share but weak productivity, the learner reassesses which structural changes support the previous growth conclusion.',
'KEEP: Struktur und Wachstumspfad gehören zu einer gemeinsamen sektoral begründeten Analyse; DE/EN erhalten beide Aspekte. Die Verbindungen zu Indikatoren und Armut begrenzen das Ziel sinnvoll, ohne deren gesamte Bewertung hier einzufordern. Das Bild zeigt mögliche Wege, keine notwendige Entwicklungsleiter.'
],
'4cccf0da':[
'Welthandel verändert Absatz, Einkommen, Beschäftigung und Abhängigkeiten je nach Faktorausstattung und Stellung eines Entwicklungslandes in der Wertschöpfungskette.',
'World trade changes sales opportunities, income, employment and dependencies according to a developing country’s factor endowment and position in value chains.',
'Die Person beschreibt für einen gegebenen Exportfall den Waren- und Zahlungsfluss sowie mögliche Chancen und Risiken für Produzenten und Beschäftigte anhand der Fallinformationen.',
'The learner describes goods and payment flows in a supplied export case and possible opportunities and risks for producers and workers using the case information.',
'Bei einem neuen Fall mit verarbeitetem Exportprodukt und anderem Absatzpartner beschreibt sie geänderte Entwicklungsfolgen, statt die Rohstoffexportwirkung pauschal zu übertragen.',
'For a new case with a processed export product and a different buyer, the learner describes changed development effects rather than copying raw-material export effects.',
'KEEP: Der beschreibende Operator ist in beiden Sprachen gleich und bezieht sich ausdrücklich auf Entwicklungsländer. Governance ist ein Folgeziel, kein zusätzlicher hier zu erfindender Bewertungsoperator. Gegenläufige Waren-/Geldpfeile und offene Einkommens-/Abhängigkeitsfragen stützen die Darstellung.'
],
'a56d5e8d':[
'Ethische Modelle begründen Globalisierungsentscheidungen mit unterschiedlichen Maßstäben wie Folgen, Rechten oder Gerechtigkeit; empirische Folgen und normative Wertungen sind zu unterscheiden.',
'Ethical models justify globalisation decisions through different standards such as consequences, rights or justice; empirical effects and normative judgments must be distinguished.',
'Die Person wendet vorgegebene ethische Ansätze auf einen globalen Produktionskonflikt an und zeigt, wie dieselben Fakten unter verschiedenen Maßstäben zu unterschiedlichen Begründungen führen.',
'The learner applies supplied ethical approaches to a global production conflict and shows how the same facts yield different justifications under different standards.',
'Bei einer neuen Entscheidung über Marktzugang statt Produktionsverlagerung wendet sie die Kriterien erneut an und benennt eine tatsächliche Grenze der jeweiligen Begründung.',
'For a new market-access decision rather than relocation, the learner reapplies the criteria and identifies an actual limitation of each justification.',
'KEEP: Anwenden benennt eine überprüfbare modellgeleitete Operation. DE/EN halten den Globalisierungsbezug; CSR folgt als betriebliche Konkretisierung. Das Bild unterscheidet Perspektiven, ohne einen verbindlichen Ansatz oder moralischen Sieger vorzugeben.'
],
'fed15db6':[
'Der HDI fasst Gesundheit, Bildung und Lebensstandard zusammen; der Gini misst Ungleichverteilung. Unterschiedliche Messgegenstände, Skalen und Aggregation begrenzen direkte Rang- oder Wirkungsvergleiche.',
'The HDI combines health, education and living standard; the Gini measures inequality. Different constructs, scales and aggregation limit direct rankings and impact comparisons.',
'Die Person vergleicht gelieferte HDI-/Gini-Angaben, erklärt ihre unterschiedlichen Aussagen und begründet, weshalb ein höherer HDI allein keine geringere Ungleichheit beweist.',
'The learner compares supplied HDI and Gini data, explains their different statements and justifies why a higher HDI alone does not prove lower inequality.',
'In einem neuen Datensatz mit gleichem HDI, aber anderer Verteilung, interpretiert sie den Befund unter offengelegten Skalen und nennt zusätzlich benötigte Informationen.',
'In a new dataset with equal HDI but different distribution, the learner interprets the result using disclosed scales and states what further information is needed.',
'KEEP: Kritischer Vergleich von Indikatoren ist präzise und methodenoffen. EN löst GINI sachlich als Gini coefficient auf, ohne einen neuen Kompetenzaspekt. Das native Bild trennt Lebensbedingungen und Verteilung. Ein externer P-Korrekturverdict wurde für dieses blinde D-Urteil nicht gelesen.'
],
'543bf91f':[
'Armutsindikatoren erfassen unterschiedliche materielle und soziale Einschränkungen; Entwicklungsstrategien setzen an verschiedenen Ursachen an und müssen zu den jeweils gemessenen Problemen passen.',
'Poverty indicators capture different material and social constraints; development strategies address different causes and must fit the problems measured.',
'Die Person vergleicht zwei Armutsmaße und zwei vorgelegte Strategien für einen Fall, erläutert Messunterschiede und ordnet die Maßnahmen den betroffenen Einschränkungen zu.',
'The learner compares two poverty measures and two supplied strategies for a case, explains measurement differences and links measures to the affected constraints.',
'Für eine neue Region mit verbessertem Einkommen, aber unzureichendem Zugang zu Basisdiensten, vergleicht sie die nun passenden Indikatoren und Strategieansätze neu.',
'For a new region with improved income but inadequate access to basic services, the learner reassesses appropriate indicators and strategy approaches.',
'KEEP: Indikatoren und Strategien bilden die gemeinsame Vergleichsoperation Armut/Entwicklung. DE/EN sind vollständig parallel. Die eigenständige Detailbewertung von Import-/Exportstrategien bleibt im Folgeziel048; hier wird kein pauschales Erfolgsversprechen eingeführt.'
],
'f440efea':[
'Globale Governance verbindet internationale Organisationen und Handelsregeln mit Entwicklungsinteressen; Mandate, Mitsprache, Ressourcen und Umsetzung können unterschiedlich verteilt sein.',
'Global governance connects international organisations and trade rules with development interests; mandates, participation, resources and implementation may be distributed differently.',
'Die Person reflektiert eine vorgelegte Entwicklungssituation, unterscheidet organisatorische Zuständigkeiten von Handelsregeln und begründet Möglichkeiten und Grenzen der Beteiligung.',
'The learner reflects on a supplied development situation, distinguishes organisational responsibilities from trade rules and justifies opportunities and limits of participation.',
'Bei einem neuen Fall mit formal gleichem Marktzugang, aber schwacher lokaler Umsetzung, untersucht sie, welche Governance-Bedingung die vorherige Empfehlung verändert.',
'For a new case with formally equal market access but weak local implementation, the learner examines which governance condition changes the previous recommendation.',
'KEEP: Entwicklung ist der ausdrückliche Bewertungsrahmen des reflexiven Ziels; EN bewahrt ihn. Der Nachfolger e754 konkretisiert Institutionenrollen und ist nicht identisch mit diesem Entwicklungsbezug. Das Bild hält Regeln, Mittel, Mitsprache und Rechenschaft auseinander.'
],
'abb13ea9':[
'CSR und Unternehmensethik beziehen sich auf Verantwortung gegenüber Betroffenen; ein öffentlicher Anspruch, betriebliche Praxis und belegbare Wirkung können auseinanderfallen.',
'CSR and business ethics concern responsibility towards affected parties; public claims, operational practice and evidenced effects may diverge.',
'Die Person bewertet eine globale Unternehmenspraxis anhand benannter ethischer Kriterien und unterscheidet belegte Handlungen von bloßen CSR-Zusagen sowie Interessenkonflikte.',
'The learner assesses a global business practice using stated ethical criteria, distinguishing evidenced actions from CSR promises and identifying conflicts of interest.',
'Bei einem neuen Unternehmen mit überzeugender Kampagne, aber widersprüchlichen Lieferantenbefunden, begründet sie ein neues Urteil anhand der Nachweise statt der Werbung.',
'For a new company with a persuasive campaign but contradictory supplier findings, the learner justifies a fresh judgment from evidence rather than advertising.',
'KEEP: CSR und Unternehmensethik werden als gemeinsame Verantwortungsbewertung im Globalisierungskontext operationalisiert, nicht als bloßes Begriffswissen. DE/EN stimmen überein. Die finale native Seite zeigt das persönliche Papier nun textfrei; die spezifischere Gesetzesbewertung gehört zum Nachfolger36.'
],
'd6c7d2ad':[
'Modelle globaler Gerechtigkeit verteilen knappe Ressourcen nach unterschiedlichen normativen Kriterien wie Gleichheit, Bedarf und Beitrag; jedes Kriterium braucht Fallannahmen und hat Grenzen.',
'Models of global justice allocate scarce resources through different normative criteria such as equality, need and contribution; each requires case assumptions and has limits.',
'Die Person wendet mehrere vorgegebene Gerechtigkeitskriterien auf denselben globalen Verteilungsfall an, hält die Ressourcenmenge konstant und erklärt unterschiedliche Ergebnisse.',
'The learner applies several supplied justice criteria to the same global allocation case, keeps the resource total constant and explains different outcomes.',
'Bei einem neuen Fall mit verändertem Bedarf und strittiger Beitragsmessung passt sie die Modellanwendung an und begründet, welche Daten oder Wertentscheidung fehlen.',
'For a new case with changed needs and disputed contribution measurement, the learner adapts the models and justifies which data or value choice is missing.',
'KEEP: Modellanwendung ist eine eigene normativ begründete Operation, keine Festlegung auf ein einzig richtiges Verteilungsergebnis. DE/EN sind gleich. Die aktuelle native Seite zeigt dieselben fünf Personen und erkennbar konstante Gesamtmarker; die Governance-Verknüpfung bleibt im Folgezieldc55.'
],
'04809186':[
'Importsubstitution und Exportorientierung unterscheiden Zielmärkte und Instrumente; Ergebnisse hängen unter anderem von Vorleistungen, Qualifikation, Finanzierung und Absatzbedingungen ab.',
'Import substitution and export orientation differ in target markets and instruments; outcomes depend on inputs, skills, finance and demand conditions.',
'Die Person vergleicht beide vorgegebenen Strategien anhand derselben Bedingungen eines Entwicklungslandes und erklärt passende Vorteile, Risiken und Grenzen.',
'The learner compares both supplied strategies using the same developing-country conditions and explains relevant advantages, risks and limits.',
'Bei einem neuen Fall mit kleinem Binnenmarkt und unsicherer Auslandsnachfrage begründet sie, weshalb der ursprüngliche Strategievergleich neu gewichtet werden muss.',
'For a new case with a small domestic market and uncertain foreign demand, the learner explains why the previous strategy comparison must be reweighted.',
'KEEP: Der beschreibende Vergleichsoperator benennt die zentralen Strategiearten in beiden Sprachen; der Titel ordnet den kritischen Vergleich ein. Es ist kein Universalurteil oder dritter ungenannter Pflichtansatz nötig. Armutsvergleich ist vorausgesetzt; inklusive Entwicklung ist ein eigenes Folgeziel.'
],
'e21158e7':[
'Fair-Trade-Ansätze und Handelsabkommen verändern unterschiedliche Handelsbedingungen; Standards, Marktzugang und Entwicklungswirkungen sind getrennt und anhand Betroffener zu beurteilen.',
'Fair-trade approaches and trade agreements change different trade conditions; standards, market access and development effects must be distinguished and assessed for affected parties.',
'Die Person bewertet vorgelegte Fair-Trade-Bedingungen und Abkommensregeln, erklärt jeweilige Wirkungswege und wägt Vorteile sowie Grenzen für eine Produzentengruppe ab.',
'The learner assesses supplied fair-trade conditions and agreement rules, explains their respective mechanisms and weighs advantages and limits for a producer group.',
'In einem neuen Fall mit verbesserten Standards, aber geringer Teilnahme oder hohen Anpassungskosten, prüft sie die Entwicklungswirkung erneut statt ein Label als Erfolg zu behandeln.',
'In a new case with improved standards but low participation or high adjustment costs, the learner reassesses development effects instead of treating a label as success.',
'KEEP: Die gemeinsame entwicklungsbezogene Bewertung hält private Handelsansätze und formale Abkommen unterscheidbar. DE/EN decken beide vollständig. NGOs und spezielle Handelsabhängigkeiten folgen separat. Im Bild sind Bedingungen und Wirkung getrennt; der dargestellte Standard ist kein Lernenden- oder Erfolgsausweis.'
],
'c014b11e':[
'Menschenrechtliche Standards in Lieferketten begründen Schutzansprüche und Prüfmaßstäbe; ein formales Dokument allein zeigt weder tatsächliche Einhaltung noch wirksame Abhilfe.',
'Human-rights standards in supply chains establish protection claims and assessment criteria; a formal document alone establishes neither actual compliance nor effective remedy.',
'Die Person bewertet einen gegebenen Lieferkettenfall anhand benannter Standards, ordnet Befunde Betroffenen zu und begründet, welche Nachweise und Abhilfen relevant sind.',
'The learner assesses a supplied supply-chain case against stated standards, relates findings to affected parties and justifies relevant evidence and remedies.',
'Bei einem neuen Lieferantenfall mit positivem Audit und glaubhaften Beschwerden bewertet sie widersprüchliche Hinweise neu, ohne Dokumente automatisch für ausreichend zu halten.',
'For a new supplier case with a positive audit and credible complaints, the learner reassesses conflicting indications without treating documentation as automatically sufficient.',
'KEEP: Menschenrechtlicher Bewertungsmaßstab und globale Lieferketten sind in beiden Sprachen klar. Verantwortung unterschiedlicher Akteure und konkrete Gesetzesanwendung sind Nachfolger, keine zusätzlichen rechtlichen Detailpflichten dieses Ziels. Bildliche Prüfzeichen ersetzen keinen empirischen Einhaltungsnachweis.'
],
'4fef149e':[
'Inklusive und nachhaltige Entwicklung verbindet Teilhabe, Ressourcenschutz und langfristige Tragfähigkeit; Wachstum oder sichtbare Infrastruktur allein belegt nicht alle Kriterien.',
'Inclusive and sustainable development combines participation, resource protection and long-term viability; growth or visible infrastructure alone does not establish every criterion.',
'Die Person bewertet eine vorgelegte Strategie hinsichtlich Zugang verschiedener Gruppen, Umweltfolgen und Fortbestand unter benannten finanziellen Bedingungen.',
'The learner assesses a supplied strategy for access by different groups, environmental effects and durability under stated financial conditions.',
'Bei einer neuen Strategie mit stärkerem Durchschnittseinkommen, aber Ausschluss einer Gruppe oder Folgekosten, begründet sie ein verändertes Urteil über Inklusion und Nachhaltigkeit.',
'For a new strategy with higher average income but exclusion of a group or ongoing costs, the learner justifies a changed judgment on inclusion and sustainability.',
'KEEP: Beide Kriterien gehören zur gemeinsamen Bewertung einer Entwicklungsstrategie und bleiben DE/EN gleich. Das Blatt der aktuellen nativen Seite ist ansichtsneutral; Zugang, Umwelt, Dauer und Budget liefern offene Kriterien. Migration bleibt ein getrenntes Folgeziel, kein hier geforderter Gesamtkatalog.'
],
'2d8cc4f2':[
'NGOs und Zivilgesellschaft können Entwicklung durch Beteiligung, Projekte und öffentliche Kontrolle beeinflussen; Finanzierung, Repräsentation und staatliche Zuständigkeit begrenzen ihre Rolle.',
'NGOs and civil society can influence development through participation, projects and public scrutiny; finance, representation and public authority constrain their role.',
'Die Person analysiert eine Entwicklungssituation, unterscheidet Beiträge lokaler Gruppen, NGOs und öffentlicher Institutionen und erklärt deren Zusammenwirken und Grenzen.',
'The learner analyses a development situation, distinguishes contributions of local groups, NGOs and public institutions and explains their cooperation and limits.',
'Bei einem neuen Projekt mit großer extern finanzierter NGO, aber geringer lokaler Mitsprache analysiert sie veränderte Verantwortungs- und Beteiligungsprobleme.',
'For a new project with a large externally funded NGO but limited local participation, the learner analyses changed accountability and participation issues.',
'KEEP: Die Rolle in Entwicklungszusammenarbeit ist spezifisch und analytisch in beiden Sprachen. Das native Bild hält lokale Stimmen, NGO und öffentliche Institution sichtbar auseinander und stellt Finanzierung als Frage. Es enthält den ursprünglichen getrennten Wasserzeichenblock nicht mehr.'
],
'dc55f829':[
'Governance-Modelle setzen ethische Maßstäbe in Regeln, Beteiligungsverfahren und Kontrolle um; eine ethische Absicht allein gewährleistet weder Legitimität noch wirksame Umsetzung.',
'Governance models translate ethical standards into rules, participation procedures and oversight; ethical intent alone guarantees neither legitimacy nor effective implementation.',
'Die Person verknüpft ein vorgelegtes globales Regelungsmodell mit benannten ethischen Ansätzen und erklärt, wie Entscheidungsrechte und Kontrolle den Maßstäben entsprechen oder widersprechen.',
'The learner links a supplied global governance model to stated ethical approaches and explains how decision rights and oversight support or conflict with the standards.',
'Bei einem neuen Modell mit wirksamer Kontrolle, aber eingeschränkter Mitsprache prüft sie dieselbe ethische Verknüpfung neu und begründet den Zielkonflikt.',
'For a new model with effective oversight but restricted participation, the learner re-examines the ethical connection and justifies the trade-off.',
'KEEP: Verknüpfen bezeichnet die integrative Anwendung ethischer Maßstäbe auf globale Regeln; DE/EN bewahren diesen Schritt. Gerechtigkeitsmodelle sind vorausgesetzt, Fall-Konfliktlösung folgt getrennt. Die native Flagge zeigt jetzt ein abstraktes Kooperationszeichen statt eines konkreten UN-Emblems.'
],
'6de44afa':[
'Migration verändert Fachkräfteangebot, Einkommen und Wissensverbindungen in Herkunfts- und Zielökonomien; Brain Drain, Rücküberweisungen und möglicher Wissensrückfluss haben bedingte, unterschiedlich verteilte Folgen.',
'Migration changes skills supply, income and knowledge links in origin and destination economies; brain drain, remittances and possible knowledge return have conditional, differently distributed effects.',
'Die Person analysiert einen vorgelegten Migrationsfall für Entwicklungs- und Industrieland getrennt, erklärt Fachkräfteverlust und mögliche Gegenwirkungen anhand der gegebenen Bedingungen.',
'The learner analyses a supplied migration case separately for the developing and industrialised country, explaining skill losses and possible countereffects from the given conditions.',
'Bei einem neuen Fall mit zeitweiliger Fachkräftemigration und Rückkehr verändert sie die Analyse gegenüber dauerhafter Abwanderung und begründet verbleibende Unsicherheit.',
'For a new case with temporary skilled migration and return, the learner changes the analysis relative to permanent emigration and justifies remaining uncertainty.',
'KEEP der Beschreibung: DE/EN benennen beide Ländergruppen und dieselbe analytische Operation; Brain Drain ist ein Teilmechanismus, kein unausweichlicher Gesamteffekt. Die aktuelle native Seite zeigt dieselben Personen und möglichen Wissensrückfluss. Separater offener Bildbefund: zwei rote Gesundheitskreuze auf hellen Gebäuden links; mein ursprüngliches V-KEEP übersah sie. D-KEEP schließt diese V-Lücke nicht.'
],
'ac76810e':[
'Konkrete Handelsbeziehungen unterscheiden Partner, Produktgruppen und Flussrichtungen; Konzentration und eingeschränkte Alternativen können Abhängigkeiten erzeugen, ohne sie allein aus Geographie abzuleiten.',
'Specific trade relations differ in partners, product groups and flow directions; concentration and restricted alternatives may create dependencies without deriving them from geography alone.',
'Die Person stellt für einen vorgelegten Entwicklungslandfall Handelsflüsse und Partnerstruktur dar und erläutert, welche Fallangaben eine konkrete Abhängigkeit begründen.',
'The learner represents trade flows and partner structure for a supplied developing-country case and explains which case facts justify a specific dependency.',
'Bei einem neuen Fall mit demselben Exportgut, aber diversifizierten Partnern und anderen Importen passt sie Darstellung und Abhängigkeitsaussage begründet an.',
'For a new case with the same export good but diversified partners and different imports, the learner adjusts the representation and dependency statement with reasons.',
'KEEP: Der kurze Text wird durch den Titel eindeutig auf Handelsbeziehungen von Entwicklungsländern begrenzt; EN bewahrt den Zusammenhang. Darstellen ist von der Fair-Trade-Bewertung unterscheidbar. Gegenläufige Roh-/Verarbeitungswaren und offene Alternativrouten stützen die spezifische Darstellung ohne feste Rangordnung.'
],
'e4ae5afd':[
'Unternehmen, Staaten und NGOs besitzen unterschiedliche Einflussmöglichkeiten und Pflichten in Lieferketten; Verantwortung ist anhand ihres Beitrags zu Schutz, Kontrolle und Abhilfe zu beurteilen.',
'Companies, states and NGOs have different influence and duties in supply chains; responsibility is assessed through their contribution to protection, scrutiny and remedy.',
'Die Person bewertet in einem vorgelegten Lieferkettenproblem die Verantwortung aller drei Akteursgruppen, begründet Zuständigkeiten und identifiziert eine tatsächliche Verantwortungslücke.',
'The learner assesses all three actor groups’ responsibility in a supplied supply-chain problem, justifies their respective functions and identifies an actual accountability gap.',
'Bei einem neuen grenzüberschreitenden Fall mit schwacher staatlicher Durchsetzung bewertet sie veränderte Einflussmöglichkeiten, ohne NGOs hoheitliche Befugnisse zuzuschreiben.',
'For a new cross-border case with weak public enforcement, the learner reassesses influence without attributing sovereign powers to NGOs.',
'KEEP: Alle drei Gruppen und globale Lieferketten sind DE/EN vollständig gleich; es ist eine gemeinsame Verantwortungszuordnung auf Basis des menschenrechtlichen Vorziels. Das Bild unterscheidet Unternehmenshandlung, staatliche Kontrolle und öffentliche Stimme. Keine vollständig geprüfte Rechtszuständigkeit aller Länder wird behauptet.'
],
'645e6ff8':[
'Ethische Konfliktlösung verbindet konkurrierende Ansprüche mit Governance-Verfahren wie Verhandlung, Regeln und Abhilfe; Kosten, Zuständigkeiten und verbleibende Grenzen entscheiden über Tragfähigkeit.',
'Ethical conflict resolution links competing claims to governance procedures such as negotiation, rules and remedy; costs, responsibilities and remaining limits determine viability.',
'Die Person wendet vorgelegte ethische Konfliktlösungs- und Governance-Ansätze auf eine Fallstudie an, begründet Schritte für Betroffene und benennt einen ungelösten Konflikt.',
'The learner applies supplied ethical conflict-resolution and governance approaches to a case study, justifies steps for affected parties and identifies an unresolved conflict.',
'Bei einer neuen Fallstudie mit ungleicher Verhandlungsmacht und fehlender Kontrolle passt sie den Lösungsansatz an, statt bloße Einigung für wirksame Abhilfe zu halten.',
'For a new case study with unequal bargaining power and missing oversight, the learner adapts the response instead of treating mere agreement as effective remedy.',
'KEEP: Der konkrete Fallanwendungsoperator integriert ethische Lösung und Verfahren, nach dem Vorziel ihrer theoretischen Verknüpfung. EN präzisiert Konfliktlösung als approaches sachgerecht. Das native Bild enthält Bedingungen und Grenzen; dargestellte bessere Arbeit ist eine Lösungsoption, keine tatsächliche Beobachtung.'
],
'9b6ef4f1':[
'Der Rohstofffluch beschreibt mögliche Nachteile konzentrierter Rohstoffrenten durch Preisrisiken, institutionelle Anreize und verdrängte Alternativen; Rohstoffreichtum allein erzwingt keinen Fluch.',
'The resource curse describes possible disadvantages of concentrated resource rents through price risks, institutional incentives and displaced alternatives; resource wealth alone does not imply a curse.',
'Die Person erklärt anhand eines vorgelegten Falls relevante Rohstofffluchmechanismen und diskutiert passende Diversifizierungsmöglichkeiten einschließlich Bedingungen und Kosten.',
'The learner explains relevant resource-curse mechanisms in a supplied case and discusses suitable diversification options including conditions and costs.',
'Bei einem neuen rohstoffreichen Land mit stabilen Institutionen, aber Preisschock prüft sie, welche Mechanismen greifen und welche Diversifizierungsstrategie dadurch neu plausibel wird.',
'For a new resource-rich country with stable institutions but a price shock, the learner examines which mechanisms apply and which diversification option becomes plausible.',
'KEEP: Erklärung und Strategiediskussion bilden die gemeinsame Analyse des Rohstoffproblems; beide sind vollständig übersetzt. Sektorstruktur ist Vorwissen, kein identischer Wiederholungsauftrag. Das Bild kennzeichnet Rohstoffreichtum ausdrücklich als nicht automatisch verflucht.'
],
'e5560c43':[
'Mikrofinanzmodelle verändern Zugang zu kleinen Finanzdienstleistungen und Rückzahlungsrisiken; Teilnahme oder Kreditaufnahme allein beweist weder Armutsreduktion noch positive Entwicklungswirkung.',
'Microfinance models change access to small-scale financial services and repayment risks; participation or borrowing alone proves neither poverty reduction nor positive development effects.',
'Die Person bewertet ein vorgelegtes Mikrofinanzmodell anhand Zugang, Konditionen, Verschuldungsrisiken und belegbaren Wirkungen für Betroffene.',
'The learner assesses a supplied microfinance model through access, terms, debt risks and evidenced effects for affected parties.',
'Bei einem neuen Fall mit Gruppenkredit statt Einzelkredit und unregelmäßigem Einkommen bewertet sie Nutzen und Risiken neu, ohne erwartete Wirkung als erreicht zu zählen.',
'For a new case with group rather than individual credit and irregular income, the learner reassesses benefits and risks without counting expected effects as achieved.',
'KEEP: Modell und Entwicklungswirkung stehen in einer gemeinsamen bedingten Bewertung; EN ist vollständig. Armut liefert Vorwissen. Die native Seite trennt Kreditrichtung und Rückzahlung plus Zinsen, hält Schuld-/Zugangsfragen offen und zeigt unterschiedliche mögliche Wirkungen statt einer garantierten Erfolgsgeschichte.'
],
'b8c7458a':[
'Aufwand, erbrachte Leistungen und Entwicklungswirkungen sind verschieden; eine beobachtete Verbesserung muss gegen Vergleichslage, alternative Ursachen, Verteilung und Fortbestand geprüft werden.',
'Inputs, delivered outputs and development effects differ; an observed improvement must be examined against a comparison situation, alternative causes, distribution and durability.',
'Die Person diskutiert die Wirksamkeit eines vorgelegten internationalen Entwicklungsprogramms kritisch, trennt Ausgaben und Leistungen von Wirkungsbefunden und begründet Grenzen der Schlussfolgerung.',
'The learner critically discusses a supplied international development programme’s effectiveness, separates spending and outputs from impact findings and justifies limits of inference.',
'Bei einem neuen Programm mit steigender Teilnahme, aber zeitgleich verbesserten Marktbedingungen beurteilt sie die Wirkungsbelege neu und benennt einen geeigneten Vergleich.',
'For a new programme with increasing participation but simultaneously improving market conditions, the learner reassesses impact evidence and identifies an appropriate comparison.',
'KEEP: Kritische Wirksamkeitsdiskussion ist spezifischer als allgemeiner Strategievergleich. DE/EN sind parallel. Das native Bild unterscheidet Aufwand/Leistung/Wirkung und zeigt dieselbe Person sowie dieselbe offene Pflanzenfrage mit/ohne Programm; die frühere unbelegte Ergebnisasymmetrie ist im aktuellen Bild nicht vorhanden.'
],
'e7542590':[
'WTO, IWF, Weltbank und UN haben unterschiedliche Regelungs-, Stabilisierungs-, Finanzierungs- und Kooperationsrollen; Mandate und Mitgliedstaatenbedingungen begrenzen ihre Wirkungen.',
'The WTO, IMF, World Bank and UN have different rule-setting, stabilisation, financing and cooperation roles; mandates and member-state conditions limit their effects.',
'Die Person ordnet in einem vorgelegten Entwicklungsproblem relevante Aufgaben den vier benannten Institutionen zu und erklärt je eine fallbezogene Grenze, ohne Zuständigkeiten gleichzusetzen.',
'The learner assigns relevant tasks in a supplied development problem to the four named institutions and explains a case-related limit for each without equating mandates.',
'Bei einem neuen Fall mit Zahlungsbilanzproblem und Entwicklungsfinanzierungsbedarf trennt sie erneut mögliche Unterstützungsrollen und benennt, was keine Institution allein leisten kann.',
'For a new case combining a balance-of-payments problem and development-finance needs, the learner again separates possible support roles and states what no institution can deliver alone.',
'KEEP: Die vier Institutionen und Rolle/Grenzen sind in beiden Sprachen explizit; es ist eine vergleichende Zuordnungsoperation nach der allgemeinen Governance-Reflexion. Die native Seite ersetzt frühere absolute UN/IWF-Aussagen durch bedingte Grenzen und differenziert Weltbank-Umsetzung. Kein vollständiger aktueller Vertrags- oder Institutionenrechtsreview wird behauptet.'
],
'13705b9f':[
'Internationale Klima- und Nachhaltigkeitsvereinbarungen verbinden Ziele mit Finanzierung, Anreizen und Umsetzungsbedingungen; SDGs und Paris sind verschiedene Rahmen, keine automatischen Erfolgsnachweise.',
'International climate and sustainability agreements connect objectives to finance, incentives and implementation conditions; the SDGs and Paris are different frameworks, not automatic proof of success.',
'Die Person bewertet vorgelegte wirtschaftliche Maßnahmen im Bezug auf SDG-Ziele und Paris, begründet Kosten-/Nutzenverteilung sowie Anreiz- und Umsetzungsprobleme.',
'The learner assesses supplied economic measures in relation to SDG objectives and Paris, justifying the distribution of costs and benefits and incentive and implementation problems.',
'Bei einem neuen Kooperationsfall mit anderer Finanzierung und eingeschränkter Beteiligung prüft sie die ökonomische Tragfähigkeit neu, ohne die Zielvereinbarung mit Zielerreichung gleichzusetzen.',
'For a new cooperation case with different finance and restricted participation, the learner reassesses economic viability without equating agreed objectives with achieved outcomes.',
'KEEP: Ökonomische Bewertung ist auf beide ausdrücklich benannten internationalen Rahmen bezogen; EN löst Paris als Paris Agreement sachgerecht auf. Die native Darstellung zeigt eigene illustrative Zielmotive, keinen vollständigen offiziellen 17-SDG-Satz. Ausgewählte Motive sind keine Quellenabdeckungs- oder Zielerreichungsbehauptung.'
],
'c9847c36':[
'Geoökonomische Strategien nutzen Marktzugang und Investitionsbedingungen für politische Ziele; wirtschaftliche Chancen, Sicherheitsinteressen und Nebenwirkungen müssen mechanismenbezogen getrennt werden.',
'Geoeconomic strategies use market access and investment conditions for political aims; economic opportunities, security interests and side effects must be separated by mechanism.',
'Die Person analysiert vorgelegte Marktmaßnahmen und Investitionsscreening, erklärt jeweils Instrument, Adressaten und mögliche Folgen einschließlich Zielkonflikten.',
'The learner analyses supplied market measures and investment screening, explaining each instrument, its targets and possible consequences including trade-offs.',
'Bei einem neuen Fall mit Zugangsbeschränkung statt bedingter Investitionszulassung analysiert sie den veränderten Wirkungsweg und mögliche Ausweichreaktionen.',
'For a new case using access restrictions rather than conditional investment admission, the learner analyses the changed mechanism and possible adaptation.',
'KEEP: Die Beispiele sind sprachlich gleich und offen, nicht abschließende Staats- oder Instrumentenkataloge. Die native Seite trennt Marktzugang und Zulassen/Auflagen/Ablehnen bei Screening; die Waage ist offen. Der zuvor getrennte Wasserzeichenblock fehlt. Keine heutige einzelstaatliche Screeningentscheidung wird als Tatsache eingeführt.'
],
'36ebee6c':[
'Corporate Responsibility umfasst ethische Verantwortung und freiwilliges Handeln; Lieferkettengesetze begründen abgegrenzte Sorgfaltspflichten. Einhaltung, ambitionierter Anspruch und tatsächliche Wirkung sind verschieden.',
'Corporate responsibility covers ethical responsibility and voluntary action; supply-chain laws establish bounded due-diligence duties. Compliance, ambitious claims and actual effects differ.',
'Die Person bewertet einen vorgelegten Unternehmensfall anhand eines bereitgestellten datierten Gesetzesausschnitts und eines Verantwortungskonzepts, trennt Anwendungsbereich, Pflichten und Wirkungsbelege.',
'The learner assesses a supplied business case using a provided dated legal extract and a responsibility concept, separating scope, duties and impact evidence.',
'Bei einem neuen Fall mit anderer Zuliefererstellung und verändertem gesetzlichen Anwendungsbereich überprüft sie das Urteil anhand des dort bereitgestellten Materials erneut.',
'For a new case with a different supplier position and changed legal scope, the learner re-examines the judgment using the material provided for that case.',
'KEEP: Konzept-/Gesetzesbewertung ist spezifischer als CSR allein und vollständig DE/EN. Die Beschreibung enthält keine zeitabhängige Schwelle oder pauschale Haftungsbehauptung. §3LkSG wurde tatsächlich als Primärnorm gelesen; die native Seite fragt nach Anwendungsbereich und Wirkung, statt jeden Akteur als identisch verpflichtet auszugeben.'
],
'9df66a0b':[
'ESG-Kriterien strukturieren Umwelt-, Sozial- und Governance-Bewertungen; Impact Investing verfolgt beabsichtigte Wirkung. Ein Score oder eine Wirkungsabsicht allein beweist keine kausale zusätzliche Wirkung.',
'ESG criteria structure environmental, social and governance assessments; impact investing pursues intended effects. A score or impact intent alone proves no causal additional effect.',
'Die Person prüft vorgelegte ESG-Kriterien und einen Impact-Ansatz, erklärt Messgrenzen und trennt Kriterienbewertung, Wirkungsabsicht und belastbare Wirkungsnachweise.',
'The learner examines supplied ESG criteria and an impact approach, explains measurement limitations and separates criteria assessment, intended effects and sound impact evidence.',
'Bei einem neuen Angebot mit hohem ESG-Score, aber unklarer zusätzlicher Wirkung prüft sie die Aussagen neu und begründet eine relevante offene Evidenzfrage.',
'For a new offering with a high ESG score but unclear additional impact, the learner reassesses the claims and justifies a relevant unresolved evidence question.',
'KEEP: Kritisch prüfen fordert die Unterscheidung verwandter, aber nicht identischer Bewertungs-/Wirkungsansätze, vollständig übersetzt. Die native Seite macht diese Trennung explizit und garantiert weder Rendite noch ethische Güte. Die Empfehlung ist Curriculum-QS, keine finanzielle Anlageberatung oder regulatorische Zertifizierung.'
],
'7a55332e':[
'Datengetriebene Modelle und KI schaffen mögliche Nutzen und Risiken durch Datenauswahl, Kontrolle und Entscheidungen; Fairness, Verantwortung und Nachvollziehbarkeit sind getrennt ethisch zu prüfen.',
'Data-driven models and AI create possible benefits and risks through data selection, control and decisions; fairness, responsibility and explainability require distinct ethical scrutiny.',
'Die Person bewertet einen vorgelegten datengetriebenen Geschäftsmodell-/KI-Fall anhand benannter ethischer Kriterien, begründet Nutzen, Betroffenenrisiken und Verantwortungszuordnung.',
'The learner assesses a supplied data-driven business-model or AI case using stated ethical criteria, justifying benefits, risks to affected parties and allocation of responsibility.',
'Bei einem neuen Fall mit automatisierter Kreditentscheidung statt Empfehlungssystem bewertet sie veränderte Daten-, Fairness- und Verantwortungsfragen anhand des neuen Kontexts.',
'For a new case with automated credit decisions rather than recommendations, the learner assesses changed data, fairness and responsibility questions using the new context.',
'KEEP: Datenmodelle und KI sind der gemeinsame Gegenstand einer ethischen Bewertung, kein technischer Programmierauftrag. DE/EN stimmen überein; das Indikator-Vorziel liefert einen Messreflexionskontext ohne Aussage über aktuelle Lehrpfadfreigabe. Die aktuelle native Seite enthält das neutrale Herz im Gesundheitsgebäude, keinen roten Kreuznachfolger.'
]}
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
completed=datetime.datetime.now(datetime.timezone.utc).isoformat()
for name in ['native-d-q4-development-seventeen-final','native-d-q4-ethics-development-ten-final']:
 out=base/name;r=out/'round-b';campaign=json.loads((r/'description-review-campaign.json').read_text());inputj=json.loads((r/'description-review-input.json').read_text());model=json.loads((out/'bundle/book-model.json').read_text());batch=campaign['batches'][0];runid=batch['batchId']+'.economics-layer-a-run-v1';bp=next((r/'batches').glob('*.input.jsonl'));batchrows=[json.loads(x) for x in bp.read_text().splitlines()];records=[]
 for g,bg in zip(inputj['goals'],batchrows):
  assert g==bg['goal'];assert g['reviewContext']['evidenceProfile'] is None;d=data[g['goalId'].split('-')[0]];assert len(d)==7
  rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.'+g['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],d[:6])),'rationale':d[6]+' Im eingefrorenen Buch ist evidenceProfile=null: create empfiehlt einen getrennten Nachweis und behauptet kein vorhandenes Profil.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'};records.append(rec)
 result=r/'results';result.mkdir(exist_ok=True);rp=result/(batch['batchId']+'.records.jsonl');assert not rp.exists();rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
 params=dict(reviewMode='actual interactive Codex session manual independent reading',exactModelNotDisclosed=True,temperatureNotExposed=True,agentIdentity='/root/economics_layer_a',noOtherCurrentRoundRead=True,priorRoles='Own originalQ4V27 reviewer/discoverer of10corrected faults; previous source readings; historical phase-assessment candidate author. Not Q4 description/translation/profile/image author. Earlier original6de44KEEP missed two cross signs, now separate actual E1/G1 image finding.')
 pp=r/'independent-generation-parameters.actual.json';assert not pp.exists();pp.write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
 artifacts=[('book_pdf',out/'bundle/book.pdf'),('book_model',out/'bundle/book-model.json'),('review_input_json',r/'description-review-input.json'),('description_review_batch_input_jsonl',bp),('review_prompt',r/'prompt.md'),('review_criteria',r/'criteria.md'),('run_manifest_schema',out/'bundle/contracts/goal-evidence-ai-run-manifest.schema.json')]
 run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':sha(pp),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[dict(role=k,digest=sha(p)) for k,p in artifacts],'startedAt':'2026-10-08T10:38:32+00:00','completedAt':completed,'status':'completed','outputDigest':sha(rp),'toolchainVersion':'codex-interactive-review-20261008-v1'};runp=result/(batch['batchId']+'.run.json');runp.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
 inspection=dict(schemaVersion=1,reviewId=runid+'.whole-input-inspection',reviewerAgent='/root/economics_layer_a',actualStartedAt=run['startedAt'],actualCompletedAt=completed,bookDigest=campaign['bookDigest'],bundleFingerprint=campaign['bundleFingerprint'],actualBlindCurrentRoundAUnseen=True,actualReviewScope='All whole frozen own-round goal objects including complete DE/EN, everycanonicalContext, fullpage/reviewContext and all27nativewholePDFpages across17+10; no sampling and no template/hash judgment.',priorRoles=params['priorRoles'],wholeCurrentPhysicalCanonicalTargetsActuallyRead=27,physicalCanonicalSnapshotSha256='b685f82ac4c271f85ed8ed193c80c5d4714672768409eedd6f29b227e140ecd9',physicalSnapshotDiffersFromFrozenSource=True,physicalSnapshotSupplementNotLiveCurrentParityProof=True,sourceReading=dict(localPrimaryPdf='curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf',localPrimaryPdfSha256=sha('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf'),actualWholePhysicalPrintedPagesRead=[48,49],readingScope='Whole Q4 introduction and Q4.1,Q4.2,Q4.3 inclGK/LKclauses read. Broad curricular-context support; not complete directmapping/applicability/scopingreview ofeverystate. Prior own primary UN/IMF/WorldBank/UNDP/SDG/Paris readings retained, not other reviewer verdicts.',actualCurrentSection3LkSG='https://www.gesetze-im-internet.de/lksg/__3.html',section3FullMainActuallyRead=True,wtoMainFetchFailed402=True,wtoOnlyOfficialSearchSnippetRead=True,icrcActualPriorWholeMain='https://www.icrc.org/en/our-emblems'),contractsActuallyRead=True,technicalReadingTruncations='Initial combined freeze/schema/navigation dumps were truncated. Complete own prompt/criteria/campaign/schema and pergoalcontexts were subsequently read in bounded outputs. No whole truncated dump or whole370graph reading claimed.',bookProfilesAllNull=True,profileRecommendations={'create':len(records)},separatePositiveV2ProfilesNotReadOrPretendedInBook=True,humanReleaseGatePreserved=True,learnerPerformanceClaimed=False,liveWrites=0,newStrictClosures=0,goalSpecificReviews=[dict(goalId=g['goalId'],goalFingerprint=g['goalFingerprint'],pageFingerprint=g['pageFingerprint'],wholeFrozenGoalActuallyRead=True,wholeNativePdfPageActuallyViewed=True,physicalPdfPage=g['reviewContext']['page']['pageNumber']+2,rasterPath=str(r/'native-whole-page-inspections'/('page-'+str(g['reviewContext']['page']['pageNumber']+2).zfill(2)+'.png')),rasterSha256=sha(r/'native-whole-page-inspections'/('page-'+str(g['reviewContext']['page']['pageNumber']+2).zfill(2)+'.png')),decision='keep',nativePageEvidenceProfile=None,evidenceProfileRecommendation='create',separateOpenImageFinding=g['goalId'].startswith('6de44afa')) for g in inputj['goals']])
 ip=r/'independent-whole-pages-inspection.actual.json';assert not ip.exists();ip.write_text(json.dumps(inspection,ensure_ascii=False,indent=2)+'\n')
 if name.endswith('seventeen-final'):
  g=next(x for x in inputj['goals'] if x['goalId'].startswith('6de44afa'))
  finding={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-finding.schema.json','schemaVersion':1,'findingId':'q4-brain-drain-two-health-red-cross-emblems','runId':runid,'bundleFingerprint':campaign['bundleFingerprint'],'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'defectLayer':'visualization','anchoredObservation':'The actual frozen full native PDF page15 (physical17) displays two red cross-shaped healthcare marks on pale buildings at left: upper small origin hospital and lower origin-panel hospital. Sourceimage SHA3f7f1ae5e73e503dc8f1537798ebb17dc7017ceef5005c67c6e6684ded4010b8. My earlier original V27KEEP missed both; that immutable historical receipt is not overwritten.','hypothesizedMechanism':'Specific red-cross-style medical emblem is reused as a generic health icon although no organizational/authorized emblem context is supplied.','violatedCriterion':'atomic-goal-visualizations.md rights/marks and factual visualization gate; actualICRCprimary emblemidentification distinguishes a specificredcross mark from neutral genericmedicalmotifs.','minimalCounterexample':'The same originhealthcare facilities can be clear with neutral teal hearts, without the distinctive red crosses.','severity':'high','evidenceLevel':'E1','normativeTags':['NORMATIVE','factual_correctness'],'maximumClaimScope':'G1','counterarguments':['The marks are small within hypothetical buildings and not a named organization. This limits the claim to these two concrete marks, not all healthcare imagery or legal liability.','The migration description and repeated actor identities are accurate; the defect is in the image only.'],'proposedLocalChange':'Replace ONLY the two red healthcare cross signs by neutral teal hearts; preserve allactors, migration direction, origin/destination images and knowledge-returnmotifs.','possibleSideEffects':['Any changed image alters source/image/page/resource bindings; targeted newimageinspection and new1-page D/P bindings are required.','Do not restart or redesign the other26 approvedimagecandidates.'],'broaderEvidenceNeeded':'Actual independent correctedPNG native360680inspection and bound fresh1-goal page/currentP-resource successor after correction. Oldfrozen27D records remain historical; strictcount onlyafterallgates.','findingStatus':'candidate','reviewAuthority':'ai_candidate'}
  fp=r/'independent-bounded-visualization-finding.actual.json';fp.write_text(json.dumps(finding,ensure_ascii=False,indent=2)+'\n')
 print(name,'records',sha(rp),'run',sha(runp),'inspection',sha(ip),'actualKEEP',len(records))
