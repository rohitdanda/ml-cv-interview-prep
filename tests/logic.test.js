const { describe, expect, test } = require('bun:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const {
  calculatePlanProgress,
  calculateReadiness,
  calculateStageStatus,
  calculateStudyStats,
  createInitialState,
  createReviewKey,
  getCurrentWeek,
  getDueReviews,
  getElapsedMinutes,
  getFirstIncompleteStage,
  getLearningProgress,
  getWeakAreaRecommendation,
  isApplicationUnlocked,
  isTaskComplete,
  markStudied,
  scheduleProblemReview,
  scheduleQuizReviews,
  scheduleRecallReview,
  startTimer,
  stopTimer,
  unmarkStudied,
  validateImportedState
} = require('../logic.js');

describe('createInitialState', () => {
  test('creates a schema-v3 empty progress record', () => {
    expect(createInitialState()).toEqual({
      schemaVersion: 3,
      completedTasks: {},
      problemAttempts: [],
      quizAttempts: [],
      designAttempts: [],
      starStories: [],
      rehearsals: [],
      mocks: [],
      timeEntries: [],
      activeTimer: null,
      sessionReflections: {},
      applications: [],
      readinessOverride: null,
      preferences: { theme: 'system' },
      studyProgress: { activeFocus: null, reviews: {}, studied: {} }
    });
  });
});

describe('study timer', () => {
  test('survives reloads by deriving elapsed time from timestamps', () => {
    const timer = startTimer('coding', '2026-07-27T18:00:00.000Z');
    expect(getElapsedMinutes(timer, '2026-07-27T18:42:30.000Z')).toBe(42.5);
  });

  test('stops into a durable time entry', () => {
    const timer = startTimer('foundations', '2026-07-27T18:00:00.000Z');
    expect(stopTimer(timer, '2026-07-27T19:30:00.000Z')).toEqual({
      category: 'foundations',
      startedAt: '2026-07-27T18:00:00.000Z',
      endedAt: '2026-07-27T19:30:00.000Z',
      minutes: 90
    });
  });

  test('preserves optional guided-stage metadata without changing elapsed time', () => {
    const timer = startTimer('coding', '2026-07-27T18:00:00.000Z', {
      sessionId: 'w1-mon',
      stageId: 'stage-w1-python',
      title: 'Python collections',
      targetMinutes: 45,
      ignored: 'not durable timer metadata'
    });

    expect(getElapsedMinutes(timer, '2026-07-27T18:42:30.000Z')).toBe(42.5);
    expect(stopTimer(timer, '2026-07-27T19:30:00.000Z')).toEqual({
      category: 'coding',
      startedAt: '2026-07-27T18:00:00.000Z',
      endedAt: '2026-07-27T19:30:00.000Z',
      minutes: 90,
      sessionId: 'w1-mon',
      stageId: 'stage-w1-python',
      title: 'Python collections',
      targetMinutes: 45
    });
  });

  test('omits malformed optional timer metadata', () => {
    const timer = startTimer('coding', '2026-07-27T18:00:00.000Z', {
      sessionId: '',
      stageId: 4,
      title: '   ',
      targetMinutes: 0
    });

    expect(timer).toEqual({ category: 'coding', startedAt: '2026-07-27T18:00:00.000Z' });
  });
});

