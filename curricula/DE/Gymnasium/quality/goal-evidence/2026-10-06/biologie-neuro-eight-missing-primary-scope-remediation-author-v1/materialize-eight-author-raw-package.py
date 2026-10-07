#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize author-only raw primary records and eight inactive correction candidates."""
import copy
import datetime
import hashlib
import json
import pathlib
import re
import unicodedata
import uuid
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

OUT=pathlib.Path(__file__).resolve().parent
ROOT=pathlib.Path(__file__).resolve().parents[7]
DAY=OUT.parent
PRIMARY=OUT/'primary'
ROUTING=DAY/'biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1'
OLDER=DAY/'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
NW3=DAY/'biologie-neuro-he-original-spelling-nw-two-source-components-author-v3'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return str(p.relative_to(ROOT))
def write(name,j):
    p=OUT/name
    assert not p.exists(),p
    p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s).replace('\xad','').replace('­','')).strip()
current_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current=read(current_path)
by_id={g['id']:g for g in current['goals']}
route=read(ROUTING/'eight-current-omitted-goals-full-witnesses-and-bounded-next-locators.json')
ids=route['actualEightOmittedIds']
assert len(ids)==8
snapshot=copy.deepcopy(current)
write('current472-whole-canonical.actual.snapshot.json',snapshot)

# Fresh original HTML section records; the ordinal is an authored locator only.
by_extraction_path=ROOT/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
by_extraction=read(by_extraction_path)
by_lookup={norm(g['sourceText']):g for g in by_extraction['sourceGoals']}
by_records=[]
for level,anchor in [('EA','313324'),('GA','314384')]:
    p=PRIMARY/f'BY13-{level}.current-official.html'
    soup=BeautifulSoup(p.read_text(),'html.parser')
    header=soup.find(id=anchor);assert header
    section=header.find_parent('section')
    textfile=PRIMARY/f'BY13-{level}.neural-section.actual-read.txt'
    section_copy=BeautifulSoup(str(section),'html.parser')
    for d in section_copy.find_all('dialog'):d.decompose()
    textfile.write_text(section_copy.get_text('\n',strip=True)+'\n')
    blocks=section.find_all('div',class_='thema_absch',recursive=True)
    assert len(blocks)==2
    for typ,block in zip(['competency','content'],blocks):
        for ordinal,li in enumerate(block.find('ul').find_all('li',recursive=False),1):
            raw_li=str(li)
            cleaned=BeautifulSoup(raw_li,'html.parser')
            for d in cleaned.find_all('dialog'):d.decompose()
            text=norm(cleaned.get_text(' ',strip=True))
            existing=by_lookup.get(text) if typ=='competency' else None
            rid=f'BY13-{level}.LB2.{typ}.{ordinal:02d}'
            record={
                'recordId':rid,'jurisdiction':'DE-BY','stage':'SekII','originalYear':'13',
                'originalLevelLabel':'erhöhtes Anforderungsniveau' if level=='EA' else 'grundlegendes Anforderungsniveau',
                'projectionCourseProfile':'LK' if level=='EA' else 'GK',
                'projectionProfileIsRepositoryMappingNotQuotedHeading':True,
                'physicalPage':None,'printedPage':None,
                'primaryUrl':f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/{"erhoeht" if level=="EA" else "grundlegend"}#{anchor}',
                'originalHtmlAnchor':anchor,'originalSectionTitle':norm(header.find('h2').get_text(' ',strip=True)),
                'sourceHtmlPath':rel(p),'sourceHtmlSha256':sha(p),
                'originalListType':typ,'authoredListPositionLocator':ordinal,'officialBulletNumberingClaim':False,
                'selector':f'#{anchor} + .content .thema_absch:nth-of-type({1 if typ=="competency" else 2}) > ul > li:nth-of-type({ordinal})',
                'originalText':text,'originalElementHtml':raw_li,
                'existingExtractionSourceGoalId':existing['id'] if existing else None,
                'existingExtractionSourceSpan':existing.get('sourceSpan') if existing else None,
                'existingExtractionSpanIsAuthoredIndexNotOfficialNumber':True,
                'actualFreshOfficialSectionReadByAuthor':True,'independentReviewStatus':'pending_two_independent_reviews',
            }
            if typ=='competency':assert existing, (rid,text)
            by_records.append(record)
write('BY13-EA-GA.actual-original-neural-section.records.json',{
    'schemaVersion':1,'createdAtUTC':NOW,'records':by_records,
    'EACompetencies':14,'GACompetencies':7,'EAContents':16,'GAContents':8,
    'HTMLHasNoPrintedOrPhysicalPage':True,'newIndependentApproval':False,
})
br={r['recordId']:r for r in by_records}

# Select actual PDF lines from bbox-layout. Text and coordinates remain reproducible.
def bbox_lines(name):
    tree=ET.parse(PRIMARY/f'{name}.actual-bbox.html')
    ns={'x':'http://www.w3.org/1999/xhtml'}
    lines=[]
    for i,line in enumerate(tree.findall('.//x:line',ns)):
        words=line.findall('x:word',ns)
        lines.append({'lineIndex':i,'rawText':' '.join(w.text or '' for w in words),
                      'bbox':{k:float(line.attrib[k]) for k in ['xMin','yMin','xMax','yMax']}})
    assert lines
    return lines
