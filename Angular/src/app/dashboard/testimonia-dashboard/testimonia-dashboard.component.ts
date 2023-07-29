import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';

// Component imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';

// Model imports
import { Testimonium } from '@oscc/models/Testimonium';

@Component({
  selector: 'app-testimonia-dashboard',
  templateUrl: './testimonia-dashboard.component.html',
  styleUrls: ['./testimonia-dashboard.component.scss'],
})
export class TestimoniaDashboardComponent implements OnInit {
  protected selected_author = '';
  protected selected_name = '';

  protected author_list = [];
  protected name_list = [];

  protected selected_testimonium: Testimonium;

  form = new FormGroup({
    _id: new FormControl(''),
    document_type: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.pattern('[0-9-_ ]*')]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    witness: new FormControl(''),
    title: new FormControl(''),
    text: new FormControl(''),

    translation: new FormControl(''),
    differences: new FormControl(''),
    commentary: new FormControl(''),
    apparatus: new FormControl(''),
    metrical_analysis: new FormControl(''),
    reconstruction: new FormControl(''),
    published: new FormControl(''),
    lock: new FormControl(''),
  });

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService
  ) {}

  ngOnInit(): void {
    this.api.get_authors({ document_type: 'testimonium' }).subscribe((authors) => {
      this.author_list = authors;
    });
  }

  protected request_testimonia_names(author: string): void {
    this.api.get_names({ document_type: 'testimonium', author: author }).subscribe((names) => {
      this.name_list = names;
    });
  }

  protected request_testimonium(author: string, name: string): void {
    this.api.get_documents({ document_type: 'testimonium', author: author, name: name }).subscribe((documents) => {
      this.selected_testimonium = documents[0];
    });
  }

  /**
   * This function requests the api to revise the fragment given the fragment_form.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_revise_testimonium(form: any): void {
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.
    if (form.value.lock == 'locked' && this.auth_service.current_user_role != 'teacher') {
      this.utility.open_snackbar('This fragment is locked.');
    } else {
      const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
      this.dialog
        .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this fragment?', item_string)
        .subscribe((result) => {
          if (result) {
            this.api.request_revise_fragment(form);
            this.reset_form();
          }
        });
    }
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to create a
   * new fragment.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_create_testimonium(form: any): void {
    const item_string = form.value.author + ', ' + form.value.title + ', ' + form.value.editor + ': ' + form.value.name;

    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this fragment?', item_string)
      .subscribe((result) => {
        if (result) {
          const fragment = this.convert_form_to_Fragment(fragment_form);
          this.api.request_create_fragment(fragment, environment.dashboard_id);
          this.fragment_selected = true;
          this.reset_form();
          // It might be possible we have created a new author, title or editor. Retrieve the lists again
          // TODO: retrieve author-title-editor blob
        }
      });
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to delete the
   * selected fragment. This is done via its id.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_delete_testimonium(fragment_form: FormGroup): void {
    const item_string =
      fragment_form.value.author +
      ', ' +
      fragment_form.value.title +
      ', ' +
      fragment_form.value.editor +
      ': ' +
      fragment_form.value.name;

    //this.dialog
    //.open_confirmation_dialog('Are you sure you want to DELETE this fragment?', item_string)
    //.subscribe((result) => {
    //if (result) {
    //const fragment = this.convert_fragment_form_to_Fragment(fragment_form);
    //this.reset_fragment_form();
    //this.api.request_delete_fragment(
    //fragment.author,
    //fragment.title,
    //fragment.editor,
    //fragment.name,
    //environment.dashboard_id
    //);
    //this.fragment_selected = false;
    //}
    //});
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  protected reset_form(): void {
    // First, remove all data from the form
    this.form.reset();
  }
}