describe('progress import validation', () => {
  test('migrates a complete version-one record without loss or mutation', () => {
    const legacy = makeV1State({
      completedTasks: { 'week-1-baseline': true },
      problemAttempts: [{ problemId: 'two-sum', attemptedAt: '2026-07-27T18:00:00.000Z' }],
      quizAttempts: [{ quizId: 'foundation-core-1', score: 70 }],
      designAttempts: [{ caseId: 'image-search', durationMinutes: 40 }],
      starStories: [{ title: 'Launch' }],
      rehearsals: [{ withoutNotes: true }],
      mocks: [{ type: 'coding' }],
      timeEntries: [{ minutes: 30 }],
      activeTimer: { category: 'coding', startedAt: '2026-07-27T18:00:00.000Z' },
      sessionReflections: { 'w1-mon': 'Kept the invariant explicit.' },
      applications: [{ company: 'Example' }],
      readinessOverride: { reason: 'Recruiter request' },
      preferences: { theme: 'dark' },
      extensionField: { preserved: true }
    });
    const before = structuredClone(legacy);

    const result = validateImportedState(legacy);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      ...legacy,
      schemaVersion: 3,
      studyProgress: { activeFocus: null, reviews: {}, studied: {} }
    });
    expect(legacy).toEqual(before);
    expect(result.value).not.toBe(legacy);
  });

  test('migrates a version-two record to v3 with an empty studied map', () => {
    const state = makeV2State({
      studyProgress: {
        activeFocus: {
          sessionId: 'w1-mon',
          stageId: 'stage-w1-python',
          startedAt: '2026-07-27T18:00:00.000Z'
        },
        reviews: {
          'recall:linear-algebra:0': makeReview({
            kind: 'recall',
            sourceId: 'linear-algebra',
            promptIndex: 0,
            lastResult: 'hard'
          }),
          'quiz:foundation-core-1:2': makeReview({
            kind: 'quiz-question',
            sourceId: 'foundation-core-1',
            promptIndex: 2,
            lastResult: 'again'
          }),
          'problem:two-sum': makeReview({
            kind: 'problem',
            sourceId: 'two-sum',
            promptIndex: null,
            lastResult: 'got-it'
          })
        }
      },
      extensionField: ['still', 'preserved']
    });
    const before = structuredClone(state);

    expect(validateImportedState(state)).toEqual({
      ok: true,
      value: {
        ...state,
        schemaVersion: 3,
        studyProgress: { ...state.studyProgress, studied: {} }
      }
    });
    expect(state).toEqual(before);
  });

  test('round-trips a valid version-three record without loss or mutation', () => {
    const state = makeV3State({
      studyProgress: {
        activeFocus: null,
        reviews: {},
        studied: { 'linear-algebra': '2026-07-27T18:00:00.000Z' }
      }
    });
    const before = structuredClone(state);

    expect(validateImportedState(state)).toEqual({ ok: true, value: state });
    expect(state).toEqual(before);
  });

  test('rejects unknown versions and malformed required legacy fields', () => {
    expect(validateImportedState({ ...makeV1State(), schemaVersion: 4 })).toEqual({
      ok: false,
      error: 'This backup uses an unsupported data version.'
    });
    expect(validateImportedState({ ...makeV1State(), mocks: {} })).toEqual({
      ok: false,
      error: 'The backup is missing required progress fields.'
    });
    expect(validateImportedState({ ...makeV1State(), completedTasks: [] }).ok).toBe(false);
    const missingTimer = makeV1State();
    delete missingTimer.activeTimer;
    expect(validateImportedState(missingTimer).ok).toBe(false);
  });

  test('strictly rejects malformed version-three studied data', () => {
    const studiedAt = '2026-07-27T18:00:00.000Z';
    const invalidCandidates = [
      makeV3State({ studyProgress: { activeFocus: null, reviews: {}, studied: [] } }),
      makeV3State({ studyProgress: { activeFocus: null, reviews: {}, studied: { 'linear-algebra': 'not-a-date' } } }),
      makeV3State({ studyProgress: { activeFocus: null, reviews: {}, studied: { '': studiedAt } } }),
      makeV3State({ studyProgress: { activeFocus: null, reviews: {}, studied: {}, extra: true } })
    ];

    for (const candidate of invalidCandidates) {
      const before = structuredClone(candidate);
      const result = validateImportedState(candidate);
      expect(result).toEqual({ ok: false, error: 'The backup contains malformed learning progress.' });
      expect(candidate).toEqual(before);
    }
  });

  test('strictly rejects malformed v2 focus and review data', () => {
    const validReview = makeReview({
      kind: 'recall',
      sourceId: 'linear-algebra',
      promptIndex: 0,
      lastResult: 'got-it'
    });
    const withStudyProgress = (studyProgress) => makeV2State({ studyProgress });
    const invalidCandidates = [
      withStudyProgress([]),
      withStudyProgress({ activeFocus: null, reviews: [] }),
      withStudyProgress({ activeFocus: [], reviews: {} }),
      withStudyProgress({ activeFocus: { sessionId: '', stageId: 'stage-a', startedAt: '2026-07-27T18:00:00.000Z' }, reviews: {} }),
      withStudyProgress({ activeFocus: { sessionId: 'w1-mon', stageId: 'stage-a', startedAt: 'not-a-date' }, reviews: {} }),
      withStudyProgress({ activeFocus: { sessionId: 'w1-mon', stageId: 'stage-a', startedAt: '2026-07-27T18:00:00.000Z', extra: true }, reviews: {} }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra': validReview } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, kind: 'quiz-question' } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, sourceId: 'probability' } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, promptIndex: null } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, lastResult: 'easy' } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, intervalDays: 0 } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, intervalDays: Infinity } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, lastReviewedAt: 'yesterday' } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'recall:linear-algebra:0': { ...validReview, extra: true } } }),
      withStudyProgress({ activeFocus: null, reviews: { 'problem:two-sum': { ...validReview, kind: 'problem', sourceId: 'two-sum' } } })
    ];

    for (const candidate of invalidCandidates) {
      const before = structuredClone(candidate);
      const result = validateImportedState(candidate);
      expect(result.ok).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result).not.toHaveProperty('value');
      expect(candidate).toEqual(before);
    }
  });
});

function makeV1State(overrides = {}) {
  return {
    schemaVersion: 1,
    completedTasks: {},
    problemAttempts: [],
    quizAttempts: [],
    designAttempts: [],
    starStories: [],
    rehearsals: [],
    mocks: [],
    timeEntries: [],
    activeTimer: null,
    sessionReflections: {},
    applications: [],
    readinessOverride: null,
    preferences: { theme: 'system' },
    ...overrides
  };
}

function makeV2State(overrides = {}) {
  return {
    ...makeV1State(),
    schemaVersion: 2,
    studyProgress: { activeFocus: null, reviews: {} },
    ...overrides
  };
}

function makeV3State(overrides = {}) {
  return {
    ...makeV1State(),
    schemaVersion: 3,
    studyProgress: { activeFocus: null, reviews: {}, studied: {} },
    ...overrides
  };
}

