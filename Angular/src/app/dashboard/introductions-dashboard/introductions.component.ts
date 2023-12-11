import { Component, OnInit } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { Introduction } from '@oscc/models/Introduction';
import { DialogService } from '@oscc/services/dialog.service';

@Component({
  selector: 'app-introductions-dashboard',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
})
export class IntroductionsComponent implements OnInit {
  /**
   * This form is used to change the introduction texts for authors and authors+titles
   */
  protected form = new FormGroup({
    author: new FormControl(''),
    title: new FormControl(''),
    text: new FormControl(''),
  });

  protected introduction: Introduction;

  // This is used for prompting the 'must select author first' hint.
  show_select_author_first_hint = false;
  // This is used for alerting the user that the introduction texts have been saved.
  show_changes_saved_hint = false;

  constructor(protected auth_service: AuthService, protected api: ApiService, protected dialog: DialogService) {}

  ngOnInit(): void {
    this.introduction = new Introduction({});
  }

  /**
   * Requests an introduction from the server given the key
   * @param introduction (Introduction) serves as key for the api to filter on
   * @author Ycreak
   */
  protected request_introduction(introduction: Introduction): void {
    this.api.get_introduction(introduction).subscribe((introduction) => {
      this.form.patchValue({ text: introduction.content });
    });
  }

  /**
   * Function to reset the fragment form
   * @author CptVickers
   */
  protected reset_form(field?: string): void {
    if (field == 'text') {
      this.form.patchValue({ text: '' });
    } else {
      // Remove all data from the form
      this.form.reset();
    }
    // Reset the saved changes hint
    this.show_changes_saved_hint = false;
  }

  /**
   * This function requests a wysiwyg dialog to handle data updating to the fragment_form.
   * It functions by providing the field of fragment_form which is to be updated by the editor.
   * The dialog is called provided the config of the editor and the string to be edited. An edited string
   * is returned by the dialog service
   * @param field from fragment_form which is to be send and updated
   * @author Ycreak
   */
  protected request_wysiwyg_dialog(field: string): void {
    if (field == 'text') {
      const text = this.form.value[field];
      this.dialog.open_wysiwyg_dialog(text).subscribe((result) => {
        if (result) {
          // Pass the accepted changes to the regular form field.
          this.form.patchValue({ [field]: result });
        }
      });
    } else {
      throw Error('Error: cannot open wysiwyg dialog for this field');
    }
  }
}
