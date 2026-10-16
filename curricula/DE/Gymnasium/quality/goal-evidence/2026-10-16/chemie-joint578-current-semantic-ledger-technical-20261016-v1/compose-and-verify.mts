import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repo = process.cwd()
const out = dirname(fileURLToPath(import.meta.url))
const outRel = relative(repo, out)
const runId = 'chemie-joint578-current-semantic-ledger-author-technical-20261016-v1'
const req = createRequire(resolve(repo, 'app/package.json'))
const ts = req('typescript')
const Ajv2020 = req('ajv/dist/2020.js').default
const addFormats = req('ajv-formats').default
const stockPath = 'app/scripts/goalBookModel.ts'
const stockModule = await import(pathToFileURL(resolve(repo, stockPath)).href)
const authoring = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const baseRoot = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1/candidate'
const beforePath = `${baseRoot}/canonical570.current426.final-two-texts-and-genuine96-PNG.inactive.json`
const beforeLedgerPath = `${baseRoot}/semantic570.current426.two-genuine-text-context-bindings.final.json`
const whole576Path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-four-package-joint576-portable-technical-context-20261016-v1/candidate/CANONICAL.joint576.closed-schema-and-six-assets.technical-preview.json'
const m2Path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-ph-two-narrow-memory-selections-and-explicit-course-placements-author-20261016-v1/candidate/M2.two-whole-canonical-memory-selection-additions.author.json'
const candidatePath = `${outRel}/candidate/CANONICAL.joint578.two-memory-bodies-appended.technical-preview.json`
const ledgerPath = `${outRel}/candidate/SEMANTIC.joint578.current-whole-ledger.technical.json`
const ontologySchema = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const runtimeSchema = 'docs/landscape-runtime.schema.json'
const fingerprintProfile = 'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const shaBytes = (s: string | Buffer) => `sha256:${createHash('sha256').update(s).digest('hex')}`
const canonicalJson = (v: any): string => Array.isArray(v) ? `[${v.map(canonicalJson).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(',')}}` : JSON.stringify(v)
const objectSha = (v: any) => shaBytes(canonicalJson(v))
const pin = (p: string) => { const b = readFileSync(resolve(repo, p)); return {path:p,sha256:shaBytes(b),bytes:b.length} }
const assert = (v: unknown, message: string) => { if (!v) throw new Error(message) }
const write = (name: string, v: any) => writeFileSync(resolve(out,name),JSON.stringify(v,null,2)+'\n')
assert(pin(whole576Path).sha256 === 'sha256:2b74fcb6526033a6e1ae3abcdd9966d75e653e0657c407a55009dbf125e09c10','Whole576 input drift')
assert(pin(beforeLedgerPath).sha256 === 'sha256:6dc8d16d5208056b81651847ba81e79ce3487e17d95f710c2d3026ccd13d7111','Baseline ledger drift')
assert(pin(beforePath).sha256 === 'sha256:eaca2781881a29413fb1325e4e561c5097c9e4f3cd4ab59b70bd0d8aa6c8bde1','Baseline whole570 drift')
assert(pin(m2Path).sha256 === 'sha256:6054196ea816b5b53812b4f53722609f2cfd6a0bc135a3ebcff517da2247a28d','Whole M2 input drift')

const before = read(beforePath), whole576 = read(whole576Path), m2 = read(m2Path)
const beforeLedger = read(beforeLedgerPath)
const beforeById = new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const oldRows = new Map<string,any>(beforeLedger.decisions.map((g:any)=>[g.goalId,g]))
const currentById = new Map<string,any>(whole576.goals.map((g:any)=>[g.id,g]))
assert(whole576.goals.length === 576 && before.goals.length === 570, 'Input counts mismatch')
assert(m2.newWholeGoals.length === 2 && m2.existingWholeGoalEdits.length === 0 && m2.canonicalContainsParentEdits.length === 0, 'M2 append-only contract changed')
assert(m2.commonWhole576.sha256 === pin(whole576Path).sha256,'M2 is not bound to exact whole576')
for (const g of m2.newWholeGoals) assert(!currentById.has(g.id), `M2 ID collision ${g.id}`)

