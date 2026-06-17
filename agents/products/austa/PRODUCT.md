# Austa

Last verified: 2026-06-12 (homepage). Recheck austa.in before publishing pricing or claims.

## Snapshot

- Product name: austa (lowercase wordmark)
- Website: https://austa.in
- One-liner: Instagram automation for creators. One flat plan. Unlimited everything.
- Site title pairs the wordmark with "Instagram automation that reads like a magazine".
- Founder relationship: the user is the founder; treat this as primary product context.
- Local repo: `~/code/austa` (see its AGENTS.md, PROJECT.md, and plan.md for current engineering state)
- Billing: subscriptions (UPI, cards, wallets, netbanking)

## What it does

- Comment-to-DM automation with a follow gate: anyone who comments a keyword on a creator's post gets a DM with the creator's link, but only after they follow.
- Hero: "Turn every comment into a follower."
- One-sentence version from the site: "You write the post. We answer the rest."
- Positioning: the fairest comment-to-DM funnel on Instagram. One flat price. No tiers, no caps, no asterisks.
- Sign-in: "Sign in with Instagram."

## Pricing (observed 2026-06-12)

- Single plan: ₹499/month, or ₹4,999/year (save two months).
- Unlimited messages, no usage caps, no add-ons, no upsell.
- 7-day full-refund cancellation window.
- "By the numbers" framing on site: 1 flat plan, unlimited messages, 1 template, 7-day refund.

## Brand and voice

- Editorial magazine concept: folio line ("Vol. I · Issue 01" plus date), numbered sections (01 The Brief, 02 Inside this issue, 03 By the numbers, 04 Subscription card), page marks like "PG · 01".
- Fonts: Fraunces, Instrument Serif, Geist Mono.
- Theme: light `#f7f9fd`, dark `#070b16`, vermillion accent. Light/dark/system toggle.
- Voice: plain, warm, a little literary, confident. Short declarative sentences. Footer sign-off: "Crafted with Love."
- No growth-hack hype. No em dashes in new copy (site headline styling is the one legacy exception; do not add more).

## Stack

Stack, infra, runtime versions, and repo layout are not documented in this public pack. They live in `~/code/austa` (`AGENTS.md`, `PROJECT.md`, `plan.md`). Read those before any code work. Product-level facts to know: Instagram login plus comment-to-DM automation is webhook driven, and Instagram API rate-limit and permission rules apply.

## Assets

- Logo and brand exports belong in `assets/` next to this file.
- Live references: `austa.in/favicon.svg`, `austa.in/og-image.png`. Design sources live in `~/code/austa/design`.

## Usage guidance for agents

- Read this pack plus `~/code/austa/PROJECT.md` before product work.
- Do not invent capabilities, pricing, or policy. Verify against austa.in and the repo.
- Keep all copy in the magazine voice and keep the flat-plan promise (no tiers, no caps) intact in every piece of marketing.
