# Customer Portal MVP — Implementation Plan (Better Auth + Cloudflare D1)

> **Roles:** orchestrator · database-architect · backend-engineer  
> **Date:** 2026-03-12  
> **Status:** Draft — Implementation-ready

---

## 1. Overview

**Goal:** Implement the **MVP Plan** from `customer_portal_plan.md` using:

- **Auth:** Better Auth on Cloudflare Workers (session cookies, D1-backed users)
- **Backend:** Hono in `apps/server`
- **Database:** Cloudflare D1 with Drizzle ORM in `packages/db`

MVP capabilities:

- Invite-based magic-link access to the portal (no self-service signup yet)
- One or more projects per customer
- Estimates with line items and acceptance
- Contracts linked to estimates with digital acceptance
- Payment schedule and bank account details (read-only for clients)
- Basic project dashboard and status

---

## 2. Agent Responsibilities

### 2.1 Orchestrator

- Finalises domain model and API surface (this document).
- Ensures bindings and packages are correctly scoped:
	- `apps/server` — Hono app and routes
	- `packages/db` — Drizzle schema + queries
	- `packages/auth` — Better Auth config
	- `packages/contracts` — Shared Zod schemas / types

### 2.2 Database Architect

- Designs and maintains D1 schema via Drizzle.
- Owns migrations and seeding.
- Exposes typed repository functions from `packages/db`.

### 2.3 Backend Engineer

- Implements Hono routes and middleware in `apps/server`.
- Integrates Better Auth sessions and guards.
- Uses repositories from `packages/db` and Zod contracts from
	`packages/contracts`.

---

## 3. Step-by-Step Implementation Plan (MVP)

### Step 1 — Define Shared Contracts (orchestrator)

- Create `packages/contracts/src/customer-portal.ts` with Zod schemas for:
	- `Customer`, `Project`, `EstimateLineItem`, `Estimate`, `Contract`,
		`PaymentScheduleEntry`, `PaymentRecord`, `ProjectInvite`,
		`BankDetails`.
- Define request/response contracts for:
	- `AdminCreateProjectRequest/Response`
	- `AdminCreateEstimateRequest/Response`
	- `AdminInviteClientRequest/Response`
	- `VerifyInviteResponse`
	- `PortalProjectOverviewResponse`
	- `PortalEstimateResponse`
	- `PortalAcceptEstimateRequest/Response`
	- `PortalContractResponse`
	- `PortalAcceptContractRequest/Response`
	- `PortalPaymentsResponse`

### Step 2 — Design D1 Schema & Migrations (database-architect)

- In `packages/db`:
	- Define tables with Drizzle:
		- `users` (Better Auth)
		- `customers` (business-level customer info, FK to `users` where needed)
		- `projects`
		- `estimates`, `estimate_line_items`
		- `contracts`
		- `payment_schedule_entries`
		- `payment_records`
		- `bank_details`
		- `project_invites`
	- Generate migrations via Drizzle.
	- Use the D1 manager skill to apply migrations to local/staging DBs.
	- Seed:
		- One `bank_details` row
		- Optional demo customer/project for QA

### Step 3 — Expose Typed DB Helpers (database-architect)

- Implement repository functions, e.g.:
	- `createCustomerWithUser`
	- `createProject`
	- `createEstimateWithLines`
	- `getProjectByIdForUser`
	- `getPortalProjectOverview`
	- `getEstimateForProject`
	- `acceptEstimate`
	- `getContractForProject`
	- `acceptContract`
	- `getPaymentsForProject`
	- `createProjectInvite`, `findInviteByToken`, `markInviteUsed`
- Ensure return types align with Zod contracts in `packages/contracts`.

### Step 4 — Configure Better Auth (backend-engineer)

- In `packages/auth`:
	- Configure Better Auth for Cloudflare Workers:
		- Adapt user model to `users` table in D1 via Drizzle.
		- Configure session cookies suitable for Workers (secure, HTTP-only).
	- Export:
		- `getAuthContext(ctx)` helper for Hono routes.
		- Middleware to require authenticated user and attach `userId`.
- Bind required secrets & env vars in `wrangler.toml`:
	- `BETTER_AUTH_SECRET`
	- DB binding for D1

### Step 5 — Hono App & Middleware (backend-engineer)

- In `apps/server`:
	- Set up root Hono app:
		- Global error handler
		- CORS
		- JSON body parsing
	- Add auth middleware:
		- `requireAdmin` for `/admin/**`
		- `requireUser` for `/portal/**`
	- Attach DB and Better Auth context to `ctx` via bindings.

### Step 6 — Admin APIs (backend-engineer)

Implement admin endpoints (all `requireAdmin`):

1. `POST /admin/customers`
	- Body: `AdminCreateCustomerRequest`
	- Creates Better Auth user + `customers` row.

2. `POST /admin/projects`
	- Body: `AdminCreateProjectRequest` (includes `customerId`)
	- Creates `projects` row.

