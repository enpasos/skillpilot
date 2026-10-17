import json,pathlib,copy,hashlib
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=pathlib.Path(__file__).resolve().parent;Q=OUT.parent
V1=Q/'chemie-current439-HB-digital-three-P-author-20261017-v1';P5=Q/'chemie-current439-HB-five-paired-P-integration-20261017-v1/failed-casebrief-length-attempt'
def read(p):return json.loads(p.read_text())
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
author=read(V1/'AUTHOR.three-whole-P-successors.pending.json');previous=read(V1/'INPUT.clean-three-whole-digital-P-successors.science.json')
originals={r['goal']['id']:r['profile'] for r in previous['unchangedSevenCurrentScientificInputs']}
rootprofiles={r['goalId']:r['profile'] for r in read(P5/'P5.paired.candidates.json.snapshot')['goals']}
G='e81a4aed-9695-533e-8eb7-7a0c714346ea';R='31781d00-8f20-5041-bd7f-e261b27af162';S='38e30bb9-6145-5da0-80b8-36e3c45e15d0'
summaries={
 (G,0,'taskDemandDe'):'HB-SekII-Digitalzusatz: Erfasse eine tatsächlich ausgeführte vorhandene Untersuchung selbst elektronisch; manuelle Eingabe genügt. Echte Rohwerte bleiben Probe/Messpunkt, Einheit, Bedingungen und Kontrollen zugeordnet. Kennzeichne Referenzen, Übertragungen, Fehlstellen, Überlauf und Korrekturen; zeige das eigene elektronische Produkt. Alle bisherigen Sicherheits-, Wiederholungs-, Hypothesen- und Transferpflichten gelten weiter. Vollständige verbindliche HB-Erwartung: hb-own-experimental-electronic-record; Ganzmaterial M0/M1. Keine neue Datei-/Lauf-, Automatisierungs- oder Synchronisationsquote; außerhalb dieses HB-Scopes keine Zusatzbedingung.',
 (G,0,'expectedPerformanceDe'):'Nur im HB-SekII-Digitalscope: tatsächliches eigenes elektronisches Rohprotokoll mit echten Messwerten, Einheiten, Proben-/Bedingungsbezug und ehrlicher Herkunft/Fehlstellen/Korrektur. Standard-Etikettwerte bleiben Referenzen; keine Sollwerte als Messung. Manuelle Eingabe genügt, Papier allein nicht. Alle bisherigen Pflichten bleiben. Verbindlich: vollständige Erwartung hb-own-experimental-electronic-record und Ganzmaterial M0/M1; keine zusätzliche Lauf-/Datei-/Automatisierungsquote.',
 (G,1,'expectedPerformanceDe'):'Nur im HB-SekII-Digitalscope: tatsächliches eigenes elektronisches Rohprotokoll mit echten Messwerten, Einheiten, Ansatz-/Bedingungsbezug und ehrlicher Herkunft/Fehlstellen/Korrektur. Starttemperatur, Dauer und Wiederholung bleiben zugeordnet; keine Sollwerte als Messung. Manuelle Eingabe genügt, Papier allein nicht. Alle bisherigen Pflichten bleiben. Verbindlich: vollständige Erwartung hb-own-experimental-electronic-record und Ganzmaterial M0/M1; keine zusätzliche Lauf-/Datei-/Automatisierungsquote.',
 (R,0,'expectedPerformanceDe'):'HB-SekII-Zusatz: eigenes digitales Produkt zeigt Makro-Stoffzustand, modelliertes Lichtmikroskopfeld und submikroskopische Ionenverteilung korrekt getrennt. 100-µm-Kristall in 500-µm-Feld sind Modellmaße, keine Messung; einzelne Ionen sind dort nicht optisch aufgelöst. Je vier Na+/Cl− bleiben erhalten; kein sichtbarer Kristall bedeutet nicht ionenfrei. Formel ersetzt keine Ebene. Herkunft, Zielgruppe und Grenzen begründen; keine Datei-/Programmierquote. Vollständige Erwartung hb-digital-three-observation-levels und Ganzmaterial M0/M2 bleiben verbindlich.',
 (R,0,'expectedPerformanceEn'):'HB upper-secondary addition: the own digital product distinguishes macroscopic material state, model light-microscope field and submicroscopic ion distribution. The 100-µm crystal in a 500-µm field uses model dimensions, not measurements; individual ions are not optically resolved there. Four Na+/Cl− each remain; no visible crystal does not mean ion-free. A formula replaces no level. Justify origin, audience and limits; no file/programming quota. Full expectation hb-digital-three-observation-levels and whole materials M0/M2 remain binding.',
 (S,0,'expectedPerformanceDe'):'HB-SekII-Zusatz: Dokumentation UND Präsentation sind mittels digitaler Werkzeuge tatsächlich gemeinsam erarbeitet. Eigener und reale weitere fachliche Beiträge sowie gemeinsame Abstimmung sind am Produkt per kurzem Vermerk oder Beobachtung erkennbar. Eigenes analoges Medium, persönlicher Vortrag, echte Frage und bestehender Publikumstransfer bleiben Pflicht. Keine erfundene Zusammenarbeit oder Cloud-/Synchronitäts-/Historien-/Beitragsquote. Vollständige Erwartung hb-joint-digital-documentation-presentation und Ganzmaterial M0/M3 bleiben verbindlich.',
 (S,0,'expectedPerformanceEn'):'HB upper-secondary addition: documentation AND presentation are genuinely developed jointly using digital tools. Own and others’ real scientific contributions and joint decisions are traceable in the product through a short note or observation. Own analogue medium, personal delivery, genuine question and retained audience transfer remain required. No invented collaboration or cloud/synchrony/history/contribution quota. Full expectation hb-joint-digital-documentation-presentation and whole materials M0/M3 remain binding.',
 (S,1,'expectedPerformanceDe'):'HB-SekII-Zusatz: Dokumentation UND Präsentation sind mittels digitaler Werkzeuge tatsächlich gemeinsam erarbeitet. Eigener und reale weitere fachliche Beiträge sowie gemeinsame Abstimmung sind am Produkt per kurzem Vermerk oder Beobachtung erkennbar. Eigenes analoges Medium, persönlicher Vortrag, echte Frage und bestehender Publikumstransfer bleiben Pflicht. Keine erfundene Zusammenarbeit oder Cloud-/Synchronitäts-/Historien-/Beitragsquote. Vollständige Erwartung hb-joint-digital-documentation-presentation und Ganzmaterial M0/M3 bleiben verbindlich.',
 (S,1,'expectedPerformanceEn'):'HB upper-secondary addition: documentation AND presentation are genuinely developed jointly using digital tools. Own and others’ real scientific contributions and joint decisions are traceable in the product through a short note or observation. Own analogue medium, personal delivery, genuine question and retained audience transfer remain required. No invented collaboration or cloud/synchrony/history/contribution quota. Full expectation hb-joint-digital-documentation-presentation and whole materials M0/M3 remain binding.'}
