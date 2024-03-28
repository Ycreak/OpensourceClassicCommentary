import { Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FormatterService {
  constructor() {}

  public format(doc: any): any {
    if (doc.document_type == environment.fragment) {
      doc = this.convert_whitespace_encoding(doc);
    }
    return doc;
  }

  /**
   * Converts the whitespace encoding to FabricJS compatible whitespaces
   * @param doc (document)
   * @return object
   * @author Ycreak
   */
  private convert_whitespace_encoding(doc: any): any {
    doc.lines.forEach((line: any) => {
      const matches = line.text.match(/<(\d+)>/);
      // If found, replace it with the correct whitespace number
      if (matches) {
        // Add n spaces. n can be found in matches[1]
        const replacement = ''.padStart(matches[1], '  ');
        line.text = line.text.replace(matches[0], replacement);
      }
    });
    return doc;
  }
}
