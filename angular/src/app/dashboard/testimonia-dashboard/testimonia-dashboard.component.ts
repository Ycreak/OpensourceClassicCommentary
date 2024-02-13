/**
 * This component handles the dashboard for creating, editing and deleting testimonia.
 * @author Ycreak
 */

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

// Component imports
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { HelperService } from '@oscc/dashboard/helper.service';
import { TestimoniaApiService } from '@oscc/services/api/testimonia.service';
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Testimonium } from '@oscc/models/Testimonium';

@Component({
  selector: 'app-testimonia-dashboard',
  templateUrl: './testimonia-dashboard.component.html',
  styleUrls: ['./testimonia-dashboard.component.scss'],
})
export class TestimoniaDashboardComponent implements OnInit {
  // Whether a testimonium has been selected
  protected selected = false;

  protected form = new FormGroup({
    _id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.pattern('[0-9-_ ]*')]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    witness: new FormControl(''),
    title: new FormControl(''),
    text: new FormControl(''),
    translation: new FormControl(''),
  });

  constructor(
    protected api: TestimoniaApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService,
    protected helper: HelperService
  ) {}

  ngOnInit(): void {
    this.api.request_index().subscribe();
  }

  /**
   * Request the API for documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request(filter: object): void {
    this.api.request(filter).subscribe((testimonia) => {
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
    for (const item of ['_id', 'name', 'author', 'title', 'witness', 'text']) {
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
          this.api.do(form, 'testimonium/create').subscribe(() => {
            this.request({
              author: form.author,
              name: form.name,
            });
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
    const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this testimonium?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.do(form, 'testimonium/update').subscribe(() => {
            this.request({
              author: form.author,
              name: form.name,
            });
            this.selected = true;
          });
        }
      });
  }

  /**
   * Given the form which represents a testimonium, this function requests the api to delete the
   * selected testimonium.
   * @param form which represents a testimonium, edited by the user in the dashboard
   * @author Ycreak
   */
  protected delete(form: any): void {
    const item_string = form.author + ', ' + form.witness + ', ' + form.title + ': ' + form.name;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this testimonium?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.do(form, 'testimonium/delete').subscribe(() => {
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
}