files={'M0':'CURRENT.six-full-case-successors.with-exact-originals.json','M1':'AUTHOR.e81a.complete-case-addition.DE-EN.json','M2':'AUTHOR.31781.complete-case-addition.DE-EN.json','M3':'coauthor38.complete-case-additions.DE-EN.json'}
materials={k:pin(V1/v) for k,v in files.items()}
dump('BINDING.unchanged-whole-operative-materials.json',{'role':'All complete scientifically reviewed materials retained exact in v1; summaries do not replace them','bindings':materials})
delta=[];rows=[]
for record in author['records']:
    gid=record['goalId'];before=record['profile'];assert rootprofiles[gid]==before
    after=copy.deepcopy(before)
    for (g,i,k),summary in summaries.items():
        if g!=gid:continue
        prefix=originals[gid]['applicationCaseBriefs'][i][k];previousvalue=before['applicationCaseBriefs'][i][k]
        assert previousvalue.startswith(prefix) and len(previousvalue)>2000
        replacement=prefix+'\n\n'+summary
        assert len(replacement)<=1900
        after['applicationCaseBriefs'][i][k]=replacement
        delta.append({'goalId':gid,'path':'/profile/applicationCaseBriefs/'+str(i)+'/'+k,'caseId':before['applicationCaseBriefs'][i]['id'],'before':previousvalue,'after':replacement,'beforeChars':len(previousvalue),'afterChars':len(replacement),'preservedOldPrefix':prefix,'oldPrefixChars':len(prefix),'oldPrefixRetainedExact':True,'replacedNewAppendixOnly':True,'fullNewExpectationAndWholeMaterialUnchanged':True})
    for ci,case in enumerate(after['applicationCaseBriefs']):
        for k,v in case.items():
            if isinstance(v,str):assert len(v)<=2000,(gid,ci,k,len(v))
    changes={(d['path'],d['before'],d['after']) for d in delta if d['goalId']==gid}
    restored=copy.deepcopy(after)
    for d in delta:
        if d['goalId']==gid:
            i=int(d['path'].split('/')[-2]);k=d['path'].split('/')[-1];restored['applicationCaseBriefs'][i][k]=d['before']
    assert restored==before
    rows.append({'goalId':gid,'goalExact':record['goalExact'],'profile':after,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','scientificFollowup':'pending_two_targeted_reviews','nativeFingerprintBindingCreated':False,'wholeMaterialBindings':materials})
assert len(delta)==9 and len(rows)==3
dump('AUTHOR.three-whole-profiles.schema-brief-v2.pending.json',{'role':'Technical AUTHOR summary-only successor, pending two targeted follow-up reviews','records':rows})
dump('DELTA.exact-nine-fields.before-after-charcounts.json',{'changedFieldCount':9,'allOldCasePrefixesRetainedExact':True,'onlyAppendedNewSummaryTextReplaced':True,'wholeExpectationMaterialAndOtherProfileFieldsExact':True,'fields':delta})
for r in rows:dump('AUTHOR.'+r['goalId'][:8]+'.whole-profile.schema-brief-v2.json',r['profile'])
dump('INPUT.clean-three-whole-profiles-and-nine-deltas.science.json',{'role':'Clean bounded v2 summary follow-up; whole operative science unchanged','source':previous['source'],'unchangedSevenCurrentScientificInputs':previous['unchangedSevenCurrentScientificInputs'],'threeOriginalAuthorProfiles':[{'goal':r['goalExact'],'profile':r['profile']} for r in author['records']],'threeV2Profiles':[{'goal':r['goalExact'],'profile':r['profile']} for r in rows],'nineFieldDeltas':delta,'unchangedCompleteMaterialBindings':materials,'reviewScope':'Only judge retention of obligations/meaning in nine shortened appended summaries and their whole-profile/material context; no full source or new-topic review, no native/human acceptance.'})
inputs=[V1/'SELECTOR.HB-digital-three-P-author.pending.sealed.json',V1/'AUTHOR.three-whole-P-successors.pending.json',V1/'INPUT.clean-three-whole-digital-P-successors.science.json',P5/'STOCK.P5.write.execution.json.snapshot',P5/'P5.paired.candidates.json.snapshot',Q/'chemie-current439-HB-digital-four-clean-input-20261017-v1/INPUT.four-HB-digital-findings.whole-goals-P.json',ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json']
dump('INPUTS.pinned.json',[pin(p) for p in inputs]+list(materials.values()))
print(json.dumps({'changedFields':len(delta),'fieldCharCounts':[(d['goalId'][:8],d['path'],d['beforeChars'],d['afterChars']) for d in delta],'maxAllCaseBriefScalarChars':max(len(v) for r in rows for c in r['profile']['applicationCaseBriefs'] for v in c.values() if isinstance(v,str))}))
