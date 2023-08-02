import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

// Component imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { HelperService } from '@oscc/dashboard/helper.service';

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

  // Used in the drop down menus
  protected author_list = [];
  protected name_list = [];

  protected selected_testimonium: Testimonium;

  form = new FormGroup({
    _id: new FormControl(''),
    document_type: new FormControl('testimonium'),
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
    protected auth_service: AuthService,
    protected helper: HelperService
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
   * This function requests the api to revise the testimonium given the form.
   * @param form which represents a testimonium, edited by the user in the dashboard
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
   * Given the form which represents a Testimonium, this function requests the api to create a
   * new testimonium.
   * @param object which represents a testimonium, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_create_testimonium(form: any): void {
    const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this testimonium?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.request_create_fragment(form);
          this.reset_form();
        }
      });
  }

  /**
   * Given the form which represents a testimonium, this function requests the api to delete the
   * selected testimonium. This is done via its id.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_delete_testimonium(form: any): void {
    const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this testimonium?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.request_delete_fragment({
            document_type: 'testimonium',
            author: form.author,
            name: form.name,
          });
        }
      });
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