function makeReview(overrides = {}) {
  return {
    kind: 'problem',
    sourceId: 'two-sum',
    promptIndex: null,
    lastReviewedAt: '2026-07-27T18:00:00.000Z',
    nextReviewAt: '2026-07-30T18:00:00.000Z',
    intervalDays: 3,
    streak: 1,
    lastResult: 'got-it',
    ...overrides
  };
}

function makeStage(id, type, reference, taskIds = [`task-${id}`], title = id) {
  return { id, type, title, taskIds, minutes: 20, instructions: title, reference };
}

const evidenceContent = {
  foundationModules: [
    { id: 'module-a', recall: [{ question: 'A?' }, { question: 'B?' }] }
  ],
  codingModules: [
    { id: 'module-b', recall: [{ question: 'C?' }] }
  ],
  modernCvModules: [],
  quizzes: [{ id: 'quiz-a' }, { id: 'quiz-b' }],
  systemDesignCases: [{ id: 'case-a' }]
};

const curriculumContext = vm.createContext({ window: { InterviewPrepData: {} } });
const curriculumPath = join(__dirname, '..', 'curriculum.js');
vm.runInContext(readFileSync(curriculumPath, 'utf8'), curriculumContext, { filename: curriculumPath });
const actualSessionGuides = curriculumContext.window.InterviewPrepData.sessionGuides;

function actualStageForTask(taskId) {
  for (const guide of Object.values(actualSessionGuides)) {
    const stage = guide.stages.find((candidate) => candidate.taskIds.includes(taskId));
    if (stage) return stage;
  }
  throw new Error(`Missing actual stage for task: ${taskId}`);
}

describe('learning progress', () => {
  test('marks a module studied without mutating the source state', () => {
    const state = makeV3State();
    const studiedAt = '2026-07-27T18:00:00.000Z';

    const updated = markStudied(state, 'linear-algebra', studiedAt);

    expect(updated.studyProgress.studied).toEqual({ 'linear-algebra': studiedAt });
    expect(state.studyProgress.studied).toEqual({});
  });

  test('rejects malformed module IDs when marking studied', () => {
    expect(() => markStudied(makeV3State(), 'bad:id')).toThrow(
      'Module IDs must be non-empty and cannot contain colons.'
    );
  });

  test('preserves active focus and reviews when marking studied', () => {
    const activeFocus = {
      sessionId: 'w1-mon',
      stageId: 'stage-w1-python',
      startedAt: '2026-07-27T18:00:00.000Z'
    };
    const state = makeV3State({ studyProgress: { activeFocus, reviews: {}, studied: {} } });
    const scheduled = scheduleRecallReview(state, 'linear-algebra', 0, 'got-it', '2026-07-27T18:00:00.000Z');

    const updated = markStudied(scheduled, 'linear-algebra', '2026-07-28T18:00:00.000Z');

    expect(updated.studyProgress.activeFocus).toEqual(activeFocus);
    expect(updated.studyProgress.reviews).toEqual(scheduled.studyProgress.reviews);
  });

  test('unmarks studied modules and tolerates an absent entry', () => {
    const marked = markStudied(makeV3State(), 'linear-algebra', '2026-07-27T18:00:00.000Z');

    expect(unmarkStudied(marked, 'linear-algebra').studyProgress.studied).toEqual({});
    expect(unmarkStudied(makeV3State(), 'linear-algebra').studyProgress.studied).toEqual({});
  });

  test('summarizes learning progress and identifies each next module', () => {
    const state = markStudied(makeV3State(), 'a', '2026-07-27T18:00:00.000Z');
    const groups = {
      coding: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      'modern-cv': [{ id: 'x' }]
    };

    const progress = getLearningProgress(state, groups);

    expect(progress.areas.coding).toEqual({
      total: 3,
      studied: 1,
      remaining: 2,
      nextModuleId: 'b',
      percent: 33.3
    });
    expect(progress.areas['modern-cv'].nextModuleId).toBe('x');
    expect(progress.total).toBe(4);
    expect(progress.studied).toBe(1);
    expect(progress.percent).toBe(25);
  });
});

