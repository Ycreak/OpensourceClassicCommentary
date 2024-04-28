import { Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';

import { Fragment } from '@oscc/models/Fragment';

@Injectable({
  providedIn: 'root',
})
export class FormatterService {
  constructor() {}

  public format(doc: any): any {
    if (doc.document_type == environment.fragment) {
      doc = this.convert_whitespace_encoding(doc);
      doc = this.convert_italics_encoding(doc);
    }
    return doc;
  }

  /**
   * Converts the italics encoding to simple $-signs. These are later removed
   * by FabricJS, their locations turned into delimiters for cursive text
   * @param doc (Fragment)
   * @return Fragment
   * @author Ycreak
   */
  private convert_italics_encoding(doc: Fragment): Fragment {
    doc.lines.forEach((line: any) => {
      line.text = line.text.replaceAll('<i>', '$');
      line.text = line.text.replaceAll('</i>', '$');
    });
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
