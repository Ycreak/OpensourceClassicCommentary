import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root',
})
export class FabricService {
  constructor(private utility: UtilityService) {}

  /**
   * Creates a document header
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   * @author Ycreak
   */
  public create_header(doc: any, font_size: number): fabric.Text {
    const header_text = `${this.utility.capitalize_word(doc.document_type)} ${doc.name}`;
    const header = new fabric.Text(header_text, {
      fontSize: font_size,
      fontWeight: 'bold',
      originX: 'left',
      originY: 'bottom',
    });
    return header;
  }

  /**
   * Creates the text for a fabric object
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   * @author Ycreak
   */
  public create_text(doc: any, font_size: number): fabric.Text {
    return new fabric.Textbox(doc.text, {
      originX: 'left',
      width: 300,
      fontSize: font_size,
    });
  }

  /**
   * Creates the lines for a fabric object
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   * @author Ycreak
   */
  public create_lines(doc: any, font_size: number): fabric.Text {
    let lines_text = '';
    doc.lines.forEach((line: any) => {
      lines_text += `${line.line_number}: ${line.text}\n`;
    });
    // Remove the last superfluous carriage return (I have no idea why -1 instead of -2)
    lines_text = lines_text.slice(0, -1);

    // Get the positions of the cursive text
    const positions = this.get_style_positions(lines_text, '$');
    // Remove the delimiters from the text
    lines_text = lines_text.split('$').join('');

    const lines = new fabric.IText(lines_text, {
      fontSize: font_size,
      originX: 'left',
    });

    // We removed the delimiters, so after every tuple, we need to subtract two additional positions from
    // the positions inside the tuples to compensate for the removed delimiters.
    let tuple_counter = 0;
    positions.forEach((tuple: any) => {
      lines.setSelectionStyles({ fontStyle: 'italic' }, tuple[0] - tuple_counter, tuple[1] - tuple_counter);
      tuple_counter += 2;
    });
    return lines;
  }

  /**
   * Returns the positions where style delimiters are in the given string.
   * For example, for the string "h$e$llo $there$", [[1,3],[8,14]] is returned
   * @param text (string)
   * @param delmiter (string)
   * @return list of tuples
   * @author Ycreak
   */
  private get_style_positions(lines_text: string, delimiter: string) {
    const positions: number[] = [];
    let index = lines_text.indexOf(delimiter);

    while (index !== -1) {
      positions.push(index);
      index = lines_text.indexOf(delimiter, index + 1);
    }

    const tuples = positions.reduce((acc: [number][], value: number, index: number) => {
      if (index % 2 === 0) {
        // Start a new tuple with the current number
        acc.push([value]);
      } else {
        // Add the current number to the last tuple in acc
        const lastTuple = acc[acc.length - 1];
        lastTuple.push(value);
      }
      return acc;
    }, []);

    return tuples;
  }

  public create_box(text_bounding_rect: any, fill: string): fabric.Rect {
    return new fabric.Rect({
      top: text_bounding_rect.top,
      left: text_bounding_rect.left,
      width: text_bounding_rect.width,
      height: text_bounding_rect.height,
      fill: fill,
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
    });
  }
}