mkdirSync(resolve(out,'candidate'),{recursive:true})
const text576 = readFileSync(resolve(repo,whole576Path),'utf8')
const close = text576.lastIndexOf('\n  ]')
assert(close >= 0 && text576.slice(close).trim() === ']\n}', 'Unexpected whole576 terminal array representation')
const appendedText = text576.slice(0,close) + ',\n' + m2.newWholeGoals.map((g:any)=>JSON.stringify(g,null,2).split('\n').map((line:string)=>'    '+line).join('\n')).join(',\n') + text576.slice(close)
writeFileSync(resolve(repo,candidatePath),appendedText)
const current = read(candidatePath)
assert(current.goals.length === 578,'Actual composed object count is not 578')
assert(JSON.stringify(current.goals.slice(0,576)) === JSON.stringify(whole576.goals),'Existing goal changed/reordered during append')
assert(JSON.stringify(current.goals.slice(576)) === JSON.stringify(m2.newWholeGoals),'M2 bodies changed during append')
for (const [key,value] of Object.entries(whole576)) if(key !== 'goals') assert(JSON.stringify(current[key]) === JSON.stringify(value),`Landscape metadata changed ${key}`)
const afterById = new Map<string,any>(current.goals.map((g:any)=>[g.id,g]))
assert(afterById.size===current.goals.length,'Duplicate canonical goal ID')

