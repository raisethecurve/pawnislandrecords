# Pawn Island Records GitHub Practices

Status date: 2026-05-04

This document defines the GitHub workflow for Pawn Island Records. It is tuned for this repo's current shape: a static, data-driven website with a public launch mode, hidden-but-shareable routes, local validation scripts, and sprint closeout docs.

Use `WORKFLOW.md` for sprint planning and closeout history. Use this file for branch, commit, stacked branch, staged PR, review, and merge behavior.

## Operating Rule

Ship through small draft PRs on stacked branches. Each slice should move through explicit stages:

1. Scope.
2. Implementation.
3. Local validation.
4. Documentation closeout.
5. Ready review.
6. Merge and follow-up.

A PR is not ready just because the code works. For this project, a PR is ready only when route classification, launch-mode behavior, validation results, docs, and stack position are aligned.

## Branch Rules

- Start the bottom branch from `main`.
- Start follow-up branches from the previous branch in the stack.
- Use the `codex/` branch prefix by default.
- Name branches by sprint and intent, for example `codex/sprint-1-catalog-route` or `codex/sprint-2-merch-decision`.
- Keep one sprint story or tightly related slice per branch.
- Do not mix generated cleanup, content changes, route behavior, and design overhaul in one PR unless the story truly requires it.
- Never reset, checkout, or overwrite unrelated user work to clean up a branch.
- If the worktree is already dirty, identify which files belong to the current change before staging.
- Set each stacked PR's base branch to its parent branch, not `main`, until the parent merges.

Recommended branch types:

- `codex/sprint-N-topic`: normal implementation slice.
- `codex/docs-topic`: documentation-only change.
- `codex/chore-topic`: maintenance or generated-artifact cleanup.
- `codex/hotfix-topic`: narrow production fix.

## Stacked Branch Model

Use stacked branches when the work is larger than one clean review but should still land as a coherent sequence. In this project, stacked branches are the expected shape for multi-slice sprint work.

Use one branch and one draft PR only when:

- The change fits one review context.
- The diff can be understood in one sitting.
- Validation can be run end to end on the branch.
- There is no need for another branch to depend on it.

Use stacked branches when:

- A foundational change unlocks later work.
- Review would be easier if data, route behavior, styling, and docs are separated.
- A risky migration can be merged in safe layers.
- The first PR can stand on its own if later PRs are delayed.

Example stacked sequence for Sprint 1:

1. `codex/s1-01-route-preview`: route preview gate and validation updates, based on `main`.
2. `codex/s1-02-catalog-artists`: catalog and artist routes, based on `codex/s1-01-route-preview`.
3. `codex/s1-03-release-pages`: release route and CTA normalization, based on `codex/s1-02-catalog-artists`.
4. `codex/s1-04-press-epks`: press/EPK routes and metadata, based on `codex/s1-03-release-pages`.
5. `codex/s1-05-closeout-docs`: sprint closeout docs, based on the final implementation branch if not already included there.

For stacked branches:

- Open each PR against its parent branch.
- State the stack order in every PR body.
- Keep each PR independently explainable.
- Merge from the bottom of the stack upward.
- Rebase child branches after parent PRs merge.
- Avoid changing the same files in multiple open PRs unless the dependency is explicit.

When the bottom PR merges:

1. Rebase the next branch onto the merged target.
2. Change the next PR base to `main` if it is now the bottom of the stack.
3. Resolve conflicts in the child branch without undoing already-merged parent work.
4. Repeat upward until the stack is merged.

## Local Staging Discipline

Before staging:

```sh
git status --short --branch
git diff --stat
git diff
```

Stage intentionally:

```sh
git add -p
git status --short
```

Use full-file staging only when the file is wholly part of the change. Prefer patch staging when a file contains mixed user edits, generated output, or opportunistic fixes.

Do not stage by habit:

- `node_modules/`
- `test-results/`
- Playwright reports or browser blobs.
- Browser profile artifacts under `tmp/`.
- Local notes such as `agent.md`.
- Placeholder downloads unless the story explicitly covers them.

Generated or legacy artifacts in `tmp/` should be handled in a dedicated maintenance PR, not mixed into feature work.

## Commit Practices

Make commits that tell the story of the PR:

- Keep commits reviewable and coherent.
- Use imperative subject lines, for example `Add route inventory validation`.
- Prefer one commit per logical slice, not one commit per tool run.
- Do not hide unrelated fixes inside a broad commit.
- Include docs updates in the same PR when they are required by the change.

Good commit examples:

- `Document stacked branch workflow`
- `Add catalog route smoke coverage`
- `Normalize release CTA selection`
- `Update sprint closeout notes`

Avoid vague subjects:

- `updates`
- `fix stuff`
- `wip`
- `final`

## Draft PR First

Open PRs as draft unless the user explicitly asks for ready review.

Draft PRs are useful here because many changes need visual review, route checks, and documentation closeout before they are ready. A draft PR should still have enough context for someone to understand the direction.

Move a PR from draft to ready only after:

- Scope matches the PR description.
- `npm run test:links` passes, or the failure is documented.
- `npm run test:smoke` passes for UI/route changes, or the gap is documented.
- Direct page and shell behavior are checked when navigation changes.
- Screenshots or manual notes are attached for visible UI changes.
- `WORKFLOW.md` is updated when sprint state changes.
- `README.md`, `ROADMAP.md`, `ROUTE_INVENTORY.md`, or this file are updated when their source of truth changes.

