# Q2-v2: fachliche Triage und offene Freigaben

**Entscheidungsstand 28.09.2026:** Rechen- und Strukturprüfung eines AI-Kandidaten, keine unabhängige Prüfungs-, Quellen-, Projektions- oder M7-Freigabe. Die v1-Aufgabe `1878f680…` ist im Canonical weiter `released`, obwohl ihre 42er-Coverage fachlich zu breit ist. Bis zu einer kohärenten Reparatur darf dieser Metadatenstatus nicht als Beleg für 42 geprüfte Kompetenzen gelten.

## Hypothetische Reduktion der alten Prüfung

Die bestehenden Teile 1–2 tragen eindeutig `9460c3ff…` und `5390691d…`. Die bisherige Volumenrechnung in Teil 3 ist für `5f548596…` höchstens ein bedingter dritter Beleg; der neue Wortlaut macht den Eigenschafts- und Vergleichsanteil ausdrücklich bewertbar. `288633c1…` ist erst nach diesem neuen Prisma-Vergleich vollständig prüfbar. Ob der vierte alte Zielanspruch und alle vier Voraussetzungen fair sind, bleibt offen. Teil 4 rechtfertigt keine pauschale `7d37513b…`-Zuordnung.

Die hypothetische Viererfassung entfernt 38 bisherige direkte Zuordnungen; **keine** dieser 38 IDs hat derzeit eine andere direkte Sek-II-Prüfungszuordnung. In einem rein kanonischen, noch nicht nach GK/LK und Bundesland projizierten `requires`-Graphen fehlen danach für die folgenden **16** IDs alle Wege zu den derzeitigen Sek-II-Prüfungsenden:

| Ziel-ID | Vorhandener Aufgabenentwurf aus v1 | Befund v2 |
| --- | --- | --- |
| `1e77bb2f-0cd6-5961-b0fb-230317c73fce` | `q2-volume-five-solids` | v2-Teil 1 prüft Prisma, Formel, Skizze und Einheit; Fünfziel-Scope 31/32. |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | `q2-volume-five-solids` | v2-Teil 2 und eigenständige HE-LK-Aufgabe prüfen Kantenwahl, Spat- und Tetraedervolumen; volle Scope-Freigabe offen. |
| `c71ae268-f28e-59f0-982d-91db8f963378` | `q2-volume-five-solids` | v2-Teil 3 prüft Zylindergrundfläche und Volumen. |
| `e8237315-654e-5150-97de-49c4cb49b3d1` | `q2-volume-five-solids` | v2-Teil 4 fordert den Drittelfaktor beim gleichen Zylinder ausdrücklich. |
| `2f2c9f1a-07f0-59e4-b84a-60648c3b0bda` | `q2-volume-five-solids` | v2-Teil 5 prüft Formel und kubischen Radiusfaktor. |
| `e9181209-1506-59df-9053-17f36b91bb06` | `q2-volume-derivation-transform-lk` | v1-Integralteil fachlich plausibel; vom veralteten 7d-Transformationsfall trennen und als eigene, kursrichtige Aufgabe neu begutachten. |
| `3016ec37-1c2e-47db-83f5-e767923bc97e` | `q2-projection-mirror-point-distance` | v1-Teil 1 plausibel; das Vierziel-Paket teilt aktuell nur eine gemeinsame Kurssicht und muss aufgeteilt werden. |
| `06de364f-9b63-4044-8229-a975621dc6df` | `q2-lines-planes-intersections` | v1-Teil 2 prüft Normalenrichtung, Achsenschnitte, Punktprobe und Lage; Vierziel-Paket aufteilen. |
| `baf7276f-60a0-4d96-b959-d63acfb929de` | `q2-lines-planes-intersections` | v1-Teil 4 prüft Gerade-Ebene-Schnitt und Deutung; Vierziel-Paket aufteilen. |
| `8eb14d81-353a-4909-9464-61be7b1ba5b8` | `q2-skew-lines-parallel-plane-distance` | v1-Teil 2 nutzt nur achsenparallele Spezialfälle; für allgemeinere analytische Kompetenz vor Freigabe stärken und Scope splitten. |
| `ed5d869b-af4e-4b80-b34d-a2338e16ce34` | `q2-projection-mirror-point-distance` | v1-Teil 2 zur orthogonalen linearen Projektion plausibel; aus Vierziel-Paket lösen. |
| `eb6bfdd9-3cbe-51b5-9798-a741bdc2782e` | `q2-cuboid-spatial-representations` | v1-Teil 3 prüft 3D-Software und zwei Ansichten, wenn tatsächliche Screenshots abgegeben und bewertet werden; das andere Ziel `d379…` bleibt Bild-Stimulus-HOLD. |
| `72dfc164-455d-4b63-85f0-96e803c9a1d5` | `q2-vector-combination-dependence` | v2-Teil 1 prüft Rechnung und geometrische Deutung; erste priorisierte Aufgabe. |
| `6fc9246a-9448-4cdb-b627-cf20ea1c65d3` | `q2-vector-combination-dependence` | v2-Teil 2 prüft Abhängigkeit und Unabhängigkeit; erste priorisierte Aufgabe. |
| `54cfe5ce-693e-5d4a-ac1b-009570fbbc11` | `q2-vector-combination-dependence` | v2-Teil 3 prüft positive/negative Kollinearitätsfälle; erste priorisierte Aufgabe. |
| `ef1524f1-0b2f-59f7-a001-5ab3e3dececb` | `q2-plane-figures-congruence-similarity` | v1-Teile 5–6 prüfen Viereckargumente plausibel; vollständige Ziel- und Scope-Begutachtung offen. |

