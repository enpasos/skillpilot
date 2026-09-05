# SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre

**Stand:** 31. August 2026

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

### 6.21 Eng begrenzte Ausnahme: bestehende lernende Person als Betreuungsklasse verknüpfen

Der Product Owner hat am **31. August 2026** nach der fachlichen Konzeption
ausdrücklich beauftragt, die zuvor noch nicht aktive Einzelbetreuung mit einer
bekannten bestehenden SkillPilot-ID tatsächlich umzusetzen. Freigegeben ist
ausschließlich der unabhängige First-Party-Ablauf für eine verknüpfte,
schreibgeschützte Betreuungsklasse:

- Die Lehrkraft erzeugt aus der Kursorganisation eine sieben Tage gültige,
  einmal verwendbare Einladung für die bekannte SkillPilot-ID.
- Die lernende Person muss die erwartete Anfrage mit genau dieser ID
  ausdrücklich bestätigen. Die Lehrkraft erhält anschließend eine opake
  Mitgliedschaft mit Leserechten auf alle dabei freigegebenen Fachprojektionen
  und deren Lernstände; die dauerhafte SkillPilot-ID und das rohe
  Personalisierungsdokument werden nicht an die Lehrkraftansicht ausgegeben.
- Mathematik, Physik und weitere freigegebene Fächer bleiben eine gemeinsame
  Betreuungsklasse mit umschaltbaren Fachansichten. Eine geänderte
  Personalisierung wird erst nach erneuter Prüfung und einer ausdrücklichen
  Übernahme lokal wirksam. Lernziele, Planungen, Lernstände und die
  Personalisierung können über diesen Weg nicht verändert werden.
- Offene Einladungen sind reload-sicher, ohne die permanente Lernenden-ID in
  den Browserzustand aufzunehmen. Antworten zu Lernständen werden vor der
  Anzeige fail-closed an Mitgliedschaft, Fach und Personalisierungsfingerprint
  gebunden; ein Fachwechsel löscht den vorherigen Anzeigezustand sofort.
- Der neue API-Zweig ist durch Same-Site-/JSON-Prüfung, eine 8-KiB-Grenze,
  begrenzte IP-Zähler und `no-store` geschützt. Widerruf, Kursende und
  Lernstandslöschung beenden den Zugriff sofort. Terminale Datensätze werden
  höchstens 30 zusätzliche Tage aufbewahrt und danach im nächsten täglichen
  Löschlauf entfernt.
- Der First-Party-Frontend- und Backend-Default ist aktiv. Der isolierte
  Curriculum-Package-Consumer bleibt explizit deaktiviert; sein HTTP-Smoke
  verlangt für den Teacher-Supervision-Zweig weiterhin `404`.

Nicht freigegeben sind ein Zugriff ohne Zustimmung, die Übernahme oder Kopie
der Lernenden-ID in die Klassenkarte, Schreibrechte auf Lernzustand oder
Personalisierung, eine Erweiterung der eingereichten OpenAI-Tools oder eine
Änderung von MCP/OAuth, Schemas, MCP-Apps-UI, Coach-, Session-, Identitäts-,
Review-, Portal-, Fixture- oder Reviewartefakt-Semantik. Diese Ausnahme ist
keine Deployment- oder Commit-Freigabe.

Die fortlaufende Hashkette der geschützten Backend-Konfiguration lautet:

- `backend/src/main/resources/application.yml`:
  `15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591`
  → `83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990`
  → `7377e3aa197f1156c3ca425b57ff08bde430a451ba1b5f0b27bc1359743c616f`.

Die vollständige freigegebene Quell-, Test-, Konfigurations-, CI- und
Package-Consumer-Dateimenge ist in
`contracts/openai/skillpilot-coach-v1/review-freeze.json` einzeln
hashgebunden. Zentrale Evidenz ist der reale Mathe-/Physik-Browsertest:

- `app/scripts/testTeacherSupervisionTrainerUi.ts`:
  `5b78c3ef9e337eecc2050e71a1528581f0c89439e1182576dab18b2d7a7b007c`.

Die Package-Consumer-Kette wird ohne Lockerung ihrer Isolation fortgeführt:

- `scripts/run_package_consumer_smoke.py`:
  `c6ad4a80f0cbd4bbb57789a7ffdd24b89f55c6f658d5908973edd8107f798913`
  → `4490199905bd4e87b1ed63cb7946545ffed16e26d06daad789e64b5c5c7bcffe`;
- `contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json`:
  `91712c26f31fcee7c32697c51f4da1b929f61742a0fac99a93833a0b08b93d18`
  → `ec5dfbff03ddaccd89371abddc592d9e4a9b29c913115da7a9b8f74abcdeb941`.

Die statische Freeze-Regression wurde ausschließlich um diese beiden
autorisierten Ausnahmen ergänzt:

- `scripts/check_openai_plugin_review_freeze.test.mjs`:
  `ecc9a8e4f8d218d4ae581c9a449319dddde33f80b456842d3450f0c904930d29`
  → `aba99cbfb96a6c3aeff0d96ba622aa6148d4a159d601d811fc19506f9d3e8086`.

### 6.22 Eng begrenzte Ausnahme: Datenschutzhinweis zur Betreuung

Die Aktivierung aus Abschnitt 6.21 erfordert eine zutreffende öffentliche
Datenschutzinformation. Freigegeben ist deshalb ausschließlich, den deutschen
und englischen Datenschutzhinweis auf den **31. August 2026** zu datieren, eine
eigene Sektion zur optionalen schreibgeschützten Betreuung einzufügen und die
nachfolgenden Abschnittsnummern anzupassen. Beschrieben werden die
ausdrückliche Freigabe, der begrenzte Leseumfang, die verarbeiteten
Berechtigungs- und Mitgliedschaftsdaten, der nur lokale Alias, die
Einladungsfrist, Widerruf und Kursende sowie die in Abschnitt 6.21 gebundene
Löschfrist. Alle übrigen Datenschutz- und OpenAI-Verträge bleiben unverändert.

Der geschützte Text und seine Regression sind hashgebunden:

- `app/src/utils/privacyViewCopy.ts`:
  `471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b`
  → `7bbdc2dd7f88ae7e68c17552dbe44d17b830d55d45c165b65c9b2436563f468b`;
- `app/src/utils/privacyViewCopy.test.ts`:
  `1f96b817433fa322c5f48e23f32c4b686e47af2bb63d9ba9e9d6ca245c8af295`.

### 6.23 Eng begrenzte Ausnahme: passwortgeschützter lokaler Klassenexport

Der Product Owner hat am **31. August 2026** ausdrücklich beauftragt, das noch
offene GitHub-Issue #2 selbstständig zu prüfen und, sofern weiterhin nötig,
inhaltlich zu erledigen. Der aktuelle lokale Klassenexport enthielt weiterhin
die Zuordnung von Klarnamen zu permanenten SkillPilot-IDs als unverschlüsseltes
JSON. Freigegeben ist ausschließlich die Behebung dieses First-Party-Risikos:

- Neue Exporte lokaler Klassen werden im Browser mit einer bestätigten,
  mindestens 15 Zeichen langen einmaligen Passphrase, PBKDF2-SHA-256 und
  authentifiziertem AES-256-GCM verschlüsselt. Die Passphrase wird konsistent
  Unicode-normalisiert und weder gespeichert noch protokolliert.
- Der strikt versionierte Container bindet Zweck, KDF, Cipher und Payload über
  zusätzliche authentifizierte Daten, verwendet je Export neuen Salt und IV
  und begrenzt Datei, Metadaten und entschlüsselten Inhalt.
- Alte Klartext-Klassenexporte bleiben ausschließlich als sichtbar
  gekennzeichneter Migrationsimport lesbar. Ein erkannter, aber ungültiger
  verschlüsselter Container darf niemals auf den Klartextpfad zurückfallen.
- Verknüpfte Betreuungsklassen und opake Teacher-Memberships bleiben von diesem
  vollständigen Export- und Importpfad ausgeschlossen.
- Der generische Dateiname enthält keinen Klassennamen. Die Dokumentation
  grenzt den Schutz heruntergeladener Dateien ausdrücklich von Browser-
  LocalStorage, entsperrten Geräten, Passwortverwaltung und pauschalen
  DSGVO-Zusagen ab.

Nicht freigegeben sind Änderungen am eingereichten OpenAI-Paket, MCP/OAuth,
Tools, Schemas, MCP-Apps-UI, Coach-, Session-, Identitäts-, Review-, Portal-,
Fixture- oder Reviewartefakt-Vertrag. Der bestehende ChatGPT-v1-Ablauf wird von
der lokalen Trainer-Dateifunktion weder aufgerufen noch verändert. Eine
Portalaktion ist nicht erforderlich.

Die fortlaufende Hashkette der bereits durch Abschnitt 6.21 geschützten
Traineransicht lautet:

- `app/src/views/TrainerView.tsx`:
  `1d2162e65072870f42a9edf355b1e8082e2c1349dce6b6da2c7578bcab16ec30`
  → `5bbe38b12464e4fa128f7299b2a462f791a8f286bff24b9847743877080721ee`.

Zentrale Evidenz ist der reale Browser-Roundtrip mit verschlüsseltem Download,
falschem und richtigem Passwort, Löschung, Wiederimport, Legacy-Migration und
Abbruch ohne Download:

- `app/scripts/testTrainerClassFileUi.ts`:
  `5ab65164ffdaa9f42e8de2b4bb7029fce442371fd91105486203dae02eaf488d`.

Der Freeze-Guard bewahrt den bisherigen TrainerView-Hash als Vorgänger und
prüft bei weiteren eng begrenzten First-Party-Ausnahmen nur den jeweils letzten
lückenlos verketteten Supplemental-Hash. Gleichbleibende Bytes dürfen für eine
zweite fachliche Ausnahme erneut gebunden werden; geänderte Bytes benötigen
zwingend `priorAuthorizedSha256`. Damit wird kein früherer Prüfstand
überschrieben und kein eingereichter OpenAI-Baseline-Hash umgedeutet.

### 6.24 Ablösende Ausnahme: lokale Direktansicht mit bekannter SkillPilot-ID

Der Product Owner hat am **31. August 2026** nach ausdrücklicher Abwägung eines
abgeleiteten Betreuungsschlüssels entschieden, beim gegenwärtigen
Identitätsmodell keine zusätzliche Zugriffssicherheit vorzutäuschen. Eine
dauerhafte SkillPilot-ID ist bereits das Bearer-Geheimnis und der
Vollzugriffsschlüssel des Lernendenzustands. Eine Einladung oder serverseitige
Lehrer-Schüler-Verknüpfung würde diese Befugnis nicht begrenzen, wohl aber den
Workflow verkomplizieren und zusätzliche Beziehungsdaten erzeugen.

Diese Entscheidung löst den in Abschnitt 6.21 freigegebenen Einladungs- und
Mitgliedschaftsweg vollständig ab. Abschnitt 6.21 und die dazugehörige
Datenschutzentscheidung in Abschnitt 6.22 bleiben als historische
Hashnachweise erhalten, beschreiben aber nicht mehr das aktive Produktmodell.
Freigegeben ist ausschließlich:

- aus der Kursorganisation für genau eine bekannte bestehende SkillPilot-ID
  eine browserlokale Klasse mit lokalem Alias anzulegen;
- das vollständige unterstützte Level-2-Personalisierungsbild der ausgewählten
  Fächer aus dem normalen Lernendenprofil zu übernehmen und Mathematik, Physik
  sowie weitere ausgewählte Fächer in derselben lokalen Karte umschaltbar
  darzustellen;
- beim Öffnen Profil und Mastery mit `cache: no-store` ausschließlich über die
  normalen Lernenden-Endpunkte zu aktualisieren, ohne die geplanten Lernziele
  der lernenden Person zu lesen oder zu verändern;
- die Oberfläche gegenüber Personalisierung, Fokus, lernendenseitiger Planung,
  Mastery und sonstigem Lernendenzustand funktional nur lesend zu halten. Ein
  separater lokaler Kursplan der Lehrkraft bleibt als reine Lehrerarbeitskopie
  editierbar;
- die Direkt-ID-Klasse über den bereits freigegebenen passwortverschlüsselten
  Klassenexport aus Abschnitt 6.23 zu sichern. Der Export darf Alias,
  dauerhafte SkillPilot-ID und lokale Personalisierung enthalten und bleibt
  deshalb ein Bearer-Secret-Container;
- die Funktion im First-Party-WebGUI zu aktivieren und im isolierten
  Package-Consumer sowohl bei der Anlage als auch bei Import und vorbereitetem
  Browserzustand fail-closed zu deaktivieren;
- den bisherigen Einladungs-, Zustimmungs-, Workspace-, Kurs- und
  Mitgliedschaftsweg samt `/betreuung`-Ansicht und Teacher-Supervision-API zu
  entfernen;
- die historischen Datenbanktabellen mit einer neuen vorwärtsgerichteten
  Liquibase-Migration in der Reihenfolge Mitgliedschaft → Kurs → Workspace zu
  löschen. Die historische Anlage-Migration `027` bleibt unverändert erhalten,
  damit bestehende Installationen reproduzierbar auf `028` aktualisieren
  können.

Insbesondere gibt es keine serverseitige Lehrer-Schüler-Beziehung, Einladung,
Mitgliedschaft, Zustimmung, Widerrufsaktion oder besondere Retention dieses
Workflows. „Nur lesend“ ist eine Grenze der Traineroberfläche und keine
Einschränkung der SkillPilot-ID. Wer die ID kennt, besitzt weiterhin den
normalen vollständigen Lernendenzugriff; Entfernen der lokalen Karte widerruft
die ID nicht.

**Keine alte Klassenkarte bleibt erhalten.** Beim ersten Trainer-Laden werden
alle Karten mit `linked-supervision`, `linkedSupervision` oder
`teacher-membership` aus dem lokalen Klassenbestand entfernt. Gleichzeitig
werden alte Workspace- und Pending-Credentials, ein betroffener
Active-Class-Zeiger sowie alle unter der alten Karten-ID gespeicherten lokalen
Kurspläne entfernt. Ein fehlerhafter anderer lokaler Eintrag darf diese
Bereinigung nicht zurückrollen. Die Karten werden nicht konvertiert, und alte
serververknüpfte Klassenimporte bleiben fail-closed abgewiesen. Eine gewünschte
Betreuung wird mit der bekannten dauerhaften SkillPilot-ID neu angelegt.

Die fortlaufende Hashkette der geschützten Backend-Konfiguration kehrt nach der
vollständigen Entfernung des Teacher-Supervision-Zweigs auf den zuvor bereits
autorisierten Feedback-Konfigurationsstand zurück:

- `backend/src/main/resources/application.yml`:
  `15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591`
  → `83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990`
  → `7377e3aa197f1156c3ca425b57ff08bde430a451ba1b5f0b27bc1359743c616f`
  → `83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990`.

Die zentrale Trainer-Hashkette wird ebenfalls fortgeführt:

- `app/src/views/TrainerView.tsx`:
  `5bbe38b12464e4fa128f7299b2a462f791a8f286bff24b9847743877080721ee`
  → `4350de4ced424cb364fb52379900808c46bd55051ebb95e412198277dfd00e11`.

Die maßgebliche Browserregression bindet Direktanlage, Fächerwechsel,
No-Store-Lesezugriffe, das Verbot von Lernendenwrites, die Löschung der alten
Karte einschließlich ihrer lokalen Nebendaten und den Schutz gegen eine
verspätete Wiederherstellung:

