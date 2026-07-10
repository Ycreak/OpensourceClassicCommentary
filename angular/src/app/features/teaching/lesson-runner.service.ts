import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LessonCardRenderer } from '@oscc/features/teaching/lesson-card.renderer';
import { FragmentMatch, Lesson, LessonCardSpec } from '@oscc/features/teaching/models/lesson.model';

/**
 * Drives a multiple-choice lesson rendered on the playground canvas.
 * Owns all lesson state; the renderer only draws the current card and reports
 * clicks. The card is a normal fabric object, so it never blocks the canvas and
 * the student can drag fragments around it.
 */
@Injectable({ providedIn: 'root' })
export class LessonRunnerService {
  private lesson!: Lesson;
  private index = 0;
  /** Correctness of the first answer per question (null until first answered), used for scoring. */
  private first_results: (boolean | null)[] = [];
  /** Questions answered correctly are locked: further choice clicks are ignored. */
  private locked: boolean[] = [];
  /** The choice most recently clicked for the current question (null = unanswered). */
  private chosen: number | null = null;

  constructor(
    private http: HttpClient,
    private renderer: LessonCardRenderer
  ) {}

  /** Loads the lesson JSON by id and places the first question card on the canvas. */
  public start(lesson_id: string): void {
    this.http.get<Lesson>(`assets/teaching/${lesson_id}.json`).subscribe((lesson) => {
      this.lesson = lesson;
      this.index = 0;
      this.first_results = lesson.questions.map(() => null);
      this.locked = lesson.questions.map(() => false);
      this.chosen = null;
      this.render();
    });
  }

  private get question() {
    return this.lesson.questions[this.index];
  }

  private get last_question(): boolean {
    return this.index === this.lesson.questions.length - 1;
  }

  private render(): void {
    this.renderer.render(this.build_spec(), {
      onChoice: (i) => this.on_choice(i),
      onAction: (kind) => this.on_action(kind),
      onDrop: (identifier) => this.on_drop(identifier),
    });
  }

  private build_spec(): LessonCardSpec {
    const q = this.question;
    const answered = this.chosen !== null;
    const solved = this.locked[this.index];
    if (q.type === 'drag_drop') {
      return {
        progress: `Question ${this.index + 1} / ${this.lesson.questions.length}`,
        prompt: q.prompt,
        choices: [],
        message: !answered
          ? null
          : solved
            ? { kind: 'explanation', text: q.explanation ? `Correct! ${q.explanation}` : 'Correct!' }
            : { kind: 'hint', text: q.hint || 'Not quite. Have another look and try again.' },
        action: !answered
          ? null
          : { kind: this.last_question ? 'finish' : 'next', label: this.last_question ? 'Finish ▶' : 'Next ▶' },
        drop_zone: { label: q.zone_label, state: !answered ? 'normal' : solved ? 'correct' : 'wrong' },
      };
    }
    return {
      progress: `Question ${this.index + 1} / ${this.lesson.questions.length}`,
      prompt: q.prompt,
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
      message: !answered
        ? null
        : solved
          ? { kind: 'explanation', text: q.explanation ? `Correct! ${q.explanation}` : 'Correct!' }
          : { kind: 'hint', text: q.hint || 'Not quite. Have another look and try again.' },
      action: !answered ? null : { kind: this.last_question ? 'finish' : 'next', label: this.last_question ? 'Finish ▶' : 'Next ▶' },
    };
  }

  private on_choice(i: number): void {
    const q = this.question;
    if (this.locked[this.index] || q.type === 'drag_drop') {
      return;
    }
    this.answer(i, i === q.correct_index);
  }

  private on_drop(identifier: FragmentMatch): void {
    const q = this.question;
    if (this.locked[this.index] || q.type !== 'drag_drop') {
      return;
    }
    const correct = q.accepts.some((accept) =>
      Object.entries(accept).every(([field, value]) => (identifier as any)[field] === value)
    );
    this.answer(-1, correct);
  }

  /** Records an answer (chosen index, or -1 for a drop) and re-renders. */
  private answer(chosen: number, correct: boolean): void {
    if (this.first_results[this.index] === null) {
      this.first_results[this.index] = correct;
    }
    this.chosen = chosen;
    if (correct) {
      this.locked[this.index] = true;
    }
    this.render();
  }

  private on_action(kind: 'next' | 'finish' | 'close'): void {
    if (kind === 'close') {
      this.renderer.remove();
      return;
    }
    if (!this.last_question) {
      this.index += 1;
      this.chosen = null;
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
      }
    );
  }
}
