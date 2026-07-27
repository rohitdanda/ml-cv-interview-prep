(function exposeLogic(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.InterviewPrepLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLogic() {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_KINDS = new Set(['recall', 'quiz-question', 'problem']);
  const REVIEW_RESULTS = new Set(['again', 'hard', 'got-it']);
  const REVIEW_FIELDS = [
    'kind',
    'sourceId',
    'promptIndex',
    'lastReviewedAt',
    'nextReviewAt',
    'intervalDays',
    'streak',
    'lastResult'
  ];
  const DESIGN_PHASES = new Set(['requirements', 'attempt', 'debrief']);
  const REHEARSAL_KINDS = new Set(['story', 'intro', 'project-deep-dive', 'full-round']);
  const MOCK_PHASES = new Set(['attempt', 'debrief']);

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function hasExactKeys(value, expected) {
    if (!isRecord(value)) return false;
    const actual = Object.keys(value).sort();
    const wanted = expected.slice().sort();
    return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
  }

  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function isIdentifier(value) {
    return isNonEmptyString(value) && !value.includes(':');
  }

  function isValidDate(value) {
    return typeof value === 'string' && Number.isFinite(Date.parse(value));
  }

  function toIsoDate(value, label) {
    if (!isValidDate(value)) throw new TypeError(`${label} must be a valid date.`);
    return new Date(value).toISOString();
  }

  function addDays(value, days) {
    return new Date(Date.parse(value) + days * DAY_MS).toISOString();
  }

  function sanitizeTimerMetadata(metadata) {
    if (!isRecord(metadata)) return {};
    const sanitized = {};
    for (const field of ['sessionId', 'stageId', 'title']) {
      if (isNonEmptyString(metadata[field])) sanitized[field] = metadata[field];
    }
    if (Number.isFinite(metadata.targetMinutes) && metadata.targetMinutes > 0) {
      sanitized.targetMinutes = metadata.targetMinutes;
    }
    return sanitized;
  }

  function createInitialState() {
    return {
      schemaVersion: 3,
      completedTasks: {},
      problemAttempts: [],
      quizAttempts: [],
      designAttempts: [],
      storyInventory: [],
      starStories: [],
      rehearsals: [],
      mocks: [],
      timeEntries: [],
      activeTimer: null,
      sessionReflections: {},
      applications: [],
      readinessOverride: null,
      preferences: { theme: 'system' },
      remediationAssignments: {},
      studyProgress: { activeFocus: null, reviews: {}, studied: {} }
    };
  }

  function startTimer(category, startedAt = new Date().toISOString(), metadata = {}) {
    if (isRecord(startedAt)) {
      metadata = startedAt;
      startedAt = isValidDate(metadata.startedAt) ? metadata.startedAt : new Date().toISOString();
    }
    return { category, startedAt, ...sanitizeTimerMetadata(metadata) };
  }

  function getElapsedMinutes(timer, now = new Date().toISOString()) {
    if (!timer) return 0;
    return Math.max(0, (new Date(now).getTime() - new Date(timer.startedAt).getTime()) / 60000);
  }

  function stopTimer(timer, endedAt = new Date().toISOString()) {
    if (!timer) return null;
    return {
      category: timer.category,
      startedAt: timer.startedAt,
      endedAt,
      minutes: getElapsedMinutes(timer, endedAt),
      ...sanitizeTimerMetadata(timer)
    };
  }

  function coerceInventoryField(value) {
    let coerced = null;
    if (typeof value === 'string') coerced = value;
    else if (typeof value === 'number' && Number.isFinite(value)) coerced = String(value);
    else if (typeof value === 'boolean') coerced = String(value);
    if (coerced === null) return null;
    const trimmed = coerced.trim();
    return trimmed || null;
  }

  function isValidInventoryRecord(entry) {
    return isRecord(entry) && ['id', 'title', 'note', 'createdAt'].every((field) => (
      isNonEmptyString(entry[field])
    ));
  }

  function normalizeStoryInventory(value) {
    if (!Array.isArray(value)) return [];
    const inventory = [];
    for (const entry of value) {
      if (!isRecord(entry)) continue;
      const id = coerceInventoryField(entry.id);
      const title = coerceInventoryField(entry.title);
      const note = coerceInventoryField(entry.note);
      const createdAt = coerceInventoryField(entry.createdAt);
      if ([id, title, note, createdAt].some((field) => field === null)) continue;
      inventory.push({ id, title, note, createdAt });
    }
    return inventory;
  }

  function normalizeRehearsal(rehearsal) {
    if (!isRecord(rehearsal)) return null;
    if (Object.hasOwn(rehearsal, 'kind') && !REHEARSAL_KINDS.has(rehearsal.kind)) return null;
    const normalized = {
      ...rehearsal,
      kind: Object.hasOwn(rehearsal, 'kind') ? rehearsal.kind : 'story'
    };
    if (isNonEmptyString(rehearsal.refId)) normalized.refId = rehearsal.refId.trim();
    else delete normalized.refId;
    return normalized;
  }

  function normalizeMockWeakness(weakness) {
    if (!isRecord(weakness)) return null;
    if (typeof weakness.text !== 'string' || typeof weakness.remediation !== 'string') return null;
    const text = weakness.text.trim();
    const remediation = weakness.remediation.trim();
    if (!text || !remediation) return null;
    return { text, remediation, remediationComplete: weakness.remediationComplete === true };
  }

  function normalizeRubricScores(scores) {
    if (!isRecord(scores)) return {};
    const normalized = {};
    for (const [dimension, rawScore] of Object.entries(scores)) {
      const score = Number(rawScore);
      if (!isNonEmptyString(dimension) || !Number.isInteger(score) || score < 1 || score > 5) continue;
      normalized[dimension.trim()] = score;
    }
    return normalized;
  }

  function normalizeMockDebrief(debrief) {
    if (!isRecord(debrief)) return null;
    const weaknesses = Array.isArray(debrief.weaknesses)
      ? debrief.weaknesses.map(normalizeMockWeakness).filter(Boolean)
      : [];
    const normalized = {
      weaknesses,
      noMaterialWeakness: debrief.noMaterialWeakness === true,
      reviewedAt: typeof debrief.reviewedAt === 'string' ? debrief.reviewedAt : null
    };
    if (Object.hasOwn(debrief, 'rubricScores')) {
      normalized.rubricScores = normalizeRubricScores(debrief.rubricScores);
    }
    if (Object.hasOwn(debrief, 'followUpNotes')) {
      normalized.followUpNotes = typeof debrief.followUpNotes === 'string'
        ? debrief.followUpNotes.trim()
        : '';
    }
    return normalized;
  }

  function normalizeMock(mock) {
    if (!isRecord(mock)) return null;
    const normalized = { ...mock, debrief: normalizeMockDebrief(mock.debrief) };
    if (isNonEmptyString(mock.packetId)) normalized.packetId = mock.packetId.trim();
    else delete normalized.packetId;
    return normalized;
  }

  function normalizeDesignAttempt(attempt) {
    if (!isRecord(attempt)) return null;
    if (Object.hasOwn(attempt, 'phase') && !DESIGN_PHASES.has(attempt.phase)) return null;
    return {
      ...attempt,
      phase: Object.hasOwn(attempt, 'phase') ? attempt.phase : 'attempt'
    };
  }


  function normalizeStarStory(story) {
    if (!isRecord(story)) return null;
    return {
      ...story,
      promptId: isNonEmptyString(story.promptId) ? story.promptId.trim() : null
    };
  }

  function normalizeRemediationTarget(target) {
    if (!isRecord(target) || !['recall', 'quiz', 'problem', 'design'].includes(target.kind)) return null;
    if (!isIdentifier(target.sourceId) || typeof target.isCalibration !== 'boolean') return null;
    if (!isValidDate(target.assignedAt)) return null;
    const failedAt = target.failedAt === null || isValidDate(target.failedAt) ? target.failedAt : null;
    if (failedAt !== target.failedAt || (!target.isCalibration && !isValidDate(failedAt))) return null;
    const assignedAt = target.assignedAt;

    const normalized = {
      kind: target.kind,
      sourceId: target.sourceId,
      failedAt,
      assignedAt,
      isCalibration: target.isCalibration
    };
    if (target.kind === 'recall') {
      if (!Number.isInteger(target.promptIndex) || target.promptIndex < 0) return null;
      normalized.promptIndex = target.promptIndex;
    } else if (target.kind === 'quiz') {
      if (!isIdentifier(target.quizId) || target.quizId !== target.sourceId) return null;
      normalized.quizId = target.quizId;
    } else if (target.kind === 'problem') {
      if (!isIdentifier(target.problemId) || target.problemId !== target.sourceId) return null;
      normalized.problemId = target.problemId;
    } else {
      if (!isIdentifier(target.caseId) || target.caseId !== target.sourceId || !isNonEmptyString(target.dimension)) return null;
      normalized.caseId = target.caseId;
      normalized.dimension = target.dimension.trim();
    }
    if (isNonEmptyString(target.label)) normalized.label = target.label.trim();
    if (isNonEmptyString(target.completionCriterion)) {
      normalized.completionCriterion = target.completionCriterion.trim();
    }
    return normalized;
  }

  function normalizeRemediationAssignments(value) {
    if (!isRecord(value)) return {};
    const assignments = {};
    for (const [stageId, target] of Object.entries(value)) {
      if (!/^(?:stage-)?w(?:8|9|10)-[a-z0-9-]+$/.test(stageId)) continue;
      const normalized = normalizeRemediationTarget(target);
      if (normalized) assignments[stageId] = normalized;
    }
    return assignments;
  }

  function updateMockDebrief(existingDebrief, changes, reviewedAt = new Date().toISOString()) {
    const existing = isRecord(existingDebrief) ? existingDebrief : {};
    if (!isRecord(changes)) throw new TypeError('Mock debrief changes must be a record.');

    const evidence = {};
    if (Object.hasOwn(changes, 'rubricScores')) {
      evidence.rubricScores = normalizeRubricScores(changes.rubricScores);
    }
    if (Object.hasOwn(changes, 'followUpNotes')) {
      evidence.followUpNotes = typeof changes.followUpNotes === 'string'
        ? changes.followUpNotes.trim()
        : '';
    }
    if (changes.noMaterialWeakness === true) {
      return {
        ...existing,
        ...evidence,
        weaknesses: [],
        noMaterialWeakness: true,
        reviewedAt
      };
    }

    if (Array.isArray(changes.weaknesses)) {
      const weaknesses = changes.weaknesses.map(normalizeMockWeakness);
      if (!weaknesses.length || weaknesses.some((weakness) => weakness === null)) {
        throw new TypeError('Every weakness needs non-empty text and remediation.');
      }
      return {
        ...existing,
        ...evidence,
        weaknesses,
        noMaterialWeakness: false,
        reviewedAt
      };
    }

    if (!isRecord(changes.weakness)) {
      throw new TypeError('A weakness is required when material weaknesses remain.');
    }
    const weakness = normalizeMockWeakness(changes.weakness);
    if (!weakness) throw new TypeError('Weakness text and remediation must be non-empty.');

    const existingWeaknesses = Array.isArray(existing.weaknesses) ? existing.weaknesses : [];
    const existingFirst = isRecord(existingWeaknesses[0]) ? existingWeaknesses[0] : {};
    return {
      ...existing,
      ...evidence,
      weaknesses: [{ ...existingFirst, ...weakness }, ...existingWeaknesses.slice(1)],
      noMaterialWeakness: false,
      reviewedAt
    };
  }

  function normalizeRecords(value, normalizer) {
    const normalized = [];
    for (const entry of value) {
      const record = normalizer(entry);
      if (record) normalized.push(record);
    }
    return normalized;
  }

  function validateImportedState(candidate) {
    if (!isRecord(candidate)) {
      return { ok: false, error: 'The selected file is not a progress backup.' };
    }
    if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== 3) {
      return { ok: false, error: 'This backup uses an unsupported data version.' };
    }

    const arrayFields = [
      'problemAttempts',
      'quizAttempts',
      'designAttempts',
      'starStories',
      'rehearsals',
      'mocks',
      'timeEntries',
      'applications'
    ];
    const objectFields = ['completedTasks', 'sessionReflections', 'preferences'];
    const arraysValid = arrayFields.every((field) => (
      Object.hasOwn(candidate, field) && Array.isArray(candidate[field])
    ));
    const objectsValid = objectFields.every((field) => (
      Object.hasOwn(candidate, field) && isRecord(candidate[field])
    ));
    const nullableRecordsValid = ['activeTimer', 'readinessOverride'].every((field) => (
      Object.hasOwn(candidate, field) && (candidate[field] === null || isRecord(candidate[field]))
    ));

    if (!arraysValid || !objectsValid || !nullableRecordsValid) {
      return { ok: false, error: 'The backup is missing required progress fields.' };
    }

    const rawProgress = candidate.studyProgress;
    let studyProgress;
    if (candidate.schemaVersion === 1) {
      studyProgress = { activeFocus: null, reviews: {}, studied: {} };
    } else if (candidate.schemaVersion === 2 && isRecord(rawProgress)) {
      studyProgress = {
        ...rawProgress,
        studied: isRecord(rawProgress.studied) ? rawProgress.studied : {}
      };
    } else {
      studyProgress = rawProgress;
    }
    if (!isValidStudyProgress(studyProgress)) {
      return { ok: false, error: 'The backup contains malformed learning progress.' };
    }

    return {
      ok: true,
      value: {
        ...candidate,
        schemaVersion: 3,
        storyInventory: normalizeStoryInventory(candidate.storyInventory),
        designAttempts: normalizeRecords(candidate.designAttempts, normalizeDesignAttempt),
        starStories: normalizeRecords(candidate.starStories, normalizeStarStory),
        rehearsals: normalizeRecords(candidate.rehearsals, normalizeRehearsal),
        mocks: normalizeRecords(candidate.mocks, normalizeMock),
        remediationAssignments: normalizeRemediationAssignments(candidate.remediationAssignments),
        studyProgress
      }
    };
  }

  function isValidStudyProgress(studyProgress) {
    if (!hasExactKeys(studyProgress, ['activeFocus', 'reviews', 'studied'])) return false;
    const focus = studyProgress.activeFocus;
    if (focus !== null && (
      !hasExactKeys(focus, ['sessionId', 'stageId', 'startedAt']) ||
      !isIdentifier(focus.sessionId) ||
      !isIdentifier(focus.stageId) ||
      !isValidDate(focus.startedAt)
    )) return false;
    if (!isRecord(studyProgress.reviews)) return false;
    if (!isValidStudied(studyProgress.studied)) return false;

    return Object.entries(studyProgress.reviews).every(([key, review]) => isValidReview(key, review));
  }

  function isValidStudied(studied) {
    if (!isRecord(studied)) return false;
    return Object.entries(studied).every(([moduleId, studiedAt]) => (
      isIdentifier(moduleId) && isValidDate(studiedAt)
    ));
  }

  function isValidReview(key, review) {
    const expectedFields = Object.hasOwn(review || {}, 'lastFailedAt')
      ? [...REVIEW_FIELDS, 'lastFailedAt']
      : REVIEW_FIELDS;
    if (!hasExactKeys(review, expectedFields)) return false;
    if (!REVIEW_KINDS.has(review.kind) || !REVIEW_RESULTS.has(review.lastResult)) return false;
    if (!isIdentifier(review.sourceId)) return false;
    if (!isValidDate(review.lastReviewedAt) || !isValidDate(review.nextReviewAt)) return false;
    if (Object.hasOwn(review, 'lastFailedAt') && !isValidDate(review.lastFailedAt)) return false;
    if (!Number.isFinite(review.intervalDays) || review.intervalDays <= 0) return false;
    if (!Number.isInteger(review.streak) || review.streak < 0) return false;

    const usesPrompt = review.kind === 'recall' || review.kind === 'quiz-question';
    if (usesPrompt !== (Number.isInteger(review.promptIndex) && review.promptIndex >= 0)) return false;
    if (!usesPrompt && review.promptIndex !== null) return false;

    try {
      return createReviewKey(review.kind, review.sourceId, review.promptIndex) === key;
    } catch (_error) {
      return false;
    }
  }

  function createReviewKey(kind, sourceId, promptIndex = null) {
    if (!REVIEW_KINDS.has(kind)) throw new TypeError('Unknown review kind.');
    if (!isIdentifier(sourceId)) throw new TypeError('Review source IDs must be non-empty and cannot contain colons.');

    if (kind === 'problem') {
      if (promptIndex !== null && promptIndex !== undefined) {
        throw new TypeError('Problem reviews cannot have a prompt index.');
      }
      return `problem:${sourceId}`;
    }
    if (!Number.isInteger(promptIndex) || promptIndex < 0) {
      throw new TypeError('Recall and quiz reviews require a non-negative prompt index.');
    }
    const prefix = kind === 'recall' ? 'recall' : 'quiz';
    return `${prefix}:${sourceId}:${promptIndex}`;
  }

  function currentReviews(state) {
    return isRecord(state?.studyProgress?.reviews) ? state.studyProgress.reviews : {};
  }

  function withReviews(state, reviews) {
    const progress = isRecord(state?.studyProgress) ? state.studyProgress : {};
    return {
      ...state,
      studyProgress: {
        ...progress,
        activeFocus: progress.activeFocus ?? null,
        reviews
      }
    };
  }

  function reviewRecord(kind, sourceId, promptIndex, lastReviewedAt, intervalDays, streak, lastResult, lastFailedAt = null) {
    const record = {
      kind,
      sourceId,
      promptIndex,
      lastReviewedAt,
      nextReviewAt: addDays(lastReviewedAt, intervalDays),
      intervalDays,
      streak,
      lastResult
    };
    if (isValidDate(lastFailedAt)) record.lastFailedAt = new Date(lastFailedAt).toISOString();
    return record;
  }

  function currentStudied(state) {
    return isRecord(state?.studyProgress?.studied) ? state.studyProgress.studied : {};
  }

  function withStudied(state, studied) {
    const progress = isRecord(state?.studyProgress) ? state.studyProgress : {};
    return {
      ...state,
      studyProgress: {
        ...progress,
        activeFocus: progress.activeFocus ?? null,
        reviews: isRecord(progress.reviews) ? progress.reviews : {},
        studied
      }
    };
  }

  function markStudied(state, moduleId, studiedAt = new Date().toISOString()) {
    if (!isIdentifier(moduleId)) throw new TypeError('Module IDs must be non-empty and cannot contain colons.');
    const reviewedAt = toIsoDate(studiedAt, 'Study time');
    return withStudied(state, { ...currentStudied(state), [moduleId]: reviewedAt });
  }

  function unmarkStudied(state, moduleId) {
    if (!isIdentifier(moduleId)) throw new TypeError('Module IDs must be non-empty and cannot contain colons.');
    const studied = { ...currentStudied(state) };
    delete studied[moduleId];
    return withStudied(state, studied);
  }

  function scheduleRecallReview(state, moduleId, promptIndex, result, reviewedAt = new Date().toISOString()) {
    const key = createReviewKey('recall', moduleId, promptIndex);
    if (!REVIEW_RESULTS.has(result)) throw new TypeError('Unknown recall result.');
    const reviewed = toIsoDate(reviewedAt, 'Review time');
    const reviews = { ...currentReviews(state) };
    const previous = reviews[key];
    const previousStreak = Number.isInteger(previous?.streak) && previous.streak >= 0 ? previous.streak : 0;

    let intervalDays;
    let streak;
    if (result === 'again') {
      intervalDays = 1;
      streak = 0;
    } else if (result === 'hard') {
      intervalDays = 3;
      streak = previousStreak;
    } else {
      intervalDays = previousStreak > 0
        ? Math.min(30, Math.max(3, Number(previous?.intervalDays) || 3) * 2)
        : 3;
      streak = previousStreak + 1;
    }

    const previousFailure = isValidDate(previous?.lastFailedAt)
      ? previous.lastFailedAt
      : previous?.lastResult === 'again' && isValidDate(previous.lastReviewedAt)
        ? previous.lastReviewedAt
        : null;
    const lastFailedAt = result === 'again' ? reviewed : previousFailure;
    reviews[key] = reviewRecord(
      'recall', moduleId, promptIndex, reviewed, intervalDays, streak, result, lastFailedAt
    );
    return withReviews(state, reviews);
  }

  function scheduleQuizReviews(state, quizId, missedQuestionIndexes, reviewedAt = new Date().toISOString()) {
    if (!isIdentifier(quizId)) throw new TypeError('Quiz IDs must be non-empty and cannot contain colons.');
    if (!Array.isArray(missedQuestionIndexes) || missedQuestionIndexes.some((index) => (
      !Number.isInteger(index) || index < 0
    ))) throw new TypeError('Missed question indexes must be non-negative integers.');
    const reviewed = toIsoDate(reviewedAt, 'Quiz review time');
    const reviews = Object.fromEntries(Object.entries(currentReviews(state)).filter(([, item]) => (
      item?.kind !== 'quiz-question' || item.sourceId !== quizId
    )));
    const indexes = [...new Set(missedQuestionIndexes)].sort((left, right) => left - right);

    for (const promptIndex of indexes) {
      const key = createReviewKey('quiz-question', quizId, promptIndex);
      reviews[key] = reviewRecord('quiz-question', quizId, promptIndex, reviewed, 1, 0, 'again');
    }
    return withReviews(state, reviews);
  }

  function scheduleProblemReview(state, attempt, reviewedAt = attempt?.attemptedAt || new Date().toISOString()) {
    if (!isRecord(attempt) || !isIdentifier(attempt.problemId)) {
      throw new TypeError('A problem attempt with a valid problem ID is required.');
    }
    const key = createReviewKey('problem', attempt.problemId);
    const assisted = Boolean(attempt.usedHint || attempt.reviewedSolution || (
      attempt.outcome === 'hint' || attempt.outcome === 'reviewed'
    ));
    const independent = Boolean(
      !assisted &&
      (attempt.solvedIndependently || attempt.outcome === 'independent') &&
      attempt.explainedAloud &&
      attempt.complexityCorrect
    );
    if (!assisted && !independent) return state;

    const reviewed = toIsoDate(reviewedAt, 'Problem review time');
    const reviews = { ...currentReviews(state) };
    const previous = reviews[key];
    if (assisted) {
      reviews[key] = reviewRecord('problem', attempt.problemId, null, reviewed, 2, 0, 'again');
    } else {
      const streak = Number.isInteger(previous?.streak) && previous.streak >= 0
        ? previous.streak + 1
        : 1;
      reviews[key] = reviewRecord('problem', attempt.problemId, null, reviewed, 7, streak, 'got-it');
    }
    return withReviews(state, reviews);
  }

  function getDueReviews(state, now = new Date().toISOString(), limit = 5) {
    const nowTime = Date.parse(toIsoDate(now, 'Review cutoff'));
    const cappedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 5;
    return Object.entries(currentReviews(state))
      .filter(([, review]) => isValidDate(review?.nextReviewAt) && Date.parse(review.nextReviewAt) <= nowTime)
      .map(([key, review]) => ({ ...review, key }))
      .sort((left, right) => {
        const failed = Number(left.lastResult !== 'again') - Number(right.lastResult !== 'again');
        if (failed) return failed;
        const overdue = Date.parse(left.nextReviewAt) - Date.parse(right.nextReviewAt);
        return overdue || left.key.localeCompare(right.key);
      })
      .slice(0, cappedLimit);
  }

  function eventTime(item, index) {
    for (const field of ['attemptedAt', 'completedAt', 'rehearsedAt', 'createdAt', 'updatedAt']) {
      if (isValidDate(item?.[field])) return Date.parse(item[field]);
    }
    return Number.MIN_SAFE_INTEGER + index;
  }

  function latestBySource(items, sourceField) {
    const latest = new Map();
    (Array.isArray(items) ? items : []).forEach((item, index) => {
      const sourceId = item?.[sourceField];
      if (!isNonEmptyString(sourceId)) return;
      const candidate = { item, index, time: eventTime(item, index), sourceId };
      const previous = latest.get(sourceId);
      if (!previous || candidate.time > previous.time || (
        candidate.time === previous.time && candidate.index > previous.index
      )) latest.set(sourceId, candidate);
    });
    return latest;
  }

  function legacyTasksComplete(stage, state) {
    const taskIds = Array.isArray(stage?.taskIds) ? stage.taskIds : [];
    return taskIds.length > 0 && taskIds.every((taskId) => Boolean(state?.completedTasks?.[taskId]));
  }

  function evidenceStatus(stage, state, status, hasTypedEvidence, allowLegacy = true) {
    if (allowLegacy && !hasTypedEvidence && legacyTasksComplete(stage, state)) {
      return { ...status, complete: true, evidence: 'legacy', quality: 'legacy' };
    }
    return { ...status, evidence: hasTypedEvidence ? 'typed' : 'none' };
  }

  function allModules(content) {
    return [
      ...(Array.isArray(content?.foundationModules) ? content.foundationModules : []),
      ...(Array.isArray(content?.codingModules) ? content.codingModules : []),
      ...(Array.isArray(content?.modernCvModules) ? content.modernCvModules : [])
    ];
  }

  function calculateModuleStatus(stage, state, content) {
    const moduleIds = Array.isArray(stage.reference?.moduleIds) ? stage.reference.moduleIds : [];
    const modules = new Map(allModules(content).map((module) => [module.id, module]));
    const reviews = currentReviews(state);
    const hasTypedEvidence = Object.values(reviews).some((review) => (
      review?.kind === 'recall' && moduleIds.includes(review.sourceId)
    ));
    const items = [];

    for (const moduleId of moduleIds) {
      const prompts = modules.get(moduleId)?.recall;
      if (!Array.isArray(prompts) || prompts.length === 0) {
        items.push({ sourceId: moduleId, promptIndex: null, result: null, complete: false });
        continue;
      }
      prompts.forEach((_prompt, promptIndex) => {
        const review = reviews[createReviewKey('recall', moduleId, promptIndex)];
        const complete = review?.lastResult === 'hard' || review?.lastResult === 'got-it';
        items.push({
          sourceId: moduleId,
          promptIndex,
          result: review?.lastResult || null,
          complete
        });
      });
    }

    const attempted = items.filter((item) => item.result !== null).length;
    const complete = items.length > 0 && items.every((item) => item.complete);
    const quality = complete
      ? 'retained'
      : items.some((item) => item.result === 'again')
        ? 'needs-review'
        : 'missing';
    return evidenceStatus(stage, state, {
      complete,
      kind: 'module',
      quality,
      attempted,
      total: items.length,
      items
    }, hasTypedEvidence);
  }

  function problemAttemptQuality(attempt) {
    if (!attempt) return 'missing';
    if (attempt.reviewedSolution || attempt.outcome === 'reviewed') return 'solution-reviewed';
    if (attempt.usedHint || attempt.outcome === 'hint') return 'hint-assisted';
    if (attempt.solvedIndependently || attempt.outcome === 'independent') return 'independent';
    return 'attempted';
  }

  function calculateProblemStatus(stage, state) {
    const problemIds = Array.isArray(stage.reference?.problemIds) ? stage.reference.problemIds : [];
    const latest = latestBySource(state?.problemAttempts, 'problemId');
    const hasTypedEvidence = (Array.isArray(state?.problemAttempts) ? state.problemAttempts : [])
      .some((attempt) => problemIds.includes(attempt?.problemId));
    const items = problemIds.map((problemId) => {
      const attempt = latest.get(problemId)?.item;
      return { sourceId: problemId, quality: problemAttemptQuality(attempt), attempt: attempt || null };
    });
    const attempted = items.filter((item) => item.attempt).length;
    const complete = problemIds.length > 0 && attempted === problemIds.length;
    let quality = 'missing';
    if (complete) {
      if (items.some((item) => item.quality === 'solution-reviewed')) quality = 'solution-reviewed';
      else if (items.some((item) => item.quality === 'hint-assisted')) quality = 'hint-assisted';
      else if (items.every((item) => item.quality === 'independent')) quality = 'independent';
      else quality = 'attempted';
    }
    return evidenceStatus(stage, state, {
      complete,
      kind: 'problem-set',
      quality,
      attempted,
      total: problemIds.length,
      items
    }, hasTypedEvidence);
  }

  function calculateQuizStatus(stage, state) {
    const quizIds = Array.isArray(stage.reference?.quizIds) ? stage.reference.quizIds : [];
    const latest = latestBySource(state?.quizAttempts, 'quizId');
    const hasTypedEvidence = (Array.isArray(state?.quizAttempts) ? state.quizAttempts : [])
      .some((attempt) => quizIds.includes(attempt?.quizId));
    const items = quizIds.map((quizId) => {
      const attempt = latest.get(quizId)?.item;
      const score = attempt ? Number(attempt.score) : null;
      return {
        sourceId: quizId,
        score: Number.isFinite(score) ? score : null,
        complete: Number.isFinite(score) && score >= 80,
        attempt: attempt || null
      };
    });
    const complete = quizIds.length > 0 && items.every((item) => item.complete);
    const quality = complete
      ? 'passed'
      : items.some((item) => item.attempt)
        ? 'needs-review'
        : 'missing';
    return evidenceStatus(stage, state, {
      complete,
      kind: 'quiz',
      quality,
      attempted: items.filter((item) => item.attempt).length,
      total: quizIds.length,
      items
    }, hasTypedEvidence);
  }

  function rubricQuality(scores) {
    if (!isRecord(scores) || Object.keys(scores).length === 0) return null;
    const entries = Object.entries(scores)
      .map(([dimension, value]) => [dimension, Number(value)])
      .filter(([, value]) => Number.isFinite(value))
      .sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]));
    if (entries.length !== Object.keys(scores).length) return null;
    return {
      scores: { ...scores },
      lowestDimension: entries[0][0],
      lowestScore: entries[0][1]
    };
  }

  function isValidDesignAnswerAttempt(attempt, caseId) {
    if (!isRecord(attempt) || attempt.caseId !== caseId || attempt.phase !== 'attempt') return false;
    const duration = Number(attempt.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) return false;
    return Boolean(isNonEmptyString(attempt.note) || rubricQuality(attempt.scores));
  }

  function calculateDesignStatus(stage, state) {
    const caseId = stage.reference?.caseId;
    const phase = stage.reference?.phase || 'attempt';
    const matches = (Array.isArray(state?.designAttempts) ? state.designAttempts : [])
      .filter((attempt) => (
        attempt?.caseId === caseId && (attempt.phase || 'attempt') === phase
      ));
    const latest = latestBySource(matches, 'caseId').get(caseId)?.item;

    if (phase === 'requirements' || phase === 'debrief') {
      const complete = Boolean(latest && isNonEmptyString(latest.note));
      return evidenceStatus(stage, state, {
        complete,
        kind: 'design-case',
        quality: complete ? 'recorded' : latest ? 'missing-note' : 'missing',
        phase,
        attempt: latest || null
      }, matches.length > 0, false);
    }

    const quality = rubricQuality(latest?.scores);
    const duration = Number(latest?.durationMinutes);
    const complete = phase === 'attempt'
      && Boolean(latest && Number.isFinite(duration) && duration > 0 && quality);
    return evidenceStatus(stage, state, {
      complete,
      kind: 'design-case',
      quality: quality || (latest ? 'invalid-rubric' : 'missing'),
      phase,
      attempt: latest || null
    }, matches.length > 0);
  }

  function positiveRequirementCount(value) {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  function calculateStoryStatus(stage, state) {
    const requirements = isRecord(stage?.reference?.requirements)
      ? stage.reference.requirements
      : {};
    const inventoryCount = positiveRequirementCount(requirements.inventoryCount);
    const savedStoryCount = positiveRequirementCount(requirements.savedStoryCount);
    const completedStoryCount = positiveRequirementCount(requirements.completedStoryCount);
    const rehearsalCount = positiveRequirementCount(requirements.rehearsalCount);
    const requirementKinds = Number(inventoryCount !== null)
      + Number(savedStoryCount !== null)
      + Number(completedStoryCount !== null)
      + Number(rehearsalCount !== null);
    const inventory = Array.isArray(state?.storyInventory) ? state.storyInventory : [];
    const validInventory = inventory.filter(isValidInventoryRecord);
    const stories = Array.isArray(state?.starStories) ? state.starStories : [];
    const rehearsals = Array.isArray(state?.rehearsals) ? state.rehearsals : [];
    const rehearsalKind = requirements.rehearsalKind || 'story';
    const hasRefIds = Object.hasOwn(requirements, 'refIds');
    const refIdsValid = !hasRefIds || (
      Array.isArray(requirements.refIds)
      && requirements.refIds.length > 0
      && requirements.refIds.every(isNonEmptyString)
    );

    if (requirementKinds !== 1 || (
      rehearsalCount !== null && (
        typeof requirements.withoutNotes !== 'boolean'
        || !REHEARSAL_KINDS.has(rehearsalKind)
        || !refIdsValid
      )
    )) {
      return evidenceStatus(stage, state, {
        complete: false,
        kind: 'story',
        quality: 'invalid-requirements',
        artifactType: null,
        count: 0,
        requiredCount: null
      }, inventory.length > 0 || stories.length > 0 || rehearsals.length > 0, false);
    }

    if (inventoryCount !== null) {
      const complete = validInventory.length >= inventoryCount;
      return evidenceStatus(stage, state, {
        complete,
        kind: 'story',
        quality: complete ? 'inventoried' : validInventory.length ? 'in-progress' : 'missing',
        artifactType: 'story-inventory',
        count: validInventory.length,
        requiredCount: inventoryCount
      }, inventory.length > 0, false);
    }

    if (savedStoryCount !== null) {
      const complete = stories.length >= savedStoryCount;
      return evidenceStatus(stage, state, {
        complete,
        kind: 'story',
        quality: complete ? 'saved' : stories.length ? 'draft' : 'missing',
        artifactType: 'saved-story',
        count: stories.length,
        requiredCount: savedStoryCount
      }, stories.length > 0, false);
    }

    if (completedStoryCount !== null) {
      const count = stories.reduce((sum, story) => sum + Number(Boolean(
        story?.complete
        && story.measurableImpact
        && story.individualContribution
        && Number.isFinite(story.durationMinutes)
        && story.durationMinutes > 0
        && story.durationMinutes <= 2
      )), 0);
      const complete = count >= completedStoryCount;
      return evidenceStatus(stage, state, {
        complete,
        kind: 'story',
        quality: complete ? 'complete' : stories.length ? 'draft' : 'missing',
        artifactType: 'completed-story',
        count,
        requiredCount: completedStoryCount
      }, stories.length > 0, false);
    }

    const matchingRehearsals = rehearsals.filter((rehearsal) => (
      (rehearsal?.kind || 'story') === rehearsalKind
      && (!hasRefIds || requirements.refIds.includes(rehearsal?.refId))
      && (!requirements.withoutNotes || rehearsal?.withoutNotes)
    ));
    const count = matchingRehearsals.length;
    const complete = count >= rehearsalCount;
    return evidenceStatus(stage, state, {
      complete,
      kind: 'story',
      quality: complete ? (requirements.withoutNotes ? 'rehearsed-without-notes' : 'rehearsed') : 'missing',
      artifactType: 'rehearsal',
      count,
      requiredCount: rehearsalCount,
      rehearsalKind,
      withoutNotes: requirements.withoutNotes,
      refIds: hasRefIds ? [...requirements.refIds] : null
    }, rehearsals.length > 0, false);
  }

  function isCompleteMockDebrief(debrief, mock, content) {
    if (!isRecord(debrief) || !isRecord(mock) || !isNonEmptyString(mock.packetId)) return false;
    const packet = (Array.isArray(content?.mockPackets) ? content.mockPackets : [])
      .find((candidate) => candidate?.id === mock.packetId);
    const dimensions = (Array.isArray(packet?.rubric) ? packet.rubric : [])
      .map((item) => item?.dimension)
      .filter(isNonEmptyString);
    const scores = isRecord(debrief.rubricScores) ? debrief.rubricScores : {};
    const rubricComplete = dimensions.length > 0 && dimensions.every((dimension) => (
      Object.hasOwn(scores, dimension)
      && Number.isInteger(Number(scores[dimension]))
      && Number(scores[dimension]) >= 1
      && Number(scores[dimension]) <= 5
    ));
    const weaknessesComplete = debrief.noMaterialWeakness === true || (
      Array.isArray(debrief.weaknesses)
      && debrief.weaknesses.length > 0
      && debrief.weaknesses.every((weakness) => (
        isRecord(weakness)
        && isNonEmptyString(weakness.text)
        && isNonEmptyString(weakness.remediation)
        && weakness.remediationComplete === true
      ))
    );
    return rubricComplete && isNonEmptyString(debrief.followUpNotes) && weaknessesComplete;
  }

  function calculateMockStatus(stage, state, content) {
    const requirements = isRecord(stage?.reference?.requirements)
      ? stage.reference.requirements
      : {};
    const mockType = requirements.mockType;
    const requiredCount = positiveRequirementCount(requirements.requiredCount);
    const phase = requirements.phase || 'attempt';
    const validRequirements = (mockType === 'coding' || mockType === 'ml-system')
      && requiredCount !== null
      && MOCK_PHASES.has(phase);
    const mocks = Array.isArray(state?.mocks) ? state.mocks : [];
    const matchingMocks = validRequirements
      ? mocks.filter((mock) => mock?.type === mockType)
      : [];
    const count = phase === 'debrief'
      ? matchingMocks.filter((mock) => isCompleteMockDebrief(mock.debrief, mock, content)).length
      : matchingMocks.length;
    const complete = validRequirements && count >= requiredCount;
    return evidenceStatus(stage, state, {
      complete,
      kind: 'mock',
      quality: validRequirements ? (complete ? (phase === 'debrief' ? 'debriefed' : 'saved') : 'missing') : 'invalid-requirements',
      mockType: validRequirements ? mockType : null,
      phase: validRequirements ? phase : null,
      count,
      requiredCount: validRequirements ? requiredCount : null
    }, matchingMocks.length > 0, phase !== 'debrief');
  }

  function occursAfter(value, cutoff) {
    return isValidDate(value) && isValidDate(cutoff) && Date.parse(value) > Date.parse(cutoff);
  }

  function remediationCutoff(target) {
    if (!isRecord(target) || !isValidDate(target.assignedAt)) return null;
    if (target.isCalibration === true) return target.assignedAt;
    if (target.isCalibration !== false || !isValidDate(target.failedAt)) return null;
    return new Date(Math.max(Date.parse(target.failedAt), Date.parse(target.assignedAt))).toISOString();
  }

  function calculateRemediationStatus(stage, state) {
    const target = isRecord(stage?.reference?.target) ? stage.reference.target : null;
    const cutoff = remediationCutoff(target);
    let complete = false;
    let latestEvidence = null;

    if (target?.kind === 'recall' && isIdentifier(target.sourceId)
      && Number.isInteger(target.promptIndex) && target.promptIndex >= 0) {
      const review = currentReviews(state)[createReviewKey('recall', target.sourceId, target.promptIndex)];
      latestEvidence = review || null;
      complete = Boolean(
        review
        && (review.lastResult === 'hard' || review.lastResult === 'got-it')
        && occursAfter(review.lastReviewedAt, cutoff)
      );
    } else if (target?.kind === 'quiz' && isIdentifier(target.quizId || target.sourceId)) {
      const quizId = target.quizId || target.sourceId;
      const attempts = (Array.isArray(state?.quizAttempts) ? state.quizAttempts : [])
        .filter((attempt) => attempt?.quizId === quizId)
        .map((attempt, index) => ({ attempt, index }))
        .sort((left, right) => eventTime(right.attempt, right.index) - eventTime(left.attempt, left.index));
      latestEvidence = attempts[0]?.attempt || null;
      complete = attempts.some(({ attempt }) => (
        Number(attempt?.score) >= 80 && occursAfter(attempt?.attemptedAt, cutoff)
      ));
    } else if (target?.kind === 'problem' && isIdentifier(target.problemId || target.sourceId)) {
      const problemId = target.problemId || target.sourceId;
      const attempts = (Array.isArray(state?.problemAttempts) ? state.problemAttempts : [])
        .filter((attempt) => attempt?.problemId === problemId)
        .map((attempt, index) => ({ attempt, index }))
        .sort((left, right) => eventTime(right.attempt, right.index) - eventTime(left.attempt, left.index));
      latestEvidence = attempts[0]?.attempt || null;
      complete = attempts.some(({ attempt }) => (
        independentRetentionAttempt(attempt) && occursAfter(attempt?.attemptedAt, cutoff)
      ));
    } else if (target?.kind === 'design' && isIdentifier(target.caseId || target.sourceId)
      && isNonEmptyString(target.dimension)) {
      const caseId = target.caseId || target.sourceId;
      const attempts = (Array.isArray(state?.designAttempts) ? state.designAttempts : [])
        .filter((attempt) => attempt?.caseId === caseId && (attempt.phase || 'attempt') === 'attempt')
        .map((attempt, index) => ({ attempt, index }))
        .sort((left, right) => eventTime(right.attempt, right.index) - eventTime(left.attempt, left.index));
      latestEvidence = attempts[0]?.attempt || null;
      complete = attempts.some(({ attempt }) => {
        const quality = rubricQuality(attempt?.scores);
        const duration = Number(attempt?.durationMinutes);
        return Boolean(
          quality
          && Number.isFinite(duration)
          && duration > 0
          && Number(quality.scores[target.dimension]) >= 4
          && occursAfter(attempt?.attemptedAt, cutoff)
        );
      });
    }

    return {
      complete,
      kind: 'remediation',
      evidence: 'typed',
      quality: complete ? 'repaired' : target ? 'needs-reattempt' : 'invalid-target',
      target,
      latestEvidence
    };
  }

  function calculateStageStatus(stage, state, content = {}) {
    const referenceType = stage?.reference?.type;
    if (referenceType === 'module') return calculateModuleStatus(stage, state, content);
    if (referenceType === 'problem-set') return calculateProblemStatus(stage, state);
    if (referenceType === 'quiz') return calculateQuizStatus(stage, state);
    if (referenceType === 'design-case') return calculateDesignStatus(stage, state);
    if (referenceType === 'story') return calculateStoryStatus(stage, state);
    if (referenceType === 'mock') return calculateMockStatus(stage, state, content);
    if (referenceType === 'remediation') return calculateRemediationStatus(stage, state);

    const complete = legacyTasksComplete(stage, state);
    return {
      complete,
      kind: referenceType || 'instruction',
      evidence: 'manual',
      quality: complete ? 'marked-done' : 'not-marked'
    };
  }

  function normalizeEvidenceContext(sessionGuides, content) {
    if (isRecord(sessionGuides) && isRecord(sessionGuides.sessionGuides)) {
      return {
        sessionGuides: sessionGuides.sessionGuides,
        content: sessionGuides.content || sessionGuides
      };
    }
    return { sessionGuides, content: content || {} };
  }

  function isTaskComplete(taskId, state, sessionGuides, content = {}) {
    const context = normalizeEvidenceContext(sessionGuides, content);
    const guides = isRecord(context.sessionGuides) ? Object.values(context.sessionGuides) : [];
    for (const guide of guides) {
      const stage = (Array.isArray(guide?.stages) ? guide.stages : [])
        .find((candidate) => candidate?.taskIds?.includes(taskId));
      if (stage) return calculateStageStatus(stage, state, context.content).complete;
    }
    return Boolean(state?.completedTasks?.[taskId]);
  }

  function getFirstIncompleteStage(guide, state, content = {}) {
    const stages = Array.isArray(guide?.stages) ? guide.stages : [];
    return stages.find((stage) => !calculateStageStatus(stage, state, content).complete) || null;
  }

  function sortLatestCandidates(candidates, idField) {
    return candidates.slice().sort((left, right) => (
      right.time - left.time ||
      String(left.item?.[idField] || '').localeCompare(String(right.item?.[idField] || '')) ||
      right.index - left.index
    ));
  }

  function linkedQuizModules(quizId, context) {
    const direct = context?.quizModuleIds?.[quizId];
    if (Array.isArray(direct)) return [...new Set(direct)];
    const quiz = (Array.isArray(context?.content?.quizzes) ? context.content.quizzes : [])
      .find((item) => item.id === quizId);
    const declared = quiz?.moduleIds || quiz?.linkedModuleIds;
    if (Array.isArray(declared)) return [...new Set(declared)];

    const guides = context?.sessionGuides
      ? Object.values(context.sessionGuides)
      : [context?.currentGuide, context?.nextGuide].filter(Boolean);
    for (const guide of guides) {
      const stages = Array.isArray(guide?.stages) ? guide.stages : [];
      const quizIndex = stages.findIndex((stage) => (
        stage?.reference?.type === 'quiz' && stage.reference.quizIds?.includes(quizId)
      ));
      if (quizIndex < 0) continue;
      const moduleIds = stages.slice(0, quizIndex).flatMap((stage) => (
        stage?.reference?.type === 'module' ? stage.reference.moduleIds || [] : []
      ));
      return [...new Set(moduleIds)];
    }
    return [];
  }

  function latestFailedQuiz(state) {
    const latest = latestBySource(state?.quizAttempts, 'quizId');
    const failed = [...latest.values()].filter(({ item }) => {
      const score = Number(item?.score);
      return Number.isFinite(score) && score < 80;
    });
    return sortLatestCandidates(failed, 'quizId')[0] || null;
  }

  function independentRetentionAttempt(attempt) {
    return Boolean(
      (attempt?.solvedIndependently || attempt?.outcome === 'independent') &&
      !attempt?.usedHint &&
      !attempt?.reviewedSolution &&
      attempt?.outcome !== 'hint' &&
      attempt?.outcome !== 'reviewed' &&
      attempt?.explainedAloud &&
      attempt?.complexityCorrect
    );
  }

  function latestUnresolvedProblem(state) {
    const attempts = (Array.isArray(state?.problemAttempts) ? state.problemAttempts : [])
      .map((item, index) => ({ item, index, time: eventTime(item, index) }))
      .filter(({ item }) => isNonEmptyString(item?.problemId))
      .sort((left, right) => left.time - right.time || left.index - right.index);
    const unresolved = new Map();
    for (const candidate of attempts) {
      const attempt = candidate.item;
      const assisted = attempt.usedHint || attempt.reviewedSolution || (
        attempt.outcome === 'hint' || attempt.outcome === 'reviewed'
      );
      if (assisted) unresolved.set(attempt.problemId, candidate);
      else if (independentRetentionAttempt(attempt)) unresolved.delete(attempt.problemId);
    }
    return sortLatestCandidates([...unresolved.values()], 'problemId')[0] || null;
  }

  function latestDesignWeakness(state) {
    const candidates = (Array.isArray(state?.designAttempts) ? state.designAttempts : [])
      .map((item, index) => ({ item, index, time: eventTime(item, index), quality: rubricQuality(item?.scores) }))
      .filter((candidate) => isNonEmptyString(candidate.item?.caseId) && candidate.quality);
    const latest = sortLatestCandidates(candidates, 'caseId')[0];
    if (!latest || latest.quality.lowestScore >= 4) return null;
    return latest;
  }

  function resolveCurrentGuide(context) {
    if (context?.currentGuide) return context.currentGuide;
    if (context?.guide) return context.guide;
    if (context?.sessionId && context?.sessionGuides?.[context.sessionId]) {
      return context.sessionGuides[context.sessionId];
    }
    return null;
  }

  function resolveNextGuide(context, currentGuide) {
    if (context?.nextGuide) return context.nextGuide;
    if (!isRecord(context?.sessionGuides) || !currentGuide) return null;
    const guides = Object.values(context.sessionGuides);
    const currentIndex = guides.findIndex((guide) => guide === currentGuide || guide.sessionId === currentGuide.sessionId);
    return currentIndex >= 0 ? guides[currentIndex + 1] || null : null;
  }

  function getWeakAreaRecommendation(state, context = {}) {
    const failedQuiz = latestFailedQuiz(state);
    if (failedQuiz) {
      const quizId = failedQuiz.item.quizId;
      const quiz = (Array.isArray(context?.content?.quizzes) ? context.content.quizzes : [])
        .find((item) => item.id === quizId);
      const moduleIds = linkedQuizModules(quizId, context);
      return {
        kind: 'quiz',
        action: 'retake-quiz',
        title: moduleIds.length
          ? `Review ${moduleIds.join(', ')} and retake ${quiz?.title || quizId}`
          : `Review missed explanations and retake ${quiz?.title || quizId}`,
        quizId,
        sourceId: quizId,
        moduleIds,
        score: Number(failedQuiz.item.score),
        route: quiz?.area === 'modern-cv' ? 'modern-cv' : 'foundations'
      };
    }

    const unresolvedProblem = latestUnresolvedProblem(state);
    if (unresolvedProblem) {
      const attempt = unresolvedProblem.item;
      const assistance = attempt.reviewedSolution || attempt.outcome === 'reviewed'
        ? 'solution-reviewed'
        : 'hint-assisted';
      return {
        kind: 'problem',
        action: 'repeat-problem-cold',
        title: `Repeat ${attempt.problemId} cold and explain its complexity`,
        problemId: attempt.problemId,
        sourceId: attempt.problemId,
        assistance,
        route: 'coding'
      };
    }

    const designWeakness = latestDesignWeakness(state);
    if (designWeakness) {
      const { item, quality } = designWeakness;
      return {
        kind: 'design',
        action: 'repair-design-dimension',
        title: `Repair ${quality.lowestDimension} in ${item.caseId}`,
        caseId: item.caseId,
        sourceId: item.caseId,
        dimension: quality.lowestDimension,
        score: quality.lowestScore,
        route: 'system-design'
      };
    }

    const currentGuide = resolveCurrentGuide(context);
    if (currentGuide) {
      const stage = getFirstIncompleteStage(currentGuide, state, context.content || {});
      if (stage) {
        return {
          kind: 'stage',
          action: 'continue-stage',
          title: stage.title || 'Continue the scheduled stage',
          sessionId: currentGuide.sessionId,
          stageId: stage.id,
          taskIds: [...(stage.taskIds || [])],
          route: 'today'
        };
      }
      const nextGuide = resolveNextGuide(context, currentGuide);
      if (nextGuide) {
        return {
          kind: 'session',
          action: 'start-session',
          title: nextGuide.title || 'Start the next scheduled session',
          sessionId: nextGuide.sessionId,
          stageId: nextGuide.stages?.[0]?.id || null,
          route: 'today'
        };
      }
    } else if (isRecord(context?.sessionGuides)) {
      for (const guide of Object.values(context.sessionGuides)) {
        const stage = getFirstIncompleteStage(guide, state, context.content || {});
        if (stage) {
          return {
            kind: 'stage',
            action: 'continue-stage',
            title: stage.title || 'Continue the scheduled stage',
            sessionId: guide.sessionId,
            stageId: stage.id,
            taskIds: [...(stage.taskIds || [])],
            route: 'today'
          };
        }
      }
    }

    return {
      kind: 'continue',
      action: 'continue-plan',
      title: 'Continue to the next scheduled session',
      route: 'today'
    };
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function gate(status, current, target, detail) {
    return { status, current, target, detail };
  }

  function calculateReadiness(state, criteria = {}, sessionGuides, content) {
    const requiredFoundationTaskIds = criteria.requiredFoundationTaskIds || [];
    const evidenceContext = criteria.sessionGuides
      ? { sessionGuides: criteria.sessionGuides, content: criteria.content || content || {} }
      : normalizeEvidenceContext(sessionGuides, criteria.content || content);

    const randomMediums = state.problemAttempts
      .filter((attempt) => attempt.random && attempt.difficulty === 'medium')
      .slice(-5);
    const passingMediums = randomMediums.filter((attempt) => (
      attempt.solvedIndependently &&
      attempt.minutes <= 30 &&
      attempt.explainedAloud &&
      attempt.complexityCorrect
    )).length;
    const codingStatus = randomMediums.length < 5 ? 'red' : passingMediums >= 4 ? 'green' : 'amber';

    const recentQuizzes = state.quizAttempts.slice(-5);
    const quizAverage = average(recentQuizzes.map((attempt) => Number(attempt.score) || 0));
    const taskMetricAttempts = recentQuizzes.filter((attempt) => attempt.kind === 'task-metric');
    const taskMetricAverage = average(taskMetricAttempts.map((attempt) => Number(attempt.score) || 0));
    const rapidFirePassed = recentQuizzes.some((attempt) => (
      attempt.kind === 'rapid-fire' && attempt.noNotes && attempt.score >= 80
    ));
    const requiredFoundationsDone = requiredFoundationTaskIds.every((id) => (
      isTaskComplete(id, state, evidenceContext.sessionGuides, evidenceContext.content)
    ));
    const foundationEvidenceComplete = (
      recentQuizzes.length >= 3 && taskMetricAttempts.length >= 1 && rapidFirePassed && requiredFoundationsDone
    );
    const foundationsStatus = !foundationEvidenceComplete
      ? 'red'
      : quizAverage >= 80 && taskMetricAverage >= 80
        ? 'green'
        : 'amber';

    const recentDesigns = state.designAttempts
      .filter((attempt) => (attempt.phase || 'attempt') === 'attempt')
      .slice(-2);
    const designPasses = recentDesigns.filter((attempt) => (
      attempt.durationMinutes <= 40 &&
      attempt.scores &&
      Object.keys(attempt.scores).length >= 10 &&
      Object.values(attempt.scores).every((score) => score >= 4)
    )).length;
    const systemDesignStatus = recentDesigns.length < 2 ? 'red' : designPasses === 2 ? 'green' : 'amber';

    const qualifyingStories = state.starStories.filter((story) => (
      story.complete
      && Number.isFinite(story.durationMinutes)
      && story.durationMinutes > 0
      && story.durationMinutes <= 2
      && story.measurableImpact
      && story.individualContribution
    ));
    const leadershipStories = qualifyingStories.filter((story) => story.leadership).length;
    const noNotesRehearsals = state.rehearsals.filter((rehearsal) => (
      (rehearsal.kind || 'story') === 'story' && rehearsal.withoutNotes
    )).length;
    const knownPromptIds = new Set(
      (Array.isArray(evidenceContext.content?.behavioralPrompts)
        ? evidenceContext.content.behavioralPrompts
        : [])
        .map((prompt) => prompt?.id)
        .filter(isNonEmptyString)
        .map((promptId) => promptId.trim())
    );
    const coveredPrompts = new Set(
      qualifyingStories
        .map((story) => story.promptId)
        .filter((promptId) => isNonEmptyString(promptId) && knownPromptIds.has(promptId.trim()))
        .map((promptId) => promptId.trim())
    );
    const behaviorEvidenceComplete = coveredPrompts.size >= 8;
    const behavioralStatus = !behaviorEvidenceComplete
      ? 'red'
      : qualifyingStories.length >= 8 && leadershipStories >= 2 && noNotesRehearsals >= 2
        ? 'green'
        : 'amber';

    const codingMocks = state.mocks.filter((mock) => mock.type === 'coding');
    const mlSystemMocks = state.mocks.filter((mock) => mock.type === 'ml-system');
    const latestCodingMock = codingMocks.at(-1);
    const latestMlSystemMock = mlSystemMocks.at(-1);
    const mockEvidenceComplete = codingMocks.length >= 2 && mlSystemMocks.length >= 2;
    const weaknessesRemediated = mockEvidenceComplete
      && state.mocks.filter((mock) => isCompleteMockDebrief(mock.debrief, mock, evidenceContext.content)).length >= 1;
    const mocksStatus = !mockEvidenceComplete
      ? 'red'
      : latestCodingMock.wouldAdvance && latestMlSystemMock.wouldAdvance && weaknessesRemediated
        ? 'green'
        : 'amber';

    const gates = {
      coding: gate(codingStatus, passingMediums, 4, 'Four of five random mediums in 30 minutes'),
      foundations: gate(foundationsStatus, Math.round(quizAverage), 80, 'Recent quizzes and task-to-metric judgment'),
      systemDesign: gate(systemDesignStatus, designPasses, 2, 'Two rubric-passing 40-minute designs'),
      behavioral: gate(behavioralStatus, qualifyingStories.length, 8, 'Eight concise, evidence-backed stories'),
      mocks: gate(mocksStatus, codingMocks.length + mlSystemMocks.length, 4, 'Two coding and two ML/system mocks')
    };
    const overall = Object.values(gates).every((item) => item.status === 'green') ? 'green' : 'red';
    return { overall, gates };
  }

  function isApplicationUnlocked(state, readiness) {
    const hasOverride = Boolean(state.readinessOverride && state.readinessOverride.reason?.trim());
    return readiness.overall === 'green' || hasOverride;
  }

  function calculatePlanProgress(taskIds, state, sessionGuides, content) {
    const context = normalizeEvidenceContext(sessionGuides, content);
    const total = taskIds.length;
    const completed = taskIds.filter((id) => (
      isTaskComplete(id, state, context.sessionGuides, context.content)
    )).length;
    return {
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  }

  function calculateStudyStats(state, plannedMinutes = 7200) {
    const actualMinutes = state.timeEntries.reduce((sum, entry) => sum + (Number(entry.minutes) || 0), 0);
    return {
      actualMinutes,
      plannedMinutes,
      percent: plannedMinutes ? Math.round((actualMinutes / plannedMinutes) * 1000) / 10 : 0
    };
  }

  function getCurrentWeek(date, startDate = '2026-07-27') {
    const current = new Date(`${date.slice(0, 10)}T00:00:00Z`).getTime();
    const start = new Date(`${startDate}T00:00:00Z`).getTime();
    const week = Math.floor((current - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.min(10, Math.max(1, week));
  }

  function getLearningProgress(state, groups) {
    const studied = currentStudied(state);
    const areas = {};
    let total = 0;
    let studiedCount = 0;
    for (const [area, modules] of Object.entries(groups || {})) {
      const list = Array.isArray(modules) ? modules : [];
      const areaTotal = list.length;
      const areaStudied = list.filter((module) => Object.hasOwn(studied, module.id)).length;
      const next = list.find((module) => !Object.hasOwn(studied, module.id)) || null;
      areas[area] = {
        total: areaTotal,
        studied: areaStudied,
        remaining: areaTotal - areaStudied,
        nextModuleId: next ? next.id : null,
        percent: areaTotal ? Math.round((areaStudied / areaTotal) * 1000) / 10 : 0
      };
      total += areaTotal;
      studiedCount += areaStudied;
    }
    return {
      areas,
      total,
      studied: studiedCount,
      percent: total ? Math.round((studiedCount / total) * 1000) / 10 : 0
    };
  }

  return {
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
    isValidDesignAnswerAttempt,
    isTaskComplete,
    markStudied,
    scheduleProblemReview,
    scheduleQuizReviews,
    scheduleRecallReview,
    startTimer,
    stopTimer,
    unmarkStudied,
    validateImportedState,
    updateMockDebrief
  };
});