const special:Record<string,{kind:string,basis:string,reason:string,boundary:string}> = {
 'acdfc7d7':{kind:'curricularAtomic',basis:'reviewed-current-post-split-curricular-atomic',reason:'Eigenständige chemische Kompetenz zum Anfangs-pH einprotoniger Säuren: vollständige oder unvollständige Protolyse, MWG-/Bilanzherleitung und begründete Näherungsprüfung gehören zu einem zusammenhängenden Säuremodell. Keine bloße Formelabfrage und kein Assessment-Endpunkt.',boundary:'Diese Zuordnung beschreibt die Art des aktuellen Zielkörpers. Sie ist kein neuer D/P/A/M/V-Nachweis und überträgt keine alte Säure-/Basen-Gesamtmastery.'},
 'edcfc5f0':{kind:'curricularAtomic',basis:'reviewed-current-post-split-curricular-atomic',reason:'Getrennte Anfangs-pH-Kompetenz für einprotonige Basen mit eigenem Kb-Gleichgewicht, Hydroxid, pOH und temperaturabhängigem pKw. Die erforderliche Modellherleitung und Prüfung ist chemisches Können und kein isolierter Abruf.',boundary:'Keine automatische Übertragung des Säuremodells oder einer früheren gemeinsamen Mastery. Die Klassifikation ersetzt keine Gate-A-Entscheidung zur semantischen Atomicität.'},
 'e0944fbb':{kind:'curricularAtomic',basis:'reviewed-current-pilot-curricular-atomic',reason:'Ein zusammenhängender experimenteller Untersuchungszyklus: eigene starke/schwache Säurekurven kalibriert aufnehmen, Rohdaten darstellen und aus der eigenen schwachen Säurekurve den Halbpunkt mit Unsicherheit bestimmen. Dies ist eine reale fachliche Ausführungskompetenz und weder Kartenabruf noch bloße Übungsstation.',boundary:'Eigene Ausführung bleibt unbeobachtet; die semantische Klassifikation behauptet weder Versuchserfolg noch Host-, Quellen-, P- oder V-Akzeptanz.'},
 'c61b2a7a':{kind:'curricularAtomic',basis:'reviewed-current-pilot-curricular-atomic',reason:'Experimentelle Vergleichskompetenz zur Pufferwirkung: faire gepufferte/ungepufferte Kontrollen unter Säure-/Basenzugaben planen, selbst durchführen, eigene pH-Werte dokumentieren und aus den korrespondierenden Partnern erklären. Planung und Deutung bilden denselben Untersuchungsgegenstand.',boundary:'Die Kategorie belegt keine tatsächlich erfolgte Messung und keine angenommene unendliche Kapazität; keine neue M- oder A-Entscheidung.'},
 '7c0b944d':{kind:'curricularAtomic',basis:'reviewed-current-pilot-curricular-atomic',reason:'Konkrete analytische Methodenkompetenz: kontrollierte konduktometrische Fällungstitration durchführen, Verlauf aus den Ionen erklären, den Äquivalenzpunkt bestimmen und die Zielionkonzentration stöchiometrisch berechnen. Dies ist Inhaltskompetenz mit zusammenhängendem Methodenweg.',boundary:'Keine EDTA-Kompetenz, keine durchgeführte Messung und keine Quellen-/Kursfreigabe aus der Klassifikation. Ein Inhaltsziel bleibt trotz experimentellem Operator curricularAtomic.'},
 'a25a19ed':{kind:'curricularAtomic',basis:'reviewed-current-pilot-curricular-atomic',reason:'Materialgestützte chemische Erklärung von Ethanolwirkung und schrittweisem oxidativem Abbau mit begründeter Alltagsrisikobeurteilung. Die Körper-/Abbauinformationen werden auf eine konkrete Situation übertragen, nicht nur reproduziert; der Knoten ist keine Abschlussprüfung oder Motivation.',boundary:'Keine Individualdiagnose, Abbauzeit, sichere Menge oder tatsächliche Lernleistung. Die Zuordnung ist unabhängig von der noch separat zu belegenden Quell-/Kursroute.'},
 '2a8a13b8':{kind:'curricularArea',basis:'reviewed-current-post-split-curricular-area',reason:'Vorher verlangte der Knoten selbst Protolysegleichungen und konjugierte Paare. Nachher bezeichnet er ausdrücklich einen erhaltenen früheren Kontext, enthält das gemeinsame Brønsted-Ziel 1c1420c2 und verneint eine zusätzliche atomare Lern- oder Abschlussanforderung. Damit ist er jetzt ein fachlicher Kontext-/Bündelknoten.',boundary:'Kein bloßer Ausschluss eines weiter geforderten Ziels: aktueller Wortlaut, cluster-Typ, enthält-Beziehung und leere requires tragen die Umklassifikation gemeinsam. Keine Mastery wird gelöscht oder übertragen.'},
 'd7461c15':{kind:'curricularArea',basis:'reviewed-current-post-split-curricular-area',reason:'Vorher war dies ein eigener HH-Rechenatom. Der aktuelle Knoten ist ausdrücklich früherer Kontext, enthält das zusammengeführte aktuelle HH-Ziel a449e874 und begründet keine eigene Abschlussleistung. Sein fachlicher Bezug bleibt, aber die selbst zu bewertende Kompetenz liegt beim enthaltenen Ziel.',boundary:'Keine semantische Reduktion allein wegen Überlappung oder einer gewünschten Nennerzahl; der tatsächliche vollständige Nachher-Körper ist ein fachlicher Cluster.'},
 '33034876':{kind:'curricularArea',basis:'reviewed-current-post-split-curricular-area',reason:'Der frühere kombinierte Säure-/Basenatom ist jetzt ausdrücklich erhaltener gemeinsamer Kontext. Er enthält beide vollständigen getrennten Anfangs-pH-Modellziele und verneint eine zusätzliche atomare Abschlussanforderung. Das ist ein fachliches Aggregat statt einer dritten Prüfung derselben Leistungen.',boundary:'Beide Kinder bleiben gewöhnliche Inhaltsziele im Nenner. Keine automatische Mastery-Übertragung; die Kontextklassifikation ersetzt keine unabhängige Qualitätsfreigabe der Aufteilung.'},
 '076cb333':{kind:'memory',basis:'reviewed-current-pilot-memory',reason:'Der gesamte neue Körper begrenzt sich auf Abruf bereits erlernter pH-/pOH-Definitionen und der 25-°C-Beziehung. Er bindet genau Karte 004, nodeKind memory, memorization und ein SRS-Deck, ohne eigenständige Rechnung, neue Modellherleitung oder Versuchsausführung zu zertifizieren.',boundary:'Memory ist hier eine semantische Artentscheidung. Die authored M2-Kursplatzierungen, Auswahlroute und informed independent review bleiben offen; keine M-Freigabe oder Anerkennung gewöhnlicher Inhaltsmastery.'},
 'c8bf3178':{kind:'memory',basis:'reviewed-current-pilot-memory',reason:'Der gesamte neue Körper verlangt den begrenzten Abruf der bereits gelehrten HH-Beziehung und ihres Pufferbezugs über genau Karte 006. SRS-/memorization-Markierungen, nodeKind und der ausdrückliche Ausschluss von Rechen-/Ausführungszertifizierung passen zu memory.',boundary:'Keine normale HH-Rechenkompetenz oder Mastery aus Abruf ableiten. Platzierung und Autorvorschlag M2 bleiben eigenständig offen; die Kategorie ist keine informed unabhängige Routenfreigabe.'}
}
const keepReasons:Record<string,string> = {
 '4961130b':'Die vervollständigte englische Fassung nennt nun ebenfalls anorganische/organische Teilchen und Redoxidentifikation. Vorher und nachher verlangt derselbe inhaltliche Blattknoten hergeleitete Oxidationszahlen und Redoxbilanz; curricularAtomic bleibt passend.',
 'f1ed86f0':'Die englische Fassung ergänzt die im deutschen Ziel schon enthaltene eigene Lösungsherstellung. Der Zielkörper bleibt eine fachliche Herstellungs-, Mess- und Plausibilisierungskompetenz, kein Memory- oder Assessment-Knoten.',
 'b4777001':'Die aktuelle Beschreibung fokussiert die begründete qualitative Protonenübertragung und Ampholytrolle; sie enthält eine selbstständige fachliche Urteilsleistung. Die Reduktion des früher vermischten Umfangs macht den Blattknoten nicht zu Struktur, Memory oder Prüfung.',
 'dd843c85':'Der bereits fachliche Cluster enthält jetzt zusätzlich den materialgestützten Ethanolwirkungsatom und beschreibt weiterhin ein Bündel von Eigenschaften, Wirkungen und Risiken. Die neue Kind-/Beschreibungslage bestätigt curricularArea.',
 'cd9ec99b':'Der unveränderte Kompetenztext bleibt eine inhaltliche Risikobeurteilung. Umgebuchte Sek-I-/Quellenmetadaten und die Vererbungsgrenze ändern die Art der geforderten Leistung nicht.',
 '8519f683':'Das Alkanol-/Carbonyl-Bündel enthält nach Wegfall der Grignard-Kante weiter mehrere fachliche Unterziele. Es bleibt curricularArea; daraus folgt keine Umklassifikation des weiterhin vorhandenen Grignard-Atoms.',
 '67b8b37f':'Die veränderte Kindliste gruppiert weiterhin fachliche Protolyse-, pH- und Titrationsziele, einschließlich der neuen experimentellen Aufnahme. Dieser Themencluster bleibt curricularArea und ist keine zusätzliche Einzelkompetenz.',
 '48115ff7':'Der fachliche Text bleibt unverändert bei Donator/Akzeptor, MWG und pK-Stärkenvergleich; nur die Brønsted-Voraussetzung verweist auf den gemeinsamen Träger. Der Inhaltsblattknoten bleibt curricularAtomic.',
 '28c90c6a':'Der aktuelle Text trennt bereitgestellte Kurven-/Dateninterpretation von eigener Messaufnahme und numerischer Punktrechnung. Er fordert weiterhin eigenständiges fachliches Erkennen und Erklären; curricularAtomic bleibt passend.',
 'a449e874':'Die HH-Rechenkompetenz ist um die vorher verteilten Bilanz- und Näherungsgrenzen präzisiert. Der aktuelle Körper verlangt weiterhin anwendbares inhaltliches Modellieren und ist kein bloßer Formelabruf oder Kontextcluster.',
 'ccab1e1c':'Die Kindliste ersetzt den alten HH-Kontext durch die neue experimentelle Pufferuntersuchung und behält weitere Pufferziele. Dieser fachliche Themenknoten bleibt curricularArea.',
 '9fef5c29':'Die Voraussetzung verweist jetzt auf das allgemeine Pufferverständnis. Der unveränderte Zieltext verlangt die fachliche Erklärung des geschlossenen Phosphatpuffers und bleibt curricularAtomic.',
 '5a58126e':'Der inhaltliche Text zu offenen Carbonat-/Ammoniumpuffern ist unverändert. LK-/Anwendbarkeitskorrekturen machen diese qualitative Stoffaustauscherklärung weder zu einem Abrufknoten noch zu einem Themencluster.',
 '8edee6b6':'Der aktuelle vollständige Körper fordert weiterhin Einsatz/Deutung der Grignard-Reagenzien und Reaktionsschritte als fachlichen Inhaltsatom. Quellen-/Projektionsmetadaten mit excluded sind kein semantischer Ausschlussgrund; der Knoten bleibt curricularAtomic im aktuellen Nenner.',
 '29742d91':'Die präzisierte numerische Titrationspunkt-Kompetenz mit regionaler Bilanz, Gesamtvolumen und Näherungsprüfung bleibt eine fachliche Blattkompetenz. Neue getrennte Säure-/Basenvoraussetzungen ändern diesen Typ nicht.',
 'dc0470f1':'Der Inhalt bleibt Berechnung mehrprotoniger Systeme und Pufferbewertung. Geänderte Voraussetzungen und Anwendbarkeit begründen keine neue semantische Kategorie; curricularAtomic bleibt bestehen.',
 '13877340':'Das vorher breitere Kapazitätswort ist jetzt ein konkretes konsistentes Rezept mit endlichen Lastgrenzen. Diese selbstständige inhaltliche Designrechnung bleibt curricularAtomic statt Memory oder bloßer Übungsstation.',
 '00139854':'Text, Practice/Assessment-Tags und vollständiger examData-Auftrag bleiben eine materialgestützte Prüfungsstation zur Fruchtsaftbewertung. Entfernte Grignard-Voraussetzung ändert ihre Rolle nicht: practiceAssessment, kein gewöhnlicher Inhaltsatom.',
 'c91350bc':'Die materialgestützte Q1-Abschlussaufgabe mit examData, mehreren Teilaufgaben und Bewertung bleibt practiceAssessment. Die entfernte Grignard-Voraussetzung ist keine Umwandlung in ein gewöhnliches Inhaltsziel.',
 'bf6c39f0':'Die Campingseifen-Aufgabe bleibt nach Voraussetzungskorrektur ein vollständiger materialgestützter Prüfungsfall mit examData. Ihre Praxis-/Assessmentrolle bleibt dieselbe, unabhängig von der technischen Blattstruktur.',
 'bacf2568':'Die Sportgetränk-Titration bleibt ein materialgestützter Mehrteilauftrag mit examData. Brønsted-Verweise in requires und coveredGoalIds werden auf den aktuellen Träger umgebunden; dies schafft keinen neuen Inhaltsatom.',
 'cb0ef9cd':'Der analytische Cluster enthält jetzt zusätzlich konduktometrische Fällungstitration neben EDTA/Fotometrie. Er bleibt ein fachliches Bündel curricularArea, kein eigener Ausführungsatom.',
 'e22a34d4':'Der vollständige Kompetenztext bleibt die tatsächliche EDTA-Titration und Metallkationenauswertung. Präzisierte Quellen-/Anwendbarkeitsmetadaten ändern die methodische Inhaltskompetenz nicht.',
 '07879ea2':'Der Brønsted-Prerequisite-Wechsel lässt die fachliche Erklärung von Wasseramphoterie und Ionenprodukt unverändert. Dies bleibt Inhaltsverständnis, getrennt vom neuen begrenzten pH-/pOH-Abruf.',
 '14577339':'Der aktuelle Körper bleibt ausdrücklich eine vernetzte Sek-II-Abschlussaufgabe mit examData und erweitertem fünftem Materialteil. Geänderte Coverage-/Quellenangaben oder Punktezahl wandeln diese Prüfungsstation nicht in gewöhnlichen Inhalt um.',
 '045efaa4':'Die zusätzliche Karte 006 und geänderte Autorherkunft betreffen eine bestehende beschränkte SRS-Auswahl. Wortlaut, nodeKind und Abrufrolle bleiben memory; eine Auswahl-/Routenfreigabe folgt daraus nicht.',
 '54bc6ca0':'Emission/Absorption bleibt derselbe inhaltliche Erklärungs-/Unterscheidungsatom. Ausschließlich um NW ergänzte Anwendbarkeit ändert weder die Kompetenzart noch den stock semantic-kind-Fingerprint.',
 '87d8cc68':'Die Erklärung von Farbigkeit durch delokalisierte Elektronen bleibt inhaltliches Modellverständnis. Die NW-Ergänzung in applicability ändert die semantische Art nicht; Originalzuordnung bleibt bytegenau.',
 '64b03eff':'Der Donator-/Akzeptor- und Funktionalgruppeneffekt an Farbstoffen bleibt dieselbe inhaltliche Erklärung. Die NW-Anwendbarkeitszeile ist keine Umklassifikation; stock-Fingerprint und Originalzuordnung bleiben identisch.',
 'f0ba30a8':'Der weiterhin geforderte Struktur-/Farbzusammenhang bleibt ein inhaltlicher Farbstoffatom. Eine reine Anwendbarkeitserweiterung ändert den Typ nicht; der ursprüngliche Datensatz bleibt bytegenau.',
 '059acb11':'Der unveränderte Zieltext verlangt Erklärung und Nutzung von Halbtitrationsdaten zur pK-Bestimmung. Entfernte BB/BE-Anwendbarkeit macht daraus weder Memory noch Struktur; der ursprüngliche semantic-kind-Datensatz bleibt bytegenau.'
}

