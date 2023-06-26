import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-document-filter',
  templateUrl: './document-filter.component.html',
  styleUrls: ['./document-filter.component.scss'],
})
export class DocumentFilterComponent {
  form: any = new FormGroup({
    author: new FormControl(''),
    title: new FormControl(''),
    editor: new FormControl(''),
    status: new FormControl(''),
  });

  constructor(public dialogRef: MatDialogRef<DocumentFilterComponent>) {}

  public test() {
    console.log(this.form.value);
  }

  protected close_dialog() {
    const return_form = this.remove_empty_form_fields(this.form.value);
    this.dialogRef.close(return_form);
  }

  /**
   * Removes all form values that are empty from the given object
   * @param object that needs to be pruned
   * @returns object that is pruned
   * @author Ycreak
   */
  public remove_empty_form_fields(form_values: object): object {
    const form = structuredClone(form_values);
    for (const field in form) {
      if (form[field] == '') {
        delete form[field];
      }
    }
    return form;
  }
}
