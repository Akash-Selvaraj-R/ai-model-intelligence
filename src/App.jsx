import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search, Sun, Moon, ChevronRight, X, Check, ArrowRight, Gauge,
  Eye, Type, Bot, Network, Cpu, Scissors, FileText, Sparkles,
  ChevronDown, Info, Play, Pause, RotateCcw, SkipForward, ChevronLeft,
  HelpCircle, Zap,
} from "lucide-react";

/* ============================== DATA ============================== */

const MODELS = [
  {
    id: "LLM", name: "Large Language Model", tag: "Language",
    icon: Type,
    oneLiner: "Understands and generates human-like text.",
    modality: "Text → Text",
    bestUse: "Conversational AI, reasoning, code generation",
    complexity: 4, speed: 3,
    input: "Text", output: "Text",
    arch: "Autoregressive Transformer",
    what: "Understands and generates human-like text. The foundation of conversational AI — powers systems such as ChatGPT, Claude, Gemini, and Llama.",
    bestFor: ["Conversational AI", "Text generation", "Reasoning", "Code generation"],
    strengths: ["General-purpose", "Strong language generation", "Broad ecosystem"],
    limitations: ["High compute requirements", "Not inherently vision/action capable"],
    filters: ["language"], edge: false, multimodal: false, action: false, compute: 4,
  },
  {
    id: "LCM", name: "Latent Consistency Model", tag: "Image Generation",
    icon: Sparkles,
    oneLiner: "Generates high-quality images in just a few denoising steps.",
    modality: "Text → Image",
    bestUse: "Real-time image generation, fast creative workflows",
    complexity: 3, speed: 5,
    input: "Text / Latent noise", output: "Image",
    arch: "Consistency Distillation Diffusion",
    what: "Built for ultra-fast image generation. Instead of requiring dozens of denoising steps like traditional diffusion models, LCMs generate high-quality images in just a few steps.",
    bestFor: ["Real-time image generation", "Faster AI art workflows", "Low-latency creative applications"],
    strengths: ["Very low latency", "Few sampling steps", "Great for interactive tools"],
    limitations: ["Can trade off fine detail for speed", "Narrower than full diffusion pipelines"],
    filters: ["image-gen"], edge: false, multimodal: false, action: false, compute: 3,
  },
  {
    id: "LAM", name: "Large Action Model", tag: "Agents",
    icon: Bot,
    oneLiner: "Plans and performs actions, not just answers questions.",
    modality: "Text/UI → Actions",
    bestUse: "Booking meetings, filling forms, using software, workflows",
    complexity: 5, speed: 2,
    input: "Text, goals, environment state", output: "Executed actions",
    arch: "Planner + Tool-Execution Loop",
    what: "Moves beyond answering questions — it can plan and perform actions: booking meetings, filling forms, using software, and executing workflows. A conceptual foundation for AI agents and action-oriented systems.",
    bestFor: ["Task automation", "Software operation", "Multi-step workflows", "Agentic pipelines"],
    strengths: ["Goal-directed planning", "Tool & API execution", "Closes the loop from intent to action"],
    limitations: ["Error compounding across steps", "Needs guardrails & oversight"],
    filters: ["agents"], edge: false, multimodal: false, action: true, compute: 5,
  },
  {
    id: "MoE", name: "Mixture of Experts", tag: "Efficiency",
    icon: Network,
    oneLiner: "Routes each request to only the most relevant expert sub-networks.",
    modality: "Sparse routed compute",
    bestUse: "Large-scale models needing efficient inference",
    complexity: 5, speed: 4,
    input: "Text (or multimodal tokens)", output: "Text (or multimodal tokens)",
    arch: "Sparse Gated Expert Routing",
    what: "Instead of activating an entire model, only the most relevant experts are used for each request — enabling faster inference, lower compute cost, and larger effective model capacity.",
    bestFor: ["Large-scale efficient inference", "Cost-sensitive serving", "Scaling model capacity"],
    strengths: ["Faster inference", "Lower compute cost", "Larger effective models"],
    limitations: ["Complex routing infrastructure", "Load-balancing challenges"],
    filters: ["efficiency", "language"], edge: false, multimodal: false, action: false, compute: 3,
  },
  {
    id: "VLM", name: "Vision Language Model", tag: "Vision",
    icon: Eye,
    oneLiner: "Combines images and text — gives AI eyes.",
    modality: "Image + Text → Text",
    bestUse: "Describing images, reading charts, visual Q&A",
    complexity: 4, speed: 3,
    input: "Image + Text", output: "Text",
    arch: "Vision Encoder + Language Decoder",
    what: "Combines images and text. Can describe images, read charts, analyze documents, and answer visual questions — think of it as giving AI eyes.",
    bestFor: ["Image captioning", "Document intelligence", "Visual Q&A", "Chart & diagram reading"],
    strengths: ["Joint visual + textual reasoning", "Handles unstructured documents", "Rich grounding in real scenes"],
    limitations: ["Heavier than text-only models", "Can still misread fine visual detail"],
    filters: ["vision"], edge: false, multimodal: true, action: false, compute: 4,
  },
  {
    id: "SLM", name: "Small Language Model", tag: "Efficiency",
    icon: Cpu,
    oneLiner: "A smaller, faster language model built for efficiency.",
    modality: "Text → Text",
    bestUse: "Edge deployment, on-device assistants, low-cost inference",
    complexity: 2, speed: 5,
    input: "Text", output: "Text",
    arch: "Compact Transformer / Distilled Model",
    what: "Smaller language models designed for efficiency — smaller, faster, more cost-effective, and suitable for edge and on-device applications.",
    bestFor: ["On-device assistants", "Edge AI", "Low-latency, low-cost inference"],
    strengths: ["Fast", "Cheap to run", "Runs on constrained hardware"],
    limitations: ["Lower ceiling on reasoning depth", "Smaller knowledge capacity"],
    filters: ["efficiency", "language"], edge: true, multimodal: false, action: false, compute: 1,
  },
  {
    id: "MLM", name: "Masked Language Model", tag: "Language",
    icon: FileText,
    oneLiner: "Predicts missing words within a sentence, not the next word.",
    modality: "Text → Embeddings/Labels",
    bestUse: "Semantic search, classification, embeddings",
    complexity: 3, speed: 4,
    input: "Text (with masked tokens)", output: "Predicted tokens / embeddings",
    arch: "Bidirectional Encoder (e.g. BERT-style)",
    what: "Instead of predicting the next word, it predicts missing words within a sentence — associated with architectures such as BERT.",
    bestFor: ["Text classification", "Semantic search", "Embeddings", "NLP understanding"],
    strengths: ["Deep bidirectional context", "Strong for understanding tasks", "Great embedding quality"],
    limitations: ["Not naturally generative", "Less suited to open-ended text generation"],
    filters: ["language"], edge: false, multimodal: false, action: false, compute: 2,
  },
  {
    id: "SAM", name: "Segment Anything Model", tag: "Computer Vision",
    icon: Scissors,
    oneLiner: "Identifies and segments objects within images — pixel by pixel.",
    modality: "Image → Segmentation Masks",
    bestUse: "Medical imaging, robotics, autonomous driving, image editing",
    complexity: 4, speed: 3,
    input: "Image (+ optional prompt points/boxes)", output: "Segmentation masks",
    arch: "Vision Transformer + Promptable Mask Decoder",
    what: "Designed to identify and segment objects in images. Instead of simply describing an image, it identifies exactly where objects are.",
    bestFor: ["Medical imaging", "Robotics perception", "Autonomous driving", "Image editing"],
    strengths: ["Pixel-precise localization", "Promptable & general-purpose", "Works across domains"],
    limitations: ["No semantic labels by default", "Vision-only, no language reasoning"],
    filters: ["vision", "cv"], edge: false, multimodal: false, action: false, compute: 4,
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "language", label: "Language" },
  { id: "vision", label: "Vision" },
  { id: "image-gen", label: "Image Gen" },
  { id: "agents", label: "Agents" },
  { id: "efficiency", label: "Efficiency" },
  { id: "cv", label: "Computer Vision" },
];

const USE_CASES = [
  { id: "conv", name: "Conversational AI", rec: ["LLM", "SLM"], why: { LLM: "carries broad, general-purpose conversation", SLM: "enables fast, low-cost chat at the edge" } },
  { id: "agents", name: "AI Agents", rec: ["LAM", "LLM", "MoE"], why: { LAM: "plans and executes multi-step actions", LLM: "provides the reasoning backbone", MoE: "serves large agent models efficiently" } },
  { id: "imggen", name: "Image Generation", rec: ["LCM"], why: { LCM: "produces high-quality images in a handful of steps" } },
  { id: "docintel", name: "Document Intelligence", rec: ["VLM", "MLM"], why: { VLM: "reads layouts, charts, and scanned pages", MLM: "powers classification & retrieval over extracted text" } },
  { id: "robotics", name: "Robotics", rec: ["LAM", "VLM", "SLM"], why: { VLM: "understands surroundings", LAM: "performs actions", SLM: "enables efficient local inference" } },
  { id: "autonomous", name: "Autonomous Systems", rec: ["SAM", "VLM", "SLM"], why: { SAM: "segments objects in the scene in real time", VLM: "interprets context around the vehicle", SLM: "runs efficiently onboard" } },
  { id: "edge", name: "Edge AI", rec: ["SLM"], why: { SLM: "is purpose-built for constrained, on-device hardware" } },
  { id: "search", name: "Semantic Search", rec: ["MLM"], why: { MLM: "produces strong embeddings for retrieval" } },
  { id: "imgedit", name: "Image Editing", rec: ["SAM", "LCM"], why: { SAM: "isolates exact objects to edit", LCM: "regenerates edited regions quickly" } },
  { id: "health", name: "Healthcare AI", rec: ["SAM", "VLM"], why: { SAM: "segments tumors, organs, and anomalies in scans", VLM: "reads reports alongside imaging" } },
];