he_lines=bbox_lines('HE43')
def select(start,end=None):
    begin=next(i for i,l in enumerate(he_lines) if start in norm(l['rawText']))
    finish=begin if end is None else next(i for i in range(begin,len(he_lines)) if end in norm(he_lines[i]['rawText']))
    return he_lines[begin:finish+1]
mig=read(OLDER/'he43.original-ten.actual.migration-and-preservation.json')
success={s['originalBulletKey']:s for s in mig['successors']}
he_records=[]
specs=[('GK1','Bau und Funktion der Nervenzelle',None),
       ('GK2','Synapsen: Funktion der erregenden','Drogen, Alkohol), neuromuskuläre Synapse'),
       ('LK1','Rezeptorpotenzial',None),('LK2','primäre und sekundäre Sinneszelle',None),
       ('LK3','Hormone: Hormonwirkung',None),
       ('LK4','Verrechnung des Informationsflusses','Summation, Funktion einer hemmenden Synapse)'),
       ('LK5','zelluläre Prozesse des Lernens',None),
       ('Q2.4.GK1','ein Sinnesorgan: Aufbau und Signaltransduktion','Erregungsleitung zur Reaktion)')]
for key,start,end in specs:
    s=success.get(key);lines=select(start,end)
    text=s['originalText'] if s else 'ein Sinnesorgan: Aufbau und Signaltransduktion (von der Sinneswahrnehmung über die Erregungsleitung zur Reaktion)'
    he_records.append({
        'recordId':'HE43.'+key,'sourceGoalId':s['sourceGoalId'] if s else None,
        'originalText':text,'actualBboxLines':lines,
        'physicalPage':43,'printedPage':43,'zeroBasedPdfPage':42,
        'sourceDocumentPath':rel(PRIMARY/'HE.current-official.pdf'),'sha256':sha(PRIMARY/'HE.current-official.pdf'),
        'primaryUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf',
        'originalTopic':'Q2.4' if key.startswith('Q2.4') else 'Q2.3',
        'authoredComponentLocator':key,'officialBulletNumberingClaim':False,
        'jurisdiction':'DE-HE','stage':'SekII','originalPhase':'Q2',
        'courseProfiles':['GK','LK'] if key.startswith('GK') or key.startswith('Q2.4') else ['LK'],
        'originalLevelLabel':'grundlegendes Niveau (Grundkurs und Leistungskurs)' if key.startswith('GK') or key.startswith('Q2.4') else 'erhöhtes Niveau (Leistungskurs)',
        'compulsoryThemeField':not key.startswith('Q2.4'),
        'compulsoryBasis':'HE original printed/physical33: Q2 verbindlich Themenfelder1 und3',
        'optionalQ24DoesNotEstablishGeneralMandatoryGKOrLKGoal':key.startswith('Q2.4'),
        'actualFreshPDFRasterReadByAuthor':True,'independentReviewStatus':'pending_two_independent_reviews',
    })
write('HE43.actual-original-components-bbox-and-stage-course.json',{'schemaVersion':1,'createdAtUTC':NOW,'records':he_records,'originalQ23TenBulletMigrationPreserved':True,'oldQ23xParaphrasesAreNotOriginalBullets':True})
hr={r['recordId']:r for r in he_records}