- `app/scripts/testExistingLearnerTrainerUi.ts`:
  `e1de40b61b30bbc415bb57699986506ababef6efafea05b2938d73328b1733a9`.

Die isolierte Package-Consumer-Negativregression ist separat gebunden:

- `app/scripts/testExistingLearnerDisabledUi.ts`:
  `3223a96db8c1a60e3be9389cd113330bc61a99946ca4e92ab2e4a8b57fa4ae21`.

Die unveränderte historische Anlage und der vorwärtsgerichtete Rückbau sind
zusammen mit dem echten Upgrade-Test gebunden:

- `backend/src/main/resources/db/changelog/changes/027-add-teacher-supervision.yaml`:
  `5b63be9390b6fe93f655e2ffa920b6dafdfcb31266e3394232c12fdb8d23519b`;
- `backend/src/main/resources/db/changelog/changes/028-drop-teacher-supervision.yaml`:
  `5012717fa21639108f039a8a54109703732e139fc783c0e0ffec47021f2be84f`;
- `backend/src/test/java/com/skillpilot/backend/migration/TeacherSupervisionRemovalMigrationTest.java`:
  `1f11dc621d873a02f2c6f2b7ef15a181281bd3d140e08f77692496cd3fef27b1`.

Der vollständige Quell-, Test-, Konfigurations-, CI-, Migrations- und
Dokumentationsumfang ist in `review-freeze.json` einzeln hashgebunden. Entfernte
Dateien sind dort als endgültige Tombstones geführt. Das gilt auch für die
frühere zentrale Evidenz
`app/scripts/testTeacherSupervisionTrainerUi.ts`; ihr letzter autorisierter
Hash
`5b78c3ef9e337eecc2050e71a1528581f0c89439e1182576dab18b2d7a7b007c`
bleibt in der Kette erhalten, während der Checker ihre Abwesenheit und das
Verbot einer späteren Wiedereinführung prüft.

Der eingereichte OpenAI-V1-Vertrag, sein First-Party-ChatGPT-Start,
MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Sessions, Reviewfälle, Portalwerte,
Fixtures und Reviewartefakte bleiben unverändert. Deshalb ist weder ein
Zurückziehen noch eine erneute Einreichung im OpenAI-Portal erforderlich.

### 6.25 Ablösende Klarstellung: Datenschutz der lokalen Direkt-ID-Ansicht

Der Product Owner hat am **31. August 2026** entschieden, die durch Abschnitt
6.24 überholte Datenschutzbeschreibung aus Abschnitt 6.22 vollständig durch
die tatsächliche lokale Datenverarbeitung zu ersetzen. Die historische
Hashkette bleibt erhalten; die aktive deutsche und englische Information nennt
jetzt ausdrücklich:

- lokale Speicherung von Klassenname, Alias, dauerhafter SkillPilot-ID und
  einer bereinigten Personalisierungskopie im Browser der Lehrkraft;
- direkte Profil- und Mastery-Lesezugriffe über die normalen
  Lernenden-Endpunkte ohne serverseitige Lehrerklasse, Berechtigung oder
  Mitgliedschaft;
- die funktional nur lesende Grenze gegenüber Lernendendaten sowie die davon
  getrennte editierbare lokale Lehrerplanung;
- den Vollzugriffscharakter der dauerhaften ID und die Tatsache, dass lokales
  Löschen sie weder ungültig macht noch Kopien anderswo entfernt; und
- den möglichen Inhalt eines bewusst erzeugten passwortverschlüsselten
  Klassenexports sowie die Begrenzung dieses Schutzes auf die verschlüsselte
  Datei und ihr geheim gehaltenes Passwort.

Entfallen sind Aussagen über Einladungsfrist, Zustimmung, Mitgliedschaft,
Widerruf, Kursende und eine besondere 30-tägige Retention, weil keine solchen
Serverdatensätze mehr erzeugt werden.

Der geschützte Text setzt seine eingereichte Baseline und die historische
Zwischenfreigabe lückenlos fort:

- `app/src/utils/privacyViewCopy.ts`:
  `471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b`
  → `7bbdc2dd7f88ae7e68c17552dbe44d17b830d55d45c165b65c9b2436563f468b`
  → `4ab1f49f2339b8e2ef3e758e4fb3bedf33e37ae8ca792382c1c79dbc2ae0bab0`;
- `app/src/utils/privacyViewCopy.test.ts`:
  `1f96b817433fa322c5f48e23f32c4b686e47af2bb63d9ba9e9d6ca245c8af295`
  → `ce06b90403e5b4501908044e9ca6f0954c2176f0cd9478e8ee976a597971b47f`.

Die Klarstellung ändert keine andere Rechtszusage und keinen eingereichten
OpenAI-Vertrag oder Reviewablauf. Eine Portalaktion ist nicht erforderlich.

### 6.26 Eng begrenzte Ausnahme: atomare Restziele als lokale Planbasis

Der Product Owner hat am **1. September 2026** die Korrektur der lokalen
Kursplanung für eine Direkt-ID-Klasse beauftragt. Als Planumfang gilt nicht ein
ungefilterter Landschaftsbaum und auch nicht der bereits beherrschte Anteil,
sondern exakt der aktuelle Cockpit-Fokus der lernenden Person: gezählt werden
nur projizierte atomare `target`-Ziele; verplant wird daraus nur die beim
erstmaligen Erfassen noch offene Teilmenge. Ein Cockpit-Stand von 259 atomaren
Zielen mit 206 beherrschten Zielen ergibt deshalb eine Planbasis von 53 offenen
Zielen.

Freigegeben ist ausschließlich:

- ein `cache: no-store`-Leseendpunkt unter der gewöhnlichen
  SkillPilot-ID-Zugriffsgrenze, der für die angeforderte Landschaft den
  effektiven Level-3-Fokus, dieselbe Zielprojektion, Atomdefinition,
  Mastery-Aufbereitung und Schwelle wie das Cockpit verwendet;
- die einmalige Speicherung von Fokus-IDs, atomaren Umfangs-IDs, offenen
  atomaren Ziel-IDs, Summen und Erfassungszeitpunkt in der browserlokalen
  Lehrerplanung. Diese Planbasis bleibt über Bearbeiten und Rückgängig
  unveränderlich;
- die Begrenzung aller Planblöcke auf diese offene atomare Teilmenge sowie eine
  kumulativ konsistente Ganzzahlrundung der fälligen Zielzahlen. Raten werden
  höchstens mit einer Nachkommastelle angezeigt;
- eine echte Planrevision bei der Migration alter Direkt-ID-Pläne ohne
  Planbasis. Dadurch werden frühere Unterrichtsbestätigungen nicht fälschlich
  auf den neu bestimmten Umfang übertragen;
- das Weglassen der lernendenabgeleiteten Planbasis aus einem Kursplanexport.
  Freitext der Lehrkraft wird dagegen unverändert exportiert; Oberfläche,
  Exporthinweis und Datenschutzhinweis benennen diese Grenze ausdrücklich.

Der Endpunkt erzeugt keine Lehrer-Schüler-Beziehung, schreibt weder
Personalisierung noch Fokus, Planung oder Mastery der lernenden Person und
ändert den in Abschnitt 6.24 festgelegten Bearer-Secret-Charakter der
SkillPilot-ID nicht.

Die bestehenden Hashketten werden wie folgt fortgeführt:

- `app/src/utils/privacyViewCopy.ts`:
  `471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b`
  → `7bbdc2dd7f88ae7e68c17552dbe44d17b830d55d45c165b65c9b2436563f468b`
  → `4ab1f49f2339b8e2ef3e758e4fb3bedf33e37ae8ca792382c1c79dbc2ae0bab0`
  → `f8f847135a35a483d84a3d191e2b8e24e63a7f3cf47f8e42ba4a361a3a9bf435`;
- `app/src/utils/privacyViewCopy.test.ts`:
  `ce06b90403e5b4501908044e9ca6f0954c2176f0cd9478e8ee976a597971b47f`
  → `07119f62c03bd32bb8f19cf8a61b1d6b097ac8a56e60969b4f22bb1baf304877`;
- `app/src/views/TrainerView.tsx`:
  `4350de4ced424cb364fb52379900808c46bd55051ebb95e412198277dfd00e11`
  → `2508e4353a4f4d0e354e8bba6184f15101b402e24d20d85bb226ebcaecc6259b`;
- `app/scripts/testExistingLearnerTrainerUi.ts`:
  `e1de40b61b30bbc415bb57699986506ababef6efafea05b2938d73328b1733a9`
  → `5ffeac2acbe876435cce35c6999a99e4144f238b0d9edf1f9750871ec6d8daac`.

Der vollständige Quell-, Test-, CI- und Dokumentationsumfang ist in
`review-freeze.json` einzeln hashgebunden. Der eingereichte OpenAI-V1-Vertrag,
sein First-Party-ChatGPT-Start, MCP/OAuth, Tools, Schemas, MCP-Apps-UI,
Coach-, Session- und Identitätssemantik, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unverändert. Eine Portalaktion ist deshalb nicht
erforderlich.

### 6.27 Eng begrenzte Korrektur: vollständiger personalisierter Planungsraum

Der Product Owner hat am **1. September 2026** die Planungsgrenze aus Abschnitt
6.26 ausdrücklich korrigiert: Planbar ist der vollständige personalisierte
Fachumfang (Level 2). Der veränderliche Cockpit-Fokus (Level 3) darf den
Auswahlraum nicht einschränken. Ein Fokus auf Sekundarstufe I darf deshalb
personalisierte Ziele der Sekundarstufe II im Kursplan nicht ausblenden.

Diese Freigabe ersetzt ausschließlich die in Abschnitt 6.26 beschriebene
Fokusbindung und bewahrt dessen übrige Grenzen. Freigegeben ist:

- der bestehende `cache: no-store`-Leseendpunkt liefert für die angeforderte
  Fachlandschaft alle deduplizierten, atomaren `target`-Ziele der vollständigen
  Level-2-Personalisierung und deren beim Erfassen noch offene Teilmenge;
- der Endpunkt nimmt keinen `scopeGoalId` entgegen, liest oder speichert keine
  Level-3-Fokus-IDs und bleibt unter der gewöhnlichen
  SkillPilot-ID-Zugriffsgrenze ohne Lehrer-Schüler-Beziehung oder Schreibzugriff;
- die Kursplanauswahl wird aus der reinen Personal-/Composition-Projektion vor
  jeder routen- oder fokusbezogenen Cockpit-Projektion aufgebaut;
- ein konkreter Planblock zählt nur die Atomziele unter seinem tatsächlich
  ausgewählten Ziel oder Cluster. Sein Todo ist die Schnittmenge dieses
  Blockumfangs mit der unveränderlich erfassten offenen Teilmenge. Der Nenner
  der Plananzeige ist die deduplizierte Vereinigung der tatsächlich
  verplanten Blockumfänge, nicht der gesamte personalisierte Fachumfang;
- ein Sek-I-Block mit 259 Atomzielen und 206 beim Erfassen gemeisterten Zielen
  zeigt daher weiterhin 53 offene von 259 Zielen. Zusätzliche personalisierte
  Sek-II-Ziele werden erst durch einen eigenen Sek-II-Block Teil der
  Planmetriken;
- bestehende fokusgebundene lokale Baselines bleiben lesbar, werden vor der
  nächsten Lernabschnittsplanung aber einmalig in einer echten Planrevision auf
  die neue fachweite Baseline migriert. Dadurch gelten frühere
  Unterrichtsbestätigungen nicht irrtümlich für den erweiterten Umfang. Die
  neue Baseline bleibt über Bearbeiten und Rückgängig unveränderlich.

Die bestehenden Hashketten werden dabei lückenlos fortgeführt:

- `app/src/utils/privacyViewCopy.ts`:
  `f8f847135a35a483d84a3d191e2b8e24e63a7f3cf47f8e42ba4a361a3a9bf435`
  → `1424f94d5087a368e45d064dcfde718a4f0958464a32e376f66dddee6fdeb7f4`;
- `app/scripts/testExistingLearnerTrainerUi.ts`:
  `5ffeac2acbe876435cce35c6999a99e4144f238b0d9edf1f9750871ec6d8daac`
  → `f98613ce922ead852f5a3ae0d0bd9eb2c50712f559e127ed7bf6fdbfad531a85`;
- `app/src/views/TrainerView.tsx`:
  `2508e4353a4f4d0e354e8bba6184f15101b402e24d20d85bb226ebcaecc6259b`
  → `d308f123474aa23064ec6389c16279066a95016797f4f210cb5880190c118e2b`.

Der vollständige Quell-, Test- und Dokumentationsumfang dieser Korrektur ist in
`review-freeze.json` einzeln hashgebunden.

Atomdefinition, Mastery-Schwelle, ganzzahlige Sollrundung,
Ein-Nachkommastellen-Raten, Exportgrenze und die funktional nur lesende
Lehreroberfläche bleiben gegenüber Abschnitt 6.26 unverändert. Die Korrektur
ändert keinen eingereichten OpenAI-Vertrag, First-Party-ChatGPT-Start,
MCP/OAuth-, Tool-, Schema-, MCP-Apps-UI-, Coach-, Session-, Identitäts-,
Reviewfall-, Portal-, Fixture- oder Reviewartefakt-Vertrag. Eine Portalaktion
ist nicht erforderlich.

### 6.28 Eng begrenzte Korrektur: Composition-Ziele im Kursplan erhalten

Die in Abschnitt 6.27 freigegebene vollständige Level-2-Planung wurde am
**1. September 2026** innerhalb desselben Product-Owner-Auftrags korrigiert.
Eine ausschließlich für die Cockpit-Darstellung bestimmte Phasen-Normalisierung
hatte in der zusammengeführten hessischen G9-GK+LK-Komposition 15 gültige
atomare LK-/Q4-Ziele aus dem Kursplanindex entfernt. Die unveränderte strenge
Baseline-Prüfung erkannte diese Abweichung anschließend fail-closed und verwarf
den gesamten Planblock.

Freigegeben ist ausschließlich:

- der Kursplan baut seinen auswählbaren Level-2-Baum direkt aus der
  backend-autoritativ projizierten Personal-Curriculum-Komposition auf;
- der normale Cockpitbaum behält seine bisherige
  Darstellungsnormalisierung;
- die strenge `CP-BASELINE-GOAL`-Prüfung bleibt unverändert und verwirft
  weiterhin jeden Plan, dessen Baseline-Ziel im Planungsindex fehlt;
- ein Browser-Regressionsfall bildet die zusammengeführte G9-GK+LK-Struktur
  mit einem Q4-LK-Atom unter einem E-markierten kanonischen Zweig nach und
  prüft Auswahl, 4-von-4-Umfang und tatsächliches Speichern des synthetischen
  Sek-II-Planblocks;
- ein H2-Service-Regressionsfall belegt, dass die 15 bekannten
  Composition-Targets in der autoritativen Fachbaseline enthalten bleiben.

Die bestehenden Hashketten werden lückenlos fortgeführt:

- `app/scripts/testTrainerCoursePlanUi.ts`:
  `5a4bdb263c6297a2bdd4add9d958b817484de2b06f35882167db65d9efd0a5cd`
  → `5f0e079f5debb1a17b6e621d0a333b0462a6c562af7fa51ec99dc0a3e89b9320`;
