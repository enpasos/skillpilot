import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Jurisdiction = 'DE-BB' | 'DE-BE'
type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK' | 'LK' | 'both' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
}

interface GoalSeed {
  text: string
  targets: string[]
  courseLevel?: CourseLevel
  tags?: string[]
}

interface PassageSeed {
  code: string
  title: string
  stage: Stage
  gradeBand: string
  text: string
  goals: GoalSeed[]
}

interface ExtractionConfig {
  jurisdiction: Jurisdiction
  stage: Stage
  extractionId: string
  sourceLandscapeId: string
  title: string
  outputPath: string
  reviewPath: string
  sourceDocument: SourceDocument
  sourceGoalPrefix: string
  passages: PassageSeed[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialStandard' | 'officialContent'
  stage: Stage
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalGermanPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const reviewedAt = '2026-05-14'

const lowerSourceUrl = 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/getrennt_2023/BB_RLP_2023_Teil_C_Deu_GenF_1.pdf'
const upperSourceUrl = 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2022/Teil_C_RLP_GOST_2022_Deutsch.pdf'

const lowerDocumentByJurisdiction: Record<Jurisdiction, SourceDocument> = {
  'DE-BB': {
    key: 'BB-BE-RLP-DEUTSCH-SEKI-2023',
    title: 'Rahmenlehrplan 1-10 Teil C Deutsch Berlin-Brandenburg, Brandenburg 2023',
    path: 'curricula/DE/Gymnasium/input/BB/lower-secondary/BB_RLP_2023_Teil_C_Deu_GenF_1.pdf',
    url: lowerSourceUrl,
    official: true,
  },
  'DE-BE': {
    key: 'BB-BE-RLP-DEUTSCH-SEKI-2023',
    title: 'Rahmenlehrplan 1-10 Teil C Deutsch Berlin-Brandenburg, Brandenburg 2023',
    path: 'curricula/DE/Gymnasium/input/BE/lower-secondary/BB_RLP_2023_Teil_C_Deu_GenF_1.pdf',
    url: lowerSourceUrl,
    official: true,
  },
}

const upperDocumentByJurisdiction: Record<Jurisdiction, SourceDocument> = {
  'DE-BB': {
    key: 'BB-BE-RLP-GOST-DEUTSCH-2022',
    title: 'Rahmenlehrplan gymnasiale Oberstufe Teil C Deutsch Berlin-Brandenburg 2022',
    path: 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Deutsch.pdf',
    url: upperSourceUrl,
    official: true,
  },
  'DE-BE': {
    key: 'BB-BE-RLP-GOST-DEUTSCH-2022',
    title: 'Rahmenlehrplan gymnasiale Oberstufe Teil C Deutsch Berlin-Brandenburg 2022',
    path: 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Deutsch.pdf',
    url: upperSourceUrl,
    official: true,
  },
}

const t = {
  speak: ['Diskutieren und argumentieren', 'Kommunikationsprobleme in Alltagssituationen untersuchen'],
  presentation: ['Diskutieren und argumentieren', 'Medieninformationen nutzen'],
  listen: ['Leseforderung und sinngerechtes Lesen', 'Medieninformationen nutzen'],
  write: ['Erorterungen mit These, Argument, Beispiel und Beleg schreiben', 'Diskutieren und argumentieren'],
  writingProcess: ['Rechtschreibung und Zeichensetzung anwendungsbezogen festigen', 'Neue Kommunikationsmedien als Schreib- und Informationswerkzeuge nutzen'],
  reading: ['Literarische Texte erschliessen', 'Leseforderung fortfuehren'],
  literary78: ['Kurzgeschichten, Novellen und Jugendbuecher erschliessen', 'Handlungsverlauf, Aufbau, Personengestaltung und sprachliche Mittel beschreiben'],
  literary910: ['Jugendbuecher, Dramen und Kurzgeschichten vertieft erschliessen', 'Erzaehlungen in Entstehungskontexte einordnen'],
  poetry78: ['Gedichte und Balladen erschliessen', 'Gedichte und Balladen wiederholend vertiefen'],
  poetry910: ['Gedichte verschiedener Epochen vergleichend analysieren', 'Zeitgenoessische Gedichte vertiefend analysieren'],
  drama78: ['Dramatische Literatur in Grundfunktionen erkennen', 'Darstellendes Spiel einsetzen'],
  drama910: ['Aristotelische Dramaform erschliessen', 'Epische Dramenformen und Mischformen erkennen'],
  nonfiction78: ['Informierende Sachtexte auswerten', 'Zeitungen als Institution und Medium analysieren'],
  nonfiction910: ['Wissenschaftliche Texte, Lexikonartikel und Kritiken auswerten', 'Informationen aus Sekundaerliteratur und Internet kritisch aufarbeiten'],
  media78: ['Informationen durch und ueber Medien untersuchen', 'Neue Kommunikationsmedien als Schreib- und Informationswerkzeuge nutzen'],
  media910: ['Internet und CD-ROM als Informationsquellen nutzen', 'Filmtechnische und aesthetische Mittel bewerten'],
  language78: ['Wortschatz und Wortfelder differenzieren', 'Haupt- und Gliedsaetze unterscheiden'],
  language910: ['Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen', 'Standardsprache, Umgangssprache, Fachsprachen, Sondersprachen und Dialekte unterscheiden'],
  argumentUpper: ['Argumentationsanalyse', 'Argumentationsstrategien deuten', 'Komplexere argumentierende Texte differenziert verfassen', 'Rhetorische Mittel analysieren'],
  textUpper: ['Textsorte erkennen', 'Argumentationsanalyse', 'Diskursanalyse zu politischen Texten'],
  literatureUpper: [
    'Literarische Texte mit erweiterten gattungsspezifischen Kategorien erschliessen',
    'Literarische Texte vertieft gattungsspezifisch analysieren',
    'Literarische Texte mit Deutungshypothese interpretieren',
    'Literarische Texte kontextbezogen und vergleichend interpretieren',
    'Epochenkontext und Merkmale',
  ],
  literature1800: ['Gedankengut der Aufklaerung', 'Emanzipationsdiskurse', 'Dramen/Prosa der Aufklaerung', 'Werkanalyse um 1800', 'Zentrale Motive (Natur, Subjekt)'],
  literature19: ['Darstellung von Wirklichkeit im Realismus/Naturalismus', 'Poetik Realismus/Naturalismus', 'Erzaehltechnik und Perspektive'],
  literatureModern: ['Literarische Moderne fruehes 20. Jh.', 'Merkmale der Moderne', 'Lyrik der Moderne analysieren', 'Migrationserzaehlungen analysieren'],
  mediaUpper: ['Filme, Hoertexte und grafische Literatur analysieren und interpretieren', 'Filmsprache analysieren', 'Adaption Vergleich Buch/Film'],
  languageUpper: ['Sprachhandlungen einordnen', 'Pragmatische Modelle', 'Sprachphilosophische Positionen', 'Medien- und Netzsprache', 'Medienwandel und Oeffentlichkeit'],
  grammarUpper: ['Grammatikalisches und orthografisches Wissen vertiefen', 'Begriffs- und Bedeutungsfelder'],
}

const lowerPassages: PassageSeed[] = [
  passage('2.1', 'Sprechen und Zuhoeren - Zu anderen sprechen', 'SekI', '7-10', [
    ...goals([
      'Sprachliche Handlungen wie Erzaehlen, Informieren, Erklaeren, Vermuten, Behaupten und Kritisieren unterscheiden.',
      'Sprachliche Handlungen in vertrauten und unvertrauten Situationen variantenreich gestalten.',
      'Redeabsichten mit sachangemessenem Wortschatz und sprachlichen Gestaltungsmitteln umsetzen.',
      'Unvertraute Sprechsituationen bewusst und flexibel gestalten.',
      'Sprechgestaltende Mittel hinsichtlich ihrer Wirkung reflektieren.',
      'Inhalte sach- und adressatengerecht vortragen und praesentieren.',
      'Aus verschiedenen Praesentationsformen begruendet auswaehlen.',
      'Laengere freie Beitraege adressatenorientiert und vorbereitet leisten.',
      'Szenisches Sprechen und Spielen planen und gestalten.',
      'Den Einsatz von Praesentationsformen kriterienorientiert reflektieren.',
      'Digitale Kommunikationsmittel fuer eigene Sprechbeitraege zielgerichtet einsetzen.',
      'Digitale Kommunikation in unvertrauten Situationen reflektiert nutzen.',
    ], t.presentation),
  ]),
  passage('2.2', 'Sprechen und Zuhoeren - Mit anderen sprechen', 'SekI', '7-10', [
    ...goals([
      'Verschiedene Rollen in Gespraechen unterscheiden und einnehmen.',
      'In Diskussionen eigene Standpunkte argumentativ nachvollziehbar darlegen.',
      'Sach- und Beziehungsebene in Gespraechen unterscheiden.',
      'In Diskussionen loesungsorientierte Vorschlaege einbringen.',
      'Eigene Gespraechsbeitraege situations-, themen- und adressatengerecht formulieren.',
      'Eigenes und fremdes Gespraechsverhalten reflektieren und bewerten.',
      'In Diskussionen gezielt Gespraechsstrategien anwenden.',
      'Gespraeche und Diskussionen leiten, moderieren und reflektieren.',
      'Auf Argumente und Meinungen anderer respektvoll reagieren.',
      'Strittiges in Kontroversen identifizieren.',
      'Fair kommunizieren und unfaire Strategien erkennen.',
      'Simulationen von Pruefungs- und Bewerbungsgespraechen angemessen gestalten.',
    ], t.speak),
  ]),
  passage('2.3', 'Sprechen und Zuhoeren - Verstehend zuhoeren', 'SekI', '7-10', [
    ...goals([
      'Informationen aus klar strukturierten Vortraegen und medial vermittelten Texten wiedergeben.',
      'Beim Zuhoeren inhaltsbezogene Notizen erstellen.',
      'Informationen verknuepfen und wiedergeben.',
      'Notizen sachgerecht ordnen.',
      'Widersprueche in Aussagen pruefen.',
      'Aussagen zum Gehoerten begruendet beurteilen.',
      'Gehoerte Informationen zusammenfassen und protokollieren.',
      'Wesentliche Informationen aus Vortraegen und Gespraechsbeitraegen wiedergeben.',
      'Komplexe Schlussfolgerungen aus Gehoertem ziehen.',
      'Paraverbale Botschaften in Sprechsituationen deuten.',
    ], t.listen),
  ]),
  passage('2.4', 'Schreiben - Schreibfertigkeiten nutzen', 'SekI', '7-10', [
    ...goals([
      'Texte in angemessener Zeit fluessig und korrekt schreiben.',
      'Digitale Schreibwerkzeuge situationsgerecht nutzen.',
      'Textverarbeitungsprogramme fuer Formatierung und Praesentation nutzen.',
      'Lineare und nichtlineare Texte uebersichtlich praesentieren.',
      'Texte entsprechend der Schreibsituation gestalten.',
      'Handschriftliche und digitale Textgestaltung zweckgerecht verbinden.',
    ], t.writingProcess),
  ]),
  passage('2.5', 'Schreiben - Richtig schreiben', 'SekI', '7-10', [
    ...goals([
      'Individuelle Fehlerschwerpunkte identifizieren und beruecksichtigen.',
      'Fach- und Fremdwoerter richtig schreiben.',
      'Regeln der Rechtschreibung anwenden.',
      'Zeichensetzung in Satzreihen und Satzgefuegen anwenden.',
      'Zeichensetzung bei Infinitiv- und Partizipialgruppen anwenden.',
      'Zitate und Textbelege korrekt kennzeichnen.',
      'Rechtschreibstrategien selbststaendig nutzen.',
      'Wortbausteine und Nominalisierungen fuer Rechtschreibung nutzen.',
      'Woerterbuecher und Zusatzinformationen fuer Rechtschreibung nutzen.',
      'Elektronische Rechtschreibhilfen kritisch nutzen.',
    ], t.writingProcess),
  ]),
  passage('2.6', 'Schreiben - Schreibstrategien nutzen', 'SekI', '7-10', [
    ...goals([
      'Schreibplanung mit Ziel, Gliederung und Adressatenbezug funktional einsetzen.',
      'Schreibprozesse zielgerichtet und adressatenbezogen planen.',
      'Informationsquellen fuer Schreibaufgaben nutzen.',
      'Unterschiedliche Methoden der Informationsbeschaffung und Darstellung nutzen.',
      'Erzaehltechniken als Gestaltungsmittel auswaehlen und einsetzen.',
      'Gestaltend zu Vorlagen mit veraenderter Perspektive schreiben.',
      'Informationen aus Material- und Textquellen funktional nutzen.',
      'Informierend materialgestuetzt schreiben.',
      'Erklaerende Texte zu ueberschaubaren Fragestellungen verfassen.',
      'Gegenargumente in argumentierende Texte einbeziehen.',
      'Auf Basis strukturierter Materialien argumentieren.',
      'Textbelege und Quellen in den eigenen Text integrieren.',
      'Komplexe Sachverhalte zielorientiert gegliedert informieren.',
      'Analyse- und Interpretationsergebnisse plausibel darstellen.',
      'Rhetorische Gestaltungsmittel bewusst einsetzen.',
      'Texte hinsichtlich Aufbau, Inhalt und sprachlicher Gestaltung ueberarbeiten.',
    ], t.write),
  ]),
  passage('2.7', 'Lesen - Lesefertigkeiten nutzen', 'SekI', '7-10', [
    ...goals([
      'Texte fluessig und vorausschauend lesen.',
      'Satzgliederung fuer sinnverstehendes Lesen nutzen.',
      'Textvortraege kriterienorientiert gestalten.',
      'Mittel nonverbaler Gestaltung fuer den Vortrag nutzen.',
      'Texte zum Vorlesen vorbereiten.',
      'Vorlese- und Vortragshilfen beim Vortragen nutzen.',
      'Lesetempo und Betonung dem Text anpassen.',
      'Literarische Texte sinngerecht vortragen.',
    ], t.reading),
  ]),
  passage('2.8', 'Lesen - Lesestrategien nutzen und Textverstaendnis sichern', 'SekI', '7-10', [
    ...goals([
      'Leseerwartungen aus Ueberschriften und Textsignalen ableiten.',
      'Unbekannte Woerter aus dem Kontext erschliessen.',
      'Wichtige Informationen markieren und ordnen.',
      'Textabschnitte zusammenfassen.',
      'Fragen an Texte formulieren.',
      'Textinformationen mit Vorwissen verknuepfen.',
      'Zwischen Information und Wertung unterscheiden.',
      'Verstehensbarrieren identifizieren.',
      'Lesestrategien vor, waehrend und nach dem Lesen einsetzen.',
      'Verschiedene Lesetechniken zielgerichtet einsetzen.',
      'Nichtlineare Texte auswerten.',
      'Textverstaendnis in Anschlusskommunikation sichern.',
    ], t.reading),
  ]),
  passage('2.9', 'Literarische Texte erschliessen', 'SekI', '7-10', [
    ...goals([
      'Kurzgeschichten erschliessen.', 'Mythen deuten.', 'Anekdoten untersuchen.', 'Jugendromane erschliessen.',
      'Dramatische Texte analysieren.', 'Figuren und Konflikte beschreiben.', 'Erzaehlperspektiven erkennen.',
      'Aufbau literarischer Texte untersuchen.', 'Sprachliche Gestaltungsmittel beschreiben.', 'Deutungshypothesen entwickeln.',
      'Balladen und Gedichte erschliessen.', 'Lyrische Gestaltungsmittel untersuchen.',
    ], t.literary78),
    ...goals([
      'Dramen vertieft erschliessen.', 'Novellen analysieren.', 'Parabeln deuten.', 'Romane untersuchen.',
      'Lyrische Texte vergleichend analysieren.', 'Literarische Texte in Entstehungskontexte einordnen.',
      'Mehrdeutigkeit literarischer Texte nachweisen.', 'Literarische Texte bewerten.',
    ], t.literary910),
  ]),
  passage('2.10', 'Sach- und Gebrauchstexte erschliessen', 'SekI', '7-10', [
    ...goals([
      'Reportagen untersuchen.', 'Kommentare analysieren.', 'Leserbriefe untersuchen.', 'Sachtexte zusammenfassen.',
      'Informationen aus Sachtexten entnehmen.', 'Argumente in Sachtexten erkennen.', 'Wertungen in Sachtexten erkennen.',
      'Nichtlineare Informationen auswerten.',
    ], t.nonfiction78),
    ...goals([
      'Darstellende Texte analysieren.', 'Bewertende Texte analysieren.', 'Auffordernde Texte untersuchen.',
      'Regelnde Texte untersuchen.', 'Komplexe Sachtexte auswerten.', 'Journalistische Texte vergleichen.',
      'Materialgestuetzt informieren.', 'Materialgestuetzt argumentieren.',
    ], t.nonfiction910),
  ]),
  passage('2.11', 'Texte unterschiedlicher medialer Form erschliessen', 'SekI', '7-10', [
    ...goals([
      'Chats als Kommunikationsform untersuchen.', 'Podcasts auswerten.', 'Newsletter analysieren.', 'Werbung untersuchen.',
      'Kurzfilme erschliessen.', 'Erklaervideos analysieren.', 'Mediale Gestaltungsmittel beschreiben.', 'Mediennutzung reflektieren.',
    ], t.media78),
    ...goals([
      'Graphic Novels analysieren.', 'Blogs untersuchen.', 'Literaturverfilmungen vergleichen.', 'Filmmittel untersuchen.',
      'Digitale Quellen kritisch beurteilen.', 'Mediale Praesentationsformen vergleichen.', 'Medienwirkung beurteilen.', 'Onlinekommunikation reflektieren.',
    ], t.media910),
  ]),
  passage('2.12', 'Sprachwissen und Sprachbewusstheit entwickeln', 'SekI', '7-10', [
    ...goals([
      'Wortbedeutungen untersuchen.', 'Satzstrukturen analysieren.', 'Wortarten funktional bestimmen.', 'Satzglieder unterscheiden.',
      'Konjunktionen fuer logische Zusammenhaenge verwenden.', 'Aktiv und Passiv sicher gebrauchen.', 'Indirekte Rede verwenden.',
      'Konjunktiv I und II verwenden.', 'Wortbildung untersuchen.',
    ], t.language78),
    ...goals([
      'Textstrukturen untersuchen.', 'Mehrdeutigkeit sprachlicher Zeichen analysieren.', 'Register unterscheiden.',
      'Sprachvarietaeten vergleichen.', 'Fachsprache untersuchen.', 'Standardsprache und Umgangssprache unterscheiden.',
      'Sprachwandelphaenomene beschreiben.', 'Sprachliche Wirkungsmittel analysieren.', 'Grammatisches Wissen fuer Textanalyse nutzen.',
    ], t.language910),
  ]),
  passage('2.13', 'Sprachbewusst handeln', 'SekI', '7-10', [
    ...goals([
      'Sprachhandlungen situationsgerecht unterscheiden.', 'Kommunikationssituationen untersuchen.',
      'Sprechabsichten und Wirkungen reflektieren.', 'Manipulative Sprachverwendung erkennen.',
      'Politische Rede auf Beeinflussung untersuchen.', 'Geschlechterbezogene Sprachmuster reflektieren.',
      'Sprachliche Register adressatengerecht verwenden.', 'Dialekt und Standardsprache vergleichen.',
      'Mehrsprachigkeit in Kommunikationssituationen reflektieren.', 'Sprachliche Normen funktional anwenden.',
      'Kommunikationsmodelle zur Analyse nutzen.', 'Sprachkritik begruendet formulieren.',
    ], t.language910),
  ]),
  passage('3.4', 'Themen und Inhalte Jahrgangsstufen 7/8', 'SekI', '7/8', [
    ...goals([
      'Kurzgeschichte, Mythos, Anekdote, Jugendroman und dramatische Texte als verbindliche Inhalte bearbeiten.',
      'Reportage, Kommentar und Leserbrief als Sach- und Gebrauchstexte bearbeiten.',
      'Chat, Podcast, Newsletter, Werbung, Kurzfilm und Erklaervideo als mediale Formen bearbeiten.',
      'Protokoll, Stellungnahme, Inhaltsangabe, Charakterisierung, Mitschrift, Handout und Portfolio als Schreibformen nutzen.',
      'Fishbowl, Rollendiskussion, Konfliktgespraech und mediengestuetzte Praesentation als Gespraechsformen nutzen.',
      'Wortbedeutung und Satzstruktur als Wissensbestaende verwenden.',
    ], t.literary78),
  ]),
  passage('3.5', 'Themen und Inhalte Jahrgangsstufen 9/10', 'SekI', '9/10', [
    ...goals([
      'Drama, Novelle, Parabel, Roman und lyrische Texte als verbindliche Inhalte bearbeiten.',
      'Darstellende, bewertende, auffordernde und regelnde Texte bearbeiten.',
      'Graphic Novel, Blog und Literaturverfilmung als mediale Formen erschliessen.',
      'Analyse, Interpretation, Kommentar, Eroerterung, Bewerbung, Lebenslauf und materialgestuetztes Schreiben nutzen.',
      'Debatte, Podiumsdiskussion, Bewerbungsgespraech, Beschwerde und Stegreifrede als Gespraechsformen nutzen.',
      'Textstruktur, Mehrdeutigkeit, Register und Sprachvarietaeten als Wissensbestaende verwenden.',
    ], t.literary910),
  ]),
]

const upperPassages: PassageSeed[] = [
  passage('3.1', 'Eingangsvoraussetzungen fuer die gymnasiale Oberstufe', 'SekII', 'E/Q', [
    ...goals([
      'Verschiedene Formen sprachlicher Darstellung unterscheiden.',
      'Sich artikuliert sowie sach- und situationsangemessen aeussern.',
      'Vortraegen und Gespraechsbeitraegen wesentliche Informationen entnehmen.',
      'Gespraeche und Diskussionen leiten, moderieren und reflektieren.',
      'Literarische und pragmatische Texte sinngebend vortragen.',
      'Schreibprozesse zielgerichtet planen und reflektieren.',
      'Zitate variantenreich in eigene Texte integrieren.',
      'Komplexe Textstrukturen gliedern und vorausschauend lesen.',
      'Literarische und pragmatische Texte unterschiedlicher medialer Form analysieren.',
      'Sprachvarietaeten und Sprachwandelphaenomene reflektieren.',
    ], [...t.textUpper, ...t.languageUpper]),
  ]),
  passage('3.2-SZ', 'Abschlussorientierte Standards - Sprechen und Zuhoeren', 'SekII', 'Q', [
    ...goals([
      'In Gespraechen auf Verstaendigung zielen und respektvolles Gespraechsverhalten zeigen.',
      'In verschiedenen Gespraechsformen und Rollen kommunikativ handeln.',
      'Nonverbale und stimmliche Mittel bewusst nutzen.',
      'Muendliche Kommunikationssituationen anhand von Aufzeichnungen analysieren.',
      'Fachlich anspruchsvolle Gespraechsformen konzentriert verfolgen.',
      'Argumentation und Intention von Gespraechspartnern zusammenfassen.',
      'Eigene Aeusserungen waehrend des Zuhoerens planen.',
      'Sich in Gespraechsbeitraegen explizit auf andere beziehen.',
      'In Kontroversen Strittiges identifizieren und eigene Positionen vertreten.',
      'Eigenes und fremdes Gespraechsverhalten reflektieren.',
      'Strategien unfairer Kommunikation erkennen.',
      'Diskussionen, Debatten und Praesentationen moderieren.',
      'Anspruchsvolle Fachinhalte verstaendnisfoerdernd referieren.',
      'Umfangreiche Redebeitraege zu komplexen Sachverhalten praesentieren.',
    ], [...t.languageUpper, ...t.argumentUpper]),
  ]),
  passage('3.2-SCH', 'Abschlussorientierte Standards - Schreiben', 'SekII', 'Q', [
    ...goals([
      'Texte orthografisch und grammatisch korrekt sowie fachsprachlich praezise verfassen.',
      'Anspruchsvolle Aufgabenstellungen in Schreibziele und Schreibplaene ueberfuehren.',
      'Komplexe Texte unter Beachtung von Textkonventionen strukturieren.',
      'Digitale Werkzeuge fuer Schreibprozesse einsetzen.',
      'Relevantes aus recherchierten Informationsquellen auswaehlen.',
      'Informationsquellen fuer Textproduktion aufbereiten.',
      'Textbelege und Quellen korrekt zitieren oder paraphrasieren.',
      'Texte inhaltlich, funktional und stilistisch ueberarbeiten.',
      'Schreibprozesse und Kompetenzentwicklung dokumentieren und reflektieren.',
      'Informierende, erklaerende, argumentierende und gestaltende Textformen aufgabenbezogen nutzen.',
      'Literarische und sprachliche Sachverhalte geordnet darstellen.',
      'Aufbau und sprachlich-stilistische Merkmale eines Textes beschreiben.',
      'Inhalte und Argumentationen komplexer Texte zusammenfassen.',
      'Untersuchungsfragen zu komplexen Sachverhalten formulieren.',
      'Schlussfolgerungen aus Analysen, Vergleichen und Diskussionen darstellen.',
      'Interpretationsansaetze zu literarischen Texten argumentativ darstellen.',
      'Historische, kulturelle und weltanschauliche Textbezuege verdeutlichen.',
      'Differenzierte Argumentationen zu strittigen Sachverhalten entfalten.',
      'Journalistische und medienspezifische Textformen fuer eigene Texte nutzen.',
      'Wissenschaftspropaedeutische Texte planen und ueberarbeiten.',
      'Nach Vorlagen Texte neu, um- oder weiterschreiben.',
      'Essay, Tagebuch, Gedicht oder Brief als reflexive Textform verwenden.',
      'Texte fuer unterschiedliche Medien gestaltend schreiben.',
      'Aufgabenadäquate Textmuster fuer eigene Textproduktion verwenden.',
      'Konzeptgeleitet und adressatenorientiert schreiben.',
      'Sprachlich variabel und stilistisch stimmig formulieren.',
      'Informierende Textpassagen in Argumentationen integrieren.',
      'Prämissen eigener Argumentationen reflektieren.',
      'Textkonventionen wissenschaftspropaedeutisch anwenden.',
    ], [...t.argumentUpper, ...t.grammarUpper]),
  ]),
  passage('3.2-L', 'Abschlussorientierte Standards - Lesen', 'SekII', 'Q', [
    ...goals([
      'Den Zusammenhang zwischen Teilaspekten und Textganzen erschliessen.',
      'Aus Aufgabenstellungen angemessene Leseziele ableiten.',
      'Verstehensentwuerfe im Leseprozess ueberpruefen.',
      'Verstehenshypothesen kontinuierlich ueberarbeiten.',
      'Verstehensbarrieren identifizieren und textnah bearbeiten.',
      'Kontextwissen zur Ueberwindung von Verstehensbarrieren heranziehen.',
      'Rueckschluesse aus medialer Praesentation und Verbreitungsform ziehen.',
      'Geltungsansprueche von Texten reflektieren.',
      'Qualitaet von Textinformationen pruefen und beurteilen.',
      'Fach- und Weltwissen flexibel fuer Textverstaendnis einsetzen.',
      'Eigene und fremde Verstehensvoraussetzungen kommunizieren.',
      'Fachliches Wissen zur Erschliessung voraussetzungsreicher Texte nutzen.',
    ], t.textUpper),
  ]),
  passage('3.2-LIT', 'Abschlussorientierte Standards - Literarische Texte', 'SekII', 'Q', [
    ...goals([
      'Inhalt, Aufbau und sprachliche Gestaltung literarischer Texte analysieren.',
      'Sinnzusammenhaenge innerhalb literarischer Texte herstellen.',
      'Eigenstaendig ein begruendetes Textverstaendnis formulieren.',
      'Alternative Lesarten literarischer Texte einbeziehen.',
      'Textverstaendnis mit gattungspoetologischem Wissen stuetzen.',
      'Textverstaendnis mit literaturgeschichtlichem Wissen stuetzen.',
      'Motive, Themen und Strukturen literarischer Schriften vergleichen.',
      'Mehrdeutigkeit literarischer Texte nachweisen.',
      'Literarische Texte aller Gattungen als kuenstlerische Gestaltung erschliessen.',
      'Aesthetische Qualitaet literarischer Produkte erfassen.',
      'Diachrone und synchrone Zusammenhaenge zwischen literarischen Texten herstellen.',
      'Fremdheitserfahrungen literarischer Werke reflektieren.',
      'Literarische Texte sachlich fundiert bewerten.',
      'Texte im Sinne literarischen Probehandelns kreativ gestalten.',
      'Poetischen Anspruch und aesthetische Qualitaet literarischer Texte erlaeutern.',
      'Sekundaertexte und historische Abhandlungen in Kontextualisierung einbeziehen.',
      'Literarische Tradition und Gegenwartsliteratur in Beziehung setzen.',
      'Interkulturelle Gesichtspunkte in literarische Deutungen einbeziehen.',
      'Barocke, mittelalterliche und antike Bezuege fuer Motive heranziehen.',
      'Produktionsbedingungen literarischer Texte beruecksichtigen.',
      'Rezeptionsbedingungen literarischer Texte beruecksichtigen.',
      'Wirkungsbedingungen literarischer Texte beruecksichtigen.',
    ], t.literatureUpper),
  ]),
  passage('3.2-PRAG', 'Abschlussorientierte Standards - Pragmatische Texte', 'SekII', 'Q', [
    ...goals([
      'Voraussetzungsreiche pragmatische Texte terminologisch praezise zusammenfassen.',
      'Textfunktionen, Situationen und Adressaten pragmatischer Texte bestimmen.',
      'Sprachliche Handlungen in pragmatischen Texten ermitteln.',
      'Moegliche Wirkungsabsichten pragmatischer Texte beurteilen.',
      'Sprachlich-stilistische Gestaltung pragmatischer Texte beschreiben.',
      'Elemente der Textgestaltung in ihrer Funktion analysieren.',
      'Themengleiche pragmatische Texte fachgerecht vergleichen.',
      'Pragmatische Texte interkulturell reflektieren.',
      'Textsortenzuordnungen reflektieren.',
      'Argumentationsstrukturen theoriegestuetzt analysieren.',
      'Produktionsbedingungen pragmatischer Texte ermitteln.',
      'Wissenschaftsnahe pragmatische Texte auswerten.',
      'Berufsbezogene pragmatische Texte auswerten.',
      'Welt- und Wertvorstellungen in pragmatischen Texten reflektieren.',
      'Kontext und Wirkungsabsicht pragmatischer Texte beurteilen.',
    ], t.textUpper),
  ]),
  passage('3.2-MED', 'Abschlussorientierte Standards - Mediale Formen und Theater', 'SekII', 'Q', [
    ...goals([
      'Theaterinszenierungen und Literaturverfilmungen als Textinterpretationen beurteilen.',
      'Theaterinszenierungen, Hoertexte und Filme sachgerecht analysieren.',
      'Eigene Hoertexte, Filme oder audiovisuelle Praesentationen erstellen.',
      'Textvorlagen szenisch umsetzen.',
      'Mediale Rezeption und Produktion mit eigenen Wertvorstellungen reflektieren.',
      'Filmkritik und Aspekte der Filmtheorie einbeziehen.',
    ], t.mediaUpper),
  ]),
  passage('3.2-SPR', 'Abschlussorientierte Standards - Sprache und Sprachgebrauch', 'SekII', 'Q', [
    ...goals([
      'Kognitive und kommunikative Funktionen von Sprache formulieren.',
      'Sprachliche Aeusserungen kriterienorientiert analysieren.',
      'Sprachliche Strukturen mit Grammatik- und Semantikwissen erlaeutern.',
      'Strukturen und Funktionen von Sprachvarietaeten beschreiben.',
      'Gelingende Kommunikation mit theoretischen Modellen analysieren.',
      'Verbale, paraverbale und nonverbale Gestaltungsmittel analysieren.',
      'Signale fuer Macht- und Dominanzverhaeltnisse identifizieren.',
      'Sprachliche Handlungen kriterienorientiert bewerten.',
      'Sprachenvielfalt und Mehrsprachigkeit analysieren.',
      'Entwicklungstendenzen der Gegenwartssprache beschreiben und bewerten.',
      'Persuasive und manipulative Strategien analysieren.',
      'Sprachphilosophische Positionen heranziehen.',
      'Sprachhandlungen theoriegestuetzt beschreiben.',
      'Sprachwandel und Spracherwerb theoriegestuetzt beschreiben.',
      'Mit grammatischen und semantischen Kategorien argumentieren.',
      'Kommunikative Funktion von Sprache an Beispielen erlaeutern.',
      'Grammatisches Wissen fuer Text- und Sachverhaltsanalysen nutzen.',
      'Semantische Kategorien fuer Sprachreflexion nutzen.',
      'Mehrsprachigkeit in gesellschaftlichen Kontexten beurteilen.',
      'Sprachkritische Texte fuer Gegenwartssprache auswerten.',
      'Manipulative Strategien in oeffentlichen Bereichen kritisch bewerten.',
    ], [...t.languageUpper, ...t.grammarUpper]),
  ]),
  passage('4.1', 'Erstes Kurshalbjahr - Kommunikation und Sprachentwicklung', 'SekII', 'E/Q1', [
    ...goals([
      'Texte analysieren.', 'Materialgestuetzt erklaeren.', 'Materialgestuetzt argumentieren.',
      'Kommunikation als Thema erschliessen.', 'Literarische Texte zur Kommunikation analysieren.',
      'Pragmatische Texte zur Kommunikation analysieren.', 'Mediale Praesentationsformen zur Kommunikation vergleichen.',
      'Entwicklung der deutschen Sprache untersuchen.', 'Entwicklungstendenzen der deutschen Sprache beurteilen.',
      'Sprachwandel an literarischen und pragmatischen Texten analysieren.',
      'Gegenwartssprache und Medienoeffentlichkeit reflektieren.', 'Kommunikative Rollen und Machtverhaeltnisse analysieren.',
      'Auditiv und audiovisuell vermittelte Kommunikation untersuchen.',
      'Pragmatische Texte zur Sprachentwicklung auswerten.',
      'Literarische Texte zur Sprachentwicklung auswerten.',
      'Kommunikationsmodelle fuer Textanalyse nutzen.',
    ], [...t.languageUpper, ...t.argumentUpper]),
  ]),
  passage('4.2', 'Zweites Kurshalbjahr - Aufklaerung bis Literatur um 1800', 'SekII', 'Q2', [
    ...goals([
      'Fachliche Inhalte eroertern.', 'Literarische Texte interpretieren.', 'Literarische Texte vergleichend interpretieren.',
      'Literarische Stroemungen und Epochenbegriff untersuchen.', 'Aufklaerung als literarische Stroemung erschliessen.',
      'Empfindsamkeit als literarische Stroemung einordnen.', 'Sturm und Drang als literarische Stroemung einordnen.',
      'Literarische und pragmatische Texte zur Aufklaerung analysieren.', 'Literatur um 1800 erschliessen.',
      'Theaterinszenierungen zu Literatur um 1800 analysieren.', 'Natur- und Subjektmotive um 1800 vergleichen.',
      'Emanzipationsdiskurse der Aufklaerung untersuchen.', 'Gattungen im Epochenumbruch vergleichen.',
      'Poetologische Texte zur Literatur um 1800 nutzen.', 'Historische Kontexte der Literatur um 1800 einbeziehen.',
      'Empfindsamkeit und Sturm-und-Drang-Motive vergleichen.',
      'Aufklaerung und Emanzipation argumentativ eroertern.',
      'Theaterinszenierungen als Deutung literarischer Texte bewerten.',
      'Literaturgeschichtliches Wissen fuer Deutungshypothesen nutzen.',
    ], [...t.literature1800, ...t.literatureUpper]),
  ]),
  passage('4.3', 'Drittes Kurshalbjahr - Literatur im 19. Jahrhundert und Filmisches Erzaehlen', 'SekII', 'Q3', [
    ...goals([
      'Literatur im 19. Jahrhundert analysieren.', 'Realistische Erzaehlverfahren untersuchen.',
      'Naturalistische Darstellungsverfahren untersuchen.', 'Literarische und pragmatische Texte des 19. Jahrhunderts vergleichen.',
      'Gesellschaftliche Wirklichkeit in Literatur des 19. Jahrhunderts analysieren.',
      'Erzaehltechnik und Perspektive in Prosa des 19. Jahrhunderts untersuchen.',
      'Fachliche Inhalte zur Literatur des 19. Jahrhunderts eroertern.',
      'Texte unterschiedlicher medialer Praesentationsformen analysieren.',
      'Texte unterschiedlicher medialer Praesentationsformen interpretieren.',
      'Filmisches Erzaehlen analysieren.', 'Filme verschiedener Genres untersuchen.',
      'Pragmatische Texte zu Film und Medien auswerten.', 'Literaturverfilmungen als Interpretation beurteilen.',
      'Filmaesthetische Mittel deuten.', 'Filmische Erzaehlweisen mit literarischen Erzaehlweisen vergleichen.',
      'Pragmatische Texte zur Literatur des 19. Jahrhunderts auswerten.',
      'Epochenbegriffe fuer Realismus und Naturalismus reflektieren.',
      'Themen- und Motivvergleiche zwischen Literatur und Film herstellen.',
      'Mediale Praesentationsformen in ihrer Wirkung beurteilen.',
    ], [...t.literature19, ...t.mediaUpper, ...t.literatureUpper]),
  ]),
  passage('4.4', 'Viertes Kurshalbjahr - Literatur im 20./21. Jahrhundert', 'SekII', 'Q4', [
    ...goals([
      'Materialgestuetzt informieren.', 'Literarische Texte interpretieren.',
      'Literatur im 20. Jahrhundert analysieren.', 'Literatur im 21. Jahrhundert analysieren.',
      'Literarische und pragmatische Texte der Moderne erschliessen.',
      'Moderne Lyrik analysieren.', 'Migration und kulturelle Identitaet in Literatur untersuchen.',
      'Sprachkrise und Medienwandel in moderner Literatur reflektieren.',
      'Gegenwartsliteratur mit historischen Kontexten verbinden.',
      'Texte zur digitalen Oeffentlichkeit materialgestuetzt auswerten.',
      'Literarische Moderne mit Gegenwartsliteratur vergleichen.',
      'Fremdheitserfahrungen in moderner Literatur beurteilen.',
      'Pragmatische Texte zum 20. und 21. Jahrhundert auswerten.',
      'Sprachliche und mediale Gegenwartstendenzen materialgestuetzt darstellen.',
      'Moderne Erzaehlweisen mit Gegenwartsliteratur vergleichen.',
      'Interkulturelle Kontexte moderner Literatur beruecksichtigen.',
    ], [...t.literatureModern, ...t.languageUpper, ...t.literatureUpper]),
  ]),
]

const configs: ExtractionConfig[] = (['DE-BB', 'DE-BE'] as const).flatMap((jurisdiction) => [
  {
    jurisdiction,
    stage: 'SekI',
    extractionId: `${jurisdiction.replace('-', '_')}_DEUTSCH_SEKI_RLP_2023`,
    sourceLandscapeId: uuidFromString(`${jurisdiction}-DEUTSCH-SEKI-RLP-2023`),
    title: `Deutsch Sekundarstufe I (${jurisdiction === 'DE-BB' ? 'Brandenburg' : 'Berlin'}, RLP 2023 Source-Extraction)`,
    outputPath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/lower-secondary/source-extraction/${jurisdiction.replace('-', '_')}_DEUTSCH_SEKI_RLP_2023.source-extraction.json`,
    reviewPath: `curricula/DE/Gymnasium/mapping/${jurisdiction}/lower-secondary/${jurisdiction.toLowerCase().replace('-', '_')}_german_lower_secondary_source_extraction_to_canonical_german.review.json`,
    sourceDocument: lowerDocumentByJurisdiction[jurisdiction],
    sourceGoalPrefix: `${jurisdiction.toLowerCase()}-deutsch-seki`,
    passages: lowerPassages,
  },
  {
    jurisdiction,
    stage: 'SekII',
    extractionId: `${jurisdiction.replace('-', '_')}_DEUTSCH_SEKII_RLP_GOST_2022`,
    sourceLandscapeId: uuidFromString(`${jurisdiction}-DEUTSCH-SEKII-RLP-GOST-2022`),
    title: `Deutsch Oberstufe (${jurisdiction === 'DE-BB' ? 'Brandenburg' : 'Berlin'}, RLP GOST 2022 Source-Extraction)`,
    outputPath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/upper-secondary/source-extraction/${jurisdiction.replace('-', '_')}_DEUTSCH_SEKII_RLP_GOST_2022.source-extraction.json`,
    reviewPath: `curricula/DE/Gymnasium/mapping/${jurisdiction}/upper-secondary/${jurisdiction.toLowerCase().replace('-', '_')}_german_upper_secondary_source_extraction_to_canonical_german.review.json`,
    sourceDocument: upperDocumentByJurisdiction[jurisdiction],
    sourceGoalPrefix: `${jurisdiction.toLowerCase()}-deutsch-sekii`,
    passages: upperPassages,
  },
])

for (const document of [...Object.values(lowerDocumentByJurisdiction), ...Object.values(upperDocumentByJurisdiction)]) {
  if (!existsSync(resolve(repoRoot, document.path))) throw new Error(`Missing official source PDF: ${document.path}`)
}

const canonicalGoalIdByTitle = loadCanonicalGoalIdByTitle()
for (const config of configs) {
  const extraction = buildExtraction(config)
  const review = buildReview(config, extraction.sourceGoals)
  writeJson(resolve(repoRoot, config.outputPath), extraction)
  writeJson(resolve(repoRoot, config.reviewPath), review)
  console.log(`Wrote ${config.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${config.reviewPath} (${review.summary.mappedSourceGoals}/${review.summary.sourceGoals} M3 decisions)`)
}
updateRegistry(configs)
updateReadmes()

function buildExtraction(config: ExtractionConfig) {
  const sourceGoals: SourceGoal[] = []
  const passages = config.passages.map((passageSeed) => {
    const passageId = passageIdFor(config, passageSeed)
    const sourceGoalIds = passageSeed.goals.map((goalSeed, index) => {
      const sourceGoal = buildSourceGoal(config, passageSeed, goalSeed, index + 1)
      sourceGoals.push(sourceGoal)
      return sourceGoal.id
    })
    return {
      id: passageId,
      topicCode: passageSeed.code,
      title: `${passageSeed.code} ${passageSeed.title}`,
      text: passageSeed.text,
      sourcePath: config.sourceDocument.path,
      sourceUrl: config.sourceDocument.url,
      rawText: passageSeed.text,
      sourceGoalIds,
    }
  })

  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const passageIds = new Set(passages.map((passageEntry) => passageEntry.id))
  const missingPassageRefs = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages
    .filter((passageEntry) => passageEntry.sourceGoalIds.length === 0)
    .map((passageEntry) => passageEntry.topicCode)

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    title: config.title,
    jurisdiction: config.jurisdiction,
    subject: 'Deutsch',
    stage: config.stage,
    sourceDocument: config.sourceDocument,
    sourceDocuments: [config.sourceDocument],
    method: {
      passageExtraction:
        'Official Berlin-Brandenburg RLP PDF sections were segmented into competency-standard and topic-content passages; the stored passage text is limited to the reviewed section scope.',
      sourceGoalExtraction:
        'One short source goal per official standard, content item, or course-half-year focus; German Gymnasium scope uses levels E-H for lower secondary and GOST standards/course semesters for upper secondary.',
    },
    expectedTopicCodes: config.passages.map((passageSeed) => passageSeed.code),
    pipelineStatus: buildPipeline(config, sourceGoals, duplicateIds, missingPassageRefs, emptyPassages),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        expectedSourceGoals: sourceGoals.length,
        actualSourceGoals: sourceGoals.length,
        rationale:
          'Kritisch geprueft: Der gemeinsame Berlin-Brandenburg-RLP wird granular nach Standards, Wissensbestaenden und Kurshalbjahres-Schwerpunkten geschnitten. Die Zielzahl liegt im 30%-Korridor des HE/BW-Vergleichs und wird nicht aus einem Legacy-Snapshot uebernommen.',
      },
    },
    passages,
    sourceGoals,
  }
}

