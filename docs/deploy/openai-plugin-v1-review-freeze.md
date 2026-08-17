# SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre

**Stand:** 17. August 2026

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
- der First-Party-Ablauf WebGUI-Konfiguration → **Lernen starten** → frische
  vorbereitete Chatnachricht sowie alle dafür sichtbaren Texte und URLs;
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
bleiben gesperrt.

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
