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
3. Ein aktiver Claim umfasst nur im aktuellen zentralen Report noch offene
   `curricularAtomic`-Ziele. Wird ein Teil eines Batches vollständig bewertet
   oder fällt aus diesem aktuellen Nenner, bleibt die historische Konfiguration
   unverändert; eine versionierte Restkonfiguration hält nur die weiterhin
   offenen Ziele aktiv. Die Entfernung aus dem Ledger ist keine nachträgliche
   fachliche Freigabe der historischen Ziele.

Der Loader validiert Ledger und referenzierte Batch-Konfigurationen
fail-closed. Zwei aktive Konfigurationen dürfen innerhalb derselben
Fach-/Basisbuch-Bindung kein Lernziel doppelt beanspruchen. Fehlende,
ungültige oder kollidierende Claims verhindern eine neue Auswahl.
