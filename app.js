(function bootstrapInterviewPrep() {
  'use strict';

  const data = window.InterviewPrepData || {};
  const logic = window.InterviewPrepLogic;
  const STORAGE_KEY_V2 = 'ml-cv-interview-prep:v2';
  const STORAGE_KEY_V1 = 'ml-cv-interview-prep:v1';
  const PLANNED_MINUTES = 120 * 60;
  const RUBRIC_DIMENSIONS = [
    'requirements', 'metrics', 'data', 'model', 'evaluation',
    'serving', 'monitoring', 'feedback', 'tradeoffs', 'communication'
  ];
  const routes = new Set([
    'today', 'overview', 'plan', 'coding', 'foundations', 'system-design',
    'modern-cv', 'behavioral', 'mocks', 'applications', 'data'
  ]);

  if (!logic) throw new Error('InterviewPrepLogic must load before app.js.');

  const view = document.querySelector('#view');
  const sidebar = document.querySelector('#sidebar');
  const importInput = document.querySelector('#import-input');
  const mobileMenu = document.querySelector('#mobile-menu');
  const themeToggle = document.querySelector('#theme-toggle');

  let state = loadState();
  let timerInterval = null;
  let problemFilter = 'all';
  let editingStoryIndex = null;
  let editingApplicationIndex = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function safeId(value) {
    return String(value ?? 'item').replace(/[^a-zA-Z0-9_-]+/g, '-');
  }

  function todayIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString, options = {}) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      weekday: options.weekday === false ? undefined : 'short',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(date);
  }

  function formatMinutes(minutes) {
    const rounded = Math.round(Number(minutes) || 0);
    const hours = Math.floor(rounded / 60);
    const remainder = rounded % 60;
    if (!hours) return `${remainder}m`;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  function formatTimer(minutes) {
    const totalSeconds = Math.max(0, Math.floor((Number(minutes) || 0) * 60));
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, mins, seconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }

  function allSessions() {
    return (data.weeks || []).flatMap((week) => week.sessions || []);
  }

  function allTasks() {
    return allSessions().flatMap((session) => session.tasks || []);
  }

  function allModules() {
    return [
      ...(data.foundationModules || []),
      ...(data.codingModules || []),
      ...(data.modernCvModules || [])
    ];
  }

  function learningModuleGroups() {
    return {
      coding: data.codingModules || [],
      foundations: (data.foundationModules || []).filter((module) => module.required),
      'modern-cv': data.modernCvModules || []
    };
  }

  function findSession(sessionId) {
    return allSessions().find((session) => session.id === sessionId) || null;
  }

  function findGuideStage(sessionId, stageId) {
    const guide = data.sessionGuides?.[sessionId];
    const stage = guide?.stages?.find((candidate) => candidate.id === stageId) || null;
    return stage ? { guide, stage, session: findSession(sessionId) } : null;
  }

  function findModule(moduleId) {
    return allModules().find((module) => module.id === moduleId) || null;
  }

  function findProblem(problemId) {
    return (data.problems || []).find((problem) => problem.id === problemId) || null;
  }

  function findQuiz(quizId) {
    return (data.quizzes || []).find((quiz) => quiz.id === quizId) || null;
  }

  function findDesignCase(caseId) {
    return (data.systemDesignCases || []).find((item) => item.id === caseId) || null;
  }

  function findResource(resourceId) {
    return (data.resources || []).find((resource) => resource.id === resourceId) || null;
  }

  function latestFor(items, field, value) {
    return (items || []).filter((item) => item?.[field] === value).at(-1) || null;
  }

  function moduleRoute(moduleId) {
    if ((data.codingModules || []).some((module) => module.id === moduleId)) return 'coding';
    if ((data.modernCvModules || []).some((module) => module.id === moduleId)) return 'modern-cv';
    return 'foundations';
  }

  function loadValidated(raw) {
    if (!raw) return null;
    try {
      const result = logic.validateImportedState(JSON.parse(raw));
      return result.ok ? result.value : null;
    } catch (_error) {
      return null;
    }
  }

  function loadState() {
    try {
      const validatedV2 = loadValidated(localStorage.getItem(STORAGE_KEY_V2));
      if (validatedV2?.schemaVersion === 3) return validatedV2;

      const migratedV1 = loadValidated(localStorage.getItem(STORAGE_KEY_V1));
      if (migratedV1?.schemaVersion === 3) {
        try {
          localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migratedV1));
        } catch (_error) {
          return logic.createInitialState();
        }
        try {
          localStorage.removeItem(STORAGE_KEY_V1);
        } catch (_error) {
          // The v2 write succeeded. Keeping the read-only fallback is harmless.
        }
        return migratedV1;
      }
    } catch (_error) {
      return logic.createInitialState();
    }
    return logic.createInitialState();
  }

  function synchronizeGuidedTasks(candidate) {
    const completedTasks = { ...(candidate.completedTasks || {}) };
    const workingState = { ...candidate, completedTasks };

    Object.values(data.sessionGuides || {}).forEach((guide) => {
      (guide.stages || []).forEach((stage) => {
        const status = logic.calculateStageStatus(stage, workingState, data);
        (stage.taskIds || []).forEach((taskId) => {
          if (status.complete) completedTasks[taskId] = true;
          else if (status.evidence === 'typed') delete completedTasks[taskId];
        });
      });
    });

    return workingState;
  }

  function commitState(candidate, message, options = {}) {
    const nextState = options.syncGuided === false
      ? candidate
      : synchronizeGuidedTasks(candidate);

    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(nextState));
    } catch (_error) {
      toast('Progress could not be saved. This change was not applied.');
      return false;
    }

    state = nextState;
    updateGlobalChrome();
    if (message) toast(message);
    if (options.rerender !== false) render();
    return true;
  }

  function requiredFoundationTaskIds() {
    const requiredModules = new Set(
      (data.foundationModules || [])
        .filter((module) => module.required)
        .map((module) => module.id)
    );
    const taskIds = new Set();

    Object.values(data.sessionGuides || {}).forEach((guide) => {
      (guide.stages || []).forEach((stage) => {
        if (stage.reference?.type !== 'module') return;
        if (!(stage.reference.moduleIds || []).some((moduleId) => requiredModules.has(moduleId))) return;
        (stage.taskIds || []).forEach((taskId) => taskIds.add(taskId));
      });
    });

    return [...taskIds];
  }

  function readiness() {
    return logic.calculateReadiness(state, {
      requiredFoundationTaskIds: requiredFoundationTaskIds(),
      sessionGuides: data.sessionGuides || {},
      content: data
    });
  }

  function calculateProgress(taskIds) {
    return logic.calculatePlanProgress(taskIds, state, data.sessionGuides || {}, data);
  }

  function currentRoute() {
    const candidate = location.hash.replace(/^#\/?/, '') || 'today';
    return routes.has(candidate) ? candidate : 'today';
  }

  function navigate(route) {
    if (!routes.has(route)) return;
    if (currentRoute() === route) render();
    else location.hash = route;
  }

  function relevantSession() {
    const sessions = allSessions();
    const today = todayIso();
    return sessions.find((session) => session.date === today)
      || sessions.find((session) => session.date > today)
      || sessions.at(-1)
      || null;
  }

  function nextGuideAfter(guide) {
    const guides = allSessions().map((session) => data.sessionGuides?.[session.id]).filter(Boolean);
    const index = guides.findIndex((candidate) => candidate.sessionId === guide?.sessionId);
    return index >= 0 ? guides[index + 1] || null : null;
  }

  function render() {
    const route = currentRoute();
    const renderers = {
      today: renderToday,
      overview: renderOverview,
      plan: renderPlan,
      coding: renderCoding,
      foundations: renderFoundations,
      'system-design': renderSystemDesign,
      'modern-cv': renderModernCv,
      behavioral: renderBehavioral,
      mocks: renderMocks,
      applications: renderApplications,
      data: renderData
    };

    document.querySelectorAll('[data-route]').forEach((control) => {
      const active = control.dataset.route === route;
      control.classList.toggle('is-active', active);
      if (active) control.setAttribute('aria-current', 'page');
      else control.removeAttribute('aria-current');
    });

    view.innerHTML = renderers[route]();
    updateGlobalChrome();
    updateTimerDisplay();
    ensureTimerInterval();
    sidebar.classList.remove('is-open');
    mobileMenu.setAttribute('aria-expanded', 'false');

    const focus = state.studyProgress?.activeFocus;
    if (route === 'today' && focus) {
      requestAnimationFrame(() => {
        document.querySelector(`#${safeId(`stage-card-${focus.stageId}`)}`)
          ?.scrollIntoView({ block: 'center' });
      });
    }
  }

  function pageHeader(eyebrow, title, lede, action = '') {
    return `
      <header class="page-header">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="lede">${escapeHtml(lede)}</p>
        </div>
        ${action}
      </header>`;
  }

  function toast(message) {
    const region = document.querySelector('#toast-region');
    if (!region) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    region.append(node);
    setTimeout(() => node.remove(), 3200);
  }

  function noteSection(title, items) {
    const entries = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!entries.length) return '';
    return `
      <section class="note-section">
        <h3>${escapeHtml(title)}</h3>
        <ul>${entries.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>`;
  }
  function codeBlock(snippets) {
    const list = Array.isArray(snippets) ? snippets.filter((snippet) => snippet && snippet.body) : [];
    if (!list.length) return '';
    return `
      <section class="note-section">
        <h3>Python</h3>
        ${list.map((snippet) => `<figure class="code-block"><figcaption>${escapeHtml(snippet.label)}</figcaption><pre><code>${escapeHtml(snippet.body)}</code></pre></figure>`).join('')}
      </section>`;
  }


  function metricCard(label, value, detail, percent, tone = '') {
    const width = Math.min(100, Math.max(0, Number(percent) || 0));
    return `
      <article class="card metric-card">
        <span class="metric-label">${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(detail)}</span>
        <div class="progress-track section-gap" aria-hidden="true">
          <div class="progress-fill ${tone}" style="width:${width}%"></div>
        </div>
      </article>`;
  }

  function statusText(status) {
    if (status.complete) return 'Complete';
    if (Number.isFinite(status.attempted) && Number.isFinite(status.total)) {
      return `${status.attempted}/${status.total} evidence items`;
    }
    if (Number.isFinite(status.count) && Number.isFinite(status.requiredCount)) {
      return `${status.count}/${status.requiredCount} saved`;
    }
    return status.quality === 'needs-review' ? 'Needs review' : 'Evidence needed';
  }

  function statusBadge(status) {
    const tone = status.complete ? 'status-green' : status.quality === 'needs-review' ? 'status-red' : 'status-amber';
    return `<span class="status-badge evidence-badge ${tone}">${escapeHtml(statusText(status))}</span>`;
  }

  function reviewRecord(moduleId, promptIndex) {
    const key = logic.createReviewKey('recall', moduleId, promptIndex);
    return state.studyProgress?.reviews?.[key] || null;
  }

  function isStudied(moduleId) {
    return Boolean(state.studyProgress?.studied && Object.hasOwn(state.studyProgress.studied, moduleId));
  }

  function studiedAt(moduleId) {
    return state.studyProgress?.studied?.[moduleId] || null;
  }

  function renderRecallPrompt(module, prompt, promptIndex, prefix) {
    const record = reviewRecord(module.id, promptIndex);
    const baseId = safeId(`${prefix}-${module.id}-${promptIndex}`);
    const answerId = `${baseId}-answer`;
    const revealId = `${baseId}-reveal`;
    return `
      <article class="recall-card">
        <div class="recall-prompt-row">
          <strong>${escapeHtml(prompt.question)}</strong>
          ${record ? `<span class="pill">Last: ${escapeHtml(record.lastResult.replace('-', ' '))}</span>` : ''}
        </div>
        <div id="${revealId}" class="reveal-wrapper">
          <button class="button button-small" type="button" data-action="reveal-answer" data-target="${answerId}" data-wrap="${revealId}" aria-controls="${answerId}" aria-expanded="false">Reveal answer</button>
        </div>
        <div class="recall-answer" id="${answerId}" hidden>
          <p>${escapeHtml(prompt.answer)}</p>
          <fieldset class="rating-fieldset">
            <legend>How well did you retrieve it?</legend>
            <div class="rating-actions">
              <button class="button button-small" type="button" data-action="rate-recall" data-rating="again" data-module-id="${escapeHtml(module.id)}" data-prompt-index="${promptIndex}">Again</button>
              <button class="button button-small" type="button" data-action="rate-recall" data-rating="hard" data-module-id="${escapeHtml(module.id)}" data-prompt-index="${promptIndex}">Hard</button>
              <button class="button button-small button-primary" type="button" data-action="rate-recall" data-rating="got-it" data-module-id="${escapeHtml(module.id)}" data-prompt-index="${promptIndex}">Got it</button>
            </div>
          </fieldset>
        </div>
      </article>`;
  }

  function renderDueRecall(item, index) {
    const module = findModule(item.sourceId);
    const prompt = module?.recall?.[item.promptIndex];
    if (!module || !prompt) return '';
    return `
      <article class="card review-card">
        <div class="card-header">
          <div><p class="eyebrow">Recall review</p><h3>${escapeHtml(module.title)}</h3></div>
          <span class="pill">Due ${escapeHtml(formatDate(item.nextReviewAt.slice(0, 10), { weekday: false }))}</span>
        </div>
        ${renderRecallPrompt(module, prompt, item.promptIndex, `due-recall-${index}`)}
        <a class="button button-small" href="#${moduleRoute(module.id)}">Browse full module</a>
      </article>`;
  }

  function renderDueQuiz(item, index) {
    const quiz = findQuiz(item.sourceId);
    const question = quiz?.questions?.[item.promptIndex];
    if (!quiz || !question) return '';
    const answerId = safeId(`due-quiz-${index}-${quiz.id}-${item.promptIndex}-answer`);
    const revealId = `${answerId}-reveal`;
    const correctAnswer = question.options?.[question.answerIndex] || '';
    return `
      <article class="card review-card">
        <div class="card-header">
          <div><p class="eyebrow">Missed quiz question</p><h3>${escapeHtml(quiz.title)}</h3></div>
          <span class="pill">Question ${item.promptIndex + 1}</span>
        </div>
        <p><strong>${escapeHtml(question.prompt)}</strong></p>
        <ul class="review-options">${(question.options || []).map((option) => `<li>${escapeHtml(option)}</li>`).join('')}</ul>
        <div id="${revealId}" class="reveal-wrapper">
          <button class="button button-small" type="button" data-action="reveal-answer" data-target="${answerId}" data-wrap="${revealId}" aria-controls="${answerId}" aria-expanded="false">Reveal answer and explanation</button>
        </div>
        <div class="recall-answer" id="${answerId}" hidden>
          <p><strong>Answer:</strong> ${escapeHtml(correctAnswer)}</p>
          <p>${escapeHtml(question.explanation)}</p>
          <a class="button button-primary button-small" href="#${quiz.area === 'modern-cv' ? 'modern-cv' : 'foundations'}">Retake the full quiz</a>
        </div>
      </article>`;
  }

  function renderDueProblem(item, index) {
    const problem = findProblem(item.sourceId);
    if (!problem) return '';
    return `
      <article class="card review-card">
        <div class="card-header">
          <div><p class="eyebrow">Cold coding repeat</p><h3><a href="${escapeHtml(problem.url)}" target="_blank" rel="noreferrer">${escapeHtml(problem.title)}</a></h3></div>
          <span class="pill pill-warm">${escapeHtml(problem.pattern)}</span>
        </div>
        <p class="subtle">Solve without notes or hints, explain the invariant, then record complexity.</p>
        ${problemAttemptForm([problem], {
          prefix: `due-problem-${index}-${problem.id}`,
          fixedProblemId: problem.id,
          targetMinutes: 30,
          compact: true
        })}
      </article>`;
  }

  function renderReviewCard(item, index) {
    if (item.kind === 'recall') return renderDueRecall(item, index);
    if (item.kind === 'quiz-question') return renderDueQuiz(item, index);
    if (item.kind === 'problem') return renderDueProblem(item, index);
    return '';
  }

  function conciseList(items, limit = 3) {
    const values = Array.isArray(items) ? items.filter(Boolean).slice(0, limit) : [];
    return values.length ? `<ul>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  }

  function renderInlineModule(stage) {
    const modules = (stage.reference.moduleIds || []).map(findModule).filter(Boolean);
    if (!modules.length) return '<p class="pitfall">The referenced module is unavailable.</p>';
    return modules.map((module, moduleIndex) => {
      const coreIdeas = module.keyPoints || module.template || [];
      const decisions = module.decisionRules || module.recognitionCues || [];
      return `
        <article class="inline-reference module-brief">
          <div class="card-header">
            <div><p class="eyebrow">Module</p><h3>${escapeHtml(module.title)}</h3></div>
            <a class="button button-small" href="#${moduleRoute(module.id)}">Browse full module</a>
          </div>
          <p class="callout">${escapeHtml(module.summary)}</p>
          <div class="inline-teaching-grid">
            <section><h4>Core ideas</h4>${conciseList(coreIdeas)}</section>
            <section><h4>Decision rules</h4>${conciseList(decisions)}</section>
          </div>
          ${module.invariant ? `<p class="formula"><strong>Invariant:</strong> ${escapeHtml(module.invariant)}</p>` : ''}
          ${(module.recall || []).length ? `
            <section class="inline-recall">
              <h4>Retrieve before revealing</h4>
              ${(module.recall || []).map((prompt, promptIndex) => renderRecallPrompt(
                module,
                prompt,
                promptIndex,
                `${stage.id}-${moduleIndex}`
              )).join('')}
            </section>` : '<p class="subtle">This module has no recall prompts.</p>'}
        </article>`;
    }).join('');
  }

  function problemAttemptForm(problems, options = {}) {
    const prefix = safeId(options.prefix || 'problem-log');
    const fixedProblem = options.fixedProblemId ? findProblem(options.fixedProblemId) : null;
    const targetMinutes = Math.max(1, Math.round(Number(options.targetMinutes) || 30));
    const choices = fixedProblem ? [fixedProblem] : problems;
    return `
      <form id="${prefix}-form" class="form-grid problem-attempt-form ${options.compact ? 'compact-form' : ''}">
        ${fixedProblem
          ? `<input type="hidden" name="problemId" value="${escapeHtml(fixedProblem.id)}">`
          : `<div class="form-field full">
              <label for="${prefix}-problem">Problem</label>
              <select id="${prefix}-problem" name="problemId" required>
                <option value="">Choose a problem</option>
                ${choices.map((problem) => `<option value="${escapeHtml(problem.id)}">${escapeHtml(problem.title)} — ${escapeHtml(problem.pattern)}</option>`).join('')}
              </select>
            </div>`}
        <div class="form-field">
          <label for="${prefix}-minutes">Minutes</label>
          <input id="${prefix}-minutes" name="minutes" type="number" min="1" max="180" value="${targetMinutes}" required>
        </div>
        <div class="form-field">
          <label for="${prefix}-outcome">Outcome</label>
          <select id="${prefix}-outcome" name="outcome">
            <option value="independent">Solved independently</option>
            <option value="hint">Solved with hint</option>
            <option value="reviewed">Reviewed solution</option>
          </select>
        </div>
        <label class="check-field" for="${prefix}-random"><input id="${prefix}-random" type="checkbox" name="random"> Random readiness sample</label>
        <label class="check-field" for="${prefix}-explained"><input id="${prefix}-explained" type="checkbox" name="explainedAloud"> Explained aloud</label>
        <label class="check-field" for="${prefix}-complexity"><input id="${prefix}-complexity" type="checkbox" name="complexityCorrect"> Complexity correct</label>
        <div class="form-field full">
          <label for="${prefix}-notes">Mistake or reusable pattern</label>
          <textarea id="${prefix}-notes" name="notes" required></textarea>
        </div>
        <div class="form-field full"><button class="button button-primary" type="submit">Save attempt</button></div>
      </form>`;
  }

  function renderInlineProblems(stage) {
    const problems = (stage.reference.problemIds || []).map(findProblem).filter(Boolean);
    if (!problems.length) return '<p class="pitfall">The referenced problems are unavailable.</p>';
    const target = Math.max(1, Math.round(stage.minutes / problems.length));
    return `<div class="inline-problem-list">${problems.map((problem, index) => {
      const latest = latestFor(state.problemAttempts, 'problemId', problem.id);
      const quality = !latest
        ? 'Not attempted'
        : latest.reviewedSolution
          ? 'Solution reviewed'
          : latest.usedHint
            ? 'Hint assisted'
            : latest.solvedIndependently
              ? 'Independent'
              : 'Attempted';
      return `
        <article class="inline-reference problem-inline">
          <div class="card-header">
            <div><h3><a href="${escapeHtml(problem.url)}" target="_blank" rel="noreferrer">${escapeHtml(problem.title)}</a></h3><p>${escapeHtml(problem.pattern)} pattern</p></div>
            <span class="pill">Target ${formatMinutes(target)}</span>
          </div>
          <p class="evidence-line"><strong>Latest evidence:</strong> ${escapeHtml(quality)}${latest ? ` · ${formatMinutes(latest.minutes)}` : ''}</p>
          ${problemAttemptForm([problem], {
            prefix: `${stage.id}-problem-${index}-${problem.id}`,
            fixedProblemId: problem.id,
            targetMinutes: target,
            compact: true
          })}
        </article>`;
    }).join('')}</div>`;
  }

  function latestQuizAttempt(quizId) {
    return latestFor(state.quizAttempts, 'quizId', quizId);
  }

  function quizFeedback(quiz, attempt) {
    if (!attempt) return '<div class="quiz-result" data-quiz-result hidden></div>';
    const selections = attempt.selections || [];
    return `
      <div class="quiz-result" data-quiz-result>
        <strong>${escapeHtml(attempt.score)}% (${escapeHtml(attempt.correct)}/${escapeHtml(attempt.total)})</strong>
        <p>${attempt.score >= 80 ? 'Passed. This stage now has passing evidence.' : 'Below 80%. Review the explanations and retake.'}</p>
        <ol>
          ${quiz.questions.map((question, index) => {
            const selected = selections[index];
            const correct = question.answerIndex;
            return `<li class="${selected === correct ? 'answer-correct' : 'answer-missed'}"><strong>${selected === correct ? 'Correct' : 'Review'}:</strong> ${escapeHtml(question.explanation)}</li>`;
          }).join('')}
        </ol>
      </div>`;
  }

  function renderQuizForm(quiz, prefix) {
    const formPrefix = safeId(prefix || `quiz-${quiz.id}`);
    const latest = latestQuizAttempt(quiz.id);
    const selections = latest?.selections || [];
    return `
      <form id="${formPrefix}-form" class="quiz-form" data-quiz-id="${escapeHtml(quiz.id)}">
        ${quiz.questions.map((question, questionIndex) => `
          <fieldset class="card quiz-question">
            <legend><strong>${questionIndex + 1}. ${escapeHtml(question.prompt)}</strong></legend>
            ${question.options.map((option, optionIndex) => {
              const inputId = `${formPrefix}-q-${questionIndex}-${optionIndex}`;
              return `
                <label class="quiz-option" for="${inputId}">
                  <input id="${inputId}" type="radio" name="q-${questionIndex}" value="${optionIndex}" ${selections[questionIndex] === optionIndex ? 'checked' : ''} required>
                  ${escapeHtml(option)}
                </label>`;
            }).join('')}
          </fieldset>`).join('')}
        ${quiz.kind === 'rapid-fire' ? `
          <label class="check-field" for="${formPrefix}-no-notes">
            <input id="${formPrefix}-no-notes" type="checkbox" name="noNotes" ${latest?.noNotes ? 'checked' : ''} required>
            I completed this without notes
          </label>` : ''}
        <button class="button button-primary section-gap" type="submit">Score quiz</button>
        ${quizFeedback(quiz, latest)}
      </form>`;
  }

  function renderInlineQuiz(stage) {
    const quizzes = (stage.reference.quizIds || []).map(findQuiz).filter(Boolean);
    if (!quizzes.length) return '<p class="pitfall">The referenced quiz is unavailable.</p>';
    return quizzes.map((quiz, index) => `
      <article class="inline-reference inline-quiz">
        <div class="card-header">
          <div><p class="eyebrow">Scored quiz</p><h3>${escapeHtml(quiz.title)}</h3></div>
          <span class="pill">Pass at 80%</span>
        </div>
        ${renderQuizForm(quiz, `${stage.id}-quiz-${index}-${quiz.id}`)}
      </article>`).join('');
  }

  function designAttemptForm(cases, options = {}) {
    const prefix = safeId(options.prefix || 'design-attempt');
    const fixedCase = options.fixedCaseId ? findDesignCase(options.fixedCaseId) : null;
    const choices = fixedCase ? [fixedCase] : cases;
    return `
      <form id="${prefix}-form" class="form-grid design-attempt-form">
        ${fixedCase
          ? `<input type="hidden" name="caseId" value="${escapeHtml(fixedCase.id)}">`
          : `<div class="form-field full">
              <label for="${prefix}-case">Case</label>
              <select id="${prefix}-case" name="caseId" required>
                ${choices.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join('')}
              </select>
            </div>`}
        <div class="form-field">
          <label for="${prefix}-minutes">Minutes</label>
          <input id="${prefix}-minutes" name="durationMinutes" type="number" min="1" max="120" value="40" required>
        </div>
        <div class="form-field">
          <label for="${prefix}-note">Biggest gap</label>
          <input id="${prefix}-note" name="note" required>
        </div>
        ${RUBRIC_DIMENSIONS.map((dimension) => `
          <div class="form-field">
            <label for="${prefix}-score-${dimension}">${escapeHtml(dimension)}</label>
            <select id="${prefix}-score-${dimension}" name="score-${dimension}">
              ${[1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${score === 3 ? 'selected' : ''}>${score}/5</option>`).join('')}
            </select>
          </div>`).join('')}
        <div class="form-field full"><button class="button button-primary" type="submit">Save timed rubric</button></div>
      </form>`;
  }

  function renderInlineDesign(stage) {
    const item = findDesignCase(stage.reference.caseId);
    if (!item) return '<p class="pitfall">The referenced design case is unavailable.</p>';
    const latest = latestFor(state.designAttempts, 'caseId', item.id);
    const hasTimedRubric = Boolean(
      latest
      && Number(latest.durationMinutes) > 0
      && latest.scores
      && Object.keys(latest.scores).length === RUBRIC_DIMENSIONS.length
    );
    return `
      <article class="inline-reference design-case-inline">
        <div class="card-header">
          <div><p class="eyebrow">Design case</p><h3>${escapeHtml(item.title)}</h3></div>
          <a class="button button-small" href="#system-design">Browse all cases</a>
        </div>
        <p>${escapeHtml(item.scenario)}</p>
        ${noteSection('Clarify first', item.requirements)}
        ${hasTimedRubric ? `
          <div class="design-debrief">
            ${noteSection('Strong solution includes', item.solutionOutline)}
            <p class="callout"><strong>Modern CV decision:</strong> ${escapeHtml(item.modernCv)}</p>
            <p class="pitfall"><strong>Pressure test:</strong> ${escapeHtml(item.pressureTest)}</p>
          </div>` : '<p class="locked-hint">Save a matching timed rubric to reveal the outline and pressure test.</p>'}
        ${designAttemptForm([item], { prefix: `${stage.id}-${item.id}`, fixedCaseId: item.id })}
      </article>`;
  }

  function storyRequirementText(requirements = {}) {
    if (requirements.savedStoryCount) return `Save ${requirements.savedStoryCount} STAR stories.`;
    if (requirements.completedStoryCount) return `Complete ${requirements.completedStoryCount} interview-ready STAR stories.`;
    if (requirements.rehearsalCount) {
      return `Log ${requirements.rehearsalCount} rehearsal${requirements.rehearsalCount === 1 ? '' : 's'}${requirements.withoutNotes ? ' without notes' : ''}.`;
    }
    return 'Save the requested story evidence.';
  }

  function renderInlineStory(stage, status) {
    return `
      <article class="inline-reference workspace-reference">
        <div>
          <p class="eyebrow">Behavioral workspace</p>
          <h3>${escapeHtml(storyRequirementText(stage.reference.requirements))}</h3>
          <p class="subtle">Current evidence: ${escapeHtml(statusText(status))}</p>
        </div>
        <a class="button button-primary" href="#behavioral">Open STAR stories and rehearsals</a>
      </article>`;
  }

  function renderInlineMock(stage, status) {
    const requirements = stage.reference.requirements || {};
    const label = requirements.mockType === 'ml-system' ? 'ML / system-design' : 'coding';
    return `
      <article class="inline-reference workspace-reference">
        <div>
          <p class="eyebrow">Mock workspace</p>
          <h3>Log ${requirements.requiredCount || 1} ${escapeHtml(label)} mock${requirements.requiredCount === 1 ? '' : 's'}</h3>
          <p class="subtle">Current evidence: ${escapeHtml(statusText(status))}</p>
        </div>
        <a class="button button-primary" href="#mocks">Open mock workspace</a>
      </article>`;
  }

  function renderInlineInstruction(stage, session, status) {
    const resources = (stage.reference.resourceIds || []).map(findResource).filter(Boolean);
    const prefix = safeId(`${stage.id}-manual`);
    const existing = state.sessionReflections?.[stage.id] || '';
    return `
      <article class="inline-reference instruction-reference">
        ${resources.length ? `
          <section>
            <h3>Exact resources</h3>
            <ul class="resource-links">
              ${resources.map((resource) => `<li><a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">${escapeHtml(resource.title)}</a> — ${escapeHtml(resource.assignment)}</li>`).join('')}
            </ul>
          </section>` : '<p class="subtle">Complete the instruction above, then record the evidence you produced.</p>'}
        <form id="${prefix}-form" class="form-grid manual-stage-form" data-session-id="${escapeHtml(session.id)}" data-stage-id="${escapeHtml(stage.id)}">
          <div class="form-field full">
            <label for="${prefix}-reflection">Evidence or reflection</label>
            <textarea id="${prefix}-reflection" name="reflection" required>${escapeHtml(existing)}</textarea>
          </div>
          <div class="form-field full">
            <button class="button ${status.complete ? '' : 'button-primary'}" type="submit">${status.complete ? 'Update saved evidence' : 'Save evidence and mark done'}</button>
          </div>
        </form>
      </article>`;
  }

  function renderStageReference(stage, session, status) {
    switch (stage.reference?.type) {
      case 'module': return renderInlineModule(stage);
      case 'problem-set': return renderInlineProblems(stage);
      case 'quiz': return renderInlineQuiz(stage);
      case 'design-case': return renderInlineDesign(stage);
      case 'story': return renderInlineStory(stage, status);
      case 'mock': return renderInlineMock(stage, status);
      case 'instruction': return renderInlineInstruction(stage, session, status);
      default: return '<p class="pitfall">This stage has no usable content reference.</p>';
    }
  }

  function renderStage(stage, session, firstIncompleteId) {
    const status = logic.calculateStageStatus(stage, state, data);
    const focus = state.studyProgress?.activeFocus;
    const isFocused = focus?.sessionId === session.id && focus?.stageId === stage.id;
    const isMinimized = Boolean(focus?.sessionId === session.id && !isFocused);
    const isRecommended = stage.id === firstIncompleteId;
    const cardId = safeId(`stage-card-${stage.id}`);
    const bodyId = `${cardId}-body`;
    return `
      <li id="${cardId}" class="stage-card ${status.complete ? 'is-complete' : ''} ${isRecommended ? 'is-recommended' : ''} ${isFocused ? 'is-focused' : ''} ${isMinimized ? 'is-minimized' : ''}">
        <div class="stage-marker" aria-hidden="true"></div>
        <article>
          <header class="stage-header" id="${cardId}-heading">
            <div>
              <div class="stage-meta">
                <span class="stage-kind">${escapeHtml(stage.type)}</span>
                <span class="pill">${formatMinutes(stage.minutes)}</span>
                ${statusBadge(status)}
                ${isRecommended ? '<span class="pill pill-accent">Recommended next</span>' : ''}
              </div>
              <h3>${escapeHtml(stage.title)}</h3>
            </div>
            ${isFocused
              ? '<button class="button button-small" type="button" data-action="browse-session">Browse full session</button>'
              : `<button class="button button-small ${isRecommended ? 'button-primary' : ''}" type="button" data-action="focus-stage" data-session-id="${escapeHtml(session.id)}" data-stage-id="${escapeHtml(stage.id)}" aria-controls="${bodyId}">Focus on this</button>`}
          </header>
          <div id="${bodyId}" class="stage-body" aria-labelledby="${cardId}-heading">
            <p class="stage-instructions">${escapeHtml(stage.instructions)}</p>
            ${renderStageReference(stage, session, status)}
          </div>
        </article>
      </li>`;
  }

  function timerContextTitle(session) {
    if (state.activeTimer?.title) return state.activeTimer.title;
    const focus = state.studyProgress?.activeFocus;
    const focused = focus ? findGuideStage(focus.sessionId, focus.stageId) : null;
    return focused?.stage?.title || session.title;
  }

  function renderTimerPanel(session) {
    const timer = state.activeTimer;
    const elapsed = logic.getElapsedMinutes(timer);
    const target = Number(timer?.targetMinutes) || Number(session.duration) || 0;
    const progress = target ? Math.min(100, (elapsed / target) * 100) : 0;
    return `
      <aside class="timer-panel" aria-label="Study timer">
        <span class="metric-label">${timer ? 'Running timer' : 'Session timer'}</span>
        <strong class="timer-context">${escapeHtml(timerContextTitle(session))}</strong>
        <div class="timer-display" id="timer-display">${formatTimer(elapsed)}</div>
        <div class="target-progress">
          <div class="target-progress-label"><span>Target progress</span><strong id="timer-target-label">${target ? formatMinutes(target) : 'No target'}</strong></div>
          <div id="timer-target-progress" class="progress-track" role="progressbar" aria-label="Timer target progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">
            <div id="timer-progress-fill" class="progress-fill" style="width:${progress}%"></div>
          </div>
        </div>
        ${timer
          ? '<button class="button button-danger" type="button" data-action="stop-timer">Stop and save</button>'
          : `<div class="form-field">
              <label for="timer-category">Category</label>
              <select id="timer-category">
                ${['coding', 'foundations', 'system-design', 'modern-cv', 'behavioral', 'mocks'].map((category) => `<option value="${category}" ${session.category === category ? 'selected' : ''}>${escapeHtml(category.replace('-', ' '))}</option>`).join('')}
              </select>
              <button class="button button-primary" type="button" data-action="start-timer">Start session timer</button>
            </div>`}
      </aside>`;
  }

  function renderRecommendation(recommendation, currentSession) {
    if (!recommendation) return '';
    let action = '';
    if (
      recommendation.stageId
      && recommendation.sessionId === currentSession?.id
    ) {
      action = `<button class="button button-primary" type="button" data-action="focus-stage" data-session-id="${escapeHtml(recommendation.sessionId)}" data-stage-id="${escapeHtml(recommendation.stageId)}">Focus this stage</button>`;
    } else if (recommendation.kind === 'session' || recommendation.kind === 'continue') {
      action = '<a class="button button-primary" href="#plan">View the next session</a>';
    } else {
      action = `<a class="button button-primary" href="#${escapeHtml(recommendation.route || 'today')}">Take action</a>`;
    }
    return `
      <article class="card card-accent follow-up-card">
        <div><p class="eyebrow">Corrective follow-up</p><h3>${escapeHtml(recommendation.title)}</h3></div>
        ${action}
      </article>`;
  }

  function renderToday() {
    const session = relevantSession();
    if (!session) return pageHeader('Study now', 'No sessions found', 'The curriculum did not load.');
    const guide = data.sessionGuides?.[session.id];
    const exactToday = session.date === todayIso();
    const dueReviews = logic.getDueReviews(state, new Date().toISOString(), 5);
    const firstIncomplete = guide ? logic.getFirstIncompleteStage(guide, state, data) : null;
    const focus = state.studyProgress?.activeFocus;

    const reviewSection = `
      <section class="agenda-section" aria-labelledby="review-heading">
        <div class="agenda-heading">
          <div><span class="agenda-number">1</span><div><p class="eyebrow">Up to 10 minutes</p><h2 id="review-heading">Review</h2></div></div>
          <span class="pill">${dueReviews.length}/5 due</span>
        </div>
        ${dueReviews.length
          ? `<div class="review-grid">${dueReviews.map(renderReviewCard).join('')}</div>`
          : '<div class="empty-state">Nothing is due. Move directly into the scheduled session.</div>'}
      </section>`;

    const sessionSection = guide ? `
      <section class="agenda-section" aria-labelledby="session-heading">
        <div class="agenda-heading">
          <div><span class="agenda-number">2</span><div><p class="eyebrow">Scheduled session</p><h2 id="session-heading">${escapeHtml(session.title)}</h2></div></div>
          ${focus?.sessionId === session.id ? '<button class="button button-small" type="button" data-action="browse-session">Browse full session</button>' : ''}
        </div>
        <p class="lede">${escapeHtml(session.description)}</p>
        <ol class="stage-list">
          ${guide.stages.map((stage) => renderStage(stage, session, firstIncomplete?.id || null)).join('')}
        </ol>
      </section>` : `
      <section class="agenda-section">
        <div class="pitfall">The guide for this scheduled session is unavailable. Open the 10-week plan to retain access to the schedule.</div>
      </section>`;

    let followUpSection = '';
    if (guide && !firstIncomplete) {
      const recommendation = logic.getWeakAreaRecommendation(state, {
        currentGuide: guide,
        nextGuide: nextGuideAfter(guide),
        sessionGuides: data.sessionGuides || {},
        content: data
      });
      followUpSection = `
        <section class="agenda-section" aria-labelledby="follow-up-heading">
          <div class="agenda-heading">
            <div><span class="agenda-number">3</span><div><p class="eyebrow">After scheduled work</p><h2 id="follow-up-heading">Follow-up</h2></div></div>
          </div>
          ${renderRecommendation(recommendation, session)}
        </section>`;
    }

    return `
      ${pageHeader(
        'Study now',
        exactToday ? 'Today’s learning path' : 'Your next learning path',
        exactToday
          ? 'Retrieve first, work the scheduled path, then act on one evidence-based correction.'
          : `The next scheduled session is ${formatDate(session.date)}. Every stage remains freely browsable.`
      )}
      <section class="session-hero">
        <div>
          <p class="eyebrow">${exactToday ? 'Today' : 'Next session'} · ${escapeHtml(session.category.replace('-', ' '))}</p>
          <h2>${escapeHtml(session.title)}</h2>
          <p class="lede">${escapeHtml(session.outcome)}</p>
          <div class="session-meta"><span class="pill">${formatDate(session.date)}</span><span class="pill">${formatMinutes(session.duration)}</span><span class="pill">${guide?.stages?.length || 0} stages</span></div>
        </div>
        ${renderTimerPanel(session)}
      </section>
      <div class="daily-agenda">
        ${reviewSection}
        ${sessionSection}
        ${followUpSection}
      </div>`;
  }

  const GATE_PRESENTATION = {
    coding: { label: 'Coding', route: 'coding', action: 'Complete a random medium independently in 30 minutes.' },
    foundations: { label: 'ML + Math', route: 'foundations', action: 'Review the weakest module and retake its quiz.' },
    systemDesign: { label: 'System Design', route: 'system-design', action: 'Run a 40-minute case and score every rubric dimension.' },
    behavioral: { label: 'Behavioral', route: 'behavioral', action: 'Finish and rehearse an evidence-backed STAR story.' },
    mocks: { label: 'Mocks', route: 'mocks', action: 'Log the next required mock and close its remediation.' }
  };

  function renderReadinessCard(key, gateItem) {
    const presentation = GATE_PRESENTATION[key];
    const statusLabel = gateItem.status === 'green' ? 'Ready' : gateItem.status === 'amber' ? 'Close' : 'Needs evidence';
    return `
      <article class="card readiness-card">
        <div class="card-header">
          <div><p class="eyebrow">${escapeHtml(presentation.label)}</p><h3>${escapeHtml(gateItem.current)} / ${escapeHtml(gateItem.target)}</h3></div>
          <span class="status-badge status-${gateItem.status}">${statusLabel}</span>
        </div>
        <p class="subtle">${escapeHtml(gateItem.detail)}</p>
        ${gateItem.status === 'green' ? '<span class="pill">Gate satisfied</span>' : `<a class="button button-small" href="#${presentation.route}">${escapeHtml(presentation.action)}</a>`}
      </article>`;
  }

  function currentRecommendation() {
    const session = relevantSession();
    const guide = session ? data.sessionGuides?.[session.id] : null;
    return logic.getWeakAreaRecommendation(state, {
      currentGuide: guide,
      nextGuide: guide ? nextGuideAfter(guide) : null,
      sessionGuides: data.sessionGuides || {},
      content: data
    });
  }

  function renderOverview() {
    const tasks = allTasks();
    const taskIds = tasks.map((task) => task.id);
    const planProgress = calculateProgress(taskIds);
    const study = logic.calculateStudyStats(state, PLANNED_MINUTES);
    const score = readiness();
    const attemptedProblems = new Set(state.problemAttempts.map((attempt) => attempt.problemId)).size;
    const dueReviews = logic.getDueReviews(state, new Date().toISOString(), 5);
    const recommendation = currentRecommendation();
    const session = relevantSession();

    const categoryRows = ['coding', 'foundations', 'system-design', 'modern-cv', 'behavioral', 'mocks']
      .map((category) => {
        const categoryTaskIds = tasks.filter((task) => task.category === category).map((task) => task.id);
        const progress = calculateProgress(categoryTaskIds);
        return `
          <div class="progress-row">
            <span>${escapeHtml(category.replace('-', ' '))}</span>
            <div class="progress-track"><div class="progress-fill" style="width:${progress.percent}%"></div></div>
            <strong>${progress.percent}%</strong>
          </div>`;
      }).join('');

    const learning = logic.getLearningProgress(state, learningModuleGroups());
    const areaLabels = { coding: 'Coding', foundations: 'ML + math', 'modern-cv': 'Modern CV' };
    const learningRows = Object.entries(learning.areas).map(([area, info]) => `
      <div class="progress-row">
        <span>${escapeHtml(areaLabels[area] || area)}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${info.percent}%"></div></div>
        <strong>${info.studied}/${info.total}</strong>
      </div>`).join('');
    const nextLearnArea = (Object.entries(learning.areas).find(([, info]) => info.remaining > 0) || ['coding'])[0];

    return `
      ${pageHeader('Overview', 'Capability before activity', 'Use the next action and objective gates to decide what to study—not a completion streak.')}
      <section class="grid grid-2 overview-actions">
        <article class="card is-recommended">
          <p class="eyebrow">Recommended next</p>
          <h2>${escapeHtml(recommendation.title)}</h2>
          ${recommendation.stageId && recommendation.sessionId === session?.id
            ? `<button class="button button-primary" type="button" data-action="focus-stage" data-session-id="${escapeHtml(recommendation.sessionId)}" data-stage-id="${escapeHtml(recommendation.stageId)}">Study now</button>`
            : `<a class="button button-primary" href="#${recommendation.kind === 'session' || recommendation.kind === 'continue' ? 'plan' : escapeHtml(recommendation.route || 'today')}">Take action</a>`}
        </article>
        <article class="card">
          <p class="eyebrow">Reviews due</p>
          <h2>${dueReviews.length}</h2>
          <p class="subtle">The daily queue is capped at five items and ten minutes.</p>
          <a class="button" href="#today">${dueReviews.length ? 'Review now' : 'Open Study now'}</a>
        </article>
      </section>
      <section class="section-gap" aria-labelledby="readiness-heading">
        <div class="section-heading-row">
          <div><p class="eyebrow">Objective thresholds</p><h2 id="readiness-heading">Readiness gates</h2></div>
          <span class="status-badge ${score.overall === 'green' ? 'status-green' : 'status-red'}">${score.overall === 'green' ? 'Interview ready' : 'Not ready'}</span>
        </div>
        <div class="grid grid-5">${Object.entries(score.gates).map(([key, gateItem]) => renderReadinessCard(key, gateItem)).join('')}</div>
        ${state.readinessOverride ? `<p class="pitfall">Manual application override active: ${escapeHtml(state.readinessOverride.reason)}</p>` : ''}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Learning progress</h2><p>Modules read and marked studied. Retention is proven separately in the recall queue.</p></div><span class="pill pill-accent">${learning.studied}/${learning.total} studied</span></div>
        ${learningRows}
        ${learning.percent < 100 ? `<a class="button button-small" href="#${nextLearnArea}">Continue learning</a>` : '<p class="subtle">Every learning module is studied. Keep proving retention in Study now.</p>'}
      </section>
      <section class="grid grid-3 section-gap" aria-label="Secondary plan context">
        ${metricCard('Plan completion', `${planProgress.percent}%`, `${planProgress.completed} of ${planProgress.total} tasks`, planProgress.percent)}
        ${metricCard('Time adherence', formatMinutes(study.actualMinutes), `${study.percent}% of 120 hours`, study.percent)}
        ${metricCard('Coding coverage', `${attemptedProblems}/60`, 'unique problems attempted', (attemptedProblems / 60) * 100, 'warm')}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Plan completion by area</h2><p>Derived from saved learning evidence and legacy completions.</p></div></div>
        ${categoryRows}
      </section>`;
  }

  function renderPlan() {
    const currentWeek = logic.getCurrentWeek(todayIso(), data.planStart || '2026-07-27');
    const weeks = (data.weeks || []).map((week) => {
      const weekTaskIds = week.sessions.flatMap((session) => session.tasks.map((task) => task.id));
      const progress = calculateProgress(weekTaskIds);
      const sessions = week.sessions.map((session) => {
        const complete = session.tasks.every((task) => (
          logic.isTaskComplete(task.id, state, data.sessionGuides || {}, data)
        ));
        const guide = data.sessionGuides?.[session.id];
        const nextStage = guide ? logic.getFirstIncompleteStage(guide, state, data) : null;
        return `
          <div class="session-row">
            <time datetime="${escapeHtml(session.date)}">${formatDate(session.date)}</time>
            <div>
              <strong>${escapeHtml(session.title)}</strong>
              <p>${escapeHtml(complete ? session.outcome : nextStage?.title || session.outcome)}</p>
            </div>
            <span class="status-badge ${complete ? 'status-green' : 'status-amber'}">${complete ? 'Done' : formatMinutes(session.duration)}</span>
          </div>`;
      }).join('');
      return `
        <details ${week.week === currentWeek ? 'open' : ''}>
          <summary>Week ${week.week}: ${escapeHtml(week.theme)} <span class="week-summary"><span class="pill">${progress.percent}%</span><span class="pill">${escapeHtml(week.phase)}</span></span></summary>
          <div class="details-body">
            <p class="subtle">${escapeHtml(week.goal)}</p>
            ${sessions}
          </div>
        </details>`;
    }).join('');
    return `
      ${pageHeader('Schedule', 'Ten weeks, sixty sessions', 'The calendar stays fixed. Completion is derived from saved evidence instead of bare guided checkboxes.')}
      <div class="week-list">${weeks}</div>`;
  }

  function renderCoding() {
    const problems = data.problems || [];
    const patternConcepts = data.codingPatternConcepts || {};
    const patterns = ['all', ...new Set(problems.map((problem) => problem.pattern))];
    const filtered = problemFilter === 'all'
      ? problems
      : problems.filter((problem) => problem.pattern === problemFilter);
    const attemptsByProblem = state.problemAttempts.reduce((map, attempt) => {
      (map[attempt.problemId] ||= []).push(attempt);
      return map;
    }, {});
    const mastered = problems.filter((problem) => (
      (attemptsByProblem[problem.id] || []).some((attempt) => (
        attempt.solvedIndependently && attempt.explainedAloud && attempt.complexityCorrect
      ))
    )).length;
    const attempted = new Set(state.problemAttempts.map((attempt) => attempt.problemId)).size;
    const rows = filtered.map((problem) => {
      const attempts = attemptsByProblem[problem.id] || [];
      const latest = attempts.at(-1);
      const status = !latest
        ? 'Not attempted'
        : latest.reviewedSolution
          ? 'Reviewed solution'
          : latest.usedHint
            ? 'With hint'
            : latest.solvedIndependently
              ? 'Independent'
              : 'Attempted';
      const conceptModules = (patternConcepts[problem.pattern] || [])
        .map((id) => (data.codingModules || []).find((module) => module.id === id))
        .filter(Boolean);
      const conceptLinks = conceptModules.length
        ? `<div class="concept-refresh">${conceptModules.map((module) => `<button class="link-button" type="button" data-action="scroll-to-module" data-module-id="${escapeHtml(module.id)}">Refresh: ${escapeHtml(module.title)}</button>`).join('')}</div>`
        : '';
      return `
        <tr>
          <td><a href="${escapeHtml(problem.url)}" target="_blank" rel="noreferrer">${escapeHtml(problem.title)}</a><br><span class="subtle">${escapeHtml(problem.pattern)}</span>${conceptLinks}</td>
          <td><span class="pill ${problem.difficulty === 'Medium' ? 'pill-warm' : ''}">${escapeHtml(problem.difficulty)}</span></td>
          <td>${attempts.length}</td>
          <td>${escapeHtml(status)}${latest ? `<br><span class="subtle">${formatMinutes(latest.minutes)}</span>` : ''}</td>
          <td><button class="button button-small" type="button" data-action="prefill-problem" data-problem-id="${escapeHtml(problem.id)}">Log attempt</button></td>
        </tr>`;
    }).join('');

    return `
      ${pageHeader('Coding', 'Build pattern recognition, not a streak', 'Learn the invariant, solve the curated set, and record whether evidence was independent or assisted.')}
      <section class="grid grid-3">
        ${metricCard('Attempted', attempted, 'unique problems', (attempted / 60) * 100)}
        ${metricCard('Mastered', mastered, 'independent + explained + correct complexity', (mastered / 60) * 100)}
        ${metricCard('Total attempts', state.problemAttempts.length, 'first tries and spaced repeats', (Math.min(state.problemAttempts.length, 60) / 60) * 100, 'warm')}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Coding pattern guide</h2><p>Recognition cues, invariants, templates, complexity, and recall.</p></div><span class="pill pill-accent">${(data.codingModules || []).length} modules</span></div>
        ${renderModuleList('coding', data.codingModules || [])}
      </section>
      <section class="card section-gap" id="problem-log">
        <div class="card-header"><div><h2>Log an attempt</h2><p>For readiness samples, select a random medium and do not use hints.</p></div></div>
        ${problemAttemptForm(problems, { prefix: 'problem-log', targetMinutes: 30 })}
      </section>
      <section class="section-gap">
        <div class="filter-bar">${patterns.map((pattern) => `<button type="button" class="filter-button ${problemFilter === pattern ? 'is-active' : ''}" data-action="filter-problems" data-filter="${escapeHtml(pattern)}">${escapeHtml(pattern === 'all' ? 'All patterns' : pattern)}</button>`).join('')}</div>
        <div class="table-wrap"><table><thead><tr><th>Problem</th><th>Level</th><th>Attempts</th><th>Latest evidence</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
      ${renderResources('coding')}`;
  }

  function moduleCompletion(module) {
    const prompts = module.recall || [];
    const records = prompts.map((_prompt, index) => reviewRecord(module.id, index));
    return prompts.length > 0 && records.every((record) => record?.lastResult === 'hard' || record?.lastResult === 'got-it');
  }

  function renderLearningModule(module, area, options = {}) {
    const retained = moduleCompletion(module);
    const studied = isStudied(module.id);
    const current = Boolean(options.current);
    const coreIdeas = module.keyPoints || module.template || [];
    const decisions = module.decisionRules || [];
    const complexity = Array.isArray(module.complexity)
      ? module.complexity
      : module.complexity
        ? [`Time: ${module.complexity.time}`, `Space: ${module.complexity.space}`]
        : [];
    const prefix = `browse-${area}-${module.id}`;
    const badge = studied
      ? '<span class="status-badge status-green">Studied</span>'
      : current
        ? '<span class="status-badge status-accent">Current lesson</span>'
        : `<span class="status-badge status-amber">${module.required ? 'Required' : 'Deep study'}</span>`;
    const retainedPill = retained ? '<span class="pill">Recall retained</span>' : '';
    return `
      <details id="${safeId(`module-${module.id}`)}" class="learning-module${current ? ' is-current' : ''}"${current ? ' open' : ''}>
        <summary>${escapeHtml(module.title)} <span class="module-summary-badges">${badge}${retainedPill}</span></summary>
        <div class="details-body notes-layout">
          <article>
            <p class="callout">${escapeHtml(module.summary)}</p>
            ${noteSection('Core ideas', coreIdeas)}
            ${codeBlock(module.code)}
            ${(module.formulas || []).length ? `<section class="note-section"><h3>Formulas and intuition</h3>${module.formulas.map((formula) => `<div class="formula">${escapeHtml(formula)}</div>`).join('')}</section>` : ''}
            ${noteSection('Decision rules', decisions)}
            ${module.invariant ? `<section class="note-section"><h3>Core invariant</h3><p class="formula">${escapeHtml(module.invariant)}</p></section>` : ''}
            ${noteSection('Complexity', complexity)}
            ${(module.pitfalls || []).length ? `<section class="note-section"><h3>Common mistakes</h3>${module.pitfalls.map((pitfall) => `<p class="pitfall">${escapeHtml(pitfall)}</p>`).join('')}</section>` : ''}
            ${module.systemDesignUse ? `<section class="note-section"><h3>Use in system design</h3><p>${escapeHtml(module.systemDesignUse)}</p></section>` : ''}
            ${renderStudyControl(module, area)}
          </article>
          <aside>
            ${noteSection('Recognition cues', module.recognitionCues)}
            ${(module.recall || []).length ? `<section class="note-section"><h3>Active recall</h3>${module.recall.map((prompt, index) => renderRecallPrompt(module, prompt, index, prefix)).join('')}</section>` : ''}
          </aside>
        </div>
      </details>`;
  }

  function renderStudyControl(module, area) {
    if (isStudied(module.id)) {
      return `
        <section class="note-section study-control is-studied">
          <p class="subtle">Studied ${escapeHtml(formatDate(studiedAt(module.id).slice(0, 10)))}. Retrieve the prompts to prove retention.</p>
          <button class="button button-small" type="button" data-action="unstudy-module" data-module-id="${escapeHtml(module.id)}">Move back to studying</button>
        </section>`;
    }
    return `
      <section class="note-section study-control">
        <p class="subtle">Read the lesson, then mark it studied to advance the path. Retention still comes from the recall prompts.</p>
        <button class="button button-primary button-small" type="button" data-action="study-module" data-module-id="${escapeHtml(module.id)}" data-area="${escapeHtml(area)}">Mark as studied</button>
      </section>`;
  }

  function renderModuleList(area, modules) {
    const list = Array.isArray(modules) ? modules : [];
    const nextId = list.find((module) => !isStudied(module.id))?.id || null;
    const studiedCount = list.filter((module) => isStudied(module.id)).length;
    const percent = list.length ? Math.round((studiedCount / list.length) * 100) : 0;
    const nextModule = nextId ? list.find((module) => module.id === nextId) : null;
    const progress = `
      <div class="learning-progress">
        <div class="learning-progress-meta">
          <p class="eyebrow">Learning path</p>
          <strong>${studiedCount} of ${list.length} studied</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
        ${nextModule
          ? `<button class="button button-small" type="button" data-action="scroll-to-module" data-module-id="${escapeHtml(nextModule.id)}">Continue: ${escapeHtml(nextModule.title)}</button>`
          : '<span class="pill">All modules studied</span>'}
      </div>`;
    return `${progress}<div class="module-list">${list.map((module) => renderLearningModule(module, area, { current: module.id === nextId })).join('')}</div>`;
  }

  function renderQuizDetails(quiz, prefix) {
    return `
      <details>
        <summary>${escapeHtml(quiz.title)} <span class="pill">${quiz.questions.length} questions</span></summary>
        <div class="details-body">${renderQuizForm(quiz, prefix)}</div>
      </details>`;
  }

  function renderFoundations() {
    const required = (data.foundationModules || []).filter((module) => module.required);
    const academic = (data.foundationModules || []).filter((module) => !module.required);
    return `
      ${pageHeader('ML + math', 'Reason from first principles', 'The required path targets interview judgment; the academic library remains freely browsable.')}
      <section class="card card-accent">
        <div class="card-header"><div><h2>Required interview core</h2><p>Retrieve every prompt and prove judgment with the quizzes below.</p></div><span class="pill pill-accent">${required.length} modules</span></div>
        ${renderModuleList('foundations', required)}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Active-recall quizzes</h2><p>Scores below 80% schedule missed questions for review.</p></div></div>
        ${(data.quizzes || []).filter((quiz) => quiz.area === 'foundations').map((quiz) => renderQuizDetails(quiz, `foundations-${quiz.id}`)).join('')}
      </section>
      <section class="section-gap">
        <div class="card-header"><div><h2>Academic reference library</h2><p>Optional before readiness; useful for long-term depth.</p></div><span class="pill">Optional</span></div>
        <div class="module-list">${academic.map((module) => renderLearningModule(module, 'foundations')).join('')}</div>
      </section>
      ${renderResources('foundations')}`;
  }

  function renderSystemDesign() {
    const cases = data.systemDesignCases || [];
    return `
      ${pageHeader('ML system design', 'Design the whole learning system', 'Practice requirements, data, model, evaluation, serving, monitoring, feedback, and tradeoffs.')}
      <section class="grid grid-2">${cases.map((item) => `
        <article class="card ${item.modernCv ? 'card-accent' : ''}">
          <div class="card-header"><div><p class="eyebrow">Case ${item.order}</p><h2>${escapeHtml(item.title)}</h2></div><span class="pill">40 min</span></div>
          <p class="subtle">${escapeHtml(item.scenario)}</p>
          ${noteSection('Clarify first', item.requirements)}
          ${noteSection('Strong solution includes', item.solutionOutline)}
          <p class="callout"><strong>Modern CV decision:</strong> ${escapeHtml(item.modernCv)}</p>
          <div class="recall-card"><strong>Pressure test</strong><p class="subtle">${escapeHtml(item.pressureTest)}</p></div>
        </article>`).join('')}</section>
      <section class="card section-gap" id="design-log">
        <div class="card-header"><div><h2>Score a 40-minute design</h2><p>Every category must reach 4/5 on two recent attempts.</p></div></div>
        ${designAttemptForm(cases, { prefix: 'design-log' })}
      </section>
      ${renderResources('system-design')}`;
  }

  function renderModernCv() {
    const modules = data.modernCvModules || [];
    return `
      ${pageHeader('Modern CV', 'Know what changed and when to use it', 'Architecture, objective, capability, limitation, and production tradeoff—not paper trivia.')}
      <section class="card card-warm">
        <div class="card-header"><div><h2>Foundation-model map</h2><p>Every module ends in a system-design decision.</p></div><span class="pill pill-warm">Interview breadth</span></div>
        ${renderModuleList('modern-cv', modules)}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Modern CV check</h2><p>Test model-selection judgment and production constraints.</p></div></div>
        ${(data.quizzes || []).filter((quiz) => quiz.area === 'modern-cv').map((quiz) => renderQuizDetails(quiz, `modern-cv-${quiz.id}`)).join('')}
      </section>
      ${renderResources('modern-cv')}`;
  }

  function storyForm(story = {}) {
    return `
      <form id="story-form" class="form-grid">
        <div class="form-field full"><label for="story-title">Story title</label><input id="story-title" name="title" value="${escapeHtml(story.title || '')}" required></div>
        <div class="form-field full"><label for="story-situation">Situation</label><textarea id="story-situation" name="situation" required>${escapeHtml(story.situation || '')}</textarea></div>
        <div class="form-field full"><label for="story-task">Task</label><textarea id="story-task" name="task" required>${escapeHtml(story.task || '')}</textarea></div>
        <div class="form-field full"><label for="story-action">Action</label><textarea id="story-action" name="action" required>${escapeHtml(story.action || '')}</textarea></div>
        <div class="form-field full"><label for="story-result">Result</label><textarea id="story-result" name="result" required>${escapeHtml(story.result || '')}</textarea></div>
        <div class="form-field"><label for="story-duration">Spoken minutes</label><input id="story-duration" name="durationMinutes" type="number" min="0.5" max="10" step="0.1" value="${escapeHtml(story.durationMinutes || 2)}" required></div>
        <label class="check-field" for="story-impact"><input id="story-impact" type="checkbox" name="measurableImpact" ${story.measurableImpact ? 'checked' : ''}> Measurable impact</label>
        <label class="check-field" for="story-contribution"><input id="story-contribution" type="checkbox" name="individualContribution" ${story.individualContribution ? 'checked' : ''}> My contribution is explicit</label>
        <label class="check-field" for="story-leadership"><input id="story-leadership" type="checkbox" name="leadership" ${story.leadership ? 'checked' : ''}> Leadership without authority</label>
        <label class="check-field" for="story-complete"><input id="story-complete" type="checkbox" name="complete" ${story.complete ? 'checked' : ''}> Rehearsed and complete</label>
        <div class="form-field full card-actions"><button class="button button-primary" type="submit">${story.title ? 'Update story' : 'Save story'}</button>${story.title ? '<button class="button" type="button" data-action="cancel-story-edit">Cancel</button>' : ''}</div>
      </form>`;
  }

  function renderStoryCard(story, index) {
    return `
      <article class="card">
        <div class="card-header"><div><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.durationMinutes)} min spoken</p></div><span class="status-badge ${story.complete ? 'status-green' : 'status-amber'}">${story.complete ? 'Ready' : 'Draft'}</span></div>
        <p><strong>Result:</strong> ${escapeHtml(story.result)}</p>
        <div class="card-actions"><button class="button button-small" type="button" data-action="edit-story" data-index="${index}">Edit</button><button class="button button-small button-danger" type="button" data-action="delete-story" data-index="${index}">Delete</button></div>
      </article>`;
  }

  function renderBehavioral() {
    const prompts = data.behavioralPrompts || [];
    const story = editingStoryIndex === null ? {} : state.starStories[editingStoryIndex] || {};
    return `
      ${pageHeader('Behavioral', 'Turn six years into evidence', 'Senior interviews test scope, judgment, influence, and measurable impact.')}
      <section class="grid grid-2">
        <div class="card">
          <div class="card-header"><div><h2>${story.title ? 'Edit story' : 'Add a STAR story'}</h2><p>Keep the spoken version under two minutes.</p></div></div>
          ${storyForm(story)}
        </div>
        <div class="card">
          <div class="card-header"><div><h2>Prompt coverage</h2><p>Build at least one strong story for each.</p></div></div>
          <ol class="subtle">${prompts.map((prompt) => `<li><strong>${escapeHtml(prompt.title)}:</strong> ${escapeHtml(prompt.prompt)}</li>`).join('')}</ol>
        </div>
      </section>
      <section class="section-gap">
        <div class="card-header"><div><h2>Your story bank</h2><p>${state.starStories.length}/8 minimum stories created.</p></div></div>
        ${state.starStories.length ? `<div class="grid grid-2">${state.starStories.map(renderStoryCard).join('')}</div>` : '<div class="empty-state">No stories yet. Start with your highest-impact production CV project.</div>'}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Log a rehearsal</h2><p>Two no-notes rehearsals are required for readiness.</p></div></div>
        <form id="rehearsal-form" class="form-grid">
          <div class="form-field"><label for="rehearsal-duration">Minutes</label><input id="rehearsal-duration" name="durationMinutes" type="number" min="1" max="60" required></div>
          <label class="check-field" for="rehearsal-no-notes"><input id="rehearsal-no-notes" type="checkbox" name="withoutNotes"> Completed without notes</label>
          <div class="form-field full"><label for="rehearsal-note">What needs tightening?</label><input id="rehearsal-note" name="note" required></div>
          <div class="form-field full"><button class="button" type="submit">Save rehearsal</button></div>
        </form>
      </section>
      ${renderResources('behavioral')}`;
  }

  function renderMocks() {
    return `
      ${pageHeader('Mock interviews', 'Practice under interview conditions', 'Feedback counts when a weakness becomes a concrete remediation task.')}
      <section class="grid grid-2">
        <div class="card">
          <div class="card-header"><div><h2>Log a mock</h2><p>Minimum: two coding and two ML/system-design mocks.</p></div></div>
          <form id="mock-form" class="form-grid">
            <div class="form-field"><label for="mock-type">Type</label><select id="mock-type" name="type"><option value="coding">Coding</option><option value="ml-system">ML / system design</option></select></div>
            <div class="form-field"><label for="mock-source">Source or partner</label><input id="mock-source" name="source" required></div>
            <label class="check-field" for="mock-advance"><input id="mock-advance" type="checkbox" name="wouldAdvance"> Would advance</label>
            <div class="form-field full"><label for="mock-weakness">Main weakness</label><input id="mock-weakness" name="weakness"></div>
            <div class="form-field full"><label for="mock-remediation">Remediation task</label><input id="mock-remediation" name="remediation"></div>
            <label class="check-field" for="mock-remediation-complete"><input id="mock-remediation-complete" type="checkbox" name="remediationComplete"> Remediation complete</label>
            <div class="form-field full"><button class="button button-primary" type="submit">Save mock</button></div>
          </form>
        </div>
        <div class="card">
          <h2>Mock protocol</h2>
          <ol class="subtle"><li>Use a timer and speak every decision aloud.</li><li>Ask for an advance/no-advance signal.</li><li>Record one concrete weakness.</li><li>Close the remediation before the next mock.</li></ol>
        </div>
      </section>
      <section class="section-gap">
        <div class="card-header"><div><h2>Mock history</h2><p>${state.mocks.length} mocks logged.</p></div></div>
        ${state.mocks.length ? `
          <div class="table-wrap"><table><thead><tr><th>Type</th><th>Source</th><th>Signal</th><th>Weakness</th><th>Remediation</th><th></th></tr></thead><tbody>
            ${state.mocks.map((mock, index) => {
              const weakness = mock.weaknesses?.[0];
              return `<tr><td>${escapeHtml(mock.type)}</td><td>${escapeHtml(mock.source)}</td><td><span class="status-badge ${mock.wouldAdvance ? 'status-green' : 'status-red'}">${mock.wouldAdvance ? 'Advance' : 'No'}</span></td><td>${escapeHtml(weakness?.text || 'None')}</td><td>${weakness ? (weakness.remediationComplete ? 'Complete' : escapeHtml(weakness.remediation || 'Missing')) : 'None'}</td><td><button class="button button-small button-danger" type="button" data-action="delete-mock" data-index="${index}">Delete</button></td></tr>`;
            }).join('')}
          </tbody></table></div>` : '<div class="empty-state">No mocks logged yet.</div>'}
      </section>
      ${renderResources('mocks')}`;
  }

  function renderWeakSignals(score) {
    const recommendation = currentRecommendation();
    const gateActions = Object.entries(score.gates)
      .filter(([, gateItem]) => gateItem.status !== 'green')
      .map(([key, gateItem]) => {
        const presentation = GATE_PRESENTATION[key];
        return `<li><a href="#${presentation.route}">${escapeHtml(presentation.action)}</a> <span class="subtle">(${escapeHtml(gateItem.current)}/${escapeHtml(gateItem.target)}; ${escapeHtml(gateItem.detail)})</span></li>`;
      });
    return `
      <div class="weak-signals">
        <p><strong>Start here:</strong> ${escapeHtml(recommendation.title)}</p>
        <ul>${gateActions.join('')}</ul>
      </div>`;
  }

  function applicationForm(application = {}) {
    return `
      <form id="application-form" class="form-grid">
        <div class="form-field"><label for="app-company">Company</label><input id="app-company" name="company" value="${escapeHtml(application.company || '')}" required></div>
        <div class="form-field"><label for="app-role">Role</label><input id="app-role" name="role" value="${escapeHtml(application.role || '')}" required></div>
        <div class="form-field full"><label for="app-url">Job URL</label><input id="app-url" name="url" type="url" value="${escapeHtml(application.url || '')}" required></div>
        <div class="form-field"><label for="app-stage">Stage</label><select id="app-stage" name="stage">${['Interested', 'Applied', 'Recruiter screen', 'Technical screen', 'Onsite', 'Offer', 'Closed'].map((stage) => `<option ${application.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}</select></div>
        <div class="form-field"><label for="app-date">Interview date</label><input id="app-date" name="interviewDate" type="date" value="${escapeHtml(application.interviewDate || '')}"></div>
        <div class="form-field"><label for="app-contact">Contact</label><input id="app-contact" name="contact" value="${escapeHtml(application.contact || '')}"></div>
        <div class="form-field full"><label for="app-notes">Company-specific preparation</label><textarea id="app-notes" name="notes">${escapeHtml(application.notes || '')}</textarea></div>
        <div class="form-field full card-actions"><button class="button button-primary" type="submit">${application.company ? 'Update application' : 'Save application'}</button>${application.company ? '<button class="button" type="button" data-action="cancel-application-edit">Cancel</button>' : ''}</div>
      </form>`;
  }

  function renderApplications() {
    const score = readiness();
    const unlocked = logic.isApplicationUnlocked(state, score);
    if (!unlocked) {
      return `
        ${pageHeader('Applications', 'Confidence first', 'This section unlocks when every objective readiness gate is green.')}
        <section class="locked-panel">
          <span class="status-badge status-red">Locked</span>
          <h2>Build evidence before applying</h2>
          ${renderWeakSignals(score)}
          <form id="override-form" class="section-gap">
            <div class="form-field"><label for="override-reason">Manual override reason</label><textarea id="override-reason" name="reason" required placeholder="Use only when a real opportunity changes the plan."></textarea></div>
            <button class="button button-danger section-gap" type="submit">Override gate</button>
          </form>
        </section>`;
    }

    const application = editingApplicationIndex === null
      ? {}
      : state.applications[editingApplicationIndex] || {};
    return `
      ${pageHeader('Applications', 'Turn readiness into a pipeline', 'Track each role, stage, interview date, contact, and company-specific preparation.')}
      ${state.readinessOverride ? `<p class="pitfall">Gate manually overridden: ${escapeHtml(state.readinessOverride.reason)}</p>` : ''}
      <section class="card">
        <div class="card-header"><div><h2>${application.company ? 'Edit application' : 'Add application'}</h2><p>Only add roles you would genuinely accept.</p></div></div>
        ${applicationForm(application)}
      </section>
      <section class="section-gap">
        ${state.applications.length ? `
          <div class="table-wrap"><table><thead><tr><th>Company / role</th><th>Stage</th><th>Interview</th><th>Contact</th><th></th></tr></thead><tbody>
            ${state.applications.map((item, index) => `<tr><td><strong>${escapeHtml(item.company)}</strong><br><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.role)}</a></td><td>${escapeHtml(item.stage)}</td><td>${item.interviewDate ? formatDate(item.interviewDate) : 'Not scheduled'}</td><td>${escapeHtml(item.contact || '—')}</td><td><div class="card-actions"><button class="button button-small" type="button" data-action="edit-application" data-index="${index}">Edit</button><button class="button button-small button-danger" type="button" data-action="delete-application" data-index="${index}">Delete</button></div></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="empty-state">No applications yet.</div>'}
      </section>`;
  }

  function renderData() {
    const study = logic.calculateStudyStats(state, PLANNED_MINUTES);
    return `
      ${pageHeader('Data & settings', 'Your progress stays on this device', 'Export a v2 JSON backup regularly. Imports validate before replacing current progress.')}
      <section class="grid grid-2">
        <div class="card">
          <div class="card-header"><div><h2>Backup and restore</h2><p>Schema v${escapeHtml(state.schemaVersion)} · portable across browsers.</p></div></div>
          <div class="card-actions"><button class="button button-primary" type="button" data-action="export-data">Export JSON</button><button class="button" type="button" data-action="import-data">Import JSON</button></div>
        </div>
        <div class="card">
          <div class="card-header"><div><h2>Appearance</h2><p>System, light, or dark.</p></div><span class="pill">${escapeHtml(state.preferences.theme)}</span></div>
          <button class="button" type="button" data-action="cycle-theme">Change theme</button>
        </div>
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Add study time</h2><p>Use this for sessions completed outside the timer.</p></div></div>
        <form id="manual-time-form" class="form-grid">
          <div class="form-field"><label for="manual-category">Category</label><select id="manual-category" name="category">${['coding', 'foundations', 'system-design', 'modern-cv', 'behavioral', 'mocks'].map((category) => `<option value="${category}">${escapeHtml(category.replace('-', ' '))}</option>`).join('')}</select></div>
          <div class="form-field"><label for="manual-minutes">Minutes</label><input id="manual-minutes" name="minutes" type="number" min="1" max="600" required></div>
          <div class="form-field full"><label for="manual-note">Note</label><input id="manual-note" name="note" required></div>
          <div class="form-field full"><button class="button" type="submit">Add time</button></div>
        </form>
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Study-time ledger</h2><p>${formatMinutes(study.actualMinutes)} logged toward 120 hours.</p></div></div>
        ${state.timeEntries.length ? `
          <div class="table-wrap"><table><thead><tr><th>Date</th><th>Category</th><th>Time</th><th>Note</th><th></th></tr></thead><tbody>
            ${state.timeEntries.map((entry, index) => `<tr><td>${formatDate((entry.endedAt || entry.createdAt).slice(0, 10))}</td><td>${escapeHtml(entry.category)}</td><td>${formatMinutes(entry.minutes)}</td><td>${escapeHtml(entry.note || entry.title || '')}</td><td><button class="button button-small button-danger" type="button" data-action="delete-time" data-index="${index}">Delete</button></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="empty-state">No study time logged yet.</div>'}
      </section>
      <section class="card section-gap">
        <div class="card-header"><div><h2>Reset all progress</h2><p>This replaces v2 state with a clean learning record.</p></div></div>
        <button class="button button-danger" type="button" data-action="reset-data">Reset dashboard</button>
      </section>
      ${renderAllResources()}`;
  }

  function renderResources(tag) {
    const resources = (data.resources || []).filter((resource) => resource.tags.includes(tag));
    if (!resources.length) return '';
    return `
      <section class="section-gap">
        <div class="card-header"><div><h2>Assigned resources</h2><p>Open only when a session or module calls for it.</p></div></div>
        <div class="grid grid-2">${resources.map(resourceCard).join('')}</div>
      </section>`;
  }

  function renderAllResources() {
    return `
      <section class="section-gap">
        <div class="card-header"><div><h2>Complete resource library</h2><p>Free-first, primary sources preferred.</p></div></div>
        <div class="grid grid-2">${(data.resources || []).map(resourceCard).join('')}</div>
      </section>`;
  }

  function resourceCard(resource) {
    return `
      <article class="card">
        <div class="card-header"><div><h3><a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">${escapeHtml(resource.title)}</a></h3><p>${escapeHtml(resource.provider)}</p></div><span class="pill ${resource.access === 'Free' ? 'pill-accent' : 'pill-warm'}">${escapeHtml(resource.access)}</span></div>
        <p class="subtle">${escapeHtml(resource.use)}</p>
        <p><strong>Assigned:</strong> ${escapeHtml(resource.assignment)}</p>
      </article>`;
  }

  function applyTheme() {
    const theme = state.preferences?.theme || 'system';
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = theme;
    themeToggle.textContent = theme === 'system' ? 'Theme: auto' : `Theme: ${theme}`;
  }

  function cycleTheme() {
    const order = ['system', 'light', 'dark'];
    const current = state.preferences?.theme || 'system';
    const theme = order[(order.indexOf(current) + 1) % order.length];
    commitState({
      ...state,
      preferences: { ...state.preferences, theme }
    }, `Theme: ${theme}`, { syncGuided: false });
  }

  function updateGlobalChrome() {
    const currentWeek = logic.getCurrentWeek(todayIso(), data.planStart || '2026-07-27');
    const score = readiness();
    document.querySelector('#topbar-week').textContent = `Week ${currentWeek} of 10`;
    const badge = document.querySelector('#topbar-readiness');
    badge.className = `status-badge ${score.overall === 'green' ? 'status-green' : 'status-red'}`;
    badge.textContent = score.overall === 'green' ? 'Interview ready' : 'Not ready';
    document.querySelector('#application-lock').textContent = logic.isApplicationUnlocked(state, score) ? 'Open' : 'Locked';
    applyTheme();
  }

  function updateTimerDisplay() {
    const display = document.querySelector('#timer-display');
    if (!display) return;
    const elapsed = logic.getElapsedMinutes(state.activeTimer);
    display.textContent = formatTimer(elapsed);
    const target = Number(state.activeTimer?.targetMinutes) || 0;
    const percent = target ? Math.min(100, (elapsed / target) * 100) : 0;
    const progress = document.querySelector('#timer-target-progress');
    const fill = document.querySelector('#timer-progress-fill');
    if (progress) progress.setAttribute('aria-valuenow', String(Math.round(percent)));
    if (fill) fill.style.width = `${percent}%`;
  }

  function ensureTimerInterval() {
    clearInterval(timerInterval);
    timerInterval = state.activeTimer ? setInterval(updateTimerDisplay, 1000) : null;
  }

  function stageCategory(session, stage) {
    const taskId = stage.taskIds?.[0];
    return session?.tasks?.find((task) => task.id === taskId)?.category
      || session?.category
      || stage.type
      || 'foundations';
  }

  function focusStage(sessionId, stageId) {
    const found = findGuideStage(sessionId, stageId);
    if (!found) {
      toast('That guided stage is unavailable.');
      return;
    }
    const now = new Date().toISOString();
    const existingFocus = state.studyProgress?.activeFocus;
    const focusStartedAt = existingFocus?.sessionId === sessionId && existingFocus?.stageId === stageId
      ? existingFocus.startedAt
      : now;
    const activeTimer = logic.startTimer(
      stageCategory(found.session, found.stage),
      state.activeTimer?.startedAt || now,
      {
        sessionId,
        stageId,
        title: found.stage.title,
        targetMinutes: found.stage.minutes
      }
    );
    const nextState = {
      ...state,
      activeTimer,
      studyProgress: {
        ...state.studyProgress,
        activeFocus: { sessionId, stageId, startedAt: focusStartedAt }
      }
    };
    const current = currentRoute();
    if (!commitState(nextState, `Focused: ${found.stage.title}`, {
      syncGuided: false,
      rerender: current === 'today'
    })) return;
    if (current !== 'today') navigate('today');
  }

  function browseSession() {
    if (!state.studyProgress?.activeFocus) return;
    commitState({
      ...state,
      studyProgress: { ...state.studyProgress, activeFocus: null }
    }, 'Full session restored', { syncGuided: false });
  }

  function startTimerFromView() {
    if (state.activeTimer) return;
    const session = relevantSession();
    const category = document.querySelector('#timer-category')?.value || session?.category || 'coding';
    const timer = logic.startTimer(category, new Date().toISOString(), {
      sessionId: session?.id,
      title: session?.title || 'Study session',
      targetMinutes: session?.duration || 90
    });
    commitState({ ...state, activeTimer: timer }, 'Timer started', { syncGuided: false });
  }

  function stopTimerFromView() {
    const entry = logic.stopTimer(state.activeTimer);
    if (!entry) return;
    entry.note = entry.title || 'Focused dashboard session';
    commitState({
      ...state,
      activeTimer: null,
      timeEntries: [...state.timeEntries, entry]
    }, `Saved ${formatMinutes(entry.minutes)}`, { syncGuided: false });
  }

  function formDataObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function handleProblemAttempt(form) {
    const values = formDataObject(form);
    const problem = findProblem(values.problemId);
    if (!problem) {
      toast('Choose a valid problem.');
      return;
    }
    const attemptedAt = new Date().toISOString();
    const attempt = {
      problemId: problem.id,
      difficulty: String(problem.difficulty || '').toLowerCase(),
      random: values.random === 'on',
      outcome: values.outcome,
      solvedIndependently: values.outcome === 'independent',
      usedHint: values.outcome === 'hint',
      reviewedSolution: values.outcome === 'reviewed',
      minutes: Number(values.minutes),
      explainedAloud: values.explainedAloud === 'on',
      complexityCorrect: values.complexityCorrect === 'on',
      notes: values.notes,
      attemptedAt
    };
    let nextState = { ...state, problemAttempts: [...state.problemAttempts, attempt] };
    nextState = logic.scheduleProblemReview(nextState, attempt, attemptedAt);
    commitState(nextState, 'Coding attempt saved');
  }

  function handleQuiz(form) {
    const quiz = findQuiz(form.dataset.quizId);
    if (!quiz) {
      toast('That quiz is unavailable.');
      return;
    }
    const values = new FormData(form);
    const selections = [];
    const missedQuestionIndexes = [];
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      const selected = Number(values.get(`q-${index}`));
      selections.push(selected);
      if (selected === question.answerIndex) correct += 1;
      else missedQuestionIndexes.push(index);
    });
    const attemptedAt = new Date().toISOString();
    const attempt = {
      quizId: quiz.id,
      kind: quiz.kind,
      score: Math.round((correct / quiz.questions.length) * 100),
      correct,
      total: quiz.questions.length,
      selections,
      missedQuestionIndexes,
      noNotes: values.get('noNotes') === 'on',
      attemptedAt
    };
    let nextState = { ...state, quizAttempts: [...state.quizAttempts, attempt] };
    nextState = logic.scheduleQuizReviews(nextState, quiz.id, missedQuestionIndexes, attemptedAt);
    commitState(nextState, attempt.score >= 80 ? 'Quiz passed' : 'Quiz saved; review scheduled');
  }

  function handleDesignAttempt(form) {
    const values = formDataObject(form);
    if (!findDesignCase(values.caseId)) {
      toast('Choose a valid design case.');
      return;
    }
    const scores = Object.fromEntries(
      RUBRIC_DIMENSIONS.map((dimension) => [dimension, Number(values[`score-${dimension}`])])
    );
    const attempt = {
      caseId: values.caseId,
      durationMinutes: Number(values.durationMinutes),
      scores,
      note: values.note,
      attemptedAt: new Date().toISOString()
    };
    commitState({ ...state, designAttempts: [...state.designAttempts, attempt] }, 'Design rubric saved');
  }

  function handleManualStage(form) {
    const found = findGuideStage(form.dataset.sessionId, form.dataset.stageId);
    if (!found || found.stage.reference?.type !== 'instruction') {
      toast('That manual stage is unavailable.');
      return;
    }
    const values = formDataObject(form);
    const completedTasks = { ...state.completedTasks };
    found.stage.taskIds.forEach((taskId) => { completedTasks[taskId] = true; });
    commitState({
      ...state,
      completedTasks,
      sessionReflections: {
        ...state.sessionReflections,
        [found.stage.id]: values.reflection
      }
    }, 'Stage evidence saved');
  }

  function handleStory(form) {
    const values = formDataObject(form);
    const now = new Date().toISOString();
    const existing = editingStoryIndex === null ? null : state.starStories[editingStoryIndex];
    const story = {
      ...existing,
      title: values.title,
      situation: values.situation,
      task: values.task,
      action: values.action,
      result: values.result,
      durationMinutes: Number(values.durationMinutes),
      measurableImpact: values.measurableImpact === 'on',
      individualContribution: values.individualContribution === 'on',
      leadership: values.leadership === 'on',
      complete: values.complete === 'on',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    const stories = [...state.starStories];
    if (editingStoryIndex === null) stories.push(story);
    else stories[editingStoryIndex] = story;
    editingStoryIndex = null;
    commitState({ ...state, starStories: stories }, existing ? 'Story updated' : 'Story saved');
  }

  function handleRehearsal(form) {
    const values = formDataObject(form);
    const rehearsal = {
      durationMinutes: Number(values.durationMinutes),
      withoutNotes: values.withoutNotes === 'on',
      note: values.note,
      rehearsedAt: new Date().toISOString()
    };
    commitState({ ...state, rehearsals: [...state.rehearsals, rehearsal] }, 'Rehearsal saved');
  }

  function handleMock(form) {
    const values = formDataObject(form);
    const weakness = values.weakness?.trim()
      ? [{
          text: values.weakness.trim(),
          remediation: values.remediation?.trim() || '',
          remediationComplete: values.remediationComplete === 'on'
        }]
      : [];
    const mock = {
      type: values.type,
      source: values.source,
      wouldAdvance: values.wouldAdvance === 'on',
      weaknesses: weakness,
      createdAt: new Date().toISOString()
    };
    commitState({ ...state, mocks: [...state.mocks, mock] }, 'Mock saved');
  }

  function handleApplication(form) {
    const values = formDataObject(form);
    const now = new Date().toISOString();
    const existing = editingApplicationIndex === null
      ? null
      : state.applications[editingApplicationIndex];
    const application = {
      ...existing,
      company: values.company,
      role: values.role,
      url: values.url,
      stage: values.stage,
      interviewDate: values.interviewDate,
      contact: values.contact,
      notes: values.notes,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    const applications = [...state.applications];
    if (editingApplicationIndex === null) applications.push(application);
    else applications[editingApplicationIndex] = application;
    editingApplicationIndex = null;
    commitState({ ...state, applications }, existing ? 'Application updated' : 'Application saved', { syncGuided: false });
  }

  function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (form.classList.contains('problem-attempt-form')) return handleProblemAttempt(form);
    if (form.classList.contains('quiz-form')) return handleQuiz(form);
    if (form.classList.contains('design-attempt-form')) return handleDesignAttempt(form);
    if (form.classList.contains('manual-stage-form')) return handleManualStage(form);
    if (form.id === 'story-form') return handleStory(form);
    if (form.id === 'rehearsal-form') return handleRehearsal(form);
    if (form.id === 'mock-form') return handleMock(form);
    if (form.id === 'application-form') return handleApplication(form);

    if (form.id === 'manual-time-form') {
      const values = formDataObject(form);
      const now = new Date().toISOString();
      const entry = {
        category: values.category,
        minutes: Number(values.minutes),
        note: values.note,
        createdAt: now,
        endedAt: now
      };
      commitState({ ...state, timeEntries: [...state.timeEntries, entry] }, 'Study time added', { syncGuided: false });
      return;
    }

    if (form.id === 'override-form') {
      const values = formDataObject(form);
      commitState({
        ...state,
        readinessOverride: { reason: values.reason, createdAt: new Date().toISOString() }
      }, 'Application gate overridden', { syncGuided: false });
    }
  }

  function removeAt(field, index, message, syncGuided = true) {
    const numericIndex = Number(index);
    if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= state[field].length) return;
    const nextItems = state[field].filter((_item, itemIndex) => itemIndex !== numericIndex);
    commitState({ ...state, [field]: nextItems }, message, { syncGuided });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ml-cv-interview-prep-backup-${todayIso()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Progress backup exported');
  }

  async function importData(file) {
    if (!file) return;
    const previousState = state;
    try {
      const parsed = JSON.parse(await file.text());
      const result = logic.validateImportedState(parsed);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      if (commitState(result.value, 'Backup imported')) {
        try {
          localStorage.removeItem(STORAGE_KEY_V1);
        } catch (_error) {
          // v2 is already safely stored.
        }
      } else {
        state = previousState;
      }
    } catch (_error) {
      toast('The selected file is not valid JSON. Current progress was not changed.');
    } finally {
      importInput.value = '';
    }
  }

  function resetData() {
    const confirmation = window.prompt('Type RESET to permanently remove all locally saved progress.');
    if (confirmation !== 'RESET') {
      toast('Reset cancelled');
      return;
    }
    if (commitState(logic.createInitialState(), 'Dashboard reset', { syncGuided: false })) {
      try {
        localStorage.removeItem(STORAGE_KEY_V1);
      } catch (_error) {
        // The clean v2 state remains authoritative.
      }
    }
  }

  function handleClick(event) {
    const routeControl = event.target.closest('[data-route]');
    if (routeControl) {
      navigate(routeControl.dataset.route);
      return;
    }

    const control = event.target.closest('[data-action]');
    if (!control) return;
    const action = control.dataset.action;

    if (action === 'reveal-answer') {
      const target = document.getElementById(control.dataset.target);
      const wrapper = document.getElementById(control.dataset.wrap);
      if (target) target.hidden = false;
      if (wrapper) wrapper.hidden = true;
      control.setAttribute('aria-expanded', 'true');
      return;
    }

    if (action === 'rate-recall') {
      const moduleId = control.dataset.moduleId;
      const promptIndex = Number(control.dataset.promptIndex);
      const rating = control.dataset.rating;
      const nextState = logic.scheduleRecallReview(state, moduleId, promptIndex, rating);
      commitState(nextState, `Recall rated: ${rating.replace('-', ' ')}`);
      return;
    }

    if (action === 'study-module') {
      commitState(logic.markStudied(state, control.dataset.moduleId, new Date().toISOString()), 'Marked as studied', { syncGuided: false });
      return;
    }

    if (action === 'unstudy-module') {
      commitState(logic.unmarkStudied(state, control.dataset.moduleId), 'Moved back to studying', { syncGuided: false });
      return;
    }

    if (action === 'scroll-to-module') {
      const target = document.getElementById(safeId(`module-${control.dataset.moduleId}`));
      if (target) {
        target.open = true;
        target.querySelector('summary')?.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      }
      return;
    }

    if (action === 'focus-stage') return focusStage(control.dataset.sessionId, control.dataset.stageId);
    if (action === 'browse-session') return browseSession();
    if (action === 'start-timer') return startTimerFromView();
    if (action === 'stop-timer') return stopTimerFromView();
    if (action === 'cycle-theme') return cycleTheme();

    if (action === 'filter-problems') {
      problemFilter = control.dataset.filter;
      render();
      return;
    }

    if (action === 'prefill-problem') {
      const select = document.querySelector('#problem-log-problem');
      if (!select) {
        navigate('coding');
        return;
      }
      select.value = control.dataset.problemId;
      document.querySelector('#problem-log')?.scrollIntoView({ block: 'start' });
      document.querySelector('#problem-log-minutes')?.focus();
      return;
    }

    if (action === 'edit-story') {
      editingStoryIndex = Number(control.dataset.index);
      render();
      return;
    }
    if (action === 'cancel-story-edit') {
      editingStoryIndex = null;
      render();
      return;
    }
    if (action === 'delete-story') return removeAt('starStories', control.dataset.index, 'Story deleted');
    if (action === 'delete-mock') return removeAt('mocks', control.dataset.index, 'Mock deleted');

    if (action === 'edit-application') {
      editingApplicationIndex = Number(control.dataset.index);
      render();
      return;
    }
    if (action === 'cancel-application-edit') {
      editingApplicationIndex = null;
      render();
      return;
    }
    if (action === 'delete-application') return removeAt('applications', control.dataset.index, 'Application deleted', false);
    if (action === 'delete-time') return removeAt('timeEntries', control.dataset.index, 'Time entry deleted', false);
    if (action === 'export-data') return exportData();
    if (action === 'import-data') return importInput.click();
    if (action === 'reset-data') return resetData();
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  window.addEventListener('hashchange', render);
  importInput.addEventListener('change', () => importData(importInput.files[0]));
  mobileMenu.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-expanded', String(open));
  });
  themeToggle.addEventListener('click', cycleTheme);

  render();
})();