3. `POST /admin/projects/:projectId/estimates`
	- Body: `AdminCreateEstimateRequest` (includes line items).
	- Creates `estimates` + `estimate_line_items`.

4. `POST /admin/projects/:projectId/invite`
	- Body: `AdminInviteClientRequest` (or empty if project already linked to a
		customer with user).
	- Generates a secure token and `project_invites` row.
	- Sends email with magic link (stub or integration).

5. `POST /admin/projects/:projectId/payments`
	- Body: payment details.
	- Inserts `payment_records` and updates schedule status.

### Step 7 — Magic-Link Verification (backend-engineer)

1. `GET /portal/verify/:token`
	- Public endpoint.
	- Flow:
		- Lookup invite by token; ensure `pending` and not expired.
		- Load associated user and project.
		- Create Better Auth session for user.
		- Mark invite as `used`.
		- Redirect to frontend route:
			- e.g. `/portal/projects/:projectId` (marketing app URL).
		- On invalid/expired:
			- Return structured error JSON or an error page.

### Step 8 — Portal User APIs (backend-engineer)

All these use `requireUser` and ensure the user is allowed to access
the requested `projectId` (via `getProjectByIdForUser`).

1. `GET /portal/projects/:projectId`
	- Returns `PortalProjectOverviewResponse`:
		- Project summary, status, phase.
		- Key dates and next actions.
		- Flags: `hasEstimate`, `hasAcceptedEstimate`,
			`hasContract`, `hasSignedContract`,
			`hasOutstandingDeposit`, etc.

2. `GET /portal/projects/:projectId/estimate`
	- Returns `PortalEstimateResponse` with:
		- Estimate header, line items, totals, notes, status.

3. `POST /portal/projects/:projectId/estimate/accept`
	- Body: `PortalAcceptEstimateRequest` (name, confirmation flag).
	- Validates with Zod.
	- Records acceptance, IP, timestamp.
	- Returns updated `PortalEstimateResponse`.

4. `GET /portal/projects/:projectId/contract`
	- Returns `PortalContractResponse`:
		- Contract body, version, status (draft/signed),
			and any links to PDFs.

5. `POST /portal/projects/:projectId/contract/accept`
	- Body: `PortalAcceptContractRequest` (name, confirmation flag).
	- Records acceptance, IP, timestamp; stores immutable snapshot.

6. `GET /portal/projects/:projectId/payments`
	- Returns `PortalPaymentsResponse`:
		- Payment schedule entries.
		- Payments recorded.
		- Current balance.
		- Bank details text for display.

### Step 9 — Data Integrity & Indexes (database-architect)

- Add indexes on:
	- `project_invites.token`
	- `projects.customer_id`
	- `estimates.project_id`
	- `contracts.estimate_id`
	- `payment_records.project_id`
- Confirm referential integrity rules and cascading/deletion strategy.

### Step 10 — QA & Handoff (orchestrator)

- Verify each API against Zod contracts and this spec.
- Cross-check that all flows in `customer_portal_plan.md` MVP section are covered.
- Produce a short **Frontend Integration Guide** referencing the API spec
	below for the frontend team.

---

## 4. OpenAPI 3.1 Specification (Draft)

> This is a high-level OpenAPI spec for the MVP backend.  
> Paths are relative to the `apps/server` origin.

