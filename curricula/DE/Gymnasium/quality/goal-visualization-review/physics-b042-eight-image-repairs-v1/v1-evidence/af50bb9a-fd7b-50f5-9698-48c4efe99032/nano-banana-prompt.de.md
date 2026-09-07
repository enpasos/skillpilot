# Lernzielvisualisierung: Transistorverstärker analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `af50bb9a-fd7b-50f5-9698-48c4efe99032`
- Titel: Transistorverstärker analysieren
- Beschreibung: Die lernende Person kann Verstärkerschaltungen aufbauen und Kennlinien interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `af50bb9a-fd7b-50f5-9698-48c4efe99032.jpg`
- Public Asset: `/assets/goal-visualizations/physik/af50bb9a-fd7b-50f5-9698-48c4efe99032/af50bb9a-fd7b-50f5-9698-48c4efe99032.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Transistorverstärker analysieren
Beschreibung: Die lernende Person kann Verstärkerschaltungen aufbauen und Kennlinien interpretieren.

Zusatzanweisung:
Pflichtinhalt:
Präzise deutschsprachige Lehrgrafik „Emitterschaltung: kleine Signale verstärken“. Fachlich vollständiges vereinfachtes NPN-Modell, keine Netzspannung.
Links Schaltung: Versorgung+5V amoberenKnoten, KollektorwiderstandR_Cvonoben zumKollektorC, EmitterEanGND. Transistorsymbol korrektNPN, EmitterpfeilvonBasisweg nachaußen. BasiseingangBübergeeignetenBasisvorwiderstand; ausdrücklich beschriftetequelle „Gleichvorspannung + kleines Eingangssignal“ gegenGND. Keine reinenAC-KondensatorquellenohneGleicharbeitspunkt. VereinfachtefesteVorspannungistgegeben, keinfehlenderSpannungsteilerzuimaginieren.
Ausgang„u_out = Kollektorspannung gegen GND“ amKnotenzwischenR_CundC; keineVerwechslungmitSpannungsabfallanR_C. Text „Vorspannung: Arbeitspunkt im aktiven Bereich; kleine Aussteuerung.“
Rechts zwei untereinander auf GENAUgleicherZeitskala ausgerichtete Signaldiagramme: Eingang delta_u_in um0, darunter Ausgang delta_u_out um0. Beschriften„Wechselanteile um den Arbeitspunkt“. Eingangstartetbei0mitpositiverSteigung, obereersteHalbwellepositiv; Ausgangstartetbei0mitNEGATIVERSteigung, ersteHalbwellenegativ. GleicheNullstellzeiten, gleichePeriode, Ausgangbetragsamplitudegrößer. Explizit„180°Phasenumkehr“. Keine gleichphasigen Sinusbilder.
Erklärung„u_in steigt → I_C steigt → Spannungsabfall anR_C steigt → u_out sinkt“. „u_out = 5V − R_C·I_C“. „Signalenergie kommt aus der Versorgung.“
OptionalsimpleTransferkennlinie u_outüberu_inqualitativFALLENDmitmarkiertemArbeitspunktmittig,keineablenkendegenerischeS-KurveIC(U_BE),diealsAusgangsspannungmissdeutetwürde.
Geräumigeshelles16:9Schema,gutlesbareSymbole,unmissverständlicheVerbindungenundReferenzpotentiale.

Vermeiden:
Keine gleichphasigenEin-/AusgangssignaleanderEmitterschaltung. KeinefehlendeDC-Vorspannung. KeinfalscherEmitterpfeil. KeinStromverstärkungswertalsuniverselleKonstante. Keine unerklärte negative absoluteKollektorspannung: negativeWechselanteileklargetrenntvompositivenGleicharbeitspunkt.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
