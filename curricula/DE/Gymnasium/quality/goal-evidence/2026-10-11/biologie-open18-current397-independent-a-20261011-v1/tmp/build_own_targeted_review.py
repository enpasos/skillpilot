import json, pathlib, hashlib, datetime, unicodedata, stat

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
E = Q / 'biologie-open18-current397-author-20261011-v4'
O = Q / 'biologie-open18-current397-independent-a-20261011-v1'
N = Q / 'biologie-nature-eight-current397-root-v2-genuine-independent-a-20261011-v1'
M = Q / 'biologie-medical10-current397-v2-genuine-blind-independent-a-checkpoint-20261011-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEW = O.name
def read(p): return json.loads(pathlib.Path(p).read_text())
def lines(p): return [json.loads(x) for x in pathlib.Path(p).read_text().splitlines() if x.strip()]
def digest(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def body(v): return digest(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
def bind(p):
    p=pathlib.Path(p); b=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':digest(b),'bytes':len(b)}
def write(name,v):
    p=O/name; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def jsonl(name,rows):
    p=O/name; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
authority={'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'actualLearnerPerformance':False,'actualExperimentPerformed':False,'sourceUnionApproval':False,'peerReviewsRead':0}

entry=read(E/'RAW-FIRST.current397-open18-complete-inputs.neutral.json')
canon=read(E/'candidate/whole484-current397-open18.author.inactive.json')
base=read(E/'frozen/current/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
goals={g['id']:g for g in canon['goals']}; oldgoals={g['id']:g for g in base['goals']}
current=read(E/'native/whole397-open18.normal-model.actual.json')
baseline=read(E/'native/baseline-current397.normal-model.actual.json')
pages={g['goalId']:g for g in current['pages']}; oldpages={g['goalId']:g for g in baseline['pages']}
assert set(pages)==set(oldpages) and len(pages)==397
pagechanges=[{'goalId':gid,'fields':[k for k in sorted(set(pages[gid])|set(oldpages[gid])) if pages[gid].get(k)!=oldpages[gid].get(k)],'baselinePageFingerprint':oldpages[gid]['pageFingerprint'],'currentPageFingerprint':pages[gid]['pageFingerprint']} for gid in pages if pages[gid]!=oldpages[gid]]
assert len(pagechanges)==23

def norm(s): return ' '.join(unicodedata.normalize('NFKC',str(s or '')).split())
def semantic_payload(g,rule):
    d=g.get('dimensionTags',{})
    return {'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(d.get('phase')),'area':norm(d.get('area')),'topicCode':norm(d.get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}
amdiff=[gid for gid in pages if semantic_payload(goals[gid],'semantic-atomicity-v1')!=semantic_payload(oldgoals[gid],'semantic-atomicity-v1')]
assert set(amdiff)=={'eb48ba5b-eaa9-52bc-a579-841fc2566182','ccb1fe9a-d8e0-54bf-a447-c0b427b654da','e36bebef-d7e3-57d0-bf01-236799d41cb7','7f76ff0b-218b-568d-91df-20bbe2b156e2'}
write('bindings/WHOLE397.independently-recomputed-field-and-AM-deltas.actual.json',{'canonicalInputs':[bind(E/'candidate/whole484-current397-open18.author.inactive.json'),bind(E/'frozen/current/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')],'pageModelInputs':[bind(E/'native/whole397-open18.normal-model.actual.json'),bind(E/'native/baseline-current397.normal-model.actual.json')],'actualPageChanges':pagechanges,'changedPages':23,'unchangedPages':374,'otherChangedPages':0,'atomicityAndMemorySemanticChanges':amdiff,'atomicityAndMemory393Unchanged':[{'goalId':gid,'atomicityFingerprint':body(semantic_payload(goals[gid],'semantic-atomicity-v1')),'memoryFingerprint':body(semantic_payload(goals[gid],'memory-card-review-v1'))} for gid in pages if gid not in amdiff],'fingerprintImplementation':bind(ROOT/'app/scripts/semanticAtomicityReview.ts'),'memoryFingerprintImplementation':bind(ROOT/'app/scripts/memoryCardReview.ts'),'meaning':'Exact unchanged rule payloads preserve prior valid A/M decisions; this is not a new review of 393 goals. Four changed goal texts receive current semantic judgments below.','authority':authority})

pn=read(N/'positive/P8-whole-original-independent-a.findings.json')
oldp={r['goalId']:r['wholeCurrentProfileRecord']['profile'] for r in pn['rows']}
medbound=read(M/'ORIGINAL.whole-case-and-profile-input-bindings.actual.json')
medoldpath=ROOT/medbound['completeProfileBodySource']['path']
assert bind(medoldpath)['sha256']==medbound['completeProfileBodySource']['sha256']
oldp.update({r['goalId']:r['profile'] for r in read(medoldpath)['goals']})
newp={r['goalId']:r['profile'] for r in read(E/'positive/P18.author.candidates.json')['goals']}
normalp={r['goalId']:r for r in lines(E/'positive/P18.author-pending.normal.records.jsonl')}
changed=[gid for gid in newp if oldp[gid]!=newp[gid]]
assert set(changed)=={'b6b1a9ab-3930-5165-8b4e-92b3d87ea014','10a8dac7-65c8-5f85-a944-3e2a7d2c6028','96547bdb-554d-5266-a28c-fc16e708216d'}

z='b6b1a9ab-3930-5165-8b4e-92b3d87ea014'; pid='10a8dac7-65c8-5f85-a944-3e2a7d2c6028'; gt='96547bdb-554d-5266-a28c-fc16e708216d'; phy='35b016d8-ed2c-570c-ab64-ac39f8f962b2'; pnd='5a44f356-ab0a-5d15-b976-889e22c8d32e'
new_science={
 z:'Der zweite ganze Z-Fall bezeichnet jetzt ausdrücklich die chemisch unveränderte Ausgangssubstanz, einen geschlossenen Modellbestand und chemischen Abbau der fehlenden 20 %. Verdünnung, Transport, Nachlieferung und andere Bestandsänderungen sind ausgeschlossen. 80 % unverändert nach 30 Tagen trägt daher die verlangte modellbezogene langsame Abbaubarkeit. Stimulation/Blockade, nachteiliger Hormonfolgebefund, Persistenz und Nahrungskettenanreicherung bleiben verschiedene Aussagen; der X/Y-Kontrast und der neue Z-Wirkweg verlangen echte Neuargumentation. Der ursprüngliche eigene A-Material-Hold ist gezielt behoben. Keine universelle Persistenzschwelle, reale Exposition oder Versuchsdurchführung wird daraus freigegeben.',
 pid:'Das vollständig gelesene Profil einschließlich beider DE/EN-Materialien, Musterleistungen, Transferbedingungen und aller Pflichtkriterien trennt IVF-Prätransfer-Probenbefund von Genkorrektur und Gesundheitsgarantie. Die fiktive Regel R macht Beratung, freie aktuelle Einwilligung und positives G-Votum gemeinsam erforderlich. Im ersten geänderten Transfer fehlt G; im zweiten besteht G, die Einwilligung wird aber zurückgezogen: beides liefert konkrete wechselnde Regel-/Autonomiebedingungen. Begrenzter V-Sequenztest bzw. Strukturumlagerungsbefund bleibt begrenzt. Modellzulässigkeit ist begründbar, tatsächliches geltendes deutsches Recht wird ausdrücklich nicht dargestellt. Die ältere Formulierung zur nicht entschiedenen rechtlichen Zulässigkeit ist in diesem Kontext auf reale Rechtslage begrenzt und kein aktueller Zulassungsbefund.',
 gt:'Das ganze Profil und beide bilingualen Fälle verlangen Zielzelle, DNA-Eintrag, funktionelles Protein, begrenzten Befund und Risiko-/Persistenzbelege. Im neuen retinalen Transfer kann das benötigte intrazelluläre E nicht aus dem Blut aufgenommen werden: erfolgreiche Blutvorläuferdaten beweisen weder Erreichbarkeit noch Expression im Netzhautziel. Im zweiten neuen Haut-P-Fall sind 20 % editierte gegenüber 5 % funktionell nachgewiesenen Zellen ein anderer Ziel-/Funktionsbefund; notwendige Funktionsschwelle, Sicherheit, Dauer und klinischer Nutzen sind offen. Das ist tatsächlicher Mechanismus-/Gewebetransfer statt Zahlenersatz. Keine Therapieempfehlung oder klinische Wirksamkeitsfreigabe.'}
old_nature_j={r['goalId']:r for r in pn['rows']}
old_med_j={r['goalId']:r for r in read(M/'ORIGINAL.positive-ten-whole-profiles-twenty-cases.actual.json')['records']}
prows=[]
for gid,p in newp.items():
    source= N/'positive/P8-whole-original-independent-a.findings.json' if gid in old_nature_j else M/'ORIGINAL.positive-ten-whole-profiles-twenty-cases.actual.json'
    j=old_nature_j.get(gid,old_med_j.get(gid))
    cases=p['applicationCaseBriefs']
    prows.append({'goalId':gid,'decision':'KEEP','currentGoalBinding':{'canonicalInput':bind(E/'candidate/whole484-current397-open18.author.inactive.json'),'wholeCanonicalGoalDigest':body(goals[gid]),'nativeGoalFingerprint':pages[gid]['goalFingerprint']},'wholeCurrentProfileInput':bind(E/'positive/P18.author.candidates.json'),'normalCurrentPositiveBinding':{k:normalp[gid][k] for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint']},'wholeProfileBodyDigest':body(p),'wholePriorProfileBodyDigest':body(oldp[gid]),'wholeProfileBodyEqualToOwnReviewedInput':p==oldp[gid],'wholeBilingualCases':[{'caseId':c['id'],'currentWholeCaseBodyDigest':body(c),'priorWholeCaseBodyDigest':body(oldp[gid]['applicationCaseBriefs'][i]),'exactBodyRetained':c==oldp[gid]['applicationCaseBriefs'][i],'fieldsActuallyConsidered':list(c)} for i,c in enumerate(cases)],'validOwnScientificOrigin':{'judgmentFile':bind(source),'goalId':gid,'originalDecision':j['decision'],'ownOriginalWholeBodyInput':bind(medoldpath) if gid in old_med_j else bind(N/'positive/P8-whole-original-independent-a.findings.json')},'reviewMethod':'Complete unchanged valid scientific body retained after exact equality; actual current page/source/image changes separately inspected.' if gid not in changed else 'All current expectations, coverage, variation axes, two complete bilingual materials/tasks/worked performances/changed conditions and every required rubric criterion read and independently assessed.','ownScientificRationale':new_science.get(gid,'Eigenes früheres KEEP bleibt gültig: vollständiger Profil- und Fallkörper ist exakt gleich. Aktuelle Seiten-, Quellen- und Bildbindung wurde gesondert tatsächlich geprüft.'),'authority':authority})
write('positive/P18.whole-bodies-cases-own-origin-and-targeted-findings.actual.json',{'recordType':'independent-targeted-whole-positive-profile-review-v1','records':prows,'wholeCurrentProfileBodies':18,'wholeCurrentBilingualCaseBodies':36,'wholeBodiesRetainedFromOwnValidJudgment':15,'wholeChangedBodiesActuallyReread':3,'changedWholeBilingualCasesActuallyReread':6,'newLearnerDemonstrationsRequiredByThisReview':0,'extraTaskQuota':0,'originalZHoldResolved':True,'openMaterialDefects':[],'authority':authority})
protected=read(E/'inputs/protected35b-whole-current-profile-and-goal.neutral.json')
profile35=protected['wholeCurrentPositiveRecord']['profile']
write('positive/35b.protected-context-whole-profile-and-EAGA-method.actual.json',{'goalId':phy,'decision':'KEEP bounded changed source context','wholeInputBinding':bind(E/'inputs/protected35b-whole-current-profile-and-goal.neutral.json'),'wholeCurrentProfileDigest':body(profile35),'wholeBilingualCases':[{'caseId':c['id'],'wholeBodyDigest':body(c),'wholeBodyRead':True} for c in profile35['applicationCaseBriefs']],'ownScientificRationale':'Der vollständige erste Fall gibt O000/A100/B110/C111 sowie orthologe ausgerichtete Sequenzen OAAAAAA/AGAAAAA/BGGAAAA/CGGAAAT vor. Ableitungszustände und unabhängige Sequenzstellen tragen (O,(A,(B,C))); C ist nicht höher entwickelt. Der zweite Fall trennt funktionale Flugähnlichkeit von Homologie; andere homologe Merkmale und zwei unabhängige Sequenzsignale tragen vorläufig (O,(B,(A,C))) mit Prüfung von Orthologie, Alignment, Homoplasie und Genbaumgrenzen. Es wird eine begründete Hypothese konstruiert und unter geänderter Evidenz geändert, nicht ein Familienstammbaum gelesen. Der zweite Fall liefert zusammengefasste Signale, keinen vollständigen zweiten Rohdatensatz: ausreichender begrenzter E1-Transfer, keine reale Sequenzanalyse/Softwareausführung. Beide amtlichen EA- und GA-Abschnitte verlangen Stammbaumkonstruktion durch Molekülvergleich; die partial-Verknüpfung ist für diesen Operator sachlich passend. Basenvergleich, Aminosäurevergleich, Artbestimmung, Systematik und der gesamte Quellen-/Kursverbund werden damit nicht pauschal geschlossen.','existingProtectedProfileAltered':False,'newPositiveClosureFor35bClaimed':False,'wholeSourceUnionApproval':False,'authority':authority})

# Own earlier D inputs/results: no author verdict or peer B result is read.
old_d_paths=[next((N/'D11-round-a/results').glob('*.records.jsonl')),next((M/'results').glob('*.records.jsonl'))]
oldD={r['goalId']:(r,p) for p in old_d_paths for r in lines(p)}
input_by={}
reuses=[]
for name in ['root11','medical12']:
    inp=read(E/f'native/{name}/round-a/description-review-input.json')
    input_by.update({r['goalId']:r for r in inp['goals']})
    for r in inp['goals']:
        if r['goalId'] not in oldD: continue
        orig,path=oldD[r['goalId']]
        fields=['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint']
        assert all(r[k]==orig[k] for k in fields),(r['goalId'],'own D semantics drift')
        reuses.append({'goalId':r['goalId'],'validOwnResultOrigin':bind(path),'ownOriginalRecordId':orig['recordId'],'currentInput':bind(E/f'native/{name}/round-a/description-review-input.json'),'scientificGoalFieldsExact':fields,'priorPageFingerprint':orig['pageFingerprint'],'currentPageFingerprint':r['pageFingerprint'],'wholeCanonicalContextDigest':body(r['canonicalContext']),'currentWholePageContextDigest':body(r['reviewContext'])})
assert len(reuses)==22
write('bindings/D23.own-valid-origin-and-current-bindings.actual.json',{'records':reuses,'ownPriorDJudgmentsRetained':22,'newScientificContext35b':phy,'newPageBodiesActuallyInspected':23,'ownSemanticFindingsReopenedOnlyForActualDeltas':True,'authorOrPeerVerdictBodiesRead':0,'authority':authority})

an={r['goalId']:r for r in lines(N/'atomicity-memory/A8.original-independent-a.records.jsonl')}
mn={r['goalId']:r for r in lines(N/'atomicity-memory/M8.original-independent-a.records.jsonl')}
am={r['goalId']:r for r in read(M/'ORIGINAL.atomicity-ten.actual.json')['records']}
mm={r['goalId']:r for r in read(M/'ORIGINAL.memory-ten.actual.json')['records']}
kindrows={r['goalId']:r for r in read(E/'candidate/kinds484-current397.author-binding-only.json')['decisions']}
semantic_reasons={
 'eb48ba5b-eaa9-52bc-a579-841fc2566182':'Nachvollziehen fordert die kohärente Rekonstruktion eines gesellschaftlichen Evolutionsdiskurses anhand gegebener Argumente und die Trennung empirischer Aussage/Wertsetzung; kein selbständiger Debattenführungsauftrag, kein bloßes motivationales Interesse.',
 'ccb1fe9a-d8e0-54bf-a447-c0b427b654da':'Tiere und Mitmenschen sind die betroffenen Perspektiven derselben begründeten Verantwortungsentscheidung in einer konkreten Haltungssituation. Bedürfnisse, Rechte und Folgelasten werden zusammen abgewogen; keine zwei unabhängigen Kompetenzbündel.',
 'e36bebef-d7e3-57d0-bf01-236799d41cb7':'Erläutern passt zur Proben-/Methoden-/Befundkette mit Chromosomen- und Sequenzmethoden und deren Aussagegrenzen. Der Titel behauptet keine eigene ethische Bewertungsleistung und keinen klinischen Beratungsabschluss.',
 '7f76ff0b-218b-568d-91df-20bbe2b156e2':'Die zellulär/molekulare Erklärung verbindet Regulationsstörung, Tumorbildung und Invasion/Transport/Besiedlung zur einen kausalen Kette. Eine Mutation oder Zellzahl allein beweist keine Metastasierung. Keine unabhängige zweite Therapie- oder Statistikkompetenz.'}
arows=[]; mrows=[]; amtrace=[]
for gid in entry['openAuthorIds']:
    g=goals[gid]
    assert kindrows[gid]['semanticKind']=='curricularAtomic'
    assert not g.get('contains') and g.get('type')=='atomic'
    assert g.get('nodeKind') not in ['memory','exam','tutor']
    assert not any(t in ['memorization','Motivation','Orientation'] or t.startswith('srs-deck:') for t in g.get('tags',[]))
    if gid in an:
        assert an[gid]['fingerprint']==body(semantic_payload(g,'semantic-atomicity-v1'))
        assert mn[gid]['fingerprint']==body(semantic_payload(g,'memory-card-review-v1'))
        ra=an[gid]['reason']; rm=mn[gid]['reason']; origins=[bind(N/'atomicity-memory/A8.original-independent-a.records.jsonl'),bind(N/'atomicity-memory/M8.original-independent-a.records.jsonl')]
    else:
        assert am[gid]['goalFingerprint']==input_by[gid]['goalFingerprint'] and mm[gid]['goalFingerprint']==input_by[gid]['goalFingerprint']
        ra=am[gid]['ownRationale']; rm=mm[gid]['ownRationale']; origins=[bind(M/'ORIGINAL.atomicity-ten.actual.json'),bind(M/'ORIGINAL.memory-ten.actual.json')]
    ra=semantic_reasons.get(gid,ra)
    common={'schemaVersion':1,'reviewId':REVIEW,'landscapeId':canon['landscapeId'] if 'landscapeId' in canon else canon['id'],'goalId':gid,'reviewedAt':NOW,'reviewer':'Codex genuine independent A; own prior A scientific judgments only; no peer B reads'}
    arows.append(dict(common,ruleVersion='semantic-atomicity-v1',fingerprint=body(semantic_payload(g,'semantic-atomicity-v1')),status='atomic',semanticAtomic=True,reason=ra))
    mrows.append(dict(common,ruleVersion='memory-card-review-v1',fingerprint=body(semantic_payload(g,'memory-card-review-v1')),status='no_memory_needed',memoryUseful=False,reason=rm+' Aktueller Kern ist materialgebundene Erklärung, Begründung oder Transfer. Keine erforderlichen Karten/Decks; tatsächliche separate Memoryziele bleiben erhalten.'))
    amtrace.append({'goalId':gid,'sourceGoalDigest':body(g),'currentNativeGoalFingerprint':input_by[gid]['goalFingerprint'],'atomicityFingerprint':arows[-1]['fingerprint'],'memoryFingerprint':mrows[-1]['fingerprint'],'validOwnScientificOrigins':origins,'fourChangedBaselineSemanticText':gid in amdiff,'semanticKindJudgment':'curricularAtomic','currentKindBinding':kindrows[gid],'kindInputBinding':bind(E/'candidate/kinds484-current397.author-binding-only.json'),'newCardRequirement':False,'cardVisibilityCheckRequired':False,'authority':authority})
jsonl('atomicity-memory/A18.current-independent-a.records.jsonl',arows)
jsonl('atomicity-memory/M18.current-independent-a.records.jsonl',mrows)
write('atomicity-memory/A18-M18-kind.current-own-semantic-findings.actual.json',{'records':amtrace,'exactUnchangedOthers393':393,'newRequiredCards':0,'fourCurrentTextsActuallyAssessed':semantic_reasons,'authority':authority})
for kind,rule,fn in [('A','semantic-atomicity-v1','A18'),('M','memory-card-review-v1','M18')]:
    write(f'atomicity-memory/{kind}18.normal.config.json',{'schemaVersion':1,'reviewId':REVIEW,'ruleVersion':rule,'landscapeId':common['landscapeId'],'landscapePath':str((E/'candidate/whole484-current397-open18.author.inactive.json').relative_to(ROOT)),'reviewPath':str((O/f'atomicity-memory/{fn}.current-independent-a.records.jsonl').relative_to(ROOT)),'scope':{'label':'Independent targeted Biology current397 open18; preserve unchanged valid scientific decisions','leafGoalIds':entry['openAuthorIds']}})
    if kind=='M':
        (O/'atomicity-memory/M18.no-required-card-records.jsonl').write_text('')
        mc=read(O/'atomicity-memory/M18.normal.config.json')
        mc['cardReviewPath']=str((O/'atomicity-memory/M18.no-required-card-records.jsonl').relative_to(ROOT))
        write('atomicity-memory/M18.normal.config.json',mc)

visual_notes={
 'c1aea082-30c0-558f-8d0a-fb810c1dc51b':'Mehrwegbehälter und Einwegverpackungen stehen in einer offenen Waage; Ökosysteme, faire Zugänge und Kosten sind getrennte Abwägungskriterien.',
 'ac40db32-5dc7-5c43-8771-bf805d24aa3b':'Historisches Giraffenmodell bleibt als historische Frage markiert; Variations-/Selektionsseite wird nicht mit erworbener Vererbung verwechselt.',
 'eb48ba5b-eaa9-52bc-a579-841fc2566182':'Empirische Erklärung und diskursive Perspektiven sind getrennt; kein Bildbeweis für religiöse/Wertfragen und keine geforderte eigene Debattenführung.',
 '9fb0a26b-abb0-505f-b92a-320b2e6290e9':'Länge von Blütenröhre und Saugrüssel sowie beiderseitige Pfeile unterstützen die Wechselbeziehung; Szene beweist keinen realen Selektionsversuch.',
 'b6b1a9ab-3930-5165-8b4e-92b3d87ea014':'Rezeptorsignal, zeitlicher Verbleib und Nahrungskette sind separate schematische Hinweise, keine universellen Konzentrations-/Risikoschwellen.',
 '7247dc5e-9d58-5aa0-8082-5097847539a4':'Lokaler Wald-/Kohlenstoffeingriff und räumliche Folgen sind nachvollziehbar, ohne ein konkretes regionales Wirkmaß zu behaupten.',
 '7b09d025-8465-505e-b196-61e1811309db':'Nein, Unterstützung und Hilfe vermitteln verantwortliche Grenzen; keine Opferbeschuldigung und keine Pflicht zu persönlicher Offenbarung.',
 'cd1fa548-9b27-54df-89be-6a6ee3629eb9':'Amphibiengewässer, Wanderung, Straße und Leiteinrichtung/Tunnel passen zu Habitatgefahr und Schutz; Larven-/Erwachsenenstadien bleiben unterscheidbar.',
 '06e91b97-e7cc-5698-a854-8a946a4bb7d0':'Heu/Wasser, größere Haltung und Kaninchengemeinschaft unterstützen Artbedürfnisse; Nachfolgerlabel nennt jetzt Tiere und Mitmenschen.',
 'ccb1fe9a-d8e0-54bf-a447-c0b427b654da':'Tiere, Menschen, Versorgung und Zusammenarbeit beziehen beide Verantwortungsperspektiven ein. Eine dargestellte Momentaufnahme ist keine vollständige Haltungsbauanleitung.',
 '640306a2-7d58-5192-9676-58f492978790':'Kühlen/Trocknen/Erhitzen und veränderte Apfelqualität sind sichtbar; kein völliges Abtöten durch Kühlung oder allgemeine Verzehrfreigabe.',
 '50108500-7958-5954-b493-e89273649f8f':'Bakterium, Produktion, Aufreinigung und Proteinprodukt sind getrennt; Abwägung bezieht Mensch/Umwelt/Kosten/Risiko ein.',
 '96001dbf-ef37-584a-98f0-d5351d9cdeaf':'Gesellschaftliche Beteiligung und Regeln sind verschiedene verbundene Bereiche; keine aktuelle konkrete Rechtslage suggeriert.',
 '10a8dac7-65c8-5f85-a944-3e2a7d2c6028':'Blastozysten-Probe und Test vor Transfer sind zeitlich erkennbar; Fragezeichen und Abwägung verhindern Gesundheitsgarantie. Keine Genkorrektur gezeichnet.',
 '9ea70581-3cef-5a6b-b22b-33cc6df4d7af':'Differenzierung, Forschung und klinische Prüfung sind getrennt; kein Versprechen zugelassener Therapie aller dargestellten Zelltypen.',
 '7f76ff0b-218b-568d-91df-20bbe2b156e2':'Regulationsausfall, Primärtumor, Invasion, Transport und Besiedlung sind als Kette schematisch erkennbar; Metastase nicht nur als Zellzahl.',
 '440854be-7f06-5678-91cb-ba8dcab56959':'Familienstammbaum mit unauffälligen Eltern und gefülltem Kind ist mit begrenzter rezessiver Erklärung vereinbar. Kein Artenstammbaum; falsche BY550-Verknüpfung entfernt.',
 'e36bebef-d7e3-57d0-bf01-236799d41cb7':'Zell-/Chromosomen- und DNA-/Sequenzweg führen zu einer begrenzten Aussage; Fragezeichen verhindert Diagnosegarantie. Erklärender Titel passt.',
 '96547bdb-554d-5266-a28c-fc16e708216d':'Somatische Zellgewinnung, Genübertrag/Genfunktion, Rückgabe, Verlaufskontrolle und Risiko sind unterscheidbar. Blutprozess illustriert einen Fall, nicht den neuen retinalen Wirkbeweis.',
 '9dc56d7d-3321-55b6-8988-cfc74abdc341':'Information, Vertraulichkeit, eigene Entscheidung und die echte Möglichkeit der Pause sind sichtbar; kein Testzwang.',
 '5a44f356-ab0a-5d15-b976-889e22c8d32e':'Neues Original0762 zeigt beratende Ärztin und schwangere Person, Ultraschall und Blut-/Chromosomenhinweis mit offenem Befund sowie Nutzen/Risiken und Abwägen. Keine fötale Blutentnahme als Standardprobe, keine invasive Verletzung, keine Diagnosesicherheit oder vorgeschriebene Entscheidung. Bei 360 und 680 bleiben zentrale Labels und Symbole lesbar.',
 '2ef8b0c2-8ba3-54b7-99ff-8c743a4efa63':'DNA-Test, mögliche Nutzung, Einwilligung und Datenschutz sind getrennt; keine automatische Freigabe für Dritte.',
 '35b016d8-ed2c-570c-ab64-ac39f8f962b2':'Merkmalsvergleich und schematische Sequenzen führen zum mit Hypothese markierten verzweigten Baum. 1/2 teilen mehr Positionszustände als 3, konsistent mit der gezeichneten Gruppierung; Farben/Schädel sind keine reale Artenbestimmung. Kein Familienerbschema.'}
captures=read(E/'captures/actual-native-and-original-display-bindings.json')['rows']
vrows=[]
for c in captures:
    gid=c['goalId']; vrows.append({'goalId':gid,'decision':'KEEP','currentNativePageFingerprint':input_by[gid]['pageFingerprint'],'htmlWholePageActuallySeen':True,'pdfWholePageActuallySeen':True,'htmlCaptureBinding':bind(ROOT/c['nativeHtml']['capture']),'pdfCaptureBinding':bind(ROOT/c['nativePdf']['capture']),'nativeHtmlBinding':{'path':c['nativeHtml']['path'],'sha256':c['nativeHtml']['sha256']},'nativePdfBinding':{'path':c['nativePdf']['path'],'sha256':c['nativePdf']['sha256']},'originalRasterBinding':c['originalAsset'],'newOriginalActuallySeen':gid in [pnd,phy],'newPND360And680ActuallySeen':gid==pnd,'newPNDDisplayBindings':c['originalBrowserCaptures'] if gid==pnd else [],'ownScientificObservation':visual_notes[gid],'finding':'No clipping, misplaced label, wrong current goal text or concrete biological image fault in the actual complete pages.','authority':authority})
assert len(vrows)==23
original35=ROOT/'app/public/assets/goal-visualizations/biologie'/phy/(phy+'.png')
assert bind(original35)['sha256']=='sha256:67d2cee9d281c6aaac408a9823f473e46d5fcbc01c6c2395a5cfc46e6e24dfd2'
write('visual/V23.actual-whole-pages-and-PND0762-original-360-680.findings.json',{'records':vrows,'wholeHtmlPagesActuallySeen':23,'wholePdfPagesActuallySeen':23,'closedContextGoalsActuallySeen':[gid for gid in input_by if gid not in newp],'newPNDOriginalInputBinding':bind(E/f'candidate/source/visualizations/biologie/{pnd}/{pnd}.png'),'protected35bOriginalActuallySeenBinding':bind(original35),'normalLearnerHostAcceptanceClaimed':False,'authority':authority})

source_notes={
 'bw-biology-seki-bp2016-v2-bnt56-wirb-002-2c38efc3':('KEEP corrected routing','BW physical19/20 (printed17/18) makes pet/livestock keeping, welfare and evaluation explicit; it supplies no sexuality/sexual-abuse competency. Removal of 7b09 retains own valid earlier finding. bac3 partial stays bounded; legacy metadata canonicalTargets in the older extraction is not the authority for current mapping. Full BW multi-operator union is not reapproved.'),
 '550a30ba-48e0-5822-8733-38683473e37e':('KEEP partial method routing','Actual complete official archived HTML sections B12-EA3.1 and B12-GA3.1 independently read. BOTH require constructing a species tree/cladogram by comparing molecular characters; contents additionally name base and amino-acid comparisons plus ancestral/derived traits. Current35b whole first case constructs from aligned orthologous base data and homologous character polarities, second changes topology under different independent signals. This performs the bounded creation/application operator. 440 monohybrid family pedigree is a different object and cannot cover this source. EA9hours/GA7hours and EA human evolution differ, despite a common creation clause. partial35b is justified for that clause in both course contexts; whole-row systematics/species-determination, every molecular technique and whole EA/GA course/source unions remain unapproved.'),
 '85a4af17-ca25-4d3d-bcbb-b1a2ec93ac62':('KEEP literal distinction and partial operationalization','Actual HE-G9 physical14/printed13 distinguishes obligatory sexual-abuse discussion from optional media/cooperation event. Responsible-boundary/help-seeking goal is a suitable authored partial operationalization of the obligatory context. No literal independent complete boundary/coaching method is invented.'),
 'cbf0613e-2928-4324-b4bf-75fc97d80caa':('KEEP optional partial operationalization','Actual HE-G9 physical17/printed16 places amphibian threats under optional contents and discussion/research under methods. Current threat/protection analysis is a partial authored operationalization. Optionality and fieldwork/method execution remain distinct from obligatory amphibian structure/development.'),
 'd4ae4a86-84ef-42dd-8123-924cd3e4e281':('KEEP partial application','Actual HE-G9 physical18/printed17 explicitly includes responsibility toward animals and people and application to concrete cases, weighing viewpoints. Current combined title and profile meet one coherent contextual reasoning performance. No full welfare-action performance or separate personal acceptance follows.'),
 '1c2d2dbe-e14f-4cc3-8e9a-70e3d57078fe':('KEEP literal LK partial','Actual HE-KC2024p47 Q4.1 enhanced level explicitly lists hormonelike environmental substances. Persistence, accumulation, causal adverse effect and receptor mechanisms are authored operationalizations in the current profile, not literal four-topic official bullet. LK retained; partial and no full laboratory/operator closure.'),
 '86bd7236-b1f5-408f-abcc-98b643b012fa':('KEEP literal partial','Actual HE-KC2024p39 Q1.4 basic-level PID method at one example and ethical challenges support current10a. Fictive RuleR is labelled model, not law. Course duty is a method/example/ethical demand, not just recognition of the title. Full source method execution remains separate.'),
 '913a3f15-56e2-4904-adcc-444e5c7ec665':('KEEP literal LK partial','Actual HE-KC2024p39 Q1.2 enhanced-level GVO example insulin-producing bacteria supports bounded production/function/exposure evaluation in501. Source example and LK status retained; no approval of whole Q1.2 molecular manufacturing/procedure union.'),
 '981fcbb0-4e2d-42e9-9d5f-ebcb500f0d3a':('KEEP literal partial','Actual HE-KC2024p39 Q1.3 basic-level Gentest und Beratung supports9dc nondirective information/uncertainty/consent counseling operationalization. Named basic-level demand preserved; no actual clinical consultation or law approval.'),
 '9f3d6183-e1da-4430-baeb-8937609dbeae':('KEEP authored optional partial','Actual HE-KC2024p42 Q2.2 includes science/religion and faith/reason plus ethical challenges. The societal reconstruction target is authored and broader, correctly partial. Q2p41 mandates1 and3; Q2.2 is optional, not all-course compulsory discourse. No literal claim of independent debate leadership.'),
 'aaaad367-553d-4a50-a320-c52d6fc69ef5':('KEEP literal LK partial','Actual HE-KC2024p39 Q1.3 enhanced-level gene-therapy procedure at one example supports965. The full profile demands target tissue, gene function and evidential limits; new retina/skin transfer is coherent. No complete practical execution/clinical or whole-source closure.'),
 'ad93cf9d-c416-4164-9ba6-41f57ec7c92d':('KEEP literal partial','Actual HE-KC2024p40 Q1.5 basic-level lists uncontrolled cell division, tumor and metastasis. Current7f76 cellular/molecular causal description operationalizes those connected aspects; LK-specific Q1.3 molecular-cancer content remains additional. No statistical incidence/inheritance or treatment proof.'),
 'b0cfa9ae-0f77-4aa7-bf97-1d6f89669c67':('KEEP authored partial','Actual HE-KC2024p39 Gentest und Beratung is literal; the prenatal chromosome/targeted-sequence diagnostic chain in e36 is a broader authored example, not an official prenatal-method quote. Partial acknowledges the distinction. No broad method/clinical closure from title change.'),
 'beb282db-dbf7-426e-a8f9-9af3533207bc':('KEEP general-purpose partial','Actual HE-KC2024p13 general educational contribution connects biological knowledge to development of laws/rules and societal participation. It is not a literal Q1 special legal-method obligation; Q1 genetic application is authored. Current960 profile explains scientific/value/regulatory roles without inventing current law. Full normative-course/legal closure held.'),
 'd52782a7-7883-43e0-8a5d-e6e1f3077f9b':('KEEP authored partial','Actual HE-KC2024p39 Gentest und Beratung supports authored prenatal application in5a44; explicit prenatal tests and exact current law are not stated in that bullet. New counseling/uncertainty image is compatible with current profile. Partial preserved, no complete clinical/source method claim.'),
 'nw-biology-seki-klp-2019-if1-04-wirbeltiere-saugetiere-angepasstheit-zuchtung-und-tierhaltung-erklaren':('KEEP removal; partner union held','Actual NRWp22 IF1 contains vertebrate comparison, mammal/bird adaptations, breeding/livestock/welfare, not habitat-protection demand. Removing cd1 retains own previous valid correction. Existing20 partner edges are retained byte-for-byte where applicable; their entire source/operator coverage is not newly approved.'),
 'nw-biology-seki-klp-2019-if4-07-okosysteme-energiefluss-stoffkreislaufe-naturschutz-und-nachhaltigkeit-beurteilen':('KEEP partial addition; partner union held','Actual NRWp29-31 IF4 names human habitat changes, biotope/species protection, ethical justification and weighing landscape interventions. Amphibian threat/protection cd1 is a defensible partial example here;21 existing partner edges remain. Actual ecosystem measurement, taxa determination and experiment operators are not completed by this example.'),
}
srows=[]
for x in read(E/'sources/targeted-primary-and-section-input-index.neutral.json')['records']:
    sid=x['sourceGoalId']; dec,why=source_notes[sid]
    original=x['directWholePrimary']['frozenRegularCopy']
    srows.append({'sourceGoalId':sid,'decision':dec,'candidateMappingBinding':x['candidateMapping'],'currentEdges':x['newEdges'],'priorEdges':x['oldEdges'],'literalSourceRowDigest':body(x['candidateSourceRow']),'actualWholePrimaryBinding':bind(ROOT/original),'wholeSectionOrSpan':x.get('declaredSectionOrSpan'),'actualSectionMethod':'Actual original PDF text at the specified physical pages independently read; BY actual full EA/GA archived official HTML sections independently read, not just author extract.','ownScientificFinding':why,'wholeSourceUnionApproval':False,'normativeOperatorExecutionApproved':False,'sourceScope':'Only exact changed routing/literal attribution/partial application assessed; prior valid own partner judgments preserved, outstanding source-wide holds remain.','authority':authority})
assert len(srows)==17
bybind=[bind(E/f'frozen/current/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1/primary/12-{c}/bundle/book.html') for c in ['EA','GA']]
write('sources/Source17.actual-primary-routing-operator-partial-findings.json',{'records':srows,'BYBothActualWholeOfficialHtmlBindings':bybind,'ownHistoricalSourceOrigins':[bind(N/'sources/whole67-current-bounded-independent-a-source-operator.json'),bind(M/'ORIGINAL.current-source-operator-scope.actual.json')],'historicalBroaderHoldsPreserved':['HE optionality and normative method execution','BW and NRW broad multi-target unions','RP bilanzieren and broader operator unions','complete BY EA/GA source/course unions'],'actualNormativePracticalExecution':False,'authority':authority})
write('sources/changed-material-primary-science-live-read.actual.json',{'readAtUTC':NOW,'records':[{'url':'https://www.hfea.gov.uk/treatments/embryo-testing-and-treatments-for-disease/pre-implantation-genetic-testing-for-monogenic-disorders-pgt-m-and-pre-implantation-genetic-testing-for-chromosomal-structural-rearrangements-pgt-sr/','actualOfficialPageRead':True,'usedForGoal':pid,'observation':'Official current scientific description supports IVF/pre-transfer sampling, limited testing for specific conditions or structural rearrangements and possible damage/inaccuracy. UK authorization information is not imported as German law.'},{'url':'https://www.genome.gov/genetics-glossary/Gene-Therapy','actualOfficialPageRead':True,'usedForGoal':gt,'observation':'Official glossary supports cell-targeted delivery of functional gene copies; successful DNA delivery alone is not inferred to establish expression, tissue reach or clinical benefit.'},{'url':'https://www.who.int/news/item/19-02-2013-effects-of-human-exposure-to-hormone-disrupting-chemicals-examined-in-landmark-un-report','actualOfficialPageRead':True,'usedForGoal':z,'publicationDate':'2013-02-19','observation':'Historical WHO scientific overview links interference with hormonal function to possible adverse effects and exposure/evidence limits. No modern quantitative persistence or regulatory threshold is derived.'}],'fullThirdPartyTextCopied':False,'authority':authority})

phy_evidence={'essentialUnderstandingDe':'Ein Artenbaum ist eine begründete Verwandtschaftshypothese aus homologen abgeleiteten Merkmalen und vergleichbaren orthologen Molekülsequenzen; funktionale Ähnlichkeit allein trägt sie nicht.','essentialUnderstandingEn':'A species tree is a justified relationship hypothesis from homologous derived traits and comparable orthologous molecular sequences; functional similarity alone does not support it.','observablePerformanceDe':'Polarisiert die vorgegebenen Merkmale mit der Außengruppe, vergleicht die ausgerichteten Sequenzpositionen und konstruiert (O,(A,(B,C))) mit Begründung der gemeinsamen abgeleiteten Zustände.','observablePerformanceEn':'Polarizes the supplied traits using the outgroup, compares aligned sequence positions and constructs (O,(A,(B,C))) while explaining shared derived states.','transferExpectationDe':'Revidiert die Gruppierung zu (O,(B,(A,C))) wenn homologe Merkmale und unabhängige Sequenzsignale A/C stützen; prüft Orthologie, Alignment, Homoplasie und Grenzen der Genbaumdeutung.','transferExpectationEn':'Revises the grouping to (O,(B,(A,C))) when homologous traits and independent sequence signals support A/C; checks orthology, alignment, homoplasy and limits of gene-tree inference.'}
delta_evidence={
 z:{'transferExpectationDe':'Vergleicht X/Y erneut unter geändertem Wirkweg; begründet beim zweiten Z-Fall aus 80 % chemisch unveränderter Ausgangsmenge im geschlossenen Modell langsamen Abbau, ohne Hormonwirkung daraus abzuleiten.','transferExpectationEn':'Recompares X/Y under a changed mechanism; uses the second Z case with 80% chemically unchanged initial amount in a closed model to justify slow breakdown without inferring hormonal action.'},
 pid:{'transferExpectationDe':'Prüft die fiktive Regel R bei fehlendem positiven G-Votum und bei später zurückgezogener Einwilligung trotz positivem G. Begrenzt den biologischen Testbefund unabhängig von der Modellzulässigkeit.','transferExpectationEn':'Applies fictional Rule R when a positive G opinion is missing and when consent is later withdrawn despite positive G. Bounds the biological finding independently of model eligibility.'},
 gt:{'transferExpectationDe':'Begründet, weshalb erfolgreiche Blutvorläuferdaten die intrazelluläre Versorgung retinaler Zielzellen nicht tragen; bewertet Haut-P bei 20 % Editierung/5 % funktionellem Nachweis ohne Sicherheit, Schwellenwert, Dauer oder Klinik zu erfinden.','transferExpectationEn':'Explains why successful blood-precursor data do not establish intracellular supply to retinal target cells; evaluates skin P with 20% editing/5% functional evidence without inventing safety, sufficiency, durability or clinical benefit.'}}
for name,label in [('root11','nature11'),('medical12','medical12')]:
    inp=read(E/f'native/{name}/round-a/description-review-input.json'); campaign=read(E/f'native/{name}/round-a/description-review-campaign.json');bundle=read(E/f'native/{name}/round-a/review-bundle-manifest.json')
    batch=campaign['batches'][0];runid=REVIEW+'-'+label+'-round-a-run'; records=[]
    for i,r in enumerate(inp['goals']):
        gid=r['goalId']
        if gid==phy:
            d={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'understandingEvidence':phy_evidence,'decision':'keep','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
        else: d=dict(oldD[gid][0]);d['understandingEvidence']=dict(d['understandingEvidence'])
        d.update({k:r[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
        d.update({'recordId':REVIEW+'-'+label+'-D-'+str(i+1),'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'decision':'keep','evidenceProfileRecommendation':'none'})
        d['understandingEvidence'].update(delta_evidence.get(gid,{}))
        if gid==phy:
            why='Neue eigene Prüfung des veränderten geschlossenen Kontextes: voller bestehender35b-Profilkörper und beide bilingualen Fälle tatsächlich gelesen, beide EA/GA-Primärabschnitte und ganze aktuelle HTML-/PDF-Seite gesehen. Kladistische Polarisation und Sequenzvergleich tragen tatsächliche Hypothesenkonstruktion und veränderte Topologie, nicht Familienstammbauminterpretation. KEEP für begrenzten partial Methodenanteil; keine neue P-Gesamtfreigabe oder Quellenunion.'
        else:
            why='Eigenes gültiges früheres A-Urteil mit exakt gleichem aktuellen DE/EN-Ziel und Goal-Fingerprint erhalten; ganze aktuelle HTML-/PDF-Seite sowie tatsächliche Source/P/Image-Deltas geprüft. '
            why+=new_science.get(gid,visual_notes[gid]+' Unveränderter vollständiger eigener P-Körper bleibt gültig, soweit dieses Ziel zu open18 gehört.')
            why+=' Quellenweite Methoden-/Unionsabdeckung und menschliche Approval/Trials bleiben separat offen.'
        d['rationale']=why;records.append(d)
    out=O/'A/results'/label;out.mkdir(parents=True,exist_ok=True)
    recordpath=out/(batch['batchId']+'.records.jsonl');jsonl(str(recordpath.relative_to(O)),records)
    arts=[]
    for a in bundle['artifacts']:
        arts.append({'role':a['role'],'digest':a.get('sha256',a.get('digest'))})
    # Normal bundle artifacts are exact bytes; batch binding is additional.
    arts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
    actual_entry_time=datetime.datetime.fromtimestamp((O/'ENTRY.neutral-v4-CAS.actual.json').stat().st_mtime,datetime.timezone.utc).isoformat()
    run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI / Codex','model':'GPT-6-based Codex session; exact model build not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':body({'mode':'genuine independent A targeted delta review','ownValidPriorScientificJudgmentsRetained':True,'peerReviewsRead':0}),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':arts,'startedAt':actual_entry_time,'completedAt':NOW,'status':'completed','outputDigest':bind(recordpath)['sha256'],'toolchainVersion':'skillpilot-unchanged-normal-description-review-v2-independent-A-targeted'}
    # Entry CAS output filesystem creation time records the actual start of current review.
    entry_cas=read(O/'ENTRY.neutral-v4-CAS.actual.json')
    for key in ['checkedAtUTC','checkedAt','readAtUTC','createdAtUTC']:
        if key in entry_cas:run['startedAt']=entry_cas[key];break
    if datetime.datetime.fromisoformat(run['startedAt'].replace('Z','+00:00'))>datetime.datetime.fromisoformat(NOW):run['startedAt']=NOW
    write(str((out/(batch['batchId']+'.run.json')).relative_to(O)),run)
write('SCIENTIFIC.targeted-own-findings.pre-validation.actual.json',{'reviewId':REVIEW,'neutralInputFreeze':bind(E/'FINAL.neutral-inputs.freeze.json'),'nativeDescriptionDecisions':{'KEEP':23,'REVISE':0,'BLOCK':0},'wholePDecisions':{'KEEP':18,'changedWholeProfiles':3,'ownValidWholeProfilesRetained':15,'oldZHoldResolved':True},'A18':'atomic','M18':'no_memory_needed','kindFour':'curricularAtomic','V23':'KEEP actual whole pages; PND0762 original/360/680','closedContexts':['ac40db32-5dc7-5c43-8771-bf805d24aa3b','9fb0a26b-abb0-505f-b92a-320b2e6290e9','06e91b97-e7cc-5698-a854-8a946a4bb7d0','440854be-7f06-5678-91cb-ba8dcab56959',phy],'source17':'KEEP bounded exact delta attribution/routing/partial operationalization; full source unions and normative practical execution held','ordinaryContentKind':True,'authoritativeRuntimeApprovalClaimed':False,'machineStrictGainClaimed':0,'authorWrites':0,'historicalOriginalWrites':0,'peerReviewReads':0,'openNewConcreteScientificDefects':[],'authority':authority})
print(json.dumps({'outputs':len(list(O.rglob('*'))),'D':23,'P':18,'unchangedP':15,'changedP':changed,'AM393unchanged':393,'sources':17,'actualWholePages':23,'normalRecordsWritten':True}))
