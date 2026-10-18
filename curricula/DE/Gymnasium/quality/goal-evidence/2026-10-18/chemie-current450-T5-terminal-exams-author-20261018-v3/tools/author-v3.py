# SPDX-License-Identifier: Apache-2.0
import pathlib,json,copy,hashlib,datetime
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';OLD=B/'chemie-current450-T5-terminal-exams-author-20261018-v2';O=B/'chemie-current450-T5-terminal-exams-author-20261018-v3'
assert not O.exists();O.mkdir();(O/'tasks').mkdir();(O/'candidate-goals').mkdir();(O/'tools').mkdir()
def read(p):return json.loads(p.read_text())
def dump(n,x):(O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
gs=read(OLD/'AUTHOR.eight-complete-exam-goals.draft.json');new=copy.deepcopy(gs);changes=[]
g=next(g for g in new if g['id'].startswith('44af0'))
for field,first,cat in [
 ('taskContent','Formuliere selbst ein Reaktionsmodell der alkoholischen Gärung von Glucose und eine ausgeglichene Reaktionsgleichung. Erläutere, welche Produkt- und Mengenbehauptungen die Gasbeobachtung allein nicht belegt.','Formuliere selbst eine ausgeglichene Reaktionsgleichung für die katalaseassoziierte Zersetzung des eingesetzten Wasserstoffperoxids. Erläutere, was die ordinalen Blasencodes zur Reaktionsgeschwindigkeit und Gasmenge aussagen und was sie nicht belegen.'),
 ('taskContentEn','Independently formulate a reaction model for alcoholic fermentation of glucose and a balanced reaction equation. Explain which product and quantity claims the gas observation alone does not establish.','Independently formulate a balanced reaction equation for the catalase-associated decomposition of the supplied hydrogen peroxide. Explain what the ordinal bubble codes show about reaction rate and gas quantity and what they do not establish.')]:
 s=g['examData'][field]
 # Insert only in the first fermentation and first catalase personal-task blocks.
 a=s.index('## 1.');b=s.index('## 2.');sec=s[a:b]
 head='### Eigene Aufgabe\n\n' if field=='taskContent' else '### Personal task\n\n';assert sec.count(head)==1
 sec=sec.replace(head,head+first+'\n\n',1);s=s[:a]+sec+s[b:]
 a=s.index('## 3.');b=s.index('## 4.');sec=s[a:b];assert sec.count(head)==1
 sec=sec.replace(head,head+cat+'\n\n',1);g['examData'][field]=s[:a]+sec+s[b:]
 changes.append({'finding':'A-T5-D01','goalId':g['id'],'field':field,'change':'Two explicit independent reaction-model/equation demands at the relevant first fermentation and catalase tasks; evidence limits requested without supplying an answer.'})
g=next(g for g in new if g['id'].startswith('b2bd'))
for field in ['taskContent','taskContentEn']:
 s=g['examData'][field];a=s.index('## 4.');prefix=s[:a];part=s[a:]
 if field=='taskContent':
  begin='Innerhalb jedes Größenpaares ein Los für Berührung und eines für Scheinbehandlung ziehen;'
  end='Mit derselben festen Ansicht bei0 unmittelbar vorher'
  replacement='Für diesen neuen Faktor werden ausschließlich die sechs separaten, vorher nicht gereizten Transferpflanzen verwendet. Entwickle vorab selbst die Bedingungen, ihre Zuteilung und Reihenfolge für den verlangten Vergleich von Topfbewegung und bloßer Handannäherung; die Berührungs-/Pinselzuteilung aus Teil3 wird hier nicht übernommen. Jede Pflanze steht auf einer eigenen ebenen sicheren Unterlage. Die Kamera bleibt fest und wird während eines Vorgangs nicht am selben Tisch bewegt. Lege für jeden geplanten Vorgang vorab einen im Video eindeutig erkennbaren Ereignisbeginn als t=0 fest und begründe die vergleichbare Zeitzuordnung. Hier erfolgt keine Pinsel-Streichbewegung und kein Blattkontakt. Nur die selbst geplante, von der Aufsicht auf Sicherheit geprüfte Topfbewegung ist zulässig: höchstens10mm langsam über mindestens2s, ohne Anheben, Kippen, Ruck oder Stoß. Die in Teil3 beschriebene1-s-Pinsel-/10-mm-Scheinbewegung und das dortige Verbot, den Versuchstopf zu halten, gelten für diesen neuen Handhabungsfaktor nicht. Basisaufnahme, Akklimatisation, N/C/U-Messregel, Zeitpunkte und Pflege-/Abbruchbedingungen werden unverändert beibehalten. Kein Blasen. '
  tail='Die Dosierung bleibt qualitativ: Pinselkontakt ist nicht kraftkalibriert.'
  newtail='Die Handhabung bleibt eine qualitativ beschriebene Bewegung; eine mechanische Kraft wird nicht gemessen.'
 else:
  begin='Randomly assign one plant in each size pair to touch and the other to sham,'
  end='Record all N pairs from the same fixed view immediately before t=0'
  replacement='Use only the six separate previously unstimulated transfer plants for this new factor. Independently develop the conditions, assignment and order for the requested comparison of pot movement and mere hand approach; do not carry over the touch/brush allocation from part3. Each plant stands on its own level secure support. Keep the camera fixed and do not move a camera attached to the same table during an event. Before each planned event define a clearly identifiable video event onset as t=0 and justify comparable timing. There is no brush stroke or leaf contact in this part. Only the independently planned pot movement checked for safety by the supervisor is permitted: at most10mm slowly over at least2s, without lifting, tilting, jerking or impact. The1-s brush/10-mm sham movement and prohibition on holding the test pot described in part3 do not apply to this new handling factor. Retain the baseline recording, acclimatisation, N/C/U measurement rule, timepoints and care/stopping conditions unchanged. Do not blow. '
  tail='Stimulus strength is qualitative because brush contact is not force-calibrated.'
  newtail='Handling remains a qualitatively described movement; mechanical force is not measured.'
 assert part.count(begin)==1 and part.count(end)==1 and part.count(tail)==1
 start=part.index(begin);stop=part.index(end,start);part=part[:start]+replacement+part[stop:];part=part.replace(tail,newtail,1)
 g['examData'][field]=prefix+part
 changes.append({'finding':'A-T5-D02','goalId':g['id'],'field':field,'change':'Only part4 inherited allocation/manipulation/time-zero clauses replaced for independent fresh pot-motion versus approach design; part3 and all baseline/counting/care sections exact.'})
dump('AUTHOR.eight-complete-exam-goals.draft.json',new)
for g in new:
 if g['id'].startswith(('44af0','b2bd')):
  dump('candidate-goals/'+g['id']+'.whole-goal.pending.json',g)
  for k,s in [('taskContent','de.task'),('taskContentEn','en.task'),('solutionContent','de.solution'),('solutionContentEn','en.solution')]:
   (O/'tasks'/f'{g["id"]}.{s}.md').write_text(g['examData'][k]+'\n')
dump('INPUT.sealed-predecessor-and-independent-FIRST.pins.json',{'predecessor':pin(OLD/'AUTHOR.eight-complete-exam-goals.draft.json'),'predecessorSeal':pin(OLD/'FREEZE.author.sha256.json'),'first':pin(B/'chemie-current450-T5-terminal-exams-independent-a-20261018-v1/FIRST.full-eight-bodies-materials-current-P-independent-a.json'),'inheritedExactFiles':[pin(OLD/n) for n in ['INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json','INPUT.whole-selected-operative-materials.exact.json','MATERIAL.complete-assessment-payload.pending.json','COVERAGE.current-whole-P-expectations-to-essential-score-steps.pending.json','PROPOSAL.placement-and-applicability.draft.json','PROPOSAL.five-exact-view-child-array-append-CAS.draft.json']],'immutablePredecessorNotModified':True})
dump('CHANGES.four-task-fields-only.pending-independent-followup.json',{'changes':changes,'allOtherGoalFieldsExact':True,'sixOtherWholeGoalObjectsExact':True,'allSolutionsRubricsRequiresCoverageAndCurrentPExact':True,'operativeCardsExactPredecessorReferences':True,'newPlacementClaim':False,'normalWrites':0,'independentApproval':False})
(O/'README.md').write_text('''# T5 v3: two narrow task remedies — pending independent follow-up

Additive successor to sealed v2, addressing only A-T5-D01 and A-T5-D02 from the frozen full-eight independent A FIRST. The fermentation and catalase task now explicitly ask for independently formulated balanced reaction models and evidence limits. Only the fourth Mimosa task replaces contradictory inherited brush allocation/manipulation/time-zero clauses with the independent fresh pot-motion comparison; part3 remains exact, as do baseline, counting and care rules.

Exactly four task fields in two whole exam objects change. The six other whole objects and all solutions, scoring, prerequisites, coverage, methods, original inputs and native P records remain exact to v2. Complete eight-object handoff includes all learner methods. Operative sourceArtifactPath references deliberately retain the sealed v2 cards. View placement/context claims are inherited, with no new normal mutation or global release assertion.

Both affected bodies remain unreleased until the actual independent bounded follow-up. No normal writes, actual learner execution, local safety clearance, human approval/trial or M7 completion is claimed. Own knowledge content: CC-BY-4.0; technical tooling/manifests: Apache-2.0; third-party rights unchanged.
''')
print(json.dumps({'directory':str(O.relative_to(R)),'changedTaskFields':4,'wholeExams':8,'changedWholeExams':2}))
