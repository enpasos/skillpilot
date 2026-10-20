// The existing plugin checker is the single consistency gate for the durable plugin and its runtime contract.
// Keeping this stable entrypoint lets release and CI documentation name the
// versioning concern explicitly without duplicating validation logic.
await import("./check_skillpilot_coach_plugin.mjs");