Die drei neuen v2-Aufgaben adressieren acht **verschiedene** Zeilen dieser Tabelle; die übrigen acht erhalten erst durch separat geprüfte Folgeaufgaben einen neuen direkten Pfad. Dass die anderen 22 der 38 entfernten Links im unprojizierten Graphen noch einen **indirekten** Pfad haben, beweist weder dortige Prüfungsdeckung noch einen realen lokalen Pfad in jeder GK/LK-/Ländersicht.

## Rechenkontrolle der drei priorisierten Aufgaben

- Vektoren: $2(1,2,0)+(0,1,1)=(2,5,1)$; $u,v$ unabhängig, $2u+v-w=0$; $q=3p$, $r$ kein Vielfaches von $p$; BE $8+6+6=20$.
- Fünf Körper: Prisma $G=24$, $V=120$; Spatprodukt $24$, Tetraeder $4$; Zylinder $90\pi$, Kegel $30\pi$; Kugeln $36\pi$ und $288\pi$ mit Faktor 8. BE $5+7+4+5+4=25$.
- HE-LK-Spat: $(0,2,0)\times(1,0,5)=(10,0,-2)$; Skalarprodukt mit $(3,1,0)$ ist $30$, umgekehrte Kreuzproduktreihenfolge ergibt $-30$; Spat $30$, Tetraeder $5\,\mathrm{cm}^3$. BE $3+2+2+1+2+2=12$.

## Scope- und Freigabe-HOLDs

1. Der aktuelle Atlas-Diagnoselauf (`sha256:522ff4e8b85c329d5a83e926a071070bacb769333ba4a5ed07acf0dd9262795b`) liefert für Vektoren 32/32 und die fünf Volumenziele 31/32 GK/LK-Sichten. In HE-LK ist nur das Spatprodukt-Ziel der Fünfergruppe sichtbar. `BY-GK` und `BY-LK` sind dort vorläufige SkillPilot-Zuordnungen des bayerischen Pflichtfachs beziehungsweise Pflichtfachs plus fünf Vertiefungsmodulen; sie senken keinen Qualitätsanspruch an Ziele oder Prüfungsaufgaben.
2. Die kanonische 7d-Geltung ist inzwischen HE-only LK und das Ziel bezieht sich auf zentrische Streckung. Der v1-Entwurf mit anisotroper Abbildung ist daher inhaltlich unpassend. Zusätzlich zeigt die momentan generierte Buchprojektion 7d in breiteren GK-/Ländersichten. Diese Inkonsistenz muss vor jedem 7d-Assessment behoben werden. Keine 7d-Coverage wird in diesem Paket beansprucht.
3. Der Fünfkörper-Entwurf könnte fünf ungleich fortgeschrittene Fähigkeiten unnötig zugleich voraussetzen. Auch wenn die Teilaufgaben getrennt bepunktet sind, darf der `requires`-Satz nur nach einem Review der tatsächlichen Q2-Lernwege stehen. Eine Aufteilung in kleinere Endpunkte ist zulässig und bei Scope-Konflikten vorzuziehen.
4. `reviewStatus: released` der alten Prüfung gehört zur bisherigen Fassung und darf nicht auf die geänderte Teil-3-Fassung oder die drei Kandidaten übertragen werden. Eine neue Version mit Aufgaben-, Lösungs-, BE-, Quellen- und projektionstreuer Abdeckungsprüfung ist erforderlich. Erst die vollständige Integration samt aktuellen Route-/GoalBook-/D-/P-/CQR-/M7-Checks erlaubt einen Abschlussbefund.
