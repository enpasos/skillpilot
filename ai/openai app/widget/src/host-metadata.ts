import type { WidgetMetadata } from "./bridge";

export function widgetMetadataFromHost(value: unknown): WidgetMetadata {
  const root = record(value);
  if (!root) return {};

  const candidates = [
    root,
    record(root.mcp_tool_result)?._meta,
    record(root.call_tool_result)?._meta,
    record(record(root.call_tool_result)?.result)?._meta
  ];
  for (const candidate of candidates) {
    const candidateRecord = record(candidate);
    if (record(candidateRecord?.skillpilotApp)) return candidateRecord as WidgetMetadata;
  }
  return {};
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}
