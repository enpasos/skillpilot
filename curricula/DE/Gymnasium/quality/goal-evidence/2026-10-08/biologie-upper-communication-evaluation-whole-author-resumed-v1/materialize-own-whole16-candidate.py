# SPDX-License-Identifier: Apache-2.0
"""Own inactive candidate authoring, ordinary P tooling owns all P fingerprints."""
import copy,hashlib,html,json,re,runpy,subprocess
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent; REL=OWN.relative_to(ROOT).as_posix()
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
CRITERIA='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
STAMP=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
REVIEW='biologie-upper-communication-evaluation-whole-author-resumed-v1'
def write(path,data):
    p=OWN/path;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def binding(path):
    p=ROOT/path;b=p.read_bytes();return dict(path=path,sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def copy_bound(path,name):
    b=binding(path);p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((ROOT/path).read_bytes());return {**b,'immutableCopyPath':p.relative_to(ROOT).as_posix()}

# Readable spacing is applied only to our unsealed authored text, never canonical text.
REPLACEMENTS={
 'beobachtetenwir':'beobachteten wir','singlecondition':'single condition','previousspecies':'previous species','newdata':'new data','lightrelationship':'light relationship','universalspecies':'universal species','universalplant':'universal plant','priorseries':'prior series','complete records':'complete records','notwendigeBedingung':'notwendige Bedingung','jedeKeimung':'jede Keimung','diesesModells':'dieses Modells','Wirksamkeitsnachweis':'Wirksamkeitsnachweis','brauchtniemalsLicht':'braucht niemals Licht','eineBedingung':'eine Bedingung','eineArtregel':'eine Artregel','eineGrößenordnung':'eine Größenordnung','keineuniversellePflanzenregel':'keine universelle Pflanzenregel','starkenLichtbezug':'starken Lichtbezug','fehlendenDaten':'fehlenden Daten','dieArt':'die Art','DieArt':'Die Art','dieserArt':'dieser Art','frühereArtantwort':'frühere Artantwort','diefrühereSerie':'die frühere Serie','vierDunkelwerte':'vier Dunkelwerte','imDunkeln':'im Dunkeln','imLicht':'im Licht','same species':'same species','same20':'same20','light24':'light24','dunkel22':'dunkel22','myposition':'my position','TheArt':'The Art','einzelneArt':'einzelne Art','auchimDunkeln':'auch im Dunkeln','hierauch':'hier auch','fürdiese':'für diese','fürDiese':'für diese','untersuchteArt':'untersuchte Art','aufuntersuchteArt':'auf untersuchte Art','Standpunkt':'Standpunkt','necessaryCondition':'necessary condition','lightrelationship':'light relationship','newdata':'new data','missingdata':'missing data','lightneed':'light need','nur':'nur','morethan':'more than','for thatspecies':'for that species','thisseries':'this series','indarknesshere':'in darkness here','fromnecessary':'from necessary','fromnever':'from never','tospeaker':'to speaker','toA':'to A','toB':'to B','mehrals':'mehr als','undnotwendig':'und notwendig','inDieserSerie':'in dieser Serie','undniemals':'und niemals','imModell':'im Modell','Tag6':'Tag6','sechstenTag':'sechsten Tag','eigentlicherAutor':'eigentlicher Autor','eigeneGrafik':'eigene Grafik','eigenesModell':'eigenes Modell','ausTabelle':'aus Tabelle','mitmg':'mit mg','mitcomplete':'mit complete','withcomplete':'with complete','withmg':'with mg','mehrBesuche':'mehr Besuche','keineArtzählung':'keine Artzählung','hightraffic':'high-traffic','inParkflächen':'in Parkflächen','wirktnie':'wirkt nie','freshspecies':'fresh species','frischenGegenfall':'frischen Gegenfall','fourdark':'four dark','30Samen':'30Samen','ofsame':'of same','whichsource':'which source','untersuchtenArt':'untersuchten Art','aufuntersuchte':'auf untersuchte',
}
def readable(v):
    if isinstance(v,dict):return {k:readable(w) if k in ('de','en') or isinstance(w,(dict,list,tuple)) else w for k,w in v.items()}
    if isinstance(v,list):return [readable(w) for w in v]
    if isinstance(v,tuple):return tuple(readable(w) for w in v)
    if not isinstance(v,str):return v
    for a,b in REPLACEMENTS.items():v=v.replace(a,b)
    for a,b in {'Fourdark':'Four dark','Myposition':'My position','ToA':'To A','Newdata':'New data','needslight':'needs light','auchim':'auch im','zwischenmehr':'zwischen mehr','zwischenin':'zwischen in','dieseArt':'diese Art','frühereSerie':'frühere Serie','neuenDaten':'neuen Daten'}.items():v=v.replace(a,b)
    v=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',v)
    v=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)', ' ', v)
    v=re.sub(r'(?<=\d)(?=[A-Za-zÄÖÜäöüß])', ' ', v)
    v=re.sub(r'(?<=[,:;])(?=[A-Za-zÄÖÜäöüß\d])',' ',v)
    v=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])\.(?=[A-ZÄÖÜ\d])','. ',v)
    return v

