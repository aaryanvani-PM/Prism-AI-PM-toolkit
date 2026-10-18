# AI PM Decision Studio — Onboarding Landing Page, Guided Spotlight Tour & End-to-End Playbook Documentation

An enterprise-grade onboarding and comprehension layer for the AI Product Manager Decision Studio. This enhancement introduces a high-clarity landing overview on load, an interactive multi-step spotlight tour guiding users through complex inputs, and an in-depth Documentation tab featuring end-to-end PM playbooks from PRD ideation to production quality gates.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed through user feedback and will govern the architectural execution:

- **Landing Page & Entry Flow (Confirmed)**: The application will open directly on an **Overview Landing Page** on initial load. This page explains what each studio module does, how it assists an AI PM with real-world problems (e.g. unit economics, evals, guardrails), and features a prominent "Enter Studio" action. Users can return to this Overview anytime via a dedicated nav item in the sidebar.
- **Interactive Tour Engine (Confirmed)**: A step-by-step spotlight tour with animated beacon targeting, step counter, back/next controls, and skip options. It highlights key sections (Metrics & Trends, Economics Simulator, Evals & Golden Dataset, Agentic HITL, and Security RBAC) and can be triggered on-demand from the Landing Page, TopBar, or Sidebar.
- **Documentation Tab Scope (Confirmed)**: Dedicated "Documentation & Playbooks" tab focusing on end-to-end AI PM playbooks spanning PRD ideation, model selection trade-offs, dataset curation, eval design, and production gating heuristics.

---

## 1. Overview & Core Concept

### What It Delivers
1. **Interactive Landing Overview (`LandingOverview.tsx`)**:
   - Acts as the default landing view when users enter the application.
   - Summarizes the toolkit's purpose with clear, scannable cards representing each core section:
     - *Evaluation Metrics & Trends*: Side-by-side benchmarking and RAG health diagnostics.
     - *Model Benchmark Matrix*: Pareto frontier ranking, cost vs. quality vs. latency trade-offs.
     - *Golden Dataset & Regression*: Groundedness, recall, and assertion testing.
     - *Unit Economics & ROI*: Token cost forecasting, cache savings, and human-in-the-loop escalation math.
     - *Agentic HITL Simulator*: Financial caps, confidence thresholds, and deterministic policy gates.
     - *Architecture & PRD Builder*: 13-Factor framework and auto-generated PRD specifications.
     - *A/B Experiment Lab*: Sample size calculations and hypothesis testing.
     - *Enterprise Security & RBAC*: Simulated hardware vault, DLP PII redaction, and audit logs.
   - Includes quick-start CTA buttons ("Enter Studio", "Start Interactive Tour", "Read Playbooks").

2. **Step-by-Step Guided Spotlight Tour (`ProductTour.tsx`)**:
   - Lightweight, dependency-free interactive overlay component that dims the background and spotlights the active module.
   - 6 focused tour steps explaining:
     1. Studio Navigation & Project Switcher
     2. Model Benchmark & Pareto Frontier
     3. RAG Health Line Chart (Faithfulness vs. Relevance)
     4. Unit Economics & Escalation ROI
     5. Evals & Deterministic Safety Gates
     6. Automated PRD Generation & Spec Export
   - Full keyboard navigation (Escape to close, Left/Right arrow keys), progress dots, and completion feedback.

3. **End-to-End PM Playbooks & Reference (`DocumentationTab.tsx`)**:
   - Four comprehensive playbook tracks tailored for AI Product Managers:
     - **Playbook 1: 0-to-1 PRD & Architecture Selection**: Diagnostic framework for determining whether a feature requires simple prompting, hybrid RAG, or an autonomous tool-calling agent.
     - **Playbook 2: Unit Economics & CFO Justification**: Modeling cache hit ratios, token inflation, human escalation costs, and calculating net ROI.
     - **Playbook 3: Offline Evals & Golden Test Sets**: Designing assertions, setting LLM-as-a-judge grading criteria, and measuring RAG Faithfulness vs. Relevance.
     - **Playbook 4: Production Release Gates & Deterministic HITL**: Enforcing financial caps, rate limits, and audit trails before scaling traffic.
   - Includes quick-search filtering, copyable prompt templates, and interactive glossary.

