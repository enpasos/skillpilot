"""Actual own authored submissions with individual manual rubric decisions."""
from pathlib import Path
import json,hashlib,re
O=Path(__file__).resolve().parent
W={
'43acb850':{
'fullA':['Amtlich dokumentiert sind die Fondsrücknahmen im Mai-2026-Bericht; die Bankrechnung ist erfunden. Vela verliert4, hat96Aktiva gegen92Schulden, also4Eigenkapital. Für16 Auszahlung fehlen10Cash. Abzüge zwingen möglicherweise zu Verkäufen, deren Abschläge Vertrauen weiter schwächen; positiver Saldo bedeutet keine sofortige Verkäuflichkeit.',
'Der10-Kredit gibt10Kasse und10neueSchulden, keinEigenkapital. Eigentümer4 tragenVerluste, geben4Kasse/4Kapital; zusammen20Kasse und8Kapital vor Auszahlung. Kredit allein reicht gegen Kassennot, nicht gegen neue Verluste. Sicherheitenwert und tragfähiges Geschäft müssen stimmen.',
'Ich würde kurzfristige gesicherte Liquidität mit verlässlicher Bewertung und Eigentümerverantwortung verbinden. Sonst könnten Verkäufe fremde Portfolios treffen und Fondsfinanzierung Banken schwächen. Bei fehlender Tragfähigkeit keine ewige Finanzierung; Abwicklung separat prüfen. Eigentümerrettung ohne Bedingungen kann Fehlanreize fördern.'],
'weakB':['Die Zahlen sind86Aktiva, −2Eigenkapital und5Auszahlungslücke. Das bedeutet aber alles dasselbe; jedeBankistnurkurzilliquide.',
'Eigentümer4 ergibt2Kapital undKasse14, einKredit5 hebtKasseauf15. Die schulischeSourceunterscheidet echteQuelleundSzenario. Kredite erfinden automatisch2Kapital; für gemeinsame Branchenverluste braucht man keine Erklärung.',
'Ich rette alleInstitute ohne Prüfung, HaftungoderGegenposition; derStresstest beweist die Zukunft.'],
'partialA':['Quelle beobachtet Fondsrücknahmen; Bank erfunden. Eigenkapital4 undKassenlücke10zeigen zweiProbleme. Abzüge und Verkäufe können Verluste verschärfen; ich kenne keine tatsächliche europäischeAllgemeininsolvenz.',
'Kredit10finanziertKasse, verschuldetgleichzeitig undlässtKapital4. Eigentümer4erhöhtKapitalundKasse. Ich erläutere nicht die kombinierteKasse20, halte aber KreditundVerlustträger auseinander.',
'Aufsicht/Bewertung und passende Sicherheiten helfen; mit Eigentümerbeteiligung wenigerRettungsfehlanreiz. Gegenposition: zusätzliche Verluste können Rettung ungeeignet machen.'],
'partialB':['Nera hatKapital−2 undCashlücke5. Anders alsAistNettovermögennegativ; StressannahmeistkeinBeobachtungsbeweis.',
'Kredit5behebtCashnichtVerlust; Eigentümer4kannKapital2schaffen. MehrereBanken können nachBranchenverlust gleichzeitigKreditekürzen, Betriebeinvestierenweniger undRückzahlungwirdschwächer. ObandereAktivaLiquiditätgebenistoffen.',
'Verlusttragfähigkeit undTragfähigkeitprüfen, gemeinsameExpositionbeaufsichtigen; beiuntragfähigemGeschäftAbwicklunggesondertprüfen. PauschaleRettungverlagertRisiken, pauschaleSchließunggefährdetandere. IchbenennekeinenkonkreteninternationalenInformationsweg.'],
'grounds':['A1:Beobachtung/Variation,4/10undursächlicheKette vollständig.','A2:Kredit/Owner/bothundGrenze vollständig.','A3:passendeMix,Ansteckung,Haftung/Abwicklung fachlich.','B1:86/−2/5 richtig; mechanistischeGleichsetzung falsch.','B2:Owner/Kassenzahlen undSourcegrenze Teilpunkte; Kapitalerzeugung/Branchenkette falsch.','B3:garantierteRettung/Stresstestvorhersage ohne Abwägung.']},
'd22433a8':{
'fullA':['H−1/J3 undCashlücke7. EigenkapitalabsorbiertVerlust, CashbedientFälligkeit. JistnichtüberschuldetimModellaberhatunter6fiktivemMinimumzu wenigKapital.',
'Pillar1Mindestregeln, Pillar2individuelleAufsicht, Pillar3Informationverbindensich. RisikogewichtekönnenRisikenunterschätzen; Verschuldungsgrenzeergänzt, LiquiditätregelnandereZeithorizonte. KonzentrationundSteuerungprüfen.',
'OhneRisikogewichte/Kapitalarten/UmsetzungsstandkeineComplianceaussage. BaselstandardhatScope, CRR/CRDkonkreteEUUmsetzung/Übergänge. MehrKapitalreduziertVerlustfolgen,nichtoperativeoderLiquiditätsrisiken.'],
'weakB':['Extern12, addiertePräsentation24, rechnerisch12−15=−3. Dennoch zählt dasselbeGeld zweifach als echteVerlustdeckung.',
'AufsichtundOffenlegungexistierenundBankhatKredite. EininternationalerStandardmussrechtlichumgesetztwerden. DoppelteZählungistfürGruppenrisikoegal; CashundKapitalsinddasselbe.',
'BaselgiltfürjedesProduktgleichundgarantiertohneweitereBegründungKrisenfreiheit.'],
'partialA':['NachVerlustH−1undJ3; Auszahlung18bei11liquid ergibt7. KapitalundLiquiditätleistenUnterschiedliches, J3istunterModellanforderung6.',
'MindestregelnwerdenmitindividuellerRisikoaufsichtundöffentlicherInformationergänzt. Leveragebegrenzt auchRisikenmitzu kleinenGewichten; ich erläuterekeinelangeFristenvorsorge.',
'JserfülltkeinenachgewieseneRealkomplianceweilRechtsstand/Risikogewichtfehlt. MehrKapitalistnichtKrisenfreiheit; hierbleibtCashproblem.'],
'partialB':['Nur12externesKapitalträgtVerlust; Tochter12stammausdieselbenMitteln, zusammen−3nach15. Einzelwerte könnenfürEinzelregelnrelevantsein.',
'GruppenaufsichtzeigtgemeinsameVerluste, OffenlegungkannDoppelzählungerkennbar machen. Kapital ersetztnichtsofortigeLiquidität; icherörtereTransfersnichtimDetail.',
'BaselintendiertbestimmteBanken/Gruppen, konkreteUmsetzungistjeweilszuprüfen. Versicherungsprodukte nichtautomatischidentisch. AuchrichtigeKonsolidierungschütztvorRisikofehleinschätzungnichtvollständig.'],
'grounds':['A1:−1/3/7undbeideMechanismen.','A2:dreiBereiche/Leverage/Liquiditäteingeordnet.','A3:konkreteScope-/Implementierungs-/Restgrenze.','B1:12/24/−3korrekt, Doppelzählungsverständnisgegenteilig.','B2:Aufsicht/Disclosure undStandardumsetzung korrekt benannt; Gruppenrisikomechanismus fehlt.','B3:universalScope/Krisengarantie widerspricht.']},
'5ae551bf':{
'fullA':['GemeinsamerImmobilienzyklusmachtvieles gleichzeitigverletzlich. Zusatz0,025×800=20; Haushaltmax120undÜberschreitung30. DasistfiktiverSatz, keinRechtstarif.',
'BankpufferabsorbiertgemeinsameVerluste; EinkommenbegrenzungsetztbeiNeuverschuldungan. EinzelbankaufsichtprüftdieeigeneSteuerung, SystemmaßnahmegemeinsameZyklen/Verflechtung, ErgänzungstattIdentität.',
'WenigerÜberdehnungkostetkurzfristigKreditzugang; ärmereAntragstellerkönnenbenachteiligtsein. Daten/Einkommensmessung/AusweichenzuanderenFinanzierern undZeitpunktbegrenzenWirkung. KeinemRateversprichtrisikoloseBanken.'],
'weakB':['NachVerlust62, vorAnforderung70Abstand−8, nach50Abstand12. DieFreigabebedeutetaber20frischeMünzenund20automatischeKredite.',
'NachfrageundRückzahlunggibt es, zuständigeModellaufsichtsenktdieAnforderung. Verlust8isteineZahl. KreditwürdikkeitdesMverbessertsichautomatischmitFreigabe.',
'AlleBankenmüssenimmermehrverleihen; alternativeSystemansätzebrauchtman nicht.'],
'partialA':['20Puffer, max120, Überschuss30. AlleunterliegenImmobilienpreisrisikogemeinsam, nichtnureinerBank.',
'KapitalpufferwirktanBankverlusttragfähigkeit, EinkommensgrenzebeiSchuldnern; dasistandersalsindividuelleBankprüfung. Beide könnenSystemzyklusbremsen.',
'HöhereHürdebegrenzthypothekenzugang, guteMessungundAusweichanbieterentscheidend. Rate2,5%istModell. Ichgebe keineausführlicheKalibrierungsstrategie.'],
'partialB':['62Eigenkapital, −8vorund+12nachFreigabe; Anforderungwirdgelockert, Kasse6unverändert.',
'GeringererKapitalzwangkannKürzungsdruckdämpfen, NachfrageundRückzahlungbleibenentscheidend. MhatkeineTragfähigkeit, daherkeinpflichtigerKredit. IchberechnenichtjedeZwischengrößeerneut.',
'GezielteFreigabemitRisikoüberwachungistvertretbar; GegenpositionverweistaufRestverluste. ErgänzendtragfähigeNachfragestützenstattuntragfähigeKrediteerzwingen, Wirkungsichernichtgarantiert.'],
'grounds':['A1:20/120/30undspezifischesgemeinsamesRisiko.','A2:System/Einzelbank undInstrumentziele.','A3:konkreteZielkonflikte/Ausweichen/Modellstatus.','B1:62/−8/+12korrekt; FreigabeCash falsch.','B2:richtiggenannteNachfrage/RückzahlungundzuständigeFreigabe, aberBedingtheitverkehrt.','B3:Kreditautomatismus stattbegrenzterEmpfehlung.']},
'f0b0a96f':{
'fullA':['Termin240vsSpot160/320. WareistBasiswert; dieProduzentinfixiertVerkaufserlösstattallgemeinGewinn.',
'HändlerohneWarekauft160/320undnimmt240ein, also80/−80. Vertraggleich, wirtschaftlicheGrundpositionungedecktvsProduktiongedeckt.',
'ProduzentinverzichtetaufhohenPreismehrerlös80fürPlanbarkeit; Händlerpreisexponiert. Ernte-/Mengenfehler/Gegenpartei bleiben, volleErfüllungistModellannahme.'],
'weakB':['Option−5/10, Termin−15/15; Prämieist5. RsGesamtkostenwären50/65.',
'RbenötigtBasiswert,Snicht. BeideVerträgehabenDatenundPrämie. Dennoch istfürallejedeOptioneineGarantieunddasWahlrechtidentischmitTerminkaufpflicht.',
'Absicherung/Spekulationunterscheideichnicht, GegenparteifälltausPrinzipnieaus.'],
'partialA':['Vertragliefert240, ungehedgt160oder320. ErfixiertWarepreis, keineGewinnsicherheit.',
'Händler80oder−80,weilerkeinEigengutbesitzt. ProduzentinhatGrundposition, derHändlerneuesPreisrisiko.',
'Produzentinkann80Upside verlieren; LieferungundGegenparteimüssenfunktionieren. IchbeschreibenurGegenparteiversagennichtMengenbasisimDetail.'],
'partialB':['Bei45optionnichtausübenNetto−5, bei75ausübenNetto10. Terminkaufimmerpflichtig, −15/15.',
'RhatBedarf,kannPreisgrenzeschützen,gesamt50/65; Sbezahlt5fürKursexpositionohneAusgleichsgut. AnpassungderFristbleibtnötig.',
'Wahlrechtkostet5, keineuniverselleÜberlegenheit. GegenparteierfüllungistfürsicheresResultatvorausgesetzt; SriskiertPrämie. IchbenennenichtjedeBasisabweichung.'],
'grounds':['A1:240/160/320undBasiswert.','A2:80/−80undfunktionaleGrundposition.','A3:UpSide/Hedge/Erfüllungsgrenze.','B1:Option-/TerminwerteTeilpunkte; Pflicht/Wahl falsch.','B2:50/65undunterschiedlicherBedarfkorrektbenannt, Zweckdeutung fehlt.','B3:Risikogarantie/Gegenparteifreiheit falsch.']},
'2a8b5b56':{
'fullA':['Förder7,2regional4,8Mio. Ausbildungsplätze ohneSchichtbuswerdennichterreichbar; Kopplungqualifikation+ZugangzieltaufEngpassstattbeliebigeBaumaßnahme.',
'Tala+4PpvsKontrolle+2Pp, zusätzlicheÄnderung2Ppbedingtvergleichbar. Ausgabe12Misstinput, kausaleErklärung brauchtähnlicheTrends/andereFaktoren.',
'Busnutzung/Abschlüsse/Stabilitätprüfen, KostenverdrängenandereRegionausgaben. AbgelegeneGruppenprofitierenweniger. IchwürdegezieltenAnschlussmitErgebnisdatenfortsetzen; GegenpositiongünstigereskleinesProgramm ernstnehmen.'],
'weakB':['Je10Mio. Anteilund18ausgegeben; 70%Anschlüssefertig, HälfteTeilnehmerAuftragsbericht.',
'Das sindOutputundInputwörterundWartungkostet. Aber90%Geldbeweisen90%dauerhafteWirkung, alleRegionfirmenhaben50%neueAufträge undAuswahlspieltkeineRolle.',
'Ich verlangekeinenBeleg; Ausgabe beweist Erfolg und Zusammmenhalt.'],
'partialA':['7,2/4,8Mio; SchichtverkehrundAusbildungergänzensichfürkonkreteErreichbarkeit.',
'Zuwachs4vs2Pp, Differenz2. Vergleichistnurbedingtbeweiskräftig, weilallgemeinerTrend/andereEigenschaftenwirkenkönnen.',
'NutzungundAbschlüsseprüfen, abgelegeneGruppenachten. GegenpositionbilligerAnschluss; regionaleBeiträgeentgehenanderenZwecken. Ichgebe keinenKostenjeErgebniswert.'],
'partialB':['10/10MioAnteileund18Ausgaben; Mittelabfluss,FertigstellungundberichteteAufträgeverschiedeneStufen.',
'Anschluss+SchulungkönnenAngebotbearbeitungverbessern; motivierteAuswahlundTourismustrendskonkurrierendeErklärungen. Vergleichsfirmen/Vortrendsnötig, keinallFirmenbeweis.',
'WartungundzugänglicheSchulungvorNeubauprüfen; armeBetriebeTeilhabefrage. StoppbeiunfinanzierbaremBetriebvernünftigeGegenposition. IchdiskutiereMitnahmeeffektnichtausführlich.'],
'grounds':['A1:Finanzierung/Engpass.','A2:Änderungsdifferenz/kausaleGrenze.','A3:Umsetzung/Verteilung/Alternative.','B1:Finanz- undFertigstellungsdatenbenannt, Indikatorreichweitefalsch.','B2:Output/Input/WartungalsFragmente, Fördermechanismus/Selektionverkehrt.','B3:AusgabeidentischmitWirkungnichtakzeptabel.']},
'1bddc795':{
'fullA':['Fonds20, Anträge27, Überhang7. NbelässtSteuern/Budget/Haftungnational,GüberträgtbegrenztegemeinsameEntscheidungundparlamentarischeKontrolle. WährungalleinmachtkeinenTransferfonds.',
'Hilfe gegenregionaleSchocks kannSpilloverbegrenzen,aberBeiträge/knappeVerteilungverlangenKriterien. IchteileproportionalnachgeprüftemBedarf,dokumentiereabweichendenBedarf; Kontrolle/Fehlanreizrelevant.',
'KeinezwangsläufigeUnion: VorteilgemeinsamerHandlungsfähigkeitgegenVerlustnationalerEigenverantwortungabwägen. IchbevorzugeboundedGmitHaftungsgrenzeundRechenschaft, NistvertretbareGegenposition.'],
'weakB':['SistBankensektor,PallgemeinerHaushalt. BankenbezahlenS, PbedarfnochRechtsakt.',
'Es gibt gewähltesParlamentundBankenfonds. DennochbedeutetjedeAufsichtvolleStaatswerdungundjederFondsschuldunbegrenzteSteuerhaftung; andereBefugnisgrenzeichnichtab.',
'MehrgeteilteBereicheimmerbesser,alleModelleautomatischgesetzlichinKraft.'],
'partialA':['Gemeinsam20gegenAnträge27, Überhang7. GgibtgemeinsamebegrenzteFondsentscheidung,NnurKoordination; HaftungGsaufBudgetbegrenzt.',
'RegionalenSchockaufteilenkannhelfen, faireBedarfsprüfungmitklarerRechenschaftwichtig. IchwürdePrioritätgegebenenkriterienfestlegen, ohneexaktesZuteilungsverhältnis.',
'WährungmachtkeineunbegrenztePolitikunion.Gkannhandlungsfähigersein,Nnationalkontrollierbarer; parlamentischeMitwirkungstärktLegitimation. IchnennekeineneinzelnentatsächlichenVertragsartikel.'],
'partialB':['SbleibtBankaufsicht/Abwicklung,PbreiterBudget/Politik, BranchenfondskeineautomatischeSteuerschuld. Pbeträge/Haftungsdeckeloffen.',
'GemeinsameBankrisikenlassenSvernünftigerscheinen,Allgemeininvestitionenwerdenabernichtautomatischgelöst. PkannSpilloverbreiterangehen, Verteilungskonfliktewachsen.',
'NichtvollstaatdurchS, nichtbesserdurchmehrKompetenzen. IchwählebegrenzteSmitverantwortlicherKontrolle, GegenpositionPbrauchtklareFinanzierung/Legitimation; keinebereitsrealisiertenRechtsänderungen.'],
'grounds':['A1:Budget/Überhang undvierDimensionen.','A2:Stabilisierung/Verteilung/Knappheitsregel.','A3:Alternativen/begrenzteHaftung/Legitimation.','B1:Scope-/FinanzdatenTeilpunkte, Vergleichsgeltungfehlt.','B2:Parlament/FondsFragmente, echteHaftung/Befugnisanalysegegenteilig.','B3:Labelautomatismus stattUrteil/Gegenposition.']},
'648224f4':{
'fullA':['InländischeBevorzugungschließtMarktanbieter, fehlendeGerichtskontrolleundVergabedatengefährdenEUmittel, SchuldendienstdrängtWartung. IneffizienteVergabekosterhöhenBudgetdruck, schwacheKontrollesenkenVertrauen/Finanzierungsqualität.',
'Vergabe öffnen/Rechtsschutzstärken; direkterEUbudgetbezugistgesondertzu belegen, Kommissionvorschlagen/Ratentscheiden. Endempfängeransprüchebleiben.StaatsfinanzplanistseparateAusgaben-/Reformprüfung.',
'VollsperrewegenSchuldenfalsch, zielgenauesnachgewiesenesProblemproportionalbeheben. Gegenposition: kosmetischeKontrollewürdeMittelrisikonichtlösen. SchutzfinalerEmpfängerundInvestitionengegenVerlustgefahrabwägen.'],
'weakB':['Beschwerdenoffen, hohezinsen, längereAuslandsgenehmigungundPlanvorschlag. Markt/Schulden/RechtsstaatsindWörter.',
'KommissionmachtVorschlag,Ratentscheidet, EndbegünstigtehabenAnsprüche.DennochhoheSchuldistautomatischeRechtsstaatsverletzung undbegründetVollsperrejedesBudgets.',
'Ich analysierekeineunterschiedlichenMechanismen/Wechselwirkung/Verhältnismäßigkeit undprüfeBeschwerdennicht.'],
'partialA':['DreiProbleme: Marktzugangungleich, Aufsicht/Justizschwach, Zinslastgroß. SchlechteVergabekannKostenundBudgetdruckerhöhen, Investitionenschaden.',
'TransparenzundwirksamesGerichthelfen; EUbudgetmaßnahmenbrauchenDirektbezug,Kommission/RatundBegünstigtenschutz. Finanzpfadseparatüberprüfen.',
'KeineVollsperrealleinwegenSchulden; zielgenaueAbhilfe.NichtwirksameAbhilfeistGegenposition, Investitionsverlustebeachteich. IchbenennekeineausführlichealternativeSanktionsausgestaltung.'],
'partialB':['LangsamereAuslandserlaubnishindertMarkt, undokumentierteVergabeschwächtKontrolle, SchuldzinsreduziertMittel. Beschwerdennichtbewiesen, PlannochVorschlag.',
'GleicheklareVerfahrenundunabhängigePrüfungkönnenVertrauenstärken, tragfähigerFinanzpfadGeldzugang.Budgetbezug/Finanzannahmen/VerteilungsfolgenbenötigenBelege.',
'UnterstützungmitkontrollierbarenReformenvertretbar; GegenpositionfehlendeKontrollemachtMittelunsicher.HoheSchuldennichtgleichRechtsstaatsbruch, Beschwerdennichtgleichzahlungsentscheidung.'],
'grounds':['A1:Alle3MechanismenmitWirkungsfolge.','A2:Scope/Verfahren/Begünstigter/Finanzpfad.','A3:ProportionaleAlternative/Gegenposition.','B1:Fallmerkmale/Ungewissheitbenannt, unterschiedlicheMechanismennichtanalysiert.','B2:institutionelleSchritte/AnsprücheTeilpunkte, Tatbestandsgrenzegegenteilig.','B3:ganzeAnalyseundbedingtUrteilfehlt.']},
'becf0989':{
'fullA':['DgewinntgegenC6>4undgegenD1>0bei beiden; einzigesNE DD. CC4>1beideParetoüberDD, keineSummeordinalerWohlfahrt. DasisteinDilemmaausindividuellemAnreiz.',
'IndividuellDwennnurEinmalanreiz, gemeinsamCbeiGlaubwürdigkeitderRegelwünschenswert.CalleinohneBindungwirdmit0gegenDausgenutzt.',
'NachSanktionCD0,3/DC3,0/DD−2,−2; CgewinntgegenC4>3undgegenD0>−2, CCeinzigesNE. GlaubwürdigeKontrolleistAnnahme, realeKosten/PräferenzkönnenErgebnisändern.'],
'weakB':['FormatAA5,5 BB3,3, DurchfahrtHY5,1/YH1,5.DieAuszahlungengebenrichtigRängeundkeineEurowerte.',
'AbsprachenundRotationwurdenvorgeschlagen; beidekönntenverständigen.DochichnennedurchgehendDstriktdominantauchbeikoordinationundHHstabil; leitekeineAntwortenausderMatrixab.',
'AlleSpielebedeutenimmerbeiderseitsD; ModellgrenzenundStrategieunterschiedeprüfeichnicht.'],
'partialA':['Ddominant6>4und1>0beide, DDeinzigesNE; CCParetobesserdurch4statt1.',
'NurCanzubieten ohneBindungistverletzlich, gemeinsamerPflegevertraghilftfallsüberprüft. OrdinalnutzenkeineEuro.',
'SanktionmachtCbestgegenbeides, CCGleichgewicht; ichschreibeDD−2nichtaus.MeineStrategiebedingt, Kontrolle/Glaubwürdigkeitfraglich.'],
'partialB':['FormatbestmatchingundAA/BBNEkeineDominanz;AAfürbeidehöher, BBbleibtstabil.',
'DurchfahrtgegenHausweichen1>−3, gegenYdrängen5>2, NEHY/YH. AndersalsPDkeinimmerDundYYnichtstabil.',
'FormatvereinbarungAundDurchfahrtklareabwechselndePrioritätpassend; EinhaltungundtatsächlicheNutzennichtgesichert. IchrechnekeinemixedStrategiesdieauch nichtverlangtsind.'],
'grounds':['A1:beideAntworten/DD/Dilemma.','A2:Pareto/individuellvsgeteilt.','A3:geänderteMatrix/Antworten/Geltungsgrenze.','B1:richtigeRanking-/FormatzahlenTeilpunkte, Antwort/NE falsch.','B2:Auszahlungen/keineEuroFragment, HawkDoveAnalysefalsch.','B3:passendeStrategienvollständigfehlend.']},
'7d4d7a90':{
'fullA':['EinmalD5>3und1>0, DDstabilaberCCbesser.Zukunft könnteverloreneKooperationkostbar machen,aberTreffen/Discountunbekannt,keineSchwelleableitbar.',
'IchbeginneCmitoffenerAufgabenliste, kläreVerdachtvorReaktion. GemeinsamefaireBeiträge, sichtbareErfüllung undproportionalerevidierbareReaktionnachbestätigtemVerstoß; keinRachedauerplan.',
'Kontrolle kostetZeit, FehlbeobachtungdrohtEskalation, selfschädigendeSanktionnichtglaubwürdig. GegenpositionkleinesverbindlichesProjektstattfiktivunendlicherWiederholung; keinKooperationsversprechen.'],
'weakB':['AA4,3 BB3,4, AB/BA0; beidewollenAbstimmung. Rotationist vorgeschlagen,zweiterTerminoffen.',
'EigenerPlan/kollektiverPlanbegriffeexistieren, AbstimmungkostetZeit. IchwürdeimmerinkompatibelwählenweilDausADominanzhierunverändertgilt.',
'ZweitesTreffenistewiggarantiert; keinekonkreteAbstimmung/Verteilung oderalternativeStrategie.'],
'partialA':['Ddominant, DDstabil undCCbesser. WiederholungkannAnreizeändernabhängigHorizontundWichtigkeit, keineZahlenSchwelle.',
'MeinPlanC/Beiträgezeigen/Verdachtklären. GemeinsamfaireAufgabenundzumutbareBeobachtung, begrenzteReaktionverabreden; andereBeiträgevorherabstimmen.',
'KostenundFehlerbeobachtungmachenPlanriskant. GegenpositionkurzerbindenderAbschnitt. Ich erläuterekeinlastperiodSpielvollständig.'],
'partialB':['BesteAntwortmatching, AAundBBstabil, keinDilemmaübertrag.AAbegünstigt1,BB2.',
'IchwürdevereinbarteWahlmitgehenundbeiÄnderungabstimmen. GemeinsamtransparentesLosoderSachkriterium, dasauchdieanderePräferenzachtetzurBegründung.',
'RotationnurglaubwürdigmitspätererTeilnahme; ungewissesFolgetreffenpasstLosjetztbesser.Mitwirkung/geringerAufwandwichtigeralsStrafreflex, keineGarantie.IchzeigeRotationnichtmitOrdinaladdition.'],
'grounds':['A1:einmalig/WiederholungohneScheinschwelle.','A2:eigenerundkonkreterGruppenplan.','A3:Glaubwürdigkeit/Kosten/Gegenposition.','B1:Matrix/UnsicherheitTeilpunkte, bestAntwortMechanismusfalsch.','B2:Plan-/KostenbegriffeTeilpunkte; tatsachengerechterHandlungsplanfehlt.','B3:RotationUnsicherheitsfairnessnichtgeprüft.']},
'1c92b15e':{
'fullA':['Preis+2,Kosten+2,Marge3vor/nach.GemeinsamerStoßerklärtunabhängig, GleichheitbeweistAbsprache nicht; Nachrichten/Marktumsetzungprüfen.',
'ZusätzlichauthentischerMindestpreis/KundenaufteilungbelegtKoordinationmitWettbewerbsbeschränkungim§1Fall. OhneerkennbareRechtfertigungsregelkannVerstoßfallbezogenbejahtwerden,nichtnurPreisgleichheit.',
'KartellbehördeprüftBelegeundabweichendeTatsachen.GegenpositionunabhängigePreisreaktionerklärtBasisfallabervereinbarteAufteilungnicht. KeineautomaticfineoderFusion.'],
'weakB':['ZweiNaheAnbieter, dritterkapazitätsbegrenzt,zweiJahreEintrittund15%behaupteteKosten.',
'VorVollzugAnmeldung, Behördeprüftgegebenenfallsvertieftundentscheidet. DennochistAnmeldungautomatischFreigabeund15%WortgenügtohneNachweis; Marktalternativenbeurteileichnicht.',
'NurGrößeentscheidetimmer, Abhilfefähigkeit/Daten/Gegenpositionentfallen.'],
'partialA':['Marge3beide, Kosten+2wiePreis+2; ParallelitätkönnteseparatverursachtseinundistkeinBeweis.',
'NachrichtmitMindestpreis/KundenaufteilungistweitererrestriktiverAbsprachebeleg, §1MaßstabimgegebenenFallerfüllt; Gegenbelegwürdigen.',
'BehördeprüftKommunikationundTatsachen; KostenstossrechtfertigtkeineAbsprache.Ichgebe keinenweiterschrittdetailliertenBußgeldprozess, derauch nichtverlangtist.'],
'partialB':['NaheAlternativeverschwindet, DrittanbietergrenzeundlangsamerEintrittschwächenAusweichmöglichkeit. MarktdatenfehlenfürsichereEntscheidung.',
'Vorheranmelden, ggfvertieftprüfen/entscheiden; AnmeldungkeineFreigabe. Kostenvorteil/geeigneterunabhängigerKäufernachweisen, bloße15%keinBeweis.',
'OhneAbhilfeBedenkentragen; GegenpositionbelegteÜbertragungtragfähigenBetriebskönnteCompetitionwiederherstellen.IchmöchteKundenwechsel/Kapazitätensehen, behauptenichkeineautomatischeGrößenfolge.'],
'grounds':['A1:Kosten-/Preis/-Beleggrenze.','A2:Nachricht/Subsumtionbegrenzt.','A3:richtigerPrüfweg/echteGegenposition.','B1:Fallalternativen/Eintrittbenannt, Wirkungsanalysenichtgeführt.','B2:tatsächlicheVerfahrenswörterTeilpunkte, evidenzgebundenesUrteilfalsch.','B3:Größenautomatismus/ganzfehlendeGegenposition.']},
'f7c051f4':{
'fullA':['BeideprivatesEigentumundPreise, ShatsozialenAusgleich, GzusätzlichegemeinwohlbezogeneBeschaffung.DasistfiktiverRegelvorschlagundBefürworterwirkungnurBehauptung.',
'AnreizzuprüfbarbesseremArbeiten/RessourcenverbrauchkannbeienKosten entstehen; Kriterienmessbarkeit/faireTeilnahme nötig. KleineFirmenkönntenBürokratiekostenstärkertragen.',
'GkeineZentralplanungnachRegeln, Snichtsozialblind.IchbevorzugeversuchsweisegeprüfteAnreize,GegenpositionKostenManipulationnehmeichernst; keinegeltendeGWÖPflicht.'],
'weakB':['EinBetriebveröffentlichtArbeitszeitdatenundfreiwilligenBericht, Umweltangabenselbstauskunft, Staatregelnunverändert.',
'Datenhabeichbenannt; Kundenkönnenlesen. TrotzdemändertnurerBilanztitelalleEigentums-/KoordinationsrechteimLand undSelbstauskunftbeweistjedenErfolg.',
'DasLandistnunperNameZentralplanung; Wirkungsprüfung/Gegenpositionbrauchtman nicht.'],
'partialA':['EigentumundPreisebeibleiben,Senthältausgleich/GergänztBewertung; ZieleandersgewichtetnichtanderesEtikettgleichPlanwirtschaft.',
'BeschaffunganreizkanngutePraxislohnendmachen, Kriterien/Prüfung nötig; kleineFirmenhabenKostenproblem.IchgebekonkretArbeitsbedingungenalsKriterium.',
'NichtZentralplanung/nichtSozialblindheit.Guteprüfungvoraussetzung, GegenpositionManipulationsrisiko.IchnenntkeinenweitereneinzelnenOrdnungsbereich.'],
'partialB':['UnternehmensberichtändertTransparenz/Zielbeobachtung,nichtnationalesEigentum/Wettbewerbskoordination/Steuerrecht.',
'Arbeitszeitdatabound, Umweltdatenprüfen.KundenkönntenAuswahlverändern,jedochnochkeinNettonutzen/landesweiterBeweis.',
'Instrumentkanninformieren, GegenpositionSelbstwerbung/Prüfaufwand; MessmethodeundUmweltnachweisfordern.NichtautomatischwertlosoderWohlstandgarantierend.'],
'grounds':['A1:alle3Regeldimensionen/Modellbehauptung.','A2:Anreiz/Prüfung/Verteilung.','A3:falscheLabels/eigenesundanderesUrteil.','B1:Regel-/FaktendatenFragment,nationaleUnterscheidungfalsch.','B2:Daten/KundengruppeFragment, Reichweitefalsch.','B3:Konzeption/Bericht/OrdnungganzfalschstattBedingtheit.']},
'f90e4741':{
'fullA':['36Stunden=30%Rückgang, verfügbarerBetriebkannmehrleisten.DasistkeinbelegterOutputjeInput/Mehrabsatz, weilOutput/Inputsnichtgemessen.',
'MitAbsatzundqualifizierterNutzungmehrverlässlicheProduktion/Service, ohneNachfrageLeerraum.NeueDatentätigkeitundandereArbeitszeitmöglich; keinzwingenderPersonalabbau.',
'6000SchulungundungleicheSkillchancenverändernVerteilung. Energie/MaterialdatenfürUmwelt, Vergleichsperioden/AbsatzfürErfolg.PrüfpilotalsGegenpositionvorschnellerAusweitung.'],
'weakB':['200−50=150 und80−50=30 Modellausgangsdifferenz; 300Ausleihenbeobachtet, realeWegeunbekannt.',
'DerDienstbeschäftigtReparaturen, HaushaltezahlenGebühren. Trotzdem300Nutzungen=300vermiedeneWerkzeuge, jederReparaturjobistautomatischNettoarbeitsgewinn.',
'Energie/Verteilung/Transportunwichtig,jedeInnovationbeweistWohlstand.'],
'partialA':['120→84 heißt36weniger/30%, verfügbareKapazitätaberMehrabsatzundProduktivitätnichtbelegt.',
'KundenprofitierenvonverlässlicherLeistungfallsnachgefragt, BeschäftigtebrauchenSkills; neueDatenrollen/alteTätigkeitenverändernsichnichtetwaalleweg.IchmesseNettoarbeitnicht.',
'Schulungkostet6000undZeit, ungleicheQualifikationwichtig.GegenpositionkleinerPilot; Umweltdatenfehlen.IchermittlekeinevollständigeKostenrendite.'],
'partialB':['Anfangsgerätevergleich150oder30modelliert,300Ausleihenkeine300Käufe.Realgegenverlaufistunbekannt.',
'Leihzugang/Herstellerabsatz/Reparaturarbeitverändernsichmöglicherweise, nettohängtNachfrage/Ersatz/anderenJobsein. GebührenkönnenarmHaushaltezutrittbegrenzen.',
'LanglebigkeitundtatsächlichersetzteKäufe/kurzeWegeKriterien; GegenpositionZusatzfahrten/ErsatzkönnenNutzenwenden.Nutzungsdauer/Energie/Verteilungprüfen;keinÖkoversprechen.'],
'grounds':['A1:36/30%undBefundgrenze.','A2:Kunden/Arbeits-/Nachfrageskills.','A3:Schulung/Verteilung/UmweltGegenposition.','B1:150/30/300Fragmente, tatsächlicheGrenzeverkehrt.','B2:Reparatur/GebührenFragment, Nettowirkungsanalysefalsch.','B3:Wohlstandsautomatismus stattBedingungen.']},
}
def readable(t):
 t=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',t)
 t=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)|(?<=\d)(?=[A-Za-zÄÖÜäöüß])',' ',t)
 return t
