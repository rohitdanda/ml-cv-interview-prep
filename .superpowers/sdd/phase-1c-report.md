# Phase 1C report

## Result

Phase 1C is complete. Study content, non-quiz scheduling, full problem-bank coverage, state-derived remediation, pressure/behavioral/mock guidance, and re-attempt workspaces are implemented without changing the locked quiz IDs or behavioral record schema.

## TDD evidence

### RED

Command:

```text
bun test tests/curriculum.test.js tests/logic.test.js
```

Observed before implementation:

```text
68 pass
18 fail
Ran 86 tests across 2 files
```

Four failures belonged to the concurrent Phase 1D quiz/behavioral RED work. The 14 Phase 1C failures covered the missing `ml-coding` module, prerequisite modules, modern-CV recall depth, pressure answers, mock packets, unscheduled problems, unsplit patterns, missing dynamic guide builder, and all four remediation evidence kinds. The remediation failures showed the expected old manual status or false completion result before production code was added.

### GREEN

Focused command only; no project-wide suite was run:

```text
bun test tests/curriculum.test.js tests/logic.test.js
```

Observed after implementation:

```text
86 pass
0 fail
5666 expect() calls
Ran 86 tests across 2 files
```

Individual focused evidence:

```text
bun test tests/logic.test.js
61 pass, 0 fail, 284 expect() calls

bun test tests/curriculum.test.js
25 pass, 0 fail, 5382 expect() calls
```

Syntax checks:

```text
node --check notes.js
node --check curriculum.js
node --check logic.js
node --check app.js
```

All four exited successfully with no output.

## Coverage counts

Loaded the browser data registry and session graph after implementation:

| Artifact | Count |
| --- | ---: |
| Foundation modules | 16 total / 11 required |
| Coding modules | 15 exactly |
| Modern-CV modules | 13 |
| System-design cases | 8 |
| Mock packets | 4 |
| Problem bank | 60 |
| Problems referenced by concrete problem-set stages | 60 |
| Optional/orphan problems | 0 |
| Weeks | 10 |
| Sessions | 60 |
| Guided stages | 172 |
| Dynamic remediation stages | 7 |

## Delivered behavior

- Added `classical-ml`, `cnn-foundations`, `detection-segmentation-foundations`, `video-tracking`, and `ml-coding`.
- `ml-coding` includes template/worked pairs for stable vectorized BCE-with-logits plus a real optimizer step, and vectorized IoU plus greedy NMS.
- Expanded `hashing` with prefix/suffix state and Product Except Self instead of adding a sixteenth coding module.
- Expanded `graphs-union-find` with directed-graph recognition, Kahn/DFS-color invariants, complexity, pitfalls, and complete Course Schedule code.
- Expanded every modern-CV module to at least three substantive recall prompts, including architecture/mechanics and production/evaluation judgment.
- Added all eight `pressureTestAnswer` records and gated their reveal on matching saved design evidence.
- Added four exported role packets: coding, ML/CV theory, CV system design, and behavioral. Packet guidance remains separate from attempt/debrief evidence.
- Scheduled classical ML and CNN/detection prerequisites in Week 3 before ViT/DETR, linked video tracking in Week 5, and scheduled ML coding practice in Week 7.
- Assigned all 13 audited orphan problems to concrete problem-set stages. Split `Hashing`, `Arrays: prefix/suffix`, `Heaps`, and `Intervals` patterns and maps.
- Added `buildSessionGuides(state, previousGuides)` while retaining default `sessionGuides` compatibility.
- Replaced the seven named bare remediation stages with typed targets derived from recall, quiz, problem, or design misses.
- Completion requires later passing evidence: retained recall, same-quiz score of at least 80, independent explained problem with correct complexity, or a later valid timed design rubric with the selected dimension at least 4.
- Fresh states receive explicit calibration targets and remain incomplete. A selected historical target is persisted and does not retarget after repair.
- App status, progress, recommendations, focus lookup, and rendering consume the same current guide instance.
- Added actual re-attempt UIs for module recall, quiz, problem, and design targets.
- Rendered behavioral follow-ups, senior signals, model outlines, and rubric records with safe fallback for missing enrichment.

## Browser smoke evidence

Local app loaded through HTTP with no console or page errors.

Observed:

- 60 session guides, dynamic guide builder present, 15 coding modules, 13 modern-CV modules, and 4 mock packets.
- Fresh system-design view showed 8 pressure questions, 0 answers, and 8 locked-answer messages.
- After persisting one matching `image-search` attempt and reloading, exactly its reference pressure answer appeared.
- Behavioral view rendered guidance for all 10 prompts, including follow-ups, senior signals, model outlines, and self-review rubrics.
- Mock view rendered all four packets and stated that packet guidance does not count as attempt/debrief evidence.
- A persisted failed `rapid-fire-readiness` attempt produced a non-calibration remediation stage naming the quiz, failure time, 80% criterion, and an embedded quiz re-attempt form.
- Mobile viewport was 390px wide with no horizontal overflow; packet details remained collapsed by default.

## Files changed

- `notes.js`
- `curriculum.js`
- `logic.js`
- `app.js`
- `tests/curriculum.test.js`
- `tests/logic.test.js`
- `.superpowers/sdd/phase-1c-report.md`

No style changes were necessary; existing card, details, grid, form, badge, and responsive primitives express the new UI.

## Self-review

- Preserved schema version 3 and Phase 1B design/story/mock evidence contracts.
- Preserved the locked quiz IDs and consumed, rather than redefined, the behavioral prompt schema.
- Kept exactly 10 weeks, 6 sessions per week, 60 sessions, and every existing session minute budget.
- Verified every required module reference and every problem reference resolves.
- Verified original miss evidence cannot complete its own remediation and same-timestamp evidence is not accepted as later.
- Verified empty-state remediation is not vacuously complete.
- Verified prompt answers and packet guidance do not create interview evidence by themselves.

## Concerns

No blocking concerns. Remediation assignments intentionally become stable once a historical miss is selected; later unrelated misses do not move that stage’s goalpost. Fresh calibration assignments can be replaced by a newly recorded miss until passing evidence closes the stage.
