/**
 * This component handles the dashboard for creating, editing and deleting testimonia.
 * @author Ycreak
 */

import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';

// Service imports
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { HelperService } from '@oscc/dashboard/helper.service';
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Testimonium } from '@oscc/models/Testimonium';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { TestimoniumFilterComponent } from '../../filters/testimonium-filter/testimonium-filter.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-testimonia-dashboard',
  templateUrl: './testimonia-dashboard.component.html',
  styleUrls: ['./testimonia-dashboard.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatExpansionModule,
    MatIconModule,
    TestimoniumFilterComponent,
    MatButtonModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class TestimoniaDashboardComponent {
  private allowed_user_roles = ['admin'];

  // Whether a testimonium has been selected
  protected selected = false;

  protected form = new FormGroup({
    _id: new FormControl(''),
    document_type: new FormControl('testimonium'),
    name: new FormControl('', [Validators.required, Validators.pattern('[0-9-_ ]*')]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    witness: new FormControl(''),
    title: new FormControl(''),
    editor: new FormControl(''),
    text: new FormControl(''),
    translation: new FormControl(''),
    visible: new FormControl(0),
    lock: new FormControl(0),
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
   * @param documents (object[]) which to add to the provided column
   */
  protected request(filter: object): void {
    this.api.request_documents(filter).subscribe((testimonia) => {
      this.form.reset();
      this.selected = true;
      this.model_to_form(testimonia[0]);
    });
  }

  /**
   * This function takes the Typescript object retrieved from the server and uses
   * its data fields to fill in the form.
   * @param testimonium (Testimonium) object that is to be parsed into the form
   * @author Ycreak
   */
  private model_to_form(testimonium: Testimonium): void {
    // This functions updates the form with the provided testimonium
    for (const item of [
      '_id',
      'document_type',
      'name',
      'author',
      'title',
      'witness',
      'editor',
      'text',
      'visible',
      'lock',
    ]) {
      this.form.patchValue({ [item]: testimonium[item] });
    }
    // Update the form with the commentary
    for (const item of ['translation']) {
      this.form.patchValue({ [item]: testimonium.commentary.fields[item] });
    }
  }

  /**
   * Given the form which represents a Testimonium, this function requests the api to create a
   * new testimonium.
   * @param object which represents a testimonium, edited by the user in the dashboard
   * @author Ycreak
   */
  protected create(form: any): void {
    const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this testimonium?', item_string)
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
   * This function requests the api to revise the fragment given the fragment_form.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected revise(form: any): void {
    if (form.lock != 0) {
      this.utility.open_snackbar('This testimonium is locked.');
    } else {
      const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
      this.dialog
        .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this testimonium?', item_string)
        .subscribe((result) => {
          if (result) {
            this.api.post_document(form, 'update').subscribe(() => {
              this.reset_form();
              this.request({
                document_type: form.document_type,
                editor: form.editor,
                author: form.author,
                name: form.name,
              });
              this.selected = true;
            });
          }
        });
    }
  }

  /**
   * Given the form which represents a testimonium, this function requests the api to delete the
   * selected testimonium.
   * @param form which represents a testimonium, edited by the user in the dashboard
   * @author Ycreak
   */
  protected delete(form: any): void {
    if (form.lock != 0) {
      this.utility.open_snackbar('This testimonium is locked.');
    } else {
      const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
      this.dialog
        .open_confirmation_dialog('Are you sure you want to DELETE this testimonium?', item_string)
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
