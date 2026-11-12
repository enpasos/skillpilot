# SkillPilot-Release für den persönlichen Claude-Marketplace

Dieses Runbook regelt den Repository-gestützten persönlichen Marketplace für
`skillpilot-coach-v1`. Er verteilt genau einen konkreten Claude-Plugin-Kandidaten; der
Marketplace-Mechanismus selbst verändert diesen Kandidaten nicht. Es handelt sich nicht um
einen von Anthropic kuratierten oder von Anthropic verifizierten Eintrag. Version 1.1.13 ist im
öffentlichen persönlichen Marketplace veröffentlicht; ihr exakter Quellstand, das Paket und das Repository wurden
unabhängig verifiziert. Die Website bietet derzeit das passende Archiv 1.1.13
an.
Die vollständige Abnahme im echten Client steht weiterhin aus; die Repository-Veröffentlichung belegt weder
eine Installation noch eine Synchronisierung in jedem Konto.
Früher veröffentlichte Pakete und deren Nachweise bleiben unveränderliche Historie.

## 1.1.13 Veröffentlichung der Assessment-Direkteinstiege

Am 31. Oktober 2026 forderte der Product Owner eine explizite Anleitung für Assessment-Direkteinstiege
im Claude-Skill an. **1.1.13** verarbeitet diese Absicht
vor dem regulären Lehrbetrieb, wartet auf eine ausdrückliche Assessment-Auswahl und verwendet die
aktuell vom Backend veröffentlichte Auswahl direkt. Eine ausstehende technische Vertragsquittung
wird zuerst aufgelöst, bevor fehlende Auswahloptionen als nicht verfügbar behandelt werden. Die bloße Einsichtnahme
startet kein Assessment und legt weder Aufgaben noch Lösungen offen.

Das exakte Dossier für 1.1.12 bleibt unter `release/history/1.1.12/` erhalten, und sein
43.272-Byte-Archiv bleibt byte-identisch. Das neue Release umfasst **46.595 Bytes**,
SHA-256 `0e99b10635c0a97a43d5f6fbdc0fa437b6da68bb0483515fdf8230e0764090cd`.
Paketprüfungen, zwei reproduzierbare Builds, die strikte Claude-CLI-Validierung sowie die
lokalen Browser-Prüfungen der First-Party-Installationsanleitung waren erfolgreich. Der
[kandidatenspezifische Host-Testplan](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/release/1.1.13-assessment-shortcuts-regression-plan.md)
steht weiterhin aus. Keine frühere Client-Abnahme wird übertragen.

