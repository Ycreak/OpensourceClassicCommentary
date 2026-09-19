import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Pipe to allow whitespaces in HTML which is labeled as safe.
// Sanitizes the HTML (removes scripts, event handlers and javascript:
// URLs) before Angular renders it via [innerHTML].

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}

  transform(value: any) {
    return this.sanitized.sanitize(SecurityContext.HTML, value);
  }
}
