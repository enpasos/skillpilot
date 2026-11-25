import copy, difflib, hashlib, json, math, re, shutil
from datetime import datetime, timezone
from pathlib import Path
import numpy as np

BASE=Path('/tmp/e1-ffx-20261125')
OUT=BASE/'audited-panel'
PARENT=BASE/'scripts-v2-onward.json'
INTENT=BASE/'script-intent-v2-onward.json'

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

inputs=[PARENT,INTENT,BASE/'canonical-task.md',BASE/'build_scripts.py',BASE/'author-checks.json']+[BASE/f'appendix-{p}.png' for p in ['p6','r8','t3']]
input_hashes={p.name:digest(p) for p in inputs}
original=json.loads(PARENT.read_text())
intent=json.loads(INTENT.read_text())
recomputed={}
for S in ['A','B']:
    D=intent[S]; t=np.array(D['ds'],dtype=float)/240; xs=np.array(D['xs'])
    q=t*t; step=1/240
    slopes=xs@q/(q@q)
    vv=np.array([np.linalg.lstsq(np.column_stack([t,.5*q]),x,rcond=None)[0][0] for x in xs])
    def gs(regressor): return 2*(xs@regressor)/(regressor@regressor)
    rplus=(t+step)**2; rminus=(t-step)**2
    release_q=q+2*step*t
    means={k:float(np.mean(v)) for k,v in dict(nominal=2*slopes,raw_time_plus=gs(rplus),raw_time_minus=gs(rminus),release_bracket_endpoint=gs(release_q),position_plus=2*((xs+.001)@q)/(q@q),position_minus=2*((xs-.001)@q)/(q@q)).items()}
    avg=means['nominal']; spread=float(np.ptp(2*slopes))
    # Preserve the original, broader, two-sided exploratory sensitivity envelope;
    # the physically consistent one-sided release variation is smaller.
    uncertainty_sum=max(abs(means['raw_time_plus']-avg),abs(means['raw_time_minus']-avg),abs(means['release_bracket_endpoint']-avg))+max(abs(means['position_plus']-avg),abs(means['position_minus']-avg))+spread/2+.002*avg
    monotone=[]
    for delta in np.linspace(0,step,1001):
        monotone.append(float(np.mean(gs(q+2*delta*t))))
    assert all(monotone[i]>=monotone[i+1] for i in range(len(monotone)-1))
    assert np.allclose(slopes,D['m'],atol=1e-12,rtol=0)
    assert np.allclose(2*slopes,D['g'],atol=1e-12,rtol=0)
    assert np.allclose(vv,D['vv'],atol=1e-12,rtol=0)
    for field,key in [('avg','nominal'),('timeplus','raw_time_plus'),('timeminus','raw_time_minus'),('posplus','position_plus'),('posminus','position_minus')]:
        assert abs(D[field]-means[key])<1e-12
    recomputed[S]={
      'times_from_frames_s':t.tolist(),'slopes_m_per_s2':slopes.tolist(),'g_per_run_m_per_s2':(2*slopes).tolist(),
      'v_ref_free_quadratic_fit_m_per_s':vv.tolist(),**means,
      'release_endpoint_g_per_run_m_per_s2':gs(release_q).tolist(),
      'release_endpoint_regressor_s2':release_q.tolist(),
      'release_earlier_by_s':[0,step],
      'release_endpoint_effect_m_per_s2':avg-means['release_bracket_endpoint'],
      'model_maximum_unobserved_position_from_rest_m':.5*avg*step**2,
      'model_reference_velocity_from_rest_m_per_s':avg*step,
      'original_conservative_uncertainty_sum_m_per_s2':uncertainty_sum,
      'retained_rounded_uncertainty_m_per_s2':.5,
      'one_sided_delta_grid_g_mean_monotonically_decreases':True
    }
    assert math.ceil(uncertainty_sum*10)/10 == .5
# Independently recompute the pooled estimator from all 42 raw coordinates.
num=den=0.
for S in ['A','B']:
    D=intent[S]; t=np.array(D['ds'])/240; q=t*t; xs=np.array(D['xs'])
    num+=float(np.sum(xs*q)); den+=3*float(q@q)
pooled=2*num/den
assert abs(pooled-intent['pooled_g'])<1e-12
recomputed['pooled_g']=pooled
recomputed['rounded_control_comparison']={'A':9.81,'B':9.72,'absolute_difference':round(9.81-9.72,2),'A_rough_interval':[9.31,10.31],'B_rough_interval':[9.22,10.22],'summed_uncertainty':1.0}