# Each current whole goal is kept separately from its real source components.
P={
ids[0]:{
 'title':'Hebb-Regel als gegebenes Lernmodell anwenden','titleEn':'Apply a supplied Hebbian learning model',
 'description':'Die lernende Person kann eine vorgegebene Hebb-Regel auf ein einfaches neuronales Modellnetz anwenden und anhand gegebener Fälle die Möglichkeiten und Grenzen dieses Lernmodells erläutern.',
 'descriptionEn':'The learner can apply a supplied Hebbian rule to a simple neural model network and use given cases to explain the possibilities and limits of this learning model.',
 'primary':['HE43.LK5','BY13-EA.LB2.competency.10','BY13-EA.LB2.content.11'],
 'component':'Zelluläre Lernprozesse und funktionelle/strukturelle Plastizität; die gegebene Hebb-Regel ist ausdrücklich eine verfasste Modellspezialisierung.',
 'componentEn':'Cellular learning and functional/structural plasticity; the supplied Hebbian rule is explicitly an authored model specialisation.',
 'unsupported':['Hebb-Regeln sind in den gelesenen Originalabschnitten nicht ausdrücklich benannt.','Eine eigenständige Pflicht zu Hebb-Netzwerkanwendung und Grenzendiskussion ist nicht belegt.'],
 'mode':'DECLARED_AUTHORED_MODEL_SPECIALISATION_CURRENT_AND_PROPOSED_WHOLE_SCOPE_HOLD',
 'scope':['DE-HE/SekII/LK','DE-BY/SekII/EA'],
 'minimality':'Die Regel wird gegeben statt als zusätzliche amtliche Wissenspflicht behauptet. Die eigenständige curricularAtomic-Platzierung bleibt prüfpflichtig; keine Zusammenlegung mit vorhandenem Zelluläre-Lernprozesse-Ziel wird vorgenommen.'},
ids[1]:{
 'title':'Sensorische Signaltransduktion und Codierung deuten','titleEn':'Interpret sensory signal transduction and coding',
 'description':'Die lernende Person kann an gegebenen Darstellungen die Entstehung eines Rezeptorpotenzials erklären und deuten, wie Reizstärke und Reizdauer in neuronalen Signalen repräsentiert werden.',
 'descriptionEn':'The learner can explain the generation of a receptor potential using supplied representations and interpret how stimulus intensity and duration are represented in neural signals.',
 'primary':['HE43.LK1','HE43.LK2','HE43.Q2.4.GK1','BY13-EA.LB2.competency.14','BY13-EA.LB2.content.15','BY13-EA.LB2.content.16','BY13-EA.LB2.competency.04','BY13-EA.LB2.content.04'],
 'component':'Rezeptorpotenzial, Sinneszelle und Signaltransduktion; BY benennt zusätzlich Informationscodierung von Reizstärke/Reizdauer beim Aktionspotenzial.',
 'componentEn':'Receptor potential, sensory cell and transduction; BY also names action-potential information coding of stimulus intensity/duration.',
 'unsupported':['Die vollständige eigene Pflicht zu Frequenz-, Orts- UND Populationscode ist in diesen Originalstellen nicht genannt.','HE Q2.4 ist optional und belegt keinen allgemeinen GK/LK-Pflichtanspruch.','BY-Rezeptor- und Auge/Phänomen-Anwendung darf nicht auf reine Codierungsbenennung reduziert werden.'],
 'mode':'MINIMAL_NARROWED_CROSS_COMPONENT_CANDIDATE_INDEPENDENT_OPERATOR_REVIEW_PENDING',
 'scope':['DE-BY/SekII/EA'],
 'minimality':'Die unbelegte verpflichtende Dreiergruppe wird entfernt; Reizstärke-/Reizdauer-Codierung bleibt an tatsächliche BY-Originalinhalte gebunden. HE nur begrenzter Rezeptor-LK-Beitrag bzw optionaler Q2.4-Kontext. Abgrenzung zu vorhandenem Aktionspotential-/Rezeptorziel bleibt notwendig.'},
ids[2]:{
 'title':'Gegebene neuronale Verschaltungen analysieren','titleEn':'Analyse supplied neural circuit arrangements',
 'description':'Die lernende Person kann für gegebene Verschaltungen mehrerer Nervenzellen postsynaptische Potentialänderungen vergleichen und daraus die Notwendigkeit erregender und hemmender Synapsen für eine geregelte Signalübertragung ableiten.',
 'descriptionEn':'The learner can compare postsynaptic potential changes in supplied arrangements of several neurons and infer the need for excitatory and inhibitory synapses in regulated signal transmission.',
 'primary':['HE43.LK4','BY13-EA.LB2.competency.08','BY13-EA.LB2.content.09'],
 'component':'Mehrzell-Verschaltung, Vergleich postsynaptischer Potentialänderungen und Ableitung der Erregungs-/Hemmungsnotwendigkeit; EPSP/IPSP sowie räumliche/zeitliche Summation.',
 'componentEn':'Multi-neuron arrangement, comparison of postsynaptic potentials and inference of the need for excitation/inhibition; EPSP/IPSP and spatial/temporal summation.',
 'unsupported':['Konvergenz/Divergenz ist in der HE-Liste nicht als eigene Pflicht genannt.','Eine eigene allgemeine Netzwerkmodell- oder Topologiepflicht wird nicht aus Summation erfunden.'],
 'mode':'MINIMAL_OPERATOR_FAITHFUL_CIRCUIT_CANDIDATE_INDEPENDENT_REVIEW_PENDING',
 'scope':['DE-BY/SekII/EA','DE-HE/SekII/LK'],
 'minimality':'Das nicht belegte Namenspaar Konvergenz/Divergenz wird entfernt; BY-Originaloperator vergleichen/ableiten ersetzt die allgemeine Topologieformulierung. HE belegt dabei nur die synaptische Verrechnung, keine volle separate Modellnetz-Pflicht.'},
ids[3]:{
 'title':'Neurotransmitter-Verfügbarkeit an einem Beispiel erklären','titleEn':'Explain neurotransmitter availability using one example',
 'description':'Die lernende Person kann an einem gegebenen Modell der chemischen Synapse erklären, wie ein Serotonin-Wiederaufnahmehemmer die Verfügbarkeit des Neurotransmitters verändert, und diese Erklärung als begrenzte Komponente eines multifaktoriellen Depressionsmodells einordnen.',
 'descriptionEn':'The learner can use a supplied chemical-synapse model to explain how a serotonin reuptake inhibitor changes neurotransmitter availability and place this explanation as one limited component within a multifactorial model of depression.',
 'primary':['BY13-EA.LB2.competency.07','BY13-EA.LB2.content.08','BY13-GA.LB2.competency.07','BY13-GA.LB2.content.08','BY13-EA.LB2.competency.06','BY13-EA.LB2.content.06','BY13-GA.LB2.competency.06','BY13-GA.LB2.content.06'],
 'contextOnly':['HE43.LK3'],
 'component':'Serotonin-Wiederaufnahmehemmer im multifaktoriellen Depressionskontext und erregende chemische Synapsen/Stoffeinwirkung.',
 'componentEn':'Serotonin reuptake inhibition in a multifactorial depression context and excitatory chemical synapses/substance influence.',
 'unsupported':['Die HE-Hormon-/Nervenverschränkung ist kein Dopamin-/Serotonin-Systembeleg.','Mehrere modulierende Transmittersysteme und deren ganze Wirkungsbreite bleiben ungebunden.','Die komplette Depressionskompetenz einschließlich Symptomen, Umgang, sozialen Folgen und Therapieableitung wird nicht durch diese Teilroutine geschlossen.','Die mechanistische gegebene Modelloperationalisierung ist eine Autorenentscheidung, keine wörtliche BY-Einzelkompetenz.'],
 'mode':'MINIMAL_SEROTONIN_COMPONENT_CANDIDATE_WHOLE_CLINICAL_SOURCE_HOLD',
 'scope':['DE-BY/SekII/GA','DE-BY/SekII/EA'],
 'minimality':'Beschränkung auf das tatsächlich benannte Serotonin-Beispiel statt einer unbelegten allgemeinen Systempflicht. Keine HE-LK-Restaurierung und keine klinische Ganzfreigabe. Der bestehende Alzheimer-Zieltext ist kein vollständiger Depressionspartner.'},
ids[4]:{
 'title':'Plastische Verbindungsänderungen an gegebenen Netzmodellen erklären','titleEn':'Explain plastic connection changes in supplied network models',
 'description':'Die lernende Person kann an gegebenen neuronalen Netzwerkmodellen erklären, wie Änderungen wirksamer Verbindungen die Verarbeitung gleicher Eingangssignale verändern.',
 'descriptionEn':'The learner can use supplied neural network models to explain how changes in effective connections alter the processing of identical input signals.',
 'primary':['HE43.LK5','BY13-EA.LB2.competency.10','BY13-EA.LB2.content.11'],
 'component':'Funktionelle/strukturelle neuronale Plastizität als Lernvoraussetzung; Verarbeitung gleicher Eingangssignale im gegebenen Netz ist eine erklärte Autorenoperationalisierung.',
 'componentEn':'Functional/structural neural plasticity as a condition for learning; processing identical inputs in a supplied network is a declared author operationalisation.',
 'unsupported':['HE enthält keinen eigenständigen GK-Bullet zu Integrationsprozessen, Lernen UND Verschaltung in neuronalen Netzen.','Das konkrete Netzwerkmodell ist nicht als eigene verpflichtende Originalroutine benannt.'],
 'mode':'DECLARED_AUTHORED_MODEL_SPECIALISATION_CURRENT_AND_PROPOSED_WHOLE_SCOPE_HOLD',
 'scope':['DE-HE/SekII/LK','DE-BY/SekII/EA'],
 'minimality':'Übernimmt die bereits inaktive begrenzte Netzmodellformulierung aus dem Routingkandidaten, nun mit korrektem Primärstatus. Die allgemeine Integrations-/Lern-/Verschaltungsbündelung und HE-GK-Behauptung werden nicht fortgeschrieben.'},
ids[5]:{
 'title':'LTP und LTD an gegebenen Befunden einordnen','titleEn':'Interpret LTP and LTD using supplied findings',
 'description':'Die lernende Person kann anhand gegebener Beschreibungen und Versuchsbefunde zu langfristiger Verstärkung oder Abschwächung synaptischer Wirksamkeit deren Bedeutung als Modelle zellulärer Lernprozesse erläutern und die Grenzen der Befunde benennen.',
 'descriptionEn':'The learner can use supplied descriptions and experimental findings of long-term strengthening or weakening of synaptic efficacy to explain their relevance as models of cellular learning and identify the limits of those findings.',
 'primary':['HE43.LK5','BY13-EA.LB2.competency.10','BY13-EA.LB2.content.11'],
 'component':'Zelluläre Lernprozesse und neuronale Plastizität; LTP/LTD werden ausschließlich als gegebene Autorenmodell-Spezialisierung behandelt.',
 'componentEn':'Cellular learning and neural plasticity; LTP/LTD are treated solely as a supplied authored model specialisation.',
 'unsupported':['LTP/LTD sind in den gelesenen Originalstellen nicht ausdrücklich benannt.','Eine selbständige Pflicht zu beiden Mechanismen samt experimenteller Einordnung ist nicht wörtlich belegt.'],
 'mode':'DECLARED_AUTHORED_MODEL_SPECIALISATION_CURRENT_AND_PROPOSED_WHOLE_SCOPE_HOLD',
 'scope':['DE-HE/SekII/LK','DE-BY/SekII/EA'],
 'minimality':'Befunde und Modellbeschreibung werden gegeben statt als zusätzliche literal benannte Mechanismenpflicht etikettiert. Die Spezialisierung und Operatorhöhe bleiben unabhängig zu entscheiden.'},
ids[6]:{
 'title':'Stoffeinwirkung auf chemische Synapsen ableiten','titleEn':'Infer substance effects on chemical synapses',
 'description':'Die lernende Person kann aus den Vorgängen an einer erregenden chemischen Synapse am Beispiel eines gegebenen Stoffes ableiten, wie die Informationsübertragung beeinflusst wird, und das Prinzip an einer neuromuskulären Synapse erläutern.',
 'descriptionEn':'The learner can infer from the processes at an excitatory chemical synapse how one supplied substance influences information transfer and explain the principle at a neuromuscular synapse.',
 'primary':['HE43.GK2','BY13-EA.LB2.competency.06','BY13-EA.LB2.content.06','BY13-EA.LB2.content.07','BY13-GA.LB2.competency.06','BY13-GA.LB2.content.06','BY13-GA.LB2.content.07'],
 'component':'Ein Stoffbeispiel, erregende chemische/ACh-Übertragung und Prinzip der Stoffeinwirkung an der neuromuskulären Synapse; BY-Operator ableiten bleibt erhalten.',
 'componentEn':'One substance example, excitatory chemical/ACh transfer and the principle of substance action at the neuromuscular synapse; the BY inference operator is preserved.',
 'unsupported':['Die allgemeine Breite psychoaktiver Substanzen an beliebigen Synapsen ist nicht vollständig belegt.','Die Original-HE-GK2-Pflicht ist gemeinsam GK/LK, nicht eine ausschließlich LK-Neuropharmakologiepflicht.','Die übrigen ACh-/Kanalpflichten im ganzen GK2-Bullet bleiben erhalten und sind nicht automatisch mit dieser Stoffroutine vollständig abgedeckt.'],
 'mode':'MINIMAL_ONE_SUBSTANCE_AND_OPERATOR_FAITHFUL_CANDIDATE_INDEPENDENT_REVIEW_PENDING',
 'scope':['DE-HE/SekII/GK','DE-HE/SekII/LK','DE-BY/SekII/GA','DE-BY/SekII/EA'],
 'minimality':'Ersetzt die unbegrenzt verallgemeinerte psychoaktive Mechanismenroutine durch ein tatsächliches Stoffbeispiel mit Originaloperator und neuromuskulärem Prinzip.'},
ids[7]:{
 'title':'Erregende chemische Synapsen erklären','titleEn':'Explain excitatory chemical synapses',
 'description':'Die lernende Person kann die Übertragung an einer erregenden chemischen Synapse am Beispiel Acetylcholin erklären und die Rolle des Transmitters sowie ligandenabhängiger und spannungsabhängiger Kanäle erläutern.',
 'descriptionEn':'The learner can explain transmission at an excitatory chemical synapse using acetylcholine and explain the roles of the transmitter and ligand-gated and voltage-gated channels.',
 'primary':['HE43.GK2','BY13-EA.LB2.competency.06','BY13-EA.LB2.content.06','BY13-GA.LB2.competency.06','BY13-GA.LB2.content.06'],
 'component':'Erregende chemische Acetylcholin-Synapse, Transmitter-/Rezeptorprinzip sowie liganden-/spannungsabhängige Kanäle.',
 'componentEn':'Excitatory chemical acetylcholine synapse, transmitter/receptor principle and ligand-/voltage-gated channels.',
 'unsupported':['Elektrische Synapsen sind in diesen Originalstellen nicht als Pflicht belegt.','Bloße elektrische Nervenerregung ist kein Beleg einer elektrischen Synapse.','Stoffbeispiel und neuromuskuläre Synapse des ganzen HE-Bullets dürfen nicht als erledigt verschwinden.'],
 'mode':'MINIMAL_REMOVE_UNSUPPORTED_ELECTRICAL_MODE_CANDIDATE_INDEPENDENT_REVIEW_PENDING',
 'scope':['DE-HE/SekII/GK','DE-HE/SekII/LK','DE-BY/SekII/GA','DE-BY/SekII/EA'],
 'minimality':'Entfernt den unbelegten verpflichtenden elektrischen Modus bei stabiler ID; behält eine tatsächlich belegte chemische Routine. Kanaldetail kommt ausdrücklich aus HE, nicht aus der einfachen BY-Inhaltsformulierung allein.'},
}
all_anchors={**hr,**br}
records=[];candidate=copy.deepcopy(current);candidate_index={g['id']:g for g in candidate['goals']}
for gid in ids:
    p=P[gid];before=by_id[gid];after=candidate_index[gid]
    for k in ['title','titleEn','description','descriptionEn']:after[k]=p[k]
    after['sourceRef']='Author candidate: actual HE original p43 and/or BY13 LB2; bounded components and declared specialisations; no whole-source approval'
    after.setdefault('extendedData',{})['authorPrimaryScopeRemediation']={
        'package':'biologie-neuro-eight-missing-primary-scope-remediation-author-v1',
        'status':'author_candidate_awaiting_two_independent_reviews',
        'actualPrimaryRecordIds':p['primary'],
        'wholeCurrentGoalSourceSupport':False,
        'authoredSpecialisation':p['mode'].startswith('DECLARED_'),
        'legacyProvenancePreservedAsHistoricalAuthoredWitnessNotOfficialBullet':True,
        'active':False,
    }
    records.append({
        'goalId':gid,'fullCurrentTitle':before['title'],'wholeCurrentGoalDEEN':before,
        'wholeCanonicalCandidateDEEN':after,'proposalStatus':p['mode'],
        'previousAuthoredHEWitness':next(r['previousAuthoredHEWitness'] for r in route['records'] if r['goalId']==gid),
        'actualPrimaryComponents':[all_anchors[x] for x in p['primary']],
        'contextOnlyNotSupportingComponents':[all_anchors[x] for x in p.get('contextOnly',[])],
        'boundedComponentDE':p['component'],'boundedComponentEN':p['componentEn'],
        'candidateSourceStageCourseScopes':p['scope'],
        'fullCurrentGoalUnboundComponents':p['unsupported'],
        'minimalCorrectionRationale':p['minimality'],
        'stableCanonicalIdPreserved':True,'requiresExact':after['requires']==before['requires'],
        'containsExact':after['contains']==before['contains'],
        'wholeCurrentGoalSourceSupported':False,'wholeOriginalSourceSupported':False,
        'wholeCandidateGoalApproved':False,'scientificApproval':False,
        'independentReviewStatus':'pending_two_independent_reviews','nativeVisibilityRestored':False,
    })
