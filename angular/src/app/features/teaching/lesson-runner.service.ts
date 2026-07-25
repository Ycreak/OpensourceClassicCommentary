import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FabricService } from '@oscc/features/playground/services/fabric.service';
import { LessonCardRenderer } from '@oscc/features/teaching/lesson-card.renderer';
import { FragmentMatch, FragmentReference, Lesson, LessonCardSpec } from '@oscc/features/teaching/models/lesson.model';
import { ApiService } from '@oscc/services/api.service';

/**
 * Drives a lesson rendered on the playground canvas. Owns all lesson state;
 * the renderer only draws the current card and reports interactions. The card
 * is a normal fabric object, so it never blocks the canvas and the student can
 * drag fragments around it.
 */
@Injectable({ providedIn: 'root' })
export class LessonRunnerService {
  private lesson!: Lesson;
  private index = 0;
  /** Correctness of the first answer per question (null until first answered), used for scoring. */
  private first_results: (boolean | null)[] = [];
  /** Questions answered correctly are locked: further answers are ignored. */
  private locked: boolean[] = [];
  /** Single-choice: the choice most recently clicked (null = unanswered). -1 marks a drop answer. */
  private chosen: number | null = null;
  /** Multi-answer: the currently ticked choices. */
  private selected = new Set<number>();
  /** Categorize: zone index per item (null = not placed yet). */
  private placements: (number | null)[] = [];
  /** Multi-answer/categorize: whether the current arrangement has been checked. */
  private checked = false;

