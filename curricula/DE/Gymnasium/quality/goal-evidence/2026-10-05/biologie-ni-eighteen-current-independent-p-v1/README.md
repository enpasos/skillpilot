# Unabhängige NI-Biologie-P18-Prüfung: 5 PASS, 13 HOLD

## Umfang und Status

Unabhängig geprüft wurden die 18 vollständigen positiven Verständnisprofile und ihre 36 vollständigen bilingualen CaseBriefs gegen die tatsächlich gesehenen Quellen, Operatoren, Kontexte, PDF-/geladenen HTML-Seiten und Bilder der eigenen abgeschlossenen D-A23-Prüfung. Der Prüfer hat diese NI-Texte/Profile nicht verfasst und vor dem eigenen Wissenschaftsfreeze keine fremden NI-P-/D-B-Urteile gelesen.

| Ergebnis | Anzahl | Bedeutung |
|---|---:|---|
| PASS_CURRENT_CARRY | 3 | Drei ganze frühere innere Profile sind unverändert; aktuelle Bindungs- und Reichweitenverträglichkeit geprüft. |
| PASS_NEW_CURRENT_SCIENCE | 2 | Zwei neue vollständige Profile einschließlich beider Fälle sind fachlich vereinbar. |
| HOLD_PROFILE_REVISION | 13 | Offene Befunde; keine fachliche P-Freigabe und keine Abschlusszählung. |

Die manuelle Wissenschaft wurde vor der nativen Materialisierung in `independent-positive-science.before-native.final.freeze.json` (SHA256 `213ac9673f3616ee8c4485f86bac4a7c3136a025ba316063d7deb77ed6c0d4d6`, sechs Dateien) eingefroren. Einzelurteile stehen in `independent-eighteen-complete-profile-science.actual.json`, die 36 Fälle in `independent-thirty-six-complete-case-science.actual.json`, konkrete offene Originalfelder und nötige Auflösungen in `independent-open-scientific-and-profile-contract-findings.actual.json`.

Alle 18 tatsächlichen nativen Records behalten die **exakten unveränderten Autorenprofile**. Status ist durchgängig `needs_human_review`, Authority `ai_candidate`, E1/G1. Die 13 HOLDs tragen zusätzlich explizite offene Dissents und dürfen trotz technischer Validität nicht als abgeschlossener P-Nachweis integriert werden. Keine tatsächlichen Lernenden- oder Laborleistungen, menschliche Freigaben oder Erprobung behauptet. Kein aktiver Write; strenger Nettozuwachs 0, neue aktive fachliche Abschlüsse 0, wiederhergestellte aktive Bindungen 0.

## Eingang und erhaltene Historie

Autorenfreeze `../biologie-ni-ten-current-native-author-candidate-v2/author-checkpoint.freeze.manifest.json`: SHA256 `174b280a3d02591d1e5125ed32624c525bef699fff188be1cb4d9f51c016646f`, 556 Dateien. Eigener D-A23-Freeze `../biologie-ni-twenty-three-current-independent-d-a-v1/independent-description-review.final.freeze.json`: SHA256 `ead5f360e6bf337a379fa7818168dc4fcc097c0209ff16a987f44baae0a60fb7`, 90 Dateien. Beide und die sechs bereits gefrorenen eigenen Wissenschaftsdateien sind abschließend vollständig nach Bytes und SHA geprüft und unverändert.

Die tatsächlichen D18-/D5-Bücher bleiben erhalten; diese P-Befunde verlangen keine operative D-Textänderung. Originale Quelle, Seiten, Bilder und Scope dürfen bei der gezielten Profilkorrektur nicht verengt werden. Drei frühere ganze Profile wurden anhand ihrer tatsächlichen Payloads und aktuellen Anforderungen verglichen; keine neue fachliche Prüfung aus einer bloßen Hashanpassung behauptet.

## Native maschinelle Prüfung

Die bestehende kleine NI-Codewurzel `tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root` wurde benutzt; keine neue vollständige Repositorykopie. Der eigene Quality-Namensraum dort löst auf diesen eigenen P-Ordner auf. Eine Copy-Vorprüfung stellte deshalb `SameFileError` fest; nur diese überflüssige Eigenkopie wurde ausgelassen. Native Skripte, Kriterien und Schemas wurden nicht verändert.

1. `materializePositiveGoalEvidenceCandidates.ts --config positive.eighteen.current.config.json --candidates positive.eighteen.current.candidates.json --write`: Exit 0, 18 Records.
2. Derselbe Materializer ohne `--write`: Exit 0, 18 aktuelle Kandidaten bestätigt.
3. `positiveGoalEvidenceReview.ts --config=positive.eighteen.current.config.json --mode=check`: Exit 0; 18 konfiguriert, 0 approved, 18 needs human review, 0 rejected, 0 technische Blocking Issues.

Die exakten vollständigen Argumentlisten, Working Directory, Skript- und Ausgabesha stehen in `actual-native-positive-materialize-verify-check.receipt.json`; echte stdout/stderr-Dateien heißen `.txt`. Die unveränderten vorhandenen v2-Schemas bestehen für die Config und alle 18 Records, dokumentiert in `actual-native-config-and-eighteen-record-schema-check.json`. Diese Prüfungen validieren das Kandidatenformat und aktuelle Bindungen; sie lösen keine offenen fachlichen oder bilingualen Befunde.

## Nächster Schritt

Die 13 Profile gezielt als neue Autorenfassung korrigieren und unabhängig nachprüfen. Ganze gültige D-/Quellen-/Bildinputs und die fünf hier wissenschaftlich gültigen Profile erhalten. Bis zur tatsächlichen Auflösung bleiben alle 13 HOLDs offen; keine automatische PASS-Umwertung. Separate menschliche Release-Gates bleiben erhalten.
