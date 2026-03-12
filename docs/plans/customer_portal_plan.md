# Customer Portal — Pond Design & Build

> **Roles:** orchestrator · product-owner  
> **Date:** 2026-03-12  
> **Status:** Draft — Customer portal concept

---

## Why a Customer Portal?

- **Trust & professionalism**  
	- Central, branded space for all project details instead of scattered emails.  
	- Clear scope, pricing, and contract terms to reduce misunderstandings and disputes.

- **Reduced admin & smoother communication**  
	- Fewer repetitive questions about estimates, schedules, and balances.  
	- Clients can self-serve: view/download estimates, contracts, and project info.

- **Faster approvals & payments**  
	- Digital acceptance for estimates and contracts with timestamped records.  
	- Bank/payment details always available, with room to add online payments later.

- **Better client experience**  
	- Premium feel: project photos, progress notes, and key documents in one place.  
	- Reduces anxiety by giving clients a clear view of where their project stands.

---

## Portal Users & Permissions

- **Customer**  
	- Views only their own project(s).  
	- Can review/accept estimates and contracts.  
	- Can see payment schedule and bank details.  
	- Optional: upload photos/docs and send messages.

- **Admin / Team**  
	- Creates and manages customers and projects.  
	- Generates estimates and contracts.  
	- Updates project status and notes.  
	- Records payments and reconciles balances.

---

## Main Customer-Facing Areas

### 1. Dashboard

- **Purpose:** One-glance overview of a client’s relationship with Cornwall Ponds.  
- **Content:**  
	- Active project cards with current phase (e.g. Design, Permitting, Excavation, Planting).  
	- Outstanding actions: “Review estimate”, “Sign contract”, “Pay deposit”.  
	- Quick links to project details, documents, and payment instructions.

### 2. Project Details

- **Purpose:** Single source of truth for each project.  
- **Content:**  
	- Project summary: pond type, size, depth, filtration, lighting, landscaping.  
	- Site address and key dates (site visit, start date, target completion).  
	- Timeline view of milestones and status (e.g. Survey → Design → Build → Handover).  
	- Files: design drawings, 3D renders, permits, photo gallery.  
	- Notes/updates from the team (e.g. delays, changes, scheduling notes).

### 3. Estimates & Change Orders

- **Purpose:** Transparent presentation of pricing and scope, with easy approval.  
- **Features:**  
	- List of estimates with status: Draft, Sent, Accepted, Declined.  
	- Each estimate shows line items, quantities, unit prices, taxes, and totals.  
	- Clear notes and assumptions (e.g. access constraints, electrical work by others).  
	- Valid-until date and payment schedule summary.  
	- “Accept estimate” button with confirmation and digital acceptance (name, checkbox).

### 4. Contracts & Legal Documents

- **Purpose:** Formalize agreement aligned to the accepted estimate.  
- **Content:**  
	- Main design/build contract linked to a specific project + estimate.  
	- Sections for scope, exclusions, access, change orders, warranties, payment terms,  
		cancellations, and liability.  
	- Digital acceptance flow: scroll-through terms, “I have read and agree” checkbox,  
		typed name and date, optional signature pad.  
	- Generated PDF of the signed contract available for download by both parties.  
	- Version history when contracts are revised and re-accepted.

### 5. Payments & Bank Details

- **Purpose:** Make it clear what is owed, when, and how to pay.  
- **Content:**  
	- Payment schedule per project (e.g. 30% deposit, 40% mid-build, 30% on completion).  
	- Current balance, payments received, and upcoming/overdue amounts.  
	- Bank account details for transfers: account name, IBAN/account number, sort code,  
		BIC/SWIFT, reference instructions.  
	- Notes around timings (e.g. “Please allow 2–3 working days for transfers to clear”).  
	- Future-ready placeholder for online payments (card/ACH) without changing UX.

### 6. Messages & Updates (Optional MVP+)

- **Purpose:** Lightweight channel for project-related communication.  
- **Content:**  
	- Per-project message thread or read-only update feed.  
	- Ability for admin to attach photos and documents to updates.  
	- Optional ability for customer to reply or upload images (e.g. site conditions).

---

## Core Data Model (Conceptual)

