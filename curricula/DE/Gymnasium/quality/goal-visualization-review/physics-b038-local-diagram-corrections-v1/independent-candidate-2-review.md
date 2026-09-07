# Physik B038: unabhängige Sichtprüfung der zweiten Bildkandidaten

Datum: 06.09.2026. Prüfer: Codex-Unteragent `physics_b038_image_audit`.
Alle drei hier bezeichneten archivierten JPGs wurden tatsächlich vollständig
angesehen. Ausschließlich AI-Sichtprüfung; keine menschliche Freigabe und kein
Import durch diese Archivierungs-/Prüfarbeit. Exakte Provideraufträge,
Referenzbytes, Ausgaben und Rekonstruktionsdateien liegen in `candidate-2/`;
deren `archive-receipt.json` bindet alle Bytes an den archivierten Vorgänger.

- **c0205f47-185c-5e27-b89c-c3ff8809b1d1 — REJECT.**
  SHA-256 `22b6eac70805c979fb81f8e12b092319884b3c2c7b279e653fa912abe6a1abaa`.
  Die Kurven beginnen weiterhin auf verschiedenen Niveaus und kreuzen sich.
  Der Generator ergänzte stattdessen rohe numerische Kontrolltripel, obwohl
  diese ausdrücklich nur als Konstruktionshilfe vorgesehen waren. Die
  Kurvengeometrie erfüllt die Vergleichsbedingungen daher nach wie vor nicht.

  **Zusätzlicher Autorenfehler im Auftrag, keine belastbare Zahlenreferenz:**
  Der archivierte Prompt nennt bei r=0,9 für die blaue Kurve 4,188. Für seine
  eigene Formel `A=1/sqrt((1-r²)²+(2ζr)²)` mit ζ=0,1 ist richtig
  `A(0,9)=1/sqrt(0,19²+0,18²)=3,8208035995…`, gerundet 3,821.
  Die Ausgabe übernimmt die falsche Zahl. Der fehlerhafte Auftrag bleibt als
  unveränderte historische Spur erhalten, wird aber nicht als fachliche
  Evidenz oder kanonischer Anspruch übernommen. Ein weiterer Versuch muss
  diese Eingabe korrigieren oder auf nicht benötigte Zahlentabellen verzichten.
- **a7255b83-336c-4d42-ba5c-bc2f6248ea36 — REJECT.**
  SHA-256 `61527211ae4e0ed787ce49a3564db334edbd20c87f9357445ef19d286972d914`.
  Die Gesamtenergielinie ist nun weiß gestrichelt und φ=0 steht unter dem
  Diagramm. Die blaue elektrische Kurve startet trotzdem weiterhin bei null,
  die grüne magnetische maximal; die verlangte Kurven-/Farbenzuordnung wurde
  erneut nicht umgesetzt. Möglich bleibt eine eng begrenzte Umfärbung der
  beiden Formelbeschriftungen statt erneuten Umzeichnens der Kurven.
- **a844895e-2cdc-4665-aad2-a49c62f11759 — ACCEPT AI.**
  SHA-256 `4b1d8b2c705ee46671a6e3a2c4633bbbcb2cc312f8ec625eae1f93e90e15323d`.
  Die positive x-Richtung ist nach links markiert. Entsprechend lautet die
  nach rechts gerichtete Geschwindigkeit bei t=T/4 jetzt −v_max, die nach
  links gerichtete bei t=3T/4 +v_max. q ist ausdrücklich die Ladung der oberen
  Platte, positive Stromrichtung durch L ist nach oben; die gezeichneten
  Stromrichtungen und Ladungsvorzeichen sind dazu konsistent. Zeitnotation und
  Polarität stimmen. Die in Kandidat 1 neu entstandenen Formelregressionen
  sind behoben: Federenergie D x_max²/2, elektrische Energie q_max²/(2C).
  Die weiteren Energieformeln und die Analogien x↔q, v↔I, m↔L, D↔1/C bleiben
  fachlich richtig. Der dokumentierte örtliche Reparaturbedarf ist behoben;
  das vertraute Layout bleibt erhalten.