for w in W.values():
 for key,values in w.items():w[key]=[readable(t) for t in values]
weakScores={
 '43acb850':[4,4,4,2,2,0],'d22433a8':[4,4,4,2,2,0],
 '5ae551bf':[4,4,4,2,0,0],'f0b0a96f':[4,4,4,2,2,0],
 '2a8b5b56':[4,4,4,2,0,0],'1bddc795':[4,4,4,2,0,0],
 '648224f4':[4,4,4,1,2,0],'becf0989':[4,4,4,0,0,0],
 '7d4d7a90':[4,4,4,1,0,0],'1c92b15e':[4,4,4,1,1,0],
 'f7c051f4':[4,4,4,1,1,0],'f90e4741':[4,4,4,2,1,0]}
fairScores={
 '43acb850':[4,3,3,4,4,3],'d22433a8':[4,3,4,4,4,4],
 '5ae551bf':[4,4,3,4,4,3],'f0b0a96f':[4,4,4,4,4,3],
 '2a8b5b56':[4,4,3,4,4,3],'1bddc795':[3,3,4,3,3,4],
 '648224f4':[3,4,3,4,3,4],'becf0989':[4,3,3,4,4,3],
 '7d4d7a90':[4,3,3,4,3,4],'1c92b15e':[4,4,3,4,3,3],
 'f7c051f4':[4,4,3,4,4,3],'f90e4741':[4,3,3,4,4,4]}