write('eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v1.json',{'schemaVersion':1,'createdAtUTC':NOW,'role':'raw author proposal, not independent approval','records':records,'originalCurrentAtomicGoals':390,'newCanonicalIds':0,'allEightWholeCurrentGoalsRemainHOLD':True,'newIndependentApprovals':0,'activeWrites':False})
write('current472-eight-only.canonical.author-v1.candidate.json',candidate)
write('eight-only.whole-canonical-author-deltas.json',[{'goalId':r['goalId'],'before':r['wholeCurrentGoalDEEN'],'after':r['wholeCanonicalCandidateDEEN']} for r in records])
assert len(candidate['goals'])==len(current['goals'])==472
assert all(g==candidate_index[g['id']] for g in current['goals'] if g['id'] not in ids)
assert all(g.get('requires')==candidate_index[g['id']].get('requires') and g.get('contains')==candidate_index[g['id']].get('contains') for g in current['goals'])

# Explicit inactive component records: metadata never invents a new official bullet.
namespace=uuid.UUID('8e4e4e28-35a7-55e7-b0ca-d47e3c6b4c72')
source_components=[];mapping_proposals=[]
for r in records:
    gid=r['goalId'];p=P[gid]
    sid=str(uuid.uuid5(namespace,'eight-missing-author-v1:'+gid))
    source_components.append({
        'id':sid,'canonicalGoalId':gid,'title':p['title'],'titleEn':p['titleEn'],
        'description':p['description'],'descriptionEn':p['descriptionEn'],
        'authoredComponent':True,'isOfficialBullet':False,'officialNumberingClaim':False,
        'actualOriginalRecordIds':p['primary'],'originalSourceTexts':[all_anchors[x]['originalText'] for x in p['primary']],
        'jurisdictionStageCourseProposals':p['scope'],'granularity':'authorComponentOrDeclaredSpecialisation',
        'wholeOriginalBulletCoverage':False,'wholeCurrentCanonicalCoverage':False,
        'wholeCandidateCoverageIndependentReviewPending':True,
        'authorSpecialisation':p['mode'].startswith('DECLARED_'),
        'authorCandidateOnly':True,'independentReviewStatus':'pending_two_independent_reviews',
    })
    mapping_proposals.append({
        'sourceGoalId':sid,'canonicalGoalId':gid,'matchType':'partial',
        'decision':'needs_canonical_goal','candidateCanonicalGoalIds':[gid],
        'mappedTargetGoalIds':[],'proposedSourceComponentBinding':{'actualOriginalRecordIds':p['primary'],'authorCandidateOnly':True,'wholeSourceSupported':False,'wholeCurrentGoalSupported':False,'independentReviewPending':True},
        'wholeOriginalSourceCoverage':False,'newIndependentApproval':False,'nativeVisibilityRestored':False,
    })
