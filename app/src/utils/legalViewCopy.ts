import type { LabelLanguage } from './filterLabels'

export interface LegalViewCopy {
  backToApp: string
  title: string
  markdown: string
}

const LEGAL_TEXT_DE = `
# Rechtliche Hinweise (Legal Notice)

## Nutzung von Curricula und Lehrplänen

SkillPilot verwendet Strukturen und Kompetenzbeschreibungen aus staatlichen Kerncurricula und Lehrplänen (z.B. des Landes Hessen).

### Urheberrechtliche Hinweise (Deutschland)

SkillPilot bildet Lernziele und Kompetenzstrukturen auf Grundlage öffentlich zugänglicher, amtlich veröffentlichter Curricula und Ordnungen im SkillPilot-Graphen ab. Dabei können Bezeichnungen, Zuschnitte und Formulierungen angepasst werden, soweit dies für eine konsistente Nutzung im Kontext von SkillPilot erforderlich ist.

SkillPilot ist keine amtliche Veröffentlichung und erhebt keinen Anspruch auf wortlautgetreue oder vollständige Wiedergabe. Maßgeblich bleiben die jeweiligen Originaldokumente; die Quellen werden angegeben und verlinkt.

**Keine Übernahme von Lehrmaterialien:**
SkillPilot enthält **keine konkreten Vorlesungsskripte, Folien oder Unterrichtsmaterialien** von Lehrenden. Die Vermittlung der Inhalte erfolgt ausschließlich durch die jeweiligen Lehrer:innen, Professor:innen oder generativ durch die KI. Wir bilden lediglich den Rahmen (das "Was") ab, nicht den urheberrechtlich geschützten Inhalt der Vermittlung (das "Wie").

## Lizenzierung des Quellcodes

Der Quellcode dieses Projekts (SkillPilot Software) ist unter der **Apache License, Version 2.0** lizenziert.

## Haftungsausschluss & Warnhinweise für SkillPilot

SkillPilot ist ein digitales Werkzeug zur Planung, Dokumentation und Reflexion von Lernprozessen.
Es richtet sich an **Lernende** und **Trainer:innen/Lehrende**.

Mit der Nutzung von SkillPilot erkennen Sie die folgenden Punkte an:

### 1. Keine Garantie für Vollständigkeit der Lernmodelle

* Die in SkillPilot abgebildeten Skill-Landschaften, Fähigkeiten und Lernziele sind **Modelle** der Realität.
* Es kann sein, dass Lerninhalte **nicht vollständig** oder **nicht ausreichend granular** modelliert sind.
* Auch wenn in SkillPilot alle angezeigten Teilziele erreicht wurden, bedeutet das **nicht automatisch**, dass das tatsächliche fachliche oder berufliche Lernziel vollständig erreicht ist.
* SkillPilot **ersetzt keine offiziellen Lehrpläne, Curricula, staatlichen Vorgaben oder anerkannten Bildungsabschlüsse**.

### 2. Grenzen der KI-gestützten Bewertung

* Die Einschätzung von Fähigkeiten und Lernfortschritten erfolgt teilweise durch **künstliche Intelligenz (KI)**.
* Diese Bewertungen können **fehlerhaft, unvollständig oder verzerrt** sein.
* KI-Bewertungen in SkillPilot sind **nicht prüfungs- oder rechtsverbindlich** und dürfen **nicht als alleinige Grundlage** für Zeugnisse, Prüfungsentscheidungen, Zertifikate oder Personalentscheidungen genutzt werden.
* Die Verantwortung für die inhaltliche und pädagogische Beurteilung liegt weiterhin bei den **Trainer:innen/Lehrenden** bzw. den verantwortlichen Bildungsträgern.

### 3. Manipulations- und Missbrauchsrisiken

Für **Lernende**:

* Angaben zu eigenen Fähigkeiten, Lernfortschritten und Nachweisen können von Nutzenden **bewusst oder unbewusst falsch** erfasst werden.
* SkillPilot kann nicht sicherstellen, dass alle erfassten Daten der Realität entsprechen.

Für **Trainer:innen/Lehrende**:

* Lernende haben verschiedene Möglichkeiten, ihre Angaben zu **manipulieren** (z. B. falsche Selbsteinschätzungen, unzutreffende Nachweise).
* Über technische Schnittstellen (z. B. API) können Lernfortschritte automatisiert eingespielt werden, die **tatsächlich nicht erbracht** wurden.
* Trainer:innen und Institutionen bleiben selbst dafür verantwortlich, **Echtheit und Qualität** von Leistungsnachweisen und Fähigkeiten **unabhängig zu prüfen**.

### 4. Verfügbarkeit des Dienstes

* Es besteht **keine Garantie** für die jederzeitige technische Verfügbarkeit von SkillPilot.
* Der Dienst kann **zeitweise eingeschränkt**, **gestört** oder **dauerhaft eingestellt** werden.
* Funktionen, Inhalte oder Schnittstellen können **jederzeit geändert oder entfernt** werden.

### 5. Speicherung und Verlust von Daten

* Es besteht **keine Garantie**, dass Daten in SkillPilot **dauerhaft** gespeichert oder wiederhergestellt werden können.
* Es kann trotz technischer und organisatorischer Maßnahmen zu **Datenverlust, Beschädigung oder versehentlicher Löschung** kommen.
* Nutzer:innen sind selbst dafür verantwortlich, **wichtige Informationen zusätzlich außerhalb von SkillPilot zu sichern** (z. B. Exporte, eigene Backups).

### 6. Haftungsausschluss

* Die Nutzung von SkillPilot erfolgt **auf eigene Verantwortung**.
* Soweit **gesetzlich zulässig**, übernimmt der Betreiber **keine Haftung** für:

  * inhaltliche Fehler oder Unvollständigkeiten der Lernmodelle,
  * fehlerhafte oder unzutreffende KI-Bewertungen,
  * manipulierte oder falsche Eingaben von Nutzenden,
  * technische Störungen, Ausfälle oder Datenverluste,
  * mittelbare Schäden, Folgeschäden, entgangenen Gewinn oder sonstige Vermögensschäden.
* Unberührt bleiben gesetzlich zwingende Haftungsregeln, insbesondere bei **Vorsatz, grober Fahrlässigkeit** sowie bei **Verletzung von Leben, Körper oder Gesundheit**.

### 7. Bestätigung

Mit dem Fortfahren und der Nutzung von SkillPilot bestätigen Sie, dass Sie:

* diese **Hinweise gelesen und verstanden** haben und
* SkillPilot **nur als unterstützendes Werkzeug** nutzen und **nicht als alleinige Entscheidungsgrundlage** für Prüfungen, Zertifizierungen, Personal- oder Karriereentscheidungen.
`