fairShortfalls={
 '43acb850':['vollständig','Ownerwirkung gezeigt, verbleibende Lücke nicht ausdrücklich ausgeführt','Maßnahmen/Haftung gut; konkrete Übertragungskette knapper','vollständig','vollständig','Koordinationsausgestaltung knapp'],
 'd22433a8':['vollständig','Liquiditätshorizont knapper ausgeführt','vollständig','vollständig','vollständig','vollständig'],
 '5ae551bf':['vollständig','vollständig','Kalibrierung/Verteilung knapp','vollständig','vollständig','konkrete Ergänzung und Gegenposition knapp'],
 'f0b0a96f':['vollständig','vollständig','vollständig','vollständig','vollständig','Erfüllungsgrenze erkennbar, konkrete Folgen knapper'],
 '2a8b5b56':['vollständig','vollständig','Kosten je tragfähigem Ergebnis/Datenentscheidung knapper','vollständig','vollständig','langfristige Kofinanzierung/Betriebskosten knapper'],
 '1bddc795':['parlamentarische Kontrollzuordnung fehlt als Detail','knappe Verteilungsregel nicht vollständig konkretisiert','vollständig','P-Kontrolle nicht ausdrücklich erläutert','Alternative/Verantwortungszuordnung knapper','vollständig'],
 '648224f4':['Wechselwirkung zutreffend, Budgetkontrollkanal knapp','vollständig','Alternative/Gegenposition knapp ausgeführt','vollständig','Investitions-/Verteilungsrückwirkung knapp','vollständig'],
 'becf0989':['vollständig','eigener/gemeinsamer Strategieplan knapp','Veränderte Antworten korrekt; Beleg durch neue Auszahlungen knapp','vollständig','vollständig','fehlende reale Information/Glaubwürdigkeit knapper'],
 '7d4d7a90':['vollständig','Reaktionsart noch wenig konkret','Glaubwürdigkeit knapper als Kostenargument','vollständig','gemeinsame Auswahlbegründung knapper','vollständig'],
 '1c92b15e':['vollständig','vollständig','konkrete verfahrensbezogene Gegenposition knapper','vollständig','Maßstab zu nachgewiesenen überwiegenden Verbesserungen knapp','urteilsändernde Nachweise/Gegenposition knapper'],
 'f7c051f4':['vollständig','vollständig','eigenes Votum knapper begründet','vollständig','vollständig','tatsächliche Entscheidungs-/Wirkungsschwelle knapp'],
 'f90e4741':['vollständig','gesamtwirtschaftliche Diffusionswirkung knapp','Verteilung des Gewinns/Schulungsbelastung knapp','vollständig','vollständig','vollständig']}