replacements=[]
def replace(text,old,new,label,expected=None):
    count=text.count(old)
    if expected is not None: assert count==expected,(label,count,expected)
    if count:
        if not any(r['label']==label for r in replacements): replacements.append({'label':label,'before':old,'after':new})
        text=text.replace(old,new)
    return text

old_pre='Ich wählte x nach unten positiv, x=0 an der Ballmitte im wirklichen Loslassbild. n₀ ist das erste Bild mit sichtbarem Abstand zwischen Fingern und Ball; im Bild n₀−1 bestand noch Kontakt. Daher ist t=0 nur bis etwa ±0.0021 s festgelegt. Die Nullposition lässt sich auf etwa ±0.001 m ablesen.'
new_pre='Ich wählte x nach unten positiv. Die Tabellen verwenden unverändert x=0 an der Ballmitte im ersten freien Referenzbild n₀ und t=(n−n₀)/240 s. n₀ ist das erste Bild mit sichtbarem Abstand zwischen Fingern und Ball; im Bild n₀−1 bestand noch Kontakt. Daraus folgt nur: Der tatsächliche Loslasszeitpunkt liegt zwischen diesen beiden Bildern, also um ein unbekanntes δ mit 0≤δ≤1/240 s (etwa 0.00417 s) vor n₀. Ein Zeitpunkt zwischen diesen beiden Bildern ist nicht gemessen. Für die seit der wirklichen Freigabe vergangene Zeit gilt τ=t+δ. Die Nullposition lässt sich auf etwa ±0.001 m ablesen. Beim geprüften Modell einer Freigabe aus Ruhe wäre der unaufgelöste Weg bis n₀ bei g in der hier gefundenen Größenordnung höchstens etwa 0.00009 m; deshalb verwende ich den Ort im Referenzbild innerhalb der Ortsablesegrenze näherungsweise als tatsächlichen Loslasspunkt. Das ist eine Modellabschätzung, keine zusätzliche Ortsmessung.'
old_initial='Das ist klein gegenüber der Endgeschwindigkeit und mit dem ungenauen Loslasszeitpunkt vereinbar; eine kleine Anfangsgeschwindigkeit bis ungefähr 0.02 m/s kann ich nicht sicher ausschließen. Einen sichtbaren Stoß gab es nicht. Ich verwende deshalb näherungsweise v₀=0, behaupte aber keine exakte Ruhe.'
new_initial='Diese Diagnose bezieht sich auf das erste freie Referenzbild, nicht auf einen beobachteten Zwischenzeitpunkt. Sie und die frühe Punktlage widersprechen der näherungsweisen Freigabe aus Ruhe innerhalb der Ablesegrenzen nicht. Allein während des unbekannten Zeitabstands δ kann sich aber auch bei Freigabe aus Ruhe eine Geschwindigkeit gδ von etwa 0.04 m/s bis n₀ aufbauen. Aus dem Zeitraster allein lässt sich diese Geschwindigkeit daher nicht auf etwa 0.02 m/s begrenzen. Einen sichtbaren Stoß gab es nicht; aus diesen Aufnahmen folgt keine exakte obere Grenze für einen unbemerkten Anfangsstoß. Ich verwende v₀≈0 nur als nominale Modellannahme für die grafische Näherung. Der Einfluss der Zeitzuordnung gehört in die Unsicherheitsbetrachtung.'
old_limits='Die x-Ablesegrenze beträgt ±0.001 m, die Anfangszeit etwa ±0.0021 s, die Skala etwa 0.2 %.'
new_limits='Die x-Ablesegrenze beträgt ±0.001 m, die wirkliche Freigabe liegt um ein unbekanntes δ zwischen 0 und 1/240 s vor dem ersten freien Referenzbild, die relative Skalenunsicherheit beträgt etwa 0.2 %.'
old_unc='Für eine konservative Unsicherheitsgrößenordnung addierte ich die größte der beiden Zeitverschiebungswirkungen, die größte Positionsverschiebungswirkung, die halbe Laufspannweite und 0.2 % für die Skalenprüfung.'
new_unc='Für eine konservative Unsicherheitsgrößenordnung verwende ich die größere Wirkung der beiden zusätzlichen formalen Ganzbildverschiebungen als Hülle; sie umfasst auch die nachgerechnete einseitige Freigabevariation. Dazu addiere ich die größte Positionsverschiebungswirkung, die halbe Laufspannweite und 0.2 % für die Skalenprüfung.'
old_half='Die Ganzbildvariation ist vorsichtiger als die geschätzte halbe Bildzeit für t=0.'
new_half='Die volle Bildzeit ist die durch die beiden beobachteten Kontaktzustände begründete Grenze der Zeitzuordnung; die zusätzliche Gegenrichtung ist nur eine vorsichtige Empfindlichkeitsprüfung.'
old_omitted='Bei A schätze ich aus ±0.0021 s am Zeitnullpunkt, ±0.001 m Ortsablesung, 0.2 % Skalenkontrolle und der Laufspannweite eine Größenordnung u_A≈0.5 m/s²; ich habe diese Schätzung nicht durch eine tatsächliche Grenzvariation geprüft.'
new_omitted='Bei A schätze ich aus dem unbekannten Freigabeabstand 0≤δ≤1/240 s vor dem Referenzbild, ±0.001 m Ortsablesung, 0.2 % Skalenkontrolle und der Laufspannweite eine Größenordnung u_A≈0.5 m/s²; ich habe diese Schätzung nicht durch eine tatsächliche Grenzvariation geprüft.'

