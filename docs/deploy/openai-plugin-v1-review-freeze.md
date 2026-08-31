# SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre

**Stand:** 28. August 2026

**Portalstatus:** `Review`

**Öffentlicher Status:** noch nicht genehmigt und noch nicht veröffentlicht

**Sperrstatus:** aktiv

## 1. Verbindliche Entscheidung

Der am 15. August 2026 eingereichte Stand von `skillpilot-coach-v1` Version
`1.0.0` ist für die gesamte Dauer des OpenAI-Reviews eingefroren. Das betrifft
nicht nur das hochgeladene Paket, sondern jeden beobachtbaren Vertrag, gegen
den OpenAI scannt oder die fünf positiven und drei negativen Reviewfälle
ausführt.

Der Product Owner hat am 17. August 2026 klargestellt, dass die öffentliche
fachliche Curriculum-Schicht (Layer A) ein getrennt fortschreibbarer
Inhaltsbestand ist. Ihre exakten Curriculum-, Lernziel-, Assessment- und
curricularen Visualisierungsbytes gehören weder zum Pluginvertrag noch zur
Plugin-SemVer. Diese Klarstellung ändert weder `skillpilot-coach-v1` Version
`1.0.0` noch den laufenden Portalreview und erfordert kein Zurückziehen oder
erneutes Einreichen.

`publicationStatus: DRAFT` bleibt dabei korrekt: Die Version ist im Portal
eingereicht, aber noch nicht veröffentlicht. **DRAFT bedeutet während des
Reviews nicht veränderlich.** Der separate Review-Freeze schließt genau diese
Lücke zwischen Einreichung und tatsächlicher Veröffentlichung.

Maschinenlesbarer Status und Hashanker:

- `contracts/openai/skillpilot-coach-v1/review-freeze.json`
- eingereichter Quellstand: `ff3a16b0d6e3c8a564176ab4743e777cddf3e79c`
- interner Snapshot: `contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT/`
- Snapshot-Manifest SHA-256:
  `e6408e7054d53ab4a52f32f541b07201f1a8f6e183ff5772bc2d8164162b0f32`
- exportierter Contract-Fingerprint:
  `d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38`
- Plugin-Bundle SHA-256:
  `f6f69b7b42b6904ad6ff1796190cf687af72c2e4af62edcac0bd04d6603ae697`
- Reviewvideo SHA-256:
  `20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb`

Die im eingereichten Paket enthaltenen Release Notes nennen den Stand noch
einen fortschreibbaren unveröffentlichten Draft. Diese Formulierung entstand
vor der Einreichung und bleibt absichtlich byte-identisch im eingereichten
Paket. Für die operative Arbeit wird sie seit dem 15. August 2026 durch diese
Review-Sperre überstimmt.

## 2. Eingefrorener Wirkungsbereich

Die Sperre ist wirkungsbezogen. Ein Dateipfad außerhalb der unten genannten
Beispiele macht eine Änderung nicht automatisch sicher. Eingefroren sind
insbesondere:

- Paketidentität, Version, Listing, Icons, Skill, Coaching Policy und die
  eingereichten Release Notes;
- Namen, Beschreibungen, Ein- und Ausgabeschemas, Annotationen, Security
  Schemes, Ressourcenbindungen, Server Instructions und Fehlersemantik aller
  zwölf V1-Werkzeuge;
- aktive und beibehaltene MCP-Apps-Ressourcen einschließlich Bytes, Hash-URIs,
  CSP, Domain und Toolbindung;
- MCP-Endpoint, OAuth-Issuer und -Discovery, feste Clientregistrierung,
  Callback, Scopes, PKCE, mTLS-Edge, Domain-Challenge und Fail-closed-Routen;
- 24-Stunden-Lernsession, Identitäts-, Locale-, Zustands-, Mastery-,
  Navigation-, Memory-, Recall- und Prüfungssemantik;
- der ChatGPT-spezifische First-Party-Ablauf WebGUI-Konfiguration → **Lernen
  starten** → frische vorbereitete Chatnachricht sowie seine sichtbaren Texte
  und URLs;
- Portalwerte: Beschreibungen und Übersetzungen, Starter Prompt,
  Länderfreigabe, Tool-Begründungen, exakt fünf positive und drei negative
  Testfälle, Testzugang, Attestierungen und Domain-Verifikation;
- die Ablauf-, Zugangs- und Assertion-Verträge der Reviewfälle sowie
  Reviewzugänge, Wegwerf-Fixtures und deren Setup- und Zustandssemantik;
- Rechtstexte und Datenschutzaussagen, auf die Listing und Review verweisen;
- Reviewvideo, SHA-256 und die einzige Portal-URL
  `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4`;
- Abhängigkeiten, Runtime- oder Deploymentänderungen, wenn sie einen dieser
  Punkte beobachtbar verändern könnten.

Nicht vom Byte-Freeze erfasst ist die fortschreibbare öffentliche Layer-A-
Schicht. Dazu gehören insbesondere die exakten Bytes, Hashes, IDs, Kanten und
Anzahlen der Curricula, Lernziele, fachlichen Assessments und curricularen
Visualisierungen. Reviewfälle dürfen diese fachlichen Daten über die
unveränderten V1-Schnittstellen live lesen; sie müssen deshalb nicht auf
beliebige am 15. August vorhandene Zielbytes oder Zielanzahlen festgeschrieben
werden. Eingefroren bleiben ihr Ablauf, ihr Zugang und ihre Assertion-Verträge
sowie alle Plugin-, MCP-, OAuth-, Tool-, Schema-, MCP-Apps-UI-,
Session- und Zustandsverträge. Insbesondere sind curriculare Bildbytes Layer A,
die Bytes und Bindungen des MCP-Apps-Widgets dagegen Teil des eingefrorenen
UI-Vertrags; Assessment-Inhalte sind Layer A, Prüfungsworkflow und
Zustandssemantik dagegen Teil des eingefrorenen Runtime-Vertrags.

## 3. Ohne ausdrückliche Freigabe verboten

- `node scripts/openai_plugin_release.mjs prepare` oder `record-published`
  ausführen;
- Package, Skill, MCP-Metadaten oder Tools neu scannen oder hochladen;
- Portalwerte speichern, Testfälle oder Credentials austauschen oder
  Attestierungen ändern;
- Draft-Snapshot, UI-Artefakte, Reviewvideo oder deren Hashanker ersetzen;
- Produktionsverhalten „nur intern“ korrigieren, wenn der eingefrorene Ablauf
  eines Reviewfalls oder der öffentliche V1-Vertrag betroffen sein kann;
- nach Approval, Rejection oder Withdrawal eigenmächtig weiterarbeiten.

Der Release-Befehl verweigert `prepare` und `record-published` bei aktiver
Sperre. CI und Deployment prüfen zusätzlich die Hashanker und die gepinnten
V1-Quellbäume.

## 4. Weiterhin erlaubt

- rein lesende Audits, Tests, Health-/Security-Smokes und Monitoring;
- Störungsanalyse ohne Mutation;
- reine Dokumentationskorrekturen, die den eingefrorenen Stand exakt
  beschreiben und keine Portalwerte, Vertragsbehauptungen oder Artefakte
  verändern;
- fachliche Fortschreibung der öffentlichen Layer-A-Curricula einschließlich
  Lernzielen, Assessments und curricularen Visualisierungen, sofern ihre
  eigenen Quellen-, Review- und Qualitätsregeln eingehalten werden und kein
  eingefrorener V1-Vertrag verändert wird;
- unabhängige Arbeiten, deren fehlender V1-Effekt konkret belegt ist und bei
  denen alle Freeze-, Candidate- und Runtime-Gates grün bleiben.

Quickstart-Texte, Screenshots und reine Story-Darstellung dürfen aktualisiert
werden. Sie dürfen aber nur den eingefrorenen Ablauf dokumentieren. Änderungen
an `SessionSetup`, Coach-Launch, Plugin-Namen, Browsergrenze, Sessiondauer,
Datenschutzversprechen oder Providerverhalten sind keine Quickstart-Arbeit und
bleiben ohne eine exakte, hashgebundene Product-Owner-Ausnahme gesperrt. Die in
den Abschnitten 6.3 und 6.4 dokumentierte additive Auswahl und geführte
Einrichtung eines unabhängigen Claude-v1-Coaches gibt keinen Bestandteil des
eingereichten ChatGPT-V1-Vertrags frei.

## 5. Pflichtprüfung vor Änderung und Deployment

```bash
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
```

`verify` vergleicht die aktuellen Quellen reproduzierbar mit dem eingereichten
Draft. Der Freeze-Check pinnt zusätzlich Snapshot, Bundle, Contract, Video und
kritische Runtime-/Start-/Edge-Bäume. Ein grüner Pfadfilter ersetzt dennoch
nicht die Wirkungsprüfung. Umgekehrt ist ein fachlicher Layer-A-Diff allein
kein Plugin-SemVer- oder Review-Freeze-Verstoß; er bleibt durch die fachlichen
Curriculum-Gates zu prüfen.

## 6. Ausnahmen und Ende der Sperre

Eine Ausnahme im eingefrorenen Wirkungsbereich benötigt vor jeder Änderung eine
ausdrückliche Entscheidung des Product Owners mit:

1. Grund der Änderung;
2. exakt freigegebenem Wirkungs- und Dateiumfang;
3. Zielversion;
4. Entscheidung, ob das Portal-Review zurückgezogen beziehungsweise neu
   eingereicht werden muss;
5. neuer, nach vollständiger Prüfung erneut gesetzter Freeze-Baseline.

