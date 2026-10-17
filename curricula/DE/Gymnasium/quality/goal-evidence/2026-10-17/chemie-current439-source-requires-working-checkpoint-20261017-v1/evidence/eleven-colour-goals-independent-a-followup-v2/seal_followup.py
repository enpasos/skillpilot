import datetime,hashlib,json
from pathlib import Path

OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-independent-a-followup-v2')
OLD=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-v1')
NEW=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-successor-v2')
FIRST=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-independent-a-v1')
def pin(p):
    p=Path(p)
    return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,obj):
    p=OUT/name
    with p.open('x') as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
    return p
selector=NEW/'SELECTOR.clean-v2-content-for-other-reviewers.json';assert pin(selector)['sha256']=='f1adfd5993fabd730528558f1afd4d2493f8d1db03f88ec817e446b43c861c78'
s=json.loads(selector.read_text());input_path=Path(s['reviewInput']['path']);assert pin(input_path)['sha256']=='73cb125f331b2f4be319d04630883041e0956137a658997be980fd0e859e6048'
new=json.loads(input_path.read_text());old_path=OLD/'REVIEW-INPUT.clean-eleven-colours-whole-goals-Ps-primary-courses-and-CAS.json';old=json.loads(old_path.read_text())
assert pin(old_path)['sha256']=='f8b9e489b3e9b69f60a2213fe0aeb0ed13301fc50fb7d922ef475ac944be3a48'
sealhash=NEW/'AUTHOR.v2.SEAL.sha256';assert pin(sealhash)['sha256']=='f3c78115d84e733da2bf5f38446d5ad08cb0025a85f73d1def309372bdea75ee'
assert set(old)-set(new)=={'wholeElevenUnchangedScientificProfiles'}
for k,v in old.items():
    if k not in ['role','questions','wholeElevenUnchangedScientificProfiles']:assert new[k]==v,k
assert new['questions'][1:len(old['questions'])]==old['questions'][1:] and len(new['questions'])==len(old['questions'])+1
assert 'one-DE-task-field successor' in new['questions'][0]
assert new['wholeElevenCurrentBeforeScientificProfiles']==old['wholeElevenUnchangedScientificProfiles']
pins={}
def rec(x):
    if isinstance(x,dict):
        if {'path','sha256'}<=x.keys():pins[x['path']]=x
        for v in x.values():rec(v)
    elif isinstance(x,list):
        for v in x:rec(v)
rec(s);rec(new)
for p,r in pins.items():assert pin(p)['sha256']==r['sha256'].removeprefix('sha256:')
for pair in new['retainedOriginalCASPins']:
    assert Path(pair['original']['path']).read_bytes()==Path(pair['retainedExactCopy']['path']).read_bytes()
cas_path=Path(s['oneFieldWholePCAS']['path']);assert pin(cas_path)['sha256']=='053149881813b0f3c118eecab7cf5c53494cd6a485317178645e5849129a3778'
cas=json.loads(cas_path.read_text());assert cas==new['separate188PClarificationWholeProfileChange']
assert digest(cas['before'])==cas['beforeDigest'] and digest(cas['after'])==cas['afterDigest']
assert cas['noAutoApply'] is True and cas['normalL6L7WritesAuthorized'] is False
gid=cas['goalId'];old_profiles={r['goalId']:r['wholeProfile'] for r in old['wholeElevenUnchangedScientificProfiles']};new_profiles={r['goalId']:r['wholeProfile'] for r in new['wholeElevenProposedScientificProfiles']}
assert set(old_profiles)==set(new_profiles) and len(old_profiles)==11
assert cas['before']==old_profiles[gid] and cas['after']==new_profiles[gid]
def diffs(a,b,path=''):
    if isinstance(a,dict) and isinstance(b,dict):
        assert set(a)==set(b)
        return sum((diffs(a[k],b[k],path+'/'+k) for k in a),[])
    if isinstance(a,list) and isinstance(b,list):
        assert len(a)==len(b)
        return sum((diffs(v,b[i],path+'/'+str(i)) for i,v in enumerate(a)),[])
    return [] if a==b else [{'jsonPointer':path,'before':a,'after':b}]
