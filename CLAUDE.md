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

## Context Is The Only Scarce Resource

Every byte that enters the main session stays in the main session for its entire lifetime. File contents, command output, search results, page text — once read, it lingers in cache and shapes every downstream token. There is no "just looking."

**All exploration runs in subagents.** Investigations, audits, deep dives, surveys, "let me check," "let me find" — if the purpose of a tool sequence is to find out something you don't yet know, it runs in a subagent. Renaming the activity does not change what it is. The subagent returns a distilled summary; the raw output stays in the subagent.

The main session holds only the durable artifacts you are producing: the edit, the commit, the doc update.

**Subagent model tiers:**
- Opus — design, architecture, any subagent that itself spawns subagents.
- Sonnet — implementation, mechanical multi-file work, default exploration.

Use Opus for exploration only when the search requires architectural judgment, not lookup.

## Durability

Subagent reports, mid-session realizations, "I'll remember this" — none of these outlast the session. Anything worth keeping goes into CLAUDE.md, code, docs, or a commit. If it isn't written down, it is gone.

**Commit completed work immediately.** After tests pass, commit. After each phase of a multi-phase plan, commit. Uncommitted work is lost work, and accumulated uncommitted phases lose isolation as well.

**Docs change in the same commit as the code.** New pages enter the sidebar in that commit. There is no follow-up.

## Authenticity

When asked to analyze X, read X. Do not synthesize from conversation memory, prior summaries, or what the file probably says. Claims must correspond to evidence produced this session.

**Something unexpected is a signal.** Surprising output, anomalous numbers, a file containing what it shouldn't — stop and find out why. Do not accept the anomaly and proceed.

## Discipline

Corrections from the user are conversation, not material for new rules. A single correction does not warrant a CLAUDE.md edit. Rules are added when a failure mode is observed repeatedly and the rule names the failure it prevents.

Do not announce actions ("I will now…"). Act.

## Commit Convention

Conventional commits: `type(scope): message`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

## Hard Constraints

- No `--no-verify`. Fix the issue or fix the hook.
- No interactive git (`git add -p`, `git add -i`, `git rebase -i`) — these block on stdin and hang.
- No assuming a tool is missing without checking `nix develop`.