write('eight-bounded-components-and-declared-specialisations.source-candidates.author-v1.json',{'schemaVersion':1,'sourceGoals':source_components,'sourceDocuments':read(OUT/'fresh-official-primary-retrieval.actual.receipt.json')['retrievals'],'qualityReview':{'status':'author_candidate_awaiting_two_independent_reviews','wholeCurrentGoalCoverage':False,'humanApproval':False,'humanTrial':False}})
write('eight-inactive-source-component-mapping-proposals.author-v1.json',{'schemaVersion':1,'targetLandscapeId':current['landscapeId'],'sourceExtractionPath':rel(OUT/'eight-bounded-components-and-declared-specialisations.source-candidates.author-v1.json'),'reviewStatus':'author_candidate_awaiting_two_independent_reviews','decisions':mapping_proposals,'mappings':[],'wholeOriginalSourceCoverage':False,'activeWrites':False})

# Separate actual NW regression diagnosis; technical direct witnesses are not cluster inheritance.
receipt_path=ROOT/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
receipt=read(receipt_path)
nw_ids=['5b2571d9-f079-52b2-b21b-8f389c7409f4','49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd']
nw_source=read(NW3/'NW.two-bacterial-source-components.author-v3.candidate.json')
nw_mapping=read(NW3/'NW.two-bacterial-component-mappings.author-v3.candidate.json')
inputcfg_path=ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
inputcfg=read(inputcfg_path)
nw_scope=next(s for s in receipt['scopes'] if s['key']=='DE-NW/SekI/')
nwlines=bbox_lines('NW35')
nw_bullet_lines=[l for l in nwlines if 'den Bau und die Vermehrung von Bakterien und Viren' in norm(l['rawText'])]
assert nw_bullet_lines
nw_diag=[]
for gid in nw_ids:
    witnesses=[]
    for index in nw_scope['witnessGroupRefs']:
        g=receipt['witnessGroups'][index]
        if gid in g['goalIds']:
            mp=receipt['inputBindings'][g['mappingInput']];xp=receipt['inputBindings'][g['extractionInput']]
            m=read(ROOT/mp['path']);x=read(ROOT/xp['path'])
            decision=next(d for d in m['decisions'] if d['sourceGoalId']==g['sourceGoalId'])
            source=next(d for d in x['sourceGoals'] if d['id']==g['sourceGoalId'])
            witnesses.append({'storedBaselineWitness':g,'actualMappingBinding':mp,'actualExtractionBinding':xp,'actualDecision':decision,'actualWholeSourceSummaryObject':source})
    assert len(witnesses)==1 and witnesses[0]['storedBaselineWitness']['coverage']=='direct'
    assert gid in witnesses[0]['actualDecision']['canonicalGoalIds']
    cmp=next(m for m in nw_mapping['mappings'] if m['canonicalGoalId']==gid)
    component=next(g for g in nw_source['sourceGoals'] if g['id']==cmp['legacyGoalId'])
    nw_diag.append({
        'goalId':gid,'fullCurrentGoalDEEN':by_id[gid],'status':'CURRENT_PROTECTED_NW_SEKI_G9_SOURCE_ATLAS_CONTEXT_LOSS',
        'baselineActualScope':'DE-NW/SekI/','lostDurationModel':'G9','courseProfile':None,
        'baselineWitnesses':witnesses,'falseClusterInheritanceUsed':False,
        'originalPrimary':{'url':nw_source['sourceDocument']['url'],'physicalPage':35,'printedPage':35,'stage':'SekI','durationModel':'G9','courseProfile':None,'originalText':'den Bau und die Vermehrung von Bakterien und Viren beschreiben (UF1),','actualBboxLines':nw_bullet_lines,'freshDocumentPath':rel(PRIMARY/'NW.current-official.pdf'),'freshSha256':sha(PRIMARY/'NW.current-official.pdf'),'actualRasterViewedByAuthor':True},
        'actualCause':'The frozen Neuro21 original overlay holds the whole broad IF7 summary decision, removing its direct target relations including these protected outside21 goals. No separate v3 component mapping is wired into current active atlas inputs.',
        'existingSeparateSourceComponent':component,'existingSeparateMapping':cmp,
        'existingSeparateSourceDossierPath':rel(NW3/'NW.two-bacterial-source-components.author-v3.candidate.json'),
        'existingSeparateMappingDossierPath':rel(NW3/'NW.two-bacterial-component-mappings.author-v3.candidate.json'),
        'declaredActiveComponentExtractionPath':nw_mapping['sourceExtractionPath'],
        'declaredActiveComponentExtractionExists':(ROOT/nw_mapping['sourceExtractionPath']).is_file(),
        'separateMappingAlreadyInActiveAtlasConfig':rel(NW3/'NW.two-bacterial-component-mappings.author-v3.candidate.json') in json.dumps(inputcfg),
        'candidateRemedy':'Technically adopt exactly the independently completed v3 bacterial partial components using separate extraction/mapping paths and the correct G9 placement, while preserving the whole IF7/viral HOLD and protected full canonical routines. Independent previous decisions and current exact input linkage must be checked before any integration.',
        'newIndependentScienceDecision':False,'sourceWholeCoverage':False,
        'currentWholeCanonicalGoalChanged':False,'activeBindingRestored':False,'integrationApproved':False,
    })
