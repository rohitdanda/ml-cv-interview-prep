const { describe, expect, test } = require('bun:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

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
  'dynamic-programming'
];

describe('coding learning modules', () => {
  test('exports all fourteen concept areas without replacing existing registries', () => {
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
const allowedReferenceTypes = new Set(['module', 'problem-set', 'quiz', 'design-case', 'story', 'mock', 'instruction']);

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

  test('links both Week 9 quizzes while keeping retrieval repair instructional', () => {
    const stages = sessionGuides['w9-wed'].stages;
    const simulation = stages.find((stage) => stage.taskIds.includes('w9-theory-sim-b'));
    const repair = stages.find((stage) => stage.taskIds.includes('w9-theory-fix-b'));

    expect(simulation.reference).toEqual({
      type: 'quiz',
      quizIds: ['foundation-core-1', 'task-loss-metric']
    });
    expect(repair.type).toBe('recall');
    expect(repair.reference).toEqual({ type: 'instruction' });
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
        } else {
          expect(Object.keys(reference)).toEqual(['type']);
        }
      }
    }
  });
});
