Codex Project Memory Setup

This file is a reusable bootstrap and operating guide for Codex projects.

It supports:

A new project with only an initial idea.
A new project where the idea/plan is provided in the first prompt.
An existing or incomplete project already under development.
An existing project that needs review, improvement, modernization, or new capabilities.
Optional delegation of bounded work to the local local_qwen_worker MCP tool when it is available.

The goal is to reduce context/token waste and hallucination while preserving enough durable project knowledge to continue safely across long sessions and context compaction.

1. Final project memory structure

Use this structure:

project/
│
├── AGENTS.md
│
└── .ai/
    │
    ├── 00-project-index.md
    │
    ├── project/
    │   ├── project-plan.md
    │   ├── roadmap.md
    │   ├── requirements.md          # create when needed
    │   ├── architecture.md          # create when needed
    │   ├── workflows.md             # create when needed
    │   └── risks.md                 # create when needed
    │
    ├── decisions/
    │   ├── current/
    │   │   └── YYYY-MM-DD-description.md
    │   └── archive/
    │       └── YYYY-MM-DD-description.md
    │
    ├── tasks/
    │   ├── active/
    │   │   └── YYYY-MM-DD-description.md
    │   └── archive/
    │       └── YYYY-MM-DD-description.md
    │
    └── verification/
        └── YYYY-MM-DD-description.md

Commit AGENTS.md and .ai/ to normal project version control.

Do not add SQLite, embeddings, vector databases, external memory services, local-LLM memory databases, or other retrieval infrastructure unless the project later demonstrates a real need.

2. Project lifecycle

Every project uses three major phases.

Phase 1 — Planning & Evaluation

For a new project:

brainstorm and challenge the initial idea;
evaluate feasibility;
identify weak assumptions;
compare realistic approaches;
define scope and boundaries;
define requirements;
define important workflows where needed;
define architecture where needed;
identify meaningful risks;
define phases, milestones, dependencies, and verification criteria;
establish an approved baseline before substantial implementation.

For an existing project:

inspect implementation reality first;
determine what already exists and what actually works;
review current architecture, workflows, tests, documentation, and technical condition;
only then evaluate proposed improvements;
identify what should stay unchanged;
challenge unrealistic or unnecessary changes;
define the realistic target state and migration path;
establish an approved target baseline before substantial execution.
Phase 2 — Execution

Follow the approved baseline.

Work one meaningful task at a time.

Do not update baseline documentation merely because implementation happened.

Update baseline documentation only when an approved change means the written baseline is no longer correct.

Phase 3 — Testing & Bug Fixing

Validate actual implementation against:

requirements;
architecture/workflows where relevant;
milestone/phase verification criteria;
existing behaviour that must remain intact.

Bug fixes do not automatically change project documentation.

3. Two truth models

Never use one universal source-of-truth ranking.

Intended truth — what the system SHOULD do

Use:

Current explicit user instruction.
Approved project baseline in .ai/project/.
Relevant current decision records in .ai/decisions/current/.
Implementation truth — what the system CURRENTLY does

Use:

Current source/config/schema.
Tests.
Observed executable/runtime behaviour.

If intended truth and implementation truth disagree, treat it as a deviation.

Do not silently rewrite documentation to match code.

Do not silently rewrite code to match documentation.

Investigate and surface the discrepancy.

4. Live files versus baseline files
Live state

These may change during normal execution:

