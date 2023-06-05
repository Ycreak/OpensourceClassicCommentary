import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@oscc/auth/auth.service';
import { Introduction_form } from '@oscc/models/Introduction_form';

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

  constructor(protected auth_service: AuthService) {}

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
}