- `app/src/views/TrainerView.tsx`:
  `d308f123474aa23064ec6389c16279066a95016797f4f210cb5880190c118e2b`
  → `17cda4583d728d546513c875edb8cf95a0cffdff69893c436eb8e5ec9fa9682c`;
- `backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java`:
  `333f0d3dcdea429a8039b0f5597c52c06eb31f6f7c751250ccf2cfdee77769e7`
  → `f018453aaff183a29f47f1233c42e860771a1043cc9bc33bab158ec378920db6`.

Die Korrektur ist auf die aktuelle First-Party-WebGUI-Kursplanung begrenzt.
Fokusunabhängigkeit, atomare Zählung, `no-store`-Lesesnapshot,
Direct-ID-Bearer-Grenze und das Modell ohne serverseitige
Lehrer-Schüler-Beziehung bleiben unverändert. Der eingereichte OpenAI-V1-Vertrag,
First-Party-ChatGPT-Start, MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Coach-,
Session- und Identitätssemantik, Reviewfälle, Portalwerte, Fixtures und
Reviewartefakte bleiben unberührt. Eine Portalaktion ist nicht erforderlich.

### 6.29 Eng begrenzte Korrektur: sichtbares Bearbeitungsformular im Kursplan

Der Product Owner hat am **1. September 2026** mit dem Hinweis „der Bearbeiten
Knopf ist tot“ die Korrektur der vorhandenen Bearbeitungsaktion in der lokalen
First-Party-Kursplanung beauftragt. Der Klick-Handler öffnete und befüllte das
Formular bereits korrekt, fügte es aber weit oberhalb des sichtbaren
Lernabschnitts in den eigenen Scrollbereich ein. Browser-Scroll-Anchoring hielt
die angeklickte Karte im Bild, sodass das geöffnete Formular unsichtbar blieb.

Freigegeben ist ausschließlich:

- das bereits vorhandene Formular beim Anlegen oder Bearbeiten in den
  sichtbaren Kursplanbereich zu scrollen und den Tastaturfokus auf seine
  Überschrift zu setzen;
- Lernziel, Titel und Datumswerte weiterhin unverändert aus dem gewählten
  Planabschnitt zu übernehmen;
- einen Browser-Regressionsfall zu ergänzen, der aus einer heruntergescrollten
  Lernabschnittskarte **Bearbeiten** aufruft, Sichtbarkeit, Fokus und die
  vorausgefüllten Werte prüft und anschließend ohne Mutation abbricht.

Unverändert bleiben Speicherung, lernendenabgeleitete Planbasis, Abdeckung,
Rückgängig, Export, Berechnungssemantik, Direct-ID-Grenze und alle übrigen
Trainerabläufe. Der eingereichte OpenAI-V1-Vertrag, First-Party-ChatGPT-Start,
MCP/OAuth, Tools, Schemas, MCP-Apps-UI, Coach-, Session- und
Identitätssemantik, Reviewfälle, Portalwerte, Fixtures und Reviewartefakte
bleiben unberührt. Eine Portalaktion ist nicht erforderlich.

Die beiden betroffenen Dateien setzen ihre bestehenden Hashketten fort:

- `app/src/components/CoursePlanPilotView.tsx`:
  `42e09e55e1dce8bff7f5a7093763cb6e9fe84950f171b15557212c4d24ba5ba1`
  → `c2ab3b62b60836ebbd39caa63779a0c7aaebc25934074e0e1d6e23961356f424`;
- `app/scripts/testTrainerCoursePlanUi.ts`:
  `5f0e079f5debb1a17b6e621d0a333b0462a6c562af7fa51ec99dc0a3e89b9320`
  → `e04c477cfb6121f8daa540a8ac862258a08c2861b30d2122672d22eeb4fca025`.

### 6.30 Eng begrenzte Korrektur: kanonische Atomarität in der Kursplanung

Der Product Owner hat am **1. September 2026** die Korrektur des gemeldeten
Physik-Planungsfehlers ausdrücklich mit der zusätzlichen Vorgabe beauftragt,
dass die Lösung fachübergreifend gelten muss. Die reale Ursache lag nicht in
fehlenden Physikzielen: Direkte `goalEntry`-Referenzen können kanonische
Cluster für die Lernendendarstellung als opake Blätter projizieren. Der
Backend-Projektionspfad kennzeichnet diese Präsentationskopien temporär als
atomar. Der Planungssnapshot hatte deshalb sieben Physik-Übungs- und
Abiturcluster als Atome gezählt, obwohl ihre unveränderten strukturellen
Definitionen Cluster bleiben. Die strenge Browserprüfung verwarf daraufhin
auch einen gültigen Sek-I-Abschnitt mit 118 echten Atomzielen.

Freigegeben ist ausschließlich:

- der read-only Planungssnapshot bestimmt die Atomarität jedes
  personalisierten `target`-Ziels aus seiner unveränderten strukturellen
  Definition und niemals aus einer darstellungsbedingt opaken
  Projektionskopie;
- direkte opake Composition-`goalEntry`-Cluster bleiben Nicht-Atome und
  gelangen nicht in `scopeAtomicGoalIds` oder `openAtomicGoalIds`;
- der Kursplanauflöser überspringt exakt solche opaken Nicht-Atom-Cluster als
  null zählende Präsentationsgeschwister, damit ihre echten atomaren
  Geschwister in einem übergeordneten Planabschnitt planbar bleiben;
- gewöhnliche leere Cluster, fehlende Ziele, Zyklen und Baseline-Abweichungen
  bleiben unverändert fail-closed;
- fachneutrale Utility-Regressionen prüfen diese Abgrenzung, und ein realer
  H2-Servicefall prüft das kanonische Atom-Invariant für Mathematik und Physik
  sowie die zusammengeführte hessische GK+LK-Physikprojektion, ohne eine feste
  fachliche Gesamtzahl als Vertragswert einzufrieren.

Die korrigierte hessische Physik-Planbasis enthält damit für GK, LK und GK+LK
nur noch 393, 460 beziehungsweise 462 kanonische Atome statt 399, 466
beziehungsweise 469 Zielen einschließlich der fälschlich gezählten Cluster.
Diese Zahlen sind Regressionsevidenz des aktuellen Layer-A-Stands, kein
eingefrorener Curriculumvertrag.

Die bestehenden Hashketten werden lückenlos fortgeführt:

- `app/src/utils/localTeacherCoursePlan.test.ts`:
  `3436f6ea0174e7e2a2ce29467761050e706b1bc5641be92acadb74c988debafc`
  → `ff52502a72612c8f696a064b6caa64ea1b85ef9416fa07a0a21b6d55bdaef0e7`;
- `app/src/utils/localTeacherCoursePlan.ts`:
  `90427e7b2961d395e0ca40fb5b4f24fdc3ed13d60b25c66b3a8b7ff00a97adaf`
  → `fac1c4031f182ea7cbf35c7bbefe1e8d615a855a7f643e5eec25afbefc03f800`;
- `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`:
  `b94b78fbec5e75a715c91cfbc3f1feeec7475119165761777b6c64646e05f6ac`
  → `f0efaa113759834f84bb5ce04e758f2574d42608ed288290dde25f51c0f99afc`;
- `backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java`:
  `f018453aaff183a29f47f1233c42e860771a1043cc9bc33bab158ec378920db6`
  → `0d9ba6dca1a5d7a50f2ac1d87d8e799a327af98dfe08d01c49194c5a968965b7`.

Fokusunabhängigkeit, unveränderlicher `no-store`-Level-2-Snapshot,
Direct-ID-Bearer-Grenze, das Modell ohne serverseitige
Lehrer-Schüler-Beziehung und die übrige Kursplansemantik bleiben unverändert.
Der eingereichte OpenAI-V1-Vertrag, First-Party-ChatGPT-Start, MCP/OAuth,
Tools, Schemas, MCP-Apps-UI, Coach-, Session- und Identitätssemantik,
Reviewfälle, Portalwerte, Fixtures und Reviewartefakte bleiben unberührt. Eine
Portalaktion ist nicht erforderlich.

### 6.31 Eng begrenzte Ausnahme: persönliche Fachzeitpläne und Planmodus

Der Product Owner hat am **1. September 2026** den lernendenseitigen Gegenpart
zur lokalen Lehrkraftplanung sowie dessen selbstbestimmte Nutzung im Cockpit
ausdrücklich freigegeben. Diese Ausnahme gilt ausschließlich für die aktuelle
First-Party-WebGUI und den gemeinsam genutzten kanonischen Lernendenzustand:

- Unter der dauerhaften SkillPilot-ID kann pro personalisierter Fachlandschaft
  höchstens ein revisionsgebundener persönlicher Fachzeitplan liegen. Er folgt
  Export, Rückwärtsimport, Aufbewahrung und Löschung des Lernendendatums.
- **Im Cockpit bereitstellen** kopiert erst nach Bestätigung einen lokalen
  Lehrkraftplan. Der Server bindet den Schreibvorgang fail-closed an Lernenden-
  und Fachkontext, erwartete Revision, aktuelle Personalisierung und
  Graph-Fingerprint. Neu hinzukommende Ziel-IDs müssen offen sein; bereits im
  persönlichen Plan enthaltene IDs dürfen beim bestätigten Ersetzen zur
  Plankontinuität erhalten bleiben. Es entsteht weder eine serverseitige
  Lehrer-/Klassenbeziehung noch eine automatische Synchronisierung.
- Das Cockpit liest die Planlage mit `no-store`, zeigt je Fach den kumulativen
  Stand bis heute und startet das erste Planziel nur durch eine bewusste Aktion.
  Kalenderfortschritt allein schreibt niemals Fokus, aktives Ziel oder Mastery.
- **Nach Plan lernen** ist standardmäßig `false`, ausschließlich in der
  First-Party-WebGUI schaltbar und jederzeit widerrufbar. Solange der Modus
  aktiv ist, bleibt der allgemeine sequenzielle Autopilot auch ohne nutzbaren
  Plan unterdrückt.
- Ein automatischer Handoff nach bestätigtem Abschluss ist nur zulässig, wenn
  das abgeschlossene Ziel zu mindestens einem aktuell gültigen gespeicherten
  Plan gehört. Genau ein fälliger, nach `requires` zulässiger Kandidat aus
  einem Plan mit diesem Abschlussanker hat Vorrang. Nur wenn kein solcher
  Ankerkandidat existiert, darf genau ein Kandidat über alle gültigen Pläne
  hinweg folgen. Mehrere Anker- oder Nicht-Ankerkandidaten, ausschließlich
  veraltete oder ungültige Pläne, kein Plan sowie fehlende oder blockierte
  fällige Ziele scheitern fail-closed: Der bestehende Fokus bleibt und es wird
  kein neues aktives Ziel gewählt; das abgeschlossene Ziel darf regulär aus dem
  aktiven Zustand entfernt werden. Teil-Mastery behält das laufende Ziel.
- Moduswechsel und erfolgreiche Übergaben verwenden die bestehende
  `coachStateRevision`-Invalidierung. Der Plan selbst wird dem OpenAI-V1-Coach
  weder als Feld noch als neue Fähigkeit zugänglich gemacht.

Die Ausnahme hat bewusst eine eng begrenzte beobachtbare Wirkung auf den
eingereichten V1-Zustandspfad: Hat eine lernende Person den Modus zuvor in der
First-Party-WebGUI aktiviert, kann der unveränderte V1-Zustands- oder
Abschlussresponse einen anderen bereits existierenden kanonischen Fokus oder
`activeGoal` zurückgeben; ebenso bleibt die generische Autopilot-Auswahl dann
unterdrückt. Das ist keine neue V1-Fähigkeit und darf nicht als „ohne
Zustandswirkung“ beschrieben werden. Der V1-Coach kann den Modus weder
aktivieren noch Pläne anlegen, importieren, ersetzen oder anzeigen.

Unverändert bleiben OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen,
Instruktionen, Ressourcen, MCP-Apps-UI, Prepared Message,
First-Party-ChatGPT-Start, Identität, Locale und Session-Lifecycle. Die
eingereichte Review-Fixture bleibt ohne Plan und mit `followLearningPlans=false`;
Reviewfälle, Portalwerte, Reviewer-Zugangsdaten, Demo und Reviewartefakte ändern
sich nicht. Deshalb ist keine Portalaktion erforderlich. Sollte der Planmodus
später über den Coach angeboten oder die Review-Fixture darauf umgestellt
werden, wäre diese Bewertung neu vorzunehmen.

Die geschützte Laufzeitdatei setzt ihre Kette fort:

- `app/src/views/LearnerView.tsx`:
  `f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258`
  → `dfc7fd5f131af9a556f25b87ad57b7a3d20809ede2275b8007ebb299152ca82b`.

Der zentrale Cockpit-Regressionsfall
`app/scripts/testLearnerPlanCockpitUi.ts` ist mit
`95223838f0b322020432149eced7328a5bcc9fdf68df90cd5893bab2d4d87251`
gebunden. Alle weiteren 50 Quell-, Migrations-, Test-, Workflow- und
Dokumentationsdateien einschließlich ihrer lückenlosen Vorhashketten sind in
`review-freeze.json` einzeln festgeschrieben.

### 6.32 Eng begrenzte Ausnahme: Datenschutzhinweis zum persönlichen Plan

Der Product Owner hat am **1. September 2026** außerdem die notwendige
wahrheitsgemäße Ergänzung des deutschen und englischen
First-Party-Datenschutzhinweises freigegeben. Er nennt nun den persönlichen
Fachzeitplan und `followLearningPlans` als unter der SkillPilot-ID gespeicherte
Daten, die bestätigte Direct-ID-Kopie aus dem lokalen Lehrkraftplan, die
Open-only-/Kontinuitätsregel beim Ersetzen, die unveränderte Vollzugriffsgrenze
der dauerhaften ID sowie die oben beschriebene lernendenseitige Autorisierung,
Ankerpriorität, Fail-closed-Auswahl und Autopilot-Unterdrückung.

Diese zweite Ausnahme ändert ausschließlich die bereits verlinkte
First-Party-Datenschutzansicht, ihren Copy-Test und die übereinstimmende
Sicherheitsdokumentation. Sie ändert keine Runtime, URL, Portalmetadaten,
OpenAI-Schnittstelle, Review-Fixture oder Reviewartefakte; eine Portalaktion ist
nicht erforderlich.

Die Hashketten lauten:

- `app/src/utils/privacyViewCopy.ts`:
  `1424f94d5087a368e45d064dcfde718a4f0958464a32e376f66dddee6fdeb7f4`
  → `84f888394310125ff1bdde6b0c7c35b881091eb3c22f50e6abb0cfe5534f6efc`;
- `app/src/utils/privacyViewCopy.test.ts`:
  `a34ce448d4d43d0aa91e6380e6905e375f6ed986e5db27942577f90e82a42a27`
  → `2940f594232022f90c3d562290c2fcbddf6bb85eda454d140e5d5c7d34f5388e`;
- `docs/security/data-privacy.md`:
  `58e57689fc6a2329a53e1664df1de18971bf5a6498605723f0edca0d28683803`
  → `179f3acac510a36bffc7eb1c206df715f7cf714550f8f5d920f61c17b249aa08`.

### 6.33 Eng begrenzte Ausnahme: Curriculumwahl pro lokalem Kurs