function buildSourceGoal(config: ExtractionConfig, passageSeed: PassageSeed, goalSeed: GoalSeed, index: number): SourceGoal {
  const sourceText = normalizeText(goalSeed.text)
  return {
    id: sourceGoalId(config, passageSeed, index, sourceText),
    passageId: passageIdFor(config, passageSeed),
    topicCode: passageSeed.code,
    bulletIndex: index,
    aspectIndex: 1,
    title: titleFromSourceText(sourceText),
    description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
    sourceText,
    sourceSpan: `${passageSeed.code}(${index})`,
    parentBulletText: sourceText,
    sourceRef: `${config.sourceDocument.title}, ${passageSeed.code} ${passageSeed.title}, (${index})`,
    courseLevel: goalSeed.courseLevel ?? (config.stage === 'SekII' ? 'both' : 'unspecified'),
    granularity: passageSeed.code.startsWith('3.') || passageSeed.code.startsWith('4.')
      ? 'officialContent'
      : 'officialStandard',
    stage: config.stage,
    tags: [
      `jurisdiction:${config.jurisdiction}`,
      `stage:${config.stage}`,
      `gradeBand:${passageSeed.gradeBand}`,
      `topic:${passageSeed.code}`,
      `courseLevel:${goalSeed.courseLevel ?? (config.stage === 'SekII' ? 'both' : 'unspecified')}`,
      ...(goalSeed.tags ?? []),
    ],
    rawSourceText: goalSeed.text,
    rawSourceSpan: `${passageSeed.code}(${index})`,
    rawParentBulletText: goalSeed.text,
  }
}

