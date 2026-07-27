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
        { question: 'What does a small singular value mean?', answer: 'The data has little variation along the associated singular-vector direction. Removing it loses less reconstruction energy, though it can still contain supervised signal.' },
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
        'Aleatoric uncertainty comes from irreducible observation noise. Epistemic uncertainty comes from limited knowledge and can shrink with informative data.',
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
        'A p-value is the probability of data at least this extreme under the null model. It is not the probability that the null is true or the effect is important.',
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
        { question: 'What does gradient clipping change?', answer: 'It limits update magnitude, usually by norm or value. It changes the optimization trajectory but not the forward model or loss definition.' }
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
        'Segmentation IoU and Dice overlap regions. Boundary F1 catches edge quality; object-level recall catches missing small instances.'
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
        'Covariate drift changes P(X), label drift changes P(Y), and concept drift changes P(Y|X). Distribution alerts do not prove quality degradation.',
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
        'Linear regression estimates a conditional mean; logistic regression models log-odds and produces a score that can be calibrated and thresholded for asymmetric decisions.',
        'Decision trees capture nonlinear interactions without feature scaling. Random forests reduce variance by bagging; gradient-boosted trees reduce residual error sequentially and are often the strongest tabular baseline.',
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
        'Worked application — low-rank embeddings: for centered X=UΣVᵀ, Xₖ=UₖΣₖVₖᵀ is the best rank-k approximation in Frobenius norm. The retained squared-energy fraction is Σᵢ₌₁ᵏσᵢ² / Σᵢσᵢ², so k can be chosen from a reconstruction or memory budget.'
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
        'Worked derivation — binary classification: with p(y=1|x)=σ(z), -log p(y|x)=-[y log σ(z)+(1-y)log(1-σ(z))], which is binary cross-entropy; a Gaussian prior on weights adds a coefficient-scaled ||w||₂² penalty to the summed negative log-likelihood.'
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
        'Randomized experiments identify causal effects under compliance and interference assumptions; observational correlations require stronger modeling assumptions.'
      ],
      formulas: [
        'Benjamini–Hochberg controls false discovery rate by comparing ordered p-values p(k) to kα/m.',
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
        { question: 'Why are saddle points common in high dimensions?', answer: 'There are many directions with mixed curvature, making stationary points with both positive and negative Hessian eigenvalues combinatorially common.' },
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
        'Contrastive objectives often optimize bounds related to mutual information, but practical behavior depends heavily on sampling and representations.'
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
        'Undirected connectivity changes through edge additions and queries do not need actual paths, suggesting disjoint-set union.'
      ],
      invariant: 'Traversal schedules each logical state once; Kahn’s queue contains exactly zero-indegree unfinished vertices and removes each outgoing edge once; DFS coloring never enters a gray node on an acyclic path; union-find roots name disjoint components.',
      template: [
        'Define vertices, edge direction, and neighbor generation, including expanded state such as node-plus-mask when history changes future moves.',
        'Choose BFS for unweighted shortest edges or DFS for exhaustive structure; mark visited at enqueue/push when duplicate scheduling is harmful.',
        'For dependencies, build adjacency plus indegree and count Kahn removals, or use white/gray/black DFS where an edge to gray proves a cycle.',
        'For union-find, initialize one parent per node, find roots with compression, and union roots by size or rank.'
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

    return completed == num_courses` }
      ],
      complexity: [
        'Adjacency-list DFS, BFS, Kahn topological sort, and DFS-color cycle detection are O(V + E) time and O(V + E) stored graph plus O(V) frontier/color state.',
        'Union-find with path compression and union by rank performs m operations in O(m α(V)) time, effectively near constant per operation.'
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
      invariant: 'Loss inputs share a broadcast-safe shape and dtype, gradients belong only to the current step, IoU uses nonnegative intersection and union, and greedy NMS keeps the highest remaining score before removing only boxes above the overlap threshold.',
      template: [
        'For BCE, accept logits [B] or [B,C], reshape/cast targets to match, and call the stable fused binary_cross_entropy_with_logits reduction.',
        'For training, set train mode, clear gradients, run forward, compute scalar loss, backpropagate, optionally clip, and step the optimizer exactly once.',
        'For IoU/NMS, validate xyxy boxes, clamp intersection widths/heights at zero, sort scores descending, and repeatedly suppress high-overlap remainder boxes.'
      ],
      code: [
        { label: 'Template — stable BCE-with-logits and one training step', body: `import torch
import torch.nn.functional as F

def binary_training_step(model, optimizer, features, targets):
    # features: [B, D]; targets and logits: [B] (or matching [B, C])
    model.train()
    optimizer.zero_grad(set_to_none=True)
    logits = model(features).squeeze(-1)
    targets = targets.to(device=logits.device, dtype=logits.dtype).reshape_as(logits)
    loss = F.binary_cross_entropy_with_logits(logits, targets)
    loss.backward()
    optimizer.step()
    return loss.detach(), logits.detach()` },
        { label: 'Worked example — vectorized binary classifier update', body: `import torch

model = torch.nn.Linear(3, 1)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
features = torch.tensor([[1.0, 0.0, 2.0], [0.0, 1.0, -1.0]])  # [B=2, D=3]
targets = torch.tensor([1.0, 0.0])                             # [B=2]

loss, logits = binary_training_step(model, optimizer, features, targets)
assert loss.ndim == 0 and logits.shape == targets.shape` },
        { label: 'Template — vectorized box IoU and greedy NMS', body: `import torch

def box_iou(box, boxes):
    # box: [4], boxes: [N, 4], coordinates are (x1, y1, x2, y2)
    top_left = torch.maximum(box[:2], boxes[:, :2])
    bottom_right = torch.minimum(box[2:], boxes[:, 2:])
    intersection = (bottom_right - top_left).clamp(min=0).prod(dim=1)
    box_area = (box[2:] - box[:2]).clamp(min=0).prod()
    areas = (boxes[:, 2:] - boxes[:, :2]).clamp(min=0).prod(dim=1)
    union = box_area + areas - intersection
    return intersection / union.clamp(min=torch.finfo(boxes.dtype).eps)

def nms(boxes, scores, iou_threshold):
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
        'Calling zero_grad after backward, forgetting model.train(), silently broadcasting [B,1] against [B], or retaining graph-bearing losses corrupts training behavior or memory.',
        'Mixing xywh with xyxy, accepting negative-area boxes, dividing by zero-area union, or suppressing before sorting by score produces invalid NMS results.',
        'In multiclass detection, class-agnostic NMS can suppress overlapping boxes from different classes unless that behavior is deliberate.'
      ],
      recall: [
        { question: 'Why is BCE-with-logits more stable than sigmoid followed by BCE?', answer: 'The fused operation rewrites the log-sigmoid terms with a log-sum-exp-style expression, avoiding probabilities rounded to zero or one before taking logarithms.' },
        { question: 'What is the required order of a real optimizer update?', answer: 'Set train mode, clear old gradients, run the forward pass, compute a scalar loss, call backward, optionally clip, then call optimizer.step once.' },
        { question: 'What invariant makes greedy NMS correct for its stated policy?', answer: 'The highest-scoring remaining box is kept first, and only lower-scoring boxes whose IoU exceeds the chosen threshold are removed before repeating.' },
        { question: 'Which production tradeoff should you test around NMS?', answer: 'Evaluate threshold and class-aware policy by object density and size while measuring duplicate precision, crowded-scene recall, latency, and downstream tracking behavior.' }
      ]
    }
  ];

  const modernCvModules = [
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
        'A convolution has K_h×K_w×C_in×C_out weights (plus optional bias), independent of image size.'
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
      id: 'detection-segmentation-foundations', title: 'Detection and segmentation foundations', required: true,
      summary: 'Dense prediction turns backbone features into boxes, classes, or pixel masks. Strong answers connect FPN scale handling, label assignment, proposal or anchor choices, NMS, U-Net skip connections, task losses, and evaluation units to the actual cost of misses and false alarms.',
      keyPoints: [
        'Feature Pyramid Networks combine semantically strong coarse features with higher-resolution lateral features so heads can detect objects across scales.',
        'Anchor-based detectors assign boxes by IoU and tune scales/aspect ratios; anchor-free detectors predict centers, corners, or distances but still require assignment policy.',
        'Two-stage detectors propose regions then classify/refine them; one-stage detectors predict densely and usually offer a simpler low-latency path.',
        'Greedy NMS keeps a high-score box and suppresses overlapping lower-score boxes; threshold, class policy, and crowded scenes control the precision/recall tradeoff.',
        'U-Net-style decoders upsample while skip connections restore spatial detail from encoder stages for dense masks.',
        'Detection and segmentation imbalance may need focal loss, sampling, Dice/IoU terms, or class weighting, but each changes calibration and failure incentives.'
      ],
      formulas: [
        'IoU(A,B)=area(A∩B)/area(A∪B); generalized IoU adds a penalty from the smallest enclosing box when boxes do not overlap.',
        'Dice=2TP/(2TP+FP+FN), while IoU=TP/(TP+FP+FN); both require an explicit empty-mask convention.',
        'Focal loss scales cross-entropy by (1-p_t)^γ so well-classified examples contribute less.'
      ],
      decisionRules: [
        'Choose one-stage for a measured latency/throughput advantage; choose two-stage when proposal-level refinement improves the hard slices enough to justify cost.',
        'Use mask and boundary metrics plus object-level sensitivity when pixel overlap alone can hide missing small critical objects.',
        'Tune assignment, score threshold, and NMS jointly on a deployment-like validation set, then calibrate per class or slice only with enough support.'
      ],
      pitfalls: [
        'Comparing mAP numbers across different IoU ranges, image resizing, or postprocessing settings is not an apples-to-apples model comparison.',
        'Aggregate Dice can improve while tiny or rare objects disappear; report by size, class, site, and empty/nonempty case.',
        'Training on resized boxes or masks without transforming coordinates consistently corrupts labels while still producing plausible loss curves.'
      ],
      systemDesignUse: 'Define annotation units, feature scale, assignment and postprocessing contracts, event-level decision rules, and human review. Benchmark the complete resize-to-alert path and monitor class/size slices rather than only aggregate mAP or Dice.',
      recall: [
        { question: 'How does FPN architecture support small and large objects?', answer: 'A top-down pathway and lateral connections combine coarse semantic features with finer spatial maps, giving prediction heads multiple meaningful resolutions.' },
        { question: 'What mechanics distinguish one-stage and two-stage detectors?', answer: 'One-stage models classify and regress dense locations directly; two-stage models first generate proposals and then run per-proposal classification and refinement.' },
        { question: 'How would you evaluate the production NMS and mask tradeoff?', answer: 'Measure event and object precision/recall by density and size, duplicate rate, boundary quality, latency, and downstream alert or review cost at the chosen thresholds.' }
      ]
    },
    {
      id: 'cnn-vs-transformer', title: 'CNNs versus vision transformers', required: true,
      summary: 'CNNs encode locality and translation structure directly. Vision transformers learn broader token interactions and scale well with pretraining, but resolution, data regime, hardware kernels, and dense-task requirements determine which architecture actually wins.',
      keyPoints: [
        'Convolutions share local kernels, giving strong inductive bias and efficient dense feature pyramids.',
        'Self-attention lets tokens exchange global information, while full attention scales quadratically with token count.',
        'Transformers often scale predictably with data and compute and transfer well from large pretraining corpora.',
        'Hybrid and hierarchical models blur the boundary through local windows, convolutions, multiscale stages, and attention.'
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
        'One-to-one matching reduces duplicates, but crowded-object and confidence behavior still require validation.'
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
        'Global alignment does not guarantee counting, localization, compositionality, or calibrated confidence.'
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
      id: 'dinov2', title: 'DINOv2 and self-supervised visual features', required: true,
      summary: 'DINO-style self-distillation learns reusable visual representations without paired text labels. DINOv2 emphasizes curated scale and features that transfer to image-level and dense tasks, but still inherits source-distribution and preprocessing assumptions.',
      keyPoints: [
        'A student predicts representations from an exponential-moving-average teacher under different views.',
        'Multi-crop augmentation encourages invariance while patch objectives preserve local structure.',
        'Frozen features support probes, nearest neighbors, detection, segmentation, and depth heads.',
        'Self-supervision avoids label ontology costs but not data curation, leakage, bias, or compute.',
        'Specialized imagery may require adapters or fine-tuning after a frozen baseline establishes the gap.'
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
      id: 'sam2', title: 'SAM and SAM2', required: true,
      summary: 'SAM turns points, boxes, or masks into segmentations; SAM2 extends promptable segmentation to video using memory. Their strongest production roles are often annotation assistance, interactive correction, proposal generation, or validated components.',
      keyPoints: [
        'A heavy image encoder can be amortized across multiple prompts while a prompt and mask decoder responds interactively.',
        'Ambiguous prompts may yield multiple plausible masks, and class-agnostic masks do not inherently provide semantic labels.',
        'SAM2 memory propagates information over video, introducing occlusion, reappearance, drift, and identity-switch failures.',
        'Interactive quality should be measured against click/box count and correction time, not one-shot IoU alone.',
        'Domain boundaries, tiny structures, and adjacent objects require explicit validation and often adaptation.'
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
        'Synonyms, attributes, background confusion, and unsupported terms need explicit test sets.'
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
        'Track and event metrics must expose fragmentation, identity switches, latency to alert, and missed short-duration events.'
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
        'Grounding requires region, citation, counterfactual, and unsupported-question evaluation.'
      ],
      formulas: ['Total context contains visual plus text tokens; increasing image tiles or frames raises attention cost and reduces room for language context.', 'Selective risk should be plotted against coverage when the system can abstain or route to review.'],
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
        'Synthetic data can add coverage and also generator bias, artifacts, privacy issues, and shortcut cues.'
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
    }
  ];

  const systemDesignCases = [
    {
      id: 'image-search', order: 1, title: 'Large-scale image search',
      scenario: 'Users submit an image or text and retrieve relevant catalog images from hundreds of millions of items under a tight latency SLO.',
      requirements: ['Query type and relevance definition', 'Catalog size, update rate, regions, and p99 latency', 'Metadata filters, safety, and personalization', 'Offline labels and online success metric'],
      solutionOutline: ['Image/text dual encoders with a versioned embedding contract', 'Offline embedding pipeline and approximate-nearest-neighbor index', 'Metadata filtering, candidate generation, reranking, and caching', 'Recall@K/NDCG plus click or conversion guardrails', 'Index freshness, embedding drift, shadow migration, and rollback'],
      modernCv: 'Compare CLIP-style joint embeddings with DINOv2 image features plus a separate text path. Choose by query modes and domain transfer.',
      pressureTest: 'A new embedding version improves offline Recall@10 but requires rebuilding a two-terabyte index. How do you migrate without mixing incompatible vectors?',
      pressureTestAnswer: 'Decision: dual-write versioned embeddings and build a separate index, then shadow and canary queries before an atomic alias switch. The alternative is an in-place rebuild, rejected because mixed vector spaces fail silently. Verify Recall@K, latency, coverage, and index parity; monitor drift and retain the old index for rollback.'
    },
    {
      id: 'visual-similarity', order: 2, title: 'Visual similarity and product recommendations',
      scenario: 'Given one product photo, retrieve substitutes or visually similar products while respecting inventory, price, category, and user intent.',
      requirements: ['What “similar” means: appearance, function, brand, price, or compatibility', 'Cold catalog versus personalized ranking', 'Duplicate handling and inventory freshness', 'Merchant/user fairness and business constraints'],
      solutionOutline: ['Pair/triplet construction from interactions and catalog metadata', 'Visual encoder baseline and hard-negative mining', 'ANN candidate generation followed by multimodal/business reranking', 'Human relevance audits by category and online conversion/diversity tests', 'Feedback-loop controls so popularity does not erase long-tail inventory'],
      modernCv: 'Use CLIP when textual attributes and zero-shot catalog concepts matter; use DINOv2/domain fine-tuning when fine-grained appearance dominates.',
      pressureTest: 'Clicks favor popular products even when not visually similar. How do you prevent training labels from collapsing similarity into popularity?',
      pressureTestAnswer: 'Decision: separate visual relevance labels from engagement, debias sampling, add hard negatives, and constrain reranking with diversity. An alternative is raw click supervision, which fails through exposure bias and feedback loops. Verify with blinded human relevance by category plus online conversion, novelty, and long-tail guardrails.'
    },
    {
      id: 'detection-service', order: 3, title: 'Real-time object-detection service',
      scenario: 'Process camera streams and generate safety alerts with strict end-to-end latency, limited bandwidth, and changing environments.',
      requirements: ['Camera count, FPS, resolution, event definition, and alert latency', 'Edge versus cloud constraints and offline operation', 'False-alert and missed-event cost', 'Privacy, retention, and supported device fleet'],
      solutionOutline: ['Frame sampling and region-of-interest preprocessing', 'Detector, optional tracker, temporal event rules, and deduplication', 'Edge/cloud cascade, batching, quantization, and backpressure', 'mAP slices plus event-level precision/recall and alert latency', 'Camera-health, drift, threshold, rollout, and operator-feedback monitoring'],
      modernCv: 'Benchmark an optimized one-stage detector against a DETR-family checkpoint; use the winner on target hardware, not paper mAP alone.',
      pressureTest: 'Nighttime false alerts spike after a camera firmware update. What telemetry distinguishes sensor change, preprocessing skew, and concept drift?',
      pressureTestAnswer: 'Decision: compare raw-frame and preprocessing fingerprints by firmware cohort before retraining, then replay the same frames through old and new pipelines. Alternative model changes would hide a pipeline failure. Verify sensor histograms, resize/color parity, prediction and event slices, labeled nighttime precision, and rollback the firmware or transform independently.'
    },
    {
      id: 'video-moderation', order: 4, title: 'Video content moderation',
      scenario: 'Screen uploaded and live videos for policy violations while controlling reviewer workload and appeal risk.',
      requirements: ['Policy taxonomy, severity, legal region, and response time', 'Uploaded versus live flow', 'Audio, text, frames, and metadata availability', 'Reviewer capacity, appeals, and protected-group impact'],
      solutionOutline: ['Adaptive frame/clip sampling and multimodal feature extraction', 'Cheap high-recall filters followed by specialist models and temporal aggregation', 'Policy-specific thresholds, abstention, reviewer queue, and escalation', 'Video/event-level recall, precision at reviewer capacity, and appeal overturn rate', 'Policy/version lineage, adversarial monitoring, and delayed labels from review'],
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
      pressureTestAnswer: 'Decision: promote small-object sensitivity and boundary or object-level recall to release gates, oversample the critical slice, and inspect loss/assignment behavior. The alternative of optimizing aggregate Dice fails because background and large masks dominate. Verify by size-stratified holdout, site review, calibration, and prospective workflow impact.'
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
      requirements: ['Label cost, annotator skill, turnaround, and budget', 'Pool size, data arrival, and model cadence', 'Rare classes and safety-critical slices', 'Evaluation set independence and audit needs'],
      solutionOutline: ['Candidate pool with provenance, deduplication, and privacy controls', 'Uncertainty plus diversity/coverage acquisition with exploration quota', 'Guidelines, gold tasks, agreement, adjudication, and annotator routing', 'Immutable evaluation set plus newly sampled audit sets', 'Dataset/model version lineage, staged retraining, and acquisition-bias monitoring'],
      modernCv: 'Use DINOv2 or CLIP embeddings for diversity and SAM2 for label acceleration, while validating that foundation-model bias does not narrow coverage.',
      pressureTest: 'Uncertainty sampling keeps selecting corrupt images. How do you separate data-quality routing from informative model uncertainty?',
      pressureTestAnswer: 'Decision: run explicit quality checks and a corruption classifier before uncertainty acquisition, budget separate quality and learning queues, and keep exploration. The alternative of one uncertainty score fails by wasting labels. Verify acquisition yield, rare-slice coverage, downstream lift per label, annotator rejection, and an unchanged evaluation set.'
    },
    {
      id: 'multimodal-rag', order: 8, title: 'Multimodal retrieval and VLM application',
      scenario: 'Answer questions over a private image/document collection with citations and region-level grounding.',
      requirements: ['Supported question types and evidence standard', 'Collection size, update rate, access control, and latency', 'Text/image/document modalities', 'Hallucination, privacy, and user-correction policy'],
      solutionOutline: ['Modality-aware chunking and versioned image/text embeddings', 'Hybrid retrieval, metadata ACL filtering, and reranking', 'VLM generation constrained to retrieved evidence with structured citations', 'Answer correctness, retrieval recall, citation precision, grounding, abstention, and safety', 'Prompt/model/index lineage, adversarial tests, feedback review, and rollback'],
      modernCv: 'Use CLIP-like retrieval for cross-modal candidates and a VLM for synthesis; add OCR/layout routes for documents and never treat generation as retrieval evidence.',
      pressureTest: 'A user can retrieve another tenant’s image through semantically similar search. Where must authorization be enforced?',
      pressureTestAnswer: 'Decision: enforce tenant ACLs before candidate retrieval when the index supports it and again after every retrieval/rerank/cache boundary; never rely on prompt instructions. A post-generation filter alternative fails because data has already leaked. Verify adversarial cross-tenant queries, cache keys, index filters, logs, and deny-by-default tests.'
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
        { minute: 0, prompt: 'Select one of eight cases and require explicit requirements before architecture.' },
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