  /**
   * Initializes the lesson runner service with required dependencies.
   *
   * @param http - Angular HttpClient for fetching lesson JSON files.
   * @param api - Service for interacting with the backend API (retrieving fragments).
   * @param renderer - Service responsible for rendering the lesson card on the canvas.
   * @param fabric - Service managing the playground Fabric.js canvas and its objects.
   */
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private renderer: LessonCardRenderer,
    private fabric: FabricService
  ) {}

  /**
   * Loads the lesson JSON by id and places the first question card on the canvas.
   *
   * @param lesson_id - The unique identifier of the lesson to load from assets.
   * @returns void
   */
  public start(lesson_id: string): void {
    this.http.get<Lesson>(`assets/teaching/${lesson_id}.json`).subscribe((lesson) => {
      this.lesson = lesson;
      this.index = 0;
      this.first_results = lesson.questions.map(() => null);
      this.locked = lesson.questions.map(() => false);
      this.reset_question_state();
      this.render();
    });
  }

  /**
   * Retrieves the current question object based on the active lesson index.
   *
   * @returns The current question from the lesson.
   */
  private get question() {
    return this.lesson.questions[this.index];
  }

  /**
   * Evaluates whether the currently active question is the final one in the lesson.
   *
   * @returns True if the current index is at the last question; otherwise, false.
   */
  private get last_question(): boolean {
    return this.index === this.lesson.questions.length - 1;
  }

  /**
   * Clears the per-question interaction state when (re)entering a question.
   * Also triggers the asynchronous loading of any associated fragments and scatters them if applicable.
   *
   * @returns void
   */
  private reset_question_state(): void {
    this.chosen = null;
    this.checked = false;
    this.selected.clear();
    const q = this.question;
    this.placements = q.type === 'categorize' ? q.items.map(() => null) : [];

    // Dynamically retrieve and load any fragments associated with this question
    this.load_question_fragments();

    if (q.type === 'drag_drop' && (!q.fragments || q.fragments.length === 0)) {
      // Scatter the loaded fragments so they are not stacked on top of each
      // other when the student has to pick one out and drag it.
      this.fabric.randomize_positions();
    }
  }

  /**
   * Iterates through fragment references on the current question, fetches data from the API,
   * and places them onto the playground canvas.
   *
   * @returns void
   */
  private load_question_fragments(): void {
    const q = this.question;
    if (!q.fragments || q.fragments.length === 0) {
      return;
    }

    q.fragments.forEach((ref: FragmentReference) => {
      this.api.request_documents(ref).subscribe({
        next: (retrieved_data) => {
          this.fabric.add(retrieved_data);
        },
        error: (err) => {
          console.error(`Failed to load fragment ${ref.author} - ${ref.name}`, err);
        },
      });
    });
  }

  /**
   * Instructs the renderer to draw the current lesson card using the generated UI specification
   * and binds callback handlers for student interactions.
   *
   * @returns void
   */
  private render(): void {
    this.renderer.render(this.build_spec(), {
      onChoice: (i) => this.on_choice(i),
      onAction: (kind) => this.on_action(kind),
      onDrop: (identifier) => this.on_drop(identifier),
      onPlace: (item, zone) => this.on_place(item, zone),
    });
  }

  /**
   * Constructs the declarative UI specification (`LessonCardSpec`) for the current question,
   * determining the visual state of choices, drop zones, categories, and feedback messages.
   *
   * @returns The fully constructed UI specification object for the renderer.
   */
  private build_spec(): LessonCardSpec {
    const q = this.question;
    const solved = this.locked[this.index];
    const progress = `Question ${this.index + 1} / ${this.lesson.questions.length}`;
    const next_action = {
      kind: (this.last_question ? 'finish' : 'next') as 'finish' | 'next',
      label: this.last_question ? 'Finish ▶' : 'Next ▶',
    };
    const feedback = (answered: boolean): LessonCardSpec['message'] =>
      !answered
        ? null
        : solved
          ? { kind: 'explanation', text: q.explanation ? `Correct! ${q.explanation}` : 'Correct!' }
          : { kind: 'hint', text: q.hint || 'Not quite. Have another look and try again.' };

    if (q.type === 'drag_drop') {
      const answered = this.chosen !== null;
      return {
        progress,
        prompt: q.prompt,
        sources: q.sources,
        choices: [],
        message: feedback(answered),
        action: !answered ? null : next_action,
        drop_zone: { label: q.zone_label, state: !answered ? 'normal' : solved ? 'correct' : 'wrong' },
      };
    }

    if (q.type === 'categorize') {
      const all_placed = this.placements.every((p) => p !== null);
      return {
        progress,
        prompt: q.prompt,
        sources: q.sources,
        choices: [],
        message: feedback(this.checked),
        action: solved ? next_action : all_placed ? { kind: 'check', label: 'Check ✔' } : null,
        categorize: {
          zones: q.categories.map((label) => ({ label })),
          items: q.items.map((item, i) => ({
            text: item.text,
            state: !this.checked ? 'normal' : this.placements[i] === item.category ? 'correct' : 'wrong',
          })),
        },
      };
    }

    if (q.correct_indices) {
      const correct = new Set(q.correct_indices);
      return {
        progress,
        prompt: q.prompt,
        sources: q.sources,
        multi: true,
        choices: q.choices.map((text, i) => ({
          text,
          selected: this.selected.has(i),
          state:
            solved && correct.has(i)
              ? 'correct'
              : this.checked && this.selected.has(i) && !correct.has(i)
                ? 'wrong'
                : 'normal',
        })),
        message: feedback(this.checked),
        action: solved ? next_action : this.selected.size ? { kind: 'check', label: 'Check ✔' } : null,
      };
    }

    const answered = this.chosen !== null;
    return {
      progress,
      prompt: q.prompt,
      sources: q.sources,
      choices: q.choices.map((text, i) => ({
        text,
        // Reveal the correct answer in green only once the question is solved;
        // a wrong pick is shown in red without giving the answer away.
        state:
          solved && i === q.correct_index
            ? 'correct'
            : answered && i === this.chosen && i !== q.correct_index
              ? 'wrong'
              : 'normal',
      })),
      message: feedback(answered),
      action: !answered ? null : next_action,
    };
  }

  /**
   * Handles a student clicking on a specific choice option.
   * For multi-answer questions, toggles selection; for single-choice, judges correctness immediately.
   *
   * @param i - The index of the selected choice option.
   * @returns void
   */
  private on_choice(i: number): void {
    const q = this.question;
    if (this.locked[this.index] || q.type === 'drag_drop' || q.type === 'categorize') {
      return;
    }
    if (q.correct_indices) {
      // Multi-answer: toggle the checkbox; correctness is judged on Check.
      if (!this.selected.delete(i)) {
        this.selected.add(i);
      }
      this.checked = false;
      this.render();
      return;
    }
    this.chosen = i;
    this.answer(i === q.correct_index);
  }

  /**
   * Handles a student dropping a fragment onto a drop zone in a drag-and-drop question.
   * Validates if the dropped fragment matches any of the accepted criteria.
   *
   * @param identifier - The matching properties of the dropped fragment.
   * @returns void
   */
  private on_drop(identifier: FragmentMatch): void {
    const q = this.question;
    if (this.locked[this.index] || q.type !== 'drag_drop') {
      return;
    }
    this.chosen = -1;
    this.answer(
      q.accepts.some((accept) => Object.entries(accept).every(([field, value]) => (identifier as any)[field] === value))
    );
  }

  /**
   * Handles a student placing an item into a specific category zone.
   *
   * @param item - The index of the categorize item being moved.
   * @param zone - The index of the destination category zone, or null if removed from a zone.
   * @returns void
   */
  private on_place(item: number, zone: number | null): void {
    if (this.locked[this.index] || this.question.type !== 'categorize') {
      return;
    }
    this.placements[item] = zone;
    this.checked = false;
    this.render();
  }

  /**
   * Judges the current multi-answer selection or categorize arrangement.
   * Evaluates if all items are in their correct zones or if all correct indices are selected.
   *
   * @returns void
   */
  private on_check(): void {
    const q = this.question;
    let correct = false;
    if (q.type === 'categorize') {
      correct = this.placements.every((zone, i) => zone === q.items[i].category);
    } else if (q.type !== 'drag_drop' && q.correct_indices) {
      correct = q.correct_indices.length === this.selected.size && q.correct_indices.every((i) => this.selected.has(i));
    }
    this.checked = true;
    this.answer(correct);
  }

  /**
   * Records an answer's correctness for scoring/locking and re-renders.
   * Locks the question if the answer is judged correct and records the initial attempt result.
   *
   * @param correct - Whether the submitted answer or arrangement is correct.
   * @returns void
   */
  private answer(correct: boolean): void {
    if (this.first_results[this.index] === null) {
      this.first_results[this.index] = correct;
    }
    if (correct) {
      this.locked[this.index] = true;
    }
    this.render();
  }

  /**
   * Handles navigation and control actions triggered from the lesson card UI.
   *
   * @param kind - The action identifier: 'next' to advance, 'finish' to end, 'close' to exit, or 'check' to verify.
   * @returns void
   */
  private on_action(kind: 'next' | 'finish' | 'close' | 'check'): void {
    if (kind === 'check') {
      this.on_check();
      return;
    }
    if (kind === 'close') {
      this.renderer.remove();
      return;
    }
    if (!this.last_question) {
      this.index += 1;
      this.reset_question_state();
      this.render();
    } else {
      this.show_score();
    }
  }

  /**
   * Calculates the final first-attempt score across all questions and renders the completion card.
   *
   * @returns void
   */
  private show_score(): void {
    const score = this.first_results.filter((r) => r).length;
    const total = this.lesson.questions.length;
    this.renderer.render(
      {
        progress: this.lesson.title,
        prompt: `Lesson complete — you scored ${score} / ${total} on first attempt.`,
        choices: [],
        message: null,
        action: { kind: 'close', label: 'Close ✕' },
      },
      {
        onChoice: () => undefined,
        onAction: (kind) => this.on_action(kind),
        onDrop: () => undefined,
        onPlace: () => undefined,
      }
    );
  }
}
