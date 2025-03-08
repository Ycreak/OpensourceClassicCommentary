/**
 * This component handles the dashboard for creating, editing and deleting testimonia.
 * @author Ycreak
 */

import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

// Service imports
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { HelperService } from '@oscc/dashboard/helper.service';
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { SandboxService } from '@oscc/services/sandbox.service';

// Model imports
import { Introduction } from '@oscc/models/Introduction';

@Component({
  selector: 'app-introductions-dashboard',
  templateUrl: './introductions-dashboard.component.html',
  styleUrls: ['./introductions-dashboard.component.scss'],
})
export class IntroductionsDashboardComponent {
  private allowed_user_roles = ['admin'];

  // Whether a introduction has been selected
  protected selected = false;

  protected form = new FormGroup({
    _id: new FormControl(''),
    sandbox: new FormControl(this.sandbox.current_sandbox),
    document_type: new FormControl('introduction'),
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl('', [Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    text: new FormControl(''),
  });

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService,
    protected helper: HelperService,
    private sandbox: SandboxService
  ) {}

  /**
   * Request the API for documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request(filter: any): void {
    this.form.reset();
    this.api.request_documents(filter).subscribe((introductions) => {
      // If we want to retrieve an introduction to an author, we send no title filter to
      // the api. We therefore receive all introductions associated with this author, as the api
      // thinks we are only filtering on authors. Therefore, from all the given introductions,
      // filter the correct introduction, in this case where title == '';
      if (filter.title == '') {
        const author_introductions = introductions.filter((introduction: Introduction) => introduction.title === '');
        if (author_introductions.length > 0) {
          this.model_to_form(author_introductions[0]);
        } else {
          this.utility.open_snackbar('No introduction found for this author.');
        }
      } else {
        this.model_to_form(introductions[0]);
      }
      this.selected = true;
    });
  }

  /**
   * This function takes the Typescript object retrieved from the server and uses
   * its data fields to fill in the form.
   * @param introduction (Introduction) object that is to be parsed into the form
   * @author Ycreak
   */
  private model_to_form(introduction: Introduction): void {
    // This functions updates the form with the provided introduction
    for (const item of ['_id', 'document_type', 'author', 'sandbox', 'title', 'text']) {
      this.form.patchValue({ [item]: introduction[item] });
    }
  }

  /**
   * Given the form which represents a Introduction, this function requests the api to create a
   * new introduction.
   * @param object which represents a introduction, edited by the user in the dashboard
   * @author Ycreak
   */
  protected create(form: any): void {
    let item_string = '';
    if (form.title) {
      item_string = `Introduction on title '${form.title}' from author '${form.author}'`;
    } else {
      item_string = `Introduction on author '${form.author}'`;
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.post_document(form, 'create').subscribe(() => {
            this.request(form);
            this.selected = true;
          });
        }
      });
  }

  /**
   * This function requests the api to revise the introduction given the form.
   * @param form which represents an introduction, edited by the user in the dashboard
   */
  protected revise(form: any): void {
    let item_string = '';
    if (form.title) {
      item_string = `Introduction on title '${form.title}' from author '${form.author}'`;
    } else {
      item_string = `Introduction on author '${form.author}'`;
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.post_document(form, 'update').subscribe(() => {
            this.reset_form();
            this.request(form);
            this.selected = true;
          });
        }
      });
  }

  /**
   * Given the form which represents a introduction, this function requests the api to delete the
   * selected introduction.
   * @param form which represents a introduction, edited by the user in the dashboard
   * @author Ycreak
   */
  protected delete(form: any): void {
    let item_string = '';
    if (form.title) {
      item_string = `Introduction on title '${form.title}' from author '${form.author}'`;
    } else {
      item_string = `Introduction on author '${form.author}'`;
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.post_document(form, 'delete').subscribe(() => {
            this.reset_form();
            this.selected = false;
          });
        }
      });
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  protected reset_form(): void {
    this.form.reset();
  }

  /**
   * Defines which users can view this component
   * @return boolean
   */
  protected user_has_view_permission(): boolean {
    return this.allowed_user_roles.includes(this.auth_service.current_user_role);
  }
}
