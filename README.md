# AI Model Intelligence

> **Stop calling every AI model an "LLM."**

An interactive visual learning platform for understanding modern AI architectures — their inputs, outputs, internal workflows, trade-offs, and real-world applications.

Instead of simply reading about different AI models, **explore them, simulate how they work, compare their capabilities, and test your understanding.**

---

## ✨ Overview

**AI Model Intelligence** is an interactive dashboard designed to make AI architecture concepts easier to understand visually.

The platform explores multiple specialized AI architectures and helps answer questions such as:

- What type of model should I use?
- What happens inside the architecture?
- How do different architectures compare?
- Where are these models actually useful?
- What are the trade-offs between them?

The goal is simple:

> **Learn the architecture. Understand the trade-offs. Build the right system.**

---

## 🚀 Features

### 🧭 Architecture Explorer

Browse and discover different AI architectures through an interactive model explorer.

Search and filter architectures, inspect their characteristics, and jump directly into their details.

### ⚙️ Architecture Simulator

Go beyond static explanations.

The simulator visually traces how information moves through different architectures, showing the progression from input to processing, decisions, and output.

Features include:

- Step-by-step execution
- Play / pause controls
- Replay
- Speed controls
- Model-specific processing flows
- Active, completed, and waiting states
- Reduced-motion support

### 🧠 Decision Assistant

Not sure which architecture fits a particular problem?

The Decision Assistant evaluates your requirements and recommends suitable architectures based on factors such as:

- What you're building
- Input modality
- Primary priority

It also provides alternative recommendations so you can compare possible choices.

### ⚖️ Architecture Comparison

Compare multiple architectures side-by-side.

The comparison interface covers characteristics such as:

- Primary purpose
- Input
- Output
- Architecture
- Best use case
- Edge friendliness
- Multimodal capability
- Action capability

You can also highlight differences between selected architectures.

### 🌍 Real-World Use Cases

Explore where different AI architectures can be applied in real-world systems.

Use cases connect directly back to the relevant architectures, allowing you to move from **problem → model → simulation**.

### 🔬 Deep Dives

Explore deeper explanations of individual architectures and launch simulations to see their concepts in action.

### 📝 Interactive Quiz

Test your understanding with an interactive knowledge check featuring:

- Multiple-choice questions
- Instant feedback
- Explanations
- Progress tracking
- Score calculation
- Restart functionality

---

## 🏗️ Architectures Explored

The platform currently explores:

| Architecture | Focus |
|---|---|
| **LLM** | Language understanding and generation |
| **LCM** | Latent-space reasoning and generation |
| **LAM** | Language-driven action and task execution |
| **MoE** | Mixture-of-Experts routing |
| **VLM** | Vision + language understanding |
| **SLM** | Smaller, efficient language models |
| **MLM** | Masked language modeling |
| **SAM** | Image segmentation |

---

## 🎨 Design

The interface follows a minimal **monochrome intelligence-dashboard aesthetic**, focusing on information hierarchy rather than visual clutter.

Key design principles include:

- Dark / light themes
- Responsive layouts
- Minimal monochrome UI
- Subtle motion and transitions
- Interactive visual feedback
- Clear information hierarchy
- Keyboard-friendly interactions
- Reduced-motion support

---

## 🛠️ Tech Stack

- **React**
- **Vite**
- **JavaScript / JSX**
- **Lucide React**
- **CSS**
- **ESLint**

---

## 📁 Project Structure

```text
ai-model-intelligence/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── eslint.config.js
└── vite.config.js
