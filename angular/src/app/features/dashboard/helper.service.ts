import { Injectable } from '@angular/core';
import { DialogService } from '@oscc/services/dialog.service';
import { FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(protected dialog: DialogService) {}

  /**
   * This function requests a wysiwyg dialog to handle data updating to the fragment_form.
   * It functions by providing the field of fragment_form which is to be updated by the editor.
   * The dialog is called provided the config of the editor and the string to be edited. An edited string
   * is returned by the dialog service
   * @param FormGroup that is to be edited
   * @param field representing the field of form which is to be send and updated
   * @param type either formArray or formControl
   * @param index (optional) when providing an formArray, to know which entry we are editing
   * @author Ycreak
   */
  public request_wysiwyg_dialog(form: FormGroup, field: string, type: string, index = 0): FormGroup {
    if (type == 'formArray') {
      //For the context, retrieve the context text field from the fragment form and pass that to the dialog
      //const form_array_field = this.fragment_form.value.context[index].text;
      this.dialog.open_wysiwyg_dialog('hello there').subscribe((result) => {
        if (result) {
          // Result will only be provided when the user has acceped the changes
          // Now update the correct field. This is done by getting the FormArray and patching the correct
          // FormGroup within this array. This is to ensure dynamic updating on the frontend
          const context_array = form.controls[field] as FormArray;
          context_array.controls[index].patchValue({ ['text']: result });
        }
      });
    } else {
      // For formControls we can update by just getting their content strings
      this.dialog.open_wysiwyg_dialog(form.value[field]).subscribe((result) => {
        if (result) {
          form.patchValue({ [field]: result });
        }
      });
    }
    return form;
  }
}