Die in Abschnitt 4 beschriebene fachliche Layer-A-Fortschreibung ist keine
solche Ausnahme. Solange sie keinen eingefrorenen V1-Vertrag verändert,
benötigt sie weder eine neue Plugin-SemVer noch ein Zurückziehen oder erneutes
Einreichen des Portalreviews.

### 6.1 Eng begrenzte Ausnahme: öffentliche Lernzielbuch-Bewerbung aus

Der Product Owner hat am 15. August 2026 entschieden, das noch unvollständige
Lernzielbuch vorerst ausschließlich über die lokale Workbench auffindbar zu
machen. Dafür ist genau folgende Ausnahme freigegeben:

- Auf der öffentlichen Startseite bleibt
  `PUBLIC_GOAL_BOOK_PROMOTION_ENABLED` ausgeschaltet.
- Der öffentliche Sitemap-Eintrag `/lernzielbuch` entfällt.
- Die Read-only-Route, ihre Artefakte sowie die deutschen und englischen
  Workbench-Einstiege bleiben erhalten. Dadurch kann die Bewerbung später nach
  einer neuen ausdrücklichen Produktentscheidung wieder aktiviert werden.
- Ziel ist ausschließlich das aktuelle Produktions-Webfrontend. Das
  eingereichte Plugin bleibt `skillpilot-coach-v1` Version `1.0.0`.
- Ein Zurückziehen oder erneutes Einreichen im OpenAI-Portal ist nicht nötig:
  Paket, Skill, First-Party-Startablauf, MCP/OAuth-Vertrag, Portalwerte,
  Reviewfälle, Fixtures und Reviewartefakte bleiben unverändert.

Der ursprüngliche SHA-256 von `SessionSetup.tsx` bleibt als eingereichte
Baseline erhalten. Der freigegebene neue SHA-256 sowie der Sitemap-Hash sind
zusätzlich in `review-freeze.json` hinterlegt und werden vom Freeze-Checker
gegen eine fest codierte Ausnahmeliste geprüft. Andere Änderungen an diesen
Dateien bleiben fail-closed gesperrt.

### 6.2 Historische zweite Ausnahme: Claude-Webstart ohne manuellen Fallback

Der Product Owner hat am 23. August 2026 für das aktuelle
Produktions-Webfrontend eine zweite, ausschließlich Claude-spezifische
Runtime-Ausnahme freigegeben. Sie galt damals nur für den versteckt
providerselektierten Claude-Zweig; der normale Root-Aufruf aktivierte ihn noch
nicht. Diese historische Abgrenzung bleibt Teil der Hashkette, wurde aber am
24. August 2026 durch die ausdrückliche Entscheidung in Abschnitt 6.3 ersetzt.

Freigegeben ist ausschließlich:

- das beim Klick synchron geöffnete Claude-Fenster nur mit der validierten,
  `q`-vorausgefüllten Claude-Web-URL weiterzuleiten;
- bei blockiertem Popup oder ungültiger URL fail-closed abzubrechen;
- die redundante Clipboard-Kopie sowie den rohen Startprompt, Copy-, Web- und
  Desktop-Fallback aus dem Claude-Zweig zu entfernen;
- den fokussierten Regressionstest für genau diese Abgrenzung zu aktualisieren.

Nicht freigegeben sind Änderungen am Root-/ChatGPT-Default, am OpenAI-Paket,
MCP/OAuth, an Tools, Schemas, Reviewfällen, Portalwerten, Fixtures oder
Reviewartefakten. Der Product Owner hat deshalb entschieden, dass der laufende
OpenAI-Portalreview weder zurückgezogen noch neu eingereicht wird: Der
eingereichte OpenAI-Vertrag und sein beobachtbarer Reviewablauf bleiben
unverändert.

Die Hashhistorie von `SessionSetup.tsx` bleibt ausdrücklich eine Kette und wird
nicht überschrieben:

1. eingereicht:
   `081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506`;
2. erste autorisierte Goalbook-Ausnahme:
   `3834b8c813719e21dffb767b9e5fe60890845769e188b49a239da57f4577b9a4`;
3. zweite autorisierte Claude-only-Ausnahme:
   `fbab3a4833b534059a8b9ad2c97a293cb670d848d92bd93caac25ed9d96787ad`.

Als zusätzliche Evidenz ist
`contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-23-testClaudeV1StartUi.tsx`
als unveränderlicher historischer Snapshot mit SHA-256
`f02ab916f7e501cb7b50eee477c5237c054caf36f90bee1c5cf1da075a82e8bf`
gepinnt. Der Freeze-Checker validiert sowohl die lückenlose Reihenfolge der
Ausnahmen als auch ausschließlich den letzten autorisierten Runtime-Hash.

### 6.3 Eng begrenzte Ausnahme: gemeinsame Standardauswahl ChatGPT oder Claude

Der Product Owner hat am 24. August 2026 entschieden, dass SkillPilot genau
einen normalen Webstart verwendet und die lernende Person dort bei jedem Start
sichtbar zwischen ChatGPT und dem unabhängig isolierten Claude-v1-Connector
wählt. Ein versteckter Providerparameter ist nicht mehr Teil des Produktwegs.

Freigegeben ist ausschließlich:

- auf dem normalen Root-Aufruf in Schritt 4 die getrennt beschrifteten
  ChatGPT- und Claude-v1-Optionen gleichzeitig anzuzeigen;
- den früheren versteckten Claude-Query-Gate aus dem Webadapter zu entfernen;
- den ChatGPT-only-Kontohinweis der öffentlichen Startseite durch die korrekte
  Aussage „SkillPilot ist kostenlos“ plus einen Link auf die lernendenseitige
  Vergleichsmatrix `/faq/coach-setup` zu ersetzen;
- die bereits vorhandenen Claude-v1-Setup- und Webstart-Handler aus dieser
  sichtbaren Auswahl aufzurufen.

Unverändert und weiterhin eingefroren bleiben insbesondere der ChatGPT-
Startbutton und sein Handler, die vorbereitete ChatGPT-Nachricht, die
24-Stunden-Sessionsemantik, das OpenAI-Paket, MCP/OAuth, Tools, Schemas,
MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und Reviewartefakte. Daher ist
weder ein Zurückziehen noch ein erneutes Einreichen des laufenden
OpenAI-Portalreviews erforderlich.

Die Hashkette von `SessionSetup.tsx` wird fortgesetzt, nicht neu begonnen:

4. gemeinsame Standardauswahl:
   `1919c46dfe9e1f70ecdf177f2dd48654400c9eb8debd47ddaf0576d9e4fdd61f`.

Die Regressionsevidenz wurde vor der nächsten autorisierten Änderung als
`contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-24-testClaudeV1StartUi.tsx`
archiviert und ist mit
`60ac516f664da7a61c7ce2a53ad2736adc7ae7d67fb10391c549b073b331a5e4`
gepinnt. Sie belegt die sichtbare Standardauswahl, die Abwesenheit eines
versteckten Query-Gates, den providerneutralen Startseitenhinweis samt
Vergleichslink und die getrennten Providerhandler. Zusätzlich ist der damalige
Claude-Webadapter als
`contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-24-claudeCoach.ts`
mit
`fc451b8780889e45fe7a848353e1415d52d4eb1b6a7f8ed35b266a4dd5d512f0`
gepinnt.

### 6.4 Eng begrenzte Ausnahme: geführte Claude-Pro-Plugin-Einrichtung

Der Product Owner hat am 25. August 2026 nach dem realen Rollout entschieden,
den veralteten lernendenseitigen manuellen Connector-Schritt durch den
geführten, direkt installierten Claude-Pro-Betaweg zu ersetzen. Das bisherige
Browser-Flag belegte lediglich, dass die Connector-Seite einmal geöffnet
worden war; es konnte weder eine Plugin-Installation noch einen
geräteübergreifenden Zustand zuverlässig erkennen.

Freigegeben ist ausschließlich:

- im getrennt gebrandeten Claude-v1-Bereich Schritt 1 auf die
  SkillPilot-eigene Installationsanleitung `/plugins` zu führen;
- dort Download, einmaligen Upload in Claude Web und Rückkehr zu SkillPilot
  nummeriert zu erklären;
- den lernendenseitigen manuellen Connector-Status sowie die wirkungslose
  lokale Zurücksetzen-Aktion zu entfernen;
- in Schritt 2 ohne vorgeschaltete Connector-Prüfung die bereits validierte,
  `q`-vorausgefüllte Claude-Web-Lernsession zu öffnen;
- die getrennte Claude-Pro-Beta in öffentlichen Hilfetexten als geführten
  First-Party-Weg zu beschreiben, weiterhin ohne Behauptung einer offiziellen
  Anthropic-Marktplatzveröffentlichung.

Dieser geführte First-Party-Betaweg wird erst nach einem abgeschlossenen
SkillPilot-Lernenden-Setup angeboten. Die Installationsroute bleibt `noindex`
und wird weder als offene öffentliche Beta noch als offizieller Marktplatzweg
beworben. Ihre eigene Readiness ist in der Direct-Install-Lane getrennt von
`openPublicBetaReady` belegt; die offenen Legal-, Support- und
Public-Beta-Gates bleiben dadurch unverändert fail-closed. Interne
Distributions- und Readiness-Felder werden nicht in den bewusst minimalen
öffentlichen Downloadindex kopiert.

Die im Plugin enthaltene technische MCP-Konfiguration bleibt unverändert. Der
eingereichte ChatGPT-Startbutton und sein Handler, die vorbereitete
ChatGPT-Nachricht, die 24-Stunden-Sessionsemantik, das OpenAI-Paket, MCP/OAuth,
Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unverändert und eingefroren. Weder ein Zurückziehen
noch ein erneutes Einreichen des laufenden OpenAI-Portalreviews ist dadurch
erforderlich.

