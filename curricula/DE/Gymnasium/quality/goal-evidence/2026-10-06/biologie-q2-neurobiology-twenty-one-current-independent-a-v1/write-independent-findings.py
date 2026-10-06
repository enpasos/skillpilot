# SPDX-License-Identifier: Apache-2.0
"""Persist this agent's actual independent findings. No author or active writes."""
import copy, hashlib, json, re, shutil, subprocess, unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
HERE = Path(__file__).parent
AUTHOR = HERE.parent / 'biologie-q2-neurobiology-twenty-one-current-author-candidate-v1'
NOW = datetime.now(timezone.utc).isoformat()
REVIEW = 'biologie-q2-neurobiology-twenty-one-independent-a-20261006-v1'
REVIEWER = 'GPT-6 independent A /root/q1_current_d_b_resume; exact model identifier unavailable'
def read(path): return json.loads(Path(path).read_text())
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def write(name, obj): (HERE/name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
def rel(path): return str(Path(path).relative_to(ROOT))
def file_receipt(path):
    path=Path(path); return dict(path=rel(path),sha256=sha(path),bytes=path.stat().st_size)

freeze = AUTHOR/'neurobiology-twenty-one-author-candidate.final.freeze.json'
assert sha(freeze)=='7b94d5170b1a200ad38c674214f1f18c2b0f85122cdd8334db7909dd674fe835'
for row in read(freeze)['files']:
    assert sha(ROOT/row['path'])==row['sha256']
    assert (ROOT/row['path']).stat().st_size==row['bytes']
snap=read(AUTHOR/'current-twenty-one.snapshot.json')
proposed=read(AUTHOR/'proposed-twenty-one.validation-snapshot.json')
decisions=read(AUTHOR/'description-decisions.candidates.json')['goals']
profiles=read(AUTHOR/'author-profiles.data.json')
source=read(AUTHOR/'retained-he-by-binding-inputs.snapshot.json')
regional=read(AUTHOR/'regional-claimed-contexts.snapshot.json')
ids=snap['goalIds']; byid={g['id']:g for g in proposed['goals']}
active=read(ROOT/snap['canonicalPath']); activeby={g['id']:g for g in active['goals']}
assert all(activeby[g['id']]==g for g in snap['goals'])
assert len(ids)==21 and len(profiles)==21

# Independently read DE/EN case briefs and answers, not copied author verdicts.
# Tuple: short ID, description reason, P reason, case1 check, case2 check,
# atomicity reason, memory reason, HE component anchor/course/scope status.
ROWS = [
('ce19b80f','Der Kandidat macht den Zellbau-Funktionszusammenhang beobachtbar. Die Entfernung der separaten AP-Entstehung ist fachlich sinnvoll; deren vorhandene Ziele müssen in jeder tatsächlich betroffenen Ansicht erhalten bleiben.',
 'Beschriftung mit Legende plus begründete Leitungs-/Übertragungsunterscheidung prüft den Struktur-Funktions-Kern.',
 'Dendrit/Soma→Axon→Endigung ist im angegebenen Grundmodell korrekt, ohne Universalbehauptung.',
 'Axonmessung bei getrennten Endigungen belegt keine Weitergabe an das Folgeneuron.',
 'Ein erklärter Struktur-Funktions-Zusammenhang; AP-Ionenmechanismen sind jetzt ausdrücklich ein anderer vorhandener Atom.',
 'Strukturnamen stehen in der Legende; eigenständiges Erklären der Funktionsroute ist kein ungestützter Vokabelabruf.', 'GK1','GK/LK','component'),
('ff1bf88f','Chemische und elektrische Übertragungsprinzipien sind wissenschaftlich zulässiger Vergleich. Die elektrische Variante ist keine ausdrücklich verpflichtende HE-/BY-GK-Klausel.',
 'Zwei Übertragungsprinzipien werden durch selektiven Eingriff und kontextabhängige ACh-Wirkung verständnisorientiert unterschieden.',
 'Selektiver Vesikelfreisetzungsblock trifft die chemische Modellverbindung, nicht die direkte leitende Verbindung.',
 'ACh-Abbauhemmung kann die Rezeptorwirkung verlängern; keine universelle erregende ACh-Wirkung.',
 'Der Vergleich hat ein gemeinsames Entscheidungskriterium: der vom Eingriff betroffene Übertragungsschritt.',
 'Gegebene Vesikel-/Rezeptor-/Verbindungsmodelle erlauben die Erklärung ohne gesonderte Transmitter-Namensliste.', 'GK2','GK/LK','chemical_component_electrical_extension'),
('a46cafde','Der verengte Kandidat verlangt genau die veränderte Verarbeitung gleicher Eingänge durch veränderte Verbindungen. Das ist von Topologieanalyse und zellulärer Veränderung unterscheidbar; die neue GK-Bindung ist aber nicht belegt.',
 'Die Fälle prüfen die gleiche Netzwerkkompetenz durch Verstärkung und konkurrierende Hemmung, ohne reale Erinnerungen zu behaupten.',
 'Stärkere A-Verbindung erklärt die neue Ausgabe bei gleichem A; die molekulare Ursache wird nicht erfunden.',
 'Mehr Hemmung kann lokale Verstärkung überlagern; lokale Stärke allein garantiert keine größere Gesamtausgabe.',
 'Ein Modellschluss über Verbindungswirksamkeit. 97b24279 untersucht Topologie, 347110a1 den zellulären Veränderungsbefund; keine identische Leistung wird automatisch doppelt gezählt.',
 'Eingänge, Änderungen und Ausgänge sind gegeben; entscheidend ist die begründete Netzwerkvorhersage.', 'LK4/LK5','LK','didactic_network_operationalisation_GK_hold'),
('78748ef2','Abgestufte Rezeptorantwort und primäre/sekundäre Sinneszelle bilden einen zulässigen Funktionsvergleich auf LK-Niveau.',
 'Typzuordnung und ein hyperpolarisierendes Gegenbeispiel prüfen Funktion statt einer falschen Immer-Depolarisationsregel.',
 'Eigenes Axon vs nachgeschaltetes Neuron unterscheidet die vorgegebenen primären/sekundären Modelle; abgestuft ist nicht Alles-oder-Nichts.',
 'Reizabhängige Hyperpolarisation kann Rezeptorsignal sein; Signal ist nicht auf positives Vorzeichen beschränkt.',
 'Die Zuordnung des Rezeptorsignals zum Weiterleitungsweg ist ein gemeinsamer Funktionszusammenhang.',
 'Gegebene Funktionsschemata und Potenziallegenden tragen die Zuordnung; kein zusätzliches Sinneszellarten-Deck nötig.', 'LK1/LK2','LK','explicit'),
('19758e09','Die gemeinsame Erklärung neuronaler und hormoneller Steuerwege ist in HE LK und BY EA explizit. Hormonthemen aus Pubertät oder bloßer Systemvergleich beweisen den ganzen aktuellen Kreis nicht.',
 'Vorgelagerter neuraler Weg, Hormontransport und rezeptorabhängige Zielantwort werden auseinandergehalten.',
 'Neuron→Drüse→passende Zielorgane ist für das vorgegebene Schema stimmig; keine Gleichwirkung auf alle Zellen.',
 'Selektiver Zielrezeptorblock lässt upstream Aktivierung und Hormonmenge bestehen; keine Ganzsystemblockade.',
 'Die funktionale Verschränkung zweier Informationswege ist eine integrative Erklärung, nicht zwei unverbundene Abrufe.',
 'Die Wege und Eingriffe sind im Material vorgegeben; eigenständiges Verknüpfen ist die Leistung.', 'LK3','LK','explicit_combined_control'),
('e1117126','Der Kandidat operationalisiert räumliche/zeitliche Verrechnung und ihre AP-Folge. Erregende/hemmende Wirkung, EPSP/IPSP und hemmende Synapsen sind über Profil/Material identifizierbar, ohne die reale Membran als exakt linear auszugeben.',
 'Ein ausdrücklich additives Modell und eine Zeitvariation liefern verschiedene Integrationsnachweise.',
 '−70+8+10−5=−57 mV; ohne Hemmung −52 mV. Schwelle −55 wird im ersten Modell nicht erreicht.',
 'Kurzer Abstand erlaubt zeitliche Überlagerung; ein IPSP kann sie abschwächen. Keine endgültige Zahl ohne Verlauf.',
 'Raum/Zeit/Hemmung sind Bedingungen derselben Entscheidung über die gemeinsame Schwellenannäherung.',
 'Kurven, Eingänge und Schwelle sind gegeben. Die Leistung ist ihre Erklärung, nicht die isolierte Definition von EPSP/IPSP.', 'LK4','LK','explicit'),
('347110a1','Zelluläre funktionelle/strukturelle Plastizität wird als überprüfbarer Befund erläutert, nicht als Beweis einer konkreten Erinnerung.',
 'Dauerhaft stärkere Übertragung und neue Kontakte trennen funktionelle von strukturellen Befunden.',
 'Gleicher Testreiz und anhaltende Antwort 2→5 stützen funktionelle Änderung, nicht automatisch neue Kontakte oder spezifische Erinnerung.',
 'Zusätzliche Kontakte bei unveränderter Einzelstärke sind strukturell; beide Ebenen sind getrennt belegt.',
 'Die Klassifikation und Erklärung einer zellulären Veränderung ist eine Kompetenz mit zwei Erscheinungsformen.',
 'Vorher-/Nachhermaterial trägt die Einordnung; keine Pflicht zur auswendigen Aufzählung molekularer Lernwege.', 'LK5','LK','explicit_cellular_umbrella'),
('485ef1c3','Ein begrenztes Alzheimer-Prinzip passt zu HE LK. Depression und die komplette BY MS/Parkinson-Klausel sind keine austauschbaren Alzheimer-Beispiele.',
 'Materialgebundene Funktionsstörung plus Unterscheidung struktureller und temporärer Übertragungsänderung sind fachlich vorsichtig.',
 'Verbindungsverlust erklärt die vorgegebene schwächere Netzwerkverarbeitung; unspezifische Gedächtnisschwierigkeit ist keine Diagnose.',
 'Ähnliche Funktionsstörungen beweisen weder denselben Mechanismus noch dieselbe Erkrankung.',
 'Die Erklärung eines materialisierten Krankheitsprinzips ist ein Atom; es wird keine Vollklassifikation aller Erkrankungen verlangt.',
 'Krankheitsbezogene Modellangaben sind gegeben; Erklärung und Begrenzung benötigen keinen neuen Diagnose-Begriffsabruf.', 'LK6','LK','one_disorder_principle'),
('afde0001','Ein bildgebendes Gehirnverfahren passt zu HE LK. Die BY-Zeile verlangt elektrische Aktivität/ENG/EKG; BOLD ist indirekt hämodynamisch und deckt sie nicht vollständig.',
 'fMRT-Prinzip und Struktur/Funktionsdarstellung werden mit konkreten Interpretationsgrenzen verglichen.',
 'BOLD-Vergleich ist ein indirekter methodenabhängiger Unterschied, keine Aufnahme einzelner Gedanken.',
 'Strukturelles MRT stützt Anatomie, fMRT die vorgegebene Bedingungsdifferenz; keine automatische Diagnose.',
 'Ein Methodenschluss aus Messprinzip und Grenze; die strukturelle Vergleichsdarstellung unterstützt diesen Schluss.',
 'Messprinzip und Darstellungen sind gegeben; selbstständige Methodeninterpretation ersetzt ein Akronym-Deck.', 'LK7','LK','one_imaging_principle'),
('2381d2bb','Der neue Titel stimmt jetzt mit der unveränderten Planung/Auswertung überein. Keine praktische Durchführung wird aus einem Modellplan behauptet.',
 'Mess-/Referenzort, Kontrolle, Zeitverlauf und Polungsfehler prüfen Planung und die dazugehörige Interpretation.',
 'Messreferenz, Ruhekontrolle, kontrollierter Reiz und Zeitaufnahme sind notwendige Planbestandteile; kein Labornachweis.',
 '−70→+30→Ruhe ist mit AP vereinbar; Polungswechsel ändert Messvorzeichen, nicht Zellfunktion.',
 'Planung und Auswertung eines klar begrenzten Potenzialversuchs bilden einen Methodenzyklus; reale Handhabung ist nicht zusätzlich verlangt.',
 'Geräte-/Ortslegende und Kurven erlauben Methodenbegründung; keine losgelöste Messgeräte-Namenskarte nötig.', 'GK3','GK/LK','plan_analyse_operationalisation'),
('c9a06264','LTP/LTD sind gültige Spezialisierungen zellulären Lernens. Ihre Namen/Versuchsdetails stehen nicht ausdrücklich im HE-Bullet; keine genaue amtliche Vollgleichheit.',
 'Kontrollierte Daueränderung und Erholung nach kurzfristiger Änderung werden korrekt getrennt.',
 'Konstanter Testreiz, 2→5 nach einer Stunde und stabile Kontrolle passen zu LTP, nicht zu einer konkreten Erinnerung.',
 'Anhaltendes 4→2 passt zu LTD; Rückkehr auf 4 belegt nur vorübergehende Änderung, keine automatische LTD.',
 'Gegenläufige Daueränderungen werden anhand desselben Stabilitäts-/Kontrollkriteriums verglichen.',
 'Messverläufe und Testbedingungen sind vorgegeben; begründete Zuordnung ist keine isolierte Akronym-Abfrage.', 'LK5','LK','specialisation_LTP_LTD_not_named'),
('4f631f78','Die vorgegebene künstliche Hebb-Regel ist als begrenztes Netzwerkmodell sinnvoll, aber keine ausdrücklich benannte HE-Pflichtklausel oder universelles biologisches Lerngesetz.',
 'Anwenden einer transparenten Regel und Begründen ihrer Wachstumsgrenze liefern sachhaltige Variation.',
 '0,3+0,1+0+0,1=0,5; Modellgewichte werden nicht als reale Erinnerungseinheiten ausgegeben.',
 'Unbegrenztes Wachstum ist eine konkrete Modellgrenze; eine zusätzliche Obergrenze ist als Annahme kenntlich.',
 'Regelanwendung und ihre Gültigkeitsgrenze bilden einen Modellierungszyklus mit demselben Regelgegenstand.',
 'Δw-Regel ist gegeben; gefordert sind Anwendung/Begrenzung, nicht auswendige Formelreproduktion.', 'LK5','LK','specialisation_Hebb_not_named'),
('97b24279','Konvergenz/Divergenz sind fachlich gültige Netztopologien. HE synaptische Verrechnung nennt diese Topologien nicht als separaten Pflichtinhalt.',
 'Topologie und wirksame Signale werden sauber unterschieden; Pfeilzahl genügt nicht für Aktivitätsvorhersage.',
 'Mehrere Eingänge→eine Zelle ist Konvergenz, eine→mehrere Divergenz; weitere Wirkungs-/Zeit-/Schwellenangaben nötig.',
 'Gemeinsame Herkunft erzwingt keine identischen Zielausgaben bei unterschiedlichen Wirkungen/Schwellen.',
 'Analyse einer Netztopologie mit ihren Signalregeln ist eine Kompetenz; der Änderungsvergleich in a46cafde ist ein anderer Ausschnitt.',
 'Frische Schaltbilder und Signalregeln tragen die Interpretation; kein zusätzlicher Topologie-Katalogabruf.', 'LK4','LK','topology_operationalisation_not_named'),
('9b966664','Rezeptor-/zellabhängige Modulation ist wissenschaftlich sinnvoll. HE Hormonverschränkung und BY Monoamin-Kontext beweisen keine volle allgemeine Dopamin-/Serotonin-Systempflicht.',
 'Kontextspezifische Dopaminwirkung und Serotonin-Modell vs statistische Assoziation verhindern pauschale Stimmungsursachen.',
 'Die ausdrücklich verschiedenen Rezeptor-/Zellkontexte tragen verschiedene Wirkungen; keine Universalrolle von Dopamin.',
 'Netzschwellenänderung ist Modellwirkung; bloße Verhaltenskorrelation ist keine alleinige Ursache und keine Behandlungsempfehlung.',
 'Eine materialgebundene Modulationswirkung wird erklärt und in ihrer Reichweite begrenzt.',
 'Rezeptorwirkung/Schwellenänderung werden vorgegeben; begründete Wirkung ist kein ungestützter Transmitterkatalog.', 'LK3/GK2_related','LK extension','neuromodulation_not_explicit'),
('f6280154','Psychoaktive Stoffwirkungen sind ein zulässiger synaptischer Mechanismuskontext. HE fordert an einer ACh-Synapse ein Beispiel; daraus folgt keine Vollpflicht beliebiger klinischer Wirkmechanismen.',
 'Rezeptorblock und Rückaufnahmehemmung greifen an unterschiedlichen Schritten an; lokale Folge wird von Behandlung getrennt.',
 'Unveränderte Freisetzung garantiert bei blockiertem Rezeptor keine normale postsynaptische Antwort.',
 'Langsamere Rücknahme kann Verfügbarkeit verlängern, ohne sichere Ganzpersonwirkung oder Dosierung zu behaupten.',
 'Angriffsort→lokale Übertragungsänderung ist dieselbe Mechanismuserklärung für verschiedene Eingriffe.',
 'Der Stoffangriff ist beschrieben; keine zusätzliche Wirkstoffnamen-/Dosierungsabfrage.', 'GK2','GK/LK basis; LK extension','one_ACh_substance_component'),
('8b23f8fb','Reiztransduktion und Repräsentation durch Codes sind fachlich stimmig; Orts-/Populationscode werden in HE/BY-Basis nicht ausdrücklich als Vollpflicht genannt.',
 'REVISE: Beide Fälle prüfen Codierung, keiner verlangt eigenständig die ausdrücklich im Ziel enthaltene Reiztransduktion. Eine vorhandene Fallvariante/Erwartung muss den Reiz→abgestuftes Zellpotenzial→Impulsmuster-Zusammenhang prüfen.',
 '5 vs 15 gleich hohe AP/s zeigt Frequenzcode, nicht höhere Einzelimpulse oder universelle Linearität; Reiztransduktion wird hier nicht erklärt.',
 'Vorgegebene aktive Orte/Gruppen tragen Orts-/Populationscode; auch hier fehlt ein beobachtbarer Transduktionsschritt.',
 'Ein gemeinsamer Reiz→Signal→Informationsmuster-Zusammenhang kann ein Atom sein. Das Profil muss diese Verbindung wirklich prüfen; nur drei Codetypnamen plus ein unverbundener Umwandlungssatz reichen nicht.',
 'Mit gelieferten Reiz-/Rezeptor-/Aktivitätsdaten ist der Zusammenhang erklärbar; ein neues Codewort-Deck schließt die P-Lücke nicht.', 'Q2.3 LK1/Q2.4 GK1','LK specialisation; shared transduction context','three_codes_not_named'),
('1b38144f','Dynamische Lipiddoppelschicht, Proteine und Transportwege sind ein kohärenter Struktur-Funktions-Zusammenhang. BY GA/EA nennt ihn ausdrücklich; HE Q2.3 ist hier zunächst der funktionelle Voraussetzungskontext.',
 'Selektiver Kanal, energiegekoppelte Pumpe und anderer offener Weg vermeiden pauschalen Membrantransport.',
 'Passiver A-Kanal und ATP-gekoppelter uphill B-Transport sind unter den gegebenen Bedingungen korrekt getrennt.',
 'Schließen von Kanal A stoppt weder die aktive B- noch die ausdrücklich mögliche neutrale C-Route.',
 'Struktur/Selektivität/Energie erklären ein Transportproblem in einem gemeinsamen Membranmodell.',
 'Transportwege/Materialbedingungen sind gegeben; keine zusätzliche vollständige Membranprotein-Namensliste.', 'GK1 prerequisite; separate membrane source binding required','GK/LK basis','implicit_Q2_membrane_context'),
('e3fb5f1d','Ruhepotenzial aus Ionenverteilung/Permeabilität und die Energie zur langfristigen Gradientenpflege sind kausal verbunden.',
 'Spannungsbildung und zeitlich verzögerte Pumpenfolge werden korrekt getrennt.',
 'K-Gradient und selektive Permeabilität plus elektrische Gegenwirkung erklären innennegativen Bezug, keine große Nettoladung im ganzen Zellvolumen.',
 'Pumpenstopp beseitigt bestehende Gradienten nicht augenblicklich; unmittelbare Spannung und langfristige Erhaltung sind getrennt.',
 'Entstehung und Erhaltung derselben Ruhebedingung sind ein kausaler Funktionszusammenhang.',
 'Ionen-/Permeabilitätsdaten sind gegeben; keine Pflicht zur auswendig gelernten Universalspannung.', 'GK1','GK/LK','resting_component'),
('04d770b3','AP-Teilchenmechanismus und Information im Impulsmuster bilden einen zulässigen Signal-Funktions-Zusammenhang. BY GA/EA nennt beides ausdrücklich; HE AP-Bullet nennt Code nicht explizit.',
 'Kanal-/Ionenverlauf plus Frequenz/Refraktärvariation decken beide expliziten Zielteile ab.',
 'Na-Einstrom und vorgegebene spätere K-Leitfähigkeit erklären Verlauf; Pumpen sind nicht der schnelle Repolarisationsmechanismus.',
 'Gleich hohe AP bei anderer Frequenz tragen Reizinformation; Refraktärzeit begrenzt Abstände und Frequenz.',
 'Der Mechanismus begrenzt die mögliche Signalrepräsentation; beide Nachweise sind funktional verbunden, nicht bloß zwei unabhängige Begriffssammlungen.',
 'Kanalhinweise und Spikemuster sind geliefert; erklärt wird der Mechanismus-/Codierungszusammenhang.', 'GK1','GK/LK','AP_component_coding_didactic'),
('080b10c7','Kontinuierliche/saltatorische Leitung vergleichen und tiergruppenbezogene Pauschalurteile begrenzen entspricht dem Faservergleich.',
 'Ein kontrollierter Modellvergleich und ein unkontrollierter Mehrfaktorenvergleich ergeben echte sachhaltige Variation.',
 '1/10=0,1 s, 1/50=0,02 s; passive Ausbreitung zwischen Knoten und regenerierte AP, kein springendes Teilchen.',
 'Dicke und Myelin variieren gemeinsam; Tiergruppen allein erlauben keine sichere Geschwindigkeitsrangfolge.',
 'Fasereigenschaften→Leitungsleistung ist eine gemeinsame Vergleichskompetenz.',
 'Geschwindigkeit/Geometrie sind gegeben; Vergleich und Laufzeitdeutung benötigen keinen zoologischen Abrufkatalog.', 'GK1','GK/LK','conduction_component'),
('c05e217f','Hormonkonzentrationsregelung plus länger anhaltender Stress als weiterer Regelkreiseingriff ist fachlich stimmig und BY EA explizit. HE LK Hormonverschränkung ist nur Kontext, kein ausdrücklicher GK-Chronischstress-Bullet.',
 'Rückkopplungskurve und länger anhaltender Input mit Glucose-Verbindung sind materialgebunden, ohne Diagnosebehauptung.',
 'Steigendes Cortisol hemmt upstream Signale; negative Rückkopplung ist entgegenwirkend, nicht negativer Konzentrationswert.',
 'Andauernder Input verändert den Verlauf trotz Rückkopplung; gegebene Glucose-Verbindung ist weiterer Kreis, keine Diabetesdiagnose.',
 'Regelkreisreaktion auf einen zeitlich veränderten Eingang bildet einen Zusammenhang; die zweite Regulation ist eine begrenzte Folge desselben Signals.',
 'Cortisol-/Glucose-Schema und Kurven sind gegeben; Rückkopplungsargument statt ungestützter Hormonlisten.', 'LK3','LK','chronic_stress_context_GK_hold'),
]
assert [r[0] for r in ROWS]==[g[:8] for g in ids]
notes={r[0]:r for r in ROWS}

description_results=[]; p_results=[]; atomic=[]; memory=[]
for g,d,p,row in zip(snap['goals'],decisions,profiles,ROWS):
    gid=g['id']; proposed_goal=byid[gid]; short=gid[:8]
    changes=[k for k in set(g)|set(proposed_goal) if g.get(k)!=proposed_goal.get(k)]
    description_results.append(dict(goalId=gid,wordingDecision='KEEP',overallCurrentScopeDecision='BLOCK' if short in ['485ef1c3','afde0001'] else 'REVISE',
      nativeDescriptionTerminalClaim=False,goalPDFPersonallyViewed=False,descriptionReasonDe=row[1],
      exactChangedFields=sorted(changes),bilingualSemanticEquivalence=True,
      proposedTitleDe=d['proposedTitleDe'],proposedTitleEn=d['proposedTitleEn'],
      proposedDescriptionDe=d['proposedDescriptionDe'],proposedDescriptionEn=d['proposedDescriptionEn'],
      sourceScopeHold='Retained current source rows/course/stage/whole-clause coverage require the per-binding remedies; no complete country-wide approval.',
      imagesMissing=True,visualApprovalClaim=False,preservationGoalIds=d.get('preservationGoalIds',[])))
    p_results.append(dict(goalId=gid,profileContentDecision='REVISE' if short=='8b23f8fb' else 'KEEP',
      reasonDe=row[2],evidenceLevel='E1',maximumClaimScope='G1',status='needs_human_review',reviewAuthority='ai_candidate',
      empiricalLearnerEvidence=False,sourceScopeResolved=False,assetBindingComplete=False,
      bilingualEssentialUnderstandingEquivalent=True,bilingualObservablePerformanceEquivalent=True,
      caseReviews=[dict(caseId='initial-bounded-model',taskAndAnswerDeEnPersonallyRead=True,scienceDecision='KEEP',
                        expectedAnswerCheckDe=row[3],scopeCompleteness='transduction_gap' if short=='8b23f8fb' else 'within_bounded_profile'),
                   dict(caseId='fresh-contextual-transfer',taskAndAnswerDeEnPersonallyRead=True,scienceDecision='KEEP',
                        expectedAnswerCheckDe=row[4],scopeCompleteness='transduction_gap' if short=='8b23f8fb' else 'within_bounded_profile')]))
    atomic.append(dict(schemaVersion=1,reviewId=REVIEW,ruleVersion='semantic-atomicity-v1',landscapeId=snap['landscapeId'],
      goalId=gid,fingerprint='sha256:'+'0'*64,status='atomic',semanticAtomic=True,reviewedAt=NOW,reviewer=REVIEWER,reason=row[5]))
    memory.append(dict(schemaVersion=1,reviewId=REVIEW,ruleVersion='memory-card-review-v1',landscapeId=snap['landscapeId'],
      goalId=gid,fingerprint='sha256:'+'0'*64,status='no_memory_needed',memoryUseful=False,memoryGoalIds=[],deckIds=[],
      reviewedAt=NOW,reviewer=REVIEWER,reason=row[6]))
write('description-wording-and-current-scope.actual.json',dict(schemaVersion=1,reviewId=REVIEW,reviewedAt=NOW,
      nativeDRun=False,actualNativeGoalPDFPagesViewed=0,sourcePDFPagesViewedSeparately=True,goals=description_results,
      claimLimit='Own wording/source review of current author input; no fabricated native D terminal or strictDescriptionComplete.'))
write('positive-evidence-profile-and-42-cases.actual.json',dict(schemaVersion=1,reviewId=REVIEW,reviewedAt=NOW,goals=p_results,
      totals=dict(profiles=21,contentKeep=20,contentRevise=1,casesScienceKeep=42,syntheticCases=42,actualLearnerDemonstrations=0),
      completionRule='Two independent demonstrations describe distinct evidence, not a mandatory quota of two additional task labels; genuine multi-step transfer in one learner submission can supply the evidence.'))
for name,records in [('semantic-atomicity.actual.review.jsonl',atomic),('memory.actual.review.jsonl',memory)]:
    (HERE/name).write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
for name,rule,reviewpath in [('semantic-atomicity.actual.config.json','semantic-atomicity-v1','semantic-atomicity.actual.review.jsonl'),
                             ('memory.actual.config.json','memory-card-review-v1','memory.actual.review.jsonl')]:
    write(name,dict(schemaVersion=1,reviewId=REVIEW,ruleVersion=rule,landscapeId=snap['landscapeId'],
      landscapePath=rel(AUTHOR/'proposed-twenty-one.validation-snapshot.json'),reviewPath=rel(HERE/reviewpath),
      scope=dict(label='Independent inactive 21 proposed neuro goals only, no active adoption',leafGoalIds=ids)))

# Current direct mappings are claims, not this review's approvals.
bindings=[]
BY_NOTES={
 'B8.2.1':('component_only','Neuron structure/function component matches proposed ce19; entire sense→nervous system→effector reaction chain needs actual union coverage beyond this neuron atom.'),
 'B8.2.4':('component_only','Hormone receptor/action explanation is a component; it does not by itself establish a joint neural/hormonal control circuit.'),
 'B8.2.7':('component_only','Comparison of two information routes is narrower than combined control circuit explanation; preserve comparison separately.'),
 'B13-EA.2.1':('goal_core_supported','GA and EA both explicitly support neuron structure-function. Narrowing the old AP part must preserve AP/conduction in each affected scope.'),
 'B13-EA.2.2':('goal_core_supported','GA and EA explicitly connect fluid mosaic membrane structure to compartment transport; not a coverage claim for the whole B13 topic.'),
 'B13-EA.2.3':('goal_core_supported','GA/EA explicitly require ion-data explanation plus maintenance energy; supplied permeability is a justified aid.'),
 'B13-EA.2.4':('goal_core_supported','GA/EA explicitly require AP particle mechanism plus coding; retain refractory/intensity/duration content in view coverage.'),
 'B13-EA.2.5':('goal_core_supported','GA/EA explicitly require fibre comparison and performance explanation; current controlled/uncertain examples are valid.'),
 'B13-EA.2.6':('component_only','Excitatory chemical synapse and substance intervention match; electrical synapses are unnamed; neuromuscular/chemical particle steps need actual bounded clause coverage.'),
 'B13-EA.2.7':('BLOCK_wrong_direct_binding','Alzheimer-only explanation does not cover depression symptoms, multifactorial brain metabolism, treatment or social handling. Remove exact equivalence; unresolved source debt must remain unless actual reviewed targets cover all required aspects.'),
 'B13-EA.2.8':('goal_core_supported','EA explicit inhibitory/excitatory integration fits the new e111 candidate; retain spatial/temporal requirements and bounded additive model.'),
 'B13-EA.2.9':('BLOCK_wrong_direct_binding','The primary competence and contents concern electrical recording and ENG/EKG. Brain imaging/BOLD is not a direct electrical recording and does not supply this whole clause.'),
 'B13-EA.2.10':('component_only','Plasticity prerequisite for learning overlaps the cellular explanation, but source necessity reasoning and explicit functional/structural content must be retained.'),
 'B13-EA.2.11':('BLOCK_wrong_direct_binding','The source requires BOTH MS and Parkinson symptom explanations. Alzheimer exemplification supplies neither full clause. Parkinson exam endpoint is not an equivalent curricular atom.'),
 'B13-EA.2.12':('goal_core_supported','EA joint neural/hormonal stress control explicitly supports current 197 combined explanation. No automatic GA or lower-grade full clearance.'),
 'B13-EA.2.13':('goal_core_supported_EA_only','EA explicitly covers hormone concentration/chronic stress intervention. GA has no corresponding B13 requirement; correct course metadata and preserve the further loop requirement.'),
 'B13-EA.2.14':('component_only','EA primary/secondary receptor potential fits component, but particle-level causation and applying to sensory phenomena are stronger than merely describing cell types.'),
}
for lane in source['lanes']:
    is_by='/DE-BY/' in lane['mappingPath']; source_by={s['id']:s for s in lane['sourceGoals']}
    for m in lane['mappings']:
        s=source_by[m['legacyGoalId']]; row=notes[m['canonicalGoalId'][:8]]
        if is_by: status,reason=BY_NOTES[s['sourceSpan']]
        else:
            status='REVISE_original_bullet_and_scope_binding'
            reason=f"Retained span {s['sourceSpan']} is an authored paraphrase, not an original official bullet ID. Rebind to actual HE p.43 {row[7]} ({row[8]}), with component status {row[9]}; exact whole-clause equivalence is not granted."
        bindings.append(dict(mappingPath=lane['mappingPath'],mappingSha256=lane['mappingSha256'],legacyGoalId=m['legacyGoalId'],
          canonicalGoalId=m['canonicalGoalId'],retainedMatchType=m['matchType'],retainedSourceSpan=s.get('sourceSpan'),
          retainedCourseLevel=s.get('courseLevel'),finding=status,reason=reason,wholeClauseApproved=False,
          primaryMethod='Fresh official LP+ web page GA/EA/B8 actual read' if is_by else 'Actual retained official PDF physical/printed p.43 personally viewed; official URL read',
          primaryURL='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht' if is_by and s['sourceSpan'].startswith('B13') else
                     'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/biologie' if is_by else
                     'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'))
write('retained-33-he-by-direct-bindings.actual.json',dict(schemaVersion=1,reviewId=REVIEW,bindings=bindings,
  originalHEQ23BulletCount=dict(sharedGK_LK=3,LKAdditional=7),authoredHEQ23ExtractionSpanCount=16,
  affectedWrongBYTargets=['485ef1c3-8997-52b7-91f5-b1ddf179013d','afde0001-d7d7-5ed3-8a60-383e8da5620e'],
  wrongBYDirectRows=3,blanketSourceApproval=False))

REG_NOTES={
 'DE-BB':dict(pages=[32,34],notes='p32 hormone action/puberty/cycle; p34 neuron structure/function, reaction chain, synapse as terminology, stress as context. Not electrical synapse, receptor-potential primary/secondary physiology or chronic cortisol feedback.'),
 'DE-BE':dict(pages=[32,34],notes='Same joint BE/BB original source as BB; exact PDF hashes checked separately. Same component limits, no doubled original-source evidence.'),
 'DE-HH':dict(pages=[22,24],notes='Neuron structure/function, conduction/reflex, hormone-vs-neural comparison and drug influence. No explicit full electrical synapse comparison or joint hormone control-loop mechanism.'),
 'DE-MV':dict(pages=[23,24],notes='Grade8 sense/reaction chain and neuron model/transfer; broad central nervous system, learning/memory and drug topics. No current full chemical/electrical comparison claim.'),
 'DE-NW':dict(pages=[16,35],notes='IF7 simple neuron/chemical synapse model, blood-glucose hormones and stress responses. IF3/IF8 sexual/cycle regulation mappings do not alone cover neural-hormonal joint control; chronic cortisol feedback not explicit.'),
 'DE-RP':dict(pages=[38],notes='Printed p35: neuron/sense structure-function models and chemical synapse key-lock interventions are explicit. Not electrical synapse; reaction path/coding/storage remains larger than these two atoms.'),
 'DE-SH':dict(pages=[26],notes='Actual SekI table has neuron/vegetative/somatic components and hormone glands/target action; whole SR/IK umbrella is broader. Do not import SekII p56 AP/receptor/plasticity requirements into a lower-source row.'),
 'DE-SN':dict(pages=[34],notes='Grade8 neuron/synapse electrical impulses/transmitters, reflex, vegetative control, hormone circuits, health/stress. Not detailed molecular AP/primary-secondary receptor physiology; avoid importing higher-course p64.'),
 'DE-ST':dict(pages=[39],notes='Grade9 reaction/reflex, systems/brain/senses, simple regulation, joint nerve/hormone stress are explicit. No whole cellular/electrical synapse comparison. Higher-course p59 is not evidence for this lower row.'),
 'DE-TH':dict(pages=[22],notes='Grades7/8 structure of neuron, reaction chain, hormone information and learning-related changed connections; no complete current chemical/electrical synaptic mechanisms. Higher-course p52 is not a lower-stage binding.'),
}
regbindings=[]; pdf_receipts=[]; inputs={rel(freeze):file_receipt(freeze)}
for r in read(freeze)['files']: inputs[r['path']]=file_receipt(ROOT/r['path'])
for lane in regional['lanes']:
    jurisdiction=next(part for part in Path(lane['mappingPath']).parts if part.startswith('DE-'))
    ep=ROOT/lane['sourceExtractionPath']; mp=ROOT/lane['mappingPath']
    assert sha(ep)==lane['sourceExtractionSha256'].removeprefix('sha256:') and sha(mp)==lane['mappingSha256'].removeprefix('sha256:')
    inputs[rel(ep)]=file_receipt(ep); inputs[rel(mp)]=file_receipt(mp)
    if jurisdiction in ['DE-BY','DE-HE']:continue
    extraction=read(ep); sd=extraction['sourceDocument']; pdf=ROOT/(sd.get('localPath') or sd['path'])
    meta=REG_NOTES[jurisdiction]
    if jurisdiction=='DE-BE': assert sha(pdf)==sha(ROOT/'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf')
    pr=dict(jurisdiction=jurisdiction,**file_receipt(pdf),primaryURL=sd['url'],
       physicalPagesActuallyRead=meta['pages'],method='Own fresh pdftotext -layout reading; no author conclusion used' if jurisdiction!='DE-BE' else
       'Reuse own actual joint BB/BE original p32/p34 read after verifying BE PDF byte-identical to BB; not an extra independent original read',ownSourceComponentNotes=meta['notes'],wholeSourceApproved=False)
    pdf_receipts.append(pr); inputs[rel(pdf)]=file_receipt(pdf)
    sg={s['id']:s for s in extraction['sourceGoals']}
    for m in lane['mappings']:
        g=m['canonicalGoalId']; short=g[:8]
        limit={
          'ce19b80f':'Neuron structure/function is a valid lower-stage component. Full source reaction chain/system/health umbrella coverage must be demonstrated by the actual union of targets; AP narrowing must not silently drop a previously valid component.',
          'ff1bf88f':'Chemical synapse or synaptic/neuronal information transfer overlaps; electrical synapses are not an automatic lower-stage compulsory requirement. Preserve allowed simple-model demand rather than impose a full molecular/electrical comparison.',
          '19758e09':'Hormone action/system comparison/combined stress may overlap by lane. Puberty/cycle alone is not a joint neural-hormonal circuit. Bound exact local shared competence and preserve each larger source demand elsewhere.',
          '78748ef2':'Sense-organ structure/function/reception does not establish the whole LK receptor potential plus primary/secondary sensory-cell competence. Current source/stage applicability remains uncleared.',
          'c05e217f':'Stress/health/regulation context is not complete chronic cortisol negative-feedback plus further hormonal-loop intervention evidence. The whole advanced goal must not be made compulsory from this lower context.',
        }[short]
        regbindings.append(dict(jurisdiction=jurisdiction,mappingPath=lane['mappingPath'],mappingSha256=lane['mappingSha256'],
          legacyGoalId=m['legacyGoalId'],canonicalGoalId=g,retainedMatchType=m['matchType'],sourceRef=sg[m['legacyGoalId']].get('sourceRef'),
          finding='REVISE_component_stage_whole_scope_binding',reason=limit,primaryNotes=meta['notes'],wholeClauseApproved=False))
write('regional-38-bindings-and-10-lower-lanes.actual.json',dict(schemaVersion=1,reviewId=REVIEW,
   bindings=regbindings,primaryReadReceipts=pdf_receipts,allRetainedLanes=12,nonHEBYLanes=10,blanketLowerScopeApproval=False,
   claimLimit='Actual targeted original PDF readings check the affected component/stage. This is not a whole landscape, complete review-decision union or source-atlas release.'))
assert len(bindings)==33 and len(regbindings)==38

he=ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
assert sha(he)=='52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558'
inputs[rel(he)]=file_receipt(he);inputs[snap['canonicalPath']]=file_receipt(ROOT/snap['canonicalPath'])
shutil.copyfile('/tmp/bio-q2-independent-a-he-p43.png',HERE/'sources/HE-physical-page-043.actually-viewed.png')
write('sources/primary-read-methods.actual.json',dict(schemaVersion=1,reviewedAt=NOW,
  HE=dict(**file_receipt(he),physicalPage=43,printedPage=43,personallyViewedPNG=True,originalGK_LKBullets=3,originalLKBullets=7),
  officialWebSourcesActuallyRead=[
   dict(url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht',section='B13 2 competencies+contents; EA'),
   dict(url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/grundlegend',section='B13 2 competencies+contents; GA'),
   dict(url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/biologie',section='B8.2 competencies+contents'),
   dict(url='https://www.nimh.nih.gov/research/research-conducted-at-nimh/research-areas/clinics-and-labs/lbc/sfim',section='Own actual fMRI hemodynamic mechanism/interpretation limits read'),
   dict(url='https://pubmed.ncbi.nlm.nih.gov/4727085/',section='Bliss/Gardner-Medwin original experiment abstract; lasting potentiation and separate transient effects'),
   dict(url='https://pubmed.ncbi.nlm.nih.gov/1350090/',section='Dudek/Bear original LTD experiment abstract; control, persistence and specificity'),
   dict(url='https://pubmed.ncbi.nlm.nih.gov/2147780/',section='Gerfen et al. original experiment abstract; receptor/pathway-specific dopamine effects, not universal excitation')],
  localRegionalReads=pdf_receipts,privateDataAccessed=False,scientificReferencesAreCurricularApproval=False,
  claimLimit='Scientific originals support bounded mechanism checks, not a named official compulsory course requirement.'))

# The author profile remains byte-semantic exact even where a revision is required.
# Records are honest E1/G1 candidates and retain dissent; no profile is approved.
candidate=copy.deepcopy(read(AUTHOR/'positive-evidence.candidates.json'))
candidate['reviewId']=REVIEW;candidate['reviewedAt']=NOW;candidate['reviewer']=REVIEWER
for p,row in zip(candidate['goals'],ROWS):
    p['reason']='Independent actual A content review of both bilingual draft cases: '+row[2]+' Source and visual binding remain open; no empirical learner work.'
    p['dissent']=[
      'Current retained HE/BY/regional binding rows remain subject to the exact component/course/stage findings in this independent package.',
      'All 21 goal images are missing; no native description-PDF or V completion is claimed.',
      'E1/G1 synthetic draft, needs_human_review / ai_candidate; no actual learner demonstrations or human authority.',
    ]
    if row[0]=='8b23f8fb':p['dissent'].append('Content REVISE: both cases omit the explicit transduction demand. Keep coding science but add a justified transduction-to-code link in a current case before adoption.')
write('positive-evidence.independent-a.candidates.json',candidate)
config=read(AUTHOR/'positive-evidence.validation-only.config.json');config['reviewId']=REVIEW
config['reviewPath']=rel(HERE/'positive-evidence.independent-a.actual.review.jsonl')
config['scope']['label']='Inactive independent A actual content-reviewed 21 E1G1 candidates with retained source/V holds and one profile revision'
write('positive-evidence.independent-a.config.json',config)
for f in ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts',
          'app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts',
          'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
          'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',
          config['semanticKindLedgerPath']]:inputs[f]=file_receipt(ROOT/f)
write('actual-inputs.binding-manifest.json',dict(schemaVersion=1,reviewId=REVIEW,capturedAt=NOW,
  authorFreezeSha256=sha(freeze),files=list(inputs.values()),activeWhole21ObjectsExactCapture=True,
  ownAuthorshipOfInput=False,otherCurrentQ2ReviewRead=False,currentQ1AReviewRead=False,wholeCountryApproval=False))
write('current-vs-proposed-four-goal-delta.actual.json',dict(schemaVersion=1,goals=[
  dict(goalId=g['id'],changedFields=sorted(k for k in set(g)|set(byid[g['id']]) if g.get(k)!=byid[g['id']].get(k)),
       before=g,after=byid[g['id']]) for g in snap['goals'] if g!=byid[g['id']]],
  goalIDsPreserved=ids,unchangedWholeGoals=17,descriptionChanges=3,titleOnlyChanges=1,activeWritten=False))
print(json.dumps(dict(profiles=21,caseReviews=42,HEBYBindings=len(bindings),regionalBindings=len(regbindings),
       descriptionWordingKeep=21,descriptionOverallScopeRevise=19,descriptionOverallScopeBlock=2,profileContentKeep=20,profileContentRevise=1,sourceWrongDirectRows=3)))
