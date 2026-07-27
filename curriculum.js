(function registerCurriculum() {
  'use strict';

  const problems = [
    { id: 'contains-duplicate', title: 'Contains Duplicate', pattern: 'Arrays & hashing', difficulty: 'Easy', url: 'https://leetcode.com/problems/contains-duplicate/' },
    { id: 'valid-anagram', title: 'Valid Anagram', pattern: 'Arrays & hashing', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-anagram/' },
    { id: 'two-sum', title: 'Two Sum', pattern: 'Arrays & hashing', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
    { id: 'group-anagrams', title: 'Group Anagrams', pattern: 'Arrays & hashing', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
    { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', pattern: 'Arrays & hashing', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    { id: 'product-of-array-except-self', title: 'Product of Array Except Self', pattern: 'Arrays & hashing', difficulty: 'Medium', url: 'https://leetcode.com/problems/product-of-array-except-self/' },

    { id: 'valid-palindrome', title: 'Valid Palindrome', pattern: 'Two pointers', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
    { id: 'two-sum-ii-input-array-is-sorted', title: 'Two Sum II', pattern: 'Two pointers', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
    { id: '3sum', title: '3Sum', pattern: 'Two pointers', difficulty: 'Medium', url: 'https://leetcode.com/problems/3sum/' },
    { id: 'container-with-most-water', title: 'Container With Most Water', pattern: 'Two pointers', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' },

    { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', pattern: 'Sliding window', difficulty: 'Easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { id: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', pattern: 'Sliding window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', pattern: 'Sliding window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
    { id: 'permutation-in-string', title: 'Permutation in String', pattern: 'Sliding window', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutation-in-string/' },
    { id: 'minimum-window-substring', title: 'Minimum Window Substring', pattern: 'Sliding window', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring/' },

    { id: 'valid-parentheses', title: 'Valid Parentheses', pattern: 'Stack', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
    { id: 'min-stack', title: 'Min Stack', pattern: 'Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-stack/' },
    { id: 'evaluate-reverse-polish-notation', title: 'Evaluate Reverse Polish Notation', pattern: 'Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
    { id: 'daily-temperatures', title: 'Daily Temperatures', pattern: 'Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/daily-temperatures/' },
    { id: 'car-fleet', title: 'Car Fleet', pattern: 'Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/car-fleet/' },

    { id: 'binary-search', title: 'Binary Search', pattern: 'Binary search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
    { id: 'search-a-2d-matrix', title: 'Search a 2D Matrix', pattern: 'Binary search', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
    { id: 'koko-eating-bananas', title: 'Koko Eating Bananas', pattern: 'Binary search', difficulty: 'Medium', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
    { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', pattern: 'Binary search', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
    { id: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', pattern: 'Binary search', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },

    { id: 'reverse-linked-list', title: 'Reverse Linked List', pattern: 'Linked lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
    { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', pattern: 'Linked lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { id: 'reorder-list', title: 'Reorder List', pattern: 'Linked lists', difficulty: 'Medium', url: 'https://leetcode.com/problems/reorder-list/' },
    { id: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End of List', pattern: 'Linked lists', difficulty: 'Medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
    { id: 'linked-list-cycle', title: 'Linked List Cycle', pattern: 'Linked lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },

    { id: 'invert-binary-tree', title: 'Invert Binary Tree', pattern: 'Trees', difficulty: 'Easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
    { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', pattern: 'Trees', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
    { id: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', pattern: 'Trees', difficulty: 'Easy', url: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
    { id: 'balanced-binary-tree', title: 'Balanced Binary Tree', pattern: 'Trees', difficulty: 'Easy', url: 'https://leetcode.com/problems/balanced-binary-tree/' },
    { id: 'same-tree', title: 'Same Tree', pattern: 'Trees', difficulty: 'Easy', url: 'https://leetcode.com/problems/same-tree/' },
    { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', pattern: 'Trees', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { id: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', pattern: 'Trees', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
    { id: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', pattern: 'Trees', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
    { id: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a BST', pattern: 'Trees', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },

    { id: 'kth-largest-element-in-an-array', title: 'Kth Largest Element in an Array', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
    { id: 'last-stone-weight', title: 'Last Stone Weight', pattern: 'Heap & intervals', difficulty: 'Easy', url: 'https://leetcode.com/problems/last-stone-weight/' },
    { id: 'k-closest-points-to-origin', title: 'K Closest Points to Origin', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
    { id: 'merge-intervals', title: 'Merge Intervals', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
    { id: 'insert-interval', title: 'Insert Interval', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/insert-interval/' },
    { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/non-overlapping-intervals/' },
    { id: 'task-scheduler', title: 'Task Scheduler', pattern: 'Heap & intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/task-scheduler/' },

    { id: 'number-of-islands', title: 'Number of Islands', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
    { id: 'clone-graph', title: 'Clone Graph', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/' },
    { id: 'max-area-of-island', title: 'Max Area of Island', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/max-area-of-island/' },
    { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
    { id: 'course-schedule', title: 'Course Schedule', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
    { id: 'rotting-oranges', title: 'Rotting Oranges', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' },
    { id: 'redundant-connection', title: 'Redundant Connection', pattern: 'Graphs', difficulty: 'Medium', url: 'https://leetcode.com/problems/redundant-connection/' },

    { id: 'subsets', title: 'Subsets', pattern: 'Backtracking', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
    { id: 'combination-sum', title: 'Combination Sum', pattern: 'Backtracking', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum/' },
    { id: 'permutations', title: 'Permutations', pattern: 'Backtracking', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/' },
    { id: 'word-search', title: 'Word Search', pattern: 'Backtracking', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-search/' },

    { id: 'climbing-stairs', title: 'Climbing Stairs', pattern: 'Dynamic programming', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
    { id: 'house-robber', title: 'House Robber', pattern: 'Dynamic programming', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
    { id: 'coin-change', title: 'Coin Change', pattern: 'Dynamic programming', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' }
  ];

  const task = (id, title, detail, minutes, category) => ({ id, title, detail, minutes, category });
  const session = (id, date, title, category, outcome, description, duration, tasks) => ({ id, date, title, category, outcome, description, duration, tasks });

  const weeks = [
    {
      week: 1,
      phase: 'Rebuild',
      theme: 'Baseline and core judgment',
      goal: 'Measure the starting point, restore Python/Big-O fluency, and build the loss-and-metric decision map.',
      sessions: [
        session('w1-mon', '2026-07-27', 'Four-part baseline', 'foundations', 'Establish honest starting scores', 'Do not study first. The baseline makes later improvement measurable.', 90, [
          task('w1-baseline-code', 'Timed coding baseline', 'Solve Two Sum or a comparable unseen easy in 30 minutes while speaking aloud.', 30, 'coding'),
          task('w1-baseline-theory', 'ML fundamentals diagnostic', 'Take the core diagnostic without notes; flag every uncertain answer.', 20, 'foundations'),
          task('w1-baseline-design', 'Design baseline', 'Sketch a real-time image classification service in 30 minutes.', 30, 'system-design'),
          task('w1-baseline-intro', 'Two-minute introduction', 'Record your career summary once without editing.', 10, 'behavioral')
        ]),
        session('w1-tue', '2026-07-28', 'Python and Big-O reset', 'coding', 'Recover interview coding mechanics', 'Use Andrei Neagoie only for targeted concept repair, then write code yourself.', 90, [
          task('w1-python', 'Python interview toolkit', 'Review dict, set, Counter, defaultdict, deque, heapq, sorting keys, and recursion limits.', 35, 'coding'),
          task('w1-bigo', 'Big-O and memory', 'State time and space for common collection operations and nested loops.', 25, 'coding'),
          task('w1-problems-a', 'Arrays set A', 'Contains Duplicate, Valid Anagram, Two Sum.', 30, 'coding')
        ]),
        session('w1-wed', '2026-07-29', 'Linear algebra for ML', 'foundations', 'Explain vectors, projections, eigenvectors, and SVD', 'Connect every operation to embeddings, PCA, convolutions, or optimization.', 90, [
          task('w1-linear-notes', 'Study linear algebra core', 'Vectors, norms, dot products, matrix multiplication, rank, basis, projection.', 45, 'foundations'),
          task('w1-linear-recall', 'Derive and retrieve', 'Explain cosine similarity and PCA aloud; complete recall prompts.', 30, 'foundations'),
          task('w1-linear-quiz', 'Linear algebra quiz', 'Take the quiz without reopening the notes.', 15, 'foundations')
        ]),
        session('w1-thu', '2026-07-30', 'Hashing and two pointers', 'coding', 'Recognize state lookup versus ordered convergence', 'Solve first, then compare your invariant with the reference pattern.', 90, [
          task('w1-problems-b', 'Arrays set B', 'Group Anagrams, Top K Frequent Elements, Product Except Self.', 55, 'coding'),
          task('w1-problems-c', 'Two-pointer start', 'Valid Palindrome and Two Sum II.', 25, 'coding'),
          task('w1-pattern-log', 'Pattern journal', 'Write one sentence describing the invariant for hashing and two pointers.', 10, 'coding')
        ]),
        session('w1-sat', '2026-08-01', 'Task, loss, and metric map', 'foundations', 'Choose defensible losses and metrics by task', 'Build the classification, regression, detection, and segmentation cheat sheet.', 180, [
          task('w1-losses', 'Loss functions', 'Cross-entropy, BCE-with-logits, focal, Dice, IoU/Jaccard, smooth L1, MSE, MAE, Huber.', 60, 'foundations'),
          task('w1-metrics', 'Metrics and thresholds', 'Precision, recall, F1, ROC-AUC, PR-AUC, calibration, mAP, IoU, Dice, boundary F1.', 60, 'foundations'),
          task('w1-task-metric-quiz', 'Task-to-metric scenarios', 'Answer production scenarios and justify every choice aloud.', 60, 'foundations')
        ]),
        session('w1-sun', '2026-08-02', 'ML system-design frame', 'system-design', 'Use one repeatable end-to-end structure', 'Learn the interview sequence and apply it to the baseline design.', 180, [
          task('w1-design-frame', 'Requirements to feedback loop', 'Practice requirements, metrics, data, model, evaluation, serving, monitoring, feedback, tradeoffs.', 60, 'system-design'),
          task('w1-design-rework', 'Rework baseline design', 'Redo the image-classification service using the full frame.', 75, 'system-design'),
          task('w1-retro', 'Week 1 retrospective', 'Record red areas, actual hours, and one schedule correction.', 45, 'behavioral')
        ])
      ]
    },
    {
      week: 2,
      phase: 'Rebuild',
      theme: 'Probability, statistics, and core patterns',
      goal: 'Restore probabilistic reasoning while making sliding-window, stack, search, and linked-list patterns automatic.',
      sessions: [
        session('w2-mon', '2026-08-03', 'Sliding windows', 'coding', 'Maintain a valid window with explicit state', 'State what expands, what invalidates, and what shrinks before writing code.', 90, [
          task('w2-window-a', 'Fixed and variable windows', 'Best Time to Buy/Sell Stock and Longest Substring Without Repeats.', 50, 'coding'),
          task('w2-window-b', 'Constraint-driven window', 'Longest Repeating Character Replacement.', 30, 'coding'),
          task('w2-window-recall', 'Window invariant', 'Explain why each pointer only moves forward.', 10, 'coding')
        ]),
        session('w2-tue', '2026-08-04', 'Probability foundations', 'foundations', 'Use conditional probability and Bayes correctly', 'Translate natural-language events before touching formulas.', 90, [
          task('w2-probability', 'Probability core', 'Conditional probability, independence, Bayes, expectation, variance, covariance.', 50, 'foundations'),
          task('w2-distributions', 'Useful distributions', 'Bernoulli, binomial, categorical, Gaussian, Poisson; know modeling assumptions.', 25, 'foundations'),
          task('w2-prob-recall', 'Probability recall', 'Explain false-positive base-rate effects and calibration.', 15, 'foundations')
        ]),
        session('w2-wed', '2026-08-05', 'Stacks and monotonic state', 'coding', 'Recognize deferred work and next-greater-element patterns', 'Use the stack as an explicit record of unresolved items.', 90, [
          task('w2-stack-a', 'Stack basics', 'Valid Parentheses, Min Stack, Evaluate Reverse Polish Notation.', 50, 'coding'),
          task('w2-stack-b', 'Monotonic stack', 'Daily Temperatures.', 30, 'coding'),
          task('w2-stack-recall', 'Complexity explanation', 'Explain amortized O(n) for a monotonic stack.', 10, 'coding')
        ]),
        session('w2-thu', '2026-08-06', 'Binary search and linked lists', 'coding', 'Search monotonic spaces and manipulate pointers safely', 'Write loop invariants before updating bounds or links.', 90, [
          task('w2-binary', 'Binary-search core', 'Binary Search, Search a 2D Matrix, Koko Eating Bananas.', 50, 'coding'),
          task('w2-linked', 'Linked-list core', 'Reverse Linked List and Merge Two Sorted Lists.', 30, 'coding'),
          task('w2-pointer-check', 'Pointer dry run', 'Trace one odd-length and one two-node case by hand.', 10, 'coding')
        ]),
        session('w2-sat', '2026-08-08', 'Statistics and validation', 'foundations', 'Reason about estimates, uncertainty, and leakage', 'Use validation design that matches the deployment distribution.', 180, [
          task('w2-statistics', 'Statistical inference', 'Sampling, estimators, bias, variance, confidence intervals, hypothesis tests, power.', 60, 'foundations'),
          task('w2-validation', 'Validation strategy', 'Random, stratified, grouped, temporal, and cross-validation; identify leakage routes.', 60, 'foundations'),
          task('w2-stats-quiz', 'Statistics quiz', 'Complete scenarios on leakage, uncertainty, and experimental claims.', 60, 'foundations')
        ]),
        session('w2-sun', '2026-08-09', 'Model debugging and first story inventory', 'foundations', 'Debug systematically and inventory real evidence', 'Connect failure symptoms to data, objective, optimization, capacity, and serving.', 180, [
          task('w2-debugging', 'Training-debugging playbook', 'Overfit one batch; inspect labels, gradients, activations, learning rate, and train/eval mode.', 70, 'foundations'),
          task('w2-story-inventory', 'Project evidence inventory', 'List ten projects/incidents with scope, decision, action, and measured result.', 60, 'behavioral'),
          task('w2-retro', 'Week 2 retrospective', 'Choose the three weakest coding patterns for repeats.', 50, 'behavioral')
        ])
      ]
    },
    {
      week: 3,
      phase: 'Rebuild',
      theme: 'Optimization, trees, and graphs',
      goal: 'Finish the foundation rebuild and become comfortable with recursive and graph-shaped problems.',
      sessions: [
        session('w3-mon', '2026-08-10', 'Trees I', 'coding', 'Translate recursive definitions into return values', 'Say what each recursive call returns before coding.', 90, [
          task('w3-trees-a', 'Tree traversal', 'Invert Tree, Maximum Depth, Same Tree.', 45, 'coding'),
          task('w3-trees-b', 'Postorder information', 'Diameter and Balanced Binary Tree.', 35, 'coding'),
          task('w3-tree-invariant', 'Recursive contract', 'Write the return-value contract for each helper.', 10, 'coding')
        ]),
        session('w3-tue', '2026-08-11', 'Calculus and backpropagation', 'foundations', 'Explain gradients as local sensitivity', 'Derive enough to reason about saturation, exploding gradients, and learning rates.', 90, [
          task('w3-calculus', 'Derivative and gradient core', 'Partial derivatives, chain rule, Jacobian intuition, directional derivatives.', 45, 'foundations'),
          task('w3-backprop', 'Backpropagation', 'Trace a two-layer network and explain cached activations.', 30, 'foundations'),
          task('w3-gradient-recall', 'Gradient failure recall', 'Explain vanishing, exploding, clipping, and normalization.', 15, 'foundations')
        ]),
        session('w3-wed', '2026-08-12', 'Trees II and heaps', 'coding', 'Use ordering and priority structures intentionally', 'Separate traversal order from the information being aggregated.', 90, [
          task('w3-trees-c', 'BST and breadth-first', 'Level Order, Validate BST, Kth Smallest, LCA in BST.', 55, 'coding'),
          task('w3-heaps-a', 'Heap basics', 'Last Stone Weight and K Closest Points.', 25, 'coding'),
          task('w3-heap-recall', 'Heap selection rule', 'Explain when heapq beats sorting and when it does not.', 10, 'coding')
        ]),
        session('w3-thu', '2026-08-13', 'Graphs I', 'coding', 'Traverse components without revisiting state', 'Choose BFS versus DFS based on output and memory needs, not habit.', 90, [
          task('w3-graphs-a', 'Grid traversal', 'Number of Islands and Max Area of Island.', 40, 'coding'),
          task('w3-graphs-b', 'Graph copies and waves', 'Clone Graph and Rotting Oranges.', 40, 'coding'),
          task('w3-graph-recall', 'Visited-state rule', 'Explain when to mark visited: enqueue versus dequeue.', 10, 'coding')
        ]),
        session('w3-sat', '2026-08-15', 'Optimization and generalization', 'foundations', 'Choose optimizers and regularizers with reasons', 'Tie each technique to geometry, noise, data size, and failure symptoms.', 180, [
          task('w3-optimizers', 'SGD to Adam', 'Momentum, adaptive moments, weight decay, learning-rate schedules, warmup.', 60, 'foundations'),
          task('w3-regularization', 'Generalization controls', 'L1/L2, decoupled weight decay, dropout, augmentation, early stopping, label smoothing.', 60, 'foundations'),
          task('w3-optimization-quiz', 'Optimization rapid fire', 'Answer optimizer, normalization, and regularization scenarios without notes.', 60, 'foundations')
        ]),
        session('w3-sun', '2026-08-16', 'Graphs II and rebuild checkpoint', 'coding', 'Finish core graph patterns and prove improvement', 'Use a short timed checkpoint against Week 1.', 180, [
          task('w3-graphs-c', 'Dependencies and reverse search', 'Course Schedule and Pacific Atlantic Water Flow.', 60, 'coding'),
          task('w3-graphs-d', 'Union-find intuition', 'Redundant Connection; compare union-find with DFS.', 35, 'coding'),
          task('w3-checkpoint', 'Rebuild checkpoint', 'Random medium, foundations quiz, and 20-minute design outline.', 55, 'mocks'),
          task('w3-retro', 'Phase retrospective', 'Record deltas from baseline and carry only unresolved red areas.', 30, 'behavioral')
        ])
      ]
    },
    {
      week: 4,
      phase: 'Build',
      theme: 'Vision transformers and retrieval systems',
      goal: 'Shift emphasis to timed coding and current-looking ML system designs.',
      sessions: [
        session('w4-mon', '2026-08-17', 'Timed mixed coding I', 'coding', 'Solve mediums under 30 minutes', 'Select one window, one tree, and one graph problem at random.', 90, [
          task('w4-timed-a', 'Three timed problems', 'Thirty minutes each including verbal explanation and complexity.', 90, 'coding')
        ]),
        session('w4-tue', '2026-08-18', 'ViT and DETR', 'modern-cv', 'Explain transformer changes to vision modeling', 'Focus on tokens, positional information, data needs, matching, and production cost.', 90, [
          task('w4-vit', 'Vision Transformer', 'Patch embeddings, class token, attention complexity, inductive bias, pretraining.', 45, 'modern-cv'),
          task('w4-detr', 'DETR family', 'Set prediction, Hungarian matching, object queries, NMS tradeoff, convergence.', 45, 'modern-cv')
        ]),
        session('w4-wed', '2026-08-19', 'Intervals, heaps, and backtracking', 'coding', 'Recognize ordering, priority, and search-tree state', 'Make pruning and ordering decisions explicit.', 90, [
          task('w4-intervals', 'Interval set', 'Merge Intervals, Insert Interval, Non-overlapping Intervals.', 45, 'coding'),
          task('w4-backtrack-a', 'Backtracking start', 'Subsets and Permutations.', 35, 'coding'),
          task('w4-state-recall', 'State template', 'Define choose, explore, and unchoose in one example.', 10, 'coding')
        ]),
        session('w4-thu', '2026-08-20', 'Image-search design', 'system-design', 'Design two-stage visual retrieval', 'Separate candidate generation from reranking and offline metrics from online outcomes.', 90, [
          task('w4-search-requirements', 'Clarify and estimate', 'Catalog size, query modes, latency, freshness, regions, and relevance labels.', 25, 'system-design'),
          task('w4-search-architecture', 'Embedding and ANN design', 'Dual encoder, vector index, metadata filters, reranker, caching, feedback.', 45, 'system-design'),
          task('w4-search-review', 'Pressure test', 'Cold start, duplicate images, drift, bias, and index rebuilds.', 20, 'system-design')
        ]),
        session('w4-sat', '2026-08-22', 'Visual similarity design', 'system-design', 'Connect representation learning to product metrics', 'Write the complete design, then score it against the rubric.', 180, [
          task('w4-similarity-design', '40-minute design', 'Visual similarity and product recommendation system.', 45, 'system-design'),
          task('w4-similarity-debrief', 'Rubric and rewrite', 'Score every category; repair the two weakest sections.', 55, 'system-design'),
          task('w4-clip-preview', 'Contrastive learning preview', 'Understand positive pairs, negatives, temperature, and zero-shot labels.', 45, 'modern-cv'),
          task('w4-story-a', 'Draft two STAR stories', 'Highest impact and hardest ambiguity.', 35, 'behavioral')
        ]),
        session('w4-sun', '2026-08-23', 'Foundations consolidation I', 'foundations', 'Answer core theory without notes', 'Use mistakes to create retrieval prompts, not more reading.', 180, [
          task('w4-theory-bank', 'ML interview question bank', 'Answer 25 questions across data, training, evaluation, and deployment.', 70, 'foundations'),
          task('w4-task-metric-repeat', 'Task-metric repeat', 'Retake with changed class imbalance and business costs.', 40, 'foundations'),
          task('w4-coding-repeat', 'Spaced coding repeats', 'Repeat three previously missed problems cold.', 45, 'coding'),
          task('w4-retro', 'Week 4 retrospective', 'Update weak patterns and design-rubric gaps.', 25, 'behavioral')
        ])
      ]
    },
    {
      week: 5,
      phase: 'Build',
      theme: 'Detection, video, CLIP, and self-supervision',
      goal: 'Build production judgment around real-time vision, video pipelines, and reusable representations.',
      sessions: [
        session('w5-mon', '2026-08-24', 'Timed mixed coding II', 'coding', 'Increase medium consistency', 'Randomize patterns and stop at 30 minutes for an honest signal.', 90, [task('w5-timed-a', 'Three timed mediums', 'Log each attempt and compare the invariant, not code style.', 90, 'coding')]),
        session('w5-tue', '2026-08-25', 'CLIP and DINOv2', 'modern-cv', 'Compare language-aligned and self-supervised representations', 'Know what supervision each objective provides and where transfer breaks.', 90, [
          task('w5-clip', 'CLIP', 'Contrastive objective, zero-shot classifiers, prompt sensitivity, embedding retrieval.', 45, 'modern-cv'),
          task('w5-dinov2', 'DINOv2', 'Teacher-student self-distillation, general features, dense-task transfer, limitations.', 45, 'modern-cv')
        ]),
        session('w5-wed', '2026-08-26', 'Backtracking and DP essentials', 'coding', 'Frame state transitions explicitly', 'Avoid memorizing DP tables; state the recurrence and base cases.', 90, [
          task('w5-backtrack-b', 'Backtracking set', 'Combination Sum and Word Search.', 45, 'coding'),
          task('w5-dp-a', 'DP start', 'Climbing Stairs and House Robber.', 35, 'coding'),
          task('w5-dp-recall', 'Recurrence recall', 'Explain state, transition, base, order, and answer.', 10, 'coding')
        ]),
        session('w5-thu', '2026-08-27', 'Real-time detection design', 'system-design', 'Balance accuracy, latency, throughput, and cost', 'Use cascades, batching, compression, and fallbacks as explicit tradeoffs.', 90, [
          task('w5-detection-design', 'Detection service outline', 'Camera input to alert delivery with SLOs and failure modes.', 55, 'system-design'),
          task('w5-detection-metrics', 'Detection evaluation', 'mAP slices, operating points, alert precision, event-level latency.', 20, 'foundations'),
          task('w5-edge-tradeoffs', 'Edge/cloud tradeoff', 'Reason about privacy, bandwidth, updates, and device heterogeneity.', 15, 'system-design')
        ]),
        session('w5-sat', '2026-08-29', 'Video moderation design', 'system-design', 'Design sampling, temporal aggregation, and review', 'Model the whole video and the human process, not just frame classification.', 180, [
          task('w5-video-design', '40-minute design', 'Harmful-content detection for uploaded and live video.', 45, 'system-design'),
          task('w5-video-debrief', 'Rubric and rewrite', 'Fix missing temporal, multimodal, policy, and reviewer-feedback details.', 55, 'system-design'),
          task('w5-video-cv', 'Video model choices', 'Frame sampling, tracking, temporal encoders, late fusion, cascades.', 45, 'modern-cv'),
          task('w5-story-b', 'Draft two STAR stories', 'Production incident and model-quality tradeoff.', 35, 'behavioral')
        ]),
        session('w5-sun', '2026-08-30', 'Data-centric ML', 'foundations', 'Treat data as a versioned system', 'Connect label definitions, slices, active learning, and drift to business failure.', 180, [
          task('w5-data-quality', 'Data and labeling', 'Ontology, guidelines, agreement, adjudication, weak labels, provenance, versioning.', 55, 'foundations'),
          task('w5-error-analysis', 'Slice-based error analysis', 'Build a taxonomy; rank error mass by impact and fixability.', 45, 'foundations'),
          task('w5-active-learning', 'Active learning', 'Uncertainty, diversity, representativeness, and sampling bias.', 40, 'foundations'),
          task('w5-retro', 'Week 5 retrospective', 'Choose one design and one coding weakness for Week 6 remediation.', 40, 'behavioral')
        ])
      ]
    },
    {
      week: 6,
      phase: 'Build',
      theme: 'Segmentation, grounding, and first live mock',
      goal: 'Use promptable/open-vocabulary models responsibly and obtain the first external interview signal.',
      sessions: [
        session('w6-mon', '2026-08-31', 'Timed mixed coding III', 'coding', 'Reach four-of-five medium consistency', 'Use one problem from a known weak pattern and two random patterns.', 90, [task('w6-timed-a', 'Three timed mediums', 'Log random flag only when the problem was genuinely unseen.', 90, 'coding')]),
        session('w6-tue', '2026-09-01', 'SAM2 and Grounding DINO', 'modern-cv', 'Compose grounding and segmentation without hand-waving', 'Know prompt types, open-set behavior, temporal memory, latency, and failure modes.', 90, [
          task('w6-sam2', 'SAM and SAM2', 'Promptable masks, image encoder amortization, video memory, domain shift.', 45, 'modern-cv'),
          task('w6-grounding-dino', 'Grounding DINO', 'Text-conditioned open-set detection, phrase grounding, thresholds, calibration.', 45, 'modern-cv')
        ]),
        session('w6-wed', '2026-09-02', 'Coding weak-pattern repair', 'coding', 'Close one repeated failure mode', 'Choose from the dashboard evidence, not intuition.', 90, [
          task('w6-weak-pattern', 'Targeted concept repair', 'Re-derive the pattern template and solve one easy warmup.', 30, 'coding'),
          task('w6-weak-problems', 'Two cold mediums', 'No solution access before 30 minutes.', 60, 'coding')
        ]),
        session('w6-thu', '2026-09-03', 'Segmentation-system design', 'system-design', 'Choose metrics and architecture by error cost', 'Include annotation cost, boundaries, small objects, review, and drift.', 90, [
          task('w6-seg-design', 'Segmentation outline', 'Defect or medical-image segmentation from ingest to review.', 55, 'system-design'),
          task('w6-seg-metrics', 'Metric decision', 'Dice versus IoU versus boundary F1; object-level sensitivity and calibration.', 20, 'foundations'),
          task('w6-seg-modern', 'Foundation-model decision', 'Use SAM2 as label accelerator, baseline, component, or not at all.', 15, 'modern-cv')
        ]),
        session('w6-sat', '2026-09-05', 'First coding mock', 'mocks', 'Obtain an external advance/no-advance signal', 'Treat the mock as a real interview and log remediation immediately.', 180, [
          task('w6-mock-setup', 'Mock preparation', 'Choose platform/partner; camera, editor, and timer ready.', 20, 'mocks'),
          task('w6-coding-mock', 'Coding mock', 'Complete a 60-minute interview with verbal reasoning.', 60, 'mocks'),
          task('w6-mock-debrief', 'Feedback and remediation', 'Record signal, one weakness, and a concrete repair task.', 40, 'mocks'),
          task('w6-remediation', 'Immediate repair', 'Study the missed pattern and solve one adjacent problem.', 60, 'coding')
        ]),
        session('w6-sun', '2026-09-06', 'Story bank and design rehearsal', 'behavioral', 'Make four stories and one design speakable', 'Written quality is not enough; rehearse aloud under a timer.', 180, [
          task('w6-story-c', 'Draft four more STAR stories', 'Failure, conflict, leadership, and cross-team influence.', 80, 'behavioral'),
          task('w6-story-rehearse', 'Rehearse four stories', 'Two minutes each; cut context before cutting decisions/results.', 40, 'behavioral'),
          task('w6-design-aloud', 'Design aloud', 'Present the segmentation design in 40 minutes without notes.', 40, 'system-design'),
          task('w6-retro', 'Week 6 retrospective', 'Use mock feedback to reweight Week 7.', 20, 'behavioral')
        ])
      ]
    },
    {
      week: 7,
      phase: 'Build',
      theme: 'OCR, active learning, multimodal systems',
      goal: 'Complete all eight system-design cases and convert the story inventory into interview answers.',
      sessions: [
        session('w7-mon', '2026-09-07', 'Timed mixed coding IV', 'coding', 'Hold the 30-minute medium bar', 'Random problems only; log explanation and complexity evidence.', 90, [task('w7-timed-a', 'Three random mediums', 'Stop, debrief, and classify any failure by pattern or execution.', 90, 'coding')]),
        session('w7-tue', '2026-09-08', 'Vision-language models and diffusion', 'modern-cv', 'Explain capability without treating models as magic', 'Separate perception, grounding, language generation, and generative priors.', 90, [
          task('w7-vlm', 'Vision-language models', 'Projector/fusion patterns, instruction tuning, grounding limits, hallucination, evaluation.', 50, 'modern-cv'),
          task('w7-diffusion', 'Diffusion concepts', 'Forward noise, denoising objective, latent diffusion, conditioning, sampling cost.', 40, 'modern-cv')
        ]),
        session('w7-wed', '2026-09-09', 'OCR/document design', 'system-design', 'Design multi-stage document understanding', 'Include layout, OCR confidence, language, tables, PII, and human correction.', 90, [
          task('w7-ocr-design', 'OCR design outline', 'Document ingestion through structured extraction and correction.', 55, 'system-design'),
          task('w7-ocr-eval', 'Evaluation plan', 'Character/word error, field exact match, document success, confidence calibration.', 20, 'foundations'),
          task('w7-ocr-failures', 'Failure slices', 'Rotation, blur, handwriting, script, layout, tables, and domain vocabulary.', 15, 'system-design')
        ]),
        session('w7-thu', '2026-09-10', 'Compression and edge inference', 'modern-cv', 'Choose compression by bottleneck and risk', 'Quantify memory, latency, throughput, accuracy, energy, and hardware support.', 90, [
          task('w7-quantization', 'Quantization', 'PTQ versus QAT, calibration data, per-channel scales, sensitive layers.', 30, 'modern-cv'),
          task('w7-distillation', 'Distillation and pruning', 'Logit/feature losses, structured sparsity, student capacity.', 30, 'modern-cv'),
          task('w7-serving', 'Serving optimization', 'Batching, compilation, operator support, caching, cascades, fallbacks.', 30, 'system-design')
        ]),
        session('w7-sat', '2026-09-12', 'Active-learning and human-review design', 'system-design', 'Design a feedback system without selection bias', 'Treat annotation operations and model updates as first-class services.', 180, [
          task('w7-active-design', '40-minute design', 'Active-learning and human-review platform for CV.', 45, 'system-design'),
          task('w7-active-debrief', 'Rubric and rewrite', 'Repair selection, labeling quality, versioning, and rollout gaps.', 45, 'system-design'),
          task('w7-multimodal-design', 'Multimodal/VLM design', 'Design visual question answering or multimodal RAG with grounding and safety.', 60, 'system-design'),
          task('w7-story-finish', 'Complete story bank', 'Bring all eight stories to measurable, two-minute drafts.', 30, 'behavioral')
        ]),
        session('w7-sun', '2026-09-13', 'Build-phase checkpoint', 'mocks', 'Prove coverage before simulation', 'Run timed theory and design checks; repair only demonstrated gaps.', 180, [
          task('w7-rapid-fire', 'ML rapid-fire', 'Thirty questions without notes; log as rapid-fire quiz.', 45, 'foundations'),
          task('w7-design-random', 'Random 40-minute design', 'Select one of eight cases and score all ten rubric dimensions.', 50, 'system-design'),
          task('w7-coding-random', 'Random medium', 'Solve and explain within 30 minutes.', 35, 'coding'),
          task('w7-retro', 'Phase retrospective', 'List exact gates that remain red or amber.', 50, 'behavioral')
        ])
      ]
    },
    {
      week: 8,
      phase: 'Simulate',
      theme: 'Interview conditions and feedback loops',
      goal: 'Replace new content with repeated interview simulations and targeted remediation.',
      sessions: [
        session('w8-mon', '2026-09-14', 'Random-medium set I', 'coding', 'Create the first readiness rolling sample', 'Every attempt must be random, spoken, and capped at 30 minutes.', 90, [task('w8-random-a', 'Three random mediums', 'Log independence, timing, explanation, and complexity.', 90, 'coding')]),
        session('w8-tue', '2026-09-15', 'System-design simulation I', 'system-design', 'Deliver a complete design without notes', 'Use 40 minutes, then ten minutes to score and ten to repair.', 90, [
          task('w8-design-sim-a', 'Design simulation', 'Random CV case with an interviewer-style clarifying phase.', 50, 'system-design'),
          task('w8-design-fix-a', 'Rubric remediation', 'Rewrite the lowest-scoring two dimensions.', 40, 'system-design')
        ]),
        session('w8-wed', '2026-09-16', 'Fundamentals simulation I', 'foundations', 'Answer rapidly and defend choices', 'Prefer concise first answers followed by deeper reasoning on request.', 90, [
          task('w8-theory-sim-a', 'Rapid-fire theory', 'Losses, metrics, validation, optimization, debugging, and deployment.', 45, 'foundations'),
          task('w8-theory-fix-a', 'Weak-concept repair', 'Review only missed concepts, then answer again from memory.', 45, 'foundations')
        ]),
        session('w8-thu', '2026-09-17', 'Behavioral simulation I', 'behavioral', 'Deliver eight stories without reading', 'Record yourself; inspect ownership, senior scope, and measurable result.', 90, [
          task('w8-story-rehearsal-a', 'Eight-story rehearsal', 'Two minutes per story, no notes.', 45, 'behavioral'),
          task('w8-story-edit-a', 'Tighten weak stories', 'Cut setup, clarify decisions, quantify impact, add reflection.', 45, 'behavioral')
        ]),
        session('w8-sat', '2026-09-19', 'Coding mock II', 'mocks', 'Meet the external coding signal', 'Use a different partner or platform where possible.', 180, [
          task('w8-coding-mock', 'Full coding mock', 'Complete the interview and request a clear advance signal.', 60, 'mocks'),
          task('w8-coding-debrief', 'Debrief', 'Record weakness and remediation task.', 30, 'mocks'),
          task('w8-coding-repair', 'Targeted repair', 'Solve two adjacent problems under time.', 70, 'coding'),
          task('w8-coding-recall', 'Explain templates', 'Recite the five weakest pattern invariants.', 20, 'coding')
        ]),
        session('w8-sun', '2026-09-20', 'ML/system mock I', 'mocks', 'Obtain an external senior-level design signal', 'Ask for specific feedback on structure, tradeoffs, and communication.', 180, [
          task('w8-ml-mock', 'ML/system-design mock', 'Complete one theory segment and one design segment.', 75, 'mocks'),
          task('w8-ml-debrief', 'Debrief and rubric', 'Translate feedback into one remediation task per weak dimension.', 45, 'mocks'),
          task('w8-ml-repair', 'Immediate repair', 'Re-present the weakest design section and missed theory answers.', 40, 'system-design'),
          task('w8-retro', 'Week 8 retrospective', 'Update readiness evidence only from observed results.', 20, 'behavioral')
        ])
      ]
    },
    {
      week: 9,
      phase: 'Simulate',
      theme: 'Readiness evidence',
      goal: 'Complete the required rolling samples and make every remaining weakness concrete.',
      sessions: [
        session('w9-mon', '2026-09-21', 'Random-medium set II', 'coding', 'Complete five-problem readiness evidence', 'Use the rolling sample honestly; no familiar problems.', 90, [task('w9-random-b', 'Three random mediums', 'Log full evidence and stop at the interview time limit.', 90, 'coding')]),
        session('w9-tue', '2026-09-22', 'System-design simulation II', 'system-design', 'Earn the first rubric-passing design', 'Choose a case different from Week 8.', 90, [
          task('w9-design-sim-b', '40-minute design', 'Record rubric immediately without consulting notes.', 50, 'system-design'),
          task('w9-design-fix-b', 'Focused repair', 'Re-answer the weakest interviewer follow-ups.', 40, 'system-design')
        ]),
        session('w9-wed', '2026-09-23', 'Foundations simulation II', 'foundations', 'Cross the 80% knowledge bar', 'Mix conceptual and task-selection questions.', 90, [
          task('w9-theory-sim-b', 'Core and task-metric quizzes', 'Complete without notes and log both scores.', 50, 'foundations'),
          task('w9-theory-fix-b', 'Retrieval repair', 'Write and answer five questions for misses.', 40, 'foundations')
        ]),
        session('w9-thu', '2026-09-24', 'Behavioral simulation II', 'behavioral', 'Cross the story and rehearsal gates', 'Use randomized prompts so stories are selected, not recited in order.', 90, [
          task('w9-story-random', 'Randomized story rehearsal', 'Eight prompts, no notes, two-minute cap.', 50, 'behavioral'),
          task('w9-intro', 'Career introduction and project deep dive', 'Two-minute summary plus ten-minute technical project narrative.', 40, 'behavioral')
        ]),
        session('w9-sat', '2026-09-26', 'Coding mock III', 'mocks', 'Confirm that mock feedback is improving', 'Do not repeat the same partner feedback loop without fixing it.', 180, [
          task('w9-coding-mock', 'Full coding mock', 'Ask for explicit advance/no-advance and communication feedback.', 60, 'mocks'),
          task('w9-coding-debrief', 'Debrief', 'Compare with Weeks 6 and 8.', 30, 'mocks'),
          task('w9-coding-repair', 'Final pattern repair', 'Two timed problems in the last weak pattern.', 70, 'coding'),
          task('w9-coding-notes', 'Condense coding sheet', 'One page of invariants and Python APIs only.', 20, 'coding')
        ]),
        session('w9-sun', '2026-09-27', 'ML/system mock II', 'mocks', 'Confirm the target-tier interview signal', 'The latest ML/system mock must be would-advance for the gate.', 180, [
          task('w9-ml-mock', 'ML/system-design mock', 'Complete theory, design, and CV follow-ups.', 75, 'mocks'),
          task('w9-ml-debrief', 'Debrief', 'Record signal, repeated weaknesses, and remediation status.', 35, 'mocks'),
          task('w9-design-repair', 'Re-present weak sections', 'Use a 20-minute compressed design and targeted follow-ups.', 45, 'system-design'),
          task('w9-retro', 'Week 9 gate review', 'List each gate with exact missing evidence.', 25, 'behavioral')
        ])
      ]
    },
    {
      week: 10,
      phase: 'Simulate',
      theme: 'Taper, certify, and preserve confidence',
      goal: 'Close only remaining evidence gaps, avoid cramming, and leave with a maintenance routine.',
      sessions: [
        session('w10-mon', '2026-09-28', 'Readiness gap closure', 'coding', 'Repair the single highest-impact red gate', 'Use the dashboard evidence to choose; do not start a new topic.', 90, [
          task('w10-gap-identify', 'Select one gap', 'Pick the gate closest to green with the highest interview impact.', 15, 'mocks'),
          task('w10-gap-work', 'Focused evidence attempt', 'Complete the exact missing coding, theory, design, story, or mock evidence.', 60, 'mocks'),
          task('w10-gap-log', 'Log and stop', 'Record the result without moving the goalposts.', 15, 'mocks')
        ]),
        session('w10-tue', '2026-09-29', 'System-design certification', 'system-design', 'Complete the second passing design', 'Select a distinct CV case and use no notes.', 90, [
          task('w10-design-cert', 'Final 40-minute design', 'Clarify, structure, communicate, and score all ten dimensions.', 50, 'system-design'),
          task('w10-design-close', 'Close rubric gaps', 'Answer only failed follow-ups once more.', 40, 'system-design')
        ]),
        session('w10-wed', '2026-09-30', 'Coding certification', 'coding', 'Verify the rolling random-medium bar', 'No warmup beyond one easy problem.', 90, [
          task('w10-code-warmup', 'One easy warmup', 'Ten minutes maximum.', 15, 'coding'),
          task('w10-code-cert', 'Two random mediums', 'Thirty minutes each with full explanation and complexity.', 60, 'coding'),
          task('w10-code-close', 'Review evidence', 'Do not count familiar or hinted problems.', 15, 'coding')
        ]),
        session('w10-thu', '2026-10-01', 'Theory and story certification', 'foundations', 'Verify concise answers without notes', 'Stop studying after the evidence is recorded.', 90, [
          task('w10-theory-cert', 'Final rapid-fire', 'Core, task-metric, debugging, and modern-CV questions.', 45, 'foundations'),
          task('w10-story-cert', 'Final story rehearsal', 'Random prompts, no notes, two-minute cap.', 35, 'behavioral'),
          task('w10-intro-cert', 'Final introduction', 'Record the two-minute Senior MLE/CV summary.', 10, 'behavioral')
        ]),
        session('w10-sat', '2026-10-03', 'Full-loop rehearsal', 'mocks', 'Simulate the combined interview day', 'Use breaks and context switching similar to a real loop.', 180, [
          task('w10-loop-code', 'Coding round', 'One medium with verbal reasoning.', 45, 'mocks'),
          task('w10-loop-theory', 'ML/CV theory round', 'Rapid questions and model-selection scenarios.', 40, 'mocks'),
          task('w10-loop-design', 'System-design round', 'One compressed end-to-end case.', 55, 'mocks'),
          task('w10-loop-behavior', 'Behavioral round', 'Introduction plus three randomized prompts.', 40, 'mocks')
        ]),
        session('w10-sun', '2026-10-04', 'Final review and maintenance plan', 'behavioral', 'Finish with evidence and a sustainable tail', 'If a gate remains red, continue targeted maintenance rather than restarting the curriculum.', 180, [
          task('w10-final-audit', 'Readiness audit', 'Review all five gates and verify every logged artifact.', 45, 'mocks'),
          task('w10-maintenance', 'Maintenance tail', 'Plan weekly: three coding reps, one design, one story rehearsal, one theory quiz.', 35, 'behavioral'),
          task('w10-resource-freeze', 'Freeze resources', 'Remove unused tabs and keep only proven references.', 20, 'behavioral'),
          task('w10-rest', 'Deliberate taper', 'Stop studying early; exercise, sleep, and preserve working memory.', 80, 'behavioral')
        ])
      ]
    }
  ];

  const references = {
    module: (...moduleIds) => ({ type: 'module', moduleIds }),
    problems: (...problemIds) => ({ type: 'problem-set', problemIds }),
    quiz: (...quizIds) => ({ type: 'quiz', quizIds }),
    design: (caseId) => ({ type: 'design-case', caseId }),
    story: (requirements) => ({ type: 'story', requirements }),
    mock: (mockType, requiredCount) => ({ type: 'mock', requirements: { mockType, requiredCount } }),
    instruction: (...resourceIds) => resourceIds.length
      ? { type: 'instruction', resourceIds }
      : { type: 'instruction' }
  };

  const stageSpec = (type, reference) => ({ type, reference });
  const stageSpecs = {
    'w1-baseline-code': stageSpec('practice', references.problems('two-sum')),
    'w1-baseline-theory': stageSpec('verify', references.quiz('foundation-core-1')),
    'w1-baseline-design': stageSpec('practice', references.instruction('cs329s')),
    'w1-baseline-intro': stageSpec('reflect', references.story({ rehearsalCount: 1, withoutNotes: false })),
    'w1-python': stageSpec('learn', references.module('python-collections')),
    'w1-bigo': stageSpec('learn', references.module('big-o')),
    'w1-problems-a': stageSpec('practice', references.problems('contains-duplicate', 'valid-anagram', 'two-sum')),
    'w1-linear-notes': stageSpec('learn', references.module('linear-algebra')),
    'w1-linear-recall': stageSpec('recall', references.module('linear-algebra')),
    'w1-linear-quiz': stageSpec('verify', references.quiz('foundation-core-1')),
    'w1-problems-b': stageSpec('practice', references.problems('group-anagrams', 'top-k-frequent-elements', 'product-of-array-except-self')),
    'w1-problems-c': stageSpec('practice', references.problems('valid-palindrome', 'two-sum-ii-input-array-is-sorted')),
    'w1-pattern-log': stageSpec('reflect', references.module('hashing', 'two-pointers')),
    'w1-losses': stageSpec('learn', references.module('losses')),
    'w1-metrics': stageSpec('learn', references.module('metrics')),
    'w1-task-metric-quiz': stageSpec('verify', references.quiz('task-loss-metric')),
    'w1-design-frame': stageSpec('learn', references.instruction('chip-ml-interviews', 'cs329s')),
    'w1-design-rework': stageSpec('practice', references.instruction('cs329s')),
    'w1-retro': stageSpec('reflect', references.instruction()),

    'w2-window-a': stageSpec('practice', references.problems('best-time-to-buy-and-sell-stock', 'longest-substring-without-repeating-characters')),
    'w2-window-b': stageSpec('practice', references.problems('longest-repeating-character-replacement')),
    'w2-window-recall': stageSpec('recall', references.module('sliding-window')),
    'w2-probability': stageSpec('learn', references.module('probability')),
    'w2-distributions': stageSpec('learn', references.module('probability')),
    'w2-prob-recall': stageSpec('recall', references.module('probability')),
    'w2-stack-a': stageSpec('practice', references.problems('valid-parentheses', 'min-stack', 'evaluate-reverse-polish-notation')),
    'w2-stack-b': stageSpec('practice', references.problems('daily-temperatures')),
    'w2-stack-recall': stageSpec('recall', references.module('stack-monotonic')),
    'w2-binary': stageSpec('practice', references.problems('binary-search', 'search-a-2d-matrix', 'koko-eating-bananas')),
    'w2-linked': stageSpec('practice', references.problems('reverse-linked-list', 'merge-two-sorted-lists')),
    'w2-pointer-check': stageSpec('recall', references.module('binary-search', 'linked-lists')),
    'w2-statistics': stageSpec('learn', references.module('statistics-validation')),
    'w2-validation': stageSpec('learn', references.module('statistics-validation')),
    'w2-stats-quiz': stageSpec('verify', references.quiz('foundation-core-1')),
    'w2-debugging': stageSpec('learn', references.module('data-debugging')),
    'w2-story-inventory': stageSpec('reflect', references.story({ savedStoryCount: 10 })),
    'w2-retro': stageSpec('reflect', references.instruction()),

    'w3-trees-a': stageSpec('practice', references.problems('invert-binary-tree', 'maximum-depth-of-binary-tree', 'same-tree')),
    'w3-trees-b': stageSpec('practice', references.problems('diameter-of-binary-tree', 'balanced-binary-tree')),
    'w3-tree-invariant': stageSpec('recall', references.module('trees')),
    'w3-calculus': stageSpec('learn', references.module('calculus-backprop')),
    'w3-backprop': stageSpec('learn', references.module('calculus-backprop')),
    'w3-gradient-recall': stageSpec('recall', references.module('calculus-backprop')),
    'w3-trees-c': stageSpec('practice', references.problems('binary-tree-level-order-traversal', 'validate-binary-search-tree', 'kth-smallest-element-in-a-bst', 'lowest-common-ancestor-of-a-binary-search-tree')),
    'w3-heaps-a': stageSpec('practice', references.problems('last-stone-weight', 'k-closest-points-to-origin')),
    'w3-heap-recall': stageSpec('recall', references.module('heaps')),
    'w3-graphs-a': stageSpec('practice', references.problems('number-of-islands', 'max-area-of-island')),
    'w3-graphs-b': stageSpec('practice', references.problems('clone-graph', 'rotting-oranges')),
    'w3-graph-recall': stageSpec('recall', references.module('graphs-union-find')),
    'w3-optimizers': stageSpec('learn', references.module('optimization')),
    'w3-regularization': stageSpec('learn', references.module('generalization')),
    'w3-optimization-quiz': stageSpec('verify', references.quiz('rapid-fire-readiness')),
    'w3-graphs-c': stageSpec('practice', references.problems('course-schedule', 'pacific-atlantic-water-flow')),
    'w3-graphs-d': stageSpec('practice', references.problems('redundant-connection')),
    'w3-checkpoint': stageSpec('verify', references.instruction('leetcode', 'cs329s')),
    'w3-retro': stageSpec('reflect', references.instruction()),

    'w4-timed-a': stageSpec('verify', references.instruction('leetcode')),
    'w4-vit': stageSpec('learn', references.module('cnn-vs-transformer', 'vit')),
    'w4-detr': stageSpec('learn', references.module('detr')),
    'w4-intervals': stageSpec('practice', references.problems('merge-intervals', 'insert-interval', 'non-overlapping-intervals')),
    'w4-backtrack-a': stageSpec('practice', references.problems('subsets', 'permutations')),
    'w4-state-recall': stageSpec('recall', references.module('intervals', 'backtracking')),
    'w4-search-requirements': stageSpec('learn', references.design('image-search')),
    'w4-search-architecture': stageSpec('practice', references.design('image-search')),
    'w4-search-review': stageSpec('reflect', references.design('image-search')),
    'w4-similarity-design': stageSpec('practice', references.design('visual-similarity')),
    'w4-similarity-debrief': stageSpec('reflect', references.design('visual-similarity')),
    'w4-clip-preview': stageSpec('learn', references.module('clip')),
    'w4-story-a': stageSpec('practice', references.story({ savedStoryCount: 2 })),
    'w4-theory-bank': stageSpec('verify', references.quiz('rapid-fire-readiness')),
    'w4-task-metric-repeat': stageSpec('verify', references.quiz('task-loss-metric')),
    'w4-coding-repeat': stageSpec('practice', references.instruction('leetcode')),
    'w4-retro': stageSpec('reflect', references.instruction()),

    'w5-timed-a': stageSpec('verify', references.instruction('leetcode')),
    'w5-clip': stageSpec('learn', references.module('clip')),
    'w5-dinov2': stageSpec('learn', references.module('dinov2')),
    'w5-backtrack-b': stageSpec('practice', references.problems('combination-sum', 'word-search')),
    'w5-dp-a': stageSpec('practice', references.problems('climbing-stairs', 'house-robber')),
    'w5-dp-recall': stageSpec('recall', references.module('dynamic-programming')),
    'w5-detection-design': stageSpec('practice', references.design('detection-service')),
    'w5-detection-metrics': stageSpec('learn', references.design('detection-service')),
    'w5-edge-tradeoffs': stageSpec('reflect', references.design('detection-service')),
    'w5-video-design': stageSpec('practice', references.design('video-moderation')),
    'w5-video-debrief': stageSpec('reflect', references.design('video-moderation')),
    'w5-video-cv': stageSpec('learn', references.design('video-moderation')),
    'w5-story-b': stageSpec('practice', references.story({ savedStoryCount: 4 })),
    'w5-data-quality': stageSpec('learn', references.module('data-debugging')),
    'w5-error-analysis': stageSpec('practice', references.module('data-debugging')),
    'w5-active-learning': stageSpec('learn', references.design('active-learning')),
    'w5-retro': stageSpec('reflect', references.instruction()),

    'w6-timed-a': stageSpec('verify', references.instruction('leetcode')),
    'w6-sam2': stageSpec('learn', references.module('sam2')),
    'w6-grounding-dino': stageSpec('learn', references.module('grounding-dino')),
    'w6-weak-pattern': stageSpec('learn', references.instruction('neetcode-roadmap')),
    'w6-weak-problems': stageSpec('practice', references.instruction('leetcode')),
    'w6-seg-design': stageSpec('practice', references.design('segmentation')),
    'w6-seg-metrics': stageSpec('learn', references.design('segmentation')),
    'w6-seg-modern': stageSpec('reflect', references.module('sam2')),
    'w6-mock-setup': stageSpec('learn', references.instruction('exponent-practice', 'interviewing-io')),
    'w6-coding-mock': stageSpec('verify', references.mock('coding', 1)),
    'w6-mock-debrief': stageSpec('reflect', references.mock('coding', 1)),
    'w6-remediation': stageSpec('practice', references.instruction('neetcode-roadmap', 'leetcode')),
    'w6-story-c': stageSpec('practice', references.story({ savedStoryCount: 8 })),
    'w6-story-rehearse': stageSpec('verify', references.story({ rehearsalCount: 2, withoutNotes: false })),
    'w6-design-aloud': stageSpec('verify', references.design('segmentation')),
    'w6-retro': stageSpec('reflect', references.instruction()),

    'w7-timed-a': stageSpec('verify', references.instruction('leetcode')),
    'w7-vlm': stageSpec('learn', references.module('vlm')),
    'w7-diffusion': stageSpec('learn', references.module('diffusion')),
    'w7-ocr-design': stageSpec('practice', references.design('ocr-documents')),
    'w7-ocr-eval': stageSpec('learn', references.design('ocr-documents')),
    'w7-ocr-failures': stageSpec('reflect', references.design('ocr-documents')),
    'w7-quantization': stageSpec('learn', references.module('compression')),
    'w7-distillation': stageSpec('learn', references.module('compression')),
    'w7-serving': stageSpec('learn', references.module('compression', 'deployment-monitoring')),
    'w7-active-design': stageSpec('practice', references.design('active-learning')),
    'w7-active-debrief': stageSpec('reflect', references.design('active-learning')),
    'w7-multimodal-design': stageSpec('practice', references.design('multimodal-rag')),
    'w7-story-finish': stageSpec('reflect', references.story({ completedStoryCount: 8 })),
    'w7-rapid-fire': stageSpec('verify', references.quiz('rapid-fire-readiness')),
    'w7-design-random': stageSpec('verify', references.instruction('cs329s')),
    'w7-coding-random': stageSpec('verify', references.instruction('leetcode')),
    'w7-retro': stageSpec('reflect', references.instruction()),

    'w8-random-a': stageSpec('verify', references.instruction('leetcode')),
    'w8-design-sim-a': stageSpec('verify', references.instruction('cs329s')),
    'w8-design-fix-a': stageSpec('reflect', references.instruction()),
    'w8-theory-sim-a': stageSpec('verify', references.quiz('rapid-fire-readiness')),
    'w8-theory-fix-a': stageSpec('recall', references.instruction()),
    'w8-story-rehearsal-a': stageSpec('verify', references.story({ rehearsalCount: 1, withoutNotes: true })),
    'w8-story-edit-a': stageSpec('reflect', references.story({ completedStoryCount: 8 })),
    'w8-coding-mock': stageSpec('verify', references.mock('coding', 2)),
    'w8-coding-debrief': stageSpec('reflect', references.mock('coding', 2)),
    'w8-coding-repair': stageSpec('practice', references.instruction('leetcode')),
    'w8-coding-recall': stageSpec('recall', references.instruction()),
    'w8-ml-mock': stageSpec('verify', references.mock('ml-system', 1)),
    'w8-ml-debrief': stageSpec('reflect', references.mock('ml-system', 1)),
    'w8-ml-repair': stageSpec('practice', references.instruction()),
    'w8-retro': stageSpec('reflect', references.instruction()),

    'w9-random-b': stageSpec('verify', references.instruction('leetcode')),
    'w9-design-sim-b': stageSpec('verify', references.instruction('cs329s')),
    'w9-design-fix-b': stageSpec('recall', references.instruction()),
    'w9-theory-sim-b': stageSpec('verify', references.quiz('foundation-core-1', 'task-loss-metric')),
    'w9-theory-fix-b': stageSpec('recall', references.instruction()),
    'w9-story-random': stageSpec('verify', references.story({ rehearsalCount: 2, withoutNotes: true })),
    'w9-intro': stageSpec('verify', references.story({ rehearsalCount: 5, withoutNotes: false })),
    'w9-coding-mock': stageSpec('verify', references.mock('coding', 3)),
    'w9-coding-debrief': stageSpec('reflect', references.mock('coding', 3)),
    'w9-coding-repair': stageSpec('practice', references.instruction('leetcode')),
    'w9-coding-notes': stageSpec('reflect', references.instruction()),
    'w9-ml-mock': stageSpec('verify', references.mock('ml-system', 2)),
    'w9-ml-debrief': stageSpec('reflect', references.mock('ml-system', 2)),
    'w9-design-repair': stageSpec('practice', references.instruction()),
    'w9-retro': stageSpec('reflect', references.instruction()),

    'w10-gap-identify': stageSpec('reflect', references.instruction()),
    'w10-gap-work': stageSpec('verify', references.instruction()),
    'w10-gap-log': stageSpec('reflect', references.instruction()),
    'w10-design-cert': stageSpec('verify', references.instruction('cs329s')),
    'w10-design-close': stageSpec('reflect', references.instruction()),
    'w10-code-warmup': stageSpec('practice', references.instruction('leetcode')),
    'w10-code-cert': stageSpec('verify', references.instruction('leetcode')),
    'w10-code-close': stageSpec('reflect', references.instruction()),
    'w10-theory-cert': stageSpec('verify', references.quiz('rapid-fire-readiness')),
    'w10-story-cert': stageSpec('verify', references.story({ rehearsalCount: 3, withoutNotes: true })),
    'w10-intro-cert': stageSpec('verify', references.story({ rehearsalCount: 7, withoutNotes: false })),
    'w10-loop-code': stageSpec('verify', references.instruction('leetcode')),
    'w10-loop-theory': stageSpec('verify', references.quiz('modern-cv-judgment')),
    'w10-loop-design': stageSpec('verify', references.instruction('cs329s')),
    'w10-loop-behavior': stageSpec('verify', references.story({ rehearsalCount: 8, withoutNotes: false })),
    'w10-final-audit': stageSpec('reflect', references.instruction()),
    'w10-maintenance': stageSpec('reflect', references.instruction()),
    'w10-resource-freeze': stageSpec('reflect', references.instruction()),
    'w10-rest': stageSpec('reflect', references.instruction())
  };

  const scheduledSessions = weeks.flatMap((week) => week.sessions);
  const scheduledTaskIds = new Set(scheduledSessions.flatMap((item) => item.tasks.map((itemTask) => itemTask.id)));

  for (const taskId of Object.keys(stageSpecs)) {
    if (!scheduledTaskIds.has(taskId)) throw new Error(`Unknown session-guide task: ${taskId}`);
  }

  const sessionGuides = Object.fromEntries(scheduledSessions.map((item) => [
    item.id,
    {
      sessionId: item.id,
      stages: item.tasks.map((itemTask) => {
        const spec = stageSpecs[itemTask.id];
        if (!spec) throw new Error(`Missing session-guide stage for task: ${itemTask.id}`);

        const requiresSavedEvidence = spec.type === 'reflect' || spec.reference.type === 'instruction';
        const evidenceInstruction = requiresSavedEvidence
          ? ' Save the resulting notes, attempt, or reflection before marking this stage complete.'
          : '';

        return {
          id: `stage-${itemTask.id}`,
          title: itemTask.title,
          type: spec.type,
          taskIds: [itemTask.id],
          minutes: itemTask.minutes,
          instructions: `${itemTask.detail}${evidenceInstruction}`,
          reference: spec.reference
        };
      })
    }
  ]));

  const codingPatternConcepts = {
    'Arrays & hashing': ['hashing'],
    'Two pointers': ['two-pointers'],
    'Sliding window': ['sliding-window'],
    'Stack': ['stack-monotonic'],
    'Binary search': ['binary-search'],
    'Linked lists': ['linked-lists'],
    'Trees': ['trees'],
    'Heap & intervals': ['heaps', 'intervals'],
    'Graphs': ['graphs-union-find'],
    'Backtracking': ['backtracking'],
    'Dynamic programming': ['dynamic-programming']
  };

  window.InterviewPrepData = {
    ...(window.InterviewPrepData || {}),
    planStart: '2026-07-27',
    planEnd: '2026-10-04',
    problems,
    codingPatternConcepts,
    weeks,
    sessionGuides
  };
})();
