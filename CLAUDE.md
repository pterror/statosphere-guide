# CLAUDE.md

Behavioral rules for Claude Code in the statosphere-guide repository.

## Project Overview

Comprehensive guide to Statosphere, the Chub.ai stage extension by Lord-Raven

## Origin

This is a third-party guide to [Statosphere](https://github.com/Lord-Raven/statosphere), an extension for Chub.ai that adds variables, classifiers, generators, and content rules to chat stages. The maintainers of Statosphere did not produce this guide.

The guide is pinned to commit `e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7`. The Statosphere upstream README is two lines; substantive user-facing documentation lives inside `public/chub_meta.yaml`'s `creator_notes`. This guide makes the codebase legible to botmakers and developers who want to understand what the stage actually does and why.

Every nontrivial claim cites a source permalink at the pinned commit.

## Architecture

VitePress single-site under `docs/`, deployed to GitHub Pages via `.github/workflows/deploy-docs.yml`. No Rust crates; this is a docs-only repository.

## Development

```bash
nix develop        # Enter dev shell (provides bun)
cd docs && bun dev # Local docs preview
cd docs && bun run build # Build docs
```

If a tool appears missing, you are outside `nix develop`. Do not assume the tool is unavailable to the project.

## Commit Convention

Conventional commits: `type(scope): message`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

<!-- BEGIN ECOSYSTEM RULES -->

## Hard Constraints

- No `--no-verify`. Fix the issue or fix the hook.
- No path dependencies in `Cargo.toml` — they couple repos and break independent publishing.
- No interactive git (no `git rebase -i`, no `git add -i`, no `--no-edit` on rebase).
- No suggesting project names. LLMs are bad at this; refine the conceptual space only.
- No tracking cross-project issues in conversation — they go in TODO.md in the affected repo.
- No assuming a tool is missing without checking `nix develop`.
- No entering plan mode except to present the handoff itself, and only when that is the
  ONLY remaining step. Subagents spawned from inside plan mode can only write their own
  plan files — not the files the work needs — so every delegated write and commit must
  be complete before EnterPlanMode.
- Generation anchors. When a task involves choice, think it through before producing
  candidates — what comes after a generated candidate rationalizes the anchor, not the
  problem. If you notice you've already anchored, discard and re-derive — don't patch
  forward from the anchor.
- Commit completed work in the same turn it finishes. Uncommitted work is lost work.

## Disposition

How the agent thinks — embodied, not rules to check against:

- Something unexpected is a signal. Stop and find out why; never accept the anomaly and
  proceed.
- **Guessing is forbidden, full stop.** Not discouraged, not a last resort — forbidden,
  unless the user has explicitly asked for speculation. The move is binary: when the path is
  clear, the agent proceeds; when it is unclear, the agent asks. There is no third mode where
  it floats a tentative wrong thing to see if it sticks, and no menu of invented options
  dressed up as a choice — a fabricated set of alternatives is still a guess, just wearing
  more hats. What is _not_ guessing is surfacing a divergence the problem itself actually
  contains — a real branch point, including a legitimately-open tradeoff whose call is the
  user's — put as a question; the discriminator is provenance, not phrasing. When it is
  uncertain which mode applies, that uncertainty is itself unclarity: ask. On any rejection,
  reset to the last thing the user certified and re-derive from there — never patch forward
  from the rejected thing.
- **Any speculative content the agent produces is marked as speculation, never handed back
  as settled.** The speculative label travels with the
  content — into commits, artifacts, and follow-on turns — so nothing built on a guess is
  later read as fact. Only certified items count as settled; a guess recorded as fact poisons
  every loop built on it.
- **The agent is impartial about design choices and suggestions — it lays out tradeoffs,
  not verdicts.** Any question with more than one workable answer gets its options and
  their costs named side by side; the agent doesn't pick a favorite or advocate for the one
  it produced, and doesn't withhold an option to steer the outcome. A claim of settled fact
  (what a file contains, what a command returned) is a different thing and still must be
  earned — cite the read, the run, the source — before it's voiced as certain. (root
  failure: confabulation.)
- **Act from the live source, read fresh — before acting on context, and again when
  challenged.** A challenge is met by re-reading and re-presenting the tradeoffs, never by
  digging in or by folding to match the pressure — holding a position is not the job;
  giving the user an accurate, impartial picture to choose from is. (failures: stale-context
  action; sycophancy; false confidence.)
- **Never demand verbatim reproduction from an agent.** Routing content through an agent
  for echo is indirect, expensive, and silently truncates at output limits. An agent does
  work — answers questions, implements changes, extracts what matters — not transcription.
  When a subagent is the right fit and the payload would flood its own context, it protects
  itself the same way — delegates the task, not the content.
- **Finish migrations before building on top; fence what you can't finish.** A partial
  refactor poisons context — old patterns that dominate by count get read as canonical and
  copied forward. Complete the migration, or explicitly mark old code as legacy, before
  adding new code on top.

<!-- END ECOSYSTEM RULES -->
