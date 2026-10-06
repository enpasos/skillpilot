# Bio Q1: unabhängiger tatsächlicher Bildreview A

**Ergebnis: 3 KEEP, 1 REVISE.** Unabhängige maschinelle Fach-/Sichtprüfung,
keine aktive QA-Freigabe, keine Integration und keine menschliche Freigabe.
Neue M7-Abschlüsse **0**, wiederhergestellte Bindungen **0**.

## Eingänge und tatsächliche Betrachtung

Reviewer `/root/duration_report_fix` hat diese Bilder und Zieltexte nicht
verfasst. Gelesen wurden nur die vier aktuellen/proponierten DE/EN-Zieltexte,
`visualization-final-candidate-inputs.json` und die verbindlichen allgemeinen
Bildrichtlinien. Autorenurteile und andere QA-Ausgaben wurden nicht gelesen.
Das Aufgabenlabel „bestehendes KEEP“ ist keine Prüfgrundlage.

Alle vier exakt gebundenen RGB-PNGs wurden mit `view_image` tatsächlich in
**1672 × 941**, **360 × 203** und **680 × 383 Pixeln** betrachtet. Für die
DNA-Bindung wurden zusätzlich zwei native Ausschnitte gesichtet. Die zehn
PNG-Dateien unter `inspection-only/` sind ausschließlich dokumentierte
Inspektionsderivate, keine veränderten Produktionsassets. Verkleinerung:
Pillow-LANCZOS, volle Bildfläche, proportional und ohne Beschnitt. Die zwei
Detailbilder sind unvergrößerte Ausschnitte.

PNG-SHAs, tatsächliche Maße und beide Sprachfassungen mit Text-SHAs stehen
in `inputs-and-inspection-bindings.snapshot.json`. Die Text-SHA kontrahiert
explizit ID, DE/EN-Titel und DE/EN-Beschreibung als sortiertes kompaktes UTF-8-JSON.
Providerangaben stammen aus dem autorisierten Eingangsmanifest; eine zusätzliche
Generator-/Prompt-Provenienzprüfung wurde hier nicht durchgeführt.

## Einzelurteile

| Ziel | Urteil | Konkrete Beobachtung |
|---|---|---|
| `0daa79f6-8f61-5506-98f9-65db83062ba8` DNA-Struktur | **REVISE** | Die beiden G–C/C–G-Paare enthalten jeweils zwei parallele gestrichelte Bindungslinien, wie die A–T-Paare. Eine zählbare H-Brückendarstellung muss G–C mit drei und A–T mit zwei Linien zeigen. |
| `475eebb4-4eb0-524f-b1ec-4a672bf856d2` DNA→mRNA→Polypeptid | **KEEP** | DNA bleibt im Zellkern, Transkriptionspfeil führt zu mRNA, dieselbe mRNA führt ins Cytoplasma zum Ribosom; tRNA mit Aminosäure und wachsende Kette sind erkennbar. |
| `ffef97e3-12d6-5090-9816-46ab9e57fae2` vier Mutationsarten | **KEEP** | Substitution 5→5 mit Austausch, Deletion 5→4, Insertion 5→6, Duplikation 5→7 mit wiederholtem gelb/türkisem Zweierabschnitt. |
| `e70d8a85-2dea-5165-919b-200fee9f4db4` semikonservative Replikation | **KEEP** | Ein blau/blaues Elternmodell wird zu blau/orange und orange/blau; ursprüngliche Sequenzseiten bleiben jeweils am zugehörigen alten Strang, beide Tochtermodelle sind komplementär und gleich. |

**Begrenzte DNA-Korrektur:** nur die G–C/C–G-Verbindungen auf drei Linien
korrigieren; alternativ überall eine ausdrücklich neutrale, nicht zählbare
Paarungsverbindung verwenden. Große richtige Basenbuchstaben, Nukleotidbeispiel,
komplementäre Folge, entgegengesetzte Pfeile, freundlicher Stil und Formfaktor
erhalten. Keine Freigabe des geprüften DNA-SHAs `7c272daa…`; die korrigierte
Version benötigt eine neue tatsächliche Sichtprüfung.

## Lesbarkeit und Modellgrenzen

Alle vier Hauptmotive sind bei 360 Pixeln sichtbar. Bei Proteinbiosynthese sind
die langen Zusatzlabels klein; der Kern DNA→RNA→Ribosom/Kette ist über große
Objekte und Pfeile ohne deren Pflichtlektüre erkennbar. Bei 680 Pixeln sind
auch die Bezeichnungen deutlich. Keine Pflichtkleinschrift, kein angeschnittenes
Hauptmotiv, keine technischen IDs/Wasserzeichen oder Menschen mit falsch
ausgerichteten Notizen. Die freundlichen abstrakten comicartigen Rasterbilder
haben ein passendes natives Verhältnis von etwa 16:9.

Der flache DNA-Leiterzustand ist ein vereinfachtes Strukturmodell, keine
geometrisch vollständige Helix. Farben/formale Bausteine sind nicht chemische
Atome oder ein universeller Basenfarbcode. Proteinbiosynthese zeigt einen
vereinfachten Eukaryoten-Informationsweg; RNA-Prozessierung, 5′/3′-Leserichtung,
Codonübersetzung und Enzymmechanik sind nicht dargestellt und werden durch das
Bild nicht nachgewiesen. Mutationsfarben sind abstrakte Sequenzpositionen/-abschnitte,
kein behauptetes Fünf-/Sechs-Basenalphabet; Proteinfolgen sind nicht automatisch
festgelegt. Replikation zeigt das semikonservative Ergebnis, keine vollständige
Replikationsgabel, Polymeraserichtung oder Leading/Lagging-Strand-Mechanik.
Diese begrenzten Auslassungen widersprechen dem jeweiligen final vorgeschlagenen
Orientierungsmotiv nicht; sie sind keine curriculare Leistungsevidenz.

## Erhalt und nächster Schritt

Alle vier geprüften Kandidaten, Zieltextdateien, das Eingangsmanifest, aktiver
Graph und zentrale Registry wurden beim Aufzeichnen nur gelesen. Der Recorder
prüft ihre vorher/nachher identischen SHAs. Historische Artefakte bleiben erhalten;
kein `aiApproved`-Feld oder aktives `resourceLinks` wurde verändert.

Nächster Schritt: gezielte DNA-Korrektur und neue Bildprüfung ihres tatsächlichen
PNGs. Die drei KEEP-SHAs können bei späterer geprüfter Integration wiederverwendet
werden, solange Zieltexte und relevante Bindungen gültig bleiben. Finale native
D/P/A/M/V-Gates und separate menschliche Release-Gates bleiben erforderlich.
