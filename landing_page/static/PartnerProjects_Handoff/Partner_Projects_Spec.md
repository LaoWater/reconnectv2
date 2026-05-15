# Partner Projects — Section Spec (Handoff)


LOGOS prepared for your discretion at:  landing_page/static/PartnerProjects_Handoff/images

> Brief for the engine building the **Partner Projects** section. Self-contained — read top to bottom and you have everything you need.

---

## 1. What we're adding

A new section on the website, placed **immediately underneath the existing YouTube video**, that surfaces four sibling projects sharing the same philosophy and (part of the) team. The section is a **sliding carousel** of four cards. One of the four (the therapy platform) carries a short call-to-action with a discount code.

### Section title

- **English:** Partner Projects
- **Romanian:** Proiecte Partener *(use this label if the host site is Romanian-first; otherwise use the English label)*

### Optional intro line (one sentence, sits between the title and the carousel)

> "Projects walking the same path — built by overlapping hands, under the same compass."

If the host site's voice prefers no intro, drop the line entirely. Do not pad it.

---

## 2. The four projects

The cards appear in this order. Each card shows: **logo**, **project name**, **one-line description**, and a **link** to the live site. The therapy card additionally shows the **RECONNECT** code CTA. The BodyOS card additionally shows a smaller **"in partnership with Kinetomed"** mark.

### Card 4 — TAP (Command at Rest)
- **Logo file:** `images/tap-logo.png`
- **Link:** https://www.tap-device.com/
- **Description (verbatim):**
  > A wooden Bluetooth bracelet for engineers supervising AI agents. Step away from the keyboard; let the wrist do the approving.

### Card 2 — Creator's Multiverse
- **Logo file:** `images/creators-multiverse-logo.png`
- **Link:** https://creators-multiverse.com/
- **Description (verbatim — confirm with Lao before launch):**
  > A home for creators to grow a presence across every channel without losing the thread of who they are.

> ⚠️ **LAO_CONFIRM:** The description above is a placeholder cast from the project's public framing. Replace with Lao's preferred one-liner before launch.

### Card 3 — BodyOS *(launching soon)*
- **Logo file:** `images/bodyos-logo.png`
- **Partner mark:** `images/kinetomed-logo.png` — rendered smaller, set apart from the BodyOS logo with a thin "in partnership with" label or a hairline divider. Both marks live on the same card.
- **Link:** https://bodyox.ey.r.appspot.com/
- **Description (verbatim — confirm with Lao before launch):**
  > An operating system for the body — biomechanics, movement, and tension surfaced at the level of fascia and joint. Built in partnership with Kinetomed.
- **Status label:** A small "Launching soon" pill, matched to the host site's voice (no exclamation marks, no neon).

> ⚠️ **LAO_CONFIRM:** The description above is a placeholder. Replace with Lao's preferred one-liner before launch.

### Card 1 — Terapie Acasa (Therapy Access)
- **Logo file:** `images/therapy-access-logo.png`
- **Link:** https://terapie-acasa.ro/
- **Description (verbatim):**
  > A Romanian mental-health platform connecting people with 300+ certified therapists. In production since 2024.
- **CTA (this card only):**
  > Use code **`RECONNECT`** for your first session — on us.

The code `RECONNECT` should be visually distinct (monospace, subtle background tint, or a soft pill) so a reader scanning the card lands on it without effort. Keep it copyable on click if the host site has the affordance.

---

## 3. Carousel behavior

### Required

