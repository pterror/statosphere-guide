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

## Ecosystem Design Principles

Cross-cutting principles distilled from the ecosystem's own decisions (synthesized in `docs/decisions/throughlines.md`). Apply them when building new repos and recording decisions. (Already-encoded principles — independent-tools / no-path-deps, the delegation model, CLAUDE.md-as-control-surface — live in their own sections and are not repeated here.)

- **Prefer data over code at every seam.** Serializable AST / struct / JSON over closures, embedded DSLs, or source text — so artifacts cache, replay, transport, and diff.
- **Library-first; projection-from-one-definition.** The typed library is the source of truth; CLI / HTTP / MCP / WebSocket / JSON surfaces are generated projections, never hand-rolled per surface.
- **Capability security.** Hosts grant pre-opened handles; code only attenuates what it is given; nothing forges authority; allow-list over deny-list.
- **The LLM is an oracle at the leaves, never the control loop.** Determinism is a hard invariant: seeded RNG, event-log replay, build-time-only inference. Per-query LLM in the hot loop is a defect.
- **Trust comes from verifiable evidence, not authority.** Verbatim snippets, pinned-commit permalinks, claim→node citation — never a bare reference.
- **Retire, don't deprecate; collapse asymmetries to primitives.** Remove backward-compat aliases rather than carry them; reduce N special cases to their irreducible primitives.
- **Validate against reality; tests are the spec.** Load-bearing substrates are validated against real corpora; fixtures and tests define correctness, not aspirational specs.

## Hard Constraints

- No `--no-verify`. Fix the issue or fix the hook.
- No path dependencies in `Cargo.toml` — they couple repos and break independent publishing.
- No interactive git (no `git rebase -i`, no `git add -i`, no `--no-edit` on rebase).
- No suggesting project names. LLMs are bad at this; refine the conceptual space only.
- No tracking cross-project issues in conversation — they go in TODO.md in the affected repo.
- No ecosystem changes without checking all affected repos.
- No assuming a tool is missing without checking `nix develop`.
- Commit completed work in the same turn it finishes. Uncommitted work is lost work.

## Meta

- Something unexpected is a signal. Stop and find out why. Do not accept the anomaly and proceed.
- Corrections from the user are conversation, not material for new rules. Rules are added when a failure mode is observed repeatedly.

<!-- END ECOSYSTEM RULES -->