Die Hashkette von `SessionSetup.tsx` wird erneut fortgesetzt:

5. geführte Claude-Pro-Plugin-Einrichtung:
   `b56c60fbdf44021c92c9477602207409911ef1049d5a313cc99702f9424e9031`.

Die aktuelle Regressionsevidenz
`app/scripts/testClaudeV1StartUi.tsx` ist mit
`5e833c8525919254db82e3e6d127c00911ec4a8d10408f8216a51d109f66fc8f`
gepinnt. Sie belegt den nummerierten Claude-only-Ablauf, den direkten
Claude-Webstart, die Abwesenheit eines simulierten Verbindungsstatus und die
unveränderte Trennung vom ChatGPT-Handler. Der aktuelle Claude-Webadapter
`app/src/utils/claudeCoach.ts` ist mit
`ac57943f16a0cd7cb1c6ce4fd9665821abfd8c3c586877713221cc6220456030`
gepinnt.

### 6.5 Eng begrenzte Klarstellung: aktuell nutzbarer Coach-Zugang

Der Product Owner hat am 25. August 2026 klargestellt, dass die öffentlichen
Start- und Vergleichshinweise den realen Freigabestatus unmissverständlich
nennen müssen: Aktuell funktioniert der SkillPilot-Lerncoach ausschließlich
über den Claude-Betaweg. Dafür ist ein kostenpflichtiger Claude-Tarif
erforderlich; unterstützt und getestet ist derzeit Claude Pro. ChatGPT wartet
weiterhin auf die Freigabe und ist für Lernende derzeit nicht nutzbar.

Freigegeben ist ausschließlich, diese Aussage im deutschen und englischen
Startseitenbanner und in der vorhandenen Zugangsvergleichsansicht zu ersetzen
und mit Regressionen zu belegen. Der Vergleichslink bleibt bestehen. Beide
Providerhandler, vorbereitete Nachrichten, Sessionsemantik, Pakete, MCP/OAuth,
Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unverändert. Insbesondere wird weder eine
ChatGPT-Freigabe behauptet noch der eingereichte ChatGPT-Handler verändert.

Die Klarstellung ist separat hashgebunden:

- `app/src/locales/de.ts`:
  `e1f30f7e1673c0993871edb238691e71d144455812a7ac975402b77d039eeef0`;
- `app/src/locales/en.ts`:
  `241e349c71816a76d4d3754a56791ea6a18b6391fe9f972c27de32fafa353da6`;
- `app/scripts/testRootRoutePolicy.ts`:
  `b9d399e5bf42a8b8ba4a48cffd7d89edeb16bde52b7d89a5e9747ee8e2d666e4`
  → `d0699da8dacafaac489017ed49ab04fb1d5e8b66f38f30b4f03c25c5d49110ad`;
- `app/src/utils/coachProviderMatrixCopy.ts`:
  `2c24a78b60d0556e194799e5c531f319d4419f68f7ca7b0945b311f551f6da2c`;
- `app/src/utils/coachProviderMatrixCopy.test.ts`:
  `3dfc8be12202ddb545eec44b0e5860e5d2d8008f1fce27060e7f9ed6a19fb1e1`.

Der Freeze-Checker validiert diese fünf Dateien über
`authorizedCopyClarifications`. Die Klarstellung erfordert weder ein
Zurückziehen noch eine erneute Einreichung im OpenAI-Portal, weil sie den
laufenden Reviewstatus wahrheitsgemäß beschreibt und keinen eingereichten
Vertrag oder Reviewablauf verändert.

### 6.6 Eng begrenzte Klarstellung: vollständige Claude-Plugin-Einrichtung

Der Product Owner hat am 25. August 2026 festgestellt, dass die bisherige
Kurzangabe „Anpassen → Plugins“ und das Ende der Anleitung direkt nach dem
Datei-Upload praktische Einrichtungsblocker darstellen. In der real
beobachteten deutschen Claude-Weboberfläche führt der Weg über das Profil
unten links zu „Einstellungen“, dort links unter „Anpassen“ zu „Plugins“ und
anschließend oben rechts über „Hinzufügen“ zum Upload einer benutzerdefinierten
Plugin-Datei. Die offizielle Anthropic-Hilfe beschreibt daneben den direkten
Einstieg über „Customize → Plugins“, der je nach Oberflächenvariante bereits
in der Hauptseitenleiste sichtbar sein kann.

Freigegeben ist ausschließlich, im deutschen und englischen `/plugins`-
Leitfaden den vollständigen Ablauf als fünf eng begrenzte Schritte
darzustellen: die aktuelle Datei zuerst herunterladen, ausschließlich alte
SkillPilot-Plugin-Einträge entfernen, die aktuelle Datei hochladen und bei
Bedarf aktivieren, im neuen Plugin den enthaltenen SkillPilot-Konnektor
verbinden und dessen Claude-Freigabe abschließen sowie danach zu SkillPilot
zurückkehren. Andere Plugins und separat vorhandene Konnektoren bleiben
unangetastet; ein zweiter manueller SkillPilot-Konnektor oder die manuelle
Eingabe einer MCP-URL werden ausdrücklich ausgeschlossen.

Der Downloadindex, das Pluginarchiv, die Download-URL, die gebündelte
Konnektordeklaration und ihr Endpunkt, Providerhandler, vorbereitete
Nachrichten, Sessionsemantik, Pakete, MCP/OAuth, Tools, Schemas, MCP-Apps-UI,
Reviewfälle, Portalwerte, Fixtures und Reviewartefakte bleiben unverändert.

Die Klarstellung ist separat hashgebunden:

- `app/src/views/PluginCatalogView.tsx`:
  `548aa480c96d76d1a2f9403c4631a74d6d891565c62a0b5197fd59e4092a8e5a`;
- `app/src/utils/claudePluginPublication.test.ts`:
  `f6efd1d17ff352bbd4943d967577eab475a636515949d159505b066a7936a6c2`.

Der Freeze-Checker validiert beide Dateien als zweiten Eintrag in
`authorizedCopyClarifications`. Die Änderung betrifft ausschließlich die
Claude-spezifische First-Party-Installationshilfe und erfordert daher weder ein
Zurückziehen noch eine erneute Einreichung des unveränderten OpenAI-V1-Vertrags.

### 6.7 Eng begrenzte Ausnahme: Lernzielbuch-Link auf der Startseite

Der Product Owner hat am **26. August 2026** entschieden, die vorhandene
Read-only-Ansicht der Lernzielbücher für Mathematik und Physik auf der
öffentlichen SkillPilot-Startseite direkt auffindbar zu machen. Die Bücher und
ihre PDFs waren bereits unter `/lernzielbuch` erreichbar; geändert wird nur
ihre Sichtbarkeit als lokalisierter Navigationslink.

Freigegeben ist ausschließlich:

- `PUBLIC_GOAL_BOOK_PROMOTION_ENABLED` in `SessionSetup.tsx` einzuschalten;
- dadurch den bereits vorhandenen deutschen beziehungsweise englischen Link
  auf `/lernzielbuch` außerhalb von Package-Consumer-Builds anzuzeigen;
- die fokussierten Regressionen für genau diese Sichtbarkeit zu aktualisieren.

Der öffentliche Sitemap-Eintrag bleibt im Rahmen dieser eng begrenzten
Entscheidung unverändert aus. Die Lernzielbuchroute bleibt read-only. Coach-
Start, vorbereitete Nachrichten, Session- und Lernzustandssemantik, OpenAI-
Paket, MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte,
Fixtures und Reviewartefakte bleiben unverändert. Daher ist weder ein
Zurückziehen noch eine erneute Einreichung des laufenden OpenAI-Portalreviews
erforderlich.

Die Hashkette von `SessionSetup.tsx` wird fortgesetzt:

6. öffentlicher Lernzielbuch-Link:
   `71c1d46f9eb42ab9a1d643df44e65fb35a89ece2b0a901f9ea045b64c56aae84`.

Die Regressionen sind zusätzlich hashgebunden:

- `app/src/views/WorkbenchView.test.ts`:
  `97e2c090d00859dd0389dbccdfe226b187293bcbac6d0ada1cddd4ae313a59d6`;
- `app/scripts/testSessionSetupCompletionUi.ts`:
  `afb66331e9bf1707195b1389d28bfe09839a9c3a130800bc207d6ed9602426fe`.

### 6.8 Eng begrenzte Ausnahme: gemeinsamer SkillPilot-Überblick

Der Product Owner hat am **27. August 2026** entschieden, die zwei parallelen
Zugänge zur SkillPilot-Idee auf der öffentlichen Startseite nach dem Anliegen
der Besuchenden zusammenzuführen. Der eigenständige Audio-Einstieg und der
separate Konzeptlink werden deshalb durch eine gemeinsame lokalisierte
Überblickskarte mit genau drei direkten Aktionen ersetzt; die Inhalte und ihre
direkten Ziele bleiben erhalten.

Freigegeben ist ausschließlich:

- auf der öffentlichen Startseite den eigenständigen Audio-Einstieg und den
  separaten Konzeptlink durch eine lokalisierte Überblickskarte mit exakt drei
  Aktionen und ohne zusätzlichen neutralen „Überblick öffnen“-Link zu ersetzen;
- dafür die unveränderte Route `/whitepaper/:lang` weiterzuverwenden;
- Audio und Video über ihre bestehenden Anker mit einem einmaligen
  Wiedergabe-Intent direkt zu starten;
- das Whitepaper direkt über seinen bestehenden Anker zu öffnen und bei einem
  neutralen Aufruf von `/whitepaper/:lang` keinerlei Medium automatisch
  abzuspielen;