Der Product Owner hat am **1. September 2026** ausdrücklich freigegeben, die
bislang vorgelagerte globale Curriculum- und Qualitätsfilterwahl aus dem
Trainer-Einstieg zu entfernen und vollständig in den jeweiligen lokal
gespeicherten Kurs zu verlagern. `SessionSetup` öffnet nach der Rollenwahl
direkt die Kursorganisation; auch ein direkter Aufruf von `/trainer` entfernt
den nicht mehr verwendeten Browser-Key `skillpilot_trainer_landscape`.

Jede `ClassSession` wählt und speichert nun ihr eigenes Root-Curriculum, Fach
und die anwendbare Filterkonfiguration. Closure und Anzeigenamen werden pro
Kurs-Root geladen. Ein bestehender Lernender wird nur lokal übernommen, wenn
sein persönliches Curriculum genau einem Root zugeordnet werden kann; fehlende,
widersprüchliche oder gemischte Roots brechen vor dem Speichern fail-closed ab.
Abgebrochene oder überholte Profil-, Root-Closure- und ID-Erzeugungsanfragen
werden verworfen, damit kein später lokaler Save mehr ausgelöst wird.

Die lokale Kursliste bleibt auch bei einem nicht verfügbaren Runtime-Katalog
oder einer fehlerhaften Curriculumübersicht erreichbar. Scheitert erst die
Closure eines geöffneten Kurses, erhält die Lehrkraft eine verständliche,
wiederholbare Fehlermeldung und kann ohne Änderung der gespeicherten Kursdaten
zur Kursliste zurückkehren.

Die Ausnahme wirkt ausschließlich auf die First-Party-Trainerorganisation.
Lernenden- und Explorer-Auswahl, browserlokale Kursinhaberschaft und die
Abwesenheit einer serverseitigen Lehrkraft-Klasse-Beziehung bleiben
unverändert. Ebenso unverändert bleiben der eingereichte ChatGPT-Starthandler,
Prepared Message und Session-Semantik sowie sämtliche OpenAI-Package-,
MCP/OAuth-, Tool-, Schema-, Annotations-, Instruktions-, Ressourcen- und
MCP-Apps-UI-Bytes, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte. Deshalb ist keine Portalaktion
erforderlich.

Die geschützte Laufzeitdatei setzt ihre vollständige Kette fort:

- `app/src/components/SessionSetup.tsx`:
  `df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140`
  → `5f54736d03ec2ba4860894ecc4f13867d0b82728bad1953ef6958bfd63bccf1d`.

Der zentrale Browser-Regressionsfall
`app/scripts/testSessionSetupCompletionUi.ts` ist über
`afb66331e9bf1707195b1389d28bfe09839a9c3a130800bc207d6ed9602426fe`
→ `ba721f824f9e7ef45cca37e8261b09513e9cba486cfdb61cbe12d87fa4812713`
gebunden. Die weiteren 20 Quell-, Copy-, Fixture-, Test- und
Konzeptdateien sind in `review-freeze.json` einzeln festgeschrieben. Dabei
setzen `app/src/locales/de.ts`, `app/src/locales/en.ts` und
`app/scripts/testRootRoutePolicy.ts` ausdrücklich ihre früheren
Copy-Clarification-Hashes fort; der Checker prüft auch diesen Übergang
fail-closed statt frühere Freigaben rückwirkend zu überschreiben.

### 6.34 Eng begrenzte Ausnahme: solide Lehrer- und Schüler-Kursplanung

Der Product Owner hat am **1. September 2026** ausdrücklich beauftragt, die
bereits freigegebene Kursplanung und ihre Ansicht für Lehrkräfte und Lernende
gemeinsam solide und gut bedienbar zu machen. Diese Ausnahme härtet nur die
vorhandenen First-Party-Abläufe; sie führt weder eine serverseitige
Lehrer-Schüler-Beziehung noch eine automatische Plansynchronisierung ein.

Für die browserlokale Lehrkraftplanung ist ausschließlich freigegeben:

- jeden lokalen Plan an Klasse, Curriculum-Root, Fach und den vollständigen
  aktuellen Level-2-Kurskontext zu binden und beim Löschen einer Klasse alle
  zugehörigen Kontext- und Legacy-Planvarianten zu entfernen, ohne Pläne
  anderer Klassen anzutasten;
- die Klassenkarten tastaturbedienbar zu machen und ihre eigenständigen
  Bearbeiten-, Export- und Löschaktionen zugänglich zu beschriften;
- gespeicherte und noch nicht gespeicherte Entwürfe sichtbar zu unterscheiden;
- **Im Cockpit bereitstellen** nur für einen weiterhin vollständig
  berechenbaren Lernplan mit offenen Baseline-Atomen zuzulassen, den konkreten
  Sperrgrund zu zeigen und eine geöffnete Bestätigung bei jeder relevanten
  Planänderung zu verwerfen und beim Bestätigen erneut fail-closed zu prüfen;
- Unterrichtsabdeckung mit einem expliziten Datum bis einschließlich heute zu
  erfassen, Zukunftsdaten abzulehnen und die getrennte Attestierung weiterhin
  ausdrücklich als **Stand bis heute** zu führen; und
- Lehrkraftdaten in `Europe/Berlin` zu berechnen und bei Berliner Mitternacht
  sowie bei erneuter Sichtbarkeit der Seite zu aktualisieren.

Für den persönlichen Fachzeitplan im Lernenden-Cockpit ist ausschließlich
freigegeben:

- die heute neu fälligen, davon bereits beherrschten und heute noch offenen
  Ziele getrennt vom kumulativen Rückstand bis heute darzustellen;
- als Vorschau ausschließlich den kanonischen Titel eines tatsächlich
  fälligen und voraussetzungsseitig zulässigen nächsten Ziels anzuzeigen und
  Fachkarten nach Handlungsdringlichkeit stabil zu sortieren;
- Planmodus und den dadurch pausierten allgemeinen Autopilot in einer zentralen
  Einstellung verständlich darzustellen, ohne den gespeicherten
  Autopilot-Wert stillschweigend umzuschreiben; und
- nach einem fehlgeschlagenen Refresh sichtbare Daten als veraltet zu
  kennzeichnen und jede Fortsetzungsaktion bis zu einem erfolgreichen Reload
  fail-closed zu sperren.

Lehrkraft-Publikation und Lernenden-Read-Model verwenden nun dieselbe
kumulative Ganzzahlrundung. Lernblöcke werden deterministisch nach Beginn,
Ende, ursprünglicher Reihenfolge und ID geordnet. Die Zuordnung der offenen
Atomziele respektiert direkte und effektiv geerbte Voraussetzungen über eine
stabile topologische Sortierung; Zyklen, unvollständige Baselines und sonstige
nicht berechenbare Zustände bleiben fail-closed. Kalenderfortschritt allein
schreibt weiterhin weder Fokus noch aktives Ziel oder Mastery.

Die geschützte Lernendenansicht setzt ihre lückenlose Kette fort:

- `app/src/views/LearnerView.tsx`:
  `dfc7fd5f131af9a556f25b87ad57b7a3d20809ede2275b8007ebb299152ca82b`
  → `85c5f1bc093d6111fbfb7b51f8903dd6fb3a93a063e5c8d3a44b22538c8944d4`.

Zentrale weitere Hashketten sind:

- `app/src/views/TrainerView.tsx`:
  `9a780af40ef83610d3c5b5bddab58c8db04e0c89569b3016f8c7a2c7d579e517`
  → `67820493aae77176a5959cd35c9e73f2c5b93d565f991c77e03036f10236d9b5`;
- `app/src/components/CoursePlanPilotView.tsx`:
  `884f89bd679f53d35310ea1151c385ecb91b36f40d56cb5d427938711bc8a4ec`
  → `1fdc72ce0def7ca09cdf993b15d755aec35ed26c8dda90f75d74bd18b3e28d35`;
- `app/src/utils/localTeacherCoursePlan.ts`:
  `fac1c4031f182ea7cbf35c7bbefe1e8d615a855a7f643e5eec25afbefc03f800`
  → `24115a036ea49ed0be9f0bcb1d96ece5381f026be42ba15f9864f16994fcdc90`;
- `app/src/utils/learnerCoursePlanPublication.ts`:
  `27364171a2a4ddda1b63dfceab1a3ac96bef0cb410aa6e3098a0cb4be40681d9`
  → `1e78901e87d6894045aceac0c3961b5cb2508a877b9cfac23e2c208d68095a8a`;
- `backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java`:
  `13a5d46a5fdbe67909ddbad407ad03b516ac41c703f359de03c25599f38e2772`
  → `64b38f0c1f25b6fccdfa1409cd293839ddfacef8a616ae40bd060ec94fe04ac8`.

Die neue kontextgebundene Plan-ID-Logik und ihr fokussierter Test sind mit
`f17991db7d524169b48f4a3b8586352f65b3f7caf981907981b4eb01d4cd673a`
beziehungsweise
`4b7f70c6b880be922111181a8a631db50adf436d15c9fc0e5464f3a76e64a449`
gebunden. Die zentrale Cockpit-Browserregression setzt ihre Kette über
`95223838f0b322020432149eced7328a5bcc9fdf68df90cd5893bab2d4d87251`
→ `bf69dd9e1225051f531995f7c81a98c8b98e6cab2464c01bed536dd2066aeaf9`
fort. Alle 29 betroffenen Quell-, Copy-, Fixture-, Test- und Konzeptdateien
sind in `review-freeze.json` einzeln und mit ihren vorherigen autorisierten
Hashes gebunden.

Die dauerhafte SkillPilot-ID bleibt Bearer-Geheimnis und Vollzugriffsschlüssel.
Der Lehrkraftplan bleibt browserlokal; die Übernahme in den persönlichen Plan
bleibt eine ausdrücklich bestätigte Einwegkopie. Planmodus bleibt
standardmäßig aus und für Lernende widerrufbar. OpenAI-Package, MCP/OAuth,
Tools, Schemas, Annotationen, Instruktionen, Ressourcen, MCP-Apps-UI,
Prepared Message, ChatGPT-Start, Session-, Identitäts- und Locale-Vertrag,
Reviewfälle und -fixtures, Portalwerte, Reviewer-Zugangsdaten, Demo und
Reviewartefakte bleiben unverändert. Deshalb ist weder ein Zurückziehen noch
eine erneute Einreichung im OpenAI-Portal erforderlich.

### 6.35 Dauerhafte Wirkungsgrenze: evolvierbare öffentliche Landingpage

Der Product Owner hat am **1. September 2026** ausdrücklich freigegeben, die
Informationsarchitektur und Präsentation der öffentlichen First-Party-
Startseite fortlaufend weiterzuentwickeln. Diese Freigabe ist keine allgemeine
Freigabe des bisher in `SessionSetup` mit der Landingpage vermischten
Startvertrags. Sie führt stattdessen eine dauerhaft prüfbare Wirkungsgrenze ein.

Evolvierbar sind ausschließlich diese drei Präsentationsdateien:

- `app/src/components/PublicLandingPanels.tsx`;
- `app/src/components/PublicLandingFooter.tsx`;
- `app/src/utils/publicLandingCopy.ts`.

Sie bilden eine capability-arme Präsentationsinsel. Zulässig sind ihre
öffentliche Information, Reihenfolge, visuelle Gestaltung, responsives Layout,
semantische Navigation und lokalisierte Präsentationscopy. Die Insel erhält
nur Sprache, die weiterhin semantisch geschützte Access-Status-Aussage sowie
die drei fest gebundenen Einstiegscallbacks **Lernen**, **Kursorganisation**
und **Explorer**. Direkte Rollenrouten sind ebenso unzulässig wie ein direkter
Plugin-Einstieg.

Der Freeze-Checker prüft diese Insel unabhängig von ihren Bytes fail-closed:

- nur die ausdrücklich erlaubten Präsentationsimporte und exakt die
  freigegebenen Props dürfen vorkommen;
- Netzwerkzugriffe, Browserpersistenz, Cookies, Browserfenster und globale
  Browserfähigkeiten sind ausgeschlossen;
- direkte Provider- oder API-URLs, dynamisches Nachladen und rohe HTML-
  Injektion sind ausgeschlossen;
- Routerzustand und imperative Navigation bleiben außerhalb der Insel; nur
  deklarative öffentliche `Link`-Navigation ist zulässig;
- Coach-, Chat-Start-, Claude-, Terms-, SkillPilot-ID-, Lernendendaten-,
  Profil- und Sessionimporte sind ausgeschlossen; und
- die drei Rollenaktionen müssen aus der hashgebundenen
  `SessionSetup`-Kompositionsnaht stammen.

Die Access-Status-Wahrheit bleibt ein semantischer Vertrag, obwohl sie in der
Landing-Präsentation erscheint. Der unveränderlich gebundene Browservertrag
prüft ihre exakte deutsche und englische Aussage, den Vergleichslink, die drei
Callback-Einstiege über das gemeinsame Terms-Gate, die öffentlichen Routen,
Zugänglichkeit und die mobile wie breite Darstellung. Eine spätere reine
Landing-Änderung darf ihre Präsentation verändern, aber nicht diese Aussage
entfernen, verfälschen oder den gemeinsamen Einstieg umgehen.

`SessionSetup.tsx` bleibt als Controller und stabile Kompositionsnaht
hashgebunden. Seine Kette wird einmalig fortgeführt:

- `app/src/components/SessionSetup.tsx`:
  `5f54736d03ec2ba4860894ecc4f13867d0b82728bad1953ef6958bfd63bccf1d`
  → `d78a8e0aebae245fee604c8b8102f26cd37ffb96542267ce668f8b38a31eebc6`.

Der stabile Browservertrag ist als neue Evidenz gebunden:

- `app/scripts/testPublicLandingContractUi.tsx`:
  `904ee9e68c32c92e78782999c15f142393c09c97a0506c371911b1ce6ef99c5e`.

Bestehende Test- und CI-Ketten werden vollständig fortgesetzt:

- `.github/workflows/ci.yml`:
  `50965b7b10fab102463817766d866d2beed01e2d52737752e3d79cf73c421ae5`
  → `6324e43b893dd036c5c4449a77b3ec7a10dc81727e7d26071f2df6271c2494d5`;
- `app/package.json`:
  `eb9c13d41dc76c094b08b62c722cae344cfa2411f31951a038026e7d5c527f46`
  → `5fcc8ac9a8b9a6577401e5dfb2521080f2297214eec1958fd0c93fe96aa2fdbd`;
- `app/scripts/fixtures/sessionSetupCompletionUi.tsx`:
  `bf443605173a8b700a5f794d49ee50a27751b8b0e90e1caa10f8399d9ffad3aa`
  → `4c63fc282067198ab65feaa682cb668a30a688b40020bc606261c5f373335aea`;
- `app/scripts/testClaudeV1StartUi.tsx`:
  `5e833c8525919254db82e3e6d127c00911ec4a8d10408f8216a51d109f66fc8f`
  → `a4c9b885e378ac5f91b823d0791951ef17ac45a6d0d0cf64f3def6cd9311eb6c`;
- `app/scripts/testPublicOverviewUi.tsx`:
  `fe66f2148c198663aa671ce1a1eea4ccdf57b23bfdb4f20287c0c42a832ef757`
  → `4ab7eb14cf8154a617baee7d49db3d7b4090f035cde7c13a2818f0f2c9270b4b`;
