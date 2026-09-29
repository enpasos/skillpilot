# Mathematik-Semantic-Kind: gezielte Bindung 2026-09-29

Maschinelle, fachlich geprüfte Klassifikation auf dem aktuellen Canon; keine menschliche Freigabe.

- Neue curricularAtomic-Ziele: `f257b71b-0250-5b4b-86bb-f317f79c355a` (SL Sek II LK: Schwerpunktformel aus Seitenhalbierenden herleiten) und `baea3966-5d10-53bf-8193-3fcda7b1e73f` (SL J10: Kugelvolumen mit Cavalieri herleiten). Beide sind Blätter mit eigener überprüfbarer Leistung, nicht Struktur- oder Prüfungsnodes.
- Neuer practiceAssessment-Node: `990739f7-f17d-5199-bdec-0512eb846f14` (SL LK, Q2-Übungsaufgabe zur Schwerpunkt-Herleitung), mit `examData.reviewStatus=needs_review` und genau dem neuen Atom als `requires` und `coveredGoalIds`.
- Inhaltlich unveränderte Klassen, neu gebundene Struktur: `6b3e75b2` (Vektor-Cluster), `14b19ee4` (Q2-Übungsfolder), `1ea06c0c` (Kugel-Cluster) wegen neuer `contains`-Kinder und neu berechneter Gewichte. `803d910d` (HE LK Ursprungsebenen-Projektion) und `d3c42193` (HE LK Fixpunkte) bleiben jeweils curricularAtomic nach präzisiertem Sek-II-LK-Scope und Voraussetzungen.
- `b025df0c` (räumliche Geradenlagen) und `ba343971` (geradlinige Vektormodelle) bleiben curricularAtomic nach der unabhängig geprüften BW-Sek-I-Eingrenzung; die geänderten Zieltexte und Voraussetzungen wurden gezielt neu gebunden.
- Der J10-Prüfungsfolder `cb20dd6b` und die auf BW/Sek I eingegrenzte Aufgabe `ea664a30` bleiben practiceAssessment. Der neue enge SL-J10-Terminalnode `79f5f4cc` ist ebenfalls practiceAssessment, `needs_review` und bindet ausschließlich das Cavalieri-Atom `baea3966` als Voraussetzung und Prüfungsdeckung.
- Der Semantic-Kind-Fingerprint umfasst fachliche Ziel- und Strukturfelder einschließlich `examData`, aber keine `resourceLinks`. Ein späterer PNG-Import für `f257b71b` ändert daher diese Klassifikation nicht.

Nach gezieltem Audit: 1.236 Canon-Ziele = 1.236 Ledger-Entscheidungen, davon 805 curricularAtomic und 165 practiceAssessment; kein fehlender oder veralteter Semantic-Kind-Fingerprint. Die Erhöhung des Mathematik-M7-Nenners um zwei ist eine Zielneuanlage, noch kein strenger Abschluss.