---

## 2. User Experience & Visual Design

### Aesthetic Direction
- Consistent with the minimalist dark palette (`#0b0c0e` canvas, `#121417` surfaces, `#1f2328` hairline borders, `#e2e4e9` high-contrast typography).
- Zero-pill metadata discipline: quiet inline indicators with `·` separators.
- Clear spatial rhythm with generous breathing room (`p-8`, `gap-6`), eliminating visual overcrowding.

### User Flows
```
+-------------------------------------------------------------+
| 1. Initial Load                                            |
|    └─ Lands on Overview Page (High-level toolkit roadmap)   |
|         ├─ "Start Interactive Tour" ──> Opens Spotlight Tour|
|         ├─ "Explore Module" cards   ──> Deep links to view  |
|         └─ "Enter Decision Studio"  ──> Opens Metrics/Trends|
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
| 2. Studio Workspace                                         |
|    ├─ Sidebar: Permanent "Overview" link to revisit landing |
|    ├─ TopBar: "Quick Tour" button to relaunch walkthrough   |
|    └─ Sidebar: "Docs & Playbooks" tab for detailed guidance |
+-------------------------------------------------------------+
```

---

## 3. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  State: activeTab ('overview' | 'visualization' | 'docs' | ...)        │
│         isTourActive (boolean), currentTourStep (number)               │
└──────┬──────────────────────┬────────────────────────┬─────────────────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌──────────────┐       ┌──────────────┐       ┌────────────────────────┐
│ Sidebar.tsx  │       │ TopBar.tsx   │       │ ProductTour.tsx        │
│ - Overview   │       │ - Breadcrumb │       │ - Step Overlay Modal   │
│ - Studio Nav │       │ - Quick Tour │       │ - Next / Prev / Skip   │
│ - Docs Tab   │       │ - Preset CTA │       │ - View Auto-Switch     │
└──────────────┘       └──────────────┘       └────────────────────────┘
       │
       ▼ (Main Content Switcher)
┌────────────────────────────────────────────────────────────────────────┐
│ • activeTab === 'overview'      ──> LandingOverview.tsx                 │
│ • activeTab === 'docs'          ──> DocumentationTab.tsx                │
│ • activeTab === 'visualization' ──> DataVisualizationSection.tsx        │
│ • (Other existing tabs preserved in full)                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Steps (To be executed upon approval)

1. **Create `src/components/LandingOverview.tsx`**:
   - Executive header and problem-to-solution narrative for AI PMs.
   - 8 structured capability cards with "What it solves" and "How to use" bullet points.
   - Direct interactive links to jump into any tab or trigger the product tour.

2. **Create `src/components/ProductTour.tsx`**:
   - Interactive spotlight overlay with step descriptions, progress indicators, and automated tab switching to show relevant views as the tour progresses.

3. **Create `src/components/DocumentationTab.tsx`**:
   - Comprehensive playbooks covering 0-to-1 PRDs, unit economics math, golden eval datasets, and production release gating.
   - Interactive tabbed sections with search/filter, code/formula snippets, and PM checklists.

4. **Update `src/components/Sidebar.tsx` and `src/components/TopBar.tsx`**:
   - Add permanent "Overview & Landing" item in the sidebar navigation.
   - Add "Docs & Playbooks" under the Documentation section.
   - Add "Tour" button in the TopBar for instant accessibility.

5. **Update `src/App.tsx`**:
   - Set initial `activeTab` to `'overview'` on first load.
   - Connect tour state transitions, allowing the tour to switch views automatically to showcase features.
   - Verify all tests, compilation, and linting pass with zero errors.
