# SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre

**Stand:** 24. August 2026

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
  `b9d399e5bf42a8b8ba4a48cffd7d89edeb16bde52b7d89a5e9747ee8e2d666e4`;
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
