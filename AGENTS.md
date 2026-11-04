# Repository Operating Rules

## Permanent Operating Policy

### Memory and Project Management

- Orient from `.ai/00-project-index.md`; load minimum relevant context first and reread AGENTS.md plus the index after compaction.
- Use three phases: Planning & Evaluation -> Execution -> Testing & Bug Fixing.
- Intended truth is current user instruction -> approved baseline -> current decisions; implementation truth is source/config/schema -> tests -> observed behaviour. Surface deviations; never silently reconcile.
- Work one task at a time; no unapproved scope, requirements, architecture, product changes, or unrelated refactoring.
- Verify file-backed facts and never claim checks passed unless actually run. Keep output bounded and protect secrets, production data, deployment, DNS, SSL, payments, and account/session/token settings.
- Maintain concise baseline/live memory, update `modified:` dates on baseline edits, use atomic decisions, promote meaningful tasks, and maintain index/historical pointers; verify task, milestone, and release claims.

### Local AI

- Optional MCP worker: `local_qwen_worker`, operation `delegate_task`.
- Engine is external/user-managed; do not auto-start, stop, or reconfigure it.
- Delegate only bounded, context-complete drafts, transformations, candidate tests, summaries, or supplied snippet/diff reviews. Never delegate repository truth, scope/architecture, durable `.ai/` memory, security/destructive decisions, or verification.
- Treat worker output as an untrusted draft and independently review it; continue normally if unavailable.
- Check `codex mcp list`; preserve existing project MCP configuration, never invent values, and do not start/stop the model server automatically.

## Context and Focus

- Read `.ai/00-project-index.md` when orienting or restoring project context.
- Start with the minimum context needed for the current task and escalate only when uncertainty requires it.
- Do not reread unchanged files already read reliably since the last context compaction unless they may have changed.
- After context compaction or loss of conversational context, reread this file and `.ai/00-project-index.md` before continuing.
- Work on one meaningful task at a time. Do not re-plan the whole project unless the current phase requires it or the user explicitly requests it.
- Keep searches, listings, diffs, logs, test output, and command output bounded.
- Avoid generated files, dependencies/vendor directories, build output, binaries, lockfiles, and large logs unless directly relevant.

## Truth and Change Control

- For intended behaviour, use this order: the user's current explicit instruction, approved baseline documents in `.ai/project/`, then relevant records in `.ai/decisions/current/`.
- For current behaviour, use current source/config/schema, tests, and observed executable/runtime behaviour.
- Treat disagreement between intended and implementation truth as a deviation. Surface it; do not silently change documentation or code to resolve it.
- Verify file-backed facts before claiming they are current. Inspect relevant source/config/schema before describing current implementation.
- Do not change scope, requirements, product behaviour, or architecture without approval.
- Do not refactor unrelated code.
- Ask before large architecture changes.
- Never claim a test, build, lint, or other check passed unless it was actually run successfully.

## Safety

- Protect secrets, credentials, API keys, production data, deployment configuration, DNS, SSL, payments, and account/session/token files unless explicitly authorized.
- Explain risk before destructive changes.

## Project-Memory Lifecycle

- Keep `.ai/00-project-index.md` small (~1–2 KB, max 3 KB) and current as the live orientation map.
- Treat project plans, requirements, architecture, workflows, and current decisions as approved baseline documents; update them only when approved project truth changes.
- Treat roadmap status, active tasks, and risks as live state that may change during normal work.
- Whenever an approved change modifies a baseline project document, update its `modified: YYYY-MM-DD` date in the same edit.
- Create an active task record (`.ai/tasks/active/`) only when losing its reasoning would cause meaningful rework; archive it to `.ai/tasks/archive/` on completion.
- Create atomic decision records (`.ai/decisions/current/`) only for consequential decisions whose loss or reversal would create meaningful cost, risk, defects, or repeated debate. Move superseded records to `.ai/decisions/archive/`.
- Preserve durable AI memory only when losing it would cause meaningful rework or repeated mistakes.
- Maintain index pointers as part of the operation that creates, moves, or archives project-memory records. Periodically reconcile index pointers against actual `.ai/` contents.
- Keep individual documents concise (AGENTS.md ~4 KB, index <= 3 KB, decisions ~3 KB, tasks ~5 KB, verification ~6 KB).