const semantic11:any[] = [], changedWhole:any[] = [], retain:any[] = []
const parsedBefore = ts.parseJsonText('baseline-semantic.json',readFileSync(resolve(repo,beforeLedgerPath),'utf8'))
const decisionProperty = parsedBefore.statements[0].expression.properties.find((p:any)=>p.name.text==='decisions')
const originalDecisionTexts = new Map<string,string>()
for (const element of decisionProperty.initializer.elements) {
  const text = element.getText(parsedBefore)
  originalDecisionTexts.set(JSON.parse(text).goalId,text)
}
assert(originalDecisionTexts.size===570,'Could not capture 570 exact original decision object byte strings')
const rowTexts:string[] = []
const newRows:any[] = []
for (const goal of current.goals) {
  const oldGoal = beforeById.get(goal.id), oldRow=oldRows.get(goal.id)
  const prefix = goal.id.slice(0,8), own=special[prefix]
  const currentFp=stockModule.fingerprintSemanticKindSourceGoal(goal)
  const oldFp=oldGoal ? stockModule.fingerprintSemanticKindSourceGoal(oldGoal) : null
  if (oldRow) assert(oldRow.sourceFingerprint===oldFp,`Stale baseline semantic decision ${goal.id}`)
  const currentKind=own ? own.kind : oldRow.semanticKind
  const wholeChanged=oldGoal && canonicalJson(oldGoal)!==canonicalJson(goal)
  const fpChanged=oldGoal && oldFp!==currentFp
  if (own) semantic11.push({goalId:goal.id,role:'actual-author-semantic-kind-judgment',beforeSemanticKind:oldRow?.semanticKind??null,afterSemanticKind:currentKind,reasonDe:own.reason,boundaryDe:own.boundary,wholeBeforeGoal:oldGoal??null,wholeAfterGoal:goal,wholeBeforeObjectSha256:oldGoal?objectSha(oldGoal):null,wholeAfterObjectSha256:objectSha(goal),oldSourceFingerprint:oldFp,currentSourceFingerprint:currentFp,decisionAuthority:'author_technical',independentReviewClaimed:false,HumanApproval:false,HumanTrial:false})
  if (wholeChanged) {
    const reason=own?.reason??keepReasons[prefix]
    assert(reason,`Missing actual before/after judgment ${goal.id}`)
    changedWhole.push({goalId:goal.id,beforeSemanticKind:oldRow.semanticKind,afterSemanticKind:currentKind,judgmentDe:reason,judgmentScope:'Only current whole-goal semantic kind; no source, quality-gate, route, exam or learner acceptance.',wholeBeforeGoal:oldGoal,wholeAfterGoal:goal,wholeBeforeObjectSha256:objectSha(oldGoal),wholeAfterObjectSha256:objectSha(goal),oldSourceFingerprint:oldFp,currentSourceFingerprint:currentFp,stockSourceFingerprintChanged:fpChanged,sourceFingerprintUpdatedOnlyAfterThisJudgment:fpChanged,wholeGateClaimed:false})
  }
  let row:any
  let rowText:string
  if (!own && oldFp===currentFp) {
    row=oldRow;rowText=originalDecisionTexts.get(goal.id)!
    retain.push({goalId:goal.id,semanticKind:row.semanticKind,sourceFingerprint:row.sourceFingerprint,originalDecisionObjectTextSha256:shaBytes(rowText),currentDecisionObjectTextSha256:shaBytes(rowText),originalLedgerDecisionIndex:beforeLedger.decisions.findIndex((r:any)=>r.goalId===goal.id),currentLedgerDecisionIndex:newRows.length,exactOriginalDecisionBytesRetained:true,wholeBodyChangedOnlyOutsideStockFingerprint:!!wholeChanged})
  } else if (!own) {
    assert(fpChanged && wholeChanged,`Unjustified rebind ${goal.id}`)
    row={...oldRow,sourceFingerprint:currentFp}
    rowText=originalDecisionTexts.get(goal.id)!.replace(oldRow.sourceFingerprint,currentFp)
    assert(JSON.stringify(JSON.parse(rowText))===JSON.stringify(row),`Non-fingerprint old row change ${goal.id}`)
  } else {
    row={goalId:goal.id,sourceFingerprint:currentFp,semanticKind:currentKind,decisionStatus:'authoritative',decisionBasis:own.basis}
    rowText=JSON.stringify(row,null,2).split('\n').map((line,index)=>index===0?line:'    '+line).join('\n')
  }
  newRows.push(row);rowTexts.push(rowText)
}
assert(semantic11.length===11,'Expected exactly eleven new/reclassified semantic judgments')
assert(semantic11.filter(r=>r.beforeSemanticKind===null).length===8,'Expected six ordinary and two memory additions')
assert(semantic11.filter(r=>r.beforeSemanticKind!==null && r.beforeSemanticKind!==r.afterSemanticKind).length===3,'Expected three actual context reclassifications')
assert(changedWhole.length===34,'Changed-existing whole-body count unexpectedly changed')
assert(retain.length===541,'Exact semantic decision retention count unexpectedly changed')
const counts:any={programStructure:0,curricularArea:0,curricularAtomic:0,orientation:0,practiceAssessment:0,memory:0,runtimeSupport:0,total:newRows.length}
for(const row of newRows) counts[row.semanticKind]+=1
const ledger={...beforeLedger,ledgerId:runId,sourceLandscapePath:candidatePath,counts,decisions:newRows}
const ledgerHeader=JSON.stringify({...ledger,decisions:[]},null,2)
const ledgerText=ledgerHeader.replace('"decisions": []','"decisions": [\n    '+rowTexts.join(',\n    ')+'\n  ]')+'\n'
writeFileSync(resolve(repo,ledgerPath),ledgerText)
assert(JSON.stringify(read(ledgerPath))===JSON.stringify(ledger),'Final ledger parse differs from intended rows')
const parsedAfter=ts.parseJsonText('current-semantic.json',ledgerText)
const afterProp=parsedAfter.statements[0].expression.properties.find((p:any)=>p.name.text==='decisions')
for (const element of afterProp.initializer.elements) {
  const text=element.getText(parsedAfter),row=JSON.parse(text)
  if(retain.some(r=>r.goalId===row.goalId)) assert(text===originalDecisionTexts.get(row.goalId),`Retained row byte drift ${row.goalId}`)
}

