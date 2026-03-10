# Agent Profiles Guide

This guide explains how to use the specialized AI agent profiles in this workspace, how model routing works, and how to evolve towards true multi-agent orchestration with per-agent token tracking.

---

## 1. Profile Structure

Each profile in `.agents/profiles/` has YAML frontmatter and markdown instructions:

```yaml
---
name: frontend-engineer
description: Astro and React Frontend Specialist.
model: gemini-2.5-flash
---
# Role: Frontend UI/UX Engineer
...responsibilities, rules, standards...
```

### Current Profiles

| Profile | Role | Intended Model Tier |
|---|---|---|
| `orchestrator.md` | Architect, planning, task breakdown | Pro (strongest reasoning) |
| `frontend-engineer.md` | `apps/web/` UI, islands, Astro | Flash (fast implementation) |
| `backend-engineer.md` | `apps/server/`, `packages/*` | Flash (fast implementation) |
| `design-system-engineer.md` | Tailwind, DaisyUI, OKLCH tokens | Flash |
| `graphic-designer.md` | WCAG compliance, visual review | Pro (judgment-heavy) |
| `content-strategist.md` | Copy, SEO, CRO | Flash |
| `devops-engineer.md` | Infra, Turborepo, CI/CD | Pro |
| `database-architect.md` | Schema design | — |
| `security-engineer.md` | Security review | — |
| `test-engineer.md` | Testing strategy | — |
| `tech-writer.md` | Documentation | — |

The `model` field specifies the **intended** model tier for that agent — Pro for roles requiring strong reasoning (architecture, visual review, security), Flash for roles doing fast implementation work.

---

## 2. How to Use Profiles Today (Single Chat)

### @mention a profile to activate it

Type `@` in the chat, navigate to `.agents/profiles/`, and select the role:

```
@[orchestrator.md] I need to add a user dashboard. Generate an implementation plan.
@[frontend-engineer.md] Build the WhyChooseUs component per the plan.
@[graphic-designer.md] Review the contrast and spacing on the BeforeAfter section.
```

When you @mention the file, the AI reads those instructions and adopts that persona.

### Limitation: Single model per chat session

In a single chat, **one model processes everything** regardless of what the profile YAML says. The `model: gemini-2.5-flash` field is informational — it tells you which model *should* be used, but the IDE uses whichever model you've selected in settings.

**Manual workaround:** Before starting each task, switch your IDE's model setting to match the profile's intended tier:
- Implementation tasks (frontend, backend) → select a Flash/Haiku-tier model
- Review/planning tasks (orchestrator, graphic-designer) → select a Pro/Sonnet-tier model

---

## 3. The Orchestrator Problem

The `orchestrator.md` profile is designed as a **central coordinator** that:
- Reads the plan, decides what to do next
- Delegates tasks to worker agents
- Reviews worker output
- Tracks token usage across all agents
- Enforces stop limits (200k tokens, 15 turns per agent)

### Why separate chats don't work

Each chat is an isolated context with no shared memory. If the orchestrator is in Chat A and the frontend-engineer is in Chat B, the orchestrator has **zero visibility** into what the frontend-engineer did. This defeats the entire purpose of orchestration.

### What true orchestration looks like

```
┌─────────────────────────────────┐
│  Orchestrator (Pro model)       │
│  - Has full context of the plan │
│  - Sees all worker outputs      │
│  - Makes routing decisions      │
└──────────┬──────────────────────┘
           │ API call with Flash model
           ▼
┌─────────────────────────────────┐
│  Worker: frontend-engineer      │
│  - Gets system prompt from .md  │
│  - Gets specific task + files   │
│  - Returns code as text         │
└──────────┬──────────────────────┘
           │ response text + token count
           ▼
┌─────────────────────────────────┐
│  Orchestrator (Pro model)       │
│  - Reviews the output           │
│  - Sends to graphic-designer    │
│  - Applies code if approved     │
└─────────────────────────────────┘
```

This requires building a **custom orchestration script** or adopting a multi-agent framework.

---

## 4. Options for Multi-Agent Orchestration

### Option A: Manual model switching (works today, no code)

Switch models in your IDE before each task. Use the profile's `model` field as your checklist. The trade-off: you are the orchestrator.

### Option B: Custom orchestrator script

A Bun script that reads profiles and routes API calls:

```ts
// scripts/orchestrate.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const profiles = {
  "frontend-engineer": {
    model: "gemini-2.5-flash",
    systemPrompt: await Bun.file(".agents/profiles/frontend-engineer.md").text(),
  },
  "graphic-designer": {
    model: "gemini-2.5-pro",
    systemPrompt: await Bun.file(".agents/profiles/graphic-designer.md").text(),
  },
};

async function invokeAgent(role: keyof typeof profiles, task: string) {
  const profile = profiles[role];
  const response = await ai.models.generateContent({
    model: profile.model,
    contents: task,
    config: { systemInstruction: profile.systemPrompt },
  });

  console.log(`── ${role} ──`);
  console.log(`Model: ${profile.model}`);
  console.log(`Input tokens: ${response.usageMetadata?.promptTokenCount}`);
  console.log(`Output tokens: ${response.usageMetadata?.candidatesTokenCount}`);
  return response;
}
```