describe('review keys and scheduling', () => {
  test('creates stable keys for every review kind', () => {
    expect(createReviewKey('recall', 'module-a', 0)).toBe('recall:module-a:0');
    expect(createReviewKey('quiz-question', 'quiz-a', 2)).toBe('quiz:quiz-a:2');
    expect(createReviewKey('problem', 'two-sum')).toBe('problem:two-sum');
    expect(() => createReviewKey('recall', 'bad:id', 0)).toThrow();
    expect(() => createReviewKey('problem', 'two-sum', 0)).toThrow();
  });

  test('uses exact recall intervals, streak rules, and the 30-day cap without mutation', () => {
    const initial = makeV2State();
    const before = structuredClone(initial);
    let updated = scheduleRecallReview(initial, 'module-a', 0, 'got-it', '2026-07-01T12:00:00.000Z');

    expect(initial).toEqual(before);
    expect(updated).not.toBe(initial);
    expect(updated.studyProgress.reviews['recall:module-a:0']).toMatchObject({
      intervalDays: 3,
      streak: 1,
      lastResult: 'got-it',
      nextReviewAt: '2026-07-04T12:00:00.000Z'
    });

    const successes = [
      ['2026-07-04T12:00:00.000Z', 6, 2],
      ['2026-07-10T12:00:00.000Z', 12, 3],
      ['2026-07-22T12:00:00.000Z', 24, 4],
      ['2026-08-15T12:00:00.000Z', 30, 5],
      ['2026-09-14T12:00:00.000Z', 30, 6]
    ];
    for (const [reviewedAt, intervalDays, streak] of successes) {
      updated = scheduleRecallReview(updated, 'module-a', 0, 'got-it', reviewedAt);
      expect(updated.studyProgress.reviews['recall:module-a:0']).toMatchObject({ intervalDays, streak });
    }

    updated = scheduleRecallReview(updated, 'module-a', 0, 'hard', '2026-10-14T12:00:00.000Z');
    expect(updated.studyProgress.reviews['recall:module-a:0']).toMatchObject({
      intervalDays: 3,
      streak: 6,
      nextReviewAt: '2026-10-17T12:00:00.000Z'
    });
    updated = scheduleRecallReview(updated, 'module-a', 0, 'again', '2026-10-17T12:00:00.000Z');
    expect(updated.studyProgress.reviews['recall:module-a:0']).toMatchObject({
      intervalDays: 1,
      streak: 0,
      nextReviewAt: '2026-10-18T12:00:00.000Z'
    });
    updated = scheduleRecallReview(updated, 'module-a', 0, 'hard', '2026-10-18T12:00:00.000Z');
    expect(updated.studyProgress.reviews['recall:module-a:0']).toMatchObject({ intervalDays: 3, streak: 0 });
  });

  test('schedules quiz misses tomorrow and resolves questions absent from a later miss set', () => {
    const initial = makeV2State();
    const scheduled = scheduleQuizReviews(initial, 'quiz-a', [0, 2, 2], '2026-07-27T18:00:00.000Z');

    expect(Object.keys(scheduled.studyProgress.reviews)).toEqual([
      'quiz:quiz-a:0',
      'quiz:quiz-a:2'
    ]);
    expect(scheduled.studyProgress.reviews['quiz:quiz-a:0']).toEqual({
      kind: 'quiz-question',
      sourceId: 'quiz-a',
      promptIndex: 0,
      lastReviewedAt: '2026-07-27T18:00:00.000Z',
      nextReviewAt: '2026-07-28T18:00:00.000Z',
      intervalDays: 1,
      streak: 0,
      lastResult: 'again'
    });

    const later = scheduleQuizReviews(scheduled, 'quiz-a', [2], '2026-07-29T18:00:00.000Z');
    expect(later.studyProgress.reviews['quiz:quiz-a:0']).toBeUndefined();
    expect(later.studyProgress.reviews['quiz:quiz-a:2'].nextReviewAt).toBe('2026-07-30T18:00:00.000Z');
    expect(initial.studyProgress.reviews).toEqual({});
  });

  test('schedules assisted coding repeats and only a complete cold repeat resolves them', () => {
    const initial = makeV2State();
    const assisted = scheduleProblemReview(initial, {
      problemId: 'two-sum',
      usedHint: true,
      attemptedAt: '2026-07-27T18:00:00.000Z'
    });
    expect(assisted.studyProgress.reviews['problem:two-sum']).toMatchObject({
      intervalDays: 2,
      streak: 0,
      lastResult: 'again',
      nextReviewAt: '2026-07-29T18:00:00.000Z'
    });

    const incompleteRepeat = scheduleProblemReview(assisted, {
      problemId: 'two-sum',
      solvedIndependently: true,
      explainedAloud: false,
      complexityCorrect: true,
      attemptedAt: '2026-07-29T18:00:00.000Z'
    });
    expect(incompleteRepeat.studyProgress.reviews['problem:two-sum']).toEqual(
      assisted.studyProgress.reviews['problem:two-sum']
    );

    const retained = scheduleProblemReview(incompleteRepeat, {
      problemId: 'two-sum',
      solvedIndependently: true,
      explainedAloud: true,
      complexityCorrect: true,
      attemptedAt: '2026-07-30T18:00:00.000Z'
    });
    expect(retained.studyProgress.reviews['problem:two-sum']).toMatchObject({
      intervalDays: 7,
      streak: 1,
      lastResult: 'got-it',
      nextReviewAt: '2026-08-06T18:00:00.000Z'
    });

    const reviewed = scheduleProblemReview(retained, {
      problemId: 'valid-anagram',
      reviewedSolution: true,
      attemptedAt: '2026-07-30T18:00:00.000Z'
    });
    expect(reviewed.studyProgress.reviews['problem:valid-anagram'].intervalDays).toBe(2);
    expect(initial.studyProgress.reviews).toEqual({});
  });

  test('returns only due reviews with failed items first, then most overdue, and caps at five', () => {
    const state = makeV2State({
      studyProgress: {
        activeFocus: null,
        reviews: {
          'problem:a': makeReview({ sourceId: 'a', lastResult: 'again', nextReviewAt: '2026-07-01T12:00:00.000Z' }),
          'problem:b': makeReview({ sourceId: 'b', lastResult: 'again', nextReviewAt: '2026-07-01T12:00:00.000Z' }),
          'problem:c': makeReview({ sourceId: 'c', lastResult: 'got-it', nextReviewAt: '2026-06-01T12:00:00.000Z' }),
          'problem:d': makeReview({ sourceId: 'd', lastResult: 'hard', nextReviewAt: '2026-06-02T12:00:00.000Z' }),
          'problem:e': makeReview({ sourceId: 'e', lastResult: 'got-it', nextReviewAt: '2026-06-03T12:00:00.000Z' }),
          'problem:f': makeReview({ sourceId: 'f', lastResult: 'got-it', nextReviewAt: '2026-06-04T12:00:00.000Z' }),
          'problem:future': makeReview({ sourceId: 'future', lastResult: 'again', nextReviewAt: '2026-08-01T12:00:00.000Z' })
        }
      }
    });
    const before = structuredClone(state);

    const due = getDueReviews(state, '2026-07-10T12:00:00.000Z');

    expect(due.map((item) => item.key)).toEqual([
      'problem:a',
      'problem:b',
      'problem:c',
      'problem:d',
      'problem:e'
    ]);
    expect(new Set(due.map((item) => item.key)).size).toBe(due.length);
    expect(getDueReviews(state, '2026-07-10T12:00:00.000Z', 10).map((item) => item.key)).toEqual([
      'problem:a',
      'problem:b',
      'problem:c',
      'problem:d',
      'problem:e',
      'problem:f'
    ]);
    expect(state).toEqual(before);
  });
});