// Execute the exact existing private parser without changing its application module.
// TypeScript strips types from verbatim declaration snippets; its dependencies are
// the actual AJV packages and the actual exported stock fingerprint function.
const stockText=readFileSync(resolve(repo,stockPath),'utf8')
const stockSource=ts.createSourceFile(stockPath,stockText,ts.ScriptTarget.Latest,true)
const names=new Set(['SEMANTIC_KINDS','SEMANTIC_KIND_LEDGER_SCHEMA_PATH','SEMANTIC_KIND_SOURCE_FINGERPRINT_CONTRACT_ID','createSchemaValidator','cachedSemanticKindLedgerSchemaValidator','fail','nonEmptyString','asRecord','parseSemanticKindLedger'])
const snippets:string[]=[]
const declarationPins:any[]=[]
for(const statement of stockSource.statements) {
  if(!ts.isVariableStatement(statement)) continue
  const selected=statement.declarationList.declarations.some((d:any)=>ts.isIdentifier(d.name)&&names.has(d.name.text))
  if(!selected) continue
  const text=statement.getText(stockSource)
  snippets.push(text)
  declarationPins.push({names:statement.declarationList.declarations.map((d:any)=>d.name.text),sha256:shaBytes(text),start:statement.getStart(stockSource),end:statement.end})
}
assert(snippets.length===names.size,'Exact stock parser dependency extraction incomplete')
const capsule=snippets.join('\n\n')
writeFileSync(resolve(out,'STOCK-PARSER.verbatim-declarations.ts'),capsule+'\n')
const js=ts.transpileModule(capsule,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
const actualParserFactory=new Function('exports','REPOSITORY_ROOT','resolve','Ajv2020','addFormats','readFileSync','fingerprintSemanticKindSourceGoal',js+'\nreturn parseSemanticKindLedger;')
const actualParser=actualParserFactory({},repo,resolve,Ajv2020,addFormats,readFileSync,stockModule.fingerprintSemanticKindSourceGoal)
const actualParsed=actualParser(read(ledgerPath),current,current.landscapeId,candidatePath)
assert(actualParsed.semanticKindByGoalId.size===578,'Actual stock parser did not accept all 578 decisions')

const normalized=authoring.normalizeCanonicalLandscape(current)
const canonicalDiagnostics=authoring.validateCanonicalLandscape(normalized)
const errors=canonicalDiagnostics.filter((d:any)=>d.severity==='error')
assert(errors.length===0,`Canonical parser errors: ${JSON.stringify(errors)}`)
const ajvRuntime=new Ajv2020({allErrors:true,strict:false})
const runtimeValidate=ajvRuntime.compile(read(runtimeSchema))
assert(runtimeValidate(current),`Canonical runtime schema errors: ${ajvRuntime.errorsText(runtimeValidate.errors)}`)
const dangling:any[]=[],cycles:any[]=[]
for(const goal of current.goals)for(const kind of ['requires','contains'])for(const target of goal[kind]??[])if(!afterById.has(target))dangling.push({goalId:goal.id,kind,target})
assert(dangling.length===0,`Unresolved current references: ${JSON.stringify(dangling)}`)
for(const relation of ['requires','contains']){
  const visited=new Set<string>(),visiting=new Set<string>()
  const visit=(id:string)=>{if(visiting.has(id)){cycles.push({relation,goalId:id});return}if(visited.has(id))return;visiting.add(id);for(const ref of afterById.get(id)[relation]??[])visit(ref);visiting.delete(id);visited.add(id)}
  for(const goal of current.goals)visit(goal.id)
}
assert(cycles.length===0,`Current relation cycles: ${JSON.stringify(cycles)}`)
const grignard=afterById.get('8edee6b6-9ead-515e-93f5-feada64522b2')
assert(actualParsed.semanticKindByGoalId.get(grignard.id)==='curricularAtomic','Grignard was excluded from the semantic denominator')
assert(newRows.filter((r:any)=>r.semanticKind==='curricularAtomic').every((r:any)=>(afterById.get(r.goalId).contains??[]).length===0),'A nonleaf remains in curricularAtomic')

const caps={role:'AUTHOR/technical inactive whole-goal semantic classification; no independent review claim',classificationOnly:true,decisionStatusMeaning:'The closed semantic-ledger parser requires authoritative for local classification rows. This is not Human Approval, release approval, source approval, goal-quality approval or evidence of learner execution.',noNormalPAMV:true,noSourceOrCourseProjection:true,noNativeOrCentralRun:true,noProductionOrHostOrGitHubWrite:true,HumanApproval:false,HumanTrial:false,m2RouteApproval:'The two original authored M2 bodies remain byte-identical. Their independent informed route/selection/placement review is still pending and is not granted by memory classification.',historicalSourceNotes:'Source/projection metadata are preserved. Grignard applicabilityProjection excluded is not used to remove a curricularAtomic body from the semantic denominator.'}
write('DECISIONS.actual11-whole-semantic-kind-judgments.json',{runId,...caps,count:semantic11.length,decisions:semantic11})
write('REBINDINGS.changed34-whole-before-after-kind-judgments.json',{runId,...caps,changedWholeBodies:changedWhole.length,changedStockSourceFingerprints:changedWhole.filter(r=>r.stockSourceFingerprintChanged).length,judgments:changedWhole})
write('RETENTIONS.exact541-original-decision-object-bytes.json',{runId,baselineLedger:pin(beforeLedgerPath),currentLedger:pin(ledgerPath),count:retain.length,retentions:retain,otherSameKindFingerprintRebindings:changedWhole.filter(r=>r.stockSourceFingerprintChanged&&r.beforeSemanticKind===r.afterSemanticKind).map(r=>({goalId:r.goalId,semanticKind:r.afterSemanticKind,explicitBeforeAfterJudgmentRequiredAndPresent:true,onlySourceFingerprintChangedInLedgerRow:true}))})
write('VALIDATION.actual-parser-schema-coverage-and-counts.json',{runId,runAt:new Date().toISOString(),...caps,canonicalGoalCount:current.goals.length,allOriginal576GoalBodiesAndOrderUnchanged:true,appendedWholeBodyIds:m2.newWholeGoals.map((g:any)=>g.id),existingContainsOrRequiresEditsDuringAppend:0,original570SemanticRowsFreshAtOwnBaseline:true,exactRetainedOriginalDecisionObjectBytes:retain.length,changedExistingWholeBodyJudgments:changedWhole.length,changedExistingStockFingerprints:changedWhole.filter(r=>r.stockSourceFingerprintChanged).length,newOrReclassifiedSemanticDecisions:semantic11.length,currentRuntimeSchemaValid:true,actualCanonicalNormalizerGoalCount:normalized.goals.length,actualCanonicalParserDiagnostics:canonicalDiagnostics,actualUnmodifiedPrivateSemanticParserExecuted:true,parserSource:pin(stockPath),verbatimParserDependencyDeclarations:declarationPins,semanticLedgerClosedSchemaValidatedByActualStockParser:true,currentSemanticCoverage:actualParsed.semanticKindByGoalId.size,counts,actualCurricularAtomicGoalIds:newRows.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId),denominatorMeaning:'Computed from all current semantic ledger rows; no expected curricularAtomic total is asserted by the constructor.',grignardStillCurricularAtomic:true,allCurricularAtomicRowsAreLeaves:true,danglingReferences:dangling,relationCycles:cycles,noneOfTheseChecksEstablishesM7:true})
const inputPins=[beforePath,beforeLedgerPath,whole576Path,m2Path,stockPath,'app/src/utils/authoring/canonicalAuthoring.ts',ontologySchema,runtimeSchema,fingerprintProfile,'AGENTS.md'].map(pin)
write('INPUTS.finite-pinlist.json',{runId,...caps,inputPins,sourceGoalFingerprintFunction:'actual imported fingerprintSemanticKindSourceGoal from app/scripts/goalBookModel.ts; no reimplementation',wholeGoalObjectDigestRule:'Audit digests use recursively sorted JSON keys; stock semantic-kind fingerprints use the actual function and are labelled separately.'})
write('SUMMARY.current578-local-semantic-classification.json',{runId,...caps,canonical:pin(candidatePath),semanticLedger:pin(ledgerPath),counts,actualDenominator:counts.curricularAtomic,actualNumeratorCalculated:false,semanticsOnlyNoM7Claim:true,unaffectedOriginalRowsExact:retain.length,changedExistingRowsWithActualBeforeAfterKindJudgment:changedWhole.length,substantiveNewOrReclassifiedDecisionCount:semantic11.length,remaining:['Original M2 informed independent route/selection/placement review remains pending.','Source, projection, normal D/P/A/M/V, native/central and host/resource acceptance remain separate unexecuted operations.'],unexpectedSemanticClassificationHolds:[]})
const outputFiles:string[]=[]
const walk=(dir:string)=>{for(const name of readdirSync(dir)){const path=resolve(dir,name);if(statSync(path).isDirectory())walk(path);else if(name!=='SEAL.finite-input-output-pins.json')outputFiles.push(relative(repo,path))}}
walk(out)
write('SEAL.finite-input-output-pins.json',{runId,role:'Finite exact-byte author/technical input-output seal; no scientific consensus or release claim',inputPins,outputPins:outputFiles.sort().map(pin),HumanApproval:false,HumanTrial:false})
console.log(JSON.stringify({runId,counts,canonical:pin(candidatePath),semanticLedger:pin(ledgerPath),changedWholeBodies:changedWhole.length,exactRetainedRows:retain.length,privateStockParserPassed:true,outputBytes:outputFiles.reduce((sum,path)=>sum+statSync(resolve(repo,path)).size,0)},null,2))
