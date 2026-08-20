# Unabhängige mathematische QA – Markov-Q2-Masteraufgabe v2

- Status: `RELEASED_INDEPENDENT_REVIEW`
- Review-Datum: 2026-08-20
- Reviewinstanz: Codex-QA-Agent `math_review_audit` (nicht menschlich)
- Artefaktumsetzung: separater Codex-Implementierungsagent
- Prüfart: unabhängige fachmathematische, didaktische und metadatenbezogene QA

Dieses Review dokumentiert ausdrücklich **keine menschliche Freigabe**. Der Status besagt, dass die unten kryptografisch gebundenen v2-Artefakte eine unabhängige Codex-QA durchlaufen haben. Er darf nicht als `human_review`, menschliche QS oder Freigabe durch eine Lehrkraft ausgegeben werden.

Das bisherige Artefakt `markov-backward-pilot-v1.md` bleibt unverändert erhalten. Die v2-Artefakte sind eine append-only Nachfolgefassung; sie ändern die v1-Datei nicht rückwirkend.

## Gebundene Assessment-Profile

| Profil | Assessment-Ziel | Aufgaben | Maximalpunktzahl | Bestehensgrenze | Verdict |
|---|---|---:|---:|---:|---|
| GK | `57aff94e-91b8-5cc6-9f85-3f317ecf36ca` | 1–5 | 50 BE | 25 BE | `RELEASED_INDEPENDENT_REVIEW` |
| LK | `e4656e83-3f33-5bda-b0bc-d4b63ec4653e` | 1–6 | 60 BE | 30 BE | `RELEASED_INDEPENDENT_REVIEW` |

Der GK-Endpunkt bewertet ausschließlich die Aufgaben 1–5. Die drei nur durch Aufgabe 6 beobachteten LK-Ziele gehören nicht zur GK-Coverage. Der LK-Endpunkt umfasst dieselbe 50-BE-Basis und zusätzlich die 10-BE-Aufgabe 6.

## SHA-256-Bindung

Die Prüfaussage gilt exakt für die folgenden Dateibytes:

| Datei | SHA-256 |
|---|---|
| `gk_task_v2.md` | `a476c01ffe04d3cb295455b8173fde5ed7a5a0f3a43ad370177d9a9ffcc51d5a` |
| `gk_solution_v2.md` | `2959801ae4cd7604f35e95097183dcd0820afc60307b425546dfd9ccbedda3b3` |
| `lk_task_v2.md` | `a58b032452cf0c1acb25919fce7439da132326ce4de5176c0f8ff32548efea82` |
| `lk_solution_v2.md` | `38b0d992b10b4b6eb18b485dc27a5f1b110a066c80d6f374613defc697dd7fb7` |

Jede spätere Byteänderung an einer dieser vier Dateien hebt diese konkrete Review-Bindung auf und erfordert eine neue append-only Reviewfassung.

## Exaktes Coverage-Mapping

| Teilaufgabe | Profil | Beobachtete kanonische Ziel-IDs |
|---|---|---|
| 1a | GK, LK | `5e893892-393e-5df0-b705-fb3b3458122f` |
| 1b | GK, LK | `03685f87-7570-5bb3-b1c7-134124abb317`; `6aa593a3-6690-581d-9b7d-37cac78187a1` |
| 1c | GK, LK | `03685f87-7570-5bb3-b1c7-134124abb317`; `6aa593a3-6690-581d-9b7d-37cac78187a1`; `b5062446-332f-4a67-aaf7-3bfa3e5aded9` |
| 2a, 2b | GK, LK | `10a33d93-dc20-5edd-ae3b-32338d05407c` |
| 2c | GK, LK | `304111dd-426b-520b-a275-3fa37da1b0e0`; `b5062446-332f-4a67-aaf7-3bfa3e5aded9` |
| 3a | GK, LK | `6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8`; `b5062446-332f-4a67-aaf7-3bfa3e5aded9` |
| 3b | GK, LK | `4fb40e58-58c1-5964-b58e-3347a8022b97`; `6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8`; `6aa593a3-6690-581d-9b7d-37cac78187a1` |
| 3c | GK, LK | `f378917f-2ca7-4c68-bd66-3f9457095dd5`; `b5062446-332f-4a67-aaf7-3bfa3e5aded9` |
| 4a | GK, LK | `ce198bc9-b014-52ba-814f-25cc3e020668`; `304111dd-426b-520b-a275-3fa37da1b0e0` |
| 4b | GK, LK | `3d4d510c-0fd7-55ea-9b79-1db8d640758f` |
| 5 | GK, LK | `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` |
| 6 | nur LK | `4bc6cc77-3d20-5d27-a74a-8efb0a038d17`; `0de1e45c-aea9-5e53-932a-027dcf509efa`; `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` |

### GK-Coverage-Menge

1. `5e893892-393e-5df0-b705-fb3b3458122f`
2. `03685f87-7570-5bb3-b1c7-134124abb317`
3. `6aa593a3-6690-581d-9b7d-37cac78187a1`
4. `b5062446-332f-4a67-aaf7-3bfa3e5aded9`
5. `10a33d93-dc20-5edd-ae3b-32338d05407c`
6. `304111dd-426b-520b-a275-3fa37da1b0e0`
7. `6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8`
8. `4fb40e58-58c1-5964-b58e-3347a8022b97`
9. `f378917f-2ca7-4c68-bd66-3f9457095dd5`
10. `ce198bc9-b014-52ba-814f-25cc3e020668`
11. `3d4d510c-0fd7-55ea-9b79-1db8d640758f`
12. `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf`