- den neuen fokussierten Überblickstest für genau diese Abgrenzung
  hinzuzufügen.

Coach-Handler, vorbereitete Nachrichten, Session- und Lernzustandssemantik,
OpenAI-Paket, MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte,
Fixtures und Reviewartefakte bleiben unverändert. Die Änderung betrifft nur die
Informationsnavigation des aktuellen Produktions-Webfrontends. Daher ist weder
ein Zurückziehen noch eine erneute Einreichung des laufenden
OpenAI-Portalreviews erforderlich; das eingefrorene Plugin bleibt
`skillpilot-coach-v1` Version `1.0.0`.

Die Hashkette von `SessionSetup.tsx` wird fortgesetzt:

7. gemeinsamer SkillPilot-Überblick:
   `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`.

Die fokussierte Regression wurde vor der nächsten autorisierten Änderung
byte-identisch als historische Evidenz archiviert und ist zusätzlich
hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-27-testPublicOverviewUi.tsx`:
  `69b029ea922aea40ddddac6630fe04e89ace84e135d16586d5305ed34cbd1fb3`.

### 6.9 Eng begrenzte Ausnahme: Vision und Mission im bestehenden Überblick

Der Product Owner hat am **28. August 2026** für das aktuelle
Produktions-Webfrontend ausdrücklich genehmigt, die bestehende Überblickskarte
um genau einen lokalen Vision-&-Mission-Disclosure-Button einschließlich der
genehmigten deutschen und englischen Kurz- und Langtexte zu ergänzen. Das
OpenAI-Plugin bleibt unverändert `skillpilot-coach-v1` Version `1.0.0`; ein
Zurückziehen oder erneutes Einreichen im Portal ist nicht erforderlich.

Diese Entscheidung ersetzt ausschließlich die in Abschnitt 6.8 festgelegte
Grenze von genau drei interaktiven Aktionen. Weiterhin vorhanden und
unverändert bleiben genau drei direkte Medienaktionen für Audio-Einführung,
Präsentationsvideo und Whitepaper. Als viertes interaktives Element ist genau
ein zunächst geschlossenes, semantisches Disclosure innerhalb derselben Karte
freigegeben.

Freigegeben ist ausschließlich:

- die bisherige lokalisierte Kurzbeschreibung durch die genehmigte kompakte
  Vision und Mission zu ersetzen; sie nennt offene, von Menschen gestaltete,
  geprüfte und verantwortete Wissenslandschaften, verlässliche Orientierung
  für Lernende und ihre persönliche KI sowie die lernfortschrittsbezogene
  Sichtbarkeit für fundierte pädagogische Entscheidungen und gezielte
  Lernbegleitung;
- unter den drei Medienaktionen genau einen deutsch beziehungsweise englisch
  beschrifteten Textbutton anzuzeigen, der einen zunächst verborgenen Bereich
  mit dem genehmigten vollständigen Vision-und-Mission-Wortlaut innerhalb
  derselben Karte öffnet und wieder schließt;
- das Disclosure tastaturbedienbar mit `aria-expanded`, `aria-controls` und
  einem für assistive Technik ausgeblendeten Zustands-Chevron umzusetzen, ohne
  automatische Öffnung, Modal, Pop-up, neue Route, zusätzliche Karte oder
  zusätzlichen Hauptnavigationspunkt;
- die mobile und Desktop-Darstellung sowie die exakten deutschen und
  englischen Texte, den anfänglich geschlossenen Zustand, die
  Disclosure-Semantik und die unveränderten Medienziele mit der fokussierten
  Überblicksregression zu belegen.

Die Seitenreihenfolge **Lernen starten** → **SkillPilot im Überblick** →
**Curriculum-Champions** bleibt unverändert; **Lernen starten** bleibt die
erste und wichtigste Aktion. Alle drei Medienziele, Anker und einmaligen
Wiedergabe-Intents sowie das neutrale Verhalten von `/whitepaper/:lang`
bleiben unverändert. `SessionSetup.tsx` bleibt byte-identisch. Coach-Handler,
vorbereitete Nachrichten, Session- und Lernzustandssemantik, OpenAI-Paket,
MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unverändert und eingefroren.

Die Hashkette dokumentiert deshalb ausdrücklich einen autorisierten Schritt
ohne Änderung an `SessionSetup.tsx`:

8. Vision-&-Mission-Disclosure im bestehenden Überblick:
   `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
   (vorher und nachher byte-identisch).

Die beiden autorisierten Implementierungsstände wurden vor der nächsten
Änderung byte-identisch als historische Evidenz archiviert. Sie bleiben mit
ihrem vorherigen und ihrem autorisierten SHA-256 verankert:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-SkillPilotOverviewCard.tsx`:
  `1a2c27f60320b1296e32f20bae7af3adbf7625762c52ea1dfb5d2cd5a20df420`
  →
  `0b6c7539cb55d02f78198f3a50fcd8a95ac9b0c6bd0f8d5fa8d486352e2f75b3`;
- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-skillPilotOverviewCopy.ts`:
  `537e128921b534c8abdd71d4bdc5dc8afda63b865da2598fdcde9957e57d56cb`
  →
  `f2192dfabe8d2f00ca6f2bad01c0e65b5982dcd68aba426b10e9c4a59c43ec01`.

Auch die fokussierte Regression wurde vor der nächsten autorisierten Änderung
byte-identisch archiviert und ist hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-testPublicOverviewUi.tsx`:
  `45fbf9051fd2cf143cdb7414f0434ad4dc82471d9728689d620454d218c7f72c`.

### 6.10 Eng begrenzte Ausnahme: sachlicher Überblick und eingeordnete Langfristperspektive

Der Product Owner hat am **28. August 2026** für das aktuelle
Produktions-Webfrontend ausdrücklich genehmigt, den geschlossenen Zustand der
Überblickskarte wieder auf den heutigen sachlichen Informationseinstieg zu
begrenzen. Die bereits freigegebene vollständige Vision und Mission bleibt auf
Wunsch in derselben Karte erreichbar, wird aber ausdrücklich als langfristiges
Ziel und Weg dorthin eingeordnet. Das OpenAI-Plugin bleibt unverändert
`skillpilot-coach-v1` Version `1.0.0`; ein Zurückziehen oder erneutes Einreichen
im Portal ist nicht erforderlich.

Diese Entscheidung verfeinert ausschließlich die Darstellung aus Abschnitt
6.9. Weiterhin vorhanden bleiben genau drei direkte Medienaktionen und genau
ein zunächst geschlossenes, semantisches Vision-&-Mission-Disclosure. Es wird
kein weiteres interaktives Element, keine Route und kein Hauptnavigationspunkt
ergänzt.

Freigegeben ist ausschließlich:

- im geschlossenen deutschen Zustand nur wieder die sachliche Unterzeile
  „Die Idee hinter SkillPilot – anhören, ansehen oder lesen.“ und im englischen
  Zustand die entsprechende Unterzeile „The idea behind SkillPilot—listen,
  watch, or read.“ anzuzeigen;
- die zuvor sofort sichtbare kompakte Vision „Alles Wissen. Für jeden
  Menschen.“ beziehungsweise „All knowledge. For everyone.“ und den kompakten
  Missionstext vollständig aus dem geschlossenen Zustand zu entfernen;
- den bestehenden Disclosure-Button in dieselbe umbrechende Aktionszeile wie
  Audio-Einführung, Präsentationsvideo und Whitepaper zu integrieren, bei
  ausreichender Breite rechts auszurichten und auf kleineren Bildschirmen
  umbrechen zu lassen;
- die sichtbare Buttonbeschriftung im geschlossenen und geöffneten Zustand
  konstant bei „Vision & Mission“ zu belassen; ausschließlich
  `aria-expanded` und der für assistive Technik ausgeblendete Chevron zeigen
  den Zustand an;
- im geöffneten Bereich vor dem unveränderten vollständigen Wortlaut den
  Hinweis „Vision und Mission beschreiben unser langfristiges Ziel und den Weg
  dorthin.“ beziehungsweise „Vision and mission describe our long-term goal
  and the path towards it.“ anzuzeigen;
- Vision und Mission ab 850 CSS-Pixeln zweispaltig und darunter untereinander
  darzustellen, ohne die Schrift zu verkleinern;
- den Zustand bei jedem ersten Seitenaufruf geschlossen zu lassen und nicht
  dauerhaft zu speichern sowie die exakten deutschen und englischen Texte,
  Responsive-Darstellung, Disclosure-Semantik und unveränderten Medienziele
  mit der fokussierten Überblicksregression zu belegen.

Die Seitenreihenfolge **Lernen starten** → **SkillPilot im Überblick** →
**Curriculum-Champions** bleibt unverändert; **Lernen starten** bleibt die
erste und wichtigste Aktion. Alle drei Medienziele, Anker und einmaligen
Wiedergabe-Intents sowie das neutrale Verhalten von `/whitepaper/:lang`
bleiben unverändert. `SessionSetup.tsx` bleibt byte-identisch. Coach-Handler,
vorbereitete Nachrichten, Session- und Lernzustandssemantik, OpenAI-Paket,
MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unverändert und eingefroren.

Die Hashkette dokumentiert deshalb erneut ausdrücklich einen autorisierten
Schritt ohne Änderung an `SessionSetup.tsx`:

9. sachlicher geschlossener Überblick und eingeordnete Langfristperspektive:
   `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
   (vorher und nachher byte-identisch).

