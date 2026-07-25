/** Models for the teaching package: multiple-choice (single and multi-answer),
 * drag-drop and categorize lessons.
 *
 * Prompt, source and explanation text may use inline style markers, rendered
 * by the lesson card: $italic$, *bold*, _underline_. */

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}

// Metadata used to retrieve fragments from the api
export interface FragmentReference {
  document_type: string;
  author: string;
  title: string;
  editor: string;
  name: string;
}

export interface MultipleChoiceQuestion {
  type?: 'multiple_choice';
  prompt: string;
  /** Quoted source passages shown between the prompt and the choices. */
  sources?: string[];
  // Used if fragments need to be retrieved for the question
  fragments?: FragmentReference[];
  choices: string[];
  /** Single-answer questions. */
  correct_index?: number;
  /** Multi-answer questions: the student ticks choices and clicks Check. */
  correct_indices?: number[];
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
  sources?: string[];
  /** Label shown inside the drop zone. */
  zone_label: string;
  /** A dropped fragment is correct when it matches any of these. */
  accepts: FragmentMatch[];
  explanation?: string;
  hint?: string;
  // Used if fragments need to be retrieved for the question
  fragments?: FragmentReference[];
}

/** The student drags lesson-provided text chips into category zones. */
export interface CategorizeQuestion {
  type: 'categorize';
  prompt: string;
  sources?: string[];
  /** Zone labels. */
  categories: string[];
  /** Draggable chips; category is the index of the correct zone. */
  items: { text: string; category: number }[];
  explanation?: string;
  hint?: string;
  // Used if fragments need to be retrieved for the question
  fragments?: FragmentReference[];
}

export type Question = MultipleChoiceQuestion | DragDropQuestion | CategorizeQuestion;

export interface Lesson extends LessonSummary {
  questions: Question[];
}

/** A single rendering of the on-canvas lesson card. The lesson runner owns the
 * state and hands a fresh spec to the renderer on every interaction. */
export interface LessonCardSpec {
  progress: string;
  prompt: string;
  sources?: string[];
  choices: { text: string; state: 'normal' | 'correct' | 'wrong'; selected?: boolean }[];
  /** Render choices as checkboxes (multi-answer). */
  multi?: boolean;
  message: { kind: 'hint' | 'explanation'; text: string } | null;
  action: { kind: 'next' | 'finish' | 'close' | 'check'; label: string } | null;
  /** When set, the renderer keeps a drop zone on the canvas next to the card. */
  drop_zone?: { label: string; state: 'normal' | 'correct' | 'wrong' } | null;
  /** When set, the renderer keeps category zones and draggable chips on the canvas. */
  categorize?: {
    zones: { label: string }[];
    items: { text: string; state: 'normal' | 'correct' | 'wrong' }[];
  } | null;
}

/** Callbacks the renderer invokes when the student interacts with the lesson. */
export interface LessonCardHandlers {
  onChoice: (index: number) => void;
  onAction: (kind: 'next' | 'finish' | 'close' | 'check') => void;
  /** Called when a fragment is dropped inside the drop zone. */
  onDrop: (identifier: FragmentMatch) => void;
  /** Called when a categorize chip is dropped in a zone (null = outside all zones). */
  onPlace: (item: number, zone: number | null) => void;
}
