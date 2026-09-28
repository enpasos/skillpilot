# Tatsächlicher Provider-Prompt zur Geradenkorrektur

Eingabebild: `1b70498a-portrait-vertical-ball-attempt-5.png`.
Das eingebaute OpenAI/Codex-Bildwerkzeug hat die genaue Modellvariante nicht
ausgewiesen; es wird keine geraten.

```text
Use case: precise-object-edit of Image 1. Image 1 is the exact edit target. Fix ONLY the numerical GRAPH POSITION in the TOP-RIGHT cyclist graph. The y-axis has 10 m and 14 m ticks. The red point labeled „(2,14)“ at t=2 currently sits ABOVE the 14 m tick, which is mathematically false. Move that red point, its nearby „(2,14)“ label and the straight BLUE LINE so the red point is EXACTLY level with the 14 m tick on the y-axis. The line must connect the red (0,10) point to the red (2,14) point with slope 2 m/s, visibly much shallower than before. Keep the 14 tick where it is, keep the 10 tick and (0,10) red point where they are, keep the t=2 dotted vertical guide connecting the corrected point to the x-axis. Preserve all other labels and art unchanged, especially the entire lower ball panel, vertical ball motion and h(t) graph. Full corrected portrait PNG; no new elements or text.
```

Dieses Edit war durch die unabhängige QA-HOLD-Entscheidung zu Versuch 5
veranlasst. Eine Generierung ist noch keine V-Freigabe.
