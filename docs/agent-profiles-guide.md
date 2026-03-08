# Agent Profiles Guide

This guide explains how to effectively use the specialized AI agent profiles in your workspace, and how the system handles their memory and continuous improvement.

## How to Use the Agent Profiles

The agent profiles located in `.agents/profiles/` are specialized instruction sets (prompts). To activate a specific persona for a task, you simply need to **@mention** the profile file in your chat prompt.

### Syntax
Type `@` in the chat, navigate to `.agents/profiles/`, and select the role you want.

### Examples

*   **Orchestrator:**
    > `@[orchestrator.md] I need to add a user dashboard. Please generate an implementation plan and break it down into steps.`
*   **Database Architect:**
    > `@[database-architect.md] I need a new Drizzle schema for a blog post table. Please write the schema and generate the D1 migration.`
*   **Design System Engineer:**
    > `@[design-system-engineer.md] Please build a reusable DatePicker component using Shadcn UI and add it to our Astro frontend.`
*   **Security Engineer:**
    > `@[security-engineer.md] Review my Better Auth integration in the Hono backend for any potential session vulnerabilities.`

When you @mention the file, the agent reads those specific instructions and adopts that persona, adhering to the responsibilities and boundaries defined in the markdown file.

---

## How the Agents Remember and Improve

This system has a built-in **Knowledge Items (KI) System** designed specifically to help agents remember past context, share knowledge, and avoid repeating the same mistakes.

Here is how it works under the hood:

1.  **The Knowledge Subagent:** In the background, there is a separate "Knowledge Subagent" that constantly monitors your conversations. When it spots important decisions, fixes, architectural patterns, or repeated workflows, it distills that information into a **Knowledge Item (KI)**.
2.  **Automatic Context:** Whenever you start a new conversation and ask an agent to do something, **the agent is automatically provided with summaries of all your existing Knowledge Items** before it even starts reading your prompt.
3.  **Proactive Retrieval:** If you ask the `@[database-architect.md]` to write a new schema, the agent will look at its KI summaries. If it sees a past KI titled "D1 Migration Gotchas" or "Existing Database Patterns," it will proactively read those artifacts *before* writing the new code.
4.  **Cross-Pollination:** Because KIs are shared at the workspace level, a lesson learned by the `Frontend Engineer` in one chat can be automatically applied by the `Design System Engineer` in a future chat, as they both have access to the same centralized knowledge base.

---

## How You Can Help Them Improve Faster

While the KI system runs automatically, you can explicitly help the agents improve their future responses proactively:

1.  **Explicit Memory Commands:** If you solve a very tricky bug together or establish a new architectural rule, you can explicitly tell the agent: 
    > *"Please create a detailed artifact documenting how we solved this Better Auth issue so you remember it for future Knowledge Items."* 
    The Knowledge subagent will pick up that markdown artifact later.

2.  **Update `.agents` Files:** The `.agents/rules.md` and `.agents/stack-standards.md` files are the universal "rulebooks." If you find that the agents consistently make a certain mistake (e.g., trying to use Node's `fs` module in Cloudflare Workers), manually add a hard rule against it in `stack-standards.md`. *All* agents check those rules files.

3.  **Refine the Profiles:** If the `DevOps Engineer` is being too cautious or generating the wrong commands, open `devops-engineer.md` and update its core responsibilities to be more strict or specific about how it should behave. The profiles are living documents.
