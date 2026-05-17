# Colour palette and playground icons — research + implementation plan

Branch: `colour-icons-plan` (off `main`)
Issues: [#408 New colour palette](https://github.com/Ycreak/OpensourceClassicCommentary/issues/408), [#409 New playground icons](https://github.com/Ycreak/OpensourceClassicCommentary/issues/409)

Both deliverables aim at the **14-05-26 meeting**: have ≥3 palettes and ≥3 icon sets ready to demo so the team can pick.

---

## Part 1 — Colour palette (#408)

### Current state (audited on `main`, commit `c95427c`)

Hex codes counted in `angular/src/`:

| count | hex | semantic role |
|---|---|---|
| 7 | `#ffffff` | backgrounds, dialog headers |
| 4 | `#3f51b5` | **primary brand** (Material Indigo 500) — declared once as `$theme-primary` in `app/_mixins.scss:1`, then re-hardcoded in 5 other places (`app.component.scss`, `playground.component.scss`, `scansion.component.scss`, `columns.component.scss`, `columns.component.ts:178`) |
| 3 | `#ccc` | borders, dividers |
| 2 | `#F0C086` | sticky-note orange |
| 2 | `#9fa1fe` | light blue accent |
| 2 | `#fff7e0` | cream |
| 2 | `#fff2f2` | pink hint |
| 2 | `#3F51B5` | same indigo, upper-case |
| 1 | `#ff4081` | Material Pink A200 accent |
| 1 | `#9BA8F2` | fragment selection blue (fabric canvas) |
| — | `#C8E6C9`/`#FFCDD2`/`#2E7D32`/`#C62828` | teaching feedback (correct/incorrect) — not on `main` yet, lives on `teaching` |

Issues observed before touching anything new:

1. **The "single source of truth" is a lie.** `$theme-primary` is defined once and then ignored everywhere else. Any palette switch by find-and-replace will miss future hardcoded values; first deliverable here is converting the existing hardcoded `#3F51B5`/`#ff4081`/etc. to SCSS variables (or even better, CSS custom properties).
2. **Pink is already nearly gone** (per Ycreak's #408 comment "pink was ugly, gone is good") — confirmed: only 2 places still use pink. Easy delete.
3. **Greys are low-contrast** (per #408 comment) — `#ccc` and `#eee` are used for dividers; against `#fff` they hit ~1.5:1 contrast (WCAG fail for borders that carry meaning).

### Research — Universiteit Leiden huisstijl (target per #408)

From the [official brand portal](https://huisstijl.universiteitleiden.nl/huisstijl/kleuren):

| name | hex | role |
|---|---|---|
| **Universiteitsblauw** | `#001158` | Primary brand colour (Pantone 280 C) |
| Lei-Geesteswetenschappen | `#4D781F` | Humanities faculty (← OSCC sits here) |
| Lei-Rechten | `#A41467` | Law |
| Lei-Geneeskunde | `#007679` | Medicine/LUMC |
| Lei-Sociale wetenschappen | `#6433AB` | Social Sciences |
| Lei-Archeologie | `#00653F` | Archaeology |
| Lei-Wis- en natuurwetenschappen | `#BE4500` | Maths/Natural Sciences |
| Lei-Bestuurskunde | `#0E67B9` | Governance |
| Lei-Neutraal | `#524F47` | Neutral / body text grey |

Each colour has a documented 30%-intensity light variant; specific hex not published.

**Reading Ycreak's #408 comment:** "Leiden University is good, with some tweaks. Sebas has them." — meaning we lean Leiden, but the exact tweak palette lives with Sebas (sajvanwijk). Worth getting that from him before the meeting; until then, base the proposals on the published huisstijl.

### Three proposed palettes for the meeting demo

Each is a **complete swap-set** — primary, secondary, surface, text, border, success/warning. Render one short PR per palette so the team can A/B in the running app.

#### Palette A — "Leiden Faithful" (huisstijl, minimal tweaks)

| token | hex | use |
|---|---|---|
| `--brand-primary` | `#001158` | Navbar, primary buttons, selected fragment border |
| `--brand-primary-tint` | `#3D4D8A` | Primary hover / muted accents (30% lift of #001158) |
| `--brand-accent` | `#4D781F` | Humanities faculty colour — links, secondary action |
| `--surface` | `#FFFFFF` | Page background |
| `--surface-alt` | `#F4F1EA` | Card / commentary panel (cream) |
| `--text` | `#1A1A1A` | Body text |
| `--text-muted` | `#524F47` | Lei-Neutraal — captions |
| `--border` | `#C8C5BD` | Subtle border (warmer than `#ccc`, ≥ 3:1 on `#FFFFFF`) |
| `--success` | `#2E7D32` | Lesson "Juist:" feedback (unchanged from teaching branch) |
| `--warning` | `#C62828` | Lesson "Fout:" feedback |
| `--fragment-selected` | `#3D4D8A` | Canvas selection (replaces `#9BA8F2`) |

#### Palette B — "Natural" (palette A's neutrals dialled up, brand kept)

Same brand colours; replaces every off-white with deeper natural tones:

| token | hex | rationale |
|---|---|---|
| `--surface` | `#F8F5EE` | Warm paper, evokes manuscript |
| `--surface-alt` | `#EEE8D6` | Aged paper for cards |
| `--border` | `#A89F84` | Sepia line — clear at small sizes |
| `--text` | `#2A2417` | Ink black with warmth |
| `--brand-primary` | `#001158` | Unchanged |
| `--brand-accent` | `#9C7A3C` | Antique gold — for highlights instead of green |

Suits the classical-philology theme; risks looking "themed" to a fault.

#### Palette C — "Leiden Light" (modern, web-first)

Brand colours weighted toward the Light Blue variant for less heavy chrome:

| token | hex | rationale |
|---|---|---|
| `--brand-primary` | `#0E67B9` | Lei-Governance blue — Leiden-recognisable but lighter than `#001158` |
| `--brand-primary-dark` | `#001158` | Reserved for navbar + headings |
| `--brand-accent` | `#5CB1EB` | Lei-Geneeskunde light blue accent |
| `--surface` | `#FFFFFF` | Stays clean |
| `--surface-alt` | `#F0F4FA` | Cool pale blue for cards |
| `--text` | `#1A1A1A` | — |
| `--text-muted` | `#5E6470` | Higher-contrast grey |
| `--border` | `#C8D1DE` | Cool grey |
| `--success` | `#2E7D32` | Unchanged |
| `--warning` | `#C62828` | Unchanged |

Most "app-like" of the three — fits a digital tool used during teaching.

### Implementation plan for the palette swap

Sequence so we land it without a giant blast-radius PR.

1. **Step 0 — pin the source of truth.** Replace `$theme-primary` and similar SCSS vars in `app/_mixins.scss` with a small token file `angular/src/_tokens.scss` (or CSS custom properties on `:root` in `styles.scss`). One round of find-and-replace turns every literal `#3F51B5`/`#3f51b5` into `var(--brand-primary)` or `mat.m2-get-color-from-palette(...)`. **No visible change yet.** This is the load-bearing refactor.
2. **Step 1 — Material theme.** Define an Angular Material theme using the chosen palette via `mat.define-theme()` / `m2-define-palette`. Replace any prebuilt-theme imports. Keep `mat.indigo-pink` available behind a build flag for one release for rollback.
3. **Step 2 — Three demo branches.** From `colour-icons-plan`, cut three short branches (`palette-leiden-faithful`, `palette-natural`, `palette-leiden-light`) that each only edit the token file. Deploy / preview each so the team can compare live.
4. **Step 3 — Get Sebas's tweaked palette** before the meeting (per Ycreak's #408 comment) and add it as Palette D.
5. **Step 4 — Pick at meeting, merge winner, delete the others.**

### Accessibility / contrast checks (target WCAG AA)

For each palette, body text on surface must hit ≥ 4.5:1; large text and UI components ≥ 3:1.

- Palette A `#1A1A1A` on `#FFFFFF`: 18.7:1 ✓
- Palette A `#524F47` (muted text) on `#FFFFFF`: 8.6:1 ✓
- Palette A `#C8C5BD` border on `#FFFFFF`: 1.8:1 — **fails for borders carrying meaning**; only use for decorative dividers. For meaningful borders use `#A89F84` (3.4:1).
- Palette B's `#A89F84` border on `#F8F5EE`: 3.0:1 — just over
- Palette C `#5E6470` muted on `#FFFFFF`: 5.8:1 ✓

Worth running each palette through a tool like [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) before the demo and noting any fails in the PR description.

---

## Part 2 — Playground icons (#409)

### Current state

`angular/src/app/playground/playground.component.html` mixes three icon sources:

1. **ByteDance IconPark PNGs** (in `assets/icons/ByteDanceIconPark/`, ~24 files) — the toolbar buttons. PNG at fixed size, no recolor, no hover-state, blurry on retina.
2. **Material Icons font** (`<mat-icon fontIcon="menu">`, `question_mark`, `notes`, `backspace`) — menus and selection popup.
3. **SVG assets** in `assets/icons/` for social media logos only.

Toolbar icons (in display order, with current PNG name):

| function | icon name today | Ycreak note |
|---|---|---|
| Hamburger menu | `hamburger_button_icon.png` *(actually using Material `menu`)* | — |
| Open author/text picker | `doc_search_icon` | candidate for merge with next |
| Add note | `notes_icon` | "Replace by **comment** icon (first, simplest)" |
| Clear playground | `clear_icon` | — |
| Toggle drawing mode | `write_icon` | — |
| Undo | `return_icon` | "Make it really turn" |
| Redo | `go_on_icon` | "Make it really turn" |
| Save playground | `hard_disk_one_icon` | — |
| Load playground | `folder_open_icon` | — |
| Delete playground (owner) | `folder_delete_icon` | — |
| Share | `people_plus_one_icon` | — |
| Create shared session | `people_plus_one_icon` *(same icon as Share!)* | conflict — needs distinct icon |
| Join shared session | `people_download_icon` | — |
| Help | Material `question_mark` | — |

**Three Ycreak-driven fixes (from #409 comment):**
- Merge the first two toolbar buttons into one (likely "Open author/text picker" + "Add note", or "Add note" + "Clear" — clarify at meeting; my guess is the picker + something tangential since they live in the same `playground-document-tools` group).
- Replace the note icon with a "comment" icon — Material's `comment` or `chat_bubble_outline` is the simplest fit.
- Undo/Redo arrows should clearly rotate — current `return_icon` / `go_on_icon` are straight arrows, no curl.
- (My addition.) Share vs Create-shared-session use the **same** icon — needs separating.

### Three proposed icon sets for the meeting demo

Each set is internally consistent (single style, single weight, single grid).

#### Set 1 — Material Symbols (Outlined, weight 300)

Google's modern variable icon font, free, already partly in the codebase. Renders crisp at any size, recolours via CSS, has a built-in "filled" toggle for active state.

| function | icon |
|---|---|
| Hamburger | `menu` |
| Open author/text picker | `manage_search` |
| Add note → comment | `chat_bubble_outline` |
| Clear | `cleaning_services` |
| Toggle drawing | `draw` |
| Undo | `undo` (Material's is an actual curling arrow) |
| Redo | `redo` (same — curls) |
| Save | `save` |
| Load | `folder_open` |
| Delete | `folder_delete` |
| Share | `share` |
| Create shared session | `group_add` |
| Join | `login` or `meeting_room` |
| Help | `help_outline` |

Pros: free, already used; weight + fill variants do hover/active states for free; matches a research tool. Cons: very recognisable as "Google" — may not feel Leiden-distinctive.

#### Set 2 — Phosphor Icons (Light/Regular weight)

Phosphor is a single-style icon family with 1 248 free icons; the line weight feels editorial and pairs well with a classical-typography brand.

| function | icon |
|---|---|
| Hamburger | `list` |
| Open picker | `magnifying-glass-plus` |
| Comment | `chat-circle-text` |
| Clear | `broom` |
| Drawing | `pencil-line` |
| Undo | `arrow-counter-clockwise` (literal U-turn arrow) |
| Redo | `arrow-clockwise` |
| Save | `floppy-disk` |
| Load | `folder-simple-dashed` |
| Delete | `trash` |
| Share | `share-network` |
| Create session | `users-three` |
| Join | `sign-in` |
| Help | `question` |

Pros: distinctive without being weird; six weights including Duotone for accent moments; React/Vue/Angular packages exist. Cons: not yet in the codebase, adds ~30 KB dependency.

#### Set 3 — Tabler Icons (consistent 1.5 px stroke)

Tabler is a 5 000-icon open-source set with a single stroke style — the most "engineering" look of the three, but the icons reliably look like icons even at 16 px.

| function | icon |
|---|---|
| Hamburger | `menu-2` |
| Open picker | `search` |
| Comment | `message-circle` |
| Clear | `eraser` |
| Drawing | `brush` |
| Undo | `arrow-back-up` (curled) |
| Redo | `arrow-forward-up` (curled) |
| Save | `device-floppy` |
| Load | `folder` |
| Delete | `folder-x` |
| Share | `share` |
| Create session | `user-plus` |
| Join | `door-enter` |
| Help | `help` |

Pros: most legible at small sizes; large library so no gaps; permissive licence. Cons: relatively young, occasional re-render across releases.

### Implementation plan for icon swap

1. **Step 0 — fix the source-of-truth.** Move every `<img src="assets/icons/.../X.png">` to a single `app-playground-icon` component that takes a logical name (`"undo"`, `"clear"`, …) and renders the right element under the hood. After this change, swapping icon sets is a one-file edit. **No visible change yet.**
2. **Step 1 — three demo branches** that override only the icon component's lookup table (`set-material-symbols`, `set-phosphor`, `set-tabler`). Each comes with the dependency install commits clearly separated so we can throw two of them away.
3. **Step 2 — Apply Ycreak's directives** independently of the set choice:
   - Merge the two adjacent buttons (clarify which at meeting).
   - Replace `notes_icon` with the chosen comment icon.
   - Differentiate Share from Create-Shared-Session.
   - Swap straight arrows for curled rotation icons in Undo/Redo.
4. **Step 3 — Pick set at meeting. Delete the other two branches and their dependencies.**

### Considerations beyond the set choice

- **Theme alignment.** Once a colour palette is chosen (Part 1), the icon component should take `currentColor` so changing CSS recolours every icon. PNGs cannot do this; one more reason to ditch them.
- **Sizing/spacing audit.** The current toolbar uses `class="playground-icon"` with no documented size token. Define `--icon-size-toolbar: 24px` etc. while the component is being built.
- **Tooltips.** No current button has a `matTooltip`; every new icon should ship with one so colour/icon ambiguity doesn't matter at small sizes.

---

## Combined sequencing for the 14-05-26 meeting

| order | task | who | output |
|---|---|---|---|
| 1 | Get Sebas's tweaked Leiden palette | Ycreak/Sebas | hex list → adds Palette D |
| 2 | Token-ify the codebase (Part 1 Step 0 + Part 2 Step 0) — no visible change | dev | one PR off `main`: `tokens-and-icon-component` |
| 3 | Three palette demo branches off step 2 | dev | 3 × short PR with live preview |
| 4 | Three icon-set demo branches off step 2 | dev | 3 × short PR with live preview |
| 5 | Meeting: pick palette + icon set | team | decisions |
| 6 | Merge winners, delete losers | dev | one final cleanup PR |

Doing step 2 first means demos are cheap and the post-meeting cleanup is small. Without it, every demo branch carries find-and-replace churn that will conflict on merge.
