# Start SkillPilot in 5 Minutes

**Status:** July 30, 2026

SkillPilot guides you step by step through your curriculum. You start an AI learning coach, work on suitable learning goals, and track your progress in the cockpit.

> **Architecture status:** The English coach currently remains on the separate Visible Session fallback described below. The current German reference integration uses the ChatGPT app **SkillPilot Coach (Deutsch)** with OAuth/MCP and a separate learning-session ID valid for exactly 24 hours. SkillPilot creates a fresh ID for every explicit UI start, inserts it automatically into the prepared start message, and the coach carries it into every functional tool call. Visible Session is retained for English and as a rollback path; it is not the current German architecture.

All you need is a browser and a ChatGPT account for which the required GPT or app is available. Availability and usage limits are controlled by ChatGPT.

> **Note:** For now, please use SkillPilot in the normal ChatGPT chat, not in ChatGPT voice mode. The reason is explained below in the frequently asked questions.

---

## Quick Start in 5 Steps

1. Open [skillpilot.com](https://skillpilot.com).
2. Click **Login**.
3. Accept the notice and choose your login path: create a new SkillPilot ID, load a protected ID file, or enter an existing SkillPilot ID.
4. Choose your curriculum and click **Start SkillPilot Learning Coach** or **Open Cockpit**.
5. In the ChatGPT window, send the prepared session message unchanged. It contains a visible session token valid for no more than 24 hours, but not your permanent SkillPilot ID.

---

## What You Need

- a browser
- a ChatGPT account for which the required GPT or app is available
- no SkillPilot registration with name or email address

---

## Four Important Terms

**SkillPilot ID:** Your permanent key to your learning progress. You can enter it directly or save it as a password-protected ID file.

**Chat session token (English fallback only):** A temporary key with the prefix `sps_` that SkillPilot creates for the English Visible Session flow. It is visible in the start message and the final footer line of coach responses, and expires after no more than 24 hours. Do not share a live token publicly.

**Learning goal ID:** A stable, globally unique identifier for a learning goal. It may be visible and makes a goal unambiguous; it is not an access credential.

**Cockpit:** Your overview of learning goals, progress, and useful next steps.

---

## Step by Step with Images

| <img src="../comic01.en.png" alt="Start at SkillPilot" width="650" /> |
| --- |
| *You start on SkillPilot, choose your curriculum, and then continue working with the learning coach.* |

---

## 1) Open SkillPilot and Choose Login

| <img src="../screenshot_01.en.png" alt="SkillPilot homepage with tiles" width="700" /> |
| --- |
| *To learn, log in from the homepage. It costs nothing and you do not need to register with a name or email address.* |

SkillPilot stores your learning progress under a pseudonymous SkillPilot ID. In the current English fallback, starting the English learning coach creates a temporary visible chat session. The permanent SkillPilot ID stays in the browser and backend; ChatGPT sees only the session token, which expires after no more than 24 hours. The current German OAuth/MCP app uses its own separate learning-session ID valid for exactly 24 hours: SkillPilot creates a fresh ID for every explicit UI start, inserts it automatically into the prepared start message, and the coach carries it into every functional tool call. The learner does not copy or manage it.

---

## 2) Create, Load, or Enter a SkillPilot ID

| <img src="../screenshot_02.en.png" alt="SkillPilot Login with ID creation and direct ID entry" width="700" /> |
| --- |
| *This is where your SkillPilot ID is created or appears. If you do not have a login yet, SkillPilot creates a new pseudonymous ID for you.* |

You have three options:

1. **Create a new SkillPilot ID:** For your first start.
2. **Load a protected ID file:** If you previously saved your ID as a password-protected file.
3. **Enter an existing SkillPilot ID:** If you already have your ID.

**Remember:** Keep your SkillPilot ID safe or save it as a protected ID file. Without it, you cannot reopen your previous progress later.

---

## 3) Choose Curriculum and Prepare Start

After login, choose your curriculum. Then you can start the SkillPilot Learning Coach directly or open your cockpit first.

When you start the English fallback coach, SkillPilot creates a chat session valid for no more than 24 hours and opens ChatGPT with a prepared message. The temporary session token is visible in it. The permanent SkillPilot ID stays with SkillPilot and is not copied into the chat.

---

## 4) Start the Learning Coach in ChatGPT

Send the prepared session message unchanged. The SkillPilot Learning Coach uses it to load your current learning state from the backend. There is no additional start code or redemption step.

After that, continue working normally in chat: ask questions, work on tasks, upload photos, or enter text by dictation. Every normal coach response ends with a compact line such as:

```text
— SkillPilot · Session: sps_...
```

While a goal is active, that line also contains its full learning goal ID. This technical footer is intentional: it carries the current session and goal reliably into the next dialog step. Do not edit it. When the coach needs a choice, it displays numbered options; simply reply with the relevant number.

---

## 5) Start the First Learning Session

The learning coach starts with a suitable learning goal and checks your understanding step by step.

| <img src="../comic03.en.png" alt="Mission Control" width="650" /> |
| --- |
| *The learning coach guides you like mission control: it gives orientation, checks your understanding, and suggests next steps.* |

| <img src="../comic04.en.png" alt="Frontier" width="650" /> |
| --- |
| *You work on your current learning frontier: exactly where it makes sense for you to continue next.* |

---

## 6) How a Learning Session Works

SkillPilot checks not only definitions but also application and transfer. You can upload photos, worksheets, or your own sketches and receive feedback. Once there is sufficient evidence that a goal is mastered, the coach saves that progress in the backend and reloads the useful next goals.

---

## 7) View Progress: Cockpit

| <img src="../comic05.en.png" alt="Cockpit" width="650" /> |
| --- |
| *In the cockpit, you keep track of learning goals, progress, and next steps.* |

| <img src="../comic06.en.png" alt="Connection with Mission Control" width="650" /> |
| --- |
| *Cockpit and learning coach work with the same learning state. This lets you switch between overview and learning.* |

| <img src="../screenshot_10.en.png" alt="Choose curriculum and start" width="700" /> |
| --- |
| *Choose curriculum, open cockpit, or start learning coach: you continue working with the same learning state.* |

---

## 8) Keep the Overview and Continue

| <img src="../screenshot_11.en.png" alt="Cockpit: learning goals and next steps" width="900" /> |
| --- |
| *In the cockpit, you see what you have already mastered and what comes next.* |

| <img src="../comic07.en.png" alt="Max keeps the overview" width="650" /> |
| --- |
| *You do not have to guess by yourself what to continue with. SkillPilot makes your progress visible.* |

| <img src="../screenshot_12.en.png" alt="Cockpit: example for another learning goal" width="900" /> |
| --- |
| *You can also choose other learning goals and display their contents.* |

---

## Frequently Asked Questions

### Does ChatGPT See My SkillPilot ID?

No. Your permanent SkillPilot ID stays in the browser and with SkillPilot. In the English Visible Session fallback, ChatGPT sees only the temporary session token and the learning information needed for the current coaching dialog. The current German OAuth/MCP integration likewise uses only a separate temporary learning-session ID, inserted automatically into the prepared start message and carried into every functional tool call.

### Why Does Every Coach Response End With a Technical SkillPilot Footer?

This footer belongs to the English Visible Session fallback. It carries the temporary session token and, while a goal is active, the unambiguous learning goal ID visibly across turns. While the token is still valid, do not publicly share the chat or screenshots containing that line. The current German OAuth/MCP app does not use this response footer; its own short-lived learning-session ID is transported automatically in the prepared start message and as an explicit argument of every functional tool call.

### Do I Need ChatGPT Plus?

SkillPilot itself does not require a paid subscription. Whether the required GPT or app is available in your ChatGPT plan or workspace, and which usage limits apply, is controlled by ChatGPT.

### Do I Need a Computer?

No. A phone is enough. You can write on paper as usual, then take a photo with your phone and upload it to the chat.

### Can I Use ChatGPT Voice Mode?

Please not at the moment. If you use ChatGPT voice mode in a SkillPilot chat, ChatGPT can no longer talk to the SkillPilot backend in that chat afterwards. We opened a ticket with ChatGPT/OpenAI and are waiting for the fix.

You can still chat normally with the learning coach, upload photos of your tasks or paper solutions, and enter text by voice dictation. Only ChatGPT voice mode should not be used in the SkillPilot chat.

### What Happens If I Lose My SkillPilot ID?

If you have not saved a protected ID file and lose your SkillPilot ID, you cannot reopen your previous progress. Store the protected file safely or keep your SkillPilot ID in a safe place.

### What Happens If the ChatGPT Session Expires?

The learning coach session in ChatGPT is valid for no more than 24 hours and is not extended by use. If it expires, return to [skillpilot.com](https://skillpilot.com), load your protected ID file or enter your SkillPilot ID there, and start the learning coach again. SkillPilot will create a new temporary session token. Do not enter your permanent SkillPilot ID directly in chat.

### Can I Switch Between Cockpit and Learning Coach?

Yes. The cockpit shows your learning state. The learning coach helps you learn. Both work with the same progress as long as you use the same SkillPilot ID.