ns=runpy.run_path(OWN/'author-whole-materials-and-profiles.py')
for f in ['author-communication-five-to-eight.py','author-evaluation-nine-to-twelve.py','author-evaluation-thirteen-to-sixteen.py']:
    exec(compile((OWN/f).read_text(),str(OWN/f),'exec'),ns)
specs=readable(ns['SPECS']);assert len(specs)==16
specs[7]['cases'][1]['rubric'][2]['de']='Revidierbarer Standpunkt ohne unzulässige Übertragung zwischen Arten.'
canon=json.loads((ROOT/CANON).read_text()); allgoals=canon['goals'];byid={g['id']:g for g in allgoals}
start=next(i for i,g in enumerate(allgoals) if g['id']=='38c0259a-cba2-5305-a352-20023afc2dfc')
end=next(i for i,g in enumerate(allgoals) if g['id']=='9a0b6a24-2946-50ca-8a2a-703735650e5a')
selected=allgoals[start:end+1];assert len(selected)==16
ids=[g['id'] for g in selected]
inputbindings=[copy_bound(CANON,'input/current-whole-canonical.snapshot.json'),copy_bound(KINDS,'input/current-semantic-kind-ledger.snapshot.json'),copy_bound(REG,'input/current-central-registry.snapshot.json'),copy_bound(CRITERIA,'input/profile-criteria.original.md')]
kind=json.loads((ROOT/KINDS).read_text());atomic=[d['goalId'] for d in kind['decisions'] if d['semanticKind']=='curricularAtomic']
reg=json.loads((ROOT/REG).read_text());bio=next(s for s in reg['subjects'] if s['subject']=='biologie')
qa=json.loads((ROOT/bio['visualizationQaPath']).read_text());qarecs=qa.get('goals',qa.get('records',[]))
if isinstance(qarecs,dict):qarecs=[dict(goalId=k,**v) for k,v in qarecs.items()]
aqa={d.get('goalId',d.get('id')):d for d in qarecs}
preserved={}
for key in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
    cfgpath=bio[key];cfg=json.loads((ROOT/cfgpath).read_text());rp=cfg['reviewPath'];records=[json.loads(s) for s in (ROOT/rp).read_text().splitlines() if s.strip()];sel=[r for r in records if r.get('goalId') in ids];assert len(sel)==16
    preserved[key]={'config':binding(cfgpath),'review':binding(rp),'unchangedSelectedRecords':sel,'claim':'existing decision reuse only; no author approval or fresh review'}
    inputbindings.append(copy_bound(rp,'input/'+('atomicity' if 'Atomicity' in key else 'memory')+'.current-full-review.original.jsonl'))
parentcontext=[]
for g in selected:
    parents=[p for p in allgoals if g['id'] in p.get('contains',[])];required=[byid[r] for r in g.get('requires',[])];parentcontext.append({'goalId':g['id'],'wholeCurrentGoal':g,'wholeDirectParents':parents,'wholeDirectPrerequisites':required,'authoredTextChanges':[]})