bodyPath=O/'whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json'
B=json.loads(bodyPath.read_text())
work=[]
for m in B:
 prefix=m['requires'][0][:8];w=W[prefix]
 # Manual decisions are individual statements above. Raw16 genuinely passes15,
 # but sustained absence/contradiction of CaseB core caps the whole attempt14.
 grades=weakScores[prefix]
 work.append({'materialId':m['id'],'goalId':m['requires'][0],'kind':'whole-CaseA-plus-CaseB-core-bypass','wholeSubmission':{'caseA':w['fullA'],'caseB':w['weakB']},'manualRubricMarks':[{'stepId':'s'+str(i+1),'points':p,'maximum':4,'actualReason':w['grounds'][i]} for i,p in enumerate(grades)],'rawPoints':sum(grades),'actualCaseBCoreWhollyContradicted':True,'coreCapApplied':True,'finalPoints':min(14,sum(grades)),'passingPoints':15,'actualVerdict':'FAIL','AUTHORonly':True})
 # Fair work deliberately omits details indicated in the actual text, but shows
 # recognisable case-specific understanding on both genuinely different cases.
 pg=fairScores[prefix]
 work.append({'materialId':m['id'],'goalId':m['requires'][0],'kind':'whole-fair-partial-two-real-applications','wholeSubmission':{'caseA':w['partialA'],'caseB':w['partialB']},'manualRubricMarks':[{'stepId':'s'+str(i+1),'points':p,'maximum':4,'actualReason':fairShortfalls[prefix][i]+'. Erkennbare fallbezogene Leistung: '+(w['partialA']+w['partialB'])[i]} for i,p in enumerate(pg)],'rawPoints':sum(pg),'coreCapApplied':False,'finalPoints':sum(pg),'passingPoints':15,'actualVerdict':'PASS','AUTHORonly':True})
 # Whole omission of B creates no fresh independent application; no extra-task
 # quota, no all-correct requirement. First application remains fully credited.
 og=[4,4,4,0,0,0]
 work.append({'materialId':m['id'],'goalId':m['requires'][0],'kind':'whole-omitted-fresh-application','wholeSubmission':{'caseA':w['fullA'],'caseB':['Keine Bearbeitung.','Keine Bearbeitung.','Keine Bearbeitung.']},'manualRubricMarks':[{'stepId':'s'+str(i+1),'points':p,'maximum':4,'actualReason':w['grounds'][i] if i<3 else 'Es liegt keine abgegebene Leistung zum zweiten neuen Fall vor; keine Evidenz ergänzen.'} for i,p in enumerate(og)],'rawPoints':12,'coreCapApplied':True,'finalPoints':12,'passingPoints':15,'actualVerdict':'FAIL','AUTHORonly':True})
assert len(work)==36 and sum(len(w['manualRubricMarks']) for w in work)==216
assert all((w['actualVerdict']=='PASS')==(w['finalPoints']>=15) for w in work)
R={'role':'AUTHOR own complete works and individual manual grades, not foreign review','actualWholeWorkCount':36,'actualManualRubricMarkCount':216,'actualFairPartialPASS':12,'actualRawPassCoreBypassFAIL':sum(w['kind']=='whole-CaseA-plus-CaseB-core-bypass' and w['rawPoints']>=15 for w in work),'actualOtherCoreBypassFAIL':sum(w['kind']=='whole-CaseA-plus-CaseB-core-bypass' and w['rawPoints']<15 for w in work),'actualOmittedFreshApplicationFAIL':12,'wholeCandidateSHA256':hashlib.sha256(bodyPath.read_bytes()).hexdigest(),'works':work}
(O/'actual-own-thirty-six-whole-works-and216-manual-rubric-decisions.AUTHOR.json').write_text(json.dumps(R,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:R[k] for k in ('actualWholeWorkCount','actualManualRubricMarkCount','actualFairPartialPASS','actualRawPassCoreBypassFAIL','actualOmittedFreshApplicationFAIL')}))
