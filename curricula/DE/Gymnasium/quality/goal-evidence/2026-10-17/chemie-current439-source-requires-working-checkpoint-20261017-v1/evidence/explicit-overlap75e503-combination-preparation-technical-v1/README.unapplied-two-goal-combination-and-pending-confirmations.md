#75e/503d: explizite Whole-Object-Kombinationsvorlage

**Vorbereitet, nicht angewendet. Kein neues Fach-/Quellenvotum.**

| Ziel | Kombinierte Annotationen | Explizite Jurisdiktions-Overrides |
|---|---|---|
|75e2eff1|ganze HE-Annotation aus01/02 + ganze NW-Annotation aus06/07|nur DE-HE; NW bleibt der erklärte Ableitungsweg aus503d.requires|
|503dedcb|ganze HE-Annotation aus01/02 + ganze NW-Annotation aus06/07|DE-HE und DE-NW|

Beide ursprünglichen before-Objekte stimmen miteinander, mit der C20-Basis und mit der tatsächlichen aktuellen C650-Basis überein. Alle ursprünglichen before-/after-Digests wurden nach der ausdrücklich angegebenen Whole-Object-Regel neu berechnet und stimmen. Die alten CAS-Digests mit beziehungsweise ohne sha256:-Präfix bleiben original erhalten.

Die vorgeschlagenen zwei ganzen after-Objekte ändern ausschließlich extendedData.applicabilityOverrides und extendedData.skillPilotAcquisitionExtensions. Beide Annotationen bleiben je Objekt wort- und feldgleich erhalten; Projektion des Kombinationsobjekts auf jeweils einen Quellstand reproduziert dessen ganzes after exakt. Fachtexte, requires, Raw-applicability, Provenienz, boundary-Felder und die ganzen aktuellen P-Profile stimmen mit den Originalen überein. Es wird keine neue Kurs-/Stufen-/Source- oder Masterybehauptung ergänzt.

## Guards

- Tatsächliche aktuelle C650: `4eca52fe0e2fa45f2c4aa0780a38c3f78b1f0da6d6cff7eb379815c170104837`
- Original C20: `48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd`
-01/02 Whole-CAS: `9b19fdacdb549b2598d48424560dad763d4ab1b2f5989b30229bc7a5409abd4a`
-06/07 Whole-CAS: `8a0ad4cf2c0e092ee2e9aaefe022ebe80890b52be864635b01c8308f89024403`

-75e2eff1 current-before: `a87b1ddef60c9079a1894a59ca34c7b8f5cf6ea59bab51e2154df71cba43e3a7`; combined-after: `4702b806ac6bde198981aa60980a47e5f5c8575f0e5fdf2f8758a077ce9f7f28`
-503dedcb current-before: `4ba1b26f1b7e86bfda13e6c242118c4cc892b9b1912ceae4cb567a357474763a`; combined-after: `49d25aaceb280f3ad0898e4bcf16c211a684f9b150675083ced19fe132ad0dda`

## Offen vor jeder Integration

Root06/07 und fremder A06/07 sind für diese Vorlage als ausstehend geführt. Der vorhandene Root01/02-KEEP wird nur als gepinnte Herkunft geführt und ersetzt keine der06/07-Prüfungen. Danach kann eine ausdrückliche metadata-only Autorenbestätigung erfolgen. Diese Vorbereitung bestätigt sie noch nicht.

Der Integrator muss die volle aktuelle C650-Datei, beide aktuellen WholeGoal-before-Objekte, beide ursprünglichen Quell-after-Objekte und die freigegebene kombinierte Vorlage unter exakten Guards prüfen. Nicht erst einen fremden Whole-after schreiben und ihn danach durch den anderen überschreiben. Ändert sich die Baseline, schlägt der volle Datei-Guard geschlossen fehl und verlangt eine ausdrückliche neue Basisbindung.

Die vier HE-Viewänderungen aus01/02 und alle übrigen Goals aus den Paketen sind nicht Teil dieser Zwei-Objekt-Vorlage. Es wurde kein650er-Nachfolger erzeugt, kein APV-/Compiler-/Build-/Native-/Central-/M-Lauf gestartet und keine Main-/Normal-/L6-/L7-/alte Capsule geschrieben. Tatsächliche spätere NW-Eligibility von75e und alle Fingerprintbindungen bleiben offen.
