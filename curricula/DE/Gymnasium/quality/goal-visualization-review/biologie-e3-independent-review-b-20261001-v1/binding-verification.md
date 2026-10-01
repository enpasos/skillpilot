# E.3-Bildbindung nach Integration

Stand 2026-10-01. Ergänzung zur unabhängigen tatsächlichen Sichtprüfung in `review.md`; keine neue Bilderzeugung.

Für jedes der drei Ziele wurde genau ein kanonischer primärer `goal-visualization`-Link gelesen. Die dortige URL verwendet die jeweilige aktuelle Ziel-ID und führt zu einem PNG. Kandidat, `app/public` und `backend/src/main/resources/static` existieren und haben jeweils **identische Bytes**:

| Ziel | SHA-256 in allen drei Pfaden | Gebundener Alttext |
| --- | --- | --- |
| `2517be3f` | `8e5b7bef04f6c9a7870f95a5cf60bd16049042d5c92c75f81c390d5e964cd620` | Benennt die zwei Vorkerne, vier frühe Zellen, Blastocyste und ausgelassene Zwischenstadien. |
| `37147890` | `467bb2397a4efffa2cfbf015db54f6168f30fd6e750955cabfc32deb2c68e802` | Kennzeichnet das Karyogramm als **schematisch verkürzt** und begrenzt Aussagen über körperliche Befunde und Identität. |
| `c5435624` | `14c1c1be8d5dbe49bf892c0e3c8c1f1ee6a40f03b170ec5272f13d0776dc05a8` | Übernimmt die unabhängige Korrektur: gepunkteter Pfeil als Vermutung, Symbolkarten ohne Messwerte oder individuelle Schädigungsprognose. |

Die kanonischen Links tragen `provider: ChatGPT/Codex image_gen`, `lang: de`, `license: CC-BY-4.0` und `reviewStatus: pilot`. Die Byte- und Textprüfung bestätigt genau die unabhängig geprüften Kandidaten und Alttexte. Sie ersetzt nicht den maschinellen Visualisierungschecker und dessen aktuelle Ledger-Bindung; dessen separaten Lauf muss die Integrationsrunde ausweisen.