describe('guided stage evidence', () => {
  test('requires every module prompt and lets typed evidence override legacy completion', () => {
    const moduleStage = makeStage('module', 'learn', { type: 'module', moduleIds: ['module-a'] });
    const legacy = makeV2State({ completedTasks: { 'task-module': true } });
    expect(calculateStageStatus(moduleStage, legacy, evidenceContent)).toMatchObject({
      complete: true,
      evidence: 'legacy'
    });

    const oneFailed = scheduleRecallReview(legacy, 'module-a', 0, 'again', '2026-07-27T18:00:00.000Z');
    expect(calculateStageStatus(moduleStage, oneFailed, evidenceContent)).toMatchObject({
      complete: false,
      evidence: 'typed',
      quality: 'needs-review',
      attempted: 1,
      total: 2
    });

    let passed = scheduleRecallReview(oneFailed, 'module-a', 0, 'hard', '2026-07-28T18:00:00.000Z');
    passed = scheduleRecallReview(passed, 'module-a', 1, 'got-it', '2026-07-28T18:00:00.000Z');
    expect(calculateStageStatus(moduleStage, passed, evidenceContent)).toMatchObject({
      complete: true,
      evidence: 'typed',
      quality: 'retained',
      attempted: 2,
      total: 2
    });
  });

  test('requires attempts for every problem and reports assistance quality', () => {
    const problemStage = makeStage('problems', 'practice', {
      type: 'problem-set',
      problemIds: ['two-sum', 'valid-anagram']
    });
    const partial = makeV2State({
      completedTasks: { 'task-problems': true },
      problemAttempts: [{ problemId: 'two-sum', solvedIndependently: true }]
    });
    expect(calculateStageStatus(problemStage, partial, evidenceContent)).toMatchObject({
      complete: false,
      evidence: 'typed',
      attempted: 1,
      total: 2
    });

    const complete = {
      ...partial,
      problemAttempts: [
        ...partial.problemAttempts,
        { problemId: 'valid-anagram', usedHint: true }
      ]
    };
    expect(calculateStageStatus(problemStage, complete, evidenceContent)).toMatchObject({
      complete: true,
      quality: 'hint-assisted'
    });

    complete.problemAttempts.push({ problemId: 'valid-anagram', reviewedSolution: true });
    expect(calculateStageStatus(problemStage, complete, evidenceContent).quality).toBe('solution-reviewed');
  });

  test('uses each quiz latest score and requires at least 80 percent', () => {
    const quizStage = makeStage('quiz', 'verify', { type: 'quiz', quizIds: ['quiz-a', 'quiz-b'] });
    const state = makeV2State({
      completedTasks: { 'task-quiz': true },
      quizAttempts: [
        { quizId: 'quiz-a', score: 95, attemptedAt: '2026-07-27T18:00:00.000Z' },
        { quizId: 'quiz-b', score: 70, attemptedAt: '2026-07-27T18:05:00.000Z' }
      ]
    });
    expect(calculateStageStatus(quizStage, state, evidenceContent)).toMatchObject({
      complete: false,
      evidence: 'typed',
      quality: 'needs-review'
    });

    state.quizAttempts.push({ quizId: 'quiz-b', score: 80, attemptedAt: '2026-07-28T18:00:00.000Z' });
    expect(calculateStageStatus(quizStage, state, evidenceContent)).toMatchObject({
      complete: true,
      quality: 'passed'
    });
  });

  test('completes design work from a timed rubric and exposes its lowest dimension', () => {
    const designStage = makeStage('design', 'practice', { type: 'design-case', caseId: 'case-a' });
    const invalid = makeV2State({
      completedTasks: { 'task-design': true },
      designAttempts: [{
        caseId: 'case-a',
        durationMinutes: 0,
        scores: { requirements: 4 }
      }]
    });
    expect(calculateStageStatus(designStage, invalid, evidenceContent)).toMatchObject({
      complete: false,
      evidence: 'typed',
      quality: { scores: { requirements: 4 }, lowestDimension: 'requirements', lowestScore: 4 }
    });

    const state = makeV2State({
      designAttempts: [{
        caseId: 'case-a',
        durationMinutes: 38,
        attemptedAt: '2026-07-27T18:00:00.000Z',
        scores: { requirements: 4, metrics: 2, serving: 3 }
      }]
    });
    const status = calculateStageStatus(designStage, state, evidenceContent);

    expect(status.complete).toBe(true);
    expect(status.evidence).toBe('typed');
    expect(status.quality).toEqual({
      scores: { requirements: 4, metrics: 2, serving: 3 },
      lowestDimension: 'metrics',
      lowestScore: 2
    });
    expect(status).not.toHaveProperty('mastered');
  });

  test('requires eight completed stories for the actual story-bank finish stage', () => {
    const stage = actualStageForTask('w7-story-finish');
    const state = makeV2State({
      starStories: [{ title: 'Launch', complete: true }]
    });

    expect(calculateStageStatus(stage, state, evidenceContent)).toMatchObject({
      complete: false,
      artifactType: 'completed-story',
      count: 1,
      requiredCount: 8
    });

    state.starStories.push(...Array.from({ length: 7 }, (_, index) => ({
      title: `Story ${index + 2}`,
      complete: true
    })));
    expect(calculateStageStatus(stage, state, evidenceContent).complete).toBe(true);
  });

  test('requires cumulative no-notes records for the actual rehearsal stages without parsing prose', () => {
    const firstStage = {
      ...actualStageForTask('w8-story-rehearsal-a'),
      id: 'opaque-story-stage-a',
      title: 'Opaque stage A',
      instructions: 'Use the saved artifact.',
      taskIds: ['opaque-story-task-a']
    };
    const secondStage = {
      ...actualStageForTask('w9-story-random'),
      id: 'opaque-story-stage-b',
      title: 'Opaque stage B',
      instructions: 'Use the saved artifact.',
      taskIds: ['opaque-story-task-b']
    };
    const state = makeV2State({
      rehearsals: [{ withoutNotes: false }, { withoutNotes: false }]
    });

    expect(calculateStageStatus(firstStage, state, evidenceContent).complete).toBe(false);
    expect(calculateStageStatus(secondStage, state, evidenceContent).complete).toBe(false);

    state.rehearsals.push({ withoutNotes: true });
    expect(calculateStageStatus(firstStage, state, evidenceContent).complete).toBe(true);
    expect(calculateStageStatus(secondStage, state, evidenceContent).complete).toBe(false);

    state.rehearsals.push({ withoutNotes: true });
    expect(calculateStageStatus(secondStage, state, evidenceContent).complete).toBe(true);
  });

  test('requires cumulative mocks of the actual guide type for Mock II and III', () => {
    const codingI = actualStageForTask('w6-coding-mock');
    const codingII = actualStageForTask('w8-coding-mock');
    const codingIII = actualStageForTask('w9-coding-mock');
    const mlI = actualStageForTask('w8-ml-mock');
    const mlII = actualStageForTask('w9-ml-mock');
    const state = makeV2State({
      mocks: [{ type: 'coding' }, { type: 'ml-system' }]
    });

    expect(calculateStageStatus(codingI, state, evidenceContent).complete).toBe(true);
    expect(calculateStageStatus(codingII, state, evidenceContent).complete).toBe(false);
    expect(calculateStageStatus(codingIII, state, evidenceContent).complete).toBe(false);
    expect(calculateStageStatus(mlI, state, evidenceContent).complete).toBe(true);
    expect(calculateStageStatus(mlII, state, evidenceContent).complete).toBe(false);

    state.mocks.push({ type: 'coding' });
    expect(calculateStageStatus(codingII, state, evidenceContent).complete).toBe(true);
    expect(calculateStageStatus(codingIII, state, evidenceContent).complete).toBe(false);
    state.mocks.push({ type: 'coding' }, { type: 'ml-system' });
    expect(calculateStageStatus(codingIII, state, evidenceContent).complete).toBe(true);
    expect(calculateStageStatus(mlII, state, evidenceContent).complete).toBe(true);
  });

  test('keeps instruction, resource-only, and reflection work explicitly manual', () => {
    const instruction = makeStage('instruction', 'learn', { type: 'instruction', resourceIds: ['resource-a'] });
    const reflection = makeStage('reflection', 'reflect', { type: 'instruction' });
    const state = makeV2State({ completedTasks: { 'task-instruction': true } });

    expect(calculateStageStatus(instruction, state, evidenceContent)).toMatchObject({ complete: true, evidence: 'manual' });
    expect(calculateStageStatus(reflection, state, evidenceContent)).toMatchObject({ complete: false, evidence: 'manual' });
  });

  test('selects the first incomplete stage in guide order', () => {
    const first = makeStage('first', 'reflect', { type: 'instruction' });
    const second = makeStage('second', 'reflect', { type: 'instruction' });
    const guide = { sessionId: 'session-a', stages: [first, second] };
    const state = makeV2State({ completedTasks: { 'task-first': true } });

    expect(getFirstIncompleteStage(guide, state, evidenceContent)).toBe(second);
    state.completedTasks['task-second'] = true;
    expect(getFirstIncompleteStage(guide, state, evidenceContent)).toBeNull();
  });
});