- `app/scripts/testSessionSetupCompletionUi.ts`:
  `ba721f824f9e7ef45cca37e8261b09513e9cba486cfdb61cbe12d87fa4812713`
  → `a8fc5ce9b8a25a55c6723b5a87310272918a32038345c4f7971d2cf298a05b4f`.

Die drei Dateien der Präsentationsinsel werden absichtlich **nicht**
hashgebunden. Ihr Schutz besteht in der deklarierten Import-, Prop- und
Effektgrenze sowie im unveränderlichen Browservertrag. Eine weitere reine
Landing-Präsentationsänderung benötigt daher keine neue Hashausnahme. Jede
Erweiterung ihrer Fähigkeiten, Props, Imports oder Startwirkung sowie jede
Änderung an `SessionSetup`, Access-Status, Terms/ID, ChatGPT-/Claude-Handlern,
Prepared Message oder Session-Lifecycle bleibt dagegen gesperrt und benötigt
eine neue ausdrückliche Product-Owner-Entscheidung.

OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Prepared Message, ChatGPT-/Claude-Startwirkung,
Terms-/ID- und Sessionvertrag, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist weder ein Zurückziehen noch eine erneute Einreichung im OpenAI-Portal
erforderlich.

### 6.36 Eng begrenzte Ausnahme: konsistente Landing-Interaktionen

Der Product Owner hat am **1. September 2026** ausdrücklich beauftragt, die
vier öffentlichen Landing-Panels visuell und interaktiv an der bestehenden
Überblickskarte auszurichten. Die doppelte sichtbare Zeile
**So startest du in 5 Minuten.** entfällt, weil derselbe Quickstart bereits als
eindeutig beschriftete Aktion im Lernenden-Panel vorhanden ist.

Freigegeben ist ausschließlich:

- die Aktionspillen der drei Landing-Panels auf Geometrie, Typografie,
  Icon-plus-Text-Aufbau und Fokusdarstellung der bestehenden
  Überblicksaktionen abzustimmen;
- **Jetzt lernen** bei gleicher Geometrie als primäre blaue Aktion sichtbar
  hervorzuheben;
- alle vier gleichrangigen Panelüberschriften als semantische zweite Ebene
  unter dem Seiten-`h1` auszuzeichnen und ihnen ein dekoratives, für
  Assistenztechnologien ausgeblendetes Icon zu geben;
- Hover und Fokus innerhalb aller Panels mit demselben ruhigen Rand-,
  Schatten- und Überschriftenrhythmus darzustellen und die Bereiche semantisch
  durch Blau für Lernen, Grün für Überblick, Violett für Kursplanung und
  Amber für Curricula zu unterscheiden; und
- den primären Lernbutton sowie Footer-Ausgangs-, Hover- und Fokuszustände
  kontrastfest darzustellen; und
- ausschließlich die redundante sichtbare Hero-Zeile aus `SessionSetup` zu
  entfernen. Die weiterhin für den Dokumenttitel verwendete lokalisierte
  Copy und die Quickstart-Route bleiben erhalten.

Der erweiterte Browservertrag prüft Deutsch und Englisch auf Mobil- und
Desktopbreite: alle sieben Landing-Aktionen besitzen sichtbares Icon und Text,
entsprechen der Pillenhöhe der Überblickskarte, **Jetzt lernen** bleibt klar
primär, alle vier Panels besitzen genau eine `h2`-Überschrift mit dekorativem
Icon, die vier Interaktionsakzente bleiben unterscheidbar, und die doppelte
Hero-Zeile ist nicht sichtbar. Routen, drei Callback-Einstiege, Access-Status
und gemeinsames Terms-Gate werden unverändert weitergeprüft.

Die geschützte Kompositionsdatei setzt ihre Kette fort:

- `app/src/components/SessionSetup.tsx`:
  `d78a8e0aebae245fee604c8b8102f26cd37ffb96542267ce668f8b38a31eebc6`
  → `b1ce7a490494df6a72dff7369ad8573dbf1b3b56e7b7643109d621bcf94fe8fa`.

Die außerhalb der evolvierbaren Präsentationsinsel liegende
Überblickskomponente setzt ihre Kette fort:

- `app/src/components/SkillPilotOverviewCard.tsx`:
  `16329baefd5fbbf5d733253508a57661c67e0ba5d49583f6cec119fe5695a77a`
  → `905dd38a60374992ce368260d13dc44d446c263b5ee9585eae0eee9d947ec055`.

Der zentrale Browservertrag setzt seine Evidenzkette fort:

- `app/scripts/testPublicLandingContractUi.tsx`:
  `904ee9e68c32c92e78782999c15f142393c09c97a0506c371911b1ce6ef99c5e`
  → `0b1fe8ddcd5b39bd43ae54f9579899524730e01ce79058a452e41afeb0f8348a`.

Die drei bereits freigegebenen Dateien der evolvierbaren Präsentationsinsel
bleiben weiterhin absichtlich ungehasht. Die neue Ausnahme erweitert weder
ihre Props noch ihre Fähigkeiten. Access-Status, Terms-/ID-Gate, ChatGPT- und
Claude-Handler, Prepared Message, Session- und Lernzustandssemantik,
OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist keine Aktion im OpenAI-Portal erforderlich.

### 6.37 Eng begrenzte Ausnahme: Panel-Farben und CI-Stabilität

Der Product Owner hat am **1. September 2026** die visuelle Differenzierung der
vier öffentlichen Landing-Panels präzisiert und zugleich ausdrücklich
beauftragt, den Stand zu pushen und die CI fehlerfrei herzustellen.

Die Aktionspillen behalten ihre gemeinsame Geometrie, Typografie und
Icon-plus-Text-Sprache, übernehmen aber nun die semantische Farbe ihres
jeweiligen Panels: Blau für Lernen, Grün für Überblick, Violett für
Kursplanung und Amber für Curricula. **Jetzt lernen** verwendet ein helles
Sky-Blau mit dunkler Schrift statt eines optisch schweren dunklen Blaus. Der
Browserregressionsvertrag prüft die vier unterscheidbaren Aktionspaletten,
gleiche Farben innerhalb eines Panels, unveränderte Pillengeometrie sowie
mindestens WCAG-AA-Textkontrast; der primäre Button muss zusätzlich als heller
Farbkörper erhalten bleiben.

Die außerhalb der evolvierbaren Präsentationsinsel liegende
Überblickskomponente und ihre Evidenzketten werden dafür eng fortgesetzt:

- `app/src/components/SkillPilotOverviewCard.tsx`:
  `905dd38a60374992ce368260d13dc44d446c263b5ee9585eae0eee9d947ec055`
  → `e2969e96649285c9e831be8a3c787164a09af403f1ea6848929108ccefc724eb`;
- `app/scripts/testPublicLandingContractUi.tsx`:
  `0b1fe8ddcd5b39bd43ae54f9579899524730e01ce79058a452e41afeb0f8348a`
  → `26526b8ed2be687089055d8ed7b59f34ed4c7213e649096e6bcf46ea8bd39301`;
- `app/scripts/testPublicOverviewUi.tsx`:
  `4ab7eb14cf8154a617baee7d49db3d7b4090f035cde7c13a2818f0f2c9270b4b`
  → `49282210b0f6343660a17add95ab9c0cd87d365bef20ae02072de88ecc7d8b39`.

Zwei CI-Regressionen werden ausschließlich in ihren Tests stabilisiert. Der
Lernzielbuch-Linktest prüft die bereits freigegebene Promotionsentscheidung an
ihrem neuen Präsentationsort statt weiterhin in `SessionSetup`; die
Kursbereichsregression klickt den semantisch benannten Kurs-Button und
beobachtet während des vollständigen Öffnungsvorgangs, dass niemals ein
fachfremder Sek-I-Knoten aufblitzt. Die geprüfte Produktwirkung bleibt dabei
unverändert:

- `app/src/views/WorkbenchView.test.ts`:
  `97e2c090d00859dd0389dbccdfe226b187293bcbac6d0ada1cddd4ae313a59d6`
  → `a4dc3fa0280b4f4f26119ce0aee05e18568b5c7eefb7441cabafd30333194cc5`;
- `app/scripts/testTrainerGymnasiumScopeUi.ts`:
  `ea7fafb68df3aac09a12d56423913f51609df9b469426fac8b8f677f9b37bac2`
  → `5bd0514f46dee4a2e8b5e3d590eac9c38b3b1b0e654a04d87249fffe3f2d7308`.

Die erste CI-Ausführung hat außerdem offengelegt, dass für
`LearnerDataDTO.java` irrtümlich der Hash einer lokalen Datei mit gemischten
Zeilenenden statt der bereits eingecheckten kanonischen LF-Bytes gebunden war.
Die Datei wird inhaltlich nicht geändert; ausschließlich die Bindung wird auf
die vom Repository und von GitHub Actions tatsächlich ausgecheckten Bytes
korrigiert:

- `backend/src/main/java/com/skillpilot/backend/api/LearnerDataDTO.java`:
  `fdb2f5db5ea3cf4d61a9c863d3677181976ddb1d9e1ff3da6029cc64b08eb67a`
  → `e45e90c12dc708dd0880c17ef270ee06c3de141f984ab14b7a0f7906770e0b7c`.

Die Landing-Präsentationsinsel erhält keine neue Fähigkeit und keine neuen
Props oder Imports. Access-Status, Terms-/ID-Gate, ChatGPT- und
Claude-Handler, Prepared Message, Session- und Lernzustandssemantik,
OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist keine Aktion im OpenAI-Portal erforderlich.

### 6.38 Eng begrenzte Ausnahme: vollständiger LF-Hashabschluss

Die zweite CI-Ausführung hat am **1. September 2026** dieselbe historische
Zeilenendenabweichung noch für `PreferencesRequest.java` offengelegt. Ein
anschließender vollständiger Vergleich aller **181** aktuell autorisierten
Einzeldateien mit ihren Git-`HEAD`-Blobs bestätigt, dass dies die einzige noch
verbleibende Worktree-/Repository-Abweichung ist.

Die Datei wird inhaltlich nicht geändert. Ausschließlich die append-only
Freeze-Bindung wird vom früher erfassten lokalen Mixed-EOL-Hash auf die bereits
eingecheckten und von GitHub Actions ausgecheckten kanonischen LF-Bytes
fortgesetzt:

- `backend/src/main/java/com/skillpilot/backend/api/PreferencesRequest.java`:
  `0b40c8bb2fdac8ceeba587dabf49274239d10d1df2c32cf2ba0c95659bc2c6e5`
  → `59c172ba67a18adf2bf6914409264329a9cede50dbba7fe62a7f571e06546a23`.

Der systematische Blobvergleich ist damit vollständig grün. Es ändern sich
weder Java-Quellsemantik noch Runtime-, Session-, Identitäts- oder
Lernzustandsverhalten. OpenAI-Package, MCP/OAuth, Tools, Schemas,
Annotationen, Instruktionen, Ressourcen, MCP-Apps-UI, Reviewfälle und
-fixtures, Portalwerte, Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben
unverändert. Deshalb ist keine Aktion im OpenAI-Portal erforderlich.

### 6.39 Eng begrenzte Ausnahme: deterministische Kursplan-UI-Evidenz

Der anschließende GitHub-Lauf hat am **1. September 2026** einen rein
testseitigen Zeitablauffehler in der bereits autorisierten
Kursplan-Browser-Evidenz sichtbar gemacht. Der Test prüfte unmittelbar mit
`count()`, obwohl diese Playwright-Abfrage nicht auf das zum deaktivierten
Button gehörende Erklärungselement wartet. Unter der Last des vollständigen
CI-Laufs wurde deshalb einmal der deaktivierte Button vor seiner stabilen
Erklärungsanzeige beobachtet; die unveränderte Landingpage-Prüfung, der
Kursplan selbst und alle vorherigen Produktprüfungen waren grün.

Die Ausnahme erlaubt ausschließlich, in
`app/scripts/testTrainerCoursePlanUi.ts` zuerst auf das bereits vorhandene
Element `course-plan-publish-disabled-reason` zu warten und anschließend seine
bestehende `aria-describedby`-Bindung sowie den unveränderten deutschen Text
exakt zu prüfen. Produktcode, UI-Text und Kursplanverhalten ändern sich nicht.
Der Test wurde lokal dreimal hintereinander erfolgreich ausgeführt.

Die bestehende Hashkette wird append-only fortgesetzt:

- `app/scripts/testTrainerCoursePlanUi.ts`:
  `c4c63a5fbe70aea4562b582de6644b0baee79c83e74708bdb9795b364a48136b`
  → `b28cdee8db212e2f1d8fa468420744a0d031a1d33aa1abacd6da701f1e2a59f1`.

OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Runtime-, Session-, Identitäts- und
Lernzustandsverhalten, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist keine Aktion im OpenAI-Portal erforderlich.

### 6.40 Eng begrenzte Ausnahme: ruhige Landing-Aktionshierarchie

Der Product Owner hat am **1. September 2026** die zuvor freigegebenen
farbigen Ruheflächen der öffentlichen Landing-Aktionen ausdrücklich als zu
intensiv bewertet. Die vier Panel-Farben sollen weiterhin Orientierung geben,
aber erst dezent über Icons sowie klar bei Hover, Tastaturfokus und aktivem
Zustand sichtbar werden.

Freigegeben ist ausschließlich:

- alle sekundären Aktionspillen im Ruhezustand auf dieselbe neutrale,
  themeabhängige Fläche, Rand- und Textfarbe zurückzuführen;
- die Panelidentität im Ruhezustand nur über die kleinen Sky-, Emerald-,
  Violet- und Amber-Icons zu erhalten und die jeweilige Flächen-, Rand- und
  Textreaktion erst bei Hover oder Fokus einzublenden;
- **Jetzt lernen** ohne farbige Füllung nur durch eine zurückhaltende
  Sky-Kontur, Sky-Schrift und einen kleinen Schatten als primäre Aktion zu
  kennzeichnen; und
- den geschlossenen Überblicks-Disclosure-Button ebenfalls neutral zu halten,
  während sein geöffneter Zustand als bewusst aktiver Zustand eine schwache
  Emerald-Fläche behalten darf.

Die Browserregression prüft weiterhin Deutsch und Englisch auf Mobil- und
Desktopbreite. Sie bindet nun die gemeinsame neutrale Ruhepalette, vier
unterscheidbare Icon- und Hover-Akzente, den kontrastfesten zurückhaltenden
Primärzustand sowie den neutralen geschlossenen und den eindeutig aktiven
geöffneten Disclosure-Zustand. Geometrie, Typografie, sichtbare Texte,
Routen, Callback-Einstiege, Access-Status und Terms-/ID-Gate bleiben
unverändert.

Die außerhalb der evolvierbaren Präsentationsinsel liegende
Überblickskomponente und ihre Evidenzketten werden dafür eng fortgesetzt:

- `app/src/components/SkillPilotOverviewCard.tsx`:
  `e2969e96649285c9e831be8a3c787164a09af403f1ea6848929108ccefc724eb`
  → `dff105280ff290e77f08ff7cadf043983bcc999dc78f3d10f88a9be478d7e8f8`;
- `app/scripts/testPublicLandingContractUi.tsx`:
  `26526b8ed2be687089055d8ed7b59f34ed4c7213e649096e6bcf46ea8bd39301`
  → `9afd169e2d90398cb693661c9fed5c6af51182e0c9a0190d738e1297a89e038d`;
