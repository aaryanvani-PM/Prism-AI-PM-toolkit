# Prism AI PM Studio

A decision studio for AI product managers. It brings the questions a PM has to answer before shipping an AI feature into one place: which architecture, which model, what it costs, how to test quality, and how to run the experiment.

**Status:** Working prototype. Built in Google AI Studio; exported to GitHub on 18 October 2026.

## What it does

- **Architecture and PRD builder.** A diagnostic framework that ranks eight AI architecture patterns (simple prompt, routing, RAG, ReAct agent, and others) against a feature's constraints, and generates a copyable Markdown PRD.
- **Unit economics and ROI.** Models cost per query from query volume, tokens, retrieval chunks, prompt-caching discounts, human escalation cost, and retries, and computes ROI, monthly operating cost, and break-even volume.
- **Model benchmark matrix.** Scores models on a cost-quality Pareto frontier, with hard constraints (time to first token, strict JSON, tool calling) and adjustable weights.
- **Golden dataset and regression studio.** Deterministic test cases (happy paths, policy disputes, prompt injection) with a PASS / FAIL / REVIEW toggle for human grading and pass-rate tracking.
- **A/B experiment lab.** Sample-size calculation from baseline conversion, minimum detectable effect, alpha, and power, plus two-proportion z-tests and Welch's t-tests, with templates for common AI experiments.
- **Agentic workflow and human-in-the-loop governance.** Simulates confidence thresholds, escalate-to-human rules, and authorization caps on agent actions.
- **Self-tests.** A verification tab that checks the statistics and economics formulas against known values.

## How it works

React, Vite, and Tailwind, with charts in Recharts. All calculations run in the browser: the economics engine is in `src/utils/econEngine.ts` and the statistics engine in `src/utils/statsEngine.ts`. A demo project ("Order Dispute AI Copilot") is preloaded to show the workflow end to end.

## What's real and what's simulated

**Real**
- The statistics (sample size, z-tests, t-tests) and the unit-economics formulas are computed, and the self-tests tab checks them.

**Simulated or assumed**
- The app does not call any model. Model prices, latency, and quality scores come from a hand-built dataset (`src/data/models.ts`) and should be updated against current published pricing before use.
- Golden-dataset cases and evaluation-trend charts use sample data for the demo project.
- The agentic, security, and access-control modules are simulations of policies and scenarios. They are not working security controls and make no compliance claim.

## What I learned

- Most AI feature decisions are economic before they are technical. Escalation cost to a human agent often matters more than the token price.
- Model choice is a Pareto problem, not a leaderboard. Hard constraints remove options before weights rank the rest.
- An A/B test on an AI feature needs a guardrail metric, because a variant can win on conversion while quietly hurting quality.

## Next steps

- Connect the model matrix to live evaluation runs instead of a static dataset.
- Let users import their own golden-dataset cases.

## Run it locally

Requires Node.js.

```bash
npm install
npm run dev
```

No API key is needed for the current features.