- **Customer**  
	- id, name, email, phone  
	- billing address, portal login details  
	- relationship notes (e.g. preferred contact method)

- **Project**  
	- id, customerId  
	- title (e.g. “Smith — 20,000L koi pond”)  
	- site address, description, status, phase  
	- attributes: size, depth, filtration system, lighting, waterfalls, planting scheme

- **Estimate**  
	- id, projectId  
	- line items: description, quantity, unit price, subtotal  
	- taxes, discounts, total, currency  
	- notes/assumptions, validUntil date  
	- status: draft, sent, accepted, declined  
	- acceptedBy, acceptedAt, acceptanceIp

- **Contract**  
	- id, projectId, estimateId  
	- contractBody (HTML/markdown)  
	- version, createdAt  
	- acceptedBy, acceptedAt, acceptanceIp  
	- signedPdfUrl (snapshot of what was accepted)

- **Payment Schedule Entry**  
	- id, projectId  
	- label (e.g. “Deposit”, “On Completion”)  
	- dueAmount, dueDate (or trigger condition)  
	- status: pending, due, paid

- **Payment Record**  
	- id, projectId  
	- amount, date, method (bank transfer, card, etc.)  
	- reference, notes  
	- reconciledScheduleEntryId (optional link to a schedule item)

- **Bank Details (Global Config)**  
	- id  
	- accountName, accountNumber/IBAN, sortCode, bicSwift  
	- instructions for payment references

- **Project Invite (Token-Based Access)**  
	- id  
	- userId (FK to Customer/user account)  
	- projectId (FK to Project)  
	- token (random, unique string)  
	- status: pending, used, expired  
	- expiresAt (optional, e.g. 7 days from creation)  
	- createdAt, usedAt

---

## Security, Audit, and Compliance Considerations

- **Access control**  
	- Customers can only see their own projects and documents.  
	- Admin accounts have full or role-based access across all projects.

- **Sensitive information**  
	- Store bank details securely and render them read-only in the portal UI.  
	- Enforce HTTPS for all portal traffic.  
	- Avoid sending full bank details in plain-text emails.

- **Audit trail**  
	- Log views and acceptances of estimates and contracts.  
	- Keep an immutable snapshot of accepted estimates/contracts (versioned content).  
	- Record IP, timestamp, and user identity at acceptance points.

- **Legal review**  
	- Contract text and acceptance flow should be reviewed by legal counsel in the  
		relevant jurisdiction.  
	- Ensure wording covers digital acceptance and electronic signatures where needed.

---

## MVP Plan

### MVP Scope

- **Goal:** Deliver a complete end-to-end experience for one project per client:  
	estimates → contract → payment instructions → basic status tracking.
- **Included features:**  
	- Auth via invite-based magic link (no full account management yet).  
	- Dashboard, project details, estimates, contracts, payments.  
	- Admin tools to create customers, projects, estimates, contracts, and invites.  
	- Basic audit trail on estimate/contract acceptance.

### MVP Auth & Access Workflow (Improved)

For MVP, prefer a **frictionless, invite-first flow**. Clients do not need to  
create a password up front; they receive a secure magic link from the team.

1. **Admin creates customer and project**  
	- Enter customer details (name, email, phone).  
	- Create a project with core attributes and initial status (e.g. “Design”).

2. **Admin creates estimate for project**  
	- Add line items and totals.  
	- Define payment schedule entries based on total.  
	- Save and mark estimate as “Sent”.

3. **Admin invites client (Project Invite)**  
	- In the admin UI, click **“Invite client to portal”** on the project.  
	- System creates a `ProjectInvite` record with: userId, projectId, token,  
		expiresAt, status=pending.  
	- System sends a **“Welcome to your project portal”** email with a one-time  
		magic link: `/portal/verify/[token]`.

4. **Customer accesses portal via magic link**  
	- Customer clicks the magic link.  
	- Backend validates token, checks expiry and status, and resolves user + project.  
	- On success, system:  
		- Marks invite as `used`.  
		- Creates a logged-in session (cookie) for that user.  
		- Redirects straight to the project dashboard.  
	- On failure (invalid/expired), show a friendly error and a contact option.

