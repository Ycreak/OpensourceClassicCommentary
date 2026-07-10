/** Models for the teaching package. Multiple-choice and drag-drop lessons. */

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}

export interface MultipleChoiceQuestion {
  type?: 'multiple_choice';
  prompt: string;
  choices: string[];
  correct_index: number;
  /** Shown after the student answers correctly. */
  explanation?: string;
  /** Shown only after a wrong answer. */
  hint?: string;
}

/** Partial match against a canvas fragment's identifier ({author, title, editor, name});
 * every field given here must match. */
export type FragmentMatch = { author?: string; title?: string; editor?: string; name?: string };

/** The student drags a playground fragment into a drop zone on the canvas. */
export interface DragDropQuestion {
  type: 'drag_drop';
  prompt: string;
  /** Label shown inside the drop zone. */
  zone_label: string;
  /** A dropped fragment is correct when it matches any of these. */
  accepts: FragmentMatch[];
  /** Shown after the student answers correctly. */
  explanation?: string;
  /** Shown only after a wrong drop. */
  hint?: string;
}

export type Question = MultipleChoiceQuestion | DragDropQuestion;

export interface Lesson extends LessonSummary {
  questions: Question[];
}

/** A single rendering of the on-canvas lesson card. The lesson runner owns the
 * state and hands a fresh spec to the renderer on every interaction. */
export interface LessonCardSpec {
  progress: string;
  prompt: string;
  choices: { text: string; state: 'normal' | 'correct' | 'wrong' }[];
  message: { kind: 'hint' | 'explanation'; text: string } | null;
  action: { kind: 'next' | 'finish' | 'close'; label: string } | null;
  /** When set, the renderer keeps a drop zone on the canvas next to the card. */
  drop_zone?: { label: string; state: 'normal' | 'correct' | 'wrong' } | null;
}

/** Callbacks the renderer invokes when the student interacts with the lesson. */
export interface LessonCardHandlers {
  onChoice: (index: number) => void;
  onAction: (kind: 'next' | 'finish' | 'close') => void;
  /** Called when a fragment is dropped inside the drop zone. */
  onDrop: (identifier: FragmentMatch) => void;
}