.ai/00-project-index.md
roadmap phase/milestone/status fields
.ai/tasks/active/*
.ai/project/risks.md
Baseline

These change only when approved project truth changes:

.ai/project/project-plan.md
.ai/project/requirements.md
.ai/project/architecture.md
.ai/project/workflows.md
.ai/decisions/current/*

Baseline project documents should include:

modified: YYYY-MM-DD

When an approved baseline change is made, update the modified: date in the same edit.

5. Context-loading rule

Always start with the minimum context needed.

Normal escalation:

AGENTS.md and .ai/00-project-index.md when orientation is needed.
Directly relevant active task, source, and tests.
Relevant project baseline document only if needed.
Relevant current decision only if needed.
Archived tasks/decisions only when historical context appears useful.

Do not load files merely because they exist.

Do not reread an unchanged file already reliably read since the last context compaction unless it may have changed.

After context compaction or loss of conversational context:

Re-read AGENTS.md.
Re-read .ai/00-project-index.md.
Treat previously loaded project context as unreliable.
Restore only the context needed for the current task.

Repository files override remembered or compacted conversational summaries for file-backed facts.

6. Index rules

.ai/00-project-index.md is live orientation and navigation.

Keep it very small, preferably around 1–2 KB and no more than roughly 3 KB.

It should contain:

project name/purpose in one short line;
current lifecycle phase;
current milestone/review state;
active meaningful task(s);
map of project documents that actually exist;
important current decision pointers where useful;
important current risk pointers where useful;
a very small high-value historical pointer section.

Historical pointers should use:

YYYY-MM-DD — title — one-line outcome

Only include archived items with strong future retrieval value.

Do not turn the index into a project summary, task board, or chronological journal.

Index maintenance is part of the operation that changed project state.

Examples:

starting a meaningful task → create/update task and update index;
completing a meaningful task → archive it and update index;
changing milestone/phase → update roadmap and index;
archiving a historically valuable decision/task → add a one-line pointer if useful.

Periodically reconcile the index against actual .ai/ contents after major phases, several context compactions, significant restructuring, or whenever inconsistency is suspected.

Reconciliation may fix navigation/state bookkeeping. It must not silently resolve substantive disagreements between baseline and implementation.

7. Decision rules

Use atomic decision files:

.ai/decisions/current/YYYY-MM-DD-description.md

Create one only when forgetting or casually reversing the decision could cause meaningful cost, risk, defects, or repeated debate.

Keep it concise:

# Decision title

Date: YYYY-MM-DD
Basis: <user decision / approved requirement / authoritative project documentation>

## Decision
...

## Why
...

## Important consequences / constraints
...

Do not create decision records for routine implementation choices.

Do not infer intentional architecture from implementation alone.

When a decision is no longer current, move it to:

.ai/decisions/archive/

The directory represents status.

8. Task-memory rules

Do not create persistent task files for every task.

Create or promote:

.ai/tasks/active/YYYY-MM-DD-description.md

when one or more of these becomes true:

complexity is clearly significant;
the work spans sessions;
the task survives a context compaction;
a second meaningful approach fails;
an important non-obvious discovery emerges;
an unresolved blocker appears.

A task file may contain:

objective;
relevant baseline references;
constraints;
important findings;
failed approaches worth preserving;
remaining work;
verification criteria/result.

Do not maintain a command-by-command diary.

When complete, move it to:

.ai/tasks/archive/

Add an index historical pointer only if the archived task contains knowledge likely to prevent future repeated work or mistakes.

9. Verification rules

Use three levels.

Task verification

Keep verification inside the active task record when one exists.

Milestone verification

Keep a concise verification result in roadmap.md.

Phase / release / client acceptance

Create:

.ai/verification/YYYY-MM-DD-description.md

only when the verification artifact has genuine lasting value.

Never claim a task, milestone, build, test, check, phase, or release passed unless the supporting checks were actually performed successfully.

10. Local AI worker integration

A local Qwen worker may be available to Codex through the MCP tool named:

local_qwen_worker

The local worker is an optional bounded execution helper.

Codex remains the planner, architect, reviewer, verifier, and final decision-maker.

The local worker must never become an authority for project truth or AI memory.

Good delegation candidates

Codex may delegate narrowly scoped work such as:

summarize a bounded block of text or code already supplied to the worker;
explain a small function/module from explicitly provided content;
propose boilerplate or repetitive code from a precise specification;
generate small test-case ideas from supplied requirements;
transform or normalize bounded text/data;
produce a first-pass review of a small supplied diff/snippet;
generate candidate implementation options for a tightly defined subproblem;
other self-contained tasks where all required context can be explicitly supplied.
Do NOT delegate

Do not use the local worker to independently:

determine repository truth;
inspect or search the repository unless Codex explicitly provides the necessary content through the task;
decide architecture, product scope, requirements, or project direction;
create or modify durable .ai/ decisions;
infer current project state;
perform security-sensitive judgments;
authorize destructive changes;
decide whether tests/builds passed;
make claims about files it has not been given;
replace Codex verification.

The worker currently returns text only and has no shell, filesystem, network, or write permission through the adapter.

Delegation verification

Treat worker output as a draft or candidate result.

Codex must independently review any worker output before using it.

For code:

check it against current source and project constraints;
adapt it where necessary;
run relevant validation.

For summaries or analysis:

compare against the supplied authoritative material;
do not copy unsupported claims into project documentation or .ai/ memory.

For decisions:

the worker may propose options;
Codex/user approval establishes the decision.
Token-efficiency rule

Delegate only when the bounded local task is likely to save meaningful remote-model reasoning/context.

Do not spend more context constructing, explaining, and verifying a delegation than simply doing the task directly.

Prefer small, self-contained worker prompts.

If local_qwen_worker is unavailable, continue normally without changing the project-memory architecture.

11. Mandatory AGENTS.md contract

The explanatory sections above are not enough by themselves. Every bootstrap/planning prompt A–E below must explicitly create or update AGENTS.md before doing its project-specific work.

If AGENTS.md already exists:

inspect it first;
preserve useful repository-specific rules;
merge the current memory and local-AI rules without duplicating them;
keep the result concise, preferably about 3–4 KB maximum;
do not replace useful safety, build, test, deployment, or repository-specific instructions merely to impose this template.

AGENTS.md must permanently teach future Codex sessions how to use both the project memory and the local worker.

It must contain, in substance:

Project memory and context
.ai/00-project-index.md is the project orientation/router.
Start with minimum context and escalate only when uncertainty requires it.
Do not reread unchanged files already reliably loaded since the last context compaction unless they may have changed.
After compaction/context loss, re-read AGENTS.md + .ai/00-project-index.md, then restore only current-task context.
Use three phases: Planning & Evaluation → Execution → Testing & Bug Fixing.
Intended truth answers what SHOULD happen: current user instruction → approved baseline → current decisions.
Implementation truth answers what DOES happen: source/config/schema → tests → observed behaviour.
If they disagree, surface a deviation instead of silently changing either side.
Treat index, roadmap status, active tasks, and risks as live state.
Treat project-plan, requirements, architecture, workflows, and current decisions as baseline.
Baseline changes require approval and update modified: in the same edit.
Use atomic decision files only for durable important rationale.
Create/promote task memory only for work where losing reasoning would cause meaningful rework.
Archive completed/superseded task/decision records.
Maintain the index as part of task, milestone, risk, and archive changes.
Periodically reconcile index pointers against actual .ai/ contents.
Verify at task, milestone, and major phase/release levels as appropriate.
Keep memory concise.

Recommended ceilings:

AGENTS.md: about 4 KB.
index: 3 KB maximum, preferably 1–2 KB.
individual decision: about 3 KB.
individual task: about 5 KB.
verification artifact: normally about 6 KB.
split large project docs by domain when retrieval becomes expensive.
Working rules
The user/project owner is the final decision maker.
Work one task at a time.
Do not change scope, requirements, architecture, or product behaviour without approval.
Do not refactor unrelated code.
Verify file-backed claims before asserting them.
Never claim a build/test/check passed unless actually executed successfully.
Keep searches, logs, diffs, test output, and directory listings bounded.
Protect secrets, credentials, production data, deployment settings, DNS, SSL, payment settings, account/session/token files, and similar sensitive resources unless explicitly authorized.
Record verified canonical install/dev/build/test/lint commands when known.
Local AI worker

The external local worker is:

local_qwen_worker

Codex calls:

local_qwen_worker.delegate_task

AGENTS.md must state:

the local worker is optional and user-managed;
Codex must not automatically start, stop, restart, expose, or reconfigure the model server unless explicitly requested;
delegate only bounded, context-complete work likely to save meaningful Codex/remote-model effort;
good candidates include small code drafts, boilerplate, repetitive transformations, candidate tests, bounded summaries, and first-pass reviews of small supplied snippets/diffs;
never delegate repository truth, project scope, requirements, architecture, durable .ai/ memory, sensitive/destructive decisions, or final verification;
worker output is an untrusted candidate/draft;
Codex must independently inspect/verify it before use;
if the worker is unavailable, continue normally instead of blocking the project.
Local worker project setup

The known local-engine reference is:

C:\_AI_Engine

The bootstrap process should:

Check:

codex mcp list

Preserve any existing project .codex/config.toml.

If local_qwen_worker is missing, do not invent MCP configuration.

If accessible, inspect the known-working:

C:\_AI_Engine\.codex\config.toml
C:\_AI_Engine\how-to.md

Add only the equivalent project-scoped local_qwen_worker entry required by the current project.

Verify again with codex mcp list.

If the known-working setup cannot be inspected/verified, leave the project usable without the worker and report that once.

The local engine itself is external. The project memory system must not duplicate its model/runtime files.

12. Prompt A — New project bootstrap, idea given later

Use this as the first prompt in a new repository when you want to provide the project idea in a later message.

Then use Prompt B.

You are the primary coding and project agent for this repository.

Your first responsibility is to establish a lightweight project-management, documentation, and AI-memory system that will be used throughout this project.

Do not begin substantial implementation until the initial Planning & Evaluation phase is complete, unless I explicitly instruct otherwise.

## 1. First determine the project situation

Inspect the repository before making assumptions.

Classify it as one of:

* NEW PROJECT — little or no implementation exists.
* EXISTING / INCOMPLETE PROJECT — implementation exists but development is unfinished.
* EXISTING / UPGRADE PROJECT — a functioning project exists and needs review, improvement, modernization, restructuring, or new capabilities.

Do not assume my initial ideas are automatically correct or technically optimal.

For existing projects, first establish what actually exists before evaluating proposed improvements.

---

# 2. Create this project structure

Create:

AGENTS.md

.ai/
00-project-index.md

project/
project-plan.md
roadmap.md

decisions/
current/
archive/

tasks/
active/
archive/

verification/

Create these additional project documents only when Planning & Evaluation shows they are genuinely needed:

.ai/project/requirements.md
.ai/project/architecture.md
.ai/project/workflows.md
.ai/project/risks.md

Do not create documents merely to fill the structure.

Do not create:

* global task-board files
* global decision logs
* debug logs
* review logs
* improvement logs
* user-feedback logs
* history logs
* SQLite databases
* embeddings
* vector databases
* local-LLM memory systems
* external AI-memory infrastructure

Commit AGENTS.md and .ai/ to normal project version control.

---

# 3. AGENTS.md

Create a concise AGENTS.md containing operating rules only.

Keep it simple and preferably under approximately 4 KB.

It must establish these rules:

* Read `.ai/00-project-index.md` when orienting or restoring project context.
* Start with the minimum context needed for the current task.
* Escalate context only when uncertainty requires it.
* Do not reread unchanged files already reliably read since the last context compaction unless they may have changed.
* After context compaction or loss of conversational context, re-read AGENTS.md and `.ai/00-project-index.md` before continuing.
* Work one task at a time.
* Do not re-plan the whole project unless required by the current phase or explicitly requested.
* Do not change scope, requirements, product behaviour, or architecture without approval.
* Do not refactor unrelated code.
* Verify file-backed facts before claiming them as current truth.
* Inspect relevant source/config/schema before claiming how the implementation currently works.
* Never claim a test/build/check passed unless it was actually run successfully.
* Keep repository searches, logs, test output, diffs, directory listings, and command output bounded.
* Avoid generated files, dependencies/vendor directories, build output, binaries, lockfiles, and large logs unless directly relevant.
* Protect secrets, credentials, API keys, production data, deployment configuration, DNS, SSL, payments, account/session/token files, and similar sensitive resources unless explicitly authorized.
* Surface discrepancies between documented intent and actual implementation rather than silently changing either side.
* Maintain project documentation according to the lifecycle rules below.
* Preserve durable AI memory only when losing it would cause meaningful rework or repeated mistakes.

Keep any known canonical install/build/test/lint/dev commands in AGENTS.md because they reduce repeated repository discovery.

---

# 4. Two truth models

Never use one universal source-of-truth ranking.

For questions about WHAT THE SYSTEM SHOULD DO, use intended truth:

1. My current explicit instruction.
2. Approved project baseline in `.ai/project/`.
3. Current relevant records in `.ai/decisions/current/`.

For questions about WHAT THE SYSTEM CURRENTLY DOES, use implementation truth:

1. Current source/config/schema.
2. Tests.
3. Observed executable/runtime behaviour.

If intended truth and implementation truth disagree, treat it as a DEVIATION.

Do not silently rewrite documentation to match code.
Do not silently rewrite code to match documentation.

Investigate and surface the discrepancy. If the correct resolution is not already established, ask for or flag the required project decision.

---

# 5. Project lifecycle

Every project follows three major phases.

## PHASE 1 — PLANNING & EVALUATION

For a NEW PROJECT:

* brainstorm and challenge the initial idea;
* evaluate feasibility;
* identify weak assumptions;
* compare realistic approaches;
* define product/project objective;
* define scope and boundaries;
* define major capabilities;
* define requirements;
* define important user/system workflows where necessary;
* define architecture where necessary;
* identify meaningful cross-cutting risks;
* define phases, milestones and dependencies;
* define milestone/phase verification criteria;
* produce an approved project baseline before substantial implementation.

For an EXISTING PROJECT:

First perform repository discovery.

Establish:

* what already exists;
* current stack;
* repository structure;
* major modules;
* current architecture;
* important workflows;
* build/test condition;
* existing documentation;
* current limitations and technical debt relevant to the requested work.

Only after establishing implementation reality should you evaluate my proposed improvements.

Then:

* compare existing reality with my ideas;
* challenge unrealistic or unnecessary proposals;
* identify what should remain unchanged;
* identify valuable improvements;
* evaluate trade-offs and migration impact;
* define the approved target state;
* define requirements and architecture changes;
* define phases/milestones;
* define regression and verification requirements.

The result of Phase 1 becomes the approved project baseline.

## PHASE 2 — EXECUTION

Follow the approved baseline.

Work through the roadmap one meaningful task at a time.

Do not update baseline documentation simply because implementation happened.

Update baseline documentation only when an approved change means the written baseline is no longer correct.

Normal execution should primarily modify:

* source/config/schema;
* tests;
* active task context when needed;
* roadmap/index live status.

## PHASE 3 — TESTING & BUG FIXING

Validate the actual implementation against:

* requirements;
* architecture/workflows where relevant;
* milestone/phase verification criteria;
* existing behaviours that must remain intact.

Fix bugs without changing the documented project baseline unless testing reveals that the baseline itself requires an approved change.

---

# 6. Project documents

## `.ai/00-project-index.md`

This is live orientation, not a project-history document.

Keep it very small, preferably around 1–2 KB and no more than approximately 3 KB.

Maintain:

* project name/purpose in one short line;
* current lifecycle phase;
* current milestone;
* active meaningful task(s);
* map of project documents that actually exist;
* important current decision pointers when useful;
* important current risk pointers when useful;
* a very small historical pointer section.

Historical pointers must contain only archived information with strong future retrieval value, for example:

`YYYY-MM-DD — short title — one-line outcome`

Do not list every completed task.

The index is LIVE STATE and is exempt from the rule that baseline documentation changes only on approved deviation.

## `project/project-plan.md`

The durable description of:

* what we are building;
* why;
* scope;
* boundaries;
* major capabilities;
* assumptions;
* success criteria;
* high-level phases.

Include:

`modified: YYYY-MM-DD`

## `project/roadmap.md`

Project-management view containing:

* phases;
* milestones;
* major deliverables;
* dependencies;
* status;
* milestone verification criteria/results.

Do not turn it into a detailed coding task board.

Roadmap status is live state and may change during normal execution.

Include:

`modified: YYYY-MM-DD`

## `project/requirements.md`

Create only when requirements become substantial enough to justify a dedicated file.

Use for:

* functional requirements;
* non-functional requirements;
* business rules;
* constraints;
* acceptance requirements.

Include:

`modified: YYYY-MM-DD`

If it becomes too large for efficient retrieval, split by domain rather than repeatedly loading one giant file.

## `project/architecture.md`

Create only when system architecture becomes substantial.

Use for:

* major components;
* boundaries;
* responsibilities;
* important data flows;
* integrations;
* system invariants;
* intended technical structure.

Do not document every class/function/file.

Include:

`modified: YYYY-MM-DD`

## `project/workflows.md`

Create only when meaningful user/business/system workflows need durable definition.

Include:

`modified: YYYY-MM-DD`

## `project/risks.md`

Create only when important cross-cutting risks exist that cannot sensibly live in one task, requirement, or decision.

Keep only active material risks.

---

# 7. Decisions

Important intentional decisions live as atomic files:

`.ai/decisions/current/YYYY-MM-DD-description.md`

Use descriptive filenames.

A decision record should normally contain only:

* Decision
* Basis
* Why
* Important consequences/constraints

Create decision records only when forgetting or casually reversing the decision could cause meaningful cost, risk, defects, or repeated debate.

Do not create decision files for ordinary implementation choices.

When a decision is superseded or no longer current, move the file to:

`.ai/decisions/archive/`

The directory represents status. Do not maintain duplicate status metadata.

When archiving a historically valuable decision, add a one-line historical pointer to the index.

---

# 8. Tasks

Do not create persistent task-memory files for every coding task.

Create:

`.ai/tasks/active/YYYY-MM-DD-description.md`

when losing task reasoning would cause meaningful rework.

A task should be promoted to an active task record if any of these becomes true:

* complexity is clearly significant;
* it spans sessions;
* it survives a context compaction;
* a second meaningful approach fails;
* an important non-obvious discovery emerges;
* an unresolved blocker appears.

An active task may contain:

* objective;
* relevant baseline references;
* constraints;
* important findings;
* failed approaches worth retaining;
* remaining work;
* verification criteria/result.

Do not maintain a command-by-command diary.

When complete, move it to:

`.ai/tasks/archive/`

Add a historical pointer to the index only if the archived task contains knowledge that may prevent future repeated work or mistakes.

---

# 9. Verification

Use three levels.

Task verification:
Keep it in the active task file when one exists.

Milestone verification:
Keep a concise verification result in `roadmap.md`.

Phase/release/client acceptance:
Create a dedicated file under:

`.ai/verification/YYYY-MM-DD-description.md`

only when the verification record has genuine lasting value.

Never mark a task, milestone, phase, or release verified without actual supporting checks.

---

# 10. Context-loading protocol

Always begin with minimum context.

Normal escalation order:

1. AGENTS.md and project index when orientation is needed.
2. Directly relevant task/source/tests.
3. Relevant project baseline document only when needed.
4. Relevant current decision only when needed.
5. Archived tasks/decisions only when historical context appears useful.

Do not load files merely because they exist.

The historical pointer section of the index exists specifically to help determine when archive retrieval may be useful.

After context compaction, assume previously loaded project context is no longer reliable and rebuild orientation from AGENTS.md and the index.

Repository files override conversational or compacted summaries when they conflict about file-backed facts.

---

# 11. Documentation update rules

Distinguish LIVE files from BASELINE files.

LIVE:

* `00-project-index.md`
* roadmap milestone/status information
* active tasks
* risks

BASELINE:

* project-plan
* requirements
* architecture
* workflows
* current decisions

Live state may change during normal work.

Baseline files change only when approved project truth changes.

Whenever an approved change modifies a baseline project document, update its `modified:` date in the same edit.

When implementation and baseline disagree unexpectedly, surface a deviation instead of silently updating either one.

---

# 12. Index integrity

Index maintenance is part of the operation that caused the change.

Examples:

Starting a meaningful task:

* create active task if needed;
* update index active-task pointer.

Completing a meaningful task:

* move it to archive;
* update/remove index active-task pointer;
* add a historical pointer only when future retrieval value exists.

Changing milestone/phase:

* update roadmap;
* update index.

Archiving an important decision:

* move decision;
* add historical pointer when justified.

Periodically reconcile the index against the actual repository state, especially:

* after a major phase;
* after several context compactions;
* after significant restructuring;
* whenever inconsistencies are suspected.

Reconciliation may fix navigation/state bookkeeping.

It must NOT silently resolve substantive disagreements between requirements, architecture, decisions, and implementation.

---

# 13. Initial bootstrap

After creating the structure:

If no project idea/plan has been provided yet:

* inspect enough of the repository to classify the project;
* initialize only the minimum project structure;
* do not invent missing requirements or architecture;
* stop after reporting the detected project situation and readiness for Planning & Evaluation.

If a project idea/plan is included in this prompt:

* use it as INITIAL INPUT, not automatically as an approved final specification;
* begin Planning & Evaluation immediately;
* challenge assumptions and evaluate feasibility;
* for existing projects, inspect implementation reality before recommending improvements;
* progressively create only the project documents that become necessary;
* do not begin substantial implementation until the baseline has been sufficiently defined and approved.

Keep all output, repository exploration, and documentation concise and proportional to the project.

13. Prompt B — New project Planning & Evaluation

Use this after Prompt A.

Before Planning & Evaluation, verify the repository operating system.

1. Read `AGENTS.md` and `.ai/00-project-index.md`.
2. If AGENTS.md is missing, incomplete, stale, or still uses older memory/local-AI rules, update it BEFORE continuing.
3. AGENTS.md must contain:
   - minimum-context-first loading and compaction recovery;
   - three project phases;
   - intended truth vs implementation truth and deviation handling;
   - live vs baseline documentation rules;
   - baseline `modified:` handling;
   - atomic decisions and task promotion/archive rules;
   - index maintenance/reconciliation;
   - task/milestone/release verification;
   - memory conciseness limits;
   - verify-before-claim and bounded-output rules;
   - `local_qwen_worker` bounded delegation rules;
   - independent verification of worker output;
   - instruction to continue without the worker if unavailable.
4. Ensure `.ai/` and the index exist; reconcile obvious navigation/state drift.
5. Check `codex mcp list`. Preserve existing project config. If `local_qwen_worker` is missing, use the known-working `C:\_AI_Engine` reference only if it can be inspected safely. Do not invent MCP configuration.

My initial project idea is:

[PASTE IDEA HERE]

Treat it as Planning & Evaluation input, not as a frozen specification.

Brainstorm with me and critically evaluate it before implementation.

Challenge weak assumptions, unrealistic requirements, unnecessary complexity, poor trade-offs, and maintenance/cost problems.

Progressively define only what is actually needed:
- project objective/problem;
- scope and exclusions;
- users/use cases;
- major capabilities;
- functional/non-functional requirements;
- workflows where useful;
- architecture where useful;
- material risks;
- roadmap, phases, milestones, dependencies;
- verification criteria.

Use `.ai/project/` as the evolving approved project baseline.

Create additional project documents only when the information becomes substantial enough to justify them.

Record important approved decisions atomically under `.ai/decisions/current/`.

Maintain `.ai/00-project-index.md` as live orientation.

Use `local_qwen_worker` only for bounded support work where all needed context is supplied explicitly. It may propose, summarize, transform, or draft, but it must not establish project truth, requirements, architecture, durable memory, or final decisions. Codex must independently review its output.

Do not invent unanswered product decisions merely to complete documentation.

Do not begin substantial Execution until the intended baseline is sufficiently defined and approved.
14. Prompt C — New project combined bootstrap + idea

Use this when you already have the initial idea and want one first prompt.

You are the primary coding and project agent for this new repository.

Before implementation, bootstrap BOTH the project-memory system and the local-AI operating policy, then perform Planning & Evaluation.

FIRST:

1. Inspect the repository root and existing instructions/configuration.
2. Create or update `AGENTS.md`.
3. Create/initialize `.ai/`.
4. Check/configure the optional project-scoped `local_qwen_worker` MCP integration without inventing configuration.
5. Then evaluate my project idea.

CREATE/MAINTAIN:

AGENTS.md

.ai/
  00-project-index.md
  project/
    project-plan.md
    roadmap.md
  decisions/
    current/
    archive/
  tasks/
    active/
    archive/
  verification/

Create requirements.md, architecture.md, workflows.md, and risks.md only when genuinely needed.

AGENTS.md must remain concise and permanently teach future Codex sessions HOW TO USE THE MEMORY AND LOCAL WORKER.

AGENTS.md must include:

MEMORY
- index-first orientation;
- minimum-context-first loading and escalation;
- no unnecessary rereads before compaction;
- post-compaction recovery from AGENTS + index;
- three phases: Planning & Evaluation -> Execution -> Testing & Bug Fixing;
- intended truth vs implementation truth;
- deviation surfacing;
- live vs baseline files;
- baseline `modified:` updates;
- atomic decision files;
- task creation/promotion/archive rules;
- index maintenance and periodic reconciliation;
- task/milestone/release verification;
- memory size discipline.

WORKING RULES
- one task at a time;
- no unapproved scope/requirements/architecture/product changes;
- no unrelated refactoring;
- verify before claiming;
- never claim checks passed unless actually run;
- bounded searches/logs/diffs/test output;
- protect secrets/credentials/production/deployment/DNS/SSL/payment/session/token settings.

LOCAL AI
- optional worker is `local_qwen_worker` using `delegate_task`;
- local engine is external/user-managed and must not be auto-started/stopped/reconfigured;
- delegate only bounded context-complete tasks likely to save Codex work;
- suitable: small code drafts, boilerplate, transformations, candidate tests, bounded summaries, small supplied snippet/diff reviews;
- never delegate repository truth, scope/requirements/architecture, durable memory, security/destructive decisions, or final verification;
- treat output as a draft and independently verify it;
- if unavailable, continue without it.

LOCAL WORKER SETUP
- check `codex mcp list`;
- preserve existing `.codex/config.toml`;
- if the worker is missing, inspect `C:\_AI_Engine\.codex\config.toml` and `C:\_AI_Engine\how-to.md` if accessible;
- add only the equivalent known-working project-scoped entry;
- never invent MCP values;
- verify with `codex mcp list`.

My initial project idea is:

[PASTE IDEA HERE]

Treat it as Planning & Evaluation input, not as an approved final specification.

Brainstorm, challenge assumptions, evaluate feasibility and alternatives, and progressively establish:
- project plan;
- scope/exclusions;
- requirements;
- workflows where useful;
- architecture where useful;
- risks;
- roadmap/milestones/dependencies;
- verification criteria.

Use the `.ai/` rules while doing this.

Do not create documents merely to fill the structure.

Do not begin substantial Execution until the baseline is sufficiently defined and approved.

At the end report:
- AGENTS.md status;
- memory structure status;
- local worker MCP status;
- Planning & Evaluation status;
- unresolved decisions blocking baseline approval.
15. Prompt D — Existing/incomplete/upgrade project bootstrap

Use this as the first prompt for a repository that already contains code.

You are taking over an existing software repository that may be incomplete, actively under development, abandoned/resumed, or functional but needing upgrades.

Your first task is NOT implementation.

Your first task is to establish implementation reality, reconstruct/migrate reliable project memory, and install the permanent AGENTS.md operating policy including local-AI delegation.

BEFORE CHANGING PRODUCT CODE:

1. Inspect the repository root.
2. Read any existing `AGENTS.md`.
3. Inspect existing `.ai/`, project docs, `.codex/config.toml`, and relevant repository instructions.
4. Preserve useful project-specific protections and knowledge.
5. Review source/config/schema/tests selectively.
6. Establish current stack, major modules, architecture, workflows, build/test condition, implemented capabilities, unfinished work, and relevant technical debt.
7. Distinguish:
   - VERIFIED CURRENT IMPLEMENTATION
   - DOCUMENTED INTENT
   - INFERENCE
   - UNKNOWN
8. Do not infer intentional requirements/architecture merely from code.

CREATE OR MIGRATE TO:

AGENTS.md

.ai/
  00-project-index.md
  project/
    project-plan.md
    roadmap.md
  decisions/
    current/
    archive/
  tasks/
    active/
    archive/
  verification/

Create requirements.md, architecture.md, workflows.md, and risks.md only when supported and useful.

AGENTS.md MUST BE CREATED/UPDATED BEFORE THIS REVIEW IS COMPLETE.

Preserve useful existing AGENTS rules, but merge/update it so future Codex sessions contain:

MEMORY / PROJECT MANAGEMENT
- orient from `.ai/00-project-index.md`;
- minimum-context-first loading;
- no unnecessary rereads before compaction;
- after compaction, re-read AGENTS + index and reload only relevant context;
- Planning & Evaluation -> Execution -> Testing & Bug Fixing;
- intended truth = current user instruction -> approved baseline -> current decisions;
- implementation truth = source/config/schema -> tests -> observed behaviour;
- deviations are surfaced, never silently reconciled;
- live vs baseline files;
- baseline `modified:` updates;
- atomic decisions;
- meaningful task creation/promotion/archive;
- index maintenance + historical pointers + periodic reconciliation;
- task/milestone/release verification;
- memory size discipline.

WORKING RULES
- one task at a time;
- no unapproved scope/requirements/architecture/product changes;
- no unrelated refactoring;
- verify file-backed facts before claiming;
- never claim tests/build/checks passed unless actually run;
- bounded searches/logs/diffs/test output;
- protect secrets, credentials, production data, deployment, DNS, SSL, payments, account/session/token settings.

LOCAL AI
- optional MCP worker `local_qwen_worker`, call `delegate_task`;
- engine is external/user-managed; do not auto-start/stop/reconfigure it;
- delegate only bounded context-complete tasks likely to save Codex work;
- suitable: small code drafts, boilerplate, transformations, candidate tests, bounded summaries, small supplied snippet/diff reviews;
- never delegate repository truth, project scope/requirements/architecture, durable `.ai/` memory, security/destructive decisions, or verification;
- worker output is an untrusted draft; Codex independently reviews and validates it;
- if unavailable, continue normally.

LOCAL WORKER SETUP
- check `codex mcp list`;
- preserve existing `.codex/config.toml`;
- if `local_qwen_worker` is missing and `C:\_AI_Engine` is accessible, inspect `C:\_AI_Engine\.codex\config.toml` and `C:\_AI_Engine\how-to.md`;
- add only the equivalent known-working project-scoped entry;
- never invent values;
- verify registration;
- do not start/stop the model server automatically.

OLD MEMORY MIGRATION
If an older memory system exists, migrate only durable useful knowledge:
- product/project brief -> project-plan;
- implementation plan/task board -> roadmap + meaningful active tasks;
- requirements -> requirements;
- architecture -> architecture;
- workflows -> workflows;
- important decisions -> atomic current/archive decisions;
- active cross-cutting risks -> risks;
- useful debugging/review history -> archived tasks or verification;
- improvement ideas -> Planning & Evaluation input, not approved requirements.

Do not preserve redundant noise merely because it exists.

Where safe, verify install/dev/build/test/lint commands and record actual results only.

Do not perform destructive, production-facing, deployment, credential-dependent, migration, DNS, SSL, payment, or external-system actions without explicit authorization.

If the review becomes substantial, create:
`.ai/tasks/active/YYYY-MM-DD-existing-project-review.md`

Build/update the index with:
- current review phase;
- active review task;
- document map;
- important current decisions/risks;
- only high-value historical pointers.

Do not implement upgrades during this bootstrap/review.

Finish by reporting:
- AGENTS.md created/updated and key preserved repository-specific rules;
- `.ai/` migration/creation status;
- `local_qwen_worker` registration status;
- verified current implementation state;
- checks actually performed;
- important baseline-vs-implementation deviations;
- important unknowns;
- recommended Planning & Evaluation topics.

Then use Prompt E.

16. Prompt E — Existing project improvement/completion Planning & Evaluation

Use after Prompt D.

Before evaluating improvements, verify the project operating system is current.

1. Read `AGENTS.md` and `.ai/00-project-index.md`.
2. If AGENTS.md is missing or does not contain the current memory + local-AI policy, update it FIRST.
3. AGENTS.md must contain:
   - minimum-context-first loading and compaction recovery;
   - three project phases;
   - intended truth vs implementation truth and deviation handling;
   - live vs baseline documentation rules;
   - baseline `modified:` handling;
   - atomic decision/task rules;
   - task promotion/archive and index maintenance/reconciliation;
   - task/milestone/release verification;
   - bounded output + verify-before-claim;
   - `local_qwen_worker` bounded delegation and independent-verification rules.
4. Reconcile obvious index/task/roadmap drift.
5. Confirm the current review baseline and implementation reality.
6. Check `local_qwen_worker` registration with `codex mcp list`; preserve existing config. If missing, use the verified `C:\_AI_Engine` reference only if accessible. Do not invent configuration.
7. Do not let the local worker establish project truth or make final decisions.

Here are my ideas for improving or completing this project:

[PASTE IDEAS HERE]

Treat them as Planning & Evaluation input, not as approved requirements.

Critically compare them against the verified existing implementation.

For each material proposal, classify it where useful as:
- retain existing approach;
- worthwhile improvement;
- necessary correction;
- optional enhancement;
- unnecessary complexity;
- risky;
- unrealistic;
- requires more information.

Identify:
- what already works and should remain;
- what is incomplete;
- what is genuinely problematic;
- migration/regression impact;
- realistic target requirements;
- target architecture/workflows where needed;
- major risks;
- roadmap/milestones/dependencies;
- verification/regression criteria.

Use the memory system while planning:
- update/create project baseline docs only as the intended target becomes established;
- record important approved decisions atomically;
- create/promote an active task if this evaluation becomes complex or survives compaction;
- keep the index current;
- do not duplicate repository facts that are cheap to rediscover.

Use `local_qwen_worker` only for bounded support tasks such as comparing supplied options, summarizing bounded snippets, drafting small candidate code/test structures, or repetitive transformations. Codex must independently evaluate its output.

Do not begin substantial Execution merely because an implementation path looks obvious.

First establish and approve the coherent target baseline.

Before finishing Planning & Evaluation, ensure we can answer:
- What is changing?
- Why?
- What stays unchanged?
- What is in/out of scope?
- What requirements define the target?
- What architecture/workflows are intended?
- What migration/regression risks exist?
- What roadmap/milestones will execution follow?
- How will each meaningful milestone/phase be verified?
17. Normal task prefix

For long-running Codex sessions:

Follow AGENTS.md and `.ai/00-project-index.md`. Start with minimum context and work only this task:

[TASK]

Codex should use local_qwen_worker automatically only when AGENTS.md says delegation is appropriate and worthwhile.

18. After context compaction
Context was compacted. Re-read AGENTS.md and `.ai/00-project-index.md`, then restore only the context needed for this task:

[TASK / CONTINUE CURRENT TASK]

After compaction, treat earlier loaded project-file context as unreliable.

19. Optional — force bounded local delegation for a task
Follow AGENTS.md and `.ai/00-project-index.md`.

For this task, use `local_qwen_worker` for suitable bounded sub-tasks only. Supply it all required context explicitly. Codex remains responsible for repository truth, planning, final implementation, and verification.

[TASK]
20. Practical operating rule

The system has four separate roles:

Project baseline docs      = approved intended truth
Source/tests/config/schema = current implementation truth
.ai decisions/tasks        = durable rationale and expensive-to-reconstruct working context
local_qwen_worker          = bounded draft/execution helper

Codex is the orchestrator.

The local worker does not own memory.

The memory does not override implementation reality.

Implementation reality does not silently rewrite approved intent.