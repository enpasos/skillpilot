# Persistente Claims für laufende Beschreibungsreviews

[`in-flight-work-ledger.json`](in-flight-work-ledger.json) ist die verbindliche
Liste der aktiven Ziel-Claims aus noch nicht abgeschlossenen Mathematik- und
Physik-Batches. Der
deterministische `select`-Modus lädt diese Datei standardmäßig und schließt alle
dort gebundenen Lernziel-IDs automatisch aus. Ein vergessenes
`--exclude-config` kann ein bereits beanspruchtes Lernziel deshalb nicht erneut
auswählen.

Arbeitsregel:

1. Vor Beginn einer Reviewrunde wird ihre vorbereitete Batch-Konfiguration als
   aktiver Pfad eingetragen.
2. Der Selektor bleibt read-only. Zusätzliche kurzlebige Ausschlüsse dürfen
   weiterhin mit `--exclude-config` angegeben werden.
3. Ein Claim wird erst entfernt, nachdem alle von ihm beanspruchten Ziel-IDs
   über aktuelle Resolution-Indizes und Evidence-Profile zentral registriert
   sind und der strenge zentrale Report sie als vollständig bewertet.

Der Loader validiert Ledger und referenzierte Batch-Konfigurationen
fail-closed. Zwei aktive Konfigurationen dürfen innerhalb derselben
Fach-/Basisbuch-Bindung kein Lernziel doppelt beanspruchen. Fehlende,
ungültige oder kollidierende Claims verhindern eine neue Auswahl.
