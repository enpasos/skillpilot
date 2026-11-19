# Wie führt der Claude-Coach einen neuen Begriff ein?

**Claude 1.1.14 im persönlichen Marketplace · 19. November 2026**

Ein Schüler berichtet aus der Beta, dass er auch bei gewöhnlichen Lernzielen überwiegend Aufgaben löst und wenig erklärt bekommt. Das ist seine Rückmeldung zum erlebten Unterricht. Welche Äußerung oder Anweisung den Verlauf seines Gesprächs bestimmt hat, bleibt offen.

## Was sich für den Lernenden ändert

Im veröffentlichten Claude-Skill 1.1.13 lautete die Vorgabe für die Fortsetzung eines aktiven Ziels „one concrete next task“. Wer bei einem neuen Begriff erst eine Erklärung brauchte, bekam an dieser Stelle keinen eigenen Gesprächsweg angeboten.

In Version 1.1.14 greifen der installierbare Skill und die begleitenden Backend-Anweisungen dieselbe Frage auf. Sagt ein Lernender „Weiß ich noch nicht“ oder bittet er um eine Erklärung, führt Claude die Idee direkt an einem konkreten Beispiel ein. Bringt der Lernende eine eigene Vorstellung mit, knüpft Claude daran an und erklärt den fehlenden Zusammenhang. Das gilt auch nach einer gelösten Aufgabe, wenn eine Frage offenbleibt. Den Abschluss einer gewöhnlichen Kompetenz tragen weiterhin zwei unabhängige Nachweise oder ein echter mehrschrittiger Transfer. [Claude-Skill](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md#coaching-and-completion) · [Backend-Anweisungen](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java)

## Ein Verständnisziel im Gespräch erarbeiten

Der Coach kann eine kurze Erklärung anbieten oder die Person einladen, eine eigene Vorstellung einzubringen. Kennt sie schon ein Alltagsbeispiel, kann er daran anknüpfen. Wünscht sie einen Einstieg oder hat sie eine konkrete Frage, erklärt er sofort. Die Person entscheidet, ob sie erst zuhören, nachfragen oder selbst etwas ausprobieren möchte.

Nach der Erklärung kann die Person den Gedanken in eigenen Worten darstellen, eine Skizze machen oder nachhaken. Aus ihrer Antwort hört der Coach, was schon trägt und ob eine andere Erklärung helfen würde. Eine kurze Aufgabe ist sinnvoll, wenn sich an ihr eine Idee ausprobieren lässt oder die Person selbst üben möchte. Die Gesprächseröffnung ist freiwillig. Auch jemand, der die Definition schon kennt, darf gleich einen eigenen Fall besprechen. [Feynman-Methode für verstehendes Lernen](feynman-rules.de.md#sec-feynman-steps)

### Ein Fahrradtacho als Beispiel

> **Coach:** Wann würdest du beim Radfahren sagen: „Jetzt beschleunige ich“?
>
> **Schüler:** Wenn ich richtig schnell bin. Bergab zum Beispiel.
>
> **Coach:** Bergab passt oft gut. Stell dir zwei Momente auf einer geraden Strecke vor. Zuerst steigt der Tacho jede Sekunde um 2 m/s. Dann zeigt er eine Weile gleichbleibend 8 m/s. In der ersten Phase ändert sich dein Tempo. Die Beschleunigung beträgt hier 2 m/s². In der zweiten Phase bist du schneller als am Anfang, aber dein Tempo bleibt gleich. Wie würdest du den Unterschied jemandem erklären, der gerade neben dir fährt?
>
> **Schüler:** Am Tacho sehe ich, wie schnell ich gerade bin. Für die Beschleunigung muss ich sehen, wie sich die Anzeige mit der Zeit ändert. Beim schnellen Weiterrollen kann die Beschleunigung also null sein. Aber warum steht beim Anfahren die Sekunde zweimal in der Einheit?
>
> **Coach:** Die erste Sekunde kennst du vom Tempo. 4 m/s heißt, dass du bei diesem Tempo in einer Sekunde vier Meter zurücklegst. Die zweite Sekunde sagt, wie lange es gedauert hat, bis das Tempo um 2 m/s gestiegen ist. Deshalb schreiben wir in unserem Beispiel 2 m/s².

Wer an dieser Stelle etwas ausprobieren möchte, könnte beim Bremsen drei aufeinanderfolgende Tachowerte skizzieren und an der Skizze erklären, welches Vorzeichen die Beschleunigung hat, wenn die Fahrtrichtung als positiv gilt. Wer erst noch über die Einheit m/s² sprechen möchte, kann im Gespräch bleiben. Die eigene Darstellung hilft beiden, das Verstehen einzuschätzen. Für einen formalen Abschluss gelten die bestehenden Anforderungen an selbstständige Nachweise. Bei einer ausdrücklich begonnenen Prüfung bearbeitet die Person die Aufgabe eigenständig. [Prüfungsablauf](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md#exams)

### Wenn der Begriff neu ist

> **Coach:** Wir können uns Beschleunigung am Fahrrad anschauen. Ich kann dir ein Beispiel zeigen. Wenn du schon eine Vorstellung hast, können wir auch damit anfangen.
>
> **Schüler:** Weiß ich noch nicht. Zeig mal.
>
> **Coach:** Du fährst geradeaus und trittst kräftiger in die Pedale. Dein Tacho zeigt erst 2 Meter pro Sekunde, eine Sekunde später 4 und noch eine Sekunde später 6. Dein Tempo nimmt in jeder Sekunde um 2 Meter pro Sekunde zu. Diese Änderung pro Sekunde nennen wir Beschleunigung. Bleibt der Tacho danach auf 6, fährst du weiter. Auf der geraden Strecke ist deine Beschleunigung dann null.
>
> **Schüler:** Und wenn ich bremse?
>
> **Coach:** Dann sinkt die Anzeige. Geht sie in einer Sekunde von 6 auf 4, hat sich dein Tempo um minus 2 Meter pro Sekunde geändert. Zählen wir die Fahrtrichtung positiv, beträgt die mittlere Beschleunigung in dieser Sekunde −2 m/s².

Hier bringt die Rückfrage des Schülers das Gespräch weiter. Eine eigene Erklärung oder eine Aufgabe kann folgen, sobald er das ausprobieren möchte.

## Wie lässt sich die Änderung erproben?

Für eine Erprobung im Claude-Client braucht es den neuen Skill und die zugehörigen Backend-Anweisungen. Dazu eignet sich ein gewöhnlicher Begriff, den der Schüler noch lernen möchte. Beim nächsten freiwilligen Betatest bieten sich vier Fragen an.

- Wie hat der Schüler die ersten Worte erlebt? Hatte er das Gefühl, erst eine Prüfungsfrage beantworten zu müssen, um eine Erklärung zu bekommen?
- Welchen Gedanken des Schülers greift der Coach in seiner Erklärung auf? Bekommt der Schüler auch dann einen verständlichen Einstieg, wenn er noch kein Beispiel kennt?
- Wie reagiert er auf eine konkrete Verständnisfrage wie „Warum steht die Sekunde da zweimal?“
- Konnte der Schüler den Gedanken danach auf seine Weise erklären oder eine eigene Frage verfolgen? Wo hätte er sich noch Hilfe oder eine Aufgabe gewünscht?

Die Beispieldialoge zeigen mögliche Gesprächsverläufe. Wie der Schüler den geänderten Coach erlebt, ist offen.