### Zusätzliche LK-Coverage

1. `4bc6cc77-3d20-5d27-a74a-8efb0a038d17`
2. `0de1e45c-aea9-5e53-932a-027dcf509efa`
3. `922d89fc-1cbd-56e9-ac5d-5cb59085de6c`

Damit umfasst die LK-Coverage die zwölf GK-Ziele plus diese drei LK-Ziele, insgesamt 15 eindeutige kanonische Ziele.

## Fachmathematische Prüfung

Die unabhängige QA hat Aufgabenstellung, Musterlösung und Bewertungsraster gegeneinander geprüft. Insbesondere wurden folgende Ergebnisse nachgerechnet:

- $M=\begin{pmatrix}0{,}92&0{,}05\\0{,}08&0{,}95\end{pmatrix}$ ist in der angegebenen Spaltenvektorkonvention stochastisch.
- $\vec x_1=(9\,600,8\,400)^T$ und $\vec x_2=(9\,252,8\,748)^T$ sind korrekt; die Gesamtsumme bleibt $18\,000$.
- $M^2=\begin{pmatrix}0{,}8504&0{,}0935\\0{,}1496&0{,}9065\end{pmatrix}$ und die Deutung von $(M^2)_{21}$ sind korrekt.
- Für $N=\begin{pmatrix}0{,}88&0{,}10\\0{,}12&0{,}90\end{pmatrix}$ gelten $D=N-M=\begin{pmatrix}-0{,}04&0{,}05\\0{,}04&-0{,}05\end{pmatrix}$ und $P=\tfrac34M+\tfrac14N=\begin{pmatrix}0{,}91&0{,}0625\\0{,}09&0{,}9375\end{pmatrix}$.
- Die Tabellenformeln adressieren die im Aufgabentext festgelegten Zellbereiche korrekt; die Deutung von `F3` entspricht der Zeilen-/Spaltenkonvention.
- $\det(M)=0{,}87\ne0$ und $M^{-1}=\begin{pmatrix}95/87&-5/87\\-8/87&92/87\end{pmatrix}$ sind korrekt; die Multiplikationsprüfung ergibt $I_2$.
- Die Vorgänger $(12\,000,6\,000)^T$ und $(19\,000,-1\,000)^T$ sind korrekt. Der erste ist zulässig, der zweite wegen der negativen Komponente unzulässig; beide algebraischen Vorgänger sind eindeutig.
- Der normierte Fixvektor ist exakt $(90\,000/13,144\,000/13)^T$ und gerundet $(6\,923,11\,077)^T$.
- Für $L=\tfrac1{13}\begin{pmatrix}5&5\\8&8\end{pmatrix}$ gelten $L^2=L$, $M=L+0{,}87(I-L)$ und $M^n=L+0{,}87^n(I-L)$. Daraus folgen die angegebene Grenzmatrix, ihre Anwendung auf alle Anfangszustände mit Summe $18\,000$ und der jährliche Abweichungsfaktor $0{,}87$.

## Bewertungs- und Didaktikprüfung

- GK: $10+10+10+12+8=50$ BE; Bestehensgrenze 25 BE.
- LK: $50+10=60$ BE; Bestehensgrenze 30 BE.
- Die Teilpunkt-Raster summieren sich innerhalb jeder Aufgabe auf die ausgewiesene Punktzahl.
- Die GK-Lösung behauptet aus dem Fixvektor allein keine unbegründete Konvergenz. Der eigentliche Grenzprozess wird ausschließlich im LK-Zusatz geprüft.
- Die Aufgabe schreibt kein bestimmtes Lösungsverfahren vor. Inverse, Fixvektor und Grenzprozess dürfen mit jedem fachlich geeigneten Verfahren bearbeitet werden.
- Dezimalzahlen werden im Lernenden- und Lösungstext mit Dezimalkomma notiert. Für Tabellenkalkulationsformeln wird eine technisch erforderliche gleichwertige Dezimalpunktschreibweise ausdrücklich akzeptiert.
- Coverage wird nur dort beansprucht, wo eine Teilaufgabe beobachtbare Evidenz liefert; insbesondere werden die drei LK-Langzeitziele im GK-Profil nicht als abgedeckt geführt.

## Verdict

Die vier gebundenen v2-Dateien sind mathematisch konsistent, methodenneutral, profilgetrennt bepunktet und besitzen ein auf Teilaufgabenebene nachvollziehbares Coverage-Mapping. Für die hier dokumentierte unabhängige Codex-QA lautet das Verdict für beide Profile `RELEASED_INDEPENDENT_REVIEW`.

Eine etwaige spätere menschliche Prüfung muss als eigener append-only Reviewdatensatz mit eigener Reviewer-Identität und neuer Bytebindung dokumentiert werden; dieses Dokument darf dafür nicht umetikettiert werden.