delta=diffs(cas['before'],cas['after']);assert delta==cas['exactChangedLeafFields'] and len(delta)==1
assert delta[0]['jsonPointer']=='/applicationCaseBriefs/1/taskDemandDe'
assert all(old_profiles[k]==new_profiles[k] for k in old_profiles if k!=gid)
current={r['goalId']:r['profile'] for r in map(json.loads,Path(new['currentWholeProfilesSource']['path']).read_text().splitlines())}
assert all(current[k]==v for k,v in old_profiles.items())
f=FIRST/'FIRST.independent-a.json';md=FIRST/'FIRST.independent-a.md';fs=FIRST/'FIRST.seal.json'
assert pin(f)['sha256']=='f7c8a06ef8dffa5bf15d32e0bf144c64e372d6cf3730b11959f7f318a869d86b'
assert pin(md)['sha256']=='ec24b7c7200acd80e2f69e632621d6e7fcd0e2e4a90612e47e55ac411bff912e'
assert pin(fs)['sha256']=='b2705c8c5fccd0e72eb8adcfc745a6b708c1d799f618791e9dff762c0f3e2b3e'
first=json.loads(f.read_text());assert first['limitedRevision']['currentLiteralPhrases'][0] in delta[0]['before']
for r in json.loads(fs.read_text())['allOwnFilesBeforeSeal']:assert pin(r['path'])==r
closed=[r for r in first['whole43ContextDecisions'] if r['goalId']==gid];assert len(closed)==5 and all(r['decision']=='HOLD' for r in closed)
for r in closed:r['decision']='KEEP'
followup={'artifactType':'own-informed-additive-followup','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ai_candidate','humanReviewStatus':'needs_human_review',
 'decision':'KEEP','scopeDe':'Der belegte einzelne188-DE-Aufgabenfeldbefund ist geschlossen. Die fünf deshalb offenen188-Kontexte wechseln in dieser eigenen informierten Nachprüfung zu KEEP. Die38 früheren begrenzten KEEP-Kontexte,188-Voraussetzungsentscheidung und BW-Labels bleiben unverändert. Keine neue Gesamtfachprüfung.',
 'roleSeparationDe':'Fremder Paket04-Autornachfolger nach meinem eigenen unveränderten FIRST. Keine Peer-B-Urteile oder Autorenbegründungen gelesen. Meine getrennte Autorrolle03 erlaubt weiterhin keine eigene unabhängige Annahme dieses eigenen Pakets.',
 'unchangedOriginalFIRSTAndSeal':[pin(f),pin(md),pin(fs)],
 'inputPins':[pin(selector),pin(input_path),pin(old_path),pin(cas_path),pin(sealhash),*[pin(p) for p in pins]],
 'issueClosed':{'issueId':first['limitedRevision']['issueId'],'goalId':gid,'decision':'KEEP','exactOnlyScientificLeafChange':delta,
 'ownScientificReasonDe':'Das neue Material nennt den Umsatzanteil der Farbstoffsparte am Gesamtumsatz von FirmaB ausdrücklich als Bezugsgröße. Der Auftrag schließt jetzt nur einen Gesamtumsatzrückgang aus. Bei einem zur Veranschaulichung konstanten GesamtumsatzR ist der Spartenumsatz vorher0,70R und nachher0,35R; das Verhältnis ist0,5. Somit bleibt der tatsächliche Spartenrückgang möglich und wird nicht fälschlich ausgeschlossen. Ein Anteil am gesamten relevanten Markt wird nicht mehr behauptet. Der neue DE-Auftrag stimmt darin mit den unveränderten EN- und Erwartungsfeldern überein.',
 'otherWholePerformancePreservedDe':'Forschungsfinanzierung, drei Verfahrenstransfers, Produktdiversifizierung, hohe unbezifferte Abwasserschäden und Nutzen/Belastung/Datengrenze bleiben vollständig. Das Archiv bleibt ausdrücklich erfunden; die Zahlen sind keine echten Unternehmens- oder Lernendendaten.',
 'beforeWholePBodySha256':cas['beforeDigest'],'afterWholePBodySha256':cas['afterDigest']},
 'exactPreservationChecks':{'before11ProfilesEqualV1AndCurrentPhysicalP439':True,'other10WholeProposedProfilesIdentical':True,'allOther188WholePFieldsIdentical':True,
 'wholeElevenGoalCASAndSeparate188RequiresCASUnchanged':True,'wholeBWViewCASUnchanged':True,'oldRoleHandoffByteIdentical':True,
 'allOtherOriginalCleanTopLevelContentEqualExceptRoleQuestionAndExplicitProfileContainerSuccessor':True,'wrapperQuestionInstructionChanges':'First question now identifies operative proposed profiles; one final bounded comparison question added. Original questions2–5 are identical.','allCurrent37ContextProfilesIncludingP9Unchanged':True,
 'original54PlusNewPinsChecked':len(pins),'retainedOriginalCASAndHandoffCopiesByteExact':len(new['retainedOriginalCASPins']),
 'whole43TargetViewRolesAnd67MemorySelectionsUnchangedFromOwnFIRST':True,'newFullCompilerOrNativeReviewPerformed':False},
 'newlyClosedFiveContexts':closed,'retainedFirstContextCounts':{'earlierPositiveContextsRetained':38,'newlyClosed':5,'boundedScientificContextsAfterFollowup':43},
 'retainedOpenBoundariesDe':['Original Post20-650/39 und physisches P439 sind die unveränderte Basis; Whole-P-After bleibt inaktiver Vorschlag mit vollständig guarded Before. Keine stillschweigende Aktivierung oder Änderung des eigentlichen Ledgers.',
 'Finale native/technische Goal-/P-/D-/M-/V-/Kontext-/Quellenbindung und tatsächlicher neuer Applicability-Compilerlauf bleiben separat offen.',
 'Eigener Erwerbsumfang bleibt von amtlicher Vollabdeckung und tatsächlicher Themenwahl getrennt. Reale61da-Lernendenrecherche und63e-Küpenausführung mit freigegebenerSOP, direkter Beobachtung und eigenen Rohlogs bleiben unbewiesen.',
 'Keine komplette Pfadschließung, Human-, M7- oder Hostannahme.439 curricularAtomic sowie Math/Phys/Bio-M7 und alle alten Target-/Support-/Memoryrollen bleiben geschützt.'],
 'candidateMainNormalL6L7Mutation':False,'fullBuildOrNativeReview':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False}
