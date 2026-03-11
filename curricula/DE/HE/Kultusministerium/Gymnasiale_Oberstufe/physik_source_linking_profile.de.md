# Physik Source Linking Profile

## Ziel

Dieses Dokument definiert das verbindliche Source-Linking-Profil fuer
`DE_HES_S_GYM_2_PHYSIK.de.json`.

Es fuehrt **kein** neues Schema ein. Es konkretisiert nur den bereits
repo-weiten Standard aus:

- `docs/concept/curriculum-graph/source-and-resource-links.md`

## Kanonisches Modell

Auf Goal-Ebene bleiben genau zwei Felder zulaessig:

- `sourceRef`
  - Provenienz: Woher kommt dieses Ziel?
- `resourceLinks`
  - hilfreiche Lernressourcen fuer Cockpit und GPT-Tutor

`physikbuch.schule` gehoert in `resourceLinks`, nicht in ein eigenes
Physik-Sonderfeld.

## Profil fuer Hessen Physik

### Root- und Cluster-Knoten

- Root oder grobe Cluster duerfen breite Uebersichtslinks tragen:
  - KC-Provenienz in `sourceRef`
  - allgemeine Buch-/Uebersichtslinks in `resourceLinks`

### Atomare Ziele

Wenn ein atomares Ziel eine gute, klar passende Buchstelle auf
`physikbuch.schule` hat, gilt als Zielprofil:

1. `sourceRef` auf die curriculare Provenienz
2. genau ein priorisierter `concept`-Link in `resourceLinks`
3. optional ein weiterer Link vom Typ `practice`, `assessment`,
   `reference` oder `solution`, falls fachlich wirklich passend

Keine Massenverlinkung:

- keine breiten Startseiten auf jedes Atomic kopieren
- keine langen Linklisten ohne klaren Mehrwert
- lieber wenige starke Deep Links als viele schwache

## Mindestregel fuer bestehende Physik-Links

Wenn ein Physik-Goal bereits lokale `resourceLinks` traegt, soll es auch ein
`sourceRef` tragen.

Damit bleiben Provenienz und Lernressource sauber getrennt:

- `sourceRef` beantwortet: warum existiert dieses Ziel?
- `resourceLinks` beantworten: was hilft beim Lernen?

## GPT-/Cockpit-Relevanz

Das gleiche Modell wird fuer beide Laufzeitkonsumenten genutzt:

- Cockpit zeigt `resourceLinks` als hilfreiche Quellen
- GPT-Tutor sieht dieselben `resourceLinks` maschinenlesbar und kann sie im
  Gespraech anbieten

Deshalb sollen nur tutor-relevante Links in `resourceLinks` landen.

## Rollout-Reihenfolge

1. Bereits vorhandene `physikbuch.schule`-Links auf `sourceRef + resourceLinks`
   normieren.
2. Danach atomare E-/Q1-/Q2-Ziele mit starken, stabilen Deep Links erweitern.
3. Q3/Q4 gezielt nachziehen, wenn die Buchquelle dort fachlich wirklich hilft.

## Abgrenzung zu MIT OCW

MIT OCW nutzt denselben Schema-Kern, aber ein strengeres Coverage-Profil:

- typischerweise `concept` + `practice` + `assessment` pro Atomic

Hessen Physik nutzt **kein anderes Verfahren**, sondern denselben Standard mit
einem schlankeren Lehrbuch-Profil.