write('NW-two-protected-losses.actual-primary-and-direct-mapping-diagnosis.json',{'schemaVersion':1,'createdAtUTC':NOW,'records':nw_diag,'actualActiveAtlasConfigBinding':{'path':rel(inputcfg_path),'sha256':sha(inputcfg_path)},'newIndependentApproval':False,'activeWrites':False})

neighbors=['347110a1-1d2e-5195-8acc-64e7e3893ce5','e1117126-4e78-5a37-a645-2debc167219b','78748ef2-93fb-5ec3-8c1e-90e42b9ea863','04d770b3-ba5e-5438-88ca-110cbaeba62c','485ef1c3-8997-52b7-91f5-b1ddf179013d']
write('preserved-source-obligations-overlap-and-review-worklist.json',{
    'schemaVersion':1,'currentCanonicalNeighborsDEEN':[by_id[k] for k in neighbors],
    'noNewCanonicalIdsProposed':True,
    'noForcedCollapseOfHebbLTPNetworkSpecialisationsIntoGenericCellularLearning':True,
    'overlapReviewRequiredBeforeIntegration':['Hebb/LTP/network specialisations versus existing cellular-learning goal347110a1','Circuit comparison versus basic EPSP/IPSP-description goale1117126','Sensory coding/transduction versus receptor goal78748ef2 and action-coding goal04d770b3','Serotonin example versus substance-inference goalf6280154 and chemical-synapse goalff1bf88f'],
    'wholeOriginalSourceObligationsPreserved':[
        'HE GK2 excitatory ACh synapse, ligand-/voltage-dependent channels, one substance example and neuromuscular synapse; no electrical mode inferred',
        'BY receptor competence requires particle-level explanation and application to sensory phenomena; eye transduction and optical-phenomenon contents remain',
        'BY depression competence requires symptoms, multifactorial model, considerate dealings with affected people and inference of therapy, plus clinical/social contents; serotonin fragment never closes it',
        'BY multi-neuron postsynaptic comparison and inference of excitation/inhibition need; no generic topology substituted',
        'HE cellular learning and BY functional/structural neural plasticity; no invented literal Hebb/LTP duties',
        'NW whole bacterial/viral structure/reproduction bullet and broader IF7 duties remain open beyond the two bacterial partial components',
        'Original TH19/HH21 and HH22/29 residual limits unchanged',
    ],
    'clinicalWholePartnerActuallyPresentInCurrentCanon':False,
    'existing485ef1c3AlzheimerDescriptionDoesNotCloseDepressionWholeDuty':True,
    'current8AllWholeSourceHOLD':True,'declaredSpecialisationsStillNeedAuthorRationaleAndTwoIndependentReviewDecisions':True,
    'noNativeProbeRunForThisUnreviewedPackage':True,'noM7Claim':True,'activeWrites':False,
})

