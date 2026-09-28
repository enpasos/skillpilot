# Mathematik M7: drei kleine D-Text-Deltas – Machbarkeit, noch keine Freigabe

Stand: 27. September 2026. Dies ist eine **read-only fachliche und technische
Prüfung**; die drei kanonischen Ziele, ihre Quellenzuordnungen, QA-Ledger und
Review-Resolutionen wurden hierfür nicht geändert. Ausgangspunkt ist die
aktuelle 19er-Gegenprüfung
`m7-vready-remainder19-recheck-20260927-v1` mit D-Entscheidungen
`revise/keep`, `keep/revise` bzw. `keep/revise`. Die beiden Runden sind
KI-Kandidaten, keine menschliche Freigabe.

## Entscheidung

`09f47964…` und `0e8417d7…` können als **ein kleiner, vollständiger
Textänderungs-Batch** angefasst werden. Es gibt keinen erkennbaren
Quellenblocker: Das [hessische KC Mathematik 2024, E.1, S. 31](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf)
führt Funktionsbegriff, Term, Tabelle und Graph zusammen; Q4.1, S. 51
fordert Integralberechnung bei entsprechenden Verknüpfungen und
Stammfunktionsnachweis durch Ableiten. Die unten vorgeschlagenen Präzisierungen
schränken mathematisch falsche Allgemeinlesarten ein, ohne einen neuen
Lehrplaninhalt hinzuzufügen. **Nicht** als direktes JSON-Schnell-Edit mit
anschließender D-Gutschrift durchführen: neue kanonische Texte brauchen frische
gebundene D-Runden, P-v2-Rebinding und V-Abgleich.

`baf7276f…` vorerst **gesondert halten**. Die kleine sprachliche Korrektur
ist plausibel, aber das Ziel hat bereits ein nahezu gleiches kanonisches
GK/LK-Nachbarziel `3def350a…` und setzt direkt das ausschließlich LK-markierte
Ziel `36e0de23…` voraus, obwohl es selbst GK/LK ist. Diese Struktur- und
Lernwegfrage muss vor einem isolierten Text-Patch entschieden werden. Das
[hessische KC Q2.3, S. 42–43](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf)
ordnet Gerade–Ebene-Lage und Durchstoßpunkte dem grundlegenden Niveau,
Normalenform der Ebene dem erhöhten Niveau zu. Das ist ein **Hinweis auf
einen Modellierungsfehler**, kein Nachweis eines konkreten Laufzeitfehlers.

## Eng begrenzte DE/EN-Textentwürfe

Die Titel und stabilen IDs können bei den ersten zwei Zielen unverändert
bleiben. Die Entwürfe sind zur frischen Gegenprüfung, nicht zur unmittelbaren
Übernahme als geprüfter D-Status bestimmt.

1. `09f47964-2cd0-410e-93ee-9632b582fc91` – Funktionsbegriff und
   Darstellungen. Aktuell kann „zwischen Wertetabelle, Term und Graph wechseln“
   als eindeutige Termrekonstruktion aus endlich vielen Tabellenwerten gelesen
   werden; diese Folgerung ist falsch. Die bestehende P-v2-Evidenz nutzt eine
   **gegebene** lineare Funktion beziehungsweise ein bestimmtes Geradenstück
   und bleibt inhaltlich passend.

   - DE: „Die lernende Person kann eine reellwertige Funktion als Zuordnung
     erklären, die jedem zulässigen Eingabewert genau einen Funktionswert
     zuweist, und Term, Wertetabelle und Graph einer gegebenen Funktion als
     zusammengehörige Darstellungen verwenden.“
   - EN: “The learner can explain a real-valued function as assigning exactly
     one function value to each permitted input and use the expression, value
     table, and graph of a given function as corresponding representations.”
   - Nicht behaupten, dass eine endliche Tabelle allein den Term eindeutig
     bestimmt. Die Quellenzuordnungen, darunter HE E.1 und mehrere
     Sek-I-Teilzuordnungen, sind nach Änderung **nicht** automatisch erneut
     begutachtet, aber der Entwurf dehnt ihren fachlichen Anspruch nicht aus.

2. `0e8417d7-effb-5314-93ba-a571b01726ce` – Integrale verknüpfter
   Funktionen. Die aktuelle unbeschränkte Aussage kann auch `e^(x²)`
   einschließen, dessen Stammfunktion nicht mit den hier vorausgesetzten
   elementaren Regeln dargestellt werden kann. Q4.1 verlangt Berechnung und
   Ableitungsprobe, jedoch keine pauschale Integrationsmethode für *jede*
   denkbare Verkettung. Das bestehende P-v2-Profil prüft `x e^x` und
   `(2x+1)e^(x²+x)`: beide bleiben unter der Einschränkung geeignet.

   - DE: „Die lernende Person kann Integrale **geeigneter** Verknüpfungen von
     Exponential- und ganzrationalen Funktionen berechnen und die verwendeten
     Stammfunktionen durch Ableiten nachweisen.“
   - EN: “The learner can compute integrals of **suitable** combinations of
     exponential and polynomial functions and verify the antiderivatives used
     by differentiating them.”
   - „Geeignet“ darf bei der neuen D/P-Prüfung kein Freibrief für ausweichende
     Evidenz sein: mindestens zwei unabhängige, konkret lösbare Strukturen
     einschließlich Ableitungsprobe müssen geprüft werden. Die bisherige
     P-v2-Evidenz leistet das inhaltlich, ihre alten Hash-Bindungen nicht.