5. **Customer reviews and accepts estimate**  
	- From the dashboard, client opens the estimate.  
	- Reviews pricing, scope, and assumptions.  
	- Clicks “Accept estimate”, confirms, and provides digital acceptance details  
		(name and confirmation checkbox).  
	- System timestamps acceptance, records IP, and updates estimate status.

6. **Contract is generated and accepted**  
	- Contract view pulls in project + estimate details and static legal text.  
	- Customer reads terms, checks “I agree”, and types their name to sign.  
	- System stores an immutable version of the contract and generates a PDF.

7. **Payment instructions are shown**  
	- Portal highlights deposit amount and due date based on the payment schedule.  
	- Displays bank details and reference instructions from global config.  
	- Optional (MVP): customer can mark “Transfer sent” for admin to verify.

8. **Project status updates**  
	- Admin manually updates project phase as work progresses.  
	- Key updates surface on the project details page for the customer.

### MVP Technical Notes (Tokens)

- **Token generation:**  
	- Use a cryptographically secure random token (sufficiently long and unique).  
	- Store only the token (or a hash of it) plus expiry in `ProjectInvite`.

- **Verification endpoint:**  
	- `GET /portal/verify/[token]`  
	- Looks up active invite; if found, establishes a session and redirects to the  
		project dashboard.  
	- If not found/expired, shows an explanatory error and contact path.

- **Sessions:**  
	- After first magic-link access, session behaves like a normal logged-in user.  
	- A more traditional email/password login and “My projects” list can be added  
		later (Extended Plan).

---

## Extended Plan (Nice-to-Have)

### Extended Client Onboarding Workflow

This layer adds the **self-service signup** you described, on top of the MVP.

1. **Phase 1 — Client registers account**  
	- Client visits the site and creates a standard account (email/password).  
	- State: client has an account but no project yet.  
	- They see a simple dashboard: “Your project hasn’t started yet. Contact our  
		team to begin your design.”

2. **Phase 2 — Admin connects project to existing user**  
	- After an in-person/phone consultation, admin creates a new Project.  
	- Admin selects the existing user from a dropdown and links them to the project.  
	- Clicking “Invite client” generates a `ProjectInvite` and sends the magic link  
		email (as per MVP).

3. **Phase 3 — Magic link email (enhanced copy)**  
	- **Subject:** “Your Pond Project Is Live” (no emoji in production subject).  
	- **Body (example):**  
		- Greeting by name.  
		- Short explanation: “Your personal design portal is ready. You can now  
			view your design outline, review the initial estimate, and track progress  
			from first sketch to final fill.”  
		- Primary button: “Access your project dashboard” → `/portal/verify/[token]`.

### Extended Admin “Invite” Dashboard

- **Purpose:** Give the team clear visibility of client portal status per project.  
- **Features:**  
	- Status badges next to each project:  
		- 🔴 Not invited — no `ProjectInvite` exists.  
		- 🟡 Invite sent — invite exists, not yet used (status=pending).  
		- 🟢 Active — client has used the invite and has logged in.  
	- Columns for: last invite sent at, last client access time, and actions  
		(resend invite, revoke invite, copy invite link).

### Extended UX & Communication

- **Account management:**  
	- After first magic-link access, allow clients to optionally set a password  
		and use a standard login form for future visits.  
	- Add “Forgot password” and “Send me a new access link” flows.

- **Notifications:**  
	- Email notifications when:  
		- A new estimate is available.  
		- A contract is ready to sign.  
		- A payment is recorded or becomes overdue.  
		- A major project status change occurs (e.g. “Build scheduled”, “Completed”).

- **Messaging (enhanced):**  
	- Upgrade from simple update feed to a two-way message thread per project.  
	- Optional email digests summarising new messages and status changes.

- **Multi-project support:**  
	- For repeat clients, allow multiple active or historical projects under one  
		account, each with its own dashboard card and history.

---

## Integration with Existing Site

- Add a **“Client login”** or **“Customer portal”** link in the main navigation.  
- Reference the portal on public marketing pages as a trust and experience benefit  
	(e.g. “Track your pond project, review estimates, and sign contracts in your  
	own secure client portal.”).  
- Initial deployment can be read-only for some sections (e.g. messages) while the  
	estimate/contract/payment flow is validated with early clients.