const LEGAL_TEXT_EN = `
# Legal Notice & Disclaimer

## Usage of Curricula and Syllabi

SkillPilot uses structures and competency descriptions from official core curricula and syllabi (e.g., from the State of Hesse).

### Copyright notice (Germany)

SkillPilot models learning goals and competency structures in the SkillPilot graph based on publicly accessible, officially published curricula and regulations. Names, scopes, and wording may be adjusted where necessary for consistent use within SkillPilot.

SkillPilot is not an official publication and makes no claim to reproduce the wording verbatim or in full. The original documents remain authoritative; sources are cited and linked.

**No Inclusion of Teaching Materials:**
SkillPilot contains **no specific lecture notes, slides, or teaching materials** from instructors. The transmission of content is carried out exclusively by the respective teachers, professors, or generatively by AI. We only map the framework (the "What"), not the copyright-protected content of the delivery (the "How").

## Licensing of Source Code

The source code of this project (SkillPilot Software) is licensed under the **Apache License, Version 2.0**.

## Disclaimer & Warnings for SkillPilot

SkillPilot is a digital tool for planning, documenting, and reflecting on learning processes.
It is aimed at **Learners** and **Trainers/Instructors**.

By using SkillPilot, you acknowledge the following points:

### 1. No Guarantee for Completeness of Learning Models

* The skill landscapes, skills, and learning goals depicted in SkillPilot are **models** of reality.
* It may be that learning content is **not fully** or **not sufficiently granularly** modeled.
* Even if all displayed sub-goals in SkillPilot have been achieved, this does **not automatically mean** that the actual academic or professional learning goal has been fully achieved.
* SkillPilot **does not replace official curricula, syllabi, state requirements, or recognized educational qualifications**.

### 2. Limits of AI-Supported Assessment

* The assessment of skills and learning progress is partly carried out by **Artificial Intelligence (AI)**.
* These assessments may be **incorrect, incomplete, or biased**.
* AI assessments in SkillPilot are **not exam- or legally binding** and may **not be used as the sole basis** for report cards, examination decisions, certificates, or personnel decisions.
* The responsibility for content and pedagogical assessment remains with the **Trainers/Instructors** or the responsible educational institutions.

### 3. Manipulation and Misuse Risks

For **Learners**:

* Information about own skills, learning progress, and evidence can be **consciously or unconsciously falsely** recorded by users.
* SkillPilot cannot ensure that all recorded data corresponds to reality.

For **Trainers/Instructors**:

* Learners have various ways to **manipulate** their information (e.g., false self-assessments, incorrect evidence).
* Through technical interfaces (e.g., API), learning progress can be automatically imported that was **actually not achieved**.
* Trainers and institutions remain responsible for **independently verifying** the authenticity and quality of evidence and skills.

### 4. Availability of Service

* There is **no guarantee** for the continuous technical availability of SkillPilot.
* The service may be **temporarily restricted**, **disrupted**, or **permanently discontinued**.
* Functions, content, or interfaces may be **changed or removed at any time**.

### 5. Storage and Loss of Data

* There is **no guarantee** that data in SkillPilot can be **permanently** stored or restored.
* Despite technical and organizational measures, **data loss, damage, or accidental deletion** may occur.
* Users are responsible for **backing up important information additionally outside of SkillPilot** (e.g., exports, own backups).

### 6. Disclaimer of Liability

* The use of SkillPilot is **at your own risk**.
* To the extent **permitted by law**, the operator assumes **no liability** for:

  * content errors or incompleteness of the learning models,
  * incorrect or inaccurate AI assessments,
  * manipulated or false inputs by users,
  * technical malfunctions, failures, or data losses,
  * indirect damages, consequential damages, lost profits, or other financial losses.
* Mandatory statutory liability rules remain unaffected, especially in cases of **intent, gross negligence**, as well as **injury to life, body or health**.

### 7. Confirmation

By proceeding and using SkillPilot, you confirm that you:

* have **read and understood these notes** and
* use SkillPilot **only as a supporting tool** and **not as the sole basis for decision-making** for exams, certifications, personnel, or career decisions.
`

export const getLegalViewCopy = (language: LabelLanguage): LegalViewCopy => (
  language === 'en'
    ? {
        backToApp: 'Back to App',
        title: 'Legal & Privacy',
        markdown: LEGAL_TEXT_EN,
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Rechtliches & Datenschutz',
        markdown: LEGAL_TEXT_DE,
      }
)
