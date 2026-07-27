(function registerStudyNotes() {
  'use strict';

  const foundationModules = [
    {
      id: 'linear-algebra',
      title: 'Linear algebra for ML systems',
      required: true,
      summary: 'Linear algebra is the language of representations. Interviewers care less about symbolic manipulation than whether you can reason about shape, similarity, information loss, and numerical cost.',
      keyPoints: [
        'A vector is both a point and a direction. Its norm measures magnitude; normalizing removes magnitude so comparisons emphasize direction.',
        'The dot product combines magnitude and alignment. Cosine similarity is a normalized dot product and is common for retrieval embeddings.',
        'Matrix multiplication composes linear maps. Always state tensor shapes; shape errors often reveal confused reasoning.',
        'Rank measures the number of independent directions represented. Low-rank structure enables compression and denoising but may discard task signal.',
        'Eigenvectors are directions preserved by a linear map up to scaling. Singular vectors generalize the useful decomposition to any rectangular matrix.',
        'A convolution is a structured linear operation with local connectivity and shared weights; attention is content-dependent mixing rather than a fixed linear kernel.'
      ],
      formulas: [
        'Dot product: x·y = Σᵢ xᵢyᵢ. Cosine similarity: cos(x,y) = (x·y) / (||x||₂ ||y||₂).',
        'Projection of x onto unit vector u: projᵤ(x) = (x·u)u.',
        'SVD: X = UΣVᵀ. A rank-k approximation keeps the k largest singular values: Xₖ = UₖΣₖVₖᵀ.'
      ],
      decisionRules: [
        'Use cosine similarity when direction carries semantics and embedding magnitude is not calibrated; use dot product when training intentionally encodes confidence or popularity in the norm.',
        'Use PCA for linear compression, visualization, decorrelation, or a fast diagnostic. Do not assume the largest-variance directions are best for the supervised task.',
        'Normalize before nearest-neighbor retrieval only when the training objective and chosen similarity agree with normalization.'
      ],
      pitfalls: [
        'Cosine distance is not automatically a good semantic metric. The representation must be trained so angular proximity matches the application notion of similarity.',
        'A matrix can be non-square and still have an SVD. Eigenvalue decomposition is more restricted.'
      ],
      systemDesignUse: 'State embedding dimension, normalization, index metric, expected memory, and how representation changes trigger a full vector-index rebuild.',
      recall: [
        { question: 'Why can cosine similarity and dot product rank neighbors differently?', answer: 'Cosine removes vector magnitude while dot product retains it. They agree only when all vectors have equal norm or norms do not alter ordering.' },
        { question: 'What does a small singular value mean?', answer: 'A small singular value means low squared energy along the associated singular directions; only for a centered data matrix does σᵢ²/(n−1) equal sample variance along that principal direction.' },
        { question: 'Why state tensor shapes aloud?', answer: 'Shapes expose whether operations are valid, clarify batch/channel/spatial semantics, and prevent vague architecture reasoning.' }
      ]
    },
    {
      id: 'probability',
      title: 'Probability, Bayes, and uncertainty',
      required: true,
      summary: 'Probability lets you reason about uncertain labels, noisy observations, and model confidence. The interview signal is translating assumptions into events before applying formulas.',
      keyPoints: [
        'Conditional probability restricts the sample space: P(A|B) = P(A∩B)/P(B). It is not generally symmetric.',
        'Independence means P(A,B)=P(A)P(B). Conditional independence is different and is often the actual modeling assumption.',
        'Bayes rule reverses a conditional by combining likelihood with a prior. Base rates matter strongly for rare events.',
        'Expectation is linear even for dependent variables. Variance is not additive unless covariance terms vanish.',
        'Aleatoric uncertainty is residual outcome or measurement variability conditional on the observed inputs and data-generating process; better features or sensors can reduce it, whereas epistemic uncertainty reflects uncertainty about the model or parameters and can shrink with informative data.',
        'Calibration asks whether predictions assigned probability p are correct about p fraction of the time; discrimination and calibration are separate properties.'
      ],
      formulas: [
        'Bayes: P(A|B) = P(B|A)P(A) / P(B).',
        'Variance: Var(X) = E[X²] - E[X]². Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y).',
        'Law of total probability: P(B)=Σᵢ P(B|Aᵢ)P(Aᵢ) for a partition {Aᵢ}.'
      ],
      decisionRules: [
        'For rare-positive systems, begin with the base rate and error costs before interpreting a high classifier score.',
        'Use predictive probabilities for thresholding only after measuring calibration on the deployment distribution.',
        'Use uncertainty sampling carefully in active learning because repeatedly selecting uncertain cases changes the labeled-data distribution.'
      ],
      pitfalls: [
        'P(disease|positive) is not sensitivity P(positive|disease). Confusing them ignores prevalence.',
        'Softmax confidence is not guaranteed to be calibrated or meaningful under distribution shift.'
      ],
      systemDesignUse: 'Translate model scores into an operating threshold using prevalence, downstream review capacity, and asymmetric false-positive/false-negative cost.',
      recall: [
        { question: 'Why can a 99%-accurate test have low precision?', answer: 'If the positive class is extremely rare, false positives from the large negative population can outnumber true positives despite high sensitivity and specificity.' },
        { question: 'What is the difference between uncertainty and entropy?', answer: 'Entropy is one numerical summary of a predictive distribution. Uncertainty is broader and includes data noise, parameter uncertainty, distribution shift, and ambiguity.' },
        { question: 'What does temperature scaling preserve?', answer: 'Dividing every logit by the same positive temperature preserves the per-example argmax and, for a binary score, the ordering of logit differences across examples. Multiclass class probabilities can reorder across examples, so probability-based ranking metrics must be remeasured.' }
      ]
    },
    {
      id: 'statistics-validation',
      title: 'Statistics, experiments, and validation design',
      required: true,
      summary: 'A model result is an estimate from sampled data. Senior candidates must discuss uncertainty, leakage, slice behavior, and whether the validation split predicts production.',
      keyPoints: [
        'An estimator has bias and variance. More data typically reduces variance but does not repair systematic bias.',
        'A confidence interval describes a procedure that covers the true parameter at a stated long-run rate; it is not a posterior probability unless using a Bayesian interval.',
        'A p-value is the probability, assuming the null model and analysis assumptions, of obtaining the chosen test statistic at least as extreme as the observed value; it is not P(H₀|data) or a measure of effect importance.',
        'Statistical power depends on effect size, noise, sample size, and significance threshold. Underpowered tests produce unstable estimates.',
        'Validation units must match deployment independence: patient, device, store, video, user, or time window, not merely individual images.',
        'Repeated tuning against one validation set overfits that set. Keep a final holdout or use nested procedures for major model selection.'
      ],
      formulas: [
        'Standard error of a sample mean: SE = s/√n under independent sampling.',
        'Approximate 95% interval for a mean: x̄ ± 1.96·SE when assumptions and sample size justify normal approximation.',
        'Two-sample effect uncertainty depends on both groups: SE(μ̂₁-μ̂₂)=√(s₁²/n₁+s₂²/n₂).'
      ],
      decisionRules: [
        'Use grouped splits when samples share an entity; temporal splits when future data differs from past; stratification only to preserve class proportions, not to fix leakage.',
        'Report confidence intervals or repeated-seed variation when sample size, stochastic training, or rare slices make a point estimate unstable.',
        'Prefer a predeclared primary metric and guardrails to opportunistically selecting the metric that improved.'
      ],
      pitfalls: [
        'Splitting frames from the same video across train and validation can produce excellent metrics from near-duplicate leakage.',
        'A statistically significant metric change can be operationally irrelevant; effect size and cost still decide.'
      ],
      systemDesignUse: 'Define the evaluation unit, split policy, slice table, confidence reporting, launch experiment, and guardrails before discussing model architecture.',
      recall: [
        { question: 'Why might random image splitting be invalid?', answer: 'Images may share users, cameras, locations, sessions, or video sequences. Correlated examples across splits leak identity and environment information.' },
        { question: 'What does an underpowered experiment do?', answer: 'It has low probability of detecting the target effect and, when significant, often yields exaggerated and unstable effect estimates.' },
        { question: 'When is k-fold cross-validation a poor choice?', answer: 'When chronology matters, groups must remain intact, training is prohibitively expensive, or the deployment distribution is not exchangeable with random folds.' }
      ]
    },
    {
      id: 'calculus-backprop',
      title: 'Calculus, gradients, and backpropagation',
      required: true,
      summary: 'You need enough calculus to explain how a loss changes with parameters, why gradients fail, and how backprop reuses local derivatives efficiently.',
      keyPoints: [
        'A derivative is local sensitivity. A gradient collects partial derivatives and points toward steepest increase under Euclidean geometry.',
        'The chain rule multiplies local sensitivities through composition. Backpropagation applies it in reverse topological order on a computation graph.',
        'Jacobians describe vector-to-vector local maps, but implementations usually compute vector-Jacobian products without materializing the full matrix.',
        'Saturating activations create small derivatives; repeated multiplication can make early-layer gradients vanish.',
        'Exploding gradients arise from repeated amplification and can be controlled with initialization, normalization, residual paths, learning rate, and clipping.',
        'Non-differentiable points such as ReLU at zero use a chosen subgradient; optimization does not require symbolic smoothness everywhere.'
      ],
      formulas: [
        'Chain rule: if z=f(y), y=g(x), then dz/dx = (dz/dy)(dy/dx).',
        'Gradient-descent update: θₜ₊₁ = θₜ - η∇θ L(θₜ).',
        'Softmax-cross-entropy logit gradient for one example: ∂L/∂zⱼ = pⱼ - 1[j=y].'
      ],
      decisionRules: [
        'If loss is NaN, inspect inputs, logits, numerical stability, learning rate, and gradient norms before changing architecture.',
        'Use gradient clipping when rare exploding updates destabilize training; it does not fix an invalid loss or broken data.',
        'Overfit a tiny batch to prove forward pass, labels, loss, gradients, and optimizer can cooperate.'
      ],
      pitfalls: [
        'A zero gradient may be correct for an inactive path, not necessarily a framework bug.',
        'Gradient clipping can hide chronic instability; log the unclipped norm and investigate the cause.'
      ],
      systemDesignUse: 'Use training telemetry such as loss components, learning rate, gradient norm, activation statistics, and throughput to shorten debugging time.',
      recall: [
        { question: 'Why does backprop run backward?', answer: 'Each parameter needs the upstream sensitivity of the final loss. Reverse-mode differentiation shares that upstream computation efficiently when one scalar loss depends on many parameters.' },
        { question: 'Why is softmax implemented with log-sum-exp stabilization?', answer: 'Subtracting the maximum logit prevents exponent overflow while preserving probabilities because softmax is invariant to a shared additive constant.' },
        { question: 'What does gradient clipping change?', answer: 'Gradient clipping bounds or rescales the gradient presented to the optimizer; it does not generally bound the parameter-update magnitude under momentum or Adam because optimizer state and adaptive preconditioning also affect the update.' }
      ]
    },
    {
      id: 'optimization',
      title: 'Optimization, initialization, and normalization',
      required: true,
      summary: 'Optimizer choice is a tradeoff among conditioning, gradient noise, compute, and generalization. Interview answers should start from failure symptoms rather than optimizer popularity.',
      keyPoints: [
        'SGD estimates the full gradient from a mini-batch. Smaller batches add noise; larger batches improve hardware use but may require learning-rate changes.',
        'Momentum maintains a velocity that smooths noisy gradients and accelerates persistent directions.',
        'Adam divides momentum by an estimate of second moments, making updates adaptive per parameter; AdamW decouples weight decay from the adaptive gradient step.',
        'Learning-rate schedules often matter more than switching optimizers. Warmup protects early training; decay enables convergence.',
        'Initialization tries to preserve activation and gradient variance across depth. Xavier suits symmetric activations; He initialization accounts for ReLU-like gating.',
        'Batch normalization uses batch statistics during training and running statistics at inference. Layer normalization normalizes features within each example and is stable for transformers and variable batch sizes.'
      ],
      formulas: [
        'Momentum: vₜ = βvₜ₋₁ + gₜ; θₜ₊₁ = θₜ - ηvₜ.',
        'Adam: mₜ=β₁mₜ₋₁+(1-β₁)gₜ; vₜ=β₂vₜ₋₁+(1-β₂)gₜ²; update uses bias-corrected m̂ₜ/(√v̂ₜ+ε).',
        'BatchNorm: y = γ(x-μ_batch)/√(σ²_batch+ε)+β during training.'
      ],
      decisionRules: [
        'Use AdamW as a practical fine-tuning default; benchmark SGD-style optimization when from-scratch vision training and final generalization justify it.',
        'If increasing global batch size, retune learning rate, warmup, regularization, and total optimization steps.',
        'Freeze or recalibrate BatchNorm when fine-tuning with tiny batches or a shifted domain.'
      ],
      pitfalls: [
        'L2 regularization and decoupled weight decay are not equivalent under adaptive optimizers.',
        'Training-mode BatchNorm during serving makes predictions depend on co-batched requests; eval mode must be explicit.'
      ],
      systemDesignUse: 'Specify reproducibility controls, mixed precision, distributed strategy, checkpoint recovery, and optimizer state size when estimating training infrastructure.',
      recall: [
        { question: 'Why does Adam need bias correction?', answer: 'Moment estimates start at zero and are biased toward zero early. Dividing by 1-βᵗ corrects the expected scale.' },
        { question: 'BatchNorm versus LayerNorm?', answer: 'BatchNorm uses statistics across batch/spatial examples per channel; LayerNorm uses features within each example. LayerNorm does not depend on batch composition.' },
        { question: 'What would you inspect before lowering learning rate?', answer: 'Loss curve, gradient norms, numerical overflow, data/label validity, batch composition, and whether the loss is reduced correctly.' }
      ]
    },
    {
      id: 'generalization',
      title: 'Bias–variance, regularization, and transfer',
      required: true,
      summary: 'Generalization is a property of the model, data, objective, and evaluation distribution together. “Add dropout” is not a diagnosis.',
      keyPoints: [
        'High bias appears as poor training performance; high variance appears as a large train-to-validation gap, but noise and distribution shift can mimic both.',
        'Regularization introduces preferences: smaller weights, simpler representations, invariance to augmentation, smoother labels, or earlier stopping.',
        'Data augmentation is correct only when the transformation preserves the task label. A horizontal flip may invert text, anatomy, traffic direction, or handedness.',
        'Pretraining reduces sample complexity when source features transfer. Domain mismatch can make a smaller in-domain model better.',
        'Fine-tuning choices include linear probing, partial unfreezing, discriminative learning rates, adapters, and full tuning.',
        'The double-descent regime means parameter count alone is not a monotonic measure of generalization; effective complexity and optimization matter.'
      ],
      formulas: [
        'Expected squared error decomposes conceptually into irreducible noise + bias² + variance under standard assumptions.',
        'L2 penalty: L_total = L_data + λ||θ||₂². L1: L_total = L_data + λ||θ||₁.',
        'Label smoothing target: y_smooth = (1-ε)y_one-hot + ε/K.'
      ],
      decisionRules: [
        'First verify leakage and split validity. Then compare training and validation curves before changing regularization.',
        'Prefer augmentation backed by deployment invariances and validate each transform on sensitive slices.',
        'Use a simple pretrained baseline before training a large architecture from scratch.'
      ],
      pitfalls: [
        'Label smoothing can improve accuracy while harming calibrated confidence or rare-class separation; measure the required behavior.',
        'Early stopping against a noisy metric can select random fluctuations; smooth or require meaningful improvement.'
      ],
      systemDesignUse: 'Define data scaling experiments and learning curves so the team knows whether the next investment should be labels, model capacity, or objective changes.',
      recall: [
        { question: 'Can low training error and low validation error still hide a problem?', answer: 'Yes. Both can be optimistic from leakage, duplicated data, an unrepresentative split, or a metric that ignores costly slices.' },
        { question: 'Why can augmentation hurt?', answer: 'The transformation may change the label, create unrealistic samples, distort class frequency, or shift the distribution away from deployment.' },
        { question: 'When would you freeze a backbone?', answer: 'With limited data/compute, strong transferable features, or as a fast diagnostic baseline. Unfreeze when domain shift or task specialization demands representation change.' }
      ]
    },
    {
      id: 'losses',
      title: 'Loss functions by task',
      required: true,
      summary: 'The training loss is a differentiable proxy, not necessarily the business metric. Choose it from output semantics, label structure, imbalance, and optimization behavior.',
      keyPoints: [
        'Multiclass classification uses one mutually exclusive target; categorical cross-entropy fits a softmax distribution. Multilabel classification uses independent binary targets and BCE-with-logits.',
        'Focal loss reduces the weight of easy examples and can help dense detection imbalance; it adds tuning and may affect calibration.',
        'MSE strongly penalizes large residuals and corresponds to a Gaussian noise assumption. MAE is robust to outliers but has a constant-magnitude gradient. Huber interpolates.',
        'Dice loss emphasizes overlap and is useful for imbalanced segmentation; combining Dice with pixelwise CE/BCE often stabilizes optimization and calibration.',
        'IoU-style losses align box overlap better than raw coordinate loss. Detection systems usually combine classification, localization, and sometimes objectness losses.',
        'Contrastive losses shape relative geometry. Batch composition and negative sampling are part of the objective.'
      ],
      formulas: [
        'Binary cross-entropy: L = -[y log p + (1-y)log(1-p)]. Use a logits implementation for stability.',
        'Focal loss: FL(pₜ) = -αₜ(1-pₜ)^γ log(pₜ).',
        'Dice = (2Σ pᵢyᵢ + ε)/(Σpᵢ + Σyᵢ + ε).',
        'Huber residual r: 0.5r² when |r|≤δ; δ(|r|-0.5δ) otherwise.'
      ],
      decisionRules: [
        'Mutually exclusive classes: softmax CE. Independent labels: BCE-with-logits. Ordinal classes may justify ordinal or regression-style structure.',
        'Start with a standard stable loss and correct sampling. Add focal or compound losses only after confirming imbalance is the bottleneck.',
        'For segmentation, report object- and boundary-level outcomes even when training on pixel losses.'
      ],
      pitfalls: [
        'Applying sigmoid before a “with logits” loss duplicates the sigmoid and harms numerical stability.',
        'Optimizing Dice alone can produce unstable behavior on empty masks unless smoothing and empty-case policy are defined.'
      ],
      systemDesignUse: 'Explain how labels map to output heads and loss components, how each component is weighted, and which offline metric validates the proxy.',
      recall: [
        { question: 'Why combine CE and Dice for segmentation?', answer: 'CE supplies dense per-pixel gradients and probabilistic behavior; Dice directly emphasizes region overlap and class imbalance. The combination balances optimization and task alignment.' },
        { question: 'When is BCE wrong for classification?', answer: 'When classes are mutually exclusive and should compete as one categorical distribution, independent sigmoids fail to enforce total probability or exclusivity.' },
        { question: 'Does focal loss solve bad labels?', answer: 'No. It changes weighting toward hard examples, which can amplify mislabeled or ambiguous samples unless label quality is controlled.' }
      ]
    },
    {
      id: 'metrics',
      title: 'Metrics, thresholds, and calibration',
      required: true,
      summary: 'Metrics encode which errors matter and at what unit. Choose a primary metric, guardrails, slices, and an operating threshold before discussing model wins.',
      keyPoints: [
        'Precision answers “of predicted positives, how many were correct?” Recall answers “of actual positives, how many were found?” The threshold trades them.',
        'F1 is the harmonic mean of precision and recall. Fβ weights recall more when β>1 and precision more when β<1, but neither includes true negatives or explicit cost.',
        'ROC-AUC measures ranking across FPR/TPR and can look strong with severe imbalance. PR-AUC focuses on positive retrieval quality and depends on prevalence.',
        'Calibration metrics include reliability plots, expected calibration error, Brier score, and log loss. Evaluate calibration by relevant slices.',
        'Detection AP integrates precision-recall at an IoU criterion; COCO-style mAP averages categories and multiple IoU thresholds. Report size and class slices.',
        'Segmentation IoU and Dice overlap regions. Boundary F1 catches edge quality; object-level recall catches missing small instances.',
        'For multiclass or multilabel evaluation, micro aggregation pools all decisions and is dominated by common classes, while macro aggregation averages per-class metrics and weights each class equally; report per-class support and results because neither aggregate exposes every failure.'
      ],
      formulas: [
        'Precision = TP/(TP+FP). Recall = TP/(TP+FN). Specificity = TN/(TN+FP).',
        'F1 = 2PR/(P+R). Fβ = (1+β²)PR/(β²P+R).',
        'IoU = |A∩B|/|A∪B|. Dice = 2|A∩B|/(|A|+|B|), so Dice = 2IoU/(1+IoU).',
        'Brier score for binary probability p: mean((p-y)²).'
      ],
      decisionRules: [
        'Choose the metric at the business decision unit: alert, patient, video, session, object, or pixel.',
        'For highly imbalanced retrieval or detection, inspect PR curves and operating-point precision/recall rather than accuracy.',
        'Tune thresholds on validation data, lock them before final evaluation, and monitor threshold-specific rates after launch.'
      ],
      pitfalls: [
        'Accuracy can improve by predicting the majority class while product utility collapses.',
        'Comparing PR-AUC across datasets with different prevalence can be misleading because the baseline changes.'
      ],
      systemDesignUse: 'Define offline model metrics, system SLOs, business outcomes, guardrails, and the mapping between them. A model metric alone is not a success definition.',
      recall: [
        { question: 'ROC-AUC or PR-AUC for rare defects?', answer: 'Usually PR-AUC is more informative because it exposes precision at useful recall under class imbalance. Still choose the final operating point from error costs and capacity.' },
        { question: 'Why can pixel accuracy be useless for segmentation?', answer: 'Background can dominate pixels, so a model predicting background everywhere scores highly while missing every object.' },
        { question: 'What is calibration used for?', answer: 'Reliable probabilities enable thresholding, triage, risk ranking, abstention, and combining predictions with downstream costs.' }
      ]
    },
    {
      id: 'data-debugging',
      title: 'Data quality, error analysis, and model debugging',
      required: true,
      summary: 'Debug from the simplest falsifiable hypothesis. Senior answers distinguish data, code, optimization, objective, capacity, and distribution failures.',
      keyPoints: [
        'Begin with a data contract: source, consent, label ontology, unit, version, lineage, expected ranges, and split policy.',
        'Visualize raw and transformed examples with labels. Many “model” bugs are channel order, scaling, crop, augmentation, or label-index problems.',
        'Overfit one tiny batch. Failure indicates a code, loss, capacity, optimizer, or label issue before generalization matters.',
        'Build an error taxonomy and inspect slices by class, size, lighting, camera, geography, language, user group, and model confidence.',
        'Compare against simple baselines and previous production behavior. A large model cannot compensate for a metric that rewards the wrong outcome.',
        'Check train/serve skew by sharing preprocessing where possible and logging feature/model versions.'
      ],
      formulas: [
        'Expected error contribution of slice s is approximately prevalence(s) × error_rate(s) × cost(s). Prioritize by impact, not only worst rate.',
        'Inter-annotator agreement can be measured with Cohen’s κ for two annotators: κ=(pₒ-pₑ)/(1-pₑ), but always inspect the confusion itself.'
      ],
      decisionRules: [
        'If both train and validation are bad: verify pipeline, labels, loss, capacity, optimization. If train is good and validation bad: inspect split, leakage, variance, and shift.',
        'Fix high-impact systematic slices before chasing tiny aggregate improvements.',
        'Use active learning only after defining how biased acquisition affects evaluation and future training.'
      ],
      pitfalls: [
        'Reviewing only high-confidence mistakes misses uncertain mass and calibration failures.',
        'Changing five things between runs destroys causal learning; keep experiments attributable.'
      ],
      systemDesignUse: 'Include dataset/version lineage, slice dashboards, label audit queues, replay datasets, shadow evaluation, and rollback criteria.',
      recall: [
        { question: 'What is your first action when loss does not decrease?', answer: 'Inspect a tiny batch end to end: inputs, labels, logits, loss components, gradients, optimizer step, and whether the model can deliberately overfit it.' },
        { question: 'How do you prioritize errors?', answer: 'Combine frequency, user/business cost, confidence, and fixability, then validate the suspected cause with a controlled change.' },
        { question: 'What is train/serve skew?', answer: 'Training and production compute different features, preprocessing, distributions, or code paths, so offline behavior does not transfer.' }
      ]
    },
    {
      id: 'deployment-monitoring',
      title: 'Serving, monitoring, drift, and feedback',
      required: true,
      summary: 'A production ML system is a decision loop. The model is one component inside latency, reliability, observability, data, and human processes.',
      keyPoints: [
        'Choose batch, asynchronous, streaming, online API, edge, or hybrid serving from freshness, latency, throughput, privacy, and cost requirements.',
        'Latency distributions matter: p50 hides tail pain. Include preprocessing, queue, model, postprocessing, network, and downstream action.',
        'Batching improves throughput but adds queue latency. Dynamic batching requires a maximum wait and request-shape policy.',
        'Monitor system health, input quality, feature distributions, prediction distributions, confidence, slice metrics, labels when available, and business outcomes.',
        'Covariate shift means P(X) changes while P(Y|X) is assumed stable; label/prior shift means P(Y) changes while P(X|Y) is assumed stable; concept shift means P(Y|X) changes. In practice several distributions may change together, and a drift alert alone does not identify the regime or prove quality loss.',
        'Use canary, shadow, or staged rollout with explicit rollback metrics. Keep model, data, code, and threshold versions traceable.'
      ],
      formulas: [
        'Utilization approaching 100% causes queueing latency to grow sharply; provision headroom for bursty online systems.',
        'Throughput ≈ batch_size / batch_latency only when the pipeline remains saturated and preprocessing/I/O are not bottlenecks.',
        'Population stability index and divergence metrics can flag distribution changes, but require stable bins/reference windows and interpretation.'
      ],
      decisionRules: [
        'Edge inference is favored by privacy, offline operation, bandwidth, and immediate latency; cloud is favored by centralized updates, larger compute, and easier observability.',
        'Retrain from labeled performance degradation or a validated drift trigger, not a calendar alone.',
        'Separate alert thresholds from decision thresholds and set ownership, runbooks, and suppression policies.'
      ],
      pitfalls: [
        'Monitoring average confidence without labels can miss class swaps, calibration changes, and silent preprocessing failures.',
        'Automatic retraining can amplify feedback loops or poisoning if labels and acquisition are not controlled.'
      ],
      systemDesignUse: 'Close every design with SLOs, versioning, dashboards, delayed-label evaluation, rollout, rollback, and the human owner of each alert.',
      recall: [
        { question: 'What should you monitor without immediate labels?', answer: 'Schema/data quality, input and embedding distributions, prediction mix, confidence, latency, errors, resource use, and proxy outcomes, while acknowledging they do not replace labeled quality.' },
        { question: 'Shadow versus canary?', answer: 'Shadow sends live traffic to the new model without affecting decisions. Canary serves a small real fraction and therefore measures user impact but carries risk.' },
        { question: 'Why can drift detection create alert fatigue?', answer: 'Natural seasonality and benign distribution changes trigger statistical tests at scale. Alerts need impact validation, stable references, thresholds, and ownership.' }
      ]
    },

    {
      id: 'classical-ml',
      title: 'Classical ML model families and selection',
      required: true,
      summary: 'Classical models remain the fastest way to establish signal, diagnose feature quality, and ship reliable tabular or low-data systems. Senior interview answers compare assumptions, capacity, calibration, inference cost, and failure modes before reaching for a larger model.',
      keyPoints: [
        'Least-squares linear regression estimates the best linear L2 predictor; it equals E[Y|X] only when the conditional mean lies in the chosen linear feature class.',
        'Gradient boosting sequentially fits learners to negative loss gradients (pseudo-residuals); these are ordinary residuals only for squared-error loss.',
        'Linear and kernel SVMs maximize margin; kernels add nonlinear capacity but training and serving can become expensive as examples and support vectors grow.',
        'kNN is a local nonparametric baseline whose quality depends on distance, feature scaling, dimensionality, and retrieval cost.',
        'k-means assumes roughly spherical clusters under Euclidean distance; density and hierarchical methods answer different cluster-shape and noise questions.',
        'Model selection belongs inside cross-validation at the deployment-independent unit. Calibrate probabilities on untouched data and choose thresholds from downstream cost, not accuracy alone.'
      ],
      formulas: [
        'Logistic model: P(y=1|x)=σ(wᵀx+b); regularization controls coefficient magnitude but does not repair leakage or omitted variables.',
        'SVM soft-margin objective balances ||w||²/2 against C Σᵢ max(0,1-yᵢf(xᵢ)); larger C penalizes margin violations more strongly.',
        'k-means minimizes within-cluster squared distance Σᵢ||xᵢ-μ_{cᵢ}||² and can converge to a local optimum.'
      ],
      decisionRules: [
        'Start with regularized linear/logistic regression when interpretability, sparse features, extrapolation checks, or a fast calibrated baseline matter.',
        'Use boosted trees for heterogeneous tabular features and nonlinear interactions; use forests when parallel training, robustness, and lower tuning sensitivity matter more than the last point of accuracy.',
        'Use SVM or kNN only when dataset size, dimensionality, latency, and distance/kernel assumptions make their training and inference costs defensible.',
        'Choose clustering only after defining how clusters will be validated and acted on; an attractive visualization is not a product objective.'
      ],
      pitfalls: [
        'Scaling outside the cross-validation fold leaks validation information into SVM, kNN, linear models, and clustering.',
        'Treating tree feature importance as causal or stable under correlated features overstates what the fitted model established.',
        'Selecting a threshold, calibration map, or hyperparameters on the final test set converts that test into training data.',
        'High-dimensional distance concentration can make nearest neighbors and k-means unstable without representation work.'
      ],
      systemDesignUse: 'Use classical models as shadow baselines, interpretable fallbacks, routing models, and data-quality probes. Version preprocessing with the estimator, benchmark p99 latency and calibration by slice, and keep a simple baseline in every launch comparison.',
      recall: [
        { question: 'When would logistic regression beat a boosted tree in production?', answer: 'When the relationship is adequately linear, sparse or high-dimensional features dominate, calibrated simplicity and interpretability matter, and lower latency or easier monitoring outweighs small nonlinear gains.' },
        { question: 'Bagging versus boosting: what changes mechanically?', answer: 'Bagging trains diverse estimators independently on resampled data and averages them to reduce variance; boosting trains sequentially so each learner targets errors or gradients left by the ensemble.' },
        { question: 'How should you evaluate an unsupervised clustering choice?', answer: 'Combine stability and geometry checks with domain review and, most importantly, whether the clusters improve a defined downstream action on held-out data without creating harmful segments.' }
      ]
    },

    {
      id: 'dl-architectures',
      title: 'Deep-learning architecture mechanics and lineage',
      required: true,
      summary: 'Senior architecture answers must derive tensor shapes, receptive fields, parameter and activation cost, gradient paths, and the inductive bias of each block before naming a family. The useful lineage from MLPs through modern CNNs explains which bottleneck each architecture changed and which production constraint remains.',
      keyPoints: [
        'An MLP alternates affine maps and nonlinearities. Without a nonlinearity, stacked linear layers collapse to one affine map; hidden width controls representation capacity while activation storage often dominates training memory.',
        'A convolution shares a local kernel across positions. Channels are mixed through the input-channel dimension, stride reduces spatial resolution, dilation spaces kernel taps, and groups restrict channel connectivity.',
        'AlexNet demonstrated deep ReLU CNNs with GPU training and overlapping pooling; VGG made depth and repeated 3×3 blocks systematic but is parameter-heavy; Inception used parallel receptive fields and 1×1 bottlenecks to control compute.',
        'A 1×1 convolution performs a learned channel projection at each location. It can reduce or expand channels around an expensive spatial convolution without directly enlarging spatial receptive field.',
        'ResNet adds identity or projected shortcuts so blocks learn residual corrections and gradients have a short path. DenseNet concatenates all earlier features inside a block, encouraging reuse but increasing activation traffic.',
        'MobileNet factorizes a dense convolution into depthwise spatial filtering and pointwise channel mixing. Inverted residual blocks expand, filter depthwise, project linearly, and shortcut only when shape permits.',
        'EfficientNet compound scaling jointly grows depth, width, and input resolution under a compute budget; the coefficients are a searched recipe, not a guarantee that every deployment should scale all three.',
        'Pooling and strided convolution both reduce resolution. Max pooling preserves a local extreme, average pooling preserves a local mean, and learned striding can alias unless the data and filtering support the sampling change.',
        'Theoretical receptive field follows kernel, stride, and dilation recurrences, while effective influence is usually concentrated. Dense prediction often needs FPN or skip connections because late features alone lose fine localization.'
      ],
      formulas: [
        'Dense layer: y=φ(Wx+b), with parameter count d_in·d_out+d_out and per-example multiply-add work proportional to d_in·d_out.',
        'Convolution output: H_out=floor((H+2P−D(K−1)−1)/S+1); parameters=K_hK_wC_inC_out/groups plus optional bias.',
        'Depthwise-separable K×K convolution uses K²C_in+C_inC_out weights versus K²C_inC_out for a dense convolution when depth multiplier is one.',
        'Receptive field recurrence: jump_l=jump_{l−1}s_l and RF_l=RF_{l−1}+(k_l−1)d_l·jump_{l−1}.'
      ],
      decisionRules: [
        'Start from a maintained pretrained residual, mobile, or efficient backbone, then choose feature stages and resolution from target-device latency, memory, and smallest-object evidence.',
        'Use depthwise-separable or bottleneck blocks when measured dense-kernel cost dominates and the runtime has optimized kernels; a lower FLOP count is not sufficient evidence.',
        'Retain high-resolution skips or a pyramid when boundaries and small instances matter; accept aggressive downsampling only after size-sliced recall remains inside the error budget.',
        'Compare architecture families under the same preprocessing, pretraining data, optimization budget, precision, batch size, compiler, and target hardware.'
      ],
      pitfalls: [
        'Counting weights but ignoring activations, optimizer state, workspace, memory bandwidth, and kernel launches produces unreliable training and serving estimates.',
        'A shortcut with mismatched spatial or channel shape is not an identity path; the projection changes parameters, compute, and sometimes information preservation.',
        'Depthwise convolution does not mix channels, so omitting or bottlenecking the pointwise projection too aggressively can destroy capacity.',
        'Increasing input resolution changes feature sizes, augmentation, calibration, latency, and often the valid batch size; it is not a free accuracy knob.'
      ],
      systemDesignUse: 'State input and feature shapes, stride and receptive-field schedule, checkpoint provenance, normalization, precision, activation and parameter memory, compiler support, and target-hardware p50/p99. Tie every architecture choice to quality by class, size, boundary, and deployment domain.',
      recall: [
        { question: 'Why can a stack of affine layers without activations be replaced by one layer?', answer: 'The composition of affine maps is another affine map, so depth adds no new function class until nonlinearities or other non-affine operations separate the maps.' },
        { question: 'What mechanics make a residual block easier to optimize?', answer: 'The shortcut carries activations and gradients across the block while the residual branch learns a correction, reducing the burden of reconstructing an identity mapping through every nonlinear layer.' },
        { question: 'How does a MobileNet block reduce convolution cost?', answer: 'It separates per-channel spatial filtering from 1×1 channel mixing, replacing the multiplicative K²C_inC_out cost with K²C_in plus C_inC_out under the simple depthwise-separable form.' },
        { question: 'Which production evidence justifies an EfficientNet or MobileNet choice?', answer: 'Use identical preprocessing and checkpoints to measure target-runtime latency, throughput, peak memory and energy alongside accuracy, calibration, and small-object or boundary slices.' }
      ]
    },
    {
      id: 'sequence-attention',
      title: 'RNNs, gated recurrence, and self-attention',
      required: true,
      summary: 'Sequence models differ in how information travels across positions. Senior candidates should derive recurrent state updates and attention shapes, explain gradient and memory paths, and choose recurrence, convolution, or attention from context length, causality, parallelism, streaming state, and deployment cost.',
      keyPoints: [
        'A vanilla RNN reuses one transition across time, combining the current input with the prior hidden state. Backpropagation through time multiplies recurrent Jacobians, creating vanishing or exploding gradients over long dependencies.',
        'An LSTM uses input, forget, and output gates around an additive cell-state path; a GRU combines reset and update gates in a smaller state. Gates improve trainability but do not guarantee unlimited memory.',
        'Teacher forcing trains an autoregressive decoder on ground-truth previous tokens, while inference consumes its own outputs; scheduled sampling does not automatically solve the resulting distribution mismatch and can bias training.',
        'Scaled dot-product attention projects queries, keys, and values, scores query-key compatibility, masks illegal positions, normalizes scores, and mixes values. Every mask must define its broadcast axes and whether true means keep or block.',
        'Multi-head attention splits the model dimension so heads learn different projections, performs attention per head, concatenates head outputs, and applies an output projection. Head count changes per-head width, not the external model width.',
        'Self-attention uses Q, K, and V from one sequence; cross-attention uses queries from one stream and keys/values from another. Causal self-attention masks future keys but still permits all valid earlier positions.',
        'Sinusoidal, learned absolute, relative-bias, rotary, and ALiBi-style positional methods inject order differently. Extrapolation beyond trained length is a property to measure, not infer from the formula alone.',
        'Full attention parallelizes training but materializes an L×L interaction. Autoregressive serving caches past keys and values, reducing repeated projection work while KV-cache memory grows with layers, heads, head width, batch, and context.',
        'Pre-norm transformer blocks usually improve deep optimization by placing normalization before attention and MLP residual branches; post-norm changes the residual and gradient path and may need different stabilization.'
      ],
      formulas: [
        'Vanilla recurrence: h_t=tanh(W_xx_t+W_hh_{t−1}+b); gradients across k steps contain products of k recurrent Jacobians.',
        'Scaled attention: Attention(Q,K,V)=softmax((QKᵀ)/√d_k+M)V, where M is 0 for allowed logits and −∞ for blocked logits.',
        'For B batches, H heads, lengths L_q and L_k, QKᵀ has shape [B,H,L_q,L_k] and full-attention score memory scales as O(BHL_qL_k).',
        'One LSTM form is c_t=f_t⊙c_{t−1}+i_t⊙g_t and h_t=o_t⊙tanh(c_t), with sigmoid gates f_t,i_t,o_t.'
      ],
      decisionRules: [
        'Use an RNN or compact state-space recurrence when bounded streaming state and per-step latency dominate; use full attention when global pairwise context and parallel training justify quadratic sequence cost.',
        'Choose causal masking only when the prediction contract forbids future evidence; use bidirectional context for offline encoding where the whole sequence is available.',
        'Choose positional encoding together with maximum trained and served length, interpolation or extrapolation policy, and export/runtime support.',
        'For multimodal cross-attention, budget visual and text token counts explicitly and test whether pooling or learned queries preserve task evidence before compressing.'
      ],
      pitfalls: [
        'Applying softmax over the wrong axis makes each query normalize over heads or queries rather than candidate keys while retaining plausible tensor shapes.',
        'Masking after softmax leaks probability mass to forbidden positions; finite sentinel values can also leak under low precision if they are not sufficiently negative.',
        'Calling LSTM memory persistent ignores gate saturation, truncation length, state resets, and distribution shift between training and streaming inference.',
        'KV caching reduces repeated compute but not unbounded memory growth; long contexts can become memory- or bandwidth-bound before arithmetic is saturated.'
      ],
      systemDesignUse: 'Specify sequence unit, ordering, causality, context and truncation, state reset, Q/K/V shapes, mask semantics, positional method, KV-cache budget, batching, precision, and overflow behavior. Monitor length slices, attention or gate pathologies, streaming latency, memory, and quality after context or modality compression.',
      recall: [
        { question: 'How does the LSTM architecture create a shorter gradient path?', answer: 'Its cell state has an additive update gated by the forget and input terms, so information and gradients need not pass through a fresh full nonlinear transform at every step.' },
        { question: 'What mechanics turn self-attention into multi-head attention?', answer: 'Learned projections form several lower-width query, key, and value sets; each head scores and mixes independently, then concatenated outputs are projected back to model width.' },
        { question: 'Why divide attention logits by the square root of key width?', answer: 'Under common independent-component assumptions, unscaled dot-product variance grows with key width, pushing softmax toward saturation; the scaling keeps logits in a more trainable range.' },
        { question: 'Which production tradeoff decides between recurrence and attention?', answer: 'Measure task quality by dependency length against batch throughput, per-step latency, state or KV-cache memory, streaming reset behavior, compiler kernels, and maximum supported context.' }
      ]
    },
    {
      id: 'training-stability',
      title: 'Initialization, normalization, precision, and stable training',
      required: true,
      summary: 'Stable training is an end-to-end numerical and statistical contract among data scale, initialization, residual layout, activation, normalization, loss reduction, optimizer, precision, and update cadence. Senior debugging changes one falsifiable cause at a time and records signals before treating a symptom.',
      keyPoints: [
        'Xavier initialization targets activation variance for roughly symmetric nonlinearities, while He initialization accounts for ReLU-like gating. Residual-depth scaling and pretrained checkpoints can require architecture-specific initialization.',
        'Sigmoid and tanh saturate at large magnitude; ReLU can create permanently inactive units; GELU and SiLU are smooth gates with different compute and export behavior. Activation choice interacts with initialization and normalization.',
        'BatchNorm estimates channel statistics from the training batch and keeps running statistics for inference. LayerNorm normalizes features within each example; GroupNorm groups channels and avoids dependence on batch composition.',
        'Dropout samples multiplicative masks during training and is disabled in evaluation. It regularizes co-adaptation but changes activation variance and is not a substitute for data, weight decay, or early stopping.',
        'Mixed precision keeps selected operations and tensors in lower precision while sensitive reductions or master updates use safer precision. Dynamic loss scaling detects overflow and adjusts scale; it does not repair an unstable objective.',
        'Gradient accumulation divides or otherwise normalizes microbatch losses so several backward passes equal one intended global-batch update. Optimizer step count, scheduler step count, clipping, and zeroing must follow update boundaries.',
        'Norm clipping rescales the complete gradient vector when its norm exceeds a threshold; value clipping truncates coordinates. Clip after unscaling mixed-precision gradients and before the optimizer step.',
        'A full debug ladder validates schema and labels, overfits one batch, checks forward ranges and loss reduction, inspects finite gradients and norms, compares train/eval behavior, then increases data and distributed complexity.',
        'Deterministic seeds do not guarantee bitwise reproducibility across kernels and devices. Record code, data, environment, sampler epoch, world size, precision, and checkpoints before comparing runs.'
      ],
      formulas: [
        'Xavier variance is approximately 2/(fan_in+fan_out); He variance for ReLU-like layers is approximately 2/fan_in.',
        'LayerNorm(x)=γ⊙(x−μ_features)/sqrt(σ²_features+ε)+β; BatchNorm uses per-channel batch/spatial statistics during training.',
        'For K equal microbatches, backpropagating loss_k/K and stepping once yields the gradient of the mean over the accumulated examples when all examples and reductions are weighted consistently.',
        'Global norm clipping uses g←g·min(1,c/(||g||₂+ε)); under Adam, this bounds the presented gradient norm, not necessarily the final parameter-update norm.'
      ],
      decisionRules: [
        'Use BatchNorm for stable sufficiently large convolutional batches, GroupNorm for small dense-prediction batches, and LayerNorm or RMS-style normalization for transformer-like feature dimensions.',
        'Enable mixed precision only with finite-loss and finite-gradient checks plus target-hardware throughput and quality evidence; keep numerically sensitive reductions in supported higher precision.',
        'Match scheduler steps, EMA updates, logging, clipping, and checkpoint cadence to optimizer updates rather than raw microbatches when accumulating gradients.',
        'When instability appears, capture the first bad step and inspect inputs, logits, each loss component, gradient norms, optimizer state, and precision overflow before lowering the learning rate blindly.'
      ],
      pitfalls: [
        'Calling model.eval() does not disable autograd, while inference_mode does not switch BatchNorm and Dropout behavior; production inference usually needs both the intended mode and disabled gradients.',
        'Accumulating already-mean-reduced microbatch losses without weighting unequal microbatch sizes optimizes a mean of microbatch means rather than the example-weighted objective.',
        'Clipping every step at a very low threshold can hide exploding gradients and change optimization into chronic direction-only updates.',
        'BatchNorm running statistics can drift during tiny-batch fine-tuning even when weights are mostly frozen, producing a train-good and serve-bad failure.'
      ],
      systemDesignUse: 'Version initialization and checkpoint source, normalization modes, loss reductions, precision policy, accumulation factor, global batch, clipping, optimizer and scheduler update units, seed and environment. Dashboard component losses, finite rates, gradient and update norms, scale overflows, throughput, memory, and validation slices from single-device through distributed runs.',
      recall: [
        { question: 'Why does He initialization use a larger variance than basic Xavier for ReLU?', answer: 'ReLU suppresses roughly part of the incoming distribution, so the fan-in scaling compensates for lost second moment to keep activation and gradient variance from shrinking rapidly.' },
        { question: 'How do BatchNorm and LayerNorm differ mechanically?', answer: 'BatchNorm computes each channel statistic across batch and usually spatial positions and uses running estimates at inference; LayerNorm computes feature statistics independently inside each example.' },
        { question: 'Where does gradient clipping belong in a mixed-precision accumulated update?', answer: 'Accumulate the correctly scaled losses, unscale the gradients at the update boundary, clip the unscaled global gradient, then call the optimizer and scaler updates before clearing gradients.' },
        { question: 'Which production evidence shows mixed precision is safe?', answer: 'Compare finite-loss and overflow rates, gradients, convergence, calibration and critical quality slices while measuring target-hardware throughput, p99 step time, peak memory, and recovery from checkpoints.' }
      ]
    },
    {
      id: 'mlops-scale',
      title: 'Distributed training, ML lifecycle, and serving at scale',
      required: true,
      summary: 'MLOps is the set of versioned contracts and gates that make experiments reproducible, training recoverable, artifacts promotable, serving measurable, and rollback routine. Senior answers distinguish data parallel communication, memory sharding, lineage, deployment automation, inference scheduling, and quality observability instead of drawing one undifferentiated pipeline.',
      keyPoints: [
        'DistributedDataParallel replicates parameters on each rank, partitions input data, and all-reduces gradients. It reduces wall time when compute overlaps communication, but each rank still owns a full model, gradients, and optimizer state.',
        'FSDP shards parameters, gradients, and optimizer state across ranks and all-gathers parameter shards around computation; ZeRO stages progressively shard optimizer state, gradients, then parameters. Both exchange memory for communication and more complex checkpoints.',
        'Effective global batch is per-device microbatch times accumulation steps times data-parallel world size. Samplers need rank partitioning and an epoch seed; metric reduction must distinguish sums, counts, means, and duplicates.',
        'Experiment tracking binds code revision, configuration, seeds, environment, data snapshot, metrics, and immutable artifacts to one run. A model registry adds version, approval evidence, stage or alias, lineage, owner, and rollback target.',
        'ML CI checks code, schemas, feature transformations, deterministic fixtures, data contracts, serialization, and security. Continuous delivery promotes one already-built artifact through offline, integration, shadow, canary, and rollback gates; continuous training is a separate controlled trigger.',
        'Triton targets multi-framework accelerator serving with model repositories, dynamic batching, concurrency, and ensembles. TorchServe offers PyTorch handlers and workers but its maintenance and operator fit must be checked. vLLM targets autoregressive LLM serving with continuous scheduling and KV-cache management.',
        'Serving capacity depends on arrival distribution, queue policy, batching delay, model time, memory, concurrency, and downstream work. For generative systems, time to first token and inter-token latency complement request latency and throughput.',
        'Observability separates service signals, input/schema health, feature and prediction distributions, delayed-label quality, slice metrics, business outcomes, and feedback-loop state. Drift is a diagnostic trigger, not proof that accuracy fell.',
        'Recovery requires atomic, resumable checkpoints with model, optimizer, scheduler, scaler, sampler/progress, and RNG state as needed. Sharded checkpoint format, resharding across world sizes, and corruption handling must be tested before a long run.'
      ],
      formulas: [
        'Global batch size = microbatch per rank × accumulation steps × data-parallel world size, adjusted when the final batch is incomplete.',
        'Ring all-reduce communicates approximately 2(P−1)N/P bytes per rank for N gradient bytes across P ranks, ignoring protocol and topology overhead.',
        'Little’s law for a stable serving stage is average concurrency L=arrival rate λ times average time W; tail behavior still requires the full arrival and service distributions.',
        'A rough autoregressive KV-cache term grows with batch·sequence·layers·2·KV_heads·head_dim·bytes, before allocator fragmentation and runtime workspace.'
      ],
      decisionRules: [
        'Use DDP when the model and optimizer fit per device and scaling efficiency is acceptable; use FSDP or ZeRO when state memory is the blocker and measured communication or checkpoint complexity is affordable.',
        'Promote immutable artifacts by evidence and alias changes rather than rebuilding in each environment; keep data, feature, model, threshold, and serving configuration independently versioned but linked.',
        'Choose Triton, TorchServe, vLLM, or a custom runtime from model family, operator coverage, batching and streaming needs, hardware, observability, maintenance, and team ownership rather than framework loyalty.',
        'Trigger retraining or rollback from a validated quality, policy, or data-contract failure with an owner and runbook; do not automate retraining from a generic drift statistic alone.'
      ],
      pitfalls: [
        'Logging only scalar metrics without data, code, environment, and artifact identity makes the experiment irreproducible and the registry entry unauditable.',
        'A distributed mean of per-rank means is biased when ranks see unequal counts; aggregate numerator and denominator according to the metric definition.',
        'Dynamic batching can increase throughput while violating p99 latency or mixing incompatible shapes; queue delay and batch policy are part of the SLO.',
        'Resuming weights without optimizer, scheduler, scaler, sampler, or RNG state can silently change the optimization trajectory and repeat or skip data.',
        'A feature-distribution alert can reflect seasonality, upstream repair, or benign population change; retraining immediately can amplify feedback or poison labels.'
      ],
      systemDesignUse: 'Draw separate versioned flows for source and data validation, distributed training and recovery, experiment lineage and registry promotion, serving and capacity, monitoring and delayed labels, and rollback. State ownership, SLOs, security boundaries, artifact compatibility, test gates, and degraded behavior for every transition.',
      recall: [
        { question: 'What does DDP replicate that FSDP or ZeRO can shard?', answer: 'Standard DDP keeps a full parameter, gradient, and optimizer-state footprint on each data-parallel rank, while FSDP or higher ZeRO stages partition some or all of those states and communicate them when needed.' },
        { question: 'What makes a model-registry version deployable rather than merely stored?', answer: 'It needs immutable lineage to code, data, configuration and artifacts plus evaluation evidence, compatibility metadata, approval ownership, a promotion mechanism, and a tested rollback target.' },
        { question: 'How should serving-framework choice be evaluated?', answer: 'Benchmark the exported model and real request distribution for correctness, operator fallback, batching or streaming behavior, p50/p99 latency, throughput, memory, observability, failure recovery, and maintenance cost.' },
        { question: 'Why is drift not an automatic retraining command?', answer: 'A statistical input or prediction change does not identify the cause or establish quality loss; it must be tied to stable references, slices, delayed labels or impact proxies, and a controlled response.' }
      ]
    },
    {
      id: 'classical-ml-advanced',
      title: 'Trees, ensembles, density models, and unsupervised structure',
      required: true,
      summary: 'Classical ML breadth is senior-relevant because tabular baselines, interpretable fallbacks, anomaly systems, and exploratory representations often decide whether deep learning is justified. Strong answers connect each family to its objective, assumptions, leakage boundary, calibration, computational shape, and validation unit.',
      keyPoints: [
        'A CART tree greedily partitions features to reduce impurity or squared error. Depth, minimum leaf support, and pruning trade bias against variance; unrestricted trees memorize rare combinations and extrapolate as piecewise constants.',
        'Random forests bag decorrelated trees through bootstrap samples and feature subsampling, reducing variance and providing out-of-bag estimates under sampling assumptions. Class probabilities are vote fractions and may still need calibration.',
        'Gradient-boosted trees fit successive learners to loss gradients. XGBoost adds regularized tree objectives, shrinkage, row and column subsampling, missing-value routing, and efficient split search; boosting remains sensitive to leakage and temporal shift.',
        'Naive Bayes models class priors and conditionally independent feature likelihoods. Its independence assumption can be badly false while rankings remain useful, especially for sparse counts with smoothing.',
        'A Gaussian mixture models data as a weighted sum of Gaussian components and EM alternates responsibilities with parameter updates. Components are density terms, not guaranteed semantic clusters, and covariance choice controls capacity and singularity risk.',
        'DBSCAN defines dense core points through ε neighborhoods and minimum support, expands density-connected components, and marks sparse points as noise. It handles nonconvex shapes but one global density scale struggles across varying density and high dimension.',
        't-SNE preserves local neighbor probabilities through a heavy-tailed low-dimensional embedding; global distances, cluster sizes, and different-run geometry are not trustworthy. UMAP builds a neighborhood graph and optimizes a low-dimensional fuzzy-set representation with its own metric and stochastic choices.',
        'Stacking trains a meta-model on out-of-fold predictions from base learners. In-fold predictions leak base-model fit and make the stacker learn unrealistically confident errors.',
        'Feature scaling matters for distance, kernel, and regularized linear models but not ordinary tree split ordering. Missing-value semantics, categorical encoding, monotonic constraints, and train/serve feature parity remain part of the estimator.'
      ],
      formulas: [
        'Gini impurity is 1−Σ_k p_k²; a split gain is parent impurity minus the child impurities weighted by child sample fractions.',
        'A random-forest prediction averages T trees: f̂(x)=T⁻¹Σ_t f_t(x), reducing uncorrelated variance more than highly correlated variance.',
        'GMM density is p(x)=Σ_k π_k N(x|μ_k,Σ_k), and responsibility r_ik=π_kN(x_i|μ_k,Σ_k)/Σ_jπ_jN(x_i|μ_j,Σ_j).',
        'Boosting update: F_m(x)=F_{m−1}(x)+ηh_m(x), where h_m approximates the negative loss gradient at the current ensemble.'
      ],
      decisionRules: [
        'Start with regularized linear and tree baselines; use boosted trees for heterogeneous tabular interactions, forests for robust low-tuning ensembles, and a single tree when inspectability dominates quality.',
        'Use Naive Bayes for sparse count-like features or a fast probabilistic baseline when its likelihood family is meaningful; calibrate and compare against logistic regression.',
        'Choose GMM when an explicit soft density model and ellipsoidal components are useful; choose DBSCAN when noise and arbitrary density-connected shapes matter and a credible neighborhood scale exists.',
        'Use t-SNE or UMAP for exploratory visualization and neighbor diagnostics only; validate any downstream clustering or decision in the original or separately justified feature space.',
        'Build stacking features strictly out of fold and preserve group or temporal independence through every base learner and meta-learner split.'
      ],
      pitfalls: [
        'Target encoding, imputation, scaling, feature selection, and outlier treatment fitted before the fold split leak validation labels or population statistics.',
        'Tree impurity and gain importances favor high-cardinality or interchangeable features and do not establish causality; correlated features can divide importance arbitrarily.',
        'Choosing DBSCAN ε from a pretty plot, or interpreting t-SNE island distance as semantic separation, turns visualization hyperparameters into unsupported conclusions.',
        'GMM likelihood can diverge when a covariance collapses around one point; regularization, covariance constraints, initialization, and held-out likelihood are required.',
        'A stacker trained on in-sample base predictions sees a much easier distribution than production predictions and usually overfits.'
      ],
      systemDesignUse: 'Use classical ensembles as production baselines, routers, tabular rankers, anomaly models, and interpretable fallbacks. Version every transformation with the estimator; report calibration and quality by time, group, missingness, and density slice; profile update cost, feature availability, p99 latency, and explanation stability.',
      recall: [
        { question: 'How do random forests and gradient boosting differ mechanically?', answer: 'Forests train decorrelated trees largely independently and average them to reduce variance, whereas boosting trains trees sequentially so each new learner follows residual loss gradients left by the current ensemble.' },
        { question: 'What objective does Gaussian-mixture EM optimize?', answer: 'The E-step computes posterior component responsibilities under current parameters and the M-step maximizes the corresponding expected complete-data log likelihood, monotonically improving observed likelihood under exact updates but only to a local optimum.' },
        { question: 'Why can DBSCAN label a valid cluster as noise?', answer: 'Its fixed radius and minimum-neighbor density may not match sparse regions, anisotropic metrics, high-dimensional distance concentration, or varying sampling density.' },
        { question: 'How do you evaluate a production stacking ensemble without leakage?', answer: 'Create meta-features from group- or time-correct out-of-fold base predictions, refit base models only after meta-model selection, and test calibration, latency, diversity, and slice gains on a final untouched split.' }
      ]
    },
    {
      id: 'probability-experimentation',
      title: 'Distributions, statistical tests, experiments, and causal traps',
      required: true,
      summary: 'Senior probability fluency means choosing a distribution from the data-generating process, stating independence and sampling assumptions, quantifying uncertainty and power, and separating randomized causal evidence from observational association. Formulas matter only with the unit, estimand, stopping rule, and failure checks attached.',
      keyPoints: [
        'Bernoulli models one binary trial and Binomial counts successes across a fixed number of conditionally independent equal-probability trials. Overdispersion or dependence invalidates the simple Binomial variance.',
        'Poisson models counts over exposure when events occur independently at a constant rate; Exponential models memoryless waiting time under a homogeneous Poisson process. Seasonality, clustering, censoring, and zero inflation require a richer model.',
        'A Gaussian is defined by mean and variance, but normal-looking averages do not imply raw observations are Gaussian. Standardization changes location and scale, not distributional shape.',
        'The law of large numbers concerns convergence of sample averages; the central limit theorem concerns a normalized sum approaching a limiting distribution under conditions. Neither repairs biased or dependent sampling.',
        'A t-test compares means using estimated standard error; Welch handles unequal variances. Paired tests operate on within-unit differences. Chi-square tests compare categorical counts to expected counts and need adequate expected support and independent units.',
        'Minimum detectable effect is a design target determined by baseline variance or rate, allocation, α, desired power, and test. Sample-ratio mismatch is a pipeline alarm that randomization or exposure logging may be broken.',
        'Repeated peeking inflates false positives under fixed-horizon tests. Sequential probability or group-sequential designs use planned boundaries or always-valid inference; stopping rules and guardrails must be declared before looking.',
        'Monte Carlo estimates expectations with samples and uncertainty falls at the usual 1/sqrt(N) rate absent variance reduction. MCMC constructs a Markov chain with a target stationary distribution; burn-in, mixing, autocorrelation, and convergence diagnostics determine effective samples.',
        'A Markov chain assumes the next-state distribution depends on the current state under the chosen state representation. Stationarity and ergodicity are properties to establish, not defaults.',
        'Randomization identifies an intention-to-treat effect under a valid assignment and interference assumptions. Simpson’s paradox occurs when aggregated and stratified associations differ because group composition and within-group relationships are mixed; the causal graph and estimand decide which comparison matters.'
      ],
      formulas: [
        'Bernoulli mean and variance are p and p(1−p); Binomial(n,p) has mean np and variance np(1−p) under independent equal-p trials.',
        'Poisson(λ exposure) has equal mean and variance λ exposure; Exponential(rate λ) has survival P(T>t)=exp(−λt) and mean 1/λ.',
        'CLT form: sqrt(n)(x̄−μ)/σ converges in distribution to N(0,1) under suitable independence or weak-dependence and finite-variance conditions.',
        'Monte Carlo standard error is s/sqrt(N) for independent draws; for correlated MCMC draws it is approximately s/sqrt(N_eff), where N_eff accounts for autocorrelation.',
        'For a two-arm mean difference, planned standard error is sqrt(σ_A²/n_A+σ_B²/n_B); MDE is the effect magnitude that reaches the chosen α and power under this design.'
      ],
      decisionRules: [
        'Choose Bernoulli/Binomial for binary outcomes, Poisson/negative-binomial-style count models for exposure-adjusted counts, Exponential or survival models for time-to-event, and Gaussian approximations only after checking the estimand and support.',
        'Use Welch rather than pooled t-tests by default for independent means, paired tests for repeated units, and randomization or permutation inference when design-based assumptions are clearer than parametric ones.',
        'Set MDE from product value and risk before calculating sample size; monitor SRM, logging loss, novelty, guardrails, and heterogeneous effects before interpreting the primary metric.',
        'Use a predeclared fixed horizon or a valid sequential design. Correct multiple primary or exploratory tests according to the decision cost rather than reporting the smallest p-value.',
        'Use Monte Carlo for tractable independent simulation and MCMC when direct sampling is unavailable; report effective sample size and diagnostics rather than raw iteration count.'
      ],
      pitfalls: [
        'Treating page views or video frames as independent users understates uncertainty and inflates significance; randomization and analysis units must respect clustering.',
        'A nonsignificant result does not prove equivalence, and a significant result can be smaller than the MDE or practical decision threshold.',
        'Passing a marginal SRM check does not prove treatment delivery is correct inside platform, geography, or eligibility slices.',
        'MCMC trace plots that look dense can still have poor mixing, multimodal trapping, or high autocorrelation; independent chains and diagnostics are necessary.',
        'Conditioning on a mediator or collider can introduce bias, while aggregating confounded groups can create Simpson reversals; more covariates are not automatically safer.'
      ],
      systemDesignUse: 'Define the randomization and analysis unit, estimand, exposure and outcome windows, distributional model, MDE, power, duration, SRM and logging checks, sequential rule, guardrails, multiplicity policy, heterogeneous slices, interference risks, and causal assumptions before launch. Preserve assignment and exposure logs for replay and audit.',
      recall: [
        { question: 'When does a Binomial model fail for conversion counts?', answer: 'It fails when trials have unequal probabilities, dependence, changing exposure, clustering, overdispersion, or an ill-defined fixed number of opportunities.' },
        { question: 'What is the difference between the LLN and the CLT?', answer: 'The LLN says an average converges to its expectation under conditions, while the CLT describes the scaled sampling distribution around that expectation; neither guarantees unbiased sampling.' },
        { question: 'Why is sample-ratio mismatch a release blocker?', answer: 'A statistically implausible allocation can signal broken randomization, exposure logging, eligibility, or selective loss, so the treatment-effect estimate may not represent the intended experiment.' },
        { question: 'How should an MCMC result be evaluated for production decision support?', answer: 'Check target and transition correctness, multiple-chain convergence, autocorrelation and effective sample size, sensitivity to initialization and priors, Monte Carlo error, and stability of the actual decision quantity.' },
        { question: 'What creates Simpson’s paradox in an experiment analysis?', answer: 'Different group mixtures can reverse an aggregate association relative to within-group associations; assignment, post-treatment conditioning, the causal graph, and the intended estimand determine the valid aggregation.' }
      ]
    },
    {
      id: 'matrix-decompositions',
      title: 'Academic: matrix decompositions and geometry',
      required: false,
      summary: 'Deep study of bases, subspaces, orthogonality, conditioning, eigendecomposition, SVD, and least squares.',
      keyPoints: [
        'Column space contains all reachable outputs Ax; null space contains inputs mapped to zero. Rank-nullity connects their dimensions.',
        'Orthogonal matrices preserve Euclidean length and improve numerical reasoning.',
        'Least squares projects targets onto the column space; QR and SVD are generally more stable than explicitly forming (XᵀX)⁻¹.',
        'Condition number measures sensitivity to perturbation. Poor conditioning slows gradient methods and amplifies numerical errors.',
        'SVD exposes left/right singular directions and scales; pseudoinverse handles rectangular or rank-deficient systems.'
      ],
      formulas: [
        'Normal equations: XᵀXβ=Xᵀy.',
        'Pseudoinverse from SVD: X⁺=VΣ⁺Uᵀ.',
        'Condition number κ₂(A)=σ_max/σ_min for full-rank A.',
        'Worked application — low-rank embeddings: for centered X=UΣVᵀ, Xₖ=UₖΣₖVₖᵀ is the best rank-k approximation in Frobenius norm. The retained squared-energy fraction is Σᵢ₌₁ᵏσᵢ² / Σᵢσᵢ², so k can be chosen from a reconstruction or memory budget.',
        'For centered X∈ℝⁿˣᵈ with X=UΣVᵀ, XᵀX/(n−1)=V diag(σᵢ²/(n−1))Vᵀ; columns of V are PCA directions, σᵢ²/(n−1) are covariance eigenvalues, and projected scores are XVₖ=UₖΣₖ.'
      ],
      decisionRules: ['Use QR/SVD for stable least squares; use truncated/randomized methods for large low-rank approximation.'],
      pitfalls: [
        'Explicit matrix inversion is rarely the best numerical implementation of solving a linear system.',
        'Applying PCA/SVD without the intended centering—and sometimes feature scaling—can make the leading component describe the mean or units rather than useful variation.',
        'Individual singular vectors are unstable when singular values are repeated or nearly tied; compare the subspace or reconstruction instead of overinterpreting one direction.'
      ],
      recall: [
        { question: 'Why does XᵀX worsen conditioning?', answer: 'Its condition number is squared relative to X, making numerical error more severe.' },
        { question: 'How would you choose the rank for a compressed embedding table?', answer: 'Inspect the singular-value energy or downstream validation curve, then choose the smallest k that meets reconstruction, task-quality, memory, and latency requirements.' },
        { question: 'Why does the pseudoinverse give a useful rank-deficient least-squares solution?', answer: 'It inverts only nonzero singular directions, producing the minimum-norm solution among all coefficient vectors that attain the minimum residual.' }
      ]
    },
    {
      id: 'probability-derivations',
      title: 'Academic: likelihood, MLE, MAP, and latent variables',
      required: false,
      summary: 'Derive common objectives from probabilistic assumptions rather than memorizing their final loss forms.',
      keyPoints: [
        'MLE chooses parameters maximizing observed-data likelihood; minimizing negative log-likelihood converts products into sums.',
        'MAP adds a prior. A Gaussian parameter prior yields an L2-like penalty; a Laplace prior yields an L1-like penalty.',
        'Latent-variable models marginalize unobserved variables. EM alternates expected latent assignments and parameter improvement.',
        'Jensen’s inequality explains evidence lower bounds and why variational inference optimizes a tractable surrogate.'
      ],
      formulas: [
        'θ_MLE=argmaxθ ∏ᵢp(xᵢ|θ)=argminθ -Σᵢlog p(xᵢ|θ).',
        'θ_MAP=argmaxθ [log p(D|θ)+log p(θ)].',
        'Worked derivation — binary classification: with p(y=1|x)=σ(z), -log p(y|x)=-[y log σ(z)+(1-y)log(1-σ(z))], which is binary cross-entropy; a Gaussian prior on weights adds a coefficient-scaled ||w||₂² penalty to the summed negative log-likelihood.',
        'ELBO(q)=E_q[log p(x,z)−log q(z|x)]=log p(x)−KL(q(z|x)||p(z|x)); therefore it lower-bounds log evidence, and maximizing it minimizes the reverse KL to the exact posterior within the variational family.'
      ],
      decisionRules: ['Use probabilistic derivations to check whether a loss matches the assumed observation noise and output distribution.'],
      pitfalls: [
        'A prior is not only a philosophical statement; it changes finite-data estimation and optimization.',
        'Changing a loss from a sum to a mean changes the relative strength of a fixed regularization coefficient, so MAP-style penalty scaling must match the reduction convention and dataset size.',
        'EM only guarantees non-decreasing likelihood under exact updates and can converge to a poor local optimum; initialization and multiple restarts still matter.'
      ],
      recall: [
        { question: 'Why does Gaussian noise imply MSE?', answer: 'The Gaussian negative log-likelihood reduces to squared residuals plus constants when variance is fixed.' },
        { question: 'Why optimize log-likelihood instead of likelihood products?', answer: 'The logarithm preserves the maximizer, turns products into sums, improves numerical stability, and makes gradients decompose over examples.' },
        { question: 'How does MAP differ from MLE as data grows?', answer: 'MAP adds log-prior evidence. With a fixed proper prior, the likelihood usually dominates as the sample grows, while the prior can materially regularize finite-data estimates.' }
      ]
    },
    {
      id: 'statistical-inference-deep',
      title: 'Academic: estimators, tests, and resampling',
      required: false,
      summary: 'Deeper study of estimator properties, bootstrap uncertainty, multiple testing, causal assumptions, and experiment design.',
      keyPoints: [
        'Consistency concerns convergence with data; unbiasedness concerns expected finite-sample value; efficiency concerns variance among estimators.',
        'Bootstrap resamples observed units and must preserve dependence structure through grouped or block variants.',
        'Multiple comparisons inflate false discoveries; family-wise and false-discovery-rate controls answer different goals.',
        'With proper random assignment and well-defined outcomes/no interference, a randomized experiment identifies the intention-to-treat effect; noncompliance does not invalidate ITT, while complier or per-protocol effects require additional assumptions such as exclusion, monotonicity, or ignorability.'
      ],
      formulas: [
        'Sort p-values p₍₁₎≤⋯≤p₍ₘ₎, choose k=max{i:p₍ᵢ₎≤iq/m}, and reject the first k; BH controls FDR at q under independence or appropriate positive dependence (PRDS), not arbitrary dependence without a stronger correction such as Benjamini–Yekutieli.',
        'Worked application — clustered metric uncertainty: sample patients with replacement, keep every image from each sampled patient, recompute the metric difference for each bootstrap replicate, and form a percentile or appropriately corrected interval from the replicate distribution.'
      ],
      decisionRules: ['Resample the deployment-independent unit, not individual correlated observations.'],
      pitfalls: [
        'A naive image-level bootstrap underestimates uncertainty when images cluster by patient or video.',
        'A p-value is not the probability that the null hypothesis is true, and statistical significance does not establish practical effect size or deployment value.',
        'Repeatedly selecting models against the same holdout turns it into training data; use nested validation or a fresh final test set for an honest estimate.'
      ],
      recall: [
        { question: 'Unbiased or lower MSE?', answer: 'Prediction usually values lower expected error; a small bias can be worthwhile if it substantially reduces variance.' },
        { question: 'What unit should a bootstrap resample?', answer: 'The unit that is approximately independent at deployment—such as patient, user, site, or video—while retaining dependent observations inside that unit.' },
        { question: 'Benjamini–Hochberg versus Bonferroni?', answer: 'Bonferroni controls the probability of any family-wise false positive and is conservative; Benjamini–Hochberg controls the expected false-discovery proportion among rejected hypotheses and usually has more power.' }
      ]
    },
    {
      id: 'multivariable-optimization',
      title: 'Academic: multivariable calculus and constrained optimization',
      required: false,
      summary: 'Deep study of Jacobians, Hessians, curvature, Lagrange multipliers, convexity, and optimization geometry.',
      keyPoints: [
        'The Hessian captures local curvature; eigenvalues indicate sharp/flat directions and saddle structure.',
        'Convex objectives make local minima global, but deep networks are non-convex and highly overparameterized.',
        'Lagrange multipliers convert equality constraints into stationary conditions; KKT extends to inequalities under regularity assumptions.',
        'Natural gradient and second-order methods change geometry or curvature scaling but add computation and approximation cost.'
      ],
      formulas: [
        'Second-order approximation: f(x+Δ)≈f(x)+∇fᵀΔ+½ΔᵀHΔ.',
        'Lagrangian: L(x,λ)=f(x)+λᵀg(x).',
        'Worked derivation — minimize x²+y² subject to x+y=1: ∇L=(2x+λ,2y+λ)=0 gives x=y; applying the constraint gives x=y=1/2, the closest feasible point to the origin.'
      ],
      decisionRules: ['Use curvature concepts to reason about conditioning and step size, not to claim simple sharpness-generalization laws.'],
      pitfalls: [
        'A zero gradient can indicate a saddle point, plateau, or minimum; curvature and neighborhood behavior distinguish them.',
        'A positive-semidefinite Hessian at one point is only a local second-order condition and does not prove a non-convex objective is globally minimized.',
        'KKT conditions require primal feasibility, dual feasibility, stationarity, and complementary slackness; their sufficiency also depends on convexity and regularity assumptions.'
      ],
      recall: [
        { question: 'Are saddle points automatically common in high-dimensional nonconvex objectives?', answer: 'High-dimensional nonconvex objectives can have many mixed-curvature saddle directions, but dimension alone does not imply that saddle points are combinatorially common; inspect the actual Hessian/landscape and account for zero modes and parameter symmetries.' },
        { question: 'What does the Lagrange multiplier mean locally?', answer: 'Under regularity conditions, it is the sensitivity of the optimum value to relaxing the corresponding constraint, up to the sign convention used in the Lagrangian.' },
        { question: 'What do Hessian eigenvalues tell you near a stationary point?', answer: 'All positive values indicate a strict local minimum, any negative direction rules out a local minimum, and zero values require higher-order or neighborhood analysis.' }
      ]
    },
    {
      id: 'information-theory',
      title: 'Academic: entropy, cross-entropy, and mutual information',
      required: false,
      summary: 'Information theory clarifies probabilistic losses, coding interpretations, uncertainty, and representation objectives.',
      keyPoints: [
        'Entropy measures expected surprise under a distribution. Cross-entropy evaluates coding/data under another distribution.',
        'KL divergence is nonnegative and asymmetric; minimizing cross-entropy to a fixed target is equivalent to minimizing KL up to target entropy.',
        'Mutual information measures dependence as the KL divergence between the joint and product of marginals.',
        'Contrastive objectives often optimize bounds related to mutual information, but practical behavior depends heavily on sampling and representations.',
        'Data-processing inequality: if a representation Z is computed only from X so that Y→X→Z is a Markov chain, then I(Y;Z)≤I(Y;X); deterministic or stochastic post-processing cannot create information about the target, although finite-sample MI estimators may appear to violate the inequality.'
      ],
      formulas: [
        'H(P)=-Σp(x)log p(x).',
        'H(P,Q)=-Σp(x)log q(x)=H(P)+KL(P||Q).',
        'I(X;Y)=KL(P(X,Y)||P(X)P(Y)).',
        'Worked application — calibration loss: if a binary population has P(y=1)=0.8 but a model always predicts q=0.6, its cross-entropy is -[0.8 log 0.6+0.2 log 0.4]; the excess above H(P) is exactly KL(P||Q), the avoidable coding and predictive penalty.'
      ],
      decisionRules: ['Use entropy as a prediction-distribution summary, not a universal epistemic-uncertainty estimator.'],
      pitfalls: [
        'Low entropy can be confidently wrong under shift.',
        'Differential entropy for continuous variables can be negative and changes under reparameterization; discrete-entropy intuitions do not transfer unchanged.',
        'Naive finite-sample mutual-information estimates can be strongly biased, and high estimated dependence does not establish a causal or task-useful representation.'
      ],
      recall: [
        { question: 'Why is KL not a distance?', answer: 'It is asymmetric and does not satisfy the triangle inequality.' },
        { question: 'Why does minimizing cross-entropy minimize KL for fixed targets?', answer: 'H(P,Q)=H(P)+KL(P||Q), and H(P) is constant with respect to the model distribution Q.' },
        { question: 'When is mutual information zero?', answer: 'For well-defined distributions, I(X;Y)=0 exactly when the joint factorizes as P(X,Y)=P(X)P(Y), meaning X and Y are independent.' }
      ]
    }
  ];

  const codingModules = [
    {
      id: 'python-collections',
      title: 'Python interview collections',
      required: true,
      summary: 'Choose collections from the operations the algorithm needs, not from habit. Python built-ins make intent concise, but their mutation, ordering, and default-value behavior must remain explicit.',
      recognitionCues: [
        'Repeated membership or key lookup suggests dict or set rather than rescanning a list.',
        'FIFO work, counting, grouping, priority, or custom ordering points to deque, Counter/defaultdict, heapq, or a sort key.'
      ],
      invariant: 'The chosen collection always represents one named piece of algorithmic state, and every mutation preserves the meaning you stated for that state.',
      template: [
        'Name the required operations first: lookup, append/pop end, FIFO, frequency, grouping, minimum, or ordered traversal.',
        'Select the collection whose expected operation costs match those needs, then state its empty/default behavior.',
        'Keep tuple/list mutability, heap ordering, and sort-key direction explicit while tracing one representative update.'
      ],
      code: [
        { label: 'Pick the collection from the operation', body: `from collections import Counter, defaultdict, deque
import heapq

seen = set()                 # O(1) membership
freq = Counter(nums)         # value -> count
groups = defaultdict(list)   # key -> list of members
queue = deque()              # O(1) append + popleft (FIFO / BFS)
heap = []                    # min-heap via heapq.heappush / heappop` },
        { label: 'Worked example — Group Anagrams', body: `from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))   # canonical, immutable signature
        groups[key].append(s)
    return list(groups.values())` }
      ],
      complexity: [
        'dict and set lookup/update are expected O(1), list append is amortized O(1), and deque append/popleft are O(1).',
        'Sorting n items costs O(n log n); heap push/pop cost O(log n), while reading the heap minimum costs O(1).'
      ],
      pitfalls: [
        'list.pop(0) shifts remaining elements and is O(n); use deque for a queue.',
        'defaultdict access can create a key, Counter retains zero counts unless cleaned, and heapq is a min-heap unless values are transformed.'
      ],
      recall: [
        { question: 'When should a set replace a list for membership checks?', answer: 'When membership is frequent and order or duplicate counts are not part of the required state; expected lookup falls from O(n) to O(1).' },
        { question: 'Why is a sort key often safer than a custom comparator in Python?', answer: 'The key is computed once per item, states the ordering directly, and avoids subtle comparator consistency and repeated-computation errors.' }
      ]
    },
    {
      id: 'big-o',
      title: 'Big-O time and space',
      required: true,
      summary: 'Complexity describes how resource use grows with input, including hidden work performed by library operations. Strong answers define the input variables and separate auxiliary space from output storage.',
      recognitionCues: [
        'Nested work is not automatically quadratic; ask how often each pointer, edge, or element can be processed overall.',
        'A request for scalability, a tighter bound, or a memory tradeoff requires naming the dominant operation and input dimensions.'
      ],
      invariant: 'Every complexity claim is justified by a count of operations or retained state over clearly defined input variables, including amortized work where applicable.',
      template: [
        'Define variables such as n items, V vertices, E edges, or k retained candidates before counting.',
        'Count loop iterations and the cost of operations inside them; use aggregate reasoning when work is amortized.',
        'Report worst-case or expected assumptions explicitly, then state auxiliary space separately from returned output.'
      ],
      code: [
        { label: 'Count how often the inner work runs', body: `# O(n): each item touched once
for x in nums:
    work(x)

# O(n^2): for every item, scan them all again
for i in range(len(nums)):
    for j in range(len(nums)):
        work(nums[i], nums[j])` },
        { label: 'Worked example — two pointers is O(n), not O(n^2)', body: `def is_palindrome(s):
    lo, hi = 0, len(s) - 1
    while lo < hi:              # each index is visited at most once
        if s[lo] != s[hi]:
            return False
        lo += 1
        hi -= 1
    return True                 # total moves <= n  ->  O(n) time, O(1) space` }
      ],
      complexity: [
        'Sequential phases add and nested independent phases multiply; discard constants and lower-order terms only after deriving the expression.',
        'Hash-table operations are expected O(1), dynamic-array append is amortized O(1), and recursion may add O(depth) stack space.'
      ],
      pitfalls: [
        'Calling two pointers O(n²) because there are two variables ignores that each pointer may move only n times.',
        'Ignoring slicing, string concatenation, sorting, recursion frames, or copied substrings understates real time or space.'
      ],
      recall: [
        { question: 'Why can a loop containing a while loop still be O(n)?', answer: 'If a shared pointer only advances and never retreats, its total advances across all outer iterations are at most n, so the aggregate work is linear.' },
        { question: 'What is the difference between expected and worst-case hash lookup?', answer: 'With well-distributed hashes lookup is expected O(1), but severe collisions can place many keys together and make a worst-case lookup O(n).' }
      ]
    },
    {
      id: 'hashing',
      title: 'Hashing, prefix state, and suffix state',
      required: true,
      summary: 'Hashing trades memory for fast indexed lookup, while prefix/suffix arrays carry an associative summary from each side of an array. Both patterns ask what compact state about already processed or not-yet-processed elements makes the current answer constant-time.',
      recognitionCues: [
        'The question asks whether a value, complement, signature, or previously seen state exists, which suggests a set or map.',
        'Each output needs information from everything to its left and right, but division, repeated rescans, or mutation is disallowed, which suggests prefix and suffix state.',
        'Items must be counted or grouped by an equivalence class that can be encoded as an immutable key.'
      ],
      invariant: 'At index i, the hash table exactly summarizes prior items needed by future lookups, or the running prefix/suffix value exactly summarizes elements strictly before/after i without including nums[i].',
      template: [
        'For hashing, define the lookup question and canonical immutable key, query in the self-match-safe order, then update only state future iterations need.',
        'For prefix/suffix output, define the identity value, write the left aggregate into answer[i] before consuming nums[i], then sweep right and combine before consuming nums[i].',
        'State whether duplicates overwrite, accumulate, or remain distinct, and trace empty, singleton, duplicate, and zero-containing inputs.'
      ],
      code: [
        { label: 'Hashing template — query prior state before update', body: `def scan(nums):
    seen = {}                   # key -> info about a past item
    for i, x in enumerate(nums):
        if want(x) in seen:     # can current x pair with a prior item?
            return seen[want(x)], i
        seen[key(x)] = i        # update after querying to avoid self-match
    return None` },
        { label: 'Worked example — Two Sum', body: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            return [seen[complement], i]
        seen[x] = i
    return []` },
        { label: 'Worked example — Product Except Self with prefix/suffix state', body: `def product_except_self(nums):
    answer = [1] * len(nums)

    prefix = 1
    for i, value in enumerate(nums):
        answer[i] = prefix      # product strictly left of i
        prefix *= value

    suffix = 1
    for i in range(len(nums) - 1, -1, -1):
        answer[i] *= suffix     # combine product strictly right of i
        suffix *= nums[i]
    return answer` }
      ],
      complexity: [
        'One pass with expected O(1) hash operations is O(n) time and usually O(n) auxiliary space; constructing each k-sized key can raise work to O(nk).',
        'Product Except Self uses O(n) time and O(1) auxiliary space beyond the required output; the output array temporarily stores prefix products.'
      ],
      pitfalls: [
        'Using a mutable or non-canonical hash key separates values that should share a group; updating before querying can create self-matches.',
        'Writing the prefix after multiplying by nums[i], or the suffix after consuming nums[i], incorrectly includes the excluded element.',
        'Division fails the intended pattern and needs special handling for one or multiple zeros; two directional sweeps handle zeros naturally.'
      ],
      recall: [
        { question: 'What makes a good hash-map key for grouping?', answer: 'It is immutable, canonical, and equal exactly when two inputs belong to the same required equivalence class.' },
        { question: 'When is a frequency map preferable to a set?', answer: 'When multiplicity affects validity, reconstruction, ranking, or removal; a set records presence but loses how many copies remain.' },
        { question: 'What is the prefix/suffix invariant in Product Except Self?', answer: 'Before consuming nums[i], prefix is the product strictly left of i and suffix is the product strictly right of i, so their product excludes nums[i] without division.' }
      ]
    },
    {
      id: 'two-pointers',
      title: 'Two pointers and ordered convergence',
      required: true,
      summary: 'Two pointers replace repeated pair enumeration when ordering or a maintained region proves which candidates can be discarded. The proof for each movement matters more than the syntax.',
      recognitionCues: [
        'The input is sorted, can be sorted safely, or asks about pairs, boundaries, partitioning, or in-place compaction.',
        'A decision at the current endpoints eliminates every pair involving one endpoint, allowing monotonic movement.'
      ],
      invariant: 'Everything outside the active pointer range has been resolved, and the pointer-movement rule never discards a candidate that could satisfy the objective.',
      template: [
        'State what the left and right pointers bound and which region is already resolved.',
        'Evaluate the current pair or boundary, then move exactly the pointer whose change can improve feasibility or the objective.',
        'Handle duplicates or writes deliberately and stop when the active region can no longer contain a new answer.'
      ],
      code: [
        { label: 'Move the endpoint that can improve the answer', body: `def converge(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        if too_small(nums[lo], nums[hi]):
            lo += 1             # only a bigger left value can help
        else:
            hi -= 1             # only a smaller right value can help` },
        { label: 'Worked example — Valid Palindrome', body: `def is_palindrome(s):
    t = [c.lower() for c in s if c.isalnum()]
    lo, hi = 0, len(t) - 1
    while lo < hi:
        if t[lo] != t[hi]:
            return False
        lo += 1
        hi -= 1
    return True` }
      ],
      complexity: [
        'Monotonic pointers each move at most n positions, giving O(n) scanning time and often O(1) auxiliary space.',
        'If sorting is required, total time becomes O(n log n), and copying versus in-place sorting changes the space claim.'
      ],
      pitfalls: [
        'Moving a pointer without an ordering proof can skip valid candidates even if sample cases pass.',
        'Duplicate skipping before recording a valid result or after the wrong pointer move can lose answers or emit duplicates.'
      ],
      recall: [
        { question: 'Why does endpoint movement work for a sorted pair-sum search?', answer: 'If the sum is too small, pairing the smallest value with any smaller right endpoint cannot help, so only increasing the left value can reach the target; the symmetric argument handles a large sum.' },
        { question: 'When does sorting make a two-pointer approach invalid?', answer: 'When original order or indices are required and cannot be preserved, or when the movement proof depends on information sorting destroys.' }
      ]
    },
    {
      id: 'sliding-window',
      title: 'Sliding windows',
      required: true,
      summary: 'A sliding window maintains state for a contiguous range as boundaries move forward. Fixed-width windows use rolling add/remove updates; variable-width windows additionally require that violations can be repaired monotonically by advancing one boundary.',
      recognitionCues: [
        'The target is a longest, shortest, count, or feasibility property over contiguous subarrays or substrings.',
        'A fixed-size range needs a rolling aggregate, frequency table, or deque as one item enters and one leaves.',
        'For variable width, adding the rightmost item changes compact state and removing leftmost items must monotonically restore a violated constraint.'
      ],
      invariant: 'The maintained state describes exactly the current range. A fixed-width answer is recorded only after the range reaches its required size; a variable-width answer is recorded only after its repair loop restores validity.',
      template: [
        'Choose fixed or variable width and define state that can be updated in O(1) or bounded time.',
        'For fixed width, add the entering item, remove the item that falls outside the width, then record once the window has the required size.',
        'For variable width, expand right and update state; while invalid, remove the left item and advance left.',
        'Record the answer only where the chosen invariant guarantees the window is a valid candidate.'
      ],
      code: [
        { label: 'Expand right, shrink left while invalid', body: `def window(s):
    state = {}                  # summary of the current window
    left = best = 0
    for right, ch in enumerate(s):
        add(state, ch)
        while invalid(state):   # repair from the left
            remove(state, s[left])
            left += 1
        best = max(best, right - left + 1)
    return best` },
        { label: 'Worked example — Longest Substring Without Repeating Characters', body: `def length_of_longest_substring(s):
    last = {}                   # char -> most recent index
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1  # jump past the repeat
        last[ch] = right
        best = max(best, right - left + 1)
    return best` }
      ],
      complexity: [
        'When each boundary advances at most n times and state updates are O(1), total time is O(n), not O(n²).',
        'Space is O(k) for the number of distinct symbols or tracked categories, or O(1) when the alphabet is fixed.'
      ],
      pitfalls: [
        'Using a variable window when negative values or non-monotonic validity prevent leftward shrinking from predictably repairing the condition.',
        'Applying a shrink-until-valid loop to a fixed-width problem instead of removing exactly the item that left the range.',
        'Updating the answer before the fixed window is full or variable-window validity is restored, or leaving zero-count keys that create stale state.'
      ],
      recall: [
        { question: 'What property makes a variable sliding window possible?', answer: 'Once expansion violates the constraint, advancing the left edge must move the window monotonically toward validity without requiring reconsideration of removed starts.' },
        { question: 'How does a fixed-width window differ?', answer: 'Its size is prescribed: each step adds the entering item and, after the width is exceeded, removes exactly the departing item. It does not need a monotonic validity-repair condition.' },
        { question: 'Why is the usual two-boundary window O(n)?', answer: 'The right boundary enters each item once and the left boundary removes each item at most once, so the combined number of moves is at most 2n.' }
      ]
    },
    {
      id: 'stack-monotonic',
      title: 'Stacks and monotonic stacks',
      required: true,
      summary: 'A stack models nested work or unresolved candidates in last-in-first-out order. A monotonic stack additionally removes candidates that can no longer answer any future query.',
      recognitionCues: [
        'Balanced delimiters, expression evaluation, undo, nested scopes, or deferred completion have LIFO structure.',
        'Nearest greater or smaller elements and next boundary questions suggest retaining unresolved indices in monotonic order.'
      ],
      invariant: 'The stack contains only unresolved items in the declared order; each pop either matches the current item or proves the popped candidate is permanently resolved or dominated.',
      template: [
        'Decide whether the stack stores values, indices, partial results, or pairs, and state what the top means.',
        'Before pushing the current item, pop while the resolution or dominance condition holds and process each popped item.',
        'Push any still-relevant current state, then handle unresolved leftovers according to the problem definition.'
      ],
      code: [
        { label: 'Pop everything the current item resolves', body: `def monotonic(nums):
    stack = []                  # indices of unresolved items
    answer = [0] * len(nums)
    for i, x in enumerate(nums):
        while stack and resolves(x, nums[stack[-1]]):
            j = stack.pop()
            answer[j] = i - j   # current item resolves index j
        stack.append(i)
    return answer` },
        { label: 'Worked example — Daily Temperatures', body: `def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                  # days still waiting for a warmer day
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer` }
      ],
      complexity: [
        'A monotonic-stack scan is O(n) because each item is pushed once and popped at most once, even with a nested while loop.',
        'The stack can retain O(n) unresolved items in a monotone input; basic top, push, and pop are O(1).'
      ],
      pitfalls: [
        'Storing values when distance or duplicate identity matters loses the index needed to resolve the answer.',
        'Choosing strict versus non-strict comparison incorrectly changes duplicate handling and can pop an equal candidate too early.'
      ],
      recall: [
        { question: 'Why is a monotonic stack amortized O(n)?', answer: 'Although one iteration may pop many entries, every entry can be pushed once and removed once, so all pop work across the scan is linear.' },
        { question: 'What should determine whether equal values are popped?', answer: 'The required boundary semantics: whether an equal value counts as greater/smaller and which duplicate must remain to answer distances or spans.' }
      ]
    },
    {
      id: 'binary-search',
      title: 'Binary search over monotonic spaces',
      required: true,
      summary: 'Binary search repeatedly removes half of an ordered search space. It applies to sorted values and to any answer domain with a monotonic feasibility predicate.',
      recognitionCues: [
        'The input is sorted or rotated-sorted, or the prompt asks for the first/last position satisfying a condition.',
        'An optimization answer can be tested as feasible or infeasible, with feasibility changing in only one direction.'
      ],
      invariant: 'The active bounds always contain every possible answer under one chosen interval convention, and each comparison proves one excluded half cannot contain the target boundary.',
      template: [
        'Choose closed [lo, hi] or half-open [lo, hi) bounds and write its loop and update rules consistently.',
        'Compute mid safely, evaluate target comparison or monotonic predicate, and retain the half that may contain the boundary.',
        'Return the converged boundary only after checking that it satisfies the target condition when absence is possible.'
      ],
      code: [
        { label: 'Keep the half that can still contain the answer', body: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1   # closed interval [lo, hi]
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1        # answer is to the right
        else:
            hi = mid - 1        # answer is to the left
    return -1` },
        { label: 'Worked example — search on the answer (Koko Eating Bananas)', body: `def min_eating_speed(piles, h):
    def hours(speed):
        return sum((p + speed - 1) // speed for p in piles)
    lo, hi = 1, max(piles)
    while lo < hi:              # smallest feasible speed
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid            # feasible: try slower
        else:
            lo = mid + 1
    return lo` }
      ],
      complexity: [
        'Searching n discrete candidates takes O(log n) predicate evaluations and O(1) auxiliary space when iterative.',
        'Binary search on an answer costs O(log R × C), where R is the answer range and C is the cost of one feasibility check.'
      ],
      pitfalls: [
        'Mixing interval conventions causes infinite loops, skipped endpoints, or out-of-bounds reads.',
        'A predicate that flips more than once is not monotonic, so binary search can confidently discard the true answer.'
      ],
      recall: [
        { question: 'How do you recognize binary search on an answer?', answer: 'Candidate answers are ordered and a feasibility test partitions them into one contiguous false region and one contiguous true region, or the reverse.' },
        { question: 'Why must the interval convention be stated before coding?', answer: 'Closed and half-open intervals require different loop conditions and bound updates; mixing them breaks the invariant and often prevents termination.' }
      ]
    },
    {
      id: 'linked-lists',
      title: 'Linked-list pointer manipulation',
      required: true,
      summary: 'Linked-list problems test whether references can be rewired without losing the unprocessed suffix. Dummy nodes and explicit pointer roles reduce boundary special cases.',
      recognitionCues: [
        'Nodes must be inserted, removed, reversed, merged, or reordered without random access.',
        'The task asks about a cycle, midpoint, or distance from the end, suggesting fast and slow pointers.'
      ],
      invariant: 'Every needed successor is saved before a link is overwritten. For deletion of the nth node from the end, a dummy predecessor is retained and the fast pointer stays n+1 links ahead of slow until fast reaches null.',
      template: [
        'Draw node identities and assign one role to each pointer; introduce a dummy node when the head may change.',
        'Save the next node before overwriting a link, perform the local rewire, then advance pointers in dependency order.',
        'Dry-run empty, one-node, two-node, odd-length, and even-length cases and verify termination or cycle behavior.'
      ],
      code: [
        { label: 'Dummy-node operation — Remove Nth Node From End', body: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)   # deletion always has a predecessor
    fast = slow = dummy

    for _ in range(n + 1):     # maintain an n+1-link gap
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next

    slow.next = slow.next.next  # slow precedes the target
    return dummy.next` },
        { label: 'Worked example — Reverse Linked List', body: `def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next          # save suffix
        cur.next = prev         # flip the link
        prev, cur = cur, nxt    # advance
    return prev                 # new head` }
      ],
      complexity: [
        'A single pass is O(n) time; pointer-only transformations usually use O(1) auxiliary space.',
        'Recursion over n nodes adds O(n) call-stack space even when no explicit data structure is allocated.'
      ],
      pitfalls: [
        'Overwriting current.next before saving it can make the remaining list unreachable.',
        'Incorrect fast-pointer guards can dereference null or choose the wrong middle for even-length lists.'
      ],
      recall: [
        { question: 'Why does a dummy node simplify linked-list code?', answer: 'It gives the head a predecessor, so insertion, deletion, and merging can use the same rewiring logic even when the first real node changes.' },
        { question: 'What must be saved before reversing a link?', answer: 'The original successor of the current node, because assigning current.next to the previous node otherwise disconnects access to the unprocessed suffix.' }
      ]
    },
    {
      id: 'trees',
      title: 'Tree traversal and recursive state',
      required: true,
      summary: 'Tree solutions become clear when each call or queue entry has a precise meaning. Choose DFS for subtree information and path state; choose BFS for level or minimum-edge-distance structure.',
      recognitionCues: [
        'The answer for a node combines answers from its children, which naturally defines a postorder DFS return value.',
        'The task asks for levels, nearest depth, or breadth-wise order, which suggests BFS with an explicit frontier.'
      ],
      invariant: 'Each recursive call returns the documented summary for exactly its subtree, or each BFS frontier contains exactly the nodes at the current depth.',
      template: [
        'Define the empty-tree base result and the meaning of the DFS return value or BFS queue entry before traversing.',
        'Process preorder for inherited state, inorder for BST order, or postorder when the parent depends on child summaries.',
        'Separate a subtree return value from any global best, and trace a leaf plus a skewed tree.'
      ],
      code: [
        { label: 'Return a subtree summary (DFS) or sweep levels (BFS)', body: `def dfs(node):
    if not node:                # base case = the empty answer
        return 0
    left = dfs(node.left)       # child summaries first (postorder)
    right = dfs(node.right)
    return combine(left, right) # this node's answer

from collections import deque
def bfs(root):
    q = deque([root] if root else [])
    while q:
        for _ in range(len(q)): # one whole level per outer step
            node = q.popleft()
            for child in (node.left, node.right):
                if child:
                    q.append(child)` },
        { label: 'Worked example — Maximum Depth of Binary Tree', body: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))` }
      ],
      complexity: [
        'Visiting each node once is O(n) time; DFS uses O(h) stack space where h is height, worst-case O(n).',
        'BFS can retain O(w) nodes where w is maximum width; balanced-tree search can be O(log n), but skew destroys that bound.'
      ],
      pitfalls: [
        'Returning a global answer where the parent needs a composable subtree summary mixes two different meanings.',
        'Assuming a binary search tree is balanced or using local parent-child checks instead of propagated value bounds gives incorrect claims.'
      ],
      recall: [
        { question: 'When is postorder traversal the natural choice?', answer: 'When a node cannot compute its answer until summaries from its children are known, such as height, balance, or a path through the node.' },
        { question: 'Why is DFS space O(h) rather than always O(log n)?', answer: 'The recursion stack follows tree height; only balanced trees guarantee logarithmic height, while a skewed tree can have height n.' }
      ]
    },
    {
      id: 'heaps',
      title: 'Heaps and bounded priority state',
      required: true,
      summary: 'A heap maintains access to one priority extreme without fully sorting everything. The key decision is which item should be easiest to evict or process next.',
      recognitionCues: [
        'The task repeatedly requests the smallest or largest available item as data arrives or states evolve.',
        'Only the best k candidates matter, so the least useful retained candidate should sit at the heap root.'
      ],
      invariant: 'The heap contains exactly the active candidates needed by the algorithm, and its root is the next item to process or the first retained item to evict.',
      template: [
        'Define the priority tuple, including deterministic tie-breakers, and state whether the root represents best-next or worst-kept.',
        'Push new candidates and pop while size or validity rules are violated; discard stale entries when lazy deletion is used.',
        'Read or remove the root only when the invariant proves it is current and relevant.'
      ],
      code: [
        { label: 'Keep only the k best; the worst sits at the root', body: `import heapq

def top_k(nums, k):
    heap = []                   # min-heap of the k largest so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap) # evict the smallest kept
    return heap                 # heap[0] is the kth largest` },
        { label: 'Worked example — Last Stone Weight (max-heap via negation)', body: `import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones] # negate: Python heaps are min-heaps
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)  # largest
        b = -heapq.heappop(heap)  # second largest
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0` }
      ],
      complexity: [
        'Building a heap from n items with heapify is O(n); each push or pop is O(log n), and peek is O(1).',
        'Maintaining k candidates across n items costs O(n log k) time and O(k) space, often better than sorting all n items.'
      ],
      pitfalls: [
        'Keeping the best item at the root for top-k retention can make it hard to evict the worst retained candidate.',
        'Python tuple priorities compare later fields on ties, which can raise errors for non-comparable payloads or introduce unintended ordering.'
      ],
      recall: [
        { question: 'For the k largest items, what should a size-k min-heap contain?', answer: 'It contains the k largest values seen so far, with the smallest retained value at the root so a better incoming value can replace it.' },
        { question: 'Why can heapify be O(n) instead of O(n log n)?', answer: 'Most nodes are near the leaves and require little or no sift-down work; summing work by node height yields a linear total.' }
      ]
    },
    {
      id: 'graphs-union-find',
      title: 'Graph traversal, topological sorting, and union-find',
      required: true,
      summary: 'Graphs require explicit node identity, directedness, neighbor generation, and visitation timing. DFS/BFS explores reachability, topological sorting orders directed dependencies, and union-find maintains undirected connectivity under edge additions.',
      recognitionCues: [
        'Relationships form arbitrary adjacency, a grid acts as an implicit graph, or the task asks for reachability, components, cycles, or ordering.',
        'Prerequisites, build dependencies, or “can all tasks finish?” describe a directed graph and call for a topological-order or directed-cycle invariant.',
        'Undirected connectivity changes through edge additions and queries do not need actual paths, suggesting disjoint-set union.',
        'A minimum-cost path in a graph with nonnegative edge weights calls for Dijkstra; any negative edge requires a different algorithm such as Bellman–Ford.'
      ],
      invariant: 'Traversal schedules each logical state once; Kahn’s queue contains exactly zero-indegree unfinished vertices and removes each outgoing edge once; DFS coloring never enters a gray node on an acyclic path; with nonnegative weights, each non-stale Dijkstra pop finalizes that node’s shortest distance, so no later relaxation can improve it; union-find roots name disjoint components.',
      template: [
        'Define vertices, edge direction, and neighbor generation, including expanded state such as node-plus-mask when history changes future moves.',
        'Choose BFS for unweighted shortest edges or DFS for exhaustive structure; mark visited at enqueue/push when duplicate scheduling is harmful.',
        'For dependencies, build adjacency plus indegree and count Kahn removals, or use white/gray/black DFS where an edge to gray proves a cycle.',
        'For union-find, initialize one parent per node, find roots with compression, and union roots by size or rank.',
        'For nonnegative weighted edges, initialize dist, create a monotonic sequence counter, push (0, next(sequence), source) into a min-heap, pop (distance, _, node), skip stale entries, relax outgoing edges, and push (improved_distance, next(sequence), neighbor) so equal distances never compare node keys.'
      ],
      code: [
        { label: 'Traversal template — mark when scheduling', body: `def dfs_grid(grid, row, col, seen):
    if not in_bounds(row, col) or (row, col) in seen or blocked(grid, row, col):
        return
    seen.add((row, col))
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        dfs_grid(grid, row + dr, col + dc, seen)` },
        { label: 'Worked example — Number of Islands', body: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def sink(start_row, start_col):
        stack = [(start_row, start_col)]
        seen.add((start_row, start_col))
        while stack:
            row, col = stack.pop()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1' and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    stack.append((nr, nc))

    count = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == '1' and (row, col) not in seen:
                sink(row, col)
                count += 1
    return count` },
        { label: 'Worked example — Course Schedule with Kahn topological sort', body: `from collections import deque

def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prerequisite in prerequisites:
        graph[prerequisite].append(course)
        indegree[course] += 1

    ready = deque(course for course in range(num_courses) if indegree[course] == 0)
    completed = 0
    while ready:
        prerequisite = ready.popleft()
        completed += 1
        for course in graph[prerequisite]:
            indegree[course] -= 1
            if indegree[course] == 0:
                ready.append(course)

    return completed == num_courses` },
        { label: 'Template — Dijkstra with stale-entry skipping', body: `from itertools import count
from heapq import heappop, heappush

def dijkstra(graph, source):
    # graph maps every vertex to (neighbor, nonnegative_weight) edges.
    if any(weight < 0 for edges in graph.values() for _, weight in edges):
        raise ValueError("Dijkstra requires nonnegative edge weights")

    dist = {node: float("inf") for node in graph}
    dist[source] = 0
    sequence = count()
    heap = [(0, next(sequence), source)]

    while heap:
        distance, _, node = heappop(heap)
        if distance != dist[node]:       # a later relaxation made this entry stale
            continue
        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < dist[neighbor]:
                dist[neighbor] = candidate
                heappush(heap, (candidate, next(sequence), neighbor))

    return dist` }
      ],
      complexity: [
        'Adjacency-list DFS, BFS, Kahn topological sort, and DFS-color cycle detection are O(V + E) time and O(V + E) stored graph plus O(V) frontier/color state.',
        'Union-find with path compression and union by rank performs m operations in O(m α(V)) time, effectively near constant per operation.',
        'Binary-heap Dijkstra on a nonnegative adjacency-list graph is O((V + E) log V) time and O(V + E) space including the graph, distance map, and heap.'
      ],
      pitfalls: [
        'Marking visited only when dequeued can schedule a dense-graph node many times and obscure shortest-path reasoning.',
        'Using an undirected visited rule or union-find for directed dependencies loses direction and can report the wrong cycle behavior.',
        'Reversing prerequisite edges is acceptable only if indegree and queue semantics match that direction; count processed vertices to detect a cycle.',
        'DFS needs separate gray and black states: one visited bit cannot distinguish an active-stack back edge from a completed neighbor.'
      ],
      recall: [
        { question: 'When does BFS guarantee a shortest path?', answer: 'When every edge has equal cost, BFS explores nodes in nondecreasing edge distance from the source; weighted graphs require a priority-aware algorithm.' },
        { question: 'What invariant makes Kahn topological sorting detect a directed cycle?', answer: 'Only vertices with zero remaining prerequisites enter the queue. A cycle leaves every cycle vertex with positive indegree, so fewer than V vertices are removed.' },
        { question: 'How does DFS-color cycle detection work mechanically?', answer: 'White is unseen, gray is on the active recursion path, and black is complete; an edge to gray is a back edge and proves a directed cycle.' },
        { question: 'What information does union-find intentionally not provide?', answer: 'It answers component membership and merging, but not an explicit path, traversal order, edge direction, or dependency order.' }
      ]
    },
    {
      id: 'intervals',
      title: 'Intervals and sweep ordering',
      required: true,
      summary: 'Interval problems become tractable after choosing endpoint semantics and an ordering that makes earlier intervals final. Most bugs come from undefined overlap rules rather than the merge loop itself.',
      recognitionCues: [
        'Ranges must be merged, inserted, scheduled, counted, or removed based on overlap.',
        'A timeline asks how many activities are active or which interval can finish first.'
      ],
      invariant: 'Processed intervals are represented by a finalized non-overlapping prefix or by active events, and the current candidate is the only unresolved interval that may combine with the next one.',
      template: [
        'Define whether endpoints are closed, open, or half-open and whether touching intervals count as overlap.',
        'Sort by the endpoint that supports the proof: usually start for merging, end for greedy selection, or event time for a sweep.',
        'Compare the next interval with the current boundary, then merge, emit, count, or replace according to the objective.'
      ],
      code: [
        { label: 'Sort by start, then merge into the last kept interval', body: `def merge_pattern(intervals):
    intervals.sort(key=lambda iv: iv[0])   # start order makes earlier final
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:        # overlaps the last kept interval
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out` },
        { label: 'Worked example — Non-overlapping Intervals (greedy by end)', body: `def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])   # earliest finish first
    removed, end = 0, float('-inf')
    for s, e in intervals:
        if s >= end:            # no overlap: keep it
            end = e
        else:
            removed += 1        # overlaps: drop this one
    return removed` }
      ],
      complexity: [
        'Sorting dominates at O(n log n); the subsequent merge or greedy scan is O(n), with O(n) output in the worst case.',
        'If intervals arrive already sorted and the invariant is preserved, processing can be O(n); active-overlap tracking may use a heap.'
      ],
      pitfalls: [
        'Treating [a,b] and [b,c] as overlapping without matching the domain endpoint convention changes results.',
        'Sorting by start for an earliest-finish greedy proof, or mutating caller-owned intervals unexpectedly, breaks correctness or API expectations.'
      ],
      recall: [
        { question: 'Why does sorting by start enable interval merging?', answer: 'Any future overlap with the merged prefix can only involve the current last merged interval; earlier merged intervals end no later and are already final.' },
        { question: 'Why must endpoint semantics be stated explicitly?', answer: 'Whether equality means overlap depends on the domain, so the comparison operator and event tie ordering cannot be chosen correctly without that definition.' }
      ]
    },
    {
      id: 'backtracking',
      title: 'Backtracking and reversible choices',
      required: true,
      summary: 'Backtracking explores a decision tree while maintaining one partial candidate. Correctness comes from enumerating every allowed next choice exactly once and undoing mutations before visiting siblings.',
      recognitionCues: [
        'The output asks for all combinations, permutations, placements, partitions, or paths under constraints.',
        'A partial choice can be rejected early, but no single greedy choice is guaranteed to lead to every solution.'
      ],
      invariant: 'At recursion depth d, the path contains exactly the d choices for the current branch, satisfies all enforced constraints, and is restored before another sibling branch begins.',
      template: [
        'Define the state, choice set, goal condition, and pruning rule; state whether choices can be reused.',
        'For each legal choice, apply it, recurse on the smaller decision state, then undo the mutation.',
        'Copy the path when recording a result and use a start index or used set to prevent unintended duplicates.'
      ],
      code: [
        { label: 'Choose, recurse, un-choose', body: `def backtrack(start, path):
    if is_goal(path):
        results.append(path[:])            # copy: path keeps mutating
        return
    for i in range(start, len(choices)):
        if not allowed(choices[i]):
            continue
        path.append(choices[i])            # choose
        backtrack(i + 1, path)             # explore
        path.pop()                         # un-choose` },
        { label: 'Worked example — Subsets', body: `def subsets(nums):
    results = []
    def backtrack(start, path):
        results.append(path[:])            # every node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])           # choose
            backtrack(i + 1, path)         # explore (no reuse)
            path.pop()                     # un-choose
    backtrack(0, [])
    return results` }
      ],
      complexity: [
        'Complexity is proportional to the explored decision tree and output size, often O(2ⁿ), O(n!), or another exponential bound.',
        'The active recursion/path state is usually O(depth), excluding output; copying each result adds work proportional to result length.'
      ],
      pitfalls: [
        'Appending the same mutable path object to results makes all saved answers change during later backtracking.',
        'Pruning without proving that no completion can succeed silently removes valid solutions; duplicate inputs also require deliberate ordering and skipping.'
      ],
      recall: [
        { question: 'What does the undo step guarantee in backtracking?', answer: 'It restores the exact state that existed before the choice, so sibling branches begin from the same parent state and cannot contaminate one another.' },
        { question: 'How is backtracking different from ordinary DFS?', answer: 'Backtracking is DFS over a decision space with explicit apply-and-undo state changes and pruning of partial candidates that cannot lead to valid outputs.' }
      ]
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic programming',
      required: true,
      summary: 'Dynamic programming caches answers to overlapping subproblems. The difficult step is defining a state that contains exactly the information needed for future decisions and a recurrence that only uses solved states.',
      recognitionCues: [
        'The task asks for an optimal value or count over repeated choices, and naive recursion revisits the same remaining state.',
        'A solution can be expressed from smaller prefixes, suffixes, capacities, positions, or finite decision modes.'
      ],
      invariant: 'Each memo or table entry equals the answer for its precisely defined subproblem, and every transition reads only states whose answers are already valid.',
      template: [
        'Write the recursive question in words, then choose the minimal state variables that make its answer independent of prior history.',
        'Specify base cases and enumerate legal transitions with min, max, sum, or boolean combination.',
        'Memoize the recurrence first if helpful; for tabulation, choose an order where every dependency is computed before use and compress only proven-unused history.'
      ],
      code: [
        { label: 'Define the state, then fill from solved subproblems', body: `def dp_1d(n):
    if n == 0:
        return base0

    dp = [0] * (n + 1)          # dp[i] = answer for subproblem i
    dp[0], dp[1] = base0, base1
    for i in range(2, n + 1):
        dp[i] = combine(dp[i - 1], dp[i - 2])  # reads only solved states
    return dp[n]` },
        { label: 'Worked example — House Robber', body: `def rob(nums):
    prev, cur = 0, 0            # best up to the two previous houses
    for x in nums:
        prev, cur = cur, max(cur, prev + x)  # skip vs. rob this house
    return cur` }
      ],
      complexity: [
        'Time is usually number of distinct states multiplied by transitions per state; space is the number of cached states plus recursion depth.',
        'State compression can reduce O(n) or O(nk) storage when each transition uses only a fixed number of prior layers, without changing time.'
      ],
      pitfalls: [
        'Including unnecessary history creates an exponential state space, while omitting information makes two behaviorally different subproblems collide.',
        'Wrong base values or iteration order can make unreachable states appear valid and reuse current-row values when only previous-row values are allowed.'
      ],
      recall: [
        { question: 'How do you estimate a dynamic-programming solution’s time complexity?', answer: 'Count the reachable distinct states and multiply by the work or number of transitions evaluated once for each state.' },
        { question: 'When is rolling-array space compression safe?', answer: 'When the recurrence for the current layer depends only on a fixed set of earlier layers and overwrite order cannot destroy a value still needed later.' }
      ]
    },
    {
      id: 'ml-coding',
      title: 'ML coding: stable losses, training steps, IoU, and NMS',
      required: true,
      summary: 'ML coding interviews test tensor-shape contracts, numerical stability, gradient lifecycle, and the geometry behind postprocessing. Write vectorized code, state shapes and dtypes, and make every mutation in the training or selection loop intentional.',
      recognitionCues: [
        'Raw binary logits plus binary targets call for BCE-with-logits rather than applying sigmoid and then taking logarithms manually.',
        'A training-step prompt requires explicit zero-grad, forward, loss, backward, and optimizer-step order with train/eval behavior understood.',
        'Bounding-box overlap, duplicate detections, or postprocessing requires vectorized IoU plus score-ordered greedy NMS.'
      ],
      invariant: 'BCE targets and logits have exactly equal shapes after at most one semantically justified singleton-axis operation; gradients are cleared before the backward pass that starts an update or accumulation window; continuous-coordinate xyxy boxes are non-inverted; zero-union IoU is 0; and greedy NMS keeps the highest remaining score before removing only boxes above the overlap threshold.',
      template: [
        'For BCE, allow only an explicit, semantically justified singleton squeeze or unsqueeze, require targets.shape == logits.shape, cast targets to the logits device and dtype, and reject every other shape instead of reshaping.',
        'For training, set train mode, clear gradients before the backward pass that begins the update or accumulation window, run forward, compute scalar loss, backpropagate, optionally clip, and step exactly once.',
        'For IoU/NMS, use continuous-coordinate xyxy boxes, reject inverted coordinates before area math, compute geometry in float32 unless either input is float64, map zero union to IoU 0 with torch.where, sort scores descending, and suppress high-overlap remainder boxes.'
      ],
      code: [
        { label: 'Template — stable BCE-with-logits and one training step', body: `import torch
import torch.nn.functional as F

def binary_training_step(model, optimizer, features, targets):
    # features: [B, D]; targets and final logits: [B] or exactly matching [B, C]
    model.train()
    optimizer.zero_grad(set_to_none=True)  # begin a fresh update window before backward
    raw_logits = model(features)
    if (raw_logits.ndim == targets.ndim + 1
            and raw_logits.shape[-1] == 1
            and raw_logits.shape[:-1] == targets.shape):
        # A binary head has one known class-logit axis, so this singleton squeeze is semantic.
        logits = raw_logits.squeeze(-1)
    else:
        logits = raw_logits
    if targets.shape != logits.shape:
        raise ValueError(f"targets {targets.shape} must exactly match logits {logits.shape}")
    targets = targets.to(device=logits.device, dtype=logits.dtype)
    loss = F.binary_cross_entropy_with_logits(logits, targets)
    loss.backward()
    optimizer.step()
    return loss.detach(), logits.detach()` },
        { label: 'Worked example — vectorized binary classifier update', body: `import torch

model = torch.nn.Linear(3, 1)  # exactly one binary-logit output per example
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
features = torch.tensor([[1.0, 0.0, 2.0], [0.0, 1.0, -1.0]])  # [B=2, D=3]
targets = torch.tensor([1.0, 0.0])                             # [B=2]

loss, logits = binary_training_step(model, optimizer, features, targets)
assert loss.ndim == 0 and logits.shape == targets.shape` },
        { label: 'Template — vectorized box IoU and greedy NMS', body: `import torch

def box_iou(box, boxes):
    # Continuous-coordinate xyxy: equal endpoints have zero area; zero union returns IoU 0.
    if box.shape != (4,) or boxes.ndim != 2 or boxes.shape[1] != 4:
        raise ValueError("expected box [4] and boxes [N, 4]")
    if torch.any(box[2:] < box[:2]) or torch.any(boxes[:, 2:] < boxes[:, :2]):
        raise ValueError("xyxy coordinates must satisfy x2 >= x1 and y2 >= y1")
    geometry_dtype = torch.float64 if box.dtype == torch.float64 or boxes.dtype == torch.float64 else torch.float32
    boxes = boxes.to(dtype=geometry_dtype)
    box = box.to(device=boxes.device, dtype=geometry_dtype)

    top_left = torch.maximum(box[:2], boxes[:, :2])
    bottom_right = torch.minimum(box[2:], boxes[:, 2:])
    intersection = (bottom_right - top_left).clamp(min=0).prod(dim=1)
    box_area = (box[2:] - box[:2]).prod()
    areas = (boxes[:, 2:] - boxes[:, :2]).prod(dim=1)
    union = box_area + areas - intersection
    return torch.where(union > 0, intersection / union, 0.0)

def nms(boxes, scores, iou_threshold):
    if boxes.ndim != 2 or boxes.shape[1] != 4 or scores.ndim != 1 or len(scores) != len(boxes):
        raise ValueError("expected boxes [N, 4] and aligned scores [N]")
    if torch.any(boxes[:, 2:] < boxes[:, :2]):
        raise ValueError("xyxy coordinates must satisfy x2 >= x1 and y2 >= y1")
    geometry_dtype = torch.float64 if boxes.dtype == torch.float64 else torch.float32
    boxes = boxes.to(dtype=geometry_dtype)
    scores = scores.to(device=boxes.device)
    # boxes: [N, 4], scores: [N]; returns kept original indices
    order = scores.argsort(descending=True)
    keep = []
    while order.numel():
        current = order[0]
        keep.append(current)
        if order.numel() == 1:
            break
        remaining = order[1:]
        order = remaining[box_iou(boxes[current], boxes[remaining]) <= iou_threshold]
    return torch.stack(keep) if keep else torch.empty(0, dtype=torch.long, device=boxes.device)` },
        { label: 'Worked example — suppress duplicate detections', body: `boxes = torch.tensor([
    [0.0, 0.0, 10.0, 10.0],
    [1.0, 1.0, 9.0, 9.0],
    [20.0, 20.0, 30.0, 30.0],
])
scores = torch.tensor([0.95, 0.80, 0.70])
kept = nms(boxes, scores, iou_threshold=0.5)
assert kept.tolist() == [0, 2]` }
      ],
      complexity: [
        'Vectorized BCE for B×C logits is O(BC) time; activations and gradients are O(BC) plus model parameter/optimizer state.',
        'One dense IoU comparison against N boxes is O(N) time and O(N) temporary space; this clear greedy NMS is O(N²) worst-case after O(N log N) sorting.'
      ],
      pitfalls: [
        'Applying sigmoid before binary_cross_entropy_with_logits duplicates the nonlinearity and loses the fused log-sum-exp numerical stability.',
        'Gradients must be cleared before the backward pass that begins an update or accumulation window: backward(); step(); zero_grad() is valid for the next update, while backward(); zero_grad(); step() discards the update; returning graph-bearing losses without detaching also retains computation graphs.',
        'For validation or inference, call model.eval() and use torch.inference_mode(); eval() changes Dropout and BatchNorm behavior but does not disable autograd, and model.train() must be restored before optimization.',
        'BCE-with-logits requires targets.shape == logits.shape; permit only an explicit, semantically justified singleton squeeze or unsqueeze, then cast device/dtype, and reject every other mismatch.',
        'Treat xyxy as continuous coordinates: reject inverted boxes, allow equal endpoints as zero-area boxes, return IoU 0 for zero union, and compute geometry in float32 unless either input is float64.',
        'In multiclass detection, class-agnostic NMS can suppress overlapping boxes from different classes unless that behavior is deliberate.'
      ],
      recall: [
        { question: 'Why is BCE-with-logits more stable than sigmoid followed by BCE?', answer: 'The fused operation rewrites the log-sigmoid terms with a log-sum-exp-style expression, avoiding probabilities rounded to zero or one before taking logarithms.' },
        { question: 'When must gradients be cleared for an optimizer update?', answer: 'Clear them before the backward pass that starts an update or accumulation window. backward(); step(); zero_grad() is valid because it clears before the next backward, but backward(); zero_grad(); step() discards the gradients before the update.' },
        { question: 'What invariant makes greedy NMS correct for its stated policy?', answer: 'The highest-scoring remaining box is kept first, and only lower-scoring boxes whose IoU exceeds the chosen threshold are removed before repeating.' },
        { question: 'Which production tradeoff should you test around NMS?', answer: 'Evaluate threshold and class-aware policy by object density and size while measuring duplicate precision, crowded-scene recall, latency, and downstream tracking behavior.' }
      ]
    },
    {
      id: 'ml-coding-nn',
      title: 'ML coding from scratch: neural networks, losses, training, metrics, and classical models',
      required: true,
      summary: 'From-scratch ML interviews test whether you can make shapes, normalization axes, stability, gradient flow, optimizer state, data iteration, metric matching, and algorithmic assumptions explicit without hiding behind a framework call. Start with contracts, implement the simplest correct version, then vectorize or scale deliberately.',
      recognitionCues: [
        'A prompt asks for attention, convolution, a loss, backpropagation, or an optimizer without using the corresponding high-level framework primitive.',
        'A training-loop or mAP prompt requires state transitions and evaluation semantics, not only a formula.',
        'A classical-model prompt asks you to derive and implement linear or logistic regression, k-means, PCA, or kNN directly from arrays.'
      ],
      invariant: 'Every operation preserves its declared batch, sequence, channel, spatial, class, or feature axes; reductions occur over the intended axis; exponentials use a subtracted maximum; autodiff accumulates all downstream contributions in reverse topological order; optimizer state advances exactly once per update; evaluation never mutates training state; and classical estimators fit preprocessing and statistics only from training data.',
      template: [
        'State shapes, dtype, device, reduction, mask semantics, coordinate convention, and empty-input policy before implementing the forward computation.',
        'Derive a scalar reference, stabilize max-sensitive expressions, check numerical and shape edge cases, then vectorize without changing the invariant.',
        'For training, iterate batches, move data, clear gradients at the update boundary, forward, reduce loss, backward, clip if required, step optimizer and scheduler at their declared cadence, then evaluate under eval/inference mode.',
        'For classical algorithms, state the objective or neighborhood rule, initialization, stopping criterion, fitted statistics, complexity, and behavior for ties, empty clusters, rank deficiency, or unscaled features.'
      ],
      code: [
        { label: 'Attention, multi-head attention, and NCHW conv2d from primitives', body: `import math
import numpy as np

def stable_softmax(x, axis=-1):
    x = np.asarray(x, dtype=np.float64)
    shifted = x - np.max(x, axis=axis, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=axis, keepdims=True)

def scaled_dot_product_attention(q, k, v, keep_mask=None):
    # q:[B,H,Lq,D], k/v:[B,H,Lk,D or Dv]; True mask means visible.
    if q.shape[:-2] != k.shape[:-2] or k.shape[:-2] != v.shape[:-2]:
        raise ValueError("batch and head axes must match")
    if q.shape[-1] != k.shape[-1] or k.shape[-2] != v.shape[-2]:
        raise ValueError("key width and key/value length must match")
    scores = q @ np.swapaxes(k, -1, -2) / math.sqrt(q.shape[-1])
    if keep_mask is not None:
        scores = np.where(keep_mask, scores, -np.inf)
        if np.any(~np.any(keep_mask, axis=-1)):
            raise ValueError("every query needs at least one visible key")
    weights = stable_softmax(scores, axis=-1)
    return weights @ v, weights

def multi_head_attention(x, wq, wk, wv, wo, num_heads, keep_mask=None):
    # x:[B,L,D], projection matrices:[D,D]
    batch, length, width = x.shape
    if width % num_heads:
        raise ValueError("model width must be divisible by head count")
    head_width = width // num_heads
    def split(projected):
        return projected.reshape(batch, length, num_heads, head_width).transpose(0, 2, 1, 3)
    q, k, v = split(x @ wq), split(x @ wk), split(x @ wv)
    heads, weights = scaled_dot_product_attention(q, k, v, keep_mask)
    merged = heads.transpose(0, 2, 1, 3).reshape(batch, length, width)
    return merged @ wo, weights

def conv2d_nchw(x, weight, bias=None, stride=1, padding=0):
    # x:[N,Cin,H,W], weight:[Cout,Cin,Kh,Kw]
    n, cin, height, width = x.shape
    cout, wcin, kh, kw = weight.shape
    if cin != wcin or stride <= 0 or padding < 0:
        raise ValueError("invalid channels, stride, or padding")
    hout = (height + 2 * padding - kh) // stride + 1
    wout = (width + 2 * padding - kw) // stride + 1
    if hout <= 0 or wout <= 0:
        raise ValueError("kernel does not fit padded input")
    padded = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    out = np.empty((n, cout, hout, wout), dtype=np.result_type(x, weight))
    for b in range(n):
        for oc in range(cout):
            for oy in range(hout):
                for ox in range(wout):
                    patch = padded[b, :, oy * stride:oy * stride + kh, ox * stride:ox * stride + kw]
                    out[b, oc, oy, ox] = np.sum(patch * weight[oc])
            if bias is not None:
                out[b, oc] += bias[oc]
    return out` },
        { label: 'Stable logsumexp, cross-entropy, focal, InfoNCE, and triplet losses', body: `import numpy as np

def logsumexp(x, axis=-1, keepdims=False):
    x = np.asarray(x, dtype=np.float64)
    maximum = np.max(x, axis=axis, keepdims=True)
    value = maximum + np.log(np.exp(x - maximum).sum(axis=axis, keepdims=True))
    return value if keepdims else np.squeeze(value, axis=axis)

def cross_entropy_logits(logits, targets, reduction="mean"):
    if logits.ndim != 2 or targets.shape != (logits.shape[0],):
        raise ValueError("expected logits [B,C] and integer targets [B]")
    if np.any((targets < 0) | (targets >= logits.shape[1])):
        raise ValueError("target class is out of range")
    losses = logsumexp(logits, axis=1) - logits[np.arange(len(targets)), targets]
    return losses.mean() if reduction == "mean" else losses

def focal_loss_logits(logits, targets, gamma=2.0, alpha=None):
    log_probs = logits - logsumexp(logits, axis=1, keepdims=True)
    log_pt = log_probs[np.arange(len(targets)), targets]
    weight = (1.0 - np.exp(log_pt)) ** gamma
    if alpha is not None:
        weight = weight * np.asarray(alpha)[targets]
    return np.mean(-weight * log_pt)

def info_nce(query, key, temperature=0.07):
    if query.shape != key.shape or temperature <= 0:
        raise ValueError("paired embeddings need equal shape and positive temperature")
    query = query / np.clip(np.linalg.norm(query, axis=1, keepdims=True), 1e-12, None)
    key = key / np.clip(np.linalg.norm(key, axis=1, keepdims=True), 1e-12, None)
    logits = query @ key.T / temperature
    targets = np.arange(len(query))
    return 0.5 * (cross_entropy_logits(logits, targets) + cross_entropy_logits(logits.T, targets))

def triplet_margin_loss(anchor, positive, negative, margin=0.2):
    d_pos = np.sum((anchor - positive) ** 2, axis=1)
    d_neg = np.sum((anchor - negative) ** 2, axis=1)
    return np.maximum(0.0, d_pos - d_neg + margin).mean()` },
        { label: 'Scalar reverse-mode autograd plus SGD and Adam state updates', body: `import math

class Value:
    def __init__(self, data, parents=(), backward=lambda: None):
        self.data = float(data)
        self.grad = 0.0
        self.parents = tuple(parents)
        self._backward = backward

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = backward
        return out

    def tanh(self):
        value = math.tanh(self.data)
        out = Value(value, (self,))
        def backward():
            self.grad += (1.0 - value * value) * out.grad
        out._backward = backward
        return out

    def backward(self):
        topo, seen = [], set()
        def visit(node):
            if id(node) in seen:
                return
            seen.add(id(node))
            for parent in node.parents:
                visit(parent)
            topo.append(node)
        visit(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()

def sgd_step(parameters, learning_rate):
    for parameter in parameters:
        parameter.data -= learning_rate * parameter.grad

def adam_step(parameters, state, step, learning_rate=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):
    for index, parameter in enumerate(parameters):
        first, second = state.setdefault(index, [0.0, 0.0])
        first = beta1 * first + (1 - beta1) * parameter.grad
        second = beta2 * second + (1 - beta2) * parameter.grad ** 2
        state[index] = [first, second]
        m_hat = first / (1 - beta1 ** step)
        v_hat = second / (1 - beta2 ** step)
        parameter.data -= learning_rate * m_hat / (math.sqrt(v_hat) + eps)` },
        { label: 'Complete dataloader epoch and detection mAP at explicit IoU thresholds', body: `import numpy as np
import torch

def train_one_epoch(model, dataloader, optimizer, loss_fn, device, grad_clip=None):
    model.train()
    total_loss, total_examples = 0.0, 0
    for features, targets in dataloader:
        features = features.to(device, non_blocking=True)
        targets = targets.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)
        logits = model(features)
        loss = loss_fn(logits, targets)
        if loss.ndim != 0 or not torch.isfinite(loss):
            raise ValueError("loss must be one finite scalar")
        loss.backward()
        if grad_clip is not None:
            torch.nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
        optimizer.step()
        batch = targets.shape[0]
        total_loss += loss.detach().item() * batch
        total_examples += batch
    return total_loss / max(total_examples, 1)

def box_iou_xyxy(a, b):
    top_left = np.maximum(a[:2], b[:2])
    bottom_right = np.minimum(a[2:], b[2:])
    intersection = np.prod(np.maximum(bottom_right - top_left, 0.0))
    area_a = np.prod(np.maximum(a[2:] - a[:2], 0.0))
    area_b = np.prod(np.maximum(b[2:] - b[:2], 0.0))
    union = area_a + area_b - intersection
    return intersection / union if union > 0 else 0.0

def interpolated_ap(tp, fp, positives):
    if positives == 0:
        return None
    tp, fp = np.cumsum(tp), np.cumsum(fp)
    recall = tp / positives
    precision = tp / np.maximum(tp + fp, 1)
    return np.mean([np.max(precision[recall >= r], initial=0.0) for r in np.linspace(0, 1, 101)])

def mean_average_precision(predictions, targets, class_ids, iou_thresholds=(0.5, 0.75)):
    # Each prediction/target: {image_id, class_id, box}; predictions also contain score.
    aps = []
    for class_id in class_ids:
        truths = [item for item in targets if item["class_id"] == class_id]
        by_image = {}
        for truth in truths:
            by_image.setdefault(truth["image_id"], []).append(truth["box"])
        ranked = sorted((p for p in predictions if p["class_id"] == class_id), key=lambda p: -p["score"])
        for threshold in iou_thresholds:
            matched = {image_id: set() for image_id in by_image}
            tp, fp = [], []
            for prediction in ranked:
                image_id = prediction["image_id"]
                used = matched.setdefault(image_id, set())
                boxes = by_image.get(image_id, [])
                candidates = [
                    (box_iou_xyxy(prediction["box"], box), index)
                    for index, box in enumerate(boxes)
                    if index not in used
                ]
                best_iou, best = max(candidates, default=(-1.0, -1))
                is_match = best_iou >= threshold
                tp.append(int(is_match)); fp.append(int(not is_match))
                if is_match:
                    used.add(best)
            ap = interpolated_ap(tp, fp, len(truths))
            if ap is not None:
                aps.append(ap)
    return float(np.mean(aps)) if aps else float("nan")` },
        { label: 'Linear and logistic regression, k-means, PCA, and kNN from NumPy', body: `import numpy as np

def linear_regression_gd(x, y, steps=1000, learning_rate=1e-2):
    x = np.c_[np.ones(len(x)), np.asarray(x, dtype=float)]
    weights = np.zeros(x.shape[1])
    for _ in range(steps):
        weights -= learning_rate * (x.T @ (x @ weights - y)) / len(x)
    return weights

def logistic_regression_gd(x, y, steps=1000, learning_rate=1e-2, l2=0.0):
    x = np.c_[np.ones(len(x)), np.asarray(x, dtype=float)]
    weights = np.zeros(x.shape[1])
    for _ in range(steps):
        logits = x @ weights
        probabilities = np.empty_like(logits)
        nonnegative = logits >= 0
        probabilities[nonnegative] = 1.0 / (1.0 + np.exp(-logits[nonnegative]))
        negative_exp = np.exp(logits[~nonnegative])
        probabilities[~nonnegative] = negative_exp / (1.0 + negative_exp)
        regularizer = np.r_[0.0, weights[1:]] * l2
        weights -= learning_rate * ((x.T @ (probabilities - y)) / len(x) + regularizer)
    return weights

def kmeans(x, k, iterations=100, seed=0):
    x = np.asarray(x, dtype=float)
    rng = np.random.default_rng(seed)
    centers = x[rng.choice(len(x), k, replace=False)].copy()
    labels = np.full(len(x), -1, dtype=int)
    for _ in range(iterations):
        new_labels = np.argmin(((x[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2), axis=1)
        if np.array_equal(new_labels, labels):
            break
        labels = new_labels
        for cluster in range(k):
            members = x[labels == cluster]
            centers[cluster] = members.mean(axis=0) if len(members) else x[rng.integers(len(x))]
    return centers, labels

def pca(x, components):
    x = np.asarray(x, dtype=float)
    mean = x.mean(axis=0)
    _, singular_values, vt = np.linalg.svd(x - mean, full_matrices=False)
    basis = vt[:components]
    return (x - mean) @ basis.T, mean, basis, singular_values[:components]

def knn_predict(train_x, train_y, query_x, k=5):
    distances = ((query_x[:, None, :] - train_x[None, :, :]) ** 2).sum(axis=2)
    neighbors = np.argpartition(distances, kth=k - 1, axis=1)[:, :k]
    predictions = []
    for row in neighbors:
        labels, counts = np.unique(train_y[row], return_counts=True)
        predictions.append(labels[np.argmax(counts)])
    return np.asarray(predictions)` }
      ],
      complexity: [
        'Full self-attention is O(BHL²D_h) time and O(BHL²) score memory for equal query/key length L; naive conv2d is O(NC_outH_outW_outC_inK_hK_w).',
        'Reverse-mode autograd is linear in executed graph nodes plus local-operation cost and retains forward values needed by backward; Adam stores two state tensors per parameter in addition to gradients.',
        'One dense k-means iteration costs O(nkd), PCA by full SVD costs roughly O(min(nd²,n²d)), brute-force kNN query costs O(nd), and dense gradient descent costs O(nd) per step.',
        'Detection matching is dominated by sorting predictions and pairwise IoU work per class and image; the exact mAP runtime depends on classes, thresholds, detections, and ground truths.'
      ],
      pitfalls: [
        'A stable softmax subtracts the maximum along the same axis that will be normalized; subtracting one global maximum can be numerically safe but changes broadcasting expectations and obscures row contracts.',
        'InfoNCE batch negatives may contain semantic positives, and triplet loss is ineffective when mining produces only trivial or mislabeled triplets.',
        'Autograd must accumulate with += because one node can feed several paths; executing backward in discovery order misses downstream contributions.',
        'Adam bias correction uses the optimizer update count, not the sample, microbatch, or epoch count; clearing state or incrementing it at the wrong cadence changes the algorithm.',
        'mAP is undefined for absent-class slices unless a policy is stated, and changing IoU thresholds, interpolation, max detections, ignore regions, or class averaging changes the metric.',
        'PCA and kNN require training-fitted centering or scaling; k-means needs empty-cluster and initialization policy; logistic regression needs stable sigmoid/log-loss arithmetic.'
      ],
      recall: [
        { question: 'Why is attention softmax normalized over the key axis?', answer: 'For each query and head, the weights must form a distribution over candidate key-value positions; normalizing another axis mixes unrelated queries or heads.' },
        { question: 'What makes logsumexp numerically stable?', answer: 'Subtracting the maximum before exponentiation prevents overflow, then adding that maximum back preserves the exact logarithm because it factors out of the exponential sum.' },
        { question: 'Why does reverse-mode autodiff need reverse topological order?', answer: 'A node can propagate its complete gradient to parents only after every downstream consumer has contributed to that node, which reverse topological execution guarantees.' },
        { question: 'What contract makes a dataloader training loop complete?', answer: 'It controls model mode, device transfer, gradient lifecycle, scalar reduction, finite checks, optional clipping, optimizer and scheduler cadence, example-weighted logging, validation mode, checkpoints, and partial batches.' },
        { question: 'How is detection mAP different from classification accuracy?', answer: 'Predictions are score-ranked and greedily matched to ground truths under class and IoU rules, precision-recall is integrated for each class and threshold, then valid AP values are averaged under an explicit protocol.' },
        { question: 'Which assumptions distinguish k-means, PCA, and kNN?', answer: 'k-means minimizes Euclidean within-cluster squares, PCA preserves linear variance after centering, and kNN assumes local distance predicts the target; all are sensitive to representation and scaling.' }
      ]
    },
    {
      id: 'tries',
      title: 'Tries and prefix-indexed search',
      required: true,
      summary: 'A trie stores keys by successive symbols so common prefixes share state. It is useful when queries ask about prefixes, dictionaries, autocomplete, or pruning a board search, but its memory overhead can exceed hashing when prefix sharing is weak.',
      recognitionCues: [
        'The prompt asks for insert, exact lookup, prefix lookup, autocomplete, or wildcard search over many strings.',
        'A DFS must prune paths that are not prefixes of any dictionary word, as in board word search.'
      ],
      invariant: 'The node reached after consuming a prefix represents exactly that prefix; every outgoing edge appends one symbol, and an explicit terminal marker distinguishes a stored word from a shared internal prefix.',
      template: [
        'Define the alphabet, normalization, duplicate semantics, terminal payload, and whether deletion or ranking is required.',
        'Walk or create one edge per symbol; exact search additionally requires terminal state, while prefix search stops after the path exists.',
        'For trie-guided DFS, carry the current node, mark board state reversibly, emit terminal words once under the duplicate policy, and prune exhausted branches.'
      ],
      code: [
        { label: 'Dictionary trie with exact and prefix lookup', body: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.terminal = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            node = node.children.setdefault(char, TrieNode())
        node.terminal = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.terminal

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, text):
        node = self.root
        for char in text:
            if char not in node.children:
                return None
            node = node.children[char]
        return node` },
        { label: 'Trie-pruned board search with reversible marking', body: `def find_words(board, words):
    trie = Trie()
    for word in words:
        trie.insert(word)
    found, rows, cols = set(), len(board), len(board[0])

    def dfs(row, col, node, path):
        char = board[row][col]
        if char == "#" or char not in node.children:
            return
        child = node.children[char]
        path += char
        if child.terminal:
            found.add(path)
        board[row][col] = "#"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                dfs(nr, nc, child, path)
        board[row][col] = char

    for row in range(rows):
        for col in range(cols):
            dfs(row, col, trie.root, "")
    return list(found)` }
      ],
      complexity: [
        'Insert and exact or prefix lookup take O(L) expected time for key length L with hash-map children; deterministic array children trade alphabet-sized memory for direct indexing.',
        'Trie storage is O(total created prefix nodes × child representation); board search is exponential in path length in the worst case but prefix pruning can remove most branches.'
      ],
      pitfalls: [
        'Forgetting the terminal marker makes a prefix indistinguishable from a complete stored key.',
        'Allocating a full alphabet array per sparse node can dominate memory; Unicode normalization and case policy also change key identity.',
        'Board DFS must restore the visited cell for sibling paths and deduplicate outputs when one word has several paths.'
      ],
      recall: [
        { question: 'Why is a terminal flag required in a trie?', answer: 'A path can exist only because a longer word shares that prefix, so terminal state records whether the prefix itself was inserted as a complete key.' },
        { question: 'When is a trie preferable to a hash set?', answer: 'When prefix queries or shared-prefix pruning are central and the added node and pointer memory is justified; hash lookup is usually simpler for exact-only membership.' },
        { question: 'How does a trie improve board word search?', answer: 'The DFS stops as soon as the current character path is not a dictionary prefix, avoiding exploration of branches that cannot complete any word.' }
      ]
    },
    {
      id: 'bit-manipulation',
      title: 'Bit manipulation and finite-width invariants',
      required: true,
      summary: 'Bit problems use XOR cancellation, masks, shifts, and low-bit identities to encode compact state. Correctness depends on integer width and signedness; Python has unbounded signed integers, so fixed-width interview semantics must be stated explicitly.',
      recognitionCues: [
        'The task asks about parity, powers of two, unique values, subsets, bit counts, masks, or constant-space state over bounded flags.',
        'Values cancel in pairs or a transition depends on setting, clearing, testing, or extracting particular bit positions.'
      ],
      invariant: 'Each mask bit has one named meaning, updates preserve unrelated bits, and XOR represents parity because equal contributions cancel while order does not matter.',
      template: [
        'State the integer width, signedness, overflow behavior, and mapping from bit positions to domain state.',
        'Use x&(x−1) to clear the lowest set bit, x&−x to isolate it under two-complement semantics, and XOR only when parity or reversible toggling proves correct.',
        'Trace zero, the highest supported bit, negative inputs, duplicates, and shifts at or beyond the width.'
      ],
      code: [
        { label: 'XOR cancellation and Kernighan bit count', body: `def single_number(nums):
    answer = 0
    for value in nums:
        answer ^= value
    return answer

def popcount_nonnegative(value):
    if value < 0:
        raise ValueError("finite-width policy required for negative values")
    count = 0
    while value:
        value &= value - 1
        count += 1
    return count` },
        { label: 'Bit DP and explicit 32-bit reversal', body: `def count_bits(limit):
    counts = [0] * (limit + 1)
    for value in range(1, limit + 1):
        counts[value] = counts[value >> 1] + (value & 1)
    return counts

def reverse_bits_32(value):
    value &= 0xFFFFFFFF
    result = 0
    for _ in range(32):
        result = (result << 1) | (value & 1)
        value >>= 1
    return result` }
      ],
      complexity: [
        'A scan with XOR is O(n) time and O(1) auxiliary space; Kernighan counting is O(number of set bits).',
        'Bitmask subset enumeration visits 2ⁿ masks and therefore needs Ω(2ⁿ) time even though each mask uses one integer for bounded n.'
      ],
      pitfalls: [
        'XOR cancellation solves exact parity assumptions, not arbitrary duplicate counts or recovery of several unique values without additional structure.',
        'Right-shifting negative Python integers sign-extends indefinitely; mask to the intended width before emulating unsigned arithmetic.',
        'Using bit positions without documenting width can collide states or silently discard flags beyond the assumed bound.'
      ],
      recall: [
        { question: 'Why does x and x minus one clear the lowest set bit?', answer: 'Subtracting one flips the lowest one to zero and all lower zeros to ones; AND keeps higher bits and clears that changed suffix.' },
        { question: 'What algebra makes XOR useful for paired duplicates?', answer: 'XOR is associative and commutative, x XOR x is zero, and x XOR zero is x, so paired values cancel regardless of order.' },
        { question: 'Why must signed bit problems state a width?', answer: 'Negative mathematical integers do not have a finite leading-bit representation, while interview tasks usually assume a fixed two-complement word whose masks and shifts have different behavior.' }
      ]
    },
    {
      id: 'math-number-theory',
      title: 'Interview math and number theory',
      required: true,
      summary: 'Number-theory interview tasks reduce large searches through divisibility, Euclid, prime factorization, modular arithmetic, or combinatorial counting. State numeric bounds and overflow semantics before importing identities from fixed-width languages.',
      recognitionCues: [
        'The prompt asks for gcd, lcm, primes, factors, modular powers, divisibility, cycles, or counting under a modulus.',
        'A brute-force arithmetic loop can shrink by square-root factor bounds, repeated squaring, or an invariant under Euclidean remainder.'
      ],
      invariant: 'Every transformation preserves the represented congruence, divisor set, or count; Euclid preserves gcd under (a,b)→(b,a mod b), and modular multiplication reduces without changing the residue class.',
      template: [
        'State input domain, zero and negative policy, modulus properties, and whether exact arithmetic or fixed-width overflow applies.',
        'Apply Euclid for gcd, sieve for all primes through a bound, trial division through sqrt(n) for one factorization, and binary exponentiation for a large exponent.',
        'Prove bounds, normalize residues, and test zero, one, primes, repeated factors, coprime inputs, and maximum values.'
      ],
      code: [
        { label: 'Euclid, lcm, and sieve of Eratosthenes', body: `def gcd(a, b):
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    divisor = gcd(a, b)
    return 0 if divisor == 0 else abs((a // divisor) * b)

def primes_through(limit):
    if limit < 2:
        return []
    prime = bytearray(b"\\x01") * (limit + 1)
    prime[0:2] = b"\\x00\\x00"
    candidate = 2
    while candidate * candidate <= limit:
        if prime[candidate]:
            prime[candidate * candidate:limit + 1:candidate] = b"\\x00" * (((limit - candidate * candidate) // candidate) + 1)
        candidate += 1
    return [value for value, is_prime in enumerate(prime) if is_prime]` },
        { label: 'Binary modular exponentiation and prime factorization', body: `def modular_power(base, exponent, modulus):
    if exponent < 0 or modulus <= 0:
        raise ValueError("requires nonnegative exponent and positive modulus")
    result, base = 1 % modulus, base % modulus
    while exponent:
        if exponent & 1:
            result = (result * base) % modulus
        base = (base * base) % modulus
        exponent >>= 1
    return result

def prime_factors(value):
    if value == 0:
        raise ValueError("zero has no finite prime factorization")
    value, factors = abs(value), []
    divisor = 2
    while divisor * divisor <= value:
        while value % divisor == 0:
            factors.append(divisor)
            value //= divisor
        divisor += 1 if divisor == 2 else 2
    if value > 1:
        factors.append(value)
    return factors` }
      ],
      complexity: [
        'Euclid is O(log min(a,b)); binary exponentiation is O(log exponent) modular multiplications.',
        'A sieve through n is O(n log log n) time and O(n) space; simple trial division factorization is O(sqrt(n)) worst-case.'
      ],
      pitfalls: [
        'Computing a*b before dividing by gcd can overflow fixed-width integers; divide one factor first even though Python integers grow.',
        'One is not prime, zero has infinitely many divisors, and negative inputs need an explicit sign convention.',
        'Modular division requires an inverse that may not exist; Fermat-style inverses additionally require a prime modulus and a nonzero residue.'
      ],
      recall: [
        { question: 'Why does Euclid preserve the greatest common divisor?', answer: 'The common divisors of a and b are exactly the common divisors of b and a minus any multiple of b, including the remainder a mod b.' },
        { question: 'Why can sieve marking begin at p squared?', answer: 'Every smaller composite multiple of p has another factor below p and was already marked when that smaller factor was processed.' },
        { question: 'How does binary exponentiation reduce work?', answer: 'It decomposes the exponent into bits, repeatedly squares the base, and multiplies only for set bits, reducing linear repeated multiplication to logarithmic steps.' }
      ]
    },
    {
      id: 'advanced-dp',
      title: 'Advanced dynamic programming: grids, knapsack, LIS, and LCS',
      required: true,
      summary: 'Advanced DP interviews test state design across two dimensions, capacities, and paired sequences. The key is to define what each cell means, prove dependency order, distinguish reuse from one-time choice, and compress space without overwriting a value still needed.',
      recognitionCues: [
        'The prompt compares two prefixes, moves through a grid, allocates bounded capacity, or asks for a longest increasing or common subsequence.',
        'Naive recursion branches on take/skip or match/skip and revisits the same pair of indices or remaining capacity.'
      ],
      invariant: 'Each DP entry is the complete answer for its named prefixes, coordinates, or capacity, and every transition reads only states representing strictly smaller solved subproblems under the intended item-reuse policy.',
      template: [
        'Define state dimensions and whether indices are inclusive, identify base row and column, then write the recurrence from the final decision.',
        'Choose iteration order from dependencies: reverse capacity for 0/1 items, forward capacity for unbounded reuse, and row/column order for sequence or grid prefixes.',
        'Estimate states times transitions, reconstruct choices only if requested, and compress a dimension only after proving overwrite order.'
      ],
      code: [
        { label: 'Zero-one knapsack and quadratic LIS', body: `def knapsack_01(weights, values, capacity):
    best = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for remaining in range(capacity, weight - 1, -1):
            best[remaining] = max(best[remaining], best[remaining - weight] + value)
    return best[capacity]

def lis_length(nums):
    if not nums:
        return 0
    best = [1] * len(nums)
    for right in range(len(nums)):
        for left in range(right):
            if nums[left] < nums[right]:
                best[right] = max(best[right], best[left] + 1)
    return max(best)` },
        { label: 'Longest common subsequence and obstacle-grid paths', body: `def lcs_length(a, b):
    if len(a) < len(b):
        a, b = b, a
    previous = [0] * (len(b) + 1)
    for char_a in a:
        current = [0] * (len(b) + 1)
        for column, char_b in enumerate(b, start=1):
            if char_a == char_b:
                current[column] = previous[column - 1] + 1
            else:
                current[column] = max(previous[column], current[column - 1])
        previous = current
    return previous[-1]

def unique_paths_with_obstacles(grid):
    paths = [0] * len(grid[0])
    paths[0] = 1
    for row in grid:
        for column, blocked in enumerate(row):
            if blocked:
                paths[column] = 0
            elif column > 0:
                paths[column] += paths[column - 1]
    return paths[-1]` }
      ],
      complexity: [
        '0/1 knapsack is O(nC) time and O(C) space for capacity C; LCS is O(mn) time and O(min(m,n)) length-only space.',
        'Quadratic LIS is O(n²), while patience-sorting tails yields O(n log n) length but needs extra predecessor state to reconstruct an actual subsequence.'
      ],
      pitfalls: [
        'Forward capacity iteration in 0/1 knapsack reuses the same item within its row and silently turns the recurrence into unbounded knapsack.',
        'Updating a compressed LCS or grid row in the wrong direction overwrites the diagonal or previous-row value before it is consumed.',
        'Confusing subsequence with substring adds or removes the skip transitions and solves a different problem.'
      ],
      recall: [
        { question: 'Why does zero-one knapsack iterate capacity backward?', answer: 'Backward iteration ensures every transition reads the previous item layer; forward iteration could read a value updated by the same item and reuse it multiple times.' },
        { question: 'What does one LCS table cell represent?', answer: 'It is the longest common subsequence length for one prefix of the first sequence and one prefix of the second, enabling match-diagonal or skip-one-prefix transitions.' },
        { question: 'When can a two-dimensional DP be compressed to one row?', answer: 'When the current layer depends only on a bounded set of prior-layer and current-layer values and an iteration order preserves each value until its final use.' }
      ]
    },
    {
      id: 'greedy',
      title: 'Greedy algorithms and exchange proofs',
      required: true,
      summary: 'A greedy algorithm commits to a locally preferred choice without revisiting it. The implementation is often short; the interview signal is the proof that an optimal solution can exchange its first differing choice with the greedy one or that a maintained frontier never discards a feasible optimum.',
      recognitionCues: [
        'The task asks for a maximum count, minimum removals, reachability, scheduling, or resource allocation where one sorted order may make decisions final.',
        'A local choice appears dominant and future feasibility can be summarized by one boundary, balance, or farthest reachable position.'
      ],
      invariant: 'After each commitment, the partial solution is feasible and there exists an optimal completion consistent with every greedy choice made so far.',
      template: [
        'Identify the candidate local rule, then search for a counterexample before coding.',
        'Prove by exchange, stays-ahead, cut, or frontier argument that replacing the first different optimal choice does not worsen the objective.',
        'Choose the sort key that supports the proof, maintain only the frontier needed for future feasibility, and state tie behavior.'
      ],
      code: [
        { label: 'Earliest-finish interval scheduling', body: `def maximum_nonoverlapping(intervals):
    chosen, end = [], float("-inf")
    for start, finish in sorted(intervals, key=lambda interval: interval[1]):
        if start >= end:
            chosen.append((start, finish))
            end = finish
    return chosen` },
        { label: 'Farthest-reachable jump frontier', body: `def can_jump(nums):
    farthest = 0
    for index, jump in enumerate(nums):
        if index > farthest:
            return False
        farthest = max(farthest, index + jump)
        if farthest >= len(nums) - 1:
            return True
    return len(nums) <= 1` }
      ],
      complexity: [
        'Greedy interval scheduling is O(n log n) for sorting and O(n) for the scan; a pre-sorted input reduces the algorithmic scan to O(n).',
        'A frontier greedy such as Jump Game is O(n) time and O(1) auxiliary space because each position is finalized once.'
      ],
      pitfalls: [
        'A plausible local heuristic is not greedy correctness; without an exchange or frontier proof it may fail on a small adversarial input.',
        'Sorting by start time instead of finish time solves a different interval policy and invalidates the earliest-finish proof.',
        'Greedy coin change works for some denominations but not arbitrary systems, where dynamic programming may be required.'
      ],
      recall: [
        { question: 'What does an exchange argument prove?', answer: 'It shows that an optimal solution differing at the first greedy choice can replace its choice with the greedy one without becoming infeasible or worse, preserving an optimal completion.' },
        { question: 'Why does earliest finish maximize interval count?', answer: 'Replacing the first interval of any optimal schedule with the no-later-finishing greedy interval leaves at least as much room for every remaining interval.' },
        { question: 'How does the Jump Game frontier stay correct?', answer: 'Every index at or before the frontier is reachable through processed positions, and processing one of those indices can only extend the farthest reachable boundary.' }
      ]
    },
    {
      id: 'strings-kmp',
      title: 'String algorithms and Knuth–Morris–Pratt',
      required: true,
      summary: 'String matching becomes linear when mismatch work is reused rather than restarting. KMP precomputes the longest proper prefix that is also a suffix for each pattern prefix, then preserves the longest viable matched prefix while scanning the text once.',
      recognitionCues: [
        'The prompt asks for repeated substring search, pattern occurrences, borders, periodicity, or streaming matching.',
        'Naive matching repeatedly rechecks text characters after overlapping partial matches.'
      ],
      invariant: 'Before processing the next character, matched is the length of the longest pattern prefix equal to a suffix of the text consumed so far; fallback follows prefix links without moving the text index backward.',
      template: [
        'Define byte, Unicode code-point, grapheme, normalization, case, and empty-pattern semantics before matching.',
        'Build the prefix-function array by falling back through earlier borders until the next symbol matches or the border becomes empty.',
        'Scan text with the same fallback, emit a match at full pattern length, then fall back to allow overlapping matches.'
      ],
      code: [
        { label: 'KMP prefix function', body: `def prefix_function(pattern):
    prefix = [0] * len(pattern)
    matched = 0
    for index in range(1, len(pattern)):
        while matched and pattern[index] != pattern[matched]:
            matched = prefix[matched - 1]
        if pattern[index] == pattern[matched]:
            matched += 1
        prefix[index] = matched
    return prefix` },
        { label: 'All KMP match positions including overlaps', body: `def kmp_search(text, pattern):
    if pattern == "":
        return list(range(len(text) + 1))
    prefix = prefix_function(pattern)
    matches, matched = [], 0
    for index, char in enumerate(text):
        while matched and char != pattern[matched]:
            matched = prefix[matched - 1]
        if char == pattern[matched]:
            matched += 1
        if matched == len(pattern):
            matches.append(index - len(pattern) + 1)
            matched = prefix[matched - 1]
    return matches` }
      ],
      complexity: [
        'Prefix construction is O(m), search is O(n), and auxiliary space is O(m) because each fallback decreases matched and each successful comparison advances it.',
        'Returning all positions additionally costs O(z) output space for z matches; streaming search can keep only prefix state and the current matched length.'
      ],
      pitfalls: [
        'Falling back to zero immediately loses overlapping prefix information and can restore quadratic behavior or miss matches.',
        'After a full match, resetting matched to zero misses overlapping occurrences; fall back through the final prefix link instead.',
        'Indexing Unicode code points is not the same as user-perceived grapheme matching, and normalization can change equality.'
      ],
      recall: [
        { question: 'What does the KMP prefix value at index i mean?', answer: 'It is the length of the longest proper prefix of the pattern prefix ending at i that is also a suffix of that same prefix.' },
        { question: 'Why does KMP run in linear time?', answer: 'The text index never retreats, and across construction or search the matched-prefix pointer can increase only with processed characters and fall only through strictly shorter prefix links.' },
        { question: 'How does KMP find overlapping matches?', answer: 'After emitting a full match it sets matched to the longest proper border of the pattern, preserving the suffix that can begin the next occurrence.' }
      ]
    },
    {
      id: 'design-lru-lfu',
      title: 'Data-structure design: LRU and LFU caches',
      required: true,
      summary: 'Cache-design interviews combine API semantics with coordinated indexes. LRU needs O(1) key lookup plus recency updates; LFU additionally maintains frequency buckets and an LRU order within each frequency so eviction remains O(1) under a declared tie policy.',
      recognitionCues: [
        'The prompt requires get and put in O(1) while evicting the least recently used entry at capacity.',
        'Eviction prefers the lowest access frequency and breaks ties by recency, requiring two levels of ordering.'
      ],
      invariant: 'Every live key appears exactly once in the value index and exactly once in its ordering structure; LRU order matches most recent access, LFU bucket membership matches stored frequency, empty buckets are removed, and min-frequency names a nonempty bucket when the cache is nonempty.',
      template: [
        'Clarify capacity zero, whether updates count as access, LFU tie-breaking, thread safety, TTL, and what O(1) means for the language containers.',
        'For LRU, combine a dictionary with a doubly linked list or ordered map; move on every qualifying access and evict from the least-recent end.',
        'For LFU, map key to value/frequency, map frequency to an LRU-ordered key bucket, advance keys between buckets, and update minimum frequency exactly when its bucket empties.'
      ],
      code: [
        { label: 'O(1) LRU using OrderedDict semantics', body: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        if self.capacity <= 0:
            return
        if key in self.items:
            self.items.move_to_end(key)
        self.items[key] = value
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)` },
        { label: 'O(1) LFU with LRU tie-breaking inside frequency buckets', body: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.values = {}
        self.frequencies = {}
        self.buckets = defaultdict(OrderedDict)
        self.minimum = 0

    def _touch(self, key):
        frequency = self.frequencies[key]
        del self.buckets[frequency][key]
        if not self.buckets[frequency]:
            del self.buckets[frequency]
            if self.minimum == frequency:
                self.minimum += 1
        self.frequencies[key] = frequency + 1
        self.buckets[frequency + 1][key] = None

    def get(self, key):
        if key not in self.values:
            return -1
        self._touch(key)
        return self.values[key]

    def put(self, key, value):
        if self.capacity <= 0:
            return
        if key in self.values:
            self.values[key] = value
            self._touch(key)
            return
        if len(self.values) == self.capacity:
            evicted, _ = self.buckets[self.minimum].popitem(last=False)
            if not self.buckets[self.minimum]:
                del self.buckets[self.minimum]
            del self.values[evicted], self.frequencies[evicted]
        self.values[key], self.frequencies[key], self.minimum = value, 1, 1
        self.buckets[1][key] = None` }
      ],
      complexity: [
        'Dictionary plus linked-order operations make LRU get and put O(1) expected time with O(capacity) space.',
        'LFU get and put are O(1) expected when frequency buckets provide O(1) ordered insertion, deletion, and oldest eviction; unbounded frequency counters can require aging in long-lived systems.'
      ],
      pitfalls: [
        'Updating a value without moving or touching it may violate the stated access policy; decide whether put counts as use.',
        'LFU minimum frequency cannot be found by scanning buckets if O(1) is required, and it must advance only when the current bucket becomes empty.',
        'These interview implementations are not thread-safe and omit TTL, size-weighted capacity, admission, and stampede control needed in production.'
      ],
      recall: [
        { question: 'Why does LRU require both a map and a linked order?', answer: 'The map finds a key in O(1), while the linked order removes, moves, and evicts nodes in O(1); either structure alone makes one required operation linear.' },
        { question: 'How does LFU break ties without losing O(1) operations?', answer: 'Each frequency owns an LRU-ordered bucket, so eviction removes the oldest key from the current minimum-frequency bucket directly.' },
        { question: 'What invariant is easiest to break in LFU?', answer: 'Moving a key must update its frequency map, remove it from the old bucket, delete empty buckets, maintain minimum frequency, and insert it as most recent in the new bucket exactly once.' }
      ]
    },
    {
      id: 'divide-and-conquer',
      title: 'Divide and conquer, merge sort, and selection',
      required: true,
      summary: 'Divide and conquer splits a problem into smaller independent or nearly independent pieces, solves them recursively, and combines results. Senior answers define the subproblem contract, recurrence, base case, combine cost, and worst-case behavior rather than assuming every halving recursion is efficient.',
      recognitionCues: [
        'The input can be partitioned into smaller ranges whose answers combine, as in sorting, inversion counting, closest pair, or tree construction.',
        'The prompt asks for an order statistic where partitioning can discard one side without fully sorting.'
      ],
      invariant: 'Each recursive call returns the complete answer for its exact half-open subrange; the combine or partition step preserves all elements and establishes the property needed to discard or merge subproblems.',
      template: [
        'Use half-open intervals, define the smallest base case, and prove that every recursive range is strictly smaller.',
        'Write the combine or partition invariant before recursion, then derive T(n) from subproblem sizes and nonrecursive work.',
        'State whether input is mutated, how pivots are chosen, how duplicates behave, and what prevents worst-case recursion depth.'
      ],
      code: [
        { label: 'Stable merge sort over half-open slices', body: `def merge_sort(values):
    if len(values) <= 1:
        return values[:]
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    merged.extend(left[i:]); merged.extend(right[j:])
    return merged` },
        { label: 'Randomized iterative quickselect', body: `import random

def kth_smallest(values, k):
    if not 0 <= k < len(values):
        raise IndexError("k is outside the array")
    left, right = 0, len(values) - 1
    while True:
        pivot_index = random.randrange(left, right + 1)
        values[pivot_index], values[right] = values[right], values[pivot_index]
        pivot, store = values[right], left
        for index in range(left, right):
            if values[index] < pivot:
                values[store], values[index] = values[index], values[store]
                store += 1
        values[store], values[right] = values[right], values[store]
        if store == k:
            return values[store]
        if k < store:
            right = store - 1
        else:
            left = store + 1` }
      ],
      complexity: [
        'Merge sort satisfies T(n)=2T(n/2)+O(n)=O(n log n), uses O(n) auxiliary merge space here, and is stable because equal left elements are emitted first.',
        'Randomized quickselect is O(n) expected time and O(n²) worst-case time; the iterative version uses O(1) stack space but mutates the input.'
      ],
      pitfalls: [
        'Overlapping or non-shrinking subranges cause duplicate work or infinite recursion; half-open boundaries make the partition explicit.',
        'Quicksort and quickselect can degrade to quadratic time and linear recursion depth under consistently bad pivots; randomization changes expectation, not the worst-case bound.',
        'A partition with many values equal to the pivot can make poor progress unless equality handling or three-way partitioning is deliberate.'
      ],
      recall: [
        { question: 'How does the Master-style recurrence explain merge sort?', answer: 'Two half-size recursive calls contribute across logarithmically many levels, and each level merges a total of n elements, yielding O(n log n).' },
        { question: 'Why can quickselect discard one partition?', answer: 'After partitioning, the pivot has its final rank, so comparing that rank with k proves the desired element lies entirely on one side or is the pivot.' },
        { question: 'What makes the shown merge sort stable?', answer: 'When keys compare equal it takes the element from the left half first, preserving the original cross-half order of equal elements.' }
      ]
    }
  ];

  const modernCvModules = [
    {
      id: 'classical-cv-filtering', title: 'Classical filtering and feature primitives', required: true,
      summary: 'Classical image processing turns sampling, filtering, local derivatives, morphology, scale, and color representation into explicit, testable operators. Senior fluency means choosing each operator from the signal and nuisance model rather than treating preprocessing as an unversioned bag of defaults.',
      keyPoints: [
        'A linear shift-invariant filter combines a neighborhood with a kernel. Mathematical convolution flips the kernel, while many image-library functions compute correlation; symmetric Gaussian kernels hide that distinction but derivative kernels do not.',
        'Gaussian smoothing suppresses high-frequency noise before differentiation. Sobel or Scharr filters estimate horizontal and vertical derivatives, from which gradient magnitude and orientation support edge decisions.',
        'Canny edge detection composes smoothing, gradients, non-maximum suppression, and two-threshold hysteresis; its output depends on blur scale, threshold policy, and image dynamic range.',
        'Harris corners come from the local second-moment matrix of image gradients: two large eigenvalues indicate intensity change in two directions, unlike a one-direction edge response.',
        'Binary erosion shrinks foreground and dilation expands it relative to a structuring element; opening removes small foreground structures, while closing fills small gaps or holes. Grayscale morphology uses neighborhood minima or maxima.',
        'A Gaussian pyramid low-pass filters before subsampling to avoid aliasing. A Laplacian pyramid stores band-pass residuals between adjacent Gaussian levels for multiscale blending, reconstruction, or feature analysis.',
        'Color spaces expose different nuisance structure: linear RGB supports physical mixing, HSV separates a convenient but unstable hue coordinate, YCbCr separates luma from chroma, and Lab approximates perceptual distances only under a defined white point and transfer convention.',
        'Border mode, numeric dtype, channel order, gamma transfer, kernel normalization, and coordinate origin are part of the algorithm contract because each can change gradients, colors, and thresholded topology.'
      ],
      formulas: [
        'Discrete convolution: (I*K)[x,y]=∑_u∑_v K[u,v]I[x-u,y-v]; a separable k×k kernel reduces per-pixel work from O(k²) to O(2k).',
        'Gradient magnitude and orientation: |∇I|=sqrt(I_x²+I_y²) and θ=atan2(I_y,I_x).',
        'Harris response: M=∑w[[I_x²,I_xI_y],[I_xI_y,I_y²]] and R=det(M)-k·trace(M)².',
        'For flat grayscale morphology with neighborhood B, dilation is max_{b∈B} I(x-b) and erosion is min_{b∈B} I(x+b), subject to the chosen border convention.'
      ],
      decisionRules: [
        'Use a classical pipeline as the first baseline when imaging is controlled, labels are scarce, latency or interpretability is strict, and the target is expressible through contrast, shape, scale, or geometry.',
        'Choose derivative and Gaussian scale from noise level and the smallest relevant structure; use a pyramid or explicit scale sweep when object size varies materially.',
        'Choose morphology from the topology to preserve and a structuring element expressed in deployment-relevant units; validate object count, connectivity, and boundary displacement rather than only pixel accuracy.',
        'Choose color representation from the nuisance to isolate, preserve the original pixels, and fit every threshold or normalization on deployment-like captures under the exact conversion and range convention.'
      ],
      pitfalls: [
        'Computing signed derivatives or filter accumulations in uint8 clips negatives and overflows sums, creating plausible but incorrect edges.',
        'Downsampling without a suitable low-pass filter aliases texture into false structure; arbitrary padding can also create strong artificial borders.',
        'Morphology can erase a small true object, merge nearby instances, or move a boundary, so more iterations are not a harmless cleanup step.',
        'Fixed color or edge thresholds often fail under exposure, white-balance, sensor, and gamma changes; HSV hue is especially unstable near zero saturation.'
      ],
      systemDesignUse: 'Version the complete decode-to-feature contract: channel order, transfer function, color conversion, dtype/range, border mode, kernel and scale, thresholds, morphology, pyramid levels, and resize order. Monitor intermediate distributions and task-level failures by camera and lighting slice.',
      recall: [
        { question: 'What mechanics distinguish an edge from a Harris corner?', answer: 'An edge produces a strong gradient change mainly along one direction, so one second-moment eigenvalue dominates; a corner changes in two directions, making both eigenvalues and the positive Harris response large.' },
        { question: 'Why must a pyramid blur before subsampling?', answer: 'Subsampling lowers the Nyquist limit, so a low-pass filter must remove frequencies that would otherwise fold into lower-frequency alias patterns.' },
        { question: 'How do opening and closing change a binary mask?', answer: 'Opening is erosion followed by dilation and removes foreground structures smaller than the structuring element; closing is dilation followed by erosion and fills small gaps or holes.' },
        { question: 'Which production evidence validates a classical preprocessing stage?', answer: 'Measure end-task quality and intermediate distributions by sensor, illumination, scale, and object size while replaying the exact dtype, color, border, threshold, and resize contract used in serving.' }
      ]
    },
    {
      id: 'local-features-matching', title: 'Local features, descriptors, and robust matching', required: true,
      summary: 'Local-feature pipelines detect repeatable image locations, describe their neighborhoods, retrieve candidate correspondences, and reject geometrically inconsistent matches. They remain strong for registration, localization, stitching, retrieval, and low-data systems when texture and viewpoint assumptions are explicit.',
      keyPoints: [
        'Detection, orientation/scale assignment, description, nearest-neighbor search, and geometric verification are separate stages; a repeatable keypoint is not automatically distinctive, and a close descriptor is not automatically a valid correspondence.',
        'SIFT searches Difference-of-Gaussian extrema across position and scale, rejects unstable low-contrast or edge-like points, assigns dominant orientation, and summarizes a rotated neighborhood as a normalized 128-dimensional gradient-histogram descriptor.',
        'ORB detects FAST corners across an image pyramid, ranks them with FAST or Harris response, estimates patch orientation from intensity moments, and applies a steered BRIEF-style binary descriptor for efficient Hamming matching.',
        'Use L2-style distance for floating descriptors such as SIFT and Hamming distance for binary descriptors such as ORB. Brute-force search is a useful exact baseline; approximate indexes trade search recall for memory, build time, and latency.',
        'A nearest-to-second-nearest ratio rejects ambiguous descriptors, while mutual nearest-neighbor cross-checking rejects asymmetric assignments. Neither solves repeated texture, bursty features, or viewpoint-induced appearance change by itself.',
        'RANSAC repeatedly samples a minimal correspondence set, fits a geometric model, scores residual inliers, and should refit on the consensus set; its result is meaningful only with the correct model, residual units, degeneracy checks, and stopping policy.',
        'Match quality includes inlier count and ratio, residual distribution, spatial coverage, and downstream pose or warp stability; a large cluster of inliers on one small repeated region can still be unusable.'
      ],
      formulas: [
        'SIFT scale-space response: L(x,y,σ)=G(x,y,σ)*I(x,y) and DoG D(x,y,σ)=L(x,y,kσ)-L(x,y,σ).',
        'For binary descriptors, Hamming(a,b)=∑_j 1[a_j≠b_j], equivalently the population count of a XOR b.',
        'A ratio test accepts a candidate when d₁/d₂<τ, where d₁ and d₂ are distances to the closest and second-closest descriptors under the same metric.',
        'Under independent samples with inlier probability w and minimal sample size s, RANSAC needs N≥log(1-p)/log(1-w^s) trials for success probability p; adaptive estimates remain model assumptions, not guarantees.'
      ],
      decisionRules: [
        'Start with SIFT when matching robustness across scale and rotation matters more than compact descriptors; start with ORB when CPU, memory, or embedded latency dominates, then benchmark both on the actual viewpoint, blur, and illumination range.',
        'Use a homography for a planar surface or approximately pure camera rotation; use a fundamental or essential matrix for general rigid 3D views, and reject a model whose physical assumptions do not fit the scene.',
        'Require descriptor ambiguity filtering plus robust geometric verification and minimum spatial coverage before accepting a registration, loop closure, localization, or duplicate decision.',
        'Move from exact to approximate nearest-neighbor search only after measuring candidate-recall loss, end-to-end inliers, index build/update cost, memory, and tail latency at production scale.'
      ],
      pitfalls: [
        'Copying a ratio threshold from a benchmark ignores descriptor family, database size, repeated patterns, and application error cost; tune it together with the geometric gate.',
        'Using Euclidean distance for binary descriptors or Hamming distance for floating descriptors makes nearest-neighbor ranking meaningless.',
        'RANSAC does not prove a match is correct: a wrong model, collinear samples, repeated structures, or an overly generous pixel threshold can produce a convincing consensus.',
        'Matching coordinates from resized or cropped images without mapping them back consistently corrupts residuals, warps, and pose even when descriptor matches look visually plausible.'
      ],
      systemDesignUse: 'Specify detector and descriptor versions, feature budgets, resize and mask policy, distance metric, index type, ambiguity filters, robust model and residual threshold, minimum inlier coverage, latency limits, and fallback behavior. Log stage-wise counts and residuals so failures can be assigned to detection, retrieval, or geometry.',
      recall: [
        { question: 'How do SIFT and ORB differ mechanically?', answer: 'SIFT finds scale-space extrema and builds floating gradient histograms with assigned orientation; ORB uses pyramid FAST corners, intensity-centroid orientation, and a rotated binary BRIEF-style descriptor.' },
        { question: 'Why is descriptor matching insufficient without RANSAC-style verification?', answer: 'Appearance similarity admits repeated-texture and accidental neighbors; geometric verification tests whether enough correspondences agree with one physically appropriate transformation.' },
        { question: 'How should the RANSAC residual threshold be chosen?', answer: 'Express it in the coordinate space of the fitted model, tie it to localization and calibration noise, then validate inlier purity, spatial coverage, downstream pose or warp error, and failure cost.' },
        { question: 'Which production metrics expose a local-feature tradeoff?', answer: 'Track detected features, candidate recall, accepted-match and inlier ratios, residual quantiles, spatial coverage, registration or pose success, memory, index freshness, and p50/p99 latency by scene slice.' }
      ]
    },
    {
      id: 'geometric-vision', title: 'Camera geometry, calibration, and stereo reconstruction', required: true,
      summary: 'Geometric vision maps points among world, camera, normalized-image, and pixel coordinates through explicit camera and scene assumptions. Senior answers must keep coordinate frames, calibration, degeneracy, uncertainty, and physical observability straight from correspondences through pose and depth.',
      keyPoints: [
        'The pinhole model first transforms a world point into a camera frame with rotation and translation, divides by depth to obtain normalized image coordinates, then applies the intrinsic matrix to produce pixels.',
        'Intrinsics contain focal lengths in pixel units, principal point, and usually zero skew; extrinsics describe a particular world-to-camera transform. Radial, tangential, or fisheye distortion is a separate mapping that must match the deployed lens model.',
        'Calibration estimates intrinsics, distortion, and per-view pattern poses by minimizing reprojection error across varied, accurately detected views. Coverage near image borders, multiple tilts and depths, focus/zoom state, and held-out reprojection matter more than collecting many near-duplicate fronto-parallel frames.',
        'A 3×3 homography maps points between views of one plane, or between cameras under pure rotation. It has eight degrees of freedom up to scale and requires at least four correspondences in general position, with no three source or destination points collinear. It cannot represent general parallax from a 3D scene.',
        'Epipolar geometry constrains a point in one image to a line in the other. The fundamental matrix operates on pixel coordinates; with known intrinsics, the essential matrix operates on normalized coordinates and encodes relative rotation and translation direction up to scale.',
        'Stereo rectification sends corresponding epipolar lines to the same rows so correspondence becomes a one-dimensional disparity search. Larger baseline and focal length in pixels improve distant-depth sensitivity. A larger baseline also increases viewpoint-dependent occlusion, disparity range, and matching difficulty; increasing focal length by narrowing field of view reduces scene coverage, while increasing pixel resolution at fixed field of view does not inherently add occlusion.',
        'Triangulation reconstructs a point from two or more viewing rays. Small parallax, correspondence error, calibration error, rolling shutter, or a point near the epipole makes depth ill-conditioned even when a linear solver returns a number.',
        'Essential-matrix decomposition yields multiple pose candidates; cheirality selects the candidate placing reconstructed points in front of both cameras, while metric translation still requires a known baseline or another scale source.'
      ],
      formulas: [
        'Pinhole projection in homogeneous coordinates: s·x~=K[R|t]X~, with camera coordinates X_c=RX_w+t and pixels u=f_xX_c/Z_c+c_x, v=f_yY_c/Z_c+c_y before distortion.',
        'Epipolar constraint: x₂ᵀFx₁=0; for calibrated cameras E=[t]_×R and F=K_2^{-T}EK_1^{-1} under a consistent camera-1-to-camera-2 convention.',
        'Rectified stereo depth: Z=f_xB/d, where B is baseline and disparity d=u_left-u_right uses the same pixel scale as f_x.',
        'First-order stereo sensitivity: |∂Z/∂d|=f_xB/d²=Z²/(f_xB), so a fixed disparity error causes depth error that grows quadratically with range.'
      ],
      decisionRules: [
        'Fit a homography only for an approximately planar target or pure rotation; fit F for uncalibrated general rigid views and E on undistorted normalized coordinates when trustworthy intrinsics are available.',
        'Calibrate and validate at the deployed resolution, crop, focus, zoom, temperature, and lens state; version parameters per camera and trigger recalibration from reprojection, rectification, or mechanical-drift evidence.',
        'Choose stereo baseline, resolution, and matcher from required depth range and error tolerance, then evaluate overlap, occlusion boundaries, low texture, repetitive texture, and end-to-end latency.',
        'Use robust estimation before nonlinear refinement, reject degenerate or low-parallax solutions, and gate output with inlier coverage, reprojection or Sampson residuals, cheirality, and uncertainty rather than inlier count alone.'
      ],
      pitfalls: [
        'Mixing world-to-camera with camera-to-world transforms, row with column vectors, or left with right multiplication silently produces plausible but wrong poses.',
        'Using distorted pixels with an ideal pinhole epipolar model, or applying intrinsics twice after normalization, biases pose and triangulation most strongly near image edges.',
        'A low mean calibration reprojection error can hide poor border coverage, one bad view, an over-parameterized distortion curve, or a mismatch at the deployed focus and resolution.',
        'Treating a successful homography as evidence that the whole scene is planar fails when foreground objects or camera translation introduce parallax.',
        'Depth explodes as disparity approaches zero, and left-right mismatch around occlusion or repeated texture creates confident but physically impossible 3D points.'
      ],
      systemDesignUse: 'Define every coordinate frame and timestamp, camera and distortion model, calibration artifact and version, image scaling/cropping contract, correspondence and robust-estimation policy, rectification maps, depth uncertainty, synchronization, health checks, and fail-safe behavior. Monitor residuals and depth quality by range, image region, texture, motion, and device.',
      recall: [
        { question: 'What mechanics do K, R, and t implement in the pinhole projection?', answer: 'R and t transform a world point into the camera frame; perspective division by camera-frame depth creates normalized coordinates; K converts those coordinates to pixel units and principal-point offset.' },
        { question: 'When is a homography the right geometric model?', answer: 'When corresponding points lie on one plane, or when the views differ by pure camera rotation so scene depth does not create translational parallax.' },
        { question: 'How do the fundamental and essential matrices differ?', answer: 'F constrains pixel coordinates and absorbs intrinsics; E constrains calibrated normalized coordinates and factors as relative translation skew matrix times relative rotation.' },
        { question: 'What production failure makes stereo depth unreliable far away?', answer: 'Disparity shrinks with distance, so subpixel correspondence or calibration error becomes a large relative disparity error and depth error grows approximately with squared range.' }
      ]
    },
    {
      id: 'depth-and-stereo', title: 'Depth estimation, stereo matching, and multi-view stereo', required: true,
      summary: 'Depth systems infer scene geometry from one image, a calibrated stereo pair, or multiple overlapping views. Senior judgment means separating physically observable metric depth from learned priors, choosing a representation and matcher for the range and hardware budget, and exposing uncertainty, occlusion, calibration, and domain shift rather than returning an unqualified dense map.',
      keyPoints: [
        'A single unconstrained image does not determine absolute scene scale: monocular models learn shape and scale priors from data. A model can output metric units under its training and camera assumptions, but that does not make scale physically observable from arbitrary monocular input.',
        'Rectified stereo reduces correspondence to a horizontal disparity search. Classical pipelines combine a matching cost, spatial aggregation or semi-global regularization, disparity selection, subpixel refinement, and left-right or confidence checks before converting disparity to depth.',
        'Learned stereo commonly extracts left/right features, constructs a correlation or concatenation cost volume over candidate disparities, regularizes it with 2D/3D convolutions or attention, and regresses a disparity distribution. A full H×W×D×C volume improves global reasoning but can dominate memory and latency.',
        'Monocular heads may predict depth, inverse depth, or log depth. Inverse depth allocates more resolution near the camera, while log-depth losses emphasize relative error; the representation, output range, resize convention, and metric-scale policy must remain identical in training and serving.',
        'Self-supervised monocular depth often synthesizes a target view from neighboring frames using predicted depth and camera motion. Its photometric signal assumes sufficient motion, visibility, brightness consistency, and mostly rigid geometry, so occlusion, moving objects, reflections, exposure changes, and rolling shutter require masks or robust modeling.',
        'Multi-view stereo uses calibrated poses and several overlapping images to test depth hypotheses, often through plane-sweep features or per-view cost volumes, then filters and fuses consistent depths into points or surfaces. View selection is essential because tiny baselines add little parallax while extreme baselines, occlusion, and appearance change break matching.',
        'Passive depth fails predictably on textureless, repetitive, specular, transparent, saturated, or occluded regions. Confidence should combine matching ambiguity, visibility and consistency checks, calibration health, and where possible aleatoric or ensemble uncertainty rather than a raw network score alone.',
        'Depth metrics answer different questions: AbsRel weights relative error, RMSE emphasizes large metric errors, threshold accuracy measures multiplicative agreement, and edge or point-cloud metrics expose boundary damage. Every result needs the same valid mask, crop, cap, scale alignment, and units.'
      ],
      formulas: [
        'For rectified stereo, Z=f_xB/d and first-order uncertainty is σ_Z≈(Z²/(f_xB))σ_d, so fixed disparity noise produces rapidly increasing metric error with range.',
        'Monocular scale-invariant log loss can be written L_si=(1/n)∑e_i²−(λ/n²)(∑e_i)², where e_i=log Ẑ_i−log Z_i; λ=1 removes a global log-scale offset from the loss.',
        'A view-synthesis warp projects p̃_t through depth and pose as p̃_s∝K T_{t→s}[D_t(p_t)K⁻¹p̃_t;1], followed by perspective division and differentiable sampling in the source image.',
        'Absolute relative error is AbsRel=(1/|V|)∑_{i∈V}|Ẑ_i−Z_i|/Z_i over an explicitly defined valid-pixel set V.'
      ],
      decisionRules: [
        'Choose calibrated stereo when metric scale, bounded range error, and per-frame geometry justify two synchronized overlapping cameras; size baseline, focal length, and disparity range from the farthest required accuracy and nearest required depth.',
        'Choose monocular depth when only one camera is available or relative ordering is sufficient, but validate metric scale separately by camera and domain and add another scale source when downstream safety depends on absolute distance.',
        'Choose multi-view stereo for mostly static scenes with several posed overlapping views and an offline or batched quality budget; choose stereo, RGB-D, or LiDAR when online latency, moving scenes, or weak view coverage violates those assumptions.',
        'Select classical or compact stereo before a large learned volume when deterministic memory, embedded latency, or limited domain data dominates; adopt learned matching only after range-sliced accuracy gains survive target-device profiling and shift tests.'
      ],
      pitfalls: [
        'Resizing or cropping images without scaling intrinsics and disparity consistently yields a globally wrong depth scale even when the disparity map looks sharp.',
        'Median-scaling a monocular prediction during evaluation hides absolute-scale failure; it is valid for a scale-ambiguous protocol but not evidence of metric ranging.',
        'A low average error can hide catastrophic boundary bleeding, thin-object loss, invalid-pixel coverage, or long-range uncertainty that matters to collision and measurement tasks.',
        'Photometric self-supervision treats independently moving objects and illumination changes as geometry unless motion, visibility, and appearance violations are handled explicitly.',
        'Adding more MVS views can reduce quality when poses drift or views introduce occlusion and extreme appearance change; fusion needs per-view visibility and consistency gates.'
      ],
      systemDesignUse: 'Version camera intrinsics, baseline and synchronization, resize/crop transforms, depth representation and units, valid range, matcher and cost volume, confidence policy, MVS pose source and view selection, fusion rules, and fallback behavior. Monitor coverage and error by range, boundary, texture, motion, weather, camera, and calibration state, and propagate uncertainty to downstream planning or measurement thresholds.',
      recall: [
        { question: 'What mechanics distinguish learned stereo from monocular depth?', answer: 'Stereo compares two calibrated views over disparity hypotheses and can recover metric scale from focal length and baseline; monocular depth maps one image through learned scene priors and has no generic physical observation of absolute scale.' },
        { question: 'How does a stereo cost-volume architecture trade accuracy for compute?', answer: 'It stores matching evidence across pixels and candidate disparities so a regularizer can resolve context and ambiguity, but its memory and work grow with image size, disparity range, feature width, and volume design.' },
        { question: 'When does multi-view stereo improve on a single stereo pair?', answer: 'It helps when several accurately posed views provide complementary parallax and visibility, allowing depth consistency and fusion; it degrades when baselines, pose error, motion, or occlusion violate matching assumptions.' },
        { question: 'Which production evaluation exposes an unsafe depth model?', answer: 'Report valid coverage and metric error by distance, object boundary, texture, motion, lighting, and camera, preserve absolute scale, test calibration and synchronization drift, and measure downstream stopping or measurement error at the operating thresholds.' }
      ]
    },
    {
      id: 'point-clouds-3d', title: 'Point clouds, sparse 3D backbones, and BEV detection', required: true,
      summary: 'Point-cloud systems convert unordered, nonuniform, and often extremely sparse measurements into local geometry, objects, or a shared bird’s-eye-view scene. Senior answers must connect representation choice to quantization, neighborhood structure, sensor physics, sparse-kernel support, coordinate and time alignment, and the downstream cost of 3D localization errors.',
      keyPoints: [
        'A point record can include position, intensity, timestamp, ring, color, or learned features, but its meaning is tied to a sensor frame and acquisition time. Point order is arbitrary, density changes with range and surface angle, and missing returns are not equivalent to empty free space.',
        'PointNet applies a shared pointwise MLP and a symmetric aggregation such as coordinatewise max to obtain permutation invariance, then combines global and per-point features for segmentation. The global bottleneck captures set evidence but does not explicitly model local neighborhoods or density.',
        'PointNet++ recursively samples centroids, groups radius- or k-nearest neighborhoods, and applies local PointNets to build hierarchical features. Radius, sampling, density adaptation, and interpolation determine whether thin or distant structures survive; permutation invariance does not imply rotation invariance.',
        'Voxelization quantizes space so convolution can exploit locality. Dense 3D grids waste cubic memory on empty cells; sparse convolutions operate on active coordinates, while pillars collapse height into vertical columns and use efficient 2D BEV backbones at the cost of fine vertical structure.',
        'Regular sparse convolution can create output sites around active inputs and change the active set. Submanifold sparse convolution emits only at already-active coordinates at stride one, preventing uncontrolled dilation; strided or regular sparse layers are still needed to change scale and exchange information across gaps.',
        '3D detectors may operate on raw points, range images, voxels, pillars, or fused features. Anchor-based heads encode size and yaw priors; center-based heads predict object centers and attributes, but both depend on assignment, orientation conventions, class range, NMS, and dataset-specific evaluation.',
        'BEV provides a common ground-plane coordinate system for detection, tracking, mapping, and planning. LiDAR features reach BEV with measured geometry; camera-only BEV must infer depth while lifting image features, so calibration, occlusion, and depth uncertainty are part of every fused cell.',
        'Early sensor fusion preserves fine cross-modal interactions but demands tight spatial-temporal alignment; late fusion is modular and robust to a missing modality but cannot recover detail discarded by each independent detector. Intermediate BEV fusion is a common compromise, not a calibration substitute.'
      ],
      formulas: [
        'PointNet has the symmetric set form f(P)=γ(MAX_{p_i∈P} φ(p_i)), where φ is shared across points and coordinatewise MAX makes the result invariant to input permutation.',
        'Voxel coordinates are q_x=floor((x−x_min)/v_x), q_y=floor((y−y_min)/v_y), q_z=floor((z−z_min)/v_z); smaller voxel sizes reduce quantization while increasing active sites, memory, and neighbor work.',
        'Coordinate alignment uses p_b=R_ba p_a+t_ba; for moving platforms the transform must be evaluated at the point timestamp or after explicit motion compensation rather than once per scan.',
        'For oriented 3D boxes A and B, IoU_3D=Vol(A∩B)/Vol(A∪B); computing the intersection requires the stated yaw axis, box center convention, and height overlap, not only a 2D BEV overlap.'
      ],
      decisionRules: [
        'Use PointNet as an interpretable small-set baseline or global set encoder; use PointNet++ or a graph/local-attention alternative when local shape and multiscale neighborhoods drive the task and their grouping cost fits the budget.',
        'Use pillars and a 2D backbone when road-scene latency and mature dense kernels dominate; use finer voxels with sparse 3D convolutions when vertical structure and small-object geometry produce measured gains that justify memory and operator complexity.',
        'Use BEV when multiple sensors and downstream agents need one metric ground-plane frame; retain point- or image-space branches when height detail, image evidence, or projection ambiguity would be destroyed by an early collapse.',
        'Choose fusion timing from calibration quality, sensor failure modes, bandwidth, and retraining ownership; always benchmark single-modality degradation and stale or missing-sensor behavior before accepting a fused model.'
      ],
      pitfalls: [
        'Treating zero-filled voxels as observed free space confuses unmeasured or occluded regions with negative evidence and biases occupancy or detection.',
        'Applying augmentation to points without the identical transform for boxes, poses, and velocity labels silently corrupts supervision; yaw wraparound and coordinate handedness create especially plausible errors.',
        'PointNet permutation invariance is often misstated as geometric invariance: rotation, translation, scale, sampling density, and sensor pattern still change its input unless explicitly normalized or augmented.',
        'Projecting unsynchronized sensors into BEV creates doubled or shifted objects during ego or object motion; a low static calibration residual does not validate temporal alignment.',
        'Comparing 3D AP across datasets or implementations without matching class ranges, IoU or center-distance thresholds, difficulty filters, interpolation, and box conventions produces meaningless rankings.'
      ],
      systemDesignUse: 'Define sensor frames and clocks, motion compensation, point schema and range filters, voxel or pillar bounds and resolution, sparse-operator support, box and yaw conventions, fusion stage, BEV extent, tracking interface, confidence and NMS policy, and missing-sensor fallback. Monitor point density, active voxels, calibration residuals, coverage, AP and localization error by range, class, weather, speed, occlusion, and modality health together with target-device p99 latency and memory.',
      recall: [
        { question: 'How does the PointNet architecture become permutation invariant?', answer: 'It applies the same feature function to every point and then uses a symmetric aggregation such as coordinatewise max, so reordering the input points cannot change the aggregated global feature.' },
        { question: 'What mechanics distinguish submanifold sparse convolution from regular sparse convolution?', answer: 'A submanifold layer computes outputs only at existing active coordinates and preserves the stride-one active set, whereas a regular sparse convolution can activate neighboring output coordinates or change resolution.' },
        { question: 'Why can a pillar architecture be faster yet less expressive than sparse 3D voxels?', answer: 'Pillars collapse each vertical column and reuse optimized 2D BEV kernels, reducing 3D sparse work, but that early height aggregation can discard vertical arrangements needed to separate structures.' },
        { question: 'Which production failures should a BEV detector evaluation isolate?', answer: 'Measure detection and localization by range, size, occlusion, weather, and sensor health; inject calibration, timing, and missing-modality faults; and profile active-site count, memory, latency, tracking stability, and downstream planning error.' }
      ]
    },
    {
      id: 'neural-3d', title: 'SfM, SLAM, NeRF, and 3D Gaussian Splatting', required: true,
      summary: 'Modern 3D reconstruction spans explicit geometric estimation, online state tracking, implicit radiance fields, and explicit neural rendering primitives. Senior fluency means separating camera-pose estimation from dense appearance reconstruction, understanding gauge and observability, and choosing SfM, SLAM, NeRF, 3D Gaussian Splatting, or a geometric map from the product’s latency, fidelity, memory, editability, and safety requirements.',
      keyPoints: [
        'Structure from Motion jointly estimates camera poses and sparse 3D points from overlapping images, typically through feature matching, robust two-view geometry, triangulation, incremental or global pose estimation, and bundle adjustment. Multi-view stereo usually consumes those poses to densify geometry; SfM and MVS are related but not interchangeable.',
        'With calibrated intrinsics, Euclidean monocular SfM is determined only up to a similarity transform: global rotation, translation, and scale are not fixed by reprojection alone. With unknown unconstrained intrinsics, reconstruction is only projective until known calibration or valid self-calibration assumptions upgrade it to Euclidean structure. A stereo baseline, known object, GPS, depth, or sufficiently calibrated inertial sensing can then provide metric scale, while weak motion and calibration errors can leave directions poorly observable.',
        'SLAM prioritizes online camera or robot state while maintaining a map. A front end tracks features or photometric alignment; a back end optimizes local bundles or a pose graph; loop closure corrects accumulated drift, and relocalization recovers tracking after failure.',
        'Visual-inertial or RGB-D SLAM improves metric observability and robustness but adds clock, extrinsic, bias, and noise-model calibration. Loop closure is a high-impact hypothesis that needs geometric verification because one false closure can deform the entire trajectory and map.',
        'A NeRF maps 3D position and viewing direction to volume density and view-dependent radiance, then renders rays by differentiable alpha compositing. Positional encodings, multiresolution grids, proposal sampling, and scene bounds change speed, but the core representation remains a learned volumetric appearance field rather than an explicit surface mesh.',
        'NeRF quality depends strongly on camera poses, coverage, static-scene consistency, exposure, and sampling. It can synthesize excellent in-distribution views while producing wrong depth, floaters, or unsupported extrapolation; photometric PSNR alone does not establish geometric fidelity.',
        '3D Gaussian Splatting optimizes explicit anisotropic Gaussians with position, covariance, opacity, and usually spherical-harmonic color, projects them to screen-space ellipses, and alpha-composites sorted splats with differentiable rasterization. Densification and pruning allocate capacity where image gradients demand it.',
        '3DGS usually renders much faster than a densely sampled NeRF but can consume substantial memory and overfit training views with duplicated or floating primitives. Neither representation automatically provides watertight surfaces, collision geometry, semantic consistency, or correct novel illumination.'
      ],
      formulas: [
        'Bundle adjustment minimizes ∑_{(i,j)∈O} ρ(||u_ij−π(K_j T_j X_i)||²), jointly refining observed 3D points X_i and camera poses T_j after fixing the gauge.',
        'Discrete NeRF rendering is C(r)=∑_i T_i α_i c_i with α_i=1−exp(−σ_iδ_i) and T_i=∏_{k<i}(1−α_k), so density controls both contribution and occlusion along the ray.',
        'A 3D Gaussian can parameterize positive-semidefinite covariance as Σ=R S SᵀRᵀ; camera projection maps its local covariance to a screen-space ellipse before depth-ordered alpha compositing.',
        'A pose-graph back end minimizes ∑_{(i,j)} ||Log(Z_ij⁻¹ T_i⁻¹T_j)||²_{Ω_ij}, weighting odometry and loop constraints by their information matrices Ω_ij.'
      ],
      decisionRules: [
        'Choose offline SfM plus MVS when a mostly static scene, broad image coverage, inspectable geometric stages, and batch reconstruction matter more than immediate pose output.',
        'Choose SLAM when an agent needs bounded-latency state and map updates; add stereo, depth, or inertial sensing when metric scale and recovery justify calibration complexity, and retain a loss-of-tracking safety state.',
        'Choose NeRF for bounded-scene novel-view quality or differentiable scene optimization when training and ray-sampling cost fit and explicit topology is not the primary contract; use a mesh, TSDF, or occupancy map for collision, measurement, and editable geometry unless separately validated.',
        'Choose 3D Gaussian Splatting when interactive rendering speed is decisive and explicit primitive memory, sorting, and scene update costs are acceptable; compare against accelerated NeRF and conventional textured geometry under identical views, hardware, and fidelity metrics.'
      ],
      pitfalls: [
        'Reporting a monocular trajectory after a best-fit similarity alignment conceals absolute scale and global-frame error; the alignment protocol must match the deployment contract.',
        'A loop-closure retrieval match is not sufficient evidence: repeated structures can create a false constraint that yields low local residuals while globally corrupting the map.',
        'Training and testing novel views from adjacent frames overstates generalization because near-duplicate imagery shares pose, exposure, and scene content; hold out meaningful trajectories or view regions.',
        'Optimizing NeRF or 3DGS with inaccurate poses can bake pose error into geometry and appearance, so a photometrically sharp rendering can still have wrong surfaces and camera states.',
        'Treating 3DGS primitives as physical surface elements ignores opacity overlap, floaters, view-dependent color, and holes; geometry extraction and downstream collision use require separate evidence.'
      ],
      systemDesignUse: 'Specify the world-frame and scale source, sensor clocks and calibration, SfM or SLAM front end, robust estimation, bundle or pose-graph schedule, loop verification and relocalization, scene bounds and dynamics policy, NeRF or 3DGS training and update path, render hardware, memory budget, geometry export, privacy, and rollback artifacts. Evaluate trajectory and pose error, completeness, geometric accuracy, held-out-view PSNR/SSIM/LPIPS, render p99, memory, update time, and failure recovery by motion, texture, lighting, and scene-change slice.',
      recall: [
        { question: 'What mechanics distinguish offline SfM from online SLAM?', answer: 'SfM can optimize poses and sparse structure over an image collection in batch, while SLAM must track current state under a latency budget, update a map incrementally, detect loop closures, and recover from tracking loss.' },
        { question: 'How does the NeRF rendering objective connect density to occlusion?', answer: 'Samples predict density and color; density becomes alpha, accumulated transmittance attenuates samples behind occupied regions, and their weighted colors compose the rendered pixel compared with observed views.' },
        { question: 'What architecture tradeoff separates 3D Gaussian Splatting from NeRF?', answer: '3DGS stores and rasterizes explicit anisotropic primitives for fast rendering at a potentially high memory cost, while NeRF queries an implicit field along rays and usually spends more sampling compute per rendered view.' },
        { question: 'Which production evaluation prevents a photorealistic reconstruction from hiding geometric failure?', answer: 'Combine held-out trajectory and view splits with pose error, metric surface accuracy and completeness, scale drift, recovery after tracking loss, render latency and memory, and downstream measurement or collision checks rather than relying on PSNR alone.' }
      ]
    },

    {
      id: 'cnn-foundations', title: 'CNN foundations and residual backbones', required: true,
      summary: 'Convolutional networks build spatial features through local weight sharing, downsampling, normalization, and residual composition. Interview fluency means calculating shapes and receptive fields, explaining why deep backbones train, and diagnosing failures across batch size, resolution, and deployment domains.',
      keyPoints: [
        'For one spatial axis, output size is floor((input + 2×padding - dilation×(kernel-1) - 1)/stride + 1). Compute height and width independently.',
        'Stride changes feature-map resolution and receptive-field jump; dilation expands the sampled field without increasing parameter count; padding controls boundary coverage.',
        'Effective receptive field grows across layers, but the empirical influence is often concentrated near the center of the theoretical field.',
        'Residual blocks learn a correction around an identity or projected shortcut, improving gradient flow and making very deep backbones optimizable.',
        'BatchNorm depends on batch statistics during training and running statistics at inference; GroupNorm or LayerNorm can be safer for tiny or variable batches.',
        'Feature stages trade spatial detail for semantic abstraction, which is why dense tasks reuse multiple backbone resolutions.'
      ],
      formulas: [
        'Convolution output: H_out=floor((H+2P-D(K-1)-1)/S+1), and likewise for width.',
        'Receptive-field recurrence: jump_l=jump_{l-1}×stride_l and RF_l=RF_{l-1}+(kernel_l-1)×dilation_l×jump_{l-1}.',
        'weights=K_h×K_w×C_in×C_out/groups (plus optional bias); dense convolution has groups=1, while a depthwise convolution with multiplier m has K_h×K_w×C_in×m weights.'
      ],
      decisionRules: [
        'Preserve higher-resolution stages or use a pyramid when small objects and boundaries matter; downsample aggressively only when latency and global classification dominate.',
        'Choose normalization from batch regime and export support: BatchNorm for stable large batches, GroupNorm for small batches, and fused inference where possible.',
        'Start with a maintained pretrained residual or mobile backbone and profile on target hardware before inventing a custom stem or block.'
      ],
      pitfalls: [
        'Calling same padding universal ignores stride, dilation, even kernels, and framework-specific asymmetric padding.',
        'Freezing weights but leaving BatchNorm in training mode still changes running statistics and can cause silent deployment skew.',
        'Paper FLOPs omit memory traffic, kernel launch overhead, preprocessing, and unsupported operators that dominate real latency.'
      ],
      systemDesignUse: 'Use shape and receptive-field calculations to choose camera resolution, stride, feature stages, and small-object coverage. Specify normalization behavior, checkpoint provenance, target-device latency, and drift by capture domain.',
      recall: [
        { question: 'How do stride, dilation, and padding mechanically change a convolution?', answer: 'Stride changes output sampling and jump, dilation spaces kernel taps to grow receptive field, and padding controls boundary coverage and output size.' },
        { question: 'Why does residual architecture make deep CNNs easier to optimize?', answer: 'Identity shortcuts provide a direct information and gradient path while each block learns a residual correction instead of reconstructing the full mapping.' },
        { question: 'Which production metrics expose a backbone resolution tradeoff?', answer: 'Measure target-device p50/p99 latency, memory and throughput together with accuracy by object size, boundary quality, camera domain, and failure slice.' }
      ]
    },
    {
      id: 'detection-segmentation-foundations', title: 'Detection and segmentation architecture internals', required: true,
      summary: 'Dense prediction turns shared image features into boxes, classes, instance masks, or complete pixel labels. Senior fluency means tracing proposal, assignment, pooling, feature-pyramid, decoder, loss, and postprocessing mechanics across canonical families, then choosing a model from object scale, boundary cost, annotation type, latency, calibration, and runtime evidence.',
      keyPoints: [
        'R-CNN generated external region proposals and ran a CNN per crop; Fast R-CNN shared one image backbone and pooled proposal features, but still depended on an external proposal algorithm; Faster R-CNN added a learned Region Proposal Network over shared features.',
        'An RPN predicts objectness and box deltas for anchors at each feature location, assigns positive/negative/ignore labels by overlap policy, filters and ranks proposals, then applies NMS before the second-stage classifier and regressor.',
        'RoIPool quantizes proposal boundaries into discrete bins, while RoIAlign samples fractional locations with interpolation and avoids that quantization, which is especially important for accurate instance masks and small objects.',
        'Feature Pyramid Networks combine a top-down semantic pathway with lateral backbone features so heads operate at several meaningful resolutions. Proposal or object assignment to levels is part of the scale contract.',
        'SSD predicts class and box offsets densely from several feature maps using default boxes. RetinaNet retains a one-stage anchor design and uses focal loss to reduce the contribution of abundant easy background examples.',
        'FCOS removes anchor boxes and predicts per-location classes, distances to box sides, and centerness; CenterNet-style methods represent objects by centers and regress size or offsets. Anchor-free removes anchor shapes, not label assignment, duplicate handling, or scale choices.',
        'The YOLO lineage moved from one grid-level regression system through anchors, multiscale necks, stronger assignment and augmentation, and in several modern families anchor-free or decoupled heads. Version names do not define one stable architecture, license, export path, or latency profile.',
        'Greedy NMS keeps the highest-scoring candidate and suppresses lower-scoring same-policy overlaps. Soft-NMS, class-aware policies, weighted fusion, or set prediction alter duplicate handling, but crowded-scene recall and calibration still need direct evaluation.',
        'FCN replaces classification-only heads with spatial prediction and learned upsampling; U-Net combines a contracting encoder with same-scale skip features; DeepLab uses atrous convolution and ASPP to aggregate several context scales while preserving denser output.',
        'Mask R-CNN adds an RoIAlign-based per-instance mask branch to Faster R-CNN and predicts class-specific or class-agnostic masks in aligned proposal coordinates before mapping them back to the image.',
        'Semantic segmentation assigns one class per pixel, instance segmentation separates countable objects, and panoptic segmentation gives every pixel a semantic label plus instance identity for things. Panoptic fusion must resolve overlaps and unmatched thing/stuff predictions.',
        'Detection losses combine classification/objectness, assignment, and box regression such as L1, IoU, GIoU, DIoU, or distributional variants. Segmentation may combine cross-entropy with Dice, focal, boundary, or region losses, each changing emphasis and calibration.',
        'Evaluation protocol is part of the model: AP depends on class, IoU thresholds, interpolation, max detections and ignore rules; mask metrics need empty-case policy; panoptic quality decomposes matched-segment quality from recognition quality.'
      ],
      formulas: [
        'Anchor box deltas commonly use t_x=(x−x_a)/w_a, t_y=(y−y_a)/h_a, t_w=log(w/w_a), and t_h=log(h/h_a), with a precisely matched decode transform.',
        'Focal loss is FL(p_t)=−α_t(1−p_t)^γ log p_t, reducing well-classified examples while retaining the cross-entropy target.',
        'GIoU=IoU−area(C∖(A∪B))/area(C), where C is the smallest enclosing box, providing a nonzero optimization signal even for disjoint boxes.',
        'Dice=2TP/(2TP+FP+FN), IoU=TP/(TP+FP+FN), and both require an explicit aggregation and empty-target convention.',
        'Panoptic quality is PQ=Σ IoU(p,g)/( |TP|+0.5|FP|+0.5|FN| ) over matched segments, and decomposes as SQ×RQ under the protocol.'
      ],
      decisionRules: [
        'Choose a two-stage detector when proposal refinement, per-instance features, or mask quality materially improves hard slices; choose one-stage or center-based heads when the measured latency and throughput advantage dominates.',
        'Use FPN or another multiscale path when object-size range is broad; retain a higher-resolution stage or tiling only when small-object recall gains justify memory, duplicate stitching, and latency.',
        'Choose semantic, instance, or panoptic output from the downstream decision: category area, separate object identity, or complete scene understanding, not from benchmark fashion.',
        'Tune assignment, focal or sampling policy, score thresholds, NMS, and max detections jointly on deployment-like density and size slices, then remeasure calibration and event-level behavior.',
        'Benchmark canonical and modern candidates under identical resize, augmentation, checkpoint, precision, compiler, postprocessing, and target hardware before accepting paper AP or FLOPs.'
      ],
      pitfalls: [
        'Calling Faster R-CNN end-to-end does not remove staged assignment and NMS; proposals, second-stage labels, score thresholds, and coordinate transforms remain coupled.',
        'Using RoIPool where mask boundaries matter introduces coordinate quantization; applying RoIAlign with a mismatched spatial scale is equally wrong.',
        'Anchor-free is not hyperparameter-free: center sampling, positive regions, strides, regression ranges, centerness, and duplicate policy replace anchor-shape decisions.',
        'Aggregate AP or Dice can improve while tiny, crowded, rare, boundary-critical, or empty-mask cases regress; protocol and slice tables must travel with the number.',
        'Resizing images without identically transforming boxes, masks, ignore regions, and the inverse postprocessing map creates plausible training curves and systematically wrong outputs.',
        'Panoptic fusion can silently drop low-score things, double-label overlaps, or overwrite stuff; evaluate the final fused map rather than independent heads only.'
      ],
      systemDesignUse: 'Define annotation ontology and ignore rules, image and coordinate transforms, backbone stages, FPN levels, anchor or center assignment, RPN/proposal limits, RoIAlign scale, decoder and upsampling, losses, thresholds, NMS or fusion, metric protocol, event aggregation, target-runtime profiling, human review, drift slices, rollout, and rollback as one versioned contract.',
      recall: [
        { question: 'How did the R-CNN architecture evolve into Faster R-CNN?', answer: 'R-CNN ran a CNN for external proposal crops; Fast R-CNN shared one image feature map and pooled each proposal; Faster R-CNN added a learned shared-feature RPN before the per-proposal head.' },
        { question: 'What mechanics distinguish RoIAlign from RoIPool?', answer: 'RoIAlign preserves fractional proposal coordinates and interpolates sampled feature values, whereas RoIPool quantizes boundaries and bins, introducing alignment error that hurts precise masks.' },
        { question: 'How do RetinaNet and FCOS address one-stage detection differently?', answer: 'RetinaNet uses anchor-based dense predictions plus focal loss for foreground-background imbalance; FCOS predicts per-location class, box-side distances and centerness without anchor shapes but still needs assignment.' },
        { question: 'What architecture differences separate FCN, U-Net, DeepLab, and Mask R-CNN?', answer: 'FCN makes dense fully convolutional predictions, U-Net restores detail through symmetric skips, DeepLab adds atrous multiscale context such as ASPP, and Mask R-CNN predicts aligned masks for individual proposals.' },
        { question: 'How would you evaluate a detector or segmenter for production selection?', answer: 'Match preprocessing and postprocessing, then measure target-hardware p50/p99, memory and throughput with AP, calibration, boundary and object metrics by size, density, class, domain, and downstream event cost.' }
      ]
    },
    {
      id: 'cnn-vs-transformer', title: 'CNNs versus vision transformers', required: true,
      summary: 'CNNs encode locality and translation structure directly. Vision transformers learn broader token interactions and scale well with pretraining, but resolution, data regime, hardware kernels, and dense-task requirements determine which architecture actually wins.',
      keyPoints: [
        'Convolutions share local kernels, giving strong inductive bias and efficient dense feature pyramids.',
        'Self-attention lets tokens exchange global information, while full attention scales quadratically with token count.',
        'Transformers often scale predictably with data and compute and transfer well from large pretraining corpora.',
        'Hybrid and hierarchical models blur the boundary through local windows, convolutions, multiscale stages, and attention.',
        'Visual state-space models such as VMamba use 2D selective scans to aggregate long-range context with linear sequence-length scaling; treat them as a third backbone family and verify realized latency because scan layout and kernel support determine whether asymptotic savings materialize.'
      ],
      formulas: ['Full attention over N tokens costs O(N²d). At fixed patch size, doubling both H and W makes N four times larger and the attention term roughly sixteen times larger.'],
      decisionRules: ['Choose from latency, data, resolution, checkpoint quality, hardware, and dense-task requirements rather than architecture fashion.'],
      pitfalls: ['Global attention does not remove the need for multiscale features, positional information, data curation, or memory control.'],
      systemDesignUse: 'For edge detection with tight latency, a compact CNN or hybrid may win. For reusable pretraining and broad transfer, a transformer may justify its larger data and memory budget.',
      recall: [
        { question: 'What architecture bias does a CNN add mechanically?', answer: 'Local connectivity and translation-equivariant weight sharing make nearby patterns cheap to learn and reuse across positions.' },
        { question: 'How does full attention cost change when both image dimensions double at fixed patch size?', answer: 'Token count grows fourfold, so the quadratic attention matrix and its dominant work grow by roughly sixteen times.' },
        { question: 'Which production tradeoff can reverse a paper ranking between CNN and transformer?', answer: 'Target kernels, batch size, memory bandwidth, resolution, preprocessing, p99 latency, checkpoint export support, and small-object slices can all reverse aggregate benchmark results.' }
      ]
    },
    {
      id: 'vit', title: 'Vision Transformer (ViT)', required: true,
      summary: 'ViT projects image patches into tokens, adds positional information, and applies transformer blocks. Its practical importance is the pretraining-and-transfer recipe and the explicit compute trade made by patch size and resolution.',
      keyPoints: [
        'Each flattened patch is linearly projected to the model dimension, then combined with positional information.',
        'A class token or pooled token representation supports classification; dense tasks reshape or aggregate spatial tokens.',
        'Absolute, relative, or learned positional signals restore spatial ordering that attention alone lacks.',
        'Smaller patches preserve detail but raise token count, attention memory, and serving cost sharply.',
        'Pretraining, augmentation, and regularization compensate for weaker image-specific inductive bias.'
      ],
      formulas: ['Token count N=(H/P)(W/P) for H×W image and P×P patches.', 'Attention memory and dominant full-attention work grow approximately with N².'],
      decisionRules: ['For small domain datasets, start from pretrained weights and compare frozen, partial, and full fine-tuning under the same split.'],
      pitfalls: ['Upscaling input without recalculating token count and quadratic attention memory can break training and serving budgets.'],
      systemDesignUse: 'State checkpoint source, input resolution, patch size, positional interpolation, fine-tuning scope, memory/latency, and behavior on small objects.',
      recall: [
        { question: 'How does ViT architecture turn an image into transformer input?', answer: 'It flattens fixed-size patches, projects them to token embeddings, adds positional signals, and processes them with repeated attention and MLP blocks.' },
        { question: 'Why are positional embeddings mechanically necessary?', answer: 'Self-attention alone is permutation-equivariant, so it needs positional information to distinguish spatial arrangements of otherwise identical token sets.' },
        { question: 'How would you evaluate a production resolution increase for ViT?', answer: 'Recalculate token and attention cost, then measure target-hardware memory and p99 latency alongside accuracy by object size and domain slice.' }
      ]
    },
    {
      id: 'detr', title: 'DETR and set-based detection', required: true,
      summary: 'DETR predicts an unordered set of objects with learned queries and bipartite matching, replacing hand-designed anchors and canonical greedy NMS while retaining thresholding, calibration, resizing, and downstream postprocessing needs.',
      keyPoints: [
        'A fixed query set attends to image features and emits class plus box predictions.',
        'Hungarian matching creates a one-to-one training assignment between predictions and ground truth.',
        'Unmatched queries learn a no-object class, so class imbalance and no-object weight matter.',
        'Original DETR trained slowly and struggled with small objects; deformable and multiscale variants improve efficiency.',
        'One-to-one matching reduces duplicates, but crowded-object and confidence behavior still require validation.',
        'RT-DETR uses an efficient multiscale hybrid encoder and uncertainty-minimal query selection; D-FINE (2024) iteratively refines box-coordinate distributions and adds localization self-distillation, making NMS-free DETR-family models credible real-time baselines that still require target-runtime profiling.'
      ],
      formulas: ['Matching minimizes class cost plus box discrepancy; box loss commonly combines L1 and generalized IoU.', 'A fixed Q-query decoder emits Q candidates regardless of the number of true objects.'],
      decisionRules: ['Use a DETR family when a maintained checkpoint and set reasoning fit; compare against optimized one-stage detectors for strict latency.'],
      pitfalls: ['Saying DETR needs no postprocessing ignores thresholding, coordinate transforms, calibration, tracking, and business rules.'],
      systemDesignUse: 'Compare mAP by size, crowded-scene recall, latency, memory, calibration, export support, and convergence cost against a production baseline.',
      recall: [
        { question: 'What architecture role do learned object queries play in DETR?', answer: 'Each decoder query competes to represent one output slot and attends to encoded image features before predicting a class and box.' },
        { question: 'How does Hungarian matching work mechanically during training?', answer: 'It finds the minimum-cost one-to-one assignment between ground truths and prediction slots, removing permutation ambiguity and duplicate supervision.' },
        { question: 'Which production evaluation can make DETR lose to a one-stage detector?', answer: 'Target-device p99 latency, small/crowded-object recall, calibration, export operators, memory, and retraining cost may outweigh a modest aggregate mAP gain.' }
      ]
    },
    {
      id: 'clip', title: 'CLIP and vision-language contrastive learning', required: true,
      summary: 'CLIP aligns image and text embeddings from paired data, supporting cross-modal retrieval and zero-shot classification while inheriting prompt sensitivity, global-grounding limits, false negatives, and web-data bias.',
      keyPoints: [
        'Separate image and text encoders produce normalized embeddings in one shared space.',
        'Matched batch pairs are positives and other pairs act as negatives; temperature controls logit sharpness.',
        'Zero-shot classification compares an image embedding with embeddings for class prompts.',
        'Prompt wording and label semantics affect results; prompt ensembles reduce some variance.',
        'Global alignment does not guarantee counting, localization, compositionality, or calibrated confidence.',
        'SigLIP replaces CLIP\'s batch-global softmax normalization with independent pairwise sigmoid losses; SigLIP 2 adds captioning, self-distillation, masked prediction, online curation, multilingual data, and native-aspect-ratio variants, improving dense localization as well as retrieval and zero-shot transfer.'
      ],
      formulas: ['Similarity logits sᵢⱼ=(vᵢ·tⱼ)/τ feed symmetric image-to-text and text-to-image cross-entropy.', 'Cosine similarity equals a dot product when both embeddings are L2-normalized.'],
      decisionRules: ['Use CLIP-style embeddings for open-ended retrieval or weakly labeled baselines; adapt when domain terminology or imagery differs.'],
      pitfalls: ['Larger batches add negatives but can add false negatives and distributed communication cost; global alignment is not object grounding.'],
      systemDesignUse: 'Specify embedding version, vector metric, hard-negative mining, prompt evaluation, reranking, ACL filters, index migration, and domain calibration.',
      recall: [
        { question: 'What objective mechanics align the two CLIP encoders?', answer: 'Normalized image and text embeddings form a batch similarity matrix, and symmetric cross-entropy promotes matched diagonal pairs over mismatched pairs.' },
        { question: 'Why does contrastive batch composition matter?', answer: 'Other batch examples define negatives, so size and hardness change the learning signal while semantically valid false negatives can push related examples apart.' },
        { question: 'How would you evaluate CLIP in a production retrieval system?', answer: 'Measure Recall@K and ranking by query/category slice, grounding errors, prompt sensitivity, index freshness, latency, bias, and downstream conversion guardrails.' }
      ]
    },
    {
      id: 'dinov2', title: 'DINOv2, DINOv3, and self-supervised visual features', required: true,
      summary: 'DINO-style self-distillation learns reusable visual representations without paired text labels. DINOv2 emphasizes curated scale and features that transfer to image-level and dense tasks, but still inherits source-distribution and preprocessing assumptions.',
      keyPoints: [
        'A student predicts representations from an exponential-moving-average teacher under different views.',
        'Multi-crop augmentation encourages invariance while patch objectives preserve local structure.',
        'Frozen features support probes, nearest neighbors, detection, segmentation, and depth heads.',
        'Self-supervision avoids label ontology costs but not data curation, leakage, bias, or compute.',
        'Specialized imagery may require adapters or fine-tuning after a frozen baseline establishes the gap.',
        'DINOv3 scales model and curated data, uses Gram anchoring to prevent dense feature-map degradation during long training, and applies post-hoc resolution, model-size, and text-alignment adaptations; compare DINOv2 and DINOv3 checkpoints under the same frozen dense-task protocol.'
      ],
      formulas: ['Teacher update: θ_teacher←mθ_teacher+(1-m)θ_student with high momentum m.', 'A linear probe isolates representation quality by training only a shallow head over frozen features.'],
      decisionRules: ['Start with frozen features, unfreeze progressively only when the validated domain gap justifies cost and overfitting risk.'],
      pitfalls: ['No manual labels does not mean no supervision choices; augmentations, curation, teacher targets, and source data define the learned invariances.'],
      systemDesignUse: 'Use DINOv2 when text alignment is unnecessary and dense visual structure matters; version preprocessing and validate domain transfer, embedding drift, and index compatibility.',
      recall: [
        { question: 'How does the DINO teacher-student mechanism avoid a fixed label target?', answer: 'The EMA teacher produces targets for transformed views while the student learns to match them; centering, sharpening, and view design help prevent collapse.' },
        { question: 'What architecture evidence does a frozen linear probe provide?', answer: 'It measures how linearly accessible downstream information already is in the representation without confounding results with full-backbone adaptation.' },
        { question: 'How would you evaluate DINOv2 production transfer?', answer: 'Compare frozen and adapted models by domain and dense-task slice, latency, embedding stability, data drift, and the operating metric rather than only a generic benchmark.' }
      ]
    },
    {
      id: 'sam2', title: 'SAM, SAM2, and SAM3', required: true,
      summary: 'SAM turns points, boxes, or masks into segmentations; SAM2 extends promptable segmentation to video using memory. Their strongest production roles are often annotation assistance, interactive correction, proposal generation, or validated components.',
      keyPoints: [
        'A heavy image encoder can be amortized across multiple prompts while a prompt and mask decoder responds interactively.',
        'Ambiguous prompts may yield multiple plausible masks, and class-agnostic masks do not inherently provide semantic labels.',
        'SAM2 memory propagates information over video, introducing occlusion, reappearance, drift, and identity-switch failures.',
        'Interactive quality should be measured against click/box count and correction time, not one-shot IoU alone.',
        'Domain boundaries, tiny structures, and adjacent objects require explicit validation and often adaptation.',
        'SAM 3 adds promptable concept segmentation: text or exemplar prompts can detect, segment, and track all instances of an open-vocabulary concept via a presence token and decoupled detector-tracker; SAM 3.1 adds shared-memory multi-object tracking for higher efficiency.'
      ],
      formulas: ['Interaction curve reports IoU or boundary quality after 1, 3, or N prompts.', 'Video mask evaluation should pair region quality with temporal consistency and identity continuity.'],
      decisionRules: ['Use SAM for label assistance when humans can prompt/correct; benchmark a smaller domain model for automated high-throughput inference.'],
      pitfalls: ['A plausible mask is not a safety case and can merge adjacent objects, miss tiny structures, or drift across frames.'],
      systemDesignUse: 'Specify prompt source, encoder caching, interaction latency, correction workflow, video memory reset, mask confidence, audit trail, and domain validation.',
      recall: [
        { question: 'How is the SAM architecture split for interactive use?', answer: 'An image encoder computes reusable features, a prompt encoder represents points or boxes, and a lightweight mask decoder combines them for rapid repeated interaction.' },
        { question: 'What mechanics make SAM2 different for video?', answer: 'A temporal memory stores prior frame and mask information so new predictions can propagate object state, at the cost of drift and identity failure modes.' },
        { question: 'Which production evaluation matters more than one-shot mask IoU?', answer: 'Measure quality versus interaction count, correction time, boundary and small-object slices, temporal consistency, latency, and expert acceptance in the actual workflow.' }
      ]
    },
    {
      id: 'grounding-dino', title: 'Grounding DINO and open-vocabulary detection', required: true,
      summary: 'Grounding DINO conditions detection on text so boxes align with supplied phrases. Query-time vocabulary is flexible but bounded by pretraining, prompt semantics, thresholding, and compounding errors when boxes feed another model such as SAM.',
      keyPoints: [
        'Text and image features interact so predicted boxes associate with phrases.',
        'Text and box thresholds control candidates and need domain calibration.',
        'Open vocabulary does not guarantee truly novel concepts or calibrated confidence.',
        'Composing text-to-box and box-to-mask stages compounds recall and calibration errors.',
        'Synonyms, attributes, background confusion, and unsupported terms need explicit test sets.',
        'Grounding DINO 1.5 separates a scaled Pro model from an Edge model with fewer feature scales and TensorRT optimization; compare both with YOLO-World, whose re-parameterizable vision-language PAN and region-text contrastive pretraining target real-time open-vocabulary detection.'
      ],
      formulas: ['Grounded segmentation composes text→boxes→promptable masks, so end-to-end recall cannot exceed the box proposal recall.', 'Threshold selection trades missed concepts against false grounding and reviewer load.'],
      decisionRules: ['Use it for discovery, bootstrapping, or long-tail baselines; use a closed-set optimized detector when ontology and latency are stable.'],
      pitfalls: ['A fluent phrase match can still point to the wrong region, and confidence values across detector and segmenter are not automatically comparable.'],
      systemDesignUse: 'Define allowed ontology, prompt templates, thresholds, caching, false-grounding review, unsupported-concept fallback, and combined-stage monitoring.',
      recall: [
        { question: 'What architecture interaction enables phrase-conditioned boxes?', answer: 'Text and visual features are fused or cross-attended so object-query predictions are scored against supplied language rather than only a fixed class head.' },
        { question: 'What mechanics fail in Grounding DINO plus SAM?', answer: 'The phrase may map to the wrong or missing box, then the prompted mask may choose the wrong boundary, and the two confidence scales may not compose.' },
        { question: 'How would you evaluate open-vocabulary detection in production?', answer: 'Test synonyms, unseen and unsupported concepts, size and background slices, false grounding, threshold calibration, end-to-end mask recall, and latency.' }
      ]
    },
    {
      id: 'video-tracking', title: 'Video understanding and multi-object tracking', required: true,
      summary: 'Video systems must decide what temporal evidence to sample, encode, associate, and aggregate before an event decision. Tracking adds state estimation and identity assignment; strong designs separate frame quality, track continuity, event quality, and end-to-end latency.',
      keyPoints: [
        'Uniform, keyframe, motion-aware, or adaptive frame/clip sampling trades temporal recall against decode and model cost.',
        'Temporal encoders include 3D convolutions, two-stream models, recurrent/temporal pooling, and video transformers with different context and memory costs.',
        'Tracking-by-detection predicts boxes each frame then associates them using motion, appearance, IoU, and gating.',
        'A Kalman filter predicts a state and uncertainty; SORT combines that motion model with Hungarian assignment, while DeepSORT adds appearance embeddings.',
        'Late fusion and cascades keep cheap frame/audio/text models separate before event aggregation, escalating uncertain or high-risk clips.',
        'Track and event metrics must expose fragmentation, identity switches, latency to alert, and missed short-duration events.',
        'VideoMAE/InternVideo2 learn transferable spatiotemporal features through masked pretraining, while V-JEPA 2 predicts masked video representations in latent space rather than reconstructing pixels and V-JEPA 2-AC adds an action-conditioned world model; evaluate frozen transfer, temporal localization, and domain shift before fine-tuning.',
        'ByteTrack first associates high-confidence detections, then matches remaining tracks to low-confidence detections to recover occluded objects; detector calibration and the two score thresholds are part of the tracker and must be tuned jointly.',
        'HOTA balances detection and association across localization thresholds and decomposes into DetA, AssA, and LocA; report that breakdown with IDF1 and task-level event metrics rather than relying on MOTA alone.'
      ],
      formulas: [
        'Kalman predict/update alternates x̂_t|t-1=F x̂_{t-1} with a measurement-corrected posterior weighted by uncertainty.',
        'Association cost can combine 1-IoU, appearance distance, and motion gating before Hungarian matching.',
        'MOTA combines false positives, false negatives, and identity switches; IDF1 emphasizes identity-consistent matches.'
      ],
      decisionRules: [
        'Start with sampled-frame inference and explicit event rules; add temporal encoders only when held-out errors prove frame evidence is insufficient.',
        'Use motion-only tracking for stable high-frame-rate scenes; add appearance when occlusion and re-entry create identity ambiguity.',
        'Choose sampling and cascade thresholds from event-level recall and alert latency under the real compute and reviewer budget.'
      ],
      pitfalls: [
        'Random train/test clips from the same source video leak scene and identity information; split by deployment-independent video, camera, or event.',
        'Frame-level accuracy can look strong while short events are never sampled or duplicate frame alerts overwhelm operators.',
        'A tracker can preserve a confident wrong identity through occlusion; motion and appearance gates need reset and uncertainty policies.',
        'A long temporal window increases latency and memory and can dilute a brief event unless aggregation is designed for it.'
      ],
      systemDesignUse: 'Specify decode location, sampling cadence, temporal window, detector/tracker contract, association reset, multimodal fusion, event deduplication, backpressure, reviewer workflow, and event/track metrics by camera condition.',
      recall: [
        { question: 'How does SORT work mechanically after per-frame detection?', answer: 'A Kalman filter predicts each track, an IoU-based cost matrix matches detections with Hungarian assignment, matched tracks update, and unmatched tracks age or start.' },
        { question: 'When does a temporal encoder architecture add value over frame pooling?', answer: 'It helps when motion order, duration, or cross-frame interaction contains signal that independent frame scores and simple aggregation cannot recover.' },
        { question: 'Which production metrics expose a tracking or sampling tradeoff?', answer: 'Track IDF1 and switches, event precision/recall, short-event recall, time-to-alert, duplicate alerts, decode/model latency, and camera-condition slices expose it.' }
      ]
    },
    {
      id: 'vlm', title: 'Vision-language models', required: true,
      summary: 'A VLM connects visual evidence to a language model for captioning, question answering, extraction, and multimodal reasoning. Fluent output can hide weak grounding, so architecture, token budget, structured validation, and abstention matter.',
      keyPoints: [
        'Architectures project image tokens into an LLM, use cross-attention, or unify multimodal tokens.',
        'Training may combine pretrained components, connector alignment, instruction tuning, and preference or safety tuning.',
        'Resolution, tiling, OCR, frame sampling, and context limits determine which evidence is visible.',
        'Structured extraction needs schema validation and deterministic checks rather than free-form trust.',
        'Grounding requires region, citation, counterfactual, and unsupported-question evaluation.',
        'Qwen2.5-VL exemplifies a native dynamic-resolution ViT with window attention and absolute time encoding for long video; evaluate document/OCR extraction, coordinate grounding, and second-level temporal localization separately from free-form QA.'
      ],
      formulas: ['In token-concatenation VLMs, visual tokens consume the decoder context window; in cross-attention VLMs the visual sequence is separate, but cross-attention compute and memory still grow approximately with N_text×N_visual per cross-attention layer.', 'Selective risk should be plotted against coverage when the system can abstain or route to review.'],
      decisionRules: ['Use a VLM when language-conditioned interpretation is essential; prefer dedicated perception for stable narrow high-throughput tasks.'],
      pitfalls: ['Correct-sounding language is not proof of pixel grounding, factual support, calibration, or policy compliance.'],
      systemDesignUse: 'Add prompt/model/version lineage, structured output validation, evidence citations, grounding tests, safety, cost, caching, latency, abstention, and human review.',
      recall: [
        { question: 'What architecture patterns connect vision features to an LLM?', answer: 'Common patterns project visual tokens into the LLM embedding space, insert cross-attention layers, or train one unified multimodal token transformer.' },
        { question: 'Why can more image tiles mechanically hurt a VLM request?', answer: 'Tiles increase visual token count, attention work, memory, and latency while consuming context that could otherwise hold instructions or retrieved evidence.' },
        { question: 'How should a production VLM be evaluated for grounding?', answer: 'Use region and citation correctness, counterfactual image tests, unsupported-question abstention, structured-field exactness, safety slices, latency, and review overturn rate.' }
      ]
    },
    {
      id: 'diffusion', title: 'Diffusion models', required: true,
      summary: 'Diffusion models learn to reverse a gradual noising process. Interview answers should connect the denoising objective, conditioning, iterative sampling cost, and the evidence required before synthetic data helps a real CV system.',
      keyPoints: [
        'The forward process adds noise; the model learns a reverse denoising direction or related parameterization.',
        'Latent diffusion denoises a compressed representation to reduce cost.',
        'Conditioning can come from text, masks, depth, pose, or images.',
        'Classifier-free guidance trades diversity for stronger condition alignment.',
        'Synthetic data can add coverage and also generator bias, artifacts, privacy issues, and shortcut cues.',
        'Modern generators such as Stable Diffusion 3 use DiT/MMDiT backbones with rectified-flow or flow-matching training, learning a velocity field along a data-noise interpolation rather than necessarily predicting ε; consistency and latent-consistency distillation can reduce iterative sampling to a few steps.'
      ],
      formulas: ['A common objective is E[||ε-εθ(x_t,t,c)||²].', 'Iterative sample latency is roughly denoiser_step_latency × number_of_steps unless batching or distillation changes the path.'],
      decisionRules: ['Use controlled synthetic augmentation only after real-only holdout gains and artifact/slice audits establish value.'],
      pitfalls: ['Photorealism does not imply correct labels, physical consistency, representative frequency, or licensing safety.'],
      systemDesignUse: 'Track prompt, generator, sampler, seed, and provenance; filter outputs; cap synthetic-to-real ratios; and evaluate only on untouched real deployment-like data.',
      recall: [
        { question: 'What mechanics does a diffusion denoiser learn?', answer: 'At sampled timesteps it predicts noise, velocity, score, or a related target so repeated reverse updates can transform noise toward the data distribution.' },
        { question: 'How does latent diffusion architecture reduce sampling cost?', answer: 'It performs iterative denoising in a lower-dimensional autoencoder latent and decodes to pixels only after the reverse process.' },
        { question: 'How would you evaluate synthetic data in production training?', answer: 'Hold model and real test set fixed, compare real-only versus mixed training by target slice, audit artifacts and privacy, and monitor real-world calibration and drift.' }
      ]
    },
    {
      id: 'compression', title: 'Compression and efficient inference', required: true,
      summary: 'Production optimization is a measured trade among latency, throughput, memory, energy, hardware support, accuracy, and engineering complexity. Parameter count and FLOPs are hypotheses, not wall-clock evidence.',
      keyPoints: [
        'Post-training quantization is fast but sensitive to calibration and outliers; quantization-aware training adapts at extra cost.',
        'Distillation transfers outputs or features into a student whose architecture and data still cap capability.',
        'Structured pruning removes channels, heads, or blocks hardware can exploit; unstructured sparsity may not accelerate.',
        'Compilation, fusion, kernels, memory layout, and input pipelines can dominate theoretical compute.',
        'Cascades route easy cases cheaply and escalate uncertain cases, requiring calibrated routing and fallback capacity.'
      ],
      formulas: ['Weight memory≈parameter_count×bits_per_parameter/8, excluding activations and runtime workspace.', 'Cascade expected cost≈cost_fast+P(escalate)×cost_slow, with queueing and fallback capacity included.'],
      decisionRules: ['Profile end to end on target hardware before choosing quantization, pruning, resolution, batching, or architecture changes.'],
      pitfalls: ['A smaller file, lower FLOP count, or sparse tensor does not guarantee lower p99 latency or energy on unsupported kernels.'],
      systemDesignUse: 'Report target-device benchmarks, cold start, batch size, precision, operator fallback, accuracy/calibration slices, rollout, and rollback.',
      recall: [
        { question: 'What mechanics distinguish PTQ from QAT?', answer: 'PTQ maps a trained model to lower precision using calibration, while QAT inserts fake-quantization effects during training so weights adapt to rounding and clipping.' },
        { question: 'How can structured pruning change the architecture?', answer: 'Removing whole channels, heads, or blocks changes tensor dimensions and can reduce dense kernel work, unlike arbitrary zeros that hardware may still process.' },
        { question: 'Which production evaluation proves a compression win?', answer: 'Benchmark p50/p99 latency, throughput, peak memory, energy and cold start on target hardware together with calibration and quality by critical slice.' }
      ]
    },
    {
      id: 'self-supervised-vision', title: 'Self-supervised vision: SimCLR, MoCo, BYOL, and MAE', required: true,
      summary: 'Self-supervised vision learns representations from view relationships or reconstruction targets instead of manual class labels. Senior answers should compare contrastive negatives, momentum teachers, collapse prevention, augmentation invariances, masking ratios, dense-transfer behavior, distributed batch effects, and the evidence needed before replacing supervised pretraining.',
      keyPoints: [
        'SimCLR encodes two augmented views, projects them through a contrastive head, and uses other batch views as negatives. Its result depends strongly on augmentation, temperature, batch composition, projection-head design, and distributed all-gather correctness.',
        'MoCo maintains a queue of encoded keys and a momentum-updated key encoder, decoupling negative-set size from the current minibatch while requiring consistent queue age, shuffle or normalization behavior, and checkpointed state.',
        'BYOL trains an online encoder and predictor to match a stop-gradient target encoder updated by exponential moving average, avoiding explicit negatives. Asymmetry, predictor, normalization, augmentation, and target dynamics are part of empirical collapse prevention.',
        'Masked Autoencoders remove a high fraction of image patches, encode only visible tokens, and use a lightweight decoder to reconstruct masked content. They move much of the pretraining compute away from full-resolution encoding but optimize pixel reconstruction rather than direct semantic discrimination.',
        'Contrastive methods define positives through augmentations and can make semantically related examples false negatives; teacher-student methods avoid explicit negatives but still encode invariances and data bias through their view and target pipelines.',
        'Linear probes test linearly accessible frozen features, kNN probes test local geometry, and full fine-tuning tests adaptability. Detection, segmentation, depth, and retrieval transfer may rank checkpoints differently from classification.',
        'Patch-level or multiscale objectives tend to support dense transfer better than a global-only objective, but preprocessing, layer choice, token resolution, and feature normalization can dominate downstream results.',
        'Large unlabeled corpora still require deduplication, privacy and license review, domain coverage, leakage controls, and compute accounting; self-supervised does not mean unsupervised system design.'
      ],
      formulas: [
        'NT-Xent for positive pair (i,j): −log[exp(sim(z_i,z_j)/τ)/Σ_{k≠i}exp(sim(z_i,z_k)/τ)], with the exact denominator and symmetric averaging stated.',
        'Momentum target update: θ_target←mθ_target+(1−m)θ_online, where m near one makes targets change slowly.',
        'MAE minimizes reconstruction loss over masked patch set M, commonly |M|⁻¹Σ_{i∈M}||x_i−x̂_i||² after a declared patch normalization.'
      ],
      decisionRules: [
        'Choose contrastive pretraining when semantic retrieval and controlled negative sampling fit; choose teacher-student methods when explicit negatives are problematic; choose MAE-style masking when scalable ViT pretraining and reconstruction transfer are validated.',
        'Start with a maintained pretrained checkpoint and frozen probes, then unfreeze progressively only when domain and dense-task gaps justify compute and overfitting risk.',
        'Evaluate objectives under the same unlabeled data, augmentations, backbone, training compute, and downstream protocol rather than comparing headline results from different regimes.',
        'For dense tasks, compare several feature layers and spatial resolutions and verify small-object or boundary behavior before committing to a global embedding checkpoint.'
      ],
      pitfalls: [
        'An augmentation can destroy the label signal needed downstream, so pretraining invariance may be harmful rather than universally robust.',
        'Distributed contrastive code can treat the positive as a negative, omit remote negatives, or mismatch target indices while the loss still decreases.',
        'A non-collapsed embedding with high variance is not automatically useful; representation quality needs downstream and neighbor evidence.',
        'Linear-probe gains do not guarantee fine-tuned, dense-task, low-data, or shifted-domain gains, and repeated downstream tuning can overfit the benchmark.'
      ],
      systemDesignUse: 'Version unlabeled-data provenance, deduplication and leakage policy, augmentations, view sampling, queue or EMA state, masking and patch normalization, distributed batch semantics, checkpoints, probe protocols, and feature extraction layers. Track pretraining stability, compute, downstream slices, embedding drift, and retraining compatibility.',
      recall: [
        { question: 'What objective mechanics distinguish SimCLR, MoCo, BYOL, and MAE?', answer: 'SimCLR uses in-batch contrastive negatives, MoCo adds a momentum encoder and key queue, BYOL predicts stop-gradient EMA targets without explicit negatives, and MAE reconstructs masked patches.' },
        { question: 'How does the MoCo architecture make a large negative set practical?', answer: 'A slowly updated key encoder produces consistent-enough features stored in a queue, so the dictionary spans prior minibatches instead of requiring one enormous current batch.' },
        { question: 'Why does MAE encode only visible patches?', answer: 'Dropping masked tokens from the encoder reduces its token count and expensive attention, while a lighter decoder combines visible latents and mask tokens to reconstruct missing patches.' },
        { question: 'How should self-supervised pretraining be evaluated for production transfer?', answer: 'Compare frozen, kNN and fine-tuned quality by task and domain slice alongside pretraining compute, feature latency and memory, data governance, embedding stability, and checkpoint migration cost.' }
      ]
    },
    {
      id: 'generative-vision', title: 'Generative vision: GANs, VAEs, diffusion, control, restoration, and video', required: true,
      summary: 'Generative vision spans adversarial density learning, latent-variable likelihood bounds, iterative denoising, conditional control, restoration, editing, and temporal synthesis. Senior answers compare objectives, conditioning contracts, sampling cost, fidelity-diversity-grounding tradeoffs, and whether generated evidence is valid for the downstream product.',
      keyPoints: [
        'A GAN trains a generator against a discriminator through a minimax or related adversarial objective. It can produce sharp samples quickly after training but may suffer mode dropping, unstable dynamics, and metric gaming.',
        'A VAE encodes an approximate posterior, samples a latent with the reparameterization trick, and decodes it while balancing reconstruction against KL regularization to a prior. Its likelihood-oriented objective often yields smoother outputs but a structured latent space.',
        'Diffusion adds noise according to a forward schedule and trains a denoiser to predict noise, velocity, score, or another target; iterative reverse updates create samples. Latent diffusion performs this process in an autoencoder latent to reduce spatial cost.',
        'DDIM defines a non-Markovian sampling family with the same training marginals as a DDPM; its η=0 path is deterministic given the initial noise and can use fewer steps, trading speed against approximation and diversity behavior.',
        'Classifier-free guidance combines conditional and unconditional predictions to strengthen conditioning at the cost of diversity, saturation, artifacts, and additional denoiser work unless batched.',
        'ControlNet-style conditioning adds a trainable condition branch with zero-initialized connections around a strong pretrained diffusion model, enabling edge, depth, pose, or segmentation guidance without discarding the base prior.',
        'Super-resolution and inpainting must preserve known pixels, identity, text, geometry, and uncertainty rather than merely look sharp. Perceptual or adversarial losses can hallucinate plausible detail that is false for measurement or evidence tasks.',
        'Video generation must model spatial fidelity plus motion, identity, temporal consistency, camera dynamics, and long-horizon causality. Temporal attention, 3D blocks, and cascaded generation shift compute and failure modes rather than solving them.',
        'Evaluation combines FID/KID-style distribution metrics, diversity, prompt or condition alignment, human preference, identity and geometry checks, temporal metrics, safety, memorization, and real-only downstream validation.'
      ],
      formulas: [
        'Original GAN objective: min_G max_D E_x[log D(x)]+E_z[log(1−D(G(z)))], with practical variants changing generator and discriminator losses.',
        'VAE ELBO: E_{qφ(z|x)}[log pθ(x|z)]−KL(qφ(z|x)||p(z)), optimized with z=μ+σ⊙ε for ε∼N(0,I).',
        'A DDPM forward marginal is x_t=sqrt(ᾱ_t)x_0+sqrt(1−ᾱ_t)ε; a common objective minimizes E||ε−ε_θ(x_t,t,c)||².',
        'Classifier-free guidance combines predictions as ε_guided=ε_uncond+s(ε_cond−ε_uncond), where scale s changes condition strength and sample distribution.'
      ],
      decisionRules: [
        'Use a GAN when one-pass sampling and domain-specific fidelity dominate and training stability is manageable; use a VAE when latent structure matters; use diffusion when conditional quality and broad coverage justify iterative cost.',
        'Choose DDIM or distilled few-step sampling only after measuring quality, diversity, condition fidelity, and latency under the actual guidance and resolution settings.',
        'Use ControlNet-style or mask/image conditioning when spatial constraints must be explicit; retain deterministic validation so the generator cannot silently alter protected regions or labels.',
        'Use synthetic data only when a fixed real-only holdout shows downstream slice gains and audits reject leakage, shortcuts, privacy memorization, and unrealistic label-condition pairs.',
        'For super-resolution, inpainting, or video evidence, expose uncertainty and prohibit hallucinated pixels from being treated as measurement truth unless independently validated.'
      ],
      pitfalls: [
        'Low FID does not prove sample diversity, prompt adherence, factual geometry, temporal consistency, privacy, or downstream usefulness.',
        'A VAE reconstruction-versus-KL balance can cause posterior collapse or an uninformative latent; a sharp decoder output does not prove latent coverage.',
        'High guidance can improve prompt scores while reducing diversity and creating oversaturated or implausible samples.',
        'Inpainting or super-resolution can fabricate plausible detail, so generated pixels are unsafe as forensic, medical, or industrial evidence without a separate contract.',
        'Random frame splits overstate video-generator generalization and can conceal memorization of identities, scenes, or near-duplicate clips.'
      ],
      systemDesignUse: 'Specify training provenance and consent, latent or pixel representation, objective and noise schedule, sampler and step count, condition encoders, guidance, ControlNet or mask contract, safety filters, provenance, cache and hardware budget, human review, and rollback. Evaluate real-only downstream effects, memorization, identity, spatial and temporal fidelity, p99 latency, throughput, and cost.',
      recall: [
        { question: 'What objective and architecture differences separate GANs, VAEs, and diffusion models?', answer: 'GANs learn through an adversarial discriminator, VAEs optimize reconstruction plus latent KL with an encoder-decoder, and diffusion trains a time-conditioned denoiser used repeatedly to reverse noise.' },
        { question: 'How does DDIM change diffusion sampling mechanics?', answer: 'It uses a non-Markovian reverse family consistent with the same forward marginals and can take a deterministic η=0 path through fewer chosen timesteps, trading sampling cost against approximation behavior.' },
        { question: 'What does a ControlNet-style branch contribute?', answer: 'It injects trainable spatial-condition features such as edges, depth or pose into a strong pretrained denoiser through initially zero-effect connections, preserving the base model at initialization.' },
        { question: 'How should a generative model be evaluated for production?', answer: 'Measure distribution and diversity metrics, condition and spatial fidelity, temporal consistency where relevant, human/task outcomes, memorization and safety, target-hardware latency and cost, and gains on untouched real data.' }
      ]
    },
    {
      id: 'video-motion', title: 'Optical flow and video architectures: RAFT, I3D, and SlowFast', required: true,
      summary: 'Video understanding requires explicit choices about motion representation, temporal sampling, clip duration, state, and event aggregation. Optical flow estimates per-pixel correspondence; RAFT iteratively refines flow from all-pairs correlation, while I3D and SlowFast model actions through different spatiotemporal compute allocations.',
      keyPoints: [
        'Classical optical flow starts from brightness constancy and small motion, producing one equation for two velocity components; spatial smoothness, local windows, pyramids, and robust penalties make the problem solvable but introduce boundary and motion assumptions.',
        'Occlusion, disocclusion, reflections, lighting change, blur, aperture ambiguity, repeated texture, rolling shutter, and large displacement violate simple flow assumptions. Forward-backward consistency can flag but not fully solve invalid correspondence.',
        'RAFT extracts features, builds an all-pairs correlation volume, indexes multiscale correlation neighborhoods, and recurrently updates a dense flow field. It keeps one high-resolution flow representation rather than a conventional coarse-to-fine flow estimate.',
        'I3D inflates pretrained 2D convolution filters and pooling into 3D so spatial and temporal dimensions are processed jointly; clip length, frame rate, temporal stride, and initialization define the effective motion evidence.',
        'SlowFast uses a low-frame-rate Slow pathway with higher channel capacity for semantics and a high-frame-rate Fast pathway with lighter channels for motion, connected by lateral fusion.',
        'Two-stream models explicitly combine RGB and optical-flow evidence, while modern 3D CNNs and video transformers can learn motion from frames. Precomputed flow adds storage and latency and may amplify flow-domain errors.',
        'Sampling determines observability: uniform or sparse clips miss brief events, dense clips waste compute on static content, and adaptive sampling can bias the observed event distribution.',
        'Flow uses endpoint error and occlusion-aware masks; action recognition uses clip/video classification plus temporal localization; production systems need event recall, time-to-detect, duplicate alerts, and compute by duration slice.',
        'Online video systems must define state reset, late and dropped frames, timestamp alignment, backpressure, window finalization, and whether future frames are allowed before an alert.'
      ],
      formulas: [
        'Brightness-constancy linearization gives I_xu+I_yv+I_t=0, an underdetermined constraint requiring neighborhood or regularization assumptions.',
        'Endpoint error for valid pixels is EPE=|V|⁻¹Σ_{p∈V}sqrt((u_p−û_p)²+(v_p−v̂_p)²), with the valid and occlusion mask stated.',
        'A 3D convolution output follows the spatial formula on T,H,W independently; dense work scales with K_tK_hK_wC_inC_outT_outH_outW_out.',
        'For sampling rate r frames/s and L sampled frames, the nominal observed span is approximately (L−1)/r before decode and window-alignment details.'
      ],
      decisionRules: [
        'Use explicit flow when dense correspondence, motion boundaries, stabilization, or geometry is the product signal; use learned clip features when end-task recognition matters more than interpretable displacement.',
        'Choose RAFT or another learned flow model only after range-, speed-, occlusion-, and domain-sliced gains justify its correlation memory and target-resolution latency.',
        'Choose I3D when joint 3D filters and pretrained inflation fit; choose SlowFast when high-rate motion deserves a lighter dedicated pathway under the compute budget.',
        'Set frame rate, clip span, stride, and aggregation from the shortest and longest target events and alert-latency SLO, then evaluate missed-event probability under actual decode behavior.',
        'For streaming, prefer causal windows and explicit state when decisions cannot wait; use bidirectional or long-context models only where future evidence is legal.'
      ],
      pitfalls: [
        'A smooth plausible flow field can be wrong at occlusions and repeated texture; downstream warping quality and occlusion masks must be evaluated, not visualization alone.',
        'Resizing frames changes displacement units; flow vectors must be scaled consistently with spatial transforms.',
        'Random clips from the same source video across train and test leak scene, actor, camera, and near-duplicate temporal evidence.',
        'Reporting clip accuracy can hide missed short events, repeated alerts, or unacceptable time-to-detect in the full streaming pipeline.',
        'Higher frame rate increases decode, memory, and correlation cost and can reduce temporal span at fixed clip length.'
      ],
      systemDesignUse: 'Define timestamps, decode and resize, frame and clip sampling, causality, flow units and valid masks, RAFT correlation resolution, I3D or SlowFast pathways, window state, aggregation, event deduplication, backpressure, target-runtime precision, and reset behavior. Monitor flow and event quality by motion, occlusion, duration, camera, drop rate, and domain with p99 latency and cost.',
      recall: [
        { question: 'What architecture mechanics distinguish RAFT from a conventional coarse-to-fine flow pyramid?', answer: 'RAFT builds all-pairs feature correlation, repeatedly looks up multiscale neighborhoods, and uses a recurrent update operator to refine one dense high-resolution flow field.' },
        { question: 'How do I3D and SlowFast allocate temporal compute differently?', answer: 'I3D applies inflated 3D kernels over a clip, while SlowFast couples a semantically rich low-rate pathway with a lighter high-rate motion pathway through lateral fusion.' },
        { question: 'Why is optical flow underdetermined from brightness constancy alone?', answer: 'One local brightness equation constrains two motion components, so aperture ambiguity remains until neighborhoods, smoothness, matching, or learned priors add information.' },
        { question: 'How should a production video model be evaluated?', answer: 'Measure event recall and precision, temporal localization, short-event misses, time-to-detect, duplicates, flow or tracking validity, decode/model p99, state resets, dropped frames, and domain slices.' }
      ]
    },
    {
      id: 'multimodal-vision', title: 'Multimodal vision: BLIP-2, Flamingo, OWL-ViT, captioning, and VQA', required: true,
      summary: 'Multimodal architectures differ in how visual evidence is compressed, aligned, fused, and decoded. Senior answers should trace BLIP-2 Q-Former queries, Flamingo interleaved cross-attention, OWL-ViT region-text matching, and the limitations of caption, VQA, retrieval, and grounding metrics before choosing a general VLM over specialist perception.',
      keyPoints: [
        'BLIP-2 keeps a pretrained image encoder and language model largely frozen and trains a lightweight Q-Former bridge. Learned query tokens cross-attend to image features, compress visual evidence, and align it to language-facing representations through staged objectives.',
        'A Q-Former bottleneck caps the number of visual tokens passed onward, reducing language-model cost but potentially losing small text, counts, fine spatial relations, or evidence outside learned query coverage.',
        'Flamingo uses a Perceiver-style resampler to produce a fixed set of visual tokens and inserts gated cross-attention layers into a pretrained language model, enabling interleaved image or video and text sequences with few-shot prompting.',
        'OWL-ViT treats detection as image-patch representations matched against text-query embeddings, enabling open-vocabulary queries. Query wording, region resolution, calibration, and unseen-domain semantics still bound detection.',
        'Dual encoders support scalable retrieval by precomputing modality embeddings, while fusion or cross-attention models rerank with richer interactions at higher per-pair cost. A common system uses two-stage retrieval and reranking.',
        'Captioning metrics measure different proxies: BLEU emphasizes n-gram precision, METEOR adds alignment and recall signals, CIDEr weights consensus n-grams, and SPICE compares scene-graph-like semantics. None proves factual grounding.',
        'VQA exact match is brittle; common consensus scoring gives partial credit based on annotator agreement. Results need question-type, answer-frequency, OCR, counting, language, and unanswerable slices plus counterfactual image tests.',
        'Grounding requires region, citation, pointing, or evidence tests. A fluent answer can exploit language priors while ignoring the image, so image ablation and mismatched-image controls are necessary.',
        'Deployment must cap image tiles and frames, isolate untrusted retrieved content from instructions, enforce ACLs before retrieval, validate structured outputs, and expose abstention or review for unsupported evidence.'
      ],
      formulas: [
        'Cross-attention from Q learned queries to N visual tokens forms score tensors proportional to Q×N per head; the bridge output length is Q rather than N.',
        'Dual-encoder retrieval commonly scores normalized embeddings with s(i,t)=v_iᵀt/τ and evaluates Recall@K or ranking metrics over an explicitly sampled corpus.',
        'A common VQA consensus score for one answer is min(number of matching human answers/3,1), averaged under the benchmark protocol.',
        'CIDEr compares TF-IDF-weighted n-gram vectors against multiple references, making frequent corpus n-grams contribute less than distinctive consensus phrases.'
      ],
      decisionRules: [
        'Use a dual encoder for large-corpus candidate retrieval and a fusion or generative model only where reranking or language-conditioned reasoning adds measured value.',
        'Use a Q-Former or resampler bottleneck when fixed visual-token cost is essential, but increase resolution, tiling, OCR, or specialist routes when fine evidence is demonstrably lost.',
        'Use OWL-ViT-style open-vocabulary detection for flexible discovery or bootstrapping; use a calibrated closed-set detector when ontology, throughput, and error cost are stable.',
        'Choose caption and VQA metrics as a panel with human, grounding, counterfactual, safety, latency, and cost evaluation rather than optimizing one lexical score.',
        'Require citations, region evidence, schema validation, abstention, and deterministic policy checks before a multimodal generator can trigger a consequential action.'
      ],
      pitfalls: [
        'A fixed query bottleneck can omit tiny or repeated evidence even when the language output is coherent; more language capacity cannot recover unseen pixels.',
        'Caption metrics reward overlap with limited references and can penalize valid paraphrases or reward unsupported consensus phrases.',
        'VQA datasets contain language and answer-frequency shortcuts, so aggregate score may remain high when images are shuffled or removed.',
        'Open-vocabulary text similarity does not guarantee calibrated localization, counting, or truly novel concept understanding.',
        'Retrieved images, OCR, and captions are untrusted data; treating them as executable instructions creates an indirect prompt-injection path.'
      ],
      systemDesignUse: 'Specify image encoder and resolution, Q-Former or resampler token budget, fusion points, text model, retrieval/rerank split, OWL-ViT query ontology, OCR and tiling, metric panel, grounding and abstention, ACL and injection boundaries, caching, quantization, target-hardware p99, review, and rollback. Version prompts, checkpoints, indexes, and preprocessing traceably.',
      recall: [
        { question: 'What architecture role does the BLIP-2 Q-Former play?', answer: 'Learned query tokens cross-attend to frozen image features and compress them into a small language-aligned representation that bridges a pretrained vision encoder and language model.' },
        { question: 'How does Flamingo fuse interleaved visual and textual context?', answer: 'A Perceiver-style resampler converts variable visual features to fixed tokens, and gated cross-attention layers inserted in the language model let text states attend to those tokens.' },
        { question: 'What mechanics make OWL-ViT an open-vocabulary detector?', answer: 'It produces spatial image representations and scores candidate regions or patches against text-query embeddings rather than relying only on a fixed learned class-weight matrix.' },
        { question: 'How should captioning and VQA be evaluated for production?', answer: 'Combine lexical or consensus metrics with factual and region grounding, image-ablation controls, answerability, question and domain slices, human review, calibration, safety, latency, and cost.' }
      ]
    },
    {
      id: 'efficient-vision-transformers', title: 'Efficient vision transformers and token scaling', required: true,
      summary: 'Efficient vision transformers reduce quadratic global attention or token count through hierarchy, local windows, patch merging, convolutional stems, linearized attention, mobile blocks, pruning, or distillation. Senior selection requires tracing information paths and realized kernels because lower asymptotic work or FLOPs can still lose on memory movement, shape overhead, or dense-task quality.',
      keyPoints: [
        'Hierarchical transformers progressively merge patches and increase channels, producing multiscale features analogous to CNN stages and reducing token count before later blocks.',
        'Swin confines attention to local windows for near-linear image-size scaling and shifts window partitions between blocks so information crosses previous boundaries. Window size and padding create discrete latency and receptive-field effects.',
        'Pyramid-style transformers combine overlapping or strided patch embeddings with spatial-reduction attention to serve dense tasks, trading fine token detail for reduced key/value length.',
        'MobileViT-like hybrids use convolution for local features and transformer blocks for broader interactions; other mobile families use convolutional stems, reduced-resolution attention, distillation, and hardware-aware widths. A family name does not guarantee target-runtime efficiency.',
        'Linear-attention variants reorder or approximate the softmax interaction through kernels, low rank, sparsity, or restricted patterns. They change normalization and expressivity and only help when implementation avoids the full N×N matrix.',
        'Token pruning or merging drops or combines low-importance tokens dynamically. It can save later-layer work but adds scoring, gather/scatter, irregular shapes, and risk of deleting small objects or rare evidence.',
        'Distillation can transfer CNN locality or a larger transformer teacher into a compact student; teacher bias, augmentation, labels, and the distillation loss remain training assumptions.',
        'Resolution and patch size set initial token count. Halving patch width quadruples tokens for a fixed 2D image and can raise full-attention work about sixteenfold before hierarchy or locality intervenes.',
        'Efficiency includes preprocessing, activations, memory bandwidth, kernel fusion, compilation, batch and sequence shape, export support, p99 latency, energy, and dense-task accuracy by object size.'
      ],
      formulas: [
        'For H×W input and P×P patches, N=(H/P)(W/P); full attention is O(N²d), while fixed-window attention with M×M-token windows is O(NM²d).',
        'Merging each 2×2 token neighborhood reduces token count by four; channel expansion determines whether activation bytes and projection work actually fall proportionally.',
        'A low-rank or kernelized approximation that maps Q and K to r features targets O(Nrd) interaction work, but r, normalization, and materialized intermediates determine realized cost.',
        'End-to-end speedup is bounded by Amdahl’s law: 1/[(1−f)+f/s] when fraction f of original latency is accelerated by factor s.'
      ],
      decisionRules: [
        'Use hierarchical or windowed attention for high-resolution dense tasks when multiscale checkpoints and optimized kernels exist; use global attention when token count is modest and unrestricted context produces measured gains.',
        'Use a mobile hybrid when convolution kernels and static shapes dominate the target runtime; compare against an equally optimized CNN rather than a research-only baseline.',
        'Adopt token pruning or linear attention only after accuracy by object size and rare evidence survives and dynamic-shape overhead is measured at production batch distributions.',
        'Choose patch, window, stage widths, and resolution jointly from the smallest relevant structure and device budget, then profile compiled p50/p99 rather than ranking by FLOPs.',
        'Treat distillation as a new objective with teacher and data dependencies; retain a hard-label or task-loss path and test shift where teacher errors may concentrate.'
      ],
      pitfalls: [
        'Window-local attention without shifts or another cross-window path traps information inside partitions and creates boundary artifacts.',
        'An O(N) attention claim can hide a large feature rank, sequential scan, unfused kernel, or memory-bound intermediate that is slower at practical image sizes.',
        'Token pruning often removes small, low-contrast, or unusual regions because salience is learned from dominant training examples.',
        'Changing resolution or patch size invalidates positional, window, padding, and feature-stride assumptions and can break dense heads.',
        'Paper throughput at large batches can conceal single-request p99, cold start, compiler fallback, preprocessing, and peak memory on the deployment device.'
      ],
      systemDesignUse: 'Record patch and stage geometry, window and shift policy, global-information path, token pruning or linear-attention approximation, distillation source, positional interpolation, dense-head strides, precision, compiler and kernel versions, and target-device batches. Gate on p50/p99, throughput, peak memory, energy, calibration, and quality by size, boundary, domain, and rare evidence.',
      recall: [
        { question: 'How does shifted-window attention exchange information across windows?', answer: 'One block attends within a fixed partition, the next shifts that partition so tokens formerly separated by a boundary share a window, with masking preserving the intended wrapped layout.' },
        { question: 'What architecture mechanics make a hierarchical vision transformer efficient for dense prediction?', answer: 'Patch merging reduces spatial token count across stages while channels grow and multiscale outputs feed a pyramid or decoder, limiting expensive attention at high resolution.' },
        { question: 'Why can linear or pruned attention be slower despite fewer theoretical operations?', answer: 'Feature-map construction, gathers, irregular dynamic shapes, memory traffic, weak kernel fusion, and practical sequence sizes can cost more than an optimized dense attention kernel.' },
        { question: 'How should an efficient ViT be evaluated for production?', answer: 'Benchmark the exported compiled end-to-end path on target hardware across real batch and resolution distributions, then pair latency, throughput, memory and energy with calibration and size-, boundary-, and domain-sliced quality.' }
      ]
    }
  ];

  const systemDesignCases = [
    {
      id: 'image-search', order: 1, title: 'Large-scale image search',
      scenario: 'Users submit an image or text and retrieve relevant catalog images from hundreds of millions of items under a tight latency SLO.',
      requirements: ['Query type and relevance definition', 'Catalog size, update rate, regions, and p99 latency', 'Metadata filters, safety, and personalization', 'Offline labels and online success metric', 'Vector-memory and QPS/candidate-fanout capacity estimates'],
      solutionOutline: ['Image/text dual encoders with a versioned embedding contract', 'Offline embedding pipeline and approximate-nearest-neighbor index', 'Metadata filtering, candidate generation, reranking, and caching', 'Recall@K/NDCG plus click or conversion guardrails', 'Index freshness, embedding drift, shadow migration, and rollback', 'Index sharding and replication, query fan-out/merge, hot-shard rebalancing, replica failover, timeout budgets, and partial-result degradation'],
      modernCv: 'Compare CLIP-style joint embeddings with DINOv2 image features plus a separate text path. Choose by query modes and domain transfer.',
      pressureTest: 'A new embedding version improves offline Recall@10 but requires rebuilding a two-terabyte index. How do you migrate without mixing incompatible vectors?',
      pressureTestAnswer: 'Decision: dual-write versioned embeddings and build a separate index, then shadow and canary queries before an atomic alias switch. The alternative is an in-place rebuild, rejected because mixed vector spaces fail silently. Verify Recall@K, latency, coverage, and index parity; monitor drift and retain the old index for rollback.'
    },
    {
      id: 'visual-similarity', order: 2, title: 'Visual similarity and product recommendations',
      scenario: 'Given one product photo, retrieve substitutes or visually similar products while respecting inventory, price, category, and user intent.',
      requirements: ['What “similar” means: appearance, function, brand, price, or compatibility', 'Cold catalog versus personalized ranking', 'Duplicate handling and inventory freshness', 'Merchant/user fairness and business constraints', 'Catalog cardinality and update rate, QPS and regions, p95/p99 latency, availability, and inventory/embedding freshness budgets'],
      solutionOutline: ['Pair/triplet construction from interactions and catalog metadata', 'Visual encoder baseline and hard-negative mining', 'ANN candidate generation followed by multimodal/business reranking', 'Human relevance audits by category and online conversion/diversity tests', 'Feedback-loop controls so popularity does not erase long-tail inventory'],
      modernCv: 'Use CLIP when textual attributes and zero-shot catalog concepts matter; use DINOv2/domain fine-tuning when fine-grained appearance dominates.',
      pressureTest: 'Clicks favor popular products even when not visually similar. How do you prevent training labels from collapsing similarity into popularity?',
      pressureTestAnswer: 'Decision: separate visual relevance labels from engagement, debias sampling, add hard negatives, and constrain reranking with diversity. An alternative is raw click supervision, which fails through exposure bias and feedback loops. Verify with blinded human relevance by category plus online conversion, novelty, and long-tail guardrails.'
    },
    {
      id: 'detection-service', order: 3, title: 'Real-time object-detection service',
      scenario: 'Process camera streams and generate safety alerts with strict end-to-end latency, limited bandwidth, and changing environments.',
      requirements: ['Camera count, FPS, resolution, event definition, and alert latency', 'Edge versus cloud constraints and offline operation', 'False-alert and missed-event cost', 'Privacy, retention, and supported device fleet', 'Separate detection-to-alert delivery SLO'],
      solutionOutline: ['Frame sampling and region-of-interest preprocessing', 'Detector, optional tracker, temporal event rules, and deduplication', 'Edge/cloud cascade, batching, quantization, and backpressure', 'mAP slices plus event-level precision/recall and alert latency', 'Camera-health, drift, threshold, rollout, and operator-feedback monitoring', 'Durable event IDs, per-camera ordering/window state, an idempotent alert sink, retries/DLQ, and edge buffering during outages'],
      modernCv: 'Benchmark an optimized one-stage detector against a DETR-family checkpoint; use the winner on target hardware, not paper mAP alone.',
      pressureTest: 'Nighttime false alerts spike after a camera firmware update. What telemetry distinguishes sensor change, preprocessing skew, and concept drift?',
      pressureTestAnswer: 'Decision: compare raw-frame and preprocessing fingerprints by firmware cohort before retraining, then replay the same frames through old and new pipelines. Alternative model changes would hide a pipeline failure. Verify sensor histograms, resize/color parity, prediction and event slices, labeled nighttime precision, and rollback the firmware or transform independently.'
    },
    {
      id: 'video-moderation', order: 4, title: 'Video content moderation',
      scenario: 'Screen uploaded and live videos for policy violations while controlling reviewer workload and appeal risk.',
      requirements: ['Policy taxonomy, severity, legal region, and response time', 'Uploaded versus live flow', 'Audio, text, frames, and metadata availability', 'Reviewer capacity, appeals, and protected-group impact', 'Policy actions by severity and live delay budgets'],
      solutionOutline: ['Adaptive frame/clip sampling and multimodal feature extraction', 'Cheap high-recall filters followed by specialist models and temporal aggregation', 'Policy-specific thresholds, abstention, reviewer queue, and escalation', 'Video/event-level recall, precision at reviewer capacity, and appeal overturn rate', 'Policy/version lineage, adversarial monitoring, and delayed labels from review', 'Explicit fail-open/fail-closed/degraded behavior when inference or review is unavailable, reversible quarantine, and appeal/reinstatement transitions'],
      modernCv: 'Use VLMs for flexible policy reasoning only behind grounding, structured output, and specialist guardrails; do not replace measurable perception stages blindly.',
      pressureTest: 'A policy update takes effect in six hours. Which layers can change through rules/prompts, which require labels, and how do you audit regressions?',
      pressureTestAnswer: 'Decision: version the policy and change deterministic rules or reviewed prompts only where existing model signals support them; route novel semantics to humans while collecting labels. An alternative emergency fine-tune risks unmeasured failure. Verify replay sets, reviewer agreement, workload, appeals, protected slices, and keep an auditable rollback.'
    },
    {
      id: 'segmentation', order: 5, title: 'Defect or medical-image segmentation',
      scenario: 'Segment small, irregular target regions where missing an object and drawing a poor boundary carry different costs.',
      requirements: ['Image modality, acquisition protocol, object scale, and annotation unit', 'Clinical/industrial workflow and human decision', 'False-negative versus boundary-error cost', 'Regulatory, traceability, and review requirements'],
      solutionOutline: ['Annotation guidelines, agreement, adjudication, and grouped split', 'Pretrained encoder plus task head and simple U-Net-style baseline', 'CE/BCE plus Dice or IoU-aware objective with empty-mask policy', 'Dice/IoU, boundary F1, object sensitivity, calibration, and slice review', 'Human-in-the-loop correction, versioned evidence, and rollback'],
      modernCv: 'Evaluate SAM2 as annotation accelerator or promptable component. Use a domain model for automated inference unless validated evidence supports direct use.',
      pressureTest: 'Aggregate Dice improves while small critical defects are missed more often. Which metric and sampling changes expose and correct this?',
      pressureTestAnswer: 'Decision: promote small-object sensitivity and boundary or object-level recall to release gates, oversample the critical slice, and inspect loss/assignment behavior. The alternative of optimizing aggregate Dice fails because large masks or easy images can dominate a micro/global aggregate, while empty-mask policy can skew macro results. Verify by size-stratified holdout, site review, calibration, and prospective workflow impact.'
    },
    {
      id: 'ocr-documents', order: 6, title: 'OCR and document understanding',
      scenario: 'Convert diverse scanned documents into validated structured fields with confidence and human correction.',
      requirements: ['Languages, scripts, layouts, handwriting, tables, and document length', 'Field schema and downstream tolerance', 'Throughput, latency, and privacy', 'Confidence, abstention, and correction workflow'],
      solutionOutline: ['Document classification, orientation/quality checks, layout regions, OCR, and field extraction', 'Specialist versus VLM route by complexity and cost', 'Schema validation, constrained decoding, cross-field rules, and reviewer queue', 'CER/WER plus field exact match and document-level success', 'Correction feedback, template drift, PII controls, and source traceability'],
      modernCv: 'Use a document VLM where layout-language interaction matters, but keep deterministic schema validation and a measurable OCR baseline.',
      pressureTest: 'A fluent VLM invents a missing invoice number. How do architecture and evaluation prevent unsupported field completion?',
      pressureTestAnswer: 'Decision: require region-grounded evidence, constrained schema output, field validation, confidence/abstention, and human review for unsupported values. A free-form generation alternative fails by rewarding fluency. Verify exact match plus citation precision, missing-field abstention, adversarial documents, review overturns, and deterministic fallbacks.'
    },
    {
      id: 'active-learning', order: 7, title: 'Active learning and human review',
      scenario: 'Continuously select useful examples for annotation, maintain label quality, and retrain without biasing evaluation.',
      requirements: ['Label cost, annotator skill, turnaround, and budget', 'Pool size, data arrival, and model cadence', 'Rare classes and safety-critical slices', 'Evaluation set independence and audit needs', 'Preregistered marginal-lift stopping criterion'],
      solutionOutline: ['Candidate pool with provenance, deduplication, and privacy controls', 'Uncertainty plus diversity/coverage acquisition with exploration quota', 'Guidelines, gold tasks, agreement, adjudication, and annotator routing', 'Immutable evaluation set plus newly sampled audit sets', 'Dataset/model version lineage, staged retraining, and acquisition-bias monitoring', 'Randomized or stratified acquisition as a concurrent control, performance-versus-annotation-cost curves with uncertainty, and cost per accepted label'],
      modernCv: 'Use DINOv2 or CLIP embeddings for diversity and SAM2 for label acceleration, while validating that foundation-model bias does not narrow coverage.',
      pressureTest: 'Uncertainty sampling keeps selecting corrupt images. How do you separate data-quality routing from informative model uncertainty?',
      pressureTestAnswer: 'Decision: run explicit quality checks and a corruption classifier before uncertainty acquisition, budget separate quality and learning queues, and keep exploration. The alternative of one uncertainty score fails by wasting labels. Verify acquisition yield, rare-slice coverage, downstream lift per label, annotator rejection, and an unchanged evaluation set.'
    },
    {
      id: 'multimodal-rag', order: 8, title: 'Multimodal retrieval and VLM application',
      scenario: 'Answer questions over a private image/document collection with citations and region-level grounding.',
      requirements: ['Supported question types and evidence standard', 'Collection size, update rate, access control, and latency', 'Text/image/document modalities', 'Hallucination, privacy, and user-correction policy', 'Treat retrieved text/images as untrusted data; retrieved content cannot grant tool/action privileges'],
      solutionOutline: ['Modality-aware chunking and versioned image/text embeddings', 'Hybrid retrieval, metadata ACL filtering, and reranking', 'VLM generation constrained to retrieved evidence with structured citations', 'Answer correctness, retrieval recall, citation precision, grounding, abstention, and safety', 'Prompt/model/index lineage, adversarial tests, feedback review, and rollback', 'Separate instructions from evidence, sanitize or mark active content, preserve provenance, and test indirect prompt injection and cross-tenant exfiltration'],
      modernCv: 'Use CLIP-like retrieval for cross-modal candidates and a VLM for synthesis; add OCR/layout routes for documents and never treat generation as retrieval evidence.',
      pressureTest: 'A user can retrieve another tenant’s image through semantically similar search. Where must authorization be enforced?',
      pressureTestAnswer: 'Decision: enforce tenant ACLs before candidate retrieval when the index supports it and again after every retrieval/rerank/cache boundary; never rely on prompt instructions. A post-generation filter alternative fails because data has already leaked. Verify adversarial cross-tenant queries, cache keys, index filters, logs, and deny-by-default tests.'
    },
    {
      id: 'ranking-feed', order: 9, title: 'Personalized feed and ranking system',
      scenario: 'Rank a fresh, personalized feed from millions of eligible items for hundreds of millions of users while controlling latency, diversity, creator exposure, safety, and feedback loops.',
      requirements: ['Define the user action, session surface, inventory, freshness, and eligibility rules', 'Estimate active users, request QPS, candidates per stage, p95/p99 latency, regions, and availability', 'Separate short-term engagement, long-term value, safety, diversity, and creator constraints', 'Define cold-start, logged-out, exploration, and degraded-mode behavior', 'Specify impression, position, propensity, outcome, and deletion-consent logging'],
      solutionOutline: ['Event and content pipelines with point-in-time-correct features and explicit impression IDs', 'Multi-source candidate generation from follows, retrieval, trends, and exploration with per-source budgets', 'Lightweight pre-ranker then richer multitask ranker with calibrated scores and constrained slate construction', 'Offline Recall@K, NDCG and calibration by slice plus interleaved or randomized online experiments with guardrails', 'Feature freshness, candidate coverage, score/position drift, feedback-loop, exposure, and safety monitoring', 'Regional caches, timeouts, per-stage fallbacks, shadow/canary rollout, model-feature compatibility checks, and rollback'],
      modernCv: 'For image or video feeds, precompute versioned visual and multimodal embeddings and use expensive VLM or video features offline; keep online ranking bounded by freshness and target-runtime evidence.',
      pressureTest: 'A new ranker raises watch time but concentrates exposure on a small creator set and lowers next-week retention. Would you launch it?',
      pressureTestAnswer: 'Decision: do not broad-launch; keep a small reversible canary while adding retention and creator-exposure constraints to the decision rule and diagnosing which ranker or slate stage caused the shift. The alternative of optimizing watch time alone fails through position and feedback-loop amplification. Verify randomized long-horizon retention, exposure and safety slices, calibration, counterfactual replays, latency, and rollback thresholds.'
    },
    {
      id: 'ads-ctr', order: 10, title: 'Ads click-through and conversion prediction',
      scenario: 'Predict click and conversion value for an ad auction under millisecond latency, delayed and censored labels, sparse high-cardinality features, budget constraints, and strict experimentation requirements.',
      requirements: ['Clarify auction objective, bid and budget semantics, click versus conversion windows, and attribution policy', 'Estimate auction QPS, candidates, feature lookup budget, p99 scoring latency, regions, and availability', 'Define advertiser, user, placement, policy, and privacy constraints plus cold-start behavior', 'Set calibration, revenue, user-experience, advertiser-value, fairness, and invalid-traffic guardrails', 'Specify delayed-label joins, negative maturation, deduplication, and point-in-time feature correctness'],
      solutionOutline: ['Streaming impression/click/conversion logs joined by durable IDs with delayed-label correction', 'Regularized logistic or tree baseline followed by wide-and-deep or multitask ranking if justified', 'Candidate-independent user/context features cached separately from candidate features and bounded cross features', 'Probability calibration by placement and cohort, then auction value combining predicted outcomes, bid, quality, and constraints', 'Time-based offline log loss, PR-AUC and calibration plus randomized auction experiments and budget pacing checks', 'Feature/model version contracts, shadow score logging, canary, drift and calibration monitoring, fallback scores, and rollback'],
      modernCv: 'Visual ad and landing-page encoders can improve cold-start quality, but embeddings should be precomputed, governed for policy and privacy, and ablated against metadata under the auction latency budget.',
      pressureTest: 'Offline AUC improves, yet a canary overcharges a cohort because predicted CTR is systematically too high on one placement. What changes?',
      pressureTestAnswer: 'Decision: halt the canary, restore the previous calibrated model, and treat placement calibration and auction-value error as release gates rather than accepting ranking AUC. The alternative of globally lowering bids fails because it hides a cohort-specific data or calibration defect. Verify point-in-time joins, placement reliability curves and expected calibration error, spend and value by cohort, counterfactual auction replay, and a guarded re-canary.'
    },
    {
      id: 'fraud-anomaly', order: 11, title: 'Real-time fraud and anomaly detection',
      scenario: 'Score payments or account actions for fraud in real time while positives are rare, labels arrive late, attackers adapt, and false positives block legitimate users.',
      requirements: ['Define fraud taxonomy, decision actions, review queue, loss horizon, and false-positive cost', 'Estimate event QPS, entities and graph size, feature freshness, scoring p99, availability, and manual-review capacity', 'Specify confirmed, chargeback, disputed, and unlabeled outcomes with delay and selection bias', 'Define user and merchant friction, regional policy, explainability, privacy, and appeal requirements', 'Set incident containment, rule override, degraded mode, and adversarial monitoring expectations'],
      solutionOutline: ['Online velocity and entity features with point-in-time offline parity plus graph or sequence features where justified', 'Rules and calibrated supervised baseline, anomaly score for novel patterns, then a policy layer mapping risk to allow, challenge, review, or block', 'Cost-sensitive training with hard negatives, delayed-positive correction, exploration or random review samples, and leakage-safe temporal splits', 'Precision-recall and expected loss at review capacity, recall by attack and value band, calibration, friction, and appeal overturns', 'Feature health, score/action mix, attack clusters, label delay, reviewer agreement, adversarial probes, and case feedback monitoring', 'Champion-challenger shadowing, staged policy rollout, rule kill switches, immutable decisions, and tested rollback'],
      modernCv: 'For document, selfie, or transaction-image signals, use specialist OCR, liveness, or similarity models behind independent quality gates; never let an opaque VLM explanation substitute for evidence.',
      pressureTest: 'A novel attack is causing losses, but blocking the high-risk score band would reject many legitimate users before labels mature. How do you respond?',
      pressureTestAnswer: 'Decision: deploy a narrow reversible rule on verified attack features, step up authentication or review for the uncertain band, preserve random samples, and collect expedited labels before retraining. The alternative of a broad score cutoff risks severe false-positive harm and adaptive displacement. Verify expected loss, attack recall, legitimate-user friction, reviewer yield, appeals, feature stability, and automatic rule expiry or rollback.'
    },
    {
      id: 'visual-search-ltr', order: 12, title: 'Visual search with learning to rank',
      scenario: 'Retrieve and rank products from an image or multimodal query, combining visual similarity, text, metadata, inventory, personalization, and business constraints at catalog scale.',
      requirements: ['Define query modes, relevance grades, localization needs, filters, and the difference between visual match and substitutability', 'Estimate catalog size and churn, embedding throughput, index memory, query QPS, fan-out, regions, p99 latency, and freshness', 'Specify click, purchase, human-judgment, exposure, and no-result labels with position and selection bias', 'Set inventory, policy, diversity, seller fairness, personalization, and cold-start constraints', 'Define embedding/index/model version compatibility and migration SLOs'],
      solutionOutline: ['Query preprocessing and optional object crop or segmentation with versioned image/text encoders', 'ANN candidate retrieval using a metric matched to training plus metadata filtering and source recall budgets', 'Learning-to-rank stage combining similarity, text, attributes, quality, inventory, and user context with debiased judgments', 'Recall@K for retrieval and NDCG/MRR plus calibrated human graded relevance for ranking, followed by online conversion and no-result tests', 'Hard-negative mining, query/category/size slices, index freshness, coverage, exposure, latency, and feedback-loop monitoring', 'Dual-index shadow migration, cache version keys, partial-result fallback, canary alias switch, and rollback'],
      modernCv: 'Compare CLIP or SigLIP-style cross-modal embeddings, DINO-style fine-grained visual features, and domain fine-tuning; use grounding or segmentation only when query evidence shows background contamination.',
      pressureTest: 'The reranker improves NDCG on clicks but buries exact visual matches in favor of popular items. Which labels and architecture change?',
      pressureTestAnswer: 'Decision: separate graded visual relevance from engagement, add blinded judgments and exact-match hard negatives, and constrain business features to rerank only after a relevance floor. The alternative of raw click learning fails from position, popularity, and exposure bias. Verify retrieval recall, human NDCG by query type, exact-match rate, long-tail exposure, conversion guardrails, latency, and an ablation of every feature group.'
    },
    {
      id: 'feature-store-pipeline', order: 13, title: 'Feature store and ML data pipeline',
      scenario: 'Build a reusable feature platform that serves batch and low-latency online features with point-in-time correctness, lineage, freshness, privacy, and safe schema evolution across many models.',
      requirements: ['Inventory producers, entities, event time, availability time, windows, consumers, and ownership boundaries', 'Estimate offline history, daily ingest, online key cardinality, read QPS, p99 latency, regions, availability, and freshness SLOs', 'Define point-in-time joins, late and duplicate events, backfills, deletion, retention, access control, and residency', 'Specify schema, null, default, type, unit, vocabulary, and compatibility contracts', 'Define training snapshot reproducibility, online fallback, cost allocation, incident response, and audit requirements'],
      solutionOutline: ['Canonical event log with event and processing timestamps, durable IDs, validation, deduplication, and replay', 'Declarative feature definitions compiled to shared batch and streaming transformations where semantics permit', 'Offline columnar store for training snapshots and online keyed store for materialized low-latency values', 'Point-in-time dataset builder using feature availability time, versioned definitions, entity keys, and immutable manifests', 'Freshness, nulls, distributions, join coverage, offline-online parity, access, cost, and downstream quality monitoring', 'Schema compatibility gates, shadow backfills, dual reads, per-feature fallback and TTL, canary consumers, lineage-aware rollback'],
      modernCv: 'Large image, video, and embedding artifacts belong in versioned object or vector stores with references in the feature layer; preprocessing and encoder versions must travel with each embedding rather than masquerading as a scalar feature.',
      pressureTest: 'A backfill raises offline validation sharply, but the feature did not exist at prediction time and online values disagree. Can the model ship?',
      pressureTestAnswer: 'Decision: block promotion, rebuild the dataset with availability-time point-in-time joins, and repair the shared transformation or materialization path before retraining. The alternative of accepting the offline gain fails through future leakage and train-serve skew. Verify replayed historical availability, offline-online parity by entity and time, null and freshness slices, shadow predictions, dependent-model impact, and rollback of the feature version.'
    }
  ];

  const mockPackets = [
    {
      id: 'coding', title: 'Coding interview packet', durationMinutes: 60,
      interviewerScript: [
        { minute: 0, prompt: 'Set expectations: one unseen medium, spoken reasoning, runnable code, tests, and complexity.' },
        { minute: 5, prompt: 'Present a random scheduled problem and answer only concrete requirement questions.' },
        { minute: 30, prompt: 'Introduce one boundary or scale follow-up, or request a minimal failing trace.' },
        { minute: 50, prompt: 'Stop implementation, request final tests and bounds, then score before feedback.' }
      ],
      questions: [
        'State the invariant before coding and trace it on an ordinary input.',
        'Produce runnable code without copied templates or interviewer debugging.',
        'Derive time and auxiliary space using named input dimensions.'
      ],
      followUps: ['How would streaming input or a memory cap change the design?', 'Which test catches the most plausible implementation bug?', 'Can the state be simplified without weakening the invariant?'],
      rubric: [
        { dimension: 'Framing', strongSignal: 'Clarifies input, output, mutation, constraints, and edge semantics before selecting an approach.', weakSignal: 'Starts coding immediately and discovers basic requirements through avoidable rewrites.' },
        { dimension: 'Algorithm and code', strongSignal: 'States a precise invariant, justifies transitions, and implements coherent runnable code.', weakSignal: 'Names a memorized pattern but cannot justify movement, pruning, or stored state.' },
        { dimension: 'Testing and bounds', strongSignal: 'Tests boundary and adversarial cases and derives both time and auxiliary space.', weakSignal: 'Tests only the happy path and guesses complexity while ignoring hidden operations.' }
      ]
    },
    {
      id: 'ml-cv-theory', title: 'ML and CV theory packet', durationMinutes: 50,
      interviewerScript: [
        { minute: 0, prompt: 'Require every answer to cover assumptions, mechanics, failure modes, and a decision.' },
        { minute: 3, prompt: 'Ask rapid questions across losses, evaluation, classical ML, CNNs, transformers, and dense prediction.' },
        { minute: 25, prompt: 'Deepen two weak answers with shape, objective, or distribution follow-ups.' },
        { minute: 43, prompt: 'Request one debugging plan and score before revealing missing points.' }
      ],
      questions: [
        'Choose a loss and metric for an imbalanced multilabel vision task.',
        'Calculate a convolution or ViT token shape and dominant compute change.',
        'Compare a classical baseline, CNN, and transformer for a small domain dataset.',
        'Diagnose a train-good validation-bad result with falsifiable checks.'
      ],
      followUps: ['Which assumption invalidates that answer first?', 'How would you measure it on deployment hardware and by slice?', 'Which baseline or ablation would falsify the explanation?'],
      rubric: [
        { dimension: 'Mechanics', strongSignal: 'Traces shapes, objectives, gradients, assignment, or inference rather than model-name trivia.', weakSignal: 'Recites definitions but cannot explain how tensors and data produce the behavior.' },
        { dimension: 'Judgment', strongSignal: 'Chooses models, losses, thresholds, and metrics from semantics and downstream error cost.', weakSignal: 'Uses defaults or fashionable architectures without connecting them to the task.' },
        { dimension: 'Production reasoning', strongSignal: 'Separates failure causes and connects quality to latency, monitoring, rollout, and rollback.', weakSignal: 'Offers unordered fixes and stops at aggregate offline performance.' }
      ]
    },
    {
      id: 'cv-system-design', title: 'CV system-design packet', durationMinutes: 60,
      interviewerScript: [
        { minute: 0, prompt: 'Select one of thirteen cases and require explicit requirements before architecture.' },
        { minute: 8, prompt: 'Ask for scale, data and labels, baseline, model path, and offline and online metrics.' },
        { minute: 30, prompt: 'Introduce the case pressure test and probe the weakest rubric dimension.' },
        { minute: 52, prompt: 'Request rollout, monitoring, failure handling, and a final tradeoff summary.' }
      ],
      questions: [
        'Define users, decision, scale, SLOs, error costs, and launch scope.',
        'Design versioned data, model, serving, and feedback interfaces.',
        'Choose an evaluation and experiment that predict the product outcome.',
        'Explain one failure, detection signal, mitigation, and rollback.'
      ],
      followUps: ['What bottlenecks at ten times scale?', 'Which component can fail silently while aggregate quality stays stable?', 'What would you postpone from the first launch?'],
      rubric: [
        { dimension: 'Requirements', strongSignal: 'Clarifies actor, decision, SLO, scale, error asymmetry, privacy, and constraints first.', weakSignal: 'Jumps to architecture while traffic, labels, latency, and success remain undefined.' },
        { dimension: 'Learning system', strongSignal: 'Connects collection, split, baseline, model, thresholds, slices, and online validation.', weakSignal: 'Lists components without versioned contracts or a metric that predicts user impact.' },
        { dimension: 'Reliability and tradeoffs', strongSignal: 'Designs capacity, fallback, observability, rollout, rollback, and a prioritized launch.', weakSignal: 'Draws only a happy path, adds everything, and avoids explicit decisions.' }
      ]
    },
    {
      id: 'behavioral', title: 'Senior behavioral packet', durationMinutes: 50,
      interviewerScript: [
        { minute: 0, prompt: 'Select four stable prompt IDs at random and require two-minute answers without notes.' },
        { minute: 5, prompt: 'After each answer, ask one follow-up about scope, ownership, evidence, or reflection.' },
        { minute: 30, prompt: 'Challenge attribution or tradeoffs and ask what the candidate would change now.' },
        { minute: 44, prompt: 'Ask for a concise career introduction, then score before feedback.' }
      ],
      questions: [
        'Tell stories about impact, failure, influence, and technical direction.',
        'Make the owned decision and rejected alternative explicit in each answer.',
        'Quantify the result and name a guardrail, uncertainty, or counterfactual.',
        'Close with a specific change in later judgment.'
      ],
      followUps: ['What did you personally decide and what happens without it?', 'Which stakeholder disagreed and what evidence changed the path?', 'What makes the claimed impact attributable?'],
      rubric: [
        { dimension: 'Scope', strongSignal: 'Frames consequential scale, ambiguity, stakeholders, constraints, and why senior judgment mattered.', weakSignal: 'Describes a routine task with little ambiguity, ownership, or cross-team consequence.' },
        { dimension: 'Ownership and evidence', strongSignal: 'Names one owned decision, alternatives, influence, attributable outcomes, and guardrails.', weakSignal: 'Uses collective language and vague praise or activity metrics instead of evidence.' },
        { dimension: 'Reflection and delivery', strongSignal: 'Answers directly in a coherent two-minute arc and names a later behavior change.', weakSignal: 'Rambles through implementation detail or ends with a generic lesson.' }
      ]
    }
  ];

  const behavioralPrompts = [
    {
      id: 'highest-impact',
      title: 'Highest impact',
      prompt: 'A project where your technical decision measurably changed a product or operation.',
      followUps: [
        'What baseline and counterfactual make the impact attributable to your decision?',
        'Which alternative did you reject, and what evidence made the chosen path preferable?'
      ],
      seniorSignals: [
        'Frames the business stakes, technical constraints, and affected stakeholders before describing implementation.',
        'Owns a consequential decision while distinguishing personal contribution from the broader team effort.',
        'Quantifies before-and-after outcomes and names guardrails or costs that prevented a hollow metric win.'
      ],
      modelOutline: [
        'Establish the operating baseline, stakes, constraints, and scale.',
        'Name the decision you owned, alternatives considered, and selection evidence.',
        'Explain execution, cross-team alignment, and the hardest course correction.',
        'Report attributable impact with guardrails, uncertainty, and a credible counterfactual.',
        'Close with what the result changed in your subsequent technical judgment.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Defines a consequential problem, its scale, constraints, stakeholders, and why the baseline mattered.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Makes one owned decision explicit and compares plausible alternatives using evidence rather than hindsight.' },
        { dimension: 'Evidence and impact', strongSignal: 'Uses attributable before-and-after measures plus quality, safety, cost, or reliability guardrails.' },
        { dimension: 'Reflection and communication', strongSignal: 'Communicates a crisp causal narrative and explains how the experience improved later decisions.' }
      ]
    },
    {
      id: 'ambiguity',
      title: 'Ambiguity',
      prompt: 'A poorly specified CV problem that you converted into requirements, data, metrics, and milestones.',
      followUps: [
        'Which assumption was most dangerous, and how did you test it before committing the roadmap?',
        'What new evidence forced you to revise the original problem definition or success metric?'
      ],
      seniorSignals: [
        'Turns vague product language into observable decisions, error costs, constraints, and acceptance criteria.',
        'Uses cheap discovery work to retire data, labeling, feasibility, or stakeholder risk in the right order.',
        'Creates milestones with explicit decision gates and keeps stakeholders aligned as assumptions change.'
      ],
      modelOutline: [
        'Describe the ambiguous request, stakeholders, deployment context, and cost of choosing poorly.',
        'List the critical assumptions and convert them into requirements and measurable outcomes.',
        'Run targeted data audits, baselines, or prototypes to resolve the highest-risk unknowns.',
        'Sequence milestones around decision gates and communicate changes to scope or expectations.',
        'Summarize the delivered result and the ambiguity-management practice you retained.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Identifies multiple sources of ambiguity across users, data, operations, constraints, and success criteria.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Prioritizes assumptions by risk and chooses proportionate discovery work before expensive implementation.' },
        { dimension: 'Evidence and impact', strongSignal: 'Shows how concrete evidence changed requirements, milestones, investment, or the shipped outcome.' },
        { dimension: 'Reflection and communication', strongSignal: 'Explains evolving decisions transparently and names a reusable method for future ambiguous work.' }
      ]
    },
    {
      id: 'failure',
      title: 'Failure',
      prompt: 'A model or launch that did not work, how you diagnosed it, and what changed in your process.',
      followUps: [
        'What evidence first contradicted your expectations, and why was it not caught earlier?',
        'Which part of the failure was yours to own, and what durable control did you add afterward?'
      ],
      seniorSignals: [
        'States the miss without minimizing it and separates the initiating cause from contributing system conditions.',
        'Uses disciplined diagnosis and containment rather than changing several variables or blaming another team.',
        'Converts the lesson into a verified process, tooling, review, or rollout change with an accountable owner.'
      ],
      modelOutline: [
        'Set the expected outcome, risk level, signals available, and what actually failed.',
        'Own your decisions and reconstruct the causal chain without hindsight shortcuts.',
        'Explain diagnosis, containment, stakeholder communication, and recovery sequencing.',
        'Quantify the cost and show evidence that the corrective action addressed the cause.',
        'Name the durable change to your engineering or decision process.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Describes user or operational consequences and the interacting technical and organizational conditions.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Owns a specific mistaken decision and demonstrates disciplined diagnosis, containment, and prioritization.' },
        { dimension: 'Evidence and impact', strongSignal: 'Quantifies the miss and verifies recovery or prevention with appropriate production or process signals.' },
        { dimension: 'Reflection and communication', strongSignal: 'Avoids blame, explains the causal lesson clearly, and identifies a durable behavior change.' }
      ]
    },
    {
      id: 'conflict',
      title: 'Conflict',
      prompt: 'A substantive technical disagreement resolved through evidence and tradeoffs.',
      followUps: [
        'What was the strongest version of the other person’s position, and where were they right?',
        'How did you reach a decision when the available evidence remained incomplete or contested?'
      ],
      seniorSignals: [
        'Represents opposing goals fairly and distinguishes technical facts from risk tolerance or incentives.',
        'Creates a decision mechanism such as an experiment, written tradeoff review, or reversible checkpoint.',
        'Preserves trust after the decision and supports the outcome even when the preferred option does not win.'
      ],
      modelOutline: [
        'Frame the shared goal, material stakes, constraints, and genuinely competing positions.',
        'Present the other view fairly before explaining your own assumptions and concerns.',
        'Describe the evidence, decision rule, escalation boundary, and how uncertainty was handled.',
        'Explain the decision, execution, relationship outcome, and measurable consequences.',
        'Reflect on what you would repeat or change in a future disagreement.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Shows a real disagreement with consequential tradeoffs, multiple stakeholders, and incomplete information.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Builds a fair decision process, updates beliefs with evidence, and knows when escalation is appropriate.' },
        { dimension: 'Evidence and impact', strongSignal: 'Connects the resolution to delivery, quality, risk, or team outcomes instead of merely winning an argument.' },
        { dimension: 'Reflection and communication', strongSignal: 'Steel-mans the opposing view, communicates respectfully, and demonstrates preserved working trust.' }
      ]
    },
    {
      id: 'production-incident',
      title: 'Production incident',
      prompt: 'A reliability, latency, drift, or data-quality incident you owned through resolution.',
      followUps: [
        'How did you decide what to contain first while diagnosis was still uncertain?',
        'Which leading indicator, control, or ownership gap would have shortened the incident most?'
      ],
      seniorSignals: [
        'Prioritizes user safety and service containment before root-cause certainty, with explicit rollback criteria.',
        'Coordinates technical work, decision ownership, and stakeholder updates through a clear incident cadence.',
        'Distinguishes trigger, root cause, and systemic contributors, then verifies corrective actions in production.'
      ],
      modelOutline: [
        'State the symptom, affected users, severity, detection path, and immediate uncertainty.',
        'Explain containment choices, incident roles, communication cadence, and rollback or fallback decisions.',
        'Trace diagnosis from hypotheses and evidence to trigger, root cause, and contributing controls.',
        'Quantify recovery and describe tested corrective and preventive actions with owners.',
        'Close with the monitoring, runbook, or architecture lesson that changed future response.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Defines severity, blast radius, user impact, dependencies, and uncertainty during a live system event.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Makes timely containment and rollback decisions while coordinating clear roles and escalation.' },
        { dimension: 'Evidence and impact', strongSignal: 'Uses incident timing and service measures to prove recovery and verifies preventive controls afterward.' },
        { dimension: 'Reflection and communication', strongSignal: 'Communicates calmly without blame and turns the incident into durable operational learning.' }
      ]
    },
    {
      id: 'leadership-without-authority',
      title: 'Leadership without authority',
      prompt: 'A cross-team direction you influenced without relying on title.',
      followUps: [
        'Why did the other teams initially resist, and how did you change the incentives or evidence?',
        'Which part of the direction remained locally owned rather than centrally mandated?'
      ],
      seniorSignals: [
        'Maps stakeholder goals, incentives, constraints, and decision rights before proposing a shared direction.',
        'Builds credibility through useful evidence, a low-friction adoption path, and visible early partners.',
        'Creates distributed ownership so adoption survives beyond personal persuasion or a single launch.'
      ],
      modelOutline: [
        'Describe the cross-team problem, fragmented incentives, decision rights, and cost of inaction.',
        'Explain how you learned stakeholder constraints and shaped a mutually useful proposal.',
        'Show the evidence, coalition, pilot, and adoption mechanisms used instead of positional authority.',
        'Measure organizational and technical outcomes, including where teams retained autonomy.',
        'Reflect on trust, influence, and how the direction became sustainable.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Frames a cross-team problem with conflicting incentives, dependencies, and meaningful organizational reach.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Influences through listening, evidence, coalition building, and a pragmatic adoption strategy.' },
        { dimension: 'Evidence and impact', strongSignal: 'Shows durable adoption and measurable delivery, quality, cost, or coordination improvements.' },
        { dimension: 'Reflection and communication', strongSignal: 'Credits partners, distinguishes influence from control, and explains how trust was earned.' }
      ]
    },
    {
      id: 'mentoring',
      title: 'Mentoring',
      prompt: 'How you raised another engineer’s capability or improved the team’s technical standard.',
      followUps: [
        'How did you diagnose the real capability gap rather than simply fixing the work yourself?',
        'What observable change showed that the person or team could succeed without your continued intervention?'
      ],
      seniorSignals: [
        'Adapts support to the learner’s goals and root skill gap instead of prescribing a generic growth plan.',
        'Uses progressively reduced scaffolding, specific feedback, and psychologically safe opportunities to practice.',
        'Measures independent capability and turns individual learning into reusable team standards where appropriate.'
      ],
      modelOutline: [
        'Set the person or team context, desired capability, stakes, and observed gap.',
        'Explain how you diagnosed causes and agreed on an individualized growth objective.',
        'Describe practice opportunities, feedback loops, scaffolding, and increasing ownership.',
        'Show independent behavior or team-standard improvements rather than work you completed for them.',
        'Reflect on consent, feedback quality, and what you learned about developing others.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Explains the capability context, learner needs, delivery stakes, and constraints on growth.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Diagnoses the gap, tailors support, gives actionable feedback, and deliberately transfers ownership.' },
        { dimension: 'Evidence and impact', strongSignal: 'Demonstrates sustained independent performance or a concrete improvement in team technical practice.' },
        { dimension: 'Reflection and communication', strongSignal: 'Centers the learner, communicates with empathy, and reflects on how the mentoring approach evolved.' }
      ]
    },
    {
      id: 'tradeoff',
      title: 'Tradeoff',
      prompt: 'A deliberate accuracy, cost, latency, scope, or timeline compromise and its measured result.',
      followUps: [
        'What option did you preserve for later, and which part of the decision was difficult to reverse?',
        'Which guardrail would have caused you to reject or roll back the compromise?'
      ],
      seniorSignals: [
        'Quantifies competing objectives and distinguishes hard constraints from negotiable preferences.',
        'Compares credible alternatives, reversibility, opportunity cost, and asymmetric failure consequences.',
        'Defines guardrails and a revisit trigger, then measures whether the compromise held in operation.'
      ],
      modelOutline: [
        'Frame the decision, competing objectives, hard constraints, and stakeholders bearing each cost.',
        'Compare alternatives with evidence, uncertainty, reversibility, and failure consequences.',
        'State the compromise you owned, guardrails, rollout plan, and explicit revisit trigger.',
        'Report measured benefits, accepted costs, and any unanticipated second-order effects.',
        'Reflect on whether the same tradeoff remains valid under current conditions.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Makes multiple objectives, hard constraints, affected users, and asymmetric risks concrete.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Chooses among credible alternatives using explicit criteria, reversibility, and guardrails.' },
        { dimension: 'Evidence and impact', strongSignal: 'Quantifies both the gained outcome and the accepted cost, including relevant slice or reliability effects.' },
        { dimension: 'Reflection and communication', strongSignal: 'Explains the compromise plainly, acknowledges who bore its costs, and names a revisit condition.' }
      ]
    },
    {
      id: 'research-to-production',
      title: 'Research to production',
      prompt: 'How you converted uncertain experiments or model combinations into a maintainable system.',
      followUps: [
        'Which research result failed to survive production constraints, and how did the design change?',
        'What interface, evaluation gate, or fallback kept future experimentation from destabilizing serving?'
      ],
      seniorSignals: [
        'Separates hypothesis validation from productization and defines promotion criteria before optimizing a favorite model.',
        'Designs reproducible data, evaluation, versioning, serving, monitoring, fallback, and ownership contracts.',
        'Balances model quality with target-hardware performance, operability, iteration speed, and maintenance cost.'
      ],
      modelOutline: [
        'Define the uncertain product hypothesis, baseline, constraints, and promotion criteria.',
        'Describe experiments and the evidence that selected or rejected candidate approaches.',
        'Explain how you converted notebooks into versioned interfaces, pipelines, tests, and serving controls.',
        'Cover rollout, monitoring, fallback, ownership, and measured production outcomes.',
        'Reflect on the research assumptions that changed when exposed to real operating conditions.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Connects experimental uncertainty to production data, hardware, reliability, safety, and ownership constraints.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Defines promotion criteria and builds maintainable interfaces, evaluation gates, rollout, and fallback.' },
        { dimension: 'Evidence and impact', strongSignal: 'Shows reproducible experimental evidence and production measures across quality, latency, cost, or reliability.' },
        { dimension: 'Reflection and communication', strongSignal: 'Distinguishes discovery from delivery and explains how production feedback changed the technical approach.' }
      ]
    },
    {
      id: 'technical-direction',
      title: 'Technical direction',
      prompt: 'A recurring problem where you created a reusable architecture, process, or decision framework.',
      followUps: [
        'How did you know the repeated pain justified a shared direction rather than another local fix?',
        'What adoption or governance mechanism prevented the solution from becoming an inflexible platform mandate?'
      ],
      seniorSignals: [
        'Identifies a repeated system-level cost using evidence across teams, incidents, or delivery cycles.',
        'Chooses the smallest reusable contract that preserves local flexibility and defines migration boundaries.',
        'Drives adoption, ownership, measurement, and evolution instead of stopping at an architecture document.'
      ],
      modelOutline: [
        'Establish the recurring pattern, accumulated cost, affected teams, and evidence that local fixes were insufficient.',
        'Define the principles, boundaries, alternatives, and smallest reusable contract worth standardizing.',
        'Describe stakeholder input, pilot, migration, compatibility, ownership, and governance decisions.',
        'Measure adoption and technical or organizational outcomes, including exceptions and unintended friction.',
        'Reflect on how the direction evolved and what you deliberately left decentralized.'
      ],
      rubric: [
        { dimension: 'Scope and complexity', strongSignal: 'Demonstrates repeated cross-system cost, broad stakeholders, migration constraints, and long-term consequences.' },
        { dimension: 'Ownership and judgment', strongSignal: 'Defines an appropriately narrow direction, compares alternatives, and plans adoption and evolution.' },
        { dimension: 'Evidence and impact', strongSignal: 'Measures adoption plus delivery, reliability, quality, cost, or decision-consistency improvements.' },
        { dimension: 'Reflection and communication', strongSignal: 'Explains principles and boundaries clearly, welcomes exceptions, and reflects on centralization tradeoffs.' }
      ]
    }
  ];

  window.InterviewPrepData = {
    ...(window.InterviewPrepData || {}),
    foundationModules,
    codingModules,
    modernCvModules,
    systemDesignCases,
    mockPackets,
    behavioralPrompts
  };
})();
