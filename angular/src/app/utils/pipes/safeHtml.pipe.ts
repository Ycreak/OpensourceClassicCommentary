import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Pipe to allow whitespaces in HTML which is labeled as safe.

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}

  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
