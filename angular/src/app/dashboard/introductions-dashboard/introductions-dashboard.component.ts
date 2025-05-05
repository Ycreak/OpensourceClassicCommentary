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

  protected author_intro_form = new FormGroup({
    _id: new FormControl(''),
    sandbox: new FormControl(this.sandbox.current_sandbox, { nonNullable: true }),
    document_type: new FormControl('introduction', { nonNullable: true }),
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl(''),
    editor: new FormControl(''),
    text: new FormControl(''),
  });
  protected title_intro_form = new FormGroup({
    _id: new FormControl(''),
    sandbox: new FormControl(this.sandbox.current_sandbox, { nonNullable: true }),
    document_type: new FormControl('introduction', { nonNullable: true }),
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    editor: new FormControl(''),
    text: new FormControl(''),
  });
  protected editor_intro_form = new FormGroup({
    _id: new FormControl(''),
    sandbox: new FormControl(this.sandbox.current_sandbox, { nonNullable: true }),
    document_type: new FormControl('introduction', { nonNullable: true }),
    author: new FormControl(''),
    title: new FormControl(''),
    editor: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    text: new FormControl(''),
  });

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService,
    protected helper: HelperService
  ) {}

  /**
   * Request the API for documents
   * @param form (FormGroup) at which to add to the provided introduction text data
   * @param filter (any) Object containing information with which to search for matching introduction texts.
   * @author Ycreak sajvanwijk
   */
  protected request(form: FormGroup, filter: any): void {
    form.reset();
    this.api.request_documents(filter).subscribe((introductions) => {
      // If we want to retrieve an introduction to an author, we send no title filter to
      // the api. We therefore receive all introductions associated with this author, as the api
      // thinks we are only filtering on authors. Therefore, from all the given introductions,
      // filter the correct introduction, in this case where title == '';
      if (filter.title == '') {
        const author_introductions = introductions.filter((introduction: Introduction) => introduction.title === '');
        if (author_introductions.length > 0) {
          this.model_to_form(form, author_introductions[0]);
        } else {
          this.utility.open_snackbar('No introduction found for this author.');
        }
      } else {
        this.model_to_form(form, introductions[0]);
      }
      this.selected = true;
    });
  }

  /**
   * This function takes the Typescript object retrieved from the server and uses
   * its data fields to fill in the form.
   * @param form (FormGroup) Form field in which to add the retrieved introduction data
   * @param introduction (Introduction) object that is to be parsed into the form
   * @author Ycreak sajvanwijk
   */
  private model_to_form(form: FormGroup, introduction: Introduction): void {
    // This functions updates the form with the provided introduction
    for (const item of ['_id', 'document_type', 'author', 'sandbox', 'title', 'editor', 'text']) {
      form.patchValue({ [item]: introduction[item] });
    }
  }

  /**
   * Given the form which represents a Introduction, this function requests the api to create a
   * new introduction.
   * @param form (FormGroup) form containing the data of the to-be-created introduction
   * @author Ycreak sajvanwijk
   */
  protected create(form: FormGroup): void {
    let item_string = '';
    if (form.get('author')?.value && !form.get('title')?.value) {
      item_string = `Introduction on author '${form.controls.author.value}'`;
    } else if (form.get('author')?.value && form.get('title')?.value) {
      item_string = `Introduction on title '${form.get('title')?.value}' from author '${form.get('author')?.value}'`;
    } else if (form.get('editor').value) {
      item_string = `Introduction on editor '${form.get('editor')?.value}'`;
    } else {
      throw Error('Unable to revise Introduction: Introduction details missing');
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.post_document(form.value, 'create').subscribe(() => {
            this.request(form, form.value);
            this.selected = true;
          });
        }
      });
  }

  /**
   * This function requests the api to revise/update the introduction given in the form.
   * @param form (FormGroup) form containing the data of the to-be-created introduction
   * @author Ycreak sajvanwijk
   */
  protected revise(form: FormGroup): void {
    let item_string = '';
    if (form.get('author')?.value && !form.get('title')?.value) {
      item_string = `Introduction on author '${form.controls.author.value}'`;
    } else if (form.get('author')?.value && form.get('title')?.value) {
      item_string = `Introduction on title '${form.get('title')?.value}' from author '${form.get('author')?.value}'`;
    } else if (form.get('editor').value) {
      item_string = `Introduction on editor '${form.get('editor')?.value}'`;
    } else {
      throw Error('Unable to revise Introduction: Introduction details missing');
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.post_document(form.value, 'update').subscribe(() => {
            this.request(form, form.value);
            this.selected = true;
          });
        }
      });
  }

  /**
   * Given the form which represents a introduction, this function requests the api to delete the
   * selected introduction.
   * @param form (FormGroup) form containing the data of the to-be-created introduction
   * @author Ycreak sajvanwijk
   */
  protected delete(form: FormGroup): void {
    let item_string = '';
    if (form.get('author')?.value && !form.get('title')?.value) {
      item_string = `Introduction on author '${form.controls.author.value}'`;
    } else if (form.get('author')?.value && form.get('title')?.value) {
      item_string = `Introduction on title '${form.get('title')?.value}' from author '${form.get('author')?.value}'`;
    } else if (form.get('editor').value) {
      item_string = `Introduction on editor '${form.get('editor')?.value}'`;
    } else {
      throw Error('Unable to revise Introduction: Introduction details missing');
    }
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this introduction?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.post_document(form, 'delete').subscribe(() => {
            form.reset();
            this.selected = false;
          });
        }
      });
  }

  /**
   * Defines which users can view this component
   * @return boolean
   */
  protected user_has_view_permission(): boolean {
    return this.allowed_user_roles.includes(this.auth_service.current_user_role);
  }
}