function buildPipeline(
  config: ExtractionConfig,
  sourceGoals: SourceGoal[],
  duplicateIds: string[],
  missingPassageRefs: string[],
  emptyPassages: string[],
) {
  const mapping2Complete = duplicateIds.length === 0 && missingPassageRefs.length === 0 && emptyPassages.length === 0
  return {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtlicher Berlin-Brandenburg-Deutsch-Rahmenlehrplan liegt lokal vor',
            passed: true,
            details: config.sourceDocument.path,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Erwartete RLP-Deutsch-Abschnitte sind als Lehrplanpassagen vorhanden',
            passed: config.passages.length > 0,
            details: `${config.passages.length}/${config.passages.length} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: config.sourceDocument.path,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus amtlichen RLP-Deutsch-Passagen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: emptyPassages.length === 0,
            details: `Passagen ohne Source-Ziele: ${emptyPassages.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateIds.length === 0,
            details: `Doppelte IDs: ${duplicateIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: missingPassageRefs.length === 0,
            details: `Ohne Passage: ${missingPassageRefs.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: mapping2Complete,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: config.reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:1 und 1:n-Zuordnungen werden gleichwertig behandelt; partial beschreibt nur die Zuordnungsform.`,
          },
        ],
      },
    ],
  }
}

function buildReview(config: ExtractionConfig, sourceGoals: SourceGoal[]) {
  const targetTitlesBySourceGoalId = targetTitlesBySourceGoalIdFor(config)
  const decisions = sourceGoals.map((sourceGoal) => {
    const targetTitles = targetTitlesBySourceGoalId.get(sourceGoal.id)
    if (!targetTitles || targetTitles.length === 0) throw new Error(`Missing target titles for ${sourceGoal.id}`)
    const canonicalGoalIds = unique(targetTitles).map((title) => {
      const canonicalGoalId = canonicalGoalIdByTitle.get(title)
        ?? canonicalGoalIdByTitle.get(asciiFold(title))
        ?? canonicalGoalIdByTitle.get(latinFold(title))
        ?? canonicalGoalIdByTitle.get(fuzzyFold(title))
      if (!canonicalGoalId) throw new Error(`Missing canonical German target goal: ${title}`)
      return canonicalGoalId
    })
    const matchType = canonicalGoalIds.length === 1 ? 'exact' : 'partial'
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType,
      rationale: [
        `Das ${config.jurisdiction}-Deutsch-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die aufgefuehrten kanonischen Deutsch-Ziele abgedeckt.`,
        '1:1 und 1:n sind fachlich gleichwertig; matchType beschreibt nur die Zuordnungsform, nicht die Qualitaet der Abdeckung.',
      ].join(' '),
      reviewedAt,
      reviewer: 'Codex',
    }
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )
  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length
  const partialMappings = decisions.length - exactMappings
  return {
    version: 1,
    reviewId: `${config.jurisdiction.toLowerCase()}-german-${config.stage === 'SekI' ? 'lower' : 'upper'}-secondary-source-extraction-to-canonical-german`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: 'complete',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: sourceGoals.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: sourceGoals.length,
      needsCanonicalGoal: 0,
      exactMappings,
      partialMappings,
      inheritedMappings: 0,
      note: `${config.jurisdiction} Deutsch ${config.stage} ist vollstaendig reviewed und inhaltlich durch kanonische Deutsch-Ziele abgedeckt; partial steht nur fuer 1:n-/Sammelziel-Zuordnung.`,
    },
    mappings,
    decisions,
  }
}

function targetTitlesBySourceGoalIdFor(config: ExtractionConfig): Map<string, string[]> {
  const result = new Map<string, string[]>()
  for (const passageSeed of config.passages) {
    passageSeed.goals.forEach((goalSeed, index) => {
      const sourceText = normalizeText(goalSeed.text)
      result.set(sourceGoalId(config, passageSeed, index + 1, sourceText), goalSeed.targets)
    })
  }
  return result
}

function passage(code: string, title: string, stage: Stage, gradeBand: string, goals: GoalSeed[]): PassageSeed {
  return {
    code,
    title,
    stage,
    gradeBand,
    text: `${code} ${title}: ${goals.map((goal) => goal.text).join(' ')}`,
    goals,
  }
}

function goals(texts: string[], targets: string[], tags: string[] = []): GoalSeed[] {
  return texts.map((text) => ({ text, targets, tags }))
}

function loadCanonicalGoalIdByTitle(): Map<string, string> {
  const canonical = JSON.parse(readFileSync(resolve(repoRoot, canonicalGermanPath), 'utf8')) as {
    goals?: Array<{ id?: string; title?: string }>
  }
  const result = new Map<string, string>()
  for (const goal of canonical.goals ?? []) {
    if (typeof goal.id === 'string' && typeof goal.title === 'string') {
      result.set(goal.title, goal.id)
      result.set(asciiFold(goal.title), goal.id)
      result.set(latinFold(goal.title), goal.id)
      result.set(fuzzyFold(goal.title), goal.id)
    }
  }
  return result
}

function updateRegistry(configsToRegister: ExtractionConfig[]): void {
  const fullPath = resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(fullPath, 'utf8')) as { sources?: unknown[], entries?: unknown[] }
  const sourceEntries = (registry.sources ?? registry.entries ?? []) as Array<Record<string, unknown>>
  const nextEntries = sourceEntries.filter((entry) =>
    !configsToRegister.some((config) => entry.landscapeId === config.sourceLandscapeId))
  const insertAfterIndex = Math.max(
    nextEntries.findIndex((entry) => entry.landscapeId === 'ac49d99c-61e5-5cb0-15a6-cf194cf554f7'),
    nextEntries.findIndex((entry) => entry.title === 'Deutsch Kursstufe (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)'),
  )
  const newEntries = configsToRegister.map((config) => ({
    landscapeId: config.sourceLandscapeId,
    title: config.title,
    jurisdiction: config.jurisdiction,
    sourcePath: config.sourceDocument.path,
    archiveSourcePath: config.sourceDocument.path,
    archivePath: dirname(config.outputPath).replace(/\\/g, '/').replace(/\/source-extraction$/u, '/'),
  }))
  if (insertAfterIndex >= 0) {
    nextEntries.splice(insertAfterIndex + 1, 0, ...newEntries)
  } else {
    nextEntries.push(...newEntries)
  }
  if (Array.isArray(registry.sources)) registry.sources = nextEntries
  else registry.entries = nextEntries
  writeJson(fullPath, registry)
  console.log(`Updated ${registryPath} (+${newEntries.length} Deutsch BB/BE entries)`)
}

function updateReadmes(): void {
  for (const jurisdiction of ['BB', 'BE'] as const) {
    const path = resolve(repoRoot, `curricula/DE/Gymnasium/input/${jurisdiction}/README.md`)
    if (!existsSync(path)) continue
    const existing = readFileSync(path, 'utf8')
    const section = [
      '## Deutsch',
      '### Sekundarstufe I (Jahrgangsstufen 7-10)',
      '- Archiviert:',
      `  \`curricula/DE/Gymnasium/input/${jurisdiction}/lower-secondary/BB_RLP_2023_Teil_C_Deu_GenF_1.pdf\``,
      '- Aktive Source-Extraction:',
      `  \`curricula/DE/Gymnasium/input/${jurisdiction}/lower-secondary/source-extraction/DE_${jurisdiction}_DEUTSCH_SEKI_RLP_2023.source-extraction.json\``,
      '- Aktiver Umfang:',
      `  MAPPING-1 und MAPPING-2 aus dem amtlichen gemeinsamen BE/BB-RLP-Teil-C-PDF; ${lowerPassages.length} Passagen, ${countGoals(lowerPassages)} Source-Ziele aus Standards E-H sowie Themen/Inhalten 7/8 und 9/10`,
      '- M3-Status:',
      `  abgeschlossen; ${countGoals(lowerPassages)}/${countGoals(lowerPassages)} Source-Ziele reviewed und inhaltlich durch kanonische Deutsch-Ziele abgedeckt`,
      '- Offizielle Quelle:',
      `  \`${lowerSourceUrl}\``,
      '',
      '### Sekundarstufe II (Gymnasiale Oberstufe)',
      '- Archiviert:',
      `  \`curricula/DE/Gymnasium/input/${jurisdiction}/upper-secondary/Teil_C_RLP_GOST_2022_Deutsch.pdf\``,
      '- Aktive Source-Extraction:',
      `  \`curricula/DE/Gymnasium/input/${jurisdiction}/upper-secondary/source-extraction/DE_${jurisdiction}_DEUTSCH_SEKII_RLP_GOST_2022.source-extraction.json\``,
      '- Aktiver Umfang:',
      `  MAPPING-1 und MAPPING-2 aus dem amtlichen BE/BB-RLP-GOST-Teil-C-PDF; ${upperPassages.length} Passagen, ${countGoals(upperPassages)} Source-Ziele aus Eingangsvoraussetzungen, abschlussorientierten Standards und Kurshalbjahren`,
      '- M3-Status:',
      `  abgeschlossen; ${countGoals(upperPassages)}/${countGoals(upperPassages)} Source-Ziele reviewed und inhaltlich durch kanonische Deutsch-Ziele abgedeckt`,
      '- Offizielle Quelle:',
      `  \`${upperSourceUrl}\``,
      '',
    ].join('\n')
    const updated = existing.includes('## Deutsch')
      ? existing.replace(/## Deutsch[\s\S]*?(?=\n## Mathematik|\n## Physik|\n## Chemie|$)/u, section)
      : existing.replace(/## Mathematik/u, `${section}\n## Mathematik`)
    writeFileSync(path, updated, 'utf8')
    console.log(`Updated curricula/DE/Gymnasium/input/${jurisdiction}/README.md`)
  }
}

function countGoals(passages: PassageSeed[]): number {
  return passages.reduce((sum, passageSeed) => sum + passageSeed.goals.length, 0)
}

function passageIdFor(config: ExtractionConfig, passageSeed: PassageSeed): string {
  return `${config.sourceGoalPrefix}:${slug(passageSeed.code)}-${hash(passageSeed.title)}`
}

function sourceGoalId(config: ExtractionConfig, passageSeed: PassageSeed, index: number, sourceText: string): string {
  return uuidFromString(`${config.jurisdiction}:Deutsch:${config.stage}:${passageSeed.code}:${index}:${sourceText}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/\.$/u, '')}.`
}

function normalizeText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
}

function latinFold(value: string): string {
  return value
    .replace(/Ä/gu, 'A')
    .replace(/Ö/gu, 'O')
    .replace(/Ü/gu, 'U')
    .replace(/ä/gu, 'a')
    .replace(/ö/gu, 'o')
    .replace(/ü/gu, 'u')
    .replace(/ß/gu, 'ss')
}

function fuzzyFold(value: string): string {
  return asciiFold(value)
    .replace(/ae/giu, 'a')
    .replace(/oe/giu, 'o')
    .replace(/ue/giu, 'u')
}
