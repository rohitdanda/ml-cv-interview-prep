# Phase 1D report — quiz bank, scheduling, and behavioral prompt data

## Delivered

- Added the scoped `linear-algebra-basics` and `statistics-inference` quizzes.
- Expanded `rapid-fire-readiness` from 10 to 20 senior ML/CV judgment questions while preserving `kind: 'rapid-fire'`.
- Preserved `modern-cv-judgment` and added it to `w10-theory-cert` alongside readiness.
- Repointed the linear-algebra and statistics quiz tasks to their scoped banks.
- Made all 12 quiz-backed task descriptions state the exact number of referenced questions.
- Enriched all ten behavioral prompts with the locked stable IDs and the required follow-ups, senior signals, model outline, and rubric schema.
- Added targeted curriculum assertions for quiz identity, answer validity, counts, scheduling, copy accuracy, and behavioral prompt shape.

## TDD evidence

### RED

Command:

```sh
bun test tests/curriculum.test.js
```

Observed before production edits: **13 pass, 4 fail**. The failures were the intended missing-contract failures:

1. `linear-algebra-basics` did not exist.
2. Behavioral prompt IDs were absent.
3. `w1-linear-quiz` still referenced `foundation-core-1`.
4. Quiz-backed task descriptions did not state their referenced question counts.

### GREEN

Command, run against a temporary materialization of the staged Phase 1D index so concurrent Phase 1C worktree edits were excluded:

```sh
git checkout-index --all --prefix=/tmp/phase1d-index.GbjmBB/
(cd /tmp/phase1d-index.GbjmBB && bun test tests/curriculum.test.js)
```

Observed after implementation: **17 pass, 0 fail; 5,098 assertions**. A working-tree name-filter run also reported **4 pass, 0 fail; 905 assertions** for the four Phase 1D-specific tests while Phase 1C was in progress.

The project-wide suite was intentionally not run, per the Phase 1D brief.

## Quiz inventory

| Quiz ID | Questions |
| --- | ---: |
| `foundation-core-1` | 10 |
| `task-loss-metric` | 10 |
| `linear-algebra-basics` | 8 |
| `statistics-inference` | 8 |
| `rapid-fire-readiness` | 20 |
| `modern-cv-judgment` | 10 |

The final theory certification references `rapid-fire-readiness` plus `modern-cv-judgment`, so its task copy states **30 questions**.

## Files changed

- `quizzes.js` — two scoped banks and ten additional rapid-fire questions.
- `curriculum.js` — quiz-only stage references and exact count copy.
- `notes.js` — ten enriched behavioral prompt records.
- `tests/curriculum.test.js` — Phase 1D contract and scheduling assertions.
- `.superpowers/sdd/phase-1d-report.md` — this report.

## Self-review

- Quiz IDs are unique; every quiz is non-empty; every answer index is an integer within its option array; options are non-empty and unique per question; explanations are substantive.
- New quiz content covers all requested linear-algebra and statistical-inference topics. Correct-answer positions were deliberately varied to avoid an answer-position shortcut.
- Rapid-fire additions use plausible neighboring misconceptions and emphasize production judgment, leakage, drift, delayed labels, active learning, normalization, critical slices, embedding migrations, regularization, and selective prediction.
- Every quiz-backed stage is accounted for exactly once by the scoped-reference test. Its task description contains exactly one numeric `N questions` statement, and `N` is derived from the referenced banks.
- Behavioral prompt IDs match the locked list in order and are unique. Each record has exactly the required seven fields, at least two follow-ups, at least three senior signals, at least four outline steps, and four rubric records covering scope, ownership/judgment, evidence/impact, and reflection/communication.
- No app rendering, resources, non-quiz curriculum contracts, or remediation behavior was modified by this package.

## Concerns

- No Phase 1D contract concern remains. Concurrent Phase 1C work is still present only as unstaged worktree changes and was deliberately excluded from this commit and its staged-snapshot GREEN run. Full-project testing remains the integration owner’s responsibility and was explicitly out of scope here.