describe('centralized task completion', () => {
  test('uses the same stage evidence for task lookup and plan progress while preserving old calls', () => {
    const moduleStage = makeStage('module', 'learn', { type: 'module', moduleIds: ['module-a'] });
    const manualStage = makeStage('manual', 'reflect', { type: 'instruction' });
    const guides = { 'session-a': { sessionId: 'session-a', stages: [moduleStage, manualStage] } };
    const state = makeV2State({ completedTasks: { 'task-module': true, 'task-manual': true, unguided: true } });
    const oneFailed = scheduleRecallReview(state, 'module-a', 0, 'again', '2026-07-27T18:00:00.000Z');

    expect(isTaskComplete('task-module', oneFailed, guides, evidenceContent)).toBe(false);
    expect(isTaskComplete('task-manual', oneFailed, guides, evidenceContent)).toBe(true);
    expect(isTaskComplete('unguided', oneFailed, guides, evidenceContent)).toBe(true);
    expect(calculatePlanProgress(['task-module', 'task-manual'], oneFailed, guides, evidenceContent)).toEqual({
      completed: 1,
      total: 2,
      percent: 50
    });
    expect(calculatePlanProgress(['task-module', 'task-manual'], oneFailed)).toEqual({
      completed: 2,
      total: 2,
      percent: 100
    });
  });

  test('lets required-foundation readiness consume centralized evidence context', () => {
    const content = {
      ...evidenceContent,
      foundationModules: [{ id: 'foundation-required', recall: [{ question: 'Why?' }] }]
    };
    const stage = makeStage('foundation', 'learn', { type: 'module', moduleIds: ['foundation-required'] }, ['foundation-task']);
    const guides = { session: { sessionId: 'session', stages: [stage] } };
    const ready = makeReadyState();
    delete ready.completedTasks['foundation-linear-algebra'];
    delete ready.completedTasks['foundation-probability'];
    const withEvidence = scheduleRecallReview(ready, 'foundation-required', 0, 'got-it', '2026-09-14T18:00:00.000Z');

    expect(calculateReadiness(withEvidence, {
      requiredFoundationTaskIds: ['foundation-task'],
      sessionGuides: guides,
      content
    }).gates.foundations.status).toBe('green');
    expect(calculateReadiness(withEvidence, {
      requiredFoundationTaskIds: ['foundation-task']
    }).gates.foundations.status).toBe('red');
  });
});