Der autorisierte Komponentenstand wurde vor der nächsten Änderung
byte-identisch als historische Evidenz archiviert. Die unveränderte Copy-Datei
bleibt zusätzlich live hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-factual-overview-SkillPilotOverviewCard.tsx`:
  `0b6c7539cb55d02f78198f3a50fcd8a95ac9b0c6bd0f8d5fa8d486352e2f75b3`
  →
  `8495949581cbd3c9efcfe5b7decb49ca3e32f0e881435be946cd0c7170ee7c54`;
- `app/src/utils/skillPilotOverviewCopy.ts`:
  `f2192dfabe8d2f00ca6f2bad01c0e65b5982dcd68aba426b10e9c4a59c43ec01`
  →
  `8698f3c9bfb995dab191cd2e317e4fc80f566ec4e449e0dc4152bcc5e34eef4d`.

Auch die fokussierte Regression wurde vor der nächsten autorisierten Änderung
byte-identisch archiviert und ist hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-factual-overview-testPublicOverviewUi.tsx`:
  `f4911b536c399516bee60b66abbeca9578a8d01ac540d8b534abb4b2858b1b7d`.

### 6.11 Eng begrenzte Ausnahme: einfacher grüner Interaktionsrahmen

Der Product Owner hat am **28. August 2026** für das aktuelle
Produktions-Webfrontend ausdrücklich genehmigt, den doppelten violetten
Interaktionsrahmen der Überblickskarte durch genau einen zurückhaltenden,
ein Pixel breiten grünen Kartenrand zu ersetzen. Die fokussierte einzelne
Aktion behält ihren eigenen gut sichtbaren Fokusindikator. Das OpenAI-Plugin
bleibt unverändert `skillpilot-coach-v1` Version `1.0.0`; ein Zurückziehen oder
erneutes Einreichen im Portal ist nicht erforderlich.

Freigegeben ist ausschließlich:

- bei Hover oder Fokus innerhalb der Überblickskarte genau den bestehenden
  ein Pixel breiten Kartenrand grün einzufärben;
- den äußeren kartenweiten Ring, seinen Offset und die dadurch entstehende
  doppelte Linie vollständig zu entfernen;
- die `focus-visible`-Ringe der drei Medienlinks und des
  Vision-&-Mission-Disclosure-Buttons unverändert beizubehalten;
- den einzelnen grünen Kartenrand, die Abwesenheit eines äußeren Kartenrings
  und die weiterhin sichtbaren Fokusindikatoren der einzelnen Aktionen mit der
  fokussierten Überblicksregression zu belegen.

Sämtliche deutschen und englischen Texte, Layouts, Aktionen, Medienziele,
Anker, einmaligen Wiedergabe-Intents und das neutrale Verhalten von
`/whitepaper/:lang` bleiben unverändert. Die Seitenreihenfolge **Lernen
starten** → **SkillPilot im Überblick** → **Curriculum-Champions** bleibt
unverändert; **Lernen starten** bleibt die erste und wichtigste Aktion.
`SessionSetup.tsx` bleibt byte-identisch. Coach-Handler, vorbereitete
Nachrichten, Session- und Lernzustandssemantik, OpenAI-Paket, MCP/OAuth, Tools,
Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und Reviewartefakte
bleiben unverändert und eingefroren.

Die Hashkette dokumentiert deshalb erneut ausdrücklich einen autorisierten
Schritt ohne Änderung an `SessionSetup.tsx`:

10. einfacher grüner Interaktionsrahmen ohne äußeren Kartenring:
    `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
    (vorher und nachher byte-identisch).

Der autorisierte Komponentenstand wurde vor der nächsten Änderung
byte-identisch als historische Evidenz archiviert und bleibt mit seinem
vorherigen und seinem autorisierten SHA-256 verankert:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-single-green-frame-SkillPilotOverviewCard.tsx`:
  `8495949581cbd3c9efcfe5b7decb49ca3e32f0e881435be946cd0c7170ee7c54`
  →
  `b55844133b156287db7a763e52fc225505435f975438d5651bccaf6692ca2a90`.

Auch die fokussierte Regression wurde vor der nächsten autorisierten Änderung
byte-identisch archiviert und ist hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-single-green-frame-testPublicOverviewUi.tsx`:
  `0097c3418e3a310907f4d82edd380399b15571225b603d73d73269a21191838f`.

### 6.12 Eng begrenzte Ausnahme: Vision und Mission als vierte Aktionspille

Der Product Owner hat am **28. August 2026** für das aktuelle
Produktions-Webfrontend ausdrücklich genehmigt, das bestehende
Vision-&-Mission-Disclosure nicht mehr als freistehenden violetten Textlink,
sondern als vierte gleichrangige Aktionspille unmittelbar nach dem Whitepaper
anzuzeigen. Das OpenAI-Plugin bleibt unverändert `skillpilot-coach-v1` Version
`1.0.0`; ein Zurückziehen oder erneutes Einreichen im Portal ist nicht
erforderlich.

Freigegeben ist ausschließlich:

- Audio-Einführung, Präsentationsvideo, Whitepaper und Vision & Mission in
  dieser Reihenfolge in genau einer semantischen Liste anzuordnen, deren
  zugängliche Beschriftung die lokalisierte Überschrift der Überblickskarte
  ist;
- Vision & Mission als vierte direkt anschließende Pille mit einem führenden,
  für assistive Technik ausgeblendeten Kompasssymbol, der konstanten sichtbaren
  Beschriftung „Vision & Mission“ und dem nachgestellten Zustands-Chevron
  darzustellen;
- die geschlossene Pille wie die drei Medienpillen zu gestalten und nur den
  geöffneten Zustand grün hervorzuheben;
- den Chevron beim Öffnen nach oben zu drehen und beim Schließen wieder nach
  unten zu drehen, während `aria-expanded` und `aria-controls` die semantische
  Zustands- und Bereichsbeziehung unverändert abbilden;
- die frühere freistehende violette Linkdarstellung, automatische
  Rechtsausrichtung und Unterstreichung zu entfernen;
- die genaue Reihenfolge, Listensemantik, Symbole, konstanten Texte,
  Zustandsdarstellung, Tastaturbedienung und responsive Umbruchfreiheit mit der
  fokussierten Überblicksregression zu belegen.

Sämtliche deutschen und englischen Texte, Medienrouten und
Wiedergabe-Intents, der initial geschlossene Disclosure-Zustand, Inhalt und
Layout des geöffneten Bereichs sowie der einzelne grüne Interaktionsrahmen der
Karte bleiben unverändert. Die Seitenreihenfolge **Lernen starten** →
**SkillPilot im Überblick** → **Curriculum-Champions** bleibt unverändert;
**Lernen starten** bleibt die erste und wichtigste Aktion. `SessionSetup.tsx`
bleibt byte-identisch. Coach-Handler, vorbereitete Nachrichten, Session- und
Lernzustandssemantik, OpenAI-Paket, MCP/OAuth, Tools, Schemas, MCP-Apps-UI,
Reviewfälle, Portalwerte, Fixtures und Reviewartefakte bleiben unverändert und
eingefroren.

Die Hashkette dokumentiert deshalb erneut ausdrücklich einen autorisierten
Schritt ohne Änderung an `SessionSetup.tsx`:

11. Vision und Mission als vierte Aktionspille:
    `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
    (vorher und nachher byte-identisch).

Der autorisierte Komponentenstand wurde vor der nächsten Änderung
byte-identisch als historische Evidenz archiviert und bleibt mit seinem
vorherigen und seinem autorisierten SHA-256 verankert:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-adjacent-vision-mission-pill-SkillPilotOverviewCard.tsx`:
  `b55844133b156287db7a763e52fc225505435f975438d5651bccaf6692ca2a90`
  →
  `d7408c72ba5a98791a54c586a08b6be320a1ab059efb723fd627351312d255eb`.

Auch die fokussierte Regression wurde vor der nächsten autorisierten Änderung
byte-identisch archiviert und ist hashgebunden:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-adjacent-vision-mission-pill-testPublicOverviewUi.tsx`:
  `f85a72c8440d1b315664ce912fbd6ced1bdfdf4156d02d7afff5d47cc26c83b2`.

### 6.13 Eng begrenzte Ausnahme: grüne Überschrift im Interaktionszustand

Der Product Owner hat am **29. August 2026** für das aktuelle
Produktions-Webfrontend ausdrücklich genehmigt, die Überschrift der
Überblickskarte im grünen Hover- beziehungsweise Fokuszustand nicht mehr
violett, sondern passend zum bereits freigegebenen grünen Kartenrand
darzustellen. Das OpenAI-Plugin bleibt unverändert `skillpilot-coach-v1`
Version `1.0.0`; ein Zurückziehen oder erneutes Einreichen im Portal ist nicht
erforderlich.

Freigegeben ist ausschließlich:

- die Überschrift bei Hover und bei Fokus innerhalb der Karte im hellen Modus
  mit dem etablierten `emerald-700` und im dunklen Modus mit `emerald-300`
  darzustellen;
- die violette Interaktionsfarbe vollständig von der Überschrift zu entfernen,
  während ihre neutrale Ausgangsfarbe unverändert bleibt;
- damit Überschrift und einzelner grüner Kartenrand als ein konsistenter
  Interaktionszustand erscheinen;
- die vier hellen beziehungsweise dunklen Hover-/Fokusklassen und die
  Abwesenheit einer violetten Überschriftenklasse mit der fokussierten
  Überblicksregression zu belegen. Die gewählten Farben erreichen auf den
  vorhandenen Kartenhintergründen mindestens WCAG-AA-Kontrast für normalen
  Text.