viewed=[]
for name,page in [('HE43',43),('HE33',33),('NW35',35)]:
    path=PRIMARY/(name+'.actual-raster.png')
    viewed.append({'path':rel(path),'sha256':sha(path),'physicalPage':page,'printedPage':page,'actuallyViewedByAuthor':True,'viewMechanism':'functions tools.view_image returned actual raster image content to author','authorVisualFindings':{'HE43':'Original common GK/LK ACh bullet, additional LK receptor/hormone/summation/cellular-learning bullets, Q2.4 sense-organ transduction, page label43; no literal Hebb/LTP/electrical synapse or three-code list.','HE33':'Overview explicitly binds Q2 themefields1 and3; Q2.4 is listed without compulsory emphasis.','NW35':'IF7 Mensch und Gesundheit; original UF1 bacterial/viral structure and reproduction bullet visible; chemical-synapse simple-model operator also present; page label35.'}[name]})
write('actual-primary-text-html-and-raster-reading.author-v1.receipt.json',{
    'schemaVersion':1,'createdAtUTC':NOW,'actualFreshAuthorPrimaryRetrievals':4,
    'actualPDFRasterViews':viewed,
    'actualBYOriginalSectionReads':[{'level':level,'path':rel(PRIMARY/f'BY13-{level}.neural-section.actual-read.txt'),'sha256':sha(PRIMARY/f'BY13-{level}.neural-section.actual-read.txt'),'actualHeaderHtmlAnchor':anchor,'competenciesAndContentsActuallyRead':True,'physicalOrPrintedPageClaim':False} for level,anchor in [('EA','313324'),('GA','314384')]],
    'generatedRasterIsNotViewRuleFollowed':True,'authorReadingIsNotIndependentApproval':True,
    'twoIndependentReviewsRequired':True,'activeWrites':False,
})

