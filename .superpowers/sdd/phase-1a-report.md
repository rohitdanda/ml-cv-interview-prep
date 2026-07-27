# Phase 1A factual and technical corrections

## Audit-to-change map

### `notes.js`

- **Temperature scaling:** narrowed the guarantee to preservation of each example's argmax and binary logit-difference ordering. The recall answer now explicitly requires remeasurement of multiclass probability-ranking metrics because rankings across examples can change.
- **ViT resolution scaling:** states that doubling both image dimensions at fixed patch size makes token count `N` four times larger and the `O(N²d)` attention term roughly sixteen times larger.
- **Linked-list template:** replaced the literal no-op with a complete dummy-node implementation of Remove Nth Node From End. The module now states the fast/slow gap invariant and retains the Reverse Linked List worked example and `O(n)`/`O(1)` complexity discussion.
- **Sliding windows:** distinguishes fixed-width rolling add/remove updates from variable-width monotonic shrink-to-repair. Recognition cues, invariant, template, pitfalls, and recall now cover both forms.
- **Academic: matrix decompositions and geometry:** added a worked low-rank SVD application, centering/scaling and near-degenerate-subspace pitfalls, and recall on rank selection and rank-deficient least squares.
- **Academic: likelihood, MLE, MAP, and latent variables:** added the Bernoulli-to-BCE derivation, reduction/regularization-scaling and EM-local-optimum pitfalls, and recall on log-likelihood and MAP versus MLE.
- **Academic: estimators, tests, and resampling:** added a grouped-bootstrap application, p-value and reused-holdout pitfalls, and recall on resampling units and BH versus Bonferroni.
- **Academic: multivariable calculus and constrained optimization:** added a complete Lagrange-multiplier derivation, local-Hessian and KKT pitfalls, and recall on multiplier sensitivity and Hessian eigenvalues.
- **Academic: entropy, cross-entropy, and mutual information:** added a numeric binary cross-entropy/KL application, differential-entropy and finite-sample-MI pitfalls, and recall on cross-entropy/KL and independence.

Each academic module now has a concrete worked derivation/application, three pitfalls total, and three recall Q&A prompts total.

### `quizzes.js`

- **Multilabel:** describes one Bernoulli logit per label with BCE-with-logits as a factorized baseline and explicitly allows correlated labels.
- **Classical covariate shift:** states that `P(X)` changes while `P(Y|X)` is assumed stable, and distinguishes concept drift, label shift, and prediction shift.
- **Concept drift:** asks for the *strongest evidence* rather than claiming a signal proves drift; the explanation distinguishes labeled conditional evidence from unlabeled input, embedding, and prediction alarms.
- **CLIP:** identifies CLIP as dual image/text encoders aligned in a shared embedding space.
- **Weak distractors:** replaced the audited joke/category-error choices throughout the existing foundation, task/metric, rapid-fire, and modern-CV questions with neighboring misconceptions. Explanations now distinguish those plausible alternatives. Removed the specifically audited frame-brightness, float-storage, filename one-hot, token-absence, and always-edge choices without changing intended answers.
- **Answer indexes:** preserved intended correct options and verified every integer `answerIndex` is within its question's option bounds.

### `resources.js`

- **PyTorch quantization:** points to `https://docs.pytorch.org/ao/stable/index.html`, names torchao and current PT2E/eager flows, and identifies the old quantization landing page as legacy rather than current guidance.
- **interviewing.io:** labels the linked machine-learning mocks page as a free replay library and gives a replay-study assignment; it no longer describes that URL as paid live-mock booking.

## Files changed

- `notes.js`
- `quizzes.js`
- `resources.js`
- `.superpowers/sdd/phase-1a-report.md`

## Focused verification

- `node --check notes.js`
- `node --check quizzes.js`
- `node --check resources.js`
- Focused data-contract script loaded the three registries and verified all eight correction groups, academic depth counts, resource metadata, and zero invalid quiz answer indexes.
- Exact-string scan confirmed all specifically prohibited audited wording is absent.

Project-wide formatters, linters, and test suites were intentionally not run while parallel packages are active.

## Concerns

- None for this package. Later parallel additions should preserve these corrected existing records and question wording.