## PR Size And Split Guidelines

Prefer a split when the PR touches more than one risk area:

- Public launch behavior and admin tooling.
- Data model and large CSS changes.
- Route classification and visual redesign.
- Generated cleanup and feature changes.
- Metadata/indexability and unrelated layout work.

Keep together when splitting would make review misleading:

- A route behavior change and its smoke test.
- A data validation rule and the data cleanup needed to pass it.
- A page component and the CSS required for it to render correctly.
- A workflow change and the docs explaining it.

## PR Body Template

Use this structure for most PRs:

```md
## Summary
- What changed.
- Why it changed.

## Stack
- Base branch:
- Parent PR:
- Child PR:
- Merge order:

## Scope
- Routes/files/data touched.
- What is intentionally out of scope.

## Validation
- [ ] npm run test:links
- [ ] npm run test:smoke
- [ ] Manual desktop review
- [ ] Manual mobile review
- [ ] Shell navigation review, if relevant

## Launch And Indexing
- launchMode impact:
- robots/sitemap impact:
- admin/internal exposure risk:

## Screenshots Or Notes
- Add links, uploaded images, or a short note.

## Follow-Up
- Deferred work or known risks.
```

For documentation-only PRs, use a smaller version:

```md
## Summary
- What was documented.

## Validation
- Docs reviewed locally.
- npm run test:links, if route/link behavior could be affected.

## Follow-Up
- Any decisions still open.
```

## Project-Specific Review Checklist

Every PR:

- Scope is clear and small enough to review.
- No unrelated user changes were reverted or staged.
- Docs are updated if behavior, commands, architecture, or roadmap changed.
- Local validation result is included.

Public route PRs:

- Direct page entry works with `standalone=1`.
- Shell-framed navigation still works when relevant.
- Page title and meta description are correct.
- Robots state matches route classification.
- No hidden/admin/internal surface appears in public navigation.
- Links, image paths, embeds, and query parameters are valid.
- Mobile and desktop layouts are reviewed.

Data PRs:

- Artist and release slugs are unique.
- Release artist references exist.
- Live releases have at least one useful listen action.
- Upcoming releases have clear status/date and campaign or pre-save path.
- Empty merch URLs do not behave like active purchase links.

Design PRs:

- Text does not overlap or overflow at common mobile and desktop widths.
- Focus states and keyboard navigation remain visible.
- Reduced-motion behavior is preserved or improved.
- New styles fit the modern public stack unless the route is intentionally internal/lab.

Admin/internal PRs:

- `admin.html` remains `noindex,nofollow`.
- Internal tools are not added to public navigation.
- Local-only workflows are documented without exposing private assumptions.

## Required Validation

Run before ready review:

```sh
npm run test:links
```

Run for route, shell, layout, metadata, or UI changes:

```sh
npm run test:smoke
```

Run for broad changes:

```sh
npm test
```

If a check cannot be run, the PR body must say:

- Which check was skipped.
- Why it was skipped.
- What manual review was done instead.
- What risk remains.

## Documentation Closeout

Before a sprint PR is ready:

- Update `WORKFLOW.md` with completed stories, validation, deferred work, risks, and next recommendation.
- Update `ROADMAP.md` if priorities, milestones, decisions, or risk posture changed.
- Update `ROUTE_INVENTORY.md` and `tools/routes.js` together when route classification changes.
- Update `README.md` when commands, setup, route overview, or publishing behavior changes.
- Update `GITHUB_PRACTICES.md` when the collaboration workflow changes.

Documentation-only changes still deserve review, but they do not need smoke tests unless they change links, route lists, or commands.

## Merge Rules

Merge only when:

- The PR is no longer draft.
- Review comments are resolved or intentionally deferred.
- Required validation is recorded.
- The branch is current enough that merge risk is low.
- The branch is the bottom of the stack or the stack owner has confirmed the merge order.

After merge:

- Delete the branch only after no open child branch still uses it as a base.
- Rebase child branches onto the new base.
- Update child PR base branches as the stack advances.
- Confirm the next sprint recommendation still makes sense.

## Emergency Fixes

Use a narrow hotfix branch when the production site has a broken route, broken asset, exposed internal page, or bad metadata/indexing state.

Hotfix rules:

- Keep the fix minimal.
- Run `npm run test:links`.
- Run targeted browser checks for the affected route.
- Backfill `WORKFLOW.md` or a follow-up issue if the hotfix skips normal sprint closeout.
- Do not combine emergency fixes with unrelated cleanup.

## Anti-Patterns

Avoid:

- Opening a ready PR before validation and docs closeout.
- Mixing public launch changes with internal lab cleanup.
- Changing `label.launchMode` to `full` before launch gates pass.
- Adding a route to navigation without updating route inventory, metadata, robots, and validation.
- Updating sitemap or robots without checking page-level meta tags.
- Pointing every stacked PR at `main` and making review diffs unreadable.
- Staging all changed files when the worktree contains unrelated edits.
- Treating generated screenshots or reports as source files unless a visual-baseline decision has been made.
