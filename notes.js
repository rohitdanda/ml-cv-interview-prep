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
      title: 'Hashing and indexed state',
      required: true,
      summary: 'Hashing trades memory for fast lookup. The main design choice is what key captures the equivalence or complement relation and what value must be remembered to answer later queries.',
      recognitionCues: [
        'The question asks whether a value, complement, signature, or previously seen state exists.',
        'Items must be counted or grouped by an equivalence class that can be encoded as an immutable key.'
      ],
      invariant: 'After processing a prefix, the table contains exactly the information needed about that prefix, keyed by the canonical identity used by future lookups.',
      template: [
        'Define the lookup question and a stable immutable key before choosing set, frequency map, or key-to-index map.',
        'For each item, query the state in the order required to avoid matching the item with itself.',
        'Update only the information future iterations need; state why duplicates overwrite, accumulate, or remain distinct.'
      ],
      code: [
        { label: 'Remember what you have seen, keyed by identity', body: `def scan(nums):
    seen = {}                   # key -> info about a past item
    for i, x in enumerate(nums):
        if want(x) in seen:     # can the current item pair with a past one?
            return (seen[want(x)], i)
        seen[key(x)] = i        # remember AFTER querying to avoid a self-match
    return None` },
        { label: 'Worked example — Two Sum', body: `def two_sum(nums, target):
    seen = {}                   # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:  # complement already passed?
            return [seen[target - x], i]
        seen[x] = i
    return []` }
      ],
      complexity: [
        'One pass with expected O(1) hash operations is O(n) time and usually O(n) auxiliary space.',
        'Constructing a key can cost O(k), so grouping n objects by k-sized signatures costs at least O(nk) before sorting effects.'
      ],
      pitfalls: [
        'Using a mutable list as a key or a non-canonical signature splits values that should belong to the same group.',
        'Updating before querying can create self-matches; overwriting an index can also discard evidence the output requires.'
      ],
      recall: [
        { question: 'What makes a good hash-map key for grouping?', answer: 'It is immutable, canonical, and equal exactly when two inputs belong to the same required equivalence class.' },
        { question: 'When is a frequency map preferable to a set?', answer: 'When multiplicity affects validity, reconstruction, ranking, or removal; a set records presence but loses how many copies remain.' }
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
      title: 'Graph traversal and union-find',
      required: true,
      summary: 'Graphs require explicit node identity, neighbor generation, and visitation timing. DFS/BFS explores structure; union-find maintains connectivity under edge additions without storing traversal paths.',
      recognitionCues: [
        'Relationships form arbitrary adjacency, a grid acts as an implicit graph, or the task asks for reachability, components, cycles, or ordering.',
        'Connectivity changes through edge additions and queries do not need actual paths, suggesting disjoint-set union.'
      ],
      invariant: 'Traversal marks each logical state before duplicate scheduling can expand it; in union-find, each root names one component and parent/rank updates preserve that partition.',
      template: [
        'Define vertices and neighbor generation, including whether direction, weights, or expanded state such as node-plus-mask matters.',
        'Choose BFS for unweighted shortest edges or DFS for exhaustive structure; mark visited at enqueue/push when duplicates are harmful.',
        'For union-find, initialize one parent per node, find roots with compression, and union roots by size or rank.'
      ],
      code: [
        { label: 'Mark visited when scheduling; flood a grid with DFS', body: `def dfs_grid(grid, r, c, seen):
    if not in_bounds(r, c) or (r, c) in seen or blocked(grid, r, c):
        return
    seen.add((r, c))            # mark on visit to avoid re-work
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        dfs_grid(grid, r + dr, c + dc, seen)` },
        { label: 'Worked example — Number of Islands', body: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    def sink(r, c):
        stack = [(r, c)]
        seen.add((r, c))
        while stack:
            row, col = stack.pop()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] == '1':
                    seen.add((nr, nc))
                    stack.append((nr, nc))
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and (r, c) not in seen:
                sink(r, c)
                count += 1
    return count` }
      ],
      complexity: [
        'Adjacency-list DFS or BFS is O(V + E) time and O(V) visited/frontier space.',
        'Union-find with path compression and union by rank performs m operations in O(m α(V)) time, effectively near constant per operation.'
      ],
      pitfalls: [
        'Marking visited only when dequeued can enqueue the same dense-graph node many times and obscure shortest-path reasoning.',
        'Using union-find for directed dependency ordering loses edge direction; topological sort or directed-cycle detection is required.'
      ],
      recall: [
        { question: 'When does BFS guarantee a shortest path?', answer: 'When every edge has equal cost, BFS explores nodes in nondecreasing edge distance from the source; weighted graphs require a different priority rule.' },
        { question: 'What information does union-find intentionally not provide?', answer: 'It answers component membership and merging, but it does not preserve an explicit path, traversal order, or directed reachability.' }
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
    }
  ];

  const modernCvModules = [
    {
      id: 'cnn-vs-transformer', title: 'CNNs versus vision transformers', required: true,
      summary: 'CNNs encode locality and translation structure directly. Vision transformers learn more global interactions but usually need strong pretraining, augmentation, or architecture refinements.',
      keyPoints: [
        'Convolutions share local kernels, giving strong inductive bias and efficient dense feature pyramids.',
        'Self-attention lets any token interact with any other token, but full attention scales quadratically with token count.',
        'Transformers often scale predictably with data and compute and transfer well from large pretraining corpora.',
        'Hybrid and hierarchical models blur the boundary: local windows, convolutions, multiscale stages, and attention can coexist.'
      ],
      formulas: ['Full self-attention over N tokens costs O(N²d). At fixed patch size, doubling both H and W makes N 4× larger and the O(N²d) attention term roughly 16× larger.'],
      decisionRules: ['Choose from latency, data, resolution, transfer checkpoint, hardware, and dense-task requirements; do not choose by benchmark fashion.'],
      pitfalls: ['“Transformers see globally” does not remove the need for multiscale features, positional information, and memory control.'],
      systemDesignUse: 'For edge detection with tight latency, a compact CNN or hybrid may beat a larger ViT. For reusable large-scale pretraining, transformer representations may win.',
      recall: [{ question: 'What inductive bias does a CNN add?', answer: 'Local connectivity and translation-equivariant weight sharing, which reduce sample complexity for spatial patterns.' }]
    },
    {
      id: 'vit', title: 'Vision Transformer (ViT)', required: true,
      summary: 'ViT converts image patches into tokens, adds positional information, and applies transformer blocks. Its importance is the scalable pretraining-and-transfer recipe.',
      keyPoints: [
        'An image is split into fixed-size patches; each flattened patch is projected to the model dimension.',
        'A class token or pooled token representation supports classification; dense tasks reshape or aggregate spatial tokens.',
        'Absolute, relative, or learned positional signals restore spatial ordering that attention alone lacks.',
        'Patch size trades resolution for compute. Smaller patches improve small-detail representation but increase token count sharply.',
        'Strong augmentation, regularization, and pretraining compensate for weaker image-specific inductive bias.'
      ],
      formulas: ['Token count N=(H/P)(W/P) for image H×W and patch size P. Attention memory grows approximately with N².'],
      decisionRules: ['For small domain datasets, start from pretrained weights and compare linear probe versus full/partial fine-tuning.'],
      pitfalls: ['Upscaling input without recalculating attention memory can break serving and training budgets.'],
      systemDesignUse: 'State checkpoint source, input resolution, patch size, fine-tuning strategy, memory/latency, and behavior on small objects.',
      recall: [{ question: 'Why are positional embeddings needed?', answer: 'Vanilla self-attention is permutation-equivariant; without positional information, token order does not encode spatial arrangement.' }]
    },
    {
      id: 'detr', title: 'DETR and set-based detection', required: true,
      summary: 'DETR predicts a set of objects using learned queries and bipartite matching, replacing hand-designed anchors and standard NMS in the canonical formulation.',
      keyPoints: [
        'A fixed set of object queries attends to image features and emits class plus box predictions.',
        'Hungarian matching creates a one-to-one assignment between predictions and ground-truth objects.',
        'Unmatched queries learn a no-object class. Class imbalance and no-object weighting matter.',
        'Original DETR trained slowly and struggled with small objects; deformable and multiscale variants improve convergence and efficiency.',
        'No NMS simplifies the pipeline but duplicate and crowded-object behavior must still be evaluated.'
      ],
      formulas: ['Matching minimizes a cost combining class probability and box discrepancy; box loss often combines L1 and generalized IoU.'],
      decisionRules: ['Use DETR-family models when a strong maintained checkpoint and global/set reasoning fit the task; compare with optimized one-stage detectors for strict latency.'],
      pitfalls: ['Saying “DETR needs no postprocessing” is too broad; thresholding, resizing, calibration, tracking, and business rules remain.'],
      systemDesignUse: 'Compare mAP by object size, latency, memory, calibration, and export/operator support against a production one-stage baseline.',
      recall: [{ question: 'Why use Hungarian matching?', answer: 'The target is an unordered set. One-to-one assignment removes permutation ambiguity and trains distinct queries to cover distinct objects.' }]
    },
    {
      id: 'clip', title: 'CLIP and vision-language contrastive learning', required: true,
      summary: 'CLIP aligns image and text embeddings using paired data, enabling retrieval and zero-shot classification through text prompts.',
      keyPoints: [
        'Separate image and text encoders produce normalized embeddings in one space.',
        'Within a batch, matched pairs are positives and other pairs act as negatives; temperature controls logit sharpness.',
        'Zero-shot classification compares an image embedding with text embeddings for class prompts.',
        'Prompt wording and label semantics affect results; prompt ensembles reduce some sensitivity.',
        'Web-scale paired data brings broad concepts and also inherited bias, weak grounding, and domain mismatch.'
      ],
      formulas: ['Similarity logits often use sᵢⱼ=(vᵢ·tⱼ)/τ with normalized embeddings and symmetric image-to-text/text-to-image cross-entropy.'],
      decisionRules: ['Use CLIP-style embeddings for open-ended retrieval or weakly labeled classification baselines; fine-tune or add domain adaptation when terminology and imagery differ.'],
      pitfalls: ['Global alignment does not guarantee object-level grounding or counting accuracy.'],
      systemDesignUse: 'For visual search, specify embedding version, vector metric, hard-negative mining, reranking, prompt evaluation, and index migration.',
      recall: [{ question: 'Why does batch size matter for CLIP?', answer: 'Other batch items supply negatives. More and harder negatives change the contrastive task, though distributed negatives add communication and false-negative risk.' }]
    },
    {
      id: 'dinov2', title: 'DINOv2 and self-supervised visual features', required: true,
      summary: 'DINO-style self-distillation learns visual representations without text labels. DINOv2 emphasizes broad, reusable features for image-level and dense tasks.',
      keyPoints: [
        'A student predicts representations produced by an exponential-moving-average teacher under different views.',
        'Multi-crop and augmentation encourage invariance while patch-level objectives preserve local structure.',
        'The learned features can support linear probing, nearest neighbors, detection, segmentation, or depth with task heads.',
        'Self-supervision avoids label ontology costs but still inherits the collection distribution and preprocessing choices.',
        'General features may need adaptation for specialized medical, industrial, satellite, or low-light imagery.'
      ],
      formulas: ['Teacher update conceptually: θ_teacher ← mθ_teacher +(1-m)θ_student, with a high momentum m.'],
      decisionRules: ['Use a frozen-feature baseline to test transfer quickly; unfreeze progressively only when the downstream gap justifies cost and overfitting risk.'],
      pitfalls: ['“No labels” does not mean no data curation, bias, leakage, or compute cost.'],
      systemDesignUse: 'Use DINOv2 features when text alignment is unnecessary and dense visual structure matters; validate domain transfer and embedding stability.',
      recall: [{ question: 'How is DINO different from CLIP?', answer: 'DINO learns from transformed image views through self-distillation; CLIP aligns paired image and text representations through contrastive learning.' }]
    },
    {
      id: 'sam2', title: 'SAM and SAM2', required: true,
      summary: 'SAM turns point, box, or mask prompts into segmentations. SAM2 extends promptable segmentation to images and video with memory for temporal propagation.',
      keyPoints: [
        'A heavy image encoder can be amortized across multiple prompts; prompt and mask decoders support interactive use.',
        'Ambiguous prompts may yield multiple candidate masks because one click can describe several plausible regions.',
        'SAM is class-agnostic: it segments prompted regions but does not inherently provide semantic labels.',
        'SAM2 uses memory and temporal propagation for video, where occlusion, reappearance, drift, and identity switches matter.',
        'Common production roles are annotation accelerator, interactive tool, proposal generator, or component—not an automatic replacement for a domain model.'
      ],
      formulas: ['Evaluate region overlap plus interaction cost: quality after 1, 3, or N clicks/boxes can matter more than one-shot IoU.'],
      decisionRules: ['Use SAM as a label-assistance baseline when human prompts are available; benchmark a smaller distilled/domain model for automated high-throughput inference.'],
      pitfalls: ['A visually plausible mask can still violate domain boundaries, miss small structures, or merge adjacent objects.'],
      systemDesignUse: 'Include prompt source, encoder caching, latency per interaction, human correction, mask confidence, video memory, and domain validation.',
      recall: [{ question: 'Would you deploy SAM directly for medical diagnosis?', answer: 'Not without domain validation, clinical labeling, failure controls, calibration, workflow review, and often domain adaptation or a specialized model. It is a component, not a safety case.' }]
    },
    {
      id: 'grounding-dino', title: 'Grounding DINO and open-vocabulary detection', required: true,
      summary: 'Grounding DINO conditions object detection on text, enabling phrase grounding and open-vocabulary detection beyond a fixed training label set.',
      keyPoints: [
        'Text and image features interact so box predictions align with supplied phrases.',
        'The vocabulary is open at query time, but capability is bounded by pretraining coverage and prompt semantics.',
        'Box and text thresholds control candidates and phrase association; these require domain calibration.',
        'Grounding DINO can provide boxes to SAM for grounded segmentation.',
        'Open-vocabulary evaluation must test synonyms, attributes, unseen categories, false grounding, and background confusion.'
      ],
      formulas: ['System-level grounded segmentation often composes text → boxes → promptable masks; end-to-end error is compounded across both stages.'],
      decisionRules: ['Use as a flexible discovery/bootstrapping system or long-tail baseline; use a closed-set optimized detector when labels, latency, and reliability are stable.'],
      pitfalls: ['“Open vocabulary” does not guarantee truly novel concept recognition or calibrated confidence.'],
      systemDesignUse: 'Define allowed text ontology, prompt templates, thresholds, caching, false-grounding review, and fallback for unsupported concepts.',
      recall: [{ question: 'Grounding DINO plus SAM: what can fail?', answer: 'The phrase can map to the wrong box, the box can miss the object, SAM can produce the wrong boundary, and confidence from the two stages may not be jointly calibrated.' }]
    },
    {
      id: 'vlm', title: 'Vision-language models', required: true,
      summary: 'A vision-language model connects visual features to a language model for instruction following, captioning, question answering, extraction, and multimodal reasoning.',
      keyPoints: [
        'Architectures may project image tokens into an LLM, use cross-attention, or use unified multimodal tokenization.',
        'Training often combines pretrained components, alignment/projection training, instruction tuning, and preference/safety tuning.',
        'Language fluency can hide weak visual grounding. Evaluate whether claims are supported by pixels and regions.',
        'Resolution, tiling, OCR, long-video sampling, and token budget determine what visual evidence is actually visible.',
        'Structured extraction needs schema validation, confidence/abstention, and deterministic postprocessing rather than free-form trust.'
      ],
      formulas: ['Total context budget includes visual tokens plus text tokens; higher resolution or more frames reduces room for language context and increases attention cost.'],
      decisionRules: ['Use a VLM when the output genuinely requires language-conditioned interpretation; prefer dedicated perception models for narrow, high-throughput, measurable tasks.'],
      pitfalls: ['A correct-sounding answer is not evidence of visual grounding; use region tests, counterfactuals, and source attribution.'],
      systemDesignUse: 'Add prompt/version management, structured output validation, grounding evaluation, safety, cost, latency, caching, and human review.',
      recall: [{ question: 'When would a VLM be overkill?', answer: 'For a stable closed-label task with strict latency, cost, and reliability where a small detector/classifier is easier to evaluate and operate.' }]
    },
    {
      id: 'diffusion', title: 'Diffusion models', required: true,
      summary: 'Diffusion models learn to reverse a gradual noising process. In interviews, know the denoising objective, conditioning, sampling cost, and where generation helps or harms CV systems.',
      keyPoints: [
        'The forward process adds noise over steps; the model learns a reverse denoising direction or related parameterization.',
        'Latent diffusion performs the process in a compressed latent space to reduce compute.',
        'Conditioning can come from text, images, masks, depth, pose, or other controls.',
        'Classifier-free guidance trades diversity for stronger condition alignment by combining conditional and unconditional predictions.',
        'Synthetic data can increase coverage but also import generator bias, artifacts, label errors, and shortcut cues.'
      ],
      formulas: ['A common objective predicts sampled noise: E_{x,ε,t}[||ε-εθ(x_t,t,c)||²].'],
      decisionRules: ['Use generation for controlled augmentation only after validating downstream gains on real holdout data and checking synthetic artifacts by slice.'],
      pitfalls: ['Photorealism does not imply correct labels, physical consistency, or representative frequency.'],
      systemDesignUse: 'Track prompt/generator versions, synthetic-to-real ratio, provenance, filtering, copyright/privacy policy, and real-only evaluation.',
      recall: [{ question: 'Why is diffusion sampling slower than one-pass generation?', answer: 'Generation iteratively applies a denoising network across multiple timesteps, though distillation and faster samplers can reduce steps.' }]
    },
    {
      id: 'compression', title: 'Compression and efficient inference', required: true,
      summary: 'Production optimization is a measured trade among latency, throughput, memory, energy, hardware support, accuracy, and engineering complexity.',
      keyPoints: [
        'Post-training quantization is fast but sensitive to calibration data and outliers; quantization-aware training adapts the model at extra cost.',
        'Distillation transfers teacher behavior or features into a smaller student; the student architecture and data still cap capability.',
        'Structured pruning removes channels, heads, or blocks that hardware can exploit; unstructured sparsity may not yield wall-clock speedups.',
        'Compilation/fusion, optimized kernels, memory layout, and input pipeline can dominate theoretical FLOP reductions.',
        'Cascades use cheap models first and escalate uncertain cases, requiring calibrated routing and fallback capacity.'
      ],
      formulas: ['Approximate model weight memory = parameter_count × bits_per_parameter / 8; activations and runtime workspace can exceed weight memory.'],
      decisionRules: ['Profile the end-to-end bottleneck on target hardware before choosing quantization, pruning, smaller input, or architecture change.'],
      pitfalls: ['A smaller file or lower FLOP count does not guarantee lower p99 latency.'],
      systemDesignUse: 'Report target-device benchmarks, cold start, batch size, precision, operator fallback, accuracy slices, and rollback path.',
      recall: [{ question: 'PTQ versus QAT?', answer: 'PTQ quantizes a trained model using calibration and is cheaper; QAT simulates quantization during training and usually preserves accuracy better for sensitive models.' }]
    }
  ];

  const systemDesignCases = [
    {
      id: 'image-search', order: 1, title: 'Large-scale image search',
      scenario: 'Users submit an image or text and retrieve relevant catalog images from hundreds of millions of items under a tight latency SLO.',
      requirements: ['Query type and relevance definition', 'Catalog size, update rate, regions, and p99 latency', 'Metadata filters, safety, and personalization', 'Offline labels and online success metric'],
      solutionOutline: ['Image/text dual encoders with a versioned embedding contract', 'Offline embedding pipeline and approximate-nearest-neighbor index', 'Metadata filtering, candidate generation, reranking, and caching', 'Recall@K/NDCG plus click or conversion guardrails', 'Index freshness, embedding drift, shadow migration, and rollback'],
      modernCv: 'Compare CLIP-style joint embeddings with DINOv2 image features plus a separate text path. Choose by query modes and domain transfer.',
      pressureTest: 'A new embedding version improves offline Recall@10 but requires rebuilding a two-terabyte index. How do you migrate without mixing incompatible vectors?'
    },
    {
      id: 'visual-similarity', order: 2, title: 'Visual similarity and product recommendations',
      scenario: 'Given one product photo, retrieve substitutes or visually similar products while respecting inventory, price, category, and user intent.',
      requirements: ['What “similar” means: appearance, function, brand, price, or compatibility', 'Cold catalog versus personalized ranking', 'Duplicate handling and inventory freshness', 'Merchant/user fairness and business constraints'],
      solutionOutline: ['Pair/triplet construction from interactions and catalog metadata', 'Visual encoder baseline and hard-negative mining', 'ANN candidate generation followed by multimodal/business reranking', 'Human relevance audits by category and online conversion/diversity tests', 'Feedback-loop controls so popularity does not erase long-tail inventory'],
      modernCv: 'Use CLIP when textual attributes and zero-shot catalog concepts matter; use DINOv2/domain fine-tuning when fine-grained appearance dominates.',
      pressureTest: 'Clicks favor popular products even when not visually similar. How do you prevent training labels from collapsing similarity into popularity?'
    },
    {
      id: 'detection-service', order: 3, title: 'Real-time object-detection service',
      scenario: 'Process camera streams and generate safety alerts with strict end-to-end latency, limited bandwidth, and changing environments.',
      requirements: ['Camera count, FPS, resolution, event definition, and alert latency', 'Edge versus cloud constraints and offline operation', 'False-alert and missed-event cost', 'Privacy, retention, and supported device fleet'],
      solutionOutline: ['Frame sampling and region-of-interest preprocessing', 'Detector, optional tracker, temporal event rules, and deduplication', 'Edge/cloud cascade, batching, quantization, and backpressure', 'mAP slices plus event-level precision/recall and alert latency', 'Camera-health, drift, threshold, rollout, and operator-feedback monitoring'],
      modernCv: 'Benchmark an optimized one-stage detector against a DETR-family checkpoint; use the winner on target hardware, not paper mAP alone.',
      pressureTest: 'Nighttime false alerts spike after a camera firmware update. What telemetry distinguishes sensor change, preprocessing skew, and concept drift?'
    },
    {
      id: 'video-moderation', order: 4, title: 'Video content moderation',
      scenario: 'Screen uploaded and live videos for policy violations while controlling reviewer workload and appeal risk.',
      requirements: ['Policy taxonomy, severity, legal region, and response time', 'Uploaded versus live flow', 'Audio, text, frames, and metadata availability', 'Reviewer capacity, appeals, and protected-group impact'],
      solutionOutline: ['Adaptive frame/clip sampling and multimodal feature extraction', 'Cheap high-recall filters followed by specialist models and temporal aggregation', 'Policy-specific thresholds, abstention, reviewer queue, and escalation', 'Video/event-level recall, precision at reviewer capacity, and appeal overturn rate', 'Policy/version lineage, adversarial monitoring, and delayed labels from review'],
      modernCv: 'Use VLMs for flexible policy reasoning only behind grounding, structured output, and specialist guardrails; do not replace measurable perception stages blindly.',
      pressureTest: 'A policy update takes effect in six hours. Which layers can change through rules/prompts, which require labels, and how do you audit regressions?'
    },
    {
      id: 'segmentation', order: 5, title: 'Defect or medical-image segmentation',
      scenario: 'Segment small, irregular target regions where missing an object and drawing a poor boundary carry different costs.',
      requirements: ['Image modality, acquisition protocol, object scale, and annotation unit', 'Clinical/industrial workflow and human decision', 'False-negative versus boundary-error cost', 'Regulatory, traceability, and review requirements'],
      solutionOutline: ['Annotation guidelines, agreement, adjudication, and grouped split', 'Pretrained encoder plus task head and simple U-Net-style baseline', 'CE/BCE plus Dice or IoU-aware objective with empty-mask policy', 'Dice/IoU, boundary F1, object sensitivity, calibration, and slice review', 'Human-in-the-loop correction, versioned evidence, and rollback'],
      modernCv: 'Evaluate SAM2 as annotation accelerator or promptable component. Use a domain model for automated inference unless validated evidence supports direct use.',
      pressureTest: 'Aggregate Dice improves while small critical defects are missed more often. Which metric and sampling changes expose and correct this?'
    },
    {
      id: 'ocr-documents', order: 6, title: 'OCR and document understanding',
      scenario: 'Convert diverse scanned documents into validated structured fields with confidence and human correction.',
      requirements: ['Languages, scripts, layouts, handwriting, tables, and document length', 'Field schema and downstream tolerance', 'Throughput, latency, and privacy', 'Confidence, abstention, and correction workflow'],
      solutionOutline: ['Document classification, orientation/quality checks, layout regions, OCR, and field extraction', 'Specialist versus VLM route by complexity and cost', 'Schema validation, constrained decoding, cross-field rules, and reviewer queue', 'CER/WER plus field exact match and document-level success', 'Correction feedback, template drift, PII controls, and source traceability'],
      modernCv: 'Use a document VLM where layout-language interaction matters, but keep deterministic schema validation and a measurable OCR baseline.',
      pressureTest: 'A fluent VLM invents a missing invoice number. How do architecture and evaluation prevent unsupported field completion?'
    },
    {
      id: 'active-learning', order: 7, title: 'Active learning and human review',
      scenario: 'Continuously select useful examples for annotation, maintain label quality, and retrain without biasing evaluation.',
      requirements: ['Label cost, annotator skill, turnaround, and budget', 'Pool size, data arrival, and model cadence', 'Rare classes and safety-critical slices', 'Evaluation set independence and audit needs'],
      solutionOutline: ['Candidate pool with provenance, deduplication, and privacy controls', 'Uncertainty plus diversity/coverage acquisition with exploration quota', 'Guidelines, gold tasks, agreement, adjudication, and annotator routing', 'Immutable evaluation set plus newly sampled audit sets', 'Dataset/model version lineage, staged retraining, and acquisition-bias monitoring'],
      modernCv: 'Use DINOv2 or CLIP embeddings for diversity and SAM2 for label acceleration, while validating that foundation-model bias does not narrow coverage.',
      pressureTest: 'Uncertainty sampling keeps selecting corrupt images. How do you separate data-quality routing from informative model uncertainty?'
    },
    {
      id: 'multimodal-rag', order: 8, title: 'Multimodal retrieval and VLM application',
      scenario: 'Answer questions over a private image/document collection with citations and region-level grounding.',
      requirements: ['Supported question types and evidence standard', 'Collection size, update rate, access control, and latency', 'Text/image/document modalities', 'Hallucination, privacy, and user-correction policy'],
      solutionOutline: ['Modality-aware chunking and versioned image/text embeddings', 'Hybrid retrieval, metadata ACL filtering, and reranking', 'VLM generation constrained to retrieved evidence with structured citations', 'Answer correctness, retrieval recall, citation precision, grounding, abstention, and safety', 'Prompt/model/index lineage, adversarial tests, feedback review, and rollback'],
      modernCv: 'Use CLIP-like retrieval for cross-modal candidates and a VLM for synthesis; add OCR/layout routes for documents and never treat generation as retrieval evidence.',
      pressureTest: 'A user can retrieve another tenant’s image through semantically similar search. Where must authorization be enforced?'
    }
  ];

  const behavioralPrompts = [
    { title: 'Highest impact', prompt: 'A project where your technical decision measurably changed a product or operation.' },
    { title: 'Ambiguity', prompt: 'A poorly specified CV problem that you converted into requirements, data, metrics, and milestones.' },
    { title: 'Failure', prompt: 'A model or launch that did not work, how you diagnosed it, and what changed in your process.' },
    { title: 'Conflict', prompt: 'A substantive technical disagreement resolved through evidence and tradeoffs.' },
    { title: 'Production incident', prompt: 'A reliability, latency, drift, or data-quality incident you owned through resolution.' },
    { title: 'Leadership without authority', prompt: 'A cross-team direction you influenced without relying on title.' },
    { title: 'Mentoring', prompt: 'How you raised another engineer’s capability or improved the team’s technical standard.' },
    { title: 'Tradeoff', prompt: 'A deliberate accuracy, cost, latency, scope, or timeline compromise and its measured result.' },
    { title: 'Research to production', prompt: 'How you converted uncertain experiments or model combinations into a maintainable system.' },
    { title: 'Technical direction', prompt: 'A recurring problem where you created a reusable architecture, process, or decision framework.' }
  ];

  window.InterviewPrepData = {
    ...(window.InterviewPrepData || {}),
    foundationModules,
    codingModules,
    modernCvModules,
    systemDesignCases,
    behavioralPrompts
  };
})();
