import json, hashlib, datetime
from pathlib import Path
import jsonschema

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OLD=BASE/'biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1'
NEW=BASE/'biologie-health-twelve-two-targeted-metadata-raster-native-technical-successor-20261010-v2'
ROOT=BASE/'biologie-health-twelve-current353-genuine-independent-b-fresh-20261010-v1'
OUT=ROOT/'successor-two-v2'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
ROLE='/root/bio12_independent_b_fresh'
RUN='biologie-health-two-targeted-portable-current-genuine-b-20261010-v2'

def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bound(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,d):
 p=OUT/n
 if p.exists():raise RuntimeError('Preserve existing receipt '+str(p))
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 return p

assert sha(ROOT/'FIRST.seal.json')=='sha256:eb0c6e8bd410d91f1d1830dad991c6943688b936893718192d3d890ce7960613'
entry=NEW/'neutral-two-targeted-portable-current-context.entry.json'
freeze=NEW/'FINAL.two-targeted-portable-technical.freeze.json'
assert sha(entry)=='sha256:452be72c2207564d3596d81b5815b2e31e3e39ed04de1d4e89389137499903e1'
assert sha(freeze)=='sha256:4afa88e422e2370e7f74a5306fa754de3ce365294cc0d7fd25f2ad2d9c225802'
CAM=NEW/'native/two-targeted-portable-current-native/round-b'
campaign=read(CAM/'description-review-campaign.json')
inp=read(CAM/'description-review-input.json')
first={r['goalId']:r for r in [json.loads(x) for x in (ROOT/'description-review-records.FIRST.jsonl').read_text().splitlines()]}
science={x['goalId']:x for x in read(OLD/'science/twelve-whole-science.exact.json')['wholeGoalsAndProfilesAndCases']}
normalP={x['goalId']:x for x in [json.loads(s) for s in (NEW/'positive/two-targeted-current-context.P.pending.review.jsonl').read_text().splitlines() if s.strip()]}
canon=read(NEW/'candidate/current479-only-two-visual-metadata.inactive.json')
cg={x['id']:x for x in canon['goals']}
caps=read(NEW/'checks/two-portable-actual-whole-html-pdf-captures.technical.json')
capture={x['goalId']:x for x in caps['rows']}

