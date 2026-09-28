# Mathematik M7: acht V-only-Ziele auf vorhandene Bildbytes geprüft

Stand: 27. September 2026. **Nichtkanonisches Read-only-Audit**, keine
Bildfreigabe und keine menschliche QS. Aus dem aktuellen
`mathematik.qa.json` ergeben sich 37 Ziele ohne `aiApproved: "yes"`; die
aktuelle D-Triage weist 29 davon zugleich als D-offen aus. Die hier
verbleibenden **acht D-bereiten V-offenen IDs** wurden gegen die aktuelle
kanonische Zielbeschreibung und die tatsächlich vorhandenen Bildbytes
geprüft. Sieben haben **keinen aktiven** `goal-visualization`-Link; nur
`121e3fdf…` ist als bewusst nicht V-freigegebener Pilot verlinkt. Ein
`deferred_provider_limitation` ist keine Bildfreigabe und ein
`deferred_quality_review` keine Aufforderung zum bloßen Hash-Tausch.

| Ziel | Aktueller Zustand und beste vorhandene Bytes | Befund / Entscheidung ohne neue Pixel |
| --- | --- | --- |
| `06ce2b1b-e888-5322-9ed9-dfc6d322956a` – ln als Umkehrfunktion | Kein Link; QA `deferred_quality_review`. Nutzer-PNG vom 24.09., SHA-256 `88c744b741a89636cfad6c1e3f95f8c7e6f00a5f94642bbf379f686b06481a02`, archiviert unter `math-astra-user-image-sight-20260924-v1/assets/06ce2b1b-…/`. | **Einziger plausibler No-new-pixels-Re-Review-Kandidat**, nicht schon KEEP/Freigabe. Die Originalpixel zeigen gleich skalierte Achsen, `y=x` sowie die zutreffenden gespiegelten Paare `(0,1)↔(1,0)` und `(1,e)↔(e,1)` auf den passend geformten Kurven. Der frühere HOLD bemängelt das Fehlen des zusätzlich *im Prompt* geforderten Paars `(ln 4,4)↔(4,ln 4)` und seiner Hilfslinien; dieses spezielle Paar steht nicht in der kanonischen Zielbeschreibung. Eine neue unabhängige Bild-/Kartengrößen- und Stilentscheidung müsste begründen, ob die vorhandenen Paare die explizite Graphspiegelung ausreichend illustrieren. Das 1254×1254-PNG ist quadratisch und nur bedingt konsistent mit der nun bevorzugten breiten Bildlandschaft. Bis dahin V offen. Der ebenfalls archivierte Funktionsmaschinen-Kandidat `479febd1…` ist inhaltlich korrekt und mobil lesbar, zeigt aber **keine** Graphspiegelung und reicht allein für dieses Ziel nicht. |
| `121e3fdf-54d2-4d46-bc2d-f6e725f10f41` – Koordinatenfigur | Aktives Pilot-PNG, SHA-256 `9a388e26e0e16f2ade9a92f92545fe1e5457f90a35dd8e6eabecb37aa3b2a5c2`; `aiApproved: "no"`. | **Kein KEEP für V.** Bei Originalauflösung liegt A links der `x=−3`-Gitterlinie, obwohl A als `(−3,−2)` beschriftet ist. Der Bildlink sagt diese Einschränkung selbst im Alt-Text. Der ältere, in alten Builds erhaltene JPG-Grundriss ist zwar in seinen vier Punktlagen plausibel, zeigt nur den ersten Quadranten und deckt damit das inzwischen ausdrücklich vierquadrantige Ziel nicht ab. Pilot-Toleranz ist keine exakte maschinelle V-Freigabe. |
| `d051857c-0707-544f-ae7a-f20690d182b2` – Dreieckshöhen | Kein Link; QA `deferred_provider_limitation`. | **Kein zielgenaues Bestandsbild gefunden.** Das Ziel fordert die Konstruktion jeder Höhe als Senkrechte zur gegenüberliegenden *Geraden* sowie eine Prüfung. Der dokumentierte Struktursplit verwahrt davor, ein breiteres Clusterbild auf dieses einzelne Kind zu übertragen. Ein pauschaler Provider-KEEP wäre unbelegt. |
| `ae483d98-54e0-5985-96d2-fc1351d22e4f` – Stichprobenumfang im Test | Kein Link; QA `deferred_quality_review`. Archiviertes Nutzer-PNG, SHA-256 `3a0fa7dc586aac88c944dbb5e19bfef95cc73eca4ab84c77fd26a607b31e9146`. | **Kein KEEP.** In der linken `n=50, p₁=0,6`-Verteilung ist der orange Gipfel rechts des Ablehnungswertes `K≥32` gezeichnet, obwohl ihr Erwartungswert `np₁=30` links davon liegt. Ein älteres Build-JPG enthält weitere unplausible bzw. doppelte Achsenzahlen und viel dominante Beschriftung; es ist kein sicherer Ersatz. |
| `0c7bbd3f-0a04-4f0e-888b-40ab7841fb76` – Newton | Kein Link; QA `deferred_quality_review`. Archiviertes Nutzer-PNG, SHA-256 `53f013a7587b921b1238ea1afeb976d7f69c513f1c83fcbcec5be5409ea26698`. | **Kein KEEP.** Die markierten `x₁=1,5`, `x₂≈1,4167` und `√2` sitzen nicht auf derselben eingezeichneten x-Skala; die Nullstellenmarkierung liegt links des tatsächlichen Kurvenschnitts. Ein altes Build-JPG ist textlastig und hat selbst mehrdeutige Tangenten-/Iterationspunkte. |
| `2231c29b-eb4e-51ae-9cb1-eb033bf16099` – parallel/senkrecht | Kein Link; QA `deferred_quality_review`. Altes JPG `ec06d27b…` archiviert. Bester neuer inaktiver PNG-Versuch 2: SHA-256 `b607afbb1959b917e840aa8a6c0109987b06b08f1162924cfa77b302243083c3`. | **Kein KEEP.** Beim alten Bild liegen zwei ausdrücklich als rechtwinklig markierte Schnitte nur bei etwa 79°/85°. Versuch 2 ist deutlich besser und in der 360-px-Ansicht erkennbar, doch die untere Diagonalkreuzung wurde auf etwa 89° statt nachweisbar 90° vermessen; das Rechtwinkelsymbol behauptet Genauigkeit. Der archivierte unabhängige HOLD bleibt nachvollziehbar. |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` – Spatprodukt | Kein Link; QA `deferred_quality_review`. Altes JPG `327da301…` archiviert. Bester inaktiver PNG-Versuch 5: SHA-256 `24d3703dbd25a381b3b414706490eabc4163bbd5f5e639c3f0b818e29dda3e36`. | **Kein KEEP.** Das alte Bild stellt die x-/y-Achsen und zugehörigen Vektorrichtungen widersprüchlich dar. Versuch 5 hat richtige, bei 360 px lesbare Formeln, doch die unabhängige Gegensicht sah einen Knick der schwarzen x-Achse am roten Pfeilende, fehlende Deckung mit der gestrichelten Kante und einen kleineren y-Knick. Korrekte Formeltexte heilen die räumlich widersprüchliche Zeichnung nicht. |
| `8b3ce429-e6bb-5d33-b6aa-6ded41afc74c` – ln-Graphen transformieren | Kein Link; QA `deferred_provider_limitation`. Nutzerdatei zu Prompt 20 war SHA-gleich mit Sinus-/Kosinussatz-Prompt 19. Inaktiver Codex-Versuch 3 SHA-256 `3af5263f27e60c0cdecdf3032c16a2c39e316dca1e826f322ffb7082b0c53b1e`. | **Kein KEEP.** Die kopierte Datei zeigt ein anderes Fachmotiv. Codex-V1 ist teilweise transparent und auf Kartengröße textüberladen; V2 markiert `(e,1)` und `(e,2)` links von `x=e`; V3 korrigiert diese Punkte, zeichnet aber `ln(3)` bei `x=3` unterhalb `y=1` (obwohl `ln 3>1`) und den Schnitt mit `ln(x−2)+1` zu weit links. |

Die Bildsichtung erfolgte an Originalpixeln für das aktive Koordinaten-PNG
und die oben konkret benannten archivierten Kandidaten. Vorhandene
360-px-Diagnosekopien wurden für `2231c29b…` Versuch 2 und `944dd479…`
Versuch 5 geprüft; für den möglichen `06ce2b1b…`-Re-Review ist die
Kartengrößenprüfung **noch offen**. Die QA- und kanonischen Links blieben
unverändert. Aus diesem Audit folgt **0** neue V-Freigaben und **0** neue
strenge Fünf-Gate-Abschlüsse. Es trennt nur einen begrenzten Re-Review-
Kandidaten von sieben Fällen, in denen die vorhandenen Pixel nicht tragen.
Auch eine spätere V-Freigabe wäre eine maschinelle Entscheidung zum **exakten
Asset-Hash**; eine menschliche Freigabe oder Erprobung wird daraus nicht.
