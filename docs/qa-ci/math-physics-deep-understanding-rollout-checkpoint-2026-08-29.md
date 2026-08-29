# Mathematik/Physik Deep-Understanding-Rollout – Checkpoint 2026-08-29

## Zweck und Arbeitsgrenze

Dieser Checkpoint dokumentiert einen reproduzierbaren, commit- und
deploy-fähigen Zwischenstand. Das langfristige Ziel bleibt 100 Prozent für
Mathematik und Physik. Es gilt weiterhin **KEEP by default**: Ein Lernzieltext
wird nur bei einer konkret nachgewiesenen fachlichen, sprachlichen oder
strukturellen Schwäche geändert.

Seit dem vorherigen Stand wurden Mathematik B019 Stable-7 und B020 Stable-11
abgeschlossen, die eng begrenzte Revision von `ec6447d1…` umgesetzt und das
Physikbild `ba16948b…` korrigiert. Es wurde kein weiterer Batch ausgewählt.

Die OpenAI-Review-Freeze-Prüfung für `skillpilot-coach-v1` 1.0.0 bleibt grün.
Geändert wurden ausschließlich Layer-A-Curriculumdaten und daraus abgeleitete
Publikationsartefakte. Codex hat nicht gestagt, committed, gepusht oder
deployed.

## Strenger Fortschritt

| Fach | Vollständig durch alle Rollout-Gates | Fortschritt | Beschreibungen | Understanding-Evidence V2 | Atomicity | Memory | Visualisierung |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mathematik | 145 / 792 | 18,3 % | 145 | 145 | 792 | 792 | 792 |
| Physik | 178 / 461 | 38,6 % | 178 | 178 | 461 | 461 | 461 |

Der zentrale Deep-Understanding-Check meldet **0 Blocking Issues**. Alle neun
geschützten Curriculum-Reifegraduntergrenzen bestehen; Mathematik und Physik
bleiben auf **M6**.

## Mathematik B019 und B020

### B019 Stable-7

Sieben aktuelle `KEEP/KEEP`-Ziele wurden gegen den kanonischen Stand nach B020
finalisiert. Historische Review-Evidenz und aktuelle Fingerprints sind getrennt
und hashgebunden nachgewiesen.

- Resolution-Index:
  `4fb248090eff84688d7f2cfaceab4bec8c58b20f908f904d31482851cedd7341`
- Compatibility-Receipt:
  `2ee9156eed56964721490558b94ff5c06510749c59ff68988df8fde826c56ae9`
- Evidence-Plan:
  `53ee613416f961afc1f48b21f2737fb367b7811ff1c2544a915224a8f2609335`
- Evidence-Review:
  `19c5f489a5f40bf42298793e0e114b38c128023150fb837d7b363cb562887fb7`

### B020 Stable-11 und Abgrenzungen

Elf aktuelle Ziele erhielten strenge Beschreibungsauflösungen und unabhängig
fachlich geprüfte V2-Evidenzprofile. Alle 22 numerischen Demonstrationen wurden
nachgerechnet.

- Resolution-Index:
  `9c0b7b6c7d723878169b5413a30a1cf882ed48ff5452a1268628e31627281db7`
- Compatibility-Receipt:
  `1070711c4ad9ff6c497228ca639c8be040d24eee70a1de70b95c286ae0da3911`
- Evidence-Plan:
  `9b2dd088fc0f7d2723abc6c45297863c1a3f39217d2303ef9d04c25e86daa084`
- Evidence-Review:
  `a5e56e63bcb09e6c5e42552d994386802f05b321c757389d8c72350b77c2a47a`
- B020-Adjudikation:
  `b44d6cb1bfa60251d0d6ce5266fd9e58b7ed6f6dc56a724a52ac7e02352d2839`

Die Eigentumsgrenzen sind ausdrücklich festgehalten:

- `ec6447d1-97da-5b77-94ae-4973b43f094e` wurde minimal fachlich revidiert,
  zählt aber noch nicht als abgeschlossen. Vor einer späteren Anrechnung ist
  eine neue unabhängige Doppelprüfung des revidierten Textes erforderlich.
- `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` wurde nur als Kontext bestätigt. Das
  Ziel gehört bereits B018 und wurde weder erneut registriert noch doppelt
  gezählt.
- Bei `9cc650e0-100d-5ae1-a83b-2b854ab7c5c8` wurde die fachlich stärkere
  Round-B-Evidenz übernommen, der dort vorgeschlagene Ersatztext jedoch
  verworfen. Der aktuelle kanonische Text bleibt mit dokumentiertem gemischtem
  Dissens erhalten.

Die zentrale Rollout-Konfiguration bindet B019 und B020 unter dem Hash
`11b960e33aa035559673f333e4b9370efc01822ae102fa30969a70393902e8aa`.

## Korrektur des Physikbilds `ba16948b…`

Der Zwischenkandidat `02669013…` wurde nach erneuter Product-Owner-Prüfung
verworfen: Das dritte blaue Magnetfeldbündel blieb longitudinal missverständlich
mit seinem Nachbarn verschmolzen. Zwei weitere Nano-Banana-Pro-Versuche und eine
präzise generative Bildbearbeitung verfehlten die gebundene Vier-Intervall-
Geometrie ebenfalls und wurden nicht importiert.