judgments={
'6add2bde-b647-577d-a899-6fd62497656a':{
 'D':'Die tatsächliche aktuelle DE/EN-Beschreibung ist semantisch unverändert und in der neuen ganzen Seite konsistent. Die Medienkritik richtet sich nun sichtbar auf Druck und grenzt diesen von freiwilliger Körperdarstellung ab. Die Kriterien Würde, Grenzen und freie Entfaltung bleiben prüfbar; Beschreibung KEEP.',
 'P':'Die aktuelle normale P2 enthält dieselben drei Erwartungen und zwei vollständigen Fälle wie der selbst gelesene FIRST-Input. Beide Fälle wurden erneut vollständig DE/EN gelesen: private Aufnahme ist keine Publikationszustimmung, Druck entwertet Freiwilligkeit, Mediennormen rechtfertigen keine Körperabwertung. Das neue Raster steht diesen Lösungen nicht mehr entgegen. Transfers und 10-Punkte-Rubriken bleiben sachlich stimmig; AI-Kandidat, keine gemessene Leistung.',
 'V':'KEEP nach tatsächlicher Besichtigung des neuen Original-PNG und der proportionalen 360/680-Ansichten. Der Papierkorb mit durchgestrichenen Körper-/Aknebildern ist entfernt. Eine große Bearbeitungs-/Auswahlkarte trägt das gut erkennbare Wort Druck; ihr Pfeil wird an einem Handsymbol gestoppt. Die realen Porträts bleiben ohne rote Abwertung. Die respektierte Handgrenze, Würde/Privatsphäre und Unterstützung sind klar. Druck, nicht der Wert eines Körpers, ist sichtbar das kritisierte Element. Bearbeitung als frei gewählter Ausdruck bleibt möglich; die Metadaten stellen dies richtig klar.',
 'publicMeta':'Die Beschreibung benennt ausdrücklich äußerlichen Druck/normierende Darstellung und verneint eine Körperabwertung sowie pauschale Verurteilung jeder Bearbeitung. Der alternative Text beschreibt sichtbare Grenzgeste, Bearbeitungskarte, Druckpfeil und respektierte Figuren korrekt. Die knappe deutsche Pflichtbeschriftung bleibt bei 360 Pixeln lesbar. Kandidat/CC-BY-4.0 ist konsistent; keine Veröffentlichung oder menschliche Freigabe wird behauptet.',
 'native':'Aktuelle komplette operative portable HTML- und physische PDF-Zielseite tatsächlich gesehen: aktuelles Bild, unveränderte Beschreibung, Geltung, Breadcrumb und externe Voraussetzung sind sichtbar und nicht beschnitten. Die neue Bilddeutung unterstützt die beschriebene Leistung. Der FIRST-V-Befund ist für diese exakt gebundenen Nachfolgerbytes behoben.'},
'a6f2bcaf-df2d-5144-aa8f-49396b12d31b':{
 'D':'Die aktuelle DE/EN-Beschreibung bleibt unverändert eine Erklärung der menschlichen Entstehungs- und Entwicklungsfolge. Der neue öffentliche Bildtext nennt die zeitliche Trennung und die unmaßstäbliche Darstellung ausdrücklich. Beschreibung KEEP; dies genehmigt keine breitere Source-Zuordnung.',
 'P':'Die aktuelle normale P2 trägt dieselben drei Erwartungen; die zwei vollständigen DE/EN-Fälle wurden erneut gelesen. Orts-/Zeitplan und Versorgungsmodell liefern zusammen Befruchtung, Teilung/Einnistung und Plazentaaustausch; Modellgrößen sind keine Messung. Case1 allein prüft nicht jeden Versorgungsaspekt, Case2 allein nicht die Befruchtungslokalisation. Evidenz pro gefordertem Aspekt bleibt nötig. Aktuelle Metadaten passen zu den unveränderten Lösungen und Transfers.',
 'V':'KEEP nach erneutem tatsächlichen Original-/360-/680-Viewing. Das PNG ist exakt der zuvor unabhängig geprüfte v2-Raster: zeitlich getrennte Gametenverschmelzung, Teilungsfolge und späterer eingewachsener Embryo. Kein falscher simultaner Mehrlingsbefund. Der mittlere rote Kreis ist ein schematisches Zeitfenster und keine anatomische Ortsbehauptung. Die neue öffentliche Erläuterung macht dies explizit. Kein neuer konkreter Bildfehler sichtbar.',
 'publicMeta':'Beschreibung und Alt-Text nennen Befruchtung im Eileiter, frühe Teilungen bis zur Blastozyste und späteren Embryo mit Plazentaverbindung. Sie kennzeichnen alle Vergrößerungen als schematisch/unmaßstäblich und das mittlere Feld ohne anatomischen Ortsanspruch. So wird die tatsächliche Darstellung ohne sichtbaren Entwicklungsfehlschluss beschrieben. CC-BY-4.0 und candidate sind konsistent und keine Human Approval.',
 'native':'Aktuelle komplette operative portable HTML-/PDF-Zielseite tatsächlich gesehen. Unveränderter erklärender Zieltext und das unveränderte akzeptable PNG passen zusammen. Voraussetzung körperliche Pubertät und nachfolgendes Schwangerschafts-/Geburtsziel sind korrekt als außerhalb dieses Zweierbuchs kenntlich; keine Bildbeschneidung oder neue Layoutschwäche.'}}

