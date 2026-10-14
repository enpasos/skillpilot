# Sieben Säure-Base-Profile: inaktive Autorenvorschläge

Dieses endliche Paket enthält sieben vollständige Rohprofile nach
`positive-understanding-evidence-v2`: je vier fachbezogene Erwartungen mit
beobachtbaren Leistungen in Deutsch und Englisch, drei sinnvolle Variationsachsen
und zwei konkrete Fallskizzen. Die Profile sind **ungeprüfte Autorenvorschläge,
E0/G0**. Es wurden keine Lernendenleistungen beobachtet und keine unabhängigen
fachlichen Stimmen oder D/P/A/M/V-Freigaben erzeugt.

`author-profiles.seven.raw.json` enthält die eigentlichen `profile`-Objekte in
einer ausdrücklich inaktiven Autorenhülle. Diese Datei ist kein
`PositiveGoalEvidenceReviewRecord`, kein Review-Register und keine auswählbare
P-Konfiguration. Es gibt keine behauptete menschliche Freigabe. Der technische
Autor hat diese Profile verfasst und kann sie anschließend nicht unabhängig
fachlich freigeben.

Alle vier Erwartungen jedes Ziels sind erforderlich. `minimumIndependentDemonstrations: 2`
und die beiden Transferbedingungen bleiben entsprechend dem bestehenden Vertrag
erhalten. Die Fälle sind mögliche Designs zur späteren Beleggewinnung. Sie sind
keine zusätzliche Aufgabenquote im Coach: gehaltvoller mehrschrittiger Transfer
innerhalb einer Aufgabe kann mehrere Aspekte zeigen. Die bereitgestellten
quadratischen Hilfsgleichungen müssen nicht zusätzlich hergeleitet werden.

Jeder Fallverweis führt auf einen vollständigen Fall in
`inputs/fourteen-full-cases.bound.exact.json`: Material, Auftrag, erwartete Lösung
in beiden Sprachen sowie alle vier Rubrikkriterien. Der zugehörige vollständige
Markdown-Quelltext liegt bytegleich unter
`inputs/fourteen-complete-cases.de-en.exact.author.md`. Es gibt keine Verweise auf
fehlende Aufgabenkarten. Der Fallindex bildet die tatsächliche Abdeckung der
Erwartungen ab; nicht jeder einzelne Fall behauptet, sämtliche Zielaspekte allein
zu belegen. Alle Fälle lassen sich mit ihren Textdaten ohne Lernzielbild bearbeiten.

Die sieben ganzen aktuellen Zielobjekte wurden unverändert aus dem vom Root
bereitgestellten Ganzkanon-Snapshot übernommen. Quelle, Hash und Byteanzahl der
Originale und lokalen Kopien stehen in `exactInputProvenance`. Der technische
Check belegt die Gleichheit zum gebundenen Snapshot und hält für die bestehenden
Bilder lediglich die aktuellen Dateibindungen fest. Bilder, Memory-Entscheidungen,
Quellen, Anwendbarkeit, Kursakquisition und Zieltexte wurden nicht geändert oder
neu fachlich freigegeben. Native Seiten- und Kontextbindungen sowie die
unabhängigen Beschreibungs-/Profilreviews sind ein separater nachfolgender Schritt.

Die technische Prüfung verwendet den aktuellen produktiven
`PositiveGoalEvidenceProfile`-Teil der geschlossenen JSON-Schema-Definition und
die unveränderten Fingerprint-/Semantikhelfer. Um den produktiven Semantikhelfer
aufzurufen, entsteht ausschließlich im Arbeitsspeicher ein Autoren-Träger mit
`ai_candidate` / `needs_human_review`; kein solcher Datensatz wird als Reviewzeile
geschrieben. `reviewPositiveGoalEvidenceConfig` wurde nicht ausgeführt. Das
Prüfergebnis steht in `CHECK.raw-profile-shape-bindings-and-full-cases.actual.json`.
Es bestätigt technische Form und Bindungen, keine wissenschaftliche Güte oder
vollständige Source-/Gate-Gültigkeit.

Reproduzierbare gezielte Prüfung vom Repository-Root:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-positive-profile-author-shapes-technical-20261014-v1/check-author-profile-shapes.mts
```

`assemble-author-profiles.py` ist das transparente Autoren-Assemblierungsskript.
Ein erneuter Lauf schreibt neue Zeitstempel und erfordert daher ein neues Seal.
`FILES.finite-own-artifacts.seal.json` bindet alle eigenen Paketdateien außer sich
selbst; externe Ganzkanon- und Quellenbindungen bleiben getrennt nachvollziehbar.

Eigene Profil- und Fallinhalte: CC-BY-4.0. Technisches Skript und Dokumentation:
Apache-2.0. Frühere Rechte, Fremdquellen und Provenienz bleiben erhalten.