corrected=[]
for script in original:
    text=script['submission']
    text=replace(text,old_pre,new_pre,'first-free reference and observed one-sided release bracket',1)
    text=replace(text,old_initial,new_initial,'initial velocity and reference distinction')
    text=replace(text,old_limits,new_limits,'limits use full one-sided release bracket')
    text=replace(text,old_unc,new_unc,'conservative sensitivity envelope')
    text=replace(text,old_half,new_half,'remove unjustified half-frame statement')
    text=replace(text,old_omitted,new_omitted,'preserve omitted-A variation with corrected time bound')
    text=replace(text,'Loslassbilder n₀=','Erste freie Referenzbilder n₀=','raw observations are reference frames, not measured release instants')
    for S in ['A','B']:
        old=f'x_{S} ist nach unten positiv und hat seinen Ursprung an der Ballmitte des tatsächlichen Loslasspunkts dieser Reihe. t=(n−n₀)/240 s beginnt am jeweiligen Loslassbild. Die Anfangsbedingungen des verwendeten Modells sind x_{S}(0)=0 m und v_{S}(0)=0 m/s; die Zuordnung von t=0 und x=0 hat die oben notierten Ablesegrenzen. Das Gesetz gilt nur zwischen Loslassen und erstem Mattenkontakt.'
        new=f'x_{S} ist nach unten positiv und hat in der tabellierten nominalen Näherung seinen Ursprung an der Ballmitte im ersten freien Referenzbild n₀ dieser Reihe. t=(n−n₀)/240 s beginnt an diesem Referenzbild; die wirkliche Freigabe lag um das unbekannte δ davor. Die Anfangsbedingungen x_{S}(0)=0 m und v_{S}(0)=0 m/s gehören zum nominalen Näherungsmodell, nicht zu einer behaupteten Messung exakter Ruhe im Referenzbild. Als physikalische Anfangsbedingung nehme ich eine Freigabe näherungsweise aus Ruhe am tatsächlichen Loslasspunkt an. Bei genauer Trennung der Bezüge hätte das Referenzbild die Geschwindigkeit v_Referenz=v_Loslassen+gδ; im Ruhemodell gilt x(t)=½g[(t+δ)²−δ²]. Das oben angegebene Gesetz verwendet nominal δ=0 und ist nur innerhalb der erläuterten Ablese- und Empfindlichkeitsgrenzen gemeint. Es gilt für die ausgewertete freie Flugphase bis zum ersten Mattenkontakt.'
        text=replace(text,old,new,f'{S} law keeps coefficient and explains nominal initial conditions')
        D=intent[S]; R=recomputed[S]
        old=(f'Als wirkliche Grenzvariation verschob ich für die vollständigen sieben Punkte aller drei Läufe den angenommenen Zeitnullpunkt um ein Bild in jede Richtung. Mit tᵢ+1/240 s ergibt die erneute Rechnung g={D["timeplus"]:.3f} m/s², mit tᵢ−1/240 s g={D["timeminus"]:.3f} m/s². Außerdem verschob ich alle x-Ablesungen einmal um +0.001 m und einmal um −0.001 m; neu angepasst ergeben sich {D["posplus"]:.3f} und {D["posminus"]:.3f} m/s². Das sind nachgerechnete Varianten, keine bloß genannten Fehlerquellen.')
        new=(f'Als wirkliche Grenzvariation setze ich die Freigabe einmal unmittelbar vor n₀ (δ=0) und einmal unmittelbar nach n₀−1 (Grenzwert δ=1/240 s). Die Tabellenorte bleiben auf n₀ bezogen. Daher lautet die aus dem Ruhemodell abgeleitete Anpassungsgröße qᵢ=tᵢ²+2δtᵢ; ich passe xᵢ=(g/2)qᵢ mit g=2Σ(qᵢxᵢ)/Σ(qᵢ²) erneut für alle sieben Punkte jedes der drei Läufe an und bilde deren Mittel. Beim Grenzwert δ=1/240 s ergibt sich so g={R["release_bracket_endpoint"]:.3f} m/s². Das ist eine Variation des unbekannten Zeitabstands, keine Behauptung eines gemessenen Zwischenzeitpunkts. Zusätzlich führte ich eine rein formale Empfindlichkeitsprüfung mit den vollständigen sieben Punkten aller drei Läufe aus: Ersetze ich tᵢ allein durch tᵢ+1/240 s, ergibt die erneute Rechnung g={D["timeplus"]:.3f} m/s², mit tᵢ−1/240 s g={D["timeminus"]:.3f} m/s². Diese beiden formalen Rechnungen berücksichtigen die kleine Verschiebung des Ortsursprungs nicht; die Gegenrichtung ist außerdem keine durch die Kontaktbilder gestützte Freigabezeit. Sie werden deshalb nur als zusätzliche Empfindlichkeitsprüfung, nicht als zwei mögliche beobachtete Freigaben verwendet. Außerdem verschob ich alle x-Ablesungen einmal um +0.001 m und einmal um −0.001 m; neu angepasst ergeben sich {D["posplus"]:.3f} und {D["posminus"]:.3f} m/s². Das sind nachgerechnete Varianten, keine bloß genannten Fehlerquellen.')
        text=replace(text,old,new,f'{S} physically consistent one-sided full-record release sensitivity')
        # The 0.5 value itself is unaffected. Add the auditable arithmetic only to specimens
        # that actually included this series' boundary variation.
        if f'Beim Grenzwert δ=1/240 s ergibt sich so g={R["release_bracket_endpoint"]:.3f}' in text:
            old=f'Nach Aufrunden gebe ich u_{S}≈0.5 m/s² an.'
            new=f'Die Summe beträgt für {S} ungefähr {R["original_conservative_uncertainty_sum_m_per_s2"]:.3f} m/s²; nach Aufrunden gebe ich u_{S}≈0.5 m/s² an.'
            text=replace(text,old,new,f'{S} unchanged uncertainty with recomputed sum')
    assert '±0.0021' not in text
    # Every raw table, slope table, explicit numerical law and postscript remains exact.
    oldtables=[p for p in script['submission'].splitlines() if p.startswith('|')]
    newtables=[p for p in text.splitlines() if p.startswith('|')]
    assert oldtables==newtables
    law_pattern=r'Mein [AB]-Gesetz lautet .*?·t²\.'
    assert re.findall(law_pattern,script['submission'])==re.findall(law_pattern,text)
    for S in ['A','B']:
        if f'## {S}: Aufbau und Rohprotokoll' not in script['submission']:
            assert f'## {S}: Aufbau und Rohprotokoll' not in text
    if 'Eine erneute Anpassung mit veränderten Zeit- oder Ortsgrenzen habe ich für A nicht ausgeführt.' in script['submission']:
        assert 'Beim Grenzwert δ=1/240 s ergibt sich so g=9.504' not in text
    corrected.append({'id':script['id'],'submission':text})

