const { describe, expect, test } = require('bun:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { calculateStageStatus } = require('../logic.js');

function loadBrowserData() {
  const context = vm.createContext({
    window: { InterviewPrepData: { existingRegistryMarker: true } }
  });

  for (const filename of ['notes.js', 'quizzes.js', 'resources.js', 'curriculum.js']) {
    const path = join(__dirname, '..', filename);
    vm.runInContext(readFileSync(path, 'utf8'), context, { filename: path });
  }

  return context.window.InterviewPrepData;
}

const data = loadBrowserData();
const expectedCodingModuleIds = [
  'python-collections',
  'big-o',
  'hashing',
  'two-pointers',
  'sliding-window',
  'stack-monotonic',
  'binary-search',
  'linked-lists',
  'trees',
  'heaps',
  'graphs-union-find',
  'intervals',
  'backtracking',
  'dynamic-programming',
  'ml-coding',
  'ml-coding-nn',
  'tries',
  'bit-manipulation',
  'math-number-theory',
  'advanced-dp',
  'greedy',
  'strings-kmp',
  'design-lru-lfu',
  'divide-and-conquer'
];

describe('coding learning modules', () => {
  test('exports all twenty-four concept areas without replacing existing registries', () => {
    expect(data.existingRegistryMarker).toBe(true);
    expect(Array.isArray(data.foundationModules)).toBe(true);
    expect(Array.isArray(data.modernCvModules)).toBe(true);
    expect(Array.isArray(data.systemDesignCases)).toBe(true);
    expect(Array.isArray(data.behavioralPrompts)).toBe(true);

    const ids = data.codingModules.map((module) => module.id);
    expect(ids).toEqual(expectedCodingModuleIds);
    expect(new Set(ids).size).toBe(expectedCodingModuleIds.length);
  });

  test('gives every coding module substantive structured teaching content', () => {
    for (const module of data.codingModules) {
      expect(module.title.length).toBeGreaterThan(3);
      expect(module.summary.length).toBeGreaterThan(40);
      expect(module.recognitionCues.length).toBeGreaterThanOrEqual(2);
      expect(module.recognitionCues.every((cue) => cue.length > 10)).toBe(true);
      expect(module.invariant.length).toBeGreaterThan(30);
      expect(module.template.length).toBeGreaterThanOrEqual(2);
      expect(module.template.every((step) => step.length > 10)).toBe(true);
      expect(module.complexity.length).toBeGreaterThanOrEqual(2);
      expect(module.complexity.every((item) => item.length > 10)).toBe(true);
      expect(module.pitfalls.length).toBeGreaterThanOrEqual(2);
      expect(module.pitfalls.every((pitfall) => pitfall.length > 10)).toBe(true);
      expect(module.recall.length).toBeGreaterThanOrEqual(2);
      expect(module.recall.every(({ question, answer }) => question.length > 10 && answer.length > 20)).toBe(true);
      expect(Array.isArray(module.code)).toBe(true);
      expect(module.code.length).toBeGreaterThanOrEqual(2);
      expect(module.code.every(({ label, body }) => label.length > 3 && body.length > 20 && body.includes('\n'))).toBe(true);
      expect(module.code.some(({ body }) => body.includes('def '))).toBe(true);
    }
  });

  test('maps every coding problem pattern to real concept modules', () => {
    const moduleIds = new Set(data.codingModules.map((module) => module.id));
    const map = data.codingPatternConcepts;
    expect(map && typeof map === 'object').toBe(true);
    const patterns = new Set(data.problems.map((problem) => problem.pattern));
    for (const pattern of patterns) {
      expect(Array.isArray(map[pattern])).toBe(true);
      expect(map[pattern].length).toBeGreaterThan(0);
      expect(map[pattern].every((id) => moduleIds.has(id))).toBe(true);
    }
    for (const key of Object.keys(map)) {
      expect(patterns.has(key)).toBe(true);
    }
  });
});

describe('Phase 1C study content', () => {
  const codingById = new Map(data.codingModules.map((module) => [module.id, module]));
  const foundationById = new Map(data.foundationModules.map((module) => [module.id, module]));
  const modernById = new Map(data.modernCvModules.map((module) => [module.id, module]));

  test('teaches production ML coding with complete worked implementations', () => {
    const module = codingById.get('ml-coding');
    expect(module).toBeDefined();
    expect(module.recognitionCues.length).toBeGreaterThanOrEqual(3);
    expect(module.complexity.join(' ')).toMatch(/O\(/);
    expect(module.pitfalls.length).toBeGreaterThanOrEqual(3);
    expect(module.recall.length).toBeGreaterThanOrEqual(3);

    const labels = module.code.map((example) => example.label.toLowerCase());
    const bodies = module.code.map((example) => example.body).join('\n');
    expect(labels.filter((label) => label.includes('template'))).toHaveLength(2);
    expect(labels.filter((label) => label.includes('worked'))).toHaveLength(2);
    expect(bodies).toContain('binary_cross_entropy_with_logits');
    expect(bodies).toContain('zero_grad');
    expect(bodies).toContain('backward');
    expect(bodies).toContain('optimizer.step');
    expect(bodies).toContain('def box_iou');
    expect(bodies).toContain('def nms');
    expect(`${module.summary} ${module.invariant} ${module.template.join(' ')}`).toMatch(/shape/i);
    const geometryTemplate = module.code.find(({ label }) => label.toLowerCase().includes('iou'))?.body || '';
    const nmsStart = geometryTemplate.indexOf('def nms');
    expect(nmsStart).toBeGreaterThanOrEqual(0);
    const boxIouBody = geometryTemplate.slice(0, nmsStart);
    const nmsBody = geometryTemplate.slice(nmsStart);
    const expectInvertedBoxValidationBeforeCast = (body, coordinateComparisons) => {
      const validationIndex = body.indexOf('if torch.any(');
      const geometryCastIndex = body.search(/\.to\([^\n]*dtype=geometry_dtype/);
      expect(validationIndex).toBeGreaterThanOrEqual(0);
      expect(geometryCastIndex).toBeGreaterThan(validationIndex);
      const preCastBody = body.slice(0, geometryCastIndex);
      for (const comparison of coordinateComparisons) expect(preCastBody).toContain(comparison);
      expect(preCastBody).toContain('xyxy coordinates must satisfy x2 >= x1 and y2 >= y1');
    };

    expect(`${module.template.join(' ')} ${module.pitfalls.join(' ')}`).toMatch(/geometry in float32 unless either input is float64/i);
    expect(boxIouBody).toMatch(/geometry_dtype\s*=\s*torch\.float64\s+if\s+(?:box\.dtype\s*==\s*torch\.float64\s+or\s+boxes\.dtype\s*==\s*torch\.float64|boxes\.dtype\s*==\s*torch\.float64\s+or\s+box\.dtype\s*==\s*torch\.float64)\s+else\s+torch\.float32/);
    expect(nmsBody).toMatch(/geometry_dtype\s*=\s*torch\.float64\s+if\s+boxes\.dtype\s*==\s*torch\.float64\s+else\s+torch\.float32/);
    expectInvertedBoxValidationBeforeCast(boxIouBody, ['box[2:] < box[:2]', 'boxes[:, 2:] < boxes[:, :2]']);
    expectInvertedBoxValidationBeforeCast(nmsBody, ['boxes[:, 2:] < boxes[:, :2]']);
    expect(boxIouBody).toMatch(/torch\.where\(\s*union\s*>\s*0\s*,\s*intersection\s*\/\s*union\s*,\s*0(?:\.0)?\s*\)/);
    expect(nmsBody).toContain('scores = scores.to(device=boxes.device)');
  });

  test('adds classical ML plus the prerequisite CV foundation sequence', () => {
    const classical = foundationById.get('classical-ml');
    expect(classical?.required).toBe(true);
    expect(`${classical.summary} ${classical.keyPoints.join(' ')}`).toMatch(/linear|logistic/i);
    expect(classical.keyPoints.join(' ')).toMatch(/tree|forest|boost/i);
    expect(classical.keyPoints.join(' ')).toMatch(/SVM|nearest|kNN/i);
    expect(classical.keyPoints.join(' ')).toMatch(/cluster/i);
    expect(classical.decisionRules.length).toBeGreaterThanOrEqual(3);
    expect(classical.pitfalls.length).toBeGreaterThanOrEqual(3);
    expect(classical.recall.length).toBeGreaterThanOrEqual(3);

    for (const id of ['cnn-foundations', 'detection-segmentation-foundations', 'video-tracking']) {
      const module = modernById.get(id);
      expect(module?.required).toBe(true);
      expect(module.summary.length).toBeGreaterThan(80);
      expect(module.keyPoints.length).toBeGreaterThanOrEqual(5);
      expect(module.formulas.length).toBeGreaterThanOrEqual(2);
      expect(module.decisionRules.length).toBeGreaterThanOrEqual(3);
      expect(module.pitfalls.length).toBeGreaterThanOrEqual(3);
      expect(module.systemDesignUse.length).toBeGreaterThan(60);
      expect(module.recall.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('locks the complete Tier-2 foundation, modern-CV, and from-scratch coding contract', () => {
    const tier2FoundationIds = [
      'dl-architectures',
      'sequence-attention',
      'training-stability',
      'mlops-scale',
      'classical-ml-advanced',
      'probability-experimentation'
    ];
    const tier2ModernIds = [
      'classical-cv-filtering',
      'local-features-matching',
      'geometric-vision',
      'depth-and-stereo',
      'point-clouds-3d',
      'neural-3d',
      'self-supervised-vision',
      'generative-vision',
      'video-motion',
      'multimodal-vision',
      'efficient-vision-transformers'
    ];

    expect(data.foundationModules.map(({ id }) => id).filter((id) => tier2FoundationIds.includes(id)))
      .toEqual(tier2FoundationIds);
    expect(data.modernCvModules.map(({ id }) => id).filter((id) => tier2ModernIds.includes(id)))
      .toEqual(tier2ModernIds);

    for (const id of tier2ModernIds) {
      const module = modernById.get(id);
      expect(module?.required).toBe(true);
      expect(module.summary.length).toBeGreaterThan(80);
      expect(module.keyPoints.length).toBeGreaterThanOrEqual(5);
      expect(module.formulas.length).toBeGreaterThanOrEqual(2);
      expect(module.decisionRules.length).toBeGreaterThanOrEqual(3);
      expect(module.pitfalls.length).toBeGreaterThanOrEqual(3);
      expect(module.systemDesignUse.length).toBeGreaterThan(60);
      expect(module.recall.length).toBeGreaterThanOrEqual(3);
    }

    for (const id of tier2FoundationIds) {
      const module = foundationById.get(id);
      expect(module?.required).toBe(true);
      expect(module.summary.length).toBeGreaterThan(80);
      expect(module.keyPoints.length).toBeGreaterThanOrEqual(5);
      expect(module.formulas.length).toBeGreaterThanOrEqual(2);
      expect(module.decisionRules.length).toBeGreaterThanOrEqual(3);
      expect(module.pitfalls.length).toBeGreaterThanOrEqual(3);
      expect(module.systemDesignUse.length).toBeGreaterThan(60);
      expect(module.recall.length).toBeGreaterThanOrEqual(3);
    }

    const dlText = JSON.stringify(foundationById.get('dl-architectures'));
    expect(dlText).toMatch(/MLP/);
    expect(dlText).toMatch(/AlexNet/);
    expect(dlText).toMatch(/VGG/);
    expect(dlText).toMatch(/Inception/);
    expect(dlText).toMatch(/ResNet/);
    expect(dlText).toMatch(/DenseNet/);
    expect(dlText).toMatch(/EfficientNet/);
    expect(dlText).toMatch(/MobileNet/);
    expect(dlText).toMatch(/1×1/);
    expect(dlText).toMatch(/pooling/i);
    expect(dlText).toMatch(/receptive field/i);

    const sequenceText = JSON.stringify(foundationById.get('sequence-attention'));
    expect(sequenceText).toMatch(/RNN|recurrent/i);
    expect(sequenceText).toMatch(/LSTM/);
    expect(sequenceText).toMatch(/GRU/);
    expect(sequenceText).toMatch(/self-attention|multi-head|scaled attention/i);
    expect(sequenceText).toMatch(/positional|causal|KV-cache/i);

    const stabilityText = JSON.stringify(foundationById.get('training-stability'));
    expect(stabilityText).toMatch(/initialization|Xavier|He/i);
    expect(stabilityText).toMatch(/BatchNorm|LayerNorm|GroupNorm/);
    expect(stabilityText).toMatch(/dropout|activation/i);
    expect(stabilityText).toMatch(/mixed precision|loss scaling/i);
    expect(stabilityText).toMatch(/accumulation|clipping/i);

    const mlopsText = JSON.stringify(foundationById.get('mlops-scale'));
    for (const topic of [/DDP/, /FSDP/, /ZeRO/, /experiment tracking/i, /registry/i, /CI|continuous delivery/i, /Triton/, /TorchServe/, /vLLM/, /observability|drift/i]) {
      expect(mlopsText).toMatch(topic);
    }

    const classicalText = JSON.stringify(foundationById.get('classical-ml-advanced'));
    for (const topic of [/tree/i, /random forest/i, /XGBoost/i, /Gaussian mixture|GMM/i, /Naive Bayes/i, /DBSCAN/i, /t-SNE/i, /UMAP/i, /stacking/i]) {
      expect(classicalText).toMatch(topic);
    }

    const probabilityText = JSON.stringify(foundationById.get('probability-experimentation'));
    for (const topic of [/Bernoulli/, /Binomial/, /Poisson/, /Exponential/, /Gaussian/, /law of large numbers|LLN/i, /central limit|CLT/i, /t-test/i, /Chi-square/i, /minimum detectable effect|MDE/i, /sample-ratio mismatch|SRM/i, /sequential/i, /Monte Carlo/i, /MCMC/i, /Markov/i, /Simpson/i]) {
      expect(probabilityText).toMatch(topic);
    }

    const detectionText = JSON.stringify(modernById.get('detection-segmentation-foundations'));
    for (const topic of [/R-CNN/, /Fast R-CNN/, /Faster R-CNN/, /RPN/, /RoIAlign/, /SSD/, /RetinaNet/, /FCOS/, /CenterNet/, /YOLO/, /FCN/, /U-Net/, /DeepLab/, /ASPP/, /Mask R-CNN/, /panoptic/i]) {
      expect(detectionText).toMatch(topic);
    }

    const classicalCvText = JSON.stringify(modernById.get('classical-cv-filtering'));
    for (const topic of [/convolution/i, /Gaussian smoothing/i, /Sobel/i, /Canny/i, /Harris/i, /morphology/i, /Gaussian pyramid/i, /Laplacian pyramid/i, /HSV/, /YCbCr/, /Lab/]) {
      expect(classicalCvText).toMatch(topic);
    }

    const localFeaturesText = JSON.stringify(modernById.get('local-features-matching'));
    for (const topic of [/SIFT/, /ORB/, /descriptor/i, /Hamming distance/i, /ratio test/i, /RANSAC/, /geometric verification/i]) {
      expect(localFeaturesText).toMatch(topic);
    }

    const geometryText = JSON.stringify(modernById.get('geometric-vision'));
    for (const topic of [/pinhole/i, /intrinsics/i, /extrinsics/i, /calibration/i, /homography/i, /epipolar geometry/i, /fundamental matrix/i, /essential matrix/i, /stereo rectification/i, /triangulation/i]) {
      expect(geometryText).toMatch(topic);
    }

    const depthText = JSON.stringify(modernById.get('depth-and-stereo'));
    for (const topic of [/monocular/i, /calibrated stereo/i, /cost volume/i, /self-supervised/i, /multi-view stereo/i, /uncertainty/i, /AbsRel/]) {
      expect(depthText).toMatch(topic);
    }

    const pointCloudText = JSON.stringify(modernById.get('point-clouds-3d'));
    for (const topic of [/PointNet/, /PointNet\+\+/, /voxelization/i, /sparse convolution/i, /pillars/i, /3D detectors/i, /BEV/, /sensor fusion/i]) {
      expect(pointCloudText).toMatch(topic);
    }

    const neural3dText = JSON.stringify(modernById.get('neural-3d'));
    for (const topic of [/Structure from Motion/i, /SLAM/, /bundle adjustment/i, /loop closure/i, /NeRF/, /3D Gaussian Splatting/i, /pose-graph/i]) {
      expect(neural3dText).toMatch(topic);
    }

    const modernText = new Map(tier2ModernIds.map((id) => [id, JSON.stringify(modernById.get(id))]));
    for (const topic of [/SimCLR/, /MoCo/, /BYOL/, /MAE/]) expect(modernText.get('self-supervised-vision')).toMatch(topic);
    for (const topic of [/GAN/, /VAE/, /diffusion/i, /DDIM/, /ControlNet/, /super-resolution/i, /inpainting/i, /video generation/i]) expect(modernText.get('generative-vision')).toMatch(topic);
    for (const topic of [/RAFT/, /I3D/, /SlowFast/, /optical flow/i]) expect(modernText.get('video-motion')).toMatch(topic);
    for (const topic of [/BLIP-2/, /Q-Former/, /Flamingo/, /OWL-ViT/, /caption/i, /VQA/]) expect(modernText.get('multimodal-vision')).toMatch(topic);
    const efficientVitText = modernText.get('efficient-vision-transformers');
    expect(efficientVitText).toMatch(/Swin/);
    expect(efficientVitText).toMatch(/shifted-window|shifts window/i);
    expect(efficientVitText).toMatch(/hierarchical/i);
    expect(efficientVitText).toMatch(/patch merging/i);
    expect(efficientVitText).toMatch(/linear-attention|linear attention/i);
    expect(efficientVitText).toMatch(/token pruning/i);

    const scratch = JSON.stringify(codingById.get('ml-coding-nn'));
    for (const topic of [/multi_head_attention/, /conv2d_nchw/, /logsumexp/, /cross_entropy_logits/, /focal_loss_logits/, /info_nce/, /triplet_margin_loss/, /class Value/, /sgd_step/, /adam_step/, /train_one_epoch/, /mean_average_precision/, /linear_regression_gd/, /logistic_regression_gd/, /kmeans/, /def pca/, /knn_predict/]) {
      expect(scratch).toMatch(topic);
    }

    const dsaContracts = new Map([
      ['tries', [/class Trie/, /starts_with/, /find_words/]],
      ['bit-manipulation', [/single_number/, /popcount/, /reverse_bits/]],
      ['math-number-theory', [/def gcd/, /primes_through/, /modular_power/]],
      ['advanced-dp', [/knapsack_01/, /lis_length/, /lcs_length/]],
      ['greedy', [/maximum_nonoverlapping/, /can_jump/, /exchange/]],
      ['strings-kmp', [/prefix_function/, /kmp_search/]],
      ['design-lru-lfu', [/LRUCache/, /LFUCache/]],
      ['divide-and-conquer', [/merge_sort/, /kth_smallest/, /quickselect/]]
    ]);
    for (const [id, contracts] of dsaContracts) {
      const moduleText = JSON.stringify(codingById.get(id));
      for (const contract of contracts) expect(moduleText).toMatch(contract);
    }

    const tier2ResourceIds = [
      'pytorch-distributed-training',
      'deepspeed-zero',
      'mlflow-tracking-registry',
      'google-mlops-cicd',
      'triton-inference-server',
      'torchserve',
      'vllm-serving',
      'evidently-monitoring'
    ];
    const tier2Resources = data.resources.filter(({ id }) => tier2ResourceIds.includes(id));
    expect(tier2Resources.map(({ id }) => id)).toEqual(tier2ResourceIds);
    expect(tier2Resources.every((resource) =>
      Object.keys(resource).sort().join(',') === 'access,assignment,id,provider,tags,title,url,use' &&
      resource.tags.length > 0 && resource.use.length > 40 && resource.assignment.length > 40
    )).toBe(true);
    const resourceText = JSON.stringify(tier2Resources);
    for (const topic of [/DDP/, /FSDP/, /ZeRO/, /Tracking/, /Model Registry/, /continuous delivery/i, /Triton/, /TorchServe/, /vLLM/, /monitoring|drift/i]) {
      expect(resourceText).toMatch(topic);
    }
  });

  test('gives every modern-CV module substantive architecture and production recall', () => {
    for (const module of data.modernCvModules) {
      expect(module.recall.length).toBeGreaterThanOrEqual(3);
      expect(module.recall.every(({ question, answer }) => question.length > 15 && answer.length > 30)).toBe(true);
      expect(module.recall.some(({ question }) => /architect|mechan|attention|encoder|decoder|objective|convolution|tracking/i.test(question))).toBe(true);
      expect(module.recall.some(({ question }) => /production|evaluate|metric|latency|failure|trade.?off|monitor/i.test(question))).toBe(true);
    }
  });

  test('adds pressure answers, graph interview code, prefix-suffix teaching, and mock packets', () => {
    expect(data.systemDesignCases).toHaveLength(13);
    expect(data.systemDesignCases.map(({ id }) => id)).toEqual([
      'image-search',
      'visual-similarity',
      'detection-service',
      'video-moderation',
      'segmentation',
      'ocr-documents',
      'active-learning',
      'multimodal-rag',
      'ranking-feed',
      'ads-ctr',
      'fraud-anomaly',
      'visual-search-ltr',
      'feature-store-pipeline'
    ]);
    for (const item of data.systemDesignCases) {
      expect(Object.keys(item).sort()).toEqual([
        'id',
        'modernCv',
        'order',
        'pressureTest',
        'pressureTestAnswer',
        'requirements',
        'scenario',
        'solutionOutline',
        'title'
      ]);
      expect(item.pressureTestAnswer.length).toBeGreaterThan(100);
      const answer = String(item.pressureTestAnswer);
      expect(answer).toContain('Decision:');
      expect(/alternative|instead|versus|rather/i.test(answer)).toBe(true);
      expect(/fail|risk/i.test(answer)).toBe(true);
      expect(/verify|measure|test|monitor/i.test(answer)).toBe(true);
    }

    const graph = codingById.get('graphs-union-find');
    const graphText = JSON.stringify(graph);
    expect(graphText).toMatch(/topological|Kahn/i);
    expect(graphText).toMatch(/directed/i);
    expect(graph.code.some(({ body }) => body.includes('def can_finish') && body.includes('indegree') && body.includes('deque'))).toBe(true);

    const hashing = codingById.get('hashing');
    expect(`${hashing.title} ${JSON.stringify(hashing)}`).toMatch(/prefix.*suffix|suffix.*prefix/i);
    expect(JSON.stringify(hashing)).toMatch(/Product Except Self/i);

    expect(data.mockPackets.map((packet) => packet.id)).toEqual([
      'coding', 'ml-cv-theory', 'cv-system-design', 'behavioral'
    ]);
    for (const packet of data.mockPackets) {
      expect(packet.title.length).toBeGreaterThan(8);
      expect(packet.durationMinutes).toBeGreaterThan(0);
      expect(packet.interviewerScript.length).toBeGreaterThanOrEqual(3);
      expect(packet.interviewerScript.every(({ minute, prompt }) => Number.isFinite(minute) && prompt.length > 15)).toBe(true);
      expect(packet.questions.length).toBeGreaterThanOrEqual(3);
      expect(packet.followUps.length).toBeGreaterThanOrEqual(2);
      expect(packet.rubric.length).toBeGreaterThanOrEqual(3);
      expect(packet.rubric.every(({ dimension, strongSignal, weakSignal }) =>
        dimension.length > 2 && strongSignal.length > 20 && weakSignal.length > 20
      )).toBe(true);
    }
  });
});

describe('quiz and behavioral content contracts', () => {
  test('exports unique quizzes with valid answers and the required bank sizes', () => {
    const quizIds = data.quizzes.map((quiz) => quiz.id);
    expect(new Set(quizIds).size).toBe(quizIds.length);

    const quizById = new Map(data.quizzes.map((quiz) => [quiz.id, quiz]));
    expect(quizById.get('linear-algebra-basics')?.questions).toHaveLength(8);
    expect(quizById.get('statistics-inference')?.questions).toHaveLength(8);
    expect(quizById.get('rapid-fire-readiness')?.kind).toBe('rapid-fire');
    expect(quizById.get('rapid-fire-readiness')?.questions.length).toBeGreaterThanOrEqual(20);
    expect(quizById.get('modern-cv-judgment')?.questions.length).toBeGreaterThan(0);

    for (const quiz of data.quizzes) {
      expect(typeof quiz.id).toBe('string');
      expect(quiz.id.length).toBeGreaterThan(3);
      expect(typeof quiz.title).toBe('string');
      expect(quiz.title.length).toBeGreaterThan(8);
      expect(Array.isArray(quiz.questions)).toBe(true);
      expect(quiz.questions.length).toBeGreaterThan(0);

      for (const question of quiz.questions) {
        expect(typeof question.prompt).toBe('string');
        expect(question.prompt.length).toBeGreaterThan(15);
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.options.every((option) => typeof option === 'string' && option.length > 0)).toBe(true);
        expect(Number.isInteger(question.answerIndex)).toBe(true);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(typeof question.explanation).toBe('string');
        expect(question.explanation.length).toBeGreaterThan(25);
      }
    }
  });

  test('enriches all behavioral prompts under stable IDs and one shared schema', () => {
    const expectedIds = [
      'highest-impact',
      'ambiguity',
      'failure',
      'conflict',
      'production-incident',
      'leadership-without-authority',
      'mentoring',
      'tradeoff',
      'research-to-production',
      'technical-direction'
    ];
    const expectedDimensions = [
      'Scope and complexity',
      'Ownership and judgment',
      'Evidence and impact',
      'Reflection and communication'
    ];

    expect(data.behavioralPrompts.map((prompt) => prompt.id)).toEqual(expectedIds);
    expect(new Set(data.behavioralPrompts.map((prompt) => prompt.id)).size).toBe(expectedIds.length);

    for (const prompt of data.behavioralPrompts) {
      expect(Object.keys(prompt).sort()).toEqual([
        'followUps',
        'id',
        'modelOutline',
        'prompt',
        'rubric',
        'seniorSignals',
        'title'
      ]);
      expect(prompt.title.length).toBeGreaterThan(3);
      expect(prompt.prompt.length).toBeGreaterThan(20);
      expect(prompt.followUps.length).toBeGreaterThanOrEqual(2);
      expect(prompt.followUps.every((item) => typeof item === 'string' && item.length > 15)).toBe(true);
      expect(prompt.seniorSignals.length).toBeGreaterThanOrEqual(3);
      expect(prompt.seniorSignals.every((item) => typeof item === 'string' && item.length > 20)).toBe(true);
      expect(prompt.modelOutline.length).toBeGreaterThanOrEqual(4);
      expect(prompt.modelOutline.every((item) => typeof item === 'string' && item.length > 15)).toBe(true);
      expect(prompt.rubric.map((item) => item.dimension)).toEqual(expectedDimensions);
      expect(prompt.rubric.every((item) =>
        Object.keys(item).sort().join(',') === 'dimension,strongSignal' &&
        typeof item.strongSignal === 'string' &&
        item.strongSignal.length > 20
      )).toBe(true);
    }
  });
});

const sessions = data.weeks.flatMap((week) => week.sessions);
const sessionGuides = data.sessionGuides || {};
const allowedStageTypes = new Set(['learn', 'recall', 'practice', 'verify', 'reflect']);
const allowedReferenceTypes = new Set(['module', 'problem-set', 'quiz', 'design-case', 'story', 'mock', 'remediation', 'instruction']);

function stageForTask(taskId) {
  for (const guide of Object.values(sessionGuides)) {
    const stage = guide.stages.find((candidate) => candidate.taskIds.includes(taskId));
    if (stage) return stage;
  }
  throw new Error(`Missing stage for task: ${taskId}`);
}

function requirementsForTask(taskId) {
  return stageForTask(taskId).reference.requirements;
}

describe('session guide graph', () => {
  test('exports exactly one non-empty guide for every scheduled session', () => {
    const sessionIds = sessions.map((session) => session.id).sort();
    const guideKeys = Object.keys(sessionGuides).sort();
    const guideSessionIds = Object.values(sessionGuides).map((guide) => guide.sessionId);

    expect(sessions).toHaveLength(60);
    expect(guideKeys).toEqual(sessionIds);
    expect(guideSessionIds).toHaveLength(60);
    expect(new Set(guideSessionIds).size).toBe(60);

    for (const session of sessions) {
      const guide = sessionGuides[session.id];
      expect(guide.sessionId).toBe(session.id);
      expect(Array.isArray(guide.stages)).toBe(true);
      expect(guide.stages.length).toBeGreaterThan(0);
    }
  });

  test('uses stable unique stage IDs and only allowed stage and reference types', () => {
    const allStageIds = [];

    for (const guide of Object.values(sessionGuides)) {
      const stageIds = guide.stages.map((stage) => stage.id);
      expect(new Set(stageIds).size).toBe(stageIds.length);
      allStageIds.push(...stageIds);

      for (const stage of guide.stages) {
        expect(typeof stage.id).toBe('string');
        expect(stage.id.length).toBeGreaterThan(3);
        expect(typeof stage.title).toBe('string');
        expect(stage.title.length).toBeGreaterThan(3);
        expect(allowedStageTypes.has(stage.type)).toBe(true);
        expect(typeof stage.instructions).toBe('string');
        expect(stage.instructions.length).toBeGreaterThan(15);
        expect(stage.reference && typeof stage.reference === 'object').toBe(true);
        expect(allowedReferenceTypes.has(stage.reference.type)).toBe(true);
      }
    }

    expect(new Set(allStageIds).size).toBe(allStageIds.length);
  });

  test('maps every task exactly once to its owning session and exact minute budget', () => {
    const allScheduledTaskIds = sessions.flatMap((session) => session.tasks.map((task) => task.id));
    const allMappedTaskIds = [];

    expect(new Set(allScheduledTaskIds).size).toBe(allScheduledTaskIds.length);

    for (const session of sessions) {
      const guide = sessionGuides[session.id];
      expect(guide).toBeDefined();
      if (!guide) continue;
      const sessionTaskIds = session.tasks.map((task) => task.id);
      const taskMinutes = new Map(session.tasks.map((task) => [task.id, task.minutes]));
      const mappedTaskIds = guide.stages.flatMap((stage) => stage.taskIds);

      expect(mappedTaskIds).toEqual(sessionTaskIds);
      expect(new Set(mappedTaskIds).size).toBe(mappedTaskIds.length);

      for (const stage of guide.stages) {
        expect(Array.isArray(stage.taskIds)).toBe(true);
        expect(stage.taskIds.length).toBeGreaterThan(0);
        expect(Number.isInteger(stage.minutes)).toBe(true);
        expect(stage.minutes).toBeGreaterThan(0);
        expect(stage.taskIds.every((taskId) => taskMinutes.has(taskId))).toBe(true);
        expect(stage.minutes).toBe(stage.taskIds.reduce((sum, taskId) => sum + taskMinutes.get(taskId), 0));
      }

      expect(guide.stages.reduce((sum, stage) => sum + stage.minutes, 0)).toBe(session.duration);
      allMappedTaskIds.push(...mappedTaskIds);
    }

    expect(allMappedTaskIds.slice().sort()).toEqual(allScheduledTaskIds.slice().sort());
    expect(new Set(allMappedTaskIds).size).toBe(allMappedTaskIds.length);
  });

  test('keeps manual and reflection stages explicit about saved evidence', () => {
    const evidenceStages = Object.values(sessionGuides).flatMap((guide) => guide.stages)
      .filter((stage) => stage.type === 'reflect' || stage.reference.type === 'instruction');

    expect(evidenceStages.length).toBeGreaterThan(0);
    expect(evidenceStages.every((stage) => stage.instructions.includes('Save '))).toBe(true);
  });

  test('connects every required learning module to at least one scheduled stage', () => {
    const referencedModuleIds = new Set(Object.values(sessionGuides).flatMap((guide) =>
      guide.stages.flatMap((stage) => stage.reference.moduleIds || [])
    ));
    const requiredModuleIds = [
      ...data.foundationModules.filter((module) => module.required),
      ...data.codingModules,
      ...data.modernCvModules.filter((module) => module.required)
    ].map((module) => module.id);

    expect(requiredModuleIds.filter((id) => !referencedModuleIds.has(id))).toEqual([]);
  });

  test('links both Week 9 quizzes while making retrieval repair evidence-backed', () => {
    const stages = sessionGuides['w9-wed'].stages;
    const simulation = stages.find((stage) => stage.taskIds.includes('w9-theory-sim-b'));
    const repair = stages.find((stage) => stage.taskIds.includes('w9-theory-fix-b'));

    expect(simulation.reference).toEqual({
      type: 'quiz',
      quizIds: ['foundation-core-1', 'task-loss-metric']
    });
    expect(repair.type).toBe('recall');
    expect(repair.reference.type).toBe('remediation');
    expect(repair.reference.target).toMatchObject({ kind: 'quiz', isCalibration: true });
  });

  test('scopes every quiz-backed task to its intended bank', () => {
    const expectedQuizIdsByTask = new Map([
      ['w1-baseline-theory', ['foundation-core-1']],
      ['w1-linear-quiz', ['linear-algebra-basics']],
      ['w1-task-metric-quiz', ['task-loss-metric']],
      ['w2-stats-quiz', ['statistics-inference']],
      ['w3-optimization-quiz', ['rapid-fire-readiness']],
      ['w4-theory-bank', ['rapid-fire-readiness']],
      ['w4-task-metric-repeat', ['task-loss-metric']],
      ['w7-rapid-fire', ['rapid-fire-readiness']],
      ['w8-theory-sim-a', ['rapid-fire-readiness']],
      ['w9-theory-sim-b', ['foundation-core-1', 'task-loss-metric']],
      ['w10-theory-cert', ['rapid-fire-readiness', 'modern-cv-judgment']],
      ['w10-loop-theory', ['modern-cv-judgment']]
    ]);

    const quizStages = Object.values(sessionGuides)
      .flatMap((guide) => guide.stages)
      .filter((stage) => stage.reference.type === 'quiz');
    expect(quizStages).toHaveLength(expectedQuizIdsByTask.size);

    for (const [taskId, quizIds] of expectedQuizIdsByTask) {
      expect(stageForTask(taskId).reference).toEqual({ type: 'quiz', quizIds });
    }
  });

  test('states the exact referenced question count in every quiz-backed task', () => {
    const quizById = new Map(data.quizzes.map((quiz) => [quiz.id, quiz]));
    const taskById = new Map(sessions.flatMap((session) => session.tasks).map((task) => [task.id, task]));
    const quizStages = Object.values(sessionGuides)
      .flatMap((guide) => guide.stages)
      .filter((stage) => stage.reference.type === 'quiz');

    for (const stage of quizStages) {
      const expectedCount = stage.reference.quizIds
        .reduce((sum, quizId) => sum + quizById.get(quizId).questions.length, 0);
      for (const taskId of stage.taskIds) {
        const task = taskById.get(taskId);
        const statedCounts = [...task.detail.matchAll(/\b(\d+)\s+questions?\b/gi)]
          .map((match) => Number(match[1]));
        expect(statedCounts).toEqual([expectedCount]);
      }
    }
  });

  test('encodes isolated story, rehearsal, and mock lifecycle thresholds as reference data', () => {
    expect(requirementsForTask('w2-story-inventory')).toEqual({ inventoryCount: 10 });
    expect(requirementsForTask('w4-story-a')).toEqual({ savedStoryCount: 2 });
    expect(requirementsForTask('w5-story-b')).toEqual({ savedStoryCount: 4 });
    expect(requirementsForTask('w6-story-c')).toEqual({ savedStoryCount: 8 });
    expect(requirementsForTask('w7-story-finish')).toEqual({ completedStoryCount: 8 });

    const expectedRehearsals = [
      ['w1-baseline-intro', { rehearsalCount: 1, rehearsalKind: 'intro', withoutNotes: false }],
      ['w6-story-rehearse', { rehearsalCount: 2, rehearsalKind: 'story', withoutNotes: false }],
      ['w6-design-aloud', {
        rehearsalCount: 1,
        rehearsalKind: 'project-deep-dive',
        withoutNotes: true,
        refIds: ['segmentation']
      }],
      ['w8-story-rehearsal-a', { rehearsalCount: 1, rehearsalKind: 'story', withoutNotes: true }],
      ['w9-story-random', { rehearsalCount: 2, rehearsalKind: 'story', withoutNotes: true }],
      ['w9-intro', { rehearsalCount: 5, rehearsalKind: 'intro', withoutNotes: false }],
      ['w10-story-cert', { rehearsalCount: 3, rehearsalKind: 'story', withoutNotes: true }],
      ['w10-intro-cert', { rehearsalCount: 7, rehearsalKind: 'intro', withoutNotes: false }],
      ['w10-loop-behavior', { rehearsalCount: 8, rehearsalKind: 'full-round', withoutNotes: false }]
    ];
    for (const [taskId, requirements] of expectedRehearsals) {
      expect(requirementsForTask(taskId)).toEqual(requirements);
    }
    expect(stageForTask('w6-design-aloud').reference).toEqual({
      type: 'story',
      requirements: {
        rehearsalCount: 1,
        rehearsalKind: 'project-deep-dive',
        withoutNotes: true,
        refIds: ['segmentation']
      }
    });

    const expectedMocks = [
      ['w6-coding-mock', 'coding', 1, 'attempt'],
      ['w6-mock-debrief', 'coding', 1, 'debrief'],
      ['w8-coding-mock', 'coding', 2, 'attempt'],
      ['w8-coding-debrief', 'coding', 2, 'debrief'],
      ['w9-coding-mock', 'coding', 3, 'attempt'],
      ['w9-coding-debrief', 'coding', 3, 'debrief'],
      ['w8-ml-mock', 'ml-system', 1, 'attempt'],
      ['w8-ml-debrief', 'ml-system', 1, 'debrief'],
      ['w9-ml-mock', 'ml-system', 2, 'attempt'],
      ['w9-ml-debrief', 'ml-system', 2, 'debrief']
    ];
    for (const [taskId, mockType, requiredCount, phase] of expectedMocks) {
      expect(requirementsForTask(taskId)).toEqual({ mockType, requiredCount, phase });
    }
  });

  test('assigns every design-case stage to its intended lifecycle phase', () => {
    const expectedPhaseByStageType = {
      learn: 'requirements',
      practice: 'attempt',
      verify: 'attempt',
      recall: 'debrief',
      reflect: 'debrief'
    };
    const designStages = Object.values(sessionGuides)
      .flatMap((guide) => guide.stages)
      .filter((stage) => stage.reference.type === 'design-case');

    expect(designStages.length).toBeGreaterThan(0);
    for (const stage of designStages) {
      expect(stage.reference.phase).toBe(expectedPhaseByStageType[stage.type]);
    }
  });

  test('orders requirements before timed attempts for multi-stage design sessions', () => {
    const expected = [
      ['w5-thu', 'w5-detection-metrics', 'w5-detection-design'],
      ['w6-thu', 'w6-seg-metrics', 'w6-seg-design'],
      ['w7-wed', 'w7-ocr-eval', 'w7-ocr-design']
    ];

    for (const [sessionId, requirementsTaskId, attemptTaskId] of expected) {
      const taskIds = sessions.find((session) => session.id === sessionId).tasks.map((task) => task.id);
      expect(taskIds.indexOf(requirementsTaskId)).toBeLessThan(taskIds.indexOf(attemptTaskId));
      expect(stageForTask(requirementsTaskId).reference.phase).toBe('requirements');
      expect(stageForTask(attemptTaskId).reference.phase).toBe('attempt');
    }
  });

  test('uses each design case and lifecycle phase at most once', () => {
    const designKeys = Object.values(sessionGuides)
      .flatMap((guide) => guide.stages)
      .filter((stage) => stage.reference.type === 'design-case')
      .map((stage) => `${stage.reference.caseId}:${stage.reference.phase}`);
    const duplicateKeys = designKeys.filter((key, index) => designKeys.indexOf(key) !== index);

    expect(duplicateKeys).toEqual([]);
  });

  test('resolves every typed content and resource reference', () => {
    const moduleIds = new Set([
      ...data.foundationModules,
      ...data.codingModules,
      ...data.modernCvModules
    ].map((module) => module.id));
    const problemIds = new Set(data.problems.map((problem) => problem.id));
    const quizIds = new Set(data.quizzes.map((quiz) => quiz.id));
    const designCaseIds = new Set(data.systemDesignCases.map((item) => item.id));
    const resourceIds = new Set(data.resources.map((resource) => resource.id));

    for (const guide of Object.values(sessionGuides)) {
      for (const stage of guide.stages) {
        const reference = stage.reference;

        if (reference.type === 'module') {
          expect(Object.keys(reference).sort()).toEqual(['moduleIds', 'type']);
          expect(Array.isArray(reference.moduleIds)).toBe(true);
          expect(reference.moduleIds.length).toBeGreaterThan(0);
          expect(new Set(reference.moduleIds).size).toBe(reference.moduleIds.length);
          expect(reference.moduleIds.every((id) => moduleIds.has(id))).toBe(true);
        } else if (reference.type === 'problem-set') {
          expect(Object.keys(reference).sort()).toEqual(['problemIds', 'type']);
          expect(Array.isArray(reference.problemIds)).toBe(true);
          expect(reference.problemIds.length).toBeGreaterThan(0);
          expect(new Set(reference.problemIds).size).toBe(reference.problemIds.length);
          expect(reference.problemIds.every((id) => problemIds.has(id))).toBe(true);
        } else if (reference.type === 'quiz') {
          expect(Object.keys(reference).sort()).toEqual(['quizIds', 'type']);
          expect(Array.isArray(reference.quizIds)).toBe(true);
          expect(reference.quizIds.length).toBeGreaterThan(0);
          expect(new Set(reference.quizIds).size).toBe(reference.quizIds.length);
          expect(reference.quizIds.every((id) => quizIds.has(id))).toBe(true);
        } else if (reference.type === 'design-case') {
          expect(Object.keys(reference).sort()).toEqual(['caseId', 'phase', 'type']);
          expect(typeof reference.caseId).toBe('string');
          expect(designCaseIds.has(reference.caseId)).toBe(true);
          expect(['requirements', 'attempt', 'debrief']).toContain(reference.phase);
        } else if (reference.type === 'story') {
          expect(Object.keys(reference).sort()).toEqual(['requirements', 'type']);
          expect(reference.requirements && typeof reference.requirements === 'object').toBe(true);
          const countFields = ['inventoryCount', 'savedStoryCount', 'completedStoryCount', 'rehearsalCount']
            .filter((field) => Object.hasOwn(reference.requirements, field));
          expect(countFields).toHaveLength(1);
          const countField = countFields[0];
          expect(Number.isInteger(reference.requirements[countField])).toBe(true);
          expect(reference.requirements[countField]).toBeGreaterThan(0);
          if (countField === 'rehearsalCount') {
            const expectedKeys = ['rehearsalCount', 'rehearsalKind', 'withoutNotes'];
            if (Object.hasOwn(reference.requirements, 'refIds')) expectedKeys.push('refIds');
            expect(Object.keys(reference.requirements).sort()).toEqual(expectedKeys.sort());
            expect(['story', 'intro', 'project-deep-dive', 'full-round'])
              .toContain(reference.requirements.rehearsalKind);
            expect(typeof reference.requirements.withoutNotes).toBe('boolean');
            if (Object.hasOwn(reference.requirements, 'refIds')) {
              expect(Array.isArray(reference.requirements.refIds)).toBe(true);
              expect(reference.requirements.refIds.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
              expect(new Set(reference.requirements.refIds).size).toBe(reference.requirements.refIds.length);
            }
          } else {
            expect(Object.keys(reference.requirements)).toEqual([countField]);
          }
        } else if (reference.type === 'mock') {
          expect(Object.keys(reference).sort()).toEqual(['requirements', 'type']);
          expect(Object.keys(reference.requirements).sort()).toEqual(['mockType', 'phase', 'requiredCount']);
          expect(['coding', 'ml-system']).toContain(reference.requirements.mockType);
          expect(['attempt', 'debrief']).toContain(reference.requirements.phase);
          expect(Number.isInteger(reference.requirements.requiredCount)).toBe(true);
          expect(reference.requirements.requiredCount).toBeGreaterThan(0);
        } else if (reference.type === 'instruction' && Object.hasOwn(reference, 'resourceIds')) {
          expect(Object.keys(reference).sort()).toEqual(['resourceIds', 'type']);
          expect(Array.isArray(reference.resourceIds)).toBe(true);
          expect(reference.resourceIds.length).toBeGreaterThan(0);
          expect(new Set(reference.resourceIds).size).toBe(reference.resourceIds.length);
          expect(reference.resourceIds.every((id) => resourceIds.has(id))).toBe(true);
        } else if (reference.type === 'remediation') {
          expect(Object.keys(reference).sort()).toEqual(['target', 'type']);
          expect(reference.target && typeof reference.target === 'object').toBe(true);
          expect(['recall', 'quiz', 'problem', 'design']).toContain(reference.target.kind);
          expect(typeof reference.target.sourceId).toBe('string');
          expect(reference.target.sourceId.length).toBeGreaterThan(0);
        } else {
          expect(Object.keys(reference)).toEqual(['type']);
        }
      }
    }
  });
});

describe('Phase 1C scheduling and remediation graph', () => {
  const stageForTaskIn = (guides, taskId) => {
    for (const guide of Object.values(guides)) {
      const stage = guide.stages.find((candidate) => candidate.taskIds.includes(taskId));
      if (stage) return { guide, stage };
    }
    throw new Error(`Missing stage for task: ${taskId}`);
  };

  test('schedules prerequisite study before transformer material and links the promised practice', () => {
    const moduleStages = Object.values(sessionGuides).flatMap((guide) =>
      guide.stages
        .filter((stage) => stage.reference.type === 'module')
        .map((stage) => ({ guide, stage }))
    );
    const stageWithModule = (moduleId) => moduleStages.find(({ stage }) =>
      stage.reference.moduleIds.includes(moduleId)
    );
    const sessionOrder = new Map(sessions.map((session, index) => [session.id, index]));

    expect(stageWithModule('classical-ml').guide.sessionId).toMatch(/^w3-/);
    expect(sessionOrder.get(stageWithModule('cnn-foundations').guide.sessionId))
      .toBeLessThan(sessionOrder.get(stageForTaskIn(sessionGuides, 'w4-vit').guide.sessionId));
    expect(sessionOrder.get(stageWithModule('detection-segmentation-foundations').guide.sessionId))
      .toBeLessThan(sessionOrder.get(stageForTaskIn(sessionGuides, 'w4-detr').guide.sessionId));

    const mlCoding = stageWithModule('ml-coding');
    expect(mlCoding.guide.sessionId).toMatch(/^w[57]-/);
    expect(mlCoding.stage.type).toBe('practice');
    expect(stageForTaskIn(sessionGuides, 'w5-video-cv').stage.reference).toEqual({
      type: 'module',
      moduleIds: ['video-tracking', 'video-motion']
    });
  });

  test('assigns all 60 unique problems, including every audited orphan, and splits pattern keys', () => {
    const referenced = new Set(Object.values(sessionGuides).flatMap((guide) =>
      guide.stages.flatMap((stage) => stage.reference.type === 'problem-set'
        ? stage.reference.problemIds
        : [])
    ));
    const bankIds = data.problems.map((problem) => problem.id);
    const auditedIds = [
      '3sum',
      'container-with-most-water',
      'permutation-in-string',
      'minimum-window-substring',
      'car-fleet',
      'find-minimum-in-rotated-sorted-array',
      'search-in-rotated-sorted-array',
      'reorder-list',
      'remove-nth-node-from-end-of-list',
      'linked-list-cycle',
      'kth-largest-element-in-an-array',
      'task-scheduler',
      'coin-change'
    ];

    expect(data.problems).toHaveLength(60);
    expect(new Set(bankIds).size).toBe(60);
    expect(bankIds.filter((id) => !referenced.has(id))).toEqual([]);
    expect(auditedIds.every((id) => bankIds.includes(id) && referenced.has(id))).toBe(true);
    expect(data.optionalProblems || []).toEqual([]);

    const patterns = new Set(data.problems.map((problem) => problem.pattern));
    expect(patterns.has('Arrays & hashing')).toBe(false);
    expect(patterns.has('Heap & intervals')).toBe(false);
    expect(patterns.has('Hashing')).toBe(true);
    expect(patterns.has('Arrays: prefix/suffix')).toBe(true);
    expect(patterns.has('Heaps')).toBe(true);
    expect(patterns.has('Intervals')).toBe(true);
    expect(data.codingPatternConcepts.Hashing).toEqual(['hashing']);
    expect(data.codingPatternConcepts['Arrays: prefix/suffix']).toEqual(['hashing']);
    expect(data.codingPatternConcepts.Heaps).toEqual(['heaps']);
    expect(data.codingPatternConcepts.Intervals).toEqual(['intervals']);
    expect(patterns.has('String algorithms')).toBe(true);
    expect(patterns.has('Cache/data-structure design')).toBe(true);
    expect(patterns.has('Math & number theory')).toBe(true);
    expect(patterns.has('Divide and conquer')).toBe(true);
    expect(patterns.has('ML coding primitives')).toBe(true);
    expect(patterns.has('Greedy')).toBe(true);
    expect(patterns.has('Bit manipulation')).toBe(true);
    expect(patterns.has('Tries')).toBe(true);
    expect(patterns.has('Advanced dynamic programming')).toBe(true);
    expect(data.codingPatternConcepts['String algorithms']).toEqual(['strings-kmp', 'sliding-window']);
    expect(data.codingPatternConcepts['Cache/data-structure design']).toEqual(['design-lru-lfu', 'stack-monotonic']);
    expect(data.codingPatternConcepts['Math & number theory']).toEqual(['math-number-theory', 'stack-monotonic']);
    expect(data.codingPatternConcepts['Divide and conquer']).toEqual(['divide-and-conquer', 'heaps']);
    expect(data.codingPatternConcepts['ML coding primitives']).toEqual(['ml-coding-nn', 'heaps']);
    expect(data.codingPatternConcepts.Greedy).toEqual(['greedy', 'intervals']);
    expect(data.codingPatternConcepts['Bit manipulation']).toEqual(['bit-manipulation', 'backtracking']);
    expect(data.codingPatternConcepts.Tries).toEqual(['tries', 'backtracking']);
    expect(data.codingPatternConcepts['Advanced dynamic programming']).toEqual(['advanced-dp', 'dynamic-programming']);
  });

  test('gives every concrete problem set enough honest interview time', () => {
    const problemById = new Map(data.problems.map((problem) => [problem.id, problem]));
    const minimumMinutes = { Easy: 7, Medium: 18, Hard: 30 };
    const expectedLaterSets = {
      'w4-timed-a': ['3sum', 'container-with-most-water', 'permutation-in-string'],
      'w5-timed-a': ['longest-repeating-character-replacement', 'car-fleet', 'find-minimum-in-rotated-sorted-array'],
      'w6-timed-a': ['search-in-rotated-sorted-array', 'reorder-list', 'remove-nth-node-from-end-of-list'],
      'w6-weak-problems': ['kth-smallest-element-in-a-bst', 'lowest-common-ancestor-of-a-binary-search-tree'],
      'w7-timed-a': ['linked-list-cycle', 'kth-largest-element-in-an-array', 'task-scheduler', 'coin-change']
    };

    for (const [taskId, problemIds] of Object.entries(expectedLaterSets)) {
      const { guide, stage } = stageForTaskIn(sessionGuides, taskId);
      expect(stage.reference).toEqual({ type: 'problem-set', problemIds });
      const task = sessions.find((session) => session.id === guide.sessionId)
        .tasks.find((candidate) => candidate.id === taskId);
      for (const problemId of problemIds) {
        expect(task.detail.toLowerCase()).toContain(problemById.get(problemId).title.toLowerCase());
      }
    }

    for (const guide of Object.values(sessionGuides)) {
      for (const stage of guide.stages.filter((candidate) => candidate.reference.type === 'problem-set')) {
        const requiredMinutes = stage.reference.problemIds.reduce((total, problemId) => (
          total + minimumMinutes[problemById.get(problemId).difficulty]
        ), 0);
        expect(stage.minutes).toBeGreaterThanOrEqual(requiredMinutes);
      }
    }
  });

  const emptyRemediationState = () => ({
    completedTasks: {},
    quizAttempts: [],
    problemAttempts: [],
    designAttempts: [],
    studyProgress: { reviews: {}, studied: {}, activeFocus: null },
    remediationAssignments: {}
  });

  test('keeps remediation inactive and requires a post-activation re-attempt', () => {
    expect(typeof data.isRemediationStageActivated).toBe('function');
    if (typeof data.isRemediationStageActivated !== 'function') return;
    const state = emptyRemediationState();
    state.quizAttempts.push({
      quizId: 'rapid-fire-readiness', score: 55, attemptedAt: '2026-09-01T10:00:00.000Z'
    });
    const stageId = 'stage-w8-theory-fix-a';
    const assignedAt = '2026-09-16T10:00:00.000Z';

    expect(data.isRemediationStageActivated(state, stageId)).toBe(false);
    expect(stageForTaskIn(data.buildSessionGuides(state), 'w8-theory-fix-a').stage.reference.target.isCalibration).toBe(true);

    const activated = data.activateRemediationStage(state, stageId, assignedAt);
    expect(data.isRemediationStageActivated(activated, stageId)).toBe(true);
    expect(activated.remediationAssignments[stageId].assignedAt).toBe(assignedAt);

    const stage = stageForTaskIn(data.buildSessionGuides(activated), 'w8-theory-fix-a').stage;
    expect(stage.instructions).toContain(assignedAt);
    const alreadyRepaired = {
      ...activated,
      quizAttempts: [...activated.quizAttempts, {
        quizId: 'rapid-fire-readiness', score: 90, attemptedAt: '2026-09-02T10:00:00.000Z'
      }]
    };
    expect(calculateStageStatus(stage, alreadyRepaired, data).complete).toBe(false);

    const reattempted = {
      ...alreadyRepaired,
      quizAttempts: [...alreadyRepaired.quizAttempts, {
        quizId: 'rapid-fire-readiness', score: 90, attemptedAt: '2026-09-16T10:00:01.000Z'
      }]
    };
    const rebuilt = data.buildSessionGuides(reattempted);
    const stableStage = stageForTaskIn(rebuilt, 'w8-theory-fix-a').stage;
    expect(stableStage.reference.target).toEqual(activated.remediationAssignments[stageId]);
    expect(calculateStageStatus(stableStage, reattempted, data).complete).toBe(true);
  });

  test('replaces persisted remediation targets that no longer resolve', () => {
    const stageId = 'stage-w8-theory-fix-a';
    const state = emptyRemediationState();
    state.remediationAssignments[stageId] = {
      kind: 'quiz',
      sourceId: 'removed-quiz',
      quizId: 'removed-quiz',
      failedAt: null,
      assignedAt: '2026-09-01T10:00:00.000Z',
      isCalibration: true
    };

    expect(data.isRemediationStageActivated(state, stageId)).toBe(false);
    const preview = stageForTaskIn(data.buildSessionGuides(state), 'w8-theory-fix-a').stage.reference.target;
    expect(preview).toMatchObject({ kind: 'quiz', quizId: 'rapid-fire-readiness', isCalibration: true });

    const activated = data.activateRemediationStage(state, stageId, '2026-09-02T10:00:00.000Z');
    expect(data.isRemediationStageActivated(activated, stageId)).toBe(true);
    expect(activated.remediationAssignments[stageId]).toMatchObject({
      kind: 'quiz', quizId: 'rapid-fire-readiness', assignedAt: '2026-09-02T10:00:00.000Z'
    });
  });

  test('activates concrete recall, quiz, problem, and design targets only for the focused stage', () => {
    expect(typeof data.buildSessionGuides).toBe('function');
    expect(typeof data.activateRemediationStage).toBe('function');
    if (typeof data.activateRemediationStage !== 'function') return;
    const at = '2026-09-01T10:00:00.000Z';

    const recallState = emptyRemediationState();
    recallState.studyProgress.reviews['recall:hashing:1'] = {
      kind: 'recall', sourceId: 'hashing', promptIndex: 1,
      lastResult: 'again', lastReviewedAt: at
    };
    const recallActivated = data.activateRemediationStage(recallState, 'stage-w8-coding-recall');
    const recall = stageForTaskIn(data.buildSessionGuides(recallActivated), 'w8-coding-recall').stage;
    expect(recall.reference.target).toMatchObject({
      kind: 'recall', sourceId: 'hashing', promptIndex: 1, failedAt: at, isCalibration: false
    });
    expect(recall.instructions).toMatch(/hashing.*prompt 2.*hard or got-it.*after/i);

    const quizState = emptyRemediationState();
    quizState.quizAttempts.push({ quizId: 'rapid-fire-readiness', score: 65, attemptedAt: at });
    const quizActivated = data.activateRemediationStage(quizState, 'stage-w8-theory-fix-a');
    const quiz = stageForTaskIn(data.buildSessionGuides(quizActivated), 'w8-theory-fix-a').stage;
    expect(quiz.reference.target).toMatchObject({
      kind: 'quiz', sourceId: 'rapid-fire-readiness', quizId: 'rapid-fire-readiness', failedAt: at, isCalibration: false
    });
    expect(quiz.instructions).toMatch(/rapid-fire.*80.*after/i);

    const problemState = emptyRemediationState();
    problemState.problemAttempts.push({ problemId: 'coin-change', usedHint: true, attemptedAt: at });
    const problemActivated = data.activateRemediationStage(problemState, 'stage-w10-gap-work');
    const problem = stageForTaskIn(data.buildSessionGuides(problemActivated), 'w10-gap-work').stage;
    expect(problem.reference.target).toMatchObject({
      kind: 'problem', sourceId: 'coin-change', problemId: 'coin-change', failedAt: at, isCalibration: false
    });
    expect(problem.instructions).toMatch(/coin-change.*independent.*explain.*complexity.*after/i);

    const designState = emptyRemediationState();
    designState.designAttempts.push({
      caseId: 'image-search', phase: 'attempt', durationMinutes: 40,
      scores: { requirements: 4, metrics: 2, serving: 3 }, attemptedAt: at
    });
    const designActivated = data.activateRemediationStage(designState, 'stage-w9-design-fix-b');
    const design = stageForTaskIn(data.buildSessionGuides(designActivated), 'w9-design-fix-b').stage;
    expect(design.reference.target).toMatchObject({
      kind: 'design', sourceId: 'image-search', caseId: 'image-search',
      dimension: 'metrics', failedAt: at, isCalibration: false
    });
    expect(design.instructions).toMatch(/image-search.*metrics.*4.*timed.*after/i);
  });

  test('does not let one early miss preassign or complete later remediation stages', () => {
    if (typeof data.activateRemediationStage !== 'function') return;
    const failedAt = '2026-09-01T10:00:00.000Z';
    const passedAt = '2026-09-02T10:00:01.000Z';
    const failed = emptyRemediationState();
    failed.quizAttempts.push({ quizId: 'rapid-fire-readiness', score: 55, attemptedAt: failedAt });

    const unactivatedGuides = data.buildSessionGuides(failed);
    for (const taskId of [
      'w8-theory-fix-a', 'w8-coding-recall', 'w8-ml-repair', 'w9-design-fix-b',
      'w9-theory-fix-b', 'w9-design-repair', 'w10-gap-work'
    ]) {
      expect(stageForTaskIn(unactivatedGuides, taskId).stage.reference.target.isCalibration).toBe(true);
    }
    expect(failed.remediationAssignments).toEqual({});

    const activated = data.activateRemediationStage(failed, 'stage-w8-theory-fix-a', '2026-09-02T10:00:00.000Z');
    expect(Object.keys(activated.remediationAssignments)).toEqual(['stage-w8-theory-fix-a']);
    const selectedTarget = activated.remediationAssignments['stage-w8-theory-fix-a'];
    expect(selectedTarget).toMatchObject({
      kind: 'quiz', quizId: 'rapid-fire-readiness', failedAt, isCalibration: false
    });

    const repaired = {
      ...activated,
      quizAttempts: [...activated.quizAttempts, {
        quizId: 'rapid-fire-readiness', score: 90, attemptedAt: passedAt
      }]
    };
    const repairedGuides = data.buildSessionGuides(repaired);
    const repairedStage = stageForTaskIn(repairedGuides, 'w8-theory-fix-a').stage;
    const futureStage = stageForTaskIn(repairedGuides, 'w9-theory-fix-b').stage;
    expect(calculateStageStatus(repairedStage, repaired, data).complete).toBe(true);
    expect(futureStage.reference.target.isCalibration).toBe(true);
    expect(calculateStageStatus(futureStage, repaired, data).complete).toBe(false);
  });

  test('locks the miss present at activation and ignores later unrelated misses', () => {
    if (typeof data.activateRemediationStage !== 'function') return;
    const firstAt = '2026-09-01T10:00:00.000Z';
    const laterAt = '2026-09-20T10:00:00.000Z';
    const state = emptyRemediationState();
    state.quizAttempts.push({ quizId: 'rapid-fire-readiness', score: 55, attemptedAt: firstAt });
    const firstActivated = data.activateRemediationStage(state, 'stage-w8-theory-fix-a', '2026-09-02T10:00:00.000Z');
    const firstTarget = firstActivated.remediationAssignments['stage-w8-theory-fix-a'];

    const withLaterMisses = {
      ...firstActivated,
      quizAttempts: [...firstActivated.quizAttempts, {
        quizId: 'task-loss-metric', score: 60, attemptedAt: laterAt
      }],
      problemAttempts: [{ problemId: 'coin-change', usedHint: true, attemptedAt: laterAt }]
    };
    const reactivated = data.activateRemediationStage(withLaterMisses, 'stage-w8-theory-fix-a');
    expect(reactivated.remediationAssignments['stage-w8-theory-fix-a']).toEqual(firstTarget);

    const laterStage = data.activateRemediationStage(reactivated, 'stage-w9-theory-fix-b', '2026-09-21T10:00:00.000Z');
    expect(laterStage.remediationAssignments['stage-w9-theory-fix-b']).toMatchObject({
      kind: 'quiz', quizId: 'task-loss-metric', failedAt: laterAt, isCalibration: false
    });
    expect(laterStage.remediationAssignments['stage-w8-theory-fix-a']).toEqual(firstTarget);
  });

  test('uses fresh calibration guides when reset or import has no assignments', () => {
    if (typeof data.activateRemediationStage !== 'function') return;
    const oldState = emptyRemediationState();
    oldState.quizAttempts.push({
      quizId: 'rapid-fire-readiness', score: 55, attemptedAt: '2026-09-01T10:00:00.000Z'
    });
    const activated = data.activateRemediationStage(oldState, 'stage-w8-theory-fix-a');
    const oldGuides = data.buildSessionGuides(activated);

    const resetOrImported = emptyRemediationState();
    const cleanGuides = data.buildSessionGuides(resetOrImported, oldGuides);
    const cleanStage = stageForTaskIn(cleanGuides, 'w8-theory-fix-a').stage;
    expect(cleanStage.reference.target.isCalibration).toBe(true);
    expect(cleanStage.reference.target.failedAt).toBeNull();
    expect(resetOrImported.remediationAssignments).toEqual({});
  });
});
