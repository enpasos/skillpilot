# enpasos – Physik mit oPhysics (Englisch)

Version 1.1.0 · Prüfstand 23. September 2026 · lokaler Kandidat; CI- und Produktionsverfügbarkeit sind damit nicht belegt.

**enpasos kuratiert acht Direktlinks. Tom Walsh erstellt und veröffentlicht die englischen Simulationen auf oPhysics; GeoGebra ist die verwendete Technik, nicht der Inhaltsanbieter.** Das Paket verlinkt nur die fremden Aktivitäten (`public-link`, `link-only`). Es kopiert oder bettet keinen Anbieterinhalt ein und überträgt keine Lernendenkennungen, Chatdaten oder Fortschritte.

## Direkte Aktivitäten und aktuelle Lernziele

Die ersten drei Links stammen unverändert aus dem Piloten 1.0.0. Die fünf weiteren decken ausgewählte Lücken ab; eine Aktivität belegt keine vollständige Zielbeherrschung.

| Aktivität (alle Englisch) | Aktuelle atomare Lernziel-ID(s) | Nutzen und Modellgrenze |
| --- | --- | --- |
| [Double Slit Diffraction and Interference](https://ophysics.com/l4.html) | `6270e558-d657-5363-a6b2-e49a032a453b`, `c64820e1-c0ee-4342-9225-f981650f0c52` | Zwei-Wege-Interferenz und Gangunterschied; keine vollständige Einzelspalt-Hüllkurve oder polychromatische Farbordnung. |
| [Hydrogen Atom: Energy Levels](https://ophysics.com/m1.html) | `d7244ce4-5409-58d1-a1b4-bfae35f391e1` | Energiedifferenz und Photonenübergang; stilisierte Kreis-/Wellenbilder sind weder Bahnen noch Orbitale. |
| [Electron Charge to Mass Ratio Lab](https://ophysics.com/em2a.html) | `8c9394cb-f54a-508d-9750-4c49e31b3fa9` | Magnetische Ablenkung negativer Elektronen bei Plattenspannung 0 V; kein allgemeiner Eintrittswinkel oder Fadenstrahlrohrversuch. Bei E-Feld wirken zusätzliche Kräfte. |
| [Rotational Inertia and Torque](https://ophysics.com/r4.html) | `cf570e66-2ce2-5923-9033-c97d74119553`, `c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea` | Kraft am Rand, Radius, Trägheitsmoment, Drehmoment und Winkelbeschleunigung variieren; starre Körper um feste Mittelachse, keine beliebige Kraftrichtung oder Reibung. |
| [Wave Pulse Reflection (Free & Fixed Ends)](https://ophysics.com/w9.html) | `215f5558-562c-5686-b649-931f324c7983` | Umkehr am festen und gleichsinnige Reflexion am freien Ende; eindimensionaler Puls, keine quantitative Phasenmessung oder kontinuierliche Welle. |
| [Reflection and Refraction](https://ophysics.com/l7.html) | `6a4c6042-052b-502b-a39a-0ed8941247ac` | Strahlengang bei veränderbaren Brechzahlen und Einfallswinkel; optische Hebung, Wellenfronten und Dispersion werden nicht gezeigt. |
| [Equipotentials & Electric Field of Two Charges](https://ophysics.com/em9.html) | `4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe`, `2622bef1-bdbc-504e-b468-b600b2ca3ed8` | Zwei Punktladungen, Feldvektoren, Potenzial und Äquipotentiallinien vergleichen; eigenständige Vektoraddition, Berechnung und Konstruktion bleiben nötig. Ideale Punktladungen; die Anbieterbeschreibung empfiehlt Eingabefelder statt ruckelnder Regler. |
| [Charged Particle in a Magnetic Field 3D](https://ophysics.com/em8.html) | `7fe6f8a1-5580-4e37-bf8e-9772964a6b0a`, `9854589c-5feb-4942-b90f-311ddf36eb78` | Anfangsgeschwindigkeit in zwei Richtungen, Masse, Ladung und B-Feld variieren; Kreis-/Schraubenbahn und Radius vergleichen. Ideales homogenes Feld ohne Stöße oder Feldränder; Vektorzerlegung und Ladungsvorzeichen selbst begründen. |

Die Zuordnung in `package.json` ist eine datierte KI-Prüfung (`authority: ai`), keine menschliche Fachfreigabe. Alle genannten IDs existieren im aktuellen kanonischen Physikgraphen als atomare Ziele. Besonders die Zuordnungen zu optischer Hebung und zum elektrischen Potenzial stützen jeweils nur einen Teil des Zieltexts.

## Zugangs- und Mobilprüfung

Am 23. September 2026 wurden alle fünf neuen oPhysics-Direktseiten ohne Konto in Chromium mit HTTP 200 geöffnet; die eingebetteten GeoGebra-Applets luden. Eine Parameteränderung wirkte bei Rotation auf Drehmoment und Winkelbeschleunigung, bei Brechung auf den Brechungswinkel und beim 3D-Magnetfeld auf den Bahnradius. Beim Wellenpuls wechselte die Auswahl fest/frei; im Zwei-Ladungen-Applet wechselte 3D zu Äquipotenzialansicht.

Die fünf neuen Seiten wurden zusätzlich in einer **390 × 844 px Smartphone-Emulation mit Touch** geprüft: Start bei Rotation und Magnetbahn sowie Umschalten bei Wellenpuls, Brechung und elektrischem Feld funktionierten durch simulierte Berührung. Das ist kein Test auf einem physischen Smartphone. Die Seiten haben keinen Mobile-Viewport und skalieren Applets von 720–1189 px Breite auf etwa 30–37 %; Text und Trefferflächen sind daher sehr klein. Für längere Arbeit empfiehlt sich ein größeres Display oder Browser-Zoom. Mobile Barrierefreiheit und Bedienung mit Screenreader wurden nicht bestätigt. Die drei übernommenen Pilotseiten wurden in diesem Durchgang nicht erneut mobil getestet; ihre dokumentierten Desktop-Interaktionen stehen im [1.0.0-Review](../1.0.0/README.md).

Die [oPhysics-Homepage, Abschnitt „Permissions“](https://ophysics.com/), nennt Tom Walsh als Urheber und erlaubt die Nutzung der Inhalte **für nichtkommerzielle Bildungszwecke**. Das ist keine pauschale Open-Content-Lizenz und keine Erlaubnis für kommerzielle Nutzung, Kopie oder Einbettung. Die direkte Nutzung war bei den geprüften Seiten kostenlos; der Spendenlink ist freiwillig.

## Geprüft und bewusst nicht aufgenommen

| Kandidat | Grund |
| --- | --- |
| [Person on Rotating Platform](https://ophysics.com/r9.html) | Verändert Plattform-/Personenmasse und Radius zur Winkelgeschwindigkeit und Zentripetalkraft, erklärt aber die Pirouette mit Änderung des Trägheitsmoments bei erhaltenem Drehimpuls nicht sauber genug für eine enge Zuordnung. |
| [Rotating Disks](https://ophysics.com/r9a.html) | Inhaltlich interessant für Drehimpulserhaltung, aber die oPhysics-Seite trägt derzeit die Überschrift „Person on Rotating Platform“, während Beschreibung und Applet fallende Scheiben zeigen. Der widersprüchliche Direktseitenkontext ist für Lernende verwirrend. |
| [Charged Particle in a Magnetic Field (2D)](https://ophysics.com/em7.html) | Radiusvergleich vorhanden; für den ausgewählten Batch bietet die 3D-Variante zusätzlich die getrennten Anfangsgeschwindigkeiten und damit mehr Nutzen für das aktuelle Winkel-Ziel. |

Ein Anbieter- oder Simulationsausfall blockiert SkillPilot-Lernen nicht. Mastery, Voraussetzungen und Lernplan bleiben unabhängig von diesen optionalen Links.
