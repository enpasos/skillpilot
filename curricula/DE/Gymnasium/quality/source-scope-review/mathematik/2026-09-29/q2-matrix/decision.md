# Matrixziele: Quellen- und Scope-Korrektur vom 29.09.2026

Diese Implementierung betrifft `803d910d-96d1-5118-b9ca-29e93d0da76d` und `d3c42193-f1b7-5c6d-a991-bf034d99359f`. Sie ist keine neue D/P/A/M/V-Freigabe. IDs, DE/EN-Titel und Beschreibungen, Voraussetzungen und Bilder bleiben unverändert.

## Entscheidung und Quellen

| Ziel | Operativer Target-Scope | Zusätzlich geprüfter Quellenanteil |
| --- | --- | --- |
| 803: Parallelprojektion auf beliebige Ursprungsebene im R³ | HE / SekII / LK | Kein gleichwertiger Nicht-HE-Beleg gefunden. |
| d3: Fixpunkte linearer geometrischer Abbildungen, Ax=x | HE / SekII / LK | RP / LK / Wahlpflicht A1: fachlicher linearer Teilfall, konditionaler nicht-operativer Beleg; gesamte affine Anforderung bleibt offen. |

- **HE:** `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, S.44, Q2.5, erhöhtes Niveau: Parallelprojektionen auf beliebige Ursprungsebenen und Fixpunkte. S.40 nennt Q2.1–3 als verbindliche Themenfelder; der erhaltene Q2.5-Scope behauptet keine darüber hinausgehende allgemeine Prüfungspflicht.
- **BW:** `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`, Leistungsfach-Abschnitt 3.4.3, Druck-S.41–42 / PDF-S.43–44. Keine Kompetenz zu diesen Projektionsmatrizen oder geometrischen Fixpunktmengen. Gesamtdokument zusätzlich nach entsprechenden Begriffen geprüft.
- **SH:** `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`, S.61 (Koeffizientenmatrizen/Gauß), S.65–66 (Raum/Form), S.82 (Operatorbeispiel Matrixgleichung): kein direkter Vollbeleg für die beiden Atome.
- **NI:** `curricula/DE/Gymnasium/input/NI/upper-secondary/ma_go_kc_druck_2019.pdf`, S.51 eA: 2×3-Matrix für die Projektion des Raums in die Zeichenebene/Schrägbilder; weitere Abbildungsmatrizen ausdrücklich optional. Das ist kein Beleg für eine beliebige Ursprungsebene als R³-Endomorphismus.
- **MV:** `curricula/DE/Gymnasium/input/MV/Mathematik_Gymnasium_11_12_2019.pdf`, PDF-S.24–25: Bildpunkte und Parallelprojektionen in Koordinatenebenen. Die Reichweite ist enger als 803.
- **RP:** `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_II_MSS.pdf`, Druck-S.46 / PDF-S.47: A1 „Vektoren und Matrizen“ ist eines von zwei alternativen Wahlpflichtgebieten; Druck-S.48 / PDF-S.49 nennt die allgemeine affine Matrix-Vektor-Gleichung und ausdrücklich auch den linearen Spezialfall x′=Ax; Druck-S.49 / PDF-S.50, Ziel13 verlangt die Untersuchung affiner Abbildungen nach Fixelementen. d3 deckt nur b=0 und Fixpunkte, nicht Ax+b=x bei b≠0 oder weitere Fixelemente. Die BY-spezifische Vertiefungskurs-Union-Policy wird nicht auf RP übertragen. Druck-S.66 / PDF-S.67 nennt Parallelprojektionen lediglich als möglichen fachübergreifenden Beitrag, keinen Vollbeleg für 803.
- **HH/HB:** Fixvektoren in stochastischen Prozessen (HH GyO2022 S.38; HB GyO2022 S.36–37) sind keine direkte Quelle für das geometrische Atom d3.

## Umsetzung

Beide Ziele erhalten explizite `HE / SekII / LK`-Applicability, eine Mapping-Inheritance-Grenze und je ein kontextgebundenes Sek-II-Placement. Die HE-LK-Ansichten und der nationale LK-Inhaltskatalog behalten ihre Targets. In 66 anderen Ansichten unterbinden direkte `prerequisiteOnly`-Einträge die bisherigen unbelegten Targets; reine Voraussetzungen bleiben stabil referenzierbar. Die nationalen Ansichten bleiben Inhaltskataloge, keine zusätzlichen Landespflichten.

Für RP-SourceGoal `de-rp-mathematik-sekii-mss-2015-rp-sekii-lf-a1-vektoren-matrizen-013-4e4070ea25` werden vier fachlich falsche operative Analysis-Cluster-Mappings zurückgezogen. Die Zeile erhält `needsCanonicalGoal`, ein ausdrücklich nicht-operatives `partialSourceEvidence` für d3 und die offene affine Restanforderung. Dadurch zählt der Quellenstatus 191 statt 192 operativ abgedeckte Zeilen; die bisherigen 191 anderen Zuordnungen werden durch dieses begrenzte Audit nicht erneut bestätigt. Eine partielle d3-Kante darf die gesamte affine Zeile nicht rechnerisch schließen. Vor einem RP-Target braucht es außerdem eine ausdrückliche Modulwahl-Projektion.

## Prüfung und Grenzen

[Native Validierung](native-validation.json) und [Dateimanifest](changed-files.json) sind an den unmittelbar nach dieser Reparatur eingefrorenen Stand gebunden. Ergebnis: Canon 0 Findings; 88 Views geprüft; 66 Views geändert; 0 neue Compilerfehler; 0 fremde atomare Target-Deltas; 0 unbelegte authored Targets. Der Vergleich ignoriert ausschließlich veränderte `nodePath`-Indizes durch vorangestellte Rollen-Ausnahmen; Code, Schweregrad und Nachricht werden exakt verglichen. Zwei vorbestehende SL-Teilbaumüberlappungen bleiben als fremder Vorbestand sichtbar.

Die parallel autorisierte Q2-Korrektur `990739f7` (`examData.reviewStatus: needs_review`) ist erhalten und im Canon-Diff separat erkennbar. Der vollständige Atlas-Build war bereits vor dieser Mutation durch eine fremde veraltete Semantic-Kind-Bindung für `14b19ee4` blockiert. Sie wurde nicht umgangen oder verändert. Nach zentraler Neubindung sind der Atlas-Build sowie frische unabhängige D-Bindungen für die beiden geänderten Scopes erforderlich. Das native Ergebnis ist kein M7-Abschluss.