describe('weak-area recommendation', () => {
  test('uses quiz, unresolved assisted problem, design rubric, then stage priority with resolution', () => {
    const currentStage = makeStage('next', 'reflect', { type: 'instruction' });
    const currentGuide = { sessionId: 'session-a', stages: [currentStage] };
    const nextGuide = {
      sessionId: 'session-b',
      stages: [makeStage('later', 'reflect', { type: 'instruction' })]
    };
    const context = {
      currentGuide,
      nextGuide,
      content: evidenceContent,
      quizModuleIds: { 'quiz-a': ['module-a'] }
    };
    const state = makeV2State({
      quizAttempts: [{ quizId: 'quiz-a', score: 60, attemptedAt: '2026-07-27T18:00:00.000Z' }],
      problemAttempts: [{ problemId: 'two-sum', usedHint: true, attemptedAt: '2026-07-28T18:00:00.000Z' }],
      designAttempts: [{
        caseId: 'case-a',
        durationMinutes: 40,
        scores: { requirements: 4, metrics: 2 },
        attemptedAt: '2026-07-29T18:00:00.000Z'
      }]
    });

    const beforeRecommendation = structuredClone(state);
    const quizRecommendation = getWeakAreaRecommendation(state, context);
    expect(quizRecommendation).toMatchObject({
      kind: 'quiz',
      action: 'retake-quiz',
      quizId: 'quiz-a',
      moduleIds: ['module-a'],
      score: 60
    });
    expect(getWeakAreaRecommendation(state, context)).toEqual(quizRecommendation);
    expect(state).toEqual(beforeRecommendation);

    state.quizAttempts.push({ quizId: 'quiz-a', score: 90, attemptedAt: '2026-07-30T18:00:00.000Z' });
    expect(getWeakAreaRecommendation(state, context)).toMatchObject({
      kind: 'problem',
      action: 'repeat-problem-cold',
      problemId: 'two-sum',
      assistance: 'hint-assisted'
    });

    state.problemAttempts.push({
      problemId: 'two-sum',
      solvedIndependently: true,
      explainedAloud: true,
      complexityCorrect: true,
      attemptedAt: '2026-07-31T18:00:00.000Z'
    });
    expect(getWeakAreaRecommendation(state, context)).toMatchObject({
      kind: 'design',
      action: 'repair-design-dimension',
      caseId: 'case-a',
      dimension: 'metrics',
      score: 2
    });

    state.designAttempts.push({
      caseId: 'case-a',
      durationMinutes: 38,
      scores: { requirements: 4, metrics: 4 },
      attemptedAt: '2026-08-01T18:00:00.000Z'
    });
    expect(getWeakAreaRecommendation(state, context)).toMatchObject({
      kind: 'stage',
      action: 'continue-stage',
      sessionId: 'session-a',
      stageId: 'next'
    });

    state.completedTasks['task-next'] = true;
    expect(getWeakAreaRecommendation(state, context)).toMatchObject({
      kind: 'session',
      action: 'start-session',
      sessionId: 'session-b'
    });
  });

  test('breaks recommendation ties deterministically', () => {
    const state = makeV2State({
      quizAttempts: [
        { quizId: 'quiz-b', score: 50, attemptedAt: '2026-07-27T18:00:00.000Z' },
        { quizId: 'quiz-a', score: 50, attemptedAt: '2026-07-27T18:00:00.000Z' }
      ]
    });

    expect(getWeakAreaRecommendation(state, { content: evidenceContent }).quizId).toBe('quiz-a');
  });
});

