import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '@oscc/api.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Introductions } from '@oscc/models/Introduction_example';
import { Introduction_form } from '@oscc/models/Introduction_form';
import { DialogService } from '@oscc/services/dialog.service';

// Service imports
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent implements OnInit, OnChanges {
  @Input() current_fragment: Fragment;

  protected fragment_clicked = false;

  constructor(protected utility: UtilityService, protected api: ApiService, protected dialog: DialogService) {}

  ngOnInit(): void {
    this.current_fragment = new Fragment({});
  }

  ngOnChanges(changes: SimpleChanges) {
    // If the input fragment changes, we will note that a fragment has been clicked
    if (changes.current_fragment.currentValue.author != '') {
      this.fragment_clicked = true;
    }
  }

  /**
   * Function to request the introduction text for a given author or author + title.
   * @param intro Introduction object with form data; contains selected author and title data.
   * @author CptVickers
   * @TODO: Duplicate of the one in dashboard; move this somewhere else
   */
  public request_introduction(intro: Introduction_form): void {
    // TODO: This is some code for demo purposes
    const introdemo = new Introductions();
    this.dialog.open_custom_dialog(introdemo.dict['Ennius']);

    this.api.get_introduction_text(intro).subscribe((data) => {
      if (data) {
        console.log(data);
        // Store the received introduction data in the form
        intro.author_introduction_text = data['author_introduction_text'];
        intro.title_introduction_text = data['title_introduction_text'];
      }
    });
  }
}