- `app/scripts/testPublicOverviewUi.tsx`:
  `49282210b0f6343660a17add95ab9c0cd87d365bef20ae02072de88ecc7d8b39`
  → `a923b4bb4fb2828b8f7b9ea3dc406c1ac9b7c68b95f775e29577af6af2f1b54a`.

Die evolvierbare Landing-Präsentationsinsel erhält keine neue Fähigkeit und
keine neuen Props oder Imports. Access-Status, Terms-/ID-Gate, ChatGPT- und
Claude-Handler, Prepared Message, Session- und Lernzustandssemantik,
OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist keine Aktion im OpenAI-Portal erforderlich.

### 6.41 Eng begrenzte Ausnahme: direkter Einstieg in die Kursorganisation

Der Product Owner hat am **1. September 2026** ausdrücklich beauftragt, den
redundanten Trainer-Zwischenschritt nach **Kursorganisation öffnen** zu
entfernen. Der bisherige Bildschirm wiederholte lediglich den lokalen
Speicherhinweis und dieselbe Aktion, bevor er den bereits bestehenden
Trainer-Start auslöste.

Freigegeben ist ausschließlich:

- bei bereits akzeptierten aktuellen Nutzungsbedingungen den Landing-Button
  unmittelbar mit dem bestehenden leeren Trainer-Kontext zu starten;
- bei erstmaliger Nutzung nur das gemeinsame Terms-Gate zu zeigen und nach
  dessen erfolgreicher Speicherung unmittelbar denselben Trainer-Start
  auszuführen; und
- den redundanten Trainer-Hinweis mit seinem zweiten gleich beschrifteten
  Submit-Button vollständig aus `SessionSetup` zu entfernen.

Die Änderung bleibt fail-closed: Schlägt die Speicherung der Zustimmung fehl,
wird keine Trainer-Sitzung gestartet. Der Start übergibt weiterhin exakt eine
leere SkillPilot-ID, eine leere Landschaft und die Rolle `trainer`, entfernt
den obsoleten globalen Trainer-Landschaftsschlüssel und öffnet `/trainer` ohne
`l`-Parameter. Für Lernende und Explorer bleibt der Setup-Ablauf unverändert;
ein React-Effekt wird bewusst nicht verwendet, damit Strict Mode keinen
doppelten Start auslösen kann.

Die geschützte Kompositionsdatei und ihre Browservertrags-Evidenz setzen ihre
Hashketten eng fort:

- `app/src/components/SessionSetup.tsx`:
  `b1ce7a490494df6a72dff7369ad8573dbf1b3b56e7b7643109d621bcf94fe8fa`
  → `b9fd9dc1e56fc0227a481958f5ce77682f520bafdbd3d2582c990d6889e50a39`;
- `app/scripts/testSessionSetupCompletionUi.ts`:
  `a8fc5ce9b8a25a55c6723b5a87310272918a32038345c4f7971d2cf298a05b4f`
  → `1ad7fb1822176dfbd89b512e5b4b236703704e89b32536568d17d56f5693f57d`.

Die Landing-Präsentationsinsel, ihre Props und Fähigkeiten, Access-Status,
Terms-Version und -Text, SkillPilot-ID-Gate, ChatGPT- und Claude-Handler,
Prepared Message, sonstige Session- und Lernzustandssemantik, OpenAI-Package,
MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen, Ressourcen,
MCP-Apps-UI, Reviewfälle und -fixtures, Portalwerte, Reviewer-Zugangsdaten,
Demo und Reviewartefakte bleiben unverändert. Deshalb ist keine Aktion im
OpenAI-Portal erforderlich.

### 6.42 Eng begrenzte Ausnahme: kalendertagsfeste Kursplan-Browser-Evidenz

Der Product Owner hat am **2. September 2026** die ausschließlich testseitige
Korrektur des beim Datumswechsel sichtbar gewordenen Kursplan-CI-Fehlers
freigegeben. Die Browser-Evidenz verwendet feste Plandaten vom 1. bis
13. September 2026 und prüft den dazu gehörenden Sollstand vom 1. September,
bezog ihren Berechnungsstichtag aber irrtümlich aus dem jeweils aktuellen
Berliner Kalendertag. Am 2. September zeigte das unveränderte Produkt deshalb
korrekt `12 von 53 fällig`, während der Test weiterhin den fixturegebundenen
Wert `6 von 53 fällig` erwartete.

Freigegeben ist ausschließlich, in
`app/scripts/testExistingLearnerTrainerUi.ts` unmittelbar nach dem Erzeugen
der Playwright-Seite und vor dem Laden der Fixture die Browserzeit auf
`2026-09-01T06:00:00.000Z` festzusetzen. Damit stammen Plandaten,
Berechnungsstichtag und Assertions aus demselben unveränderlichen
Testszenario. Produktcode, UI-Text und Kursplanverhalten werden nicht geändert.

Die bestehende Hashkette wird append-only fortgesetzt:

- `app/scripts/testExistingLearnerTrainerUi.ts`:
  `616fc99ac1c6565afa1ca9e7dae2922cd96f49533ed9f802e471b4e862cf22bd`
  → `92a79bedfaa8307feeef4b134cfb48db1a6d7f0a701e300f32e6ba61422a661f`.

OpenAI-Package, MCP/OAuth, Tools, Schemas, Annotationen, Instruktionen,
Ressourcen, MCP-Apps-UI, Runtime-, Session-, Identitäts- und
Lernzustandsverhalten, Reviewfälle und -fixtures, Portalwerte,
Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben unverändert. Deshalb
ist keine Aktion im OpenAI-Portal erforderlich.

### 6.43 Eng begrenzte Ausnahme: J8-Test an fortgeschriebenes Layer A binden

Der Product Owner hat am **2. September 2026** im Rahmen der ausdrücklich
beauftragten CI-Stabilisierung die rein testseitige Anpassung des bestehenden
J8-Regressionsfalls an das fortgeschriebene öffentliche Curriculum freigegeben.
Layer A enthält nach der fachlich begründeten Teilung eines zusammengesetzten
Lernziels und der Ergänzung einer neunten Jahrgangsprüfung nun 55 statt 53
atomare J8-Ziele. Die sechs im Testszenario noch offenen Prüfungsaufgaben
bleiben unverändert; die neue neunte Aufgabe wird wie die bereits erledigten
Aufgaben 3 und 7 als abgeschlossen markiert.

Freigegeben ist ausschließlich, in
`backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java`
die erwartete aktuelle Layer-A-Zielanzahl auf 55 zu setzen und die neue
Prüfungsaufgabe 9 in die vorhandene Menge abgeschlossener Prüfungsaufgaben
aufzunehmen. Die weiterhin geprüfte Zustandssemantik bleibt unverändert:
Nach Abschluss aller sonstigen Ziele sind exakt dieselben sechs Aufgaben
auswählbar.

Die bestehende Hashkette wird append-only fortgesetzt:

- `backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java`:
  `709d6e320153ac1fdeabae425a292c3fd409d68a3542b7353d7b77016d27a792`
  → `2582fea64da9b7858d3a4c8930c1b0ad93af98499e51cb88cf3701860ded637d`.

Es ändern sich keine Produktquellen und kein Runtime-, Session-, Identitäts-
oder Lernzustandsverhalten. OpenAI-Package, MCP/OAuth, Tools, Schemas,
Annotationen, Instruktionen, Ressourcen, MCP-Apps-UI, Reviewfälle und
-fixtures, Portalwerte, Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben
unverändert. Deshalb ist keine Aktion im OpenAI-Portal erforderlich.

### 6.44 Eng begrenzte Ausnahme: Marketplace-first-Anleitung für die Claude-Beta

Der Product Owner hat am **3. September 2026** nach der verifizierten
Veröffentlichung des persönlichen Git-Marketplace und der bestätigten Migration
beider kontrollierten Benutzer freigegeben, die ersteigene `/plugins`-Anleitung
vom bisherigen Datei-Upload auf den Marketplace als empfohlenen
Installations- und Updateweg umzustellen. Der Direkt-Upload bleibt als
ausdrücklich bezeichneter Fallback erhalten.

Die Freigabe umfasst ausschließlich:

- die deutsche und englische Fünf-Schritte-Anleitung für Claude Web;
- die gebundene öffentliche Repository-Adresse mit einer reinen
  `navigator.clipboard.writeText`-Aktion für genau diese Adresse;
- weiterhin sichtbare Alters-, Tarif- und Testumfang-Hinweise, auch wenn der
  optionale Download-Index ausfällt;
- die zugehörigen `/plugins`-Metadaten und fokussierten Regressionstests; und
- eine eigenständige, kandidat- und revisionsgebundene Product-Owner-
  Entscheidung im Claude-Marketplace-Release-Modell.

`published_pending_acceptance`, alle noch offenen Marketplace-Evidenzen und
`openPublicBetaReady = false` bleiben unverändert. Die Guide-Entscheidung
behauptet weder Clean-Account-, Refresh-, Legal-, Support- noch
Exact-Client-Abnahme und ist kein Anthropic-Listing. Der Marketplace-Validator
leitet nur den kontrollierten First-Party-Anleitungsweg aus verifiziertem
Repository plus dieser Entscheidung ab; die vollständige Veröffentlichung bleibt
weiterhin an alle bisherigen Evidenzen gebunden.

Die bestehenden Hashketten werden append-only fortgesetzt:

- `app/src/views/PluginCatalogView.tsx`:
  `548aa480c96d76d1a2f9403c4631a74d6d891565c62a0b5197fd59e4092a8e5a`
  → `73c36c7ebb58ec0b6ea66f4c0fa73298e5107c06fbd98b04e0a82209138e9100`;
- `app/src/utils/claudePluginPublication.test.ts`:
  `f6efd1d17ff352bbd4943d967577eab475a636515949d159505b066a7936a6c2`
  → `fc0e79cc9121445db85a2016b36f520681e9f82c762d506a285404106cabafb8`;
- `app/src/App.tsx`:
  `8781db5376bbeaa2376a12b689135e881f53ae89e4d61141d64130dbec83db87`
  → `86acdb6813795da03dd42b0c0080862de0d0fd099cd5f9ead07c1e6952566306`;
- `app/scripts/testRootRoutePolicy.ts`:
  `6a96e4a628f181cb4e7cd324a1c2a29baac3da5f54fafc9fff3c3ee4475752c4`
  → `2fb61a14854858a783aabdda372fd85b802cba5d95e02469c3d1decbf4438f3d`.

Neu gebunden werden die eng zugehörigen Hilfs-, Release- und
Dokumentationsdateien mit folgenden Hashes:

- `app/src/utils/claudePluginPublication.ts`:
  `b9d15d02d84a44d1208c5e02157139f64171c364e92462b223f477fd9725a9ce`;
- `ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json`:
  `6db56658c333bcf5fc688bcdb274dd74a7d3df957f97e28793672a091da7e965`;
- `scripts/claude_marketplace_release.mjs`:
  `fbd8ce38fe2678d29ec64673f8a03910105168129ec7aa8b98ed6e9a22f10974`;
- `scripts/claude_marketplace_release.test.mjs`:
  `f280584ca40ec97332034cfba99c54993265bca10441a02dedb0a0883b1702f4`;
- `docs/deploy/claude-personal-marketplace-release.md`:
  `da96db3618002fb4016e4a785527aea16f3a47823b914151027bad84628f04b0`.

ChatGPT- und Claude-Start-Handler, Prepared Messages, Session-, Identitäts-
und Lernzustandssemantik, OpenAI- und Claude-Package-Bytes, MCP/OAuth, Tools,
Schemas, Annotationen, Instruktionen, Ressourcen, MCP-Apps-UI, Reviewfälle und
-fixtures, Portalwerte, Reviewer-Zugangsdaten, Demo und Reviewartefakte bleiben
unverändert. Deshalb ist keine Aktion im OpenAI-Portal erforderlich.

### 6.45 Eng begrenzte Ausnahme: gemeinsame Fachplanung mit automatischer Lernführung

Der Product Owner hat am **4. September 2026** nach Prüfung des vorgeschlagenen
Ablaufs ausdrücklich freigegeben, persönliche Mathematik-, Physik- und weitere
Fachpläne in der First-Party-WebGUI wie eine gemeinsame wirksame Planung zu
führen. Die frühere Vorgabe eines separaten manuellen Erststarts und einer bei
mehreren geeigneten Fachplänen ausbleibenden Auswahl aus Abschnitt 6.31 wird nur
für diesen genau beschriebenen Ablauf ersetzt; alle übrigen Grenzen der
persönlichen Fachzeitpläne bleiben bestehen.

Für die lokale Lehrkraftplanung ist ausschließlich freigegeben:

- alle vorbereiteten und bereits im Cockpit vorhandenen, noch gültigen
  Fachpläne sichtbar zu einem vollständigen Aktivierungssatz
  zusammenzustellen;
- Revision, Personal-Curriculum-Fingerprint, Blockfokus, Atomziele und
  Voraussetzungen jedes enthaltenen Fachplans vor dem ersten Schreiben zu
  prüfen und den gesamten Satz anschließend in einer Transaktion zu speichern
  oder vollständig zu verwerfen;
- bei fehlenden gültigen Altplänen im Aktivierungsrequest fail-closed vor jeder
  Mutation abzubrechen, damit kein verborgener Plan später als
  Übergabekandidat weiterwirkt;
- mit derselben ausdrücklich bestätigten Vordergrundaktion **Planung wirksam
  machen** den weiterhin lernendenseitig pausierbaren Modus **Nach Plan lernen**
  einzuschalten und unmittelbar das erste fällige, offene und nach `requires`
  zulässige Atomziel auszuwählen; und
- die bestehende Einzelfachkopie nur als nachrangige Aktualisierung
  auszuweisen; sie ist keine gemeinsame Aktivierung und startet für sich kein
  Planungspaket.

Für das Lernenden-Cockpit ist ausschließlich freigegeben:

- alle gültigen Fachpläne in einer kompakten gemeinsamen **Heute**-Ansicht zu
  zeigen und `openDueThroughToday` einschließlich Rückstand als fachübergreifende
  offene Anzahl auszuweisen, ohne daraus einen Tempo- oder Leistungsvergleich
  zwischen Fächern zu berechnen;
- das laufende Lernziel mit einer einzigen **Weiterlernen**-Aktion sichtbar in
  den Fokus zu bringen und Fachdaten erst auf Wunsch aufzuklappen; auf dem
  mobilen Learner-Layout bleibt der benannte 44-Pixel-Menüschalter räumlich
  oberhalb der Heute-Karte und überdeckt weder Überschrift noch Aktion;
- einen ausdrücklichen Fachwechsel anzubieten, der das unvollständige bisherige
  Ziel ohne Mastery-Änderung parkt und nur nach erneuter Prüfung von Revision,
  Fingerprint, Fälligkeit und Frontier ein Ziel des gewählten Fachs aktiviert;
- beim Cockpit-Start genau dann einen idempotenten Reconcile-POST auszuführen,
  wenn Planmodus und Fachpläne vorhanden sind, aber kein aktives Ziel besteht;
  ein laufendes Ziel wird dabei nie verdrängt; und
- nach bestätigtem Abschluss zunächst einen geeigneten Kandidaten aus einem
  Plan mit Abschlussanker zu wählen und andernfalls gültige Fachpläne
  deterministisch nach Blockende, Blockbeginn, Fach-ID, Ziel-ID und Plan-ID zu
  ordnen. Gibt es keinen zulässigen fälligen Kandidaten, wird kein Ersatzziel
  erfunden.