Nach Rückmeldung des Backend-Deployments beauftragte der Product Owner ausdrücklich die
Marketplace-Veröffentlichung. Am 31. Oktober 2026 bestanden alle acht anmeldedatenfreien öffentlichen
Laufzeitprüfungen; der Live-Index und das heruntergeladene Archiv stimmten exakt mit 1.1.13
überein. Der Quell-Commit
`1394481fd5769b0e9eac2c077cbb4d6b37d05982` bestand seine vollständige
[CI](https://github.com/enpasos/skillpilot/actions/runs/41213161648), einschließlich
der reparierten OpenAI-Entwurfsprüfung und der Curriculum-Paketvalidierung. Der
Marketplace-Workflow fixiert diesen Commit sowie den vollständigen SHA-256 des Claude-Plugin-Quellbaums
`80e84ae610ba53cb25f344f35c294131912251ceb382bb73f608727261215384`.
Der zwölf Dateien umfassende Export hat den Baum-SHA-256
`1ffa2ec07f543b13a4d7111dc4317ff19ebd93290887d1cb924201771caae05f`.
Astra Ultra prüfte Quellstand, Export und bewahrte Historie unabhängig.

[Marketplace PR #16](https://github.com/enpasos/skillpilot-claude-marketplace/pull/16)
bestand die [PR-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/41218904922)
sowie das automatische Code-Review ohne offene Befunde. Er wurde mit einem
exakten Head-SHA-Schutz per Squash-Merge zusammengeführt. Die veröffentlichte `main`-Revision lautet
`803cdbf462465c8686f2b7894a9ddfbdf1ec50b7`; ihre
[Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/41219253428)
war erfolgreich. `verify-repository` klonte unabhängig den öffentlichen Standard-Branch,
prüfte das abgeschlossene Dateiverzeichnis und das exakte Archiv, führte beide strikten Claude-Validierungen
aus, installierte in einem isolierten Profil aus dem tatsächlichen HTTPS-Marketplace
und bestätigte, dass der Remote-Head während des gesamten Vorgangs unverändert blieb.
Die Repository-Verifizierung wurde um `2026-10-31T16:21:33.000Z` protokolliert.

Ein separates isoliertes Profil unter Claude Code 2.1.241 installierte zunächst das tatsächlich
veröffentlichte Paket 1.1.12 aus dem HTTPS-Marketplace. Nach der Veröffentlichung aktualisierte
`claude plugin marketplace update skillpilot-marketplace` gefolgt von
`claude plugin update skillpilot-coach-v1@skillpilot-marketplace --scope user`
dieselbe Installation auf 1.1.13. Sie blieb aktiviert mit dem exakten
SkillPilot-MCP-Endpunkt und der neuen Repository-Revision. Alle sieben installierten Dateien
stimmten mit der kanonischen Referenz überein; ein erneuter Build aus diesen installierten Dateien ergab
exakt das 46.595-Byte-Archiv und den oben genannten SHA-256. Dies belegt den expliziten CLI-Update-Pfad,
jedoch weder eine automatische Auslieferung noch eine Migration hochgeladener Plugins oder einen
authentifizierten Lernablauf in Claude Web bzw. Android Voice.

Lediglich `public-repository-default-branch` ist als `pass` markiert; der Veröffentlichungszweig steht auf
`published_pending_acceptance`. Kontospezifische Abnahmen sowie die Abnahme auf echten Hosts
stehen weiterhin aus. Die First-Party-Anleitungsroute, deren gesonderte Entscheidung, der versionierte
historische Download-Index, sämtliche früheren Archive und deren Nachweise bleiben unverändert.

## 1.1.12 Repository-Veröffentlichung und beobachtete Clients

Am 30. September 2026 wies SkillPilot `main` bei
`9a10fd51011e390fbf83a8524454b024279825da` eine grüne
[CI](https://github.com/enpasos/skillpilot/actions/runs/36712405971) auf, und der zugehörige
Server-Rollout wurde bestätigt, bevor die Vorbereitung begann. Das exakte Release-Dossier für 1.1.11
wurde unverändert nach `release/history/1.1.11/` kopiert; veröffentlichte
1.1.11-Dateien und Nachweise wurden nicht verändert. Das Archiv für 1.1.12 umfasst
**43.272 Bytes**, SHA-256
`d4d2f22a551bfd044d2eeaa36495fe96d62bc588552effecaef213a4e148afc0`.
Der zwölf Dateien umfassende Marketplace-Export hat den Baum-SHA-256
`923616375ea8a9593f38c4b00f42a6857c3c92b21828baaebf63b7a1847660cc`.
Sein Workflow fixiert den committeten SkillPilot-Quellstand
`0861a33b2a0faee4ccca1fa0ca315920e0bcfbcb` sowie den vollständigen SHA-256 des Claude-Plugin-Quellbaums
`286c80cfd90ba56270b3d69dbeca28454a1bff700077a8957735325b44634c48`.
Der Release-Quellstand wurde über
[SkillPilot PR #66](https://github.com/enpasos/skillpilot/pull/66) als
`0239cae6bf59df68014b8ad66d5f3bf9ab47b1ad` zusammengeführt; dessen
[CI](https://github.com/enpasos/skillpilot/actions/runs/36720520147) war erfolgreich.

[Marketplace PR #15](https://github.com/enpasos/skillpilot-claude-marketplace/pull/15)
bestand die [PR-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/36720997088)
und wurde per Squash-Merge zusammengeführt. Der tatsächliche öffentliche Marketplace-`main` lautet
`eb047d16cae0226f8fa94d0db603e359fecb03c9`; seine
[Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/36721262030)
war erfolgreich. `verify-repository` prüfte unabhängig diese öffentliche Revision, das
exakte zwölf Dateien umfassende Verzeichnis samt Baum-Digest, beide strikten Claude-Validierungen,
den Digest des neu gebauten Archivs sowie die isolierte Installation aus dem HTTPS-Repository.
Der ausgerollte Website-Index und der öffentliche Download wurden gegen denselben
1.1.12-Archiv-Digest und dieselbe Byte-Anzahl geprüft. Lediglich
`public-repository-default-branch` ist in
`release/marketplace-publication.json` als `pass` markiert.

In einem authentifizierten Claude-Pro-Profil für **Claude Code** wurde eine bestehende
Marketplace-Installation mittels `claude plugin marketplace update` gefolgt von
`claude plugin update` von 1.1.1 auf 1.1.12 aktualisiert. Claude meldete das
installierte Plugin als aktiviert mit seiner gebündelten MCP-URL und erforderte einen
Neustart des Clients. Dies ist ein beobachtetes CLI-Konto-Update; es belegt weder eine neue
Claude-Web-Installation noch eine Migration eines hochgeladenen Plugins oder einen abgeschlossenen
Lernablauf. Eine Neuinstallation in einem berechtigten Konto, ein Web-Update sowie zwei aufeinanderfolgende
Lernziel-Bilder in einer neuen über SkillPilot gestarteten Claude-Sitzung bleiben
unbeobachtet und ausstehend. Eine Umstellung der First-Party-Anleitung wurde nicht genehmigt.

Der Product Owner meldete später einen Vorfall in Claude **Android Voice** bei der
Nutzung des neuesten Plugins: Ein erster Mastery-Tool-Aufruf schlug fehl, nachdem der Coach
hörbar ein internes Schemafeld und einen Wiederholungsplan beschrieben hatte, während ein zweiter Aufruf
erfolgreich war. Das bereitgestellte Startprotokoll zeigt einen Download des 1.1.12-Archivs und ein
späteres Mastery-Ereignis, ordnet jedoch keines von beiden eindeutig diesem Screenshot zu.
Nach Aktualisierung der Android-App berichtete der Product Owner, dass der nächste
Mastery-Schritt erfolgreich war und ausschließlich normale, an Lernende gerichtete Sprache enthielt. Dies
ist ein einzelner vom Nutzer beobachteter erfolgreicher Wiederholungsversuch ohne erfasste installierte Version,
Modellangabe, Tool-Payload oder unabhängige Server-Zustandskorrelation. Die exakten Client-Abnahmenachweise
für Web und Android Voice bleiben daher ausstehend. Der
Backend-Mastery-Vertrag wurde separat präzisiert, ohne die
veröffentlichten Plugin-Bytes von 1.1.12 zu ändern; seine Wirksamkeit in künftigen Voice-Sitzungen
erfordert eine weitere Prüfung im echten Client.

## 1.1.11 Repository-Veröffentlichung

Am 28. September 2026 meldete der Product Owner eine grüne CI sowie das erfolgte Deployment und
beauftragte die Veröffentlichung der 1.1.11-Korrektur zur Angebotsbindung im
persönlichen Git-Marketplace. Der exakte Website-Index und das heruntergeladene
Archiv für 1.1.11 wurden mit 42.633 Bytes und SHA-256
`0648c174c52f057aca123cbcef8c1285c9d655bd81175382ce66155a9267f884` geprüft.
Der Marketplace-Export fixiert die grüne SkillPilot-Revision
`70a2a25adb77ebfd8b1749fd50d93fc4aa35d301` sowie deren Claude-Plugin-Quellbaum-SHA-256
`237c3d0d7deae66b0b0b4757f3f69eac98c15430a4c0cff1f3d868644375a9af`.
Der exakte zwölf Dateien umfassende Export hat den Baum-SHA-256
`df38b47fc9b309adbbd910c04491ff4693e7cef3aa4f102977a14a2cd35f7dcf`.

[Marketplace PR #14](https://github.com/enpasos/skillpilot-claude-marketplace/pull/14)
bestand seine [Final-Head-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/36421718916)
und wurde unabhängig vom SkillPilot-Quell-PR per Squash-Merge zusammengeführt. Die resultierende
öffentliche `main`-Revision lautet `1cb5b7904243b1b0ad6ee8fa576176bb09c2353e`.
Ihre [Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/36423148702)
war erfolgreich. `verifyPublishedClaudeMarketplace` prüfte den tatsächlichen öffentlichen Standard-Branch,
das abgeschlossene Dateiverzeichnis, den exakten Baum und das neu gebaute Archiv, beide strikten
Claude-Validierungen sowie die Installation aus dem HTTPS-Marketplace in einem isolierten
Claude-Profil. Der Remote-Head blieb während der gesamten Verifizierung unverändert.
Der Repository-Nachweis wurde um `2026-09-28T12:40:27.000Z` protokolliert.

Die im Paket enthaltenen README- und SETUP-Texte sind Momentaufnahmen zum Vorbereitungszeitpunkt, einschließlich
ihrer Statusformulierung vor der Veröffentlichung; ihre Bytes bleiben an das ausgerollte
Archiv gebunden. Die Wurzel-README des Marketplace benennt diese Einschränkung. Lediglich
`public-repository-default-branch` ist als `pass` erfasst; Neuinstallation in einem bereinigten Konto,
Migration/Aktualisierung sowie die Abnahme des Lernablaufs im echten Client
stehen weiterhin aus. Für 1.1.11 wurde keine neue Entscheidung zur First-Party-Anleitung getroffen.

## 1.1.10 Repository-Veröffentlichung

Am 23. September 2026 berichtete der Product Owner, dass der Coach in einem
Voice-Gespräch interne Abwägungen offengelegt und einen Lernzielabschluss erneut hinterfragt hatte,
nachdem die lernende Person sein Angebot ohne neue fachliche Informationen angenommen hatte.
Der Nachfolger 1.1.10 wurde lokal mit einer Anweisungs- und Claude-Connector-Korrektur
vorbereitet. Der Coach entscheidet nun intern anhand der Arbeit der lernenden Person,
persistiert ausschließlich nachgewiesenen Erfolg vor dessen Rückmeldung und bietet im Anschluss an das Feedback Rückfragen
oder das Weiterlernen an. Eine nicht bestandene Prüfung erhält weiterhin ihre vollständige Auswertung
und Lösungsbesprechung, ohne einen Fehlversuch zu speichern; dieselbe Prüfung bleibt
wiederholbar. Das exakte Release-Dossier für 1.1.9 bleibt unter
`release/history/1.1.9/` erhalten; sein veröffentlichtes Archiv und der Marketplace-Quellstand bleiben
unverändert. Der exakte Client-Regressionsplan für 1.1.10 liegt unter
`ai/claude/plugin/skillpilot-coach-v1/release/1.1.10-incident-regression-plan.md`.
Die Client-Abnahme für Web und Android Voice steht weiterhin aus.
Der Website-Index und die heruntergeladenen Bytes entsprechen nun dem 1.1.10-Archiv mit 41.166
Bytes und SHA-256
`4304cb825942db3fa2c7e6a352481794a523ea21afba0e6db71f6314fddee618`.
Der anmeldedatenfreie synthetische Produktions-Support-Check bestand am
23. September 2026 alle acht Prüfungen. Keine dieser Prüfungen belegt einen Lernablauf im echten Client oder ein
installiertes Marketplace-Update. Der lokale Marketplace-Export fixiert die committete
SkillPilot-Quellrevision
`8dc0fa9b8fad65db28f2be25a165dd4a72a36bce` sowie den Plugin-Quellbaum-Digest
`16594707fbeca128fa8544f5da70486c6286702760e320b41c6334d7df1e4cb2`.
Diese Revision ist über `enpasos/skillpilot` verfügbar. Der korrigierte, zwölf Dateien umfassende
Marketplace-Export hat den Baum-SHA-256
`ac46ca37e788ae137c7c2465ec2be53564b41e3de5f26d010ccc2a06307ed780`.
Die [Quell-CI](https://github.com/enpasos/skillpilot/actions/runs/35875547903)
war erfolgreich. [Marketplace PR #13](https://github.com/enpasos/skillpilot-claude-marketplace/pull/13)
bestand seine [Final-Head-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35880492294)
und wurde mit einem Head-SHA-Schutz per Squash-Merge zusammengeführt. Die
[Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35880727127)
war erfolgreich. `verify-repository` prüfte anschließend
den öffentlichen Standard-Branch, das exakte zwölf Dateien umfassende Verzeichnis, das neu gebaute Archiv, beide
strikten Claude-CLI-Validierungen sowie die Installation über dessen HTTPS-URL in einem
isolierten Profil. Gemeldet wurde die Revision
`b5c1b7579eefe087f55872402642e962790adc9a` mit demselben Baum-Hash.
Lediglich der Repository-Nachweis steht auf `pass`; Neuinstallation im bereinigten Konto, Update,
Lernablauf im echten Client sowie eine neue Entscheidung zur First-Party-Anleitung stehen weiterhin aus.

## 1.1.9 Veröffentlichung zu Issue #55

Am 23. September 2026 bestätigte der Product Owner grüne CI und erfolgtes Deployment und
beauftragte die Marketplace-Veröffentlichung. Das sieben Dateien umfassende Plugin-Archiv **1.1.9** ist
reproduzierbar mit
**39.441 Bytes**, SHA-256
`b53a1100fff6d84ee66c12f084a8ff359847496fbf75c8a951ee4c9a0230c3c5`.
Das Plugin ergänzt `references/task-closure.md`; sein Marketplace-Export umfasst zwölf
Dateien. Das veröffentlichte Dossier für 1.1.8 bleibt byte-identisch unter
`release/history/1.1.8/` erhalten. Der ausgerollte Website-Index und das Archiv stimmen mit 1.1.9 überein.

[Marketplace PR #11](https://github.com/enpasos/skillpilot-claude-marketplace/pull/11)
veröffentlichte den exakten Export nach bestandener
[Final-Head-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35824006725).
[PR #12](https://github.com/enpasos/skillpilot-claude-marketplace/pull/12)
fixierte anschließend den zugehörigen Validierungs-Workflow auf den geprüften SkillPilot-Quell-Commit
`54c7d04cc52c4844dfb5c5d7ddaf94dae6a574ea`. Dies verhindert, dass spätere
Änderungen an Release-Nachweisen den Quell-Hash des Workflows verändern. Beide PRs wurden
mit exakten Head-SHA-Schutzprüfungen per Squash-Merge zusammengeführt. Die
[abschließende PR-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35824468247)
und die [Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35824523541)
waren erfolgreich. `verify-repository` prüfte anschließend den öffentlichen Standard-Branch, alle zwölf
Dateien, das neu gebaute Archiv, beide strikten Claude-Validierungen sowie die Installation
aus dem öffentlichen HTTPS-Marketplace in einem isolierten Profil. Der Remote-Head blieb
während der gesamten Verifizierung stabil.

- Veröffentlichte Revision: `c16ce0f1ff97cd8d428fdc83a9243c9db2022301`.
- Verifizierung protokolliert: `2026-09-23T05:57:47.000Z`.
- Export-Baum-SHA-256:
  `8862c32e873355d401e3e9a6073c8db75625cfcae9c708a312dbc1801945ae58`.
- Plugin: **1.1.9**, **39.441 Bytes**, SHA-256
  `b53a1100fff6d84ee66c12f084a8ff359847496fbf75c8a951ee4c9a0230c3c5`.

Lediglich `public-repository-default-branch` ist als `pass` erfasst.
Neuinstallation im bereinigten Konto, Marketplace-Update sowie die Abnahme des Lernablaufs im echten Client
stehen weiterhin aus. Für 1.1.9 wurde keine neue Entscheidung zur First-Party-Anleitung getroffen.

Der Marketplace-Validierungs-Workflow für 1.1.9 prüft unmittelbar nach dem Checkout von `main` und
noch vor dem Laden des Paket-Builders einen fixierten SHA-256 des vollständigen
kanonischen Claude-Plugin-Quellbaums. Anschließend prüft er den exakten Archiv-Digest,
das abgeschlossene Exportverzeichnis, die Quellparität sowie beide strikten Claude-Validierungen.
Diese Inhaltsbindung hält den Marketplace-Workflow fest an den geprüften Quellstand gekoppelt.
Ändert sich der kanonische Quellbaum, schlägt die externe Marketplace-Validierung fehl,
bis der Kandidat geprüft und der Quell-Digest bewusst aktualisiert wurde.

## 1.1.8 Veröffentlichung und automatischer Backend-Download

Am 21. September 2026 bestätigte der Product Owner grüne CI und erfolgtes Backend-Deployment
und beauftragte ausdrücklich die Marketplace-Veröffentlichung von 1.1.8. Der exakte kanonische
Quellstand ist `a8c2869632f5d9be04d64c4eb7f365bc70ad4cae`
([Quell-CI](https://github.com/enpasos/skillpilot/actions/runs/35616413734)).

[Marketplace PR #10](https://github.com/enpasos/skillpilot-claude-marketplace/pull/10)
wurde unabhängig gegen das abgeschlossene Exportverzeichnis geprüft, bestand die
[Final-Head-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35622917269)
und wurde mit einem exakten Head-SHA-Schutz per Squash-Merge zusammengeführt. Zwei Review-Hinweise mit niedriger Schwere
wurden behoben, ohne das getestete Paket neu zu binden: Die öffentliche README stellt klar,
dass der im Paket enthaltene Setup-Text eine Momentaufnahme vor der Veröffentlichung ist, und die bestehende
Formulierung zu Verified Recall wurde im Kontext geprüft. Die geschützten Paket-Bytes
bleiben identisch zum grünen kanonischen Quellstand.

Die [Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35623061325)
war erfolgreich. `verify-repository` klonte anschließend den tatsächlichen öffentlichen Standard-Branch, verifizierte
alle elf Dateien, führte beide strikten Claude-Validierungen aus und installierte 1.1.8 aus dem
öffentlichen HTTPS-Marketplace in einem isolierten Claude-Profil. Der Remote-Head blieb
während der gesamten Verifizierung stabil.

- Veröffentlichte Revision: `be68c85b2ac0f404f26178cc4810c5f8a53feba6`.
- Verifizierung protokolliert: `2026-09-21T16:03:34.000Z`.
- Export-Baum-SHA-256:
  `1ec4a4a7d5e568319dc0cf545a8891ee56869eb7fc72f5aab2a0c8011aa59dd7`.
- Plugin: **1.1.8**, **35.909 Bytes**, SHA-256
  `1603c79c06b9fa39f2b57033c65d4b1d5748cb048b01271f72b5708652e7525b`.

Lediglich der Nachweis für die Repository-Veröffentlichung ist als `pass` markiert; exakte Client-Installations-
und Update-Abnahmen stehen weiterhin aus. Der Product Owner forderte zudem, dass die
bestehende Website-Anleitung die tatsächliche Download-Version anzeigt und jeder Backend-Rollout
automatisch die passende Plugin-Datei samt Index mitführt. Damit ist die
bestehende Controlled-Beta-Anleitung genau für diesen veröffentlichten Kandidaten freigegeben; dies beansprucht weder
erfolgreiche Updates in allen Claude-Konten noch eine breitere öffentliche Abnahme.
Der Website-Index und die tatsächlich herunterladbaren Bytes bleiben eine einzige verlässliche Quelle (Single Source of Truth);
es findet keine separate Versionsabfrage gegen GitHub zur Laufzeit statt.

### Automatischer Abgleich beim Backend-Rollout

`processResources` führt nun `generateClaudePluginPublication` aus. Dieser Schritt baut das
aktuelle Plugin reproduzierbar und prüft dessen Version, SHA-256 und Byte-Länge
gegen das Release-Dossier, bevor Archiv und passender Index gemeinsam paketiert
werden. Der Build schließt unveränderte historische Archive ein, ersetzt jedoch den
historischen Quell-Index durch den neu generierten Index. Reguläre Builds verändern keine
versionierten Release-Dateien. `/plugins` liest bereits für sämtliche
Versionsanzeigen und den Download-Link den ausgelieferten Index; eine Versionsanpassung im Frontend ist nicht erforderlich.

Sobald diese Automatisierung committet ist, die CI besteht und einmal ausgerollt wurde, führen nachfolgende
autorisierte Backend-Deployments das passende Plugin automatisch mit. Es gibt
keinen separaten manuellen Freigabeschritt für den Download-Index. Paketversionierung und
Review bleiben bei inhaltlichen Plugin-Änderungen weiterhin erforderlich; die Paketierung im Backend veröffentlicht weder
in den Git-Marketplace noch belegt sie ein erfolgtes Update im Claude-Konto von Nutzenden.

`scripts/deploy.sh` verifiziert vor dem Neustart die generierten Ressourcen und gleicht nach
Erreichen der Betriebsbereitschaft den öffentlichen Index und das Archiv exakt mit diesem Build ab. Für einen lokalen
Standard-Build lautet die entsprechende Ressourcenprüfung:

```bash
cd backend
./gradlew processResources
node ../scripts/claude_direct_install_beta_release.mjs verify \
  --publication-root build/resources/main/claude-plugin-publication
```

Verwenden Sie das entsprechend konfigurierte Build-Verzeichnis, falls `SKILLPILOT_BACKEND_BUILD_DIR`
gesetzt ist. Das reguläre, rein quellbasierte `verify` prüft weiterhin die historische Integrität; es
behauptet nicht, dass ein neu ausgerolltes Backend noch jenen alten Index ausliefert.

Die lokale Verifizierung war erfolgreich: Regressionstests für deterministische Generierung und unveränderliche Versionen,
HTTP-/Download-Tests gegen den generierten Classpath, `processResources` und
`bootJar` sowie deutsch- und englischsprachige Desktop-/Mobil-Browser-Prüfungen mit dem generierten
1.1.8-Archiv. TypeScript, fokussiertes Linting, Dokumentationslinks und ein unabhängiges
Review waren erfolgreich. Der schreibgeschützte Produktionsmonitor akzeptiert während des Rollouts ausschließlich die exakt erfasste
alte Veröffentlichung oder den exakt lokal reproduzierten aktuellen Build;
unbekannte Metadaten und veränderte Archive schlagen fehl. Vor dem
Deployment dieser Automatisierung bestanden alle acht Live-Prüfungen, während der Download noch auf 1.1.7 stand.

## Abgeschlossene 1.1.7 Marketplace-Veröffentlichung

Am 19. September 2026 bestätigte der Product Owner grüne CI und das Produktions-Deployment
und beauftragte anschließend ausdrücklich die Veröffentlichung des aktuellen Claude-Plugins.
Der Marketplace wurde an den grünen SkillPilot-Quell-Commit
`80c8f3a3e94e5c7d43c183d18bacb7ce38bb4117`
([Quell-CI](https://github.com/enpasos/skillpilot/actions/runs/35465833125)) gebunden.
Das Plugin gibt den gemeinsamen DAY/WEEK-Status je Fach wortgetreu wieder und kündigt
das aktive Lernziel zu Beginn der Lehreinheit separat an.

[PR #9](https://github.com/enpasos/skillpilot-claude-marketplace/pull/9)
bestand die erforderliche [Final-Head-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35468419187)
und wurde mit einem exakten PR-Head-SHA-Schutz per Squash-Merge zusammengeführt. Ein unabhängiges Review
bestätigte das abgeschlossene Dateiverzeichnis, die Parität zum kanonischen Paket sowie wahrheitsgemäße
Aussagen zur Client-Abnahme. Das automatische Review empfahl die Freigabe mit zwei
Formulierungshinweisen: Die Marketplace-README wurde präzisiert; die historische Formulierung zu Tageskontingenten
in der paketierten README wurde beibehalten, um den exakt getesteten
Kandidaten unverändert zu bewahren. Dieser Dokumentationstext kann in einem späteren kanonischen
Quell-Update angeglichen werden; die aktuellen Coaching-Anweisungen verwenden bereits DAY/WEEK-Zeiträume.

Die [Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35468537513)
war ebenfalls erfolgreich. `verifyPublishedClaudeMarketplace`, die von
`verify-repository` genutzte Implementierung, klonte daraufhin den tatsächlichen öffentlichen Standard-Branch, verglich alle
zwölf Dateien, führte beide strikten Claude-Validierungen aus und installierte das exakte Plugin
aus dem öffentlichen HTTPS-Repository in einem isolierten Claude-Profil. Der Remote-HEAD
blieb während der gesamten Verifizierung unverändert.

- Veröffentlichte Revision: `c06583c1a94e486ed5afe25cafe41ac8e16677b8`.
- Verifiziert um: `2026-09-19T20:49:07.938Z`.
- SHA-256 des zwölf Dateien umfassenden Exportbaums:
  `5ea0bbe9ba5776154155cfb2d9b390a1aaac5a672261172855eb382fc58dccca`.
- Plugin: **1.1.7**, **34.586 Bytes**, SHA-256
  `a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b`.

Sechsundzwanzig gezielte Marketplace-Tests und der lokale Installations-Smoke-Test waren erfolgreich.
Der anmeldedatenfreie synthetische Produktions-Check bestand vor und nach der Veröffentlichung,
einschließlich des separat ausgelieferten 1.1.6-Downloads sowie der OAuth-Metadaten
und der nicht authentifizierten Challenge des Connectors. Durch diese Veröffentlichung erfolgte kein zusätzliches Backend-Deployment und
keine Hochstufung des Website-Downloads bzw. der Anleitung.

Zum Veröffentlichungszeitpunkt wurde lediglich `public-repository-default-branch` als `pass` erfasst,
woraus sich `published_pending_acceptance` ergab; Installations-/Update-Prüfungen in echten Konten
sowie die Anleitungsentscheidung für den neuen Kandidaten standen aus. Der Product Owner bestätigte später,
1.1.7 in Claude zu sehen und erfolgreich mit dem Plugin gestartet zu sein.
Dies ist eine punktuelle Host-Beobachtung; Status-Worttreue und der vollständige Lernablauf
bleiben noch zu prüfen. Die nachfolgende Website-Korrektur ist unten dokumentiert.

## 1.1.7 Abgleich von Website-Version und Download

Nach Bestätigung des installierten Plugins 1.1.7 und eines erfolgreichen Starts meldete der Product
Owner unter Beifügung eines Screenshots, dass `skillpilot.com/plugins` weiterhin 1.1.6 anzeigte.
Der öffentliche Publikationsindex bestätigte unabhängig 1.1.6.
Die angeforderte Korrektur gleicht die bestehende Installationsanleitung, das Versions-Badge,
den Versionsvergleich und die herunterladbare Datei an die veröffentlichte Marketplace-Version an.

Die bestehende Marketplace-zuerst-Anleitung und der Datei-Fallback sind nun exakt an
1.1.7 gebunden, mit Paket-SHA-256
`a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b`,
Repository-Revision `c06583c1a94e486ed5afe25cafe41ac8e16677b8` und Baum-SHA-256
`5ea0bbe9ba5776154155cfb2d9b390a1aaac5a672261172855eb382fc58dccca`.
Die kandidatengebundene Anleitungsentscheidung protokolliert diese Anforderung; frühere Freigaben
und Artefakte bleiben unverändert. Der native Befehl `prepare` fügt das exakte
34.586-Byte-Artefakt hinzu und schaltet den vom Backend ausgelieferten Index weiter. Sämtliche sichtbaren
Versionsbezeichnungen und der Download-Link leiten sich weiterhin aus diesem Index ab.

Fünfzig Marketplace-/Direktinstallations-Tests waren erfolgreich. Die Publikations-Unit- und Browser-Tests
bestanden für Deutsch/Englisch sowie Mobil/Desktop und prüften das sichtbare 1.1.7-Badge,
den Versionsvergleich, die Marketplace-Anweisungen und die tatsächlich heruntergeladenen Bytes
gegen den vorbereiteten Index. Fokussierte Lint- und Dokumentationsprüfungen waren erfolgreich; alle
zehn früheren Plugin-Archive bleiben byte-identisch. Da das Backend seinen
validierten Publikations-Snapshot pro Prozess zwischenspeichert, erfordert dieses Update neben der Aufnahme
der neuen Ressourcendateien das reguläre Backend-Deployment bzw. einen Neustart.

Diese Änderung ist lokal für den Commit und das Produktions-Deployment durch den Product Owner vorbereitet.
Sie stellt noch keine Aussage dar, dass die Live-Website bereits 1.1.7 ausliefert. Nach dem
Deployment muss `verify-public` sowohl den öffentlichen Index als auch den exakten
unveränderlichen Download bestätigen. Die vollständige Client-Abnahme steht weiterhin aus; die beobachtete
Version und der erfolgreiche Start belegen weder jeden Installations-/Update-Pfad
noch das wortgetreue Statusverhalten des Coachs.

## 1.1.6 Kandidat für explizites Weiterlernen, 14. September 2026

Der Product Owner gab vor, dass ein Lernplan zwar orientieren und priorisieren soll, jedoch niemals
ausdrücklich gewünschtes Lernen verhindern darf. Der Coach setzt ein aktives, noch nicht gemeistertes Lernziel fort oder
lässt das Backend ein erreichbares offenes Ziel des Personal Curriculum auswählen – selbst bei einem
Tageskontingent von null, leerem Rückstand, zukünftigen Plandaten oder ausgeschöpftem Plan. Server-Capabilities
autorisieren die Fortsetzung; Zählerstände verbieten sie nicht. Voraussetzungen (`requires`),
das automatische tägliche Anhalten sowie rein lesende Statusabfragen bleiben weiterhin durchgesetzt. Nach Erreichen
des Tagesziels wird verbleibender Rückstand als druckfreie Gelegenheit zum Aufholen angeboten;
eine Pause bleibt möglich, ohne zur primären Empfehlung zu werden.

Das sieben Dateien umfassende veröffentlichte Release-Dossier für 1.1.5 ist byte-identisch unter
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.5/` archiviert und per Hash geschützt.
Während der lokalen Kandidatenentwicklung starteten Publikations-, Anleitungs- und Real-Client-Nachweise
auf `pending`, während der ausgelieferte Index und die Anleitung ihre Bindung an 1.1.5 beibehielten.
Die Kandidatenvorbereitung aktualisiert diesen Index nicht und überträgt keine historische Anleitungsfreigabe.
Die gesonderten Veröffentlichungs- und Anleitungsentscheidungen für 1.1.6 sind nachfolgend dokumentiert.

Verwenden Sie für lokale Arbeiten `prepare-candidate` und `verify-candidate` wie unten beschrieben. Der reguläre
Befehl `verify` prüft die ausgelieferte Registry gegen ihr exakt referenziertes,
hash-geschütztes historisches Dossier, solange sie noch das vorherige Release benennt.
Er baut jenes veröffentlichte Artefakt nicht aus dem Nachfolger-Quellstand neu. Die separate
Kandidatenprüfung baut weiterhin den aktuellen Quellstand und verifiziert die exakten Bytes.

### Unabhängige Marketplace-Veröffentlichung und Download-Hochstufung

Für 1.1.6 prüft die Marketplace-CI das exakte Paket gegen den bereits grünen
SkillPilot-Commit `114ff08b29bcb259aaebf6be2a90aef659bcd886`. Sie verwendet den kanonischen
Builder aus dieser unveränderlichen Revision, vergleicht die sieben Paketdateien mit
dem geprüften Quellstand, verifiziert die exakte Archivgröße und den SHA-256 des Kandidaten
und gleicht das entpackte Archiv mit dem vollständigen Plugin-Verzeichnis ab. Beide
strikten Claude-Validierungen bleiben Pflicht. Zusätzliche Dateien, Symlinks, veränderter
Paketinhalt und fehlerhafte Kandidatenbindungen schlagen fail-closed fehl.

Damit entfällt die zirkuläre Anforderung, vor dem Bestehen des Marketplace-PRs bereits einen neuen
Website-Download ausliefern zu müssen. Auf die Download-Verifizierung wird dadurch nicht verzichtet: Der
öffentliche synthetische Check prüft weiterhin den tatsächlich ausgelieferten Index samt seinem unveränderlichen
Download, und eine spätere Hochstufung des Download-Index muss das neue öffentliche
Artefakt gesondert verifizieren. Keine frühere Anleitungs- oder Client-Freigabe geht auf 1.1.6 über.
Der Marketplace darf den Status `published_pending_acceptance` tragen, während der ausgelieferte Index
und seine unabhängig freigegebene Anleitung noch auf 1.1.5 verweisen. Dies dient der Entkopplung von
Veröffentlichungsschritten und behauptet nicht, dass sich eine bestehende Claude-Installation aktualisiert hat.

### Abgeschlossene 1.1.6 Marketplace-Veröffentlichung

Nachdem der Product Owner das Backend-Deployment und die grüne CI für den
SkillPilot-Commit `114ff08b29bcb259aaebf6be2a90aef659bcd886` bestätigt hatte, wurde die Marketplace-Übergabe
über [PR #8](https://github.com/enpasos/skillpilot-claude-marketplace/pull/8) abgeschlossen.
Die erforderliche [PR-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34881731641)
war vor dem SHA-geschützten Squash-Merge um `2026-09-14T18:38:41Z` erfolgreich.
Auch die [Main-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34882059869)
bestand für den veröffentlichten Commit.

`verify-repository` klonte den tatsächlichen öffentlichen Standard-Branch und wies den
vollständigen exportierten Baum, beide strikten Claude-Validierungen, die isolierte Installation
der HTTPS-Marketplace-Quelle sowie einen unveränderten Remote-HEAD nach:

- Repository-Revision: `2c009f47630132f6b14492b204c827f43ba21ba0`.
- Export: genau zwölf Dateien, Baum-SHA-256
  `e466966eb72f4470730aff5a5fa6e75f2bff5e6593642a18d89cacea201a5599`.
- Plugin: `1.1.6`, 34.263 Bytes, SHA-256
  `439ea142c3933333cb01d7a1051646041d61615089504b22a7d002fb637614ca`.

Die lokale Validierung umfasste 145 gezielte Node-Tests, ausführbare Ablehnungsfälle
für modifizierte Pakete und Workflow-Bindungen, App-Publikations-/Browser-Tests,
TypeScript sowie fokussiertes Linting. Der öffentliche schreibgeschützte synthetische Check war vor und
nach der Veröffentlichung erfolgreich, einschließlich des unverändert ausgelieferten 1.1.5-Downloads sowie der
OAuth-Discovery und nicht authentifizierten Challenge des Connectors. Es wurden kein zusätzliches Backend-Deployment,
keine Änderung von Zugangsdaten, keine Mutation von Lernendendaten und keine Hochstufung der Anleitung durchgeführt.

Zum Veröffentlichungszeitpunkt wurde lediglich `public-repository-default-branch` als `pass` erfasst,
woraus sich `published_pending_acceptance` ergab; die Anleitungsentscheidung sowie Installations-/Update-Nachweise
in echten Konten blieben ausstehend. Der nächste Abnahmeschritt besteht darin,
die installierte Version 1.1.6 in Claude zu bestätigen und das explizite Weiterlernen sowie
das Aufholen nach erfülltem Tageskontingent in einer frischen SkillPilot-Sitzung zu testen.

### Freigabe der Anleitung und Hochstufung des Website-Downloads, 14. September 2026

Nachdem der Product Owner gemeldet hatte, dass `/plugins` weiterhin 1.1.5 anzeigte, fragte der
Assistent ausdrücklich nach, ob Website und Download ebenfalls auf 1.1.6 aktualisiert,
geprüft und ausgerollt werden sollen. Der Product Owner antwortete mit **„ja bitte“**.
Diese neue kandidatengebundene Entscheidung wurde um `2026-09-14T18:46:17.000Z` protokolliert.
Sie autorisiert die bestehende Marketplace-zuerst-Anleitung und den Direktdatei-Fallback
für genau Version 1.1.6, Paket-SHA-256
`439ea142c3933333cb01d7a1051646041d61615089504b22a7d002fb637614ca`,
veröffentlichte Repository-Revision `2c009f47630132f6b14492b204c827f43ba21ba0`
und Baum-SHA-256
`e466966eb72f4470730aff5a5fa6e75f2bff5e6593642a18d89cacea201a5599`.

`activation.firstPartyGuideDecision` steht nun auf `approved`,
`marketplaceUiSwitchAllowed=true` und `firstPartyUiRoute=personal_git_marketplace`.
Der native Direktinstallations-Befehl `prepare` schaltet den Website-Index weiter und
legt das exakte reproduzierbare 34.263-Byte-Archiv ab, ohne ein früheres
Artefakt zu verändern. Die Seite leitet ihr Badge, den Vergleichstext und den Download aus diesem
validierten Index ab; es wird keine separat fest codierte Versionsbezeichnung eingeführt.

Dies ist eine Anleitungs- und Deployment-Freigabe, keine Abnahme auf Kontoebene. Sowohl die
Marketplace-Installations-/Update-Einträge als auch die exakten Client-Direktinstallations-Einträge
bleiben ausstehend; die Aktivierung verbleibt auf `published_pending_acceptance` und
`openPublicBetaReady=false`. Weder Plugin-Payload, Zugangsdaten, Autorisierung
noch Sitzungsgrenzen oder Lernendendaten werden geändert. Die lokale Vorbereitung stellt keine
Behauptung eines abgeschlossenen Produktions-Deployments dar; der öffentliche Index und der exakte Download
müssen nach erfolgreichem Abschluss des regulären Deployments verifiziert werden.

## 1.1.5 Konsolidierung der Anweisungen, 12. September 2026

Der Product Owner autorisierte das Entfernen überlappender Claude-Anweisungen unter
Wahrung der Coaching-Semantik, eine unabhängige Regressionsverifizierung sowie einen
vollständigen Produktions- und Marketplace-Rollout nach grüner CI.

Der kompakte Skill steuert nun den gemeinsamen Coaching-Ablauf. Die Abläufe für Verified Recall und Prüfungen
wandern in bedingte Referenzdateien; die doppelt vorhandene Datei `coaching-policy.md`
wird aus dem aktuellen Paket entfernt. Ihre historischen Bytes bleiben im
unveränderlichen 1.1.4-Artefakt erhalten. Das aktuelle Paket umfasst sieben per Allowlist freigegebene Dateien
und erzeugt einen zwölf Dateien umfassenden Marketplace-Baum. Die vierzehn Tools, Bewertungskriterien,
Datenschutzvorgaben, geschützten Antworten sowie OAuth-, Sitzungs- und Fortschrittsgrenzen
bleiben unverändert. Diese Bereinigung der Anweisungen öffnet weder unzulässige Chat-Feedback-Felder
wieder noch impliziert sie eine Host-Abnahme.

Das vollständige, sieben Dateien umfassende Release-Dossier für 1.1.4 ist byte-identisch unter
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.4/` archiviert; der Release-Checker
schützt dessen exakte Hashes. Keine Repository-, Anleitungs- oder Real-Client-Freigabe wird
an 1.1.5 vererbt. Neue Nachweise begannen auf `pending`. Der finale Anweisungsinhalt,
das unveränderliche Artefakt und der lokale Publikationsindex wurden vor dem Rollout validiert.
Produktions- und Marketplace-Veröffentlichung erfolgten nach grüner CI wie unten dokumentiert;
lediglich der unabhängig verifizierte Repository-Nachweis steht nun auf `pass`.

### Umfang der lokalen Verifizierung

Der zuvor obligatorische Skill samt Richtlinie umfasste 40.643 UTF-8-Bytes. Der
gemeinsame 1.1.5-Skill umfasst 11.131 Bytes, also rund 72,6 % weniger Anweisungstext beim regulären
Sitzungsstart. Die Abläufe für Verified Recall und Prüfungen liegen als separate bedingte
Referenzen vor (1.692 und 1.513 Bytes); alle drei Anweisungsdateien zusammen ergeben 14.336
Bytes. Hierbei handelt es sich um Quellgrößenmessungen, nicht um beobachtete Claude-Lesevorgänge,
Token-Verbräuche, Latenzen oder Abnahmen auf Kontoebene.

Eine unabhängige prüfende Instanz bewertete anhand des Anweisungstextes vierzehn synthetische Entscheidungsfälle sowie drei
kombinierte Fälle aus Tageszielerfüllung und Fachwechsel.
Alle siebzehn Entscheidungen bestanden das abgegrenzte Review: Eine reine Statusabfrage löst keinen
Schreibvorgang aus; ein Fachwunsch nach erfülltem Tagespensum erfordert eine Rückfrage zur
freiwilligen Zusatzarbeit, sofern diese Absicht nicht bereits explizit vorliegt; explizites freiwilliges
Weiterlernen verwendet ausschließlich die aktuell veröffentlichte Fachoption und `stateVersion`.
Diese rein anweisungsbasierte Simulation rief keinen echten Claude-Host auf und führte keine
Produktions-Tools aus; vollständige ausführbare Backend-Fixtures wurden hierfür nicht übergeben.
Unabhängig davon bestanden vierzig lokale Backend-Tests über sieben Vertragsklassen hinweg ohne
Fehlschläge oder Überspringungen und deckten Prüfungen, Visualisierung, Lernpläne, Mastery,
Gedächtnistraining sowie Verified Recall ab. Diese Prüfungen ergänzen die Abnahme im echten Client
und das gemessene Host-Verhalten, ersetzen sie jedoch nicht.

Der erste vollständige [CI-Lauf](https://github.com/enpasos/skillpilot/actions/runs/34696935964)
bestand alle Zweige mit Ausnahme einer OAuth-Integrations-Assertion. Deren drei Consent-Weiterleitungen
waren erfolgreich, doch `verifyNoInteractions(connectionService)` erkannte einen
unabhängigen Aufruf. Eine lokale Negativreproduktion mit einem Bereinigungsintervall von einer Millisekunde
reproduzierte diesen Fehlschlag; die importierte OAuth-Konfiguration
aktiviert das Scheduling auf dem gemockten Connection-Service. Die HTTP-Flow-Fixture stellt nun
einen inaktiven reinen Test-Scheduler bereit, behält jedoch sowohl dieses enge Intervall
als auch jede No-Interaction-Assertion bei. Mit dieser Isolierung bestehen alle drei Tests.
Das Produktions-Scheduling und das OAuth-Verhalten bleiben unverändert. Gradle gibt nun vollständige
Fehler-Exceptions, Ursachen und Stacktraces aus, ohne das Standard-Stream-Logging zu aktivieren.
Der ursprünglich fehlgeschlagene Lauf autorisiert kein Deployment; der korrigierte
Commit erfordert einen neuen grünen Gesamtlauf der CI.

Die erweiterte lokale OAuth-Suite legte zudem einen von der Echtzeit abhängigen CIMD-Test offen:
Eine Ein-Sekunden-Laufzeit-Assertion enthielt die Scheduling-Latenz der JVM. Der Test
weist nun kausal nach, dass der Startvorgang zurückkehrt, während der gestartete Resolver blockiert bleibt,
und dass zwanzig Wiederholungsversuche weiterhin genau einen Abruf auslösen. Ein separater
Deadlock-Schutz im Test-Harness ersetzt die Stoppuhr; das Testversuchsbudget von 50 ms,
die harte Produktionsobergrenze von sechs Sekunden sowie die Retry-/Cache-Richtlinie bleiben unverändert.
Alle 106 erweiterten OAuth- und Connection-Service-Tests waren danach lokal erfolgreich. Dabei
handelt es sich um reine Testkorrekturen, nicht um Änderungen an der Produktionsautorisierung oder am Scheduling.

### Abgeschlossener 1.1.5 Produktions- und Marketplace-Rollout

Alle fünf Quell-Push-Workflows waren auf
`13726bb00b8ae55fec40141eed415346ffa69633` erfolgreich, bevor die Produktion geändert wurde:
[34698744283](https://github.com/enpasos/skillpilot/actions/runs/34698744283),
[34698744194](https://github.com/enpasos/skillpilot/actions/runs/34698744194),
[34698744257](https://github.com/enpasos/skillpilot/actions/runs/34698744257),
[34698744337](https://github.com/enpasos/skillpilot/actions/runs/34698744337) und
[34698744205](https://github.com/enpasos/skillpilot/actions/runs/34698744205).
Auch der vollständige lokale Backend-Lauf war erfolgreich: 202 Suiten, 1.788 Tests, null Fehlschläge
und neun übersprungene Tests. Zwanzig Marketplace-Regressionstests waren erfolgreich. Diese Prüfungen
ersetzen keine Claude-Abnahme auf Kontoebene.

Vor dem Deployment wurde unter
`/home/enpasos/backups/skillpilot-predeploy-1.1.5-6kwlUBtY` ein frisches zugriffsbeschränktes Backup angelegt.
Das SQL-Backup umfasst 10.620.167 Bytes mit Modus `0600`; Datenschutzprüfungen vor
und nach der Erstellung waren erfolgreich, ohne unzulässiges Feedback als Nachweis zu exportieren.
Das archivierte vorherige Server-JAR hat den SHA-256
`59e62af381a3f87ca757f689c197b7708467547d0b6547728c37e819098c1e9d`.
Dies dokumentiert die Backup-Erstellung, jedoch keinen Wiederherstellungstest. Da der Dienst über
`bootRun` startet, stellt dieses JAR allein keinen vollständigen Laufzeit-Rollback dar; ein Rollback muss
zudem den vorgesehenen Quellstand und die neu gebauten Ressourcen wiederherstellen, ohne
Lernendendaten oder unabhängige generierte Dateien zu überschreiben.

Der exakte grüne Quellstand wurde über `./deploy_skillpilot.sh` ausgerollt. Der
Produktions-Build, fokussierte Sicherheitstests, öffentliches Artefakt, Frontend-Shell,
KI-Transparenz, OpenAI-mTLS-/Routenmatrix sowie Quellbegründungs-Prüfungen waren allesamt erfolgreich.
Die Betriebsbereitschaftsprüfung lieferte nach 40 Sekunden HTTP 200 zurück. Der Dienst ging um
`2026-09-12T14:56:49Z` mit `NRestarts=0` aktiv, und OpenAI-mTLS blieb auf `enforce`.
Das neue Deployment-JAR hat den SHA-256
`de70d9b515ff6e68ba2f0aab1e3a5e656dff2614471b5df0f490a2867fd618ad`.
Der optionale Vergleich der OpenAI-Apps-Challenge wurde übersprungen, da keine erwartete
Challenge übergeben wurde. Alle acht öffentlichen synthetischen Claude-Checks bestanden um
`2026-09-12T14:58:01.369Z`; der geplante Support-Check
[war im zweiten Versuch erfolgreich](https://github.com/enpasos/skillpilot/actions/runs/34699176733)
um `2026-09-12T15:02:08Z`, nachdem das Artefakt live geschaltet war.

Auf Wunsch des Product Owners konzentriert sich die Marketplace-README nun auf 1.1.5
und erläutert, dass während eines früheren Beta-Releases automatische Updates in zwei Claude-Konten
beobachtet wurden. Sie besagt nicht mehr fälschlich, dass eine Repository-Veröffentlichung
eine bestehende Installation nicht aktualisieren könne. Dies erhebt keinen Anspruch darauf, dass alle Konten
oder genau diese beiden Konten 1.1.5 erhalten haben. Diese Klarstellungen in README und Changelog
änderten ausschließlich den Marketplace-Publikationsbaum, nicht das Plugin-Artefakt.

[Publikations-PR #7](https://github.com/enpasos/skillpilot-claude-marketplace/pull/7)
wurde zusammengeführt. `node scripts/claude_marketplace_release.mjs verify-repository`
verifizierte daraufhin den tatsächlichen öffentlichen HTTPS-Standard-Branch, sein abgeschlossenes Dateiverzeichnis,
beide strikten Claude-Validierungen sowie eine isolierte Installation aus diesem Repository:

- Repository-Revision: `228f6bd59f30fa03e3f0e44fa69ffaa122f98323`;
- Verifizierungszeitstempel: `2026-09-12T15:03:16.000Z`;
- Publikationsverzeichnis: 12 Dateien;
- Baum-SHA-256: `c854f82f337200a75ee9ad1078d1f22b8c219e5e4543e0fa62da38a19b24f4b2`;
- Plugin: 1.1.5, 32.535 Bytes, SHA-256
  `8b1713178bbb289bc0b6669afa6e60328f2b362d42651353a78a869fe6aa76c1`;
- [Standard-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34701054308):
  erfolgreich auf exakt dieser Revision, beobachtet um `2026-09-12T15:04:23Z`.

Lediglich `public-repository-default-branch` ist als `pass` erfasst; die Aktivierung steht auf
`published_pending_acceptance`. Neuinstallation im bereinigten Konto, Update und Migration in echten Konten,
weitere Real-Client-Abnahmen sowie die Entscheidung zur First-Party-Anleitung
stehen weiterhin aus. `marketplaceUiSwitchAllowed=false`; die First-Party-Route bleibt
`controlled_direct_install_beta`. Weder ein Artefakt noch eine historische Freigabe wurde neu gebunden.

## 1.1.4 Datenschutzkorrektur, 12. September 2026

Der Product Owner forderte die Entfernung von `workFeedback`, `outcomeFeedback` und
Recall-`feedback` und autorisierte anschließend das Deployment sowohl des korrigierten Backends
als auch des Claude-Marketplace nach bestandener CI. Claude formuliert sein Feedback und
seine Erfolgsmeldungen selbst im Chat; der Core akzeptiert ausschließlich strukturierte Abschlussergebnisse.

Dies verkleinert bewusst das Eingabeschema und ist nicht abwärtskompatibel
mit zwischengespeicherten alten Tool-Eingaben. Die Korrektur innerhalb der kontrollierten Beta lässt Plugin-,
Tool- und OAuth-Identitäten, Sitzungsgrenzen sowie die Hoheit über den Lernfortschritt unverändert.
Rollen Sie zuerst das korrigierte Backend samt dem unveränderlichen 1.1.4-Artefakt aus, veröffentlichen Sie danach
den exakten Marketplace-Baum und aktualisieren Sie installierte Plugin-/Connector-Kataloge.
Bestätigen Sie in einer frischen Claude-Sitzung die installierte Version sowie einen erfolgreichen Mastery-Schreibvorgang.
Stellen Sie die unzulässigen Textfelder niemals als Kompatibilitäts-Workaround wieder her.

Das vollständige, sieben Dateien umfassende Release-Dossier für 1.1.3 ist unter
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.3/` archiviert, wobei unveränderliche Hashes
durch den Release-Checker erzwungen werden. Sämtliche Repository-, Anleitungs- und Real-Client-Nachweise
für 1.1.4 beginnen auf `pending`; historische automatische Updates begründen keine Abnahme
eines neuen Kandidaten. Die lokale Vorbereitung behebt Abweichungen zwischen Artefakt und Index, ohne
ein bereits veröffentlichtes Artefakt zu überschreiben. Veröffentlichungs- und Produktionsnachweise dürfen
erst dann protokolliert werden, wenn der jeweilige Vorgang tatsächlich erfolgreich abgeschlossen wurde.

### Abgeschlossener Produktions- und Marketplace-Rollout

Der Product Owner autorisierte den eigenständigen Abschluss beider Deployments unter der Voraussetzung
einer zuvor grünen CI. Die vollständige [Anwendungs-CI](https://github.com/enpasos/skillpilot/actions/runs/34691209861)
und das [Dokumentations-Deployment](https://github.com/enpasos/skillpilot/actions/runs/34691209879)
waren auf `f28ce87e4d792c75649b01da20bc5f32cd709ad8` erfolgreich, bevor die Produktion geändert wurde.
Die ursprünglichen Fehlschläge resultierten aus der veralteten 1.1.3-Artefaktbindung und einem fehlenden
Eintrag im Dokumentationsindex. Ein nachfolgender Frontend-Fehler legte einen Test offen, der
eine Veröffentlichung bereits vor der CI voraussetzte und den alten 1.1.3-Repository-Baum fixierte; er
prüft die vorbereiteten und separat verifizierten Publikationszustände nun korrekt.

Die Produktion wurde exakt aus diesem Commit über `./deploy_skillpilot.sh` ausgerollt.
Zuvor wurden ein frisches zugriffsbeschränktes Datenbank-Backup sowie eine hash-verifizierte Kopie des vorherigen
Server-Artefakts gesichert. Die Vorabprüfung der Datenbank und die Nachprüfung des frischen Backups
fanden keinen der unzulässigen Feedback-JSON-Schlüssel; es wurde kein Feedback-Text als
Vorfallsnachweis exportiert. Dies ist weder ein Wiederherstellungstest noch eine Aussage über ältere Backups.
Da die Git-SSH-Authentifizierung des Servers nicht verfügbar war, wurde der exakte öffentliche Quellstand
über HTTPS abgerufen, ohne Zugangsdaten oder die Git-Konfiguration zu ändern.
Das bestehende Deployment generierte die kanonischen Laufzeit-Deck-Kopien; diese
generierten Änderungen im Produktions-Worktree sind keine zusätzlichen Quelländerungen des Releases.

Produktions-Build, fokussierte Backend-Sicherheitstests, öffentliches Artefakt, Frontend-Shell,
KI-Transparenz, OpenAI-mTLS-/Routenmatrix und Quellbegründungs-Prüfungen
waren erfolgreich. Die Betriebsbereitschaftsprüfung lieferte nach 45 Sekunden HTTP 200 zurück. Der Dienst ging
um `2026-09-12T12:13:17Z` mit `NRestarts=0` aktiv; OpenAI-mTLS blieb auf `enforce`.
Der optionale Vergleich der OpenAI-Apps-Challenge wurde übersprungen, da keine erwartete
Challenge übergeben wurde. Alle acht anmeldedatenfreien synthetischen Claude-Support-Checks
bestanden um `2026-09-12T12:14:27.976Z`. Auch der frühere geplante Versionsabweichungs-Alarm
[bestand beim erneuten Lauf](https://github.com/enpasos/skillpilot/actions/runs/34690832224),
nachdem das neue Artefakt live war.

[Publikations-PR #6](https://github.com/enpasos/skillpilot-claude-marketplace/pull/6)
bestand die erforderliche Validierung und das automatische Review und wurde anschließend zusammengeführt. Die Verifizierung
mittels `node scripts/claude_marketplace_release.mjs verify-repository` wies Folgendes nach:

- Revision des öffentlichen Standard-Branchs: `91d6646c64ebeda9afa3b729f10a4859c360d69e`;
- Verifizierungszeitstempel: `2026-09-12T12:18:50.000Z`;
- abgeschlossenes Publikationsverzeichnis: 11 Dateien;
- Baum-SHA-256: `dd8bf77fa63ac8d1fd3747bf5b7ba3785780742c04945d3e649d77ff558003b7`;
- Plugin: 1.1.4, 58.290 Bytes, SHA-256
  `0b1aa078fa140f95a83f3ef699c1b2130ac3c2e9b4624e02cb84f859d5612831`;
- strikte Marketplace-/Plugin-Validierung und isolierte Installation aus dem
  tatsächlichen öffentlichen HTTPS-Repository: erfolgreich;
- [Standard-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34693308362): erfolgreich.

Lediglich der Nachweis `public-repository-default-branch` des aktuellen Kandidaten ist
als `pass` erfasst; die Aktivierung steht auf `published_pending_acceptance`. Die Nachweise für Anleitung,
Update im echten Konto, Neuinstallation im bereinigten Konto sowie weitere Real-Client-Abnahmen
bleiben ausstehend. Keine frühere Freigabe wird vererbt, und es wird kein automatisches
Update im Claude-Konto von Nutzenden behauptet. Bestätigen Sie die installierte Version 1.1.4,
aktualisieren Sie bei Bedarf die Connector-Tools und starten Sie eine frische SkillPilot-Lernsitzung,
um einen tatsächlichen Mastery-Schreibvorgang mit dem neuen Eingabevertrag zu verifizieren.

## 1.1.3 Produktions- und Marketplace-Veröffentlichung, 12. September 2026

Der Product Owner autorisierte ausdrücklich sowohl das Produktions-Deployment als auch die
anschließende Veröffentlichung des vorbereiteten Pakets 1.1.3. Die Produktion wurde
aus `f455074b18a7d4bc03efbe0c3112c344403a0f9a` über
`./deploy_skillpilot.sh` ausgerollt, nachdem ein zugriffsbeschränktes Datenbank-Backup angelegt und
das vorherige Server-Artefakt gesichert worden war. Das Update behebt die beiden veralteten Whitepaper-Bild-Digests
und synchronisiert deren Laufzeitkopien, ohne Bestandszahlen
oder Review-Aussagen zu verändern. Die Liquibase-Migration `033-add-learner-goal-completions`
steht auf `EXECUTED`; der Dienst läuft mit `NRestarts=0`.

Das Deployment schloss seinen Build sowie die Prüfungen für fokussierte Backend-Sicherheitstests, öffentliche
Betriebsbereitschaft, exaktes Claude-Artefakt, Frontend-Ressourcen, KI-Transparenz,
OpenAI-mTLS-/Routenmatrix und Quellbegründung erfolgreich ab. Der optionale Vergleich der OpenAI-Apps-Challenge
wurde übersprungen, da dieser Prüfung keine erwartete Challenge übergeben wurde;
dies erhebt keinen Anspruch auf eine Challenge- oder Real-Host-Abnahme.
Alle acht öffentlichen synthetischen Claude-Support-Checks bestanden um
`2026-09-12T06:31:26.766Z` und banden das unten aufgeführte 1.1.3-Artefakt.

[Publikations-PR #5](https://github.com/enpasos/skillpilot-claude-marketplace/pull/5)
bestand die erforderliche Marketplace-Validierung und wurde zusammengeführt. Die Verifizierung des
tatsächlichen öffentlichen Standard-Branchs mit `verify-repository` wies anschließend nach:

- Repository-Revision: `f2d22431f84278f62cc37d8ebbe0bb92295aec13`;
- Verifizierungszeitstempel: `2026-09-12T06:33:19.000Z`;
- abgeschlossenes Publikationsverzeichnis: 11 Dateien;
- Baum-SHA-256: `96675808155fa7d48b5890c617975ba8b25964ec20dcf01c3ab184408d459799`;
- Plugin: 1.1.3, 56.661 Bytes, SHA-256
  `0e0b951233d72c0dd68b2cb2f631ae7fbdd1ad2411d373d60f9414bf0019f663`;
- beide strikten Claude-Validierungen und eine isolierte Installation aus dem tatsächlichen öffentlichen
  HTTPS-Repository waren erfolgreich; auch die
  [Standard-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34678417257)
  war erfolgreich.

Lediglich `public-repository-default-branch` steht nun auf `pass`; die Aktivierung lautet
`published_pending_acceptance`. Anleitungsentscheidung, Neuinstallation im bereinigten Konto,
Aktualisierung im echten Konto sowie Datenschutz-, Rechts- und Support-Abnahme stehen weiterhin aus.
`marketplaceUiSwitchAllowed=false`, die First-Party-Anleitung bleibt
`controlled_direct_install_beta` und `openPublicBetaReady=false`.
Die Veröffentlichung aktualisiert keine bestehende Claude-Installation und begründet keine
Abnahme im echten Client. Die sechs unveränderlichen paketierten Dateien behalten ihren
Text vom Vorbereitungszeitpunkt; die Wurzel-README des Marketplace und das Changelog beschreiben die
nachfolgende Veröffentlichung. Weder ein früheres Paket noch eine historische Freigabe wurde neu gebunden.

### Erstes beobachtetes automatisches Update in zwei Claude-Konten

Am **12. September 2026**, nach der Veröffentlichung von 1.1.3, berichtete der Product Owner,
dass sich die installierte Plugin-Version **in zwei Claude-Konten automatisch auf 1.1.3
aktualisiert** hatte. Dies ist das erste gemeldete automatische Update in echten Konten innerhalb
dieser Release-Historie über die oben genannten Repository- und isolierten Installationsprüfungen hinaus.

Hierbei handelt es sich um eine Beobachtung des Product Owners, nicht um einen vom Agenten begleiteten Kontotest. Die
zuvor installierten Versionen, die genauen Clients und der Synchronisierungszeitpunkt wurden in
dieser Meldung nicht erfasst. Sie dokumentiert daher das erfolgreiche Versions-Update in zwei Konten,
ohne eine Neuinstallation in einem frischen Konto, unveränderte OAuth-Konnektivität,
einen vollständigen Coaching-Abnahmelauf oder wiederholbare automatische
Updates auf jedem Client zu beanspruchen. Beim nächsten Release sollte ausdrücklich festgehalten werden, ob sich
dieselben Konten erneut aktualisieren; das Wiederholbarkeits-Gate über zwei aufeinanderfolgende Updates sowie
die übrigen Abnahmenachweise bleiben ausstehend.

## Historische lokale Vorbereitung 1.1.3, 11. September 2026

Das Folgende dokumentiert den Zustand vor der oben beschriebenen Veröffentlichung.

Der Product Owner autorisierte die lokale Vorbereitung über den unten aufgeführten bestehenden
Kandidaten-Workflow. Heute neu abgeschlossene fällige Planziele – einschließlich älterer fälliger
Ziele – zählen auf das stabile Tageskontingent des jeweiligen Fachs ein. Das automatische Weiterlernen
stoppt beim Erreichen des Tagesziels; weitere Arbeit erfolgt freiwillig, und zusätzliche Abschlüsse werden
gesondert gewürdigt. Das Backend führt die Hoheit über Abschlussnachweise und Zähler.
Rückstände werden bei angeforderten Details angezeigt, ohne wiederholte Routinewarnung.

Das neue lokale Direktinstallations-Artefakt umfasst 56.661 Bytes mit SHA-256
`0e0b951233d72c0dd68b2cb2f631ae7fbdd1ad2411d373d60f9414bf0019f663`.
Das lokale `prepare` schaltet den eingecheckten Publikationsindex auf 1.1.3 weiter und legt
das neue Artefakt additiv ab. Jedes frühere Artefakt behält seine exakten Bytes. Das
vollständige ehemals aktive Dossier bleibt unter
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.2/` erhalten, einschließlich der
Freigaben für veröffentlichtes Repository und Anleitung; seine Datei-Hashes werden vom
Release-Checker geprüft. Keine dieser kandidatengebundenen Freigaben geht auf 1.1.3 über.

Für den neuen Kandidaten lautet der Marketplace-Status `prepared_not_published`, Repository-
und exakte Client-Nachweise stehen auf `pending`, die Anleitungsentscheidung steht auf `pending` und
`marketplaceUiSwitchAllowed=false`. Folglich kehrt die lokale First-Party-Anleitungsroute
zu `controlled_direct_install_beta` zurück. Dies entspricht dem bestehenden
Fail-Closed-Kandidatenverhalten; die zuvor ausgerollte 1.1.2-Anleitung wird
durch diese lokalen Dateien nicht verändert. Web-, Android-/Voice-, Datenschutz-, Rechts- und Support-Abnahmen
bleiben ausstehend. Der generierte Repository-Baum existiert ausschließlich lokal.

Die lokale Validierung war erfolgreich: 123 fokussierte Paket-, Archiv-, Release-, Direktinstallations-
und Marketplace-Tests; deterministische Artefaktverifizierung; beide strikten CLI-Validierungen
sowie ein Installations-Smoke-Test in einem isolierten Claude-Profil.
Der generierte, 11 Dateien umfassende Baum hat den SHA-256
`99881a8624dcf38eda781681397d7d4a9eaa657bab0923c3c0031a14ec86868d`.
Der Release-Checker meldet `STRUCTURAL_PASS`, während alle 15 formalen Release-Gates
weiterhin ausstehen. Diese lokalen Ergebnisse begründen keine Abnahme im echten Client.

Diese Arbeiten führen weder ein Deployment noch eine Veröffentlichung durch, aktualisieren nicht das entfernte Marketplace-Repository,
ändern keine Zugangsdaten und protokollieren keine Host-Abnahme. Die historische OpenAI-Review-Sperre
ist aufgehoben; die laufende Entwicklung folgt der ausdrücklichen Nachfolgeautorisierung
in `AGENTS.md`. Ältere Freeze-Verweise weiter unten behalten ihren
historischen Kontext und schränken diese lokale Vorbereitung nicht ein.

## Historische First-Party-Anleitung 1.1.2: Marketplace und Datei-Fallback, 9. September 2026

Dieser Abschnitt bewahrt die Anleitungsentscheidung zu 1.1.2. Er gibt weder den neuen
lokalen Kandidaten 1.1.3 noch dessen Marketplace-Route frei; der aktuelle Kandidatenstatus ist
oben dokumentiert.

Nach Sichtung der neuen Beobachtungen aus dem persönlichen Konto autorisierte der Product Owner
ausdrücklich die Umsetzung einer Marketplace-zuerst-Installations- und
Update-Anleitung mit **Download/Upload als nutzbarem Fallback**. Dies ist eine neue,
rein auf die Anleitung bezogene Entscheidung und keine Schlussfolgerung aus einem sichtbaren Menü. Sie ersetzt die
Direktinstallations-Empfehlung vom 8. September sowie die Beschränkung auf reine Dokumentation
innerhalb der übergebenen r2-Übergabe ausschließlich für diese abgegrenzte First-Party-Anleitung.

Die separate Entscheidung `activation.firstPartyGuideDecision` ist um
`2026-09-09T08:02:01.000Z` durch `product-owner` freigegeben und an den bestehenden veröffentlichten
Kandidaten 1.1.2, den unveränderlichen Artefakt-SHA-256 sowie die unten aufgeführte verifizierte Repository-Revision samt Baum
gebunden. `firstPartyUiRoute = personal_git_marketplace` und
`marketplaceUiSwitchAllowed = true` autorisieren die Controlled-Beta-Anleitung.
`activation.state` bleibt auf `published_pending_acceptance`. Der ursprüngliche
Repository-Nachweis ist unverändert; Neuinstallation im bereinigten Konto, Migration/Aktualisierung
sowie sämtliche offenen exakten Client-, Datenschutz-, Rechts- und Support-Prüfungen bleiben
ausstehend. Es wird keine Abnahme für automatische Updates, unabhängige Konten oder native Mobil-Clients
abgeleitet. Diese Änderung veröffentlicht weder ein neues Plugin noch einen neuen Marketplace-Baum,
rollt die Anwendung nicht aus, ändert keine GitHub-Berechtigungen und bedient kein Claude-Konto.

Die genaue Abgrenzung ist in
[Freeze-Anhang 6.72](openai-plugin-v1-review-freeze.md#672-marketplace-anleitung-mit-manuellem-update-und-datei-fallback) festgehalten.
An Nutzende gerichtete Anweisungen und die aufbewahrte Vorfallshistorie werden in der
[persönlichen Installations- und Update-Anleitung](claude-personal-plugin-update-options.md) gepflegt.

### Beobachtete Navigation und die beiden Installationspfade

[Plugin-Verwaltung in Claude öffnen](https://claude.ai/new#customize/plugins/discover)
öffnet **Plugins → Discover** im gemeldeten persönlichen Claude-Pro-Webkonto.
Die vollständige Hash-Route ist lediglich ein Navigationslink, kein Aktualisierungsendpunkt und keine
garantierte clientübergreifende Schnittstelle. Falls sie nicht funktioniert, öffnen Sie den Plugin-Bereich in Claude
manuell. Hängen Sie an diesen Link niemals eine Lernenden-ID, Sitzung, ein Token oder GitHub-Zugangsdaten
an.

- **Neuinstallation:** Verwenden Sie das **Dropdown „Add“ oben rechts → Add
  marketplace → Add from a repository**, geben Sie die kanonische öffentliche Repository-URL
  ohne Query-Parameter ein und synchronisieren Sie die Quelle. Öffnen Sie **SkillPilot
  Coach v1** unter Discover und fügen Sie es nach Prüfung der angebotenen Version hinzu.
  Die in der beobachteten Oberfläche angezeigte Quelle lautet `skillpilot-claude-marketplace`; der
  interne Manifestname bleibt `skillpilot-marketplace`. Beides ist nicht der
  Plugin-Name. Eine Meldung „already added“ bedeutet, dass der Verwaltungspfad für bestehende Quellen
  zu nutzen ist, statt das Hinzufügen zu wiederholen.
- **Bestehende Installation:** **Add oben rechts → Manage marketplaces → ⋮
  neben `skillpilot-claude-marketplace` → Check for updates**. Die beobachteten
  deutschen Beschriftungen lauten **Hinzufügen → Marketplaces verwalten → Nach Updates
  suchen**. Verwechseln Sie nicht das globale Dropdown „Add“ mit der Schaltfläche „Add“ auf einer
  hervorgehobenen Plugin-Karte. Prüfen Sie den synchronisierten Katalog und die installierte Plugin-Version
  getrennt; das bloße Öffnen dieses Menüs oder ein neuer Synchronisierungszeitpunkt ist kein Beleg
  für eine erfolgte Installation. Bleibt die installierte Version alt, nutzen Sie den Datei-Fallback.
- **Datei-Fallback:** Laden Sie zuerst die aktuelle `.plugin`-Datei von SkillPilot herunter
  und entfernen Sie anschließend nur ein älteres SkillPilot-Plugin, falls ein Austausch nötig ist. Lassen Sie
  unabhängige Plugins/Connectoren unangetastet. Nutzen Sie erst danach **Add → Upload plugin**
  (**Hinzufügen → Plugin hochladen**) in Claude und behalten Sie genau eine aktive
  SkillPilot-Instanz bei. Überspringen Sie das Entfernen bei einer Neuinstallation; eine bereits aktuelle
  Installation erfordert weder Entfernen noch Neuinstallation. Versprechen Sie nicht, dass ein gleichnamiger
  Upload jede bestehende Installation stillschweigend ersetzt oder deren Verbindung erhält.
  Das Entfernen der Marketplace-Quelle ist keine Voraussetzung für diesen Pfad.
- **Beide Pfade enden auf dieselbe Weise:** Prüfen Sie die installierte Version und den
  mitgelieferten SkillPilot-Connector, verbinden Sie ihn bei Bedarf, kehren Sie dann zu SkillPilot zurück
  und starten Sie über die bestehende Übergabe eine neue Sitzung. Legen Sie keinen zweiten
  manuellen MCP-Connector an. Eine GitHub-Autorisierung ist nicht die SkillPilot-Verbindung.

Die Anleitung bezieht sämtliche Angaben zur aktuellen Version sowie den Download aus dem validierten
öffentlichen Publikationsindex. Sie enthält keine fest codierte Versionsbezeichnung
und schließt weder aus dem Download noch aus OAuth oder der Tab-Rückkehr auf die im Konto installierte Version.
Lade- und Fehlerzustände zeigen weder eine geschätzte Version noch ein älteres Artefakt an.
Dateidownload und Versionsvergleich setzen einen gültigen Index voraus. Die unabhängig
freigegebene Marketplace-Navigation bleibt verfügbar, falls der Index ausfällt; sie erhebt
keinen Anspruch auf Versionsübereinstimmung oder erfolgreiche Installation. Entfernen Sie keine bestehende
Installation, solange die aktuellen Versionsinformationen nicht verfügbar sind.

### Nachweise und Einschränkungen

Die interne Übergabe lautet **SkillPilot × Claude: persönliche Marketplaces,
Updates und GitHub-Rechte**, Revision **r2**, 9. September 2026. Der SHA-256 ihrer README
ist `9bd52977e8224ff0758d78d02ba6b653575173e276be49e39b2fc5c046c59c13`.
Dateinamen von Nachweisen werden hier aufgeführt, ohne ignorierte temporäre Dateien
zu Abhängigkeiten der veröffentlichten Dokumentation zu machen:

- E7, `07-direktlink-plugins-entdecken.png`: Discover-Ansicht; die genaue Zuordnung von URL zu Ansicht
  beruht auf dem Bericht des Nutzers, nicht auf einem authentifizierten Test durch den Assistenten.
- E8, `08-hinzufuegen-marketplaces-verwalten.png`: Menü „Hinzufügen“ oben rechts, einschließlich
  „Marketplaces verwalten“ und „Plugin hochladen“.
- E9, `09-marketplace-verwaltung-aktionsmenue.png`: „Nach Updates suchen“, „Automatisch
  synchronisieren“ und „Entfernen“ sowie der Warnhinweis, dass das Entfernen auch die Plugins dieser Quelle
  deinstalliert. Der synchronisierte Commit-Wert ist unkenntlich gemacht und wird nicht rekonstruiert.
- E3 zeigt die historisch synchronisierten Versionen 1.0.4 und 1.1.1, nicht die Abnahme der
  veröffentlichten Version 1.1.2. Die Inhaltshistorie belegt weder Rollback, Versionsfixierung, parallele
  aktive Versionen noch die Übernahme in einen bereits laufenden Chat.
- E6 zeigt die Zugriffsanfrage der GitHub-App, keine abgeschlossene Autorisierung.

Die frühere Aussage, eine Marketplace-Verwaltung fehle, ist für das
beobachtete Konto überholt: Der Pfad wurde zuvor nicht gefunden und ist nun sichtbar. Ob
Claude ihn später ausgerollt hat oder er übersehen wurde, ist unbekannt. Der reguläre Update-Pfad
ist nun dokumentiert, ein kontrolliertes Update von Version zu Version über genau diese
Aktion muss jedoch noch getestet werden. Die oben genannten englischen UI-Beschriftungen sind Übersetzungen
der deutschen Beobachtungen und kein separat verifizierter Nachweis aus einem englischsprachigen Client.

Die automatische Synchronisierung ist optional, und die Anleitung für Lernende verlässt sich nicht darauf. Die gezeigte
GitHub-App fordert Schreibrechte einschließlich Code und Workflows an. Verlangen Sie von
Lernenden niemals, Repository-Adminrechte zu vergeben oder alle Repositories zu autorisieren.
Wird GitHub-Zugriff angefordert, nutzen Sie den manuellen Pfad oder den Datei-Fallback. Jede
separat genehmigte Publisher-Einrichtung sollte auf das notwendige Repository beschränkt werden;
die Auswahl einzelner Repositories grenzt nur die Ressourcen ein, nicht die Berechtigungsarten der App.
Die Webhook-/PR-Merge-Regeln aus der Organisationsdokumentation belegen weder
die Auslöser noch die kontoübergreifende Verteilung persönlicher Pro-Marketplaces.

Das Entfernen eines Marketplace ist keine routinemäßige Fehlerbehebung für Updates: Es deinstalliert zugleich
die Plugins dieser Quelle und belegt keinen Widerruf des GitHub-App-Zugriffs.
Der historische `?v=2`-Workaround bleibt lediglich ein Vorfallsnachweis; die kanonische
Repository-URL ist unverändert. Installation in einem unabhängigen Konto, zwei aufeinanderfolgende
echte Updates, Vermeidung von Duplikaten, Erhalt der Verbindung sowie die Abdeckung nativer Clients
erfordern weiterhin ihre bestehenden Abnahmenachweise.

Die exportierte Wurzel-README des Marketplace bleibt Bestandteil des exakt bereits
veröffentlichten, 11 Dateien umfassenden Baums. Diese Anleitungsänderung bearbeitet diese Vorlage nicht stillschweigend,
macht deren Repository-Nachweis nicht ungültig und veröffentlicht die sechs unveränderlichen Plugin-Dateien nicht neu.
Eine spätere Aktualisierung jener externen README erfordert eine gesondert autorisierte,
reine Dokumentationsveröffentlichung samt frischer Verifizierung des exakten Baums.

## 1.1.2 Marketplace-Veröffentlichung, 9. September 2026

Dieser Unterabschnitt dokumentiert die Veröffentlichungsentscheidung und die Nachweise vor der späteren
oben beschriebenen Anleitungsentscheidung. Der ausstehende Anleitungsstatus und die reine Direktinstallations-Formulierung beschreiben
jenen Zeitpunkt; Repository- und Artefaktnachweise bleiben unverändert.

Der Product Owner beauftragte ausdrücklich die Veröffentlichung des aktuellen Plugins 1.1.2
über den bestehenden Marketplace unter seinem regulären Namen. Dies autorisiert die
abgegrenzte Repository-Veröffentlichung des bereits vorbereiteten Sechs-Dateien-Pakets,
reguläre Veröffentlichungsformulierungen in Marketplace-README und Changelog sowie exakte
Repository-Nachweise. Für dieses Release ersetzt dies die unten stehende Beschränkung auf reine Vorbereitung.
Es ändert weder die First-Party-Installationsanleitung
noch gibt es eine Installations- oder Update-Abnahme in echten Konten frei.

Der Marketplace bleibt `skillpilot-marketplace`, mit dem Plugin-Namen
`skillpilot-coach-v1` und dem vertrauten Titel **SkillPilot Coach v1**. Der Katalogname enthält weder eine
diagnostische Versionsnummer noch einen Zeitstempel. Die kanonische Repository-URL
bleibt `https://github.com/enpasos/skillpilot-claude-marketplace`.

Der exakte öffentliche Direktinstallations-Index und das Artefakt wurden am
9. September verifiziert: Version `1.1.2`, 55.266 Bytes, SHA-256
`835c91844f950d9101f74ef245916fc6a7d65f53426ae3939f3a224f7ab827ca`.
Der anmeldedatenfreie öffentliche synthetische Check bestand alle acht Prüfungen. Diese Ergebnisse
belegen ausschließlich die Verfügbarkeit des Artefakts und die geprüften öffentlichen Endpunkte.

Der generierte Publikationsbaum wurde in
[PR #4](https://github.com/enpasos/skillpilot-claude-marketplace/pull/4) zusammengeführt.
`verify-repository` war um `2026-09-09T04:24:02.000Z` gegen den tatsächlichen
öffentlichen `main`-Branch erfolgreich:

- Revision: `25bf4d8272030a3701008f7b5a09d4a18cba15c5`;
- abgeschlossenes Publikationsverzeichnis: 11 Dateien;
- Baum-SHA-256: `690e57846a250b49bb8ac2ac30b5bda0f7f4c1eaf50edc3c8de2561e1b03da66`;
- exakte Paketparität zu 1.1.2, beide strikten CLI-Validierungen sowie Installation aus
  dem tatsächlichen HTTPS-Repository in einem isolierten Profil: erfolgreich;
- [Standard-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34310773587): erfolgreich.

Lediglich `public-repository-default-branch` ist als `pass` erfasst; der Status lautet
`published_pending_acceptance`. Neuinstallation im bereinigten Konto, Migration/Aktualisierung bestehender Konten,
Freigabe der First-Party-Anleitung sowie sämtliche übrigen exakten Client- und
Betriebsbereitschaftsentscheidungen bleiben ausstehend.

Der Product Owner stellte klar, dass die gemeldete Synchronisierung auf 1.1.1
erst nach Hinzufügen der Repository-URL mit `?v=2` erfolgte. Dies ist ein vom Nutzer gemeldeter
Workaround für dieses Konto, jedoch weder ein Beleg dafür, dass eine Änderung des Katalognamens eine
automatische Synchronisierung auslöst, noch ein verifizierter Update-Pfad für 1.1.2. Die kanonische
URL und die Katalogidentität bleiben unverändert.

Die sechs paketierten Dateien, die beiden unveränderlichen Artefakte 1.1.1 und 1.1.2 sowie frühere
Release-Dossiers bleiben byte-identisch. Die paketierten Dateien README und SETUP behalten
ihren Wortlaut vom Vorbereitungszeitpunkt, da dieser Teil des unveränderlichen Artefakts ist;
dieses Runbook und die Wurzel-README des Marketplace beschreiben den späteren Veröffentlichungsstand.
Die aktuelle Anleitung unter `/plugins` nutzt weiterhin Download und Upload, nun
mit dem exakten 1.1.2-Artefakt. Ein Anwendungs-Deployment ist nicht Teil dieser
Marketplace-Veröffentlichung.

Die genaue Autorisierungsgrenze ist in
[Freeze-Anhang 6.70](openai-plugin-v1-review-freeze.md#670-claude-112-im-bestehenden-marketplace-veröffentlichen) festgehalten.

## Historische lokale Vorbereitung 1.1.2, 8. September 2026

Der Product Owner autorisierte ausschließlich die kompakte Tageszusammenfassung, passende
reine Claude-Serveranweisungen, Tests sowie die lokale Patch-Vorbereitung:
„Heute: 2 von 48 geschafft · noch offen: 19 Mathe, 27 Physik.“ Rückstände sind
nur bei Vorhandensein zu erwähnen, zum Beispiel „+ 5 überfällig“. Die Anzahl erledigter Ziele bleibt die
aktuell gemeisterte Teilmenge der heute fälligen Ziele, kein tagesbezogenes Ereignisprotokoll.
Warnhinweise zu nicht verfügbaren Plänen bleiben ausdrücklich bestehen.

Die aktuellen Quell-Manifeste und der lokal vorbereitete Publikationsindex benennen
1.1.2. Der Repository-Checker verlangt, dass dieser Index mit dem aktuellen Quellstand
und dem deterministischen Paket übereinstimmt; er ist kein Deployment-Nachweis. Der ausgerollte
Index, der unveränderliche 1.1.1-Download und das externe Marketplace-Repository bleiben
bis zu einem separat autorisierten Rollout unverändert. Das Release-Dossier für 1.1.1 ist
bytegenau unter `release/history/1.1.1/` archiviert; sein Nachweis zum veröffentlichten Repository
und die zurückgezogene Anleitungsentscheidung gehen nicht auf den neuen Kandidaten über.

Für 1.1.2 lautet der Marketplace-Status `prepared_not_published`; Nachweise zu Repository, Client,
Migration und Anleitungsentscheidung stehen auf `pending`. Auch externe Direktinstallations-Abnahmen
und Datenschutznachweise sind kandidatengebunden und stehen auf `pending`. Durch diese
Vorbereitung wird weder eine Veröffentlichung noch ein Deployment, ein Konto-Update, eine neue Support-Zusage oder eine
Marketplace-Hochstufung autorisiert. Führen Sie die öffentliche Verifizierung vor dem Rollout nicht als
Abnahmeprüfung aus: Die öffentliche Version weicht beabsichtigt ab.

## Historische Entscheidung zur First-Party-Anleitung: Download und Upload, 8. September 2026

Am **8. September 2026** berichtete der Product Owner, dass der Marketplace-Pfad
weiterhin nicht zuverlässig funktionierte, und forderte ausdrücklich die Anleitung zum direkten Herunterladen und
Hochladen unter `/plugins` an. Diese Entscheidung ersetzt die am 5. September dokumentierte First-Party-Empfehlung
für den Marketplace; die Veröffentlichung selbst und deren
ursprüngliche Nachweise weiter unten bleiben historische Tatsachen.

Die Anleitung nutzte zum Zeitpunkt dieser Entscheidung ausschließlich die bestehende unveränderliche `.plugin`-Datei **1.1.1**.
Laden Sie sie von SkillPilot herunter, entfernen Sie beim Ersetzen lediglich eine ältere SkillPilot-Installation,
laden Sie die heruntergeladene Datei in Claude hoch, verbinden Sie den im Plugin gebündelten
SkillPilot-Connector, kehren Sie dann zu SkillPilot zurück und starten Sie einen frischen Chat. Andere
Plugins und Connectoren bleiben unberührt. Eine separate manuelle MCP-Verbindung ist
nicht Teil der Installation. Gleichen Sie die in Claude installierte Version mit der
neben dem SkillPilot-Download angezeigten Version ab; die Seite kann die im Claude-Konto von Nutzenden
installierte Plugin-Version nicht auslesen und verspricht keine automatischen
Updates für hochgeladene Dateien.

`activation.firstPartyGuideDecision.status = withdrawn` bewahrt jeden ursprünglichen
Freigabezeitstempel, Freigebenden, Kandidaten-Digest, jede Repository-Revision, jeden Baum-Digest
sowie jede Nachweisreferenz. Der Validator prüft diese exakten Bindungen weiterhin. Die
Rücknahme setzt `marketplaceUiSwitchAllowed = false` und
`firstPartyUiRoute = controlled_direct_install_beta`; sie nimmt weder die Repository-Veröffentlichung zurück
noch ändert sie `published_pending_acceptance`. Sämtliche Repository-, Installations-
und Migrationsnachweise, Blocker der Direktinstallations-Bereitschaft, veröffentlichten Artefakt-Bytes
und Abnahmestatus bleiben unverändert. Eine erneute Marketplace-Hochstufung würde
eine neue ausdrückliche Entscheidung samt aktuellen passenden Nachweisen erfordern.

Die Autorisierung und ihre genaue First-Party-Abgrenzung sind in
[Freeze-Anhang 6.66](openai-plugin-v1-review-freeze.md#666-claude-installation-wieder-per-download-und-upload) festgehalten.

## Kontext der Marketplace-Veröffentlichung

Das kanonische Ziel lautet:

```text
https://github.com/enpasos/skillpilot-claude-marketplace
```

Solange
`ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json`
den Wert `activation.state = prepared_not_published` führt, ist dieses Repository keine
unterstützte Installationsquelle für den neuen Kandidaten. Die First-Party-Seite `/plugins`
muss für einen neuen Kandidaten jeden Claude-Installationspfad nicht verfügbar halten,
bis dessen exakte Direktinstallations- oder Marketplace-Route bewusst zum Testen
geöffnet wird. Sie darf 1.0.4 nicht
als Fallback anbieten. Eine Marketplace-Route erfordert zusätzlich ein verifiziertes Repository
sowie eine kandidaten- und revisionsgebundene Freigabe des Product Owners in
`activation.firstPartyGuideDecision`. Ein erfolgreicher lokaler Export verändert keinen dieser
beiden Zustände von sich aus. Der aktuelle Direktinstallationszweig meldet
`controlledBetaReady = false`, `guidedFirstPartyBetaReady = false` und
`openPublicBetaReady = false`; kandidatenspezifische Web-, Android- und Voice-Abnahme,
Datenschutzfreigabe, Rechtsfreigabe, Support-Bereitschaft sowie
exakte Client-Abnahme bleiben daher Blocker. Die abgegrenzte erste
Repository-Veröffentlichung darf erfolgen, während die exakte Client-Abnahme noch auf `pending` steht,
damit die Abnahme über die Marketplace-Installation selbst durchgeführt werden kann –
jedoch erst nach Bestehen der unten aufgeführten lokalen Prüfungen, Lieferkettenprüfungen und OpenAI-Freeze-Prüfungen
sowie nach ausdrücklicher Freigabe durch den Product Owner. Die Repository-Veröffentlichung allein macht
den Marketplace noch nicht zur primären First-Party-Route. Eine gesonderte Controlled-Beta-Anleitungsentscheidung
kann dies tun, ohne zu behaupten, dass die vollständige öffentliche Abnahme bestanden sei.

## Warum dies ein separates Repository ist

Anthropic akzeptiert ein Git-Repository mit einer Datei
`.claude-plugin/marketplace.json` als persönlichen Marketplace. Das SkillPilot-Monorepo
ist als solches Repository ungeeignet: Seine GitHub-Repository-Größe beträgt
derzeit mehrere GiB, sein Standard-Branch besitzt kein Marketplace-Manifest im
Repository-Wurzelverzeichnis, und Claude Web dokumentiert keine Sparse-Checkout-Option für
den persönlichen Ablauf **Add from a repository**. Die Bereitstellung des gesamten Anwendungs-Repositorys
würde zudem die Veröffentlichungsfläche weit über das geprüfte
Plugin hinaus vergrößern. Das Ziel-Repository ist daher ein kleiner, generierter Publikationsbaum.

Der Generator kopiert exakt die sieben in der bestehenden Allowlist `publicationFiles`
aufgeführten Dateien. Er kopiert niemals Pakettests, Builder, Release-Nachweise, Lernendendaten,
Sitzungen, Zugangsdaten oder sonstige Monorepo-Inhalte. Die exportierten Dateien sind
byte-identisch zum Direktinstallations-Kandidaten, dessen Version und SHA-256 im
Marketplace-Zweig fest gebunden sind.

## Korrigierter Vertrag

- Marketplace-Name: `skillpilot-marketplace`
- Stabiler technischer Plugin-Name: `skillpilot-coach-v1`
- Aktuell veröffentlichte Kandidatenversion: `1.1.13` (Website-Download und persönlicher Marketplace verifiziert)
- Plugin-Quelle: `./plugins/skillpilot-coach-v1`
- Maßgebliche Versionsquelle:
  ausschließlich `plugins/skillpilot-coach-v1/.claude-plugin/plugin.json`
- SHA-256 des aktuellen Kandidaten: die exakte Bindung in
  `ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json`;
  früher veröffentlichte Bindungen verbleiben in ihren archivierten Release-Dossiers.

Anthropic erlaubt, dass ein Marketplace-Eintragsname vom eingebetteten Plugin-Namen
abweicht. SkillPilot hält den technischen Namen bewusst identisch, dennoch speichert Claude
einen um den Marketplace qualifizierten Installationseintrag. Deshalb bleibt die Migration von
einer hochgeladenen Kopie ein expliziter Schritt. In `marketplace.json` wird kein `version`-Feld
wiederholt.

## Historischer harter Schnitt auf 1.1.1

Version 1.1.1 ersetzt jedes frühere Paket vollständig. Das öffentliche Marketplace-Repository
und die Direktinstallations-Registry dürfen alte Git-Stände bzw. unveränderliche
Artefakthistorie aufbewahren, doch First-Party-Anleitungen, der aktuelle Publikationsindex
und Abnahmeläufe dürfen ausschließlich 1.1.1 benennen. Ein Mischbetrieb aus 1.0.x und 1.1.1 sowie ein
Fallback auf 1.0.4 sind keine zulässigen Release-Modi. Die Marketplace-Route verbleibt auf
`prepared_not_published`, bis ihr exakter 1.1.1-Repository-Baum veröffentlicht und
verifiziert ist; die frühere Repository-Revision 1.0.4 kann dieses Gate nicht erfüllen.

Version 1.0.3 führte die historische Korrektur vor der öffentlichen Bereitstellung ein,
wonach Claude lediglich entscheidet, ob das aktuell aktive Lernziel abgeschlossen ist, während
das Backend den Abschluss persistiert, das Nachfolgeziel auswählt und dessen
kanonischen Kontext zurückgibt. Version 1.0.4 bewahrt diesen API-, Tool-Schema-, OAuth-,
Sitzungs- und Persistenzvertrag und korrigiert dessen an Lernende gerichtete
Anwendung. Version 1.1.1 behält diese Regeln bei und ergänzt:

- Bei jedem regulären Start oder Fortsetzen berichtet Claude zunächst je Fach die heute fälligen
  Ziele, die aktuell davon gemeisterte Teilmenge, die heute noch offenen Ziele, den offenen Rückstand
  sowie die fachübergreifenden Summen aus dem maßgeblichen Kontext `learningPlanToday`.
- Die Anzahl aktuell gemeisterter Ziele wird niemals als Ereignisprotokoll der an diesem
  Kalendertag erledigten Arbeit beschrieben.
- Jeder gültige Fachplan fließt in das Tagespensum ein. Nicht verfügbare Pläne erzeugen eine
  sichere Teildaten-Warnung ohne Kennungen für Pläne oder Skill-Landschaften.
- Ist kein aktives Lernziel vorhanden, ruft Claude
  `resume_skillpilot_learning_plan` nur dann auf, wenn der maßgebliche Kontext meldet, dass ein
  Kandidat verfügbar ist, und setzt anschließend das vom Backend ausgewählte Ziel ohne
  Umweg über **Weiterlernen** in der Web-App fort.
- Das vierzehnte Connector-eigene Tool,
  `switch_skillpilot_learning_plan_subject`, wechselt ausschließlich zu einem exakten
  lokalisierten Fach aus dem aktuellen Tagesplankontext. Es parkt ein noch nicht abgeschlossenes
  Ziel ohne Mastery, während jeder gültige Plan weiterhin mitzählt.

Die beibehaltenen Korrekturen aus 1.0.4 lauteten:

- Richtlinien-, Anweisungs-, Tool-Schema-, Parameter-, Retry- und interne Abwägungsmechaniken
  bleiben aus Text- und Sprachausgaben gegenüber Lernenden ausgeschlossen.
- Nach dem zugeschnittenen Orientierungsaustausch schließt eine eindeutige Start- oder Fortsetzungsabsicht
  die Orientierung ohne eine weitere Bestätigungsschleife ab. Claude
  schreibt diesen Abschluss sofort und fährt erst fort, nachdem das Backend ihn
  bestätigt hat.
- Reguläres Mastery-Feedback bleibt an Lernende gerichtet, während ein Übergang aus der Orientierung
  ohne Mastery-Bewertung oder interne Buchhaltung präsentiert wird.
- Ein zur Personalisierung des laufenden Gesprächs genutztes Thema wird niemals als
  dauerhaft gespeicherte Präferenz beschrieben; der aktuelle Connector besitzt keine solche
  Gedächtnisfunktion.

Die unveränderlichen Pakete 1.0.2, 1.0.3, 1.0.4 und 1.1.0 sowie ihre versionsspezifischen
Nachweise bleiben historische Aufzeichnungen. Sie werden weder überschrieben noch an neue
Bytes gebunden oder als Fallback hochgestuft. Jeder Nachweiseintrag für 1.1.1 zu exaktem Client, Datenschutz,
Marketplace-Repository, Installation, Migration und Anleitungsentscheidung
startet auf `pending`; keine frühere Freigabe geht auf den neuen Kandidaten über.

## Lokale Vorbereitung und Validierung

Prüfen Sie den Worktree und bewahren Sie unabhängige Änderungen. Verifizieren Sie zunächst die aufbewahrte
OpenAI-Review-Historie und das aktuelle autorisierte Nachfolgepaket:

```bash
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
```

Legen Sie für eine neue Kandidatenversion das deterministische Paket und seinen Index
unter `tmp/claude-direct-install-beta/` ab. Belassen Sie den ausgelieferten Publikationsindex und
die freigegebene Anleitung während der gesamten lokalen Entwicklung auf ihrem veröffentlichten Release:

```bash
node scripts/claude_direct_install_beta_release.mjs prepare-candidate
node scripts/claude_direct_install_beta_release.mjs verify-candidate
node scripts/claude_direct_install_beta_release.mjs verify
```

Bei einem autorisierten Backend-Rollout paketiert der Build das aktuelle
Artefakt samt Index automatisch wie oben beschrieben. Führen Sie für einen regulären Rollout nicht `prepare` aus, um
versionierte Laufzeitressourcen manuell weiterzuschalten; dieser Befehl bleibt eine
explizite Wartungsoperation für die Quell-Registry. Die Marketplace-Veröffentlichung ist ein
separater Schritt. Eine geänderte Anleitungsroute erfordert weiterhin eine eigene releasegebundene
Entscheidung; Vorbereitung und archivierte Freigaben begründen keine Client-Abnahme.

Führen Sie anschließend die Marketplace-Prüfungen aus und erzeugen Sie den Publikationsbaum:

```bash
node --test scripts/claude_marketplace_release.test.mjs
node scripts/claude_marketplace_release.mjs check
node scripts/claude_marketplace_release.mjs prepare
node scripts/claude_marketplace_release.mjs validate-cli
node scripts/claude_marketplace_release.mjs smoke-local
```

Das generierte Repository wird geschrieben nach:

```text
tmp/claude-marketplace/skillpilot-claude-marketplace
```

`check` verwendet ein temporäres Verzeichnis und weist die Reproduzierbarkeit nach, ohne
einen Export zurückzulassen. `prepare` ersetzt ausschließlich genau diesen generierten Standardpfad;
es verweigert das Überschreiben eines beliebigen Checkouts. `validate-cli` führt bewusst
beide erforderlichen Validierungen aus:

```bash
claude plugin validate --strict \
  tmp/claude-marketplace/skillpilot-claude-marketplace
claude plugin validate --strict \
  tmp/claude-marketplace/skillpilot-claude-marketplace/plugins/skillpilot-coach-v1
```

Nur das Marketplace-Wurzelverzeichnis zu validieren reicht nicht aus, da hierbei
die Skills und zugehörigen Komponenten des eingebetteten Plugins nicht vollständig validiert werden.
`smoke-local` fügt anschließend das Plugin in einem temporären Wegwerf-Verzeichnis
`CLAUDE_CONFIG_DIR` hinzu und installiert es, verifiziert die installierte Version, den aktivierten Zustand sowie den gebündelten
SkillPilot-MCP-Endpunkt und entfernt das isolierte Profil wieder. Die reguläre Claude-Konfiguration
der bedienenden Person wird dabei nicht verändert.

## Aktivierungsvoraussetzung Support-Readiness

Folgen Sie vor der vollständigen öffentlichen Aktivierung dem
[Claude-Support-Readiness-Runbook](claude-support-readiness-runbook.md). Die abgegrenzte Repository-Veröffentlichung und die separat
freigegebene Controlled-Beta-Installationsanleitung erfüllen oder umgehen dieses
Gate nicht. Dessen öffentlicher synthetischer Check ist anmeldedatenfrei
und schreibgeschützt; führen Sie ihn vor der Repository-Veröffentlichung sowie erneut zur
Aktivierung aus. Er prüft die unveränderliche Direktinstallations-Veröffentlichung, die Rechts- und
Datenschutzseiten, die Betriebsbereitschaft der Anwendung, die OAuth-Discovery des Connectors sowie die
nicht authentifizierte MCP-Challenge:

```bash
node --test scripts/claude_support_synthetic.test.mjs
node scripts/claude_support_synthetic.mjs verify
```

Die eingecheckte Übungsdatei (Drill-Datei) ist lediglich eine unvollständige Vorlage. Die Support-Bereitschaft
bleibt blockiert, bis verantwortliche Personen für Support, Betrieb und Sicherheit den
Postfachzugriff, den Betrieb des geplanten öffentlichen synthetischen Checks, die Benachrichtigungszustellung
bei absichtlich fehlgeschlagenen Läufen, die dokumentierte Risikoakzeptanz der Best-Effort-Monitoring-Grenze
durch den Product Owner sowie Vorfallseindämmung und Wiederherstellung für genau diesen
Kandidaten nachgewiesen haben. Diese Personal-Marketplace-Beta verfügt über keinen hostseitigen E-Mail-Monitor
pro Einzeloperation und erhebt keinen Anspruch auf Echtzeiterkennung oder ein SLA. Eine Vertretung (Backup) wird
bevorzugt; ohne Vertretung muss der Product Owner die dokumentierte Ausfallregelung für Einzelverantwortliche
mit Pausierung aktiver Bewerbung akzeptieren und erproben. Ein grüner synthetischer Check allein
autorisiert weder eine Gate-Änderung noch eine Veröffentlichung.

## Erstveröffentlichung

Das Anlegen des Repositorys und das Pushen sind explizite externe Veröffentlichungsaktionen.
Sie sind bewusst nicht Teil des regulären Anwendungs-Deployments und werden nicht
vom Exporter ausgeführt.

Nachdem die abgegrenzten lokalen Paket-, Reproduzierbarkeits-, Marketplace-, öffentlichen Synthetik-
und OpenAI-Freeze-Prüfungen erfolgreich waren, kann der Product Owner die
erste öffentliche Repository-Veröffentlichung ausdrücklich freigeben, während die kandidatenspezifischen
exakten Client-Nachweise noch auf `pending` stehen. Dies ist erforderlich, um die
erste exakte Client-Abnahme über den Marketplace selbst durchzuführen; es stellt keine öffentliche
Aktivierung dar und autorisiert nicht die Umstellung der First-Party-Oberfläche.

Nach dieser ausdrücklichen Freigabe:

1. Legen Sie das öffentliche Repository `enpasos/skillpilot-claude-marketplace` mit
   `main` als Standard-Branch an.
2. Schützen Sie `main`: Verlangen Sie Pull Requests sowie den generierten Workflow `Validate
   marketplace`; untersagen Sie Force-Pushes und das Löschen des Branchs.
3. Kopieren Sie den vollständigen generierten Publikationsbaum in einen frischen Checkout. Bearbeiten Sie
   generierte Plugin-Dateien im Ziel-Repository niemals von Hand.
4. Prüfen Sie das abgeschlossene Dateiverzeichnis, committen Sie es und führen Sie es atomar zusammen.
5. Verifizieren Sie den tatsächlichen Standard-Branch aus diesem Quell-Repository heraus:

   ```bash
   node scripts/claude_marketplace_release.mjs verify-repository
   ```

   Dieser Befehl setzt eine authentifizierte GitHub-CLI mit Lesezugriff auf das
   Repository voraus.

   Er nutzt zunächst GitHub-Metadaten, um genau das öffentliche Repository und
   `main` als tatsächlichen Standard-Branch einzufordern. Anschließend klont er das konfigurierte HTTPS-Repository in ein temporäres Verzeichnis,
   vergleicht jede zulässige Datei mit dem kanonischen Quellstand, weist zusätzliche Dateien und
   Symlinks zurück, baut den gebundenen `.plugin`-Kandidaten neu, führt beide strikten Claude-Validierungen
   aus, fügt das tatsächliche HTTPS-Repository in einem isolierten Claude-Profil
   hinzu, installiert das Plugin und gibt die vollständige Git-Revision aus. Er schlägt fehl, falls
   sich der entfernte Standard-Branch während dieses Verifizierungsfensters bewegt.

6. Erfassen Sie in einer separaten, revisionsgebundenen Nachweisänderung ausschließlich den verifizierten
   Punkt `public-repository-default-branch` als `pass`. Daraus leitet sich
   `activation.state = published_pending_acceptance` ab; die übrigen Marketplace-Nachweise
   bleiben auf `pending`. Ohne eine gesonderte, kandidatengebundene Entscheidung in
   `firstPartyGuideDecision` bleibt `marketplaceUiSwitchAllowed` auf `false` und
   `firstPartyUiRoute` auf `controlled_direct_install_beta`.

Verwenden Sie in Endnutzeranleitungen stets die vollständige HTTPS-URL. In Claude Code kann die
Kurzform `owner/repository` SSH auswählen und dadurch Nutzende überraschen, die
keine GitHub-SSH-Zugangsdaten eingerichtet haben.

## Historische Umstellung der Controlled-Beta-Anleitung unter 1.0.4

Nach der Repository-Veröffentlichung von 1.0.4 bestätigte der Product Owner am
**3. September 2026**, dass beide kontrollierten Testnutzenden vom hochgeladenen
Plugin auf den exakten Marketplace-Kandidaten migriert waren. Daraufhin forderte der Product Owner ausdrücklich,
dass die First-Party-Installationsanleitung den Marketplace als
empfohlenen Installations- und Update-Pfad verwendet.

Diese historische Entscheidung wurde separat als
`activation.firstPartyGuideDecision` protokolliert. Sie war an die Kandidatenversion und den Digest von 1.0.4
sowie an die verifizierte Repository-Revision und den Baum-Digest gebunden. Sie
autorisiert nicht die Route für 1.1.1.

Die Umstellung ist bewusst enger gefasst als eine vollständige Marketplace-Abnahme:

- `activation.state` bleibt auf `published_pending_acceptance`;
- Nachweise für Neuinstallation im bereinigten Konto sowie Migration/Aktualisierung bleiben auf `pending`;
- rechtliche, Support- und exakte Client-Blocker der Direktinstallation bleiben auf `pending`;
- `openPublicBetaReady` bleibt auf `false`;
- der damals aktuelle direkte `.plugin`-Download blieb als gekennzeichneter Fallback erhalten; und
- es wird kein von Anthropic kuratierter, von Anthropic verifizierter oder allgemein freigegebener Status
  beansprucht.

Bei jedem Nachfolgekandidaten wird diese historische Anleitungsentscheidung auf
`pending` zurückgesetzt, bis eine neue kandidatenspezifische Entscheidung und ein verifiziertes Repository vorliegen.
Weder die historische Marketplace-Installation noch der Direktdownload von 1.0.4 darf
als verfügbarer Fallback angeboten werden.

## Historische Veröffentlichung 1.1.1 und Controlled-Beta-Update-Pfad

Am **5. September 2026** forderte der Product Owner ausdrücklich Updates über
den Marketplace und führte [Publikations-PR #2](https://github.com/enpasos/skillpilot-claude-marketplace/pull/2) zusammen.
Der öffentliche Standard-Branch wurde anschließend mit
`node scripts/claude_marketplace_release.mjs verify-repository` verifiziert:

- Revision: `5cc7aba22ddf90ab8273cd6c15b71e8186781fc3`;
- abgeschlossenes Publikationsverzeichnis: 11 Dateien;
- Baum-SHA-256: `8c6c67b46763224d901a65b35408dad7752f6c7db08203fd38cf0f568a74c5d3`;
- Version: `1.1.1`, byte-identisch zum gebundenen unveränderlichen Plugin-Artefakt;
- strikte Marketplace- und Plugin-Validierung sowie isolierte Installation aus der Git-Quelle:
  erfolgreich; die [Standard-Branch-Validierung](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/33950192311)
  war ebenfalls erfolgreich.

Lediglich `public-repository-default-branch` ist als `pass` erfasst. Die separat
freigegebene Entscheidung zur First-Party-Anleitung bindet exakt diesen Kandidaten, diese Revision und
diesen Baum. Die Anleitung lenkt Installation und Updates über den Marketplace und
bietet keine Datei-Upload-Alternative an. Die Claude-Web-Screenshots des Nutzers
zeigen beim installierten Plugin 1.0.4 keine Update-Aktion. Sie zeigen jedoch folgenden Pfad:
**Hinzufügen → Marketplace hinzufügen → Aus einem Repository hinzufügen**,
die bestehende öffentliche Repository-URL, einen aktivierten Schalter **Automatisch synchronisieren**
sowie eine Schaltfläche **Synchronisieren**. Der Dialog beschreibt die automatische Synchronisierung
so, dass Plugins bei Änderungen am GitHub-Repository aktuell gehalten werden. Dies sind die
beobachteten deutschen Beschriftungen; englische Beschriftungen in der Anleitung sind Übersetzungen und keine separat
verifizierte Beobachtung in einem englischsprachigen Client.

Der nachfolgende Screenshot nach Klick auf **Synchronisieren** meldet
**Dieser Marketplace wurde bereits hinzugefügt.** Dieser Pfad fügt eine Quelle hinzu;
er aktualisierte die bestehende Quelle in diesem Konto nicht. Behalten Sie die beobachteten
Synchronisierungsschritte ausschließlich für Neuinstallationen bei. Ein manueller Aktualisierungspfad
für bestehende Konten in dieser Web-Oberfläche war zu jenem Zeitpunkt noch nicht verifiziert und darf nicht als
funktionsfähig dargestellt werden. Prüfen Sie vor dem Start einer neuen Sitzung aus SkillPilot heraus in den Details
des installierten Plugins, ob 1.1.1 vorliegt. Die resultierende installierte Version und das Fehlen
doppelter Installationen bedürfen weiterhin einer Bestätigung im echten Client. Schreiben Sie weder
eine unbeobachtete Update-Schaltfläche vor, noch löschen Sie die bestehende Installation oder behaupten Sie einen
abgeschlossenen Abnahmelauf.

`activation.state` bleibt auf `published_pending_acceptance`. Neuinstallation im bereinigten Konto,
Migration/Aktualisierung in echten Konten sowie Web-/Android-/Voice-, Datenschutz-,
Rechts- und Support-Abnahmen stehen weiterhin aus; `openPublicBetaReady` bleibt `false`.
Die genaue, ausschließlich auf die Anleitung beschränkte Autorisierung ist in
[der OpenAI-Review-Freeze-Ausnahme](openai-plugin-v1-review-freeze.md#651-eng-begrenzte-ausnahme-claude-111-marketplace-veroeffentlichung-und-updateanleitung) dokumentiert.

## Abnahme im echten Client und Aktivierung

Der generierte Workflow und die Remote-Byte-Prüfung belegen die Integrität der Lieferkette;
sie belegen nicht die Nutzerreise (User Journey). Protokollieren Sie vor der Aktivierung sämtliche folgenden Punkte
gegen die exakte Remote-Revision:

1. Öffnen Sie in einem bereinigten, berechtigten kostenpflichtigen Claude-Webkonto **Plugins → Discover →
   Add (oben rechts) → Add marketplace → Add from a repository** und fügen Sie die
   nun öffentliche kanonische Repository-URL hinzu. Der oben genannte beobachtete Deep-Link ist ein
   optionaler Navigations-Shortcut, keine Installations- oder Synchronisierungsaktion.
2. Bestätigen Sie, dass genau ein Eintrag `SkillPilot Coach v1` erscheint, und installieren Sie ihn.
3. Verbinden Sie den gebündelten SkillPilot-Connector über seinen regulären OAuth-Ablauf. Fügen Sie
   keinen zweiten benutzerdefinierten Connector hinzu und geben Sie die MCP-URL nicht manuell ein.
4. Kehren Sie zu `https://skillpilot.com/` zurück und starten Sie über die etablierte
   First-Party-Übergabe eine neue Lernsitzung.
5. Bestätigen Sie, dass die erste Antwort den Wert
   `learningPlanToday.text` des Backends wortgetreu und identisch zum SkillPilot-Cockpit wiedergibt:
   eine Zeile je Fach mit Tages- oder Wochenziel sowie etwaigem Rückstand oder Vorsprung,
   ohne eigene Zählungen, Summen oder Wertungen. Das aktive Lernziel muss
   separat und nur einmal zu Beginn der Lehreinheit angekündigt werden – und nicht nach einer
   reinen Statusfrage. Prüfen Sie sowohl die Tages- als auch die Wochenbasis. Der Abschluss eines älteren fälligen
   Ziels muss auf das Periodenziel dieses Fachs einzahlen; ein Vorsprung in einem
   Fach darf keinen Rückstand in einem anderen verrechnen. Ein Tag ohne Zielvorgabe darf nicht
   als erledigtes Pflichtpensum beschrieben werden.
   Weisen Sie nach, dass ein nicht auswertbarer Plan im Text benannt wird und keine Kennung für einen Plan oder
   eine Skill-Landschaft ausgibt. Der Status muss auf Abschlussnachweisen des Backends beruhen,
   nicht auf einem aus einem Mastery-Snapshot abgeleiteten Abschlussdatum.
6. Weisen Sie ohne aktives Lernziel nach, dass Claude
   `resume_skillpilot_learning_plan` nur dann automatisch aufruft, wenn `resumeAvailable`
   auf `true` steht und die Guidance `resume` lautet, den
   zurückgegebenen kanonischen Kontext nutzt und das vom Backend ausgewählte Ziel fortsetzt,
   ohne nach der Schaltfläche **Weiterlernen** in der Web-App zu fragen. Weisen Sie zudem nach, dass kein
   Resume-Aufruf erfolgt, wenn das Flag `false` ist. Lautet die Guidance `complete`, erfordert jedes
   Weiterlernen einen ausdrücklichen Wunsch nach freiwilliger Zusatzarbeit.
7. Durchlaufen Sie den vorgesehenen Coaching-Ablauf sowie beide interaktiven MCP-Apps auf jeder
   Oberfläche, die SkillPilot bewerben möchte. Die technische Verfügbarkeit seitens Anthropic
   ist kein Abnahmenachweis für SkillPilot.
8. Bitten Sie Claude, von Mathematik zu Physik und wieder zurück zu wechseln. Weisen Sie nach, dass es
   ausschließlich exakte lokalisierte Fachnamen aus dem aktuellen Tagesplankontext
   übernimmt, begonnene Arbeit ohne Mastery parkt, das vom Backend ausgewählte
   fällige Ziel ohne Rückfrage fortsetzt und niemals eine Plan-, Skill-Landschafts-, Fokus- oder
   Lernziel-ID übermittelt.
9. Gehen Sie in Claude Web auf eine zugeschnittene Orientierungs-Nachfrage ein und sagen Sie anschließend
   `Machen wir so, dann fangen wir einfach an.` Weisen Sie nach, dass Claude nicht-bewertendes
   Feedback gibt, Rückfragen oder den Abschluss anbietet und eine gesonderte
   Antwort der lernenden Person abwartet, bevor es den Orientierungsabschluss persistiert. Eine bloße Pfadauswahl
   oder `Klingt gut` gilt nicht als Zustimmung zum Abschluss. Nach erfolgter Zustimmung muss das nächste aktive
   Lernziel exakt das vom Backend ausgewählte Nachfolgeziel aus der
   kanonischen Mastery-Antwort sein. Bestätigen Sie, dass keinerlei Richtlinien-,
   Anweisungs-, interne Abwägungs-, Lazy-Loading-, Schema-, Parameter- oder Retry-Mechaniken
   erzählt werden und kein Versprechen über dauerhaft gemerkte Anker abgegeben wird.
10. Wiederholen Sie das vollständige Szenario und jede einzelne Zusicherung unabhängig im nativen
    Voice-Modus von Claude unter Android. Eine gesprächsweise Aussage, das Ziel sei
    gespeichert worden, oder ein optisch plausibles nächstes Ziel reicht als Nachweis nicht aus.
    Decken Sie außerdem „jetzt Physik“, „zurück zu Mathe“, eine reine Statusabfrage,
    den aktualisierten fachbezogenen Fortschritt nach Verified Recall, das letzte Tagesziel
    sowie pausierte oder blockierte Pläne ab. Das letzte Tagesziel muss zu einer klaren
    Abschlussmeldung führen; ein allgemeines Fokusmenü darf den aktiven Plan nicht ersetzen.
11. Testen Sie die Migration vom zuvor hochgeladenen Plugin: Entfernen Sie ausschließlich das alte
    SkillPilot-Plugin, fügen Sie den Marketplace hinzu, installieren Sie das Plugin einmalig, verbinden Sie es neu, falls Claude
    dazu auffordert, und verifizieren Sie eine neue über SkillPilot gestartete Sitzung.
12. Verwenden Sie **Add (oben rechts) → Manage marketplaces → ⋮ bei der SkillPilot-Quelle →
    Check for updates** und bestätigen Sie, dass Migration und Aktualisierung keinen
    erneuten Datei-Upload erfordern. Prüfen Sie Katalog, installierte Version, Verbindung und eine neue
    über SkillPilot gestartete Sitzung jeweils getrennt. Ein echtes Update von Version zu Version ist ab der
    nächsten Marketplace-Version ein verbindliches Release-Gate; verifizieren Sie
    zwei aufeinanderfolgende echte Updates für den Anspruch auf Wiederholbarkeit. Der Datei-Fallback
    macht ein erfolgloses Marketplace-Update nicht zu einem bestandenen Marketplace-Test.

Erst nachdem das öffentliche Repository, die Neuinstallation im bereinigten Konto,
die Migration/Aktualisierung vom Upload zum Marketplace, die kandidatenspezifische Abnahme in Web und Android
Voice sowie sämtliche verbleibenden Aktivierungsblocker der Direktinstallation
freigegeben sind, darf ein separates Änderungspaket des Product Owners alle übrigen Nachweisobjekte
auf `pass` setzen. Die frühere Controlled-Beta-Anleitungsentscheidung ist kein Nachweis für
eine dieser Prüfungen. Jeder `pass`-Eintrag des Marketplace erfordert dieselbe 40-stellige
Remote-Revision, einen kanonischen UTC-Zeitstempel, den SHA-256 des exportierten Baums, die
aktuelle Kandidatenversion samt Direktinstallations-SHA-256 sowie eine nicht-leere Nachweisreferenz.
Veraltete Nachweise werden daher automatisch ungültig, sobald sich Kandidat oder
Remote-Baum ändern. Erst dann darf dieses Änderungspaket die Aktivierungsfelder wie folgt ableiten:

```json
{
  "state": "published_verified",
  "firstPartyUiRoute": "personal_git_marketplace",
  "marketplaceUiSwitchAllowed": true
}
```

Nur eine neue, exakt kandidatengebundene Entscheidung darf die First-Party-Anleitung unter `/plugins`
auf Marketplace-zuerst umstellen. Sie muss die gezielte Bereinigung, das Connector-OAuth sowie die
Rückkehr-zu-SkillPilot-Schritte beibehalten. Ein Direktdownload-Fallback auf 1.0.4 ist unzulässig.
Die frühere OpenAI-Review-Sperre ist aufgehoben; es ist keine neue Hash-Ausnahme zur Review-Laufzeit
erforderlich. Claude-Kandidaten- und Anleitungsabnahme bleiben eigenständige Gates.

## Nachfolgende Releases

Bei jeder inhaltlichen Änderung am Plugin:

1. Nehmen Sie die Plugin-Änderung im kanonischen SkillPilot-Repository vor und lassen Sie sie prüfen;
2. erhöhen Sie in derselben Änderung die SemVer in `plugin.json` (`1.1.2` wird mindestens zu
   `1.1.3`);
3. bauen und binden Sie ein neues Direktinstallations-Artefakt; binden Sie niemals eine bestehende
   Version an neue Bytes;
4. aktualisieren Sie Version und Direktinstallations-SHA-256 des Marketplace-Zweigs, legen Sie jeden
   kandidaten- oder revisionsgebundenen Nachweiseintrag neu auf `pending` an bzw. setzen Sie ihn zurück und
   weisen Sie veraltete Nachweise ab. Wiederverwendbare allgemeine Fähigkeitsbeobachtungen der kontrollierten Beta
   dürfen nur solange auf `pass` bleiben, wie deren Fähigkeit und Vorbedingungen
   unverändert sind; führen Sie vor Beibehaltung solcher lokalen Ergebnisse die aktuellen lokalen Paket-, Archiv- und Setup-Prüfungen
   erneut aus;
5. aktualisieren Sie `CHANGELOG.md`;
6. führen Sie alle oben genannten lokalen Prüfungen aus und bereiten Sie einen neuen Baum vor;
7. veröffentlichen Sie erst nach gesonderter Veröffentlichungsautorisierung über einen
   Pull Request im Ziel-Repository;
8. führen Sie nach dem Merge `verify-repository` aus;
9. testen Sie das echte Marketplace-Update ausgehend von der zuvor installierten Version; dies
   ist für jedes Release nach der ersten Marketplace-Veröffentlichung verpflichtend.

Updates über Drittanbieter-Marketplaces müssen als manuell behandelt werden, sofern der getestete
Claude-Client nicht das Gegenteil beweist. In Claude Code lautet der explizite Diagnosepfad:

```text
/plugin marketplace update skillpilot-marketplace
/plugin update skillpilot-coach-v1@skillpilot-marketplace
```

Ein Rollback erfolgt stets als neues Release mit höherer SemVer, das geprüfte Inhalte wiederherstellt. Führen Sie niemals
einen Force-Push auf `main` aus, löschen Sie keine Historie und verwenden Sie niemals eine alte Versionsnummer mit abweichenden
Bytes wieder. Eindämmung und Wiederherstellung des Connectors richten sich nach dem
[Support-Readiness- und Incident-Runbook](claude-support-readiness-runbook.md),
einschließlich gewahrter historischer OpenAI-Integrität und kandidatengebundener Nachweise.

## Referenzen

- [Claude-Support-Readiness- und Incident-Runbook](claude-support-readiness-runbook.md)
- [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Install plugins in Cowork](https://claude.com/docs/cowork/guide/plugins)
