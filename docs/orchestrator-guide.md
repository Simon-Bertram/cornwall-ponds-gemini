# Guide to the Orchestrator Agent

Here is how you should think about and use the Orchestrator agent in your workflows:

## When to use the Orchestrator

You should call the Orchestrator whenever you are starting a **new, multi-step feature** or undertaking a **major architectural change**.

*   **Good use of Orchestrator:** *"@[orchestrator.md] I want to add a patient booking system. It will need a new database table, a set of Hono API routes, and a multi-step form on the Astro frontend."*
*   **Do not use Orchestrator for:** *"Fix the padding on the submit button"* or *"Write a unit test for the `sum()` function."* For discrete, isolated tasks, go straight to the specific engineer profile.

The Orchestrator's primary job is to look at the whole monorepo, figure out how everything connects, and generate an **Implementation Plan Artifact** that breaks the massive feature down into byte-sized, isolated steps.

## Can it prompt the other agents automatically?

**No, the Orchestrator cannot automatically spawn or prompt the other agents on its own.**

The LLM platform requires *you* (the user) to dictate which persona is currently active by using the `@` mention in the chat.

## How the workflow actually looks (What you need to do)

Because the Orchestrator cannot command the other agents directly, it relies on you to act as the "Project Manager" passing the baton. The workflow looks like this:

1.  **You prompt the Orchestrator:**
    > `@[orchestrator.md] Plan out the new Booking System.`
2.  **The Orchestrator creates the plan:**
    It will generate an `Implementation Plan` Artifact that explicitly lists the steps and *who* should do them (e.g., "Step 1: Database Architect creates schemas. Step 2: Backend Engineer builds API. Step 3: Frontend Engineer builds UI").
3.  **You prompt the workers step-by-step:**
    Once the plan is ready, you look at Step 1, and prompt the next agent in the chat:
    > `@[database-architect.md] Please execute Step 1 from the Implementation Plan.`
4.  **You continue the handoff:**
    Once the Database Architect finishes, you prompt the next one:
    > `@[backend-engineer.md] The schema is done. Please execute Step 2 from the Implementation Plan.`

By doing it this way, you ensure that complex tasks remain organized, and you stay in the driver's seat preventing agents from going rogue or burning through your token limits!
