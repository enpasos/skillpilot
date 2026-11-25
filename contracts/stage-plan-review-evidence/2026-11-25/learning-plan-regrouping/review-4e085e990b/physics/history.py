from pathlib import Path
p=Path('/tmp/e1-regroup-r2-runtime')
base=p/'snapshot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java'
raw=base.read_text().replace('class ClaudeV1CompletionRouteIntegrationTest','class Round2HistoryIntegrationTest').replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:regroup-round2-history;')
(p/'probes/Round2HistoryIntegrationTest.java').write_text(raw[:raw.rindex('}')]+(p/'observeHistory.java').read_text()+'\n}\n')
