import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { Introduction_form } from '@oscc/models/Introduction_form';
import { Introductions } from '@oscc/dashboard/introductions/Introduction_example';
import { DialogService } from '@oscc/services/dialog.service';

@Component({
  selector: 'app-introductions',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
})
export class IntroductionsComponent implements OnInit {
  /**
   * This form is used to change the introduction texts for authors and authors+titles
   */
  introduction_form_group = new FormGroup({
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    author_text: new FormControl(''),
    title_text: new FormControl(''),
  });

  selected_introduction_data: Introduction_form;

  // This is used for prompting the 'must select author first' hint.
  show_select_author_first_hint = false;
  // This is used for alerting the user that the introduction texts have been saved.
  show_changes_saved_hint = false;

  constructor(protected auth_service: AuthService, protected api: ApiService, protected dialog: DialogService) {}

  ngOnInit(): void {
    this.selected_introduction_data = new Introduction_form({});
  }

  /**
   * Function to reset the fragment form
   * @author CptVickers
   */
  protected reset_introduction_form(): void {
    // First, remove all data from the form
    this.introduction_form_group.reset();
    // Reset the saved changes hint
    this.show_changes_saved_hint = false;
  }

  /**
   * Function to request the introduction text for a given author or author + title and show it in a dialog.
   * @param _intro Introduction object with form data; contains selected author and title data.
   * @author CptVickers
   */
  public show_introduction_dialog(/*intro: Introduction_form*/): void {
    // TODO: This function just shows some demo text for now; It does not fetch the correct texts from the server.
    const introdemo = new Introductions();
    this.dialog.open_custom_dialog(introdemo.dict['Ennius']);
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
    if (field == 'author_text' || field == 'title_text') {
      const text = this.introduction_form_group.value[field];
      this.dialog.open_wysiwyg_dialog(text).subscribe((result) => {
        if (result) {
          // Pass the accepted changes to the regular form field.
          this.introduction_form_group.patchValue({ [field]: result });
        }
      });
    } else {
      throw Error('Error: cannot open wysiwyg dialog for this field');
    }
  }
}
