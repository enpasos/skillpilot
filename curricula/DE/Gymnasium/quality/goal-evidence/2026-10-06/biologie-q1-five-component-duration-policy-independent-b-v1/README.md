# Fünf Biologie-Genetik-Extrakte: unabhängige Duration-Policy-Prüfung B

**KEEP für genau fünf zusätzliche Pfadentscheidungen im eingefrorenen Kandidaten.** Aktive Dauerprüfung bleibt bis zur tatsächlichen Root-Integration **HOLD**. Keine aktive Mutation, keine Checkeränderung, keine neue fachliche oder menschliche Freigabe; strenger Nettozuwachs 0.

## Unabhängigkeit und tatsächliche Quellen

Der unabhängige semantische Erstpass wurde vor dem Lesen jeder neuen A-Datei mit `independent-b.pre-a-first-pass.freeze.json` versiegelt (SHA256 `4510d9c6b6c61e23ecd9f8cd88353c24116241acd1afb2dcad0b7f89b7a281fb`). Erst danach wurde der von A **autorisierte Policy-Kandidat** geprüft; A-Verdicts oder A-Ausführungsergebnisse wurden nicht als Beweis übernommen.

Alle fünf aktiven Genetik-Extrakte haben exakt dasselbe `sourceDocument` wie ihr jeweiliger bereits entschiedener Elternextrakt. Die zehn enthaltenen Einzelkomponenten verweisen tatsächlich auf dort vorhandene Sek-I-Originalzusammenfassungen. Originale lokale PDFs und relevante Cover-/Jahrgangs-/Genetikseiten wurden als tatsächlicher PDF-Text gelesen. BE/BB verwenden bytegleiche Original-PDFs. Die zusätzliche aktuelle BE/BB-Niveautabelle wurde für Berlin (physisch11) und Brandenburg (physisch16) gelesen; beide ordnen Gymnasium7/8/9/10 den Niveaus E/F/G/H zu. Das gemeinsame Genetik-Kapitel3.7 ist keine erfundene feste Jahrgangsplatzierung.

| Extrakt | B-Urteil | Unveränderte Elternentscheidung | Tatsächlicher Quellenbereich |
| --- | --- | --- | --- |
| BB | KEEP | duration-neutral-projection, G8/G9 | SekI, gemeinsame Jahrgangsstufen7–10 |
| BE | KEEP | duration-neutral-projection, G8/G9 | SekI, gemeinsame Jahrgangsstufen7–10 |
| MV | KEEP | single-duration-source, G8 | Klasse10, ursprüngliche Genetik unter3.2 |
| SN | KEEP | single-duration-source, G8 | Klassenstufe10, Lernbereich1 Genetik |
| TH | KEEP | single-duration-source, G8 | Klassenstufen9/10,2.2.1.3 Genetik |

G8 für MV/SN/TH wird als bestehende geprüfte SkillPilot-Quellen-/Projektionsentscheidung erhalten, nicht als neu hergeleitete Rechts-/Angebotsentscheidung ausgegeben. Die neuen Extrakte begründen keine neue G9-Variante, Jahrgangsverschiebung, SekII- oder Kursstufenänderung.

## Exaktes Delta und native Prüfung

Geprüfter Kandidat: `biologie-q1-five-component-duration-policy-targeted-a-v1/gymnasium-duration-model-policy.five-components.candidate.json`; Autorenfreeze SHA256 `fbf15ff011c2fb552520362e2947dc3efd0bb5ee9d47a4aae5446d88e80b836e`.

Die 148 alten Policy-Objekte und alle übrigen Top-Level-Felder sind exakt erhalten; ausschließlich fünf neue Entscheidungen mit den tatsächlichen neuen `sourceExtractionPath`-Werten kommen hinzu. Subject/Jurisdiction/Stage/Status/Decision/DurationModels/Projection entsprechen jeweils dem vorhandenen Elternentscheid. Alle Länder-/Fach-/Stufen-Mengen angebotener Dauerlabels sind vor/nach exakt gleich; der tatsächliche Offering-Generator verwendet Mengen. Diese letzte Aussage ist eine Code-Inferenz, kein ausgeführter Deployment-/Angebotsgeneratorlauf.

Der aktuelle unveränderte native Checker wurde selbst ausgeführt: **Exit1**, exakt die fünf fehlenden Pfadbindungen aus dem Root-Befund. Danach liefen dieselben Checkerbytes mit denselben read-only Quellen-/Views-/Statusdaten in einem neutralen temporären Repo-Layout: **Baseline Exit1**, **Fünf-Zeilen-Kandidat Exit0**, leeres stderr. 615 tatsächliche native Eingangsdateien wurden vor und nach beiden Läufen bytegenau gebunden.

Der erste isolierte Lauf unter diesem QA-Ordnername wurde ebenfalls bewahrt: Weil `inferSubject` auch den absoluten Dateipfad durchsucht, führte `biologie` im äußeren Ordnernamen zu falschen Biologie-Zuordnungen fremder Quellen. Der neutrale temporäre Repo-Name beseitigt ausschließlich diesen Prüfumgebungsartefakt. Checker, Eingabedaten, Zustände und Gates bleiben unverändert. Die fehlgeschlagenen Logs werden nicht als echte fachliche Zusatzprobleme oder als PASS ausgegeben.

Die Kandidatenprüfung verwendete `--require-reviewed-subject=Biologie`, ohne `--write`. Der aktive generierte Bericht und dessen `--check` bleiben Root nach Integration vorbehalten. Ein isoliertes Exit0 wird nicht als aktiver Abschluss ausgegeben.

## Grenzen

Die Dauer-Policy schließt keine ganzen Originalquellen oder nicht abgedeckten Bullet-Aspekte. Die zehn komponentenweisen Inhaltsbelege, ganze historische Quellen-HOLDs, Target-/prerequisiteOnly-Rollen, sechs gültige Landesansichten, kanonische Texte/Bilder und aktuelle D/P/A/M/V-Bindungen bleiben getrennt. Gültige historische Fachreviews wurden nicht neu gestartet.

Einzelbefunde: `independent-b.five-duration-policy.final-review.json`. Ausführung: `native-neutral-baseline-and-five-row-candidate.independent-b.actual.json`. Der finale Freeze bindet tatsächliche Eingangsbytes und eigene Outputs; kein Git, keine aktive Datei, kein Test oder Gate verändert.
