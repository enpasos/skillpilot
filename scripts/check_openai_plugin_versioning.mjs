// The existing plugin checker is the single fail-closed V1 consistency gate.
// Keeping this stable entrypoint lets release and CI documentation name the
// versioning concern explicitly without duplicating validation logic.
await import("./check_skillpilot_coach_plugin.mjs");