records=[]
receipts=[]
for g in inp['goals']:
 gid=g['goalId']; j=judgments[gid]; prev=first[gid]
 assert all(g[k]==prev[k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'])
 assert normalP[gid]['profile']==science[gid]['profile']
 r={'$schema':prev['$schema'],'schemaVersion':1,'recordId':RUN+'.'+gid,'runId':RUN,
    'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
    'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
 r.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
 r.update({'decision':'keep','understandingEvidence':prev['understandingEvidence'],'rationale':j['D'],
           'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none',
           'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 jsonschema.Draft202012Validator(read(CAM/'contracts/goal-description-review-record.schema.json')).validate(r)
 records.append(r)
 orig=NEW/'public/assets/goal-visualizations/biologie'/gid/(gid+'.png')
 views=[dict(bound(orig),role='original',actuallyViewed=True,width=1672,height=941)]
 for w in [360,680]:views.append(dict(bound(OUT/(gid+f'.{w}.png')),role=str(w),width=w,actuallyViewed=True))
 cr=capture[gid]
 for k in ['htmlCapture','pdfCapture','sourceHtml','sourcePdf']:
  assert sha(Path(cr[k]['path']))==cr[k]['sha256']
 receipts.append({'goalId':gid,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
   'D':{'decision':'keep','judgment':j['D']},
   'P':{'decision':'keep_candidate','judgment':j['P'],'profileFingerprint':normalP[gid]['profileFingerprint'],
        'reviewInputFingerprint':normalP[gid]['reviewInputFingerprint'],'requiredExpectationIds':['e1','e2','e3'],
        'casesActuallyRereadWholeDeEn':[x['id'] for x in science[gid]['wholeMaterialCases']],
        'evidenceLevel':'E1','maximumClaimScope':'G1','reviewAuthority':'ai_candidate','status':'needs_human_review'},
   'V':{'decision':'keep','judgment':j['V'],'actualOriginal360680':views},
   'publicMeta':{'decision':'keep','judgment':j['publicMeta'],'actualResourceLinks':cg[gid]['resourceLinks']},
   'native':{'decision':'keep_candidate','judgment':j['native'],'actualWholeHtmlPage':cr['htmlCapture'],
       'actualWholePdfPage':cr['pdfCapture'],'actualPhysicalPdfPage':cr['physicalPdfPage'],'actuallyViewedWholePages':True},
   'A':'Unchanged integrated semantic goal; the individual FIRST atomicity judgment remains applicable.',
   'M':'Unchanged no_memory_needed rationale; current metadata does not introduce a compulsory recall catalogue.',
   'source':'Unchanged source body; this targeted V/meta review does not resolve the FIRST source findings.',
   'humanApproved':0,'humanApproval':False,'humanTrial':False,'strictGain':0})
p=OUT/'description-review-records.v2.jsonl'
if p.exists():raise RuntimeError('No overwrite')
p.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
write('description-review-run.v2.json', {'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'runId':RUN,
 'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],
 'bookDigest':campaign['bookDigest'],'reviewInputFingerprint':campaign['reviewInputFingerprint'],
 'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'recordSchemaDigest':campaign['recordSchemaDigest'],'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],
 'reviewPass':'targeted_current_successor_followup','blindToOtherReviews':True,
 'independenceGroupId':campaign['independenceGroupId'],'priorOwnFIRST':bound(ROOT/'FIRST.seal.json'),
 'recordCount':2,'schemaValidatedRecords':2,'records':bound(p),
 'humanApproved':0,'humanApproval':False,'humanTrial':False,'strictGain':0})

a={x['goalId']:x for x in read(OLD/'native/current394-after.actual-normal-model.json')['pages']}
b={x['goalId']:x for x in read(NEW/'native/current394-two-targeted.actual-normal-model.json')['pages']}
delta=[g for g in a if a[g]!=b[g]]
protected=read(OLD/'inputs/current353-protected.ids.json')['current353']
assert set(delta)==set(judgments)
assert all(a[g]==b[g] for g in protected)
write('actual-current-two-P-D-V-meta-native.v2.review.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'reviewPass':'targeted_current_successor_followup',
 'priorOwnFIRST':bound(ROOT/'FIRST.seal.json'),'blindToOtherReviews':True,
 'currentEntry':bound(entry),'operativeCurrentNativeBatch':bound(NEW/'native/two-targeted-portable-current.batch.config.json'),
 'currentNormalP2':bound(NEW/'positive/two-targeted-current-context.P.pending.review.jsonl'),
 'actuallyRereadWholeCaseInput':bound(OLD/'science/twelve-whole-science.exact.json'),
 'records':receipts,'DKeep':2,'PTextCandidatesKeep':2,'VKeep':2,'publicMetaKeep':2,
 'actualOriginal360680Viewed':6,'actualWholeHtmlGoalPagesViewed':2,'actualWholePdfGoalPagesViewed':2,
 'independentPreservationComparison':{
   'before':bound(OLD/'native/current394-after.actual-normal-model.json'),
   'after':bound(NEW/'native/current394-two-targeted.actual-normal-model.json'),
   'actualChangedGoalIds':delta,'other392Exact':True,'protected353Exact':True,
   'changedKeys':{g:[k for k in a[g] if a[g][k]!=b[g][k]] for g in delta}},
 'resolvedOwnFinding':'FIRST image-block for 6add2bde is resolved for the new exact PNG and reviewed current native context. Reproduction current public explanation is truthful and its raster is preserved.',
 'openOwnFindings':'FIRST source186 findings remain pending separate targeted source inputs; no source closure inferred from this image/meta successor.',
 'humanApproved':0,'humanApproval':False,'humanTrial':False,'strictGain':0,'wholeCourseSourceApproval':False})
own=[p for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='TARGETED.v2.seal.json']
seal=write('TARGETED.v2.seal.json', {'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'runId':RUN,
 'status':'sealed_genuine_current_targeted_ai_candidate','blindToOtherReviews':True,
 'priorOwnFIRST':bound(ROOT/'FIRST.seal.json'),'currentEntry':bound(entry),'currentTechnicalFreeze':bound(freeze),
 'ownSealedArtifacts':[bound(p) for p in own],
 'actualReview':'Own direct inspection of current six raster views, current public metadata, four whole DE/EN cases and four whole HTML/PDF goal-page captures; semantic descriptions and profiles kept after substantive re-evaluation.',
 'DKeep':2,'PKeep':2,'VKeep':2,'sourceClosure':'pending own FIRST targeted source findings',
 'protected353Exact':True,'other392Exact':True,'humanApproved':0,'humanApproval':False,
 'humanTrial':False,'strictGain':0,'activeWrites':False,'wholeCourseSourceApproval':False})
print(json.dumps({'seal':str(seal),'sha256':sha(seal),'records':2,'VKeep':2,'source':'FIRST source findings still open'},ensure_ascii=False))
