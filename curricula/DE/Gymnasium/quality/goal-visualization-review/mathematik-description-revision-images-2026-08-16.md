# Mathematik: Bildreview nach Beschreibungsrevision R01–R33

Review date: 2026-08-16

Status: `accepted_after_description_review`

## Scope und Reviewgrenze

Dieses Ledger bindet die 33 vom Product Owner freigegebenen Beschreibungsrevisionen aus
`canonical-math-description-authoring-change-set-2026-08-16.json` neu an ihre
Lernzielvisualisierungen. Es dokumentiert einen vollständigen visuellen und fachlichen
AI-Review in Originalauflösung. Es ist **keine neue menschliche M7-Freigabe**.

- Klasse A: unverändertes Bild und bereits tragende menschliche Freigabe bleiben erhalten.
- Klasse B: unveränderte Bildbytes wurden gegen die neue Beschreibung erneut gelesen;
  Alt-Text wurde nur bei tatsächlich geänderter deutscher Beschreibung neu gebunden.
- Klasse C: fachlich unzureichende oder fehlende Assets wurden ersetzt. Frühere Assets und
  Prompts liegen bytegenau unter `historical-assets/<goal-id>/superseded-2026-08-16/`.
- Provider der vier neuen PNGs: `OpenAI image generation` (built-in image generation).
  Sie werden nicht als Nano-Banana-Ausgaben bezeichnet.
- Prüfmaßstab: sichtbare Mathematik, Notation, Beschriftungen, geometrische Zuordnung,
  Textlesbarkeit, Umlaute, Zielbezug, Alters-/Kontextpassung und offensichtliches
  Lizenz-/Copyright-Risiko.

## Ergebnis R01–R33

