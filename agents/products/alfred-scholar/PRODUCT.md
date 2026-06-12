# Alfred Scholar

Last verified: 2026-05-31 (site), 2026-06-12 (engineering notes). Recheck alfredscholar.com before publishing pricing or claims.

## Snapshot

- Product name: Alfred Scholar (compact spelling the founder uses: AlfredScholar)
- Website: https://www.alfredscholar.com
- One-liner: The calm research workspace for scholars who would rather be thinking.
- Founder relationship: the user is the founder; treat this as primary product context.
- Local repo: `~/code/alfredscholar` (Laravel; follow its own AGENTS.md/CLAUDE.md for code work)
- Analytics: PostHog, organization "Alfred Scholar"
- Billing: Razorpay subscriptions, workspace-level

## Mission and positioning

- Founder mission, in his own words: "I want to make world class research workflow and provide it to every researcher on planet in affordable price."
- Marketing-ready phrasing: a world-class research workflow, affordable for every researcher on the planet.
- Two pillars to weave into copy: (1) world-class research workflow quality, (2) affordability and accessibility for every researcher globally.
- Primary positioning since June 2026: "The calm research workspace for scholars who would rather be thinking." Lead with calm, focus, and thinking. AI is the quiet machinery underneath, never the headline.
- Retired positioning: "An AI research workspace for PhD scholars." Do not use "AI research workspace" as the primary label in new marketing copy.
- Tone: calm over hype, thinking over tooling, substance over AI buzzwords. The product removes busywork so scholars can think.
- No em dashes in any Alfred Scholar content.

## What it does

An academic research platform that puts the whole research workflow in one workspace: document library, AI document chat with page citations, citation management, manuscript writing, peer review, plagiarism checks, and collaboration.

## Core product areas

- Research Library: upload, organize, annotate, and search PDF research papers. PDFs are indexed for library-wide search.
- AI Chat: ask natural language questions about uploaded papers and get answers grounded in source documents with page citations like `[p.12]`.
- Citations: import BibTeX and RIS, auto-extract references from PDFs, look up DOIs, export in APA, MLA, Chicago, IEEE, Harvard, Vancouver, and more.
- Manuscripts: write academic papers in a rich-text editor with auto-save, citation insertion, tables, images, and submission guideline support.
- Peer Reviews: share manuscripts with reviewers, collect structured feedback, manage review cycles.
- Plagiarism Check: run similarity checks before submission.
- Collaboration: workspaces, colleague and reviewer invites, shared research work.

## Target users

PhD candidates and graduate students, postdoctoral researchers, research teams and labs, lab directors, faculty professors, independent scholars, research assistants.

## PhD student use cases

- Literature reviews: upload papers, compare methodologies, summarize findings, identify gaps with cited answers.
- Thesis writing: drafts with auto-save, word count tracking, citation support, submission guideline validation.
- Citation management: import existing BibTeX or RIS libraries, extract references from PDFs, format citations.
- Pre-submission checks: plagiarism checks before committee or journal submission.
- Advisor collaboration: share workspaces and manuscripts with advisors, colleagues, reviewers.
- Reading and annotating: read papers in the browser, highlight passages, add notes, review highlights.

## AI chat details

- Users upload PDFs, ask questions in plain English, and get cited answers.
- Semantic plus full-text hybrid search across uploaded documents.
- Every claim should be traceable to source material with inline page citations.
- Cross-document answers compare methodologies, findings, theoretical frameworks, limitations across a library.
- Conversation memory supports follow-up questions within a chat.

## Privacy and data positioning

- Research is scoped to the user's workspace; documents are private unless explicitly shared.
- Uploaded documents are not used to train AI models.
- Business model is subscriptions, not selling user data or mining research.
- Citation export available; broader export support described publicly as planned.

## Pricing (observed publicly, recheck before publishing)

- Free: ₹0/month, free forever, no card needed. 10 documents, 100 AI messages/month, Standard AI model, unlimited citations and manuscripts, 1 plagiarism check/month, BibTeX and RIS import, 1 peer reviewer, colleague invites, Zotero and Mendeley sync.
- Pro: ₹499/month or ₹4,999/year (₹417/month billed annually). Unlimited documents and AI messages, Advanced AI model, 5 plagiarism checks/month, all citation styles, 3 peer reviewers, Zotero and Mendeley sync, email support.
- Lab: ₹2,499/month or ₹24,999/year, flat rate for up to 10 seats (1 owner plus 9 colleagues). Everything in Pro, unlimited peer reviewers and plagiarism checks, Frontier AI model, shared workspaces, role-based access control, supervisor review workflow, WhatsApp priority support.

## Integrations and roadmap observed publicly

- Available or mentioned: BibTeX import/export, RIS import, Citation Constellation, Zotero sync, Mendeley sync, literature reviews.
- Roadmap or planned: Google Scholar, arXiv import, Overleaf export, Google Drive, real-time co-editing, research gap finder, paper comparisons, journal suggestions, DOCX and LaTeX support.

## Comparison pages on the site

Anara, Paperguide, SciSpace, NotebookLM, Humata, Jenni AI, Zotero, Mendeley, Elicit, Consensus.

## Engineering conventions

- Dev-seed data lives in env-guarded migrations, not just seeders. Example: `seed_demo_accounts` creates owner@alfredscholar.com / colleague / reviewer plus "Bhushan's Workspace"; `seed_demo_owner_pro_plan` (added 2026-06-12) puts that owner's workspace on an active Pro subscription, guarded with `if (app()->isProduction()) return;` so production billing state only ever comes from a real Razorpay subscription.
- These dev-seed migrations intentionally run in every non-production env, including `testing` (RefreshDatabase migrates all migrations). The test suite does not rely on demo accounts having a particular plan or on subscription row counts. Do not add the demo seeds to tests manually, and do not assume a clean subscriptions table in tests.
- Subscriptions are workspace-level. `Workspace::subscription()` is a `hasOne(...)->ofMany(['created_at' => 'max'], status in active/trialing/cancelled and not expired)`. To grant a plan, insert a `subscriptions` row for the workspace (plan/billing_cycle/status enums, amount_inr from `config/subscription.php`). Plans: none, pro, lab. Pricing source of truth is `config/subscription.php`.
- Idempotent data migrations use a fixed ULID in the demo `01knk0000000000000000000NN` series with `updateOrInsert`, and a `down()` that deletes by that id.

## Brand and assets

- Visible brand mark in public mockups: a simple `A` mark paired with the Alfred Scholar name. Recheck website assets before using or recreating the official logo.
- Logo exports, wordmarks, and social cards belong in `assets/` next to this file.

## Usage guidance for agents

- Read this pack before any Alfred Scholar work: code, copy, design, strategy, pricing, support.
- Prefer clear, founder-aware product language.
- Do not invent capabilities, pricing, policies, or roadmap items. Recheck the website before public copy, pricing, announcements, or marketing claims.
- Sources checked: homepage, /docs/v1.x/introduction, /pricing, /features/ai-chat, /for/phd-students, public search results.
