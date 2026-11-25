from pathlib import Path
p=Path('/tmp/e1-regroup-r2-runtime')
f=p/'snapshot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java'
raw=f.read_text().replace('class ClaudeV1CompletionRouteIntegrationTest','class Round2OpeningIntegrationTest').replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:regroup-round2-opening;')
(p/'probes/Round2OpeningIntegrationTest.java').write_text(raw[:raw.rindex('}')]+(p/'observeOpening.java').read_text()+'\n}\n')
q=p/'probe.init.gradle'
q2=p/'opening.init.gradle';q2.write_text(q.read_text().replace("include '**/Round2HistoryIntegrationTest.class'", "include '**/Round2OpeningIntegrationTest.class', '**/Round2HistoryIntegrationTest.class'"))
run=(p/'run.sh').read_text();k=run.index(' --tests ');e=run.index('ret=$?')
run=run[:k]+" --tests '*.Round2OpeningIntegrationTest.compareHandoffAndPlanWithPendingOpening' > \"$p/opening.log\" 2>&1\n"+run[e:];run=run.replace('probe.init.gradle','opening.init.gradle').replace('"$p/exit"','"$p/opening.exit"')
(p/'opening.native.sh').write_text(run)
