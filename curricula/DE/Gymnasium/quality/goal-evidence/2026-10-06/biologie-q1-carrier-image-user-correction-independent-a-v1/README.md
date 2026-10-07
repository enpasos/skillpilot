# Unabhängige A-Prüfung: gezielte Carrier-Bildkorrektur

Scope: ausschließlich `ac9e824f-003c-50ac-8751-2b8456004c63`, die tatsächlich
korrigierten PNG-Bytes sowie die dadurch betroffene Bildbindung des vorhandenen
positiven Verstehensprofils. Reviewer A hat weder die alte noch die korrigierte
Grafik erzeugt. Keine neue Peer-Bildprüfung wurde gelesen.

## Tatsächlicher Bildbefund

Das alte goldene Genstück verändert die Geometrie der DNA-Rückgrate: Die
gewundene Kreuzungsfolge geht im markierten Bereich in einen abgeflachten,
anders verlaufenden Abschnitt über. Der Nutzerbefund ist bestätigt; die alte
Bildentscheidung wird für diesen Defekt nicht weiterverwendet.

Die Korrektur wurde im Original mit **1672 × 941 Pixeln**, bei **360 × 203**
und **680 × 383** angesehen. Die beiden violett/blauen Rückgrate bleiben auf
beiden Seiten des markierten Abschnitts kontinuierlich und behalten dieselbe
Kreuzungsfolge. Die im Vordergrund verlaufende Diagonale fällt an den sichtbaren
Kreuzungen nach rechts; diese wiederholte Überlagerung passt zu einer
rechtsgängigen schematischen Helix. Im Genstück entsteht keine lokale Umkehr.
Die Zeichnung liefert kein atomistisches Stereochemie- oder Maßstabsmodell.

Der helle goldene Halo liegt hinter derselben DNA; Klammer und Pfeil markieren
einen Abschnitt dieser DNA. Kein separates Genmolekül oder anderes DNA-Material
wird ergänzt. Chromosom, DNA und Gen sowie ihre Pfeile bleiben auf Handy und PC
lesbar. Die schematische Verpackung und die Genlänge bleiben ausdrücklich
vereinfacht. **KEEP der konkret korrigierten PNG-Bytes**, keine Generatorfreigabe.

Die Strukturprüfung verwendet die institutionellen Definitionen von
[NHGRI](https://www.genome.gov/genetics-glossary/Double-Helix) und dem
[NHS Genomics Education Programme](https://www.genomicseducation.hee.nhs.uk/glossary/double-helix/).
Die Aussage zur gezeichneten Überlagerungsfolge ist die eigene Sichtprüfung;
die Quellen zertifizieren dieses Bild nicht.

## Native V- und P-Artefakte

`single-native-v-record.candidate.json` enthält den vorhandenen nativen
Ledger-Datensatz für genau das neue Asset. Die bestehenden Produktionsfunktionen
für die an exakte Bytes gebundene maschinelle V-Freigabe ergeben PASS.
`humanApproved` und `humanIssueIdentified` bleiben für den neuen Kandidaten `no`;
das neue Bild wurde vom Menschen noch nicht freigegeben.

Das eigene native P-JSONL und seine geschlossene native Config beziehen sich nur
auf dieses Ziel. Die drei Erwartungen und beide vollständigen Karten
`classical-carriers-a/b` sind gegenüber der eigenen gültigen früheren A-Prüfung
exakt. Ihre fachlichen Befunde werden weiterverwendet. Das neue Bild zeigt
dieselbe Material-/Abschnitts-/Trägerbeziehung korrekt und liefert keine
Lernendenleistung. Geschlossenes Schema und tatsächliche native P-Semantik
mit dem neuen PNG-Digest bestehen. Der vollständige bestehende P-Checker liest
noch das alte aktive Public-PNG und meldet genau die dadurch erwartete offene
`reviewInputFingerprint`-Bindung. Dieser Stand ist dokumentiert, nicht übergangen.

Native neue P-`reviewInputFingerprint`:
`sha256:1e9e67b528c8e30a811ed0ced22e606a0d01d2922cd768f1ad7291051532a404`.
Ziel- und Profilfingerprints bleiben unverändert. Status bleibt
`ai_candidate` / `needs_human_review`, E1/G1 und ohne behauptete Lernendendaten.

## Offene finale D-Seitenbindung

**Keine neue native D-Freigabe in diesem Paket.** Der tatsächliche finale
Ein-Ziel-Buch-/Revieweingang muss den neuen PNG-Digest und den endgültig
entschiedenen Quellen-/Projektionskontext enthalten. D-Seitenfingerprint,
Kontextfingerprint, Bundle und Run dürfen nicht allein durch Hashwechsel als
geprüft gelten. Die tatsächliche finale Seite ist anschließend in einer frischen
nativen Runde A zu lesen und mit dem vorhandenen Kampagnenvalidator zu prüfen;
eine zweite unabhängige Runde und die Integration bleiben separat.

Vorhandener minimaler Ablauf:

1. `loadGoalBookBuildInputs` auf dem finalen aktiven/isolierten Inputstand;
   `buildGoalDescriptionRolloutSubsetModel` für genau dieses eine Ziel.
2. `writeGoalBookHtml` / `writeGoalBookPdf` nur für das Ein-Ziel-Subset;
   tatsächliche Seite mit dem neuen PNG prüfen.
3. `buildGoalBookReviewBundle` und
   `createGoalDescriptionReviewCampaignArtifacts` für die unabhängigen Runden.
4. Native Ergebnisse mit
   `validateGoalDescriptionReviewCampaignResults.ts` validieren;
   zwei Runden fachlich auflösen und gezielt integrieren.
5. Nach tatsächlichem Import den Ein-Ziel-P-Checker mit der vorhandenen Config
   erneut ausführen. Andere sechs Profile und unveränderte Seiten bleiben erhalten.

Nur die historische Entfernung des inerten `extendedData.authorCandidate`-Markers
bei der bereits geprüften Integration weicht zusätzlich vom alten Autoreninput
ab. Es wird keine globale Gleichheit aller historischen 19 Eingänge behauptet.

Keine aktiven Änderungen, kein Commit/Push, kein vollständiger Build.
Strenger Nettozuwachs **0**; neue fachliche Abschlüsse **0**;
wiederhergestellte aktive Bindungen **0**. Human Approval und Human Trial bleiben
getrennt und offen.