const QUIZ = [
  { q: "Which architecture is designed to segment objects in images?", options: ["LLM", "VLM", "SAM", "MLM"], answer: "SAM", explain: "SAM identifies precise object regions in an image rather than just describing it." },
  { q: "Which model predicts missing words inside a sentence, rather than the next word?", options: ["LLM", "MLM", "LCM", "LAM"], answer: "MLM", explain: "MLMs like BERT are trained to fill in masked tokens using bidirectional context." },
  { q: "Which architecture routes each request to only a subset of expert sub-networks?", options: ["SLM", "MoE", "VLM", "SAM"], answer: "MoE", explain: "MoE uses a router to activate only the most relevant experts per request, saving compute." },
  { q: "Which model type is purpose-built for fast, low-cost, on-device inference?", options: ["LLM", "SLM", "LCM", "LAM"], answer: "SLM", explain: "SLMs trade some capability for a much smaller footprint suited to edge deployment." },
  { q: "Which model can plan and execute real-world actions like booking a meeting?", options: ["VLM", "MLM", "LAM", "SAM"], answer: "LAM", explain: "LAMs plan multi-step workflows and execute actions via tools, not just generate text." },
];

const SIM_STEPS = {
  LLM: [
    { id: "s1", type: "input", label: "Prompt", desc: "The user's request enters the system as raw text." },
    { id: "s2", type: "processing", label: "Tokenization", desc: "Text is broken into tokens the model can operate on." },
    { id: "s3", type: "processing", label: "Transformer / Attention", desc: "Self-attention weighs relationships between all tokens at once." },
    { id: "s4", type: "decision", label: "Autoregressive Generation", desc: "The model predicts the next token, one step at a time, conditioned on everything before it." },
    { id: "s5", type: "output", label: "Text Response", desc: "Generated tokens are assembled into the final response." },
  ],
  VLM: [
    { id: "s1", type: "input", label: "Image + Text", desc: "An image and a text prompt enter the system together." },
    { id: "s2", type: "processing", label: "Vision Encoding", desc: "The image is converted into visual tokens capturing shapes, objects, and layout." },
    { id: "s3", type: "processing", label: "Text Encoding", desc: "The text prompt is tokenized in parallel with the image." },
    { id: "s4", type: "decision", label: "Multimodal Fusion", desc: "Visual and text tokens are merged into one joint representation the model reasons over." },
    { id: "s5", type: "processing", label: "Language Reasoning", desc: "The fused representation is reasoned over using language-model-style attention." },
    { id: "s6", type: "output", label: "Text Response", desc: "The model produces a grounded answer referencing what it \"saw\"." },
  ],
  LAM: [
    { id: "s1", type: "input", label: "User Goal", desc: "A high-level goal enters the system, e.g. \"complete this workflow.\"" },
    { id: "s2", type: "processing", label: "Planning", desc: "The goal is decomposed into an ordered sequence of smaller steps." },
    { id: "s3", type: "decision", label: "Action Selection", desc: "The planner selects the next concrete action and the tool needed to perform it." },
    { id: "s4", type: "processing", label: "Tool / Environment Execution", desc: "The selected action runs against a tool or environment (conceptual — no real system is called here)." },
    { id: "s5", type: "processing", label: "Observation", desc: "The result of the action is observed and fed back into the loop." },
    { id: "s6", type: "output", label: "Result / Next Action", desc: "The loop either produces a final result or selects the next action." },
  ],
  MoE: [
    { id: "s1", type: "input", label: "Request", desc: "An incoming request enters the system." },
    { id: "s2", type: "decision", label: "Router", desc: "A lightweight gating network scores every expert and selects a small subset for this request." },
    { id: "s3", type: "processing", label: "Selected Experts Activate", desc: "Only the chosen expert sub-networks run — the rest stay idle, saving compute." },
    { id: "s4", type: "processing", label: "Expert Outputs Combine", desc: "The outputs of the active experts are merged, often with router-assigned weights." },
    { id: "s5", type: "output", label: "Output", desc: "The combined result is returned as the model's response." },
  ],
  SLM: [
    { id: "s1", type: "input", label: "Prompt", desc: "A text prompt enters the compact model." },
    { id: "s2", type: "processing", label: "Compact Inference", desc: "A smaller parameter count and lighter architecture process the prompt with minimal overhead." },
    { id: "s3", type: "output", label: "Fast Local Response", desc: "A response is generated quickly, often directly on-device." },
  ],
  MLM: [
    { id: "s1", type: "input", label: "Text with Masked Tokens", desc: "A sentence enters with certain words hidden, e.g. \"The [MASK] sat on the mat.\"" },
    { id: "s2", type: "processing", label: "Bidirectional Encoding", desc: "The model reads the full sentence in both directions at once — not just left-to-right." },
    { id: "s3", type: "decision", label: "Masked Token Prediction", desc: "For each mask, the model predicts the most likely original token from context on both sides." },
    { id: "s4", type: "output", label: "Predictions / Embeddings", desc: "The model returns predicted tokens, or the rich contextual embeddings used for search & classification." },
  ],
  SAM: [
    { id: "s1", type: "input", label: "Image + Prompt Point", desc: "An image enters along with a point, box, or click indicating a region of interest." },
    { id: "s2", type: "processing", label: "Image Encoding", desc: "A vision transformer converts the full image into a dense feature representation." },
    { id: "s3", type: "decision", label: "Promptable Mask Decoder", desc: "The decoder combines the prompt with image features to decide which pixels belong to the object." },
    { id: "s4", type: "output", label: "Segmentation Mask", desc: "A pixel-precise mask outlining the selected object is returned." },
  ],
  LCM: [
    { id: "s1", type: "input", label: "Text Prompt + Latent Noise", desc: "A text prompt and a starting noise pattern enter the pipeline." },
    { id: "s2", type: "processing", label: "Consistency-Distilled Prediction", desc: "Instead of many small denoising steps, the model jumps directly toward a clean latent in very few steps." },
    { id: "s3", type: "processing", label: "Latent Refinement", desc: "A handful of additional steps refine detail while preserving speed." },
    { id: "s4", type: "output", label: "Generated Image", desc: "The final latent is decoded into a full image." },
  ],
};

const TYPE_META = {
  input: { label: "Input" },
  processing: { label: "Processing" },
  decision: { label: "Decision / Router" },
  output: { label: "Output" },
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

/* ============================== PRIMITIVES ============================== */

function Bar({ value, max = 5, label, sublabel }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 80);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div className="bar-wrap">
      {label && (
        <div className="bar-label-row">
          <span>{label}</span>
          {sublabel && <span className="bar-sublabel">{sublabel}</span>}
        </div>
      )}
      <div className="bar-track"><div className="bar-fill" style={{ width: `${w}%` }} /></div>
    </div>
  );
}

function Counter({ value, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 800;
    const tick = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      setN(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(tick); else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n}{suffix}</span>;
}

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); setShow((s) => !s); }} tabIndex={0}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && <span className="tooltip-bubble" role="tooltip">{text}</span>}
    </span>
  );
}

/* ============================== MODEL CARD (compact) ============================== */

function ModelCard({ model, active, onSelect }) {
  const Icon = model.icon;
  return (
    <button className={`model-card ${active ? "active" : ""}`} onClick={() => onSelect(model.id)}>
      <div className="model-card-top">
        <Icon size={16} strokeWidth={1.6} />
        <span className="model-card-id">{model.id}</span>
      </div>
      <div className="model-card-name">{model.name}</div>
      <p className="model-card-line">{model.oneLiner}</p>
      <div className="model-card-foot">
        <span>{model.modality}</span>
        <ChevronRight size={13} />
      </div>
    </button>
  );
}

/* ============================== DETAIL PANEL ============================== */

function ModelDetail({ model, onSimulate }) {
  const Icon = model.icon;
  return (
    <div className="detail" key={model.id}>
      <div className="detail-head">
        <div className="detail-icon"><Icon size={22} strokeWidth={1.5} /></div>
        <div>
          <div className="detail-eyebrow">{model.id}</div>
          <div className="detail-name">{model.name}</div>
        </div>
      </div>

      <p className="detail-what">{model.what}</p>

      <div className="detail-flow">
        <span>{model.input}</span><ArrowRight size={12} /><span>Processing</span><ArrowRight size={12} /><span>{model.output}</span>
      </div>

      <div className="detail-grid">
        <div>
          <div className="label">BEST FOR</div>
          <ul className="list">{model.bestFor.map((b) => <li key={b}><Check size={12} /> {b}</li>)}</ul>
        </div>
        <div>
          <div className="label">ARCHITECTURE</div>
          <p className="detail-arch">{model.arch}</p>
          <div className="detail-two">
            <Bar value={model.speed} label="Speed" sublabel={`${model.speed}/5`} />
            <Bar value={model.complexity} label="Complexity" sublabel={`${model.complexity}/5`} />
          </div>
        </div>
      </div>

      <div className="detail-two">
        <div>
          <div className="label">STRENGTHS</div>
          <ul className="list plain">{model.strengths.map((s) => <li key={s}>+ {s}</li>)}</ul>
        </div>
        <div>
          <div className="label">LIMITATIONS</div>
          <ul className="list plain dim">{model.limitations.map((s) => <li key={s}>− {s}</li>)}</ul>
        </div>
      </div>

      <button className="btn-primary full" onClick={() => onSimulate(model.id)}>
        <Play size={14} /> See how it works
      </button>
    </div>
  );
}