function makeReadyState() {
  const state = createInitialState();
  state.completedTasks = {
    'foundation-linear-algebra': true,
    'foundation-probability': true
  };
  state.problemAttempts = Array.from({ length: 5 }, (_, index) => ({
    problemId: `random-medium-${index + 1}`,
    difficulty: 'medium',
    random: true,
    solvedIndependently: index !== 4,
    minutes: 24 + index,
    explainedAloud: true,
    complexityCorrect: true,
    attemptedAt: `2026-09-${10 + index}T18:00:00.000Z`
  }));
  state.quizAttempts = [
    { kind: 'core', score: 86, attemptedAt: '2026-09-10T18:00:00.000Z' },
    { kind: 'task-metric', score: 90, attemptedAt: '2026-09-11T18:00:00.000Z' },
    { kind: 'rapid-fire', score: 84, noNotes: true, attemptedAt: '2026-09-12T18:00:00.000Z' }
  ];
  const designScores = {
    requirements: 4,
    metrics: 4,
    data: 4,
    model: 4,
    evaluation: 4,
    serving: 4,
    monitoring: 4,
    feedback: 4,
    tradeoffs: 4,
    communication: 4
  };
  state.designAttempts = [
    { durationMinutes: 40, scores: designScores, attemptedAt: '2026-09-13T18:00:00.000Z' },
    { durationMinutes: 38, scores: designScores, attemptedAt: '2026-09-14T18:00:00.000Z' }
  ];
  state.starStories = Array.from({ length: 8 }, (_, index) => ({
    title: `Story ${index + 1}`,
    complete: true,
    durationMinutes: 1.8,
    measurableImpact: true,
    individualContribution: true,
    leadership: index < 2
  }));
  state.rehearsals = [{ withoutNotes: true }, { withoutNotes: true }];
  state.mocks = [
    { type: 'coding', wouldAdvance: true, weaknesses: [{ remediationComplete: true }] },
    { type: 'coding', wouldAdvance: true, weaknesses: [] },
    { type: 'ml-system', wouldAdvance: true, weaknesses: [] },
    { type: 'ml-system', wouldAdvance: true, weaknesses: [{ remediationComplete: true }] }
  ];
  return state;
}

describe('evidence-based readiness', () => {
  const criteria = {
    requiredFoundationTaskIds: ['foundation-linear-algebra', 'foundation-probability']
  };

  test('keeps every gate red when evidence is missing', () => {
    const readiness = calculateReadiness(createInitialState(), criteria);
    expect(readiness.overall).toBe('red');
    expect(Object.values(readiness.gates).every((gate) => gate.status === 'red')).toBe(true);
  });

  test('turns green only when every agreed performance threshold is met', () => {
    const readiness = calculateReadiness(makeReadyState(), criteria);
    expect(readiness.overall).toBe('green');
    expect(Object.values(readiness.gates).every((gate) => gate.status === 'green')).toBe(true);
    expect(isApplicationUnlocked(makeReadyState(), readiness)).toBe(true);
  });

  test('allows a reasoned manual override without changing readiness evidence', () => {
    const state = createInitialState();
    state.readinessOverride = { reason: 'Recruiter requested an early conversation.' };
    const readiness = calculateReadiness(state, criteria);
    expect(readiness.overall).toBe('red');
    expect(isApplicationUnlocked(state, readiness)).toBe(true);
  });
});

describe('plan progress and timing', () => {
  test('keeps task completion separate from study-hour adherence', () => {
    const state = createInitialState();
    state.completedTasks = { a: true, b: true };
    state.timeEntries = [{ minutes: 90 }, { minutes: 30 }];
    expect(calculatePlanProgress(['a', 'b', 'c', 'd'], state)).toEqual({
      completed: 2,
      total: 4,
      percent: 50
    });
    expect(calculateStudyStats(state, 7200)).toEqual({
      actualMinutes: 120,
      plannedMinutes: 7200,
      percent: 1.7
    });
  });

  test('maps calendar dates into the bounded ten-week plan', () => {
    expect(getCurrentWeek('2026-07-27')).toBe(1);
    expect(getCurrentWeek('2026-08-03')).toBe(2);
    expect(getCurrentWeek('2026-10-12')).toBe(10);
  });
});
