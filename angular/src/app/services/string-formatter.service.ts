import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StringFormatterService {
  //constructor() {}

  /**
   * Converts the custom tags in the given blob of text to html
   * @param string with text blob possibly containing custom tags
   * @returns string with the custom tags replaced with corresponding html
   * @author Ycreak
   */
  public convert_custom_tag_to_html(given_string: string): string {
    if (given_string != '' && given_string != null) {
      // Convert the summary tags
      given_string = given_string.replace(/\[summary\]([\s\S]*?)\[\/summary\]/gm, '<div class="summary">$1</div>');
    }
    return given_string;
  }

  /**
   * Takes a string and looks for whitespace decoding. Converts it to html spans
   * @param string that needs whitespaces converted to html spans
   * @returns string with whitespaces converted to html spans
   * @author Ycreak
   */
  public convert_whitespace_encoding(string: string): string {
    // Find fish hooks with number in between.
    const matches = string.match(/<(\d+)>/);
    // If found, replace it with the correct whitespace number
    if (matches) {
      // Create a span with the number of indents we want. Character level.
      // matches[0] contains including fish hooks, matches[1] only number
      const replacement = '<span style="padding-left:' + matches[1] + 'ch;"></span>';
      string = string.replace(matches[0], replacement);
    }
    return string;
  }
}