Aktivierung, Reconcile und Fachwechsel sind ausschließlich ausdrückliche
First-Party-Vordergrundwrites unter der bekannten SkillPilot-ID. Kalenderzeit,
GET-Requests, Forecasts und lokale Lehrkraftänderungen allein verändern weder
Fokus, aktives Ziel noch Mastery. Veraltete oder ungültige Pläne werden nicht
für automatische Übergaben verwendet. Request-Sperren, Scope-Sequenzen und
autoritative Response-Prüfungen verhindern Doppelklick- sowie veraltete
Antwort-Rennen. Der Erfolgsvergleich kanonisiert ausschließlich dieselbe
chronologische Blockreihenfolge wie das Backend; abweichende Fachdaten,
Atomziele oder Datumswerte bleiben fail-closed. Fehler behaupten keinen
Teilerfolg.

Die notwendige deutsche und englische Datenschutzcopy beschreibt die atomare
Mehrfachkopie, den automatischen Erststart, das Parken ohne Mastery-Änderung,
die deterministische Übergabe und die unveränderte Direct-ID-Bearer-Grenze
wahrheitsgemäß. Die begrenzte beobachtbare Wirkung auf einen späteren
OpenAI-V1-Zustandsresponse bleibt dieselbe Wirkungsklasse wie in Abschnitt
6.31: Nach einer First-Party-Aktivierung kann der unveränderte Coach einen
anderen bereits existierenden kanonischen Fokus oder `activeGoal` lesen. Der
V1-Coach kann weiterhin weder Pläne anlegen, aktivieren, wechseln, ersetzen
noch anzeigen.

Die Laufzeitfreigabe und ihre notwendige Datenschutzfortschreibung sind in
`review-freeze.json` als zwei eng gekoppelte Ausnahme-Einträge append-only mit
den exakten Quell-, Copy-, Fixture-, Test- und Konzeptbytes sowie ihren
vorhandenen Hashketten gebunden. OpenAI- und Claude-Package-Bytes, MCP/OAuth, Tools, Schemas,
Annotationen, Instruktionen, Ressourcen, MCP-Apps-UI, Prepared Messages,
First-Party-Provider-Start, Identität, Locale und Session-Lifecycle bleiben
unverändert. Die eingereichte Review-Fixture bleibt ohne Fachpläne und mit
`followLearningPlans=false`; Reviewfälle, Portalwerte, Reviewer-Zugangsdaten,
Demo und Reviewartefakte ändern sich nicht. Deshalb ist keine Aktion im
OpenAI-Portal erforderlich.

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

### 6.46 Eng begrenzte Ausnahme: voraussetzungssichere parallele Fachpläne

Der Product Owner hat am **4. September 2026** nach der beobachteten atomaren
Ablehnung der gemeinsamen Mathematik- und Physikplanung ausdrücklich
klargestellt: Jeder Fachplan gilt gleichzeitig; die Anforderungen aller
gültigen Fachpläne für einen Kalendertag werden addiert. Eine Reihenfolge
zwischen Mathematik, Physik oder weiteren Fächern darf weder aus
Voraussetzungen noch aus der automatischen Lernführung entstehen. Die
bestehenden Pläne sollen ohne Löschen und Neuanlage wirksam werden können.

Zur eng begrenzten Fehlerbehebung in der First-Party-Planung ist ausschließlich
freigegeben:

- die wirksamen Voraussetzungen vor der Veröffentlichung über alle
  Lernblöcke **desselben** Fachplans gegen die exakt berechneten
  Fälligkeitstage zu prüfen;
- eine bereits gültige Atomreihenfolge vollständig unverändert zu erhalten;
- bei einer blockübergreifenden Kollision eine begrenzte deterministische
  Korrektur allein durch die Reihenfolge der Atomziele innerhalb ihrer bereits
  vorhandenen Lernblöcke zu versuchen; akzeptiert wird ausschließlich ein
  anschließend exakt validiertes Ergebnis, Atomziele wechseln weder Fach noch
  Block, und Blockfokus, Titel, Beginn und Ende bleiben unverändert;
- dieselbe Prüfung im Backend gegen die autoritative Projektion und deren
  `effectiveRequires` zu wiederholen, das Ergebnis exakt zu validieren und
  Voraussetzungen mit demselben Fälligkeitstag zuzulassen;
- zusätzlich die tatsächlich im Lehrer- und Lernenden-Read-Model verwendete
  kumulative Rundung an jedem relevanten Werktag begrenzt nachzuvollziehen;
  jede fällige Planmenge muss gegenüber den im selben Fachplan enthaltenen
  Voraussetzungen abgeschlossen sein, und die Aufwandsgrenze bleibt
  fail-closed;
- bei überlappenden Lernblöcken jeden neuen globalen Fälligkeitsslot
  deterministisch genau einmal dem bereits begonnenen Block mit dem frühesten
  Ende zuzuweisen. Innerhalb eines Blocks wird ausschließlich der nächste
  Atom-Prefix verwendet. Damit wächst die konkrete Fälligkeitsmenge von Tag zu
  Tag monoton, ihre Größe bleibt exakt die einmal gerundete Summe der
  erwarteten Zieläquivalente, und jeder Block ist spätestens an seinem Ende
  vollständig fällig. Backend und Lehrerplanung verwenden dieselben
  Slot-Daten; sowie
- eine Planung, für die innerhalb dieser Grenzen keine konfliktfreie
  Reihenfolge gefunden wurde, weiterhin vor dem ersten Schreiben atomar
  abzulehnen. Der First-Party-Endpunkt darf dafür nur den
  fest gebundenen Fehlercode
  `LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT` ohne Ziel-IDs, interne
  Begründung oder Stackdetails liefern; die WebGUI übersetzt ihn in eine
  handlungsorientierte deutsche oder englische Meldung und behauptet keinen
  Teilerfolg.

Die Korrektur serialisiert keine Fachpläne. Mathematik, Physik und weitere
Fächer werden weiter unabhängig gespeichert, gemeinsam aktiviert und im
Lernenden-Cockpit parallel geführt. `openDueThroughToday` bleibt die Summe der
offenen Anforderungen aller gültigen Fachpläne einschließlich Rückständen;
Fachwechsel, automatische Auswahl des ersten fälligen zulässigen Ziels und
deterministische Übergabe bleiben unverändert. Der strenge Erfolgsvergleich
akzeptiert weiterhin keine abweichende Atomreihenfolge, damit Lehrer- und
Lernendenprojektion bei einem unerwarteten serverseitigen Reorder fail-closed
bleiben.

Die Regression bindet den real beobachteten lösbaren Slot-Typ, bereits gültige
Bestandsreihenfolgen, gleiche Fälligkeitstage, einen unlösbaren Fall, die
atomare Ablehnung, den sicheren Fehler-Envelope und die lokalisierte
Lehrkraftmeldung. Die bestehende Cockpit-Evidenz für die Addition mehrerer
Fachpläne und den ausdrücklichen Fachwechsel bleibt unverändert gültig.

OpenAI- und Claude-Package-Bytes, MCP/OAuth, Tools, Schemas, Annotationen,
Instruktionen, Ressourcen, MCP-Apps-UI, Prepared Messages,
First-Party-Provider-Start, Identität, Locale, Session-Lifecycle, Reviewfälle,
Review-Fixtures, Portalwerte, Reviewer-Zugangsdaten, Demo und Reviewartefakte
bleiben unverändert. Die eingereichte Review-Fixture enthält weiterhin keine
Fachpläne und `followLearningPlans=false`; deshalb ist keine Aktion im
OpenAI-Portal erforderlich.

### 6.47 Eng begrenzte Ausnahme: planorientierter Claude Coach 1.1 als vollständiger Ersatz

Der Product Owner hat am **4. September 2026** ausdrücklich freigegeben, die
bisherige Claude-Variante vollständig durch **SkillPilot Claude Coach 1.1** zu
ersetzen. Frühere Claude-Pakete bleiben unveränderliche historische Evidenz,
sind aber weder aktuelle Variante noch empfohlener Installationsweg oder
Fallback. Der öffentliche persönliche Git-Marketplace enthält bis zu seiner
erneuten kandidatengenauen Veröffentlichung weiterhin die historische Version
1.0.4 und wird deshalb in der First-Party-Anleitung fail-closed ausgeblendet.
Die sichtbare Anleitung akzeptiert ausschließlich den hashgebundenen
1.1.0-Direktinstallationskandidaten; ein alter, abweichender oder ungültiger
Index bietet keinen Download an.

Für die gemeinsame providerneutrale Planprojektion und den Claude-1.1-Vertrag
ist ausschließlich freigegeben:

- für jeden gültigen aktuellen Fachplan die heute neu fälligen Ziele, die davon
  aktuell bereits beherrschten Ziele, die heute noch offenen Ziele und offene
  Rückstände getrennt zu berechnen und über alle Fachpläne zu addieren;
- `completedToday` ausschließlich als aktuellen Beherrschungsstand innerhalb
  der heute neu fälligen Menge zu verwenden; mangels Ereignishistorie wird
  damit keine Beherrschung *an diesem Tag* behauptet;
- veraltete, ungültige oder nicht sicher lokalisierbare Fachpläne aus allen
  Summen auszuschließen und lediglich ihre anonyme Anzahl zu melden;
- im öffentlichen Chat-Kontext nur Datum, Planmodus, lokalisierte Fachnamen,
  Zählwerte, Summen, anonyme Nichtverfügbarkeitsanzahl und die boolesche
  Fortsetzbarkeit zu liefern; Plan-, Landscape- und andere interne IDs werden
  nicht übertragen;
- zu Beginn einer Lernsession die Werte aller gültigen Fächer knapp zu nennen,
  Rückstände separat auszuweisen und unveränderte Werte nicht in jeder Antwort
  zu wiederholen;
- ein bereits laufendes unbeherrschtes Lernziel unverändert fortzusetzen; und
- nur wenn kein Lernziel läuft und der autoritative Status
  `resumeAvailable=true` liefert, mit dem neuen Write-Tool
  `resume_skillpilot_learning_plan` ohne Rückfrage das serverseitig gewählte
  nächste fällige, offene und voraussetzungssichere Planziel zu aktivieren.
  Der Write erhält weder Plan noch Fach, Datum oder Ziel als Auswahlparameter,
  bleibt an Lernsession, Write-Scope, `expectedStateVersion` und
  `clientRequestId` gebunden, verbietet erfolgreiche No-ops und liefert den
  vollständigen neuen kanonischen Kontext zurück; und
- auf einen ausdrücklichen Lernendenwunsch wie „Wechsle zu Physik“ mit
  `switch_skillpilot_learning_plan_subject` zu reagieren. Das Tool akzeptiert
  ausschließlich einen lokalisierten Fachnamen aus dem frischen
  `learningPlanToday`, niemals eine Plan-, Landscape- oder Ziel-ID. Der Server
  löst genau einen gültigen Fachplan auf, parkt das bisherige Ziel ohne
  Beherrschungsänderung und aktiviert dessen erstes fälliges,
  voraussetzungssicheres Ziel. Unbekannte, mehrdeutige, bereits aktive oder
  derzeit nicht fortsetzbare Fächer werden ohne interne IDs fail-closed
  abgelehnt. Auch dieser Write ist versionsgeschützt, idempotent und liefert
  den vollständigen kanonischen Folgezustand.

Die Claude-Paketversion, Skill- und Policy-Texte, der Connector-Vertrag mit nun
14 Tools, die lokal reproduzierbare 1.1.0-Archivdatei, der aktuelle
First-Party-Index, die Direktinstallations- und Marketplace-Release-Metadaten,
die deutsche und englische Connector-Datenschutzseite sowie ihre strukturellen
Prüfungen dürfen genau für diesen Ersatz fortgeschrieben werden. Alle
Exact-Client-, Privacy-, Legal-, Support- und Marketplace-Evidenzen, die für
1.1.0 noch nicht tatsächlich erbracht wurden, bleiben ausdrücklich
`pending`; frühere Beobachtungen werden nicht übernommen. Es erfolgt in diesem
Arbeitsschritt keine externe Marketplace-Veröffentlichung und keine
Behauptung einer Anthropic-Abnahme.

Insbesondere weist der aktuelle 1.1-Publikationsindex bis zur jeweils
kandidatengenauen Abnahme `testedSurfaces: []` und `voiceMode: false` aus. Die
sichtbare First-Party-Anleitung und der öffentliche Zugangsvergleich dürfen
Claude Pro, Web, Android und Voice nur als vorgesehenen beziehungsweise
technisch unterstützten 1.1-Betatestpfad mit noch ausstehender Abnahme
beschreiben. Sie dürfen die historische Erprobung früherer Claude-Pakete nicht
als aktuellen 1.1-Nachweis darstellen.

ChatGPT-Start-Handler, Prepared Message, OpenAI-Portalwerte, eingereichtes
OpenAI-Paket, Review-Snapshot, Reviewfälle, Fixture, Demo und
MCP-Apps-UI bleiben unverändert. Die konkreten Quell-, Paket-, Datenschutz-,
Release-, Test- und Dokumentationsbytes werden in der append-only
Hashkette von `review-freeze.json` gebunden.

### 6.48 Eng begrenzte Ausnahme: lokaler OpenAI-Coach-1.1-Kandidat bei unverändertem Reviewvertrag

Der Product Owner hat am **4. September 2026** zugleich die lokale Vorbereitung
eines späteren planorientierten OpenAI-Coach-1.1-Kandidaten freigegeben. Diese
Freigabe hebt den aktiven Review-Freeze von **SkillPilot Coach 1.0.0** nicht auf
und aktiviert den Kandidaten weder lokal in der Standardkonfiguration noch in
Produktion.

Der eingereichte Vertrag bleibt bei ausgeschaltetem, standardmäßig auf `false`
stehenden Feature-Flag exakt unverändert: dieselben 12 Tools, dieselben
Instruktionen und Schemas sowie der eingefrorene Contract-Fingerprint
`d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38`.
Auch der kanonische Paketbaum
`ai/openai plugin/skillpilot-coach-v1`, der eingefrorene Draft-Snapshot, die
öffentliche Endpoint- und OAuth-Linie, Portalwerte, Reviewfälle, Fixture, Demo
und Reviewartefakte bleiben bytegenau unverändert.

Nur bei einem später ausdrücklich gesetzten 1.1-Flag darf derselbe Backend-Build
additiv genau zwei weitere Tools ausweisen:

- `get_skillpilot_daily_plan` liest nach dem vollständigen Kontext die
  datensparsame additive Fachübersicht; eine im Kontext veröffentlichte
  Lernzielvisualisierung bleibt dabei der zwingend unmittelbar nächste
  Darstellungsschritt; und
- `resume_skillpilot_learning_plan` darf ausschließlich nach einem frischen
  Status mit `resumeAvailable=true` und ohne aktives Lernziel denselben
  versionsgeschützten, idempotenten providerneutralen Reconcile-Pfad verwenden.

