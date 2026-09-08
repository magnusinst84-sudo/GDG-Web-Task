# UI.md — Design Process & Visual Direction

## Starting State

The original UI had Tailwind classes stripped from most components, leaving
functional-but-illegible output: dark-on-dark text in the admin table and MailComposer
dialog, plain unstyled HTML (`<li>` lists, unstyled buttons) on the departments page and
application form, no visual hierarchy anywhere. Root cause found: `app/globals.css` was
missing the shadcn/Tailwind CSS custom-property definitions (`--background`,
`--foreground`, `--muted`, `--popover`, etc.) that many components' utility classes
(`text-muted-foreground`, `bg-popover`, `border-input`) depended on to render correctly.

## Direction Exploration

Rather than guessing at a single aesthetic, five distinct visual directions were
generated as reference mockups and compared before committing to one:

1. **Developer terminal/code aesthetic** — monospace-heavy, terminal green/amber
   accents, department cards styled like directories.
2. **Google/GDG-native Material identity** — Material Design 3 language, Google's
   four-color palette as accents. (Ultimately ruled out — conflicts with the decision to
   keep the org name/branding generic rather than visibly Google-affiliated.)
3. **Mission-control dashboard** — telemetry-style widgets, progress-stepper
   navigation, cyan/electric-blue accents.
4. **Warm/human counter-programming** — deliberately avoided the typical cold
   black-and-white SaaS look; warm charcoal base, amber/terracotta accent, rounder
   typography.
5. **Editorial magazine** — deep black background, bold asymmetric typography, subtle
   per-section colored gradient washes, pull-quote descriptions, minimal bordered
   buttons. **Selected direction.**

Within the editorial direction, five further sub-variations were explored to pressure-
test the concept before committing: polished magazine cover-story style, DIY/punk zine
style, minimalist Kinfolk-style, modern bento-grid hybrid, and structured newspaper
style. The polished magazine cover-story variant (large asymmetric typography, soft
colored gradient washes per section, pull-quote descriptions, minimal "Apply" buttons)
was the one that resonated and became the final direction.

**Reference mockup images are stored in `design-preference/`** at the project root —
these are the actual generated images compared during this process and served as the
visual source of truth (not just a text description) when implementing the real
components, since a written brief loses fidelity that an image reference doesn't.

The direction was also extended, as reference-only mockups, across every page (Hero,
NavBar, Footer, application form, admin dashboard) before implementation began, to
confirm the aesthetic held together as a coherent system rather than looking good on
one isolated page and falling apart elsewhere. The admin dashboard mockup in particular
was treated as the hardest test of the direction, since a data-dense table is the least
naturally "editorial" surface — the goal there was legible, functional data first,
editorial detailing (thin rule dividers, mono labels, colored tags) second.

## Constraints Enforced During Implementation

Every mockup reference contained content that could not be carried into the real
implementation, and this was treated as a hard rule throughout:

- **No fabricated statistics.** Reference mockups showed invented "X/Y openings" per
  department, "Total/Received/Shortlisted/Interviews" counts, and applicant "Score:
  X/100" — none of this exists in the real data model or app functionality. None of it
  was added. Where a real stats strip was added (e.g. total applicants, shortlisted
  count in the admin dashboard), the numbers are computed live from the actual fetched
  data (`applicants.length`, `.filter(a => a.shortlisted).length`), never hardcoded.
- **No fabricated features.** Mockups showed admin sidebar sections for "Users,"
  "Reports," "Settings," "Interviews" as separate pages — none of these exist as real
  functionality and none were built just because a mockup depicted them.
- **No GDG/Google branding.** Mockups (generated before this constraint was finalized)
  showed a "GDG VITC" wordmark and bracket-style logo mark. The organization is shown
  generically ("ORG" / "Recruitment Portal") throughout the real implementation, and no
  attempt was made to recreate a Google-style logo mark or use Google's brand colors as
  an identity element.
- **Real department data only.** All 12 real departments and their real descriptions
  (from `constants/index.js`) were used — mockups' invented department names/taglines
  were reference for visual *treatment* only, never copied as content.
- **Real copy, deliberately chosen.** The Hero mockup's headline ("Build More. Learn
  Deep. Make Impact.") was explicitly flagged as placeholder text from the mockup
  generator and NOT ported into the real app by default. Real headline copy options
  were workshopped separately and a final choice — "Learn Fast. / Build Together. /
  *Make Your Mark.*" — was deliberately selected and approved before implementation,
  rather than letting mockup placeholder text leak into production copy.

## What Was Implemented, Page by Page

- **NavBar**: bold wordmark-style org label, thin uppercase letterspaced nav links,
  thin bottom border divider (no heavy shadow/blur), small monospace live-clock badge,
  minimal bordered Sign In button.
- **Hero**: left-aligned asymmetric headline (approved real copy, not mockup
  placeholder), soft multi-stop radial gradient glow (cyan + purple, low opacity,
  purely decorative) behind the text, monospace overline label, minimal bordered CTA,
  small mono motto sidebar in the corner.
- **Footer**: thin top border rule, small letterspaced mono copyright text, nav links
  separated by dot dividers, generous padding.
- **Departments page**: asymmetric featured-card grid — the first two departments
  render as larger, wider cards; the remaining ten render in a standard responsive
  grid. Each card carries a visible (not just subtle-to-invisible) gradient wash using
  that department's real `tone` color from `constants/index.js`, plus a small
  `lucide-react` icon chosen per department's actual function (code brackets for Web
  Dev, palette for Creatives/Design, database icon for Data Science, etc.). Checkbox
  remains the sole click target for selection (deliberate UX decision — whole-card
  click risked accidental deselection while browsing "View Details").
- **Department detail popup**: differentiated from the generic homepage notice popup
  by accepting an optional `accentColor` prop, using the selected department's tone for
  a top border accent and glow — so it feels tied to that department's identity rather
  than a generic system dialog.
- **Application form**: large bold department-name headline with a gradient glow using
  the relevant department's tone (dual gradient when applying to two departments),
  underline-style minimal input fields, mono uppercase labels, per-department-tinted
  section dividers and question numbering so a two-department application visually
  separates each department's own section, italic elegant question styling (interview-
  style Q&A), tone-accented submit button.
- **Sign-in page**: same editorial tokens applied — mono labels, underline inputs,
  dark card, minimal bordered submit button. All existing auth logic preserved exactly.
- **Admin dashboard**: bold editorial page header, thin rule-line row dividers instead
  of heavy grid borders, small colored department tag chips (reusing the same tone
  colors from the departments page for consistency), bracket-style `[ Shortlist ]` /
  `[ Unshortlist ]` action buttons, real computed stats strip. Table itself kept dense
  and scannable — editorial detailing did not compromise data legibility.

## How the UI "Came Out"

The end result is a coherent, legible, dark editorial system — a meaningful
improvement over the starting illegible state, with real visual identity (the
per-department color system threading through cards, popups, forms, and the admin
table ties the whole flow together) rather than a generic dark-mode default. It was
independently reviewed twice (external code review passes) and confirmed functionally
intact after the visual work — no regressions to selection logic, validation, PATCH
calls, CSV export, or the MailComposer send flow were introduced by the redesign.

**Known open item**: a family member's feedback was that the theme reads as "too dark"
for a recruitment context and could risk looking generic/AI-generated if not pushed
further. A brightness/contrast pass (lightening the `#0a0a0a` base toward a deep
charcoal/navy, increasing surface-vs-background contrast) was discussed as the next
step but was not executed this round — noted as a real, actionable open item rather
than a settled decision.