assert [x['id'] for x in original]==[x['id'] for x in corrected]
assert len(corrected)==14
byid={x['id']:x['submission'] for x in corrected}
assert byid['D3Z7']==byid['L7Q4'].replace('½·(9.81 m/s²)·t²','½·(8.60 m/s²)·t²').replace('½·(9.72 m/s²)·t²','½·(10.90 m/s²)·t²')
assert byid['T9G2']==byid['L7Q4'].replace('½·(9.72 m/s²)·t²','½·(10.90 m/s²)·t²')
for name in ['canonical-task.md','appendix-p6.png','appendix-r8.png','appendix-t3.png']:
    shutil.copyfile(BASE/name,OUT/name)
(OUT/'scripts.json').write_text(json.dumps(corrected,ensure_ascii=False,indent=2)+'\n')
new_intent=copy.deepcopy(intent)
new_intent['numeric_method']+=' Prospective audit: first-free frame remains the nominal time/position reference. True release is bracketed one-sided by the preceding frame. Actual release sensitivity with fixed first-free position reference uses q=t²+2δt. Original ±frame t-only values remain explicitly exploratory.'
for case in new_intent['cases']:
    if 'reasonAdded' in case:
        case['reasonAdded']+=' Historical parent-panel note; this prospective panel applies the same common time-origin correction to every applicable case.'
