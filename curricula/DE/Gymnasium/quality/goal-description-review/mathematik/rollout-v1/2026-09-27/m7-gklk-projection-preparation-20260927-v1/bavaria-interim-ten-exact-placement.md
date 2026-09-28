# Bayern: exakt belegte Pflichtziele in GK-Views ergänzt

Stand 27. September 2026. Die technische Zwischenregel bleibt BY-`GK` =
vierstündiges Pflichtfach; BY-`LK` = derselbe Zielumfang plus alle fünf
Vertiefungskursmodule. Diese Änderung betrifft **nur die Placement-Daten**
der beiden bayerischen GK-Composition-Views; sie aktiviert nicht den
bundesweiten `atlasCourseProfilePolicy`-Kandidaten und ist keine D- oder
M7-Freigabe.

Zehn `curricularAtomic`-Ziele mit mindestens einer `exact`-Zuordnung aus
`JGST12_EA` oder `JGST13_EA_TEIL1/2` wurden in
`de-by-sekii-gk.view.json` und `de-by-gk.view.json` je genau einmal als
`goalEntry` ergänzt. Die Q1-Gruppe enthält `ece68088`, `e9114fc2`,
`5042fd2b`, `24f21c0c`; Q2 enthält `fa02cf14`; Q3 enthält `677be619`,
`f7879354`, `78bfbde4`, `bd63c0fc`, `0a7ff229`. Die Reihenfolge folgt
jeweils der vorhandenen bayerischen LK-View. Zieltexte, IDs, Karten und
Bilder wurden nicht verändert.

Der [quellengebundene Audit](../../../../../../../../../app/scripts/auditMathBavariaInterimCourseProjection.ts)
verglich Source-Extraction, Mapping, Semantic-Kind-Ledger und beide
Atlasmodelle. Sein neuer Bindungsdigest ist
`sha256:1cd904af869756cd5e8a85bd0a76ac0c7d4c8871817215a66ba67a14f965c305`.
Bei unverändert **44** Atlas-Atomen mit Pflichtfach-Mapping stieg die
BY-GK-Sichtbarkeit im aktuellen Atlas von **9 auf 19**, im vorbereiteten
globalen Kursmarker-Atlas von **8 auf 18**. Unter den **14** exakt
gemappten Pflichtzielen bleiben in letzterem **zwei** BY-GK-Lücken:
`49f9059a` und `b431148b` tragen global nur den LK-Kursmarker und
brauchen eine bayernspezifische Zuordnung, ohne andere Länder umzudeuten.

Ein elftes, ebenfalls `exact`-belegtes Pflichtziel,
`b431148b-526c-4bde-b04b-48d23101d0d3` (Normalverteilung), ist
anschließend in beiden BY-GK-Views unter Q3 ergänzt worden. Damit zeigt der
**aktuelle** Atlas bei den 44 quellengemappten Pflichtatomen **20** in
BY-GK und BY-LK, **20** nur in BY-LK und **vier** in keinem der beiden
Profile. Im vorgeschlagenen globalen Kursmarker-Atlas bleiben es **18** in
beiden, **22** nur in BY-LK und **vier** in keinem: Der globale LK-Tag
filtert `b431148b` ebenso wie `49f9059a` aus BY-GK. Das belegt, dass eine
direkte Placement allein nicht genügt; eine explizit quellengebundene,
landesspezifische Kursgeltung ist erforderlich. Beide Kanon-Titel enden
außerdem noch auf „(LK)“. Eine Umbenennung erfordert gezielte neue
Text-/Evidenz-/Atomaritätsbindungen und wird nicht als triviale
Kosmetikkorrektur behandelt.

Die weiteren **30** Pflichtquellen-zugeordneten Seiten haben nur
`partial`-Mappings. Ihre fachliche Geltung wird einzeln geprüft, nicht
pauschal auf GK gesetzt; vier sind derzeit auch in BY-LK nicht sichtbar.
Alle **35** atomaren Vertiefungsseiten bleiben inzwischen auch im **aktuellen**
Atlas ausschließlich in BY-LK: In beiden BY-GK-Views wurden die drei
Vertiefungskurs-Subtrees `46a5ede1`, `13c9dd61`, `20cca111` und der
Einzeleintrag `b66d13c5` entfernt. Zusammen enthalten sie exakt elf
atomare Ziele, die im BY-Mapping ausschließlich `JGST12_VERTIEFUNG`/
`M12-V.2` zugeordnet sind; das Pflichtziel `49f9059a` im selben Q4-Ordner
bleibt erhalten. Die anderen 24 Vertiefungsziele waren bereits BY-LK-only.
Die übrigen 99-seitigen länderübergreifenden Änderungen des globalen
Schalters werden nicht aktiviert. Sie sind für die bayerische Zwischenregel
nicht erforderlich; eine spätere Aktivierung wäre ein eigener,
länderübergreifend geprüfter Schritt mit aktueller D-Bindung.

Gezielte Prüfung: 297 Composition-Views valide; elf Pflicht-Einträge in
jeder der beiden BY-GK-Views jeweils genau einmal; BY-Interims-Audit-Digest
nach Entfernung der Vertiefungskurs-Knoten:
`sha256:b6bbe8a938b4e2511d5c8ed0c43fd36ccd4384e3e750a0c86610d52058d65d14`.
Nach dem elften Placement entfernt der vorbereitete globale Kandidat
**1.447** Sek-II-GK-Scopes auf weiterhin **99** Seiten und berührt
**98** registrierte D-Claims; der vollständig validierte, aber nicht
registrierte Scope-Kompatibilitätsnachweis bleibt bei **82/98**.
Die öffentlichen Lernzielbücher und der zentrale Fünf-Gate-Bericht sind
hierdurch noch nicht neu erzeugt oder freigegeben.