Sämtliche deutschen und englischen Texte, Layouts, Aktionen, Medienziele,
Anker, Wiedergabe-Intents, Disclosure- und Aktionspillenverhalten sowie der
einzelne grüne Interaktionsrahmen der Karte bleiben unverändert. Die
Seitenreihenfolge **Lernen starten** → **SkillPilot im Überblick** →
**Curriculum-Champions** bleibt unverändert; **Lernen starten** bleibt die
erste und wichtigste Aktion. `SessionSetup.tsx` bleibt byte-identisch.
Coach-Handler, vorbereitete Nachrichten, Session- und Lernzustandssemantik,
OpenAI-Paket, MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte,
Fixtures und Reviewartefakte bleiben unverändert und eingefroren.

Die Hashkette dokumentiert deshalb erneut ausdrücklich einen autorisierten
Schritt ohne Änderung an `SessionSetup.tsx`:

12. grüne Überschrift im Hover- und Fokuszustand:
    `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
    (vorher und nachher byte-identisch).

Die aktualisierte Implementierungsdatei ist mit ihrem vorherigen und ihrem
neuen autorisierten SHA-256 verankert:

- `app/src/components/SkillPilotOverviewCard.tsx`:
  `d7408c72ba5a98791a54c586a08b6be320a1ab059efb723fd627351312d255eb`
  →
  `16329baefd5fbbf5d733253508a57661c67e0ba5d49583f6cec119fe5695a77a`.

Die aktualisierte fokussierte Regression ist ebenfalls hashgebunden:

- `app/scripts/testPublicOverviewUi.tsx`:
  `fe66f2148c198663aa671ce1a1eea4ccdf57b23bfdb4f20287c0c42a832ef757`.

### 6.14 Eng begrenzte Ausnahme: obsoleten Gymnasium-Runtime-Cutover entfernen

Der Product Owner hat am **29. August 2026** für das aktuelle
Produktions-Webfrontend und -Backend ausdrücklich genehmigt, den nur für eine
Übergangsphase gebauten Gymnasium-Legacy-Cutover vollständig zu entfernen. Der
Grund ist, dass keine realen Legacy-Lernenden diesen Migrationspfad benötigen.
Das OpenAI-Plugin bleibt unverändert `skillpilot-coach-v1` Version `1.0.0`; ein
Zurückziehen oder erneutes Einreichen im Portal ist nicht erforderlich.

Freigegeben ist ausschließlich:

- das Bulkwerkzeug in `UsersView` samt Bulk-Endpunkt und ausschließlich dafür
  vorhandenen DTOs, Zählern, Tests und Texten zu entfernen;
- den Einzel-Cutover sowie die dazugehörigen Banner, Retirement-Ansichten und
  Hilfslogik aus dem Lernenden-Cockpit zu entfernen;
- den dedizierten per-learner Kompatibilitätsarchiv-Download samt Endpoint,
  DTOs, Servicepfad und ausschließlich dazugehörigen Tests zu entfernen;
- die danach eindeutig toten Frontend-Helper, Package-Consumer-Aliase und
  Backend-Servicepfade zu entfernen;
- verbleibende generische Read-only-Fehlertexte von den entfernten Aktionen zu
  entkoppeln.

Unverändert erhalten bleiben die kanonischen Curricula, die internen
Quelllandschaften sowie die DE-weiten Archive, Mapping-, Provenance-,
Kompatibilitäts-Summary- und Topic-Summary-Lanes. Ebenfalls unverändert bleiben
die aktuelle Personalization-Migration, alle unterstützten aktuellen
Lernzustandssemantiken, Coach-Handler, vorbereitete Nachrichten, OpenAI-Paket,
MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte. Die deutschen und englischen Locale-Dateien bleiben
byte-identisch; ihre nun ungenutzten historischen Operator-Texte werden wegen
der bestehenden Hashbindung nicht in dieser Ausnahme verändert.

Der vorherige geschützte Stand wurde vor der Änderung byte-identisch als
historische Evidenz archiviert und bleibt zusammen mit dem autorisierten Hash
verankert:

- `app/src/views/LearnerView.tsx`:
  `ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7`
  →
  `d579e459e6450cc6891971bab3a65621a3409a0c5d16ae9c22ce67b24956e0e6`;
- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-pre-runtime-cutover-cleanup-LearnerView.tsx`:
  `ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7`.

### 6.15 Eng begrenzte Ausnahme: standardmäßig deaktivierte Feedback-Konfiguration

Der Product Owner hat am **30. August 2026** ausdrücklich genehmigt,
`application.yml` anzupassen, sofern das Risiko überschaubar bleibt. Diese
Freigabe wird eng ausgelegt: Sie erlaubt ausschließlich einen neuen,
standardmäßig deaktivierten Konfigurationszweig für die öffentliche
Lernzielbuch-Rückmeldung und deren operatorgeschützte Übergabe von Produktion
in eine lokale Codex-Entwicklungsumgebung. Das OpenAI-Plugin bleibt unverändert
`skillpilot-coach-v1` Version `1.0.0`; ein Zurückziehen oder erneutes Einreichen
im Portal ist nicht erforderlich.

Freigegeben ist ausschließlich, direkt unter dem bereits vorhandenen
`skillpilot.public-base-url` den Zweig `skillpilot.goal-feedback` anzulegen mit:

- `enabled`, dessen eingecheckter Standard `false` bleibt;
- einem eigenen, standardmäßig leeren `operator-token`;
- begrenzten öffentlichen Rate-Limit-Werten für Requests, Zeitfenster und die
  maximale Zahl lokaler Zähler-Buckets; und
- begrenzten Inbox-Werten für ausstehende Zeilen und Bytes.

Keine vorhandene Property, kein bestehender Default und keine OpenAI-, Claude-,
MCP-, OAuth-, Tool-, Schema-, UI-, Session-, Zustands- oder Review-Semantik darf
dabei verändert werden. Die Feedback-Komponenten werden nur bei der expliziten
Aktivierung instanziiert; eine Aktivierung ohne mindestens 32 Zeichen langes,
eigenständiges Operator-Token bricht den Start fail-closed ab. Diese Ausnahme
ist weder eine Produktionsaktivierung noch eine Deployment-Freigabe.

Der geschützte Konfigurationsstand ist mit seiner unveränderten
Submission-Baseline und dem eng autorisierten neuen SHA-256 verankert:

- `backend/src/main/resources/application.yml`:
  `15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591`
  →
  `83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990`.

Die fokussierte Produktionsübergabe-Regression belegt Aktivierung,
versionierte Annahme, wiederaufnehmbaren Export, Digestbindung, atomare
Löschung, inhaltsfreien Receipt und historische PDF-Auflösung und ist ebenfalls
hashgebunden:

- `backend/src/test/java/com/skillpilot/backend/goalfeedback/GoalFeedbackProductionHandoffIntegrationTest.java`:
  `ff053be447e56015dd595b67e3a4cfa2cad7eb2875c42b51c224f6f3f0f0a9dc`.

### 6.16 Eng begrenzte Ausnahme: Spring Boot 4.1.1

Der Product Owner hat am **30. August 2026** ausdrücklich genehmigt, dass der
Review-Freeze dieses Wartungsupdate nicht verhindert. Freigegeben ist
ausschließlich die Änderung des Gradle-Plugins `org.springframework.boot` von
`4.1.0` auf `4.1.1` im aktuellen Produktions-Webbackend. Java-Version,
Gradle-Wrapper, Spring-AI-BOM, Quellcode, Konfiguration sowie alle eingereichten
ChatGPT-, MCP-, OAuth-, Tool-, Schema-, UI-, Session- und Reviewverträge bleiben
unverändert. Diese Ausnahme ist weder eine Deployment-Freigabe noch eine
allgemeine Aufhebung des Review-Freeze.

Der unmittelbar vorherige und der autorisierte Dateistand sind hashgebunden:

- `backend/build.gradle.kts`:
  `fcde2e8108d36e58a35f015a274efe5ad361465bafc2296789ea374dd246dec1`
  →
  `b400ce01f36f653b96271e4f430f97f5595c7617c48132bdf76bcd9630d9a7f0`.

Die öffentliche OpenAI-V1-Vertragsregression bleibt als unveränderte Evidenz
hashgebunden:

- `backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1PublicContractValidationTest.java`:
  `e401636ab978d8a97b168e8e5bc606b4594e7a21ccae284064f2590a66c158bf`.

### 6.17 Eng begrenzte Ausnahme: sichere Produktionsaktivierung des Lernziel-Feedbacks

Der Product Owner hat am **30. August 2026** mit „freeze soll uns hier nicht
abhalten“ und anschließend „bitte zum Leben erwecken“ ausdrücklich entschieden,
den unabhängig isolierten Lernziel-Feedbackkanal produktiv zu aktivieren. Die
Freigabe umfasst ausschließlich die Feedback-WebGUI, den öffentlichen
Feedback-Envelope samt Schema, die feedbackspezifische Persistenz, Übergabe,
Aufbewahrung und Löschung sowie zugehörige Tests und Betriebsdokumentation.

Freigegeben sind insbesondere die auditierbare Bindung an Version und Sprache
des angezeigten Datenschutzhinweises, die feste 30-Tage-Retention mit täglichem
Cleanup, inhaltsfreie Terminalbelege und die abgesicherte Übergabe von
Produktion in die lokale Entwicklungsablage. `application.yml` bleibt dabei
byte-identisch auf dem bereits autorisierten Hash. Die eingesendete
ChatGPT-V1-App, MCP-/OAuth-/Tool-/Schema-/UI-/Session-/State-Semantik, ihre
Reviewfälle und Portalwerte bleiben unverändert; eine Portalaktion ist nicht
erforderlich.

Die vor dieser Aktivierung hashgebundene Feedback-Regression ist unverändert
archiviert:

- `contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-30-pre-goal-feedback-activation-GoalFeedbackProductionHandoffIntegrationTest.java`:
  `ff053be447e56015dd595b67e3a4cfa2cad7eb2875c42b51c224f6f3f0f0a9dc`.

Die aktualisierte Regression für Hinweisbindung, Retention und terminale
Löschzustände ist ebenfalls hashgebunden:

- `backend/src/test/java/com/skillpilot/backend/goalfeedback/GoalFeedbackProductionHandoffIntegrationTest.java`:
  `7c6eaba09fe95aa4334b31d9f5a19b65b4d6655926573a0679db75c4fd87159d`.

### 6.18 Eng begrenzte Ausnahme: Lernziel-Feedback aus dem Lernenden-Cockpit

Der Product Owner hat am **31. August 2026** entschieden, dass eine lernende
Person eine unmittelbar beim Lernen bemerkte Schwäche des sichtbaren Lernziels
direkt aus dem Cockpit über den bereits etablierten Lernzielbuch-Feedbackweg
melden kann. Ziel ist das aktuelle Produktions-Webfrontend zusammen mit dem
unabhängig isolierten Lernziel-Feedbackkanal. Das OpenAI-Plugin bleibt
unverändert `skillpilot-coach-v1` Version `1.0.0`; ein Zurückziehen oder erneutes
Einreichen im Portal ist nicht erforderlich.

Freigegeben ist ausschließlich:

- unter dem im Lernenden-Cockpit gerade sichtbaren, curricular-atomaren
  Mathematik- oder Physikziel eine lokalisierte sekundäre Aktion
  **Feedback zu diesem Lernziel** anzuzeigen;
- die Aktion erst nach dem bewussten Klick über
  `GET /api/public/goal-feedback/v1/current-binding` mit exakt `bookId` und
  `goalId` gegen die bereits hashverifizierte, datenbankseitig als aktuell
  ausgewählte Buchpublikation aufzulösen;
- diesen reinen Lesezugriff `no-store` auszuliefern und im selben begrenzten
  Fenster wie die bestehende Kontextauflösung zu rate-limitieren;
- aus der Antwort exakt den vorhandenen siebenfach gebundenen
  `/lernziel-feedback`-Link aufzubauen. Die bestehende `/context`-Prüfung bleibt
  unverändert strikt und verlangt weiterhin genau `bookId`, `goalId`, `edition`,
  `goalFingerprint`, `pageFingerprint`, `bookDigest` und `page`;
- den identischen URL-Builder auch im Lernzielbuch zu verwenden, ohne dessen
  Ziel, Parameter oder Navigation semantisch zu verändern;
- Fehler als wiederholbare lokale Cockpit-Meldung anzuzeigen und schnelle
  Doppelklicks synchron auf genau einen Lookup zu begrenzen;
- ausschließlich feedbackspezifische Frontend- und Backendtests sowie deren
  Test-Fixtures und npm-Testregistrierung zu ergänzen.

Die Aktion wird weder im Trainer noch im Explorer oder Package-Consumer
freigeschaltet und bleibt für Cluster-, Struktur-, Orientierungs-, Memory- und
Prüfungsziele unsichtbar. Weder SkillPilot-ID noch Learner-, Session-, Chat-,
Lernstands-, Personalisierungs- oder Rollenwerte werden in Lookup oder
Feedbacklink übertragen. Der Lookup verändert keinen Lernzustand. Coach-Handler,
vorbereitete Nachrichten, Session-, Identitäts-, Lernstands- und
Personalisierungssemantik, OpenAI-Paket, MCP/OAuth, Tools, Schemas,
MCP-Apps-UI, Reviewfälle, Portalwerte, Fixtures und Reviewartefakte bleiben
unverändert und eingefroren.

Der exakt freigegebene Dateiumfang besteht aus:

- `app/src/views/LearnerView.tsx` und dem neuen isolierten
  `app/src/components/LearnerGoalFeedbackAction.tsx`;
- `app/src/utils/goalBookFeedback.ts`, `app/src/views/GoalBookView.tsx` sowie in
  `app/package.json` ausschließlich `test:learner-goal-feedback-ui` und dessen
  Aufnahme in `test:goal-feedback`; die bereits separat beauftragte lokale
  `test:teacher-supervision`-Zeile gehört ausdrücklich nicht zu dieser
  Ausnahme;
- `app/vite.config.ts` und der neue Package-Consumer-Ersatz
  `app/src/packageConsumer/learnerGoalFeedbackUnavailable.tsx`, der die
  Repository-Aktion bereits beim Build vollständig entfernt;
- `backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicController.java`,
  `GoalFeedbackPublicProtectionFilter.java` und
  `GoalFeedbackPublicationRegistry.java` im selben Verzeichnis;
- `app/src/utils/goalBookFeedback.test.ts`,
  `app/scripts/testLearnerGoalFeedbackUi.ts`, die beiden zugehörigen
  `learnerGoalFeedbackUi`-Fixtures sowie
  `GoalFeedbackPublicControllerTest.java`, `GoalFeedbackBoundaryFilterTest.java`
  und `GoalFeedbackPublicVisualizationIntegrationTest.java` im vorhandenen
  Backend-Testpaket;
- ausschließlich die zur erneuten Hashbindung notwendigen Änderungen an diesem
  Freeze-Dokument, `contracts/openai/skillpilot-coach-v1/review-freeze.json` und
  `scripts/check_openai_plugin_review_freeze.mjs`.

Die aktualisierte geschützte Cockpit-Datei ist als fortlaufende Ausnahme
verankert:

- `app/src/views/LearnerView.tsx`:
  `d579e459e6450cc6891971bab3a65621a3409a0c5d16ae9c22ce67b24956e0e6`
  →
  `f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258`.

Die unmittelbar wirksamen Implementierungsdateien sind ebenfalls
hashgebunden:

- `app/src/components/LearnerGoalFeedbackAction.tsx` (neu):
  `b128ce146a555100f407996d24abbaaaafb76428bcd04377435551dbd75b9e15`
  → `8ee652562c7433c71d545a5205dfd14adaa9bc777fec9e48e6886819012f9832`;
- `app/src/utils/goalBookFeedback.ts`:
  `10a461427a5b77aa7e0605d0a7dd803b0c9d301676d1fb70d189370bb65d9890`
  → `94c9ffc088c85a6925391dd8e96f0134a78ec36ef4da30cee88ae34183e1eee7`;
- `app/src/views/GoalBookView.tsx`:
  `8682601cb2a443edae698c00f04a9df5b363a706970c580b0ca5c7c362c38c1e`
  → `e3ead51b2eca0e1b6674b60873f0f01536ce9e878bf7a15b82ecd3d701f4fa4e`;
- `app/vite.config.ts`:
  `87f095cf696cdb2c468257b837b3af61ec5c3c297c21d4e014f884f7903f84cd`
  → `9c2f36efbd6755554b2ae2aeb5db0ec076e9a28cf3152b96e61ab99fc16735c7`;
- `app/src/packageConsumer/learnerGoalFeedbackUnavailable.tsx` (neu):
  `baacb7c10a30ad3d5f01d0ac1d4d8d2185ab7c73ca22d6bb0dce2a36b4fc32da`;
- `backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicController.java`:
  `8ffe70fc8688fa7cd42e20053ee6f7ce95a711191d43e0a3026a0947be22e961`
  → `9f8dee900851026f67accb94507b22574b6c147b8f878f65ddc82a7211ebf18e`;
- `backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicProtectionFilter.java`:
  `b76a1c55cd9790e2e7cdbb0dcc8c1772e9206cee2317ae708e65865293316587`
  → `86f6fe8874904af51b53a389cb5c833ed01f37d079fed20b03e5786c1dd2bcac`;
- `backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicationRegistry.java`:
  `39270e4997fc06444ed7a716ca3cc82290579d7723c05e6816cd5cb3fab485da`
  → `2f5b6a124a6b4600b8e2876d09b898ed93a65a159f5bc0d881f17f3a94e01b11`.

Die fokussierte Browserregression ist mit folgendem SHA-256 gebunden:

- `app/scripts/testLearnerGoalFeedbackUi.ts`:
  `c0ddf7aaa3c36dd66c8f7993f2431c388fc1cf3fd2f005056e98bb6a8ef35ed5`
  → `7f3226c358320b32d3fe4d13f2b23479b70c2473e7dd6a838859604d68a08148`;
- `app/scripts/fixtures/learnerGoalFeedbackUi.html`:
  `e7a99fcb3f0266a428682abaa2c6ddfa4443a0a20c57672a4055d56a99674f9d`;
- `app/scripts/fixtures/learnerGoalFeedbackUi.tsx`:
  `0332fad29d6eddc285943e0c3ed79de74c9c3b1ea69103433023d43bc5f11f3b`
  → `876237cc4c1ce8c4c23ffe13e38a10c434558d0774dd8f0646ca0f7b37ed11f7`.

### 6.19 Eng begrenzte Ausnahme: Rückkehr des Cockpit-Feedbacks ins Cockpit

Der Product Owner hat am **31. August 2026** entschieden, dass ein aus dem
Lernenden-Cockpit begonnenes Lernziel-Feedback nach der Prüfung oder Einreichung
zum selben Lernziel im Cockpit zurückführen muss und nicht ins Lernzielbuch.
Feedbacklinks aus dem Lernzielbuch, aus einem PDF oder aus einem direkten
Aufruf behalten ihren bisherigen Rücksprung zum exakt gebundenen Lernziel im
Lernzielbuch.

Freigegeben ist ausschließlich:

