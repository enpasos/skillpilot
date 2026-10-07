<!-- SPDX-License-Identifier: Apache-2.0 -->
# Native Chemie-Batchbytes: enge technische Fortsetzung v3

Der generische Autorenschreiber von v2 serialisierte zwei native `Buffer` als JSON-Hüllen. v2 ist unverändert erhalten. Hier wurden ausschließlich diese zwei Batchdateien durch die tatsächlichen Bytes des unveränderten nativen Serializers ersetzt. Der neue Schreiber behandelt `Buffer` als rohe Bytes, Strings als Text und Objekte als JSON. Fachliche Ziele, Profile, Materialien, Seiten, Originalbilder, Kampagnen-IDs und deklarierte Fingerprints sind unverändert.

`independent-neutral-review-entry.json` verweist auf die exakt versiegelten fachlichen Eingänge von v2 und die korrigierten lokalen leeren nativen Runden A/B. Jede reale Batchdatei enthält vier einzeln parsebare JSONL-Zielzeilen. Beide tatsächlichen SHA-256 entsprechen ihren bereits deklarierten `batchInputFingerprint`; das persistierte Record-Schema passt bytegenau zum nativen Schema und dessen SHA. Zwei native Kampagnenprüfungen haben keine Fehler. Es wurden keine Review-Records, Run-Manifeste oder fachlichen Freigaben erzeugt.

`persisted-native-batchbytes.actual.validation.json` dokumentiert die tatsächlichen Prüfungen und die unveränderte v2-Bindung. Strenger Fortschritt und fachlicher Zuwachs bleiben 0. Historische Artefakte und aktive Dateien sind unverändert.