| Goal-ID | Klasse | Disposition | Fachliche Entscheidung |
|---|---:|---|---|
| `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` | B | `accepted_reuse_after_description_review` | Flächenformeln und Einheiten bleiben korrekt; die EN-Paritätskorrektur erzeugt keinen Bildwiderspruch. |
| `f8704a7b-e93d-4e32-b0f9-1b171545fe28` | B | `accepted_reuse_after_description_review` | Nichtnegative Hauptwurzel, Quadratzahlen und Näherung sind korrekt; Bildbytes bleiben unverändert. |
| `99bfb566-f875-5646-ac3e-05a039838c54` | B | `accepted_reuse_after_description_review` | Funktionsfamilie, Steigung und Achsenabschnitt bleiben eine korrekte Teilvisualisierung. |
| `e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32` | A | `accepted_unchanged_human_approval_preserved` | Sinus-/Kosinusgraphen und Ableitungen sind korrekt zugeordnet; frühere menschliche Freigabe trägt unverändert. |
| `51e80e7b-df31-5d97-97f9-4c6e26eb7416` | B | `accepted_reuse_after_description_review` | Polynom, Linearfaktoren und Nullstellen bleiben korrekt; EN-Mehrumfang wurde entfernt. |
| `492463cf-6cb2-5a5a-98e0-c1d77c36c256` | B | `accepted_reuse_after_description_review` | Ortsfunktion, Anfangsort und Geschwindigkeitsvektor sind fachlich und numerisch korrekt. |
| `ce491ec0-c558-5872-86fd-289e60a38403` | B | `accepted_reuse_after_description_review` | Punktprobe ist korrekt; das Bild vermeidet die falsche Aussage, ein Punkt sei parallel zu einer Ebene. |
| `50eb5156-5046-5887-80dc-3128c5f8cbd6` | B | `accepted_reuse_after_description_review` | Das Quaderbeispiel bleibt eine korrekte repräsentative Körperklasse ohne falschen Vollständigkeitsanspruch. |
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | C | `accepted_replacement` | Additivität und Homogenität sind mit `T(x,y)=(2x,y)` geometrisch geschlossen und numerisch korrekt; der Warnhinweis nennt die nicht hinreichenden Kriterien. |
| `3e974075-b2fd-43e6-88d9-5f596ad053ec` | A | `accepted_unchanged_human_approval_preserved` | Stichprobenmix, Basisraten, bedingte Wahrscheinlichkeit sowie Korrelation/Kausalität bleiben vollständig passend. |
| `8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d` | B | `accepted_reuse_after_description_review` | Normalverteilung, Sigma-Umgebungen und Quantile bleiben getrennt und korrekt. |
| `677be619-5f0a-59bf-9730-0071c7d3f150` | B | `accepted_reuse_after_description_review` | Der rechtsseitige Test bleibt ein korrekter Beispielweg und erhebt keinen methodischen Alleinanspruch. |
| `0a7ff229-bf90-523c-a6b4-dad2ecd54ed8` | B | `accepted_reuse_after_description_review` | Verwerfen und Nichtverwerfen sind korrekt getrennt; Nichtverwerfen wird nicht als Beweis dargestellt. |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | C | `accepted_replacement` | Ein gemeinsamer Graph zeigt komplementäres `L` und `G`, `L(p_1)=0,3`, `G(p_1)=0,7`, p0-Grenzen sowie korrekte n-/α-Merksätze. |
| `f85419c4-63ac-5d6d-b73b-fcb12a0ff89f` | B | `accepted_reuse_after_description_review` | Bekanntes p, zukünftige relative Häufigkeit, Intervall und Prognoseunsicherheit bleiben korrekt. |
| `5f328147-619c-568d-9a0d-e1787ca0c01b` | B | `accepted_reuse_after_description_review` | Betragsgleichung, symmetrische Näherung und Frequentisteninterpretation bleiben korrekt. |
| `616c72a4-972d-5cc0-b903-e2a24bcb150c` | B | `accepted_reuse_after_description_review` | Mittelwert und Median bleiben korrekt; der optionale Modalwert muss nicht im selben Bild erscheinen. |
| `e402f330-8ac6-525f-b3ff-bc4be229d131` | B | `accepted_reuse_after_description_review` | Varianz und Standardabweichung bleiben korrekt; die EN-Paritätskorrektur erzeugt keinen Bildwiderspruch. |
| `4aa70ad4-171d-5671-a864-c0c7758fa0ed` | B | `accepted_reuse_after_description_review` | Simulation, absolute/relative Häufigkeiten und Diagramm bleiben numerisch konsistent. |
| `44dba16e-2e86-56be-974b-a62093ef9211` | B | `accepted_reuse_after_description_review` | Binomialhistogramm, Normalapproximation, Streuungsbedingung und Sigma-Bezug bleiben korrekt. |
| `1cefd1ad-a250-5a03-8de7-04bdaf465ad8` | B | `accepted_reuse_after_description_review` | `n→∞`, `p_n→0`, konstantes `λ=np_n` und Poisson-Formel bleiben korrekt. |
| `ae3483e3-4712-56a1-a881-2e1f8a1a8df9` | B | `accepted_reuse_after_description_review` | Gütefunktionsfall und Vergleich möglicher Stichprobenumfänge bleiben fachlich passend. |
| `16767f5e-5f21-5adb-8365-01b0d64c28f4` | B | `accepted_reuse_after_description_review` | Tabellenkalkulation, Pseudocode, Operationen und Ergebnisprüfung stimmen weiterhin überein. |
| `4f64f771-20ba-581a-86ba-bcdb1759e4d2` | C | `accepted_replacement` | Punkt `3+4i`, Betrag 5, Argument, allgemeine Polarform und `φ=ωt` sind vollständig und korrekt dargestellt. |
| `e9c401b1-144d-525f-a148-a1113b2e82a8` | B | `accepted_reuse_after_description_review` | Die gezeigten Lösungsverfahren bleiben zulässige Beispiele ohne Ausschließlichkeitsbehauptung. |
| `803d910d-96d1-5118-b9ca-29e93d0da76d` | B | `accepted_reuse_after_description_review` | Projektionsmatrix und notwendige Nennerbedingung bleiben korrekt. |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | C | `accepted_replacement` | Robuste lokale Schnittansichten zeigen Gerade–Ebene und Ebene–Ebene ohne Koordinatenartefakte: `α` bzw. `β` liegen jeweils am Schnittpunkt `S`; sin-/cos-Formeln, `k=±1` und beide Sonderfälle `k=0` sind korrekt. |
| `edaf0bb4-e12e-5a6c-b484-91124ba209f3` | B | `accepted_reuse_after_description_review` | Geradenschar und Schnittbedingung bleiben korrekt untersucht und geometrisch gedeutet. |
| `283ec44e-747c-55e3-9a61-4a4cc70ebfab` | B | `accepted_reuse_after_description_review` | Endverhalten für beide Unendlichkeitsrichtungen bleibt über Grad und Leitkoeffizient korrekt begründet. |
| `fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc` | B | `accepted_reuse_after_description_review` | Parameterwerte für Parallel-/Schnittbedingungen und Ebenenkonfigurationen bleiben korrekt. |
| `c2c49659-5917-5be5-a3bd-e46f1b17126f` | B | `accepted_reuse_after_description_review` | Drei dargestellte Objektpaare bleiben korrekte repräsentative Anwendungen ohne Vollständigkeitsanspruch. |
| `3e53a39b-1c75-4034-a647-8de85719e1fb` | B | `accepted_reuse_after_description_review` | Parallel, senkrecht, schneidend und Streckenhalbierung bleiben korrekt; fehlende Winkelhalbierung macht das Bild nicht falsch. |
| `de393ab3-d2af-5476-8b46-315185abb805` | B | `accepted_reuse_after_description_review` | Gleichseitig, gleichschenklig und rechtwinklig bleiben korrekt; keine erschöpfende Dreiecksliste wird behauptet. |

## Ersatzassets und Prompt-Provenienz

