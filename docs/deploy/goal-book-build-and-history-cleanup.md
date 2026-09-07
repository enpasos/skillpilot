# Lernzielbücher: Build-Artefakte statt Git-Binärdateien

Stand: 7. September 2026. Die fachliche Curriculum-QS bleibt während dieser
Prozessumstellung pausiert.

## Quellen und Veröffentlichungen

Die Quellen bleiben versioniert: kanonische Curricula, Kompositionsansichten,
Quellenzuordnungen, Review-Ledgers, Visualisierungsquellen, Buchkonfigurationen
und Renderer. Das geschlossene Buchregister definiert Mathematik, Physik,
Chemie und Biologie. Historische fachliche Reviewbelege werden nicht gelöscht.

`app/public/lernzielbuch/` ist dagegen vollständig generiert und Git-ignoriert:
vier PDFs, vier BookModels, vier Originalquellen-Indizes, vier Render-Manifeste,
der gemeinsame Publikationsindex und ein rein technischer Build-Cachebeleg.
Diese Dateien weder manuell bearbeiten noch mit `git add -f` einchecken.
Die öffentlichen Buch- und PDF-URLs bleiben unverändert.

## Bauen und prüfen

Node gemäß `.nvmrc`, die gesperrten npm-Abhängigkeiten, Playwright Chromium,
Poppler (`pdfinfo`, `pdftohtml`), Fontconfig (`fc-list`, `fc-match`) und
Liberation Sans/Mono mit jeweils Regular, Bold, Italic und Bold Italic sind
erforderlich. Das bestehende Druckprofil muss `Arial` auf **Liberation Sans**
und `Courier New` auf **Liberation Mono** auflösen. Diese acht echten
Schriftschnitte werden vor dem Rendern geprüft; Noto-, Regular- oder andere
stille Fallbacks werden nicht akzeptiert. Die Fontdateihashes und die vollständige
Layoutprüfung bleiben zusätzlich verbindlich, auch zwischen Liberation-Versionen.
Unter Ubuntu die Werkzeuge/Fonts und Browser-Systemabhängigkeiten installieren:

```bash
cd app
npm ci
sudo apt-get install poppler-utils fontconfig fonts-liberation
npx --no-install playwright install --with-deps chromium
npm run build
```

Der Anwendungsbuild erzeugt die Bücher vor TypeScript/Vite und prüft danach
noch einmal die vollständige Publikation. Ein isolierter Buchbuild ist möglich:

```bash
npm --prefix app run build:goal-books -- --force
npm --prefix app run check:goal-book-publication
npm --prefix app run test:goal-book-pipeline
```

Auch `feedback:validate` benötigt den zuvor erzeugten Publikationsindex und
die BookModels. Auf einem frischen Checkout deshalb zuerst `build:goal-books`
ausführen. Ein abweichender Render-Manifesthash wird bei Feedbackvergleichen
weiterhin separat ausgewiesen; er bedeutet nicht automatisch eine fachliche
Curriculumänderung.

Ohne `--force` dürfen nur inhaltsgeprüfte Ergebnisse wiederverwendet werden:
aktuell rekonstruierte Modelle und Quellenindizes, Renderer, Lockfile,
Chromium, Schriftumgebung und Werkzeuge müssen zur Cachebindung passen;
zusätzlich werden sämtliche Ausgabedateien und die normale Publikationsprüfung
kontrolliert. Zeitstempel oder die bloße Existenz einer PDF reichen nicht aus.
Fehlende oder veränderte Artefakte werden neu gebaut, nicht durchgewunken.

Alle vier Bücher entstehen zunächst in einem benachbarten Stagingverzeichnis.
Erst nach erfolgreicher Prüfung aller Bücher wird die Veröffentlichung ersetzt.
Ein Fehler erhält den vorherigen vollständigen Stand. Fremde Dateien und
Symlinks im Zielverzeichnis werden nicht überschrieben. Nach einem abgebrochenen
Prozess kann die leere Sperre `app/public/.lernzielbuch.build-lock` verbleiben;
sie darf erst nach Prüfung, dass kein Buchbuild mehr läuft, entfernt werden.

Die CI erzeugt die Bücher einmal aus dem jeweiligen Checkout und übergibt
dasselbe geprüfte Artefakt an Frontend- und Curriculum-Prüfung. Backendtests
erhalten nur den kleinen Katalog mit den Modellen. Es gibt keinen Rückgriff
auf Downloads aus Produktion und keinen ungebundenen jobübergreifenden Cache.
Ein CI-Gate verhindert, dass Publikationen erneut in Git aufgenommen werden.

## Gleiches Buch, neu gerenderte PDF

BookModel-Digest, Ziel-/Seitenbindung und Quellen müssen reproduzierbar sein.
PDF-Bytes können dagegen technische Erstellungsmetadaten enthalten. Deshalb
erhält jeder Build einen passenden PDF- und Manifesthash; der alte PDF-Hash
wird nicht künstlich weiterverwendet.

Die Feedbackregistry muss bei identischen Modellbytes und identischen
öffentlichen Seiten einen anderen Render-Manifesthash akzeptieren. Ihr erster
gespeicherter Snapshot einschließlich ursprünglichem Manifestfingerprint bleibt
unverändert als Publikationsnachweis erhalten. Eine solche Wiederverwendung
bescheinigt keine Identität der PDF-Dateibytes. Abweichende Modellbytes,
Seitentexte, Fingerprints oder widersprüchliche gespeicherte Metadaten bleiben
Fehler. Die sieben Feedback-Linkparameter und historische Buchbindungen ändern
sich nicht; Klassen- und Lernendendaten sind von dieser Umstellung unberührt.

