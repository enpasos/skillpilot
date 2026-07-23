export class RegressionAuditLogger {
  constructor({ sink = (line) => console.log(line), now = () => new Date() } = {}) {
    if (typeof sink !== "function") throw new TypeError("sink must be a function");
    this.sink = sink;
    this.now = now;
  }

  log(event, fields = {}) {
    this.sink(
      JSON.stringify({
        ts: this.now().toISOString(),
        service: "skillpilot-openai-mcp-retention-regression",
        transport: "openai-mcp",
        event,
        ...fields
      })
    );
  }
}
