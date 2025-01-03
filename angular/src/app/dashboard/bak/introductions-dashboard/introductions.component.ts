import { Component, OnInit } from '@angular/core';

// Service imports
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { Introduction } from '@oscc/models/Introduction';
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-introductions-dashboard',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
})
export class IntroductionsComponent implements OnInit {
  protected introduction: Introduction;

  // This is used for alerting the user that the introduction texts have been saved.
  show_changes_saved_hint = false;

  constructor(
    protected auth_service: AuthService,
    protected api: ApiService,
    protected dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.introduction = new Introduction({});
  }

  protected save_introduction(introduction: Introduction): void {
    this.api.post_document(introduction, 'update').subscribe({});
  }

  /**
   * Requests an introduction from the server given the key
   * @param introduction (Introduction) serves as key for the api to filter on
   * @author Ycreak
   */
  protected request_introduction(introduction: Introduction): void {
    this.api.request_documents(introduction).subscribe({});
  }
  
  /**
   * Given the form which represents an introduction, this function requests the api to create a
   * new introduction.
   * @param object which represents an introduction, edited by the user in the dashboard
   */
  protected create(form: any): void {
    if(this.introduction.title) {
      // We create a title introduction
    } else {
      // We create an author introduction
    }

    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this testimonium?', item_string)
      .subscribe((result) => {
        if (result) {
          this.reset_form();
          this.api.post_document(form, 'create').subscribe(() => {
            this.request({
              document_type: 'testimonium',
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
          this.api.post_document(form, 'update').subscribe(() => {
            this.reset_form();
            this.request({
              document_type: 'testimonium',
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
          this.api.post_document(form, 'delete').subscribe(() => {
            this.reset_form();
            this.selected = false;
          });
        }
      });
  }
}