- beim bewussten Cockpit-Einstieg neben dem unveränderten siebenfach gebundenen
  Feedbacklink einen festen browserlokalen React-Router-Herkunftsmarker zu
  setzen;
- genau den einen erwarteten Marker ohne weitere Felder anzuerkennen und daraus
  den Rücksprung zum gebundenen `goalId` im durch die statische
  Buchpublikations-Registry bestimmten Curriculum abzuleiten;
- die lokalisierte Rücksprungbeschriftung als **Zurück zum Cockpit** bzw.
  **Back to the cockpit** anzuzeigen;
- den Rücksprung auch nach einem Hard Reload und nach erfolgreicher Einreichung
  anzubieten, ohne automatisch zu navigieren und dadurch die Feedback-ID zu
  verdecken;
- die fokussierten Unit- und Browserregressionen für Herkunftsprüfung,
  Reload-Persistenz, exaktes Rücksprungziel und unveränderte Übertragungsgrenzen
  zu ergänzen.

Nicht freigegeben sind frei übergebbare Rücksprung-URLs, zusätzliche
Queryparameter oder ein aus dem Feedbackrequest übernommenes Curriculum. Die
Feedback-URL, ihr siebenfach gebundener `/context`-Aufruf und das
Einreichungsformat bleiben byte- und semantikgleich; der Herkunftsmarker wird
weder an den Server noch mit dem Feedback übertragen. Unbekannte Parameter wie
`source`, `returnTo` oder `returnUrl` bleiben ungültig. Es gibt keine Änderung
an Backend, Lernzustand, Coach-Handlern, vorbereiteten Nachrichten, Session-,
Identitäts- oder Personalisierungssemantik, OpenAI-Paket, MCP/OAuth, Tools,
Schemas, MCP-Apps-UI, Reviewfällen, Portalwerten, OpenAI-Review-Fixtures oder
Reviewartefakten.

Die geschützte Cockpit-Datei bleibt in der fortlaufenden Ausnahme bytegleich:

- `app/src/views/LearnerView.tsx`:
  `f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258`
  → `f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258`.

Der exakt freigegebene Dateiumfang ist hashgebunden:

- `app/src/components/LearnerGoalFeedbackAction.tsx`:
  `b128ce146a555100f407996d24abbaaaafb76428bcd04377435551dbd75b9e15`
  → `8ee652562c7433c71d545a5205dfd14adaa9bc777fec9e48e6886819012f9832`;
- `app/src/utils/goalFeedbackReturnNavigation.ts` (neu):
  `b4dc8797b1100c0b52f33875ce9f459ab2ac4e1c767dce0879de1e77741f7a7c`;
- `app/src/views/GoalBookFeedbackPilotView.tsx`:
  `946ecd1ebce142f766081a484ce5b0baaaa67ff5030208b82d2bba5a1a45cc12`
  → `78444751bb17278f53dad1022a05facd8546d9ca61fa7fe2faafd73e62e05d1c`;
- `app/src/utils/goalBookFeedback.test.ts`:
  `bf9d80b60edbb27402b0ca992de94c1cfb177a57f0fc0a4598396b58db5bcc0c`
  → `76a3e589539fe12c87a2847b86145bbc70e2f6788696edc0b9730081526b2985`;
- `app/scripts/fixtures/learnerGoalFeedbackUi.tsx`:
  `0332fad29d6eddc285943e0c3ed79de74c9c3b1ea69103433023d43bc5f11f3b`
  → `876237cc4c1ce8c4c23ffe13e38a10c434558d0774dd8f0646ca0f7b37ed11f7`;
- `app/scripts/testLearnerGoalFeedbackUi.ts`:
  `c0ddf7aaa3c36dd66c8f7993f2431c388fc1cf3fd2f005056e98bb6a8ef35ed5`
  → `7f3226c358320b32d3fe4d13f2b23479b70c2473e7dd6a838859604d68a08148`;
- `app/scripts/testGoalBookFeedbackUi.ts`:
  `2b0f5b58960a552de1fec27be029703ea36e67c7760e9fd9257b44057021ffce`
  → `ab3b57db6469cef0d9f7473b90f55690ee1e048c899e8dd90348ebc40481fffc`.

Die gemeinsame URL-Erzeugung in `app/src/utils/goalBookFeedback.ts` bleibt
bytegleich auf
`94c9ffc088c85a6925391dd8e96f0134a78ec36ef4da30cee88ae34183e1eee7`.

### 6.20 Eng begrenzter CI-Abgleich ohne Vertragsänderung

Der Product Owner hat am **31. August 2026** beauftragt, die drei nach dem
Cockpit-Feedback-Commit fehlgeschlagenen CI-Jobs zu reparieren. Freigegeben ist
ausschließlich der folgende fail-closed Abgleich:

- die bereits bestehende Deaktivierung des Application Core auf der
  öffentlichen Route `/betreuung` in die zentrale `rootRoutePolicy` zu ziehen.
  Für alle Routen bleibt der Laufzeitwert identisch; zusätzlich verhindert die
  zentrale Policy, dass gespeicherter Curriculum-Zustand auf dieser
  öffentlichen Einladungsroute in die URL synchronisiert wird;
- den geprüften kanonischen Mathematik-Input-Hash der G8/G9-Composition-View-
  Policy nach dem bereits fachlich freigegebenen Wechsel der einen
  Visualisierungsreferenz von `.jpg` auf `.png` neu zu binden. Lernziele,
  `contains`, Projektionen, Platzierungen und generierte Views bleiben
  unverändert;
- die statische Freeze-Testreferenz um die bereits in den Abschnitten 6.18 und
  6.19 autorisierten Ausnahmen zu ergänzen und die erwartete letzte
  `LearnerView`-Hashkette fortzuschreiben. Keine Prüfung oder Assertion wird
  entfernt oder gelockert;
- den hermetischen Package-Consumer-Smoke auf den in Abschnitt 6.18 bereits
  autorisierten `app/vite.config.ts`-Hash neu zu binden und die dafür
  maßgebliche Readiness-Policy auf den neuen Runner-Hash fortzuschreiben. Alle
  Isolations-, Herkunfts- und Manipulationsprüfungen bleiben unverändert;
- die vorhandene Root-Route-Regression um die Core- und
  URL-Synchronisierungsgrenze für `/betreuung` zu ergänzen. Ihre bisherigen
  Assertions zur Coach-Verfügbarkeit bleiben unverändert erhalten.

Der Abgleich verändert weder das eingereichte OpenAI-Paket noch MCP/OAuth,
Tools, Schemas, MCP-Apps-UI, Coach-Handler, Session-, Identitäts- oder
Personalisierungssemantik, Reviewfälle, Portalwerte, OpenAI-Review-Fixtures
oder Reviewartefakte. Er erfordert keine Portalaktion.

Die betroffenen Dateien sind nachvollziehbar gebunden:

- `app/src/App.tsx`:
  `088291d7d3d328db75c0cba954e5f5950f6a14022e0c746a68a9f4f09b24a4aa`
  → `5fd65fad8cd18faa6289412f6bc77d04084304bcea76671141080b19f44cc776`;
- `app/src/utils/rootRoutePolicy.ts`:
  `01f30a9710bb7226ba243e94a66014d562c6e54d60cc5700ca6e9278e9480146`
  → `b6c6d996e102d53013c69f7fa92278902e3d1c361aca2e73d4c4f274b78b6f70`;
- `app/scripts/testRootRoutePolicy.ts`:
  `b9d399e5bf42a8b8ba4a48cffd7d89edeb16bde52b7d89a5e9747ee8e2d666e4`
  → `d0699da8dacafaac489017ed49ab04fb1d5e8b66f38f30b4f03c25c5d49110ad`;
- `app/scripts/config/math-duration-split-spanning-tree-policy.json`:
  `f28ccfff4e897aa3d1a63202d3c29a8bc4a70722c8f12887faf529d0953d2e19`
  → `d1142d7429fba05c0d928032e03c044751914951763897ef6cdc9939a81ed35d`;
- `scripts/check_openai_plugin_review_freeze.test.mjs`:
  `78cb10bdba7ebd4dff4b46ae61de7b6f4b97a8364ed541b14eec88da49588f41`
  → `ecc9a8e4f8d218d4ae581c9a449319dddde33f80b456842d3450f0c904930d29`;
- `scripts/run_package_consumer_smoke.py`:
  `65221f914c70d3bcff2f89751c3c10f7c05f78338420f3826d592f0f4303e33c`
  → `c6ad4a80f0cbd4bbb57789a7ffdd24b89f55c6f658d5908973edd8107f798913`;
- `contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json`:
  `c34e38f8d9b9d3697376cc46d475c3a47ef98d3936c4e8355fc6b0aa099835ee`
  → `91712c26f31fcee7c32697c51f4da1b929f61742a0fac99a93833a0b08b93d18`.

Ein Sicherheits- oder Verfügbarkeitsnotfall wird sofort gemeldet, hebt die
Sperre aber nicht automatisch auf. Rejection und Withdrawal erlauben nur den
ausdrücklich freigegebenen Remediation-Satz. Approval allein ist noch keine
Veröffentlichung und ändert die Sperre ebenfalls nicht.

Nach der tatsächlichen Portal-Veröffentlichung autorisiert der Product Owner
zuerst ausdrücklich den rein operativen Zustandswechsel vom Review-Freeze zur
dauerhaften Published-Sperre. Im selben begrenzten Arbeitsschritt wird der
reale Publish mit dem bestehenden `record-published`-Verfahren dokumentiert.
Ab dann ist `1.0.0` dauerhaft unveränderlich; jede Weiterentwicklung beginnt
als neue SemVer-Kandidatin.
