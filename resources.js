(function registerResources() {
  'use strict';

  const resources = [
    {
      id: 'andrei-dsa',
      title: 'Master the Coding Interview: Data Structures + Algorithms',
      provider: 'Andrei Neagoie · Udemy',
      url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/',
      access: 'Udemy Business',
      tags: ['coding'],
      use: 'Targeted concept repair during Weeks 1–2. Do not watch the full 20-hour course sequentially.',
      assignment: 'Big O, arrays/hash tables, linked lists, stacks/queues, trees, graphs, recursion, sorting/searching.'
    },
    {
      id: 'neetcode-roadmap',
      title: 'NeetCode Roadmap',
      provider: 'NeetCode',
      url: 'https://neetcode.io/roadmap',
      access: 'Free',
      tags: ['coding'],
      use: 'Pattern-organized explanations after your own timed attempt.',
      assignment: 'Use only for the patterns and 60 problems prescribed in this dashboard.'
    },
    {
      id: 'leetcode',
      title: 'LeetCode problem workspace',
      provider: 'LeetCode',
      url: 'https://leetcode.com/problemset/',
      access: 'Free',
      tags: ['coding'],
      use: 'Run and submit the curated problems. The free tier is sufficient for this plan.',
      assignment: 'Buy Premium for one month only after a specific company loop is scheduled and tagged problems are useful.'
    },
    {
      id: 'chip-ml-interviews',
      title: 'Introduction to Machine Learning Interviews',
      provider: 'Chip Huyen',
      url: 'https://huyenchip.com/ml-interviews-book/',
      access: 'Free',
      tags: ['foundations', 'system-design', 'behavioral'],
      use: 'Interview framing and a large question bank for retrieval practice.',
      assignment: 'Read the role/interview overview once; use the 200+ questions by topic during Weeks 4–10.'
    },
    {
      id: 'statquest',
      title: 'StatQuest video index',
      provider: 'Josh Starmer',
      url: 'https://statquest.org/video_index.html',
      access: 'Free',
      tags: ['foundations'],
      use: 'Patch one concept that does not click from notes or books.',
      assignment: 'Search by the exact weak topic; watch one video, then close it and explain the concept from memory.'
    },
    {
      id: 'cs231n-notes',
      title: 'CS231n: Deep Learning for Computer Vision',
      provider: 'Stanford',
      url: 'https://cs231n.github.io/',
      access: 'Free',
      tags: ['foundations', 'modern-cv'],
      use: 'High-signal refresher for optimization, backprop, CNNs, transfer, and practical training.',
      assignment: 'Use the neural-network, optimization, and CNN notes when a required module remains weak.'
    },
    {
      id: 'deep-learning-book',
      title: 'Deep Learning',
      provider: 'Goodfellow, Bengio, Courville',
      url: 'https://www.deeplearningbook.org/',
      access: 'Free',
      tags: ['foundations'],
      use: 'Academic reference for linear algebra, probability, numerical computation, and optimization.',
      assignment: 'Optional after readiness. Use individual chapters, not a cover-to-cover sprint.'
    },
    {
      id: 'rules-of-ml',
      title: 'Rules of Machine Learning',
      provider: 'Google for Developers',
      url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
      access: 'Free',
      tags: ['system-design', 'foundations'],
      use: 'Production judgment: simple baselines, metrics first, pipeline correctness, and train/serve skew.',
      assignment: 'Read Rules 1–16 before the first design cases and Rules 28–43 before simulation.'
    },
    {
      id: 'fsdl',
      title: 'Full Stack Deep Learning 2022',
      provider: 'The Full Stack',
      url: 'https://fullstackdeeplearning.com/course/2022/',
      access: 'Free',
      tags: ['system-design', 'foundations', 'modern-cv'],
      use: 'Free lectures on data, deployment, continual learning, monitoring, and foundation models.',
      assignment: 'Use Lectures 3–7 selectively with the corresponding dashboard cases.'
    },
    {
      id: 'cs329s',
      title: 'CS 329S: Machine Learning Systems Design',
      provider: 'Stanford · Chip Huyen',
      url: 'https://stanford-cs329s.github.io/',
      access: 'Free',
      tags: ['system-design'],
      use: 'Notes and framework for deployable, reliable, scalable ML systems.',
      assignment: 'Use the public syllabus/notes for data, deployment, monitoring, and human-in-the-loop follow-ups.'
    },
    {
      id: 'bytebytego-mlsd',
      title: 'Machine Learning System Design Interview',
      provider: 'ByteByteGo · Ali Aminian and Alex Xu',
      url: 'https://bytebytego.com/courses/machine-learning-system-design-interview',
      access: 'Optional paid',
      tags: ['system-design'],
      use: 'Interview-shaped cases, including visual search, street-view blurring, video search, and harmful-content detection.',
      assignment: 'Use if company/O’Reilly access is available or you want one paid case-study spine.'
    },
    {
      id: 'designing-ml-systems',
      title: 'Designing Machine Learning Systems',
      provider: 'Chip Huyen · O’Reilly',
      url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
      access: 'Optional paid',
      tags: ['system-design', 'foundations'],
      use: 'Deeper production context for data, objectives, deployment, monitoring, and continual learning.',
      assignment: 'Check company O’Reilly access first. Read only chapters mapped to a current system-design weakness.'
    },
    {
      id: 'vit-paper',
      title: 'An Image is Worth 16×16 Words (ViT)',
      provider: 'Google Research · arXiv',
      url: 'https://arxiv.org/abs/2010.11929',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for patch-token vision transformers and large-scale pretraining.',
      assignment: 'Read abstract, Figure 1, architecture section, and transfer conclusions.'
    },
    {
      id: 'detr-paper',
      title: 'End-to-End Object Detection with Transformers (DETR)',
      provider: 'Meta AI · arXiv',
      url: 'https://arxiv.org/abs/2005.12872',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for object queries, set prediction, and bipartite matching.',
      assignment: 'Read abstract, architecture figure, matching/loss section, and limitations.'
    },
    {
      id: 'clip-paper',
      title: 'Learning Transferable Visual Models From Natural Language Supervision (CLIP)',
      provider: 'OpenAI · arXiv',
      url: 'https://arxiv.org/abs/2103.00020',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for image-text contrastive pretraining and zero-shot transfer.',
      assignment: 'Read abstract, method figure, prompt/zero-shot setup, and limitations.'
    },
    {
      id: 'dinov2-paper',
      title: 'DINOv2: Learning Robust Visual Features without Supervision',
      provider: 'Meta AI · arXiv',
      url: 'https://arxiv.org/abs/2304.07193',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for broad self-supervised visual representations.',
      assignment: 'Read abstract, training overview, downstream evaluation table, and limitations.'
    },
    {
      id: 'sam2-paper',
      title: 'SAM 2: Segment Anything in Images and Videos',
      provider: 'Meta AI · arXiv',
      url: 'https://arxiv.org/abs/2408.00714',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for promptable image/video segmentation and streaming memory.',
      assignment: 'Read abstract, model overview, data engine, and image/video evaluation.'
    },
    {
      id: 'grounding-dino-paper',
      title: 'Grounding DINO: Marrying DINO with Grounded Pre-Training',
      provider: 'IDEA Research · arXiv',
      url: 'https://arxiv.org/abs/2303.05499',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for text-conditioned open-set object detection.',
      assignment: 'Read abstract, architecture, phrase grounding setup, and zero-shot evaluation.'
    },
    {
      id: 'llava-paper',
      title: 'Visual Instruction Tuning (LLaVA)',
      provider: 'Liu et al. · arXiv',
      url: 'https://arxiv.org/abs/2304.08485',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Canonical example of connecting a visual encoder to a language model through instruction tuning.',
      assignment: 'Read abstract and architecture/training overview; focus on the interface between perception and language.'
    },
    {
      id: 'ddpm-paper',
      title: 'Denoising Diffusion Probabilistic Models',
      provider: 'Ho, Jain, Abbeel · arXiv',
      url: 'https://arxiv.org/abs/2006.11239',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for the denoising diffusion objective.',
      assignment: 'Read abstract, forward/reverse-process overview, and simplified objective; skip proofs during the sprint.'
    },
    {
      id: 'pytorch-quantization',
      title: 'Quantization in PyTorch',
      provider: 'PyTorch documentation',
      url: 'https://pytorch.org/docs/stable/quantization.html',
      access: 'Free',
      tags: ['modern-cv', 'system-design'],
      use: 'Ground production discussion of PTQ, QAT, backends, and operator support.',
      assignment: 'Read the conceptual overview and current recommended APIs; do not implement a side project during the sprint.'
    },
    {
      id: 'exponent-practice',
      title: 'Exponent Practice (formerly Pramp)',
      provider: 'Exponent',
      url: 'https://www.tryexponent.com/practice',
      access: 'Free',
      tags: ['mocks', 'coding', 'behavioral'],
      use: 'Peer-to-peer live mock interviews. Pramp sessions moved to Exponent Practice in July 2024.',
      assignment: 'Schedule the first coding mock in Week 6 and use a fresh partner when possible.'
    },
    {
      id: 'interviewing-io',
      title: 'Machine learning and coding mock interviews',
      provider: 'interviewing.io',
      url: 'https://interviewing.io/mocks?focus=machine-learning',
      access: 'Optional paid',
      tags: ['mocks', 'coding', 'system-design', 'behavioral'],
      use: 'Anonymous expert mocks with Senior/Staff interviewers and explicit feedback.',
      assignment: 'Buy only when peer mocks no longer provide enough calibration or before target-tier loops.'
    }
  ];

  window.InterviewPrepData = {
    ...(window.InterviewPrepData || {}),
    resources
  };
})();
