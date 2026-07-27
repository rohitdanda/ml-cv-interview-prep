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
      title: 'torchao quantization and PyTorch quantization flows',
      provider: 'PyTorch torchao documentation',
      url: 'https://docs.pytorch.org/ao/stable/index.html',
      access: 'Free',
      tags: ['modern-cv', 'system-design'],
      use: 'Ground production discussion of torchao quantization, current PT2E and eager flows, calibration/QAT, backends, and operator support.',
      assignment: 'Read the torchao overview and choose the current PT2E or eager tutorial that matches the target stack; do not treat the legacy quantization landing page as the current API guide.'
    },
    {
      id: 'siglip2',
      title: 'SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features',
      provider: 'Google DeepMind · arXiv',
      url: 'https://arxiv.org/abs/2502.14786',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for scaled sigmoid image–text learning plus multilingual, dense-feature, and native-aspect-ratio improvements.',
      assignment: 'Read the abstract, training recipe, native-resolution variants, dense-task results, and limitations.'
    },
    {
      id: 'dinov3',
      title: 'DINOv3',
      provider: 'Meta AI',
      url: 'https://ai.meta.com/research/dinov3/',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Official source for scaled self-supervised vision backbones, high-quality dense features, and Gram anchoring.',
      assignment: 'Read the overview, scaling comparison, dense-feature discussion, and linked research paper.'
    },
    {
      id: 'sam3',
      title: 'SAM 3',
      provider: 'Meta AI',
      url: 'https://ai.meta.com/research/sam3/',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Official source for open-vocabulary concept detection, segmentation, and tracking from text or visual prompts.',
      assignment: 'Read the capabilities, benchmark, architecture, and model-evolution sections; note the expanded prompt contract.'
    },
    {
      id: 'rt-detr',
      title: 'DETRs Beat YOLOs on Real-time Object Detection (RT-DETR)',
      provider: 'Zhao et al. · arXiv',
      url: 'https://arxiv.org/abs/2304.08069',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for a real-time, end-to-end DETR that removes NMS and supports decoder-layer speed tuning.',
      assignment: 'Read the abstract, hybrid encoder, query selection, speed-tuning mechanism, and target-hardware results.'
    },
    {
      id: 'd-fine',
      title: 'D-FINE: Redefine Regression Task in DETRs as Fine-grained Distribution Refinement',
      provider: 'Peng et al. · arXiv',
      url: 'https://arxiv.org/abs/2410.13842',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for fine-grained distribution refinement and localization self-distillation in real-time DETRs.',
      assignment: 'Read the abstract, FDR and GO-LSD sections, latency table, and ablations.'
    },
    {
      id: 'yolo-world',
      title: 'YOLO-World: Real-Time Open-Vocabulary Object Detection',
      provider: 'Cheng et al. · arXiv',
      url: 'https://arxiv.org/abs/2401.17270',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for efficient open-vocabulary detection through vision-language pretraining and a re-parameterizable fusion path.',
      assignment: 'Read the abstract, RepVL-PAN architecture, region-text objective, zero-shot results, and deployment tradeoffs.'
    },
    {
      id: 'grounding-dino-15',
      title: 'Grounding DINO 1.5: Advance the "Edge" of Open-Set Object Detection',
      provider: 'IDEA Research · arXiv',
      url: 'https://arxiv.org/abs/2405.10300',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for Grounding DINO 1.5 Pro and Edge variants and their open-set accuracy–latency tradeoffs.',
      assignment: 'Read the abstract, Pro-versus-Edge design choices, zero-shot evaluation, and TensorRT measurements.'
    },
    {
      id: 'vmamba',
      title: 'VMamba: Visual State Space Model',
      provider: 'Liu et al. · arXiv',
      url: 'https://arxiv.org/abs/2401.10166',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for 2D selective-scan visual state-space backbones and their linear-time input scaling.',
      assignment: 'Read the abstract, SS2D scan design, scaling analysis, downstream results, and implementation caveats.'
    },
    {
      id: 'vjepa2',
      title: 'Introducing V-JEPA 2',
      provider: 'Meta AI',
      url: 'https://ai.meta.com/research/vjepa/',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Official source for self-supervised video representations, prediction, and latent-action world-model planning.',
      assignment: 'Read the understanding, prediction, planning, architecture, and benchmark sections plus the linked paper.'
    },
    {
      id: 'qwen25-vl',
      title: 'Qwen2.5-VL Technical Report',
      provider: 'Qwen Team · arXiv',
      url: 'https://arxiv.org/abs/2502.13923',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for native dynamic resolution, absolute time encoding, and long-video and document understanding.',
      assignment: 'Read the abstract, native-resolution ViT, temporal encoding, document/video evaluations, and limitations.'
    },
    {
      id: 'sd3',
      title: 'Scaling Rectified Flow Transformers for High-Resolution Image Synthesis (Stable Diffusion 3)',
      provider: 'Stability AI · arXiv',
      url: 'https://arxiv.org/abs/2403.03206',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for Stable Diffusion 3’s multimodal diffusion transformer and rectified-flow training recipe.',
      assignment: 'Read the abstract, rectified-flow formulation, multimodal transformer architecture, scaling results, and limitations.'
    },
    {
      id: 'bytetrack',
      title: 'ByteTrack: Multi-Object Tracking by Associating Every Detection Box',
      provider: 'Zhang et al. · arXiv',
      url: 'https://arxiv.org/abs/2110.06864',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for recovering occluded tracks by associating low-score as well as high-score detections.',
      assignment: 'Read the abstract, two-stage association logic, ablations, benchmark table, and failure modes.'
    },
    {
      id: 'hota',
      title: 'HOTA: A Higher Order Metric for Evaluating Multi-Object Tracking',
      provider: 'Luiten et al. · arXiv',
      url: 'https://arxiv.org/abs/2009.07736',
      access: 'Free',
      tags: ['modern-cv'],
      use: 'Primary source for jointly evaluating detection, association, and localization quality in multi-object tracking.',
      assignment: 'Read the metric definition, decomposition, comparison with MOTA and IDF1, and interpretation guidance.'
    },
    {
      id: 'pytorch-distributed-training',
      title: 'PyTorch Distributed: DDP and FSDP tutorials',
      provider: 'PyTorch documentation',
      url: 'https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Primary implementation guidance for process-per-device DistributedDataParallel and fully sharded parameters, gradients, and optimizer state.',
      assignment: 'Read the DDP tutorial, then the linked FSDP tutorial; write down communication boundaries, memory ownership, checkpoint format, and failure-recovery assumptions.'
    },
    {
      id: 'deepspeed-zero',
      title: 'ZeRO: memory-efficient distributed training',
      provider: 'DeepSpeed documentation',
      url: 'https://www.deepspeed.ai/tutorials/zero/',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Ground the differences among ZeRO stages that shard optimizer state, gradients, and parameters, including offload tradeoffs.',
      assignment: 'Map ZeRO stages 1–3 to memory saved, collective communication added, checkpoint requirements, and the bottleneck that offload moves to CPU or storage.'
    },
    {
      id: 'mlflow-tracking-registry',
      title: 'MLflow Tracking and Model Registry',
      provider: 'MLflow documentation',
      url: 'https://mlflow.org/docs/latest/ml/model-registry/',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Concrete reference for experiment lineage, immutable artifacts, model versions, aliases, promotion metadata, and auditable rollback.',
      assignment: 'Trace one run from parameters, code and dataset identity through metrics and artifacts to a registered version, staged alias change, deployment, and rollback.'
    },
    {
      id: 'google-mlops-cicd',
      title: 'MLOps: continuous delivery and automation pipelines in machine learning',
      provider: 'Google Cloud Architecture Center',
      url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Reference architecture for CI, continuous delivery, continuous training, validation gates, metadata, orchestration, and deployment promotion.',
      assignment: 'Identify the unit, data, schema, training, model-quality, integration, and serving checks that must pass before an artifact can be promoted.'
    },
    {
      id: 'triton-inference-server',
      title: 'NVIDIA Triton Inference Server user guide',
      provider: 'NVIDIA documentation',
      url: 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Serving reference for model repositories, dynamic batching, concurrent execution, ensembles, metrics, and accelerator-aware configuration.',
      assignment: 'Compare one unbatched and dynamically batched deployment under the same p50/p99 latency SLO, throughput, queue delay, GPU memory, and failure policy.'
    },
    {
      id: 'torchserve',
      title: 'TorchServe documentation',
      provider: 'PyTorch Serve documentation',
      url: 'https://docs.pytorch.org/serve/',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Study a PyTorch-native model archive, handler, worker, batching, metrics, and deployment contract while noting the project maintenance status before choosing it for a new system.',
      assignment: 'Trace preprocessing, inference, postprocessing, worker scaling, metrics, and rollback; compare operational fit with Triton rather than selecting by framework familiarity.'
    },
    {
      id: 'vllm-serving',
      title: 'vLLM serving documentation',
      provider: 'vLLM project',
      url: 'https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Reference for high-throughput language-model serving, continuous request scheduling, KV-cache pressure, tensor parallelism, and an OpenAI-compatible API.',
      assignment: 'Profile time to first token, inter-token latency, request throughput, KV-cache utilization, preemption, batching, and quality under the production prompt-length distribution.'
    },
    {
      id: 'evidently-monitoring',
      title: 'Evidently ML monitoring guides',
      provider: 'Evidently AI documentation',
      url: 'https://docs.evidentlyai.com/',
      access: 'Free',
      tags: ['foundations', 'system-design'],
      use: 'Practical reference for data-quality checks, drift reports, delayed-label performance, dashboards, and alerting without equating statistical drift with model harm.',
      assignment: 'Design one dashboard with service SLOs, schema and feature checks, prediction slices, delayed-label quality, stable references, alert ownership, and a falsifiable retraining trigger.'
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
      title: 'Free machine-learning mock interview replays',
      provider: 'interviewing.io',
      url: 'https://interviewing.io/mocks?focus=machine-learning',
      access: 'Free',
      tags: ['mocks', 'coding', 'system-design', 'behavioral'],
      use: 'Replay library of recorded machine-learning interviews for observing question flow, candidate reasoning, and interviewer feedback; this linked page is not a paid live-mock booking page.',
      assignment: 'Watch one relevant replay, pause to answer each question first, then compare the candidate’s structure and feedback with your own response.'
    }
  ];

  window.InterviewPrepData = {
    ...(window.InterviewPrepData || {}),
    resources
  };
})();