## Eng begrenzte Historienbereinigung

Der Product Owner hat am 7. September 2026 ausdrücklich auch die Umschreibung
des eingefrorenen OpenAI-Review-Quellcommits genehmigt. Aus der Historie werden
ausschließlich diese sechs generierten Dateipfade entfernt:

```text
app/public/lernzielbuch/de-gym-mathematik-bundesweit.pdf
app/public/lernzielbuch/de-gym-physik-bundesweit.pdf
app/public/lernzielbuch/de-gym-chemie-bundesweit.pdf
app/public/lernzielbuch/de-gym-biologie-bundesweit.pdf
app/public/lernzielbuch/de-gym-chemie-lk.pdf
app/public/lernzielbuch/de-gym-biologie-gk.pdf
```

Kein allgemeiner `*.pdf`-Filter: Originalquellen, Whitepaper und fremde Dateien
bleiben erhalten. Eine unabhängige externe Sicherung der bisherigen Git-Daten
enthält auch lokale Branches, Replace-Refs und Konfiguration. Der Rewrite läuft
in einem separaten frischen Repository. Commit-Zuordnung und Vorher-/Nachher-
Prüfungen bleiben in der externen Sicherung; die entscheidenden Quellcommits
werden zusätzlich in der Review-Freeze-Ausnahme dokumentiert.

Vor Veröffentlichung werden die Nicht-PDF-Dateibäume der Branch-Spitzen und
des eingereichten Quellstands identisch verglichen. Eingereichtes Plugin,
Snapshot, Vertrag und Reviewvideo behalten ihre ursprünglichen SHA-256-Anker.
Der ursprüngliche `submittedSourceCommit` bleibt als historische Aussage
erhalten; die Ausnahme nennt zusätzlich seinen gleichwertigen bereinigten
Commit. Es erfolgt keine Portaländerung oder erneute Einreichung.

Verifizierte Zuordnung des eingereichten Quellcommits:
`ff3a16b0d6e3c8a564176ab4743e777cddf3e79c` →
`7fef7a0d9d4dbcd78101848b75774c8f6ee1335a`.
Der isolierte Rewrite verändert 617 von 1.957 Commits, entfernt keinen Commit
und macht 35 historische PDF-Blobs mit zusammen 2.176.039.246 logischen Bytes
aus den veröffentlichten Branches unerreichbar. Das ist keine Aussage über
sofort frei werdenden komprimierten Speicher. `gh-pages` bleibt unverändert.
Historische Commit-Signaturen können beim Rewrite nicht beibehalten werden;
die 37 ursprünglichen signierten Commits bleiben in der externen Sicherung.
Geprüft sind außerdem alle übrigen Dateien der Branch-Spitzen und des
Review-Quellcommits sowie die unveränderten SHA-256-Werte aller 28 gebundenen
Snapshot-, Plugin- und Videoartefakte.

Nur betroffene veröffentlichte Branches dürfen nach erneutem Remotevergleich
mit explizitem `--force-with-lease` aktualisiert werden, niemals pauschal alle
Refs mit `--mirror`. Historische PR-/Fork-Refs und fremde Klone können alte
Objekte weiterhin halten. Die Bereinigung der Branch-Historie ist keine Zusage
sofortiger physischer Löschung sämtlicher GitHub-Kopien; siehe die
[GitHub-Hinweise zu Folgen einer Historienumschreibung](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Bestehende Klone und Produktion einmalig umstellen

Nach Veröffentlichung der bereinigten Historie **nicht die alte Historie wieder
mergen oder pushen**. `git pull` kann die divergierten Historien nicht sicher
zusammenführen. Bei eigenen Änderungen zuerst extern sichern und einzeln auf
einen frischen Clone übertragen. Alte Branches und Tags nicht zurückpushen.

Auch der Produktionscheckout muss vor dem nächsten gewöhnlichen Deployment
gezielt auf die neue Historie umgestellt werden. Zuerst Pfad, Branch, lokale
Änderungen, Dienstkonfiguration und bisherige Revision prüfen und sichern;
dann frischen Checkout oder einen ausdrücklich geprüften Reset verwenden.
Diese Migration ist bewusst kein automatischer Bestandteil von `deploy.sh`.
Der laufende Dienst wird für die Git-Bereinigung nicht neu gestartet.

Danach gilt wieder der [normale Deploymentprozess](deployment.md). Auf
Rocky/RHEL/Fedora zuvor `poppler-utils`, `fontconfig`, `liberation-sans-fonts`
und `liberation-mono-fonts` sowie die zum Browser passenden Laufzeitbibliotheken
bereitstellen. Alternativ dürfen die vollständigen, verifizierten Liberation-
Schriftdateien samt Lizenz als reguläre Benutzerfonts installiert werden;
anschließend `fc-cache -f` ausführen und die acht Auflösungen prüfen. Keine
Schriftdateien aus unkontrollierten Downloads verwenden. Das Deployment installiert
gesperrte npm-Abhängigkeiten und deren Chromium-Version und prüft den echten
Browserstart vor dem Build. Ein bewusst gewählter alternativer Chromium-Pfad
ist über `GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH` möglich und Teil der Cachebindung.
Dabei die tatsächliche Browser-Binärdatei angeben, keinen Shell-Wrapper;
es gibt keinen stillen Systembrowser-Fallback.
