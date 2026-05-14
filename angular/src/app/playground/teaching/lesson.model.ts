export interface FragmentReference {
  document_type: 'fragment';
  author: string;
  title: string;
  editor: string;
  name: string;
}

export interface DropZone {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  expected: Partial<FragmentReference>[];
}

export interface LessonStep {
  prompt: string;
  zones: DropZone[];
  explanation?: string;
}

export interface FragmentPool {
  criterion: Partial<FragmentReference>;
  count: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  fragment_pools: FragmentPool[];
  steps: LessonStep[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}