Die akzeptierte Fassung behält das Nano-Banana-Pro-Gesamtbild und ersetzt nur
den Feldwellenbereich durch eine deterministische SVG-Überlagerung. Fünf
gemeinsame Nullstellen `Z0` bis `Z4` begrenzen genau vier E- und vier
B-Halbwellen. Das dritte B-Bündel liegt ausschließlich in `Z2–Z3`; es endet auf
`k`, bevor das vierte beginnt. Die unabhängige Physikprüfung ist PASS. Eine
sichtbare lokale Naht und der etwas glattere Stil sind dokumentierte
Schönheitsfehler; der Product Owner hat die konkrete Fassung als nicht perfekt,
aber hinreichend gut bestätigt.

- alter Bildhash:
  `02669013ecdfd48a07a4ff96364a01cabc6c2f7456050628f217ff641c991998`
- akzeptierter Bildhash:
  `db637dbe6ca80ebc329d60ed64da7db656bb686ef275357632b6afbb8001c08a`
- Geometriequelle:
  `em-wave-geometry-correction-v2.svg`
- Review-Dossier: `physik-batch-087.md`

Kanonische, öffentliche und Backend-Kopie sind byteidentisch. Der QA-Eintrag
ist aktuell und bindet die ausdrückliche Product-Owner-Freigabe dieser Variante.

## Lernzielbücher und Runtime-Artefakte

Beide Lernzielbücher wurden aus dem aktuellen kanonischen Bestand neu gebaut
und als bounded-atlas-PDFs gerendert.

| Artefakt | SHA-256 |
| --- | --- |
| Mathematik BookModel | `fd04065df85243de699a583a28a5d5407695e94430cfc69ef04d72ff1b831463` |
| Mathematik Modelldigest | `2c09186739825ba3c9c463d64eced1992206602f67b21b96b3a9239480a1b17f` |
| Mathematik PDF | `f7a76d02be53bc4ef545217a35b48d5834c567b903c253e3981a9d524b5b7114` |
| Mathematik Render-Manifest | `ca0c26242d37a87e9ba429e0413f00c35e853a0f01a44704ae61a16154aca655` |
| Physik BookModel | `fabd4dd1f156eb827c9c041bd36d0478f194c3846e634d4c33da311db4ab632f` |
| Physik Modelldigest | `f06fb3c3bf65587aa1f152e2ff45c2815e49ab57610805c328dee846bfef1da8` |
| Physik PDF | `619a0ac177acb90c5e9cd7b723a6c8c6b30e82a5da2fac0f92c0c5247c41fb48` |
| Physik Render-Manifest | `819d4790ce0b37a5ccb4a0dd6b16ac6cd31bd08c67f4b07756aee283b3c2280a` |

Frontend- und Backend-Kopien sind bytegleich. Die vorgesehenen URLs bleiben:

- `https://skillpilot.com/lernzielbuch`
- `https://skillpilot.com/lernzielbuch/de-gym-mathematik-bundesweit.pdf`
- `https://skillpilot.com/lernzielbuch/de-gym-physik-bundesweit.pdf`

## Bestandene Abschlussprüfungen

- hashgebundene B019-/B020-Materializer mit deterministischen Plans und
  unabhängigen fachlichen sowie technischen Read-only-Audits
- zentraler Deep-Understanding-Check: 0 Blocker
- Semantic Atomicity und Memory Review: Mathematik 792/792, Physik 461/461
- Visualisierungs-QA, Approval-Coverage und 1.526 Asset-Verknüpfungen
- Curriculum-Status und neun geschützte Maturity Floors
- vollständige Lernzielbuch-Pipeline mit 16 Teilprüfungen, Publikationsprüfung
  und Produktionsbuild
- aktuelle öffentliche Quellenrationalen und Runtime-Index-Prüfung
- KI-Transparenzinventar, Frontend-Shell und deploytes Transparenzartefakt
- OpenAI-Coach-v1-Review-Freeze einschließlich 8/8 Freeze-Tests
- Frontend-/Backend-Byteparität, leeres Git-Staging und `git diff --check`

## Verbindliche Fortsetzungsgrenze

**Vor Auswahl oder Start eines weiteren Mathematik- oder Physik-Batches wird
das Verfahren verbindlich überprüft. Bis zum Abschluss dieses Reviews wird
kein neuer Batch ausgewählt.**

Das Review klärt mindestens:

1. einen persistenten Ausschluss-/Coverage-Ledger für systematische Auswahl
   ohne Wiederholungsprüfungen,
2. echte Unabhängigkeit und nachweisbare Isolation der beiden Review-Runden,
3. die unterschiedliche Behandlung unveränderter `KEEP`-Ziele und revidierter
   Ziele mit zwingender neuer Doppelprüfung,
4. Kosten und Nutzen der Evidenzmaterialisierung sowie risikobasierte
   Batchgrößen und Parallelisierung,
5. frühe günstige Batch-Gates gegenüber teuren Checkpoint-Gates,
6. crash-sichere Hash-Pins, deterministische Wiederaufnahme und Residuenfreiheit,
7. fachliche Qualitätssamples und Eskalationskriterien,
8. die Nano-Banana-Pro-first-Regel: Eigenbilder nur, wenn Nano Banana Pro die
   erforderliche fachliche Qualität nicht erreicht.

Die spätere Fortsetzung startet bei Mathematik 145/792 und Physik 178/461.
`ec6447d1…` ist dabei der ausdrücklich offene Re-Review-Fall.