3. `baf7276f-60a0-4d96-b959-d63acfb929de` – **nur Entwurf für später**.
   Eine Gerade kann eine Ebene einmal, gar nicht oder in unendlich vielen
   Punkten treffen; ein Schnittpunkt darf nicht stillschweigend vorausgesetzt
   werden. Das P-v2-Profil deckt derzeit eindeutigen Schnitt und parallel
   getrennten Fall ab, aber nicht die in der Ebene liegende Gerade.

   - DE, falls nach Strukturklärung weiterhin ein eigenes Ziel nötig ist:
     „Die lernende Person kann bei eindeutigem Schnitt einer Geraden mit
     einer Ebene den Schnittpunkt aus ihren Gleichungen berechnen und
     geometrisch deuten.“
   - EN: “When a line and a plane meet at exactly one point, the learner can
     calculate that intersection from their equations and interpret it
     geometrically.”
   - Diese bewusst **bedingte** Variante fordert keine neue vollständige
     Klassifikation aller drei Lagefälle; die stärkere Gegenrunden-Variante
     „prüfen, ob ein eindeutiger Schnittpunkt existiert“ täte das und würde
     ein drittes P-Transferbeispiel erfordern. Zuerst Duplikat-/`requires`-
     Entscheidung für GK/LK und die Source-Mapping-Abdeckung treffen.

## Warum ein direktes Edit jetzt keinen D-Quickwin ergibt

- Die alte 19er-PDF, die beiden Review-Runden und ihre `goalFingerprint`/
  `pageFingerprint` gehören zum **alten** Text. Sie bleiben als Historie
  unverändert. Ihre `revise`-Vorschläge sind keine D-Resolution für einen
  anderen Text. Der generische
  `app/scripts/materializeGoalDescriptionRolloutResolutions.ts` verlangt
  gegenwärtig sogar ausdrücklich `strict current-context keep/keep`.
- `app/scripts/reportDeepUnderstandingRollout.ts` bindet die P-v2-Records an
  den DE/EN-Zieltext. Ein Textwechsel macht für die betroffenen Ziele die
  aktuellen P-`goalFingerprint`s stale; unveränderte Aufgabenfälle dürfen
  nur nach einer neuen, aktuellen inhaltlichen Prüfung übernommen werden.
- Derselbe Report verlangt in der V-QA `record.description` gleich dem
  kanonischen Text. `quality:goal-visualization-qa` übernimmt bei
  unverändertem Bild-Hash zwar bestehende Asset-Entscheidungen und aktualisiert
  die Beschreibung, ersetzt aber **keine** fachliche Bild-/Textkontrolle.
  Ressource-`altText` und Prompt-/Provenienzbezug sind ebenfalls auf die neue
  Formulierung zu prüfen. Die drei vorhandenen Bilder zeigen je einen
  passenden Positivfall; es ist derzeit **kein** neues Bild für diese drei
  Textpräzisierungen beauftragt oder erzeugt.
- GoalBook-Seiten-Fingerprints, das gesamte aktuelle Book-Digest und
  Publikationsartefakte ändern sich bei kanonischem Textwechsel. Bestehende
  hashgebundene Bücher/Review-PDFs nicht überschreiben; neue Version und
  exakte Quellbindung vorbereiten. Andere offene Pakete nicht durch
  pauschales Rebinding als geprüft erklären.

## Minimaler sicherer Ablauf für `09f` + `0e84`

1. Die beiden DE/EN-Texte als eine kleine kanonische Delta-Änderung samt
   zielgenauem Änderungsprotokoll einbringen; IDs, `requires`, Tags,
   Source-Mappings und Asset-Bytes zunächst unverändert lassen.
2. Neues **Zwei-Ziel-**GoalBook-Review-Bundle aus dem geänderten
   kanonischen Stand erzeugen, mit eigener config/Manifest/PDF. Zwei
   voneinander unabhängige aktuelle D-Runden plus dokumentierte Synthese;
   nicht die 19er-Runden auf neue Fingerprints umetikettieren. Nur bei
   tragfähigem Ergebnis eine neue, nicht überlappende Resolution registrieren.
3. Für genau diese zwei IDs P-v2-Kandidaten aus den vorhandenen fachlich
   geprüften Aufgabenfällen neu an den **aktuellen** DE/EN-Text binden,
   ggf. die `0e84`-Grenze explizit in die Profile aufnehmen, targeted prüfen
   und den alten P-Owner ohne Überschneidung ersetzen. Status bleibt
   `needs_human_review / ai_candidate`, sofern keine echte menschliche
   Begutachtung erfolgt.
4. Die unveränderten Bilder gegen den **neuen** Text ansehen. Falls sie den
   kleineren Anspruch weiterhin zutreffend illustrieren: QA-Ledger
   regenerieren, `altText` zielgenau aktualisieren, Hash/Approval erhalten
   und V-Checks ausführen. Falls ein Bild nicht mehr trägt: V-HOLD, kein
   künstliches OK und User-Bildprompt nachreichen.
5. GoalBook/Publications und Status aus dem neuen Stand bauen und nur
   targeted Checks ausführen: die neue D-Paketprüfung,
   `quality:positive-goal-evidence:check` für die zwei neuen Owner,
   `check:goal-visualization-qa`,
   `quality:deep-understanding-rollout:check`, GoalBook-Modelltest und
   `git diff --check`. Vor/nachher D/P/V und strenge Schnittmenge festhalten.

Bis dieser Ablauf vollständig grün ist: **keine** D-, P- oder V-Zählung aus
den alten Runden auf den neuen Text übertragen. `baf7276f…` bleibt aus
diesem Zweier-Batch ausgeschlossen.