To support Claude models, branch based on the model string:

```ts
if (profile.model.startsWith("claude")) {
  // Call Anthropic API with ANTHROPIC_API_KEY
} else if (profile.model.startsWith("gemini")) {
  // Call Google GenAI API with GEMINI_API_KEY
}
```

**Trade-off:** Agents can't directly edit files — they produce code as text that a script or you applies.

### Option C: Multi-agent frameworks

| Framework | Language | Strength | Trade-off |
|---|---|---|---|
| **CrewAI** | Python | Role-based agents, built-in token tracking | Python-only |
| **LangGraph** | Python/JS | State-machine orchestration | Steeper learning curve |
| **AutoGen** | Python | Multi-agent conversations | Complex config |
| **Mastra** | TypeScript | TS-native, good Gemini support | Newer ecosystem |

All support multiple providers (Gemini + Claude), custom system prompts, and per-agent token tracking.

### Comparison

| Approach | Model routing | File editing | Orchestrator awareness | Token tracking | Effort |
|---|---|---|---|---|---|
| Manual model switching | ✅ (you do it) | ✅ Built-in | ❌ You are the orchestrator | ❌ | Zero |
| Separate chats | ✅ (you do it) | ✅ Built-in | ❌ No cross-chat visibility | ✅ Per-chat | Low |
| Custom script | ✅ Automatic | ❌ Text output | ✅ Full visibility | ✅ Per-agent | Medium |
| Framework | ✅ Automatic | ⚠️ With tool setup | ✅ Full visibility | ✅ Per-agent | High |

---

## 5. Using Claude models in profiles

The `model` field accepts any model identifier string. You can use Gemini, Claude, or mix:

```yaml
# Implementation agents (cheaper, faster)
model: gemini-2.5-flash
model: claude-3-5-haiku-latest

# Reasoning/review agents (stronger)
model: gemini-2.5-pro
model: claude-sonnet-4-20250514
```

The model field only takes effect if you're using Option B (custom script) or Option C (framework). In the IDE chat, it's a reference guide for manual switching.

---

## 6. Knowledge Items & Cross-Agent Learning

The workspace has a **Knowledge Items (KI) System**:

1. **The Knowledge Subagent** monitors conversations and distills important decisions, fixes, and patterns into Knowledge Items.
2. **Automatic Context:** When starting a new conversation, agents receive KI summaries before reading your prompt.
3. **Cross-Pollination:** A lesson learned by the Frontend Engineer is available to the Design System Engineer in future chats.

### How to help agents improve faster

1. **Explicit memory commands:**
   > *"Create a detailed artifact documenting how we solved this Better Auth issue so you remember it for future Knowledge Items."*

2. **Update rulebooks:** Add hard rules to `.agents/rules.md` or `.agents/stack-standards.md` when agents consistently make the same mistake.

3. **Refine profiles:** The profiles are living documents. When an agent fails at its job (see Lessons Learned below), add specific enforcement rules directly to its profile.

---

## 7. Lessons Learned

### The Colour Lockdown incident

**Problem:** The graphic-designer profile had good principles ("use curated, harmonious colour palettes") but no **enforcement rules**. During homepage implementation, agents introduced 5+ rogue Tailwind colour families (`emerald-*`, `sky-*`, `rose-*`, `indigo-*`, `stone-*`) that weren't in the brand's OKLCH token system — creating a chaotic, mismatched visual design.

**Root cause:** The profile said what to aim for but didn't say what was **banned**. Principles without constraints are suggestions, not rules.

**Fix:** Added **Section 7: Colour Lockdown (MANDATORY)** to `graphic-designer.md`:
- Explicit allowlist of brand tokens from `global.css`
- Explicit banlist of raw Tailwind colour families
- Dark-on-dark contrast audit rules
- Required "Colour Compliance" check in every response

**Lesson:** When an agent profile fails, don't just fix the output — add a **hard constraint** to the profile so it can't fail the same way again. Vague guidance like "use good colours" is useless. Specific rules like "ONLY use tokens from this list" are enforceable.

### The dark-on-dark contrast failure

**Problem:** `text-primary` (dark green, `oklch(0.35 0.08 160)`) was used on `bg-base-content` (dark background) — resulting in ~2:1 contrast ratio, a critical WCAG failure.

**Root cause:** `text-primary` is a light-mode token designed for white backgrounds. It stays dark green regardless of the background it's placed on. The agent didn't verify the actual OKLCH values before using the class.

**Fix:** Added a dark-on-dark audit rule to the graphic-designer profile specifying which text tokens are safe on dark backgrounds: `text-base-100`, `text-primary-foreground`, `text-accent-foreground`, `text-background`.

---

## 8. Recommended Next Steps

1. **Now:** Continue using single-chat with manual model switching to finish the homepage
2. **Soon:** Flesh out the custom orchestrator script (Option B) as a `scripts/orchestrate.ts` file
3. **Later:** Evaluate Mastra (TypeScript-native) for full multi-agent orchestration with tool-calling