| Goal-ID | aktives PNG SHA-256 | aktiver Prompt SHA-256 | tatsächlich verwendete Promptquelle |
|---|---|---|---|
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | `sha256:f6f6ab870716cf26b837c31321678318b8aab47bab40f36b028bb4559d471639` | `sha256:9cc2393d3bb8a1aadd46c7c32f9c0bdfcd22ae21eef7f6b27ee6ea1d5ba75621` | `visualizations/mathematik/69243680-c2c1-5661-80c0-c95a2be1dabf/prompt.de.md` |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | `sha256:b740e322764055259c7bf051d263666e0e90b64befcc0ef359a54a4c4a2fca76` | `sha256:7682a967e6ed9a4e617fbc5c50a07b6907ef755f9102a518dbce859b3f765d29` | `visualizations/mathematik/82bce6e8-7dc7-501a-a4f6-df8a3b905e3c/prompt.de.md` |
| `4f64f771-20ba-581a-86ba-bcdb1759e4d2` | `sha256:6e3834d0a3025c433ec7f9406313f100f512376b88beb31968ec6bf623a1ee79` | `sha256:fcd19169b0094e88b7f186159c3d02e66d269b1e3e48324fac40a0dc039fe52f` | `visualizations/mathematik/4f64f771-20ba-581a-86ba-bcdb1759e4d2/prompt.de.md` |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | `sha256:a54dee14f07c5df6e482e198713cb19fd64fb9660b76056cdf042eb513d5fc36` | `sha256:890ca54caefcae8b299407f15b0edd508c62c66cdd5e24763bbd63889ff538a4` | `visualizations/mathematik/5f90df42-8a71-534d-b995-b8f7dcaf1661/prompt.de.md` (wörtliche zweistufige Promptkette) |

Alle vier aktiven PNGs sind 1672×941 Pixel, RGB, und liegen bytegleich im
kanonischen Quellpfad, im App-Public-Pfad und im Backend-Static-Pfad.

## Historische Byteanker

| Goal-ID | historisches Artefakt | SHA-256 |
|---|---|---|
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | altes JPG | `272e8b368d71c9ae3b7909e2f0eb120ee331c64532117e0aedfd860afa6082a6` |
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | alter Prompt | `5620b442265295a176eb286ddb0011d5c412a6959b5e70ac23f986d52fecc78b` |
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | alter Rekonstruktionsprompt | `cb77baa30ee99550b93cb425c086e399133d700185150fbc47e045680ea4211d` |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | altes JPG | `3f3dd17a1946fb519f8a7454baa61a5218a787b2e7657bc6489d82433765d206` |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | alter Prompt | `b0ec528bcae520a13880a6364d6605a9d24a7c2938c5c9eadcbe6c0cf3160508` |
| `4f64f771-20ba-581a-86ba-bcdb1759e4d2` | alter Prompt (damals ohne Primärbild) | `bce71b937be452a4248661e361837024fef9d423af2123fdcf0bc5203461b541` |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | altes JPG | `f194368a34c3f2bb39c05e1e5e8ae1604d8b6841ffac236305695a96051490e8` |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | alter Prompt | `46421c15bcfb25e40dde07af1d5ce64bf76bb3b36960f6b06c5d8da3af165c0e` |

## Verworfene Zwischenkandidaten

Diese Dateien bleiben im Built-in-Generatorverzeichnis erhalten, sind aber in keinem
kanonischen oder Runtime-Link aktiv:

| Goal-ID | Kandidat SHA-256 | Entscheidung |
|---|---|---|
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | `70991dceb629712d841089672b46ef1a75be6947a4e286eba4c70beaa2047555` | `rejected_bad_vector_geometry`: Pfeile schließen kein korrektes Additivitätsparallelogramm. |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | `1dbc82d930aafe4f3267e7b6ae012660a6fce6199364462f430c24e425bb901b` | `rejected_noncomplementary_ordinates`: L und G liegen beim selben p1 sichtbar gleich hoch. |
| `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` | `2e4140c8ad3234d0052c022941f585909a6bfa23f2b7b7e89397ffb3ede301b7` | `rejected_axis_label_artifact`: untere Achsen zeigen unter anderem `p₁,4` statt eines eindeutigen p1. |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | `657a8e7343040b0ab7bf96d92096ff50e7ad1268f653bdfb9aafda12fab540dd` | `rejected_line_not_matching_equation`: die allgemeine Gerade ist entgegen ihrer Gleichung durch O gezeichnet. |
| `5f90df42-8a71-534d-b995-b8f7dcaf1661` | `f07e9a19450c1336925d16deb3d5f10f631aaa12b566a3c5fce8d82b061de3bc` | `rejected_coordinate_geometry`: `Q=(0,-1,0)` liegt sichtbar auf der positiven y-Seite; außerdem sitzt `α` nicht eindeutig am gemeinsamen Schnittpunkt von Gerade und Projektion. |

## QA-Bindung

- Für alle 33 Datensätze werden `description` und gegebenenfalls `altText` an die
  aktuelle deutsche Beschreibung gebunden.
- Für alle 33 aktiven Assets werden der frische Inhalts-/Umlautreview und ein
  separates AI-Approval an den aktuellen SHA-256 gebunden.
- Nur die bereits menschlich freigegebenen unveränderten A-Fälle R04 und R10 behalten
  ihre vorhandene menschliche Freigabe. Keine B- oder C-Entscheidung wird als neue
  menschliche Freigabe ausgegeben.
- Ersetzte und neu erzeugte Bilder bleiben `reviewStatus: pilot`.