for S in ['A','B']:
    new_intent[S]['audited_release_sensitivity']=recomputed[S]
new_intent['prospective_input_audit']={
 'date':'2026-11-25','time':'04:25 CET (03:25 UTC)',
 'status':'new prospective input panel; sealed parent v1/v2 unchanged',
 'parent_scripts_sha256':input_hashes[PARENT.name],
 'parent_intent_sha256':input_hashes[INTENT.name],
 'audit_scope':'physics and input consistency only; no candidate rubric, native marking response or author notes read; no grading',
 'all_14_cases_preserved':True,'all_raw_tables_preserved':True,'all_original_explicit_numerical_laws_preserved':True,
 'no_added_observed_frames_positions_or_subframe_timestamps':True,
 'original_graphs_and_task_byte_identical':True,
 'notes':'Coordinator-only original case-intent notes are retained as parent-panel intent, not audit grading claims. Only actual blind markers decide scores.'
}
(OUT/'script-intent.json').write_text(json.dumps(new_intent,ensure_ascii=False,indent=2)+'\n')
(OUT/'recomputation.json').write_text(json.dumps(recomputed,ensure_ascii=False,indent=2)+'\n')
changes='# Geänderte gemeinsame Passagen\n\nProspektiver Physik-/Eingabeaudit, 25.11.2026, 04:25 CET (03:25 UTC). Keine Benotung. Numerische Gesetze, Roh- und Steigungstabellen bleiben unverändert.\n\n'
for r in replacements:
    changes+=f'## {r["label"]}\n\nVorher:\n\n> {r["before"]}\n\nNachher:\n\n> {r["after"]}\n\n'
(OUT/'changed-passages.md').write_text(changes)
(OUT/'scripts.diff').write_text(''.join(difflib.unified_diff(PARENT.read_text().splitlines(True),(OUT/'scripts.json').read_text().splitlines(True),fromfile='parent/scripts-v2-onward.json',tofile='prospective/scripts.json')))
assert all(digest(p)==h for p,h in [(p,input_hashes[p.name]) for p in inputs])
checks={
 'parent_input_hashes':input_hashes,
 'cases':14,'ids_and_order_preserved':True,'all_raw_and_fit_table_lines_identical':True,'explicit_numeric_law_sentences_identical':True,
 'missing_A_or_B_cases_preserved':True,'omitted_A_variation_cases_preserved':True,'six_independent_slopes_and_g_verified':True,
 'six_diagnostic_v0_fits_verified':True,'pooled_42_point_fit_verified':True,'all_original_plus_minus_time_and_position_sensitivities_verified':True,
 'original_uncertainty_rounding_still_valid':True,
 'images_inspected':['appendix-p6.png','appendix-r8.png','appendix-t3.png'],
 'image_associations_points_and_lines_consistent_with_parent_raw_data':True,
 'law_variants':{x['id']:re.findall(r'Mein [AB]-Gesetz lautet [^.]+?·t²\.',x['submission']) for x in corrected if x['id'] in ['D3Z7','T9G2']},
 'D3Z7_differs_from_corrected_control_only_in_two_original_law_coefficients':True,
 'T9G2_differs_from_corrected_control_only_in_one_original_law_coefficient':True,
 'no_repo_edits':True,'no_grade_assigned_or_predicted':True
}
# Regex handles decimal punctuation in the original explicit sentence.
checks['law_variants']={x['id']:[p.split('. x_')[0]+'.' for p in x['submission'].splitlines() if p.startswith('Mein ')] for x in corrected if x['id'] in ['D3Z7','T9G2']}
(OUT/'verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'cases':14,'A_release_endpoint':recomputed['A']['release_bracket_endpoint'],'B_release_endpoint':recomputed['B']['release_bracket_endpoint'],'A_uncertainty_sum':recomputed['A']['original_conservative_uncertainty_sum_m_per_s2'],'B_uncertainty_sum':recomputed['B']['original_conservative_uncertainty_sum_m_per_s2'],'pooled_g':pooled},indent=2))
