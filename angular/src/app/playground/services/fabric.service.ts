import { Injectable } from '@angular/core';
import { fabric } from 'fabric';

import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root'
})
export class FabricService {

  constructor(
    private utility: UtilityService
  ) { }

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
    const lines = new fabric.IText(lines_text, {
      fontSize: font_size,
      originX: 'left',
    });
    return lines;
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
