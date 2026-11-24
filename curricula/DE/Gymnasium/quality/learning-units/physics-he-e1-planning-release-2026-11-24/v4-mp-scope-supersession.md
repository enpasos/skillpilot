# Unveränderte BES-Freigabe nach der freiwilligen MP-Rückkehr

Der Product Owner hat die Mehrphasenprüfung wieder als freiwillige LK-Prüfung auf der E.1-Elternebene hinter den vier Kindabschnitten eingeordnet. Der [neue Maschinenbeleg](v4-mp-scope-supersession.actual.json) vergleicht alle acht betroffenen Rohansichten und die vollständigen Materialien mit dem geprüften Vorgänger `77cd98398d`.

Die Prüfung steht in allen acht Rohansichten unmittelbar hinter dem vierten Kindabschnitt. Der Kursfilter macht sie ausschließlich in den vier LK-Ansichten sichtbar. Die Auftragspolitik nennt sie genau in den drei LK-Vertragsansichten als freiwillig. Der einzige Unterschied der gesamten Elterneinheitsdatei ist diese Auftragspolitik; das Kindmaterial ist byteidentisch.

Die vier Pflichtteilbindungen, zwölf Inhaltsziele, die Eigentümerdeklaration `2026-11-23-v4`, die geprüften Ziel- und P-Eingaben sowie sämtliche Bytes der einzigen BES-Anrechnung bleiben gleich. Der native Release-Fingerprint ist weiterhin `sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d`; die unabhängige Freigabe von [BES über D](coverage-review.actual.json) wird nicht erweitert. Die elf übrigen Inhaltsziele erhalten weiterhin keine Planungsanrechnung. Die Kinder 1, 3 und 4 bleiben ohne deklarierte Eigentümereinheit.

Die hier gebundene MP-Aufgabe ist gegenüber `77cd98398d` vollständig unverändert. Ihre Platzierung ist keine neue fachliche Vollzielabnahme und keine Planungsfreigabe. Ein späterer Aufgabenentwurf benötigt eigene konkrete Reviews und neue Bindungen.

`verify-v4-mp-scope-successor.mts` reproduziert diesen Vergleich ohne Schreibzugriff auf die Produktdaten. Zusätzlich bestanden die strenge aktuelle BES-P-/Aufgaben-/Eigentümerprüfung und die native Einheitenvalidierung. Historische Belege bleiben unverändert; dieser Nachfolger ergänzt ausschließlich Angebotsrolle, Ort und aktuelle Ansichtsbindungen.
