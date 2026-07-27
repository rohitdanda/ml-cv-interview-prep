# Phase 1C — study content, scheduling, remediation, and renders

## Result

Phase 1C is complete. The study graph now teaches the missing ML/CV foundations, schedules every required module and coding problem, turns late-plan repair stages into evidence-backed re-attempts, and exposes pressure-test answers, behavioral coaching, and role-specific mock packets in the UI.

## TDD evidence

### RED

The first focused run of `bun test tests/curriculum.test.js tests/logic.test.js` failed on the intended missing contracts: the new modules and recall depth, prerequisite scheduling, complete problem-bank assignment, split pattern map, dynamic remediation targets, and later-evidence completion rules.

A second review-fix RED run recorded **86 passing / 4 failing** tests. The failures specifically proved that imported remediation assignments were not sanitized, the pressure-answer predicate was absent, integer IoU inputs reached `torch.finfo` unsafely, and remediation targets still needed activation-time locking.

A blocker-focused RED run recorded **90 passing / 3 failing** tests. It proved that packed orphan-problem stages had implausible per-problem time, an unfocused remediation stage had no explicit activation predicate, and the first cutoff rule did not distinguish historical repairs from fresh calibration.

A final content-hardening RED run kept **28 passing / 1 failing** curriculum tests and proved NMS did not align score and box devices. The added assertion passed only after moving scores to the boxes device before sorting.

The final remediation-semantics RED run recorded **91 passing / 2 failing** tests. It proved that a Sep 1 miss repaired on Sep 2 was incorrectly rejected when the learner focused the stage on Sep 16, and that the displayed criterion incorrectly named activation rather than the selected historical miss.

### GREEN

Final focused run:

```text
93 pass
0 fail
5738 expect() calls
Ran 93 tests across 2 files.
```

The final tests cover:

- exact 15-module coding inventory including `ml-coding`;
- substantive BCE-with-logits/training-step and IoU/NMS templates plus worked examples;
- classical ML, CNN, detection/segmentation, and video/tracking prerequisites;
- at least three substantive recall prompts for every modern-CV module;
- directed-graph/topological-sort Course Schedule instruction;
- all eight pressure-test reference answers;
- every banked problem scheduled exactly through a valid problem-set reference;
- honest problem-set workload floors plus exact later-stage copies for every redistributed hard problem;
- distinct hashing, prefix/suffix, heap, and interval pattern concepts;
- recall, quiz, problem, and design remediation requiring later matching evidence;
- activation-time target locking, stable rebuilding, calibration behavior, and reset/import safety;
- no re-attempt workspace before a persisted assignment; historical targets accept evidence after the selected miss, while fresh calibration requires evidence after activation;
- pressure answers gated behind a matching timed answer attempt.

No project-wide suite, formatter, or linter was run, per the Phase 1C brief.

## Coverage counts

| Artifact | Count / result |
| --- | ---: |
| Coding modules | 15 |
| Modern-CV modules | 13 |
| Required foundation modules | 11 |
| Minimum recall prompts per modern-CV module | 3 |
| System-design cases | 8 |
| Cases with pressure answers | 8 |
| Behavioral prompts consumed | 10 |
| Role-specific mock packets | 4 |
| Problem-bank records | 60 unique |
| Problems referenced by problem-set stages | 60 |
| Optional problems | 0 |
| Evidence-backed remediation stages | 7 |

## Implementation summary

- `notes.js`
  - Added `ml-coding`, `classical-ml`, `cnn-foundations`, `detection-segmentation-foundations`, and `video-tracking`.
  - Expanded modern-CV recall material and the graph module's topological-sort/Course Schedule treatment.
  - Added pressure-test answers for every system-design case and four complete mock packets.
  - Hardened the IoU/NMS template for integer input, dtype/device alignment of boxes and scores, empty outputs, and shape validation.
  - Corrected the segmentation pressure answer so micro/global Dice dominance is attributed to large masks/easy images, with empty-mask policy called out for macro aggregation.
- `curriculum.js`
  - Scheduled prerequisites before transformer material, linked video/tracking and ML coding, and assigned all 60 problems.
  - Redistributed hard orphan problems into explicitly named Week 4–7 timed sets (including a matching Tree/BST consolidation session); every concrete set now has credible minimum problem time while preserving each session total.
  - Split prefix/suffix, heap, and interval concepts without adding a sixteenth coding module.
  - Added pure guide rebuilding plus explicit `activateRemediationStage`: a target is selected, timestamped, and persisted only when that repair stage receives focus.
- `logic.js`
  - Added later-evidence remediation status for recall, quiz, problem, and design targets: non-calibration targets use the selected miss time, while fresh calibration targets use activation time.
  - Sanitized persisted remediation assignments during import and added the shared pressure-answer validity predicate.
- `app.js`
  - Added pressure-answer gating, behavioral guidance, mock packet rendering, and activated remediation workspaces.
  - An unfocused repair card exposes no form, radio, or submit control; focus persists the target before the form appears. Persistence failure rolls guide state back.
- `tests/curriculum.test.js`, `tests/logic.test.js`
  - Added focused graph, content, workload, activation, historical-repair, calibration-timestamp, persistence, reset/import, and false-completion regressions.

## Runtime verification

- `node --check` passed for `notes.js`, `curriculum.js`, `logic.js`, and `app.js`.
- Local browser smoke at 390×844 reported no page or console errors and no horizontal overflow.
- Behavioral smoke expanded all 10 prompt cards and observed interviewer follow-ups, senior signals, model outlines, and self-review rubrics.
- Mock smoke expanded all 4 packets and observed interviewer scripts, questions, follow-ups, and scoring rubrics.
- Pressure-answer smoke kept all answers locked for a requirements record and an untimed answer, then revealed exactly the matching case after a timed answer was saved.
- Remediation smoke observed zero form/radio/submit controls before focus, then persisted the prior 55% `rapid-fire-readiness` miss at `2026-09-16T12:00:00Z`; a 100% attempt at `12:00:01Z` marked the stage `Repaired` and its task complete.
- Historical-repair smoke stored a Sep 1 failed quiz and Sep 2 passing repair with no assignment; before Sep 16 focus the card exposed zero submit controls, and after focus the persisted target remained stable while the UI immediately showed `Repaired`.
- Runtime graph inspection found all 60 bank problems across 28 concrete stages and zero stages below the tested difficulty-weighted time floor; the five redistributed later sets have 60–90 minutes for two to four named problems.

## Self-review

- Preserved schema v3 and the Phase 1B typed story, design-phase, mock-debrief, and readiness contracts.
- Consumed the locked behavioral record schema and quiz IDs without redefining them.
- `buildSessionGuides` remains deterministic and side-effect free; target selection is a separate user-triggered state transition.
- Imported assignments accept only supported late-plan stage keys and structurally valid typed targets.
- No new CSS was necessary; existing responsive primitives express the new renders.

## Concerns

No blocking Phase 1C concerns remain. The project-wide suite was intentionally deferred to the coordinating agent because this package was explicitly limited to focused tests.
