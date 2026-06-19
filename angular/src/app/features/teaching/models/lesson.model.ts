/** Models for the teaching package. Multiple-choice lessons only. */

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}

export interface MultipleChoiceQuestion {
  prompt: string;
  choices: string[];
  correct_index: number;
  /** Shown after the student answers correctly. */
  explanation?: string;
  /** Shown only after a wrong answer. */
  hint?: string;
}

export interface Lesson extends LessonSummary {
  questions: MultipleChoiceQuestion[];
}

/** A single rendering of the on-canvas lesson card. The lesson runner owns the
 * state and hands a fresh spec to the renderer on every interaction. */
export interface LessonCardSpec {
  progress: string;
  prompt: string;
  choices: { text: string; state: 'normal' | 'correct' | 'wrong' }[];
  message: { kind: 'hint' | 'explanation'; text: string } | null;
  action: { kind: 'next' | 'finish' | 'close'; label: string } | null;
}

/** Callbacks the renderer invokes when the student clicks the lesson card. */
export interface LessonCardHandlers {
  onChoice: (index: number) => void;
  onAction: (kind: 'next' | 'finish' | 'close') => void;
}