/* ============================== SIMULATOR ============================== */

const SPEED_MS = { 0.5: 2600, 1: 1500, 2: 800 };

function Simulator({ modelId, setModelId, reduced }) {
  const model = MODELS.find((m) => m.id === modelId);
  const steps = SIM_STEPS[modelId];
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => { setStepIndex(0); setPlaying(false); }, [modelId]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStepIndex((s) => Math.min(s + 1, steps.length - 1)), reduced ? 400 : SPEED_MS[speed]);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIndex, speed, steps.length, reduced]);

  const play = () => { if (stepIndex >= steps.length - 1) setStepIndex(0); setPlaying(true); };
  const pause = () => setPlaying(false);
  const reset = () => { setPlaying(false); setStepIndex(0); };
  const step = () => { setPlaying(false); setStepIndex((s) => Math.min(s + 1, steps.length - 1)); };
  const back = () => { setPlaying(false); setStepIndex((s) => Math.max(s - 1, 0)); };

  const current = steps[stepIndex];
  const isComplete = stepIndex === steps.length - 1;

  return (
    <div className="simulator">
      <div className="sim-picker">
        {MODELS.map((m) => (
          <button key={m.id} className={`sim-chip ${modelId === m.id ? "active" : ""}`} onClick={() => setModelId(m.id)}>{m.id}</button>
        ))}
      </div>

      <div className="sim-body">
        <div className="sim-col">
          <div className="sim-legend">
            {Object.entries(TYPE_META).map(([k, v]) => (
              <span key={k} className="legend-item"><span className={`legend-dot dot-${k}`} />{v.label}</span>
            ))}
          </div>

          <div className="sim-chain">
            {steps.map((s, i) => {
              const status = i < stepIndex ? "completed" : i === stepIndex ? "active" : "waiting";
              return (
                <React.Fragment key={s.id}>
                  <div className={`sim-node sim-${status} type-${s.type}`}>
                    <span className="sim-node-dot" />
                    <div className="sim-node-text">
                      <span className="sim-node-type">{TYPE_META[s.type].label}</span>
                      <span className="sim-node-label">{s.label}</span>
                    </div>
                    {status === "active" && !reduced && <span className="sim-particle" />}
                  </div>
                  {i < steps.length - 1 && <div className={`sim-edge ${i < stepIndex ? "done" : ""}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <ModelVisual modelId={modelId} stepIndex={stepIndex} />
        </div>

        <div className="sim-side">
          <div className="sim-explain">
            <div className="sim-explain-head"><HelpCircle size={13} /> WHAT JUST HAPPENED?</div>
            <p key={current.id}>{current.desc}</p>
            <div className="sim-step-count">STEP {stepIndex + 1} / {steps.length} · {current.label.toUpperCase()}</div>
          </div>
          {isComplete && (
            <div className="sim-complete">
              <div>FLOW COMPLETE</div>
              <button className="btn-ghost" onClick={reset}><RotateCcw size={13} /> Replay</button>
            </div>
          )}
        </div>
      </div>

      <div className="sim-controls">
        <div className="sim-controls-left">
          <button className="btn-icon" onClick={back} disabled={stepIndex === 0}><ChevronLeft size={15} /></button>
          {!playing ? <button className="btn-primary" onClick={play}><Play size={14} /> Play</button>
            : <button className="btn-primary" onClick={pause}><Pause size={14} /> Pause</button>}
          <button className="btn-icon" onClick={step} disabled={isComplete}>Step <SkipForward size={13} /></button>
          <button className="btn-icon" onClick={reset}><RotateCcw size={13} /> Reset</button>
        </div>
        <div className="sim-speed">
          <span>SPEED</span>
          {[0.5, 1, 2].map((s) => <button key={s} className={`speed-btn ${speed === s ? "on" : ""}`} onClick={() => setSpeed(s)}>{s}×</button>)}
        </div>
      </div>
    </div>
  );
}

function ModelVisual({ modelId, stepIndex }) {
  if (modelId === "LLM") {
    const tokens = ["Explain", "AI", "agents"];
    const genTokens = ["AI", "agents", "can", "plan", "and", "act"];
    return (
      <div className="visual-box">
        {stepIndex >= 1 && <div className="token-row">{tokens.map((t, i) => <span key={t} className="token-chip fade-in" style={{ animationDelay: `${i * 80}ms` }}>{t}</span>)}</div>}
        {stepIndex >= 3 && <div className="token-row" style={{ marginTop: 10 }}>
          {genTokens.slice(0, stepIndex >= 4 ? genTokens.length : 2).map((t, i) => <span key={t + i} className="token-chip filled fade-in" style={{ animationDelay: `${i * 90}ms` }}>{t}</span>)}
        </div>}
      </div>
    );
  }
  if (modelId === "VLM") {
    return (
      <div className="visual-box vlm-visual">
        <div className={`vlm-col ${stepIndex >= 1 ? "on" : ""}`}><div className="vlm-swatches"><span /><span /><span /></div><span className="mini-label">Vision Tokens</span></div>
        <div className={`vlm-col ${stepIndex >= 2 ? "on" : ""}`}><div className="token-row small"><span className="token-chip">What</span><span className="token-chip">is</span><span className="token-chip">this?</span></div><span className="mini-label">Text Tokens</span></div>
        <div className={`vlm-fusion ${stepIndex >= 3 ? "on" : ""}`}>{stepIndex >= 3 ? "Fused Representation" : "…"}</div>
      </div>
    );
  }
  if (modelId === "LAM") {
    const labels = ["Understand goal", "Select tool", "Execute", "Observe result"];
    return (
      <div className="visual-box lam-visual">
        {labels.map((l, i) => {
          const st = i < stepIndex - 1 ? "SUCCESS" : i === stepIndex - 1 ? "RUNNING" : "WAITING";
          return <div key={l} className={`lam-step lam-${st.toLowerCase()}`}><span className="lam-state">{st}</span><span>{l}</span></div>;
        })}
      </div>
    );
  }
  if (modelId === "MoE") {
    const experts = ["Expert 1", "Expert 2", "Expert 3", "Expert 4"];
    const active = [1, 3];
    return (
      <div className="visual-box moe-visual">
        <div className="moe-router" style={{ opacity: stepIndex >= 1 ? 1 : 0.4 }}>ROUTER</div>
        <div className="moe-experts">{experts.map((e, i) => (
          <div key={e} className={`moe-expert ${stepIndex >= 2 && active.includes(i) ? "active" : ""} ${stepIndex >= 2 && !active.includes(i) ? "dim" : ""}`}>{e}</div>
        ))}</div>
        {stepIndex >= 2 && <div className="mini-label">ACTIVE: {active.map((i) => experts[i]).join(", ")}</div>}
      </div>
    );
  }
  if (modelId === "SLM") {
    return (
      <div className="visual-box">
        <Bar value={stepIndex >= 1 ? 2 : 0} max={5} label="Latency" sublabel="Conceptual" />
        <Bar value={stepIndex >= 1 ? 1 : 0} max={5} label="Compute" sublabel="Conceptual" />
        <div className="mini-label" style={{ marginTop: 8 }}>Deployment: Local</div>
      </div>
    );
  }
  if (modelId === "SAM") {
    return (
      <div className="visual-box sam-visual">
        <div className="sam-image">
          <span className="sam-object" style={{ opacity: stepIndex >= 1 ? 1 : 0.5 }}>▲</span>
          {stepIndex >= 2 && <span className="sam-mask" />}
        </div>
        <span className="mini-label">{stepIndex >= 2 ? "Segmentation mask applied" : "Awaiting prompt point…"}</span>
      </div>
    );
  }
  if (modelId === "MLM") {
    return (
      <div className="visual-box">
        <div className="token-row">
          <span className="token-chip">The</span>
          <span className={`token-chip ${stepIndex >= 2 ? "filled" : ""}`}>{stepIndex >= 2 ? "cat" : "[MASK]"}</span>
          <span className="token-chip">sat</span><span className="token-chip">on</span><span className="token-chip">the</span>
          <span className={`token-chip ${stepIndex >= 2 ? "filled" : ""}`}>{stepIndex >= 2 ? "mat" : "[MASK]"}</span>
        </div>
      </div>
    );
  }
  if (modelId === "LCM") {
    const s = clamp(stepIndex, 0, 3);
    return (
      <div className="visual-box">
        <div className="lcm-grid">
          {[0,1,2,3].map((i) => <div key={i} className="lcm-frame" style={{ opacity: s >= i ? 1 : 0.25, filter: `blur(${Math.max(0, 3 - s)}px)` }}>{i === 3 ? "Image" : `Step ${i+1}`}</div>)}
        </div>
      </div>
    );
  }
  return null;
}

/* ============================== DECISION ASSISTANT ============================== */

const GOAL_OPTIONS = ["Chat / Text", "Vision System", "Agent / Automation", "Document AI", "Image Understanding", "Local AI"];
const INPUT_OPTIONS = ["Text", "Image", "Text + Image", "Actions", "Image Editing"];
const PRIORITY_OPTIONS = ["Accuracy", "Speed", "Low Cost", "On-device", "Automation"];

function scoreModel(model, goal, input, priority) {
  let score = 30;
  const inputMap = { "Text": ["LLM","SLM","MLM","MoE"], "Image": ["SAM","LCM"], "Text + Image": ["VLM"], "Actions": ["LAM"], "Image Editing": ["SAM","LCM"] };
  if (inputMap[input]?.includes(model.id)) score += 32;
  const priorityMap = {
    "Accuracy": { LLM: 14, VLM: 14, MoE: 12, SAM: 10 }, "Speed": { SLM: 18, LCM: 16, MoE: 9 },
    "Low Cost": { SLM: 18, MoE: 14, MLM: 9 }, "On-device": { SLM: 22 }, "Automation": { LAM: 22, MoE: 7 },
  };
  score += priorityMap[priority]?.[model.id] || 0;
  const goalMap = { "Chat / Text": ["LLM","SLM"], "Vision System": ["VLM","SAM"], "Agent / Automation": ["LAM","MoE"], "Document AI": ["VLM","MLM"], "Image Understanding": ["VLM","SAM"], "Local AI": ["SLM"] };
  if (goalMap[goal]?.includes(model.id)) score += 14;
  return clamp(score, 5, 98);
}

function reasonsFor(model, goal, input, priority) {
  const reasons = [];
  if (model.filters.includes("agents") && (goal === "Agent / Automation" || priority === "Automation")) reasons.push("Automation");
  if (model.multimodal && (input === "Text + Image" || goal.includes("Vision") || goal.includes("Document"))) reasons.push("Multimodal understanding");
  if (model.action) reasons.push("Multi-step workflow");
  if (model.edge && (priority === "On-device" || goal === "Local AI")) reasons.push("Runs on-device");
  if (priority === "Speed" && model.speed >= 4) reasons.push("Low latency");
  if (priority === "Low Cost" && model.compute <= 2) reasons.push("Low compute cost");
  if (priority === "Accuracy" && model.complexity >= 4) reasons.push("High-capacity reasoning");
  if (reasons.length === 0) reasons.push(model.oneLiner);
  return reasons.slice(0, 3);
}

function DecisionAssistant({ onSimulate }) {
  const [goal, setGoal] = useState(null);
  const [input, setInput] = useState(null);
  const [priority, setPriority] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (goal && input && priority) {
      setShowResult(false); setAnalyzing(true);
      const t = setTimeout(() => { setAnalyzing(false); setShowResult(true); }, 800);
      return () => clearTimeout(t);
    } else { setShowResult(false); setAnalyzing(false); }
  }, [goal, input, priority]);

  const results = useMemo(() => {
    if (!goal || !input || !priority) return null;
    return MODELS.map((m) => ({ m, score: scoreModel(m, goal, input, priority) })).sort((a, b) => b.score - a.score);
  }, [goal, input, priority]);

  return (
    <div className="decision">
      <Question label="1. What are you building?" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
      <Question label="2. What input does it require?" options={INPUT_OPTIONS} value={input} onChange={setInput} />
      <Question label="3. What matters most?" options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

      {analyzing && (
        <div className="analyzing fade-in">
          <div className="mini-label">ANALYZING REQUIREMENTS…</div>
          {results.slice(0, 4).map(({ m, score }) => <Bar key={m.id} value={score} max={100} label={m.id} sublabel={`${score}%`} />)}
        </div>
      )}

      {showResult && results && (
        <div className="decision-result fade-in">
          <div className="mini-label">RECOMMENDED ARCHITECTURE</div>
          <div className="rec-main">
            <div className="rec-id">{results[0].m.id}</div>
            <div className="rec-desc">{results[0].m.oneLiner}</div>
            <div className="match-score">
              <span>{results[0].score}% MATCH</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${results[0].score}%` }} /></div>
            </div>
            <div className="rec-why-list">{reasonsFor(results[0].m, goal, input, priority).map((r) => <span key={r} className="chip-sm"><Check size={11} /> {r}</span>)}</div>
            <button className="btn-ghost" style={{ marginTop: 14 }} onClick={() => onSimulate(results[0].m.id)}><Play size={13} /> See how it works</button>
          </div>
          <div className="rec-alts">
            {results.slice(1, 3).map(({ m, score }) => (
              <div key={m.id} className="rec-alt" onClick={() => onSimulate(m.id)}>
                <span className="rec-alt-id">{m.id}</span><span className="rec-alt-name">{m.name}</span><span className="rec-alt-score">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Question({ label, options, value, onChange }) {
  return (
    <div className="decision-q">
      <div className="decision-q-label">{label}</div>
      <div className="pill-row">
        {options.map((opt) => <button key={opt} className={`pill-btn ${value === opt ? "selected" : ""}`} onClick={() => onChange(opt)}>{opt}</button>)}
      </div>
    </div>
  );
}

/* ============================== COMPARISON ============================== */

function ComparisonMode() {
  const [selected, setSelected] = useState(["LLM", "VLM", "SLM"]);
  const [highlight, setHighlight] = useState(false);

  const toggle = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]);

  const rows = [
    { k: "Primary Purpose", get: (m) => m.oneLiner },
    { k: "Input", get: (m) => m.input },
    { k: "Output", get: (m) => m.output },
    { k: "Architecture", get: (m) => m.arch },
    { k: "Best Use Case", get: (m) => m.bestUse },
    { k: "Edge Friendly", get: (m) => (m.edge ? "Yes" : "No") },
    { k: "Multimodal", get: (m) => (m.multimodal ? "Yes" : "No") },
    { k: "Action Capable", get: (m) => (m.action ? "Yes" : "No") },
  ];
  const selModels = selected.map((id) => MODELS.find((m) => m.id === id));
  const isDifferent = (k) => { if (!highlight || selModels.length < 2) return false; const vals = selModels.map((m) => rows.find((r) => r.k === k).get(m)); return new Set(vals).size > 1; };

  return (
    <div className="compare">
      <div className="compare-head">
        <div className="compare-chip-row">{MODELS.map((m) => <button key={m.id} className={`chip ${selected.includes(m.id) ? "chip-on" : ""}`} onClick={() => toggle(m.id)}>{m.id}</button>)}</div>
        <button className={`toggle-btn ${highlight ? "on" : ""}`} onClick={() => setHighlight((h) => !h)}>
          <span className="toggle-track"><span className="toggle-thumb" /></span> Highlight differences
        </button>
      </div>

      {selModels.length > 0 && (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead><tr><th></th>{selModels.map((m) => <th key={m.id}>{m.id}</th>)}</tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.k} className={isDifferent(r.k) ? "row-diff" : ""}>
                <td className="row-key">{r.k}</td>{selModels.map((m) => <td key={m.id}>{r.get(m)}</td>)}
              </tr>
            ))}</tbody>
          </table>
          <div className="compare-bars">
            {["Speed", "Efficiency", "Compute", "Versatility"].map((metric) => (
              <div key={metric} className="compare-metric">
                <div className="mini-label">{metric}</div>
                {selModels.map((m) => {
                  const val = metric === "Speed" ? m.speed : metric === "Efficiency" ? (6 - m.compute) : metric === "Compute" ? m.compute : (m.multimodal || m.action ? 5 : m.filters.length > 1 ? 4 : 3);
                  return <Bar key={m.id + metric} value={val} label={m.id} />;
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== USE CASES ============================== */

function UseCaseExplorer({ onOpenModel, onSimulate }) {
  const [active, setActive] = useState(USE_CASES[4]);
  return (
    <div className="usecase-wrap">
      <div className="usecase-grid">
        {USE_CASES.map((uc) => <button key={uc.id} className={`usecase-card ${active.id === uc.id ? "active" : ""}`} onClick={() => setActive(uc)}>{uc.name}</button>)}
      </div>
      <div className="usecase-detail fade-in" key={active.id}>
        <div className="detail-eyebrow">{active.name}</div>
        <div className="usecase-rec-list">
          {active.rec.map((id) => {
            const m = MODELS.find((mm) => mm.id === id);
            return (
              <div key={id} className="usecase-rec">
                <span className="usecase-rec-id">{id}</span>
                <span className="usecase-rec-why">{active.why[id]}</span>
                <div className="usecase-rec-actions">
                  <button onClick={() => onOpenModel(id)}><Info size={13} /></button>
                  <button onClick={() => onSimulate(id)}><Play size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== DEEP DIVES ============================== */

function DeepDives({ onSimulate }) {
  const [open, setOpen] = useState("LLM");
  return (
    <div className="deepdives">
      {MODELS.map((m) => {
        const Icon = m.icon;
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="deepdive-item">
            <button className="deepdive-head" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
              <Icon size={16} strokeWidth={1.6} />
              <div className="deepdive-head-text"><span className="deepdive-id">{m.id}</span><span className="deepdive-name">{m.name}</span></div>
              <ChevronDown size={16} className={`chev ${isOpen ? "open" : ""}`} />
            </button>
            {isOpen && (
              <div className="deepdive-body fade-in">
                <p>{m.what}</p>
                <div className="detail-two">
                  <div><div className="label">BEST FOR</div><ul className="list plain">{m.bestFor.map((b) => <li key={b}>• {b}</li>)}</ul></div>
                  <div><div className="label">TRADE-OFFS</div><ul className="list plain">{m.strengths.slice(0,2).map((b) => <li key={b}>+ {b}</li>)}{m.limitations.slice(0,1).map((b) => <li key={b} className="dim">− {b}</li>)}</ul></div>
                </div>
                <button className="btn-ghost" onClick={() => onSimulate(m.id)}><Play size={13} /> Launch simulation</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== QUIZ ============================== */

function Quiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const q = QUIZ[step];

  const pick = (opt) => { if (picked) return; setPicked(opt); if (opt === q.answer) setScore((s) => s + 1); };
  const next = () => { if (step < QUIZ.length - 1) { setStep((s) => s + 1); setPicked(null); } else setDone(true); };
  const restart = () => { setStep(0); setScore(0); setPicked(null); setDone(false); };

  return (
    <div className="quiz">
      {!done ? (
        <>
          <div className="quiz-progress-row">
            <span className="mini-label">Question {step + 1} / {QUIZ.length}</span>
            <div className="quiz-progress-track"><div className="quiz-progress-fill" style={{ width: `${((step + (picked?1:0)) / QUIZ.length) * 100}%` }} /></div>
          </div>
          <h3 className="quiz-q">{q.q}</h3>
          <div className="quiz-options">
            {q.options.map((opt) => {
              let cls = "quiz-opt";
              if (picked) { if (opt === q.answer) cls += " correct"; else if (opt === picked) cls += " wrong"; }
              return <button key={opt} className={cls} onClick={() => pick(opt)} disabled={!!picked}>{opt}{picked && opt === q.answer && <Check size={15} />}{picked && opt === picked && opt !== q.answer && <X size={15} />}</button>;
            })}
          </div>
          {picked && (
            <div className="quiz-feedback fade-in">
              <div className={picked === q.answer ? "feedback-correct" : "feedback-wrong"}>{picked === q.answer ? <Check size={14} /> : <X size={14} />}{picked === q.answer ? "Correct" : `Not quite — it's ${q.answer}`}</div>
              <p>{q.explain}</p>
              <button className="btn-ghost" onClick={next}>Next <ArrowRight size={12} /></button>
            </div>
          )}
        </>
      ) : (
        <div className="quiz-done fade-in">
          <div className="quiz-score">{score} / {QUIZ.length}</div>
          <div className="bar-track" style={{ maxWidth: 260, margin: "0 auto 18px" }}><div className="bar-fill" style={{ width: `${(score / QUIZ.length) * 100}%` }} /></div>
          <p>{score === QUIZ.length ? "Perfect — you know your architectures." : score >= 3 ? "Solid grasp of the fundamentals." : "Worth another pass through the deep dives."}</p>
          <button className="btn-ghost" onClick={restart}>Try again</button>
        </div>
      )}
    </div>
  );
}

/* ============================== TABS DEFINITION ============================== */

const TABS = ["Overview", "Explorer", "Simulator", "Decide", "Compare", "Use Cases", "Deep Dives", "Quiz"];

/* ============================== MAIN APP ============================== */

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("Overview");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("LLM");
  const [simModel, setSimModel] = useState("VLM");
  const searchRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  const launchSim = useCallback((id) => { setSimModel(id); setTab("Simulator"); }, []);
  const openModel = useCallback((id) => { setSelectedId(id); setTab("Overview"); }, []);

  const filteredModels = useMemo(() => {
    return MODELS.filter((m) => {
      const matchFilter = filter === "all" || m.filters.includes(filter);
      const q = query.trim().toLowerCase();
      const matchQuery = !q || m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.oneLiner.toLowerCase().includes(q) || m.bestUse.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query]);

  const selectedModel = MODELS.find((m) => m.id === selectedId) || MODELS[0];

  return (
    <div className={`app ${theme}`}>
      <style>{CSS}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">AI MODEL INTELLIGENCE</div>
          <div className="tabs">
            {TABS.map((t) => <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); if (t === "Explorer") setTimeout(() => searchRef.current?.focus(), 150); }}>{t}</button>)}
          </div>
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
        <div className="tabs mobile-tabs">
          {TABS.map((t) => <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); if (t === "Explorer") setTimeout(() => searchRef.current?.focus(), 150); }}>{t}</button>)}
        </div>
      </header>

      <main className="main">
        {/* HERO / OVERVIEW */}
        {tab === "Overview" && (
          <div className="view fade-in">
            <div className="hero">
              <div className="status-chip"><span className="status-dot" /> 8 ARCHITECTURES INDEXED</div>
              <h1 className="headline">Stop calling every AI model an <span className="strike">LLM</span>.</h1>
              <p className="subtext">Not every AI model is built to generate text — some see, some act, some route, some segment.</p>
              <p className="closing-line">Understanding specialized models is what separates an <em>AI user</em> from an <em>AI engineer</em>.</p>
              <div className="hero-ctas">
                <button className="btn-primary" onClick={() => setTab("Explorer")}>Explore architectures <ArrowRight size={15} /></button>
                <button className="btn-ghost" onClick={() => launchSim("VLM")}><Play size={13} /> Watch how AI works</button>
              </div>
              <div className="snapshot-row">
                <div><span className="snap-num"><Counter value={8} /></span><span className="snap-label">Architectures</span></div>
                <div><span className="snap-num"><Counter value={5} suffix="+" /></span><span className="snap-label">Modalities</span></div>
                <div><span className="snap-num"><Counter value={10} suffix="+" /></span><span className="snap-label">Use cases</span></div>
                <div><span className="snap-num status-num"><span className="status-dot" /> Operational</span><span className="snap-label">System status</span></div>
              </div>
            </div>

            <div className="split">
              <div className="model-list">
                {MODELS.map((m) => <ModelCard key={m.id} model={m} active={selectedId === m.id} onSelect={setSelectedId} />)}
              </div>
              <ModelDetail model={selectedModel} onSimulate={launchSim} />
            </div>
          </div>
        )}

        {/* EXPLORER */}
        {tab === "Explorer" && (
          <div className="view fade-in">
            <h2 className="view-title">Model Explorer</h2>
            <div className="explorer-controls">
              <div className="search-box"><Search size={15} /><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search architectures..." /></div>
              <div className="filter-row">{FILTERS.map((f) => <button key={f.id} className={`filter-pill ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div>
              <div className="mini-label">{filteredModels.length} architecture{filteredModels.length !== 1 ? "s" : ""} {filter !== "all" || query ? "match" : "indexed"}</div>
            </div>
            <div className="explorer-grid">
              {filteredModels.map((m) => (
                <div key={m.id} className="explorer-card" onClick={() => openModel(m.id)}>
                  <div className="model-card-top"><m.icon size={16} strokeWidth={1.6} /><span className="model-card-id">{m.id}</span></div>
                  <div className="model-card-name">{m.name}</div>
                  <p className="model-card-line">{m.oneLiner}</p>
                  <div className="explorer-card-foot">
                    <button className="btn-ghost sm" onClick={(e) => { e.stopPropagation(); openModel(m.id); }}>Details</button>
                    <button className="btn-ghost sm" onClick={(e) => { e.stopPropagation(); launchSim(m.id); }}><Play size={11} /> Simulate</button>
                  </div>
                </div>
              ))}
              {filteredModels.length === 0 && <p className="empty-note">No architectures match that search.</p>}
            </div>
          </div>
        )}

        {/* SIMULATOR */}
        {tab === "Simulator" && (
          <div className="view fade-in">
            <h2 className="view-title">Architecture Simulator</h2>
            <p className="view-sub">Select a model, then trace how information moves through it.</p>
            <Simulator modelId={simModel} setModelId={setSimModel} reduced={reduced} />
          </div>
        )}

        {/* DECIDE */}
        {tab === "Decide" && (
          <div className="view fade-in">
            <h2 className="view-title">Which architecture should you use?</h2>
            <DecisionAssistant onSimulate={launchSim} />
          </div>
        )}

        {/* COMPARE */}
        {tab === "Compare" && (
          <div className="view fade-in">
            <h2 className="view-title">Compare architectures</h2>
            <ComparisonMode />
          </div>
        )}

        {/* USE CASES */}
        {tab === "Use Cases" && (
          <div className="view fade-in">
            <h2 className="view-title">Where these models show up</h2>
            <UseCaseExplorer onOpenModel={openModel} onSimulate={launchSim} />
          </div>
        )}

        {/* DEEP DIVES */}
        {tab === "Deep Dives" && (
          <div className="view fade-in">
            <h2 className="view-title">Deep dives</h2>
            <DeepDives onSimulate={launchSim} />
          </div>
        )}

        {/* QUIZ */}
        {tab === "Quiz" && (
          <div className="view fade-in">
            <h2 className="view-title">Knowledge check</h2>
            <Quiz />
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-title">AI Model Intelligence</div>
        <p>Learn the architecture. Understand the trade-offs. Build the right system.</p>
      </footer>
    </div>
  );
}

/* ============================== CSS — MONOCHROME ============================== */

const CSS = `
:root{
  --bg: #0A0A0A;
  --panel: rgba(255,255,255,0.035);
  --panel-2: rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.12);
  --border-strong: rgba(255,255,255,0.28);
  --text: #F2F2F2;
  --text-dim: #8A8A8A;
  --text-dimmer: #5C5C5C;
  --white: #FFFFFF;
  --font-display: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
.app.light{
  --bg:#FAFAFA; --panel: rgba(0,0,0,0.03); --panel-2: rgba(0,0,0,0.05); --border: rgba(0,0,0,0.12); --border-strong: rgba(0,0,0,0.35);
  --text:#111111; --text-dim:#6B6B6B; --text-dimmer:#9A9A9A; --white:#0A0A0A;
}
*{box-sizing:border-box;}
.app{ background: var(--bg); color: var(--text); font-family: var(--font-body); min-height:100vh; }
h1,h2,h3{ font-family: var(--font-display); margin:0; }
p{ margin:0; }
button{ font-family: var(--font-body); cursor:pointer; background:none; border:none; color:inherit; }
button:focus-visible, input:focus-visible, [tabindex]:focus-visible{ outline: 1px solid var(--white); outline-offset: 2px; }
::selection{ background: rgba(255,255,255,0.2); }

/* ---------- TOPBAR ---------- */
.topbar{ position:sticky; top:0; z-index:50; background: var(--bg); border-bottom:1px solid var(--border); }
.topbar-inner{ max-width:1180px; margin:0 auto; padding: 16px 24px; display:flex; align-items:center; gap:28px; }
.brand{ font-family: var(--font-mono); font-size:12px; letter-spacing:2px; font-weight:600; white-space:nowrap; }
.tabs{ display:flex; gap:2px; flex:1; overflow-x:auto; }
.mobile-tabs{ display:none; max-width:1180px; margin:0 auto; padding: 0 24px 12px; }
.tab{ font-size:12.5px; padding:8px 12px; border-radius:6px; color:var(--text-dim); white-space:nowrap; transition: all .15s; border-bottom:1px solid transparent; }
.tab:hover{ color:var(--text); }
.tab.active{ color:var(--white); border-bottom:1px solid var(--white); }
.icon-btn{ padding:7px; border:1px solid var(--border); border-radius:7px; color:var(--text-dim); }
.icon-btn:hover{ color:var(--text); border-color: var(--border-strong); }

/* ---------- MAIN / VIEW ---------- */
.main{ max-width:1180px; margin:0 auto; padding: 40px 24px 60px; min-height: 70vh; }
.view-title{ font-size: clamp(20px,2.6vw,26px); font-weight:600; margin-bottom:6px; letter-spacing:-0.01em; }
.view-sub{ color:var(--text-dim); font-size:13.5px; margin-bottom:24px; }

/* ---------- HERO ---------- */
.hero{ padding: 20px 0 44px; border-bottom:1px solid var(--border); margin-bottom: 36px; }
.status-chip{ display:inline-flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.8px; color:var(--text-dim); border:1px solid var(--border); padding:6px 12px; border-radius:999px; margin-bottom:24px; }
.status-dot{ width:6px; height:6px; border-radius:50%; background: var(--white); display:inline-block; animation: pulse 2s infinite; }
.headline{ font-size: clamp(28px, 4.6vw, 46px); line-height:1.1; font-weight:600; letter-spacing:-0.02em; margin-bottom:16px; max-width:720px; }
.strike{ position:relative; color: var(--text-dimmer); }
.strike::after{ content:''; position:absolute; left:-4%; right:-4%; top:50%; height:1px; background: var(--text-dim); transform: rotate(-2deg); }
.subtext{ font-size:15px; color:var(--text-dim); margin-bottom:16px; max-width:600px; line-height:1.6; }
.closing-line{ font-size:14px; color:var(--text-dim); margin-bottom:28px; max-width:560px; line-height:1.6; }
.closing-line em{ color:var(--text); font-style:normal; font-weight:600; }
.hero-ctas{ display:flex; gap:12px; flex-wrap:wrap; margin-bottom:36px; }
.snapshot-row{ display:flex; gap:36px; flex-wrap:wrap; }
.snapshot-row > div{ display:flex; flex-direction:column; gap:3px; }
.snap-num{ font-family:var(--font-mono); font-size:17px; font-weight:600; display:flex; align-items:center; gap:6px; }
.snap-label{ font-size:10.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.6px; }

/* ---------- BUTTONS ---------- */
.btn-primary{ display:inline-flex; align-items:center; gap:8px; background: var(--white); color: var(--bg); font-weight:600; padding:12px 22px; border-radius:8px; font-size:14px; transition: opacity .2s, transform .2s; }
.btn-primary:hover{ opacity:0.85; transform: translateY(-1px); }
.btn-primary.full{ width:100%; justify-content:center; margin-top:20px; }
.btn-ghost{ display:inline-flex; align-items:center; gap:7px; background: var(--panel); border:1px solid var(--border); color:var(--text); padding:11px 20px; border-radius:8px; font-size:13.5px; transition: all .2s; }
.btn-ghost:hover{ border-color: var(--border-strong); }
.btn-ghost.sm{ padding:7px 12px; font-size:12px; }
.btn-icon{ display:flex; align-items:center; gap:6px; background: var(--panel); border:1px solid var(--border); color:var(--text); padding:9px 13px; border-radius:8px; font-size:12.5px; transition: all .2s; }
.btn-icon:hover:not(:disabled){ border-color: var(--border-strong); }
.btn-icon:disabled{ opacity:0.35; cursor:not-allowed; }

/* ---------- SPLIT (Overview) ---------- */
.split{ display:grid; grid-template-columns: 300px 1fr; gap: 24px; align-items:start; }
.model-list{ display:flex; flex-direction:column; gap:8px; }
.model-card{ text-align:left; padding:14px 16px; border:1px solid var(--border); border-radius:10px; background: var(--panel); transition: all .15s; }
.model-card:hover{ border-color: var(--border-strong); }
.model-card.active{ border-color: var(--white); background: var(--panel-2); }
.model-card-top{ display:flex; align-items:center; gap:8px; margin-bottom:6px; color:var(--text-dim); }
.model-card-id{ font-family:var(--font-mono); font-weight:700; font-size:13px; color:var(--text); }
.model-card-name{ font-size:12px; color:var(--text-dim); margin-bottom:6px; }
.model-card-line{ font-size:12.5px; color:var(--text); line-height:1.4; margin-bottom:8px; }
.model-card-foot{ display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-dimmer); }

/* ---------- DETAIL ---------- */
.detail{ border:1px solid var(--border); border-radius:12px; padding: 26px; background: var(--panel); }
.detail-head{ display:flex; align-items:center; gap:14px; margin-bottom:16px; }
.detail-icon{ width:44px; height:44px; border-radius:10px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; }
.detail-eyebrow{ font-family:var(--font-mono); font-size:11px; color:var(--text-dim); letter-spacing:1px; }
.detail-name{ font-size:18px; font-weight:600; }
.detail-what{ font-size:14px; line-height:1.65; color:var(--text-dim); margin-bottom:18px; }
.detail-flow{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text); background: var(--panel-2); border:1px solid var(--border); padding:10px 14px; border-radius:8px; margin-bottom:22px; flex-wrap:wrap; }
.detail-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:20px; }
.detail-two{ display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:8px; }
.detail-arch{ font-size:13px; color:var(--text-dim); margin-bottom:14px; }
.label{ font-size:10.5px; letter-spacing:1px; text-transform:uppercase; color:var(--text-dimmer); margin-bottom:8px; font-family:var(--font-mono); }
.mini-label{ font-size:10.5px; letter-spacing:0.6px; text-transform:uppercase; color:var(--text-dim); font-family:var(--font-mono); }
.list{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:7px; }
.list li{ display:flex; align-items:center; gap:7px; font-size:13px; color:var(--text); }
.list.plain li{ font-size:12.5px; }
.list.plain li.dim{ color:var(--text-dim); }
.list.dim li{ color:var(--text-dim); }

/* ---------- BARS ---------- */
.bar-wrap{ margin-bottom:12px; }
.bar-label-row{ display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-bottom:5px; }
.bar-sublabel{ font-family:var(--font-mono); }
.bar-track{ height:4px; border-radius:99px; background: var(--border); overflow:hidden; }
.bar-fill{ height:100%; border-radius:99px; background: var(--white); transition: width 1s cubic-bezier(.16,1,.3,1); }

/* ---------- EXPLORER ---------- */
.explorer-controls{ display:flex; flex-direction:column; gap:14px; margin-bottom:24px; }
.search-box{ display:flex; align-items:center; gap:10px; background: var(--panel); border:1px solid var(--border); padding:11px 15px; border-radius:9px; max-width:400px; color:var(--text-dim); }
.search-box input{ background:none; border:none; outline:none; color:var(--text); font-size:13.5px; width:100%; }
.filter-row{ display:flex; gap:8px; flex-wrap:wrap; }
.filter-pill{ background: var(--panel); border:1px solid var(--border); color:var(--text-dim); padding:7px 13px; border-radius:999px; font-size:12px; transition: all .15s; }
.filter-pill.on{ color: var(--bg); background: var(--white); border-color:transparent; }
.empty-note{ color:var(--text-dim); font-size:13.5px; padding:20px 0; }
.explorer-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap:14px; }
.explorer-card{ padding:16px; border:1px solid var(--border); border-radius:10px; background: var(--panel); cursor:pointer; transition: all .15s; }
.explorer-card:hover{ border-color: var(--border-strong); transform: translateY(-2px); }
.explorer-card-foot{ display:flex; gap:8px; margin-top:10px; }

/* ---------- SIMULATOR ---------- */
.simulator{}
.sim-picker{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:24px; }
.sim-chip{ font-family:var(--font-mono); font-weight:700; font-size:12px; background: var(--panel); border:1px solid var(--border); color:var(--text-dim); padding:8px 14px; border-radius:8px; transition: all .15s; }
.sim-chip.active{ color: var(--bg); background: var(--white); border-color: transparent; }
.sim-body{ display:grid; grid-template-columns: 1.4fr 1fr; gap:24px; align-items:start; }
.sim-legend{ display:flex; gap:14px; flex-wrap:wrap; margin-bottom:16px; font-size:10.5px; color:var(--text-dim); }
.legend-item{ display:flex; align-items:center; gap:6px; }
.legend-dot{ width:7px; height:7px; border-radius:50%; background: var(--text-dim); }
.legend-dot.dot-input{ background:#fff; } .legend-dot.dot-processing{ background:#999; } .legend-dot.dot-decision{ background:#ccc; } .legend-dot.dot-output{ background:#fff; }
.app.light .legend-dot.dot-input, .app.light .legend-dot.dot-output{ background:#111; } .app.light .legend-dot.dot-decision{ background:#444; } .app.light .legend-dot.dot-processing{ background:#777; }
.sim-chain{ display:flex; flex-direction:column; }
.sim-node{ position:relative; display:flex; align-items:center; gap:12px; padding:13px 15px; border-radius:10px; border:1px solid var(--border); background: var(--panel); transition: all .35s cubic-bezier(.16,1,.3,1); }
.sim-node.sim-waiting{ opacity:0.4; }
.sim-node.sim-active{ border-color: var(--white); background: var(--panel-2); }
.sim-node.sim-completed{ opacity:0.75; }
.sim-node-dot{ width:8px; height:8px; border-radius:50%; background: var(--text-dim); flex-shrink:0; }
.sim-node.sim-active .sim-node-dot{ background: var(--white); animation: dotPulse 1.2s infinite; }
@keyframes dotPulse{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.4);} }
.sim-node-text{ display:flex; flex-direction:column; gap:2px; }
.sim-node-type{ font-size:9.5px; text-transform:uppercase; letter-spacing:0.6px; color:var(--text-dimmer); }
.sim-node-label{ font-size:13.5px; font-weight:600; }
.sim-particle{ position:absolute; right:14px; width:6px; height:6px; border-radius:50%; background: var(--white); animation: particleMove 1.2s infinite; }
@keyframes particleMove{ 0%{ transform: translateX(-40px); opacity:0;} 30%{ opacity:1;} 100%{ transform: translateX(0); opacity:1;} }
.sim-edge{ width:1px; height:16px; margin-left:19px; background: var(--border); }
.sim-edge.done{ background: var(--text-dim); }
.visual-box{ margin-top:18px; padding:16px; border-radius:10px; background: var(--panel); border:1px solid var(--border); min-height:64px; }
.token-row{ display:flex; gap:6px; flex-wrap:wrap; }
.token-row.small{ gap:4px; }
.token-chip{ font-family:var(--font-mono); font-size:11.5px; padding:6px 10px; border-radius:6px; border:1px solid var(--border-strong); color:var(--text); opacity:0; animation: cardIn .3s ease forwards; }
.token-chip.filled{ color: var(--bg); font-weight:700; background: var(--white); border-color:transparent; }
.vlm-visual{ display:flex; flex-direction:column; gap:12px; }
.vlm-col{ opacity:0.3; transition: opacity .4s; }
.vlm-col.on{ opacity:1; }
.vlm-swatches{ display:flex; gap:4px; margin-bottom:6px; }
.vlm-swatches span{ width:18px; height:18px; border-radius:4px; background: var(--text-dim); }
.mini-label{ font-size:10.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; }
.vlm-fusion{ text-align:center; padding:10px; border-radius:8px; border:1px dashed var(--border); font-size:12px; color:var(--text-dim); opacity:0.4; transition: all .4s; }
.vlm-fusion.on{ opacity:1; color:var(--text); border-style:solid; border-color: var(--border-strong); }
.lam-visual{ display:flex; flex-direction:column; gap:7px; }
.lam-step{ display:flex; align-items:center; gap:10px; font-size:12.5px; padding:7px 9px; border-radius:7px; }
.lam-state{ font-family:var(--font-mono); font-size:9px; padding:3px 6px; border-radius:5px; background: var(--panel-2); color:var(--text-dim); min-width:60px; text-align:center; }
.lam-step.lam-running .lam-state{ color: var(--text); border:1px solid var(--border-strong); }
.lam-step.lam-success .lam-state{ background: var(--white); color: var(--bg); }
.moe-visual{ display:flex; flex-direction:column; align-items:center; gap:10px; }
.moe-router{ font-family:var(--font-mono); font-weight:700; font-size:11.5px; padding:8px 16px; border-radius:7px; border:1px solid var(--border-strong); transition: opacity .3s; }
.moe-experts{ display:flex; gap:7px; flex-wrap:wrap; justify-content:center; }
.moe-expert{ font-size:11px; padding:7px 11px; border-radius:7px; background: var(--panel-2); color:var(--text-dim); border:1px solid transparent; transition: all .35s; }
.moe-expert.active{ color: var(--text); border-color: var(--border-strong); background: var(--panel-2); }
.moe-expert.dim{ opacity:0.3; }
.slm-deploy{ font-size:12px; color:var(--text-dim); margin-top:8px; }
.sam-visual{ display:flex; flex-direction:column; align-items:center; gap:8px; }
.sam-image{ position:relative; width:90px; height:64px; border-radius:8px; background: var(--panel-2); display:flex; align-items:center; justify-content:center; font-size:22px; color: var(--text-dim); }
.sam-mask{ position:absolute; inset:12px; border-radius:6px; border:2px solid var(--white); animation: cardIn .3s ease; }
.lcm-grid{ display:flex; gap:7px; }
.lcm-frame{ width:50px; height:50px; border-radius:7px; border:1px solid var(--border-strong); display:flex; align-items:center; justify-content:center; font-size:9.5px; color:var(--text-dim); transition: all .4s; }
.sim-side{ display:flex; flex-direction:column; gap:12px; }
.sim-explain{ padding:16px; border:1px solid var(--border); border-radius:10px; background: var(--panel); }
.sim-explain-head{ display:flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:10.5px; color:var(--text-dim); letter-spacing:0.6px; margin-bottom:10px; }
.sim-explain p{ font-size:13.5px; line-height:1.6; color:var(--text); margin-bottom:12px; animation: fadeSwap .35s ease; }
.sim-step-count{ font-family:var(--font-mono); font-size:10px; color:var(--text-dimmer); letter-spacing:0.4px; }
.sim-complete{ padding:14px 16px; border-radius:10px; border:1px solid var(--border-strong); text-align:center; display:flex; flex-direction:column; gap:10px; align-items:center; font-family:var(--font-mono); font-size:11px; letter-spacing:0.6px; }
.sim-controls{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-top:24px; padding-top:18px; border-top:1px solid var(--border); }
.sim-controls-left{ display:flex; gap:8px; flex-wrap:wrap; }
.sim-speed{ display:flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim); letter-spacing:0.5px; }
.speed-btn{ background: var(--panel); border:1px solid var(--border); color:var(--text-dim); padding:5px 9px; border-radius:6px; font-size:10.5px; font-family:var(--font-mono); }
.speed-btn.on{ color: var(--text); border-color: var(--border-strong); }

/* ---------- DECISION ASSISTANT ---------- */
.decision-q{ margin: 0 0 22px; }
.decision-q-label{ font-size:13.5px; font-weight:600; margin-bottom:11px; }
.pill-row{ display:flex; gap:9px; flex-wrap:wrap; }
.pill-btn{ background: var(--panel); border:1px solid var(--border); color:var(--text); padding:9px 15px; border-radius:8px; font-size:12.5px; transition: all .15s; }
.pill-btn:hover{ border-color: var(--border-strong); }
.pill-btn.selected{ background: var(--white); color: var(--bg); border-color:transparent; font-weight:600; }
.analyzing{ margin-top:20px; padding:16px; border-radius:10px; background: var(--panel); border:1px solid var(--border); }
.analyzing > .mini-label{ margin-bottom:12px; }
.decision-result{ margin-top: 24px; border-top:1px solid var(--border); padding-top:22px; }
.decision-result > .mini-label{ margin-bottom:10px; }
.rec-main{ border:1px solid var(--border-strong); border-radius:12px; padding:20px; margin-bottom:16px; }
.rec-id{ font-family:var(--font-mono); font-size:26px; font-weight:700; }
.rec-desc{ font-size:13.5px; color:var(--text-dim); margin: 6px 0 14px; }
.match-score{ display:flex; align-items:center; gap:10px; margin-bottom:14px; }
.match-score span{ font-size:11px; font-family:var(--font-mono); color:var(--text-dim); white-space:nowrap; }
.rec-why-list{ display:flex; gap:7px; flex-wrap:wrap; }
.chip-sm{ display:flex; align-items:center; gap:5px; font-size:11px; background: var(--panel-2); border:1px solid var(--border); padding:5px 9px; border-radius:999px; }
.rec-alts{ display:flex; flex-direction:column; gap:7px; }
.rec-alt{ display:flex; align-items:center; gap:12px; padding:11px 15px; border-radius:9px; background: var(--panel); border:1px solid var(--border); font-size:12.5px; cursor:pointer; transition: all .15s; }
.rec-alt:hover{ border-color: var(--border-strong); }
.rec-alt-id{ font-family:var(--font-mono); font-weight:700; width:44px; }
.rec-alt-name{ flex:1; color:var(--text-dim); }
.rec-alt-score{ font-family:var(--font-mono); font-weight:600; }

/* ---------- COMPARE ---------- */
.compare-head{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom:22px; }
.compare-chip-row{ display:flex; gap:7px; flex-wrap:wrap; }
.chip{ font-family:var(--font-mono); font-weight:700; background: var(--panel); border:1px solid var(--border); color:var(--text-dim); padding:8px 14px; border-radius:8px; font-size:12px; transition: all .15s; }
.chip-on{ color: var(--text); border-color: var(--border-strong); background: var(--panel-2); }
.toggle-btn{ display:flex; align-items:center; gap:9px; color:var(--text-dim); font-size:12px; }
.toggle-btn.on{ color:var(--text); }
.toggle-track{ width:32px; height:17px; border-radius:99px; background: var(--border); position:relative; display:inline-block; transition: background .2s; }
.toggle-btn.on .toggle-track{ background: var(--text-dim); }
.toggle-thumb{ position:absolute; top:2px; left:2px; width:13px; height:13px; border-radius:50%; background: var(--white); transition: transform .2s; }
.app.light .toggle-thumb{ background: var(--bg); }
.toggle-btn.on .toggle-thumb{ transform: translateX(15px); }
.compare-table-wrap{ overflow-x:auto; }
.compare-table{ width:100%; border-collapse: collapse; font-size:12.5px; margin-bottom:26px; min-width:520px; }
.compare-table th{ text-align:left; padding:10px 14px; font-family:var(--font-mono); font-size:13px; border-bottom:1px solid var(--border); }
.compare-table td{ padding:11px 14px; border-bottom:1px solid var(--border); vertical-align:top; color:var(--text); }
.compare-table .row-key{ color:var(--text-dim); white-space:nowrap; font-size:11.5px; text-transform:uppercase; letter-spacing:0.4px; }
.compare-table tr.row-diff td{ background: var(--panel-2); }
.compare-bars{ display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:22px; }
.compare-metric > .mini-label{ margin-bottom:10px; }

/* ---------- USE CASES ---------- */
.usecase-wrap{ display:grid; grid-template-columns: 1fr; gap:20px; }
@media(min-width:900px){ .usecase-wrap{ grid-template-columns: 1fr 1.2fr; align-items:start; } }
.usecase-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap:9px; }
.usecase-card{ padding:14px 12px; text-align:left; font-size:12.5px; font-weight:600; color:var(--text-dim); border:1px solid var(--border); border-radius:9px; background: var(--panel); transition: all .15s; }
.usecase-card:hover{ color:var(--text); border-color: var(--border-strong); }
.usecase-card.active{ color: var(--text); border-color: var(--white); background: var(--panel-2); }
.usecase-detail{ border:1px solid var(--border); border-radius:12px; padding:22px; background: var(--panel); }
.usecase-rec-list{ display:flex; flex-direction:column; gap:9px; margin-top:14px; }
.usecase-rec{ display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:9px; background: var(--panel-2); border:1px solid var(--border); }
.usecase-rec-id{ font-family: var(--font-mono); font-weight:700; width:44px; }
.usecase-rec-why{ flex:1; font-size:12.5px; color:var(--text-dim); }
.usecase-rec-actions{ display:flex; gap:5px; }
.usecase-rec-actions button{ background:none; border:1px solid var(--border); color:var(--text-dim); width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; }
.usecase-rec-actions button:hover{ color: var(--text); border-color: var(--border-strong); }

/* ---------- DEEP DIVES ---------- */
.deepdives{ display:flex; flex-direction:column; gap:8px; }
.deepdive-item{ border:1px solid var(--border); border-radius:10px; background: var(--panel); overflow:hidden; }
.deepdive-head{ width:100%; display:flex; align-items:center; gap:13px; padding:16px 18px; color:var(--text); text-align:left; }
.deepdive-head-text{ flex:1; display:flex; flex-direction:column; }
.deepdive-id{ font-family:var(--font-mono); font-weight:700; font-size:13px; }
.deepdive-name{ font-size:11.5px; color:var(--text-dim); }
.chev{ transition: transform .25s; color:var(--text-dim); }
.chev.open{ transform: rotate(180deg); }
.deepdive-body{ padding: 0 18px 20px 18px; font-size:13px; color:var(--text); line-height:1.6; }
.deepdive-body > p{ margin-bottom:14px; color:var(--text-dim); }

/* ---------- TOOLTIP ---------- */
.tooltip-wrap{ position:relative; }
.tooltip-bubble{ position:absolute; bottom:130%; left:50%; transform: translateX(-50%); background: var(--bg); border:1px solid var(--border-strong); color:var(--text); font-size:11px; padding:8px 12px; border-radius:8px; width:190px; text-align:center; z-index:20; }

/* ---------- QUIZ ---------- */
.quiz{ max-width:600px; margin:0 auto; text-align:center; }
.quiz-progress-row{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.quiz-progress-track{ flex:1; height:3px; background: var(--border); border-radius:99px; overflow:hidden; }
.quiz-progress-fill{ height:100%; background: var(--white); transition: width .4s; }
.quiz-q{ font-size: clamp(16px,2.2vw,20px); margin-bottom:22px; font-weight:600; }
.quiz-options{ display:grid; grid-template-columns: 1fr 1fr; gap:11px; }
.quiz-opt{ display:flex; align-items:center; justify-content:center; gap:8px; background: var(--panel); border:1px solid var(--border); color:var(--text); padding:13px; border-radius:10px; font-size:13.5px; font-weight:600; transition: all .15s; }
.quiz-opt:hover:not(:disabled){ border-color: var(--border-strong); }
.quiz-opt.correct{ border-color: var(--white); background: var(--panel-2); }
.quiz-opt.wrong{ border-color: var(--text-dimmer); opacity: 0.6; }
.quiz-feedback{ margin-top:20px; text-align:left; background: var(--panel); border:1px solid var(--border); border-radius:10px; padding:15px 17px; }
.feedback-correct, .feedback-wrong{ display:flex; align-items:center; gap:7px; font-weight:700; font-size:13px; margin-bottom:8px; }
.feedback-wrong{ color: var(--text-dim); }
.quiz-feedback p{ font-size:12.5px; color:var(--text-dim); margin-bottom:14px; line-height:1.5; }
.quiz-score{ font-size:24px; font-weight:700; font-family:var(--font-mono); margin-bottom:10px; }
.quiz-done p{ color:var(--text-dim); margin-bottom:20px; }

/* ---------- FOOTER ---------- */
.footer{ text-align:center; padding: 36px 24px 44px; color:var(--text-dimmer); border-top:1px solid var(--border); font-size:12px; }
.footer-title{ font-family:var(--font-mono); font-weight:700; color:var(--text-dim); font-size:12px; margin-bottom:8px; letter-spacing:0.6px; }

/* ---------- ANIMATIONS ---------- */
.fade-in{ animation: fadeUp .4s ease both; }
@keyframes fadeUp{ from{ opacity:0; transform: translateY(8px);} to{ opacity:1; transform:translateY(0);} }
@keyframes fadeSwap{ from{ opacity:0; transform: translateY(3px);} to{ opacity:1; transform:translateY(0);} }
@keyframes cardIn{ from{ opacity:0; transform: translateY(6px);} to{ opacity:1; transform:translateY(0);} }
@keyframes pulse{ 0%,100%{ opacity:1;} 50%{ opacity:0.3;} }

@media (prefers-reduced-motion: reduce){
  *{ animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  .sim-particle{ display:none; }
}

@media(max-width:900px){
  .split{ grid-template-columns: 1fr; }
  .sim-body{ grid-template-columns: 1fr; }
  .usecase-wrap{ grid-template-columns: 1fr; }
  .detail-grid, .detail-two{ grid-template-columns: 1fr; }
}
@media(max-width:760px){
  .topbar-inner .tabs{ display:none; }
  .mobile-tabs{ display:flex; overflow-x:auto; }
  .quiz-options{ grid-template-columns:1fr; }
  .compare-head{ flex-direction:column; align-items:flex-start; }
}
`;