```yaml
openapi: 3.1.0
info:
  title: Cornwall Ponds - Customer Portal API
  version: 0.1.0
  description: >
    Backend API for the customer portal MVP, using Better Auth for
    authentication and Cloudflare D1 (Drizzle) for persistence.

servers:
  - url: https://api.cornwall-ponds.example.com
    description: Production
  - url: http://localhost:8787
    description: Local development

components:
  securitySchemes:
    sessionCookie:
      type: apiKey
      in: cookie
      name: session

  schemas:
    Id:
      type: string
      format: uuid

    Customer:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        name:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        billingAddress:
          type: string
      required: [id, name, email]

    Project:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        customerId:
          $ref: '#/components/schemas/Id'
        title:
          type: string
        siteAddress:
          type: string
        status:
          type: string
          enum: [design, scheduled, in_progress, completed]
        phase:
          type: string
        createdAt:
          type: string
          format: date-time
      required: [id, customerId, title, status, createdAt]

    EstimateLineItem:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        description:
          type: string
        quantity:
          type: number
        unitPrice:
          type: number
        subtotal:
          type: number
      required: [id, description, quantity, unitPrice, subtotal]

    Estimate:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        projectId:
          $ref: '#/components/schemas/Id'
        status:
          type: string
          enum: [draft, sent, accepted, declined]
        validUntil:
          type: string
          format: date
        notes:
          type: string
        subtotal:
          type: number
        tax:
          type: number
        total:
          type: number
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/EstimateLineItem'
      required:
        - id
        - projectId
        - status
        - total
        - lineItems

    Contract:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        projectId:
          $ref: '#/components/schemas/Id'
        estimateId:
          $ref: '#/components/schemas/Id'
        version:
          type: integer
        body:
          type: string
        status:
          type: string
          enum: [draft, signed]
        signedAt:
          type: string
          format: date-time
        signedByName:
          type: string
      required: [id, projectId, estimateId, version, body, status]

    PaymentScheduleEntry:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        projectId:
          $ref: '#/components/schemas/Id'
        label:
          type: string
        dueAmount:
          type: number
        dueDate:
          type: string
          format: date
        status:
          type: string
          enum: [pending, due, paid]
      required: [id, projectId, label, dueAmount, status]

    PaymentRecord:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        projectId:
          $ref: '#/components/schemas/Id'
        amount:
          type: number
        date:
          type: string
          format: date
        method:
          type: string
        reference:
          type: string
      required: [id, projectId, amount, date]

    BankDetails:
      type: object
      properties:
        accountName:
          type: string
        accountNumber:
          type: string
        sortCode:
          type: string
        iban:
          type: string
        bicSwift:
          type: string
        instructions:
          type: string

    ProjectInvite:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        userId:
          $ref: '#/components/schemas/Id'
        projectId:
          $ref: '#/components/schemas/Id'
        token:
          type: string
        status:
          type: string
          enum: [pending, used, expired]
        expiresAt:
          type: string
          format: date-time
      required: [id, userId, projectId, token, status]

    PortalProjectOverviewResponse:
      type: object
      properties:
        project:
          $ref: '#/components/schemas/Project'
        hasEstimate:
          type: boolean
        hasAcceptedEstimate:
          type: boolean
        hasContract:
          type: boolean
        hasSignedContract:
          type: boolean
        hasOutstandingDeposit:
          type: boolean

    PortalPaymentsResponse:
      type: object
      properties:
        schedule:
          type: array
          items:
            $ref: '#/components/schemas/PaymentScheduleEntry'
        payments:
          type: array
          items:
            $ref: '#/components/schemas/PaymentRecord'
        bankDetails:
          $ref: '#/components/schemas/BankDetails'

paths:
  /admin/customers:
    post:
      summary: Create a customer and associated auth user
      tags: [admin]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
                phone:
                  type: string
              required: [name, email]
      responses:
        '201':
          description: Customer created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'

  /admin/projects:
    post:
      summary: Create a project for a customer
      tags: [admin]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                customerId:
                  $ref: '#/components/schemas/Id'
                title:
                  type: string
                siteAddress:
                  type: string
              required: [customerId, title]
      responses:
        '201':
          description: Project created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'

  /admin/projects/{projectId}/estimates:
    post:
      summary: Create an estimate for a project
      tags: [admin]
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                validUntil:
                  type: string
                  format: date
                notes:
                  type: string
                lineItems:
                  type: array
                  items:
                    type: object
                    properties:
                      description:
                        type: string
                      quantity:
                        type: number
                      unitPrice:
                        type: number
                    required: [description, quantity, unitPrice]
              required: [lineItems]
      responses:
        '201':
          description: Estimate created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Estimate'

  /admin/projects/{projectId}/invite:
    post:
      summary: Invite client to portal with magic link
      tags: [admin]
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      responses:
        '201':
          description: Invite created and email dispatched (or queued)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectInvite'

  /admin/projects/{projectId}/payments:
    post:
      summary: Record a payment for a project
      tags: [admin]
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                amount:
                  type: number
                date:
                  type: string
                  format: date
                method:
                  type: string
                reference:
                  type: string
              required: [amount, date]
      responses:
        '201':
          description: Payment recorded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaymentRecord'

  /portal/verify/{token}:
    get:
      summary: Verify a project invite token and establish a session
      tags: [portal]
      parameters:
        - name: token
          in: path
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect to project dashboard on success
        '400':
          description: Invalid or expired token

  /portal/projects/{projectId}:
    get:
      summary: Get project overview for portal
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      responses:
        '200':
          description: Project overview
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortalProjectOverviewResponse'

  /portal/projects/{projectId}/estimate:
    get:
      summary: Get estimate for a project in the portal
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      responses:
        '200':
          description: Estimate details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Estimate'

  /portal/projects/{projectId}/estimate/accept:
    post:
      summary: Accept the estimate for a project
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                confirm:
                  type: boolean
              required: [name, confirm]
      responses:
        '200':
          description: Estimate accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Estimate'

  /portal/projects/{projectId}/contract:
    get:
      summary: Get contract for a project in the portal
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      responses:
        '200':
          description: Contract details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Contract'

  /portal/projects/{projectId}/contract/accept:
    post:
      summary: Accept the contract for a project
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                confirm:
                  type: boolean
              required: [name, confirm]
      responses:
        '200':
          description: Contract accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Contract'

  /portal/projects/{projectId}/payments:
    get:
      summary: Get payment schedule and bank details for a project
      tags: [portal]
      security:
        - sessionCookie: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            $ref: '#/components/schemas/Id'
      responses:
        '200':
          description: Payment overview
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortalPaymentsResponse'
```

