export const MAX_TEXT_INPUT_LENGTH = 100000;

export interface TextValidationResult {
  sanitizedText: string;
  error: string | null;
}

export interface UploadValidationResult {
  error: string | null;
  sanitizedFile: File | null;
}

export function sanitizeTextInput(rawValue: unknown): TextValidationResult {
  if (typeof rawValue !== 'string') {
    return {
      sanitizedText: '',
      error: 'Input must be plain text.',
    };
  }

  const sanitizedText = rawValue.replace(/\s+/g, ' ').trim();

  if (!sanitizedText) {
    return {
      sanitizedText: '',
      error: 'Please enter a Latin prose passage before analyzing.',
    };
  }

  if (sanitizedText.length > MAX_TEXT_INPUT_LENGTH) {
    return {
      sanitizedText: '',
      error: `Text is too long. Please keep the input under ${MAX_TEXT_INPUT_LENGTH} characters.`,
    };
  }

  if (!/[A-Za-z]/.test(sanitizedText)) {
    return {
      sanitizedText: '',
      error: 'Input must contain alphabetic text, not only digits or symbols.',
    };
  }

  return {
    sanitizedText: sanitizedText,
    error: null,
  };
}

export function sanitizeUpload(file: File | null): UploadValidationResult {
  if (!file) {
    return {
      sanitizedFile: null,
      error: 'Choose a .txt file before uploading.',
    };
  }

  const isTextFile =
    file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

  if (!isTextFile) {
    return {
      sanitizedFile: null,
      error: 'Only plain text files (.txt) are supported.',
    };
  }

  if (file.size === 0) {
    return {
      sanitizedFile: null,
      error: 'The selected file is empty.',
    };
  }

  return {
    sanitizedFile: file,
    error: null,
  };
}
