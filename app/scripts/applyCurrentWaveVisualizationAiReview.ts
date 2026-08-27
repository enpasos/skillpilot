import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

interface VisualizationQaRecord extends JsonRecord {
  goalId: string
  visualizationState: string
  canonicalAssetPath: string
  publicAssetPath: string
  assetSha256: string
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isVisualizationQaRecord(value: unknown): value is VisualizationQaRecord {
  if (!isJsonRecord(value)) return false
  return typeof value.goalId === 'string'
    && typeof value.visualizationState === 'string'
    && typeof value.canonicalAssetPath === 'string'
    && typeof value.publicAssetPath === 'string'
    && typeof value.assetSha256 === 'string'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-27T09:05:00Z'
const reviewer = 'codex-nano-banana-retroactive-visual-review-2026-08-27'

const reviews = [
  {
    subject: 'mathematik',
    goalId: 'd658e26a-e351-4bca-824e-f346deaa87c5',
    sha256: 'sha256:e91b845cb55c589c1338da7782246233fa411b33be5ed9ca801642d40119a98f',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: 3⁴ wird korrekt als 3 · 3 · 3 · 3 und als 81 dargestellt; Basis 3 und Exponent 4 sind eindeutig markiert, ohne die Potenz mit einer einfachen Multiplikation zu verwechseln.',
  },
  {
    subject: 'mathematik',
    goalId: 'e331a425-e9c6-46eb-89cb-dedf72857974',
    sha256: 'sha256:561edef8bbe896dcaa63be885061e1c7712adaef0d80b2b0aaee8be20620dd6a',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: 10¹, 10², 10³ und 10⁶ sind mit korrekten Dezimalwerten und Nullenzahlen dargestellt; der Exponent ist sichtbar mit der Stellenwertstruktur verknüpft.',
  },
  {
    subject: 'mathematik',
    goalId: '25593605-5e13-55cc-9a05-8f3d737e15e9',
    sha256: 'sha256:c943a7e83053e4d5e978e2f5365d03c837b6e218edb6f70393eaeee9560f519f',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Nach dem vom Product Owner gemeldeten Versatz hashgebunden in Originalauflösung geprüft: Das Nano-Banana-Bild zeigt P(−3|2) und Q(4|−1) korrekt im quadratischen Koordinatengitter. Strecke PQ und die beidseitig unbegrenzte Gerade g haben dieselbe Richtung; im Geradenfeld liegen beide markierten Punkte ohne Knick oder Versatz auf der durchgehenden Geraden.',
  },
  {
    subject: 'mathematik',
    goalId: '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6',
    sha256: 'sha256:520caae51b4878fc6aab3a5b9000edc17fdad134cc4aa4162f5882410a98e97f',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Die Verhältnisgleichung (x+1)/(x−2)=2/3 wird unter der vorher genannten Definitionsbedingung x≠2 über korrekte Äquivalenzschritte zu x=−7 gelöst. Die Probe setzt −7 in die Ausgangsgleichung ein und ergibt links und rechts 2/3. Die verworfene pauschale Formulierung „gilt immer“ kommt nicht mehr vor.',
  },
  {
    subject: 'mathematik',
    goalId: 'cc60f759-1168-5fc0-8ff5-5f7a2533e61c',
    sha256: 'sha256:682e00a3f38e373b614aca1b16f3f861a7b94005da4d973ab805bcb9962f747f',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Drei korrekte Äquivalenzketten enden bei 0=0, 0=3 beziehungsweise x=6 und ordnen ihnen schlüssig L=ℝ, L=∅ und L={6} zu. Die Abschlusszeile verallgemeinert die drei Fälle korrekt; Text und mathematische Zeichen sind vollständig lesbar.',
  },
  {
    subject: 'mathematik',
    goalId: 'f2d4a7de-57c3-5749-bbb4-6cd4b57b7562',
    sha256: 'sha256:08fd629806c9e87d3d413d218e986cffb1509873894289e820dca6bb1b4b5557',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Teilbarkeitsregeln und Primfaktorzerlegung sind fachlich korrekt als zusammengehöriger Überblick dargestellt.',
  },
  {
    subject: 'mathematik',
    goalId: 'eb993c0c-9b1d-52af-97c8-4a534fd78be3',
    sha256: 'sha256:b845882a26dca4b01eeca4e950e7adbf9f4a5b747d71605e2fbfe968a864c019',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Potenzen mit natürlichen Exponenten und Zehnerpotenzen sind korrekt verbunden, ohne Basis und Exponent zu verwechseln.',
  },
  {
    subject: 'mathematik',
    goalId: 'ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70',
    sha256: 'sha256:79185d46e471b9ed99d10a61e88edd6fbd2b65dbb6b69f6ab2f35a0d8feaf4a5',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Dreisatz und Maßstab sind über korrekte proportionale Beziehungen und einheitliche Längeneinheiten verbunden.',
  },
  {
    subject: 'mathematik',
    goalId: 'a075ae99-7669-563d-807a-f91b119c020a',
    sha256: 'sha256:d04bfa16fcd27a867a90e9d85bed115e52f812d19a3d0c4161c06f7a7ffd2aa6',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Erweitern, Kürzen und Vergleichen von Brüchen sind über wertgleiche Darstellungen fachlich konsistent zusammengeführt.',
  },
  {
    subject: 'mathematik',
    goalId: 'c9e01667-24c4-56a2-8cf4-dfb6c360d7b9',
    sha256: 'sha256:c64d379bd6c945f542884c38901f4828f839a2aaebe61a742893cbab56e08b2a',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Rationale Zahlen sind korrekt auf der Zahlengeraden geordnet und in die geschachtelten Zahlmengen N, Z und Q eingeordnet.',
  },
  {
    subject: 'physik',
    goalId: 'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
    sha256: 'sha256:d2973dc053ac5798b0a75e225ee841e24f90817b863a962a68f3d0e3f36187a5',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Der Quader zeigt konsistent ein 4×3×2-Raster mit 24 Einheitswürfeln; die Kantenmaße 4 cm, 3 cm und 2 cm sowie V = 24 cm³ stimmen geometrisch und rechnerisch überein.',
  },
  {
    subject: 'physik',
    goalId: 'f92b5b8a-327f-50d2-8313-6a142399ebf0',
    sha256: 'sha256:f55352ed6e602c36d10cf2c50ed164d8aca52d808375485194a78cc66ea5a090',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Der vollständig eingetauchte unregelmäßige Körper hebt den Wasserstand von 50 mL auf 68 mL; die Differenz 18 mL = 18 cm³ ist korrekt und es wird weder Überlaufen noch eine Luftblase suggeriert.',
  },
  {
    subject: 'physik',
    goalId: '2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c',
    sha256: 'sha256:e70560f6c90f5be6febbcd96122dbb7321ed20a8d87aefebc33d01ec9c5a7d70',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Hashgebundene Sichtprüfung des dritten gezielten Nano-Banana-Versuchs in Originalauflösung: Außen-, Mittel- und Innenohr sind genau einmal und in richtiger Reihenfolge gegliedert. Der Weg führt von Schallwelle, Ohrmuschel und Gehörgang über Trommelfell und verbundene Gehörknöchelchen zur Cochlea; Sinneszellen liegen dort, das Nervensignal zeigt erst anschließend zum Gehirn.',
  },
  {
    subject: 'physik',
    goalId: 'da0837c7-95a7-5a6a-81db-f33cb7f42d85',
    sha256: 'sha256:c0e459788233bd571e762a4ebbb395d9ee806e591973210c03719762aa759b39',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Die qualitative Matrix stellt Schallpegel und Einwirkdauer als gemeinsam wirksame Größen dar, ohne eine starre Grenzwerttabelle zu behaupten. Das begründete Urteil berücksichtigt mögliche Folgen und leitet vier unterscheidbare Schutzhebel ab: Pegel senken, Dauer verkürzen, Abstand erhöhen und Gehörschutz verwenden.',
  },
  {
    subject: 'physik',
    goalId: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
    sha256: 'sha256:e3e51d533dfff5e63571664b51e0d5f0feddc2c5dac5cbdcb0b8ae64c4fdb21a',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Einfalls- und Reflexionswinkel sind beidseits zum senkrechten Lot gemessen, die Strahlenpfeile zeigen korrekt zum beziehungsweise vom Spiegelpunkt und α = β ist geometrisch konsistent.',
  },
  {
    subject: 'physik',
    goalId: 'b57427c9-1af5-5daa-8c65-b84a4cc20785',
    sha256: 'sha256:517ad891badebf527fdb42d590b0f2becbd56e26e6fcc58f3f4053ffae0af25a',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Das virtuelle, aufrechte und gleich große Spiegelbild liegt im gleichen Abstand hinter dem ebenen Spiegel; nur gestrichelte Rückverlängerungen laufen hinter den Spiegel, die realen reflektierten Strahlen zum Auge bleiben davor.',
  },
  {
    subject: 'physik',
    goalId: '33e3417c-e062-5f4a-8df9-3195dca50089',
    sha256: 'sha256:2c1670663dc53b70c7b15bdf93ab614547905ec5df1cdea2c9f39f4319d15da7',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: An allen acht Mondpositionen ist die sonnenzugewandte Hälfte beleuchtet; die Beobachteransichten zeigen für die Nordhalbkugel Neumond, rechtes erstes Viertel, Vollmond und linkes letztes Viertel in korrekter Reihenfolge, ohne Erdschatten als Ursache.',
  },
  {
    subject: 'physik',
    goalId: 'f0046ae8-cbfc-526b-8414-04e3595b6075',
    sha256: 'sha256:2fb3862606a2dfb298f548144cb4c5b4bde990aee9932cc24d224746750438df',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Hashgebundene KI-Sicht- und Geometrieprüfung des Nano-Banana-JPG in Originalauflösung: Jedes Teilbild besitzt genau vier gerade Randstrahlen. Bei der Sonnenfinsternis verlaufen sie tangential an Sonne und Mond; bei der Mondfinsternis tangential an Sonne und Erde, während der Mond als reines Schattenobjekt berührungsfrei im Erdschatten liegt. Kern- und Halbschatten sind den begrenzenden Geraden konsistent zugeordnet.',
  },
  {
    subject: 'physik',
    goalId: 'c5413852-abae-566b-b435-f9939209ca63',
    sha256: 'sha256:b965069577e99a163489bd1f7167ee603746035ba713d310a8756dd65d1ca78d',
    reviewedAt: '2026-08-27T05:25:00Z',
    reviewer: 'codex-nano-banana-policy-rework-2026-08-27',
    notes:
      'Nach den fachlichen Hinweisen des Product Owners hashgebunden in Originalauflösung geprüft: Der Nano-Banana-Entwurf zeigt genau zwei getrennte Spalte; die Quelle liegt vertikal mittig zwischen ihnen. Hinter dem Nachweisschirm wächst die kumulative Trefferzahl zeitlich von links nach rechts, während die senkrechte Richtung die Ortsabhängigkeit der Schwärzung trägt. Das zentrale Hauptmaximum der vielen Treffer und der größte Wahrscheinlichkeits-Peak liegen auf derselben Höhe. Jeder Nachweis bleibt lokalisiert; eine klassische Photonenbahn wird nicht behauptet.',
  },
  {
    subject: 'physik',
    goalId: 'a4681378-ade4-4f20-bf77-fb020469510f',
    sha256: 'sha256:80c0ce6fb636b865c813aa7384cd8ab5b5de9aaaf5fde24203ae2a12e81ef147',
    reviewedAt: '2026-08-27T09:05:00Z',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Weißes Licht wird am Prisma in geordnete Spektralfarben zerlegt; die additive Farbmischung ist davon klar getrennt. Das Bild behauptet weder eine Farberzeugung im Prisma noch eine stoffliche Weißmischung.',
  },
  {
    subject: 'physik',
    goalId: '01bebdfc-5819-4610-a03e-ea5e794fc954',
    sha256: 'sha256:ce19e39aef33e3a71ef5d332416858f24ba3b1ec598a28b0dc649168e8eb9e0e',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Reihen- und Parallelschaltung sind als unterschiedliche funktionale Strompfade korrekt unterscheidbar; die Bauteilverbindungen sind geschlossen und ohne unphysikalische Zusatzpfade.',
  },
  {
    subject: 'physik',
    goalId: '267170bd-f880-56a7-9719-ffb9751872c5',
    sha256: 'sha256:f2583a28e72bc1b7d201ae788c37c8b55822a63f2f0b6a029418b636cf405986',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Spannungsanstieg und Spannungsabfälle bilden eine geschlossene Masche und sind mit der Energieerhaltung konsistent bilanziert.',
  },
  {
    subject: 'physik',
    goalId: '3c82510a-1f12-4eaa-81c2-8599437a5b85',
    sha256: 'sha256:5b804a516a7f7d40b4909decfc733b24a74574af40f94d5804e9f7f3accfc82f',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Lokale Teilchenschwingung und fortschreitende Verdichtungen beziehungsweise Verdünnungen sind als Longitudinalwelle korrekt getrennt; Materietransport wird nicht behauptet.',
  },
  {
    subject: 'physik',
    goalId: '41d35667-0296-5f84-bc12-202ffc440be0',
    sha256: 'sha256:f631200a4f5f4ae96f42202013fe2f27735707ad5262c1b1eaca4ec9d780de23',
    notes:
      'Hashgebundene KI-Sicht- und Geometrieprüfung der dokumentierten repo-nativen Ausnahme nach vier verworfenen Nano-Banana-Pro-Versuchen: Das Raster besitzt exakt drei waagerechte und vier senkrechte Einheiten. Beide Komponenten und die Resultierende beginnen im selben Punkt; die Resultierende endet exakt am gegenüberliegenden Rechteckpunkt und hat mit 5 N den korrekten Betrag.',
  },
  {
    subject: 'physik',
    goalId: '45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83',
    sha256: 'sha256:146636869dbe72b8dd53f2976b859c9807b550be726f72325f457193ea998e06',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Messaufbau sowie proportionaler und nichtproportionaler Bereich der Kraft-Verformungs-Beziehung sind nachvollziehbar dargestellt.',
  },
  {
    subject: 'physik',
    goalId: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
    sha256: 'sha256:20b29c13f48b75bc76db6d43bad508e9c325344607702e37faa43fd63e7c970b',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Geeignetes Thermometer, Messkörper, Skala und Ablesen auf Augenhöhe sind klar und ohne irreführende Skalenwerte dargestellt.',
  },
  {
    subject: 'physik',
    goalId: '67ffd0f0-a5ab-518f-8c45-4c0e7eb18390',
    sha256: 'sha256:63460b45e7ee495b7ce2422c3e27eece5ab3502e84ff821d53e64bfa01351a4f',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Angriffspunkt, geradlinige Wirkungslinie und Schwerpunkt sind fachlich korrekt zugeordnet und visuell unterscheidbar.',
  },
  {
    subject: 'physik',
    goalId: '79cb1695-f985-443a-b93e-27b57ab474b7',
    sha256: 'sha256:19d7e178c6ed2ad74862726f03f4a944815394333ad341f26c8e15bda7be0a25',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Der Lichtstrahl verläuft als Gerade durch die Blendenöffnung; Quelle, Öffnung und Trefferpunkt sind kollinear und es gibt keinen physikalisch falschen Knick.',
  },
  {
    subject: 'physik',
    goalId: '79da5c34-86b2-5c10-9726-9de886ccef7d',
    sha256: 'sha256:d53ad6ee8dc52cfc04566f97b3ad4be90e5ad400002bb07bb22ebb53b36fe9ad',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Die ausdrücklich historisch-konventionelle Größe startet bei der Ruhemasse und wächst mit dem Lorentzfaktor für v gegen c stark an; der Grenzfall wird nicht falsch fortgesetzt.',
  },
  {
    subject: 'physik',
    goalId: '8a84de16-2fde-58ec-827a-f803e2ce8564',
    sha256: 'sha256:2c30ff0aea4f1fb19689575756df8b2b243c96960b2e7f2f3ba4643102b79c80',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Die Richtungen der Strompfeile sind am Knoten eindeutig und die Summe der zufließenden Ströme stimmt mit der Summe der abfließenden Ströme überein.',
  },
  {
    subject: 'physik',
    goalId: '8f833b36-4126-52db-b210-79fb0023c7d9',
    sha256: 'sha256:2ee338935d6ff22ae21928cb2c6bc88415ff3716c4d3e23742af6b4f11721fbc',
    notes:
      'Hashgebundene KI-Sichtprüfung des vierten gezielten Nano-Banana-Pro-Versuchs in Originalauflösung: Reihen- und Parallelschaltung, Gesamtwiderstandsbeziehungen und der dargestellte Grenzfall sind fachlich konsistent und ohne uneindeutige Leitungsverbindungen.',
  },
  {
    subject: 'physik',
    goalId: 'a24c41ce-68c5-56a7-8235-ef9a7dba7042',
    sha256: 'sha256:a26494acb70d474f814f3e4a9a3016cb8da1234877f44a416613160b1f9257b5',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Die typische Reihenfolge der Schallgeschwindigkeiten und ihre qualitative Begründung über die Teilchenkopplung in Gas, Flüssigkeit und Festkörper stimmen.',
  },
  {
    subject: 'physik',
    goalId: 'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
    sha256: 'sha256:5ce78460618d30d3c17856f89d5cfd3f561be2c9ae2041e164178d0ff2e728b0',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Waage, Referenz und Vergleich der Massen sind eindeutig; Masse wird nicht mit Gewichtskraft verwechselt.',
  },
  {
    subject: 'physik',
    goalId: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
    sha256: 'sha256:b68f356f14a5f9a8dcbccd51c41226106ec1ed920145ca4ba7102fa0e762abb2',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Erwärmung und Ausdehnung werden für feste, flüssige und gasförmige Stoffe qualitativ richtig verknüpft, ohne Teilchenvergrößerung zu behaupten.',
  },
  {
    subject: 'physik',
    goalId: 'b92827a7-5d62-5fdb-a6f5-ac44461f4a7b',
    sha256: 'sha256:bf9b07bd5f15b09eed2a6ec0e73b431636767d4382e3e0575406c388703b5ac0',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Gleiche Energie in kürzerer Zeit wird korrekt als größere Leistung gedeutet; Formel, Einheiten und Vergleich sind konsistent.',
  },
  {
    subject: 'physik',
    goalId: 'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
    sha256: 'sha256:79a020c5b6c626e48ad96bcd0d27aaf40f3345e2477145887c258ca1a8dda901',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Masse, Volumen und Quotient rho = m/V sind konsistent verbunden; die Dichte wird als Stoffeigenschaft und nicht als bloße Masse dargestellt.',
  },
  {
    subject: 'physik',
    goalId: 'f7f2c254-1663-5861-bed7-a32c00495b19',
    sha256: 'sha256:2980a12e8a5a9cfddb5e5caf31864836f26fc7da9face8710e970e34b905b11e',
    notes:
      'Hashgebundene KI-Sichtprüfung des rückwirkend erzeugten Nano-Banana-Pro-JPG in Originalauflösung: Energiefluss und Verhältnis von Nutz- zu zugeführter Energie sind korrekt; der Wirkungsgrad bleibt höchstens 100 Prozent.',
  },
  {
    subject: 'physik',
    goalId: 'd27c8860-12a4-4d7d-9849-ccd8b7caca48',
    sha256: 'sha256:6190c4ed91d84564b21d7db43c5ea3fc6a93fb2d33ce54a14f53f0bb28957ee9',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Temperaturmessung sowie thermische Ausdehnung fester, flüssiger und gasförmiger Stoffe sind als zusammengehöriger Überblick fachlich stimmig dargestellt.',
  },
  {
    subject: 'physik',
    goalId: 'cca06d84-28fe-4b80-9bcd-968dda026e0e',
    sha256: 'sha256:99fd4a2e9f12672707395c2fcb95633964ac7aa012e1cd61083c281f08218111',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Reflexionsgesetz und virtuelle Spiegelbildkonstruktion sind korrekt als gemeinsamer Überblick verbunden.',
  },
  {
    subject: 'physik',
    goalId: 'e41356c1-968b-435a-af25-b663f080ae5a',
    sha256: 'sha256:6bf975ff08744466dc6d27d4a94a95c8ad5b244167c469906e18f781fba7b370',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Masse, geometrische beziehungsweise verdrängungsbasierte Volumenbestimmung und Dichtequotient sind fachlich konsistent zusammengeführt.',
  },
  {
    subject: 'physik',
    goalId: '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
    sha256: 'sha256:deb84db80adfccc26fce665409f46dc50c3a0d86baec5c37eb7afa7ae65ca15d',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Angriffspunkt, Wirkungslinie, gleichgerichtete und entgegengerichtete Kräfte sind korrekt als gemeinsamer Überblick dargestellt.',
  },
  {
    subject: 'physik',
    goalId: '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    sha256: 'sha256:cda4dd061699db6eb61d5adfe737d638e1b492fc320c432aca8011279c3a0eb2',
    notes:
      'Hashgebundene KI-Sichtprüfung der wiederhergestellten vorhandenen Nano-Banana-Pro-Clusterübersicht in Originalauflösung: Energie, Leistung als Energie pro Zeit und Wirkungsgrad als Nutzenergieanteil sind fachlich korrekt miteinander verknüpft.',
  },
  {
    subject: 'physik',
    goalId: '80dd0a2b-1422-5b00-89ff-ec4d0faa047e',
    sha256: 'sha256:b36f7855932b93fd6ffc61bacd974b57849ce6f085c5976fe90b05e428fb5c7f',
    reviewedAt: '2026-08-27T09:40:00Z',
    reviewer: 'codex-physics-batch-012-nano-banana-review-2026-08-27',
    notes:
      'Hashgebundene doppelte Sichtprüfung in Originalauflösung: Zwei isolierte Plattenpaare zeigen entgegengesetzte Ladungen und bei vertauschter Batteriepolung die korrekt vertauschte Ladungsverteilung; die Platten bleiben jeweils durch einen Luftspalt getrennt.',
  },
  {
    subject: 'physik',
    goalId: 'dc7dd287-6eac-574d-818d-65cfb23a2d94',
    sha256: 'sha256:f8e663b9660312ac8cee98c32a9c2bc79e4c722f8e3eb9bc8dc4d8ba7ecf6c41',
    reviewedAt: '2026-08-27T09:40:00Z',
    reviewer: 'codex-physics-batch-012-nano-banana-review-2026-08-27',
    notes:
      'Hashgebundene doppelte Sichtprüfung in Originalauflösung: Der negative Stab verdrängt die kontinuierliche Elektronenwolke zur stababgewandten Seite; links wird ein positiver Bereich sichtbar, ohne Ladung zu erzeugen oder durch eine falsche Einzelzählung eine Bilanzverletzung zu suggerieren.',
  },
  {
    subject: 'physik',
    goalId: '7ca44ba0-b77e-52bf-8562-f67b44767172',
    sha256: 'sha256:f9f01dde38d4c893ce00554c611deef7a8164397a8b6459582842e2f0e77a0b5',
    reviewedAt: '2026-08-27T09:40:00Z',
    reviewer: 'codex-physics-batch-012-nano-banana-review-2026-08-27',
    notes:
      'Hashgebundene doppelte Sichtprüfung in Originalauflösung: Im offenen Kreis trennt ein sichtbarer Kontaktspalt den Leitungsweg und die Lampe bleibt dunkel; im geschlossenen Kreis berührt der Schalter beide Kontakte und die Lampe leuchtet.',
  },
  {
    subject: 'physik',
    goalId: '28237994-9c24-5a06-82fe-be1f494768ba',
    sha256: 'sha256:5abe164d96763177944960210e24ac63441bf3ecbedda1d0fa5ce25683dc52eb',
    reviewedAt: '2026-08-27T09:40:00Z',
    reviewer: 'codex-physics-batch-012-nano-banana-review-2026-08-27',
    notes:
      'Hashgebundene doppelte Sichtprüfung in Originalauflösung: Batterie und Lampe bilden einen geschlossenen Hauptzweig; das Voltmeter liegt in einem eigenen Zweig an denselben beiden Knoten parallel zur Lampe, mit konsistenter Polung und Anzeige 3,0 V.',
  },
  {
    subject: 'physik',
    goalId: '69f8f59c-b0c3-5b0b-82db-834a0e655736',
    sha256: 'sha256:54b473b1c0b6a61088f6d7497a971820ccb2af6d900af5ed8f24284c6c8650af',
    reviewedAt: '2026-08-27T09:40:00Z',
    reviewer: 'codex-physics-batch-012-nano-banana-review-2026-08-27',
    notes:
      'Hashgebundene doppelte Sichtprüfung in Originalauflösung: Realer Aufbau und Schaltplan zeigen denselben offenen Reihenkreis Batterie-Schalter-Lampe; die Lampe ist folgerichtig dunkel und die Bauteil-Symbol-Zuordnung eindeutig.',
  },
  {
    subject: 'physik',
    goalId: '5ddba212-9e0a-5dd4-8274-239ec51ab6a8',
    sha256: 'sha256:156433908125ac0f2df7e9148f0e2213aec10d833da6a4e75f06dc54706c3a3c',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung nach gezieltem Nano-Banana-Pro-Retry und Freigabe durch den Product Owner: Das linke Gerät ist sichtbar eingesteckt; der rote Fehlerstrompfad verläuft vom Außenleiter über Isolationsfehler, Metallgehäuse und Mensch zur Erde. Rechts sind intakter Schutzleiter, FI/RCD-Abschaltung und der getrennte Überstromschutz fachlich korrekt unterschieden.',
  },
  {
    subject: 'physik',
    goalId: 'c156d2fb-0fe9-5f13-8baa-3e74d7da151e',
    sha256: 'sha256:6149b0cf97ca2361170e98beedbad2a8853f263b5b9d8b22cf50535a6ef03c3a',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung und Freigabe durch den Product Owner: Ladungstrennung, Blitzentladung und sichere Verhaltensweisen bei Gewitter sind fachlich tragfähig dargestellt und klar von der Haushaltssicherheit getrennt.',
  },
  {
    subject: 'physik',
    goalId: '66256e22-44a3-5939-8862-821e29d6711d',
    sha256: 'sha256:ce7d822c6609a2ccecf73352d5cca2f30c7b4fe1b319e8089427a18bed84c419',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung nach gezieltem Nano-Banana-Pro-Retry und Freigabe durch den Product Owner: Das Amperemeter liegt in Reihe, das Voltmeter eindeutig parallel und ohne Strompfeil im Voltmeterzweig; verstellbare Kleinspannung, Messreihe und I(U)-Kennlinie sind konsistent.',
  },
  {
    subject: 'physik',
    goalId: 'af7855a3-6aea-5e05-8505-248bc9a8c219',
    sha256: 'sha256:a25e9ff8b3434158c595fc6a97fa3cee0cf6b57816e53a5208cb384e223f4f88',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung und Freigabe durch den Product Owner: Die qualitativen Einflüsse von Material, Leiterlänge und Querschnitt auf den Widerstand sind getrennt, vergleichbar und ohne Vermischung mit dem Kennlinienexperiment dargestellt.',
  },
  {
    subject: 'physik',
    goalId: '4a42cddd-7827-5204-87e5-8d9eac7792f1',
    sha256: 'sha256:5958c2b3f17bd15e30aff44e3decd8499d7565d3d481137cf4d4a96cb9424b62',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung und Freigabe durch den Product Owner: Gleich- und Wechselspannung sind anhand eindeutiger zeitlicher Verläufe und typischer Versorgungen korrekt unterschieden; Spannung wird nicht mit Strom verwechselt.',
  },
  {
    subject: 'physik',
    goalId: '27b90ce9-b650-5232-85fb-ce2cb69d59a3',
    sha256: 'sha256:4debeb4e5c8437e184aff67a6af9faefeefeb7ffbacfe1a8d11f4ebb41e82845',
    reviewedAt: '2026-08-27T12:00:00Z',
    reviewer: 'codex-physics-batch-015-nano-banana-review-2026-08-27',
    humanApproved: true,
    notes:
      'Hashgebundene Originalauflösungsprüfung nach gezieltem Nano-Banana-Pro-Retry und Freigabe durch den Product Owner: Der Li-Ion-Akkupack ist eindeutig und mit 3,7 V sowie 2 Ah korrekt beschriftet; 5 V, 2 A und 10 W des Netzteils sowie die 5-V-/12-V-Kompatibilität werden richtig gedeutet.',
  },
] as const

const hashFile = (path: string): string =>
  `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`

const ledgers = new Map<string, JsonRecord>()
const originalLedgerBytes = new Map<string, string>()
for (const review of reviews) {
  const reviewTimestamp = 'reviewedAt' in review ? review.reviewedAt : reviewedAt
  const reviewReviewer = 'reviewer' in review ? review.reviewer : reviewer
  const ledgerPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-qa/${review.subject}.qa.json`,
  )
  const currentBytes = readFileSync(ledgerPath, 'utf8')
  const ledger = ledgers.get(review.subject) ?? JSON.parse(currentBytes) as JsonRecord
  if (!originalLedgerBytes.has(review.subject)) originalLedgerBytes.set(review.subject, currentBytes)
  ledgers.set(review.subject, ledger)
  if (!Array.isArray(ledger.records)) throw new Error(`${review.subject}: QA ledger has no records array`)
  const record = ledger.records.find(
    (candidate) => isVisualizationQaRecord(candidate) && candidate.goalId === review.goalId,
  ) as VisualizationQaRecord | undefined
  if (!record) throw new Error(`Missing QA record ${review.goalId}`)
  if (record.visualizationState !== 'available') {
    throw new Error(`${review.goalId}: visualization is not available`)
  }
  const canonicalPath = resolve(repoRoot, record.canonicalAssetPath)
  const publicPath = resolve(repoRoot, record.publicAssetPath)
  const canonicalHash = hashFile(canonicalPath)
  const publicHash = hashFile(publicPath)
  if (canonicalHash !== review.sha256 || publicHash !== review.sha256 || record.assetSha256 !== review.sha256) {
    throw new Error(
      `${review.goalId}: expected ${review.sha256}, canonical=${canonicalHash}, public=${publicHash}, ledger=${record.assetSha256}`,
    )
  }
  Object.assign(record, {
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    humanApproved: 'humanApproved' in review && review.humanApproved ? 'yes' : 'no',
    humanIssueIdentified: 'no',
    humanIssueDescription: '',
    chatGptReviewedAt: reviewTimestamp,
    chatGptReviewer: reviewReviewer,
    chatGptNotes: review.notes,
    humanReviewedAt: 'humanApproved' in review && review.humanApproved ? reviewTimestamp : null,
    humanReviewer: 'humanApproved' in review && review.humanApproved ? 'Product Owner' : '',
    aiApproved: 'yes',
    aiApprovedAssetSha256: review.sha256,
    aiReviewedAt: reviewTimestamp,
    aiReviewer: reviewReviewer,
    aiNotes: review.notes,
  })

  const promptPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/visualizations/${review.subject}/${review.goalId}/prompt.de.md`,
  )
  const currentPrompt = readFileSync(promptPath, 'utf8')
  const expectedPrompt = currentPrompt
    .replace('- Status: pilot', '- Status: erzeugt und hashgebunden KI-geprüft')
    .replace(
      'Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.',
      `Das erzeugte Rasterbild wurde in Originalauflösung fachlich und auf Lesbarkeit geprüft. Die KI-Freigabe ist im QA-Ledger an ${review.sha256} gebunden; eine menschliche Freigabe wurde nicht behauptet.`,
    )
  if (writeMode) {
    writeFileSync(promptPath, expectedPrompt, 'utf8')
  } else if (currentPrompt !== expectedPrompt) {
    throw new Error(`${review.goalId}: prompt review metadata is not up to date`)
  }
}

for (const [subject, ledger] of ledgers) {
  const ledgerPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`,
  )
  const expected = `${JSON.stringify(ledger, null, 2)}\n`
  if (writeMode) {
    writeFileSync(ledgerPath, expected)
  } else if (originalLedgerBytes.get(subject) !== expected) {
    throw new Error(`${subject}: QA ledger does not match the bound AI review decisions`)
  }
}

console.log(`CHECK current_wave_visual_ai_review ${writeMode ? 'WRITE' : 'PASS'} records=${reviews.length}`)
