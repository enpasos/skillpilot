import pathlib,shutil,subprocess,json,hashlib
r=pathlib.Path.cwd();cap=r/'tmp/math-rp-final-year-exam-candidates-20261101';p=cap/'independent-probes';fixture=p/'backend-v2';fixture.mkdir(exist_ok=True)
src=(r/'tmp/hhMathCandidateBackendProjectionDiagnostic.java').read_text().replace('hhMathCandidateBackendProjectionDiagnostic','rpMathCandidateBackendProjectionDiagnostic').replace('DE-HH','DE-RP').replace('hh-source-candidate','rp-source-candidate').replace('HH','RP').replace('seven-offered-scopes','fourteen-offered-scopes').replace('2f626446-4b32-5674-a687-9cd754bdfede','64f37348-20f7-55b1-82a8-8fc388087577').replace('task2f','sphereSurface')
src=src.replace('for (String stage : List.of("SekI", "SekII", "CrossStage")) {','for (String duration : List.of("G8", "G9")) {\n        for (String stage : List.of("SekI", "SekII", "CrossStage")) {').replace('rootConfig.put("durationModel", "G8");','rootConfig.put("durationModel", duration);').replace('"/G8/" + course','"/" + duration + "/" + course').replace('        mapper.writerWithDefaultPrettyPrinter()', '        }\n        mapper.writerWithDefaultPrettyPrinter()')
src=src.replace('                rows.add(row);','''                Map<String, Object> taskDetails = new LinkedHashMap<>();
                for (String taskId : List.of(TASK, "926d0551-4537-569e-b6ad-fc33bb17546e", "e5055665-89ae-5be6-8fc7-42a9e991d63d")) {
                    Map<String, Object> detail = new LinkedHashMap<>();
                    detail.put("target", targets.contains(taskId));
                    detail.put("context", graph.contextGoalIds().contains(taskId));
                    detail.put("effectiveDirectPrerequisiteIds", new TreeSet<>(graph.directPrerequisites(taskId)));
                    Set<String> support = new TreeSet<>();
                    var queue = new java.util.ArrayDeque<String>(graph.directPrerequisites(taskId));
                    while (!queue.isEmpty()) {
                        var id = queue.removeFirst();
                        if (support.add(id)) queue.addAll(graph.directPrerequisites(id));
                    }
                    detail.put("supportContextGoalIds", support);
                    taskDetails.put(taskId, detail);
                }
                row.put("taskDetails", taskDetails);
                rows.add(row);''')
source=fixture/'rpMathCandidateBackendProjectionDiagnostic.java';source.write_text(src)
classes=fixture/'compiled-main';shutil.copytree(r/'tmp/hh-math-p96-source-candidate-20261101/backend-fixture/compiled-main',classes)
cpfile=r/'tmp/completion-integrity-runtime-classpath.txt';cp=cpfile.read_text().strip().split(':');cp=[str(classes) if x==str(r/'backend/build/classes/java/main') else x for x in cp]
out=fixture/'diagnostic-classes';out.mkdir();subprocess.run(['javac','-cp',':'.join(cp),'-d',str(out),str(source)],check=True)
cp=[str(out)]+cp
base=r/'tmp/hh-math-p96-source-candidate-20261101/native-hosts/baseline/curricula'
for name in ['baseline','candidate']:
 host=fixture/name;shutil.copytree(base,host/'curricula',symlinks=True)
 # Never permit a live curriculum symlink in a frozen backend fixture.
 for link in list((host/'curricula').rglob('*')):
  if link.is_symlink():
   if link.name=='quality':
    link.unlink();link.mkdir();shutil.copytree(r/'curricula/DE/Gymnasium/quality/release-model',link/'release-model')
   elif link.is_file():
    data=link.read_bytes();link.unlink();link.write_bytes(data)
   else:raise ValueError(('unexpected directory symlink',link))
 canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
 shutil.copyfile(cap/'duration-generator-host'/canon,host/canon)
 inputs=json.loads((cap/'view-input-evidence.json').read_text())
 for rel,x in inputs.items():
  if name=='baseline':(host/rel).write_text(json.dumps(x['view'],ensure_ascii=False,indent=2)+'\n')
  else:shutil.copyfile(cap/'candidate-offered-views'/rel,host/rel)
 manifest=[{'path':str(f.relative_to(host)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(host.rglob('*')) if f.is_file()]
 (fixture/(name+'-input-manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n')
 result=subprocess.run(['java','-Xmx2g','-cp',':'.join(cp),'com.skillpilot.backend.completion.rpMathCandidateBackendProjectionDiagnostic',str(host),str(fixture/(name+'-actual.json'))],capture_output=True,text=True)
 (fixture/(name+'.stdout.log')).write_text(result.stdout);(fixture/(name+'.stderr.log')).write_text(result.stderr)
 print(name,result.returncode,flush=True)
 if result.returncode:raise RuntimeError(result.stderr[-3000:])
meta={'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'classpathFileSha256':hashlib.sha256(cpfile.read_bytes()).hexdigest(),'compiledMainManifest':[{'path':str(f.relative_to(classes)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(classes.rglob('*.class'))]}
(fixture/'class-bindings.json').write_text(json.dumps(meta,indent=2)+'\n')