- **Four cards**, equal weight. No "hero" card.
- **Sliding** transition between cards (horizontal translate, not fade).
- **Auto-advance** every ~6 seconds, pausing on hover/focus.
- **Manual controls:** prev/next affordances + dot indicators (four dots). Keep them text-based or hairline-stroke, not chunky chrome buttons (the host site's visual voice rejects generic UI furniture).
- **Loops** infinitely (after card 4, returns to card 1).
- **Responsive:**
  - **≥ 1280px:** two cards visible at a time, sliding one card per advance. Active pair at 100% opacity; the off-screen neighbors hint at ~30% opacity at the edges to telegraph that more cards exist.
  - **768–1279px:** one card visible at a time, full width of the content column.
  - **< 768px:** one card visible at a time, full width with comfortable horizontal padding. Dot indicators remain visible; prev/next controls can collapse into a single swipe affordance if the host site supports it.

### Accessibility

- Each card is a single focusable region with the link as its primary action.
- Carousel exposes `aria-roledescription="carousel"`, controls have visible focus rings, auto-advance pauses on focus or when `prefers-reduced-motion` is set.
- Logos carry meaningful `alt` text (the project name, not "logo").

### Don't

- No parallax. No 3D flip. No video backgrounds. No marquees.
- No "Learn more →" buttons unless the host site already uses that pattern — the whole card is the link.

---

## 4. Visual voice

The host site (whichever of the three is going live first) carries a **contemplative, paper-feeling** aesthetic. The carousel must inherit it:

- **Card background:** paper/cream tone with a hairline border, not a hard shadow.
- **Typography:** match the host site's display + body pairing. Do not introduce a new font for this section.
- **Logo treatment:** centered with generous padding; never stretched. If a logo is delivered as a wide lockup and another as a square mark, the carousel should still feel level — let whitespace do the balancing.
- **Color:** restraint. The cards do not need to compete with one another or with the YouTube video above them.

If the host site is the TAP site (`1st_Iteration/`), the relevant tokens are `paper-cream` / `paper-beige` for backgrounds and `Fraunces` (display) / `Newsreader` (body) for type. Do not introduce Inter.

---

## 5. Voice constraints (apply to all copy in this section)

These are Lao's standing rules and override any default marketing instinct:

- **No startup-pitch vocabulary.** Avoid "paradigm shift," "disruptive," "category-defining," "game-changing."
- **No founder-CEO framing.** These are projects walking a path, not vehicles for a payout.
- **Long, contemplative sentences are welcome** when they earn their length. Short ones are fine too. Salesy ones aren't.
- **"LaoWater" is intentional** wherever it appears in attribution — not a typo for "Lower."

---

## 6. Asset delivery

- Logos will be dropped into `./images/` using the filenames specified above. See `images/README.md` for format guidance.
- Lao is supplying the logos directly; do not generate placeholders or pull from external sources.
- If a logo is missing at build time, render the card with the project name set in the display typeface (no broken-image icon, no "logo coming soon" text).

---

## 7. Placement on the page

- The section sits **directly below the YouTube video** on the host page.
- A thin separator (hairline rule or generous vertical whitespace — match the host site's existing rhythm) introduces it.
- The section anchor id should be `#partner-projects`. Add a nav entry only if the host site's nav already includes secondary sections; otherwise leave it out.

---

## 8. Open questions for Lao before launch

1. **Creator's Multiverse description** — placeholder pending. (See Card 2.)
2. **BodyOS description** — placeholder pending. (See Card 3.)
3. **Romanian vs. English label** — which host site is this landing on first? The label choice follows from that.
4. **CTA target** — should the `RECONNECT` code CTA link to a specific landing page on terapie-acasa.ro, or to the site root?
5. **Order** — current order is TAP → Creator's Multiverse → BodyOS → Therapy (engineering → creative → body → mind). Is that intentional, or should the therapy card lead since it carries the active CTA?
6. **Kinetomed partner mark** — is the "in partnership with" framing on the BodyOS card the right register, or should it read differently (e.g., "with Kinetomed")?

---

## 9. Definition of done

- Four cards render with the correct logos, names, descriptions, and links.
- The therapy card shows the `RECONNECT` CTA with the code visually distinct.
- The BodyOS card shows the Kinetomed partner mark and a "Launching soon" status label.
- Carousel auto-advances, loops, pauses on hover/focus, respects `prefers-reduced-motion`.
- Keyboard navigation works; focus rings are visible; alt text is meaningful.
- The section visually belongs to the host site — no chrome, no generic widgets.
- Lao has confirmed the Creator's Multiverse description and the four open questions above.