Die 1.1-Instruktionen benennen alle gültigen Fächer, unterscheiden heute neu
fällig, davon aktuell beherrscht, heute offen und Rückstand, erfinden keine
Planaufgaben und vergleichen Fächer weder nach Tempo noch Leistung. Der
separate lokale Kandidatendeskriptor und sein deterministischer Checker müssen
zugleich den unveränderten 1.0-Vertrag und den additiven 14-Tool-Kandidaten
nachweisen. Es werden kein `prepare`, kein Portal-Save, kein MCP-Rescan, kein
Upload, keine Veröffentlichung und keine Produktionsaktivierung ausgeführt.

Da der geschützte OpenAI-Backend-Quellbaum damit ausschließlich dormant
erweiterbar wird, behält `review-freeze.json` seinen eingereichten Baumhash als
Baseline und führt den ausdrücklich autorisierten neuen Baumhash in einer
separaten append-only Hashkette. Der Freeze-Prüfer akzeptiert diese Kette nur,
wenn die ursprüngliche Baseline unverändert im Record steht; jede spätere
Abweichung benötigt erneut eine ausdrücklich freigegebene Folgeausnahme.

### 6.49 Eng begrenzte Ausnahme: einfache Chat-Führung im Claude Coach 1.1.1

Der Product Owner hat am **4. September 2026** die zuverlässige und möglichst
einfache Führung von Lernenden mit bestehenden Plänen im Chat beauftragt. Die
Korrektur wird als **Claude Coach 1.1.1** vorbereitet; das bereits gebundene
1.1.0-Archiv und seine historische Release-Evidenz bleiben unverändert. 1.1.1
ersetzt den aktuellen Claude-Kandidaten vollständig, ohne parallelen alten
Installationsweg. Die Zahl der Claude-Tools bleibt bei 14.

Die Freigabe umfasst ausschließlich folgende Verfeinerungen des in 6.47
autorisierten Workflows und ihre paketgenauen Regressionen und Release-Nachweise:

- Die datensparsame Fachübersicht ergänzt boolesche Angaben zum aktuellen Fach
  und zur tatsächlichen Fortsetzbarkeit. Ein laufendes Ziel in einem anderen
  Fach verhindert den ausdrücklich gewünschten Fachwechsel nicht. Nicht
  startbare, bereits aktuelle oder heute abgeschlossene Fächer erzeugen keine
  wiederholten erfolglosen Wechselversuche.
- Eindeutige natürliche Fachwünsche wie „Mathe“ werden auf den frisch vom Backend
  veröffentlichten Fachnamen abgebildet. Das Tool erhält weiterhin ausschließlich
  diesen exakten Namen; Mehrdeutigkeit wird kurz geklärt. Ein expliziter Fachwunsch
  hat Vorrang vor dem generischen automatischen Start.
- Reine Statusfragen und eine ausdrücklich gewünschte Pause lösen keinen
  Planstart und keine neue Aufgabe aus. Ausgeschalteter Planmodus verhindert
  keine gewöhnliche, vom Lernenden gewünschte Sitzung außerhalb der Planung.
- Das Backend unterscheidet laufendes Lernen, verfügbaren Start, erledigte
  Tagesanforderungen, blockierte offene Aufgaben und nicht sicher auswertbare
  Planung. Tagesabschluss setzt voraus, dass auch offene Rückstände erledigt
  sind und keine nicht auswertbaren Pläne fehlen. Generische Frontier-Ziele
  werden im geführten Plankontext nicht als zusätzliche heutige Pflicht angeboten.
  Künftige Ziele oder eine Fokuserweiterung beginnen nicht automatisch nach
  Tagesabschluss; Planungskorrekturen bleiben Aufgabe der Lehrkraft.
- Nach bestätigtem Verified-Recall-Abschluss enthält dieselbe idempotente
  Antwort den aktuellen vollständigen Nachfolgekontext mit Tageszahlen und
  gegebenenfalls nächstem Fach. Es erfolgt kein zusätzlicher Mastery- oder
  Auswahlwrite. Historische Wiederholungsantworten ohne Nachfolgekontext
  verlangen genau einen lesenden Kontext-Reload.

Vorhandene Pläne müssen dafür weder gelöscht noch neu angelegt werden. Die
Semantik der Zählwerte aus 6.47 und die kanonischen Voraussetzungen-, Mastery-
und Übergaberegeln bleiben erhalten. Die normalen First-Party-Start-Handler,
Prepared Messages, Identität, Locale, Session-Bindung und absolute
24-Stunden-Laufzeit bleiben unverändert. Nach Ablauf ist weiterhin ein neuer
Start über SkillPilot erforderlich; eine vollständig chatinterne Erneuerung
wird nicht behauptet.

Alle noch nicht tatsächlich erbrachten 1.1.1-Exact-Client-, Datenschutz-,
Support- und Marketplace-Nachweise bleiben `pending`; historische Abnahmen
werden nicht übertragen. Die Freigabe umfasst keine externe Veröffentlichung
oder Produktionsaktivierung. Der eingereichte OpenAI-Coach-1.0.0-Vertrag,
sein Paket, Review-Snapshot, Portal, Reviewfälle, Fixture, Demo und UI-Bytes
bleiben unverändert, ebenso der lokale standardmäßig deaktivierte
OpenAI-1.1-Kandidat. Die konkreten Claude-, gemeinsamen Status-, Test-,
Release- und Dokumentationsbytes werden append-only in der Freeze-Kette gebunden.

### 6.50 Eng begrenzte Ausnahme: vereinfachte First-Party-Kursplanung mit Schülervorschau

Der Product Owner hat am **4. September 2026** nach Prüfung eines interaktiven
Entwurfs dessen Umsetzung für „Kurse planen“ freigegeben. Die Freigabe betrifft
ausschließlich die unabhängige First-Party-Planungsoberfläche und eine lesende
Vorschau der bereits autorisierten gemeinsamen Fachplanung:

- Eine kompakte Fachübersicht unterscheidet gespeicherte Entwürfe von der
  tatsächlich aktiven Planung. Der Planmodus wird vom Backend gelesen; das
  bloße Vorhandensein gespeicherter Fachpläne bedeutet nicht „aktiv“.
- „Plan bearbeiten“, „Schülervorschau“ und „Unterricht & Verlauf“ trennen die
  Aufgaben. Bearbeitbare Abschnitte stehen direkt im Arbeitsbereich; das
  Formular öffnet sichtbar am Abschnitt mit Tastaturfokus. Interne Wechsel
  erhalten Eingaben. Fach-, Kurs-, Arbeitsbereichs- und Logout-Aktionen fragen
  vor dem Verwerfen ungespeicherter Eingaben nach.
- Die First-Party-Route `POST /api/ui/learners/{id}/learning-plans/preview`
  berechnet sieben Kalendertage ab dem aktuellen Berliner Datum mit denselben
  Prüfungen, Voraussetzungen, Normalisierungen und Tagesmetriken wie Aktivierung
  und Chat. Anforderungen aller Fächer werden addiert; Überschneidungen innerhalb
  eines Fachplans werden nach den bestehenden Regeln genau einmal zugeordnet.
  Der aktuelle Lernstand bleibt ein Snapshot, keine Prognose künftiger Erfolge.
- Die Vorschau nutzt ausschließlich den vorhandenen lesenden Routenzugang,
  antwortet mit `no-store` und erzeugt keine Plan-, Revisions-, Auswahl-,
  Präferenz-, Ereignis-, Sperr- oder Retention-Aktivitätsänderung. Nicht gespeicherte
  Formulareingaben, veraltete Revisionen und nicht vollständig prüfbare Fachpläne
  verhindern eine irreführende Vorschau oder Aktivierung.
- Erst die ausdrückliche abschließende Bestätigung nutzt die unveränderte
  atomare Aktivierung. Die Vorschau ist davor Pflicht. Unterrichtsabdeckung
  bleibt lokale Dokumentation und setzt keine Schüler-Mastery.

Die Freigabe ändert weder OpenAI- noch Claude-Tools, Pakete, Versionen,
MCP-/OAuth-Verträge, UI-Ressourcen, Prepared Messages, Launch-Handler,
Schüler-Sitzungen, Identität, Locale, Reviewfälle oder Veröffentlichungsstatus.
Der eingereichte OpenAI-Coach 1.0.0, der deaktivierte lokale 1.1-Kandidat und der
Claude-1.1.1-Kandidat bleiben unverändert. Es erfolgen keine externe Publikation,
Portaländerung oder Produktionsaktivierung. Die eng begrenzten First-Party-,
Service- und Regressionsdateien werden append-only mit ihren konkreten Hashes
gebunden; frühere Freigaben und die eingereichten Bytes bleiben unverändert.

### 6.51 Eng begrenzte Ausnahme: Claude 1.1.1 Marketplace-Veroeffentlichung und Updateanleitung

Der Product Owner hat am **5. September 2026** ausdrücklich verlangt, dass das
Claude-Update über den Marketplace erfolgt, und die unveränderte
[Veröffentlichung von 1.1.1](https://github.com/enpasos/skillpilot-claude-marketplace/pull/2)
nach Prüfung der Copilot-Hinweise selbst gemergt. Freigegeben ist ausschließlich
die Veröffentlichung des bereits unveränderlich gebundenen Claude-1.1.1-Pakets
sowie dessen deutsche und englische First-Party-Installations- und Updatehilfe.

Die öffentliche Revision `5cc7aba22ddf90ab8273cd6c15b71e8186781fc3` wurde nach dem
Merge mit dem geschlossenen Export von elf Dateien verglichen, mit dem
gepinnten Claude-Validator streng geprüft und über die echte HTTPS-Gitquelle
in einem isolierten Profil installiert. Der Tree-SHA-256 lautet
`8c6c67b46763224d901a65b35408dad7752f6c7db08203fd38cf0f568a74c5d3`;
das Plugin bleibt Version `1.1.1` mit SHA-256
`b4bfa8122812bf1ad0430e6b02932b89e29b107c7a831cebf994da010c359351`.

Die zusätzliche Freigabe umfasst nur `marketplace-publication.json`, die
Marketplace-Anleitung in `PluginCatalogView.tsx`, ihren Veröffentlichungsschalter
und die fokussierten Regressionen sowie das Marketplace-Runbook und diesen
Nachweis. Updates stehen vor der Neuinstallation; die Anleitung nennt 1.1.1,
erhält die gezielte Bereinigung alter SkillPilot-Dateiinstallationen, den
gebündelten OAuth-Konnektor und die Rückkehr zu SkillPilot. Sie bietet keinen
Datei-Upload als parallelen Installationsweg an. Die vorhandene Kopieraktion
schreibt weiterhin nur die feste öffentliche Repository-Adresse.

Nur der öffentliche Repository-Nachweis wird `pass`; die separate
Guide-Entscheidung ist an Kandidat, Revision und Tree gebunden. Der Status bleibt
`published_pending_acceptance`. Reale Neuinstallation, Account-Migration und
Refresh, Web/Android/Voice, Datenschutz-, Rechts- und Supportabnahmen bleiben
offen; `openPublicBetaReady` bleibt `false`. Der Git-Merge bestätigt keine
bereits aktualisierten Benutzeraccounts. Es erfolgt kein First-Party-Deployment.

Das eingereichte OpenAI-Paket 1.0.0, alle OpenAI- und Claude-Paketbytes,
MCP-/OAuth-/Tool-/Schema-/MCP-Apps-Verträge, Provider-Start-Handler, Prepared
Messages, Session-, Identitäts- und Locale-Semantik, Portalwerte, Reviewfälle,
Fixtures und Reviewartefakte bleiben unverändert. Der OpenAI-Portalreview wird
weder zurückgezogen noch neu eingereicht. Die konkreten Guide-, Metadaten-,
Test- und Dokumentationshashes werden append-only gebunden; kein früherer
Hashanker wird ersetzt.

Präzisierung derselben Guide-Freigabe anhand der vom Product Owner am
5. September gezeigten Claude-Web-Dialoge: Die installierte Version 1.0.4
bietet keine Aktion „Aktualisieren“. Belegt sind „Hinzufügen“ → „Marketplace
hinzufügen“ → „Aus einem Repository hinzufügen“, die bekannte Repository-URL,
„Automatisch synchronisieren“ und „Synchronisieren“. Nur die bereits
freigegebene Anleitung, ihre Copy-Regression und das Runbook werden darauf
korrigiert. Die englischen Bezeichnungen sind Übersetzungen der beobachteten
deutschen Oberfläche. Die anschließende Versionsprüfung auf 1.1.1 bleibt
erforderlich; weder ein erfolgreicher Account-Refresh noch automatische Updates
über alle Clients sind damit abgenommen. Ein ergänzender Hashketteneintrag
erhält sämtliche vorherigen Bindungen, ohne die Freigabe zu erweitern.

Der nachfolgende Screenshot nach „Synchronisieren“ meldet ausdrücklich
„Dieser Marketplace wurde bereits hinzugefügt.“ Das erneute Hinzufügen ist
damit kein belegter Updateweg für bestehende Installationen. Die Anleitung
trennt diese Beobachtung von den Schritten zur Neuinstallation und lässt die
manuelle Web-Refresh-Abnahme offen; sie erfindet weder eine Updateaktion noch
einen Lösch-/Neuinstallations-Workaround.

### 6.52 Eng begrenzte Ausnahme: arbeitstagsfester Backend-Aktivierungstest

Der Product Owner hat am **5. September 2026** die zuvor ausdrücklich
angefragte Wochenendkorrektur in
`backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java`
einschließlich der zugehörigen Freeze-Hashfortschreibung genehmigt.
Der Test
`planPackageActivationEnablesFollowingAndSelectsTheFirstGoalWithoutAnotherAction`
legte seinen eintägigen Lernblock auf den jeweils aktuellen Berliner Tag. Am
Samstag und Sonntag verletzt das die unveränderte Produktregel, dass ein
Lernblock mindestens einen Arbeitstag enthalten muss.

Freigegeben und geändert ist ausschließlich das Testdatum dieses Falls:

- `asOf` bleibt der aktuelle Berliner Kalendertag und wird unverändert als
  Aktivierungsstichtag übergeben;
- der eintägige Testblock liegt auf dem letzten Freitag einschließlich heute
  (`previousOrSame(FRIDAY)`), sodass er stets einen Arbeitstag enthält und am
  tatsächlichen Aktivierungstag fällig ist;
- sämtliche bestehenden Assertions, die Systemzeit, der Produktcode und alle
  übrigen Testfälle bleiben unverändert.

Die bestehende Hashkette wird append-only fortgesetzt:

- `backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java`:
  `0105dcec686ce142d729b77e435665f50d535a53bcfc1f35637d79138e5b8ec2`
  → `90d7a903ad90dfcaa35f03fc5d6d4b7a467cf59a6300d74f30ccf569528b0d87`.

Die Ausnahme ist rein testseitig; das eingereichte Plugin bleibt
`skillpilot-coach-v1` Version `1.0.0`. Runtime-, Session-, Identitäts-, Locale-
und Lernzustandsverhalten, OpenAI-/Claude-Pakete, MCP/OAuth, Tools, Schemas,
MCP-Apps-Ressourcen, Startabläufe, Portalwerte, Reviewer-Zugänge und
Reviewartefakte werden nicht verändert. Ein Zurückziehen oder erneutes
Einreichen im OpenAI-Portal ist deshalb nicht erforderlich. Der Freeze-Record,
seine exakte Checker-Erwartung und der zugehörige Regressionstest erhalten nur
den zusätzlichen, auf diese Testdatei und diesen Dokumentationsnachtrag
begrenzten Hashketteneintrag; frühere Freigaben bleiben unverändert erhalten.