fj=write('FOLLOWUP.independent-a.one188-DE-field.v2.json',followup)
fm=OUT/'FOLLOWUP.independent-a.one188-DE-field.v2.md'
with fm.open('x') as fp:fp.write('# Eigene informierte additive A-Nachprüfung – Paket04 v2\n\n**KEEP** im begrenzten bisherigen fachlichen Umfang; `ai_candidate / needs_human_review`.\n\nDer eine188-DE-Aufgabenfeldbefund ist geschlossen. Das neue Feld nennt den Umsatzanteil der Farbstoffsparte am Gesamtumsatz von FirmaB und schließt nur einen Gesamtumsatzrückgang aus. Bei konstantemR gilt0,70R→0,35R: Der Spartenumsatz halbiert sich; der Gesamtumsatz bleibt gleich. Es wird kein Marktanteil behauptet.\n\nDie fünf deshalb offenen188-Kontexte sind nun KEEP. Die bisherigen38 begrenzten positiven Kontexte sowie die separate188-Voraussetzungskorrektur und beide BW-Labels bleiben bestehen. Das ursprüngliche FIRST samt Siegel bleibt bytegleich. Dies ist keine neue Vollprüfung.\n\nExakt ein wissenschaftliches Blattfeld ist geändert: `/applicationCaseBriefs/1/taskDemandDe`. Alle anderen188-P-Felder, die zehn anderen ganzen P-Profile, alle bisherigen Goal-/View-CAS und der alte Rollen-Handoff sind unverändert geprüft. Die physische P439-Basis und die ganzen37 Kontextprofile einschließlich aktuellerP9-Bodys bleiben gleich. Forschungs-/Umwelt-/Transferleistung, ursprüngliche Zahlen, EN-Fassung und Ausführungspflichten bleiben erhalten.\n\nFinale Compiler-/native/technische Bindungen, tatsächliche Lernendenrecherche und beaufsichtigte Küpenausführung bleiben offen. Keine amtliche Vollabdeckung, persönliche Themenwahl, vollständige Pfadschließung, M7-, Human- oder Hostannahme. Keine Main-/Normal-/Kandidatenmutation. Die eigene Autorrolle03 bleibt getrennt.\n\nVollständige neue und alte Inputpins, exakter Feldvergleich und fünf Einzelkontexte stehen im JSON.\n')
seal=write('FOLLOWUP.seal.json',{'artifactType':'own-informed-followup-seal','status':'ai_candidate','humanReviewStatus':'needs_human_review','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'followupFiles':[pin(fj),pin(fm)],'unchangedFirst':[pin(f),pin(md),pin(fs)],'ownSource':pin(OUT/'seal_followup.py'),'inputPins':followup['inputPins'],
 'subsequentEditsRequireAdditiveSuccessor':True,'M7':False,'HumanApproval':False,'hostAcceptance':False})
(OUT/'FOLLOWUP.seal.sha256').write_text(pin(seal)['sha256']+'  FOLLOWUP.seal.json\n')
for p in OUT.iterdir():
    if p.is_file():p.chmod(0o444)
for row in followup['inputPins']:assert pin(row['path'])==row
print(json.dumps({'decision':'KEEP','closedOwnOriginalFive188Holds':True,'followupJSON':pin(fj),'followupMD':pin(fm),'seal':pin(seal)},ensure_ascii=False,indent=2))