lines=['# Acht aktuelle Neuroziele: tatsächliche Primärbestandteile und inaktive DE/EN-Kandidaten','',
       'Author-Rohpaket, keine formale oder unabhängige Freigabe. Alle acht ganzen aktuellen Routinen bleiben Source HOLD. Stable IDs bleiben erhalten; kein neuer Zielknoten, keine Kantenänderung, keine aktive Dateiänderung. Die 390er Quellenunion wird hier nicht erneut gebaut oder freigegeben.','',
       'HE: Originalseite43 und Übersicht33 tatsächlich frisch gerastert/angesehen. Q2.3 ist verbindlich; Q2.4 ist nicht allgemein verbindlich. BY: Original-Neurologieabschnitte der amtlichen EA-/GA-Seiten frisch online gelesen, echte HTML-Anker313324/314384. EA/GA sind Original-Anforderungsniveauangaben; GK/LK in Projektionsdaten ist getrennt davon zu lesen.','']
for r in records:
    p=P[r['goalId']]
    lines += [f"## {r['fullCurrentTitle']}",'',f"`{r['goalId']}`",'',f"**Aktuell DE:** {r['wholeCurrentGoalDEEN']['description']}",'',f"**Aktuell EN:** {r['wholeCurrentGoalDEEN']['descriptionEn']}",'',f"**Begrenzter Primärbeitrag:** {p['component']}",'',f"**Originalanker:** {', '.join(p['primary'])}. Die Positionsindices sind Autorenlocators, keine amtlichen Bulletnummern.",'',f"**Kandidat DE:** {p['description']}",'',f"**Kandidat EN:** {p['descriptionEn']}",'',f"**Begründung:** {p['minimality']}",'',f"**Offen:** {' '.join(p['unsupported'])}",'',f"**Status:** {p['mode']}; zwei unabhängige Prüfungen ausstehend.",'']
lines += ['## Getrennte NW-Diagnose','',
          'Die zwei geschützten Ziele verlieren im inaktiven HOLD-Overlay die direkte Bindung des breiten IF7-Sammelrecords. Der aktuelle technische Zeuge ist ausdrücklich direct, keine Clustervererbung. Originalseite35 enthält den UF1-Bau-/Vermehrungsbullet. Die bereits vorhandenen zwei getrennten v3-Source-IDs22637879-a1cf-5128-bd59-2a2e12d8c193 und23c1ecdb-9a65-5e24-bb22-88852b178638 sind eigene bakterielle Teilkomponenten. Ihre im Dossier deklarierte künftige aktive Extraction existiert aktuell nicht; die Mappingkandidaten sind nicht in aktive Atlas-Inputs eingebunden. Der konkrete spätere technische Nachlauf muss diese getrennten Komponenten übernehmen und IF7/Viren-HOLD bewahren.','',
          'Das JSON-Diagnoseblatt bindet ganze aktuelle DE/EN-Ziele, aktuelle Entscheidungen und ursprüngliche Source-Objekte, vorhandene Komponenten, tatsächliche Primär-BBox-Zeilen und offene Korrekturroute. Es stellt keine aktive NW-Anwendbarkeit wieder her.','']
(OUT/'eight-goals-and-two-NW-losses.author-raw-readable.md').write_text('\n'.join(lines))
print(json.dumps({'status':'EIGHT_AUTHOR_RAW_COMPONENTS_AND_CURRENT472_CANDIDATE_PREPARED','wholeCurrentGoalHolds':8,'declaredAuthoredSpecialisations':3,'canonicalIdsAdded':0,'wholeSourceApprovals':0,'NWLosesDiagnosed':2,'activeWrites':False}))
