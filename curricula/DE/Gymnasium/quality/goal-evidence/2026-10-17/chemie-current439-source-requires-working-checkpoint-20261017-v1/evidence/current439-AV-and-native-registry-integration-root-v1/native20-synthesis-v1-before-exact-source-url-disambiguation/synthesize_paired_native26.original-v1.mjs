import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const O=dirname(fileURLToPath(import.meta.url));
const N=join(O,'capsule');
const stage=JSON.parse(await readFile(join(O,'RECEIPT.exact-independent-native20-native6-output-staging.json'),'utf8'));
const stock=await import(join(N,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const resolutionTools=await import(join(N,'app/scripts/validateGoalDescriptionDualRoundResolution.ts'));
const manifestTools=await import(join(N,'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'));
const synthesisTools=await import(join(N,'app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'));
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const bytes=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
async function exactNew(p,b){
  try {const old=await readFile(p);if(!old.equals(b))throw Error('Existing different artifact: '+p);}
  catch(e){if(e.code!=='ENOENT')throw e;await writeFile(p,b,{flag:'wx'});}
}
const notes={
'413040cd-ba74-5227-948c-a778b0bd0f56':['first','Beide Runden begründen dieselbe temperaturgebundene Löslichkeitsbilanz einschließlich klarer Sättigung und Restkapazität. Runde A hält zusätzlich Wasserzugabe und fehlende Temperaturdaten ausdrücklich auseinander.','Both rounds support the same temperature-bound solubility balance including clear saturation and remaining capacity. Round A explicitly separates solvent addition from missing temperature data.'],
'a25a19ed-aec3-59cc-ae28-31d98746cb9d':['first','Beide Urteile verbinden Körperwirkung und schrittweisen Ethanolabbau zu einem begrenzten Alltagsrisikourteil. Runde A bewahrt ausdrücklich die Grenze zwischen äußeren Anwendungen, Konsum und unzulässiger sicherer Dosis oder Abbauzeit.','Both judgments connect bodily effects and stepwise ethanol metabolism to a bounded everyday risk assessment. Round A explicitly preserves distinctions between external use, consumption and unsupported safe-dose or elimination-time claims.'],
'a96e9b3d-a02d-54f8-a3d3-318e0ea5180c':['first','Die Runden stimmen in Silanolkondensation, endlichen Ketten und begrenztem Struktur-Eigenschafts-Vergleich überein. Runde A erhält die konkrete Endgruppen- und Vernetzungsunterscheidung; praktische Synthese wird nicht behauptet.','The rounds agree on silanol condensation, finite chains and bounded structure-property comparisons. Round A retains the specific terminal-group and crosslink distinctions without claiming practical synthesis.'],
'6413429b-53d8-5ad1-9af6-d0e562cbf0f5':['first','Beide Runden grenzen Schichtdicke, Partikelgröße, Chemie, Struktur sowie Kontakt- und Abrollwinkel konsistent ab. Runde A benennt den tatsächlichen Kontrollvergleich und verhindert einen unbelegten Selbstreinigungsnachweis.','Both rounds consistently separate film thickness, particle size, chemistry, structure, contact angle and roll-off angle. Round A identifies the actual controlled comparison and excludes unsupported proof of self-cleaning.'],
'6eba90b5-d4a6-5625-be61-e7f30f7eb964':['first','Vier Verfahren dienen in beiden Reviews einer gemeinsamen Prozess-Material-Zuordnung. Runde A übernimmt die Materialzustands- und Vorläufergrenze ausdrücklich; eine praktische Maschinenqualifikation wird nicht aus einer Beschreibung abgeleitet.','In both reviews the four processes serve one process-material assignment competence. Round A explicitly retains material-state and precursor limits without inferring practical machine qualification from description.'],
'73cbd4d8-5da1-5e54-85ce-c88e7b1613fe':['first','Beide Runden unterscheiden Konjugation, mobile Träger, Dotierung und reale Transportbedingungen. Runde A verknüpft die konkreten Gegenionen-, Unterbrechungs- und Kontaktkontrollen; beide verwerfen ein universelles Leitfähigkeitsversprechen.','Both rounds distinguish conjugation, mobile carriers, doping and real transport conditions. Round A connects the specific counterion, interruption and contact controls; neither promises universal conductivity.'],
'14f1fe97-0585-5738-845e-9c49173d8afa':['first','Die kriteriengebundene Werkstoffentscheidung ist in beiden Runden eine einzelne Kompetenz. Runde A erhält gleiche Geometrie, Alterung und Einsatzgrenzen als Begründungsbedingungen statt einer universellen Polymer-Metall-Rangfolge.','Both rounds treat the criteria-based material decision as one competence. Round A retains equal geometry, ageing and service limits instead of a universal polymer-versus-metal ranking.'],
'4955f745-b946-5d3d-82d6-5e52dc8549a3':['first','Beide Reviews verbinden 1,4-Addition, Restdoppelbindungen und Schwefelvernetzung mit begrenzter Elastizität. Runde A hält vorgegebene Materialidentität und die Temperaturgrenze relativ zu Tg sichtbar; kein Versuchsvollzug wird behauptet.','Both reviews connect 1,4 addition, residual double bonds and sulfur crosslinking to bounded elasticity. Round A retains supplied material identity and the temperature limit relative to Tg without claiming experimental execution.'],
'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7':['first','Die Runden bestätigen die Unterscheidung regenerierter Cellulose von dauerhaft acetylierter Cellulose. Runde A erhält lokale Stoffbilanz, vorübergehendes Xanthat und Morphologiegrenzen, die mit Runde B vereinbar sind.','The rounds confirm the distinction between regenerated and persistently acetylated cellulose. Round A retains local balance, temporary xanthate formation and morphology limits compatible with round B.'],
'e0944fbb-0761-5f9c-afaa-3d4713ed1bed':['first','Beide Runden verlangen wirkliche eigene starke und schwache Säurekurven unter Aufsicht. Runde A erhält Kalibrierung, Äquivalenzbefund und Unsicherheit; Schema und Näherung ersetzen weder Rohdaten noch Durchführung.','Both rounds require genuine personal strong- and weak-acid curves under supervision. Round A retains calibration, equivalence evidence and uncertainty; the diagram and approximation replace neither raw data nor execution.'],
'0e3f849b-133d-57da-882c-0d67c3eb05b8':['first','Beide Runden bestätigen den qualitativen reaktionswirksamen Ladungs-Stoffumsatz-Zusammenhang und die Nebenreaktionsgrenze. Runde A erhält die getrennte Stoffmengen-/Massendeutung. Der erst nach FIRST20 gefundene Seitenlokatorfehler bleibt ein separat zu korrigierender Quellenmetadatenbefund und wird hier nicht als behoben ausgegeben.','Both rounds confirm the qualitative reaction-effective charge-to-conversion relationship and side-reaction limit. Round A retains separate amount and mass interpretation. The source-page locator error found only after FIRST20 remains a separate metadata correction and is not represented as fixed here.'],
'c61b2a7a-fb0f-5a76-92e9-771c789fa816':['first','Beide Urteile bewahren die tatsächliche beaufsichtigte Pufferuntersuchung mit getrennten Proben. Runde A erhält Dosis-, Volumen- und Reservegrenzen; qualitative Bildpfeile sind weder persönliche Messung noch praktische Erfüllung.','Both judgments retain actual supervised buffer investigation using separate portions. Round A retains dose, volume and reserve limits; qualitative image arrows establish neither personal measurements nor practical attainment.'],
'2d16528c-1424-5999-b3d2-af4593a147fc':['second','Beide Runden stimmen im endlichen, ladungserhaltenden Zeolith-Ionenaustausch überein. Runde B wird gewählt, weil sie die tatsächliche aktuelle HE-Rohgeltung ausdrücklich benennt. Die weiteren Quellenkontexte in Runde A werden dadurch nicht zu amtlicher Pflicht oder bereits geprüfter Länderprojektion erweitert.','Both rounds agree on finite, charge-conserving zeolite ion exchange. Round B is selected because it explicitly identifies the actual current HE raw applicability. Additional source contexts mentioned in round A do not become official requirements or an accepted jurisdiction projection.'],
'54bc6ca0-b770-5f10-ac54-bcc1d04298f5':['first','Die Reviews bestätigen dieselbe Unterscheidung von Energieabgabe und selektiver Lichtaufnahme. Runde A hält Beleuchtungswechsel, nichtfluoreszierenden Fall und tatsächlich austretendes Licht getrennt; eine frühere zurückgezogene D-Bindung wird durch diese Synthese noch nicht administrativ entfernt.','The reviews confirm the same distinction between energy emission and selective light absorption. Round A separates source changes, nonfluorescent cases and actual outgoing light; this synthesis does not administratively remove a former withdrawn D binding.'],
'87d8cc68-fe82-5273-9e43-c18b566ecb6c':['first','Beide Runden verbinden erlaubten Energieabstand, absorbierte Wellenlänge und Restlicht. Runde A erhält die sichtbare/UV-Grenze und die begrenzte Aussage einzelner Banden. Historische Rücknahmen und deren Nachfolgekette bleiben bis zur gesonderten Prüfung erhalten.','Both rounds connect allowed energy gaps, absorbed wavelength and remaining light. Round A retains visible-versus-UV limits and the bounded meaning of a single band. Historical withdrawals and their successor chain remain until separate validation.'],
'c8f51eac-c131-58a8-8d00-0fcbbe4bc18c':['first','Die beiden Reviews stimmen für das ausdrücklich opake, nichtemittierende Reflexionsmodell überein. Runde A erhält Beleuchtung, fehlende Spektralanteile und begrenzte Dreipunktdaten, ohne eine exakte reale Farbkoordinate zu behaupten.','Both reviews agree for the explicitly opaque nonemitting reflection model. Round A retains illumination, absent spectral components and bounded three-point data without claiming an exact real colour coordinate.'],
'61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3':['first','Beide Runden verlangen stoffbezogene, expositionsgerechte Quellen statt eines Herkunftsurteils. Runde A hält den tatsächlichen Rechercheabruf, URL/Abschnitt/Datum und fehlende Daten ausdrücklich offen, wenn kein Beleg vorliegt; KI-QS ersetzt keine Lernendenrecherche.','Both rounds require substance-specific exposure-appropriate sources instead of an origin-based verdict. Round A explicitly requires actual retrieval, URL/section/date and acknowledges missing data; AI QA does not replace learner research.'],
'64b03eff-a967-54a1-ace3-89cb7650a65c':['first','Beide Urteile erklären Substituenten über die Kopplung des π-Systems und schließen ein universelles Rotverschiebungsgesetz aus. Runde A erhält Protonierungs- und sp³-Gegenfälle. Die historische D-Rücknahme wird erst nach gesondert gültiger Nachfolgekette behandelt.','Both judgments explain substituents through pi-system coupling and exclude a universal red-shift rule. Round A retains protonation and sp3 counterexamples. The historical D withdrawal requires a separately valid successor chain.'],
'f0ba30a8-84b3-5915-bf85-6c3a176064d2':['first','Beide Runden trennen Bandenlage und Intensität sowie Messbedingungen und Modellzuordnung. Runde A erhält Konzentration, Weglänge, Überlagerung und Rastergrenzen; ein Beispielspektrum wird nicht als selbst durchgeführte Messung gewertet.','Both rounds separate band position, intensity, measurement conditions and model attribution. Round A retains concentration, path length, superposition and grid limits; an example spectrum is not treated as a personally performed measurement.'],
'981242bb-a729-5701-b02d-c2f7f489e5af':['first','Die Runden bestätigen Diazotierung und Kupplung als zusammengehörige Azoroute mit begründetem mechanistischem Abstraktionsgrad. Runde A hält bereitgestellte Zwischenstufen, Atom-/Ladungsbilanz und Rearomatisierung sichtbar; eine vereinfachte Bildroute ersetzt die Eigenleistung nicht.','The rounds confirm diazotisation and coupling as one azo route with a justified mechanistic abstraction level. Round A retains supplied intermediates, atom/charge balance and rearomatisation; a simplified image route does not replace personal performance.'],
'9b56d01e-c2d7-51d8-b78e-237592c1ed20':['first','Beide unabhängigen Reviews bestätigen den zusätzlichen Winkelschritt zu ausdrücklich gegebenen Gestalten und Domänen. Runde A trennt ihn von der Gestaltvorleistung und bindet freie-Paar-Abweichung sowie Modell-/Messgrenze; kein exakter Messwinkel wird aus EPA allein behauptet.','Both independent reviews confirm the additional angle step for explicitly supplied shapes and domains. Round A distinguishes it from prior shape classification and retains lone-pair deviation and model-versus-measurement limits; VSEPR alone is not claimed to yield an exact measured angle.'],
'6966df95-f125-5ecc-af8e-0442545d9f17':['first','Beide Runden bestätigen die gemeinsame amphiphile Struktur-Erklärung und unterscheiden normale Micellen von emulgiertem Öl. Runde A hält den neuen Phasenkontakt und die fehlende Stabilitätsgarantie ausdrücklich getrennt; fakultativer Quellenstatus bleibt erhalten.','Both rounds confirm the common amphiphilic structure explanation and distinguish normal micelles from emulsified oil. Round A explicitly separates the fresh phase contact from unsupported stability guarantees; official optionality remains intact.'],
'f0f67a7a-b06a-50b9-8edc-1f2a0d97520d':['first','Beide Reviews bestätigen Orbitalmodell, Mesomerie und gemeinsame energetische Vergleichsbasis. Runde A erhält den eigenständigen Zuwachs zur Resonanzvorleistung und den Diengegenfall; die konkreten 152-kJ-Fälle bleiben eigene Operationalisierung innerhalb der unterschiedlich detaillierten Länderquellen.','Both reviews confirm orbital model, resonance and a common energetic reference. Round A retains the advance beyond prior resonance work and the diene counterexample; the specific 152-kJ cases remain authored operationalisation within differently detailed jurisdiction sources.'],
'17ab1148-7383-5cab-8b91-73aff795f1e4':['first','Beide Runden halten die kurze Benennung der elektrophilen aromatischen Substitution für eindeutig und das P für passend konkretisiert. Runde A bindet σ-Komplex, Protonenabgabe und Rearomatisierung; HE-LK-Bromierung und fakultativer gemeinsamer Q2.3-Kontext werden nicht zu einem universellen Q1-GK-Auftrag vermischt.','Both rounds find the concise named electrophilic aromatic substitution competence clear and appropriately operationalised by P. Round A retains sigma complex, proton loss and rearomatisation; HE advanced bromination and optional shared Q2.3 context are not conflated into a universal Q1 basic-course requirement.'],
'93b914d4-747d-5b22-90ff-ac6320514b44':['first','Beide unabhängigen Urteile bestätigen die zusammenhängende Wasserstoff-Speicherkettenbewertung. Runde A hält Energiequelle/Energieträger, gemeinsame Energiebasis und begrenztes Nachhaltigkeitsurteil getrennt; zusätzliche Speicherfälle sind keine allein aus einer Quellenklausel abgeleitete Vollpflicht.','Both independent judgments confirm the integrated hydrogen storage-chain assessment. Round A separates energy source from carrier, uses a common energy basis and bounds sustainability claims; additional storage cases are not a complete mandate inferred from one source clause.'],
'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f':['second','Beide Runden bestätigen die neue eigenständig entwickelte Konzentrationsbilanz einschließlich Blindwert, Aliquot und Verdünnung. Runde B wird gewählt, weil der Transfer gute Wiederfindung ausdrücklich von Einzelmetallselektivität unterscheidet. Tatsächliche EDTA-Handhabung, örtliche Freigabe und BY-eA-Geltung bleiben verbindlich; Papierdaten erfüllen die Durchführung nicht.','Both rounds confirm the newly developed independent concentration balance including blank, aliquot and dilution. Round B is selected because its transfer explicitly distinguishes good recovery from individual-metal selectivity. Actual EDTA handling, local authorization and BY advanced-course scope remain required; paper data do not establish execution.'],
};

const results=[];
for(const staged of stage.staged){
  const dual=await stock.materializeGoalDescriptionRolloutBatchDualSummary(staged.configRelativePath,true);
  const root=dual.prepared.outputDirectory;
  const sourceMap=new Map();
  for(const goalId of dual.prepared.manifest.goalIds){
    const first=resolutionTools.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId,label:'First'});
    const second=resolutionTools.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId,label:'Second'});
    if(first.errors.length||second.errors.length||!first.source||!second.source)throw Error(JSON.stringify({first,second}));
    if(first.source.decision!=='keep'||second.source.decision!=='keep')throw Error('Unresolved decision: '+goalId);
    sourceMap.set(goalId,{first:first.source,second:second.source});
  }
  const pairs=[...dual.first.resultPairs,...dual.second.resultPairs];
  const synthesizedAt=new Date(Math.max(...pairs.map(x=>Date.parse(x.run.completedAt)))+1000).toISOString();
  const firstSources=sourceMap.get(staged.goalIds[0]);
  const manifest={
    $schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',
    manifestId:'chemie-current439-'+staged.key+'-paired-root-synthesis-20261017-v1',
    authority:'ai_synthesis',synthesizedBy:'Codex root synthesis after both blind independent current-input reviews; no human attestation',synthesizedAt,
    batch:{batchId:dual.prepared.manifest.batchId,
      batchManifestDigest:sha(await readFile(join(root,'batch-manifest.json'))),
      configDigest:dual.prepared.manifest.configDigest,
      bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest:dual.first.input.bookDigest,
      reviewInputFingerprint:dual.first.input.reviewInputFingerprint,
      dualSummaryDigest:sha(dual.bytes),
      canonicalLandscapeDigest:sha(await readFile(join(N,dual.prepared.manifest.source.landscapePath)))},
    rounds:{first:manifestTools.buildGoalDescriptionRolloutSynthesisRoundBinding(firstSources.first.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second:manifestTools.buildGoalDescriptionRolloutSynthesisRoundBinding(firstSources.second.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)},
    decisions:dual.prepared.manifest.goalIds.map(goalId=>{
      const goal=dual.first.input.goals.find(x=>x.goalId===goalId);
      const s=sourceMap.get(goalId),note=notes[goalId];
      if(!note)throw Error('Missing actual synthesis note '+goalId);
      return {decisionId:'chemie-current439-'+staged.key+'-root-'+goalId+'-20261017-v1',goalId,effectiveSemanticKind:'curricularAtomic',
        goalFingerprint:goal.goalFingerprint,pageFingerprint:goal.pageFingerprint,
        goalReviewContextFingerprint:resolutionTools.fingerprintGoalDescriptionReviewContext(goal),
        finalText:{titleDe:goal.currentTitleDe,titleEn:goal.currentTitleEn,descriptionDe:goal.currentDescriptionDe,descriptionEn:goal.currentDescriptionEn},
        resolutionDecision:'keep_current',evidenceRound:note[0],
        records:{first:{recordId:s.first.binding.recordId,recordDigest:s.first.binding.recordDigest},second:{recordId:s.second.binding.recordId,recordDigest:s.second.binding.recordDigest}},
        rationaleDe:note[1],rationaleEn:note[2]};
    })
  };
  manifest.manifestFingerprint=manifestTools.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifest);
  const structure=await manifestTools.validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest);
  if(structure.errors.length)throw Error(structure.errors.join(' | '));
  const manifestPath='synthesis-decision-manifest.json',manifestBytes=bytes(manifest);
  await exactNew(join(root,manifestPath),manifestBytes);
  for(const decision of manifest.decisions){
    const sources=sourceMap.get(decision.goalId);
    const synthesis=synthesisTools.buildGoalDescriptionRolloutResolutionSynthesis({batchId:manifest.batch.batchId,manifest,decision,
      summaryGoal:dual.summary.goals.find(x=>x.goalId===decision.goalId),firstSource:sources.first,secondSource:sources.second});
    const resolution=resolutionTools.buildGoalDescriptionDualRoundResolution({resolutionId:decision.decisionId,goalId:decision.goalId,
      effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,
      firstSource:sources.first,secondSource:sources.second,
      synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestPath,manifestId:manifest.manifestId,manifestDigest:sha(manifestBytes),manifestFingerprint:manifest.manifestFingerprint,decisionId:decision.decisionId}});
    if(resolution.status!=='resolved')throw Error('Open resolution '+decision.goalId);
    await exactNew(join(root,'resolutions',decision.goalId+'.resolution.json'),bytes(resolution));
  }
  const final=await stock.materializeGoalDescriptionRolloutBatchResolutionIndex(staged.configRelativePath,true);
  const indexBytes=await readFile(join(root,'resolution-index.json'));
  results.push({key:staged.key,config:staged.configRelativePath,root:staged.rootRelativePath,resolutionCount:manifest.decisions.length,
    summaryDigest:sha(dual.bytes),manifestDigest:sha(manifestBytes),manifestFingerprint:manifest.manifestFingerprint,
    indexDigest:sha(indexBytes),index:JSON.parse(indexBytes),synthesizedAt,
    independentScienceReviews:manifest.decisions.length*2,humanApproval:false,centralRegistered:false,
    sourceMetadataFindingPending:staged.key==='native20'?['0e3f849b-133d-57da-882c-0d67c3eb05b8']:[]});
  console.log(JSON.stringify({key:staged.key,resolvedCurrent:manifest.decisions.length,indexDigest:sha(indexBytes)}));
}
for(const p of stage.sourceGuards){if(sha(await readFile(p.path))!=='sha256:'+p.sha256)throw Error('Foreign source drift: '+p.path);}
const receipt={role:'Actual stock-finalized current native26 paired AI synthesis; no global M7 claim',createdAtUTC:new Date().toISOString(),results,
  verifiedUnchangedForeignPins:stage.sourceGuards.length,newGoalTextsAuthored:0,newPositiveProfilesAuthored:0,
  centralFullFiveGateNetIncreaseNotYetMeasured:true,globalWithdrawalsOrSupersessionsChanged:false,humanApproval:false};
await writeFile(join(O,'RECEIPT.actual-stock-native20-native6-paired-synthesis.json'),bytes(receipt),{flag:'wx'});
console.log(JSON.stringify({receiptSha:sha(bytes(receipt)),pairedCurrentDescriptions:26,centralRegistered:false}));
