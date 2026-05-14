# Teaching playground changes

This README explains the teaching-mode code changes in the Angular frontend.

## User-facing behaviour

- The Playground menu now includes `Start les`.
- A lesson opens a picker dialog, loads lesson metadata from `assets/teaching/index.json`, then loads the selected lesson JSON.
- A lesson samples fragments from configured fragment pools, places them on the Fabric canvas, and renders one or more drop zones for the current step.
- Students drag fragments into the zone and click `Controleer`.
- After checking:
  - correct fragments get a green background and green border;
  - incorrect fragments get a red background and red border;
  - every fragment gets a feedback label underneath it;
  - only `Juist:` or `Fout:` is coloured red/green, while the origin text stays black;
  - the step score is shown in the lesson banner.
- When a checked fragment is selected, a small `notes` button appears near the fragment. That button opens the regular commentary view.
- Opening commentary from a lesson closes the Playground drawer, opens the commentary drawer, selects the matching fragment in the left columns, scrolls to it, and briefly highlights the selected fragment text in the commentary panel.
- The lesson summary dialog shows per-step and total scores, with an option to return to the lesson list.

## Lesson data

Lessons are data-driven.

- `angular/src/assets/teaching/index.json` lists available lessons.
- `angular/src/assets/teaching/ennius-thyestes-1.json` defines the first lesson.
- `angular/src/app/playground/teaching/lesson.model.ts` defines the lesson schema:
  - `fragment_pools` describe which fragments to fetch and how many to sample;
  - `steps` define prompts and drop zones;
  - each zone has `expected` criteria, where criteria are OR-ed and each criterion's keys are AND-ed.

For example, this matches either Thyestes or Atreus:

```json
"expected": [
  { "title": "Thyestes" },
  { "title": "Atreus" }
]
```

This matches only Ennius' Thyestes:

```json
"expected": [{ "author": "Ennius", "title": "Thyestes" }]
```

## Playground component changes

`angular/src/app/playground/playground.component.ts` now owns lesson flow state:

- `PlaygroundComponent` is kept as the adapter for the existing playground UI, Fabric canvas setup, and commentary navigation.
- `angular/src/app/playground/teaching/teaching-playground.service.ts` owns lesson flow state and behaviour:
  - `lesson_mode`
  - `current_lesson`
  - `current_step_index`
  - `step_scores`
  - `step_checked`
  - cached sampled lesson documents

The teaching module coordinates the lesson lifecycle behind a small interface:

- `start_lesson`
- `check_step`
- `next_step`
- `exit_lesson`
- readonly getters for current prompt, total steps, and current score

`PlaygroundComponent` still coordinates commentary navigation from the canvas:

- selected lesson fragments are tracked after `Controleer`;
- the small floating commentary button is positioned near the selected fragment;
- commentary requests resolve Fabric child/group/selection targets back to the document group that carries `identifier`;
- the full document is looked up from `fabric.documents`;
- if the same document is visible in the left columns, that column instance is used for commentary so selection and commentary stay in sync;
- `commentary_requested` is emitted so `OverviewComponent` can close the Playground drawer.

`angular/src/app/playground/playground.component.html` adds:

- the lesson banner;
- the `Controleer`, `Volgende stap`, and exit controls;
- the floating per-fragment commentary button;
- the `Start les` menu entry.

`angular/src/app/playground/playground.component.scss` adds styling for:

- the lesson banner;
- lesson action buttons;
- the floating commentary button;
- teaching dialogs and layout polish.

## Fabric service changes

`angular/src/app/playground/services/fabric.service.ts` now supports lesson-specific canvas behaviour:

- `DropZone` rendering with dashed rectangles and labels.
- Viewport-aware scattering of fragments around lesson zones.
- `evaluate_step`, which compares each fragment's centroid against zone bounds and expected metadata criteria.
- Feedback rendering:
  - green/red fragment background and border;
  - per-fragment `Juist:` / `Fout:` labels;
  - black origin text after the coloured verdict.
- Feedback cleanup between steps and when exiting lesson mode.

The service also stores each fragment box's default fill colour so feedback can be reset safely.

## Commentary and columns integration

`angular/src/app/columns/columns.service.ts` centralises document selection:

- `select_document` applies the same blue selected-fragment colour as a manual click.
- linked fragments are recoloured through the existing linked-fragment logic.
- the selected document is scrolled into view.
- stable DOM ids are generated for column documents.

`angular/src/app/columns/columns.component.ts` now delegates selection colouring to `ColumnsService`.

`angular/src/app/commentary/commentary.service.ts` accepts optional request metadata:

```ts
request(doc, { highlight: true })
```

`angular/src/app/commentary/commentary.component.*` uses that flag to show a temporary yellow highlight with the selected fragment lines when commentary is opened from the lesson playground.

`angular/src/app/overview/overview.component.*` listens for `commentary_requested`, closes the Playground bottom drawer, opens the commentary side drawer, and scrolls back to the top.

## Tests and build support

`angular/src/app/playground/services/fabric.service.spec.ts` adds focused tests for `evaluate_step`:

- correct Ennius placement;
- incorrect distractor placement;
- OR criteria across multiple expected values;
- compound criteria requiring all keys to match;
- outside-zone placement.

`angular/tsconfig.json` enables `skipLibCheck` to avoid external type noise while compiling the Angular app with the current dependency set.

## Notes

- The lesson mode uses the existing API/document model; no backend changes are required.
- Lesson content can be expanded by adding new JSON files under `angular/src/assets/teaching/` and listing them in `index.json`.
- Temporary local files such as workflow logs and isolated matching harnesses are not part of this feature.
