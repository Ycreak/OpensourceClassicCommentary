import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FabricService } from '@oscc/features/playground/services/fabric.service';
import { LessonCardRenderer } from '@oscc/features/teaching/lesson-card.renderer';
import { FragmentMatch, Lesson, LessonCardSpec } from '@oscc/features/teaching/models/lesson.model';

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

  constructor(
    private http: HttpClient,
    private renderer: LessonCardRenderer,
    private fabric: FabricService
  ) {}

  /** Loads the lesson JSON by id and places the first question card on the canvas. */
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

  private get question() {
    return this.lesson.questions[this.index];
  }

  private get last_question(): boolean {
    return this.index === this.lesson.questions.length - 1;
  }

  /** Clears the per-question interaction state when (re)entering a question. */
  private reset_question_state(): void {
    this.chosen = null;
    this.checked = false;
    this.selected.clear();
    const q = this.question;
    this.placements = q.type === 'categorize' ? q.items.map(() => null) : [];
    if (q.type === 'drag_drop') {
      // Scatter the loaded fragments so they are not stacked on top of each
      // other when the student has to pick one out and drag it.
      this.fabric.randomize_positions();
    }
  }

  private render(): void {
    this.renderer.render(this.build_spec(), {
      onChoice: (i) => this.on_choice(i),
      onAction: (kind) => this.on_action(kind),
      onDrop: (identifier) => this.on_drop(identifier),
      onPlace: (item, zone) => this.on_place(item, zone),
    });
  }

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

  private on_choice(i: number): void {
    const q = this.question;
    if (this.locked[this.index] || q.type === 'drag_drop' || q.type === 'categorize') {
      return;
    }
    if (q.correct_indices) {
      // Multi-answer: toggle the checkbox; correctness is judged on Check.
      this.selected.has(i) ? this.selected.delete(i) : this.selected.add(i);
      this.checked = false;
      this.render();
      return;
    }
    this.chosen = i;
    this.answer(i === q.correct_index);
  }

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

  private on_place(item: number, zone: number | null): void {
    if (this.locked[this.index] || this.question.type !== 'categorize') {
      return;
    }
    this.placements[item] = zone;
    this.checked = false;
    this.render();
  }

  /** Judges the current multi-answer selection or categorize arrangement. */
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

  /** Records an answer's correctness for scoring/locking and re-renders. */
  private answer(correct: boolean): void {
    if (this.first_results[this.index] === null) {
      this.first_results[this.index] = correct;
    }
    if (correct) {
      this.locked[this.index] = true;
    }
    this.render();
  }

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
