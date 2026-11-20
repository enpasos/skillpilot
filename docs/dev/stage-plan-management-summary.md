# Management Summary zu Lernfluss und Stufenplänen

Ziel ist die vollständige Umsetzung von **K1–K13 und F1–F7** aus
[PR #156](https://github.com/enpasos/skillpilot/pull/156), integriert auf
`main` mit frischer erfolgreicher CI. Die Agenten verantworten Recherche,
Entscheidungen und Umsetzung; der Product Owner kontrolliert die Ergebnisse.
Der verbindliche Umfang steht in der [Übergabe](stage-plan-units-handover-2026-11-15.md).

Jedes Paket erhält einen datierten Eintrag mit Uhrzeit und Zeitzone, Fortschritt,
Ergebnis und Entscheidungen, Kontrollstellen, Nachweisen, Integrationsstand
und nächstem Schritt. Die Fortschrittszahlen zählen vollständig abgeschlossene
Arbeiten, keine gewichteten Prozentwerte. Entwürfe und Teilreparaturen bleiben
offen. Der neueste Paketeintrag steht oben; sein Zeitstempel wird bis zum
Abschluss aktualisiert. Frühere Abschlüsse bleiben erhalten.

Offene Einträge verweisen auf den PR. Erst der Abschluss nennt den geprüften
Implementierungscommit und den erfolgreichen Main-CI-Lauf. Dessen Jobzahl
wird getrennt von zusätzlichen oder zeitgesteuerten Commit-Checks angegeben.
Ein kleiner Doku-Abschlusscommit oder kurzlebiger Doku-PR ist danach erlaubt;
er erhält die Dokumentationschecks. Die große CI schließt `docs/dev/**` und
`AGENTS.md` bei reinen Änderungen dieser Pfade derzeit aus. Der dokumentierte
CI-Nachweis gilt weiterhin für den benannten Implementierungscommit.

## 20. November 2026, 01:56 MEZ (UTC+01:00) – Prüfungsbelege in Hessen Physik E.1

Ein bestandener, mit Claude bewerteter Prüfungsversuch erhält einen Beleg für die damalige Aufgabe und ihr Bewertungsraster. Das Cockpit zeigt Datum, Punktzahl und Bestehensgrenze am Prüfungsziel. Beim Besprechen einer angebotenen Prüfung sieht Claude den jüngsten gespeicherten Beleg für genau dieses Ziel. Die Anrechnung auf den Abschluss der gesamten Einheit ist ein eigener, noch offener Schritt.

**Zur Durchsicht.** In der lokalen Hessen-Ansicht die Aufgabe „Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit“ öffnen. Für zwei synthetische Profile hat der echte MCP-Prüfpfad 24 von 36 Punkten (G8) und 30 von 36 Punkten (G9) gespeichert. Unter „Deine Prüfungsnachweise“ erscheint in beiden Profilen die damalige Bestehensgrenze von 22 Punkten. Auf der Lernkarte lässt sich anschließend prüfen, dass die übrigen fachlichen Lernziele ihren bisherigen Stand haben.

**Prüfung und Stand.** Der [MCP-Integrationstest](../../backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CanonicalExamIntegrationTest.java) prüft den Weg vom Bewertungsraster bis zum gespeicherten Beleg. Der [Materialvergleich](../../backend/src/test/java/com/skillpilot/backend/completion/AssessmentMaterialRevisionTest.java) prüft beide Aufgaben der Untereinheit gegen ihre fachlich geprüften Fassungen. Die [Tests zur persönlichen Sicherung](../../backend/src/test/java/com/skillpilot/backend/service/VerifiedExamPassBackupIntegrationTest.java) behandeln Wiederherstellung, Altdaten und Fremdkopien. Die Browserdurchsicht umfasste das deutsche Desktop- und Mobil-Cockpit sowie die englische Desktopansicht. Die Lernendenaufgabe ist bereits veröffentlicht. Diese Technikrunde enthält keine neue fachliche Aufgabenfreigabe oder Erprobung in Claude Web oder Android.

K 0/13 und F 0/7 vollständig abgeschlossen, 0 neue reale Stufenpläne. Diese Änderung betrifft keine Platzierungen oder Kanten. Die Integration wird im [Pull Request](https://github.com/enpasos/skillpilot/pull/169) verfolgt. Als Nächstes ist für E.1 zu prüfen, welche Kombination aus Teilnachweisen den veröffentlichten Einheitenvertrag erfüllt.

## 19. November 2026, 21:41 MEZ (UTC+01:00) – Einstieg, Lernkarte und Coach-Kontext in Hessen Physik E.1

**Lokale Prüfrunde für G8 und G9.** „Ein Ball rollt vom Tisch. Wo landet er?“ eröffnet die Einheit. Die Lernenden nutzen vorgegebene Bewegungsdaten, um eine Vorhersage zu begründen. Drei Übungen schließen an die Ziele zu Modellierung, Sicherheitsabstand und waagerechtem Wurf an. Bei jeder Aufgabe lassen sich ein Hinweis und die Musterlösung getrennt öffnen. Die Übungen dienen der Selbstkontrolle. Die zweisprachigen Aufgaben stehen im Arbeitsbaum unter `curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json`.

**Zur Durchsicht.** Vom waagerechten Wurf die Lernkarte öffnen, „Lernkarten zu E.1“ wählen und anschließend die Phasenprüfung „Bewegungsanalyse und freier Fall“ ansehen. Beide verweisen auf die vorhandenen Lernziele. Der Themenstapel umfasst neun der 87 Phasenkarten. Drei Übungen öffnen sich direkt am jeweiligen Fachziel, auch in der mobilen Zielliste. Der Vergleich im echten Cockpit für G8 und G9 ergab in E.1 vorher 12 Knoten und 12 Pfeile, anschließend 14 Knoten und 14 Pfeile. Beide zusätzlichen Pfeile führen aus tatsächlich benötigten Themen zur Prüfung. In beiden Karten gab es vor und nach der Änderung null Rückgriffe. Vier Browserdurchläufe auf Desktop und Smartphone prüften den Einstieg, die drei Übungen, beide Ressourcen und den gespeicherten Lernstand. Die drei Modellrechnungen wurden separat fachlich gesichtet. [Browsertest](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsMemoryUi.ts) · [Prüfung der Projektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts)

**Stufenübersicht im lokalen Cockpit.** Bei gemeinsamer Auswahl von Grund- und Leistungskurs lieferte der lokale Entwicklungsserver nur die Leistungskurssicht. Acht Grundkursaufgaben aus den beiden Abitur-Beispielklausuren erschienen dadurch auf der Stufenübersicht als „Vorbereitung“. Der Entwicklungsserver fragt bei konfiguriertem lokalem Backend nun dessen gemeinsame Kurssicht ab. Die Browserprüfung in Hessen G8 und G9 mit Mathematik und Physik im persönlichen Curriculum und nur Physik auf der Karte ergab jeweils vorher zehn Knoten und neun Pfeile, danach die beiden Schulstufen mit einem Pfeil. Unter Sekundarstufe II → Abiturprüfung liegen die acht Grundkurs- und acht Leistungskursaufgaben. Die Karten der Stufenübersicht, der Oberstufe und der Abiturprüfung zeigten nach der Änderung jeweils null Rückgriffe. Die gespeicherten Einzelnachweise blieben in allen vier Vorher- und Nachher-Durchläufen identisch. Die Screenshots und Messwerte stehen lokal unter `tmp/hessen-physik-e-lokal/pruefung-wurzel-20261119/testnotiz.md`.

**Im Gespräch.** Das Backend ordnet das bestätigte Lernziel in die persönliche Sicht ein. Zum Wurf gehören die Voraussetzungen „Bezugssysteme und Geschwindigkeitsüberlagerung“ und „Modellierung und Idealisierung von Bewegungen“. Der Coach sieht, für welche Voraussetzungen ein Einzelbeleg vorliegt. Ein bestätigter Erlass ist mit seinem Grund und dem geltenden Abschnitt gekennzeichnet. Auf Wunsch erhält der Lernende im Gespräch dieselbe Aufgabenstellung wie am Fachziel in der Karte. Die neun Karten lassen sich direkt im Gespräch in der Sitzungssprache üben. Das Öffnen der Karte setzt kein Lernziel, das Üben eines Teilstapels bescheinigt keinen Einheitenabschluss. Ein Erstversuch der Phasenprüfung ist im Gespräch möglich, wenn das Backend ihn anbietet. 128 automatisierte Backendtests in zwölf Testklassen bestanden, darunter die hessischen G8- und G9-Sichten, der englische Kartenstart, die Trennung von Einzelbeleg und Erlass und der Wechsel in eine Prüfung. Ein Gespräch im Claude-Client steht noch aus. [Coach-Kontext](../concept/skill-graph/knowledge-context.de.md)

**Abschlussfrage.** Das Lernversprechen und die Fachunterlage halten die Entscheidung zu vorgegebenen Messdaten fest. Ein eigenes Messprotokoll ist im Lernweg freiwillig. Der Abgleich der verlinkten Phasenprüfung mit ihrem Raster zeigt, dass selbst ohne die gesamte Fallaufgabe 19 Punkte bei einer Bestehensgrenze von 15 Punkten möglich sind. Dieser Befund gehört in die Diskussion über den Einheitenabschluss. [Abgrenzung der bestehenden Prüfung](../concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md#was-geschieht-mit-den-vorhandenen-prüfungen)

**Prüfung und Weiterlernen.** Direkte Versuche beginnen mit der ausdrücklichen Wahl einer angebotenen Prüfung. Ein früheres Opt-out im Profil sperrt sie nicht mehr. In G8 und G9 führte die Phasenprüfung aus E.1 bis zur Claude-Auswahl. Die reguläre Stufenansicht und der Einstellungsdialog wurden in beiden Bildungsgängen im lokalen Browser geprüft. Unter „Angerechnete Lernziele weiter einplanen“ wählen Lernende, ob der Plan auch individuell noch offene angerechnete Ziele zum Weiterlernen vorschlägt. Ein freiwilliges Fachziel können sie unabhängig davon wählen. Der Prüfungsnachweis bleibt dabei bestehen.

**Claude.** Der lokale 1.1.15-Kandidat hat 47.454 Bytes. Zwei separate Builds waren byteidentisch. Für die Verpackung und Anweisungen bestanden 188 automatisierte Tests, für die Release-Verträge und den Direktdownload weitere 64. Die eigenständige Marketplace-Prüfung erfasste 33 Fälle und der Support-Test 18. Zwei strikte CLI-Validierungen und eine isolierte lokale Installation bestanden. Die Prüfläufe belegen das Paket und die lokalen Zugänge. Die Erprobung im tatsächlichen Claude-Chat steht aus. [Releaseprotokoll](../deploy/claude-personal-marketplace-release.md)

**Integration abgeschlossen.** [PR #167](https://github.com/enpasos/skillpilot/pull/167) ist auf `main` integriert. Die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44583827202) bestand mit 14 von 14 Jobs. Der [Merge-Commit `afcfc111ea`](https://github.com/enpasos/skillpilot/commit/afcfc111ea7ca990c665f446c558b23f5dd6f7eb) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44599563115) endete am 19. November 2026 um 21:40 MEZ mit 14 von 14 erfolgreichen Jobs. Der Nachweis gilt für diesen Implementierungscommit. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche Stufenpläne wurden aktiviert. Die nächste fachliche Durchsicht betrifft die drei Übungsabschlüsse und den Entwurf für einen vollständigen E.1-Nachweis. Die Freigabe der Hessen-Vorlage durch den Product Owner steht aus.

## 19. November 2026, 09:55 MEZ (UTC+01:00) – Verstehenslernziele im Claude-Coach

Der Claude-Coach **1.1.14** und die zugehörigen Backend-Anweisungen greifen die Rückmeldung eines Schülers aus der Claude-Beta auf. Bei „Weiß ich noch nicht“ erklärt der Coach einen neuen Begriff an einem Beispiel. Wer eine Vorstellung mitbringt, kann sie besprechen. Eine Rückfrage kann auch nach einer Aufgabe direkt ins Gespräch führen. Zur Durchsicht eignen sich der Einstieg am Fahrradtacho und die Frage, warum bei der Beschleunigung die Sekunde zweimal in der Einheit steht. Ein selbstständiger Nachweis ist weiterhin erforderlich, bevor der Coach ein Fachziel als erreicht speichert. [Beispielgespräche und Fragen für die Erprobung](../concept/didactic/claude-beta-erklaeren-2026-11-19.de.md)

182 automatisierte Paketprüfungen und 78 Backend-Vertragstests bestanden lokal. Die Erprobung im tatsächlichen Claude-Chat mit dem Schüler steht aus. [PR #164](https://github.com/enpasos/skillpilot/pull/164) ist auf `main` integriert. Der Product Owner übernimmt das Produktionsdeployment. Der persönliche Marketplace liefert 1.1.14 aus. Die öffentliche Neuinstallation und das Update einer bestehenden Claude-Code-Installation von 1.1.13 wurden an allen sieben Dateien geprüft. [Marketplace-Veröffentlichung](https://github.com/enpasos/skillpilot-claude-marketplace/pull/17) · [Marketplace-CI](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/44491443543) Für K1–K13/F1–F7 kommt damit kein weiterer Abschluss hinzu. Es wurden 0 reale Stufenpläne aktiviert und keine curricularen Kanten geändert. [Claude-Skill](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md#coaching-and-completion) · [Backend-Vertragstests](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1LearningPlanContractTest.java)

## 19. November 2026, 15:24 MEZ (UTC+01:00) – Hessen, Physik in der Einführungsphase

**Stand der gemeinsamen Erprobung.** Die Platzierungen für G8 und G9 sind auf `main` integriert. Die fachliche Abnahme durch den Product Owner steht aus. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche reale StagePlans sind aktiviert. Der Product Owner hat [PR #164](https://github.com/enpasos/skillpilot/pull/164) als `039a7c39d9499a77694652959cb153c01cd6918c` integriert. Die [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44491281472) und die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44482845166) endeten jeweils mit 13 von 14 erfolgreichen Jobs. Von 2.844 Backend-Tests scheiterte auf `main` einer. Er erwartete den bisherigen Prüfungsordner in der E-Phase. [PR #165](https://github.com/enpasos/skillpilot/pull/165) prüft die einzelnen Platzierungen in G8 und G9. Im [ersten vollständigen Reparaturlauf](https://github.com/enpasos/skillpilot/actions/runs/44493719219) bestand das Backend. Der Frontend-Test fand ein ungültiges Format im Veröffentlichungsnachweis für Claude 1.1.14. Der Nachweis verwendet jetzt das für PR, beide CI-Läufe und Verifikation festgelegte Format. Nach der Korrektur scheiterte die Installation von Ubuntu-Paketen für Chromium auf mehreren Runnern, auch beim zweiten Versuch. Die CI kann die signierten Ubuntu-Pakete jetzt zusätzlich über den Spiegel der UC Davis beziehen. Die 13 in den Fehlermeldungen genannten Pakete waren dort per HTTPS erreichbar. [Gemini-Wiederholung](https://github.com/enpasos/skillpilot/actions/runs/44522712716/job/135559580647) · [Assessment-Completion-Job](https://github.com/enpasos/skillpilot/actions/runs/44522712653/job/135555182372)

**Abschluss der CI-Reparatur.** Auf Wunsch des Product Owners wurde [PR #165](https://github.com/enpasos/skillpilot/pull/165) während des laufenden PR-Checks in `main` integriert. Der [PR-Lauf auf `107db96596`](https://github.com/enpasos/skillpilot/actions/runs/44525665807) endete mit 14 von 14 erfolgreichen Jobs. Der [Implementierungscommit `9d8bc8492a`](https://github.com/enpasos/skillpilot/commit/9d8bc8492aa82475ad7e6ee72741b2fe247a76b6) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44531180934) endete am 19. November 2026 um 15:23 MEZ mit 14 von 14 erfolgreichen Jobs. Der Regressionstest prüft 18 Prüfungsplatzierungen für G8 und G9 mit GK, LK und der gemeinsamen Auswahl GK+LK. Beim simulierten Ausfall der beiden bisherigen Quellen lud APT das Paket über den Ersatzspiegel und prüfte es anhand des signierten Paketindexes.

**Ergebnis.** In acht hessischen Physikansichten liegen 17 der 21 zuvor in vier Sammlungen geführten Prüfungen direkt beim Thema oder bei den Methoden. Vier Prüfungen haben einen gemeinsamen Platz auf Phasenebene. Davon öffnet sich „Bewegungsanalyse und freier Fall“ auch direkt aus E.1. Die bestehenden kanonischen Angaben verlangen für diese Aufgabe Tabellenkalkulation, obwohl die Aufgabe rechnerisch gelöst wird. Ob die Aufgabe die hinterlegten Kompetenzen vollständig nachweist, bleibt eine eigene fachliche Frage. Die qualitative Reibung liegt jetzt bei den Kräftebilanzen in E.2. Die beiden Zugänge zum Lernkartenstapel bieten wahlweise die E-Phase oder die zum Thema gehörigen Karten an. Die fünf Ordnungspfeile der Oberstufe bleiben bei der Auswahl einer Einheit lesbar.

**Zur Durchsicht im Cockpit.** In der Einführungsphase den Gesamtstapel öffnen, in E.1 die thematische Kartenauswahl und die Prüfung zum freien Fall ausprobieren und auf der Ebene darüber bei ausgewähltem Q2 die übrigen Pfeile betrachten. Die vorhandenen Prüfungsaufgaben und ihre Bewertungsraster wurden für die Platzierung unabhängig inhaltlich gesichtet. Bei allen acht geänderten Sichten ergab die Messung der verschachtelten Einheiten jeweils null Rückgriffe vor und nach der Änderung. Im G9-Grundkurs verringerte sich die Zahl der sichtbaren Verbindungen auf der Phasenkarte von 15 auf 10. Im echten lokalen Cockpit ließen sich die Originalprüfung und die neun Themenkarten in G8 und G9 mit Grundkurs öffnen. Die eigenständigen Browsertests prüfen auch, dass die letzte Bewertung eines Themenstapels gespeichert wird und den Gesamtstapel offen lässt, solange weitere Karten ausstehen. Die vollständige lokale Physikprüfung bestand für alle 90 Ansichten. Zusätzlich bestanden alle acht Tests zur Einordnung der Methoden. Die übergreifende Strukturprüfung erfasste 387 Ansichten aus 21 kanonischen Landschaften und meldete 0 Fehler und 2.576 Warnungen. Für die nächste Runde hat der Product Owner einen motivierenden Einstieg und einen sichtbaren Übungsabschluss in E.1 angesprochen. [Generatortests](https://github.com/enpasos/skillpilot/blob/main/scripts/test_generate_hessen_physics_stage_views.py) · [Tests der realen Kartenprojektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts) · [Browserprüfung der Pfeile](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testNativeLearnerMapUi.ts)

<!-- composition-partial-order-20261117:start -->
## 17. November 2026, 13:53 MEZ (UTC+01:00) — Fachliche Teilordnungen in allen Länderansichten

**Aktueller Integrationsstand:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist am 17. November integriert. Der vollständige
[PR-CI-Lauf 44062503114](https://github.com/enpasos/skillpilot/actions/runs/44062503114)
auf `f62482036186a5c3afc9e58059509922d64f0e8a` ist mit **14 erfolgreichen Jobs**
abgeschlossen. Der integrierte Implementierungscommit
`05eabe5a43d0b07e3845189b5d14d82326f76ce8` hat exakt denselben Git-Baum.
Seine frische [Main-CI 44075738245](https://github.com/enpasos/skillpilot/actions/runs/44075738245)
ist am 17. November um **13:51:57 MEZ mit 14 von 14 erfolgreichen Jobs**
abgeschlossen. **Diese begrenzte Länderlieferung ist damit abgeschlossen.**
Die Jobzahl gehört ausschließlich zu diesem CI-Lauf. Der kleine spätere
Dokumentationsabschluss erhält eigene Dokumentationschecks; der vollständige
Implementierungsnachweis gilt für den hier genannten Commit.
Weiterhin sind **K 0/13 und F 0/7 vollständig abgeschlossen** und **0 neue
reale StagePlans aktiviert**. Die unten dokumentierten Inhaltsreviews,
Lernendenaufgaben, Kartenmessungen und automatisierten Prüfungen bleiben
voneinander getrennte Nachweise. Die folgenden CI-Zwischenstände sind
Historie; ihre damaligen offenen Integrationsschritte gelten nicht als
Beschreibung des jetzigen Merge-Status.

**Historischer Zwischenstand vor den folgenden CI-Korrekturen:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist offen. Der vollständige [PR-CI-Lauf 44025354365](https://github.com/enpasos/skillpilot/actions/runs/44025354365)
endet auf `2c20e11117c130f898b42d929078cd673094590f` mit **10 erfolgreichen
und 4 fehlgeschlagenen Jobs**. Die frühere Aussage um 06:31, sämtliche lokalen
Prüfungen seien abgeschlossen, war zu weitgehend: Zwei generierte Mathematik-
Ausschnitte, der Physik-Visualisierungsstatus und mehrere an die alte Gliederung
gebundene Testannahmen waren nicht aktuell. Die Korrekturen sind jetzt lokal
unabhängig geprüft: **240/240 Tests der vier betroffenen Backendklassen**
bestehen. Die exakten 52 Controller-Fixtures binden Auswahl und unbeschnittene
Lernbasis; reine Dauer-Kompatibilitätsfälle sind keine amtlichen Angebote.
Mathematik und Physik
bleiben im erneut ausgeführten Qualitätsstatus global M7; die geschützten
Untergrenzen bestehen. Merge und frische erfolgreiche Main-CI stehen aus.
Dieser Eintrag aktualisiert den Lieferstand der darunter erhaltenen früheren
Berichte; deren Zahlen und geprüfte Commitbindungen bleiben historische Belege.

**Zweiter CI-Nachtrag:** Der anschließende vollständige
[Lauf 44037739517](https://github.com/enpasos/skillpilot/actions/runs/44037739517)
auf `bce7769b25b5c4f37dc68dace3484d21b590b5d6` endet mit **11 erfolgreichen
und 3 fehlgeschlagenen Jobs**. Ursachen sind ein veralteter G8/G9-Bericht,
alte Navigationsannahmen im Lernzielauswahltest und fehlende Python-
Abhängigkeiten im integrierten Paketbau. Alle 16 Paketgrenztests bestehen
nach der Abhängigkeitskorrektur in einer frischen Python-Umgebung.

**Zusätzlich behobener Fokusfehler:** Die unabhängige Gegenprüfung der
Navigation fand einen echten Laufzeitfehler: In der kanonischen Ansicht
blieben beim Fokus auf Mathematik J8 nur 28 der 40 kanonischen Atome erhalten.
Der Fokus liest jetzt bei kanonischen Wurzeln deren kanonische Unterziele;
synthetische Einheiten behalten ihre tatsächlichen sichtbaren Kinder. Die
sichtbaren Fokusmarkierungen erfassen genau die ausgewählten Blätter. Der
unabhängige Review besteht für alle sechs Fälle aus kanonischer bzw.
bayerischer Ansicht und drei direkten Routen: jeweils **40/40 Fokusatome**,
vollständig erhaltene Lernbasis, 831 Gleichheitsprüfungen synthetischer
Gruppen und 30 exakte Markierungsfälle. Die ursprüngliche Gegenprobe mit
0/40 Atomen bei direkter Route hatte die App-Reihenfolge ohne vorhandene
Scope-Metadaten nachgebildet; sie ist ausdrücklich kein bestätigter
Laufzeitfehler. Die korrigierte Gegenprobe und der anschließende Review sind
getrennt erhalten.

Die Auswahlprüfung bewahrt den exakten kanonischen J8-Umfang mit 48 Knoten
und 40 Atomen. Die Prisma-Prüfung verwendet ein tatsächlich ausgewähltes
Kursziel und dessen 34 atomare Lernziele mit 33 kanonischen
Voraussetzungspfaden. Die Quellverdrahtung von App über useAppCore bis zum
Fokusmemo ist geprüft. Dies sind UI-Logik- und Quellenprüfungen, keine
zusätzliche Browser-/HTTP-Abnahme. Der neue Fünfdateistand samt separatem Workflow-Reihenfolgenachtrag ist
unabhängig freigegeben. Der Vite-Produktionsbau, Typecheck, Lint der geänderten
TypeScript-Dateien, neun CI-Strukturtests und 42 nachfolgende lokale
Prüfschritte bestehen; weitere unveränderte Frontend-Prüfungen laufen. Erfolgreiche vollständige
PR-CI, Merge und frische Main-CI stehen weiterhin aus.

**Dritter CI-Nachtrag:** Im [Lauf 44050515021](https://github.com/enpasos/skillpilot/actions/runs/44050515021)
auf `a5f0dceeb2bb99aa5b13bbbf3e214b72349f8418` sind abschließend **13 von 14
Jobs erfolgreich**, einschließlich des Backends. Der Frontendjob scheitert nach erfolgreichen
UI-Prüfungen und Anwendungsbau ausschließlich am veralteten Zielzähler im
Transparenzinventar: 6.657 statt 6.666. Die neun neuen Physikprüfungen erklären
die Differenz. Der korrigierte Zähler ist unabhängig über alle 21 Kanonmodelle
nachgerechnet; sämtliche anderen Inventurangaben bleiben bytegleich.
Vollständiger lokaler Inventurcheck und bestehende Negativregressionen bestehen.
Die [separaten Belege](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v3/README.md)
enthalten keine neue inhaltliche oder rechtliche Freigabe. Die zunächst
protokollierte Beobachtung mit noch laufendem Backend bleibt als Zeitpunktbeleg
erhalten. Die korrigierte Lieferung benötigt einen neuen vollständigen
PR-CI-Lauf; Merge und Main-CI bleiben offen.

- **Fortschritt:** weiterhin **K 0/13 und F 0/7 vollständig abgeschlossen**,
  **0 neue reale StagePlans aktiviert**. Geliefert werden 100 Mathematik- und
  90 Physik-Composition-Views für alle 16 Länder und die kanonische Sicht,
  einschließlich der anwendbaren G8-/G9- und Einzelstufenvarianten. Die Länder-
  und Quellenprüfung verbessert K12/K13 sowie F1–F6, schließt deren gesamten
  Auftrag aber nicht allein ab.
- **Modellentscheidung:** explizite fachliche `after`-Teilordnungen ersetzen
  unbegründete Gesamtabfolgen. Atomare Voraussetzungen bleiben erhalten;
  erforderliche Grundlagen erhalten einen belegten Erwerbsplatz. Hessen E.1
  → E.2 → E.3 bleibt geordnet, E.4–E.7 bilden keine gegenseitige Kette.
  Spezielle Relativitätstheorie erhält keine künstlichen Q4-Vorgänger.
  Quellenmitgliedschaft, amtliche Zeitgranularität und Lernplatz bleiben getrennt.
- **Gemessene Kartenwirkung:** 216 native Kontexte, **708 Stufen- und 36.051
  verschachtelte Bretter**, **0 Rückpfeile, 0 Kreise, 0 fehlende erklärte
  `after`-Beziehungen**. Der kontrollierte Vergleich derselben aktuellen
  Messlogik mit eingefrorenen alten Ansichten erfasst 1.148 problematische
  Bretter mit insgesamt 1.432 Rückpfeil-, 884 Kreis- und 1.666 fehlenden
  Ordnungsbefunden; Mehrfachvorkommen sind keine eindeutigen Kanten. Dies ist
  kein erneuter Lauf einer alten Runtime. Exakte native S/L-Vergleiche:
  133 unverändert, 63 quellenbegründete neue Sek-I-Auswahlen, 20 ausschließlich
  durch geprüfte Aufgaben ergänzte Kontexte, 0 unerwartete Umfangsänderungen.
- **Grenze der bisherigen Messung:** Die 216 Kontexte verwenden gleiche
  Kursprofile für Mathematik und Physik. Die zusätzliche Hessen-Prüfung mit
  54 gemischten Kurs-/Stufen-/Dauerkontexten zeigt acht bislang fehlende
  `after`-Erklärungen beim Erwerb der Produktregel. Diese Fälle gehören zum
  laufenden Folgepaket; die obigen Nullwerte gelten nicht pauschal für alle
  Kombinationen. Zusätzlich sind 36 Hessen-Kontexte mit nur einem gewählten
  Fach nativ erfasst; ihre sichtbaren Karten sind noch nicht abgenommen.
- **Neu gefundene Folgearbeit:** Die getrennte unabhängige Kinematikprüfung
  beanstandet die Vollabdeckungsangaben von fünf älteren Aufgaben. Ein sichtbarer
  kanonischer Physik-Vorbereitungsordner trägt außerdem einen irreführenden
  GK-Abiturtitel. Beide Befunde sind im aktiven Folgeauftrag erfasst. Die oben
  genannte M7-Angabe beschreibt den generierten Qualitätsstatus des Bestands;
  dieser CI-Nachtrag ist keine erneute inhaltliche Vollfreigabe aller Aufgaben.
- **Aufgaben und Review:** neun neue eigene Physikaufgaben schließen echte
  Prüfungsendpunktlücken in vorhandenen Kompetenzen. Unabhängige inhaltliche
  Agentenreviews prüfen beide Sprachfassungen, Kompetenzabdeckung und Rubriken.
  Drei Aufgaben erhalten zusätzlich die fachlich geprüfte fehlende
  Inhaltszuordnung zur Bewegung. Aufgabeninhalte und atomare Voraussetzungen
  werden dadurch nicht verändert. Das sind keine menschlichen Lernversuche
  und keine nachgewiesene Lernwirksamkeit.
- **Automatisierte Nachweise:** tatsächlicher HTTP-Vergleich aller 432
  Antwortinhalte, 160 Länder-Browserbretter und 60 zusätzliche Hessenbretter
  bestanden; Typechecks, Lint, Schemas, Graph- und Quellenprüfungen sind
  separat protokolliert. Die vollständige Qualitätsgenerierung, ihr aktueller Statusvergleich
  und die geschützten Untergrenzen bestehen. Beide Mathematik-Modellexporte
  sind in allen 213 Dateien bytegleich; reproduzierbare ZIP und sechs
  Offlinegates bestehen. Der CI-Nachtrag reproduziert nach der MV-/SL-Korrektur
  ebenfalls alle 213 Modelldateien bytegleich und besteht alle sechs Offlinegates
  mit dem neuen Digest `c2df283bfd35…`. Sechs betroffene native Kontexte behalten
  exakt S/L und zwölf bytegleiche Kartenfixtures; 18 Stufen- und 822 Innenbretter
  wurden erneut gemessen. Alle Belege sind dauerhaft gebunden.
- **Kontrollstellen für den Owner:** Hessen G8 und G9 → Physik → E-Phase
  (Wurf bei E.1, verzweigende E.4–E.7); Hessen → Q4 (unabhängige SRT);
  Mathematik/Physik in einem anderen Land → Sek I und Sek II mit den
  quellenbelegten Jahres-/Phasenbändern und vorhandenen Abiturangeboten.
- **Belege:** [Modell und Laufzeit](composition-view-partial-orders-2026-11-16.md),
  [Mathematikquellen](mathematics-stage-view-source-units-2026-11-17.md),
  [Physikquellen](physics-stage-view-source-units-2026-11-17.md),
  [unabhängige Reviews und aktuelle Kartenmessung](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-16/composition-partial-order-v1/README.md).
  Zusätzlich: [unabhängige CI-Reparaturreviews, 240 Backendtests und Paketneubau](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-repair-v1/README.md).
  Der [zweite CI-Nachtrag mit unabhängigem Fokusreview](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v2/README.md)
  bindet die aktuelle Korrektur und bewahrt die früheren Gegenbefunde.
  Die Paket-Redistributionsfreigabe bleibt dort, wo menschliche Freigaben
  ausstehen, ausdrücklich offen. Keine Produktionsbereitstellung.
- **Nächster Schritt:** die Mathematik-Physik-Verzahnung mit den realen
  Hessen-Plänen für G8/G9 und unabhängig gewählten Kursprofilen zusammenführen,
  fachliche Voraussetzungen und eigene Aufgaben prüfen sowie die tatsächlichen
  verschachtelten Karten erneut messen. Dieser getrennte aktive Folgeumfang
  und die vollständigen K1–K13-/F1–F7-Aufträge sind noch nicht abgeschlossen.
<!-- composition-partial-order-20261117:end -->

## 17. November 2026, 06:31 MEZ (UTC+01:00) — Nachtrag zum Abschluss von PR #159

Die beim damaligen Bericht noch laufende Main-CI ist inzwischen abgeschlossen.
Der zum Merge von [PR #159](https://github.com/enpasos/skillpilot/pull/159)
ausgelöste [CI-Lauf 43832099252](https://github.com/enpasos/skillpilot/actions/runs/43832099252)
bindet den Implementierungscommit
`9975a142f7a26f1c4ff31c46a70e149d82a3fce5` und ist vollständig erfolgreich:
**14 von 14 Jobs dieses konkreten Laufs**. Status und einzelne Jobs wurden
am 17. November erneut abgerufen; es wird kein neuer CI-Lauf an diesem Tag
behauptet. Die technische Integrationsbedingung dieses Pakets ist damit erfüllt.
Zusätzliche K-/F-Gesamtabschlüsse folgen daraus ohne erneute Inhaltsprüfung
nicht. Der nachfolgende Bericht bleibt als damaliger Zwischenstand erhalten.
Die noch laufende Lieferung in PR #160 braucht ihre eigene vollständige
PR-CI und anschließend ihre eigene frische Main-CI.

## Historischer Gesamtstand vom 16. November 2026, 09:40 MEZ

**Stand: 16. November 2026, 09:40 MEZ (UTC+01:00).**

**Integration:** [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist
nach einer vollständigen erfolgreichen PR-CI mit **14/14 Jobs** auf `main`
integriert, Commit `9975a142f7`. Die frische Main-CI läuft. Bis zu ihrem
vollständigen Erfolg bleibt das Umsetzungspaket offen; die folgenden Zahlen
sind keine Deployment- oder Unterrichtsabnahme.

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert.** K4, K6, K8 und F7 sind eng abgegrenzte Abschlusskandidaten. Ihre
aktuellen Eingangsbindungen werden vor dem Abschluss noch einmal gegen den
integrierten Stand geprüft; laufende CI und Teilumsetzungen werden nicht gezählt.

**Wirkung der integrierten Kartenreparatur:** Die tatsächlich exportierten
kanonischen Karten haben oben **0 Rückpfeile und 0 freistehende eigene
Fachziele** in GK, LK und GK+LK. Zwölf ergänzende Fachkartenfälle sichern
Mathematik und Physik getrennt ab. Notwendige Fremdfachvorbereitung bleibt
Teil der Lernbasis. Innen verbleiben **8/9/9 Pfeile mit 20/23/25 atomaren
Ursachen**; die sieben zusätzlich vom früheren Kandidaten erzeugten Ursachen
sind entfernt. Im getrennten kanonischen Sek-I-Ausschnitt bleiben sieben
innere Pfeile und ein Außenatom offen.

**Länderbreite:** Der letzte vollständige regionale Vergleich vom
15. November, 23:49 MEZ, enthält **57 zulässige regionale Kontexte, davon 39
mit obersten Rückgriffen**. Die gesamte 72er-Matrix enthält zusätzlich drei
kanonische und zwölf widersprüchliche Dauerkontexte. 35/60 zulässige
Gesamtkontexte haben Außenatome. Diese ältere Messung ist kein frischer
Gesamtreplay des integrierten Standes und deckt keine unabhängig gemischten
Fachprofile ab. Die engeren aktuellen Nachmessungen ersetzen sie nicht.

| Umfang | Geliefert und noch offen |
| --- | --- |
| K1, K2 | Elementarer Halbleiterpfad und echte Diagrammaufgaben geliefert. Materialklassifikation, weitere Physikanschlüsse und vollständige Länder-/Jahrgangszuordnung bleiben offen. |
| K4, K6, K8 | Die ursprünglichen begrenzten Stufen-/Voraussetzungsbefunde sind unabhängig geprüft. Abschluss erst nach aktueller Eingangsbindung und frischer grüner Main-CI; weitere innere Rückgriffe bleiben getrennt offen. |
| K3, K5, K7, K9–K11 | Aufgaben, Quellenrollen und Platzierungen teilweise repariert; weitere Länderfälle und Außenatome bleiben offen. Die historische Freifallaufgabe behauptet weiterhin eigene Versuchs-/Tabellenleistungen, die ihr Text nicht verlangt. |
| K12, K13 | Physik-Erwerbsrouten und einzelne Stufensichten korrigiert; die vollständige Prüfungsvoraussetzungsbereinigung und Ableitung aller Stufensichten fehlen. |
| F1, F2 | Gemeinsamer Vertrag 1.3 und verschachtelte Jahre/E-/Q-Phasen vorbereitet. Vollständige Paket-/Laufzeitanbindung und reale Landesplanaktivierung fehlen. Der HE-Pilot umfasst weiterhin G8 und G9. |
| F3, F4, F6 | Kanonische oberste Karten bereinigt; Diagnose berücksichtigt jetzt echte Fach-/Kurskombinationen. Reale Plankarten, Vorbereitung am ersten Bedarf und gemessene innere Wirkung bleiben offen. Die Berichtgrenze von 1.024 Kombinationen ist ausdrücklich keine Abnahme für 20 Fächer. |
| F5 | Der vollständige fachliche Befundbestand bleibt offen; einzelne unabhängige Fachreviews ersetzen diesen Abschluss nicht. |
| F7 | Zweisprachige Zielnorm und Abgrenzung vom Laufzeitbestand sind mit #159 integriert. Abschluss wartet auf frische Main-CI. |

**Nächstes lokales Paket:** HE-Planquellen sowie Paket- und Laufzeitleser liegen
getrennt auf `feat/stage-plan-he-runtime-20261116`. 69 gezielte Java-Tests
bestehen; ein echter Mathematik-Quellenfragment-Replay besteht ebenfalls.
Das ist noch kein vollständiger aktivierter Landesplan oder erfolgreicher
vollständiger Paketexport. Echte Hessen-Messungen zeigen, dass Stufenumfang
nicht aus dem Lernzeitpunkt abgeleitet werden darf. Deshalb erhält die volle
Autorität ausdrückliche Stufenmitgliedschaften; Jahrgangs-/Phasenplätze bleiben
eine separate, eindeutige Zuordnung. Die neue Auswahl ist bislang nur im
Schema und TypeScript-Materialisierer umgesetzt. Sie ist nicht aktiviert.

Die [Übergabe](stage-plan-units-handover-2026-11-15.md) bleibt die vollständige
Auftragsliste. Die [unabhängige Restauftragsprüfung](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/README.md)
und der [spätere K8-Nachreview](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/k8-current-delta-independent-v1/README.md)
behalten ihre ausdrücklich benannten Prüfstände; sie werden nicht stillschweigend
zu neuen Gesamtabnahmen erklärt. Frühere Zwischenzahlen und Fehlversuche
bleiben in der Git-Historie und den unveränderten Belegen erhalten.

## 16. November 2026, 09:40 MEZ — Reviewbefunde und gebündelte CI-Korrekturen

**Stand: [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist nach
14/14 erfolgreichen Jobs seiner vollständigen PR-CI auf `main` integriert
(`9975a142f7`). Die frische Main-CI läuft; das Paket ist noch nicht abgeschlossen.
Frühere Paket-, Browser- und Fachnachweise behalten ihren jeweils gebundenen
Implementierungsstand.**

- **Fortschritt:** K 0/13, F 0/7 abgeschlossen, 0 reale Landespläne aktiviert.
  Kanonisch oben: 0 Rückpfeile und 0 freistehende eigene Fachziele, auch in den
  zwölf getrennten Fachkartenfällen. Regional bleiben 39/57 Fälle mit obersten
  Rückgriffen; 35/60 zulässige Gesamtkontexte haben Außenatome. Der gepushte Stand
  `b81b585d0` erreicht innen frisch gemessen wieder 8/9/9 Pfeile
  statt 11/12/12 am vorherigen Kopf. Diese verbleibenden Pfeile bleiben eine Restaufgabe.
- **Ergebnis:** Skalar- und Vektorprodukt liegen gültig in Sek II; frühe
  Messgrundlagen und notwendige Fremdfachvorbereitung bleiben erreichbar.
  Gegenüber main enthält das Paket 57 neue Physik- und 44 Mathematikaufgaben.
  Aufgabeninhalt, Rubriken, Quellenrollen und Platzierungen wurden getrennt
  geprüft. Die Jahrgangs-/Phasenstruktur ist im gemeinsamen Planvertrag
  vorbereitet; damit ist noch kein realer Landesplan aktiviert.
- **Entscheidungen im CI-Nachtrag:** Drei echte Rechenvoraussetzungen ergänzen
  ausschließlich die Spektrumsaufgabe. 58 fehlende Astronomie-Aufgabenplätze
  werden ergänzt; eine vorhandene Stoßaufgabe kommt in vier HE-Sichten hinzu.
  In allen zwölf HE-Kontexten wächst die atomare Lernbasis nur um diese Aufgabe.
  Mathematik erhält 16 ausdrückliche Quellenbindungen für materialisierte
  Aufgabengruppen; der Generator reproduziert 18 Sichten. Die SH-Quelle zu
  einfachen Ungleichungen ist korrigiert, ohne eine offizielle Jahrgangsstufe
  zu erfinden. Vertrag 1.3 transportiert 28 vorhandene Aufgabenbilder bei
  31 Aufgaben-Bild-Zuordnungen; Bilddateien und Aufgaben bleiben unverändert.
  Die beiden historischen JSON-Autorenquellen erhalten genau begrenzte
  Herkunftsnachweise im Paket; eigene Aufgaben bleiben als Inhalt klassifiziert.
  Die Abschlussautomatik muss offene Lernkarten bis zum bestätigten Abruf
  erforderlich halten; sie werden dadurch nicht zu Prüfungsaufgaben umdeklariert.
  Der getrennt versionierte Browsernachweis bindet die genaue lernerspezifische
  Datenroute; historische Runner und sämtliche Schutzprüfungen bleiben erhalten.
  Die Deployment-Abfrage bei unverändertem GitHub-Stand ist bereits seit
  #157 auf main; sie ist keine neue Lieferung von #159.
  Der jüngste Nachlauf aktualisiert sieben öffentliche Physikbeschreibungen
  und den erzeugten Bildstatusbericht. Der Browser-Test prüft beide gültigen
  Übersichtsformen mit ihren Vorbereitungszweigen; die Produktionsnavigation
  bleibt dabei unverändert. Bildabdeckung wird weiterhin getrennt von einer
  inhaltlichen Bildfreigabe ausgewiesen.
  Zwei weitere Statusberichte werden ausschließlich mit aktuellen Messwerten
  abgeglichen; 53 fehlende öffentliche Mathematik-Quellenbegründungen bleiben
  sichtbar. Die Physik-Tests sichern die aktuellen Erwerbsrouten statt alter
  zurückgenommener Aufgaben. Ein genau begrenzter Generator-Nachtrag erhält
  die bereits dokumentierte Transistor-Versuchszuordnung auch bei Neuerzeugung;
  die historischen K1-Belege und alle übrigen Zuordnungen bleiben unverändert.
- **Drei Kontrollstellen:** [Frische Kartenwirkung und Nachweise des Nachtrags](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/external-review-followup-v1/README.md),
  [neue Daten- und Browserkorrekturen mit unabhängigen Reviews](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/ci-metadata-and-browser-followup-v1/README.md),
  [Gesamtauftrag mit Zielzustand und offenen Befunden](stage-plan-units-handover-2026-11-15.md).
- **Nachweise:** Lokal bestehen 354 Ansichtskontrollen, alle 21 Katalog- und
  zwölf Routen-Mindeststände (Mathematik/Physik M7), Schema- und JSON-Kontrollen
  über 120.706 Dateien,
  TypeScript und Lint. [Alle 17 ursprünglichen Backend-Testfehler](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/backend-ci-test-repair-v1/README.md)
  bestehen im gemeinsamen Nachlauf. Hinzu kommen 60 Java-Pakettests sowie
  unabhängige Modell-, Quellen- und Sicherheitsreviews. Die
  [Lernkartenkorrektur](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/memory-explicit-completion-v1/README.md)
  hat 136 bestandene Completion-Tests und 13 unabhängige Gegenprüfungen.
  Der [tatsächliche Paketnachweis](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/package-assessment-materials-pipeline-v1/README.md)
  bindet die reproduzierbare ZIP-Datei und den frischen vollständigen Anwendungstest;
  frühere Fehlversuche bleiben getrennt erhalten. Der vorherige Remote-Lauf
  hatte acht erfolgreiche und sechs fehlgeschlagene Jobs. Der anschließende
  Lauf endete mit zehn erfolgreichen und vier fehlgeschlagenen Jobs. Dessen
  vier Reparaturen bestehen im anschließenden Lauf mit elf erfolgreichen und
  drei fehlgeschlagenen Jobs. Dessen drei Fehlerstellen und die vier zusätzlichen
  lokalen Befunde sind nun korrigiert und mit Originalfehlern, normalen Nachtests
  und unabhängigen Reviews dokumentiert. Der vollständige lokale Nachlauf
  bestätigt alle 21 Katalog- und zwölf Routen-Mindeststände. Automatisierte
  Checks und Agentenreviews belegen keine Unterrichtswirkung und ersetzen keine
  frische Main-CI.
- **Nächster Schritt:** Die frische Main-CI bis zum Abschluss prüfen und danach
  Implementierungscommit und terminalen Lauf im Abschlussvermerk binden.
  Reale HE-Pläne und weitere Fachreparaturen bleiben im getrennten nächsten
  Umsetzungspaket Teil des unverkleinerten Gesamtauftrags.

## 15. November 2026, 22:51 MEZ — Zielnorm und Bestandsaufnahme abgeglichen

**Stand: Abgeschlossener Dokumentationsreview im Lieferumfang von
[PR #159](https://github.com/enpasos/skillpilot/pull/159); Dokumentchecks
bestanden. Keine neue Laufzeitfunktion oder Integration behauptet.**

- **Fortschritt:** K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert. Dieses Paket präzisiert F7 und die weiterführende
  Zielnorm; es verändert selbst keine Rückgriffe oder Qualitätsgrade.
- **Ergebnis und Entscheidungen:** Das Konzept bleibt verbindlicher
  Zielzustand. Der Implementierungsanhang beschreibt getrennt, was tatsächlich
  besteht. Eine offene Prüfung gilt weiterhin als offen; ein Revieweintrag
  allein erteilt keine Anerkennung. Die Reihenfolge ganzer Einheiten muss
  widerspruchsfrei sein. Die behauptete Unterbrechung der Traversierung an
  gemeisterten Zwischenzielen war veraltet: der Fix ist bereits auf main.
  Globale revisionsgebundene Anerkennung und vollständige Durchsetzung der
  Einheitenverträge bleiben offene Implementierungsaufträge.
- **Kontrollstellen:** [Bewertung der beigefügten Kritik](graph-definition-documentation-review-2026-11-15.md),
  [Einheitenfolge und Lernweise](../concept/skill-graph/learning-unit-progression.de.md),
  [datierter Implementierungsstand](../concept/skill-graph/compendium-appendix.de.md).
- **Nachweise:** Unabhängiger bilingualer Agentenreview mit 21 geprüften
  Kapitelpaaren und drei gezielten Modellgegenbeispielen; 62 tatsächlich
  ausgeführte lokale Backendtests bestehen ohne Fehler oder Auslassungen.
  Alle zehn DE-/EN-PDFs und 80 Webausgaben sind neu gebaut. Quellen-,
  Ausgabe-, Terminologie-, Link- und Indexchecks sowie MkDocs strict bestehen.
  Dies sind weder Prüfungsaufgaben für Lernende noch eine Main-Abnahme.
  [Erhaltene Review- und Testbelege](https://github.com/enpasos/skillpilot/tree/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1).
- **Nächster Schritt:** Die präzisierte Norm mit dem geprüften Fachpaket
  integrieren. Umsetzungsdefizite bleiben bis zu
  ihrem eigenen Nachweis sichtbar; die Norm wird nicht auf den Bestand verkürzt.

## 15. November 2026, 15:38 MEZ — Abnahme an den tatsächlichen Lernkarten konkretisiert

**Stand: Diagnose und Umsetzung laufen lokal; noch kein Folge-PR. #157 ist
integriert und seine frische Main-CI erfolgreich. Dieses Folgepaket ist offen.**

- **Fortschritt:** K1–K13/F1–F7 bleiben der Gesamtauftrag; **K 0/13, F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert**. Die aktuelle Messung hat
  einen tatsächlichen Rückschritt sichtbar gemacht, keinen Abschluss belegt.
- **Ergebnis und Entscheidungen:** Auf den obersten Physik- und
  Mathematiktafeln sollen die roten Rückgriffe durch fachliche Bereinigung
  entfallen. Die freistehenden Vorbereitungsknoten zu Skalar- und Vektorprodukt
  entstehen durch zwei getrennte Oberstufeneinheiten bei der tatsächlichen
  GK+LK-Zusammenführung. Deren gemeinsame Identität wird korrigiert;
  benötigte Kompetenzen und Lernnachweise bleiben erhalten. Die echten
  Rückgriffsbeziehungen brauchen daneben fachliche Bereinigung. Insbesondere
  müssen irrtümlich in Sekundarstufe I aufgenommene Oberstufenaufgaben an
  ihrem eigentlichen Lernplatz stehen; bloßes Verschieben ihrer notwendigen
  Vorbereitung würde den Fehler verdecken.
  Sekundarstufe I erhält Jahrgangsstufen als Untereinheiten; Sekundarstufe II
  erhält E-Phase und Q1–Q4 beziehungsweise die zutreffenden Landesbezeichnungen.
  Dies wird im gemeinsamen Planvertrag umgesetzt und auch innerhalb der
  Untereinheiten auf Rückgriffe geprüft. Die bisherige reine Stufengrundlage
  erfüllt diese Abnahme noch nicht.
- **Kontrollstellen:** Die vom Product Owner gezeigten Tafeln mit Physik
  204/418 und Mathematik 334/616 Zielen; die Ursachenpfade im entstehenden
  Vergleichsbericht; die aufgeklappten Jahrgangs- und Phaseneinheiten.
- **Nachweise:** Ein unabhängiger Agent hat die tatsächliche Kompositions-,
  persönliche Curriculum- und Lernkartenprojektion auf Ausgangsstand,
  integriertem #157 und aktuellem Kandidaten ausgeführt. Die ursprünglichen
  Screenshots stimmen einschließlich beider Vorbereitungsknoten exakt.
  In der zusammengeführten Sicht sind 41 direkte Rückgriffsbeziehungen erfasst;
  nach Fachfilter bleiben 28 in Physik und sechs in Mathematik. Diese Zählung
  ist von den 43 Beziehungen der getrennten bundesweiten Kursansicht zu
  unterscheiden. Die tatsächliche fachliche Reparatur ist noch nicht abgenommen.
- **Nächster Schritt:** Fachliche Reparaturen umsetzen und die echten Sichten vor und
  nach dem nächsten Fachpaket vergleichen. Ein früherer Statusvergleich oder
  eine grüne CI ersetzt diesen Wirkungsnachweis nicht.

## 15. November 2026, 15:59 MEZ — Lernbilder an die vorhandene Bildsprache anpassen

**Stand: Neun ruhige Endfassungen lokal importiert und durch den ausführenden
Agenten fachlich und visuell geprüft; noch nicht auf main. Kein abgeschlossener
Lieferumfang und keine menschliche Freigabe.**

- **Fortschritt:** Neun neue aktive Physik-Lernbilder identifiziert: vier aus
  #157 und fünf im folgenden lokalen Paket. Alle neun Ersatzbilder sind über
  die bestehende Produktionspipeline importiert (zusammen rund 2,25 MB).
  Zwölf ältere Rasterdateien sind bytegleich erhalten, darunter beide zugleich
  als Aufgabenmaterial verwendeten PNGs. Deren Aufgabenverweise bleiben gleich.
- **Ergebnis und Entscheidungen:** Die vorhandene Produktionspipeline mit
  explizitem Provider, tatsächlichem Prompt, Import und Bildprüfung wird
  verwendet. Nach dem aktuellen Owner-Feedback gilt eine ruhige, locker
  gezeichnete Gestaltung ohne dekorative Strahlen, Glitzer und flächendeckende
  Hervorhebungen. Zwei bisherige PNGs dienen zugleich als Aufgabenmaterial;
  ihre exakten Bytes und Aufgabenverweise werden erhalten.
- **Kontrollstellen:** Materialvergleich, Dotierung und Bewegungsdiagramme;
  Darstellung in 360 und 680 Pixel Breite; unveränderte Aufgabenmaterialien
  der beiden eigenen Transistorversuche. Der konkrete Prüf- und Importbericht
  liegt unter
  `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-stage-flow-quiet-20261115-v1/`.
- **Nachweise:** Die unabhängige Bestandsaufnahme hat tatsächliche Bildlinks,
  Verbraucher und Stilreferenzen geprüft. Die bisherigen Bildentwürfe wurden
  tatsächlich angesehen. Der ausführende Agent hat anschließend alle neun
  Endfassungen in beiden genannten Breiten gelesen und fachlich geprüft.
  Asset-Check (2.575 Bildlinks), Physik-Bild-QA und Transparenzinventar bestehen
  lokal; Quell-, Frontend- und Backend-JPEGs sind bytegleich. Dies ist eine
  tatsächliche Eigenprüfung der Bilder, keine unabhängige Inhaltsfreigabe.
- **Nächster Schritt:** Die betroffenen Lernzielbuch-Seiten und aktuellen
  Fachreview-Bindungen validieren und das gesamte Paket durch die CI bringen.
  Die Gesamtverantwortung bleibt beim ausführenden Agenten; eine externe
  Gemini-Übernahme ist derzeit nicht nötig.

## 15. November 2026, 15:18 MEZ — Modellnorm für Stufenpläne vereinheitlicht

**Stand: lokal umgesetzt und unabhängig geprüft; noch kein Folge-PR.
[#157](https://github.com/enpasos/skillpilot/pull/157) ist nach erfolgreicher
PR-CI integriert. Integration und frische Main-CI dieses separaten Normpakets
stehen aus.**

- **Fortschritt:** F7 als lokale Normlieferung vorbereitet.
  **K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne aktiviert.**
  Rückgriffe werden durch diese Normkorrektur noch nicht praktisch abgebaut.
- **Ergebnis und Entscheidungen:** Ein gemeinsamer Plan je Land und
  Dauermodell bestimmt die Stufen über die Fächer hinweg. Offizielle Zuordnung
  und geeigneter Lernplatz bleiben unterscheidbar. Die Reihenfolge von
  Einheiten erzeugt keine zusätzlichen Voraussetzungen oder Lernnachweise.
  Notwendige Vorbereitung gehört an ihren frühesten tatsächlichen Bedarf;
  bereits später eingeordnete Ziele werden nicht stillschweigend verschoben.
  Die bestehende Laufzeit bleibt ausdrücklich vom Zielmodell getrennt.
- **Kontrollstellen:** [Einheiten und Grenzfälle](../concept/skill-graph/learning-unit-design-and-examples.de.md),
  [Zuordnung und Lernplatz](../concept/skill-graph/view-projection-and-goal-placement.de.md)
  sowie [Begriffe und Abgrenzungen](../concept/glossary.de.md).
- **Nachweise:** Das unabhängige erste Review verlangte vier Normkorrekturen
  und drei Konsistenzkorrekturen; die zweite Fassung ist angenommen.
  26 geänderte Quellen und 26 Registerzeilen sind abgeglichen, sieben
  Gegenbeispiele geprüft. Der native Build erzeugt 44 Markdownseiten und
  sechs PDFs aus denselben deutschen und englischen Quellen; alle sechs
  PDF-Builds bestehen. Der erste Versuch scheiterte an einer fehlenden lokalen
  TeX-Abhängigkeit und bleibt dokumentiert. Dies sind Agentenreviews und
  automatisierte Dokumentchecks, keine implementierte neue Lernlaufzeit.
- **Nächster Schritt:** Das Normpaket zusammen mit den nächsten geprüften Fachreparaturen liefern.
  Bei diesen prüfen wir insbesondere, dass frühere Papieraufgaben keine
  tatsächlich nicht ausgeführten Versuche nachweisen.


## 15. November 2026, 15:38 MEZ — Rollout bei unverändertem Git-Stand

**Stand: Mit [PR #157](https://github.com/enpasos/skillpilot/pull/157) um
14:25 MEZ auf main integriert und nach erfolgreicher frischer Main-CI um
15:36 MEZ abgeschlossen. Kein Produktionsrollout durchgeführt.**

- **Fortschritt:** Zusatzauftrag des Product Owners; K 0/13 und F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert. Der Zusatzauftrag ändert
  keine curricularen Rückgriffe.
- **Ergebnis und Entscheidung:** `./deploy_skillpilot.sh` bietet bei
  unverändertem Commit Abbruch oder erneuten Rollout an. `j` setzt fort;
  `n`, Enter oder Eingabeende brechen vor Build und Service-Neustart ab.
  Neue Commits und der ausdrücklich gewählte Git-Übersprung behalten ihren Ablauf.
- **Kontrollstellen:** [Betriebsanleitung](../deploy/deployment.de.md),
  [Auswahl im Deployment-Skript](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/deploy.sh),
  [automatisierte Verhaltenstests](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/test_deploy_no_changes.py).
- **Nachweise:** Shell-Syntaxprüfung erfolgreich; sechs neue Verhaltenstests
  bestehen einschließlich Wiederholung, Abbruch, fehlerhaftem Git-Pull und
  Neustart der aktualisierten Engine. Die neun bestehenden Backup-Tests und
  neun CI-Aufteilungstests bestehen ebenfalls. Die neuen Verhaltenstests sind
  in den vorhandenen CI-Job aufgenommen; die lokalen Tests führen keinen echten
  Rollout aus.
- **Integration:** [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04),
  [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027):
  **14/14 Jobs erfolgreich**, einschließlich des Deployment-Verhaltenstests.
- **Nächster Schritt:** Kein weiterer Umsetzungsschritt für diese Auswahl.
  Ein tatsächlicher Produktionsrollout ist eine getrennte Betriebsaktion.

## 15. November 2026, 15:38 MEZ — Halbleiterpfad, Diagrammaufgaben und Stufenplangrundlage

**Umsetzungspaket #157 abgeschlossen: auf main integriert, frische Main-CI
um 15:36 MEZ erfolgreich. K1/K2 und F1/F2/F6 bleiben teilweise offen.**

- **Fortschritt:** **K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert.** Die reale Wirkung ist jetzt gemessen: Bayern
  9 → 10, bundesweite feste Kursansicht 39 → 43 Rückgriffsbeziehungen.
  Die bestandene technische Lieferung ist deshalb keine fachliche Gesamtabnahme.
- **Ergebnis und Entscheidungen:** Drei neue Physikkompetenzen und drei Aufgaben
  trennen einfaches Dotierungsmodell, Diodenkennlinien und einen eigenen
  Transistor-Schaltversuch; 33 Quellenzuordnungen sind korrigiert. Vier
  Diagrammaufgaben ersetzen eine unbelegte Algebra-Abdeckung. Tabellenaufbau,
  Tabellenlesen und elementares Diagrammlesen erhalten passende Aufgaben und
  bereinigte Voraussetzungen. Planvertrag v1.3 und Diagnosekern bilden die
  Grundlage für reale Pläne; sie aktivieren noch keine neue Planlaufzeit.
  Die CI-Reparaturen berichtigen veraltete Bindungen und einen fehlerhaften
  Token-Texttest, ohne Qualitätsgrenzen zu senken.
- **Kontrollstellen:**
  [Physik: Kompetenzen und Bewertungsraster](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Mathematik: Tabellenkompetenz und Inhaltsreviews](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/README.md),
  [tatsächliche Rückgriffe und Screenshot-Ursachen](stage-plan-real-view-backflows-2026-11-15.md).
- **Nachweis und Integration:** [PR #157](https://github.com/enpasos/skillpilot/pull/157)
  ist nach 14/14 erfolgreichen PR-CI-Jobs um 14:25 MEZ gemergt.
  Die frische [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027)
  am [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04)
  besteht mit **14/14 Jobs**. Alle 21 Kataloge behalten ihre Reifegrade,
  insbesondere Mathematik und Physik M7. Zusätzliche Workflows für
  Assessment-Abschluss, Gemini, OAuth und Dokumentation sind separat erfolgreich;
  sie werden nicht zur Jobzahl dieses Laufs addiert. Inhaltsreviews und
  automatisierte Nachweise belegen keine bereits beobachtete Lernwirkung.
- **Nächster Schritt:** Die gemessenen Rückgriffe fachlich beseitigen,
  eigene Versuche und weitere Kompetenznachweise vervollständigen, Jahrgänge
  und E-/Q-Phasen einbinden und reale Landespläne aktivieren. Die neue Lieferung
  wird erneut an tatsächlichen Lernkarten und vollständiger CI gemessen.

## 15. November 2026, 09:09 MEZ — Offene Ausgangslieferungen integriert

**Abgeschlossen; rückblickender Eintrag, CI-Zählung am angegebenen Zeitpunkt korrigiert.**

- **Fortschritt:** Zwei Ausgangs-PRs integriert; K 0/13 und F 0/7 abgeschlossen,
  0 reale Landespläne aktiviert, keine gemessene Gesamtwirkung auf Rückgriffe.
- **Ergebnis und Entscheidungen:**
  [#156 Übergabe](https://github.com/enpasos/skillpilot/pull/156) und
  [#153 Lernkartenvorschau](https://github.com/enpasos/skillpilot/pull/153)
  nach erfolgreichen PR-Checks integriert. Beide bilden die Arbeitsgrundlage;
  sie beheben noch keinen der übernommenen Fachbefunde.
- **Kontrollstellen:** [Auftragsumfang und Abnahmebedingungen](stage-plan-units-handover-2026-11-15.md#7-lieferstand-des-delegierten-auftrags)
  sowie die [Vorschau in #153](https://github.com/enpasos/skillpilot/pull/153).
- **Nachweis und Integration:** Die frische
  [Main-CI 43674399591](https://github.com/enpasos/skillpilot/actions/runs/43674399591)
  für [Commit a7c7e9ceb2](https://github.com/enpasos/skillpilot/commit/a7c7e9ceb26f06194e25f29e32941d4e4cb17c32)
  endete am 15. November 2026 um 05:54 MEZ erfolgreich: **14/14 Jobs bestanden**.
  Die früher genannten 25 erfolgreichen und zwei übersprungenen Checks waren
  eine zeitgebundene Summe mehrerer Workflows am Commit, nicht die Jobzahl
  dieses Laufs.
- **Nächster Schritt:** K1–K13 und F1–F7 in zusammenhängenden Lieferungen umsetzen.