write('whole-sixteen-current-goals-and-context.input.snapshot.json',{'schemaVersion':1,'status':'author_candidate','authoredAt':STAMP,'baseLandscapeGoalCount':len(allgoals),'baseCurricularAtomicGoalCount':len(atomic),'entries':parentcontext,'bindings':inputbindings,'existingDecisions':preserved,'wholeSixteenBodiesUnchanged':True,'activeChanges':[],'humanApproval':False})
materials=[];pcs=[];coverage=[]
for ordinal,(g,spec) in enumerate(zip(selected,specs),1):
    for c in spec['cases']:
        for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:
            assert set(c[fld])=={'de','en'} and all(len(c[fld][l])>45 for l in ['de','en']),(ordinal,c['caseId'],fld)
        assert len(c['rubric'])==3
    exps=[{'id':f'essential-{i}','essentialUnderstandingDe':e[0]['de'],'essentialUnderstandingEn':e[0]['en'],'observablePerformanceDe':e[1]['de'],'observablePerformanceEn':e[1]['en']} for i,e in enumerate(spec['expectations'],1)]
    axes=[{'id':'biological-context','textDe':f"Biologische Kontexte: {spec['cases'][0]['title']} / {spec['cases'][1]['title']}; nicht nur Zahlenvariation.",'textEn':f"Distinct biological contexts: {spec['cases'][0]['title']} / {spec['cases'][1]['title']}; not merely altered numbers."},{'id':'countercase-and-evidence-change','textDe':'Jeder Fall enthält einen konkret ausgearbeiteten neuen Gegenfall mit verändertem Daten-, Medien-, Herkunfts-, Wert- oder Kontextbezug.','textEn':'Each case includes a worked fresh countercase changing its data, media, provenance, value or contextual basis.'}]
    briefs=[]
    for c in spec['cases']:
        briefs.append({'id':c['caseId'],'taskDemandDe':c['material']['de']+'\n\nAuftrag: '+c['task']['de']+'\n\nFrische Variation: '+c['freshTransfer']['de'],'taskDemandEn':c['material']['en']+'\n\nTask: '+c['task']['en']+'\n\nFresh variation: '+c['freshTransfer']['en'],'expectedPerformanceDe':c['workedResponse']['de']+'\n\nTransferantwort: '+c['freshTransferWorkedResponse']['de'],'expectedPerformanceEn':c['workedResponse']['en']+'\n\nTransfer response: '+c['freshTransferWorkedResponse']['en'],'understandingFocusDe':' '.join(e['essentialUnderstandingDe'] for e in exps)+' Rubrik: '+'; '.join(r['de'] for r in c['rubric']),'understandingFocusEn':' '.join(e['essentialUnderstandingEn'] for e in exps)+' Rubric: '+'; '.join(r['en'] for r in c['rubric'])})
    profile={'archetype':spec['archetype'],'expectations':exps,'coverageExpectations':{'requiredExpectationIds':[e['id'] for e in exps],'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True},'variationAxes':axes,'applicationCaseBriefs':briefs}
    pcs.append({'goalId':g['id'],'reason':'Whole current DE/EN goal kept; two substantial authored heterogeneous bilingual cases with worked answers, explicit rubric and fresh countercases. Candidate only; independent D/P, assets and native source-context review pending.','evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[],'profile':profile})
    materials.append({'ordinal':ordinal,'goalId':g['id'],'wholeCurrentGoal':g,'authoredCases':spec['cases'],'modelLimits':spec['limits'],'expectations':exps,'reviewStatus':'needs_human_review','authority':'ai_candidate','independentReviews':[],'humanApproval':False})
    coverage.append({'goalId':g['id'],'wholeGoalDescriptionDe':g['description'],'wholeGoalDescriptionEn':g['descriptionEn'],'requiredExpectationIds':[e['id'] for e in exps],'caseCoverage':[{'caseId':c['caseId'],'expectationIds':[e['id'] for e in exps],'evidenceLocations':['workedResponse','freshTransferWorkedResponse','rubric'],'evaluationRole':'author proposal, not independent verdict'} for c in spec['cases']],'noDescriptionNarrowing':True,'materialAndResponseAreAuthoredNotObserved':True})
write('sixteen-whole-thirty-two-bilingual-cases.author-candidate.json',{'schemaVersion':1,'reviewId':REVIEW,'authoredAt':STAMP,'license':'CC-BY-4.0','entries':materials,'scopeGoalIds':ids,'humanApproval':False,'actualLearnerResults':False,'independentApproval':False})
write('sixteen-whole-expectation-coverage.author-matrix.json',{'schemaVersion':1,'reviewStatus':'author_candidate','entries':coverage,'independentReviewsPending':True})
# Ordinary candidate-spec JSON in the quality directory; no validator changes.
write('sixteen-whole-profile-candidates.author-candidates.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':REVIEW,'reviewedAt':STAMP,'reviewer':'Codex actual author; independent native D/P/V and source-context QA pending','goals':pcs})
cfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':REVIEW,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':canon.get('landscapeId',canon.get('id')),'landscapePath':REL+'/input/current-whole-canonical.snapshot.json','semanticKindLedgerPath':REL+'/input/current-semantic-kind-ledger.snapshot.json','reviewCriteriaPath':REL+'/input/profile-criteria.original.md','reviewPath':REL+'/sixteen-whole-positive-understanding.author-candidate.review.jsonl','reviewRunManifestPaths':[],'reviewedResourceTypes':[],'requireApproved':False,'scope':{'label':'Whole16 current upper-secondary communication/evaluation goals; author candidates, no actual image/native review yet','goalIds':ids}}
write('sixteen-whole-positive-understanding.author-candidate.config.json',cfg)
markdown=['# Ganze 16 Ziele: 32 bilinguale Autorenfälle','', 'Status: AI-Kandidaten; keine unabhängige Freigabe, keine menschliche Prüfung, keine tatsächlichen Lernleistungen. Alle Daten sind ausdrücklich eigenes fiktives didaktisches Modellmaterial.','']
for m in materials:
    markdown += [f"## {m['ordinal']}. {m['wholeCurrentGoal']['title']}",'',m['goalId'],'',m['wholeCurrentGoal']['description'],'',m['wholeCurrentGoal']['descriptionEn'],'']
    for c in m['authoredCases']:
        markdown += [f"### {c['caseId']}: {c['title']}",'']
        for lang in ['de','en']:
            markdown += ['#### '+lang.upper(),'']
            for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:markdown += ['**'+fld+'**: '+c[fld][lang],'']
            markdown += ['**Rubrik**: '+'; '.join(r[lang] for r in c['rubric']),'']
    markdown+=['**Modell-/Anspruchsgrenzen**: '+' '.join(m['modelLimits']),'']
(OWN/'whole-sixteen-thirty-two-cases.author-review.md').write_text('\n'.join(markdown)+'\n')
write('author-technical-materialization.receipt.json',{'schemaVersion':1,'authoredAt':STAMP,'goalCount':16,'caseCount':32,'caseLanguageBodies':64,'profileExpectedCount':16,'wholeCanonicalGoalCount':len(allgoals),'curricularAtomicCount':len(atomic),'activeWrites':[],'netStrictGain':0,'newScientificClosures':0,'restoredBindings':0,'independentApproval':False,'humanApproval':False,'descriptionChanges':[],'createdProfileFingerprintsByOrdinaryToolPending':True,'preservedSelectedGoalIds':ids,'snapshotBindings':inputbindings})
print(json.dumps({'authoredWholeGoals':16,'authoredBilingualCases':32,'baseGoals':len(allgoals),'baseAtomic':len(atomic),'ordinaryConfig':REL+'/sixteen-whole-positive-understanding.author-candidate.config.json','candidateSpec':REL+'/sixteen-whole-profile-candidates.author-candidates.json'}))
